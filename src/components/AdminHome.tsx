import { useState } from "react";
import {
  Users, AlertTriangle, Flame, CalendarClock, Sparkles, HeartPulse,
  MessageSquare, Lightbulb, Heart, PackageSearch, GraduationCap, Workflow,
  ShieldAlert, TrendingUp, TrendingDown, Coffee, Clock, ThumbsUp,
  UserCheck, Award, Cpu, ArrowRight, CheckCircle2,
} from "lucide-react";
import { StatusPill } from "@/components/Widget";

/* ============================================================
   1. WORKFORCE PULSE — Hero KPIs
   ============================================================ */
type HeroKpi = {
  icon: any;
  label: string;
  value: string | number;
  trend: "up" | "down" | "flat";
  delta: string;
  status: "success" | "warning" | "danger" | "info";
  hint?: string;
};

const HERO_KPIS: HeroKpi[] = [
  { icon: Users,          label: "Nurses on Duty",       value: 70,      trend: "up",   delta: "+4 vs yesterday",       status: "success", hint: "7 departments" },
  { icon: AlertTriangle,  label: "Staffing Gap",         value: "9%",    trend: "up",   delta: "+2% vs last week",      status: "warning", hint: "Evening shift most affected" },
  { icon: ShieldAlert,    label: "High Priority Concerns", value: 3,     trend: "up",   delta: "+1 today",              status: "danger",  hint: "ICU · ED · Pediatric" },
  { icon: Sparkles,       label: "AI Workforce Priority Today", value: "ICU Cover", trend: "flat", delta: "Approve floater", status: "info", hint: "Auto-generated" },
];

/* ============================================================
   2. NURSE VOICE — Tabbed messages from frontline
   ============================================================ */
type VoicePriority = "high" | "medium" | "low";
type VoiceStatus = "new" | "acknowledged" | "in-progress" | "resolved";
type VoiceCategory =
  | "Shift Concerns" | "Suggestions" | "Appreciation"
  | "Product Feedback" | "Training Requests" | "Workflow Issues";

type Voice = {
  id: string;
  category: VoiceCategory;
  dept: string;
  date: string;
  priority: VoicePriority;
  title: string;
  status: VoiceStatus;
  response?: string;
};

const VOICES: Voice[] = [
  { id: "v1",  category: "Shift Concerns",   dept: "ICU",       date: "Today",    priority: "high",   title: "Night shift understaffed — 1 nurse covering 4 vents", status: "in-progress", response: "Float nurse assigned for tonight (M. Alvarez)." },
  { id: "v2",  category: "Shift Concerns",   dept: "ED",        date: "Today",    priority: "high",   title: "Triage backlog with 3 RNs during evening surge",     status: "new" },
  { id: "v3",  category: "Shift Concerns",   dept: "Pediatric", date: "Yesterday",priority: "medium", title: "Two consecutive nights without meal break",           status: "acknowledged", response: "Break coverage plan under review." },
  { id: "v4",  category: "Suggestions",      dept: "Med-Surg",  date: "Today",    priority: "medium", title: "Move handoff huddle 10 min earlier to reduce overlap gap", status: "acknowledged" },
  { id: "v5",  category: "Suggestions",      dept: "Cardiac",   date: "2d ago",   priority: "low",    title: "Add rapid response checklist to bedside dashboard",   status: "new" },
  { id: "v6",  category: "Appreciation",     dept: "Maternity", date: "Today",    priority: "low",    title: "Huge thanks to Sara for covering during emergency c-section", status: "resolved" },
  { id: "v7",  category: "Appreciation",     dept: "Cardiac",   date: "Today",    priority: "low",    title: "Team supported me through a difficult family conversation",   status: "resolved" },
  { id: "v8",  category: "Appreciation",     dept: "ICU",       date: "Yesterday",priority: "low",    title: "Charge nurse coordinated a difficult transfer flawlessly",    status: "resolved" },
  { id: "v9",  category: "Product Feedback", dept: "ED",        date: "Today",    priority: "medium", title: "eMAR takes 4 clicks to acknowledge a PRN dose",       status: "in-progress", response: "Vendor ticket #4821 raised." },
  { id: "v10", category: "Product Feedback", dept: "Med-Surg",  date: "3d ago",   priority: "low",    title: "Vitals chart sometimes shows stale timestamp",         status: "acknowledged" },
  { id: "v11", category: "Training Requests",dept: "ICU",       date: "Today",    priority: "medium", title: "Refresher on new ventilator protocol requested",       status: "new" },
  { id: "v12", category: "Training Requests",dept: "Maternity", date: "2d ago",   priority: "low",    title: "NRP recertification cohort for Q3",                    status: "acknowledged" },
  { id: "v13", category: "Workflow Issues",  dept: "ED",        date: "Today",    priority: "high",   title: "Discharge medication reconciliation delays boarding",  status: "in-progress", response: "Pharmacy huddle scheduled Fri." },
  { id: "v14", category: "Workflow Issues",  dept: "Med-Surg",  date: "Yesterday",priority: "medium", title: "Duplicate handoff documentation between EHR modules", status: "new" },
];

