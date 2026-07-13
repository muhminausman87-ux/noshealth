import {
  Sparkles, AlertTriangle, TrendingDown, TrendingUp, Activity,
  Target, ShieldCheck, Zap, ArrowRight, Clock, CheckCircle2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type EDSModule = "workforce" | "workflow" | "documentation" | "excellence";

function AIBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
      <Sparkles className="h-3 w-3" /> AI Prototype
    </span>
  );
}

type Story = {
  title: string;
  subtitle: string;
  happened: string;
  why: string[];
  risk: { level: "High" | "Medium" | "Low"; text: string };
  doNext: { text: string; owner: string; eta: string }[];
  ifNothing: string;
  metrics: { label: string; value: string; trend: "up" | "down" | "flat"; tone: "good" | "bad" | "neutral" }[];
};

const STORIES: Record<EDSModule, Story> = {
  workforce: {
    title: "Executive Decision Support",
    subtitle: "Nursing Workforce Intelligence",
    happened: "Burnout risk rose 8% week-over-week; ICU, ED and Cardiac are trending amber. Voluntary turnover intent up 3.2% among nurses with <2 yrs tenure.",
    why: [
      "Consecutive high-acuity shifts in ICU (avg acuity 4.6, +0.4 vs baseline)",
      "ED boarding at 118% capacity for 6 of last 7 days",
      "62 float requests unmet in the last 14 days — mostly evening shift",
      "Overtime concentrated in 18% of nurses (Pareto violation)",
    ],
    risk: {
      level: "High",
      text: "Projected -4% bundle compliance and +22 min/nurse/shift documentation burden if unaddressed for 14 days.",
    },
    doNext: [
      { text: "Reallocate 2 float nurses to ED evening shift", owner: "Nurse Manager – ED", eta: "This shift" },
      { text: "Trigger wellbeing check-ins for 14 at-risk nurses", owner: "CNO Office", eta: "48 hrs" },
      { text: "Cap consecutive high-acuity assignments at 3", owner: "Staffing Office", eta: "This week" },
      { text: "Open retention conversation with <2 yr tenure cohort", owner: "HR Partner", eta: "7 days" },
    ],
    ifNothing:
      "Projected +11% sick calls, -6% patient satisfaction, and 3–5 avoidable resignations within 30 days.",
    metrics: [
      { label: "Burnout Index", value: "62 / 100", trend: "up", tone: "bad" },
      { label: "Fill Rate", value: "94.2%", trend: "down", tone: "bad" },
      { label: "Retention 90-day", value: "91%", trend: "flat", tone: "neutral" },
      { label: "Wellbeing Signal", value: "3.6 / 5", trend: "down", tone: "bad" },
    ],
  },
  workflow: {
    title: "Executive Decision Support",
    subtitle: "Clinical Workflow Intelligence",
    happened: "ED handoff delays up 12%; average length of stay +38 min. Med-Surg admission wait exceeds SLA on 22% of transfers.",
    why: [
      "ICU boarding blocking ED throughput (7 patients >90 min)",
      "Handoff template gaps flagged in 12 Med-Surg charts",
      "Portering delays contributing +14 min per transfer",
      "Duplicate documentation between ED and inpatient units",
    ],
    risk: {
      level: "Medium",
      text: "Continued throughput drag raises LWBS risk and pushes overtime spend up an estimated 4.1%.",
    },
    doNext: [
      { text: "Activate surge protocol – open 4 Med-Surg beds", owner: "Bed Manager", eta: "Today" },
      { text: "Deploy structured SBAR handoff template", owner: "Workflow Lead", eta: "72 hrs" },
      { text: "Auto-route porter tasks by acuity", owner: "Ops Manager", eta: "This week" },
    ],
    ifNothing:
      "Expected +2 LWBS/day, +11% overtime in ED, and a projected -5% patient experience score.",
    metrics: [
      { label: "Avg ED LOS", value: "4h 22m", trend: "up", tone: "bad" },
      { label: "Handoff Quality", value: "82%", trend: "down", tone: "bad" },
      { label: "SLA Adherence", value: "78%", trend: "down", tone: "bad" },
      { label: "Clicks / task", value: "9.4", trend: "down", tone: "good" },
    ],
  },
  documentation: {
    title: "Executive Decision Support",
    subtitle: "Intelligent Documentation",
    happened: "Documentation completeness in Med-Surg dropped to 88%. 14 charge captures pending; 9 audit-relevant fields missing.",
    why: [
      "Nurses on high-acuity assignments deferring narrative notes",
      "Handoff template gaps carry forward into inpatient documentation",
      "Duplicate entry between eMAR, procedure log and billing",
      "AI auto-suggestions disabled on 2 units",
    ],
    risk: {
      level: "High",
      text: "JCI audit readiness projected to fall from 96% to 91%; billing lag risk on 14 encounters.",
    },
    doNext: [
      { text: "Re-enable Document-Once auto-fan-out on Med-Surg", owner: "Informatics", eta: "24 hrs" },
      { text: "Prioritize 14 pending charge captures", owner: "Charge Nurse", eta: "This shift" },
      { text: "Micro-learning: SBAR + narrative completeness", owner: "Nurse Educator", eta: "7 days" },
    ],
    ifNothing:
      "Audit readiness -5%, delayed reimbursement on ~14 encounters, and increased medico-legal exposure.",
    metrics: [
      { label: "Completeness", value: "88%", trend: "down", tone: "bad" },
      { label: "Auto-fan-out", value: "76%", trend: "flat", tone: "neutral" },
      { label: "Time / note", value: "-38%", trend: "down", tone: "good" },
      { label: "Duplicate entries", value: "-64%", trend: "down", tone: "good" },
    ],
  },
  excellence: {
    title: "Executive Decision Support",
    subtitle: "Clinical Excellence Hub",
    happened: "CLABSI bundle compliance in ICU decreased to 82%. Hand hygiene audit variance widening between day and night shifts.",
    why: [
      "3 ICU nurses without recent bundle refresher",
      "Daily bundle audit documentation gap on night shift",
      "PPE stock rotation delays on 2 units",
      "New graduate cohort not yet through competency validation",
    ],
    risk: {
      level: "High",
      text: "Projected +1.4 CLABSI cases/quarter and accreditation finding risk if trend persists 21+ days.",
    },
    doNext: [
      { text: "72-hr CLABSI bundle refresher for 3 ICU nurses", owner: "IPC Lead", eta: "72 hrs" },
      { text: "Add night-shift bundle audit prompt", owner: "Quality Lead", eta: "This week" },
      { text: "Fast-track competency validation – 6 new grads", owner: "Nurse Educator", eta: "14 days" },
    ],
    ifNothing:
      "Projected HAI increase, accreditation finding at next survey, and -3% NSQI composite score.",
    metrics: [
      { label: "Bundle Compliance", value: "89%", trend: "down", tone: "bad" },
      { label: "Hand Hygiene", value: "93%", trend: "flat", tone: "neutral" },
      { label: "Competency", value: "94%", trend: "up", tone: "good" },
      { label: "Audit Readiness", value: "91%", trend: "down", tone: "bad" },
    ],
  },
};

