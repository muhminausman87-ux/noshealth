import { useState } from "react";
import {
  MessageSquare, AlertTriangle, Heart, Lightbulb, ThumbsUp, ShieldAlert,
  Sparkles, Flame, Clock, Coffee, FileText, UserMinus, HeartPulse, Users,
  Send, Reply, CalendarPlus, UserPlus, ClipboardList, TrendingUp, TrendingDown,
  CheckCircle2, ArrowRight,
} from "lucide-react";
import { StatusPill } from "@/components/Widget";

type MsgTone = "concern" | "escalation" | "suggestion" | "appreciation";
type Message = {
  id: string;
  tone: MsgTone;
  dept: string;
  shift: string;
  time: string;
  preview: string;
  anon?: boolean;
};

const MESSAGES: Message[] = [
  { id: "m1", tone: "escalation", dept: "ICU",       shift: "Night",   time: "12m ago", preview: "Ventilator alarm response delayed — need extra RN cover next 24h." },
  { id: "m2", tone: "concern",    dept: "ED",        shift: "Evening", time: "48m ago", preview: "Triage backlog with only 3 RNs on floor; requesting float support.", anon: true },
  { id: "m3", tone: "appreciation", dept: "Maternity", shift: "Morning", time: "1h ago",  preview: "Huge thanks to Sara for covering my break during the emergency c-section." },
  { id: "m4", tone: "suggestion", dept: "Med-Surg",  shift: "Morning", time: "2h ago",  preview: "Suggest moving handoff huddle 10 min earlier to reduce overlap gap." },
  { id: "m5", tone: "appreciation", dept: "Cardiac", shift: "Evening", time: "3h ago",  preview: "Team supported me through a difficult family conversation — grateful." },
  { id: "m6", tone: "concern",    dept: "Pediatric", shift: "Night",   time: "4h ago",  preview: "Two consecutive nights with no proper meal break.", anon: true },
];

const TONE_META: Record<MsgTone, { label: string; color: string; icon: typeof MessageSquare; pill: "warning" | "danger" | "info" | "success" }> = {
  concern:      { label: "Concern",      color: "hsl(35 90% 55%)",  icon: AlertTriangle, pill: "warning" },
  escalation:   { label: "Escalation",   color: "hsl(0 75% 55%)",   icon: ShieldAlert,   pill: "danger" },
  suggestion:   { label: "Suggestion",   color: "hsl(210 85% 55%)", icon: Lightbulb,     pill: "info" },
  appreciation: { label: "Appreciation", color: "hsl(160 65% 45%)", icon: Heart,         pill: "success" },
};

const PULSE_CARDS = [
  { label: "Staff needing support",  value: 7,  delta: "+2",  trend: "up" as const,   icon: HeartPulse, tone: "warning" as const },
  { label: "New concerns",           value: 4,  delta: "+1",  trend: "up" as const,   icon: AlertTriangle, tone: "danger" as const },
  { label: "Appreciations received", value: 18, delta: "+6",  trend: "up" as const,   icon: Heart,      tone: "success" as const },
  { label: "Suggestions submitted",  value: 5,  delta: "0",   trend: "flat" as const, icon: Lightbulb,  tone: "info" as const },
  { label: "Wellbeing check-ins",    value: 46, delta: "+12", trend: "up" as const,   icon: CheckCircle2, tone: "success" as const },
];

const BURNOUT_THEMES = [
  { key: "Heavy workload",         value: 68, delta: +9,  icon: Flame },
  { key: "Consecutive shifts",     value: 54, delta: +12, icon: Clock },
  { key: "Missed breaks",          value: 47, delta: +6,  icon: Coffee },
  { key: "Documentation burden",   value: 41, delta: -3,  icon: FileText },
  { key: "Staffing shortage",      value: 38, delta: +8,  icon: UserMinus },
  { key: "Emotional stress",       value: 33, delta: +4,  icon: HeartPulse },
  { key: "Workplace communication",value: 22, delta: -5,  icon: MessageSquare },
];

