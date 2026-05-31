import { useState } from "react";
import {
  Activity, HeartPulse, Stethoscope, Droplet, Thermometer, Brain,
  FlaskConical, Plus, Trash2, Save, Radio, Pill, Boxes, Building2,
  ClipboardList, FileText, HeartCrack, AlertTriangle, ArrowRightLeft,
  Skull, LogOut, Send,
} from "lucide-react";
import type { PatientFull } from "@/lib/patients";

/* ---------- shared box ---------- */
function Box({
  title, icon: Icon, accent, children, className = "", action,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <section
      className={`relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm ${className}`}
      style={{ boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${accent} 18%, transparent)` }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1"
        style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />
      <header className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ background: `color-mix(in oklab, ${accent} 18%, transparent)`, color: accent }}>
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {action && <div className="ml-auto">{action}</div>}
      </header>
      {children}
    </section>
  );
}

const inputCls =
  "w-full rounded-md border border-border bg-background/60 px-2.5 py-1.5 text-sm outline-none focus:border-primary";
const btn =
  "inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/60 px-3 py-1.5 text-xs font-medium hover:bg-secondary";
const btnPrimary =
  "inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90";
const btnDanger =
  "inline-flex items-center gap-1.5 rounded-md bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground hover:bg-destructive/90";

const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

/* ============ VITAL SIGNS TREND ============ */
interface VitalRow { time: string; hr: string; bp: string; rr: string; spo2: string; temp: string; by: string; }

export function VitalsTrend({ patient }: { patient: PatientFull }) {
  const [rows, setRows] = useState<VitalRow[]>([
    { time: "06:00", hr: String(patient.vitals.hr - 4), bp: patient.vitals.bp, rr: String(patient.vitals.rr), spo2: String(patient.vitals.spo2 + 1), temp: patient.vitals.temp, by: "Night RN" },
    { time: "08:00", hr: String(patient.vitals.hr), bp: patient.vitals.bp, rr: String(patient.vitals.rr), spo2: String(patient.vitals.spo2), temp: patient.vitals.temp, by: "Day RN" },
  ]);
  const [draft, setDraft] = useState<VitalRow>({ time: now(), hr: "", bp: "", rr: "", spo2: "", temp: "", by: "" });
  const add = () => {
    if (!draft.hr && !draft.bp) return;
    setRows([...rows, draft]);
    setDraft({ time: now(), hr: "", bp: "", rr: "", spo2: "", temp: "", by: "" });
  };
  const flagged = (r: VitalRow) =>
    Number(r.hr) > 110 || Number(r.hr) < 50 || Number(r.spo2) < 94 || Number(r.rr) > 24 || parseFloat(r.temp) > 38;

  return (
    <Box title="Vital signs — serial entries" icon={HeartPulse} accent="var(--color-tone-rose)">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="py-2 pr-3">Time</th><th className="py-2 pr-3">HR</th><th className="py-2 pr-3">BP</th>
              <th className="py-2 pr-3">RR</th><th className="py-2 pr-3">SpO₂</th><th className="py-2 pr-3">Temp</th>
              <th className="py-2 pr-3">By</th><th className="py-2 pr-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r, i) => (
              <tr key={i} className={flagged(r) ? "bg-destructive/5" : ""}>
                <td className="py-1.5 pr-3 font-medium">{r.time}</td>
                <td className="py-1.5 pr-3">{r.hr}</td>
                <td className="py-1.5 pr-3">{r.bp}</td>
                <td className="py-1.5 pr-3">{r.rr}</td>
                <td className="py-1.5 pr-3">{r.spo2}</td>
                <td className="py-1.5 pr-3">{r.temp}</td>
                <td className="py-1.5 pr-3 text-muted-foreground">{r.by}</td>
                <td className="py-1.5 pr-3">
                  {flagged(r) && <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-destructive">deteriorating</span>}
                </td>
              </tr>
            ))}
            <tr>
              <td className="py-2 pr-2"><input className={inputCls} value={draft.time} onChange={(e) => setDraft({ ...draft, time: e.target.value })} placeholder="HH:MM" /></td>
              <td className="py-2 pr-2"><input className={inputCls} value={draft.hr} onChange={(e) => setDraft({ ...draft, hr: e.target.value })} placeholder="bpm" /></td>
              <td className="py-2 pr-2"><input className={inputCls} value={draft.bp} onChange={(e) => setDraft({ ...draft, bp: e.target.value })} placeholder="120/80" /></td>
              <td className="py-2 pr-2"><input className={inputCls} value={draft.rr} onChange={(e) => setDraft({ ...draft, rr: e.target.value })} placeholder="/min" /></td>
              <td className="py-2 pr-2"><input className={inputCls} value={draft.spo2} onChange={(e) => setDraft({ ...draft, spo2: e.target.value })} placeholder="%" /></td>
              <td className="py-2 pr-2"><input className={inputCls} value={draft.temp} onChange={(e) => setDraft({ ...draft, temp: e.target.value })} placeholder="°C" /></td>
              <td className="py-2 pr-2"><input className={inputCls} value={draft.by} onChange={(e) => setDraft({ ...draft, by: e.target.value })} placeholder="RN initials" /></td>
              <td className="py-2 pr-2"><button onClick={add} className={btnPrimary}><Plus className="h-3 w-3" />Save</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </Box>
  );
}

/* ============ GCS TREND ============ */
interface GcsRow { time: string; e: string; v: string; m: string; by: string; }
export function GcsTrend({ patient }: { patient: PatientFull }) {
  const [rows, setRows] = useState<GcsRow[]>([
    { time: "06:00", e: String(patient.gcs.eye), v: String(patient.gcs.verbal), m: String(patient.gcs.motor), by: "Night RN" },
    { time: "08:00", e: String(patient.gcs.eye), v: String(patient.gcs.verbal), m: String(patient.gcs.motor), by: "Day RN" },
  ]);
  const [draft, setDraft] = useState<GcsRow>({ time: now(), e: "", v: "", m: "", by: "" });
  const total = (r: GcsRow) => (Number(r.e) || 0) + (Number(r.v) || 0) + (Number(r.m) || 0);
  const tone = (t: number) =>
    t >= 13 ? "var(--color-tone-mint)" : t >= 9 ? "var(--color-tone-amber)" : "var(--color-destructive)";

  return (
    <Box title="GCS — serial entries" icon={Brain} accent="var(--color-tone-amber)">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="py-2 pr-3">Time</th><th className="py-2 pr-3">E /4</th><th className="py-2 pr-3">V /5</th>
              <th className="py-2 pr-3">M /6</th><th className="py-2 pr-3">Total</th><th className="py-2 pr-3">By</th><th></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r, i) => {
              const t = total(r);
              return (
                <tr key={i}>
                  <td className="py-1.5 pr-3 font-medium">{r.time}</td>
                  <td className="py-1.5 pr-3">{r.e}</td>
                  <td className="py-1.5 pr-3">{r.v}</td>
                  <td className="py-1.5 pr-3">{r.m}</td>
                  <td className="py-1.5 pr-3 font-semibold" style={{ color: tone(t) }}>{t}/15</td>
                  <td className="py-1.5 pr-3 text-muted-foreground">{r.by}</td>
                  <td />
                </tr>
              );
            })}
            <tr>
              <td className="py-2 pr-2"><input className={inputCls} value={draft.time} onChange={(e) => setDraft({ ...draft, time: e.target.value })} /></td>
              <td className="py-2 pr-2"><input className={inputCls} value={draft.e} onChange={(e) => setDraft({ ...draft, e: e.target.value })} /></td>
              <td className="py-2 pr-2"><input className={inputCls} value={draft.v} onChange={(e) => setDraft({ ...draft, v: e.target.value })} /></td>
              <td className="py-2 pr-2"><input className={inputCls} value={draft.m} onChange={(e) => setDraft({ ...draft, m: e.target.value })} /></td>
              <td />
              <td className="py-2 pr-2"><input className={inputCls} value={draft.by} onChange={(e) => setDraft({ ...draft, by: e.target.value })} placeholder="RN" /></td>
              <td className="py-2 pr-2">
                <button className={btnPrimary} onClick={() => { setRows([...rows, draft]); setDraft({ time: now(), e: "", v: "", m: "", by: "" }); }}>
                  <Plus className="h-3 w-3" />Save
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Box>
  );
}

/* ============ LAB ENTRY (technician) ============ */
interface LabRow { time: string; panel: string; test: string; value: string; unit: string; ref: string; tech: string; }
export function LabEntry() {
  const [rows, setRows] = useState<LabRow[]>([]);
  const [d, setD] = useState<LabRow>({ time: now(), panel: "FBC", test: "", value: "", unit: "", ref: "", tech: "" });
  return (
    <Box title="Lab values — technician entry" icon={FlaskConical} accent="var(--color-tone-sky)">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="py-2 pr-3">Time</th><th>Panel</th><th>Test</th><th>Value</th><th>Unit</th><th>Reference</th><th>Tech</th><th></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r, i) => (
              <tr key={i}>
                <td className="py-1.5 pr-3 font-medium">{r.time}</td>
                <td className="py-1.5 pr-3 text-muted-foreground">{r.panel}</td>
                <td className="py-1.5 pr-3">{r.test}</td>
                <td className="py-1.5 pr-3 font-semibold">{r.value}</td>
                <td className="py-1.5 pr-3 text-muted-foreground">{r.unit}</td>
                <td className="py-1.5 pr-3 text-muted-foreground">{r.ref}</td>
                <td className="py-1.5 pr-3 text-muted-foreground">{r.tech}</td>
                <td><button onClick={() => setRows(rows.filter((_, k) => k !== i))} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button></td>
              </tr>
            ))}
            <tr>
              <td className="py-2 pr-2"><input className={inputCls} value={d.time} onChange={(e) => setD({ ...d, time: e.target.value })} /></td>
              <td className="py-2 pr-2">
                <select className={inputCls} value={d.panel} onChange={(e) => setD({ ...d, panel: e.target.value })}>
                  <option>FBC</option><option>U&E</option><option>LFT</option><option>ABG</option><option>Coag</option><option>Glucose</option><option>CRP</option><option>Cardiac</option><option>Other</option>
                </select>
              </td>
              <td className="py-2 pr-2"><input className={inputCls} value={d.test} onChange={(e) => setD({ ...d, test: e.target.value })} placeholder="e.g. Hb" /></td>
              <td className="py-2 pr-2"><input className={inputCls} value={d.value} onChange={(e) => setD({ ...d, value: e.target.value })} /></td>
              <td className="py-2 pr-2"><input className={inputCls} value={d.unit} onChange={(e) => setD({ ...d, unit: e.target.value })} placeholder="g/dL" /></td>
              <td className="py-2 pr-2"><input className={inputCls} value={d.ref} onChange={(e) => setD({ ...d, ref: e.target.value })} placeholder="12–16" /></td>
              <td className="py-2 pr-2"><input className={inputCls} value={d.tech} onChange={(e) => setD({ ...d, tech: e.target.value })} placeholder="Tech ID" /></td>
              <td className="py-2 pr-2"><button className={btnPrimary} onClick={() => { if (d.test && d.value) { setRows([...rows, d]); setD({ time: now(), panel: d.panel, test: "", value: "", unit: "", ref: "", tech: d.tech }); } }}><Plus className="h-3 w-3" />Add</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">Future: auto-sync with hospital LIS via HL7 / FHIR.</p>
    </Box>
  );
}

/* ============ EHR MODULES ============ */
const modules = [
  { key: "radiology", label: "Radiology / PACS", icon: Radio, accent: "var(--color-tone-sky)", items: ["CXR — pending", "CT abdomen — reported"] },
  { key: "lab", label: "Laboratory (LIS)", icon: FlaskConical, accent: "var(--color-tone-violet)", items: ["FBC, U&E — resulted", "Blood culture — pending"] },
  { key: "pharmacy", label: "Pharmacy", icon: Pill, accent: "var(--color-tone-mint)", items: ["3 active scripts", "1 STAT order pending"] },
  { key: "cssd", label: "CSSD", icon: Boxes, accent: "var(--color-tone-teal)", items: ["Sterile pack #441 issued", "Return logged"] },
  { key: "store", label: "Store / Inventory", icon: Boxes, accent: "var(--color-tone-amber)", items: ["IV cannula 18G ×3", "Dressing pack ×1"] },
  { key: "opd", label: "OPD", icon: Building2, accent: "var(--color-tone-rose)", items: ["Last OPD visit 2026-04-12", "Follow-up booked"] },
  { key: "billing", label: "Billing", icon: FileText, accent: "var(--color-tone-violet)", items: ["Estimate ₹ 42,500", "Insurance: approved"] },
];

export function EHRModules() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {modules.map((m) => (
        <Box key={m.key} title={m.label} icon={m.icon} accent={m.accent}
          action={<span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] uppercase text-muted-foreground">linked</span>}>
          <ul className="space-y-1.5 text-sm">
            {m.items.map((it, i) => (
              <li key={i} className="flex items-center gap-2 text-foreground">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: m.accent }} />
                {it}
              </li>
            ))}
          </ul>
          <button className={`${btn} mt-3 w-full justify-center`}>Open module</button>
        </Box>
      ))}
    </div>
  );
}

/* ============ CPR / CODE BLUE ============ */
interface CprEvent { time: string; event: string; by: string; }
export function CPRSheet({ patient }: { patient: PatientFull }) {
  const [open, setOpen] = useState(false);
  const [start, setStart] = useState("");
  const [outcome, setOutcome] = useState<"ongoing" | "rosc" | "ceased">("ongoing");
  const [events, setEvents] = useState<CprEvent[]>([]);
  const [d, setD] = useState<CprEvent>({ time: now(), event: "", by: "" });

  if (!open) {
    return (
      <Box title="CPR / Code Blue sheet" icon={HeartCrack} accent="var(--color-destructive)">
        <p className="text-sm text-muted-foreground">No active resuscitation record for {patient.name}.</p>
        <button onClick={() => { setOpen(true); setStart(new Date().toLocaleString()); }} className={`${btnDanger} mt-4`}>
          <AlertTriangle className="h-3.5 w-3.5" /> Start Code Blue
        </button>
      </Box>
    );
  }

  const quick = ["CPR commenced", "Adrenaline 1 mg IV", "Amiodarone 300 mg IV", "Shock 200 J", "Rhythm check: VF", "Rhythm check: PEA", "Rhythm check: Asystole", "ROSC", "Airway secured (ETT)", "Family notified"];

  return (
    <Box title="CPR / Code Blue — active" icon={HeartCrack} accent="var(--color-destructive)"
      action={<span className="rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-destructive">RECORDING</span>}>
      <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
        <div><div className="text-[11px] uppercase tracking-wider text-muted-foreground">Code start</div><div className="font-medium">{start}</div></div>
        <div><div className="text-[11px] uppercase tracking-wider text-muted-foreground">Team lead</div><input className={inputCls} placeholder="MO name" /></div>
        <div><div className="text-[11px] uppercase tracking-wider text-muted-foreground">Recorder</div><input className={inputCls} placeholder="RN name" /></div>
        <div><div className="text-[11px] uppercase tracking-wider text-muted-foreground">Outcome</div>
          <select className={inputCls} value={outcome} onChange={(e) => setOutcome(e.target.value as typeof outcome)}>
            <option value="ongoing">Ongoing</option><option value="rosc">ROSC achieved</option><option value="ceased">Ceased — death declared</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {quick.map((q) => (
          <button key={q} onClick={() => setEvents([...events, { time: now(), event: q, by: "" }])}
            className="rounded-full border border-border bg-background/60 px-2.5 py-1 text-[11px] hover:bg-secondary">
            + {q}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="py-2 pr-3">Time</th><th className="py-2 pr-3">Event / drug / shock</th><th className="py-2 pr-3">By</th><th></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {events.map((e, i) => (
              <tr key={i}>
                <td className="py-1.5 pr-3 font-medium">{e.time}</td>
                <td className="py-1.5 pr-3">{e.event}</td>
                <td className="py-1.5 pr-3 text-muted-foreground">{e.by || "—"}</td>
                <td><button onClick={() => setEvents(events.filter((_, k) => k !== i))} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button></td>
              </tr>
            ))}
            <tr>
              <td className="py-2 pr-2"><input className={inputCls} value={d.time} onChange={(e) => setD({ ...d, time: e.target.value })} /></td>
              <td className="py-2 pr-2"><input className={inputCls} value={d.event} onChange={(e) => setD({ ...d, event: e.target.value })} placeholder="Event / intervention" /></td>
              <td className="py-2 pr-2"><input className={inputCls} value={d.by} onChange={(e) => setD({ ...d, by: e.target.value })} placeholder="Initials" /></td>
              <td><button className={btnPrimary} onClick={() => { if (d.event) { setEvents([...events, d]); setD({ time: now(), event: "", by: d.by }); } }}><Plus className="h-3 w-3" /></button></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex gap-2">
        <button className={btnPrimary}><Save className="h-3.5 w-3.5" />Save sheet</button>
        <button onClick={() => setOpen(false)} className={btn}>Close</button>
      </div>
    </Box>
  );
}

/* ============ HANDOVER TYPE SELECTOR ============ */
export type HandoverType = "shift" | "transfer" | "discharge" | "death";
export function HandoverTypeSelector({ value, onChange }: { value: HandoverType; onChange: (v: HandoverType) => void }) {
  const opts: { v: HandoverType; label: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; accent: string }[] = [
    { v: "shift", label: "Shift handover", icon: ArrowRightLeft, accent: "var(--color-tone-teal)" },
    { v: "transfer", label: "Department transfer", icon: Send, accent: "var(--color-tone-sky)" },
    { v: "discharge", label: "Discharge", icon: LogOut, accent: "var(--color-tone-mint)" },
    { v: "death", label: "Death / mortuary", icon: Skull, accent: "var(--color-destructive)" },
  ];
  return (
    <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4">
      {opts.map((o) => {
        const active = value === o.v;
        return (
          <button key={o.v} onClick={() => onChange(o.v)}
            className={`flex items-center gap-2 rounded-xl border p-3 text-left transition ${active ? "border-transparent" : "border-border bg-card hover:bg-secondary/40"}`}
            style={active ? { background: `color-mix(in oklab, ${o.accent} 18%, transparent)`, boxShadow: `inset 0 0 0 1px ${o.accent}` } : undefined}>
            <o.icon className="h-4 w-4" style={{ color: o.accent }} />
            <span className="text-sm font-medium text-foreground">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function HandoverExtraForm({ type, patient }: { type: HandoverType; patient: PatientFull }) {
  if (type === "transfer") {
    return (
      <Box title="Department transfer" icon={ArrowRightLeft} accent="var(--color-tone-sky)" className="md:col-span-2">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 text-sm">
          <Field label="From dept"><input className={inputCls} defaultValue={patient.dept} /></Field>
          <Field label="To dept"><select className={inputCls}><option>ICU</option><option>Medical ward</option><option>Surgical ward</option><option>Cardiac ward</option><option>OT</option><option>OPD</option><option>Day care</option><option>Maternity</option><option>Pediatric</option><option>Labour</option></select></Field>
          <Field label="Mode"><select className={inputCls}><option>Trolley</option><option>Wheelchair</option><option>Walking</option><option>Bed</option></select></Field>
          <Field label="Escort"><input className={inputCls} placeholder="RN + porter" /></Field>
          <Field label="O₂ / monitor"><input className={inputCls} placeholder="None / NC 2L / monitored" /></Field>
          <Field label="Time of transfer"><input className={inputCls} defaultValue={now()} /></Field>
          <div className="md:col-span-3"><Field label="Reason / summary"><textarea className={`${inputCls} h-20`} /></Field></div>
          <div className="md:col-span-3"><Field label="Receiving RN signature"><input className={inputCls} /></Field></div>
        </div>
      </Box>
    );
  }
  if (type === "discharge") {
    return (
      <Box title="Discharge summary" icon={LogOut} accent="var(--color-tone-mint)" className="md:col-span-2">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 text-sm">
          <Field label="Discharge date/time"><input className={inputCls} defaultValue={new Date().toLocaleString()} /></Field>
          <Field label="Disposition"><select className={inputCls}><option>Home</option><option>Transfer to another facility</option><option>LAMA</option><option>Absconded</option></select></Field>
          <div className="md:col-span-2"><Field label="Discharge diagnosis"><textarea className={`${inputCls} h-16`} /></Field></div>
          <div className="md:col-span-2"><Field label="Medications at discharge"><textarea className={`${inputCls} h-16`} placeholder="Drug / dose / duration" /></Field></div>
          <div className="md:col-span-2"><Field label="Follow-up & advice"><textarea className={`${inputCls} h-16`} /></Field></div>
          <Field label="Billing cleared"><select className={inputCls}><option>Yes</option><option>Pending</option></select></Field>
          <Field label="Discharged by"><input className={inputCls} placeholder="MO / RN" /></Field>
        </div>
      </Box>
    );
  }
  if (type === "death") {
    return (
      <Box title="Death record" icon={Skull} accent="var(--color-destructive)" className="md:col-span-2">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 text-sm">
          <Field label="Time of death"><input className={inputCls} defaultValue={new Date().toLocaleString()} /></Field>
          <Field label="Declared by (MO)"><input className={inputCls} /></Field>
          <div className="md:col-span-2"><Field label="Cause of death"><textarea className={`${inputCls} h-16`} /></Field></div>
          <Field label="Resuscitation attempted"><select className={inputCls}><option>Yes</option><option>No (DNR)</option></select></Field>
          <Field label="Family informed by"><input className={inputCls} /></Field>
          <Field label="Body release to"><input className={inputCls} placeholder="Mortuary / family" /></Field>
          <Field label="Belongings handed over"><select className={inputCls}><option>Yes — to NOK</option><option>Stored in unit safe</option></select></Field>
          <div className="md:col-span-2"><Field label="Death certificate number"><input className={inputCls} /></Field></div>
        </div>
      </Box>
    );
  }
  return null;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
