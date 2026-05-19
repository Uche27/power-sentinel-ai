import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertOctagon, ClipboardList, History, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-current-user";

export const Route = createFileRoute("/_app/my-activity")({
  head: () => ({ meta: [{ title: "My dashboard — ElectraGuard.AI" }] }),
  component: StaffDash,
});

function StaffDash() {
  const { user, profile } = useCurrentUser();
  const [stats, setStats] = useState({ reports: 0, inspections: 0, pending: 0 });
  const [recent, setRecent] = useState<{ id: string; customer_name: string; severity: string; status: string; created_at: string }[]>([]);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      const [r, ins, p, recentRows] = await Promise.all([
        supabase.from("suspicious_reports").select("*", { count: "exact", head: true }).eq("reported_by", user.id),
        supabase.from("field_inspections").select("*", { count: "exact", head: true }).eq("inspector_id", user.id),
        supabase.from("suspicious_reports").select("*", { count: "exact", head: true }).eq("reported_by", user.id).eq("status", "pending"),
        supabase.from("suspicious_reports").select("id,customer_name,severity,status,created_at").eq("reported_by", user.id).order("created_at", { ascending: false }).limit(5),
      ]);
      setStats({ reports: r.count ?? 0, inspections: ins.count ?? 0, pending: p.count ?? 0 });
      setRecent(recentRows.data ?? []);
    })();
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {profile?.full_name ?? "Inspector"}</h1>
        <p className="text-sm text-muted-foreground">Your field operations overview.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "Reports submitted", v: stats.reports, icon: AlertOctagon },
          { label: "Inspections completed", v: stats.inspections, icon: ClipboardList },
          { label: "Reports pending review", v: stats.pending, icon: History },
        ].map((s) => (
          <Card key={s.label} className="p-5">
            <s.icon className="size-5 text-primary mb-2" />
            <div className="text-3xl font-bold">{s.v}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-5">
          <AlertOctagon className="size-5 text-destructive mb-2" />
          <h3 className="font-semibold">Report suspicious activity</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Log meter tampering or bypass observed in the field.</p>
          <Link to="/report-suspicious"><Button>Open form <ArrowRight className="size-4 ml-1" /></Button></Link>
        </Card>
        <Card className="p-5">
          <ClipboardList className="size-5 text-primary mb-2" />
          <h3 className="font-semibold">Submit field inspection</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Record findings and actions taken on-site.</p>
          <Link to="/inspections"><Button variant="outline">Open form <ArrowRight className="size-4 ml-1" /></Button></Link>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="font-semibold mb-3">Your recent reports</h3>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No reports yet — submit your first one above.</p>
        ) : (
          <ul className="divide-y">
            {recent.map((r) => (
              <li key={r.id} className="py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{r.customer_name}</div>
                  <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</div>
                </div>
                <Badge variant={r.severity === "high" ? "destructive" : "secondary"}>{r.severity}</Badge>
                <Badge variant={r.status === "resolved" ? "default" : "outline"}>{r.status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
