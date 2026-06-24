import { useMemo, useState } from "react";
import {
  Activity, AlertTriangle, Baby, Brain, ClipboardList, Droplets, FileText,
  HeartPulse, Pill, Ruler, Shield, Smile, Stethoscope, Thermometer, Wind,
} from "lucide-react";
import { StatusPill, Widget } from "@/components/Widget";

/* ------------------------------------------------------------------ */
/*  Reusable building blocks                                          */
/* ------------------------------------------------------------------ */

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 border-b border-border py-1.5 last:border-none">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{k}</span>
      <span className="text-right text-sm text-foreground">{v}</span>
    </div>
  );
}

function Tile({ label, value, sub, tone = "neutral" }: {
  label: string; value: React.ReactNode; sub?: string;
  tone?: "neutral" | "success" | "warning" | "danger";
}) {
  const color =
    tone === "danger" ? "text-destructive"
    : tone === "warning" ? "text-warning-foreground"
    : tone === "success" ? "text-success"
    : "text-foreground";
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 text-xl font-semibold tabular-nums ${color}`}>{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  1. Standardised Risk Scores (MEWS / Braden / Morse / GCS)         */
/* ------------------------------------------------------------------ */

export function RiskScoresPanel({ className }: { className?: string }) {
  const scores = [
    { name: "MEWS", value: 4, max: 14, tone: "warning" as const, hint: "Modified Early Warning · escalate ≥ 5" },
    { name: "GCS",  value: 14, max: 15, tone: "success" as const, hint: "E4 V4 M6" },
    { name: "Braden", value: 16, max: 23, tone: "warning" as const, hint: "Pressure injury risk · ≤ 18 at risk" },
    { name: "Morse", value: 55, max: 125, tone: "warning" as const, hint: "Fall risk · 45–64 moderate" },
    { name: "CAM-ICU", value: 0, max: 1, tone: "success" as const, hint: "Delirium screen · negative" },
    { name: "Pain (NRS)", value: 3, max: 10, tone: "success" as const, hint: "Numeric rating scale" },
  ];
  return (
    <Widget title="Risk Scores & Early Warning" icon={Shield} subtitle="Reassess each shift / change in condition" className={className}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {scores.map(s => (
          <Tile key={s.name} label={s.name} value={`${s.value}/${s.max}`} sub={s.hint} tone={s.tone} />
        ))}
      </div>
    </Widget>
  );
}

/* ------------------------------------------------------------------ */
/*  2. Head-to-toe Body System Assessment                             */
/* ------------------------------------------------------------------ */

export function BodySystemAssessment({ className }: { className?: string }) {
  const systems = [
    { k: "Neurological",     v: "Alert × 3, PERRL, GCS 14, no focal deficit" },
    { k: "Cardiovascular",   v: "S1 S2 regular, no murmur, pulses 2+ bilat, cap refill < 3s" },
    { k: "Respiratory",      v: "Clear bilateral, RR 18, SpO₂ 97% on RA, non-laboured" },
    { k: "Gastrointestinal", v: "Soft, non-tender, bowel sounds × 4, last BM today" },
    { k: "Genitourinary",    v: "Voiding clear yellow, no dysuria, foley not in situ" },
    { k: "Musculoskeletal",  v: "Full ROM × 4 limbs, steady gait with walker" },
    { k: "Integumentary",    v: "Warm, dry, intact; surgical dressing dry & intact" },
    { k: "Psychosocial",     v: "Cooperative, family present, no acute distress" },
    { k: "Endocrine",        v: "BGL 132 mg/dL, no signs of hypo/hyperglycaemia" },
  ];
  return (
    <Widget title="Head-to-Toe Body System Assessment" icon={Stethoscope} subtitle="Initial + per shift" className={className}>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-1 md:grid-cols-2">
        {systems.map(s => <Row key={s.k} k={s.k} v={s.v} />)}
      </dl>
    </Widget>
  );
}

/* ------------------------------------------------------------------ */
/*  3. Pain Assessment (PQRST / NRS)                                  */
/* ------------------------------------------------------------------ */

export function PainAssessment({ className }: { className?: string }) {
  const [score, setScore] = useState(3);
  return (
    <Widget title="Pain Assessment (PQRST · NRS)" icon={Smile} subtitle="Reassess 30 min after intervention" className={className}>
      <div className="mb-3 grid grid-cols-2 gap-3 md:grid-cols-3">
        <Row k="Provokes" v="Movement, deep breath" />
        <Row k="Quality" v="Sharp, intermittent" />
        <Row k="Region" v="RLQ → flank" />
        <Row k="Severity" v={`${score}/10`} />
        <Row k="Timing" v="Constant ×4 h" />
        <Row k="Last analgesia" v="Paracetamol 1 g IV · 07:20" />
      </div>
      <div className="flex flex-wrap gap-1">
        {Array.from({ length: 11 }, (_, i) => (
          <button
            key={i}
            onClick={() => setScore(i)}
            className={`h-8 w-8 rounded-md text-xs font-semibold ${
              score === i ? "bg-primary text-primary-foreground"
              : i <= 3 ? "bg-success/15 text-success"
              : i <= 6 ? "bg-warning/20 text-warning-foreground"
              : "bg-destructive/15 text-destructive"
            }`}
          >
            {i}
          </button>
        ))}
      </div>
    </Widget>
  );
}

/* ------------------------------------------------------------------ */
/*  4. Detailed Intake / Output                                       */
/* ------------------------------------------------------------------ */

export function IntakeOutputDetailed({ className }: { className?: string }) {
  const intake = [
    { k: "IV crystalloid (NS)", v: "850 mL" },
    { k: "IV antibiotic flush", v: "150 mL" },
    { k: "Oral fluids", v: "640 mL" },
    { k: "Enteral feed", v: "0 mL" },
  ];
  const output = [
    { k: "Urine", v: "1,420 mL (0.8 mL/kg/h)" },
    { k: "NG aspirate", v: "0 mL" },
    { k: "Drain – JP", v: "60 mL serosang." },
    { k: "Emesis / Stool", v: "40 mL" },
  ];
  return (
    <Widget title="Intake / Output · 24 h" icon={Droplets} subtitle="Net +320 mL" className={className}>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-primary">Intake · 1,640 mL</div>
          {intake.map(r => <Row key={r.k} k={r.k} v={r.v} />)}
        </div>
        <div>
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-success">Output · 1,520 mL</div>
          {output.map(r => <Row key={r.k} k={r.k} v={r.v} />)}
        </div>
      </div>
    </Widget>
  );
}

/* ------------------------------------------------------------------ */
/*  5. SBAR Handover                                                  */
/* ------------------------------------------------------------------ */

export function SBARHandover({ className }: { className?: string }) {
  const fields: { k: string; placeholder: string }[] = [
    { k: "Situation",      placeholder: "Pt admitted with CAP, started IV ceftriaxone." },
    { k: "Background",     placeholder: "DM2, HTN, allergy: penicillin." },
    { k: "Assessment",     placeholder: "Afebrile, SpO₂ 96% RA, MEWS 2." },
    { k: "Recommendation", placeholder: "Continue Abx, monitor temp, repeat CXR day 3." },
  ];
  return (
    <Widget title="SBAR Handover Note" icon={FileText} subtitle="Bedside handover · sign before leaving shift" className={className}>
      <div className="grid gap-3 md:grid-cols-2">
        {fields.map(f => (
          <label key={f.k} className="block rounded-md border border-input bg-background px-3 py-2">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-primary">{f.k}</span>
            <textarea rows={3} placeholder={f.placeholder} className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60" />
          </label>
        ))}
      </div>
    </Widget>
  );
}

/* ------------------------------------------------------------------ */
/*  6. Ventilator Advanced (ICU)                                      */
/* ------------------------------------------------------------------ */

export function VentilatorAdvanced({ className }: { className?: string }) {
  const set = [
    { k: "Mode", v: "PRVC" }, { k: "Set RR", v: "14" }, { k: "VT set", v: "450 mL" },
    { k: "PEEP", v: "5 cmH₂O" }, { k: "FiO₂", v: "40%" }, { k: "I:E", v: "1:2" },
    { k: "Trigger", v: "Flow –2" }, { k: "Pressure support", v: "10" },
  ];
  const meas = [
    { k: "Total RR", v: "16" }, { k: "VT exh", v: "445 mL" }, { k: "MV", v: "7.1 L/min" },
    { k: "Pplat", v: "22" }, { k: "Ppeak", v: "26" }, { k: "Compliance", v: "38 mL/cmH₂O" },
    { k: "Resistance", v: "9" }, { k: "P/F ratio", v: "210" },
  ];
  return (
    <Widget title="Ventilator – Set & Measured Parameters" icon={Wind} subtitle="Verify q4h + after every change" className={className}>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-primary">Set</div>
          <div className="grid grid-cols-2 gap-2">{set.map(s => <Tile key={s.k} label={s.k} value={s.v} />)}</div>
        </div>
        <div>
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-success">Measured</div>
          <div className="grid grid-cols-2 gap-2">{meas.map(s => <Tile key={s.k} label={s.k} value={s.v} />)}</div>
        </div>
      </div>
    </Widget>
  );
}

/* ------------------------------------------------------------------ */
/*  7. Fetal Monitoring (Labour / Maternity)                          */
/* ------------------------------------------------------------------ */

export function FetalMonitoring({ className }: { className?: string }) {
  return (
    <Widget title="Fetal & Maternal Monitoring (CTG)" icon={Baby} subtitle="Continuous · NICE category I" className={className}>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Tile label="FHR baseline" value="142 bpm" tone="success" />
        <Tile label="Variability" value="10 bpm" sub="moderate" tone="success" />
        <Tile label="Accelerations" value="Present" tone="success" />
        <Tile label="Decelerations" value="None" tone="success" />
        <Tile label="Contractions" value="3 / 10 min" sub="40 s · moderate" />
        <Tile label="Resting tone" value="Soft" />
        <Tile label="Cervical dilatation" value="6 cm" sub="100% effaced" />
        <Tile label="Station" value="–1" />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-1 md:grid-cols-3">
        <Row k="Membranes" v="Ruptured 04:20 · clear" />
        <Row k="Bishop score" v="9" />
        <Row k="Oxytocin" v="6 mU/min titrated" />
        <Row k="Maternal BP" v="122/76" />
        <Row k="Maternal HR" v="88" />
        <Row k="Analgesia" v="Epidural · level T10" />
      </div>
    </Widget>
  );
}

/* ------------------------------------------------------------------ */
/*  8. Pediatric vitals & growth                                      */
/* ------------------------------------------------------------------ */

export function PediatricVitals({ className }: { className?: string }) {
  return (
    <Widget title="Pediatric Vitals & Growth" icon={Ruler} subtitle="Age-appropriate ranges applied" className={className}>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Tile label="Weight" value="16.2 kg" sub="50th centile" />
        <Tile label="Height" value="102 cm" sub="60th centile" />
        <Tile label="Head circ." value="50 cm" />
        <Tile label="Temp" value="38.4 °C" tone="warning" />
        <Tile label="HR" value="128" sub="rest" tone="warning" />
        <Tile label="RR" value="32" tone="warning" />
        <Tile label="SpO₂" value="95 %" sub="1 L NC" />
        <Tile label="Cap refill" value="< 2 s" tone="success" />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-1 md:grid-cols-2">
        <Row k="Hydration" v="Mild dehydration · ORS started" />
        <Row k="PEWS" v="4 — escalate to senior" />
        <Row k="Feed tolerance" v="50% of usual intake" />
        <Row k="Immunisation" v="Up to date" />
      </div>
    </Widget>
  );
}

/* ------------------------------------------------------------------ */
/*  9. Cardiac telemetry & post-MI parameters                         */
/* ------------------------------------------------------------------ */

export function CardiacTelemetry({ className }: { className?: string }) {
  return (
    <Widget title="Cardiac Telemetry & Post-MI Monitoring" icon={HeartPulse} subtitle="Continuous 5-lead" className={className}>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Tile label="Rhythm" value="NSR" tone="success" />
        <Tile label="Rate" value="78 bpm" />
        <Tile label="PR" value="160 ms" />
        <Tile label="QRS" value="92 ms" />
        <Tile label="QTc" value="438 ms" />
        <Tile label="ST" value="No deviation" tone="success" />
        <Tile label="Ectopy" value="Rare PVCs" tone="warning" />
        <Tile label="Troponin (6 h)" value="0.04 ng/mL" tone="success" />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-1 md:grid-cols-2">
        <Row k="DAPT" v="Aspirin 75 + Ticagrelor 90 BD" />
        <Row k="Beta-blocker" v="Metoprolol 25 BD" />
        <Row k="Statin" v="Atorvastatin 80 OD" />
        <Row k="LVEF" v="42% (echo D1)" />
      </div>
    </Widget>
  );
}

/* ------------------------------------------------------------------ */
/* 10. Surgical site & post-op parameters                             */
/* ------------------------------------------------------------------ */

export function SurgicalPostOp({ className }: { className?: string }) {
  return (
    <Widget title="Surgical Site & Post-Op Parameters" icon={ClipboardList} subtitle="POD #1 · lap cholecystectomy" className={className}>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Tile label="Dressing" value="Dry & intact" tone="success" />
        <Tile label="Drain output" value="35 mL/8 h" sub="serosanguinous" />
        <Tile label="Pain (NRS)" value="3/10" tone="success" />
        <Tile label="Mobilised" value="Chair × 2" tone="success" />
        <Tile label="Bowel sounds" value="Returned" tone="success" />
        <Tile label="Flatus" value="Passed" tone="success" />
        <Tile label="DVT prophylaxis" value="Enoxaparin 40" />
        <Tile label="VTE score" value="Caprini 4" tone="warning" />
      </div>
    </Widget>
  );
}

/* ------------------------------------------------------------------ */
/* 11. Medication safety panel (high alert)                           */
/* ------------------------------------------------------------------ */

export function HighAlertMeds({ className }: { className?: string }) {
  const meds = [
    { name: "Insulin (regular) gtt", check: "Double-sign · BG q1h", tone: "warning" as const },
    { name: "Heparin gtt",            check: "aPTT q6h · weight-based", tone: "warning" as const },
    { name: "Vancomycin",             check: "Trough before 4th dose", tone: "info" as const },
    { name: "Potassium chloride",     check: "Never IV push · max 10 mEq/h", tone: "danger" as const },
    { name: "Opioid PCA",             check: "Lock-out 6 min · RR q1h", tone: "warning" as const },
  ];
  return (
    <Widget title="High-Alert Medications" icon={Pill} subtitle="Independent double-check required" className={className}>
      <ul className="space-y-2">
        {meds.map(m => (
          <li key={m.name} className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2">
            <div>
              <div className="text-sm font-medium text-foreground">{m.name}</div>
              <div className="text-xs text-muted-foreground">{m.check}</div>
            </div>
            <StatusPill tone={m.tone}>VERIFY</StatusPill>
          </li>
        ))}
      </ul>
    </Widget>
  );
}

/* ------------------------------------------------------------------ */
/* 12. Infection control & isolation                                  */
/* ------------------------------------------------------------------ */

export function InfectionControl({ className }: { className?: string }) {
  return (
    <Widget title="Infection Control & Isolation" icon={AlertTriangle} subtitle="Bundle compliance" className={className}>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Tile label="Precautions" value="Contact + Droplet" tone="warning" />
        <Tile label="Hand hygiene" value="100% audit" tone="success" />
        <Tile label="CAUTI bundle" value="Compliant" tone="success" />
        <Tile label="CLABSI bundle" value="Compliant" tone="success" />
        <Tile label="VAP bundle" value="HOB ≥ 30°" tone="success" />
        <Tile label="Antibiotic day" value="D3 / D7 review" />
      </div>
    </Widget>
  );
}
