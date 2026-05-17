import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { modelPerformance, trainingCurve } from "@/lib/mockData";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { Cpu, Trophy, Play } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/ml")({
  head: () => ({ meta: [{ title: "ML Module — ElectraGuard.AI" }] }),
  component: ML,
});

const CONFUSION = [
  [842, 31],
  [24, 803],
];

function ML() {
  const [model, setModel] = useState("Neural Network");
  const [split, setSplit] = useState([80]);
  const [epochs, setEpochs] = useState([20]);
  const [lr, setLr] = useState([0.01]);
  const best = [...modelPerformance].sort((a, b) => b.accuracy - a.accuracy)[0];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Machine Learning Module</h1>
        <p className="text-sm text-muted-foreground">Train, evaluate and compare fraud detection models.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-5 bg-gradient-card space-y-4">
          <div className="flex items-center gap-2"><Cpu className="size-4 text-primary" /><h3 className="font-semibold">Training Configuration</h3></div>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Model</label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Decision Tree">Decision Tree</SelectItem>
                <SelectItem value="Random Forest">Random Forest</SelectItem>
                <SelectItem value="Neural Network">Artificial Neural Network</SelectItem>
                <SelectItem value="SVM">Support Vector Machine</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1"><span>Train/Test split</span><span>{split[0]}/{100 - split[0]}</span></div>
            <Slider value={split} onValueChange={setSplit} min={50} max={90} step={5} />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1"><span>Epochs</span><span>{epochs[0]}</span></div>
            <Slider value={epochs} onValueChange={setEpochs} min={5} max={50} step={1} />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1"><span>Learning rate</span><span>{lr[0]}</span></div>
            <Slider value={lr} onValueChange={setLr} min={0.001} max={0.1} step={0.001} />
          </div>
          <Button onClick={() => toast.success(`${model} training started`)} className="w-full bg-gradient-accent text-white border-0">
            <Play className="size-4 mr-1" /> Start training
          </Button>
        </Card>

        <Card className="p-5 bg-gradient-card lg:col-span-2">
          <h3 className="font-semibold mb-3">Training visualization</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trainingCurve}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="epoch" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Legend />
              <Line type="monotone" dataKey="accuracy" stroke="oklch(0.66 0.17 155)" strokeWidth={2.5} />
              <Line type="monotone" dataKey="loss" stroke="oklch(0.6 0.24 27)" strokeWidth={2.5} />
            </LineChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-4 gap-3 mt-3">
            {[
              { l: "Accuracy", v: "96.1%" },
              { l: "Precision", v: "95.0%" },
              { l: "Recall", v: "96.0%" },
              { l: "F1-score", v: "95.5%" },
            ].map((m) => (
              <div key={m.l} className="rounded-lg bg-muted p-3 text-center">
                <div className="text-lg font-bold">{m.v}</div>
                <div className="text-[10px] uppercase text-muted-foreground">{m.l}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-5 bg-gradient-card">
          <h3 className="font-semibold mb-3">Confusion matrix</h3>
          <div className="grid grid-cols-2 gap-2">
            {CONFUSION.flat().map((v, i) => {
              const isDiag = i === 0 || i === 3;
              return (
                <div key={i} className={`rounded-lg p-6 text-center ${isDiag ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive"}`}>
                  <div className="text-2xl font-bold">{v}</div>
                  <div className="text-[10px] uppercase">{["TN", "FP", "FN", "TP"][i]}</div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-5 bg-gradient-card lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Model comparison</h3>
            <Badge className="bg-accent text-accent-foreground"><Trophy className="size-3 mr-1" /> Best: {best.model}</Badge>
          </div>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model</TableHead>
                  <TableHead className="text-right">Accuracy</TableHead>
                  <TableHead className="text-right">Precision</TableHead>
                  <TableHead className="text-right">Recall</TableHead>
                  <TableHead className="text-right">F1</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {modelPerformance.map((m) => (
                  <TableRow key={m.model} className={m.model === best.model ? "bg-success/5" : ""}>
                    <TableCell className="font-medium">{m.model} {m.model === best.model && "🏆"}</TableCell>
                    <TableCell className="text-right">{(m.accuracy * 100).toFixed(1)}%</TableCell>
                    <TableCell className="text-right">{(m.precision * 100).toFixed(1)}%</TableCell>
                    <TableCell className="text-right">{(m.recall * 100).toFixed(1)}%</TableCell>
                    <TableCell className="text-right">{(m.f1 * 100).toFixed(1)}%</TableCell>
                    <TableCell className="text-right">{m.time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
