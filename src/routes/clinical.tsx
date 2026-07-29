import { createFileRoute } from "@tanstack/react-router";
import { WorkspaceLanding } from "@/components/WorkspaceLanding";
import { WORKSPACES } from "@/lib/workspaces";

export const Route = createFileRoute("/clinical")({
  head: () => ({
    meta: [
      { title: "Clinical Workspace · NOS" },
      { name: "description", content: "Patient care and clinical workflow for bedside teams." },
      { property: "og:title", content: "Clinical Workspace · NOS" },
      { property: "og:description", content: "Patient care and clinical workflow for bedside teams." },
    ],
  }),
  component: () => <WorkspaceLanding workspace={WORKSPACES.clinical} />,
});
