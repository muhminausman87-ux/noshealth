import type { ReactNode } from "react";
import { Sparkles, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { LEVEL_TONE, relativeTime, type AcuityLevel, type MewsTrend, type WorkloadBreakdown } from "@/lib/fromex";

/** Every prototype intelligence output must carry this label. */
export function AiPrototype({ children }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
      <Sparkles className="h-3 w-3" aria-hidden="true" />
      {children ?? "AI Prototype"}
    </span>
  );
}

export function LevelPill({ level, label }: { level: AcuityLevel; label?: string }) {
  const tone = LEVEL_TONE[level];
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
      style={{ background: `color-mix(in oklab, ${tone} 15%, transparent)`, color: tone }}
    >
      {label ?? level}
    </span>
  );
}

export function MewsChip({ trend }: { trend: MewsTrend }) {
  if (trend.current == null) return <span className="text-[11px] text-muted-foreground">MEWS not recorded</span>;
  const Icon = trend.direction === "up" ? TrendingUp : trend.direction === "down" ? TrendingDown : Minus;
  const tone =
    trend.direction === "up"
      ? "var(--color-destructive)"
      : trend.direction === "down"
        ? "var(--color-success)"
        : "var(--color-muted-foreground)";
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium" style={{ color: tone }}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      <span>
        {trend.previous != null ? `MEWS ${trend.previous} → ${trend.current}` : `MEWS ${trend.current}`}
      </span>
      <span className="sr-only">
        {trend.direction === "up" ? "increasing" : trend.direction === "down" ? "decreasing" : "stable"}
      </span>
      {trend.since && trend.direction !== "stable" && (
        <span className="font-normal text-muted-foreground">· {relativeTime(trend.since)}</span>
      )}
    </span>
  );
}

/** Answers "why is this workload high?" — the calculation is never hidden. */
export function WorkloadExplainer({ workload }: { workload: WorkloadBreakdown }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Why this workload?
        </span>
        <AiPrototype />
      </div>
      <ul className="space-y-1">
        {workload.contributions.slice(0, 5).map((c) => (
          <li key={c.key} className="flex items-center justify-between gap-3 text-xs">
            <span className="text-foreground">{c.label}</span>
            <span className="tabular-nums text-muted-foreground">+{Math.round(c.points * 10) / 10}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Transparent weighted prototype score ({workload.score}). Not a clinically validated workload measure.
      </p>
    </div>
  );
}

export function MetricBar({ label, value, tone }: { label: string; value: number; tone?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold tabular-nums text-foreground">{value}%</span>
      </div>
      <div
        className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-label={label}
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: tone ?? "var(--color-primary)" }} />
      </div>
    </div>
  );
}
