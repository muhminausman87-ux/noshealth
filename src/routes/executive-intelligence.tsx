import { createFileRoute } from "@tanstack/react-router";
import { LineChart } from "lucide-react";
import { EcosystemLayout, ModulePlaceholder } from "@/components/EcosystemLayout";

export const Route = createFileRoute("/executive-intelligence")({
  head: () => ({
    meta: [
      { title: "Executive Intelligence · NOS Ecosystem" },
      { name: "description", content: "Hospital performance, quality, workforce, and strategic insights." },
    ],
  }),
  component: ExecutivePage,
});

function ExecutivePage() {
  return (
    <EcosystemLayout>
      <ModulePlaceholder
        icon={LineChart}
        title="Executive Intelligence"
        subtitle="Hospital performance, quality, workforce, and strategic insights"
      />
    </EcosystemLayout>
  );
}
