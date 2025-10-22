// frontend/src/pages/Customers.tsx
import { useEffect, useMemo, useState } from "react";
import * as React from "react";
import { Search, Plus, Download, Mail, TrendingUp } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { SendAccountInviteModal } from "../components/modals/SendAccountInviteModal";
import { getApiBase, getCustomers } from "../lib/api";
import { getCustomerFullName } from "../lib/mockData";
import type { Customer as ApiCustomer } from "../lib/api";

export interface CustomersProps {
  onNavigate?: (page: string, id?: string) => void;
  onOpenNewCustomer?: () => void;
  onAddToPipeline?: (customer: UICustomer) => void; // UI-model i.p.v. mockData/Api type
}

type Order = "asc" | "desc";
type ActiveTab = "all" | "organizations" | "persons";

// UI-typen (Figma): we mappen de API hierop
type UICustomerType = "Organisatie" | "Persoon";
type UICustomerStatus = "Actief" | "Nieuw" | "In bewerking" | "Geblokkeerd";

export type UICustomer = ApiCustomer & {
  uiType: UICustomerType;
  uiStatus: UICustomerStatus;

  // ⬇️ Optionele genormaliseerde velden voor de UI
  city?: string | null;
  companyName?: string | null;
  phone?: string | null;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
};

// Mapper: zet API-customer om naar UI-customer
function mapApiToUi(c: ApiCustomer): UICustomer {
  // Heuristiek: organisatie of persoon?
  const isOrg = !!(
    (c as any).companyName ||
    (c as any).organizationName ||
    (c as any).kvkNumber ||
    (c as any).type === "ORGANIZATION" ||
    (c as any).kind === "ORG"
  );

  // Status → UI
  const rawStatus = ((c as any).status ?? "").toString();
  const statusMap: Record<string, UICustomerStatus> = {
    ACTIVE: "Actief",
    NEW: "Nieuw",
    PENDING: "In bewerking",
    BLOCKED: "Geblokkeerd",
    Actief: "Actief",
    Nieuw: "Nieuw",
    "In bewerking": "In bewerking",
    Geblokkeerd: "Geblokkeerd",
  };
  const uiStatus = statusMap[rawStatus.toUpperCase()] ?? "Actief";

  // 🔧 Normaliseer veelgebruikte velden (val terug op alternatieve API-namen)
  const city =
    (c as any).city ??
    (c as any).place ??
    (c as any).address?.city ??
    null;

  const companyName =
    (c as any).companyName ??
    (c as any).organizationName ??
    (c as any).orgName ??
    null;

  const phone =
    (c as any).phone ??
    (c as any).tel ??
    (c as any).phoneNumber ??
    null;

  const email =
    (c as any).email ??
    (c as any).mail ??
    null;

  const firstName =
    (c as any).firstName ??
    (c as any).givenName ??
    null;

  const lastName =
    (c as any).lastName ??
    (c as any).surname ??
    (c as any).familyName ??
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
  };
}


// De data-state bevat voortaan ons UI-model
interface DataState {
  items: UICustomer[];
  total: number;
  page: number;
  pageSize: number;
}

