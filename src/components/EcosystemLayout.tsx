import { type ReactNode } from "react";
import {
  Brain,
  Activity,
  BookOpen,
  FlaskConical,
  GraduationCap,
  LineChart,
} from "lucide-react";

export type NosModule = {
  key: string;
  to: string;
  title: string;
  subtitle: string;
  icon: typeof Brain;
  comingSoon?: boolean;
};

export const NOS_MODULES: NosModule[] = [
  {
    key: "workforce",
    to: "/workforce-intelligence",
    title: "Workforce Intelligence",
    subtitle: "Nursing capacity, wellbeing and skill mix — do we have capacity to respond safely?",
    icon: Brain,
  },
  {
    key: "workflow",
    to: "/workflow-intelligence",
    title: "Workflow Intelligence",
    subtitle: "AI-coordinated clinical action across departments — what should we do next?",
    icon: Activity,
  },
  {
    key: "ebp",
    to: "/ebp",
    title: "Evidence-Based Practice",
    subtitle: "Future capability supporting the Nursing Intelligence pillars",
    icon: BookOpen,
    comingSoon: true,
  },
  {
    key: "research",
    to: "/research",
    title: "Research & Innovation",
    subtitle: "Future capability supporting the Nursing Intelligence pillars",
    icon: FlaskConical,
    comingSoon: true,
  },
  {
    key: "learning",
    to: "/learning",
    title: "Learning & Development",
    subtitle: "Future capability supporting the Nursing Intelligence pillars",
    icon: GraduationCap,
    comingSoon: true,
  },
  {
    key: "executive",
    to: "/executive-intelligence",
    title: "Executive Intelligence",
    subtitle: "Future capability supporting the Nursing Intelligence pillars",
    icon: LineChart,
    comingSoon: true,
  },
];


export function EcosystemLayout({ children }: { children: ReactNode }) {
  return <div className="min-w-0 flex-1">{children}</div>;
}

export function ModulePlaceholder({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: typeof Brain;
  title: string;
  subtitle: string;
}) {
  return (
    <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-10">
      {/* Header */}
      <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:h-14 sm:w-14">
          <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <span className="shrink-0 rounded-full border border-warning/40 bg-warning/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-warning-foreground">
          Coming Soon
        </span>
      </header>

      {/* Empty dashboard scaffold */}
      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex min-h-[160px] flex-col rounded-xl border border-dashed border-border bg-card/60 p-5 shadow-sm"
          >
            <div className="mb-3 flex items-center gap-2">
              <div className="h-3 w-24 rounded bg-secondary" />
              <span className="ml-auto rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                Prototype
              </span>
            </div>
            <div className="space-y-2">
              <div className="h-2 w-full rounded bg-secondary/70" />
              <div className="h-2 w-11/12 rounded bg-secondary/60" />
              <div className="h-2 w-9/12 rounded bg-secondary/50" />
            </div>
            <div className="mt-auto pt-4 text-[11px] text-muted-foreground">
              Module widget placeholder
            </div>
          </div>
        ))}
      </section>

      <section className="mt-4 rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground shadow-sm">
        This module is under construction. Widgets, analytics, and AI insights
        will appear here as the <span className="font-medium text-foreground">{title}</span> capability rolls out.
      </section>
    </main>
  );
}
