import { createFileRoute } from "@tanstack/react-router";
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
  component: () => <WorkspaceLanding workspace={WORKSPACES.executive} />,
});
