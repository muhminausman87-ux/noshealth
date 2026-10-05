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
import { ClinicalExcellenceNav } from "@/components/ClinicalExcellenceNav";
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

export const Route = createFileRoute("/_authenticated/ebp")({
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
      <main className="mx-auto max-w-[1400px] px-4 py-4 sm:px-6 flex flex-col gap-4">
        <ClinicalExcellenceNav activeTab="ebp" />
        <header className="flex flex-wrap items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <div className="flex h-11 w-11 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BookOpen className="h-5 w-5 sm:h-7 sm:w-7" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-semibold tracking-tight text-foreground sm:text-2xl break-words">
                Evidence-Based Practice
              </h1>
              <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">
                Clinical evidence, guidelines, and best practices — a future capability supporting the three Nursing Intelligence pillars.
              </p>
            </div>
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
