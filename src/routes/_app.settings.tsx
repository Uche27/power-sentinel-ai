import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { getUser } from "@/lib/auth";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — ElectraGuard.AI" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [threshold, setThreshold] = useState([70]);
  const [sensitivity, setSensitivity] = useState([60]);
  const [user, setU] = useState<{ name: string; email: string; role: string } | null>(null);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySms, setNotifySms] = useState(false);
  const [notifyPush, setNotifyPush] = useState(true);

  useEffect(() => { setU(getUser()); }, []);

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Configure AI thresholds, your profile and notification preferences.</p>
      </div>

      <Card className="p-5 bg-gradient-card">
        <h3 className="font-semibold mb-4">AI Detection</h3>
        <div className="space-y-5">
          <div>
            <div className="flex justify-between text-sm mb-2"><span>Fraud threshold</span><span className="font-semibold">{threshold[0]}%</span></div>
            <Slider value={threshold} onValueChange={setThreshold} min={50} max={95} />
            <p className="text-xs text-muted-foreground mt-1">Customers with fraud probability above this value are auto-flagged.</p>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2"><span>Anomaly sensitivity</span><span className="font-semibold">{sensitivity[0]}%</span></div>
            <Slider value={sensitivity} onValueChange={setSensitivity} min={10} max={100} />
          </div>
        </div>
      </Card>

      <Card className="p-5 bg-gradient-card">
        <h3 className="font-semibold mb-4">Profile</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label>Name</Label><Input defaultValue={user?.name ?? ""} /></div>
          <div className="space-y-1.5"><Label>Email</Label><Input defaultValue={user?.email ?? ""} /></div>
          <div className="space-y-1.5"><Label>Role</Label><Input defaultValue={user?.role ?? ""} disabled /></div>
          <div className="space-y-1.5"><Label>Phone</Label><Input placeholder="+234 ..." /></div>
        </div>
      </Card>

      <Card className="p-5 bg-gradient-card">
        <h3 className="font-semibold mb-4">Notifications</h3>
        <div className="space-y-3">
          {[
            { label: "Email alerts", state: notifyEmail, set: setNotifyEmail },
            { label: "SMS alerts", state: notifySms, set: setNotifySms },
            { label: "Push notifications", state: notifyPush, set: setNotifyPush },
          ].map((n) => (
            <div key={n.label} className="flex items-center justify-between rounded-md border p-3">
              <span className="text-sm font-medium">{n.label}</span>
              <Switch checked={n.state} onCheckedChange={n.set} />
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => toast.success("Settings saved")} className="bg-gradient-accent text-white border-0">Save changes</Button>
      </div>
    </div>
  );
}
