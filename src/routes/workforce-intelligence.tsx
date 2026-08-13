import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Users, UserMinus, CalendarClock, Flame,
  HeartPulse, Sparkles, AlertTriangle, Gauge, ShieldAlert, CheckCircle2,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { StatusPill } from "@/components/Widget";
import { EcosystemLayout } from "@/components/EcosystemLayout";
import { NursingCapacityIntelligence } from "@/components/NursingCapacityIntelligence";
import { ContextualSignal, SourceLink } from "@/components/SourceLink";


import { getSession, type Session } from "@/lib/auth";

export const Route = createFileRoute("/workforce-intelligence")({
  head: () => ({
    meta: [
      { title: "Workforce Intelligence · NOS Nursing Intelligence Layer" },
      { name: "description", content: "AI-powered nursing capacity, wellbeing and skill-mix intelligence connecting patient acuity with the workforce needed to respond safely." },
    ],
  }),
  component: WorkforceIntelligencePage,
});

// ---------------- Demo data (AI Prototype) ----------------
const PRIORITY_ALERTS = [
  { tone: "danger" as const, dept: "ICU", title: "Capacity above safe threshold", body: "Required nursing hours exceed available capacity by 16h on the evening shift." },
  { tone: "warning" as const, dept: "ED", title: "Rising admission forecast", body: "Predicted admissions up 18% in the next 24h — coverage tightening." },
  { tone: "warning" as const, dept: "Cardiac", title: "High-acuity concentration", body: "4 of 18 patients scored as high acuity; 1 float RN recommended." },
];

const LEADERSHIP_ACTIONS = [
  { title: "Redistribute Patient Assignment", body: "Move 2 low-acuity patients from ICU to Med-Surg to relieve nursing hours." },
  { title: "Allocate Float Nurse", body: "Deploy 1 float RN to ICU for the evening shift to close the 16h gap." },
  { title: "Delay Non-Urgent Tasks", body: "Defer elective admissions on units above 100% capacity until night shift." },
];

