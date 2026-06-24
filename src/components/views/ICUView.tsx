import { HeartPulse, Syringe, Wind, FlaskConical } from "lucide-react";
import { StatusPill, Widget } from "@/components/Widget";
import { AcuityScoring } from "@/components/AcuityScoring";
import {
  VentilatorAdvanced, RiskScoresPanel, BodySystemAssessment,
  IntakeOutputDetailed, HighAlertMeds, InfectionControl, SBARHandover, PainAssessment,
} from "@/components/clinical/ClinicalParameters";

export function ICUView() {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <Widget title="Continuous Hemodynamic Monitoring" icon={HeartPulse} subtitle="Real-time · A-line" className="lg:col-span-2">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <Metric label="HR" value="98" unit="bpm" tone="warning" />
          <Metric label="ART" value="118/62" unit="(78)" sub="MAP 78" />
          <Metric label="MAP" value="78" unit="mmHg" tone="success" />
          <Metric label="ICP" value="14" unit="mmHg" tone="success" />
          <Metric label="SpO₂" value="96" unit="%" />
        </div>
        <div className="mt-4 rounded-md border border-border bg-background p-3">
          <Waveform />
        </div>
      </Widget>

      <Widget title="Active IV Infusions & Drips" icon={Syringe} subtitle="Titrated · pump-verified">
        <ul className="space-y-2">
          <Drip name="Norepinephrine" dose="0.05 mcg/kg/min" status="titrating" detail="MAP goal ≥ 65" />
          <Drip name="Propofol" dose="20 mcg/kg/min" status="running" detail="RASS goal -2" />
          <Drip name="Fentanyl" dose="50 mcg/h" status="running" detail="CPOT ≤ 2" />
          <Drip name="Insulin (regular)" dose="2 units/h" status="titrating" detail="Glucose 140–180" />
          <Drip name="Heparin" dose="12 units/kg/h" status="hold" detail="aPTT pending" />
        </ul>
      </Widget>

      <Widget title="Ventilator & Multi-System Assessment" icon={Wind} subtitle="Drager V500">
        <div className="grid grid-cols-2 gap-3">
          <Vent k="Mode" v="AC / Volume" />
          <Vent k="Rate" v="14 / min" />
          <Vent k="VT" v="450 mL" />
          <Vent k="PEEP" v="5 cmH₂O" />
          <Vent k="FiO₂" v="40%" />
          <Vent k="Pplat" v="22 cmH₂O" />
        </div>
        <div className="mt-4 space-y-1.5 text-sm">
          <Sys k="Neuro" v="RASS -2, PERRL" />
          <Sys k="Cardiac" v="NSR, occasional PVCs" />
          <Sys k="Renal" v="UO 45 mL/h, BUN 28" />
          <Sys k="GI" v="OG to LCWS, bowel sounds present" />
        </div>
      </Widget>

      <Widget title="Recent Arterial Blood Gas (ABG)" icon={FlaskConical} subtitle="Drawn 06:30" className="lg:col-span-2">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="pb-2 font-medium">Time</th>
                <th className="pb-2 font-medium">pH</th>
                <th className="pb-2 font-medium">PaCO₂</th>
                <th className="pb-2 font-medium">PaO₂</th>
                <th className="pb-2 font-medium">HCO₃</th>
                <th className="pb-2 font-medium">Lactate</th>
                <th className="pb-2 font-medium">Interp.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <Abg t="06:30" ph="7.31" co2="48" o2="84" hco="22" lac="3.2" interp="Resp. acidosis" tone="warning" />
              <Abg t="04:30" ph="7.28" co2="52" o2="78" hco="21" lac="4.1" interp="Resp. acidosis" tone="danger" />
              <Abg t="02:30" ph="7.34" co2="46" o2="88" hco="23" lac="2.6" interp="Borderline" tone="warning" />
              <Abg t="00:30" ph="7.38" co2="42" o2="92" hco="24" lac="1.8" interp="Compensated" tone="success" />
            </tbody>
          </table>
        </div>
      </Widget>

      <VentilatorAdvanced className="lg:col-span-2" />
      <RiskScoresPanel className="lg:col-span-2" />
      <BodySystemAssessment className="lg:col-span-2" />
      <IntakeOutputDetailed className="lg:col-span-2" />
      <HighAlertMeds />
      <InfectionControl />
      <PainAssessment className="lg:col-span-2" />
      <SBARHandover className="lg:col-span-2" />

      <AcuityScoring mode="icu" className="lg:col-span-2" />
    </div>
  );
}

function Metric({
  label,
  value,
  unit,
  tone = "neutral",
  sub,
}: {
  label: string;
  value: string;
  unit: string;
  tone?: "neutral" | "success" | "warning" | "danger";
  sub?: string;
}) {
  const color =
    tone === "danger"
      ? "text-destructive"
      : tone === "warning"
        ? "text-warning-foreground"
        : tone === "success"
          ? "text-success"
          : "text-foreground";
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className={`mt-1 text-2xl font-semibold tabular-nums ${color}`}>
        {value} <span className="text-xs font-normal text-muted-foreground">{unit}</span>
      </div>
      {sub && <div className="text-[11px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

function Drip({
  name,
  dose,
  status,
  detail,
}: {
  name: string;
  dose: string;
  status: "running" | "titrating" | "hold";
  detail: string;
}) {
  const tone = status === "running" ? "success" : status === "titrating" ? "info" : "warning";
  return (
    <li className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2.5">
      <div>
        <div className="text-sm font-medium text-foreground">{name}</div>
        <div className="text-xs text-muted-foreground">{detail}</div>
      </div>
      <div className="text-right">
        <div className="text-sm font-semibold tabular-nums text-foreground">{dose}</div>
        <StatusPill tone={tone}>{status.toUpperCase()}</StatusPill>
      </div>
    </li>
  );
}

function Vent({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-md bg-secondary/60 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div>
      <div className="text-sm font-semibold text-foreground">{v}</div>
    </div>
  );
}

function Sys({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between border-b border-border pb-1 last:border-none">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{k}</span>
      <span className="text-foreground">{v}</span>
    </div>
  );
}

function Abg({
  t,
  ph,
  co2,
  o2,
  hco,
  lac,
  interp,
  tone,
}: {
  t: string;
  ph: string;
  co2: string;
  o2: string;
  hco: string;
  lac: string;
  interp: string;
  tone: "success" | "warning" | "danger";
}) {
  return (
    <tr>
      <td className="py-2 font-medium text-foreground">{t}</td>
      <td className="py-2 tabular-nums">{ph}</td>
      <td className="py-2 tabular-nums">{co2}</td>
      <td className="py-2 tabular-nums">{o2}</td>
      <td className="py-2 tabular-nums">{hco}</td>
      <td className="py-2 tabular-nums">{lac}</td>
      <td className="py-2">
        <StatusPill tone={tone}>{interp}</StatusPill>
      </td>
    </tr>
  );
}

function Waveform() {
  // Simple ECG-like SVG waveform
  const w = 800;
  const h = 60;
  const path: string[] = [];
  for (let i = 0; i < 6; i++) {
    const x = (i * w) / 6;
    path.push(
      `M ${x} ${h / 2} l 40 0 l 4 -4 l 4 14 l 6 -28 l 6 22 l 4 -4 l 60 0`,
    );
  }
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-14 w-full">
      <path d={path.join(" ")} fill="none" stroke="var(--color-success)" strokeWidth="1.5" />
    </svg>
  );
}
