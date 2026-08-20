import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Activity, AlertTriangle, Ambulance, Baby, Brain, ClipboardList,
  Droplets, HeartPulse, Hospital, Scissors, Sparkles, Stethoscope,
  Users, X, Building2, Gauge, ShieldCheck, TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { EcosystemLayout } from "@/components/EcosystemLayout";
import { StatusPill } from "@/components/Widget";
import { getSession, type Session } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/nursing-workforce-twin")({
  head: () => ({
    meta: [
      { title: "Nursing Workforce Digital Twin · NOS Ecosystem" },
      { name: "description", content: "Live digital twin of the hospital nursing workforce — real-time staffing, workload, burnout risk and AI recommendations by department." },
      { property: "og:title", content: "Nursing Workforce Digital Twin · NOS Ecosystem" },
      { property: "og:description", content: "Identify workforce risks before patient care is affected." },
    ],
  }),
  component: NursingWorkforceTwinPage,
});

// ---------------- Types ----------------
type Status = "stable" | "watch" | "high" | "critical";

type Dept = {
  key: string;
  name: string;
  short: string;
  icon: LucideIcon;
  onDuty: number;
  required: number;
  census: number;
  acuity: number;           // 1-5
  burnoutRisk: number;      // 0-100
  workload: number;         // 0-100
  docBurden: number;        // 0-100
  overtimeHrs: number;      // hrs this week
  sickLeave: number;        // nurses out
  floatNeeded: number;      // headcount
  healthScore: number;      // 0-100
  seniorRatio: number;      // 0-1 (senior share)
  competencyCoverage: number; // 0-100
};

const DEPTS: Dept[] = [
  { key: "icu",       name: "Intensive Care Unit",  short: "ICU",         icon: HeartPulse,   onDuty: 11, required: 14, census: 18, acuity: 4.6, burnoutRisk: 74, workload: 88, docBurden: 82, overtimeHrs: 46, sickLeave: 2, floatNeeded: 3, healthScore: 42, seniorRatio: 0.55, competencyCoverage: 88 },
  { key: "ed",        name: "Emergency Department", short: "Emergency",   icon: Ambulance,    onDuty: 13, required: 16, census: 34, acuity: 4.2, burnoutRisk: 68, workload: 84, docBurden: 71, overtimeHrs: 38, sickLeave: 1, floatNeeded: 2, healthScore: 51, seniorRatio: 0.48, competencyCoverage: 82 },
  { key: "medical",   name: "Medical Ward",         short: "Medical",     icon: Stethoscope,  onDuty: 9,  required: 10, census: 28, acuity: 3.1, burnoutRisk: 34, workload: 58, docBurden: 52, overtimeHrs: 12, sickLeave: 0, floatNeeded: 0, healthScore: 82, seniorRatio: 0.62, competencyCoverage: 91 },
  { key: "surgical",  name: "Surgical Ward",        short: "Surgical",    icon: ClipboardList,onDuty: 8,  required: 9,  census: 22, acuity: 3.4, burnoutRisk: 41, workload: 63, docBurden: 60, overtimeHrs: 16, sickLeave: 1, floatNeeded: 1, healthScore: 74, seniorRatio: 0.50, competencyCoverage: 86 },
  { key: "peds",      name: "Pediatric Ward",       short: "Pediatric",   icon: Baby,         onDuty: 7,  required: 7,  census: 14, acuity: 2.9, burnoutRisk: 28, workload: 49, docBurden: 44, overtimeHrs: 6,  sickLeave: 0, floatNeeded: 0, healthScore: 88, seniorRatio: 0.57, competencyCoverage: 92 },
  { key: "maternity", name: "Maternity",            short: "Maternity",   icon: Baby,         onDuty: 6,  required: 8,  census: 12, acuity: 3.0, burnoutRisk: 52, workload: 70, docBurden: 55, overtimeHrs: 22, sickLeave: 1, floatNeeded: 1, healthScore: 63, seniorRatio: 0.44, competencyCoverage: 80 },
  { key: "ot",        name: "Operating Theatre",    short: "OT",          icon: Scissors,     onDuty: 10, required: 12, census: 9,  acuity: 4.0, burnoutRisk: 47, workload: 72, docBurden: 58, overtimeHrs: 28, sickLeave: 1, floatNeeded: 1, healthScore: 66, seniorRatio: 0.65, competencyCoverage: 94 },
  { key: "dialysis",  name: "Dialysis Unit",        short: "Dialysis",    icon: Droplets,     onDuty: 5,  required: 6,  census: 16, acuity: 3.2, burnoutRisk: 39, workload: 61, docBurden: 49, overtimeHrs: 14, sickLeave: 0, floatNeeded: 1, healthScore: 71, seniorRatio: 0.60, competencyCoverage: 90 },
  { key: "opd",       name: "Out-Patient Dept.",    short: "OPD",         icon: Building2,    onDuty: 6,  required: 6,  census: 82, acuity: 1.8, burnoutRisk: 22, workload: 44, docBurden: 38, overtimeHrs: 4,  sickLeave: 0, floatNeeded: 0, healthScore: 90, seniorRatio: 0.50, competencyCoverage: 87 },
];

