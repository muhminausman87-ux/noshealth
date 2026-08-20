import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DutySchedulingCenter } from "@/components/fromex/scheduling/DutySchedulingCenter";
import { getSession, type Session } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/duty-scheduling")({
  head: () => ({
    meta: [
      { title: "Intelligent Duty Scheduling · NOS" },
      {
        name: "description",
        content:
          "Human-centered nursing rostering: patient demand, skill mix, approved leave, recovery and fairness balanced before any schedule is published.",
      },
      { property: "og:title", content: "Intelligent Duty Scheduling · NOS" },
      {
        property: "og:description",
        content: "Coverage, skill mix, recovery concerns, leave impact and governed approval for nursing duty rosters.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DutySchedulingPage,
});

function DutySchedulingPage() {
  const [session, setSession] = useState<Session | null>(null);
  useEffect(() => setSession(getSession()), []);

  if (!session) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">Loading…</div>
    );
  }

  return (
    <main className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6">
      <DutySchedulingCenter session={session} />
    </main>
  );
}
