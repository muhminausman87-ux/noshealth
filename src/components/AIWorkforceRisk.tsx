import {
  Brain, ShieldCheck, Flame, Users, CalendarClock, Sparkles,
  AlertTriangle, HeartPulse, Activity,
  CheckCircle2, ArrowRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { StatusPill } from "@/components/Widget";
import { type WorkforceSummary, workforceSignals } from "@/lib/workforce-ops";

/**
 * AI Workforce Risk & Predictive Intelligence
 * Converted to deterministic explainable signals from the prototype dataset.
 */
export function AIWorkforceRisk({ summary }: { summary: WorkforceSummary }) {
  const signals = workforceSignals(summary);

  // Derive Scheduling State
  const schedulingState = summary.openShifts > 0 
    ? { text: "Unresolved Gaps", tone: "warning" as const, reason: "Roster has unfilled shift slots." }
    : { text: "Approved", tone: "success" as const, reason: "All shifts are currently covered." };

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
              Workforce Intelligence Signals
            </h2>
            <p className="text-xs text-muted-foreground">
              Explainable operational signals derived from current shift data
            </p>
          </div>
        </div>
      </div>

      {/* Row 1 — Four deterministic index cards */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <IndexCard
          icon={ShieldCheck}
          title="Operational Coverage"
          value={`${summary.coveragePct}%`}
          tone={summary.gapHrs < 0 ? "warning" : "success"}
          explanation={summary.gapHrs < 0 
            ? `Coverage pressure: Required staffing exceeds scheduled capacity by ${Math.abs(summary.gapHrs)}h.`
            : "Coverage is adequate for the current demand."}
        />
        <IndexCard
          icon={Activity}
          title="Workload Balance"
          value={`${summary.balanceScore}/100`}
          tone={summary.balanceScore >= 85 ? "success" : summary.balanceScore >= 70 ? "warning" : "danger"}
          explanation={`Distribution is ${summary.balanceLabel.toLowerCase()}. ${summary.balanceScore < 85 ? "Consider cross-unit redistribution." : "Demand is evenly distributed."}`}
        />
        <IndexCard
          icon={CalendarClock}
          title="Scheduling State"
          value={schedulingState.text}
          tone={schedulingState.tone}
          explanation={schedulingState.reason}
        />
        <IndexCard
          icon={HeartPulse}
          title="Recovery / Wellbeing Signals"
          value="No data"
          tone="info"
          explanation="Not enough data to assess. Requires historical scheduling patterns (e.g. consecutive shifts, short recovery)."
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
                <h3 className="text-sm font-semibold">Unit Capacity Pressure</h3>
                <p className="text-xs text-muted-foreground">Derived from required vs available hours</p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {summary.units.slice(0, 3).map((u) => (
              <ShiftRiskTile 
                key={u.key}
                dept={u.key} 
                risk={u.status} 
                tone={u.zone === "critical" ? "danger" : u.zone === "watch" ? "warning" : "success"} 
                reason={`${u.reqHrs}h required vs ${u.availHrs}h available (${u.coveragePct}% coverage).`} 
              />
            ))}
          </div>

          <div className="mt-4 rounded-lg border border-dashed border-border bg-background p-3">
            <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Intelligence signals
            </div>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              {signals.slice(0, 3).map((s) => (
                <li key={s.id} className="flex items-start gap-2">
                  <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                  {s.recommendation}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <RecommendedActions signals={signals} />
      </div>

      {/* Row 3 — Executive Insights */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Workforce Intelligence Signals</h3>
              <p className="text-xs text-muted-foreground">
                Explainable operational insights
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {signals.map((s) => (
            <InsightCard
              key={s.id}
              icon={Activity}
              tone={s.tone as Tone}
              title={s.title}
              body={s.observation}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------- Index / score card ----------------
type Tone = "success" | "warning" | "danger" | "info";

function IndexCard({
  icon: Icon, title, value, tone, explanation, footer,
}: {
  icon: LucideIcon;
  title: string;
  value: string;
  tone: Tone;
  explanation: string;
  footer?: { label: string; value: string | number; tone: Tone }[];
}) {
  const toneMap: Record<Tone, { icon: string; ring: string; text: string }> = {
    success: { icon: "bg-success/15 text-success", ring: "border-success/30", text: "text-success" },
    warning: { icon: "bg-warning/20 text-warning-foreground", ring: "border-warning/40", text: "text-warning-foreground" },
    danger:  { icon: "bg-destructive/15 text-destructive", ring: "border-destructive/30", text: "text-destructive" },
    info:    { icon: "bg-primary/10 text-primary", ring: "border-primary/30", text: "text-primary" },
  };
  const t = toneMap[tone];

  return (
    <div className={`flex flex-col rounded-xl border ${t.ring} bg-card p-4 shadow-sm`}>
      <div className="flex items-start justify-between gap-2">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${t.icon}`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-1">
        <div className="text-2xl font-semibold tracking-tight text-foreground">{value}</div>
      </div>
      <div className="mt-0.5 text-xs font-medium text-foreground">{title}</div>

      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
        <span className="font-semibold text-foreground">Reason: </span>{explanation}
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
function RecommendedActions({ signals }: { signals: ReturnType<typeof workforceSignals> }) {
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
            <p className="text-xs text-muted-foreground">Derived from intelligence signals</p>
          </div>
        </div>
      </div>

      <ol className="space-y-2">
        {signals.map((s, i) => (
          <li key={s.id} className="flex items-start gap-3 rounded-lg border border-border bg-background p-2.5">
            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${toneMap[s.tone as Tone]}`}>
              <Users className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-muted-foreground">#{i + 1}</span>
                <div className="text-sm font-medium text-foreground">{s.unit}</div>
              </div>
              <div className="text-[11px] text-muted-foreground">{s.recommendation}</div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
