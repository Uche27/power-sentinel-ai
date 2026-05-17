import { createFileRoute } from "@tanstack/react-router";
import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { Users, ShieldAlert, AlertTriangle, TrendingDown, Brain, Cpu, Activity } from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { consumptionSeries, regionalFraud, alerts } from "@/lib/mockData";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — ElectraGuard.AI" }] }),
  component: Dashboard,
});

const COLORS = ["oklch(0.55 0.21 250)", "oklch(0.72 0.18 50)", "oklch(0.66 0.17 155)", "oklch(0.6 0.24 27)", "oklch(0.5 0.18 290)"];

function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">AI-powered insights across all Nigerian DISCOs.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard icon={Users} label="Total Customers" value={48230} accent="primary" trend="+3.2% MoM" trendUp />
        <StatCard icon={AlertTriangle} label="Suspicious" value={2147} accent="warning" trend="+12% MoM" trendUp={false} />
        <StatCard icon={ShieldAlert} label="Fraud Cases" value={1247} accent="destructive" trend="+8.5% MoM" trendUp={false} />
        <StatCard icon={TrendingDown} label="Revenue Loss" prefix="₦" value={284} suffix="M" accent="accent" trend="-14% MoM" trendUp />
        <StatCard icon={Brain} label="AI Accuracy" value={96} suffix="%" accent="success" trend="+1.1%" trendUp />
        <StatCard icon={Cpu} label="Active Meters" value={47812} accent="primary" trend="+412 today" trendUp />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5 bg-gradient-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Consumption vs Detected Fraud (12 months)</h3>
            <Activity className="size-4 text-primary" />
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={consumptionSeries}>
              <defs>
                <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.55 0.21 250)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="oklch(0.55 0.21 250)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g2" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.6 0.24 27)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="oklch(0.6 0.24 27)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.85 0.01 250)" />
              <XAxis dataKey="month" stroke="currentColor" fontSize={12} />
              <YAxis stroke="currentColor" fontSize={12} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Area type="monotone" dataKey="normal" stroke="oklch(0.55 0.21 250)" strokeWidth={2} fill="url(#g1)" />
              <Area type="monotone" dataKey="fraud" stroke="oklch(0.6 0.24 27)" strokeWidth={2} fill="url(#g2)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5 bg-gradient-card">
          <h3 className="font-semibold mb-4">Regional Fraud Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={regionalFraud} dataKey="cases" nameKey="region" innerRadius={50} outerRadius={90} paddingAngle={2}>
                {regionalFraud.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-5 bg-gradient-card">
        <h3 className="font-semibold mb-3">Real-time Activity Feed</h3>
        <ul className="divide-y">
          {alerts.map((a) => (
            <li key={a.id} className="py-3 flex items-center gap-3">
              <span className={`size-2.5 rounded-full ${a.level === "high" ? "bg-destructive pulse-ring" : a.level === "moderate" ? "bg-warning" : "bg-success"}`} />
              <div className="flex-1 min-w-0">
                <div className="text-sm truncate">{a.msg}</div>
                <div className="text-xs text-muted-foreground">{a.zone}</div>
              </div>
              <div className="text-xs text-muted-foreground shrink-0">{a.time}</div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
