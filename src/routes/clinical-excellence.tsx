import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ShieldCheck, Activity, Sparkles, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown,
  Microscope, ClipboardCheck, GraduationCap, Stethoscope, Building2, Award, Target,
  Droplets, Wind, Trash2, Syringe, Bug, HandMetal, BookOpen, FileText, Users2,
  ArrowUpRight, ArrowDownRight, Gauge, Star, HeartPulse, ScrollText, FlaskConical,
} from "lucide-react";
import { EcosystemLayout } from "@/components/EcosystemLayout";
import { Widget, StatusPill } from "@/components/Widget";
import { AIIntelligenceLayer } from "@/components/AIIntelligenceLayer";

export const Route = createFileRoute("/clinical-excellence")({
  head: () => ({
    meta: [
      { title: "Clinical Excellence Hub · NOS Ecosystem" },
      { name: "description", content: "Evidence-Based Care, Infection Prevention, Patient Safety and Quality Improvement — AI-assisted clinical excellence intelligence." },
    ],
  }),
  component: ClinicalExcellencePage,
});

// -------------------- Demo data --------------------

type Trend = "up" | "down" | "flat";
type Risk = "low" | "moderate" | "high" | "critical";

const BUNDLES: {
  name: string; dept: string; compliance: number; overdue: number; trend: Trend; risk: Risk; ai: string;
}[] = [
  { name: "Sepsis Bundle",                dept: "ED / ICU",        compliance: 92, overdue: 3, trend: "up",   risk: "low",      ai: "Maintain lactate re-check adherence within 3h window." },
  { name: "CLABSI Prevention",            dept: "ICU / NICU",      compliance: 88, overdue: 5, trend: "up",   risk: "moderate", ai: "Reinforce daily line necessity review in ICU-B." },
  { name: "CAUTI Prevention",             dept: "ICU / Med-Surg",  compliance: 81, overdue: 9, trend: "down", risk: "high",     ai: "Trial nurse-driven removal protocol in Medical Ward." },
  { name: "VAP Prevention",               dept: "ICU",             compliance: 94, overdue: 1, trend: "up",   risk: "low",      ai: "Sustain HOB 30–45° audit twice per shift." },
  { name: "Pressure Injury Prevention",   dept: "All wards",       compliance: 86, overdue: 7, trend: "flat", risk: "moderate", ai: "Prioritise Braden re-score for LOS >5 days." },
  { name: "Falls Prevention",             dept: "Medical / Geri",  compliance: 83, overdue: 6, trend: "down", risk: "high",     ai: "Deploy hourly rounding tracker on Medical-3." },
  { name: "Medication Safety",            dept: "All wards",       compliance: 90, overdue: 4, trend: "up",   risk: "moderate", ai: "Focus double-check compliance on high-alert drugs." },
  { name: "Surgical Safety Checklist",    dept: "OT / Recovery",   compliance: 96, overdue: 0, trend: "up",   risk: "low",      ai: "Excellent — nominate OT for CQI recognition." },
  { name: "Stroke Bundle",                dept: "ED / Neuro",      compliance: 79, overdue: 8, trend: "down", risk: "high",     ai: "Reduce door-to-CT time; simulation drill recommended." },
  { name: "Acute Coronary Syndrome",      dept: "ED / Cardiac",    compliance: 91, overdue: 2, trend: "up",   risk: "low",      ai: "Sustain ECG within 10min; add refresher for triage." },
];

