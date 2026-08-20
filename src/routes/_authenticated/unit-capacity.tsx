import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { UnitCapacity } from "@/components/fromex/UnitCapacity";
import { getSession, type Session } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/unit-capacity")({
  head: () => ({
    meta: [
      { title: "Unit Acuity & Capacity · NOS" },
      {
        name: "description",
        content:
          "Charge nurse and nursing administration view of patient acuity, nursing workload and shift capacity.",
      },
      { property: "og:title", content: "Unit Acuity & Capacity · NOS" },
      {
        property: "og:description",
        content: "See where the pressure is: acuity, workload distribution and capacity vs demand.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: UnitCapacityPage,
});

function UnitCapacityPage() {
  const [session, setSession] = useState<Session | null>(null);
  useEffect(() => setSession(getSession()), []);

  const resp = new Set(session?.responsibilities ?? []);
  const institutionScope =
    session?.role === "admin" || resp.has("nursing_admin") || resp.has("executive") || resp.has("institution_admin");

  return (
    <main className="mx-auto max-w-[1400px] px-6 py-8">
      <h1 className="sr-only">Unit acuity and nursing capacity</h1>
      <UnitCapacity
        scope={institutionScope ? "institution" : "unit"}
        department={institutionScope ? undefined : session?.assignedDept}
      />
    </main>
  );
}
