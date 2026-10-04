import { createFileRoute } from "@tanstack/react-router";
import { ExecutiveNav } from "@/components/ExecutiveNav";
import { WorkspaceLanding } from "@/components/WorkspaceLanding";
import { WORKSPACES } from "@/lib/workspaces";

export const Route = createFileRoute("/_authenticated/executive")({
  head: () => ({
    meta: [
      { title: "Executive Intelligence · NOS" },
      { name: "description", content: "Executive decision support and strategic intelligence." },
      { property: "og:title", content: "Executive Intelligence · NOS" },
      { property: "og:description", content: "Executive decision support and strategic intelligence." },
    ],
  }),
  component: () => (
    <div className="mx-auto max-w-[1400px] px-4 py-4 sm:px-6 flex flex-col gap-4">
      <ExecutiveNav activeTab="overview" />
      <WorkspaceLanding workspace={WORKSPACES.executive} />
    </div>
  ),
});
