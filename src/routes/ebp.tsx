import { createFileRoute } from "@tanstack/react-router";
import {
  BookOpen,
  Brain,
  ClipboardList,
  MessageSquare,
  Puzzle,
  Search,
  Target,
} from "lucide-react";
import { EcosystemLayout } from "@/components/EcosystemLayout";
import { RoadmapCard, RoadmapVisionFooter } from "@/components/ModuleRoadmap";
import type { RoadmapItem } from "@/components/ModuleRoadmap";

const EBP_ITEMS: RoadmapItem[] = [
  {
    icon: Search,
    title: "AI Evidence Assistant",
    description: "Search and summarize current clinical evidence.",
    value: "Faster literature reviews, reduced search time by 60%",
    status: "Planned",
  },
  {
    icon: ClipboardList,
    title: "Clinical Guidelines",
    description: "Hospital protocols, SOPs and best practices.",
    value: "Standardized care, reduced protocol deviation",
    status: "Planned",
  },
  {
    icon: Puzzle,
    title: "PICO Builder",
    description: "Create evidence-based clinical questions.",
    value: "Structured inquiry, improved research quality",
    status: "Planned",
  },
  {
    icon: MessageSquare,
    title: "Journal Club",
    description: "Collaborative evidence discussion.",
    value: "Team learning, culture of inquiry",
    status: "Planned",
  },
  {
    icon: Target,
    title: "EBP Projects",
    description: "Track implementation and outcomes.",
    value: "Measurable improvement, accountability",
    status: "Planned",
  },
  {
    icon: Brain,
    title: "AI Clinical Decision Support",
    description: "Evidence recommendations at the point of care.",
    value: "Real-time guidance, reduced errors",
    status: "Future AI",
  },
];

export const Route = createFileRoute("/ebp")({
  head: () => ({
    meta: [
      { title: "Evidence-Based Practice · NOS Ecosystem" },
      { name: "description", content: "Clinical evidence, guidelines, and best practices module." },
    ],
  }),
  component: EBPPage,
});

function EBPPage() {
  return (
    <EcosystemLayout>
      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-10">
        <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:h-14 sm:w-14">
            <BookOpen className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Evidence-Based Practice
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Clinical evidence, guidelines, and best practices
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-warning/40 bg-warning/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-warning-foreground">
            Future Capability
          </span>
        </header>

        <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {EBP_ITEMS.map((item) => (
            <RoadmapCard key={item.title} item={item} />
          ))}
        </section>

        <RoadmapVisionFooter />
      </main>
    </EcosystemLayout>
  );
}
