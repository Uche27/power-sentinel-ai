import { createFileRoute, Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter, SidebarTrigger, SidebarInset,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard, Activity, Users, Database, Cpu, BarChart3, FileText,
  Bell, Settings, LogOut, Zap, Moon, Sun, MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import { clearUser, getUser } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/monitoring", label: "AI Monitoring", icon: Activity },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/datasets", label: "Datasets", icon: Database },
  { to: "/ml", label: "ML Module", icon: Cpu },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/alerts", label: "Alerts", icon: Bell },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function AppSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const nav = useNavigate();

  function logout() {
    clearUser();
    toast.success("Signed out");
    nav({ to: "/" });
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2 px-2 py-1">
          <div className="size-8 rounded-lg bg-gradient-accent grid place-items-center shrink-0">
            <Zap className="size-4 text-white" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <div className="text-sm font-bold leading-tight">ElectraGuard</div>
            <div className="text-[10px] text-sidebar-foreground/60">AI Theft Detection</div>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton asChild isActive={pathname === item.to} tooltip={item.label}>
                    <Link to={item.to}>
                      <item.icon className="size-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout} tooltip="Sign out">
              <LogOut className="size-4" />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([
    { from: "bot", text: "Hi! I'm ElectraBot. Ask me about fraud detection, models or any zone." },
  ]);
  const [text, setText] = useState("");

  function send() {
    if (!text.trim()) return;
    const q = text;
    setMsgs((m) => [...m, { from: "user", text: q }]);
    setText("");
    setTimeout(() => {
      const reply =
        /accuracy|model/i.test(q) ? "Our best model is the Neural Network at 96.1% accuracy."
        : /zone|region/i.test(q) ? "Lagos currently leads with 312 detected cases this month."
        : /how|work/i.test(q) ? "We score every meter on consumption variance, sudden drops and peak-hour anomalies."
        : "Got it — review the AI Monitoring page for live insights.";
      setMsgs((m) => [...m, { from: "bot", text: reply }]);
    }, 600);
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-50 size-14 rounded-full bg-gradient-accent grid place-items-center text-white shadow-elegant glow-primary"
        aria-label="Open chatbot"
      >
        <MessageCircle className="size-6" />
      </button>
      {open && (
        <div className="fixed bottom-24 right-5 z-50 w-80 rounded-xl glass shadow-elegant overflow-hidden flex flex-col">
          <div className="p-3 bg-gradient-accent text-white text-sm font-semibold">ElectraBot · AI Assistant</div>
          <div className="flex-1 max-h-72 overflow-auto p-3 space-y-2 bg-card">
            {msgs.map((m, i) => (
              <div key={i} className={`text-sm rounded-lg px-3 py-2 max-w-[85%] ${m.from === "bot" ? "bg-muted" : "bg-primary text-primary-foreground ml-auto"}`}>
                {m.text}
              </div>
            ))}
          </div>
          <form
            className="p-2 flex gap-2 bg-card border-t"
            onSubmit={(e) => { e.preventDefault(); send(); }}
          >
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button type="submit" size="sm" className="bg-gradient-accent text-white border-0">Send</Button>
          </form>
        </div>
      )}
    </>
  );
}

function AppLayout() {
  const nav = useNavigate();
  const [dark, setDark] = useState(false);
  const [user, setU] = useState<{ name: string; email: string; role: string } | null>(null);

  useEffect(() => {
    const u = getUser();
    if (!u) {
      toast.info("Please sign in first.");
      nav({ to: "/login" });
      return;
    }
    setU(u);
  }, [nav]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  if (!user) return null;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b bg-background/70 backdrop-blur px-4">
          <SidebarTrigger />
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => setDark((d) => !d)}
              className="size-9 rounded-md border grid place-items-center hover:bg-muted"
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
            <div className="flex items-center gap-2 text-sm">
              <div className="size-8 rounded-full bg-gradient-accent text-white grid place-items-center text-xs font-bold">
                {user.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="hidden sm:block leading-tight">
                <div className="font-medium">{user.name}</div>
                <div className="text-[10px] text-muted-foreground">{user.role}</div>
              </div>
            </div>
          </div>
        </header>
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
        <ChatbotWidget />
        <Toaster richColors position="top-right" />
      </SidebarInset>
    </SidebarProvider>
  );
}
