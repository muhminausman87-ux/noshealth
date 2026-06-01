import { useMemo, useState } from "react";
import {
  BookOpen, Calculator, ExternalLink, Search, Sparkles, Stethoscope, Pill, ShieldCheck,
} from "lucide-react";
import type { PatientFull } from "@/lib/patients";

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
  "w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:border-primary";

export const ebpSources = [
  { key: "pubmed",   label: "PubMed",            url: (q: string) => `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(q)}` },
  { key: "medscape", label: "Medscape",          url: (q: string) => `https://search.medscape.com/search/?q=${encodeURIComponent(q)}` },
  { key: "uptodate", label: "UpToDate",          url: (q: string) => `https://www.uptodate.com/contents/search?search=${encodeURIComponent(q)}` },
  { key: "bmj",      label: "BMJ Best Practice", url: (q: string) => `https://bestpractice.bmj.com/search?q=${encodeURIComponent(q)}` },
  { key: "nice",     label: "NICE Guidelines",   url: (q: string) => `https://www.nice.org.uk/search?q=${encodeURIComponent(q)}` },
  { key: "cochrane", label: "Cochrane Library",  url: (q: string) => `https://www.cochranelibrary.com/search?searchBy=1&searchText=${encodeURIComponent(q)}` },
  { key: "scholar",  label: "Google Scholar",    url: (q: string) => `https://scholar.google.com/scholar?q=${encodeURIComponent(q)}` },
  { key: "google",   label: "Google",            url: (q: string) => `https://www.google.com/search?q=${encodeURIComponent(q + " evidence based")}` },
];

