import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, FileSpreadsheet, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { generateCustomers } from "@/lib/mockData";

export const Route = createFileRoute("/_app/datasets")({
  head: () => ({ meta: [{ title: "Datasets — ElectraGuard.AI" }] }),
  component: Datasets,
});

const PREVIEW = generateCustomers(8);
const STEPS = ["Parsing CSV", "Removing duplicates", "Handling missing values", "Encoding labels", "Normalizing features", "Done"];

function Datasets() {
  const [uploaded, setUploaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);

  function simulateUpload() {
    setUploaded(true);
    setProgress(0); setStep(0);
    const id = setInterval(() => {
      setProgress((p) => {
        const n = Math.min(100, p + 8);
        setStep(Math.min(STEPS.length - 1, Math.floor((n / 100) * STEPS.length)));
        if (n >= 100) { clearInterval(id); toast.success("Dataset processed"); }
        return n;
      });
    }, 220);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Dataset Management</h1>
        <p className="text-sm text-muted-foreground">Upload, clean and preview electricity consumption datasets.</p>
      </div>

      <Card className="p-6 bg-gradient-card">
        <div className="border-2 border-dashed rounded-xl p-10 text-center">
          <div className="size-12 rounded-full bg-primary/10 text-primary grid place-items-center mx-auto mb-3">
            <Upload className="size-6" />
          </div>
          <p className="font-semibold">Drop a CSV file here or click to browse</p>
          <p className="text-xs text-muted-foreground mt-1">Supports up to 1,000,000 rows · UTF-8</p>
          <Button onClick={simulateUpload} className="mt-4 bg-gradient-accent text-white border-0">Upload Sample Dataset</Button>
        </div>

        {uploaded && (
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{STEPS[step]}</span>
              <span className="text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              {STEPS.map((s, i) => (
                <div key={s} className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 ${i <= step ? "text-success bg-success/10" : "text-muted-foreground bg-muted"}`}>
                  {i <= step ? <CheckCircle2 className="size-3.5" /> : <span className="size-3.5 rounded-full border" />}
                  {s}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      <Card className="p-5 bg-gradient-card">
        <div className="flex items-center gap-2 mb-3">
          <FileSpreadsheet className="size-4 text-primary" />
          <h3 className="font-semibold">Preview · processed records</h3>
        </div>
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead><TableHead>Meter</TableHead><TableHead>Location</TableHead>
                <TableHead className="text-right">Consumption</TableHead><TableHead className="text-right">Billing</TableHead><TableHead className="text-right">Risk</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PREVIEW.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.name}</TableCell>
                  <TableCell className="font-mono text-xs">{c.meter}</TableCell>
                  <TableCell>{c.location}</TableCell>
                  <TableCell className="text-right">{c.monthlyConsumption}</TableCell>
                  <TableCell className="text-right">₦{c.billing.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-semibold">{c.riskScore}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
