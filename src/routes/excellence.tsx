import { createFileRoute } from "@tanstack/react-router";
import { WorkspaceLanding } from "@/components/WorkspaceLanding";
import { WORKSPACES } from "@/lib/workspaces";

export const Route = createFileRoute("/excellence")({
  head: () => ({
    meta: [
      { title: "Clinical Excellence · NOS" },
      { name: "description", content: "Quality improvement, audits, and evidence-based practice." },
      { property: "og:title", content: "Clinical Excellence · NOS" },
      { property: "og:description", content: "Quality improvement, audits, and evidence-based practice." },
    ],
  }),
  component: () => <WorkspaceLanding workspace={WORKSPACES.excellence} />,
});
