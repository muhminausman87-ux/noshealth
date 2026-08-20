import { createFileRoute } from "@tanstack/react-router";
import { WorkspaceLanding } from "@/components/WorkspaceLanding";
import { WORKSPACES } from "@/lib/workspaces";

export const Route = createFileRoute("/_authenticated/wellbeing")({
  head: () => ({
    meta: [
      { title: "Employee Wellbeing · NOS" },
      { name: "description", content: "Support and retain nurses through wellbeing intelligence." },
      { property: "og:title", content: "Employee Wellbeing · NOS" },
      { property: "og:description", content: "Support and retain nurses through wellbeing intelligence." },
    ],
  }),
  component: () => <WorkspaceLanding workspace={WORKSPACES.wellbeing} />,
});
