import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSignedInAccountRole } from "@/lib/auth";
import {
  Zap, Brain, ShieldAlert, Activity, BarChart3, Bell,
  ArrowRight, Cpu, Database, LineChart, CheckCircle2, Github, Twitter, Linkedin,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Detecting Electrical Theft in Nigeria Using AI" },
      { name: "description", content: "AI-powered electricity theft detection platform for Nigerian DISCOs — AEDC, EKEDC, KEDCO, PHED and more." },
      { property: "og:title", content: "Detecting Electrical Theft in Nigeria Using AI" },
      { property: "og:description", content: "Intelligent monitoring, fraud prediction and real-time analytics for Nigeria's electricity sector." },
    ],
  }),
  component: Landing,
});

function useCountUp(target: number, duration = 1600) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    let raf = 0;
    const step = (t: number) => {
      if (start === null) start = t;
      const p = Math.min(1, (t - start) / duration);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v;
}

function Stat({ value, suffix = "", label }: { value: number; suffix?: string; label: string }) {
  const v = useCountUp(value);
  return (
    <div className="text-center">
      <div className="text-4xl md:text-5xl font-bold text-gradient">
        {v.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-muted-foreground mt-2">{label}</div>
    </div>
  );
}

const features = [
  { icon: Brain, title: "AI Theft Detection", desc: "Ensemble ML models flag fraudulent consumption patterns in real time." },
  { icon: Cpu, title: "Smart Meter Analytics", desc: "Continuous monitoring of meter telemetry across every DISCO zone." },
  { icon: ShieldAlert, title: "Fraud Prediction", desc: "Probability scoring with risk tiers — Normal, Suspicious, High-Risk." },
  { icon: Activity, title: "Real-time Monitoring", desc: "Live dashboards stream consumption, alerts and anomalies as they happen." },
  { icon: BarChart3, title: "Consumption Analysis", desc: "Behavioral profiling, peak-hour deviation and historical trend analysis." },
  { icon: Bell, title: "Alert System", desc: "Instant alerts to analysts when tampering or bypass behavior is detected." },
];

function Landing() {
  const navigate = useNavigate();

  async function openDashboard() {
    try {
      const role = await getSignedInAccountRole();
      navigate({ to: role === "admin" ? "/dashboard" : role === "utility_staff" ? "/my-activity" : "/login" });
    } catch {
      navigate({ to: "/login" });
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-50 glass">
        <div className="container mx-auto flex items-center justify-between px-4 h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="size-9 rounded-lg bg-gradient-accent grid place-items-center">
              <Zap className="size-5 text-white" />
            </div>
            <span className="font-bold text-sm md:text-base">ElectraGuard<span className="text-accent">.AI</span></span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#stats" className="hover:text-primary transition-colors">Impact</a>
            <a href="#about" className="hover:text-primary transition-colors">About</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login"><Button variant="ghost" size="sm">Login</Button></Link>
            <Button size="sm" className="bg-gradient-accent text-white border-0" onClick={openDashboard}>Dashboard</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-28 pb-24 overflow-hidden bg-gradient-hero text-white">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="container mx-auto px-4 relative grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs">
              <span className="size-2 rounded-full bg-accent pulse-ring" />
              Live AI monitoring across 7 Nigerian DISCOs
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Detecting <span className="text-gradient">Electrical Theft</span> in Nigeria Using Artificial Intelligence
            </h1>
            <p className="text-lg text-white/80 max-w-xl">
              An intelligent platform that monitors smart-meter telemetry, predicts fraudulent
              behavior and helps AEDC, EKEDC, KEDCO, PHED and other distribution companies
              recover billions in lost revenue.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/register">
                <Button size="lg" className="bg-gradient-accent text-white border-0 shadow-elegant">
                  Get Started <ArrowRight className="ml-1 size-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white" onClick={openDashboard}>
                View Dashboard
              </Button>
            </div>
          </div>

          {/* Illustration */}
          <div className="relative">
            <Card className="glass border-white/20 p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-success animate-pulse" />
                  <span className="text-xs">Live feed · Zone B / EKEDC</span>
                </div>
                <Brain className="size-5 text-accent" />
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { l: "Meters", v: "12,847" },
                  { l: "Alerts", v: "23" },
                  { l: "Acc.", v: "96.1%" },
                ].map((s) => (
                  <div key={s.l} className="rounded-lg bg-white/5 p-3 text-center">
                    <div className="text-xl font-bold">{s.v}</div>
                    <div className="text-[10px] uppercase text-white/60">{s.l}</div>
                  </div>
                ))}
              </div>
              <svg viewBox="0 0 300 100" className="w-full h-24">
                <defs>
                  <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.72 0.18 50)" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="oklch(0.72 0.18 50)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0,70 L30,55 L60,65 L90,40 L120,50 L150,30 L180,45 L210,20 L240,35 L270,18 L300,28 L300,100 L0,100 Z" fill="url(#g)" />
                <path d="M0,70 L30,55 L60,65 L90,40 L120,50 L150,30 L180,45 L210,20 L240,35 L270,18 L300,28" stroke="oklch(0.72 0.18 50)" strokeWidth="2" fill="none" />
              </svg>
              <div className="mt-4 space-y-2">
                {[
                  { c: "C1042", t: "Meter bypass suspected", lvl: "bg-destructive" },
                  { c: "C1023", t: "Peak-hour anomaly 03:14", lvl: "bg-warning" },
                ].map((a) => (
                  <div key={a.c} className="flex items-center gap-3 text-xs rounded-md bg-white/5 p-2">
                    <span className={`size-2 rounded-full ${a.lvl}`} />
                    <span className="font-mono">{a.c}</span>
                    <span className="text-white/70 truncate">{a.t}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">A complete intelligence layer for utilities</h2>
            <p className="text-muted-foreground mt-3">Everything needed to detect, predict and prevent revenue loss from electricity theft.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <Card key={f.title} className="p-6 bg-gradient-card border-border/60 hover:-translate-y-1 hover:shadow-elegant transition-all">
                <div className="size-11 rounded-lg bg-gradient-accent grid place-items-center mb-4">
                  <f.icon className="size-5 text-white" />
                </div>
                <h3 className="font-semibold text-lg">{f.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-20 bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          <Stat value={4200000000} label="₦ Revenue loss prevented" />
          <Stat value={1247} label="Fraud cases detected" />
          <Stat value={48230} label="Smart meters monitored" />
          <Stat value={96} suffix="%" label="Detection accuracy" />
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24">
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold">The electricity theft problem in Nigeria</h2>
            <p className="text-muted-foreground mt-4">
              Nigerian DISCOs lose an estimated <span className="text-foreground font-semibold">₦200+ billion</span> every
              year to meter bypass, illegal connections and tampering. Manual detection is slow,
              reactive and easily defeated.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Behavioral profiling of every customer",
                "Real-time anomaly scoring across 4 ML models",
                "Region-aware risk maps for targeted enforcement",
                "Auditable reports for regulators and management",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <CheckCircle2 className="size-5 text-success mt-0.5" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <Card className="p-6 bg-gradient-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2"><LineChart className="size-4 text-primary" /> System workflow</h3>
              <Database className="size-4 text-muted-foreground" />
            </div>
            <ol className="space-y-3">
              {[
                "Data Collection from smart meters",
                "Data Preprocessing & cleaning",
                "Feature Engineering",
                "Model Training",
                "Fraud Prediction",
                "Risk Classification",
                "Dashboard Monitoring",
                "Report Generation",
              ].map((s, i) => (
                <li key={s} className="flex items-center gap-3">
                  <span className="size-7 rounded-full bg-gradient-accent text-white text-xs font-bold grid place-items-center">{i + 1}</span>
                  <span className="text-sm">{s}</span>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4 py-12 grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2">
              <div className="size-9 rounded-lg bg-gradient-accent grid place-items-center">
                <Zap className="size-5 text-white" />
              </div>
              <span className="font-bold">ElectraGuard.AI</span>
            </div>
            <p className="text-sm text-secondary-foreground/70 mt-3">
              Detecting Electrical Theft in Nigeria Using Artificial Intelligence — a final year Computer Science project.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Project</h4>
            <ul className="space-y-2 text-sm text-secondary-foreground/70">
              <li>Developer: <span className="text-white">[Your Name]</span></li>
              <li>Department: Computer Science</li>
              <li>Year: 2025 / 2026</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Connect</h4>
            <div className="flex gap-3">
              <a href="#" aria-label="GitHub" className="size-9 rounded-md glass grid place-items-center hover:text-accent"><Github className="size-4" /></a>
              <a href="#" aria-label="Twitter" className="size-9 rounded-md glass grid place-items-center hover:text-accent"><Twitter className="size-4" /></a>
              <a href="#" aria-label="LinkedIn" className="size-9 rounded-md glass grid place-items-center hover:text-accent"><Linkedin className="size-4" /></a>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 py-4 text-center text-xs text-secondary-foreground/60">
          © {new Date().getFullYear()} ElectraGuard.AI · All rights reserved.
        </div>
      </footer>
    </div>
  );
}
