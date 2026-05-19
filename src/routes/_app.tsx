import { createFileRoute, Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter, SidebarTrigger, SidebarInset,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard, Activity, Users, Database, Cpu, BarChart3, FileText,
  Bell, Settings, LogOut, Zap, Moon, Sun, MessageCircle, AlertOctagon, ClipboardList, History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import { signOut } from "@/lib/auth";
import { toast } from "sonner";
import { useCurrentUser, type AppRole } from "@/hooks/use-current-user";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

const ADMIN_NAV = [
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

const STAFF_NAV = [
  { to: "/my-activity", label: "My Dashboard", icon: LayoutDashboard },
  { to: "/report-suspicious", label: "Report Activity", icon: AlertOctagon },
  { to: "/inspections", label: "Field Inspections", icon: ClipboardList },
  { to: "/history", label: "History", icon: History },
] as const;

function AppSidebar({ role }: { role: AppRole }) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const nav = useNavigate();
  const items = role === "admin" ? ADMIN_NAV : STAFF_NAV;

  async function logout() {
    await signOut();
    toast.success("Signed out");
    nav({ to: "/" });
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2 px-2 py-1">
          <div className="size-8 rounded-lg bg-primary grid place-items-center shrink-0">
            <Zap className="size-4 text-primary-foreground" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <div className="text-sm font-bold leading-tight">ElectraGuard</div>
            <div className="text-[10px] text-sidebar-foreground/60">{role === "admin" ? "Admin Console" : "Field Operations"}</div>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
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
    { from: "bot", text: "Hi! I'm ElectraBot. Ask me about fraud detection or any region." },
  ]);
  const [text, setText] = useState("");

  function send() {
    if (!text.trim()) return;
    const q = text;
    setMsgs((m) => [...m, { from: "user", text: q }]);
    setText("");
    setTimeout(() => {
      const reply =
        /accuracy|model/i.test(q) ? "Our best model is the Neural Network at ~96% accuracy."
        : /zone|region/i.test(q) ? "Lagos currently leads in detected suspicious cases this month."
        : /how|work/i.test(q) ? "We score meters on consumption variance, sudden drops and peak-hour anomalies."
        : "Got it — review the AI Monitoring page for live insights.";
      setMsgs((m) => [...m, { from: "bot", text: reply }]);
    }, 600);
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-50 size-14 rounded-full bg-primary grid place-items-center text-primary-foreground shadow-elegant"
        aria-label="Open chatbot"
      >
        <MessageCircle className="size-6" />
      </button>
      {open && (
        <div className="fixed bottom-24 right-5 z-50 w-80 rounded-xl bg-card border shadow-elegant overflow-hidden flex flex-col">
          <div className="p-3 bg-primary text-primary-foreground text-sm font-semibold">ElectraBot · AI Assistant</div>
          <div className="flex-1 max-h-72 overflow-auto p-3 space-y-2 bg-card">
            {msgs.map((m, i) => (
              <div key={i} className={`text-sm rounded-lg px-3 py-2 max-w-[85%] ${m.from === "bot" ? "bg-muted" : "bg-primary text-primary-foreground ml-auto"}`}>
                {m.text}
              </div>
            ))}
          </div>
          <form className="p-2 flex gap-2 bg-card border-t" onSubmit={(e) => { e.preventDefault(); send(); }}>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button type="submit" size="sm">Send</Button>
          </form>
        </div>
      )}
    </>
  );
}

function AppLayout() {
  const nav = useNavigate();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const [dark, setDark] = useState(false);
  const { user, role, profile, loading } = useCurrentUser();

  useEffect(() => {
    if (!loading && !user) {
      toast.info("Please sign in first.");
      nav({ to: "/login" });
    }
  }, [loading, user, nav]);

  // RBAC: gate admin-only routes
  useEffect(() => {
    if (!role) return;
    const adminOnly = ["/dashboard","/monitoring","/customers","/datasets","/ml","/analytics","/reports","/alerts","/settings"];
    const staffOnly = ["/my-activity","/report-suspicious","/inspections","/history"];
    if (role === "utility_staff" && adminOnly.includes(pathname)) {
      toast.error("Access restricted to administrators.");
      nav({ to: "/my-activity" });
    }
    if (role === "admin" && staffOnly.includes(pathname)) {
      nav({ to: "/dashboard" });
    }
  }, [role, pathname, nav]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  if (loading || !user || !role) {
    return (
      <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">
        Loading workspace…
      </div>
    );
  }

  const displayName = profile?.full_name ?? user.email ?? "User";

  return (
    <SidebarProvider>
      <AppSidebar role={role} />
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
              <div className="size-8 rounded-full bg-primary text-primary-foreground grid place-items-center text-xs font-bold">
                {displayName.slice(0, 1).toUpperCase()}
              </div>
              <div className="hidden sm:block leading-tight">
                <div className="font-medium">{displayName}</div>
                <div className="text-[10px] text-muted-foreground capitalize">{role.replace("_", " ")}</div>
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
