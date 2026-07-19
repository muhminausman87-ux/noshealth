import { HeartPulse, Users, Workflow, Sparkles } from "lucide-react";

/**
 * NOS platform positioning banner.
 * Reinforces the "Nursing Intelligence Layer" story on top of existing EHRs:
 *  - Patient Intelligence
 *  - Workforce Intelligence
 *  - Workflow Intelligence
 *
 * And the three questions NOS helps hospitals answer.
 */
export function PlatformPositioning({
  active,
}: {
  active?: "patient" | "workforce" | "workflow";
}) {
  const pillars = [
    {
      key: "patient" as const,
      icon: HeartPulse,
      title: "Patient Intelligence",
      sub: "Acuity, risk & nursing care needs",
      tone: "var(--color-tone-sky)",
    },
    {
      key: "workforce" as const,
      icon: Users,
      title: "Workforce Intelligence",
      sub: "Nursing capacity, wellbeing & skill mix",
      tone: "var(--color-tone-mint)",
    },
    {
      key: "workflow" as const,
      icon: Workflow,
      title: "Workflow Intelligence",
      sub: "Coordinated clinical action across teams",
      tone: "var(--color-tone-violet)",
    },
  ];

  const questions = [
    "Which patients need the most nursing care right now?",
    "Do we have the nursing capacity to respond safely?",
    "What operational action should be taken next?",
  ];

  return (
    <section className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.06] via-card to-card p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            AI Nursing Intelligence Layer
          </div>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            Connecting Patient Acuity with Nursing Capacity
          </h2>
          <p className="mt-0.5 max-w-2xl text-xs text-muted-foreground sm:text-sm">
            NOS sits on top of your existing hospital EHR — turning patient acuity,
            nursing capacity and clinical workflow into one operational picture for
            safer patient care and better workforce decisions.
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
          AI Prototype · Demo Data
        </span>
      </div>

      {/* Three pillars */}
      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        {pillars.map((p) => {
          const Icon = p.icon;
          const on = active === p.key;
          return (
            <div
              key={p.key}
              className={`flex items-center gap-3 rounded-xl border p-3 transition ${
                on
                  ? "border-primary/40 bg-primary/[0.06] shadow-sm"
                  : "border-border bg-background/60"
              }`}
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{
                  background: `color-mix(in oklab, ${p.tone} 22%, transparent)`,
                  color: p.tone,
                }}
              >
                <Icon className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-foreground">
                  {p.title}
                </div>
                <div className="truncate text-[11px] text-muted-foreground">
                  {p.sub}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Three questions */}
      <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-3">
        {questions.map((q, i) => (
          <div
            key={i}
            className="flex items-start gap-2 rounded-lg border border-dashed border-border bg-background/50 px-3 py-2"
          >
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
              {i + 1}
            </span>
            <span className="text-xs leading-snug text-foreground">{q}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
