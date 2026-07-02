import { createFileRoute } from "@tanstack/react-router";
import { FlaskConical } from "lucide-react";
import { EcosystemLayout, ModulePlaceholder } from "@/components/EcosystemLayout";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "Research & Innovation · NOS Ecosystem" },
      { name: "description", content: "Research projects, publications, and healthcare innovation." },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  return (
    <EcosystemLayout>
      <ModulePlaceholder
        icon={FlaskConical}
        title="Research & Innovation"
        subtitle="Research projects, publications, and healthcare innovation"
      />
    </EcosystemLayout>
  );
}
