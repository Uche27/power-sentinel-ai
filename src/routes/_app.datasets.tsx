import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, FileSpreadsheet, CheckCircle2, Trash2, Eye } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-current-user";
import * as XLSX from "xlsx";

export const Route = createFileRoute("/_app/datasets")({
  head: () => ({ meta: [{ title: "Datasets — ElectraGuard.AI" }] }),
  component: Datasets,
});

interface DatasetRow {
  id: string;
  name: string;
  file_path: string | null;
  rows_count: number;
  columns_count: number;
  size_bytes: number;
  columns: string[];
  created_at: string;
}

const STEPS = ["Parsing file", "Validating headers", "Removing empty rows", "Uploading", "Storing preview", "Done"];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

function Datasets() {
  const { user } = useCurrentUser();
  const [datasets, setDatasets] = useState<DatasetRow[]>([]);
  const [preview, setPreview] = useState<{ name: string; rows: Record<string, unknown>[] } | null>(null);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { void refresh(); }, []);

  async function refresh() {
    const { data, error } = await supabase
      .from("datasets")
      .select("id,name,file_path,rows_count,columns_count,size_bytes,columns,created_at")
      .order("created_at", { ascending: false });
    if (error) { toast.error(error.message); return; }
    setDatasets((data ?? []) as unknown as DatasetRow[]);
  }

  async function onFile(file: File) {
    if (!user) return;
    if (file.size > MAX_BYTES) { toast.error("File too large (max 10 MB)."); return; }
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !["csv", "xlsx", "xls"].includes(ext)) {
      toast.error("Only CSV or Excel files (.csv, .xlsx, .xls) are accepted.");
      return;
    }
    setBusy(true); setProgress(5); setStep(0);

    try {
      const buf = await file.arrayBuffer();
      setProgress(20); setStep(1);
      const wb = XLSX.read(buf, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null });
      if (!json.length) throw new Error("File is empty.");
      const columns = Object.keys(json[0]);
      if (columns.length < 2) throw new Error("Dataset must have at least 2 columns.");

      setProgress(40); setStep(2);
      const clean = json.filter((r) => Object.values(r).some((v) => v !== null && v !== ""));

      setProgress(60); setStep(3);
      const filePath = `${user.id}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("datasets").upload(filePath, file);
      if (upErr) throw upErr;

      setProgress(80); setStep(4);
      const { data: inserted, error: insErr } = await supabase
        .from("datasets")
        .insert({
          name: file.name,
          file_path: filePath,
          rows_count: clean.length,
          columns_count: columns.length,
          size_bytes: file.size,
          columns,
          uploaded_by: user.id,
        })
        .select("id")
        .single();
      if (insErr) throw insErr;

      const previewRows = clean.slice(0, 100).map((data, row_index) => ({
        dataset_id: inserted.id,
        row_index,
        data,
      }));
      if (previewRows.length) {
        const { error: rowErr } = await supabase.from("dataset_rows").insert(previewRows);
        if (rowErr) throw rowErr;
      }

      setProgress(100); setStep(5);
      toast.success(`${file.name} uploaded — ${clean.length} rows, ${columns.length} columns.`);
      setPreview({ name: file.name, rows: clean.slice(0, 25) });
      await refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      toast.error(msg);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function viewPreview(ds: DatasetRow) {
    const { data } = await supabase
      .from("dataset_rows")
      .select("data")
      .eq("dataset_id", ds.id)
      .order("row_index")
      .limit(25);
    setPreview({ name: ds.name, rows: (data ?? []).map((r) => r.data as Record<string, unknown>) });
  }

  async function remove(ds: DatasetRow) {
    if (!confirm(`Delete dataset "${ds.name}"?`)) return;
    if (ds.file_path) await supabase.storage.from("datasets").remove([ds.file_path]);
    const { error } = await supabase.from("datasets").delete().eq("id", ds.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Dataset removed.");
    if (preview?.name === ds.name) setPreview(null);
    void refresh();
  }

  const cols = preview?.rows[0] ? Object.keys(preview.rows[0]) : [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Dataset Management</h1>
        <p className="text-sm text-muted-foreground">Upload, validate and preview electricity consumption datasets for model training.</p>
      </div>

      <Card className="p-6">
        <div
          className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer hover:bg-muted/40 transition-colors"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) void onFile(f); }}
        >
          <div className="size-12 rounded-full bg-primary/10 text-primary grid place-items-center mx-auto mb-3">
            <Upload className="size-6" />
          </div>
          <p className="font-semibold">Drop a CSV or Excel file here, or click to browse</p>
          <p className="text-xs text-muted-foreground mt-1">Up to 10 MB · .csv, .xlsx, .xls</p>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) void onFile(f); }}
          />
        </div>

        {busy && (
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

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <FileSpreadsheet className="size-4 text-primary" />
          <h3 className="font-semibold">Uploaded datasets</h3>
          <span className="ml-auto text-xs text-muted-foreground">{datasets.length} total</span>
        </div>
        {datasets.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No datasets uploaded yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Rows</TableHead>
                  <TableHead className="text-right">Columns</TableHead>
                  <TableHead className="text-right">Size</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {datasets.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell className="text-right">{d.rows_count.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{d.columns_count}</TableCell>
                    <TableCell className="text-right">{(d.size_bytes / 1024).toFixed(1)} KB</TableCell>
                    <TableCell className="text-xs">{new Date(d.created_at).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => viewPreview(d)}><Eye className="size-3.5" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => remove(d)}><Trash2 className="size-3.5 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {preview && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Preview · {preview.name}</h3>
            <Button variant="ghost" size="sm" onClick={() => setPreview(null)}>Close</Button>
          </div>
          <div className="overflow-x-auto rounded-lg border max-h-96">
            <Table>
              <TableHeader>
                <TableRow>{cols.map((c) => <TableHead key={c}>{c}</TableHead>)}</TableRow>
              </TableHeader>
              <TableBody>
                {preview.rows.map((r, i) => (
                  <TableRow key={i}>
                    {cols.map((c) => <TableCell key={c} className="text-xs">{String(r[c] ?? "")}</TableCell>)}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
}
