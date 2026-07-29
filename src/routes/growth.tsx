import { createFileRoute } from "@tanstack/react-router";
import { WorkspaceLanding } from "@/components/WorkspaceLanding";
import { WORKSPACES } from "@/lib/workspaces";

export const Route = createFileRoute("/growth")({
  head: () => ({
    meta: [
      { title: "Employee Growth · NOS" },
      { name: "description", content: "Professional development, competencies, and career pathways." },
      { property: "og:title", content: "Employee Growth · NOS" },
      { property: "og:description", content: "Professional development, competencies, and career pathways." },
    ],
  }),
  component: () => <WorkspaceLanding workspace={WORKSPACES.growth} />,
});