const VOICE_TABS: { key: VoiceCategory; icon: any }[] = [
  { key: "Shift Concerns",    icon: AlertTriangle },
  { key: "Suggestions",       icon: Lightbulb },
  { key: "Appreciation",      icon: Heart },
  { key: "Product Feedback",  icon: PackageSearch },
  { key: "Training Requests", icon: GraduationCap },
  { key: "Workflow Issues",   icon: Workflow },
];

const PRIORITY_META: Record<VoicePriority, { label: string; tone: "danger" | "warning" | "info" }> = {
  high:   { label: "High",   tone: "danger" },
  medium: { label: "Medium", tone: "warning" },
  low:    { label: "Low",    tone: "info" },
};

const STATUS_META: Record<VoiceStatus, { label: string; tone: "info" | "warning" | "success" | "danger" }> = {
  new:            { label: "New",           tone: "danger" },
  acknowledged:   { label: "Acknowledged",  tone: "warning" },
  "in-progress":  { label: "In Progress",   tone: "info" },
  resolved:       { label: "Resolved",      tone: "success" },
};

/* ============================================================
   3. NURSING INFORMATICS CHAMPIONS
   ============================================================ */
type Champion = {
  dept: string;
  name: string;
  active: boolean;
  openIssues: number;
  trainingPct: number;
  ideas: number;
};

const CHAMPIONS: Champion[] = [
  { dept: "ICU",       name: "Priya Menon",       active: true,  openIssues: 3, trainingPct: 82, ideas: 5 },
  { dept: "ED",        name: "James O'Connor",    active: true,  openIssues: 5, trainingPct: 74, ideas: 4 },
  { dept: "Med-Surg",  name: "Aisha Rahman",      active: true,  openIssues: 2, trainingPct: 91, ideas: 6 },
  { dept: "Maternity", name: "Elena Vasquez",     active: true,  openIssues: 1, trainingPct: 88, ideas: 3 },
  { dept: "Cardiac",   name: "David Park",        active: true,  openIssues: 2, trainingPct: 76, ideas: 4 },
  { dept: "Pediatric", name: "Grace Lin",         active: false, openIssues: 4, trainingPct: 45, ideas: 1 },
  { dept: "OT",        name: "Marcus Bennett",    active: true,  openIssues: 1, trainingPct: 80, ideas: 2 },
];

/* ============================================================
   4. WORKFORCE SUPPORT
   ============================================================ */
type SupportItem = {
  icon: any;
  label: string;
  value: string | number;
  trend: "up" | "down" | "flat";
  delta: string;
  tone: "success" | "warning" | "danger" | "info";
  hint?: string;
};

const SUPPORT: SupportItem[] = [
  { icon: HeartPulse, label: "Staff needing support",   value: 7,       trend: "up",   delta: "+2 this week",  tone: "warning", hint: "Check-in queue" },
  { icon: Award,      label: "Recognition opportunities", value: 12,   trend: "up",   delta: "+4",            tone: "success", hint: "Peer nominations" },
  { icon: Flame,      label: "High workload areas",     value: "ICU, ED", trend: "flat", delta: "≥ 1.3× index", tone: "danger",  hint: "Consider reallocation" },
  { icon: Coffee,     label: "Missed breaks trend",     value: "+9",    trend: "up",   delta: "vs last week",  tone: "warning", hint: "Peds & ED" },
  { icon: Clock,      label: "Overtime trend",          value: "+18%",  trend: "up",   delta: "MoM",           tone: "danger",  hint: "ICU leading" },
];

