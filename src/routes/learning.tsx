import { createFileRoute } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";
import { EcosystemLayout, ModulePlaceholder } from "@/components/EcosystemLayout";

export const Route = createFileRoute("/learning")({
  head: () => ({
    meta: [
      { title: "Learning & Development · NOS Ecosystem" },
      { name: "description", content: "Competency management, training, certifications, and professional growth." },
    ],
  }),
  component: LearningPage,
});

function LearningPage() {
  return (
    <EcosystemLayout>
      <ModulePlaceholder
        icon={GraduationCap}
        title="Learning & Development"
        subtitle="Competency management, training, certifications, and professional growth"
      />
    </EcosystemLayout>
  );
}
