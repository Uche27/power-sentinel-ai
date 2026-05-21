import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff, Zap, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateCurrentAccount } from "@/lib/account.functions";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — ElectraGuard.AI" }] }),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const loadAccount = useServerFn(getOrCreateCurrentAccount);
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@") || pwd.length < 6) {
      toast.error("Enter a valid email and a password (min 6 chars).");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pwd });
    if (error) {
      setBusy(false);
      toast.error(error.message);
      return;
    }
    try {
      const account = await loadAccount();
      toast.success("Welcome back!");
      nav({ to: account.role === "admin" ? "/dashboard" : "/my-activity" });
    } catch (accountError) {
      await supabase.auth.signOut();
      toast.error(accountError instanceof Error ? accountError.message : "Unable to load your account access.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-secondary text-secondary-foreground relative">
        <Link to="/" className="flex items-center gap-2">
          <div className="size-9 rounded-lg bg-primary grid place-items-center"><Zap className="size-5 text-primary-foreground" /></div>
          <span className="font-bold">ElectraGuard.AI</span>
        </Link>
        <div>
          <h2 className="text-3xl font-bold leading-snug">AI-powered electricity theft detection for Nigeria's DISCOs.</h2>
          <p className="opacity-70 mt-3 max-w-md">Sign in to monitor smart meters, review fraud predictions, and act on real-time alerts.</p>
        </div>
        <p className="text-xs opacity-50">© ElectraGuard.AI · Final year CS project</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-8">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to your ElectraGuard account</p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="analyst@aedc.ng" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pwd">Password</Label>
              <div className="relative">
                <Input id="pwd" type={show ? "text" : "password"} placeholder="••••••••" value={pwd} onChange={(e) => setPwd(e.target.value)} required />
                <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" disabled={busy} className="w-full">
              {busy && <Loader2 className="size-4 mr-1 animate-spin" />} Sign in
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground mt-6">
            Don't have an account? <Link to="/register" className="text-primary hover:underline">Register</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