/* ============================================================
   COMPONENT
   ============================================================ */
export function AdminHome() {
  const [tab, setTab] = useState<VoiceCategory>("Shift Concerns");
  const filtered = VOICES.filter((v) => v.category === tab);
  const tabCounts = Object.fromEntries(
    VOICE_TABS.map((t) => [t.key, VOICES.filter((v) => v.category === t.key).length]),
  ) as Record<VoiceCategory, number>;

  // Hero: overall workforce health score (composite)
  const healthScore = 74;
  const scoreTone =
    healthScore >= 80 ? { label: "Healthy",  color: "hsl(var(--success))",     ring: "text-success" }
    : healthScore >= 60 ? { label: "Watch",  color: "hsl(35 90% 55%)",         ring: "text-warning-foreground" }
    :                     { label: "Critical", color: "hsl(var(--destructive))", ring: "text-destructive" };
  const circumference = 2 * Math.PI * 52;
  const dash = (healthScore / 100) * circumference;

  return (
    <div className="space-y-6">

      {/* ============ 1. WORKFORCE PULSE HERO ============ */}
      <section className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-card to-card p-5 shadow-sm sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-6">
          {/* Health Score */}
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <svg viewBox="0 0 120 120" className="h-28 w-28 -rotate-90 sm:h-32 sm:w-32">
                <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--border))" strokeWidth="10" />
                <circle
                  cx="60" cy="60" r="52" fill="none"
                  stroke={scoreTone.color} strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={`${dash} ${circumference}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className={`text-3xl font-bold sm:text-4xl ${scoreTone.ring}`}>{healthScore}</div>
                <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">/ 100</div>
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Workforce Pulse</div>
                <StatusPill tone="info">Prototype</StatusPill>
              </div>
              <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                Overall Workforce Health Score
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Status: <span className={`font-semibold ${scoreTone.ring}`}>{scoreTone.label}</span> · composite of coverage, wellbeing, and concerns.
              </p>
            </div>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {HERO_KPIS.map((c) => <HeroKpiCard key={c.label} {...c} />)}
          </div>
        </div>
      </section>

      {/* ============ 2. NURSE VOICE ============ */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                <MessageSquare className="h-4 w-4" />
              </div>
              <h2 className="text-base font-semibold tracking-tight sm:text-lg">Nurse Voice</h2>
              <StatusPill tone="info">Frontline</StatusPill>
            </div>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Direct messages from nurses — the most important signal on this dashboard.
            </p>
          </div>
          <div className="text-[11px] text-muted-foreground">
            {VOICES.length} messages · updated live
          </div>
        </header>

        {/* Tabs */}
        <div className="mt-4 -mx-1 flex gap-1.5 overflow-x-auto pb-1">
          {VOICE_TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:bg-secondary"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.key}
                <span className={`ml-0.5 rounded-full px-1.5 text-[10px] ${active ? "bg-primary/15" : "bg-secondary"}`}>
                  {tabCounts[t.key]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] border-separate border-spacing-y-1.5 text-sm">
            <thead>
              <tr className="text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-1">Message</th>
                <th className="px-3 py-1">Department</th>
                <th className="px-3 py-1">Date</th>
                <th className="px-3 py-1">Priority</th>
                <th className="px-3 py-1">Status</th>
                <th className="px-3 py-1">Manager Response</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => {
                const p = PRIORITY_META[v.priority];
                const s = STATUS_META[v.status];
                return (
                  <tr key={v.id} className="rounded-lg bg-background/60 align-top">
                    <td className="rounded-l-lg border-y border-l border-border px-3 py-2.5 text-foreground">
                      <div className="text-sm">{v.title}</div>
                      <div className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{v.category}</div>
                    </td>
                    <td className="border-y border-border px-3 py-2.5 text-xs text-muted-foreground">{v.dept}</td>
                    <td className="border-y border-border px-3 py-2.5 text-xs text-muted-foreground">{v.date}</td>
                    <td className="border-y border-border px-3 py-2.5"><StatusPill tone={p.tone}>{p.label}</StatusPill></td>
                    <td className="border-y border-border px-3 py-2.5"><StatusPill tone={s.tone}>{s.label}</StatusPill></td>
                    <td className="rounded-r-lg border-y border-r border-border px-3 py-2.5 text-xs text-muted-foreground">
                      {v.response ? v.response : <span className="italic text-muted-foreground/60">— pending —</span>}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="rounded-lg border border-dashed border-border px-3 py-8 text-center text-xs text-muted-foreground">
                    No messages in this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ============ 3. INFORMATICS CHAMPIONS + 4. SUPPORT ============ */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Champions */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
          <header className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Cpu className="h-4 w-4" />
                </div>
                <h2 className="text-base font-semibold tracking-tight sm:text-lg">Nursing Informatics Champions</h2>
                <StatusPill tone="info">Program</StatusPill>
              </div>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                Volunteer champions bridging frontline nurses with digital transformation, workflow innovation, and product feedback.
              </p>
            </div>
            <button className="hidden items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground sm:inline-flex">
              Manage program <ArrowRight className="h-3 w-3" />
            </button>
          </header>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {CHAMPIONS.map((c) => (
              <div key={c.dept} className="rounded-xl border border-border bg-background/60 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{c.dept}</div>
                    <div className="mt-0.5 truncate text-sm font-semibold text-foreground">{c.name}</div>
                  </div>
                  <StatusPill tone={c.active ? "success" : "warning"}>
                    {c.active ? "Active" : "Vacant seat"}
                  </StatusPill>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <MiniStat label="Open issues" value={c.openIssues} tone={c.openIssues > 3 ? "danger" : "info"} />
                  <MiniStat label="Ideas" value={c.ideas} tone="success" />
                  <MiniStat label="Training" value={`${c.trainingPct}%`} tone={c.trainingPct >= 75 ? "success" : "warning"} />
                </div>

                <div className="mt-2.5">
                  <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${c.trainingPct}%`,
                        background: c.trainingPct >= 75 ? "hsl(var(--success))" : "hsl(35 90% 55%)",
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Workforce Support */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <header>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-success/15 text-success">
                <UserCheck className="h-4 w-4" />
              </div>
              <h2 className="text-base font-semibold tracking-tight sm:text-lg">Workforce Support</h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Signals for supporting nurses — not surveillance.
            </p>
          </header>

          <ul className="mt-4 space-y-2.5">
            {SUPPORT.map((s) => <SupportRow key={s.label} {...s} />)}
          </ul>

          <div className="mt-4 rounded-lg border border-dashed border-border bg-background/60 p-3">
            <div className="flex items-start gap-2">
              <ThumbsUp className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              <p className="text-xs leading-relaxed text-muted-foreground">
                Recognize <span className="font-semibold text-foreground">3 nurses</span> in Maternity and Cardiac for
                peer-nominated support this week.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* ============ 5. EXECUTIVE AI SUMMARY ============ */}
      <section className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-card to-card p-5 shadow-sm">
        <header className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <h2 className="text-base font-semibold tracking-tight sm:text-lg">Executive AI Summary</h2>
            <StatusPill tone="info">AI Prototype</StatusPill>
          </div>
          <div className="text-[11px] text-muted-foreground">
            Generated {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        </header>

        <p className="mt-3 text-sm leading-relaxed text-foreground sm:text-base">
          Medical ward workload increased today with a projected 18% rise in admissions overnight.
          ICU staffing remains stable following the approved float assignment.
          <span className="font-semibold"> Two workflow concerns</span> from ED require follow-up within 24 hours.
          <span className="font-semibold"> Three appreciation messages</span> were received across Maternity and Cardiac —
          consider public recognition. One new innovation idea from the Med-Surg Informatics Champion has been submitted for review.
        </p>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryChip icon={AlertTriangle} tone="warning" label="Follow-ups"    value="2 workflow concerns" />
          <SummaryChip icon={Heart}         tone="success" label="Appreciations" value="3 to recognize" />
          <SummaryChip icon={Lightbulb}     tone="info"    label="Innovation"    value="1 new idea" />
          <SummaryChip icon={CheckCircle2}  tone="success" label="ICU"           value="Stable · covered" />
        </div>
      </section>
    </div>
  );
}

