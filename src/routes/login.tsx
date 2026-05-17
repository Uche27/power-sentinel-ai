import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Zap } from "lucide-react";
import { useState } from "react";
import { setUser } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — ElectraGuard.AI" }] }),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@") || pwd.length < 4) {
      toast.error("Enter a valid email and a password of at least 4 characters.");
      return;
    }
    setUser({ name: email.split("@")[0], email, role: "Admin" });
    toast.success("Welcome back!");
    nav({ to: "/dashboard" });
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-hero text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <Link to="/" className="flex items-center gap-2 relative">
          <div className="size-9 rounded-lg bg-gradient-accent grid place-items-center"><Zap className="size-5" /></div>
          <span className="font-bold">ElectraGuard.AI</span>
        </Link>
        <div className="relative">
          <h2 className="text-3xl font-bold leading-snug">AI-powered electricity theft detection for Nigeria's DISCOs.</h2>
          <p className="text-white/70 mt-3 max-w-md">Sign in to monitor smart meters, review fraud predictions, and act on real-time alerts.</p>
        </div>
        <p className="text-xs text-white/50 relative">© ElectraGuard.AI · Final year CS project</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-8 bg-gradient-card shadow-elegant">
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
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox /> <span>Remember me</span>
              </label>
              <a href="#" className="text-primary hover:underline">Forgot password?</a>
            </div>
            <Button type="submit" className="w-full bg-gradient-accent text-white border-0">Sign in</Button>
          </form>

          <p className="text-sm text-center text-muted-foreground mt-6">
            Don't have an account? <Link to="/register" className="text-primary hover:underline">Register</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
