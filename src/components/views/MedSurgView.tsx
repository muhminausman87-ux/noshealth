import { Pill, ClipboardList, LineChart, Droplets } from "lucide-react";
import { StatusPill, Widget } from "@/components/Widget";
import { AcuityScoring } from "@/components/AcuityScoring";
import {
  RiskScoresPanel, BodySystemAssessment, PainAssessment,
  IntakeOutputDetailed, SBARHandover, HighAlertMeds, InfectionControl, SurgicalPostOp,
} from "@/components/clinical/ClinicalParameters";

const meds = [
  { name: "Metoprolol 25 mg PO", time: "08:00", status: "due" as const },
  { name: "Atorvastatin 40 mg PO", time: "08:00", status: "due" as const },
  { name: "Lisinopril 10 mg PO", time: "08:00", status: "given" as const },
  { name: "Pantoprazole 40 mg IV", time: "09:00", status: "scheduled" as const },
  { name: "Acetaminophen 650 mg PO PRN", time: "PRN", status: "prn" as const },
];

const trend = [70, 72, 68, 74, 76, 71, 73, 70, 69, 72, 75, 74];

export function MedSurgView() {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <Widget title="Medication Administration Record" icon={Pill} subtitle="Morning pass · 08:00">
        <ul className="space-y-2.5">
          {meds.map((m) => {
            const tone =
              m.status === "given"
                ? "success"
                : m.status === "due"
                  ? "warning"
                  : m.status === "scheduled"
                    ? "info"
                    : "neutral";
            return (
              <li
                key={m.name}
                className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2.5"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    defaultChecked={m.status === "given"}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <div>
                    <div className="text-sm font-medium text-foreground">{m.name}</div>
                    <div className="text-xs text-muted-foreground">Scheduled {m.time}</div>
                  </div>
                </div>
                <StatusPill tone={tone}>{m.status.toUpperCase()}</StatusPill>
              </li>
            );
          })}
        </ul>
      </Widget>

      <Widget title="Daily Care Plan & Mobility" icon={ClipboardList} subtitle="Updated 06:55">
        <dl className="space-y-3 text-sm">
          <Row k="Activity" v="Assist of 1 with walker · ambulate TID" />
          <Row k="Diet" v="NPO after midnight (pre-op)" />
          <Row k="Lines & Tubes" v="Peripheral IV 20g L forearm · saline lock" />
          <Row k="Wound Care" v="Surgical site dressing dry/intact" />
          <Row k="Fall Risk" v="Morse 45 · yellow band · bed alarm on" />
          <Row k="Discharge Goal" v="Home with PT referral, target POD #2" />
        </dl>
      </Widget>

      <Widget title="Shift-to-Shift Vitals Trend (24 h)" icon={LineChart} subtitle="HR · BP · SpO₂">
        <Sparkline data={trend} label="Heart rate" unit="bpm" current={74} />
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <Mini label="HR avg" value="72" />
          <Mini label="MAP avg" value="88" />
          <Mini label="SpO₂ avg" value="97%" />
        </div>
      </Widget>

      <Widget title="Fluid Balance (I/O)" icon={Droplets} subtitle="24-hour cumulative">
        <div className="grid grid-cols-2 gap-4">
          <Box label="Intake" value="1,840 mL" detail="IV 1,200 · PO 640" tone="info" />
          <Box label="Output" value="1,520 mL" detail="Urine 1,420 · Other 100" tone="success" />
        </div>
        <div className="mt-4 rounded-md bg-secondary/60 px-3 py-2 text-sm">
          <span className="text-muted-foreground">Net balance: </span>
          <span className="font-semibold text-foreground">+320 mL</span>
        </div>
      </Widget>

      <RiskScoresPanel className="lg:col-span-2" />
      <PainAssessment className="lg:col-span-2" />
      <BodySystemAssessment className="lg:col-span-2" />
      <IntakeOutputDetailed className="lg:col-span-2" />
      <SurgicalPostOp className="lg:col-span-2" />
      <HighAlertMeds />
      <InfectionControl />
      <SBARHandover className="lg:col-span-2" />

      <AcuityScoring mode="ward" className="lg:col-span-2" />
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border pb-2 last:border-none">
      <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {k}
      </dt>
      <dd className="text-right text-foreground">{v}</dd>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-secondary/60 px-2 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

function Box({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: "info" | "success";
}) {
  const ring = tone === "info" ? "border-primary/30 bg-primary/5" : "border-success/30 bg-success/5";
  return (
    <div className={`rounded-lg border p-3 ${ring}`}>
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold text-foreground">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{detail}</div>
    </div>
  );
}

function Sparkline({
  data,
  label,
  unit,
  current,
}: {
  data: number[];
  label: string;
  unit: string;
  current: number;
}) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const w = 320;
  const h = 80;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / (max - min || 1)) * h;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-sm font-semibold text-foreground">
          {current} <span className="text-xs text-muted-foreground">{unit}</span>
        </span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-20 w-full">
        <polyline
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="2"
          points={pts}
        />
      </svg>
    </div>
  );
}