function statusOf(d: Dept): Status {
  if (d.healthScore < 50 || d.burnoutRisk >= 70 || d.required - d.onDuty >= 3) return "critical";
  if (d.healthScore < 65 || d.burnoutRisk >= 55 || d.required - d.onDuty >= 2) return "high";
  if (d.healthScore < 80 || d.burnoutRisk >= 40 || d.required - d.onDuty >= 1) return "watch";
  return "stable";
}

const STATUS_META: Record<Status, { label: string; ring: string; dot: string; badge: string; tone: "success" | "warning" | "danger" | "info" }> = {
  stable:   { label: "Stable",           ring: "ring-emerald-500/40",  dot: "bg-emerald-500",  badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", tone: "success" },
  watch:    { label: "Watch",            ring: "ring-amber-400/50",    dot: "bg-amber-400",    badge: "bg-amber-400/10 text-amber-600 border-amber-400/20",       tone: "warning" },
  high:     { label: "High Risk",        ring: "ring-orange-500/50",   dot: "bg-orange-500",   badge: "bg-orange-500/10 text-orange-600 border-orange-500/20",   tone: "warning" },
  critical: { label: "Immediate Action", ring: "ring-red-500/60",      dot: "bg-red-500",      badge: "bg-red-500/10 text-red-600 border-red-500/20",             tone: "danger"  },
};

function AIBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
      <Sparkles className="h-3 w-3" /> AI Prototype
    </span>
  );
}

