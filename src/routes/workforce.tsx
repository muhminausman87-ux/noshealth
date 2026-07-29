import { createFileRoute } from "@tanstack/react-router";
import { WorkspaceLanding } from "@/components/WorkspaceLanding";
import { WORKSPACES } from "@/lib/workspaces";

export const Route = createFileRoute("/workforce")({
  head: () => ({
    meta: [
      { title: "Workforce Operations · NOS" },
      { name: "description", content: "Workforce planning and hospital operations for nursing leadership." },
      { property: "og:title", content: "Workforce Operations · NOS" },
      { property: "og:description", content: "Workforce planning and hospital operations for nursing leadership." },
    ],
  }),
  component: () => <WorkspaceLanding workspace={WORKSPACES.workforce} />,
});
