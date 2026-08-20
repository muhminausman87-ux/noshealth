import { createFileRoute } from "@tanstack/react-router";
import {
  Award,
  BookOpen,
  ClipboardCheck,
  Cpu,
  GraduationCap,
  TrendingUp,
  Users,
} from "lucide-react";
import { EcosystemLayout } from "@/components/EcosystemLayout";
import { RoadmapCard, RoadmapVisionFooter } from "@/components/ModuleRoadmap";
import type { RoadmapItem } from "@/components/ModuleRoadmap";

const LEARNING_ITEMS: RoadmapItem[] = [
  {
    icon: Award,
    title: "Competency Management",
    description: "Map, track, and validate nursing competencies by role.",
    value: "Accredited workforce, clear progression paths",
    status: "Planned",
  },
  {
    icon: BookOpen,
    title: "Mandatory Education",
    description: "Automated scheduling and compliance tracking.",
    value: "100% compliance, reduced manual follow-up",
    status: "Planned",
  },
  {
    icon: Cpu,
    title: "AI Personalized Learning",
    description: "Adaptive learning paths based on individual gaps.",
    value: "Efficient upskilling, personalized growth",
    status: "Future AI",
  },
  {
    icon: ClipboardCheck,
    title: "Certification Tracker",
    description: "Monitor expirations and renewal deadlines.",
    value: "Zero lapses, regulatory readiness",
    status: "Planned",
  },
  {
    icon: TrendingUp,
    title: "Skills Gap Analysis",
    description: "Identify and close department-level skill gaps.",
    value: "Targeted training, improved patient outcomes",
    status: "Planned",
  },
  {
    icon: Users,
    title: "Leadership Development",
    description: "Programs for charge nurses and future leaders.",
    value: "Stronger leadership pipeline, retention",
    status: "Planned",
  },
];

export const Route = createFileRoute("/_authenticated/learning")({
  head: () => ({
    meta: [
      { title: "Learning & Development · NOS Ecosystem" },
      { name: "description", content: "Competency management, training, certifications, and professional growth." },
    ],
  }),
  component: LearningPage,
});

function LearningPage() {
  return (
    <EcosystemLayout>
      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-10">
        <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:h-14 sm:w-14">
            <GraduationCap className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Learning & Development
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Competency, training, and professional growth — a future capability supporting the three Nursing Intelligence pillars.
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-warning/40 bg-warning/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-warning-foreground">
            Future Capability
          </span>
        </header>

        <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {LEARNING_ITEMS.map((item) => (
            <RoadmapCard key={item.title} item={item} />
          ))}
        </section>

        <RoadmapVisionFooter />
      </main>
    </EcosystemLayout>
  );
}
