import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function Widget({
  title,
  icon: Icon,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  icon: LucideIcon;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`card-hover nos-surface p-4 ${className}`}
    >
      <header className="mb-4 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-primary/20 bg-primary/8 text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-[13px] font-semibold tracking-tight text-foreground">{title}</h3>
            {subtitle && (
              <p className="text-[11px] leading-snug text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
      </header>
      <div>{children}</div>
    </section>
  );
}

export function StatusPill({
  tone,
  children,
}: {
  tone: "neutral" | "success" | "warning" | "danger" | "info";
  children: ReactNode;
}) {
  const map = {
    neutral: "border-border bg-muted text-muted-foreground",
    success: "border-success/30 bg-success/8 text-success",
    warning: "border-warning/35 bg-warning/10 text-[#8a5b12]",
    danger: "border-destructive/30 bg-destructive/8 text-destructive",
    info: "border-primary/30 bg-primary/8 text-primary",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] ${map[tone]}`}
    >
      {children}
    </span>
  );
}
