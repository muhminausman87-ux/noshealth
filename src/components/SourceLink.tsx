import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Info } from "lucide-react";
import { SOURCE_ROUTES, type IaLayer } from "@/lib/ia-map";

/**
 * Contextual entry point into the module that OWNS a piece of functionality.
 * Used instead of reproducing another module's dashboard.
 */
export function SourceLink({
  layer,
  label,
  className = "",
}: {
  layer: IaLayer;
  label?: string;
  className?: string;
}) {
  const src = SOURCE_ROUTES[layer];
  return (
    <Link
      to={src.route}
      className={`inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline ${className}`}
    >
      {label ?? `View ${src.label}`}
      <ArrowUpRight className="h-3.5 w-3.5" />
    </Link>
  );
}

/**
 * A one-line signal from another domain: severity + summary + link to source.
 * Deliberately does NOT render the source module's full feature set.
 */
export function ContextualSignal({
  layer,
  title,
  detail,
  tone = "neutral",
  linkLabel,
  meta,
}: {
  layer: IaLayer;
  title: string;
  detail?: string;
  tone?: "neutral" | "info" | "warning" | "danger" | "success";
  linkLabel?: string;
  meta?: string;
}) {
  const toneMap: Record<string, string> = {
    neutral: "border-border bg-card",
    info: "border-primary/25 bg-primary/[0.04]",
    warning: "border-warning/35 bg-warning/10",
    danger: "border-destructive/30 bg-destructive/[0.06]",
    success: "border-success/30 bg-success/[0.06]",
  };
  return (
    <div className={`flex items-start gap-3 rounded-xl border p-3 ${toneMap[tone]}`}>
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-foreground">{title}</div>
        {detail && <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>}
        <div className="mt-1.5 flex flex-wrap items-center gap-3">
          <SourceLink layer={layer} label={linkLabel} />
          {meta && <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{meta}</span>}
        </div>
      </div>
    </div>
  );
}
