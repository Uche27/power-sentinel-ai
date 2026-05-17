import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { consumptionSeries, hourlyUsage, regionalFraud } from "@/lib/mockData";
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, Tooltip, CartesianGrid, RadialBarChart, RadialBar, Legend,
} from "recharts";

export const Route = createFileRoute("/_app/analytics")({
  head: () => ({ meta: [{ title: "Analytics — ElectraGuard.AI" }] }),
  component: Analytics,
});

const revenue = consumptionSeries.map((c) => ({ month: c.month, loss: c.fraud * 62 + c.suspicious * 12 }));
const radial = regionalFraud.slice(0, 5).map((r, i) => ({ name: r.region, value: r.cases, fill: ["oklch(0.55 0.21 250)","oklch(0.72 0.18 50)","oklch(0.66 0.17 155)","oklch(0.6 0.24 27)","oklch(0.5 0.18 290)"][i] }));

function Analytics() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">AI Analytics</h1>
        <p className="text-sm text-muted-foreground">Advanced visualizations of fraud, consumption and revenue patterns.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-5 bg-gradient-card">
          <h3 className="font-semibold mb-3">Monthly fraud trends</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={consumptionSeries}>
              <defs>
                <linearGradient id="af" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.6 0.24 27)" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="oklch(0.6 0.24 27)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" fontSize={11} /><YAxis fontSize={11} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Area type="monotone" dataKey="fraud" stroke="oklch(0.6 0.24 27)" fill="url(#af)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5 bg-gradient-card">
          <h3 className="font-semibold mb-3">Peak-hour anomaly</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={hourlyUsage}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" fontSize={10} interval={2} /><YAxis fontSize={11} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Line type="monotone" dataKey="usage" stroke="oklch(0.55 0.21 250)" strokeWidth={2.5} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5 bg-gradient-card">
          <h3 className="font-semibold mb-3">Regional fraud distribution</h3>
          <ResponsiveContainer width="100%" height={240}>
            <RadialBarChart innerRadius="20%" outerRadius="90%" data={radial} startAngle={180} endAngle={-180}>
              <RadialBar dataKey="value" background />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
            </RadialBarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5 bg-gradient-card">
          <h3 className="font-semibold mb-3">Revenue loss analysis (₦)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={revenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" fontSize={11} /><YAxis fontSize={11} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Bar dataKey="loss" fill="oklch(0.72 0.18 50)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-5 bg-gradient-card">
        <h3 className="font-semibold mb-3">Consumption heatmap</h3>
        <div className="grid grid-cols-12 gap-1">
          {Array.from({ length: 7 * 12 }).map((_, i) => {
            const v = Math.abs(Math.sin(i / 3)) + Math.random() * 0.3;
            return <div key={i} className="aspect-square rounded-sm" style={{ background: `oklch(0.55 0.21 250 / ${0.15 + v * 0.7})` }} />;
          })}
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground mt-2"><span>Mon</span><span>Sun</span></div>
      </Card>
    </div>
  );
}
