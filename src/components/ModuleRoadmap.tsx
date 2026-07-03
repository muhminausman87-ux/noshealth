import type { LucideIcon } from "lucide-react";
import { StatusPill } from "@/components/Widget";

export type RoadmapStatus = "Planned" | "Prototype" | "Future AI";

export interface RoadmapItem {
  icon: LucideIcon;
  title: string;
  description: string;
  value: string;
  status: RoadmapStatus;
}

function statusTone(status: RoadmapStatus): "info" | "warning" | "success" {
  switch (status) {
    case "Planned":
      return "info";
    case "Prototype":
      return "warning";
    case "Future AI":
      return "success";
  }
}

export function RoadmapCard({ item }: { item: RoadmapItem }) {
  const Icon = item.icon;
  return (
    <div className="group relative flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <StatusPill tone={statusTone(item.status)}>{item.status}</StatusPill>
      </div>
      <h3 className="mt-3 text-sm font-semibold text-foreground">{item.title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
      <div className="mt-auto border-t border-border pt-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Expected value
        </div>
        <div className="mt-0.5 text-xs font-medium text-foreground">{item.value}</div>
      </div>
    </div>
  );
}

export function RoadmapVisionFooter() {
  return (
    <section className="mt-8 rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-card to-card p-6 text-center shadow-sm">
      <p className="mx-auto max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        Our vision is to build an integrated AI-powered healthcare intelligence ecosystem supporting
        workforce excellence, evidence-based practice, innovation, research, learning, and executive
        decision-making.
      </p>
    </section>
  );
}