const DEPT_CARDS: {
  name: string; compliance: number; safety: number; bundles: number; docs: number; issues: number; infection: Risk;
}[] = [
  { name: "ICU",               compliance: 92, safety: 94, bundles: 90, docs: 89, issues: 3, infection: "moderate" },
  { name: "Emergency",         compliance: 87, safety: 88, bundles: 86, docs: 82, issues: 6, infection: "moderate" },
  { name: "Medical Ward",      compliance: 84, safety: 86, bundles: 82, docs: 80, issues: 7, infection: "moderate" },
  { name: "Surgical Ward",     compliance: 90, safety: 91, bundles: 89, docs: 86, issues: 4, infection: "low" },
  { name: "Operating Theatre", compliance: 96, safety: 97, bundles: 96, docs: 93, issues: 1, infection: "low" },
  { name: "Recovery (PACU)",   compliance: 93, safety: 94, bundles: 92, docs: 90, issues: 2, infection: "low" },
  { name: "NICU",              compliance: 94, safety: 96, bundles: 93, docs: 91, issues: 2, infection: "moderate" },
  { name: "PICU",              compliance: 91, safety: 93, bundles: 90, docs: 88, issues: 3, infection: "moderate" },
  { name: "Pediatrics",        compliance: 89, safety: 90, bundles: 87, docs: 85, issues: 4, infection: "low" },
  { name: "Maternity",         compliance: 92, safety: 93, bundles: 90, docs: 88, issues: 3, infection: "low" },
  { name: "Labour Room",       compliance: 90, safety: 92, bundles: 88, docs: 85, issues: 4, infection: "low" },
  { name: "Dialysis",          compliance: 88, safety: 89, bundles: 85, docs: 82, issues: 5, infection: "high" },
  { name: "Endoscopy",         compliance: 91, safety: 92, bundles: 90, docs: 87, issues: 3, infection: "moderate" },
  { name: "Cath Lab",          compliance: 93, safety: 94, bundles: 91, docs: 89, issues: 2, infection: "low" },
  { name: "Radiology",         compliance: 89, safety: 90, bundles: 86, docs: 84, issues: 3, infection: "low" },
  { name: "Laboratory",        compliance: 95, safety: 95, bundles: 93, docs: 92, issues: 1, infection: "low" },
  { name: "Blood Bank",        compliance: 97, safety: 98, bundles: 96, docs: 95, issues: 0, infection: "low" },
  { name: "CSSD",              compliance: 94, safety: 95, bundles: 93, docs: 91, issues: 2, infection: "low" },
  { name: "Pharmacy",          compliance: 96, safety: 96, bundles: 95, docs: 94, issues: 1, infection: "low" },
  { name: "OPD",               compliance: 86, safety: 87, bundles: 82, docs: 80, issues: 5, infection: "low" },
];

const IPC_METRICS = [
  { label: "Hand Hygiene",            value: 91, icon: HandMetal,   tone: "success" as const },
  { label: "Isolation Compliance",    value: 88, icon: ShieldCheck, tone: "success" as const },
  { label: "PPE Compliance",          value: 93, icon: ShieldCheck, tone: "success" as const },
  { label: "Environmental Cleaning",  value: 89, icon: Droplets,    tone: "success" as const },
  { label: "Sterilization",           value: 96, icon: FlaskConical,tone: "success" as const },
  { label: "CSSD Monitoring",         value: 94, icon: Microscope,  tone: "success" as const },
  { label: "Waste Segregation",       value: 90, icon: Trash2,      tone: "success" as const },
  { label: "Sharps Safety",           value: 92, icon: Syringe,     tone: "success" as const },
  { label: "HAI Trend (30d)",         value: 76, icon: Bug,         tone: "warning" as const, suffix: "↓" },
  { label: "Antibiotic Stewardship",  value: 84, icon: Wind,        tone: "success" as const },
  { label: "Isolation Rooms in Use",  value: 7,  icon: Building2,   tone: "info" as const,    unit: "rooms" },
  { label: "Active IPC Alerts",       value: 2,  icon: AlertTriangle,tone: "warning" as const,unit: "alerts" },
];

const NSQI = [
  { label: "Patient Falls (per 1k pt-days)",       value: "2.4",  delta: "-0.6", good: true  },
  { label: "Pressure Injuries (HAPI)",             value: "1.1",  delta: "-0.2", good: true  },
  { label: "Medication Errors (per 1k)",           value: "0.8",  delta: "-0.1", good: true  },
  { label: "Near Misses reported",                 value: "34",   delta: "+8",   good: true  },
  { label: "Patient Satisfaction (HCAHPS)",        value: "88%",  delta: "+2",   good: true  },
  { label: "Pain Assessment Compliance",           value: "94%",  delta: "+1",   good: true  },
  { label: "Hourly Rounding",                      value: "89%",  delta: "-2",   good: false },
  { label: "Nursing Documentation Quality",        value: "91%",  delta: "+3",   good: true  },
  { label: "EWS Compliance",                       value: "93%",  delta: "+1",   good: true  },
  { label: "Rapid Response Activations",           value: "18",   delta: "-4",   good: true  },
];

