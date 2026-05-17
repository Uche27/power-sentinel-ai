import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, FileSpreadsheet, FileDown } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/reports")({
  head: () => ({ meta: [{ title: "Reports — ElectraGuard.AI" }] }),
  component: Reports,
});

const REPORTS = [
  { title: "Fraud detection report", desc: "All flagged customers, evidence and predictions for the period.", color: "destructive" },
  { title: "Monthly analytics", desc: "Consumption, anomalies and regional trends.", color: "primary" },
  { title: "Customer risk report", desc: "Per-customer AI risk scoring with recommendations.", color: "accent" },
  { title: "Revenue loss estimation", desc: "Projected loss prevented vs lost across DISCOs.", color: "warning" },
  { title: "AI model performance", desc: "Accuracy, precision, recall, F1 of deployed models.", color: "success" },
];

function download(format: string, name: string) {
  toast.success(`${name} (${format.toUpperCase()}) downloaded`);
}

function Reports() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-sm text-muted-foreground">Generate and export auditable reports for management and regulators.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {REPORTS.map((r) => (
          <Card key={r.title} className="p-5 bg-gradient-card hover:shadow-elegant transition-all">
            <FileText className="size-6 text-primary mb-3" />
            <h3 className="font-semibold">{r.title}</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">{r.desc}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => download("pdf", r.title)}><FileDown className="size-3.5 mr-1" />PDF</Button>
              <Button size="sm" variant="outline" onClick={() => download("csv", r.title)}><FileSpreadsheet className="size-3.5 mr-1" />CSV</Button>
              <Button size="sm" variant="outline" onClick={() => download("xlsx", r.title)}><FileSpreadsheet className="size-3.5 mr-1" />Excel</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
