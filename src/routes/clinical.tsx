import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { WorkspaceLanding } from "@/components/WorkspaceLanding";
import { MyResponsibility } from "@/components/MyResponsibility";
import { WORKSPACES } from "@/lib/workspaces";
import { getSession, type Session } from "@/lib/auth";
import { isBedsideFirst } from "@/lib/access";

export const Route = createFileRoute("/clinical")({
  head: () => ({
    meta: [
      { title: "Clinical Workspace · NOS" },
      { name: "description", content: "Patient care and clinical workflow for bedside teams." },
      { property: "og:title", content: "Clinical Workspace · NOS" },
      { property: "og:description", content: "Patient care and clinical workflow for bedside teams." },
    ],
  }),
  component: ClinicalWorkspace,
});

function ClinicalWorkspace() {
  const [session, setSess] = useState<Session | null>(null);
  useEffect(() => setSess(getSession()), []);

  const bedsideFirst =
    session &&
    isBedsideFirst({
      role: session.role,
      department: session.assignedDept,
      institutionId: session.institutionId,
      responsibilities: session.responsibilities ?? [],
    });

  return (
    <>
      {session && bedsideFirst && (
        <div className="mx-auto max-w-[1400px] px-6 pt-8">
          <MyResponsibility session={session} />
        </div>
      )}
      <WorkspaceLanding workspace={WORKSPACES.clinical} />
    </>
  );
}