const AUDIT = [
  { label: "Completed Audits (Q)",   value: 128, tone: "success" as const },
  { label: "Pending Audits",         value: 24,  tone: "warning" as const },
  { label: "High-Priority Findings", value: 9,   tone: "danger"  as const },
  { label: "Corrective Actions Open",value: 17,  tone: "warning" as const },
  { label: "CAPA Closed on-time",    value: "82%", tone: "success" as const },
  { label: "Audit Compliance",       value: "90%", tone: "success" as const },
];

const EBP = [
  { label: "Clinical Guidelines",       value: 214, sub: "Active library" },
  { label: "Hospital SOPs",             value: 187, sub: "Nursing + clinical" },
  { label: "Policies",                  value: 96,  sub: "Reviewed 92%" },
  { label: "Clinical Pathways",         value: 41,  sub: "In use" },
  { label: "PICO Questions Open",       value: 12,  sub: "Under review" },
  { label: "Journal Club Sessions",     value: 8,   sub: "This quarter" },
  { label: "Evidence Updates (30d)",    value: 23,  sub: "Pushed to units" },
  { label: "Practice-Change Projects",  value: 6,   sub: "Active pilots" },
];

const COMPETENCY = [
  { label: "Mandatory Training",         value: 92, tone: "success" as const },
  { label: "Competency Validation",      value: 88, tone: "success" as const },
  { label: "Certification Expiring 60d", value: 14, tone: "warning" as const, unit: "staff" },
  { label: "Clinical Skills Verified",   value: 90, tone: "success" as const },
  { label: "Simulation Training",        value: 76, tone: "warning" as const },
  { label: "New Staff Orientation",      value: 95, tone: "success" as const },
  { label: "Annual Competency",          value: 87, tone: "success" as const },
];

const AI_ASSIST = [
  { label: "Departments requiring attention", items: ["Medical Ward — CAUTI trend", "ED — Stroke door-to-CT", "Dialysis — HAI cluster watch"] },
  { label: "High-risk bundle compliance",     items: ["Stroke Bundle · 79%", "CAUTI · 81%", "Falls · 83%"] },
  { label: "Possible infection risks",        items: ["Dialysis line-associated cluster (early signal)", "ICU-B CLABSI rate creeping upward"] },
  { label: "Documentation gaps",              items: ["Pain reassessment on Medical-3", "Braden re-score for LOS >5d"] },
  { label: "Patient safety risks",            items: ["Falls uptick on Medical evening shift", "High-alert med double-check variance"] },
  { label: "Suggested QI initiatives",        items: ["Nurse-driven CAUTI removal protocol", "Stroke drill sim in ED", "Braden PDSA cycle"] },
  { label: "Suggested EBP implementation",    items: ["Updated sepsis 2026 guideline rollout", "Chlorhexidine bathing in ICU-B"] },
  { label: "Suggested audits",                items: ["Falls process audit — Medical-3", "Line-days audit — Dialysis"] },
  { label: "Suggested staff education",       items: ["High-alert medication refresher", "Isolation don/doff simulation"] },
];

// -------------------- Helpers --------------------

const riskTone: Record<Risk, "success" | "info" | "warning" | "danger"> = {
  low: "success", moderate: "info", high: "warning", critical: "danger",
};

const TrendIcon = ({ t }: { t: Trend }) =>
  t === "up" ? <TrendingUp className="h-3.5 w-3.5 text-success" />
  : t === "down" ? <TrendingDown className="h-3.5 w-3.5 text-destructive" />
  : <span className="h-0.5 w-3 rounded bg-muted-foreground/60" />;

