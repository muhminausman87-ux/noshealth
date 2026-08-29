import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";

/**
 * NOS design system primitives — FROMEX Intelligent Duty Scheduling visual
 * language (calm navy/blue palette, crisp borders, dense enterprise type).
 * Presentation only: no business, AI or scheduling logic lives here.
 */

/** Page header used at the top of every NOS module. */
export function PageHeader({
  eyebrow = "NOS Workspace",
  title,
  description,
  icon: Icon,
  accent,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  accent?: string;
  actions?: ReactNode;
}) {
  const tone = accent ?? "var(--primary)";
  return (
    <header className="mb-5 flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
      <div className="flex min-w-0 items-start gap-3">
        {Icon && (
          <span
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border"
            style={{
              background: `color-mix(in srgb, ${tone} 8%, transparent)`,
              borderColor: `color-mix(in srgb, ${tone} 28%, transparent)`,
              color: tone,
            }}
          >
            <Icon className="h-4.5 w-4.5" />
          </span>
        )}
        <div className="min-w-0">
          <div className="nos-eyebrow">{eyebrow}</div>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground">{title}</h1>
          {description && (
            <p className="mt-1 max-w-3xl text-[12.5px] leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

/** Standard NOS panel/card. */
export function Panel({
  title,
  subtitle,
  icon: Icon,
  right,
  children,
  className = "",
  padded = true,
}: {
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section className={`nos-surface ${className}`}>
      {title && (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            {Icon && <Icon className="h-4 w-4 shrink-0 text-primary" />}
            <div className="min-w-0">
              <h2 className="truncate text-[13px] font-semibold tracking-tight text-foreground">
                {title}
              </h2>
              {subtitle && (
                <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </div>
          {right}
        </header>
      )}
      <div className={padded ? "p-4" : ""}>{children}</div>
    </section>
  );
}

/** Compact KPI cell used in data-dense headers. */
export function Kpi({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: StatusTone;
}) {
  return (
    <div className="nos-surface px-3.5 py-3">
      <div className="nos-eyebrow truncate">{label}</div>
      <div
        className="mt-1.5 text-[22px] font-semibold leading-none tabular-nums tracking-tight"
        style={{ color: TONE_COLOR[tone] }}
      >
        {value}
      </div>
      {hint && <div className="mt-1.5 text-[11px] leading-snug text-muted-foreground">{hint}</div>}
    </div>
  );
}

export type StatusTone = "neutral" | "success" | "warning" | "danger" | "info" | "ai";

const TONE_COLOR: Record<StatusTone, string> = {
  neutral: "var(--foreground)",
  success: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--destructive)",
  info: "var(--primary)",
  ai: "var(--ai)",
};

/** Semantic status pill: green compliant, amber attention, red risk, blue info. */
export function StatusBadge({ tone = "neutral", children }: { tone?: StatusTone; children: ReactNode }) {
  const c = TONE_COLOR[tone];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em]"
      style={{
        color: c,
        borderColor: `color-mix(in srgb, ${c} 32%, transparent)`,
        background: `color-mix(in srgb, ${c} 8%, transparent)`,
      }}
    >
      {children}
    </span>
  );
}

/** Restrained AI marker — AI recommends, professionals decide. */
export function AiChip({ label = "AI Prototype" }: { label?: string }) {
  return (
    <span className="nos-ai-chip">
      <Sparkles className="h-3 w-3" aria-hidden="true" />
      {label}
    </span>
  );
}

/** AI recommendation block with the mandatory human-authority note. */
export function AiPanel({
  title,
  label = "AI Recommendation",
  children,
  footer = "AI recommends. Authorised healthcare professionals decide.",
}: {
  title?: string;
  label?: string;
  children: ReactNode;
  footer?: string;
}) {
  return (
    <section className="nos-ai-panel p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AiChip label={label} />
          {title && <span className="text-[13px] font-semibold text-foreground">{title}</span>}
        </div>
      </div>
      <div className="text-[12.5px] leading-relaxed text-foreground">{children}</div>
      <p className="mt-3 border-t border-border pt-2 text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
        {footer}
      </p>
    </section>
  );
}

/** Horizontally scrollable wrapper for dense tables (roster benchmark). */
export function TableScroll({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-md border border-border bg-card">{children}</div>
  );
}
