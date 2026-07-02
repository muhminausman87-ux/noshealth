import { createFileRoute } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { EcosystemLayout, ModulePlaceholder } from "@/components/EcosystemLayout";

export const Route = createFileRoute("/ebp")({
  head: () => ({
    meta: [
      { title: "Evidence-Based Practice · NOS Ecosystem" },
      { name: "description", content: "Clinical evidence, guidelines, and best practices module." },
    ],
  }),
  component: EBPPage,
});

function EBPPage() {
  return (
    <EcosystemLayout>
      <ModulePlaceholder
        icon={BookOpen}
        title="Evidence-Based Practice"
        subtitle="Clinical evidence, guidelines, and best practices"
      />
    </EcosystemLayout>
  );
}