function Metric({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-md border border-border/60 bg-background/40 px-2.5 py-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-semibold text-foreground">{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

function Bar({ value, tone = "primary" }: { value: number; tone?: "primary" | "warn" | "danger" | "ok" }) {
  const color =
    tone === "danger" ? "bg-red-500" :
    tone === "warn"   ? "bg-amber-500" :
    tone === "ok"     ? "bg-emerald-500" :
                        "bg-primary";
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div className={`h-full ${color}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

function DeptCard({ d, onOpen }: { d: Dept; onOpen: () => void }) {
  const status = statusOf(d);
  const meta = STATUS_META[status];
  const Icon = d.icon;
  const gap = d.required - d.onDuty;
  return (
    <button
      onClick={onOpen}
      className={`text-left rounded-xl border border-border bg-card p-4 shadow-sm ring-1 ${meta.ring} transition hover:shadow-md hover:-translate-y-0.5`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary`}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">{d.short}</div>
            <div className="text-[11px] text-muted-foreground">{d.name}</div>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${meta.badge}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
          {meta.label}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <Metric label="On Duty" value={d.onDuty} sub={`Req ${d.required}`} />
        <Metric label="Gap" value={gap > 0 ? `−${gap}` : "0"} sub={gap > 0 ? "Understaffed" : "Covered"} />
        <Metric label="Census" value={d.census} sub={`Acuity ${d.acuity.toFixed(1)}`} />
      </div>

      <div className="mt-3 space-y-2">
        <div>
          <div className="flex justify-between text-[11px] text-muted-foreground"><span>Workforce Health</span><span>{d.healthScore}</span></div>
          <Bar value={d.healthScore} tone={d.healthScore < 50 ? "danger" : d.healthScore < 70 ? "warn" : "ok"} />
        </div>
        <div>
          <div className="flex justify-between text-[11px] text-muted-foreground"><span>Burnout Risk</span><span>{d.burnoutRisk}%</span></div>
          <Bar value={d.burnoutRisk} tone={d.burnoutRisk >= 60 ? "danger" : d.burnoutRisk >= 40 ? "warn" : "ok"} />
        </div>
        <div>
          <div className="flex justify-between text-[11px] text-muted-foreground"><span>Workload</span><span>{d.workload}</span></div>
          <Bar value={d.workload} tone={d.workload >= 75 ? "danger" : d.workload >= 55 ? "warn" : "ok"} />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5 text-[10px]">
        <span className="rounded-md bg-muted px-1.5 py-0.5">Docs {d.docBurden}</span>
        <span className="rounded-md bg-muted px-1.5 py-0.5">OT {d.overtimeHrs}h</span>
        <span className="rounded-md bg-muted px-1.5 py-0.5">Sick {d.sickLeave}</span>
        <span className="rounded-md bg-muted px-1.5 py-0.5">Float +{d.floatNeeded}</span>
      </div>
    </button>
  );
}

function DetailDrawer({ d, onClose }: { d: Dept; onClose: () => void }) {
  const meta = STATUS_META[statusOf(d)];
  const Icon = d.icon;
  const gap = d.required - d.onDuty;
  const juniorRatio = 1 - d.seniorRatio;
  const shiftRisk =
    d.burnoutRisk >= 65 || gap >= 2 ? "High" :
    d.burnoutRisk >= 45 || gap >= 1 ? "Elevated" : "Low";
  const predicted = Math.min(100, Math.round(d.workload * (1 + (gap > 0 ? 0.08 * gap : 0))));

  const recs = [
    gap > 0 && `Reallocate ${gap} float nurse${gap > 1 ? "s" : ""} from OPD / Medical Ward to close the staffing gap this shift.`,
    d.burnoutRisk >= 60 && `Rotate ${Math.max(1, Math.round(d.onDuty * 0.15))} high-burnout nurses off consecutive shifts within 48 hours.`,
    d.docBurden >= 60 && `Enable voice-assisted documentation for high-acuity patients to cut charting time by ~22%.`,
    d.seniorRatio < 0.5 && `Pair junior nurses with senior mentors — junior share is ${(juniorRatio * 100).toFixed(0)}%.`,
    d.competencyCoverage < 90 && `Schedule micro-training for competencies below 90% coverage.`,
  ].filter(Boolean) as string[];

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <aside className="h-full w-full max-w-lg overflow-y-auto border-l border-border bg-card shadow-2xl">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-2 border-b border-border bg-card/95 p-5 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">{d.name}</div>
              <div className="mt-0.5 flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${meta.badge}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} /> {meta.label}
                </span>
                <span className="text-[11px] text-muted-foreground">Workforce Overview</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="space-y-5 p-5">
          <section>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Current Staffing</h4>
            <div className="grid grid-cols-2 gap-2">
              <Metric label="On Duty" value={d.onDuty} sub={`Required ${d.required}`} />
              <Metric label="Staffing Gap" value={gap > 0 ? `−${gap}` : "Covered"} />
              <Metric label="Patient Census" value={d.census} sub={`Acuity ${d.acuity.toFixed(1)} / 5`} />
              <Metric label="Float Requirement" value={`+${d.floatNeeded}`} />
              <Metric label="Overtime (wk)" value={`${d.overtimeHrs}h`} />
              <Metric label="Sick Leave" value={d.sickLeave} />
            </div>
          </section>

          <section>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Experience Mix</h4>
            <div className="rounded-lg border border-border/60 bg-background/40 p-3">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Senior {(d.seniorRatio * 100).toFixed(0)}%</span>
                <span>Junior {(juniorRatio * 100).toFixed(0)}%</span>
              </div>
              <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-muted">
                <div className="bg-primary" style={{ width: `${d.seniorRatio * 100}%` }} />
                <div className="bg-primary/40" style={{ width: `${juniorRatio * 100}%` }} />
              </div>
              <div className="mt-2 text-[11px] text-muted-foreground">Junior/Senior ratio {(juniorRatio / Math.max(0.01, d.seniorRatio)).toFixed(2)} : 1</div>
            </div>
          </section>

          <section>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Competency Coverage</h4>
            <div className="rounded-lg border border-border/60 bg-background/40 p-3">
              <div className="flex justify-between text-xs"><span>Overall</span><span className="font-semibold">{d.competencyCoverage}%</span></div>
              <div className="mt-1"><Bar value={d.competencyCoverage} tone={d.competencyCoverage >= 90 ? "ok" : d.competencyCoverage >= 80 ? "warn" : "danger"} /></div>
              <ul className="mt-3 space-y-1.5 text-[11px] text-muted-foreground">
                <li className="flex justify-between"><span>Critical Care Skills</span><span>{Math.min(100, d.competencyCoverage + 2)}%</span></li>
                <li className="flex justify-between"><span>Medication Safety</span><span>{Math.min(100, d.competencyCoverage - 1)}%</span></li>
                <li className="flex justify-between"><span>Infection Prevention</span><span>{Math.min(100, d.competencyCoverage - 4)}%</span></li>
              </ul>
            </div>
          </section>

          <section className="rounded-lg border border-primary/20 bg-primary/5 p-3">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-primary flex items-center gap-2"><Brain className="h-3.5 w-3.5" /> AI Staffing Recommendation</h4>
              <AIBadge />
            </div>
            <ul className="space-y-1.5 text-xs text-foreground">
              {recs.length ? recs.map((r, i) => (
                <li key={i} className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" /><span>{r}</span></li>
              )) : <li className="text-muted-foreground">No action required — unit is operating within safe thresholds.</li>}
            </ul>
          </section>

          <section className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border/60 p-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5" /> Shift Risk</span>
                <AIBadge />
              </div>
              <div className="mt-1 text-lg font-semibold text-foreground">{shiftRisk}</div>
              <div className="text-[11px] text-muted-foreground">Based on burnout, gap and acuity signals.</div>
            </div>
            <div className="rounded-lg border border-border/60 p-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5" /> Predicted Workload</span>
                <AIBadge />
              </div>
              <div className="mt-1 text-lg font-semibold text-foreground">{predicted}</div>
              <Bar value={predicted} tone={predicted >= 80 ? "danger" : predicted >= 60 ? "warn" : "ok"} />
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}

function NursingWorkforceTwinPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const s = getSession();
    if (!s) navigate({ to: "/login" });
    else setSession(s);
  }, [navigate]);

  const summary = useMemo(() => {
    const groups: Record<Status, number> = { stable: 0, watch: 0, high: 0, critical: 0 };
    let onDuty = 0, required = 0, floatNeeded = 0;
    for (const d of DEPTS) {
      groups[statusOf(d)]++;
      onDuty += d.onDuty; required += d.required; floatNeeded += d.floatNeeded;
    }
    const avgHealth = Math.round(DEPTS.reduce((s, d) => s + d.healthScore, 0) / DEPTS.length);
    const avgBurnout = Math.round(DEPTS.reduce((s, d) => s + d.burnoutRisk, 0) / DEPTS.length);
    return { groups, onDuty, required, floatNeeded, avgHealth, avgBurnout };
  }, []);

  if (!session) return null;
  const selectedDept = DEPTS.find((d) => d.key === selected) || null;

  return (
    <EcosystemLayout>
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
        {/* Header */}
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Hospital className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">Nursing Workforce Digital Twin</h1>
                <p className="text-xs text-muted-foreground">Live digital representation of the hospital nursing workforce.</p>
              </div>
            </div>
          </div>
          <AIBadge />
        </header>

        {/* Hospital pulse strip */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Users className="h-3.5 w-3.5" /> Nurses On Duty</div>
            <div className="mt-1 text-xl font-semibold">{summary.onDuty}<span className="text-sm text-muted-foreground"> / {summary.required}</span></div>
            <div className="text-[11px] text-muted-foreground">Gap {summary.required - summary.onDuty} · Float needed +{summary.floatNeeded}</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Gauge className="h-3.5 w-3.5" /> Avg Workforce Health</div>
            <div className="mt-1 text-xl font-semibold">{summary.avgHealth}</div>
            <Bar value={summary.avgHealth} tone={summary.avgHealth < 60 ? "danger" : summary.avgHealth < 75 ? "warn" : "ok"} />
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Activity className="h-3.5 w-3.5" /> Avg Burnout Risk</div>
            <div className="mt-1 text-xl font-semibold">{summary.avgBurnout}%</div>
            <Bar value={summary.avgBurnout} tone={summary.avgBurnout >= 55 ? "danger" : summary.avgBurnout >= 35 ? "warn" : "ok"} />
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5" /> Department Status</div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {(["stable", "watch", "high", "critical"] as Status[]).map((s) => (
                <span key={s} className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] ${STATUS_META[s].badge}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${STATUS_META[s].dot}`} />{summary.groups[s]} {STATUS_META[s].label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground">
          <span className="font-medium text-foreground">Status legend:</span>
          {(["stable", "watch", "high", "critical"] as Status[]).map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${STATUS_META[s].dot}`} />{STATUS_META[s].label}
            </span>
          ))}
          <span className="ml-auto">Click a department for the full workforce overview.</span>
        </div>

        {/* Department grid */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DEPTS.map((d) => (
            <DeptCard key={d.key} d={d} onOpen={() => setSelected(d.key)} />
          ))}
        </section>

        {/* AI executive summary */}
        <section className="rounded-xl border border-primary/20 bg-primary/5 p-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Brain className="h-4 w-4 text-primary" /> AI Twin Summary</h3>
            <AIBadge />
          </div>
          <p className="text-sm text-foreground">
            ICU and Emergency are trending toward <span className="font-semibold text-red-600">immediate action</span> — combined
            staffing gap of 6 nurses with burnout risk above 65%. Reallocate 3 float nurses from OPD and Medical Ward
            for the next shift, rotate 4 high-risk ICU nurses off consecutive nights, and enable voice-assisted
            documentation in ED to reduce charting load by an estimated 22%. Maternity should be watched for the
            afternoon rise in acuity.
          </p>
        </section>

        <p className="text-center text-[11px] text-muted-foreground">
          Demo data only · No backend logic · AI insights are illustrative prototypes
        </p>
      </div>

      {selectedDept && <DetailDrawer d={selectedDept} onClose={() => setSelected(null)} />}
    </EcosystemLayout>
  );
}