export function EBPSearch({ patient }: { patient: PatientFull }) {
  const [q, setQ] = useState(patient.reasonForAdmission.split(".")[0]);
  return (
    <Box title="Evidence-based references" icon={BookOpen} accent="var(--color-tone-sky)">
      <p className="mb-3 text-xs text-muted-foreground">
        Quickly check guidelines, primary literature and drug references. Each link opens in a new tab.
      </p>
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          className={`${inputCls} pl-8`}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Topic, drug, diagnosis or procedure"
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {ebpSources.map((s) => (
          <a
            key={s.key}
            href={s.url(q)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5 text-[11px] font-medium text-secondary-foreground hover:bg-accent"
          >
            {s.label} <ExternalLink className="h-3 w-3" />
          </a>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {[
          ["Sepsis bundle", "surviving sepsis 2021 hour-1 bundle"],
          ["STEMI care", "STEMI primary PCI guidelines"],
          ["DKA protocol", "DKA management adult guideline"],
          ["Pain assessment", "acute pain assessment nursing"],
          ["Pressure injury", "pressure injury prevention bundle"],
          ["Fall prevention", "inpatient fall prevention bundle"],
        ].map(([label, query]) => (
          <a
            key={label}
            href={ebpSources[0].url(query)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground hover:bg-accent"
          >
            <span className="font-medium">{label}</span>
            <span className="ml-1 text-muted-foreground">→ PubMed</span>
          </a>
        ))}
      </div>
    </Box>
  );
}

type DoseRule = {
  name: string;
  category: string;
  formula: (kg: number) => { dose: string; max?: string; notes?: string };
  refQuery?: string;
};

const RULES: DoseRule[] = [
  { name: "Paracetamol (IV/PO)", category: "Analgesic",
    formula: (kg) => ({ dose: `${Math.min(15 * kg, 1000).toFixed(0)} mg q6h`, max: "≤ 4 g / 24 h", notes: "15 mg/kg" }),
    refQuery: "paracetamol dosing adult weight" },
  { name: "Ibuprofen (PO)", category: "Analgesic",
    formula: (kg) => ({ dose: `${(10 * kg).toFixed(0)} mg q8h`, max: "≤ 2.4 g / 24 h", notes: "10 mg/kg, avoid in CKD" }) },
  { name: "Morphine (IV)", category: "Opioid",
    formula: (kg) => ({ dose: `${(0.1 * kg).toFixed(1)} mg slow IV`, notes: "0.1 mg/kg titrate to effect" }),
    refQuery: "morphine titration acute pain adult" },
  { name: "Adrenaline (cardiac arrest)", category: "Resus",
    formula: (kg) => ({ dose: "1 mg IV/IO q3–5 min", notes: `Paeds: ${(0.01 * kg).toFixed(2)} mg/kg (10 µg/kg)` }),
    refQuery: "ALS adult cardiac arrest algorithm" },
  { name: "Amiodarone (VF/pVT)", category: "Resus",
    formula: () => ({ dose: "300 mg IV bolus after 3rd shock", notes: "2nd dose 150 mg if persists" }) },
  { name: "Heparin (VTE prophylaxis)", category: "Anticoagulant",
    formula: () => ({ dose: "5000 U SC q8–12h", notes: "Treatment: 80 U/kg bolus + 18 U/kg/h infusion" }) },
  { name: "Enoxaparin (prophylaxis)", category: "Anticoagulant",
    formula: (kg) => ({ dose: "40 mg SC OD", notes: `Treatment: ${(1 * kg).toFixed(0)} mg SC q12h (1 mg/kg)` }) },
  { name: "Vancomycin (loading)", category: "Antibiotic",
    formula: (kg) => ({ dose: `${(25 * kg).toFixed(0)} mg IV load`, max: "≤ 2 g", notes: "Maintenance 15–20 mg/kg per level" }),
    refQuery: "vancomycin dosing nomogram adult" },
  { name: "Insulin (DKA infusion)", category: "Endocrine",
    formula: (kg) => ({ dose: `${(0.1 * kg).toFixed(1)} U/h`, notes: "0.1 U/kg/h, hold if K+ < 3.3" }) },
  { name: "Fluid bolus (sepsis)", category: "Fluid",
    formula: (kg) => ({ dose: `${(30 * kg).toFixed(0)} mL crystalloid over 3 h`, notes: "30 mL/kg in first 3 h (Surviving Sepsis)" }),
    refQuery: "surviving sepsis fluid resuscitation 30 ml/kg" },
  { name: "Maintenance fluid (4-2-1)", category: "Fluid",
    formula: (kg) => {
      const r = kg <= 10 ? 4 * kg : kg <= 20 ? 40 + 2 * (kg - 10) : 60 + 1 * (kg - 20);
      return { dose: `${r.toFixed(0)} mL/h`, notes: "4-2-1 mL/kg/h Holliday-Segar" };
    } },
];

export function DoseCalculator({ patient }: { patient: PatientFull }) {
  const [kg, setKg] = useState<number>(70);
  const [condition, setCondition] = useState<string>("None");
  const adjusted = useMemo(() => RULES.map((r) => {
    const out = r.formula(kg);
    let warn: string | undefined;
    if (condition === "CKD / AKI" && /Ibuprofen|Enoxaparin|Vancomycin/.test(r.name))
      warn = "Renal: reduce dose / extend interval — check eGFR & levels.";
    if (condition === "Hepatic impairment" && /Paracetamol|Morphine/.test(r.name))
      warn = "Hepatic: cap paracetamol ≤ 2 g/24h; reduce opioid 25–50%.";
    if (condition === "Pregnancy" && /Ibuprofen/.test(r.name))
      warn = "Avoid NSAIDs in 3rd trimester.";
    return { ...r, out, warn };
  }), [kg, condition]);

  return (
    <Box
      title="Automatic dose calculator"
      icon={Calculator}
      accent="var(--color-tone-mint)"
      action={<span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] uppercase text-muted-foreground">weight-based</span>}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Patient weight (kg)</span>
          <input type="number" min={1} max={250} className={inputCls} value={kg} onChange={(e) => setKg(Number(e.target.value) || 0)} />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Condition modifier</span>
          <select className={inputCls} value={condition} onChange={(e) => setCondition(e.target.value)}>
            <option>None</option>
            <option>CKD / AKI</option>
            <option>Hepatic impairment</option>
            <option>Pregnancy</option>
            <option>Elderly (&gt; 75 y)</option>
          </select>
        </label>
        <div className="rounded-lg bg-secondary/60 p-3 text-xs text-secondary-foreground">
          <div className="font-semibold">{patient.name}</div>
          <div className="text-muted-foreground">{patient.age} y · {patient.sex} · {patient.dept.toUpperCase()}</div>
          <div className="mt-1">{patient.allergy ? <span className="text-destructive">Allergy: {patient.allergy.agent}</span> : "No known allergies"}</div>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="py-2 pr-3">Drug</th>
              <th className="py-2 pr-3">Class</th>
              <th className="py-2 pr-3">Calculated dose</th>
              <th className="py-2 pr-3">Max / notes</th>
              <th className="py-2 pr-3">Reference</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {adjusted.map((r) => (
              <tr key={r.name}>
                <td className="py-2 pr-3 font-medium text-foreground">{r.name}</td>
                <td className="py-2 pr-3 text-muted-foreground">{r.category}</td>
                <td className="py-2 pr-3 font-semibold" style={{ color: "var(--color-tone-sky)" }}>{r.out.dose}</td>
                <td className="py-2 pr-3 text-xs text-muted-foreground">
                  {r.out.max && <div>{r.out.max}</div>}
                  {r.out.notes && <div>{r.out.notes}</div>}
                  {r.warn && <div className="mt-1 text-destructive">⚠ {r.warn}</div>}
                </td>
                <td className="py-2 pr-3">
                  <a
                    href={ebpSources[0].url(r.refQuery || `${r.name} dosing guideline`)}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    PubMed <ExternalLink className="h-3 w-3" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">
        Decision-support only. Always verify against your local formulary and prescriber.
      </p>
    </Box>
  );
}

const KNOWN_DRUGS = new Set([
  "paracetamol", "ibuprofen", "morphine", "tramadol", "aspirin", "clopidogrel", "heparin",
  "enoxaparin", "ceftriaxone", "azithromycin", "amlodipine", "furosemide", "sevelamer",
  "insulin", "salbutamol", "ondansetron", "pantoprazole", "ranitidine", "atorvastatin",
  "bisoprolol", "meropenem", "propofol", "norepinephrine", "fentanyl", "cefazolin",
  "sevoflurane", "oxaliplatin", "bupivacaine", "gtn", "rl", "potassium", "nebulised",
  "0.9%",
]);

export function isNewDrug(name: string): boolean {
  const base = name.toLowerCase().split(/[\s(]/)[0];
  return !KNOWN_DRUGS.has(base);
}

export function NewDrugBadge({ name }: { name: string }) {
  return (
    <a
      href={ebpSources[1].url(`${name} mechanism dosing side effects`)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
      style={{
        background: "color-mix(in oklab, var(--color-tone-violet) 20%, transparent)",
        color: "var(--color-tone-violet)",
      }}
      title={`Learn about ${name}`}
    >
      <Sparkles className="h-3 w-3" /> New · Learn
    </a>
  );
}

const PROCEDURES = [
  { name: "Nasogastric tube insertion",     ebp: "NG tube placement verification adult",     icon: Stethoscope },
  { name: "Urinary catheter (Foley)",       ebp: "indwelling urinary catheter CAUTI bundle", icon: Stethoscope },
  { name: "Peripheral IV cannulation",      ebp: "peripheral IV insertion best practice",    icon: ShieldCheck },
  { name: "Central line (CVC) care",        ebp: "central line bundle CLABSI prevention",    icon: ShieldCheck },
  { name: "Arterial blood gas sampling",    ebp: "arterial blood gas sampling technique",    icon: Stethoscope },
  { name: "12-lead ECG acquisition",        ebp: "12 lead ECG electrode placement",          icon: Stethoscope },
  { name: "Endotracheal intubation assist", ebp: "RSI rapid sequence intubation checklist",  icon: Stethoscope },
  { name: "Suctioning (open / closed)",     ebp: "endotracheal suctioning best practice",    icon: Stethoscope },
  { name: "Wound dressing (aseptic)",       ebp: "aseptic non-touch technique wound",        icon: ShieldCheck },
  { name: "Blood transfusion",              ebp: "blood transfusion checklist nursing",      icon: Pill },
  { name: "CPR / BLS — adult",              ebp: "AHA BLS adult algorithm",                  icon: ShieldCheck },
  { name: "Pressure injury prevention",     ebp: "pressure injury prevention SSKIN bundle",  icon: ShieldCheck },
];

export function ProcedureGuides() {
  return (
    <Box title="Procedure quick-guides (EBP)" icon={BookOpen} accent="var(--color-tone-teal)">
      <p className="mb-3 text-xs text-muted-foreground">
        Tap a source to open the latest evidence-based reference (opens in a new tab).
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {PROCEDURES.map((p) => (
          <div key={p.name} className="rounded-xl border border-border bg-background p-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md"
                style={{ background: "color-mix(in oklab, var(--color-tone-teal) 18%, transparent)", color: "var(--color-tone-teal)" }}>
                <p.icon className="h-3.5 w-3.5" />
              </div>
              <div className="text-sm font-medium text-foreground">{p.name}</div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1">
              <a className="text-[11px] text-primary hover:underline" href={ebpSources[0].url(p.ebp)} target="_blank" rel="noopener noreferrer">PubMed</a>
              <span className="text-muted-foreground">·</span>
              <a className="text-[11px] text-primary hover:underline" href={ebpSources[1].url(p.ebp)} target="_blank" rel="noopener noreferrer">Medscape</a>
              <span className="text-muted-foreground">·</span>
              <a className="text-[11px] text-primary hover:underline" href={ebpSources[3].url(p.ebp)} target="_blank" rel="noopener noreferrer">BMJ</a>
              <span className="text-muted-foreground">·</span>
              <a className="text-[11px] text-primary hover:underline" href={ebpSources[4].url(p.ebp)} target="_blank" rel="noopener noreferrer">NICE</a>
            </div>
          </div>
        ))}
      </div>
    </Box>
  );
}
