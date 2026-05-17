import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { alerts } from "@/lib/mockData";
import { Bell, Mail, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/_app/alerts")({
  head: () => ({ meta: [{ title: "Alerts — ElectraGuard.AI" }] }),
  component: Alerts,
});

function Alerts() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Bell className="size-6 text-accent" /> Alerts & Notifications</h1>
        <p className="text-sm text-muted-foreground">Real-time fraud alerts and email notifications across all DISCOs.</p>
      </div>

      <Card className="p-4 bg-destructive/5 border-destructive/30 flex items-start gap-3">
        <AlertTriangle className="size-5 text-destructive shrink-0 mt-0.5" />
        <div>
          <div className="font-semibold text-destructive">High anomaly detected in Zone B</div>
          <p className="text-sm text-muted-foreground">5 high-risk customers were flagged in the last hour. Immediate field inspection recommended.</p>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-5 bg-gradient-card">
          <h3 className="font-semibold mb-3">Live alerts</h3>
          <ul className="space-y-2">
            {alerts.map((a) => (
              <li key={a.id} className={`rounded-lg p-3 border flex items-start gap-3 ${
                a.level === "high" ? "bg-destructive/5 border-destructive/30" :
                a.level === "moderate" ? "bg-warning/5 border-warning/30" :
                "bg-success/5 border-success/30"
              }`}>
                <span className={`size-2.5 rounded-full mt-1.5 ${a.level === "high" ? "bg-destructive pulse-ring" : a.level === "moderate" ? "bg-warning" : "bg-success"}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{a.msg}</div>
                  <div className="text-xs text-muted-foreground">{a.zone} · {a.customer}</div>
                </div>
                <Badge variant="outline" className="text-[10px]">{a.time}</Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5 bg-gradient-card">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><Mail className="size-4 text-primary" /> Email simulation log</h3>
          <ul className="space-y-2 text-sm">
            {[
              { to: "ops@aedc.ng", subj: "🚨 High-risk customer C1042 flagged", t: "2 min ago" },
              { to: "ops@ekedc.ng", subj: "Zone B anomaly summary", t: "12 min ago" },
              { to: "manager@kedco.ng", subj: "Daily fraud detection digest", t: "1 hr ago" },
              { to: "regulator@nerc.gov.ng", subj: "Weekly compliance report", t: "Yesterday" },
            ].map((m, i) => (
              <li key={i} className="rounded-md border p-3 hover:bg-muted/50 transition-colors">
                <div className="flex justify-between text-xs text-muted-foreground"><span className="font-mono">{m.to}</span><span>{m.t}</span></div>
                <div className="font-medium mt-1">{m.subj}</div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
