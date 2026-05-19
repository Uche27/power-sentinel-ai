import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, FileSpreadsheet, FileDown, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export const Route = createFileRoute("/_app/reports")({
  head: () => ({ meta: [{ title: "Reports — ElectraGuard.AI" }] }),
  component: Reports,
});

type ReportType = "suspicious" | "stats" | "models" | "summary";
type Format = "pdf" | "csv" | "xlsx";

const REPORTS: { key: ReportType; title: string; desc: string }[] = [
  { key: "suspicious", title: "Suspicious customer report", desc: "All suspicious activity reports logged by utility staff." },
  { key: "stats",      title: "Detection statistics",        desc: "Counts by severity, status and DISCO over the period." },
  { key: "models",     title: "AI model performance",        desc: "Accuracy, precision, recall and F1 of trained models." },
  { key: "summary",    title: "Full system summary",         desc: "Datasets, models, suspicious cases and inspections combined." },
];

interface GeneratedReport {
  id: string; title: string; report_type: string; format: string; size_bytes: number; created_at: string;
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

async function gather(type: ReportType) {
  const now = new Date().toLocaleString();
  if (type === "suspicious") {
    const { data } = await supabase.from("suspicious_reports")
      .select("customer_name,meter_no,location,disco,severity,status,description,created_at")
      .order("created_at", { ascending: false });
    return { rows: data ?? [], cols: ["customer_name","meter_no","location","disco","severity","status","description","created_at"], when: now };
  }
  if (type === "models") {
    const { data } = await supabase.from("trained_models")
      .select("name,algorithm,accuracy,precision,recall,f1,training_time,created_at")
      .order("accuracy", { ascending: false });
    return { rows: data ?? [], cols: ["name","algorithm","accuracy","precision","recall","f1","training_time","created_at"], when: now };
  }
  if (type === "stats") {
    const { data } = await supabase.from("suspicious_reports").select("severity,status,disco");
    const rows = data ?? [];
    const stats = {
      total: rows.length,
      high: rows.filter((r) => r.severity === "high").length,
      medium: rows.filter((r) => r.severity === "medium").length,
      low: rows.filter((r) => r.severity === "low").length,
      pending: rows.filter((r) => r.status === "pending").length,
      resolved: rows.filter((r) => r.status === "resolved").length,
    };
    return {
      rows: Object.entries(stats).map(([metric, value]) => ({ metric, value })),
      cols: ["metric","value"], when: now,
    };
  }
  // summary
  const [{ count: ds }, { count: md }, { count: sr }, { count: fi }] = await Promise.all([
    supabase.from("datasets").select("*", { count: "exact", head: true }),
    supabase.from("trained_models").select("*", { count: "exact", head: true }),
    supabase.from("suspicious_reports").select("*", { count: "exact", head: true }),
    supabase.from("field_inspections").select("*", { count: "exact", head: true }),
  ]);
  return {
    rows: [
      { metric: "Datasets uploaded", value: ds ?? 0 },
      { metric: "Trained models", value: md ?? 0 },
      { metric: "Suspicious reports", value: sr ?? 0 },
      { metric: "Field inspections", value: fi ?? 0 },
    ],
    cols: ["metric", "value"], when: now,
  };
}

function Reports() {
  const { user } = useCurrentUser();
  const [history, setHistory] = useState<GeneratedReport[]>([]);

  useEffect(() => { void loadHistory(); }, []);

  async function loadHistory() {
    const { data } = await supabase.from("generated_reports")
      .select("id,title,report_type,format,size_bytes,created_at")
      .order("created_at", { ascending: false });
    setHistory((data ?? []) as GeneratedReport[]);
  }

  async function logHistory(title: string, type: string, format: Format, size: number) {
    if (!user) return;
    await supabase.from("generated_reports").insert({
      title, report_type: type, format, size_bytes: size, generated_by: user.id,
    });
    void loadHistory();
  }

  async function generate(type: ReportType, format: Format) {
    const meta = REPORTS.find((r) => r.key === type)!;
    try {
      const { rows, cols, when } = await gather(type);
      if (!rows.length) { toast.error("No data available for this report."); return; }
      const filename = `${type}-report-${Date.now()}.${format}`;
      let blob: Blob;

      if (format === "csv") {
        const header = cols.join(",");
        const body = rows.map((r) => cols.map((c) => JSON.stringify((r as Record<string, unknown>)[c] ?? "")).join(",")).join("\n");
        blob = new Blob([`# ${meta.title}\n# Generated: ${when}\n${header}\n${body}`], { type: "text/csv" });
      } else if (format === "xlsx") {
        const ws = XLSX.utils.json_to_sheet(rows as Record<string, unknown>[]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Report");
        const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });
        blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      } else {
        const doc = new jsPDF();
        doc.setFontSize(16); doc.text("ElectraGuard.AI", 14, 18);
        doc.setFontSize(13); doc.text(meta.title, 14, 28);
        doc.setFontSize(9); doc.setTextColor(100); doc.text(`Generated: ${when}`, 14, 34);
        doc.setTextColor(0);
        autoTable(doc, {
          head: [cols],
          body: rows.map((r) => cols.map((c) => String((r as Record<string, unknown>)[c] ?? ""))),
          startY: 40, styles: { fontSize: 8 }, headStyles: { fillColor: [37, 99, 235] },
        });
        blob = doc.output("blob");
      }

      download(blob, filename);
      await logHistory(meta.title, type, format, blob.size);
      toast.success(`${meta.title} (${format.toUpperCase()}) downloaded.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Report generation failed");
    }
  }

  async function removeHistory(id: string) {
    await supabase.from("generated_reports").delete().eq("id", id);
    void loadHistory();
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-sm text-muted-foreground">Generate and export auditable reports for management and regulators.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {REPORTS.map((r) => (
          <Card key={r.key} className="p-5">
            <FileText className="size-6 text-primary mb-3" />
            <h3 className="font-semibold">{r.title}</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">{r.desc}</p>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" onClick={() => generate(r.key, "pdf")}><FileDown className="size-3.5 mr-1" />PDF</Button>
              <Button size="sm" variant="outline" onClick={() => generate(r.key, "csv")}><FileSpreadsheet className="size-3.5 mr-1" />CSV</Button>
              <Button size="sm" variant="outline" onClick={() => generate(r.key, "xlsx")}><FileSpreadsheet className="size-3.5 mr-1" />Excel</Button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <h3 className="font-semibold mb-3">Report history</h3>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No reports generated yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead className="text-right">Size</TableHead>
                  <TableHead>Generated</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell>{h.title}</TableCell>
                    <TableCell className="uppercase text-xs">{h.format}</TableCell>
                    <TableCell className="text-right">{(h.size_bytes / 1024).toFixed(1)} KB</TableCell>
                    <TableCell className="text-xs">{new Date(h.created_at).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => removeHistory(h.id)}><Trash2 className="size-3.5 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