const RISK_TONE = {
  High:   { bg: "bg-destructive/10", border: "border-destructive/30", text: "text-destructive", icon: AlertTriangle },
  Medium: { bg: "bg-warning/15",     border: "border-warning/30",     text: "text-warning-foreground", icon: AlertTriangle },
  Low:    { bg: "bg-success/10",     border: "border-success/30",     text: "text-success",     icon: ShieldCheck },
} as const;

function TrendPill({ trend, tone }: { trend: "up" | "down" | "flat"; tone: "good" | "bad" | "neutral" }) {
  const toneCls =
    tone === "good" ? "text-success bg-success/10"
    : tone === "bad" ? "text-destructive bg-destructive/10"
    : "text-muted-foreground bg-secondary";
  const Icon: LucideIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Activity;
  return (
    <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${toneCls}`}>
      <Icon className="h-3 w-3" />
    </span>
  );
}

export function ExecutiveDecisionSupport({ module }: { module: EDSModule }) {
  const s = STORIES[module];
  const risk = RISK_TONE[s.risk.level];
  const RiskIcon = risk.icon;

  return (
    <section className="rounded-2xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-5 shadow-sm">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Target className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">{s.title}</h3>
              <AIBadge />
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">{s.subtitle} · answers the five executive questions</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${risk.border} ${risk.bg} ${risk.text}`}>
          <RiskIcon className="h-3 w-3" /> {s.risk.level} risk
        </span>
      </header>

      {/* Metrics strip */}
      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {s.metrics.map((m) => (
          <div key={m.label} className="rounded-lg border border-border bg-card p-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{m.label}</span>
              <TrendPill trend={m.trend} tone={m.tone} />
            </div>
            <div className="mt-1 text-lg font-semibold text-foreground">{m.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
        <QCell icon={Activity}      title="What happened"        tone="info">{s.happened}</QCell>
        <QCell icon={Zap}            title="Why it happened"      tone="info">
          <ul className="space-y-1">
            {s.why.map((w, i) => (
              <li key={i} className="flex gap-1.5"><span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary" />{w}</li>
            ))}
          </ul>
        </QCell>
        <QCell icon={AlertTriangle} title="What is the risk"      tone="warning">{s.risk.text}</QCell>
        <QCell icon={CheckCircle2}   title="What to do next"       tone="success">
          <ul className="space-y-1.5">
            {s.doNext.map((a, i) => (
              <li key={i} className="rounded-md border border-border bg-card/60 p-1.5">
                <div className="text-[11px] font-medium text-foreground">{a.text}</div>
                <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span>{a.owner}</span>
                  <span className="inline-flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{a.eta}</span>
                </div>
              </li>
            ))}
          </ul>
        </QCell>
        <QCell icon={TrendingDown}   title="If nothing changes"    tone="danger">{s.ifNothing}</QCell>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <span className="text-[11px] font-medium text-foreground">
          AI recommends leadership brief the executive team within 24 hrs and re-evaluate at next huddle.
        </span>
        <ArrowRight className="ml-auto h-3.5 w-3.5 text-primary" />
      </div>
    </section>
  );
}

function QCell({
  icon: Icon,
  title,
  tone,
  children,
}: {
  icon: LucideIcon;
  title: string;
  tone: "info" | "warning" | "danger" | "success";
  children: React.ReactNode;
}) {
  const toneCls = {
    info:    "border-primary/25 bg-primary/5     text-primary",
    warning: "border-warning/30 bg-warning/10    text-warning-foreground",
    danger:  "border-destructive/25 bg-destructive/5 text-destructive",
    success: "border-success/25 bg-success/8     text-success",
  }[tone];
  return (
    <div className={`flex h-full flex-col rounded-xl border p-3 ${toneCls}`}>
      <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
        <Icon className="h-3.5 w-3.5" /> {title}
      </div>
      <div className="text-[11px] leading-relaxed text-foreground">{children}</div>
    </div>
  );
}
