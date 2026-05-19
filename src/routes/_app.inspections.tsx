import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { ClipboardList, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/inspections")({
  head: () => ({ meta: [{ title: "Field inspections — ElectraGuard.AI" }] }),
  component: Inspections,
});

interface Inspection {
  id: string; customer_name: string; meter_no: string; location: string;
  findings: string; action_taken: string; outcome: string; created_at: string;
}

function Inspections() {
  const { user } = useCurrentUser();
  const [busy, setBusy] = useState(false);
  const [list, setList] = useState<Inspection[]>([]);
  const [form, setForm] = useState({
    customer_name: "", meter_no: "", location: "",
    findings: "", action_taken: "", outcome: "resolved",
  });
  function up<K extends keyof typeof form>(k: K, v: (typeof form)[K]) { setForm((f) => ({ ...f, [k]: v })); }

  useEffect(() => { void load(); }, []);
  async function load() {
    const { data } = await supabase.from("field_inspections")
      .select("id,customer_name,meter_no,location,findings,action_taken,outcome,created_at")
      .order("created_at", { ascending: false });
    setList((data ?? []) as Inspection[]);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!form.customer_name || !form.meter_no || form.findings.length < 10 || form.action_taken.length < 5) {
      toast.error("Please complete all required fields.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("field_inspections").insert({ ...form, inspector_id: user.id });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Inspection submitted.");
    setForm({ customer_name: "", meter_no: "", location: "", findings: "", action_taken: "", outcome: "resolved" });
    void load();
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><ClipboardList className="size-6 text-primary" /> Field inspections</h1>
        <p className="text-sm text-muted-foreground">Log on-site inspection findings and actions taken.</p>
      </div>

      <Card className="p-6">
        <form onSubmit={submit} className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label>Customer name</Label>
            <Input value={form.customer_name} onChange={(e) => up("customer_name", e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Meter number</Label>
            <Input value={form.meter_no} onChange={(e) => up("meter_no", e.target.value)} /></div>
          <div className="space-y-1.5 md:col-span-2"><Label>Location</Label>
            <Input value={form.location} onChange={(e) => up("location", e.target.value)} /></div>
          <div className="space-y-1.5 md:col-span-2"><Label>Findings</Label>
            <Textarea rows={4} value={form.findings} onChange={(e) => up("findings", e.target.value)}
              placeholder="What did you observe during the inspection?" /></div>
          <div className="space-y-1.5 md:col-span-2"><Label>Action taken</Label>
            <Textarea rows={3} value={form.action_taken} onChange={(e) => up("action_taken", e.target.value)}
              placeholder="Meter replaced, disconnection issued, customer warned…" /></div>
          <div className="space-y-1.5"><Label>Outcome</Label>
            <Select value={form.outcome} onValueChange={(v) => up("outcome", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={busy}>{busy && <Loader2 className="size-4 mr-1 animate-spin" />} Submit inspection</Button>
          </div>
        </form>
      </Card>

      <Card className="p-5">
        <h3 className="font-semibold mb-3">Recent inspections</h3>
        {list.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No inspections yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead><TableHead>Meter</TableHead>
                  <TableHead>Location</TableHead><TableHead>Outcome</TableHead><TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell>{i.customer_name}</TableCell>
                    <TableCell className="font-mono text-xs">{i.meter_no}</TableCell>
                    <TableCell>{i.location}</TableCell>
                    <TableCell><Badge variant={i.outcome === "resolved" ? "default" : "secondary"}>{i.outcome}</Badge></TableCell>
                    <TableCell className="text-xs">{new Date(i.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
