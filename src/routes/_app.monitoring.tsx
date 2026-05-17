import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { hourlyUsage, alerts } from "@/lib/mockData";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { Brain, Zap, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_app/monitoring")({
  head: () => ({ meta: [{ title: "AI Monitoring — ElectraGuard.AI" }] }),
  component: Monitoring,
});

function Monitoring() {
  const [live, setLive] = useState(hourlyUsage);
  useEffect(() => {
    const id = setInterval(() => {
      setLive((prev) => prev.map((p) => ({ ...p, usage: Math.max(60, Math.round(p.usage + (Math.random() - 0.5) * 18)) })));
    }, 2500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="size-2 rounded-full bg-success pulse-ring" /> AI Monitoring
          </h1>
          <p className="text-sm text-muted-foreground">Real-time smart-meter telemetry, anomaly scoring and fraud alerts.</p>
        </div>
        <Badge className="bg-success text-success-foreground">LIVE</Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5 bg-gradient-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">24-hour consumption (kWh)</h3>
            <Zap className="size-4 text-accent" />
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={live}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.85 0.01 250)" />
              <XAxis dataKey="hour" stroke="currentColor" fontSize={11} interval={2} />
              <YAxis stroke="currentColor" fontSize={11} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Line type="monotone" dataKey="usage" stroke="oklch(0.55 0.21 250)" strokeWidth={2.5} dot={{ r: 2 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5 bg-gradient-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">AI Prediction Panel</h3>
            <Brain className="size-4 text-primary" />
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5"><span>Fraud probability</span><span className="font-semibold text-destructive">82%</span></div>
              <Progress value={82} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5"><span>AI confidence</span><span className="font-semibold text-success">94%</span></div>
              <Progress value={94} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5"><span>Behavioral anomaly score</span><span className="font-semibold text-warning">67%</span></div>
              <Progress value={67} className="h-2" />
            </div>
            <div className="rounded-lg bg-destructive/10 p-3 border border-destructive/30">
              <div className="flex items-center gap-2 text-destructive font-semibold text-sm">
                <AlertTriangle className="size-4" /> High Risk
              </div>
              <p className="text-xs mt-1 text-muted-foreground">Customer flagged for likely meter bypass. Manual inspection recommended.</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-5 bg-gradient-card">
          <h3 className="font-semibold mb-3">Anomaly heatmap by hour</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={live}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.85 0.01 250)" />
              <XAxis dataKey="hour" stroke="currentColor" fontSize={10} interval={2} />
              <YAxis stroke="currentColor" fontSize={10} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Bar dataKey="usage" fill="oklch(0.72 0.18 50)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5 bg-gradient-card">
          <h3 className="font-semibold mb-3">Suspicious activity alerts</h3>
          <ul className="space-y-2">
            {alerts.map((a) => (
              <li key={a.id} className={`rounded-lg p-3 border ${
                a.level === "high" ? "bg-destructive/5 border-destructive/30" :
                a.level === "moderate" ? "bg-warning/5 border-warning/30" :
                "bg-success/5 border-success/30"
              }`}>
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{a.msg}</div>
                    <div className="text-xs text-muted-foreground">{a.zone} · {a.customer}</div>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">{a.time}</span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
