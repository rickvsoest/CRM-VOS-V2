// frontend/src/pages/Customers.tsx
import { useEffect, useMemo, useState } from "react";
import { cn } from "../components/ui/utils";
import * as React from "react";
import {
  Search,
  Plus,
  Download,
  Mail,
  TrendingUp,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { SendAccountInviteModal } from "../components/modals/SendAccountInviteModal";
import { getApiBase, getCustomers } from "../lib/api";
import type { Customer as ApiCustomer } from "../lib/api";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";

/** ------- Types & UI model ------- */
export interface CustomersProps {
  onNavigate?: (page: string, id?: string) => void;
  onOpenNewCustomer?: () => void;
  onAddToPipeline?: (customer: UICustomer) => void;
  onEditCustomer?: (customer: UICustomer) => void;
  onDeleteCustomer?: (customer: UICustomer) => void;
}
type Order = "asc" | "desc";
type ActiveTab = "all" | "organizations" | "persons";
type UICustomerType = "Organisatie" | "Persoon";
type UICustomerStatus =
  | "Actief"
  | "Nieuw"
  | "Contact gelegd"
  | "Offerte gestuurd"
  | "Onderhandeling"
  | "Afgerond"
  | "Geblokkeerd";

export type UICustomer = ApiCustomer & {
  uiType: UICustomerType;
  uiStatus: UICustomerStatus;
  city?: string | null;
  companyName?: string | null;
  phone?: string | null;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  createdAt?: string | null; // ISO string
};

interface DataState {
  items: UICustomer[];
  total: number;
  page: number;
  pageSize: number;
}

/** ------- Helpers ------- */
function getFullName(c: UICustomer) {
  const first = c.firstName ?? (c as any).firstName ?? "";
  const last = c.lastName ?? (c as any).lastName ?? "";
  const combined = `${first} ${last}`.trim();
  return combined || c.email || "(Onbekende klant)";
}

function mapApiToUi(c: ApiCustomer): UICustomer {
  const isOrg =
    !!(
      (c as any).companyName ||
      (c as any).organizationName ||
      (c as any).kvkNumber ||
      (c as any).type === "ORGANIZATION" ||
      (c as any).kind === "ORG"
    );

  const raw = ((c as any).status ?? "").toString().toUpperCase();
  const statusMap: Record<string, UICustomerStatus> = {
    ACTIVE: "Actief",
    NEW: "Nieuw",
    CONTACTED: "Contact gelegd",
    QUOTED: "Offerte gestuurd",
    NEGOTIATING: "Onderhandeling",
    CLOSED: "Afgerond",
    BLOCKED: "Geblokkeerd",
    // NL keys fallback
    "CONTACT GELEGD": "Contact gelegd",
    "OFFERTE GESTUURD": "Offerte gestuurd",
    "IN BEWERKING": "Onderhandeling",
    AFGEROND: "Afgerond",
    ACTIEF: "Actief",
    NIEUW: "Nieuw",
    GEBLOKKEERD: "Geblokkeerd",
  };
  const uiStatus: UICustomerStatus = statusMap[raw] ?? "Actief";

  const city =
    (c as any).city ?? (c as any).place ?? (c as any).address?.city ?? null;
  const companyName =
    (c as any).companyName ??
    (c as any).organizationName ??
    (c as any).orgName ??
    null;
  const phone =
    (c as any).phone ?? (c as any).tel ?? (c as any).phoneNumber ?? null;
  const email = (c as any).email ?? (c as any).mail ?? null;
  const firstName = (c as any).firstName ?? (c as any).givenName ?? null;
  const lastName =
    (c as any).lastName ?? (c as any).surname ?? (c as any).familyName ?? null;
  const createdAt =
    (c as any).createdAt ??
    (c as any).created_at ??
    (c as any).created ??
    null;

  return {
    ...c,
    uiType: isOrg ? "Organisatie" : "Persoon",
    uiStatus,
    city,
    companyName,
    phone,
    email,
    firstName,
    lastName,
    createdAt,
  };
}

function fmtDate(d?: string | null) {
  if (!d) return "-";
  try {
    const dt = new Date(d);
    return new Intl.DateTimeFormat("nl-NL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(dt);
  } catch {
    return "-";
  }
}

function getTypeStyles(t: UICustomerType) {
  if (t === "Persoon") return { bg: "#E7F0FF", fg: "#2563EB" }; // blauw licht
  return { bg: "#E6FAF3", fg: "#10B981" }; // emerald licht
}
function getStatusStyles(s: UICustomerStatus) {
  switch (s) {
    case "Actief":
      return { bg: "#E6FAF3", fg: "#10B981" };
    case "Nieuw":
      return { bg: "#E7F0FF", fg: "#2563EB" };
    case "Contact gelegd":
      return { bg: "#EEF2FF", fg: "#4F46E5" };
    case "Offerte gestuurd":
      return { bg: "#F1F5FF", fg: "#1D4ED8" };
    case "Onderhandeling":
      return { bg: "#FFF7ED", fg: "#F59E0B" };
    case "Afgerond":
      return { bg: "#ECFDF5", fg: "#059669" };
    case "Geblokkeerd":
      return { bg: "#FEF2F2", fg: "#EF4444" };
    default:
      return { bg: "#E5E7EB", fg: "#111827" };
  }
}

/** ------- Component ------- */
export default function Customers({
  onNavigate,
  onOpenNewCustomer,
  onAddToPipeline,
  onEditCustomer,
  onDeleteCustomer,
}: CustomersProps) {
  // Filters
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState("createdAt");
  const [order, setOrder] = useState<Order>("desc");
  const [activeTab, setActiveTab] = useState<ActiveTab>("all");

  // Extra selects
  const [filterCity, setFilterCity] = useState("all");
  const [filterType, setFilterType] = useState<"all" | "person" | "org">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | UICustomerStatus>("all");

  // Data
  const [data, setData] = useState<DataState>({
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
  });
  const [loading, setLoading] = useState(false);

  // Invite
  const [inviteOpen, setInviteOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<UICustomer | null>(null);

  // Fetch
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = (await getCustomers({ q, page, pageSize, sort, order })) as any;
        const mapped: DataState = {
          items: (res.items ?? []).map((c: ApiCustomer) => mapApiToUi(c)),
          total: res.total ?? (res.items?.length ?? 0),
          page: res.page ?? page,
          pageSize: res.pageSize ?? pageSize,
        };
        if (!cancelled) setData(mapped);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [q, page, pageSize, sort, order]);

  // Cities (voor select)
  const cities = useMemo(() => {
    const set = new Set<string>();
    data.items.forEach((c) => c.city && set.add(c.city));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [data.items]);

  // Tabs counts
  const counts = useMemo(() => {
    const all = data.items.length;
    const org = data.items.filter((c) => c.uiType === "Organisatie").length;
    const per = data.items.filter((c) => c.uiType === "Persoon").length;
    return { all, org, per };
  }, [data.items]);

  // Client filters
  const filteredItems = useMemo(() => {
    let list = data.items;

    if (activeTab === "organizations") list = list.filter((c) => c.uiType === "Organisatie");
    if (activeTab === "persons") list = list.filter((c) => c.uiType === "Persoon");

    if (filterCity !== "all") list = list.filter((c) => (c.city || "").toLowerCase() === filterCity.toLowerCase());
    if (filterType === "person") list = list.filter((c) => c.uiType === "Persoon");
    if (filterType === "org") list = list.filter((c) => c.uiType === "Organisatie");
    if (filterStatus !== "all") list = list.filter((c) => c.uiStatus === filterStatus);

    return list;
  }, [data.items, activeTab, filterCity, filterType, filterStatus]);

  const totalPages = useMemo(() => {
    const total = filteredItems.length === data.items.length ? data.total : filteredItems.length;
    return Math.max(1, Math.ceil(total / data.pageSize));
  }, [filteredItems.length, data.total, data.pageSize]);

  // Actions
  function onExportCsv() {
    const base = getApiBase();
    const url = `${base}/customers/export?q=${encodeURIComponent(q)}&sort=${sort}&order=${order}&pageSize=${pageSize}`;
    window.open(url, "_blank");
  }

  async function handleSendInvite(payload: { email: string; role: string; customMessage?: string }) {
    try {
      const res = await fetch(`${getApiBase()}/invites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: payload.email,
          role: payload.role,
          customerId: selectedCustomer?.id,
          message: payload.customMessage,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { toast } = await import("sonner");
      toast.success("Uitnodiging verzonden!", { description: `Naar ${payload.email}` });
    } catch (e: any) {
      const { toast } = await import("sonner");
      toast.error("Verzenden mislukt", { description: e?.message || "Onbekende fout" });
    }
  }

  return (
    <TooltipProvider delayDuration={600}>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Klanten</h1>
          <Button onClick={onOpenNewCustomer} className="rounded-xl" style={{ backgroundColor: "var(--accent)", color: "#fff" }}>
            <Plus className="h-4 w-4 mr-2" />
            Nieuwe klant
          </Button>
        </div>

        {/* Tabs met aantallen */}
{/* Tabs */}
<Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ActiveTab)}>
  <TabsList
  className="flex w-full max-w-md items-center justify-between rounded-full bg-neutral-100 p-1"
>
  <TabsTrigger
    value="all"
    className={cn(
      "flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-full transition-all",
      // Niet-actief
      "text-neutral-600 hover:text-neutral-800",
      // Actief
      "data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm"
    )}
  >
    Alle <span className="text-neutral-400 text-xs">(8)</span>
  </TabsTrigger>

  <TabsTrigger
    value="organizations"
    className={cn(
      "flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-full transition-all",
      "text-neutral-600 hover:text-neutral-800",
      "data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm"
    )}
  >
    <span className="flex items-center gap-1">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 opacity-60"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 21v-6a9 9 0 0118 0v6"
        />
      </svg>
      Organisaties
    </span>
    <span className="text-neutral-400 text-xs">(4)</span>
  </TabsTrigger>

  <TabsTrigger
    value="persons"
    className={cn(
      "flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-full transition-all",
      "text-neutral-600 hover:text-neutral-800",
      "data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm"
    )}
  >
    <span className="flex items-center gap-1">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 opacity-60"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5.121 17.804A9 9 0 0112 15a9 9 0 016.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
      Particulieren
    </span>
    <span className="text-neutral-400 text-xs">(4)</span>
  </TabsTrigger>
</TabsList>


          <TabsContent value={activeTab} className="mt-4">
            {/* Filters + CSV */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="relative w-full md:flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
                  <Input
                    placeholder="Zoek op naam, e-mail of plaats"
                    value={q}
                    onChange={(e) => {
                      setPage(1);
                      setQ(e.target.value);
                    }}
                    className="pl-10 rounded-xl text-[14px]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Select value={filterCity} onValueChange={(v) => setFilterCity(v)}>
                    <SelectTrigger className="w-40 rounded-xl text-[14px]">
                      <SelectValue placeholder="Alle steden" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle steden</SelectItem>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterType} onValueChange={(v: "all" | "person" | "org") => setFilterType(v)}>
                    <SelectTrigger className="w-36 rounded-xl text-[14px]">
                      <SelectValue placeholder="Alle types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle types</SelectItem>
                      <SelectItem value="org">Organisatie</SelectItem>
                      <SelectItem value="person">Persoon</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
                    <SelectTrigger className="w-40 rounded-xl text-[14px]">
                      <SelectValue placeholder="Alle statusen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle statusen</SelectItem>
                      <SelectItem value="Actief">Actief</SelectItem>
                      <SelectItem value="Nieuw">Nieuw</SelectItem>
                      <SelectItem value="Contact gelegd">Contact gelegd</SelectItem>
                      <SelectItem value="Offerte gestuurd">Offerte gestuurd</SelectItem>
                      <SelectItem value="Onderhandeling">Onderhandeling</SelectItem>
                      <SelectItem value="Afgerond">Afgerond</SelectItem>
                      <SelectItem value="Geblokkeerd">Geblokkeerd</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button onClick={onExportCsv} variant="outline" className="rounded-xl">
                    <Download className="h-4 w-4 mr-2" />
                    CSV Export
                  </Button>
                </div>
              </div>

              {/* Tabel */}
              <div className="rounded-xl border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Naam</TableHead>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Telefoon</TableHead>
                      <TableHead>Stad</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Aangemaakt op</TableHead>
                      <TableHead className="text-right">Acties</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.length === 0 && !loading && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                          Geen resultaten
                        </TableCell>
                      </TableRow>
                    )}

                    {filteredItems.map((c) => {
                      const typeStyles = getTypeStyles(c.uiType);
                      const statusStyles = getStatusStyles(c.uiStatus);
                      const name = c.uiType === "Organisatie" ? c.companyName || "(Onbekend bedrijf)" : getFullName(c);

                      return (
                        <TableRow
                          key={c.id}
                          className="hover:bg-muted/50 cursor-pointer"
                          onClick={() => onNavigate?.("customerDetail", c.id)}
                        >
                          {/* Naam: zwart, niet vet */}
                          <TableCell className="text-[14.5px] text-neutral-900">
                            {name}
                          </TableCell>

                          {/* E-mail: blauw */}
                          <TableCell>
                            {c.email ? (
                              <a
                                href={`mailto:${c.email}`}
                                className="text-blue-600 hover:text-blue-700 underline underline-offset-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {c.email}
                              </a>
                            ) : (
                              "-"
                            )}
                          </TableCell>

                          <TableCell>{c.phone || "-"}</TableCell>
                          <TableCell>{c.city || "-"}</TableCell>

                          <TableCell>
                            <Badge
                              variant="secondary"
                              className="rounded-full"
                              style={{ backgroundColor: typeStyles.bg, color: typeStyles.fg }}
                            >
                              {c.uiType}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            <Badge
                              className="rounded-full"
                              style={{ backgroundColor: statusStyles.bg, color: statusStyles.fg }}
                            >
                              {c.uiStatus}
                            </Badge>
                          </TableCell>

                          <TableCell>{fmtDate(c.createdAt)}</TableCell>

                          <TableCell className="text-right">
                            <div
                              className="flex items-center justify-end gap-1.5"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {/* Uitnodigen (blauw) */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    title="Uitnodigen"
                                    className="hover:bg-transparent focus-visible:ring-0 text-blue-600 hover:text-blue-700 transition-transform hover:scale-110"
                                    onClick={() => {
                                      setSelectedCustomer(c);
                                      setInviteOpen(true);
                                    }}
                                  >
                                    <Mail className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent
                                  side="bottom"
                                  align="center"
                                  sideOffset={6}
                                  className="px-2 py-1 text-xs rounded-md shadow-sm"
                                >
                                  Uitnodigen</TooltipContent>
                              </Tooltip>

                              {/* Pipeline (groen) */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    title="Toevoegen aan pipeline"
                                    className="hover:bg-transparent focus-visible:ring-0 text-green-600 hover:text-green-700 transition-transform hover:scale-110"
                                    onClick={() => onAddToPipeline?.(c)}
                                  >
                                    <TrendingUp className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent
                                  side="bottom"
                                  align="center"
                                  sideOffset={6}
                                  className="px-2 py-1 text-xs rounded-md shadow-sm"                  
                                >
                                  Toevoegen aan pipeline</TooltipContent>
                              </Tooltip>

                              {/* Bewerken (kleur laten zoals is) */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    title="Bewerken"
                                    className="hover:bg-transparent focus-visible:ring-0 transition-transform hover:scale-110"
                                    onClick={() => onEditCustomer?.(c)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent
                                  side="bottom"
                                  align="center"
                                  sideOffset={6}
                                  className="px-2 py-1 text-xs rounded-md shadow-sm" 
                                  >
                                    Bewerken</TooltipContent>
                              </Tooltip>

                              {/* Verwijderen (rood) */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    title="Verwijderen"
                                    className="hover:bg-transparent focus-visible:ring-0 text-rose-600 hover:text-rose-700 transition-transform hover:scale-110"
                                    onClick={async () => {
                                      if (onDeleteCustomer) return onDeleteCustomer(c);
                                      const { toast } = await import("sonner");
                                      toast.message("Geen delete-handler gekoppeld", {
                                        description: "Koppel onDeleteCustomer om te verwijderen.",
                                      });
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent
                                  side="bottom"
                                  align="center"
                                  sideOffset={6}
                                  className="px-2 py-1 text-xs rounded-md shadow-sm" 
                                  >
                                    Verwijderen</TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Footer */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Rijen per pagina:</span>
                  <Select
                    value={String(pageSize)}
                    onValueChange={(v) => {
                      setPage(1);
                      setPageSize(parseInt(v, 10));
                    }}
                  >
                    <SelectTrigger className="w-24 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    disabled={page <= 1 || loading}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Vorige
                  </Button>
                  <span className="text-sm">
                    Pagina {data.page} van {totalPages} (Totaal {filteredItems.length === data.items.length ? data.total : filteredItems.length} klanten)
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    disabled={page >= totalPages || loading}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Volgende
                  </Button>
                </div>

                <div />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {selectedCustomer && (
          <SendAccountInviteModal
            isOpen={inviteOpen}
            onClose={() => setInviteOpen(false)}
            customer={selectedCustomer}
            onSend={handleSendInvite}
          />
        )}
      </div>
    </TooltipProvider>
  );
}
