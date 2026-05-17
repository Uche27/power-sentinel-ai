import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  icon: LucideIcon;
  label: string;
  value: number | string;
  prefix?: string;
  suffix?: string;
  trend?: string;
  trendUp?: boolean;
  accent?: "primary" | "accent" | "success" | "destructive" | "warning";
}

export function StatCard({ icon: Icon, label, value, prefix = "", suffix = "", trend, trendUp, accent = "primary" }: Props) {
  const [display, setDisplay] = useState(typeof value === "number" ? 0 : value);

  useEffect(() => {
    if (typeof value !== "number") { setDisplay(value); return; }
    let raf = 0;
    let start: number | null = null;
    const step = (t: number) => {
      if (start === null) start = t;
      const p = Math.min(1, (t - start) / 1200);
      setDisplay(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  const accentBg = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/15 text-accent",
    success: "bg-success/10 text-success",
    destructive: "bg-destructive/10 text-destructive",
    warning: "bg-warning/15 text-warning",
  }[accent];

  return (
    <Card className="p-5 bg-gradient-card hover:-translate-y-0.5 hover:shadow-elegant transition-all">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="mt-2 text-2xl md:text-3xl font-bold">
            {prefix}{typeof display === "number" ? display.toLocaleString() : display}{suffix}
          </div>
          {trend && (
            <div className={cn("mt-2 text-xs font-medium", trendUp ? "text-success" : "text-destructive")}>
              {trendUp ? "▲" : "▼"} {trend}
            </div>
          )}
        </div>
        <div className={cn("size-11 rounded-xl grid place-items-center", accentBg)}>
          <Icon className="size-5" />
        </div>
      </div>
    </Card>
  );
}
