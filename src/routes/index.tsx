import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TopNav } from "@/components/TopNav";
import { PatientBanner } from "@/components/PatientBanner";
import { EDView } from "@/components/views/EDView";
import { MedSurgView } from "@/components/views/MedSurgView";
import { ICUView } from "@/components/views/ICUView";
import { GenericView } from "@/components/views/GenericView";
import { AIAssistant } from "@/components/AIAssistant";
import { getDept, type Department } from "@/lib/departments";
import { getSession, setSession, type Session } from "@/lib/auth";
import { AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SyncCare EHR — Clinical Workspace for Nurses" },
      {
        name: "description",
        content:
          "Department-aware EHR dashboard for nurses across ED, ICU, Med-Surg, Maternity, Cardiac, Pediatric, OPD, OT and more.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const [session, setSess] = useState<Session | null>(null);
  const [dept, setDept] = useState<Department>("ed");

  // Client-side auth gate
  useEffect(() => {
    const s = getSession();
    if (!s) {
      navigate({ to: "/login" });
      return;
    }
    setSess(s);
    setDept(s.activeDept);
  }, [navigate]);

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading workspace…
      </div>
    );
  }

  const meta = getDept(dept);
  const isAdmin = session.role === "admin";

  const handleChangeDept = (d: Department) => {
    if (!isAdmin) return; // staff is locked to their active dept
    setDept(d);
    setSession({ ...session, activeDept: d });
  };

  const handleLogout = () => {
    setSession(null);
    navigate({ to: "/login" });
  };

  return (
    <div
      className="min-h-screen bg-background"
      style={{
        backgroundImage: `linear-gradient(to bottom, ${meta.tint}55, transparent 220px)`,
      }}
    >
      <TopNav active={dept} onChange={handleChangeDept} session={session} onLogout={handleLogout} />

      {session.pulled && session.assignedDept && (
        <div className="border-b border-warning/30 bg-warning/15">
          <div className="mx-auto flex max-w-[1400px] items-center gap-2 px-6 py-2 text-sm text-warning-foreground">
            <AlertTriangle className="h-4 w-4" />
            <span>
              <span className="font-semibold">Pulled assignment.</span> You are signed in to{" "}
              <strong>{getDept(dept).name}</strong>, not your home unit ({getDept(session.assignedDept).name}).
            </span>
          </div>
        </div>
      )}

      <PatientBanner />

      <main className="mx-auto max-w-[1400px] px-6 py-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.color }} />
              Active unit {isAdmin && "· admin view"}
            </div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
              {meta.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isAdmin
                ? "Admin can switch between any unit from the top navigation."
                : session.pulled
                  ? "Pulled-staff view — limited to this covering unit for the shift."
                  : "Filtered, role-aware view — only what your unit needs to see."}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
            Live sync · last refresh just now
          </div>
        </div>

        {dept === "ed" && <EDView />}
        {dept === "medsurg" && <MedSurgView />}
        {dept === "icu" && <ICUView />}
        {dept !== "ed" && dept !== "medsurg" && dept !== "icu" && <GenericView dept={dept} />}
      </main>

      <AIAssistant />
    </div>
  );
}