// ---------------- Component ----------------
function WorkforceIntelligencePage() {
  const navigate = useNavigate();
  const [session, setSess] = useState<Session | null>(null);
  const [showMoreInsights, setShowMoreInsights] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s) { navigate({ to: "/login" }); return; }
    setSess(s);
  }, [navigate]);

  if (!session) {
    return <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">Loading…</div>;
  }

  return (
    <EcosystemLayout>
      <main className="mx-auto max-w-[1200px] space-y-6 px-4 py-6 sm:px-6">
        <header>
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            AI Nursing Intelligence Layer
          </div>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Workforce Intelligence
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Connecting patient acuity with nursing capacity — so hospitals know
            who needs care, whether they have the workforce to respond safely,
            and what action to take next.
          </p>
        </header>

        {/* 1. Workforce Overview */}
        <section>
          <SectionTitle icon={Users} title="Workforce Overview" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Kpi icon={Users} label="Nurses on Duty" value={70} tone="info" />
            <Kpi icon={CalendarClock} label="Open Shifts" value={12} tone="danger" hint="Next 72h" />
            <Kpi icon={Gauge} label="Coverage" value="89%" tone="success" />
            <Kpi icon={UserMinus} label="Staff on Leave" value={9} tone="warning" hint="4 planned · 5 sick" />
          </div>
        </section>

        {/* 2. Nursing Capacity Intelligence (primary feature) */}
        <NursingCapacityIntelligence />

        {/* 3. AI Nursing Operations Center — simplified */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-2">
            <SectionTitle icon={ShieldAlert} title="AI Nursing Operations Center" pill="AI Prototype" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Priority Operational Alerts
              </div>
              <div className="space-y-2">
                {PRIORITY_ALERTS.map((a) => (
                  <div key={a.title} className="flex gap-3 rounded-lg border border-border bg-background p-3">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
                      a.tone === "danger" ? "bg-destructive/15 text-destructive" : "bg-warning/20 text-warning-foreground"
                    }`}>
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{a.title}</span>
                        <StatusPill tone={a.tone}>{a.dept}</StatusPill>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{a.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Recommended Leadership Actions
              </div>
              <div className="space-y-2">
                {LEADERSHIP_ACTIONS.map((r) => (
                  <div key={r.title} className="flex gap-3 rounded-lg border border-border bg-background p-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-foreground">{r.title}</div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{r.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 4. Executive AI Summary — Expected Impact */}

        <section className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/[0.06] via-card to-card p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <h2 className="text-base font-semibold tracking-tight text-foreground">Executive AI Summary</h2>
            <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
              AI Prototype
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-foreground">
            Hospital-wide nursing capacity is currently in the <span className="font-semibold text-warning-foreground">Watch</span> zone.
            ICU is operating above safe capacity while Med-Surg and Maternity carry spare hours.
            Burnout risk is trending up on the evening shift.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <ContextualSignal
              layer="clinical"
              tone="info"
              title="2 high-acuity patients driving demand"
              detail="Patient records stay in the Clinical Workspace."
              linkLabel="View contributing patients"
            />
            <ContextualSignal
              layer="wellbeing"
              tone="warning"
              title="Evening shift recovery signal"
              detail="Fatigue and break management are owned by Wellbeing."
            />
            <ContextualSignal
              layer="workflow"
              tone="neutral"
              title="Capacity pressure affecting workflow"
              detail="Task sequencing and bottlenecks live in Workflow Intelligence."
            />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Detailed recommendations and the accept / override decision record are owned by this module —
            see “Recommended Leadership Actions” above.
          </p>

          <p className="mt-4 text-[11px] italic text-muted-foreground">
            Demo data · AI Prototype outputs support — not replace — clinical and operational judgement.
          </p>
        </section>

        <button
          type="button"
          onClick={() => setShowMoreInsights((v) => !v)}
          className="mx-auto flex w-full max-w-md items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-secondary"
        >
          {showMoreInsights ? (
            <>
              <ChevronUp className="h-4 w-4" /> Show Less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" /> View More Insights
            </>
          )}
        </button>

        {showMoreInsights && (
          <section>
            <SectionTitle icon={HeartPulse} title="Workforce Health" pill="AI Prototype" />
            <div className="grid gap-3 md:grid-cols-3">
              <Kpi icon={Flame} label="Burnout Risk" value={58} tone="warning" hint="Moderate · +12 vs last week" />
              <Kpi icon={AlertTriangle} label="Staffing Gap" value="9%" tone="danger" hint="Evening shift most affected" />
              <Kpi icon={CheckCircle2} label="Workforce Health Score" value="72 / 100" tone="success" hint="Composite index" />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Burnout, fatigue and recovery are owned by Employee Wellbeing.{" "}
              <SourceLink layer="wellbeing" />
            </p>

          </section>
        )}

        <footer className="pt-2 pb-8 text-center text-[11px] text-muted-foreground">
          Workforce Intelligence · Prototype dashboard · Data shown is illustrative and not connected to live records.
        </footer>
      </main>
    </EcosystemLayout>
  );
}

// ---------------- Sub components ----------------
function SectionTitle({ icon: Icon, title, pill }: { icon: any; title: string; pill?: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      {pill && (
        <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
          {pill}
        </span>
      )}
    </div>
  );
}

function Kpi({
  icon: Icon, label, value, tone, hint,
}: {
  icon: any; label: string; value: string | number;
  tone: "info" | "success" | "warning" | "danger" | "neutral";
  hint?: string;
}) {
  const toneMap = {
    info: "text-primary bg-primary/10",
    success: "text-success bg-success/15",
    warning: "text-warning-foreground bg-warning/20",
    danger: "text-destructive bg-destructive/15",
    neutral: "text-muted-foreground bg-secondary",
  };
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className={`flex h-8 w-8 items-center justify-center rounded-md ${toneMap[tone]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
      {hint && <div className="mt-1 text-[10px] text-muted-foreground/80">{hint}</div>}
    </div>
  );
}
