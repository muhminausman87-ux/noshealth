import {
  Brain, ShieldCheck, Flame, Users, CalendarClock, Sparkles,
  TrendingUp, TrendingDown, AlertTriangle, HeartPulse, Activity,
  CheckCircle2, ArrowRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { StatusPill } from "@/components/Widget";

/**
 * AI Workforce Risk & Predictive Intelligence
 * Executive AI decision-support panel for nursing leadership.
 * All values are illustrative demo data (AI Prototype).
 */
export function AIWorkforceRisk() {
  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Brain className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold tracking-tight">
              AI Workforce Risk &amp; Predictive Intelligence
            </h2>
            <p className="text-xs text-muted-foreground">
              Decision support for nursing leadership · updated hourly
            </p>
          </div>
          <span className="ml-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
            AI Prototype
          </span>
        </div>
      </div>

      {/* Row 1 — Four predictive index cards */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <IndexCard
          icon={HeartPulse}
          title="Workforce Health Score"
          score={72}
          scale={100}
          tone="warning"
          trend="up"
          trendLabel="+3 vs last week"
          explanation="Coverage steady but rising overtime and fatigue in ICU and ED are dragging the composite index."
        />
        <IndexCard
          icon={ShieldCheck}
          title="Safe Staffing Index"
          score={81}
          scale={100}
          tone="success"
          trend="up"
          trendLabel="+2 vs last week"
          explanation="Med-Surg and Maternity at target ratios. ICU currently 0.4 nurses below safe threshold on evening shift."
          footer={[
            { label: "ICU", value: 68, tone: "warning" },
            { label: "ED", value: 74, tone: "warning" },
            { label: "Med-Surg", value: 91, tone: "success" },
          ]}
        />
        <IndexCard
          icon={Flame}
          title="Burnout Risk Index"
          score={58}
          scale={100}
          tone="warning"
          trend="up"
          trendLabel="+12 vs last week"
          explanation="Driven by missed breaks and consecutive shifts. Emergency trending toward high risk."
          footer={[
            { label: "Emergency", value: 74, tone: "danger" },
            { label: "ICU", value: 62, tone: "warning" },
            { label: "Pediatric", value: 34, tone: "success" },
          ]}
        />
        <IndexCard
          icon={Users}
          title="Workforce Stability Score"
          score={76}
          scale={100}
          tone="success"
          trend="down"
          trendLabel="-1 vs last month"
          explanation="12-month retention 91%. 16 vacancies open; recruitment pipeline covers 62% of projected need."
        />
      </div>

      {/* Row 2 — Shift Risk Prediction + Recommended Actions */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                <CalendarClock className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Shift Risk Prediction</h3>
                <p className="text-xs text-muted-foreground">Next shift · 18:00–06:00</p>
              </div>
            </div>
            <StatusPill tone="warning">AI Prototype</StatusPill>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <ShiftRiskTile dept="ICU" risk="High" tone="danger" reason="1.2× workload, 2 nurses on OT" />
            <ShiftRiskTile dept="Emergency" risk="Moderate" tone="warning" reason="Predicted admissions +18%" />
            <ShiftRiskTile dept="Med-Surg" risk="Low" tone="success" reason="Coverage at 91%" />
          </div>

          <div className="mt-4 rounded-lg border border-dashed border-border bg-background p-3">
            <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Recommended actions
            </div>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                Deploy 1 float nurse to ICU by 17:30.
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                Activate on-call list for Emergency evening shift.
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                Hold Med-Surg roster steady; use as float source if needed.
              </li>
            </ul>
          </div>
        </div>

        <RecommendedActions />
      </div>

      {/* Row 3 — Executive Insights */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">AI Executive Insights</h3>
              <p className="text-xs text-muted-foreground">
                Synthesized signals across departments · past 24h
              </p>
            </div>
          </div>
          <StatusPill tone="info">AI Prototype</StatusPill>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <InsightCard
            icon={Activity}
            tone="warning"
            title="ICU workload rising"
            body="Acuity index up 14% over 48h; two nurses approaching consecutive-shift threshold."
          />
          <InsightCard
            icon={CheckCircle2}
            tone="success"
            title="Medical Ward staffing stable"
            body="Coverage at 94% with balanced skill mix; no interventions required today."
          />
          <InsightCard
            icon={TrendingUp}
            tone="danger"
            title="Overtime up this week"
            body="Hospital-wide OT +26% MoM. ED and ICU account for 68% of the increase."
          />
          <InsightCard
            icon={Users}
            tone="warning"
            title="Two units may need float nurses"
            body="ICU and Emergency evening shifts projected below safe ratio in the next 12h."
          />
          <InsightCard
            icon={Flame}
            tone="danger"
            title="Burnout indicators rising in Emergency"
            body="Missed breaks +9 this week; fatigue score at 74. Recommend proactive check-in."
          />
        </div>
      </div>
    </section>
  );
}

// ---------------- Index / score card ----------------
type Tone = "success" | "warning" | "danger" | "info";

function IndexCard({
  icon: Icon, title, score, scale, tone, trend, trendLabel, explanation, footer,
}: {
  icon: LucideIcon;
  title: string;
  score: number;
  scale: number;
  tone: Tone;
  trend: "up" | "down";
  trendLabel: string;
  explanation: string;
  footer?: { label: string; value: number; tone: Tone }[];
}) {
  const toneMap: Record<Tone, { icon: string; ring: string; text: string; bar: string }> = {
    success: { icon: "bg-success/15 text-success", ring: "border-success/30", text: "text-success", bar: "bg-success" },
    warning: { icon: "bg-warning/20 text-warning-foreground", ring: "border-warning/40", text: "text-warning-foreground", bar: "bg-warning" },
    danger:  { icon: "bg-destructive/15 text-destructive", ring: "border-destructive/30", text: "text-destructive", bar: "bg-destructive" },
    info:    { icon: "bg-primary/10 text-primary", ring: "border-primary/30", text: "text-primary", bar: "bg-primary" },
  };
  const t = toneMap[tone];
  const pct = Math.min(100, (score / scale) * 100);
  const TrendIcon = trend === "up" ? TrendingUp : TrendingDown;

  return (
    <div className={`flex flex-col rounded-xl border ${t.ring} bg-card p-4 shadow-sm`}>
      <div className="flex items-start justify-between gap-2">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${t.icon}`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full bg-background px-2 py-0.5 text-[11px] font-medium ${t.text}`}>
          <TrendIcon className="h-3 w-3" />
          {trendLabel}
        </span>
      </div>

      <div className="mt-3 flex items-baseline gap-1">
        <div className="text-3xl font-semibold tracking-tight text-foreground">{score}</div>
        <div className="text-xs text-muted-foreground">/ {scale}</div>
      </div>
      <div className="mt-0.5 text-xs font-medium text-foreground">{title}</div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
        <div className={`h-full rounded-full ${t.bar}`} style={{ width: `${pct}%` }} />
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
        <span className="font-semibold text-foreground">AI: </span>{explanation}
      </p>

      {footer && (
        <div className="mt-3 space-y-1 border-t border-border pt-2">
          {footer.map((f) => (
            <div key={f.label} className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">{f.label}</span>
              <StatusPill tone={f.tone}>{f.value}</StatusPill>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------- Shift risk tile ----------------
function ShiftRiskTile({
  dept, risk, tone, reason,
}: { dept: string; risk: string; tone: Tone; reason: string }) {
  const bgMap: Record<Tone, string> = {
    success: "bg-success/5 border-success/30",
    warning: "bg-warning/10 border-warning/40",
    danger:  "bg-destructive/10 border-destructive/30",
    info:    "bg-primary/5 border-primary/30",
  };
  return (
    <div className={`rounded-lg border ${bgMap[tone]} p-3`}>
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">{dept}</div>
        <StatusPill tone={tone}>{risk}</StatusPill>
      </div>
      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{reason}</p>
    </div>
  );
}

// ---------------- Insight card ----------------
function InsightCard({
  icon: Icon, tone, title, body,
}: { icon: LucideIcon; tone: Tone; title: string; body: string }) {
  const toneMap: Record<Tone, string> = {
    success: "bg-success/15 text-success",
    warning: "bg-warning/20 text-warning-foreground",
    danger:  "bg-destructive/15 text-destructive",
    info:    "bg-primary/10 text-primary",
  };
  return (
    <div className="flex gap-3 rounded-lg border border-border bg-background p-3">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${toneMap[tone]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-foreground">{title}</div>
        <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}

// ---------------- Recommended Actions ----------------
function RecommendedActions() {
  const actions: { title: string; detail: string; tone: Tone; icon: LucideIcon }[] = [
    { title: "Allocate one float nurse to ICU", detail: "Cover evening shift gap", tone: "danger", icon: Users },
    { title: "Review weekend staffing", detail: "Sat–Sun projected +12% demand", tone: "warning", icon: CalendarClock },
    { title: "Recognize Medical Ward team", detail: "Sustained 94% coverage", tone: "success", icon: CheckCircle2 },
    { title: "Schedule wellbeing check-in", detail: "Emergency & ICU nurses", tone: "info", icon: HeartPulse },
    { title: "Monitor overtime", detail: "OT trending +26% MoM", tone: "warning", icon: AlertTriangle },
  ];
  const toneMap: Record<Tone, string> = {
    success: "bg-success/15 text-success",
    warning: "bg-warning/20 text-warning-foreground",
    danger:  "bg-destructive/15 text-destructive",
    info:    "bg-primary/10 text-primary",
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Recommended Actions</h3>
            <p className="text-xs text-muted-foreground">Prioritized for today</p>
          </div>
        </div>
        <StatusPill tone="info">AI Prototype</StatusPill>
      </div>

      <ol className="space-y-2">
        {actions.map((a, i) => (
          <li key={a.title} className="flex items-start gap-3 rounded-lg border border-border bg-background p-2.5">
            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${toneMap[a.tone]}`}>
              <a.icon className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-muted-foreground">#{i + 1}</span>
                <div className="text-sm font-medium text-foreground">{a.title}</div>
              </div>
              <div className="text-[11px] text-muted-foreground">{a.detail}</div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
