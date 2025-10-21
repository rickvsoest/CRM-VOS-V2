// frontend/src/pages/Customers.tsx
import { useEffect, useMemo, useState } from "react";
import { getApiBase, getCustomers, type Customer } from "../lib/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

export interface CustomersProps {
  onNavigate?: (page: string, id?: string) => void;
  onOpenNewCustomer?: () => void;
  onAddToPipeline?: (customer: { id: string; firstName?: string; lastName?: string; companyName?: string }) => void;
}

type Order = "asc" | "desc";

interface DataState {
  items: Customer[];
  total: number;
  page: number;
  pageSize: number;
}

export default function Customers(props: CustomersProps) {
  const { onNavigate, onOpenNewCustomer, onAddToPipeline } = props;
  const [q, setQ] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sort, setSort] = useState<string>("createdAt");
  const [order, setOrder] = useState<Order>("desc");

  // 📦 Data
  const [data, setData] = useState<DataState>({
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 🔁 Fetch bij wijzigingen
  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const res = await getCustomers({ q, page, pageSize, sort, order });
        if (!cancelled) {
          // backend moet {items,total,page,pageSize} teruggeven
          setData({
            items: res.items ?? [],
            total: res.total ?? 0,
            page: res.page ?? page,
            pageSize: res.pageSize ?? pageSize,
          });
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || "Er ging iets mis bij het ophalen van klanten.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [q, page, pageSize, sort, order]);

  const totalPages = useMemo(() => {
    if (!data.total || !data.pageSize) return 1;
    return Math.max(1, Math.ceil(data.total / data.pageSize));
  }, [data.total, data.pageSize]);

  function onExportCsv() {
    // Simpele export: nieuwe tab naar /customers/export met dezelfde filters
    const base = getApiBase();
    const qs = new URLSearchParams();
    if (q) qs.set("q", q);
    if (sort) qs.set("sort", sort);
    if (order) qs.set("order", order);
    // optioneel: je kunt page/pageSize meesturen of juist alles exporteren
    const url = `${base}/customers/export?${qs.toString()}`;
    window.open(url, "_blank");
  }

  function toggleSort(col: string) {
    if (sort === col) {
      setOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSort(col);
      setOrder("asc");
    }
  }

  const sortLabel = (col: string) =>
    sort === col ? (order === "asc" ? " ↑" : " ↓") : "";

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header met zoek + export (compact) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-2 w-full md:max-w-md">
          <Input
            value={q}
            onChange={(e) => {
              setPage(1); // reset naar pagina 1 bij nieuwe zoekterm
              setQ(e.target.value);
            }}
            placeholder="Zoek klantnaam, e-mail, telefoon…"
          />
          <Button variant="secondary" onClick={() => setQ("")}>
            Reset
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onExportCsv}>
            Export CSV
          </Button>
        </div>
      </div>

      {/* Tabel */}
      <div className="rounded-2xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => toggleSort("name")}>
                Naam{sortLabel("name")}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => toggleSort("email")}>
                E-mail{sortLabel("email")}
              </TableHead>
              <TableHead>Telefoon</TableHead>
              <TableHead className="cursor-pointer" onClick={() => toggleSort("createdAt")}>
                Aangemaakt{sortLabel("createdAt")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6">
                  Laden…
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={4} className="text-red-600 py-6">
                  {error}
                </TableCell>
              </TableRow>
            ) : data.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6">
                  Geen klanten gevonden.
                </TableCell>
              </TableRow>
            ) : (
              data.items.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.email || "-"}</TableCell>
                  <TableCell>{c.phone || "-"}</TableCell>
                  <TableCell>
                    {c.createdAt
                      ? new Date(c.createdAt).toLocaleDateString()
                      : "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer paginatie (links) + status (rechts) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm">Rijen per pagina:</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => {
              setPage(1);
              setPageSize(Number(v));
            }}
          >
            <SelectTrigger className="w-[90px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Vorige
          </Button>
          <Button
            variant="outline"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Volgende
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          Pagina {data.page} / {totalPages} · Totaal {data.total}
        </div>
      </div>
    </div>
  );
}
