import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SchedulingEngine } from "@/components/scheduling/SchedulingEngine";
import { getSession, type Session } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/scheduling")({
  head: () => ({
    meta: [
      { title: "AI Nursing Duty Scheduling Engine · NOS" },
      {
        name: "description",
        content:
          "Policy-driven, circadian-conscious nursing roster generation with explainable AI, exception dashboard, Excel export/import and full audit trail.",
      },
      { property: "og:title", content: "AI Nursing Duty Scheduling Engine · NOS" },
      {
        property: "og:description",
        content:
          "Generate, validate, edit and approve a safe and fair monthly nursing duty roster from your institution's own approved policy.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SchedulingPage,
});

function SchedulingPage() {
  const [session, setSession] = useState<Session | null>(null);
  useEffect(() => setSession(getSession()), []);

  if (!session) {
    return <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">Loading…</div>;
  }

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
      <SchedulingEngine session={session} />
    </main>
  );
}
