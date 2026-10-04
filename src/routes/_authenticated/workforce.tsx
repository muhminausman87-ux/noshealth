import { createFileRoute } from "@tanstack/react-router";
import { WorkforceNav } from "@/components/WorkforceNav";
import { AdminWorkforce } from "@/components/AdminWorkforce";

export const Route = createFileRoute("/_authenticated/workforce")({
  head: () => ({
    meta: [
      { title: "Staff Assignments · Workforce Operations · NOS" },
      { name: "description", content: "Nurse unit assignments, shift schedules, working hours, and workload allocation." },
      { property: "og:title", content: "Staff Assignments · Workforce Operations · NOS" },
      { property: "og:description", content: "Nurse unit assignments, shift schedules, working hours, and workload allocation." },
    ],
  }),
  component: () => (
    <main className="mx-auto max-w-[1400px] px-4 py-4 sm:px-6 flex flex-col gap-4">
      <WorkforceNav activeTab="assignments" />
      <AdminWorkforce />
    </main>
  ),
});