const QUICK_ACTIONS = [
  { key: "appreciate", label: "Send Appreciation",     icon: Heart,        tone: "success" as const },
  { key: "respond",    label: "Respond to Concern",    icon: Reply,        tone: "warning" as const },
  { key: "meeting",    label: "Schedule Team Meeting", icon: CalendarPlus, tone: "info"    as const },
  { key: "request",    label: "Request Additional Staff", icon: UserPlus,  tone: "danger"  as const },
  { key: "plan",       label: "Review Staffing Plan",  icon: ClipboardList, tone: "info"   as const },
];

const TONE_TAB: { key: MsgTone | "all"; label: string }[] = [
  { key: "all",          label: "All" },
  { key: "escalation",   label: "Escalations" },
  { key: "concern",      label: "Concerns" },
  { key: "suggestion",   label: "Suggestions" },
  { key: "appreciation", label: "Appreciation" },
];

export function WorkforcePulse() {
  const [tab, setTab] = useState<MsgTone | "all">("all");
  const filtered = tab === "all" ? MESSAGES : MESSAGES.filter((m) => m.tone === tab);

  return (
    <section className="space-y-4">
      {/* Section header */}
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <HeartPulse className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">Workforce Pulse</h2>
            <StatusPill tone="info">Prototype</StatusPill>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Today's messages, wellbeing signals, and burnout themes across the hospital.
          </p>
        </div>
        <div className="hidden text-right text-[11px] text-muted-foreground sm:block">
          Anonymous themes only ·<br />no individuals identified
        </div>
      </header>

      {/* Today's Workforce Pulse — summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {PULSE_CARDS.map((c) => <PulseCard key={c.label} {...c} />)}
      </div>

      {/* Messages + AI Summary */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Messages */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Workforce Messages</h3>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                {MESSAGES.length} today
              </span>
            </div>
            <button className="hidden items-center gap-1 text-xs text-primary hover:underline sm:flex">
              View all <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {/* Filter tabs */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {TONE_TAB.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  tab === t.key
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:bg-secondary"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <ul className="mt-3 divide-y divide-border">
            {filtered.map((m) => {
              const meta = TONE_META[m.tone];
              const Icon = meta.icon;
              return (
                <li key={m.id} className="flex items-start gap-3 py-3">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: `color-mix(in oklab, ${meta.color} 15%, transparent)`, color: meta.color }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <StatusPill tone={meta.pill}>{meta.label}</StatusPill>
                      <span className="text-[11px] text-muted-foreground">
                        {m.dept} · {m.shift} · {m.time}
                        {m.anon && <span className="ml-1 rounded bg-secondary px-1.5 py-0.5 text-[10px] uppercase tracking-wider">Anon</span>}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-foreground">{m.preview}</p>
                  </div>
                  <button className="hidden shrink-0 items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] text-muted-foreground hover:bg-secondary hover:text-foreground sm:flex">
                    <Reply className="h-3 w-3" /> Reply
                  </button>
                </li>
              );
            })}
            {filtered.length === 0 && (
              <li className="py-6 text-center text-xs text-muted-foreground">No messages in this category.</li>
            )}
          </ul>
        </div>

        {/* AI Workforce Summary */}
        <div className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-card to-card p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold">AI Workforce Summary</h3>
            <StatusPill tone="info">Coming Soon</StatusPill>
          </div>

          <div className="mt-3 space-y-3 text-sm">
            <SummaryBlock
              tone="danger"
              icon={AlertTriangle}
              title="Major concerns today"
              body="ICU escalation for night cover; ED evening triage backlog; consecutive-night breaches in Pediatric."
            />
            <SummaryBlock
              tone="success"
              icon={Heart}
              title="Positive achievements"
              body="18 appreciation notes across 5 units; Maternity team recognised for c-section support; Cardiac peer support noted."
            />
            <SummaryBlock
              tone="warning"
              icon={Users}
              title="Departments needing attention"
              body="ICU, ED, Pediatric — combined wellbeing signal down 12% week-over-week."
            />
            <SummaryBlock
              tone="info"
              icon={ClipboardList}
              title="Suggested priorities"
              body="Approve ICU float request · Enforce meal-break policy on Peds night rota · Reply to 4 open concerns within 24h."
            />
          </div>
        </div>
      </div>

      {/* Burnout Insights + Manager Actions */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Burnout Insights */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-destructive" />
              <h3 className="text-sm font-semibold">Burnout Insights</h3>
              <StatusPill tone="warning">Anonymous themes</StatusPill>
            </div>
            <span className="text-[11px] text-muted-foreground">Last 7 days</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Aggregated signal strength (0–100) per theme. No individual identifiers.
          </p>

          <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {BURNOUT_THEMES.map((t) => {
              const color =
                t.value > 60 ? "hsl(0 75% 55%)"
                : t.value > 40 ? "hsl(35 90% 55%)"
                : "hsl(160 60% 45%)";
              const Icon = t.icon;
              const TrendIcon = t.delta > 0 ? TrendingUp : t.delta < 0 ? TrendingDown : TrendingUp;
              const trendClass = t.delta > 0 ? "text-destructive" : t.delta < 0 ? "text-success" : "text-muted-foreground";
              return (
                <div key={t.key} className="rounded-lg border border-border bg-background/60 p-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                      style={{ background: `color-mix(in oklab, ${color} 15%, transparent)`, color }}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1 truncate text-xs font-medium">{t.key}</div>
                    <span className={`inline-flex items-center gap-0.5 text-[10px] font-medium ${trendClass}`}>
                      <TrendIcon className="h-3 w-3" />
                      {t.delta > 0 ? `+${t.delta}` : t.delta}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full" style={{ width: `${t.value}%`, background: color }} />
                    </div>
                    <div className="w-6 text-right text-[11px] font-mono text-muted-foreground">{t.value}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Manager Actions */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Send className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Manager Actions</h3>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            One-click actions in response to today's pulse.
          </p>
          <div className="mt-3 space-y-2">
            {QUICK_ACTIONS.map((a) => {
              const toneMap = {
                success: "bg-success/15 text-success",
                warning: "bg-warning/20 text-warning-foreground",
                danger:  "bg-destructive/15 text-destructive",
                info:    "bg-primary/10 text-primary",
              }[a.tone];
              const Icon = a.icon;
              return (
                <button
                  key={a.key}
                  className="group flex w-full items-center gap-3 rounded-lg border border-border bg-background/60 px-3 py-2.5 text-left transition-colors hover:bg-secondary"
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${toneMap}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1 text-sm font-medium text-foreground">{a.label}</div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function PulseCard({
  label, value, delta, trend, icon: Icon, tone,
}: {
  label: string; value: number; delta: string; trend: "up" | "down" | "flat";
  icon: typeof HeartPulse; tone: "success" | "warning" | "danger" | "info";
}) {
  const toneMap = {
    success: "bg-success/15 text-success",
    warning: "bg-warning/20 text-warning-foreground",
    danger:  "bg-destructive/15 text-destructive",
    info:    "bg-primary/10 text-primary",
  }[tone];
  const TrendIcon = trend === "down" ? TrendingDown : TrendingUp;
  const trendClass =
    trend === "flat" ? "text-muted-foreground"
    : tone === "danger" || tone === "warning" ? "text-destructive"
    : "text-success";

  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${toneMap}`}>
          <Icon className="h-4 w-4" />
        </div>
        {trend !== "flat" && (
          <span className={`inline-flex items-center gap-0.5 text-[10px] font-medium ${trendClass}`}>
            <TrendIcon className="h-3 w-3" />
            {delta}
          </span>
        )}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{value}</div>
      <div className="text-[11px] leading-tight text-muted-foreground">{label}</div>
    </div>
  );
}

function SummaryBlock({
  tone, icon: Icon, title, body,
}: {
  tone: "success" | "warning" | "danger" | "info";
  icon: typeof Sparkles; title: string; body: string;
}) {
  const toneMap = {
    success: { bg: "bg-success/10",     text: "text-success",         bar: "bg-success" },
    warning: { bg: "bg-warning/15",     text: "text-warning-foreground", bar: "bg-warning" },
    danger:  { bg: "bg-destructive/10", text: "text-destructive",     bar: "bg-destructive" },
    info:    { bg: "bg-primary/10",     text: "text-primary",         bar: "bg-primary" },
  }[tone];
  return (
    <div className={`rounded-lg ${toneMap.bg} p-3`}>
      <div className="flex items-center gap-2">
        <Icon className={`h-3.5 w-3.5 ${toneMap.text}`} />
        <div className={`text-xs font-semibold uppercase tracking-wider ${toneMap.text}`}>{title}</div>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-foreground">{body}</p>
    </div>
  );
}
