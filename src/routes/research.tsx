import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart3,
  FlaskConical,
  FolderKanban,
  GitBranch,
  Rocket,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { EcosystemLayout } from "@/components/EcosystemLayout";
import { RoadmapCard, RoadmapVisionFooter } from "@/components/ModuleRoadmap";
import type { RoadmapItem } from "@/components/ModuleRoadmap";

const RESEARCH_ITEMS: RoadmapItem[] = [
  {
    icon: FolderKanban,
    title: "Research Project Tracker",
    description: "Monitor progress of all active research studies across departments.",
    value: "Visibility, reduced administrative overhead",
    status: "Planned",
  },
  {
    icon: BarChart3,
    title: "Publication Dashboard",
    description: "Track submissions, reviews, and published outputs.",
    value: "Recognition, impact measurement",
    status: "Planned",
  },
  {
    icon: ShieldCheck,
    title: "Ethics & IRB Management",
    description: "Streamlined ethics applications and approval workflows.",
    value: "Compliance, faster study startup",
    status: "Planned",
  },
  {
    icon: Rocket,
    title: "Healthcare Innovation Hub",
    description: "Capture and evaluate new ideas from frontline staff.",
    value: "Culture of innovation, faster pilots",
    status: "Prototype",
  },
  {
    icon: Sparkles,
    title: "AI Idea Evaluation",
    description: "AI-assisted scoring of innovation proposals.",
    value: "Objective prioritization, resource allocation",
    status: "Future AI",
  },
  {
    icon: GitBranch,
    title: "Innovation Pipeline",
    description: "End-to-end tracking from idea to implementation.",
    value: "Structured progression, ROI tracking",
    status: "Planned",
  },
];

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "Research & Innovation · NOS Ecosystem" },
      { name: "description", content: "Research projects, publications, and healthcare innovation." },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  return (
    <EcosystemLayout>
      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-10">
        <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:h-14 sm:w-14">
            <FlaskConical className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Research & Innovation
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Research projects, publications, and healthcare innovation
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-warning/40 bg-warning/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-warning-foreground">
            Coming Soon
          </span>
        </header>

        <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {RESEARCH_ITEMS.map((item) => (
            <RoadmapCard key={item.title} item={item} />
          ))}
        </section>

        <RoadmapVisionFooter />
      </main>
    </EcosystemLayout>
  );
}
