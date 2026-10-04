import { createFileRoute } from "@tanstack/react-router";
import { ClinicalExcellenceNav } from "@/components/ClinicalExcellenceNav";
import { WorkspaceLanding } from "@/components/WorkspaceLanding";
import { WORKSPACES } from "@/lib/workspaces";

export const Route = createFileRoute("/_authenticated/excellence")({
  head: () => ({
    meta: [
      { title: "Clinical Excellence · NOS" },
      { name: "description", content: "Quality improvement, audits, and evidence-based practice." },
      { property: "og:title", content: "Clinical Excellence · NOS" },
      { property: "og:description", content: "Quality improvement, audits, and evidence-based practice." },
    ],
  }),
  component: () => (
    <div className="mx-auto max-w-[1400px] px-4 py-4 sm:px-6 flex flex-col gap-4">
      <ClinicalExcellenceNav activeTab="quality" />
      <WorkspaceLanding workspace={WORKSPACES.excellence} />
    </div>
  ),
});
