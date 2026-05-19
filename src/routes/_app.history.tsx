import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_app/history")({
  head: () => ({ meta: [{ title: "History — ElectraGuard.AI" }] }),
  component: HistoryPage,
});

function HistoryPage() {
  const { user } = useCurrentUser();
  const [reports, setReports] = useState<Array<{ id: string; customer_name: string; meter_no: string; severity: string; status: string; created_at: string }>>([]);
  const [inspections, setInspections] = useState<Array<{ id: string; customer_name: string; meter_no: string; outcome: string; created_at: string }>>([]);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      const [r, i] = await Promise.all([
        supabase.from("suspicious_reports").select("id,customer_name,meter_no,severity,status,created_at").eq("reported_by", user.id).order("created_at", { ascending: false }),
        supabase.from("field_inspections").select("id,customer_name,meter_no,outcome,created_at").eq("inspector_id", user.id).order("created_at", { ascending: false }),
      ]);
      setReports(r.data ?? []);
      setInspections(i.data ?? []);
    })();
  }, [user]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">My history</h1>
        <p className="text-sm text-muted-foreground">All your submitted reports and inspections.</p>
      </div>

      <Tabs defaultValue="reports">
        <TabsList>
          <TabsTrigger value="reports">Suspicious reports ({reports.length})</TabsTrigger>
          <TabsTrigger value="inspections">Inspections ({inspections.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="reports">
          <Card className="p-5">
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Customer</TableHead><TableHead>Meter</TableHead><TableHead>Severity</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.customer_name}</TableCell>
                      <TableCell className="font-mono text-xs">{r.meter_no}</TableCell>
                      <TableCell><Badge variant={r.severity === "high" ? "destructive" : "secondary"}>{r.severity}</Badge></TableCell>
                      <TableCell><Badge variant={r.status === "resolved" ? "default" : "outline"}>{r.status}</Badge></TableCell>
                      <TableCell className="text-xs">{new Date(r.created_at).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
        <TabsContent value="inspections">
          <Card className="p-5">
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Customer</TableHead><TableHead>Meter</TableHead><TableHead>Outcome</TableHead><TableHead>Date</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {inspections.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.customer_name}</TableCell>
                      <TableCell className="font-mono text-xs">{r.meter_no}</TableCell>
                      <TableCell><Badge variant={r.outcome === "resolved" ? "default" : "secondary"}>{r.outcome}</Badge></TableCell>
                      <TableCell className="text-xs">{new Date(r.created_at).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
