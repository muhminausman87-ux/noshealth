import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TopNav } from "@/components/TopNav";
import { PatientBanner } from "@/components/PatientBanner";
import { EDView } from "@/components/views/EDView";
import { MedSurgView } from "@/components/views/MedSurgView";
import { ICUView } from "@/components/views/ICUView";
import { AIAssistant } from "@/components/AIAssistant";
import { DEPARTMENTS, type Department } from "@/lib/departments";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SyncCare EHR — Clinical Workspace for Nurses" },
      {
        name: "description",
        content:
          "A streamlined EHR dashboard for ED, Med-Surg, and ICU nurses — fewer clicks, less bloat, focused on what matters.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [dept, setDept] = useState<Department>("ed");
  const meta = DEPARTMENTS.find((d) => d.id === dept)!;

  return (
    <div className="min-h-screen bg-background">
      <TopNav active={dept} onChange={setDept} />
      <PatientBanner />

      <main className="mx-auto max-w-[1400px] px-6 py-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: meta.color }}
              />
              Active unit
            </div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
              {meta.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              Filtered, role-aware view — only what this unit needs to see.
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
      </main>

      <AIAssistant />
    </div>
  );
}