function Bar({ value, tone = "primary" }: { value: number; tone?: "primary" | "success" | "warning" | "danger" }) {
  const color =
    tone === "success" ? "bg-success" :
    tone === "warning" ? "bg-warning" :
    tone === "danger"  ? "bg-destructive" : "bg-primary";
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
      <div className={`h-full ${color}`} style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  );
}

// -------------------- Page --------------------

function ClinicalExcellencePage() {
  const [bundleFilter, setBundleFilter] = useState<"all" | Risk>("all");
  const bundles = useMemo(
    () => bundleFilter === "all" ? BUNDLES : BUNDLES.filter(b => b.risk === bundleFilter),
    [bundleFilter],
  );

  const execScore = 89;
  const scoreParts = [
    { k: "Quality", v: 90 }, { k: "Safety", v: 92 }, { k: "Bundles", v: 88 },
    { k: "IPC", v: 91 }, { k: "EBP", v: 84 }, { k: "Competency", v: 87 },
    { k: "Documentation", v: 89 }, { k: "Patient Safety", v: 90 },
  ];

  return (
    <EcosystemLayout>
      <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 sm:py-8">
        {/* Header */}
        <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary sm:h-14 sm:w-14">
            <Award className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Clinical Excellence Hub
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Evidence-Based Care · Infection Prevention · Patient Safety · Quality Improvement
            </p>
          </div>
          <StatusPill tone="info">Enterprise</StatusPill>
        </header>

        {/* SECTION 9 — Executive Clinical Score (put up top as command banner) */}
        <section className="mt-6 rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-card to-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Executive Clinical Score
              </h2>
            </div>
            <StatusPill tone="info">AI Prototype</StatusPill>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
            <div className="rounded-xl border border-border bg-card p-5 text-center">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Overall Score</div>
              <div className="mt-1 text-5xl font-semibold text-foreground">{execScore}</div>
              <div className="mt-1 flex items-center justify-center gap-1 text-xs text-success">
                <ArrowUpRight className="h-3.5 w-3.5" /> +3 vs last quarter
              </div>
              <div className="mt-3 text-[11px] text-muted-foreground">Hospital Benchmark: 84</div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-left">
                <div className="rounded-md bg-success/10 p-2 text-[11px]">
                  <div className="font-medium text-success">Top Performer</div>
                  <div className="text-foreground">Blood Bank · 97</div>
                </div>
                <div className="rounded-md bg-warning/15 p-2 text-[11px]">
                  <div className="font-medium text-warning-foreground">Needs Support</div>
                  <div className="text-foreground">OPD · 86</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {scoreParts.map(p => (
                <div key={p.k} className="rounded-xl border border-border bg-card p-3">
                  <div className="text-[11px] text-muted-foreground">{p.k}</div>
                  <div className="mt-0.5 text-xl font-semibold text-foreground">{p.v}</div>
                  <div className="mt-2"><Bar value={p.v} tone={p.v >= 90 ? "success" : p.v >= 80 ? "primary" : "warning"} /></div>
                </div>
              ))}
              <div className="col-span-2 rounded-xl border border-primary/20 bg-primary/5 p-3 sm:col-span-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                  <Sparkles className="h-3.5 w-3.5" /> AI Summary · AI Prototype
                </div>
                <p className="mt-1 text-sm text-foreground">
                  Overall clinical excellence is trending upward, led by OT, Blood Bank and Pharmacy.
                  Focus areas: Stroke door-to-CT, CAUTI in Medical Ward, and falls on Medical evening shift.
                  Recommend deploying nurse-driven CAUTI removal protocol and a stroke simulation drill in ED.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 1 — Bundle Compliance */}
        <section className="mt-6">
          <SectionHeader
            icon={ShieldCheck}
            title="Hospital Bundle Compliance"
            subtitle="Section 1 · Evidence-based care bundles across the hospital"
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {(["all", "low", "moderate", "high", "critical"] as const).map(f => (
              <button
                key={f}
                onClick={() => setBundleFilter(f)}
                className={`rounded-full border px-3 py-1 text-xs capitalize transition ${
                  bundleFilter === f ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-secondary"
                }`}
              >
                {f === "all" ? "All bundles" : `${f} risk`}
              </button>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {bundles.map(b => (
              <div key={b.name} className="flex flex-col rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-foreground">{b.name}</div>
                    <div className="text-[11px] text-muted-foreground">{b.dept}</div>
                  </div>
                  <StatusPill tone={riskTone[b.risk]}>{b.risk}</StatusPill>
                </div>
                <div className="mt-3 flex items-end justify-between">
                  <div className="text-2xl font-semibold text-foreground">{b.compliance}%</div>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <TrendIcon t={b.trend} /> trend
                  </div>
                </div>
                <div className="mt-1"><Bar value={b.compliance} tone={b.compliance >= 90 ? "success" : b.compliance >= 80 ? "primary" : "warning"} /></div>
                <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{b.overdue} overdue tasks</span>
                </div>
                <div className="mt-3 rounded-md bg-primary/5 p-2 text-[11px] text-foreground">
                  <span className="mr-1 rounded bg-primary/15 px-1.5 py-0.5 font-semibold uppercase tracking-wider text-primary">AI Prototype</span>
                  {b.ai}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2 — Department Quality Dashboard */}
        <section className="mt-8">
          <SectionHeader
            icon={Building2}
            title="Department Quality Dashboard"
            subtitle="Section 2 · Compliance, safety and infection risk per department"
          />
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {DEPT_CARDS.map(d => (
              <div key={d.name} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-foreground">{d.name}</div>
                  <StatusPill tone={riskTone[d.infection]}>{d.infection} risk</StatusPill>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                  <Metric label="Compliance"    value={`${d.compliance}%`} />
                  <Metric label="Safety"        value={`${d.safety}%`} />
                  <Metric label="Bundles"       value={`${d.bundles}%`} />
                  <Metric label="Docs Quality"  value={`${d.docs}%`} />
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">{d.issues} open issues</span>
                  <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 font-semibold uppercase tracking-wider text-primary">
                    <Sparkles className="h-3 w-3" /> AI Prototype
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3 — IPC */}
        <section className="mt-8">
          <SectionHeader
            icon={ShieldCheck}
            title="Infection Prevention & Control"
            subtitle="Section 3 · IPC compliance, HAI trends and alerts"
          />
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {IPC_METRICS.map(m => {
              const Icon = m.icon;
              return (
                <div key={m.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Icon className="h-4 w-4" />
                    <span className="text-[11px]">{m.label}</span>
                  </div>
                  <div className="mt-2 text-xl font-semibold text-foreground">
                    {m.value}{(m as any).unit ? "" : "%"} {(m as any).suffix ?? ""}
                    {(m as any).unit && <span className="ml-1 text-[11px] font-normal text-muted-foreground">{(m as any).unit}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 4 — NSQI */}
        <section className="mt-8">
          <SectionHeader
            icon={HeartPulse}
            title="Nursing Sensitive Quality Indicators"
            subtitle="Section 4 · Outcome-based nursing quality metrics"
          />
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {NSQI.map(n => (
              <div key={n.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="text-[11px] text-muted-foreground">{n.label}</div>
                <div className="mt-1 flex items-end justify-between">
                  <div className="text-2xl font-semibold text-foreground">{n.value}</div>
                  <span className={`inline-flex items-center gap-0.5 text-[11px] ${n.good ? "text-success" : "text-destructive"}`}>
                    {n.good ? <ArrowDownRight className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                    {n.delta}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTIONS 5 + 6 + 7 grid */}
        <section className="mt-8 grid grid-cols-1 gap-4 xl:grid-cols-3">
          {/* Audit */}
          <Widget title="Clinical Audit Center" icon={ClipboardCheck} subtitle="Section 5 · Audits, findings and CAPA">
            <div className="grid grid-cols-2 gap-2">
              {AUDIT.map(a => (
                <div key={a.label} className="rounded-lg border border-border bg-background/40 p-3">
                  <div className="text-[11px] text-muted-foreground">{a.label}</div>
                  <div className="mt-1 text-lg font-semibold text-foreground">{a.value}</div>
                  <div className="mt-1"><StatusPill tone={a.tone}>{a.tone === "danger" ? "action" : a.tone === "warning" ? "watch" : "on track"}</StatusPill></div>
                </div>
              ))}
              <div className="col-span-2 rounded-lg border border-border bg-background/40 p-3">
                <div className="text-[11px] text-muted-foreground">Top-performing departments</div>
                <div className="mt-1 text-sm text-foreground">OT · Blood Bank · Pharmacy · Laboratory</div>
              </div>
            </div>
          </Widget>

          {/* EBP */}
          <Widget title="Evidence-Based Practice" icon={BookOpen} subtitle="Section 6 · Guidelines, SOPs and practice change">
            <div className="grid grid-cols-2 gap-2">
              {EBP.map(e => (
                <div key={e.label} className="rounded-lg border border-border bg-background/40 p-3">
                  <div className="text-[11px] text-muted-foreground">{e.label}</div>
                  <div className="mt-1 text-lg font-semibold text-foreground">{e.value}</div>
                  <div className="text-[11px] text-muted-foreground">{e.sub}</div>
                </div>
              ))}
            </div>
          </Widget>

          {/* Competency */}
          <Widget title="Clinical Competency" icon={GraduationCap} subtitle="Section 7 · Training, certifications and skills">
            <div className="space-y-2">
              {COMPETENCY.map(c => (
                <div key={c.label} className="rounded-lg border border-border bg-background/40 p-3">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">{c.label}</span>
                    <StatusPill tone={c.tone}>{(c as any).unit ?? (typeof c.value === "number" ? `${c.value}%` : c.value)}</StatusPill>
                  </div>
                  {typeof c.value === "number" && !(c as any).unit && (
                    <div className="mt-2"><Bar value={c.value} tone={c.tone === "warning" ? "warning" : "success"} /></div>
                  )}
                  {(c as any).unit && (
                    <div className="mt-1 text-lg font-semibold text-foreground">{c.value} <span className="text-[11px] font-normal text-muted-foreground">{(c as any).unit}</span></div>
                  )}
                </div>
              ))}
            </div>
          </Widget>
        </section>

        {/* SECTION 8 — AI Clinical Excellence Assistant */}
        <section className="mt-8 rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/5 via-card to-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                AI Clinical Excellence Assistant
              </h2>
            </div>
            <StatusPill tone="info">AI Prototype</StatusPill>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {AI_ASSIST.map(a => (
              <div key={a.label} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Target className="h-3.5 w-3.5 text-primary" />
                  {a.label}
                </div>
                <ul className="mt-2 space-y-1.5">
                  {a.items.map(i => (
                    <li key={i} className="flex items-start gap-2 text-[12px] text-foreground">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      <span>{i}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-border bg-card p-3 text-xs text-muted-foreground">
            <span className="mr-1 rounded bg-primary/15 px-1.5 py-0.5 font-semibold uppercase tracking-wider text-primary">AI Prototype</span>
            Insights above are model-generated recommendations for demonstration only. Clinical decisions remain with the care team.
          </div>
        </section>

        {/* Philosophy footer */}
        <section className="mt-8 rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground shadow-sm">
          <div className="flex items-center gap-2 text-foreground">
            <Star className="h-4 w-4 text-primary" />
            <span className="font-semibold">Clinical Excellence through Workforce Intelligence</span>
          </div>
          <p className="mt-1">
            The objective is not only compliance — it is to improve patient outcomes, reduce infections,
            strengthen evidence-based nursing practice, support accreditation, and empower nursing
            leadership through AI-assisted quality intelligence.
          </p>
        </section>
      </main>
    </EcosystemLayout>
  );
}

function SectionHeader({ icon: Icon, title, subtitle }: { icon: typeof Award; title: string; subtitle: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-background/40 p-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}