/* ---------------- Sub components ---------------- */

function HeroKpiCard({ icon: Icon, label, value, trend, delta, status, hint }: HeroKpi) {
  const statusMap = {
    success: { icon: "bg-success/15 text-success",             ring: "border-success/30",     dot: "bg-success" },
    warning: { icon: "bg-warning/20 text-warning-foreground",  ring: "border-warning/40",     dot: "bg-warning" },
    danger:  { icon: "bg-destructive/15 text-destructive",     ring: "border-destructive/30", dot: "bg-destructive" },
    info:    { icon: "bg-primary/10 text-primary",             ring: "border-primary/30",     dot: "bg-primary" },
  }[status];
  const TrendIcon = trend === "down" ? TrendingDown : TrendingUp;
  const trendColor =
    status === "success" ? "text-success"
    : status === "danger" ? "text-destructive"
    : status === "warning" ? "text-warning-foreground"
    : "text-primary";

  return (
    <div className={`rounded-xl border ${statusMap.ring} bg-card p-3 shadow-sm`}>
      <div className="flex items-start justify-between gap-2">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${statusMap.icon}`}>
          <Icon className="h-4 w-4" />
        </div>
        {trend !== "flat" && (
          <span className={`inline-flex items-center gap-0.5 rounded-full bg-background px-2 py-0.5 text-[10px] font-medium ${trendColor}`}>
            <TrendIcon className="h-3 w-3" />
            {delta}
          </span>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <div className="text-2xl font-semibold tracking-tight text-foreground">{value}</div>
        <span className={`h-1.5 w-1.5 rounded-full ${statusMap.dot}`} />
      </div>
      <div className="mt-0.5 text-xs font-medium text-foreground">{label}</div>
      {hint && <div className="mt-0.5 text-[10px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: string | number; tone: "success" | "warning" | "danger" | "info" }) {
  const toneMap = {
    success: "text-success",
    warning: "text-warning-foreground",
    danger:  "text-destructive",
    info:    "text-primary",
  }[tone];
  return (
    <div className="rounded-md bg-background px-1.5 py-1.5">
      <div className={`text-sm font-semibold ${toneMap}`}>{value}</div>
      <div className="text-[10px] leading-tight text-muted-foreground">{label}</div>
    </div>
  );
}

function SupportRow({ icon: Icon, label, value, trend, delta, tone, hint }: SupportItem) {
  const toneMap = {
    success: "bg-success/15 text-success",
    warning: "bg-warning/20 text-warning-foreground",
    danger:  "bg-destructive/15 text-destructive",
    info:    "bg-primary/10 text-primary",
  }[tone];
  const TrendIcon = trend === "down" ? TrendingDown : TrendingUp;
  const trendColor =
    tone === "success" ? "text-success"
    : tone === "danger" ? "text-destructive"
    : tone === "warning" ? "text-warning-foreground"
    : "text-primary";

  return (
    <li className="flex items-center gap-3 rounded-lg border border-border bg-background/60 p-2.5">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${toneMap}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-foreground">{label}</div>
        {hint && <div className="text-[11px] text-muted-foreground">{hint}</div>}
      </div>
      <div className="text-right">
        <div className="text-sm font-semibold text-foreground">{value}</div>
        {trend !== "flat" && (
          <div className={`inline-flex items-center gap-0.5 text-[10px] font-medium ${trendColor}`}>
            <TrendIcon className="h-3 w-3" />
            {delta}
          </div>
        )}
      </div>
    </li>
  );
}

function SummaryChip({
  icon: Icon, tone, label, value,
}: { icon: any; tone: "success" | "warning" | "danger" | "info"; label: string; value: string }) {
  const toneMap = {
    success: { bg: "bg-success/10",     text: "text-success" },
    warning: { bg: "bg-warning/15",     text: "text-warning-foreground" },
    danger:  { bg: "bg-destructive/10", text: "text-destructive" },
    info:    { bg: "bg-primary/10",     text: "text-primary" },
  }[tone];
  return (
    <div className={`flex items-center gap-2.5 rounded-lg ${toneMap.bg} px-3 py-2.5`}>
      <Icon className={`h-4 w-4 shrink-0 ${toneMap.text}`} />
      <div className="min-w-0">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="truncate text-xs font-semibold text-foreground">{value}</div>
      </div>
    </div>
  );
}
