import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { WorkforceIntelligenceCenter } from "@/components/fromex/workforce/WorkforceIntelligenceCenter";
import { getSession, type Session } from "@/lib/auth";

export const Route = createFileRoute("/nursing-workforce-intelligence")({
  head: () => ({
    meta: [
      { title: "Nursing Workforce Intelligence · NOS" },
      {
        name: "description",
        content:
          "Patient demand to nursing capacity to operational action: explainable prototype intelligence for nursing workforce leaders.",
      },
      { property: "og:title", content: "Nursing Workforce Intelligence · NOS" },
      {
        property: "og:description",
        content: "See patient-generated nursing demand, capacity, imbalance, forecast and governed decisions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NursingWorkforceIntelligencePage,
});

function NursingWorkforceIntelligencePage() {
  const [session, setSession] = useState<Session | null>(null);
  useEffect(() => setSession(getSession()), []);

  if (!session) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">Loading…</div>
    );
  }

  return (
    <main className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6">
      <WorkforceIntelligenceCenter session={session} />
    </main>
  );
}