export default function Customers(props: CustomersProps) {
  const { onNavigate, onOpenNewCustomer, onAddToPipeline } = props;

  // 🔎 Filters & state
  const [q, setQ] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sort, setSort] = useState<string>("createdAt");
  const [order, setOrder] = useState<Order>("desc");
  const [activeTab, setActiveTab] = useState<ActiveTab>("all");
  const [filterCity, setFilterCity] = useState<string>("all");

  // 📦 Data
  const [data, setData] = useState<DataState>({ items: [], total: 0, page: 1, pageSize: 10 });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // ✉️ Invite modal
  const [inviteOpen, setInviteOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<UICustomer | null>(null);

  // 🔁 Fetch bij wijzigingen (server-side search/sort/paging)
  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const res = await getCustomers({ q, page, pageSize, sort, order }) as any;
        // ⚠️ Map API → UI
        const mapped: DataState = {
          items: (res.items ?? []).map((c: ApiCustomer) => mapApiToUi(c)),
          total: res.total ?? (res.items?.length ?? 0),
          page: res.page ?? page,
          pageSize: res.pageSize ?? pageSize,
        };
        if (!cancelled) setData(mapped);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Kon klantenlijst niet laden");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [q, page, pageSize, sort, order]);

  // ⛏️ Client-side filters (tab/type + city) — draaien op UI-velden
  const filteredItems = useMemo(() => {
    let list = data.items;
    if (activeTab === "organizations") list = list.filter((c) => c.uiType === "Organisatie");
    if (activeTab === "persons") list = list.filter((c) => c.uiType === "Persoon");
    if (filterCity !== "all") {
      list = list.filter(
        (c) => (c.city || "").toLowerCase() === filterCity.toLowerCase()
      );
    }
    return list;
  }, [data.items, activeTab, filterCity]);

  const totalPages = useMemo(() => {
    // Let wel: server total kan verschillen van client-side gefilterd aantal
    const total = filteredItems.length === data.items.length ? data.total : filteredItems.length;
    return Math.max(1, Math.ceil(total / data.pageSize));
  }, [filteredItems.length, data.total, data.pageSize]);

  const cities = useMemo(() => {
    const set = new Set<string>();
    data.items.forEach((c) => c.city && set.add(c.city));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [data.items]);

  function onExportCsv() {
    // Export respecteert server filters (q/sort/order/pageSize)
    const base = getApiBase();
    const url = `${base}/customers/export?q=${encodeURIComponent(q)}&sort=${sort}&order=${order}&pageSize=${pageSize}`;
    window.open(url, "_blank");
  }

  // 📧 Uitnodiging versturen
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
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1>Klanten</h1>
        <div className="flex items-center gap-2">
          <Button onClick={onExportCsv} variant="outline" className="rounded-xl" title="Exporteer CSV">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button
            onClick={onOpenNewCustomer}
            className="rounded-xl"
            style={{ backgroundColor: "var(--accent)", color: "#FFFFFF" }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nieuwe klant
          </Button>
        </div>
      </div>

      {/* Filters + zoek */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
          <Input
            placeholder="Zoek op naam, e-mail of plaats"
            value={q}
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={filterCity} onValueChange={(v) => setFilterCity(v)}>
            <SelectTrigger className="w-48">
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

          <Select
            value={`${sort}:${order}`}
            onValueChange={(val) => {
              const [s, o] = val.split(":");
              setSort(s);
              setOrder(o as Order);
            }}
          >
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Sorteer op" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt:desc">Nieuwste eerst</SelectItem>
              <SelectItem value="createdAt:asc">Oudste eerst</SelectItem>
              <SelectItem value="lastName:asc">Achternaam A–Z</SelectItem>
              <SelectItem value="lastName:desc">Achternaam Z–A</SelectItem>
              <SelectItem value="companyName:asc">Bedrijf A–Z</SelectItem>
              <SelectItem value="companyName:desc">Bedrijf Z–A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ActiveTab)}>
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="all" className="rounded-xl">Alle</TabsTrigger>
          <TabsTrigger value="organizations" className="rounded-xl">Organisaties</TabsTrigger>
          <TabsTrigger value="persons" className="rounded-xl">Personen</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {/* Tabel */}
          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Naam</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Telefoon</TableHead>
                  <TableHead>Plaats</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                      Geen resultaten
                    </TableCell>
                  </TableRow>
                )}

                {filteredItems.map((c) => (
                  <TableRow
                    key={c.id}
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() => onNavigate?.("customerDetail", c.id)}
                  >
                    <TableCell className="font-medium">
                      {c.uiType === "Organisatie"
                        ? (c.companyName || "(Onbekend bedrijf)")
                        : getCustomerFullName(c as any)}
                    </TableCell>
                    <TableCell>
                      <a href={`mailto:${c.email}`} className="underline underline-offset-2">{c.email}</a>
                    </TableCell>
                    <TableCell>{c.phone || "-"}</TableCell>
                    <TableCell>{c.city || "-"}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="rounded-full"
                        style={{
                          backgroundColor: c.uiType === "Persoon" ? "#3B82F620" : "#10B98120",
                          color: c.uiType === "Persoon" ? "#3B82F6" : "#10B981",
                        }}
                      >
                        {c.uiType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="rounded-full">{c.uiStatus}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Uitnodigen"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCustomer(c);
                            setInviteOpen(true);
                          }}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Toevoegen aan pipeline"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToPipeline?.(c);
                          }}
                        >
                          <TrendingUp className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Footer paginatie (links) + status (rechts) */}
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
                <SelectTrigger className="w-24">
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
                Pagina {data.page} van {totalPages}
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

            <div className="text-sm text-muted-foreground">
              Totaal {filteredItems.length === data.items.length ? data.total : filteredItems.length} klanten
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
  );
}
