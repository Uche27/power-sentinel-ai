import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Zap, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { registerAccount } from "@/lib/account.functions";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Register — ElectraGuard.AI" }] }),
  component: RegisterPage,
});

type Role = "admin" | "utility_staff";

function RegisterPage() {
  const nav = useNavigate();
  const createAccount = useServerFn(registerAccount);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "utility_staff" as Role,
    pwd: "",
    confirm: "",
  });

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.includes("@") || form.pwd.length < 8) {
      toast.error("Fill all fields. Password must be at least 8 characters.");
      return;
    }
    if (form.pwd !== form.confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await createAccount({
        data: {
          fullName: form.name,
          email: form.email,
          phone: form.phone,
          role: form.role,
          password: form.pwd,
        },
      });
      toast.success("Account created. You can sign in now.");
      nav({ to: "/login" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Account could not be created.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-secondary text-secondary-foreground">
        <Link to="/" className="flex items-center gap-2">
          <div className="size-9 rounded-lg bg-primary grid place-items-center">
            <Zap className="size-5 text-primary-foreground" />
          </div>
          <span className="font-bold">ElectraGuard.AI</span>
        </Link>
        <div>
          <h2 className="text-3xl font-bold leading-snug">
            Join the fight against electricity theft.
          </h2>
          <p className="opacity-70 mt-3 max-w-md">
            Role-based access to AI dashboards, fraud reports and live alerts across Nigerian
            DISCOs.
          </p>
        </div>
        <p className="text-xs opacity-50">© ElectraGuard.AI</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-8">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-muted-foreground mt-1">Register to access the platform</p>
          <form onSubmit={onSubmit} className="mt-6 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="user@disco.ng"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="+234 80 ..."
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Account type</Label>
              <Select value={form.role} onValueChange={(v) => update("role", v as Role)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="utility_staff">Utility Staff</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                Admins manage datasets, ML models and reports. Utility Staff submit field reports
                and inspections.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="pwd">Password</Label>
                <Input
                  id="pwd"
                  type="password"
                  minLength={8}
                  value={form.pwd}
                  onChange={(e) => update("pwd", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm">Confirm</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={form.confirm}
                  onChange={(e) => update("confirm", e.target.value)}
                />
              </div>
            </div>
            <Button type="submit" disabled={busy} className="w-full mt-2">
              {busy && <Loader2 className="size-4 mr-1 animate-spin" />} Create account
            </Button>
          </form>
          <p className="text-sm text-center text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
