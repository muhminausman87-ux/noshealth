import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  DollarSign,
  LineChart,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { EcosystemLayout } from "@/components/EcosystemLayout";
import { RoadmapCard, RoadmapVisionFooter } from "@/components/ModuleRoadmap";
import type { RoadmapItem } from "@/components/ModuleRoadmap";

const EXEC_ITEMS: RoadmapItem[] = [
  {
    icon: Activity,
    title: "Hospital Performance",
    description: "Real-time dashboards for quality, safety, and operational metrics.",
    value: "Data-driven decisions, rapid response",
    status: "Planned",
  },
  {
    icon: Users,
    title: "Workforce Analytics",
    description: "Deep insights into staffing, turnover, and engagement.",
    value: "Retention, optimized workforce investment",
    status: "Planned",
  },
  {
    icon: DollarSign,
    title: "Financial Impact",
    description: "Link workforce decisions to cost and revenue outcomes.",
    value: "Cost savings, justified investments",
    status: "Planned",
  },
  {
    icon: ShieldCheck,
    title: "Patient Safety Indicators",
    description: "Correlate workforce health with safety events.",
    value: "Proactive risk reduction, safer care",
    status: "Planned",
  },
  {
    icon: Star,
    title: "Accreditation Readiness",
    description: "Track standards compliance and survey preparedness.",
    value: "Survey success, continuous readiness",
    status: "Planned",
  },
  {
    icon: Sparkles,
    title: "Executive AI Copilot",
    description: "AI-generated briefings, alerts, and strategic recommendations.",
    value: "Executive foresight, proactive leadership",
    status: "Future AI",
  },
];

export const Route = createFileRoute("/executive-intelligence")({
  head: () => ({
    meta: [
      { title: "Executive Intelligence · NOS Ecosystem" },
      { name: "description", content: "Hospital performance, quality, workforce, and strategic insights." },
    ],
  }),
  component: ExecutivePage,
});

function ExecutivePage() {
  return (
    <EcosystemLayout>
      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-10">
        <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:h-14 sm:w-14">
            <LineChart className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Executive Intelligence
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Hospital performance, quality, workforce, and strategic insights — a future capability built on Patient, Workforce and Workflow Intelligence.
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-warning/40 bg-warning/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-warning-foreground">
            Future Capability
          </span>
        </header>

        <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {EXEC_ITEMS.map((item) => (
            <RoadmapCard key={item.title} item={item} />
          ))}
        </section>

        <RoadmapVisionFooter />
      </main>
    </EcosystemLayout>
  );
}
