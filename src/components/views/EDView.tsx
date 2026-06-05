import { AlertCircle, Activity, FlaskConical, Siren } from "lucide-react";
import { StatusPill, Widget } from "@/components/Widget";
import { AcuityScoring } from "@/components/AcuityScoring";

const vitals = [
  { t: "Now", hr: 112, bp: "148/92", rr: 22, o2: 94, temp: "37.8" },
  { t: "-30m", hr: 108, bp: "146/90", rr: 20, o2: 95, temp: "37.7" },
  { t: "-60m", hr: 116, bp: "152/94", rr: 24, o2: 93, temp: "37.6" },
  { t: "-90m", hr: 110, bp: "150/92", rr: 22, o2: 94, temp: "37.5" },
  { t: "-120m", hr: 118, bp: "154/96", rr: 26, o2: 92, temp: "37.4" },
];

export function EDView() {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <Widget title="Chief Complaint & Acuity" icon={Siren} subtitle="Arrival 06:42">
        <div className="space-y-3">
          <p className="text-base font-medium text-foreground">
            Chest pain radiating to left arm, onset 90 minutes prior to arrival.
            Associated diaphoresis and shortness of breath.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">
              ESI Level 2 · Emergent
            </span>
            <StatusPill tone="info">Triage: A. Chen, RN</StatusPill>
            <StatusPill tone="neutral">Bed 7 · Resus</StatusPill>
          </div>
        </div>
      </Widget>

      <Widget title="Critical Alerts" icon={AlertCircle} subtitle="Reviewed at 07:01">
        <ul className="space-y-2.5">
          <AlertRow tone="danger" label="Drug Allergy" value="Penicillin — anaphylaxis (1998)" />
          <AlertRow tone="warning" label="Fall Risk" value="Morse score 65 · yellow band" />
          <AlertRow tone="info" label="Isolation" value="Standard precautions" />
          <AlertRow tone="warning" label="Code Status" value="Full Code (verified)" />
        </ul>
      </Widget>

      <Widget title="Vital Signs — Last 2 Hours" icon={Activity} subtitle="q30 min" className="lg:col-span-2">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="pb-2 font-medium">Time</th>
                <th className="pb-2 font-medium">HR (bpm)</th>
                <th className="pb-2 font-medium">BP (mmHg)</th>
                <th className="pb-2 font-medium">RR</th>
                <th className="pb-2 font-medium">SpO₂ (%)</th>
                <th className="pb-2 font-medium">Temp (°C)</th>
              </tr>
            </thead>
            <tbody>
              {vitals.map((v, i) => (
                <tr key={v.t} className={i === 0 ? "bg-primary/5" : ""}>
                  <td className="py-2 font-medium text-foreground">{v.t}</td>
                  <td className={cls(v.hr > 110, "py-2")}>{v.hr}</td>
                  <td className="py-2">{v.bp}</td>
                  <td className={cls(v.rr > 20, "py-2")}>{v.rr}</td>
                  <td className={cls(v.o2 < 95, "py-2")}>{v.o2}</td>
                  <td className="py-2">{v.temp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Widget>

      <Widget title="Stat Labs & Imaging" icon={FlaskConical} subtitle="Ordered 06:48" className="lg:col-span-2">
        <div className="divide-y divide-border">
          <LabRow name="Troponin I" detail="High-sensitivity assay" status="completed" result="0.84 ng/mL" abnormal />
          <LabRow name="12-lead EKG" detail="ST elevation V2–V4" status="completed" result="Read pending cardiology" />
          <LabRow name="Chest X-Ray, portable" detail="2 views, AP" status="pending" />
          <LabRow name="CBC w/ diff" detail="Lavender tube" status="in-progress" />
          <LabRow name="BMP" detail="Green tube" status="completed" result="Within range" />
        </div>
      </Widget>
    </div>
  );
}

function cls(abn: boolean, base: string) {
  return `${base} ${abn ? "font-semibold text-destructive" : "text-foreground"}`;
}

function AlertRow({
  tone,
  label,
  value,
}: {
  tone: "danger" | "warning" | "info";
  label: string;
  value: string;
}) {
  return (
    <li className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-2.5">
        <span
          className={`mt-1 h-2 w-2 rounded-full ${
            tone === "danger"
              ? "bg-destructive"
              : tone === "warning"
                ? "bg-warning"
                : "bg-primary"
          }`}
        />
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </div>
          <div className="text-sm text-foreground">{value}</div>
        </div>
      </div>
    </li>
  );
}

function LabRow({
  name,
  detail,
  status,
  result,
  abnormal,
}: {
  name: string;
  detail: string;
  status: "completed" | "pending" | "in-progress";
  result?: string;
  abnormal?: boolean;
}) {
  const tone =
    status === "completed" ? "success" : status === "pending" ? "warning" : "info";
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <div className="text-sm font-medium text-foreground">{name}</div>
        <div className="text-xs text-muted-foreground">{detail}</div>
      </div>
      <div className="flex items-center gap-3">
        {result && (
          <span
            className={`text-sm ${
              abnormal ? "font-semibold text-destructive" : "text-foreground"
            }`}
          >
            {result}
            {abnormal && " ⚠"}
          </span>
        )}
        <StatusPill tone={tone}>{status.replace("-", " ").toUpperCase()}</StatusPill>
      </div>
    </div>
  );
}
