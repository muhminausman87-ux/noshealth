import {
  Activity, AlertTriangle, ArrowRight, Bell, Brain, CheckCircle2,
  ClipboardList, Clock, FlaskConical, Hospital, Radio, Sparkles,
  Stethoscope, Sun, Sunrise, Sunset, Moon, Target, TrendingUp,
  UserMinus, UserPlus, Users, Workflow, Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { StatusPill } from "@/components/Widget";

/**
 * AI Nursing Operations Center
 * Executive command center for Chief Nursing Officers and Nursing Managers.
 * Connects Workforce Intelligence with Clinical Workflow Intelligence.
 */
export function AIOperationsCenter() {
  return (
    <section className="space-y-5 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card p-5 shadow-sm sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                AI Nursing Operations Center
              </h2>
              <StatusPill tone="info">AI Prototype</StatusPill>
            </div>
            <p className="text-xs text-muted-foreground">
              Command center for CNOs and Nursing Managers · Workforce × Clinical Workflow Intelligence
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusPill tone="success">
            <span className="mr-1 h-1.5 w-1.5 animate-pulse rounded-full bg-success" /> Live
          </StatusPill>
          <span className="text-[11px] text-muted-foreground">Updated · just now</span>
        </div>
      </header>

      <HospitalAtAGlance />
      <div className="grid gap-4 lg:grid-cols-2">
        <LiveOperationalAlerts />
        <WorkforceWorkflowCorrelation />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <LeadershipActions />
        <OperationalTimeline />
      </div>
      <ExecutiveAIBriefing />
    </section>
  );
}

// ---------------- 1. Hospital At a Glance ----------------
const GLANCE: {
  label: string; value: string | number; icon: LucideIcon; tone: "info" | "warning" | "danger" | "success"; hint?: string;
}[] = [
  { label: "Nurses on Duty",              value: 70,  icon: Users,          tone: "info",    hint: "Across 7 units" },
  { label: "Staff Shortage",              value: 6,   icon: UserMinus,      tone: "warning", hint: "2 ICU · 3 ED · 1 Med-Surg" },
  { label: "Open Shifts",                 value: 12,  icon: Clock,          tone: "danger",  hint: "Next 72h" },
  { label: "High Acuity Units",           value: 3,   icon: Activity,       tone: "danger",  hint: "ICU · ED · Cardiac" },
  { label: "Departments Needing Support", value: 2,   icon: Hospital,       tone: "warning", hint: "ED · Med-Surg" },
  { label: "Delayed Clinical Tasks",      value: 9,   icon: Workflow,       tone: "warning", hint: "5 meds · 4 documentation" },
  { label: "Critical Lab Results",        value: 2,   icon: FlaskConical,   tone: "danger",  hint: "Awaiting acknowledgement" },
  { label: "Pending Radiology Reports",   value: 7,   icon: Radio,          tone: "info",    hint: "3 STAT" },
];

function UserMinusIcon(props: any) {
  // fallback icon alias
  return <Users {...props} />;
}

function HospitalAtAGlance() {
  return (
    <div>
      <SubHeader icon={Hospital} title="Hospital At a Glance" subtitle="Real-time operational snapshot" />
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
        {GLANCE.map((g) => (
          <div key={g.label} className="rounded-lg border border-border bg-background p-3">
            <div className="flex items-start justify-between gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-md ${toneBg(g.tone)}`}>
                <g.icon className="h-4 w-4" />
              </div>
              <div className="text-right">
                <div className="text-xl font-bold leading-none text-foreground">{g.value}</div>
              </div>
            </div>
            <div className="mt-2 text-[11px] font-medium text-foreground">{g.label}</div>
            {g.hint && <div className="text-[10px] text-muted-foreground">{g.hint}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------- 2. Live Operational Alerts ----------------
type Priority = "Critical" | "High" | "Medium";
const ALERTS: { title: string; detail: string; priority: Priority; icon: LucideIcon; source: string }[] = [
  { title: "ICU workload increasing",                     detail: "Workload index 1.24× — trending up over last 90 min.", priority: "High",     icon: Activity,      source: "Workforce" },
  { title: "Medical Ward understaffed",                   detail: "Coverage at 78% for evening shift. 2 open slots.",     priority: "High",     icon: Users,         source: "Workforce" },
  { title: "Emergency Department high admissions",        detail: "18 admissions in last 4h — 42% above forecast.",       priority: "Critical", icon: Hospital,      source: "Workflow"  },
  { title: "Two critical lab results awaiting ack",       detail: "Bed 7 (K+ 6.8) · Bed 12 (Troponin ↑).",                priority: "Critical", icon: FlaskConical,  source: "Clinical"  },
  { title: "Delayed wound review",                        detail: "Med-Surg — 3 dressings past scheduled window.",        priority: "Medium",   icon: Workflow,      source: "Workflow"  },
  { title: "IV Team request pending",                     detail: "2 difficult IV requests unassigned > 25 min.",         priority: "Medium",   icon: Zap,           source: "Workflow"  },
];

function LiveOperationalAlerts() {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <SubHeader icon={Bell} title="Live Operational Alerts" subtitle="Prioritized by clinical & workforce impact" />
      <ul className="space-y-2">
        {ALERTS.map((a) => (
          <li key={a.title} className="flex items-start gap-3 rounded-lg border border-border bg-background p-3">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${priorityBg(a.priority)}`}>
              <a.icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{a.title}</span>
                <PriorityPill p={a.priority} />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{a.source}</span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{a.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------------- 3. Workforce & Workflow Correlation ----------------
const CORRELATIONS: { cause: string; effect: string; strength: number; icon: LucideIcon }[] = [
  { cause: "High overtime",       effect: "Increased documentation delay", strength: 82, icon: Clock },
  { cause: "High admissions",     effect: "Increased missed breaks",       strength: 74, icon: Hospital },
  { cause: "Staff shortage",      effect: "Increased delayed medications", strength: 88, icon: Users },
  { cause: "High patient acuity", effect: "Increased burnout risk",        strength: 79, icon: Activity },
];

function WorkforceWorkflowCorrelation() {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <SubHeader icon={Sparkles} title="Workforce & Workflow Correlation" subtitle="AI-detected operational relationships" noMargin />
        <StatusPill tone="info">AI Prototype</StatusPill>
      </div>
      <ul className="space-y-2.5">
        {CORRELATIONS.map((c) => (
          <li key={c.cause} className="rounded-lg border border-border bg-background p-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                <c.icon className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-semibold text-foreground">{c.cause}</span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-foreground">{c.effect}</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${c.strength}%`,
                    background: c.strength >= 80 ? "hsl(0 75% 55%)" : c.strength >= 70 ? "hsl(35 85% 55%)" : "hsl(210 85% 55%)",
                  }}
                />
              </div>
              <span className="w-20 text-right text-[10px] font-mono text-muted-foreground">
                {c.strength}% correlation
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------------- 4. Leadership Actions ----------------
const ACTIONS: { label: string; detail: string; icon: LucideIcon; tone: "danger" | "warning" | "info" | "success" }[] = [
  { label: "Deploy float nurse",         detail: "1 nurse → ICU evening shift",       icon: UserPlus,     tone: "danger"  },
  { label: "Approve overtime",           detail: "ED · 2 nurses · 4h coverage",       icon: Clock,        tone: "warning" },
  { label: "Recognize ICU team",         detail: "Sustained 94% coverage this week",  icon: CheckCircle2, tone: "success" },
  { label: "Review Emergency staffing",  detail: "Admissions +42% vs forecast",       icon: Hospital,     tone: "warning" },
  { label: "Contact Wound Care Team",    detail: "3 delayed reviews on Med-Surg",     icon: Stethoscope,  tone: "info"    },
  { label: "Schedule wellbeing round",   detail: "ED · early fatigue signals",        icon: Target,       tone: "warning" },
];

function LeadershipActions() {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <SubHeader icon={ClipboardList} title="Leadership Actions" subtitle="Recommended next steps for the shift" />
      <div className="grid gap-2 sm:grid-cols-2">
        {ACTIONS.map((a) => (
          <button
            key={a.label}
            className="group flex items-start gap-3 rounded-lg border border-border bg-background p-3 text-left transition hover:border-primary/40 hover:bg-primary/5"
          >
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${toneBg(a.tone)}`}>
              <a.icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-foreground">{a.label}</div>
              <div className="text-[11px] text-muted-foreground">{a.detail}</div>
            </div>
            <ArrowRight className="mt-1 h-3.5 w-3.5 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------- 5. Today's Operational Timeline ----------------
type TStatus = "Completed" | "Pending" | "Delayed" | "Escalated";
const TIMELINE: { period: string; icon: LucideIcon; items: { label: string; status: TStatus }[] }[] = [
  {
    period: "Morning", icon: Sunrise, items: [
      { label: "Shift handover · all units",           status: "Completed" },
      { label: "AM medication round",                  status: "Completed" },
      { label: "Lab collections cluster",              status: "Completed" },
    ],
  },
  {
    period: "Afternoon", icon: Sun, items: [
      { label: "Wound care reviews · Med-Surg",        status: "Delayed"   },
      { label: "Radiology transports",                 status: "Pending"   },
      { label: "Discharge planning huddle",            status: "Completed" },
    ],
  },
  {
    period: "Evening", icon: Sunset, items: [
      { label: "ED surge coverage",                    status: "Escalated" },
      { label: "PM medication round",                  status: "Pending"   },
      { label: "Documentation catch-up",               status: "Delayed"   },
    ],
  },
  {
    period: "Night", icon: Moon, items: [
      { label: "Night shift briefing",                 status: "Pending"   },
      { label: "Overnight rounds cadence",             status: "Pending"   },
      { label: "Critical result monitoring",           status: "Pending"   },
    ],
  },
];

function OperationalTimeline() {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <SubHeader icon={TrendingUp} title="Today's Operational Timeline" subtitle="Cross-department cadence · Morning → Night" />
      <div className="space-y-3">
        {TIMELINE.map((slot) => (
          <div key={slot.period} className="flex gap-3">
            <div className="flex w-20 shrink-0 flex-col items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                <slot.icon className="h-4 w-4" />
              </div>
              <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {slot.period}
              </div>
            </div>
            <div className="flex-1 space-y-1.5">
              {slot.items.map((it) => (
                <div key={it.label} className="flex items-center justify-between gap-2 rounded-md border border-border bg-background px-2.5 py-1.5">
                  <span className="text-xs text-foreground">{it.label}</span>
                  <TimelinePill s={it.status} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------- 6. Executive AI Briefing ----------------
function ExecutiveAIBriefing() {
  return (
    <div className="rounded-xl border border-primary/25 bg-gradient-to-br from-primary/8 via-card to-card p-5">
      <div className="mb-3 flex items-start justify-between gap-2">
        <SubHeader icon={Brain} title="Executive AI Briefing" subtitle="Concise summary for the CNO desk" noMargin />
        <StatusPill tone="info">AI Prototype</StatusPill>
      </div>
      <p className="text-sm leading-relaxed text-foreground">
        Hospital workforce remains <span className="font-semibold">stable overall</span>. ICU requires
        additional staffing support for the evening shift. Documentation delays increased during the
        evening window driven by higher overtime hours. Emergency admissions are running{" "}
        <span className="font-semibold">above expected levels</span> (+42% vs forecast). Two critical
        lab results are awaiting acknowledgement and should be escalated immediately. Recommend
        reviewing float pool allocation, approving targeted overtime for ED, and recognizing the
        Medical Ward team for excellent workflow performance this week.
      </p>
      <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3">
        <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">
          <Sparkles className="h-3.5 w-3.5" /> Generate full briefing
        </button>
        <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary">
          Share with leadership
        </button>
        <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary">
          Export PDF
        </button>
      </div>
    </div>
  );
}

// ---------------- helpers ----------------
function SubHeader({
  icon: Icon, title, subtitle, noMargin,
}: { icon: LucideIcon; title: string; subtitle?: string; noMargin?: boolean }) {
  return (
    <div className={`flex items-center gap-2.5 ${noMargin ? "" : "mb-3"}`}>
      <Icon className="h-4 w-4 text-primary" />
      <div>
        <h3 className="text-sm font-semibold tracking-tight text-foreground">{title}</h3>
        {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}

function toneBg(tone: "info" | "warning" | "danger" | "success") {
  return tone === "danger"  ? "bg-destructive/15 text-destructive" :
         tone === "warning" ? "bg-warning/20 text-warning-foreground" :
         tone === "success" ? "bg-success/15 text-success" :
                              "bg-primary/10 text-primary";
}

function priorityBg(p: Priority) {
  return p === "Critical" ? "bg-destructive/15 text-destructive" :
         p === "High"     ? "bg-warning/20 text-warning-foreground" :
                            "bg-primary/10 text-primary";
}

function PriorityPill({ p }: { p: Priority }) {
  const tone = p === "Critical" ? "danger" : p === "High" ? "warning" : "info";
  return <StatusPill tone={tone}>{p}</StatusPill>;
}

function TimelinePill({ s }: { s: TStatus }) {
  const tone =
    s === "Completed" ? "success" :
    s === "Pending"   ? "info" :
    s === "Delayed"   ? "warning" : "danger";
  const Icon =
    s === "Completed" ? CheckCircle2 :
    s === "Pending"   ? Clock :
    s === "Delayed"   ? AlertTriangle : Zap;
  return (
    <StatusPill tone={tone as any}>
      <Icon className="h-3 w-3" /> {s}
    </StatusPill>
  );
}
