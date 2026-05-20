import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { AlertOctagon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-current-user";

export const Route = createFileRoute("/_app/report-suspicious")({
  head: () => ({ meta: [{ title: "Report suspicious activity — ElectraGuard.AI" }] }),
  component: ReportSuspicious,
});

const DISCOS = ["AEDC", "EKEDC", "IKEDC", "KEDCO", "PHED", "IBEDC", "EEDC"];

function ReportSuspicious() {
  const { user } = useCurrentUser();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    customer_name: "", meter_no: "", location: "", disco: "AEDC",
    severity: "medium", description: "",
  });
  function up<K extends keyof typeof form>(k: K, v: (typeof form)[K]) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!form.customer_name || !form.meter_no || !form.location || form.description.length < 10) {
      toast.error("Please fill all fields. Description must be at least 10 characters.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("suspicious_reports").insert({
      ...form, reported_by: user.id, status: "pending",
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Suspicious activity reported. An admin will review it.");
    setForm({ customer_name: "", meter_no: "", location: "", disco: "AEDC", severity: "medium", description: "" });
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><AlertOctagon className="size-6 text-destructive" /> Report suspicious activity</h1>
        <p className="text-sm text-muted-foreground">Log meter tampering, bypass attempts and irregular consumption from the field.</p>
      </div>

      <Card className="p-6">
        <form onSubmit={submit} className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Customer name</Label>
            <Input value={form.customer_name} onChange={(e) => up("customer_name", e.target.value)} placeholder="John Doe" />
          </div>
          <div className="space-y-1.5">
            <Label>Meter number</Label>
            <Input value={form.meter_no} onChange={(e) => up("meter_no", e.target.value)} placeholder="NG-12345678" />
          </div>
          <div className="space-y-1.5">
            <Label>Location</Label>
            <Input value={form.location} onChange={(e) => up("location", e.target.value)} placeholder="Wuse 2, Abuja" />
          </div>
          <div className="space-y-1.5">
            <Label>DISCO</Label>
            <Select value={form.disco} onValueChange={(v) => up("disco", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{DISCOS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>Severity</Label>
            <Select value={form.severity} onValueChange={(v) => up("severity", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => up("description", e.target.value)} rows={5}
              placeholder="Describe what you observed — bypass wiring, broken seal, unusual meter readings…" />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={busy}>
              {busy && <Loader2 className="size-4 mr-1 animate-spin" />} Submit report
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
