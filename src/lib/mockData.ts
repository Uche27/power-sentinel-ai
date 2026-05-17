export type RiskLevel = "normal" | "suspicious" | "high";

export interface Customer {
  id: string;
  name: string;
  meter: string;
  location: string;
  disco: string;
  monthlyConsumption: number;
  billing: number;
  fraudProb: number;
  riskScore: number;
  status: RiskLevel;
}

const FIRST = ["Adaeze", "Chinedu", "Aisha", "Tunde", "Ngozi", "Bola", "Yusuf", "Funke", "Emeka", "Hauwa", "Segun", "Ifeoma", "Kemi", "Musa", "Obinna", "Zainab", "Femi", "Amina", "Uche", "Sade"];
const LAST = ["Okafor", "Adeyemi", "Bello", "Eze", "Olawale", "Ibrahim", "Nwankwo", "Mohammed", "Akpan", "Lawal", "Ojo", "Suleiman", "Onyeka", "Balogun", "Abubakar"];
const LOCS = [
  { city: "Abuja", disco: "AEDC" },
  { city: "Lagos", disco: "EKEDC" },
  { city: "Lagos", disco: "IKEDC" },
  { city: "Kano", disco: "KEDCO" },
  { city: "Port Harcourt", disco: "PHED" },
  { city: "Lafia", disco: "AEDC" },
  { city: "Enugu", disco: "EEDC" },
  { city: "Ibadan", disco: "IBEDC" },
];

function rnd(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function generateCustomers(n = 120): Customer[] {
  const r = rnd(42);
  return Array.from({ length: n }, (_, i) => {
    const loc = LOCS[Math.floor(r() * LOCS.length)];
    const cons = Math.round(80 + r() * 920);
    const fraudProb = Math.min(0.98, Math.max(0.02, r() * (cons < 200 ? 1.1 : 0.6)));
    const status: RiskLevel = fraudProb > 0.7 ? "high" : fraudProb > 0.4 ? "suspicious" : "normal";
    return {
      id: `C${(1000 + i).toString()}`,
      name: `${FIRST[Math.floor(r() * FIRST.length)]} ${LAST[Math.floor(r() * LAST.length)]}`,
      meter: `NG-${Math.floor(10000000 + r() * 89999999)}`,
      location: loc.city,
      disco: loc.disco,
      monthlyConsumption: cons,
      billing: Math.round(cons * 62),
      fraudProb: +fraudProb.toFixed(2),
      riskScore: Math.round(fraudProb * 100),
      status,
    };
  });
}

export const consumptionSeries = Array.from({ length: 12 }, (_, i) => ({
  month: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
  normal: 4200 + Math.round(Math.sin(i / 2) * 400 + i * 80),
  suspicious: 800 + Math.round(Math.cos(i / 3) * 120 + i * 20),
  fraud: 320 + Math.round(Math.sin(i / 1.5) * 80 + i * 12),
}));

export const hourlyUsage = Array.from({ length: 24 }, (_, h) => ({
  hour: `${h}:00`,
  usage: Math.round(120 + Math.sin((h - 6) / 4) * 80 + (h > 17 && h < 23 ? 60 : 0)),
  anomaly: h === 3 || h === 14 ? 1 : 0,
}));

export const regionalFraud = [
  { region: "Lagos", cases: 312 },
  { region: "Abuja", cases: 198 },
  { region: "Kano", cases: 164 },
  { region: "Port Harcourt", cases: 142 },
  { region: "Ibadan", cases: 121 },
  { region: "Enugu", cases: 88 },
  { region: "Lafia", cases: 54 },
];

export const modelPerformance = [
  { model: "Decision Tree", accuracy: 0.882, precision: 0.86, recall: 0.84, f1: 0.85, time: "2.1s" },
  { model: "Random Forest", accuracy: 0.946, precision: 0.94, recall: 0.93, f1: 0.935, time: "8.7s" },
  { model: "Neural Network", accuracy: 0.961, precision: 0.95, recall: 0.96, f1: 0.955, time: "42.3s" },
  { model: "SVM", accuracy: 0.912, precision: 0.9, recall: 0.89, f1: 0.895, time: "15.4s" },
];

export const trainingCurve = Array.from({ length: 20 }, (_, i) => ({
  epoch: i + 1,
  accuracy: +(0.55 + (1 - Math.exp(-i / 5)) * 0.42).toFixed(3),
  loss: +(0.85 * Math.exp(-i / 6) + 0.05).toFixed(3),
}));

export const alerts = [
  { id: 1, level: "high" as const, customer: "C1042", msg: "Customer C1042 flagged for possible meter bypass.", time: "2 min ago", zone: "Lagos / EKEDC" },
  { id: 2, level: "high" as const, customer: "C1187", msg: "Sudden 78% consumption drop detected.", time: "9 min ago", zone: "Abuja / AEDC" },
  { id: 3, level: "moderate" as const, customer: "C1023", msg: "Unusual peak-hour activity at 03:14.", time: "21 min ago", zone: "Kano / KEDCO" },
  { id: 4, level: "moderate" as const, customer: "C1099", msg: "Irregular billing vs consumption ratio.", time: "44 min ago", zone: "Port Harcourt / PHED" },
  { id: 5, level: "high" as const, customer: "C1156", msg: "Tampering pattern detected on smart meter.", time: "1 hr ago", zone: "Lafia / AEDC" },
  { id: 6, level: "normal" as const, customer: "C1004", msg: "Customer profile returned to normal usage.", time: "3 hr ago", zone: "Ibadan / IBEDC" },
];
