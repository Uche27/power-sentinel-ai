import { createFileRoute } from "@tanstack/react-router";
import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { Users, ShieldAlert, AlertTriangle, TrendingDown, Brain, Database, Activity, FileText } from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { consumptionSeries } from "@/lib/mockData";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Admin Dashboard — ElectraGuard.AI" }] }),
  component: Dashboard,
});

const COLORS = ["oklch(0.55 0.21 250)", "oklch(0.72 0.18 50)", "oklch(0.66 0.17 155)", "oklch(0.6 0.24 27)", "oklch(0.5 0.18 290)"];

interface Stats {
  datasets: number;
  models: number;
  reports: number;
  inspections: number;
  pending: number;
  bestAccuracy: number;
  regional: { region: string; cases: number }[];
  recent: { id: string; customer_name: string; severity: string; created_at: string; location: string }[];
}

function Dashboard() {
  const [s, setS] = useState<Stats>({ datasets: 0, models: 0, reports: 0, inspections: 0, pending: 0, bestAccuracy: 0, regional: [], recent: [] });

  useEffect(() => {
    void (async () => {
      const [ds, md, rp, ins, pend, best, all, recent] = await Promise.all([
        supabase.from("datasets").select("*", { count: "exact", head: true }),
        supabase.from("trained_models").select("*", { count: "exact", head: true }),
        supabase.from("suspicious_reports").select("*", { count: "exact", head: true }),
        supabase.from("field_inspections").select("*", { count: "exact", head: true }),
        supabase.from("suspicious_reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("trained_models").select("accuracy").order("accuracy", { ascending: false }).limit(1),
        supabase.from("suspicious_reports").select("disco"),
        supabase.from("suspicious_reports").select("id,customer_name,severity,created_at,location").order("created_at", { ascending: false }).limit(6),
      ]);
      const counts: Record<string, number> = {};
      (all.data ?? []).forEach((r) => { const k = r.disco || "Unknown"; counts[k] = (counts[k] ?? 0) + 1; });
      const regional = Object.entries(counts).map(([region, cases]) => ({ region, cases }));
      setS({
        datasets: ds.count ?? 0, models: md.count ?? 0, reports: rp.count ?? 0, inspections: ins.count ?? 0,
        pending: pend.count ?? 0,
        bestAccuracy: best.data?.[0]?.accuracy ?? 0,
        regional, recent: recent.data ?? [],
      });
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">AI-powered insights across all Nigerian DISCOs.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard icon={Database} label="Datasets" value={s.datasets} accent="primary" />
        <StatCard icon={Brain} label="Trained Models" value={s.models} accent="success" />
        <StatCard icon={AlertTriangle} label="Suspicious Cases" value={s.reports} accent="warning" />
        <StatCard icon={ShieldAlert} label="Pending Review" value={s.pending} accent="destructive" />
        <StatCard icon={FileText} label="Inspections" value={s.inspections} accent="accent" />
        <StatCard icon={TrendingDown} label="Best Accuracy" value={Math.round(s.bestAccuracy * 100)} suffix="%" accent="primary" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Consumption vs Detected Fraud (12 months)</h3>
            <Activity className="size-4 text-primary" />
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={consumptionSeries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Area type="monotone" dataKey="normal" stroke="oklch(0.55 0.21 250)" strokeWidth={2} fill="oklch(0.55 0.21 250)" fillOpacity={0.2} />
              <Area type="monotone" dataKey="fraud" stroke="oklch(0.6 0.24 27)" strokeWidth={2} fill="oklch(0.6 0.24 27)" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold mb-4">Cases by DISCO</h3>
          {s.regional.length === 0 ? (
            <div className="h-[280px] grid place-items-center text-sm text-muted-foreground">
              No reports submitted yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={s.regional} dataKey="cases" nameKey="region" innerRadius={50} outerRadius={90} paddingAngle={2}>
                  {s.regional.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="font-semibold mb-3">Recent suspicious reports</h3>
        {s.recent.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No reports yet.</p>
        ) : (
          <ul className="divide-y">
            {s.recent.map((a) => (
              <li key={a.id} className="py-3 flex items-center gap-3">
                <span className={`size-2.5 rounded-full ${a.severity === "high" ? "bg-destructive" : a.severity === "medium" ? "bg-warning" : "bg-success"}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{a.customer_name} <Users className="size-3 inline opacity-50" /></div>
                  <div className="text-xs text-muted-foreground">{a.location}</div>
                </div>
                <div className="text-xs text-muted-foreground shrink-0">{new Date(a.created_at).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
