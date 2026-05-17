import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { generateCustomers, type Customer, consumptionSeries } from "@/lib/mockData";
import { Download, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/customers")({
  head: () => ({ meta: [{ title: "Customers — ElectraGuard.AI" }] }),
  component: Customers,
});

const ALL = generateCustomers();
const PAGE_SIZE = 10;

function statusBadge(s: Customer["status"]) {
  if (s === "high") return <Badge className="bg-destructive text-destructive-foreground">High Risk</Badge>;
  if (s === "suspicious") return <Badge className="bg-warning text-warning-foreground">Suspicious</Badge>;
  return <Badge className="bg-success text-success-foreground">Normal</Badge>;
}

function Customers() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [active, setActive] = useState<Customer | null>(null);

  const filtered = useMemo(() => {
    return ALL.filter((c) =>
      (filter === "all" || c.status === filter) &&
      (q === "" || c.name.toLowerCase().includes(q.toLowerCase()) || c.meter.includes(q) || c.id.includes(q))
    );
  }, [q, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const slice = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function exportCsv() {
    const rows = [["ID","Name","Meter","Location","DISCO","Consumption","Billing","Risk"], ...filtered.map((c) => [c.id, c.name, c.meter, c.location, c.disco, c.monthlyConsumption, c.billing, c.status])];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = "customers.csv";
    a.click();
    toast.success("CSV exported");
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Customer Management</h1>
        <p className="text-sm text-muted-foreground">{filtered.length.toLocaleString()} customers monitored across all DISCOs.</p>
      </div>

      <Card className="p-4 bg-gradient-card">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input placeholder="Search by name, meter or ID..." className="pl-9" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
          </div>
          <Select value={filter} onValueChange={(v) => { setFilter(v); setPage(1); }}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All risk levels</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="suspicious">Suspicious</SelectItem>
              <SelectItem value="high">High Risk</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportCsv} variant="outline"><Download className="size-4 mr-1" /> Export CSV</Button>
        </div>

        <div className="mt-4 overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead><TableHead>Name</TableHead><TableHead>Meter</TableHead>
                <TableHead>Location</TableHead><TableHead>DISCO</TableHead>
                <TableHead className="text-right">Consumption</TableHead>
                <TableHead className="text-right">Billing (₦)</TableHead>
                <TableHead className="text-right">Risk Score</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slice.map((c) => (
                <TableRow key={c.id} className="cursor-pointer" onClick={() => setActive(c)}>
                  <TableCell className="font-mono text-xs">{c.id}</TableCell>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="font-mono text-xs">{c.meter}</TableCell>
                  <TableCell>{c.location}</TableCell>
                  <TableCell>{c.disco}</TableCell>
                  <TableCell className="text-right">{c.monthlyConsumption} kWh</TableCell>
                  <TableCell className="text-right">{c.billing.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-semibold">{c.riskScore}</TableCell>
                  <TableCell>{statusBadge(c.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between mt-3 text-sm">
          <span className="text-muted-foreground">Page {page} of {totalPages}</span>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="size-4" /></Button>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}><ChevronRight className="size-4" /></Button>
          </div>
        </div>
      </Card>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-2xl">
          {active && (
            <>
              <DialogHeader>
                <DialogTitle>{active.name} <span className="text-muted-foreground text-sm font-normal">· {active.id}</span></DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div><div className="text-xs text-muted-foreground">Meter</div><div className="font-mono">{active.meter}</div></div>
                <div><div className="text-xs text-muted-foreground">Location</div><div>{active.location} · {active.disco}</div></div>
                <div><div className="text-xs text-muted-foreground">Risk score</div><div className="font-bold">{active.riskScore}</div></div>
                <div><div className="text-xs text-muted-foreground">Status</div><div>{statusBadge(active.status)}</div></div>
              </div>
              <div className="mt-2">
                <div className="text-sm font-semibold mb-2">Historical consumption</div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={consumptionSeries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                    <Line type="monotone" dataKey="normal" stroke="oklch(0.55 0.21 250)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="rounded-lg bg-muted p-3 text-sm">
                <div className="font-semibold mb-1">AI fraud analysis</div>
                <p className="text-muted-foreground">
                  Model predicts <span className="font-semibold text-foreground">{Math.round(active.fraudProb * 100)}%</span> fraud probability.
                  Detected patterns: {active.status === "high" ? "sudden consumption drop, off-peak spikes" : active.status === "suspicious" ? "irregular billing-to-usage ratio" : "no significant anomalies"}.
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
