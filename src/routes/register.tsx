import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap } from "lucide-react";
import { useState } from "react";
import { setUser, type User } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Register — ElectraGuard.AI" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", phone: "", role: "Analyst" as User["role"], pwd: "", confirm: "",
  });

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email.includes("@") || form.pwd.length < 6) {
      toast.error("Fill in all fields. Password must be at least 6 characters.");
      return;
    }
    if (form.pwd !== form.confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setUser({ name: form.name, email: form.email, role: form.role });
    toast.success("Account created. Welcome to ElectraGuard.AI!");
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
          <h2 className="text-3xl font-bold leading-snug">Join the fight against electricity theft.</h2>
          <p className="text-white/70 mt-3 max-w-md">Get role-based access to AI dashboards, fraud reports and live alerts across Nigerian DISCOs.</p>
        </div>
        <p className="text-xs text-white/50 relative">© ElectraGuard.AI</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-8 bg-gradient-card shadow-elegant">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-muted-foreground mt-1">Register to access the platform</p>
          <form onSubmit={onSubmit} className="mt-6 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Chinedu Okafor" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="user@disco.ng" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+234 80 ..." />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => update("role", v as User["role"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Analyst">Analyst</SelectItem>
                  <SelectItem value="Utility Staff">Utility Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="pwd">Password</Label>
                <Input id="pwd" type="password" value={form.pwd} onChange={(e) => update("pwd", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm">Confirm</Label>
                <Input id="confirm" type="password" value={form.confirm} onChange={(e) => update("confirm", e.target.value)} />
              </div>
            </div>
            <Button type="submit" className="w-full bg-gradient-accent text-white border-0 mt-2">Create account</Button>
          </form>
          <p className="text-sm text-center text-muted-foreground mt-6">
            Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
