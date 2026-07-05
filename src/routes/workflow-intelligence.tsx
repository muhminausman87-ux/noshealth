import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  FlaskConical, Scan, Bandage, Syringe, Clock, Sparkles,
  AlertTriangle, CheckCircle2, CalendarClock, TimerReset,
  Activity, ArrowRight, Stethoscope, ClipboardList,
} from "lucide-react";
import { EcosystemLayout } from "@/components/EcosystemLayout";
import { Widget, StatusPill } from "@/components/Widget";
import { getSession, type Session } from "@/lib/auth";

export const Route = createFileRoute("/workflow-intelligence")({
  head: () => ({
    meta: [
      { title: "Nursing Workflow Intelligence · NOS Ecosystem" },
      { name: "description", content: "AI-assisted coordination of laboratory, radiology, wound care and IV workflows to reduce nursing workload." },
    ],
  }),
  component: WorkflowIntelligencePage,
});

// ---------------- Demo data ----------------

const LAB_COLLECTIONS = [
  { id: "LAB-1042", patient: "R. Kumar",     room: "ICU-04", priority: "Emergency", requester: "Dr. Aisha N.",    due: "08:15", status: "Delayed",   overdueMin: 22 },
  { id: "LAB-1043", patient: "M. Al-Farsi",  room: "MED-12", priority: "Routine",   requester: "Dr. Patel",       due: "08:30", status: "Pending" },
  { id: "LAB-1044", patient: "S. Okoye",     room: "ED-07",  priority: "Emergency", requester: "Dr. Chen",        due: "08:45", status: "Pending" },
  { id: "LAB-1045", patient: "L. Haddad",    room: "SUR-03", priority: "Routine",   requester: "Dr. Rossi",       due: "09:00", status: "Scheduled" },
  { id: "LAB-1046", patient: "T. Nakamura",  room: "MED-08", priority: "Routine",   requester: "Dr. Patel",       due: "09:30", status: "Scheduled" },
];

const CRITICAL_RESULTS = [
  { id: "CR-88", patient: "R. Kumar",    test: "Potassium 6.4 mmol/L", flagged: "12 min ago", ack: false },
  { id: "CR-89", patient: "S. Okoye",    test: "Troponin 3.2 ng/mL",   flagged: "27 min ago", ack: false },
  { id: "CR-90", patient: "H. Ibrahim",  test: "Hb 6.1 g/dL",          flagged: "1h 05m ago", ack: true },
];

const RADIOLOGY = [
  { id: "RAD-501", patient: "R. Kumar",    exam: "Chest X-Ray",       stage: "Pending",   eta: "10:00" },
  { id: "RAD-502", patient: "N. Silva",    exam: "CT Abdomen",        stage: "Scheduled", eta: "11:30" },
  { id: "RAD-503", patient: "M. Al-Farsi", exam: "MRI Brain",         stage: "Scheduled", eta: "13:00" },
  { id: "RAD-504", patient: "P. Adebayo",  exam: "US Doppler",        stage: "Completed", eta: "07:45" },
  { id: "RAD-505", patient: "L. Haddad",   exam: "Portable CXR",      stage: "Reporting", eta: "08:20" },
  { id: "RAD-506", patient: "T. Nakamura", exam: "CT Chest",          stage: "Delayed",   eta: "09:15", overdueMin: 35 },
];

const WOUND_CARE = [
  { id: "W-201", patient: "L. Haddad",   type: "Post-op abdominal",  due: "09:00", status: "Scheduled",  nurseLed: true,  doc: "Pending" },
  { id: "W-202", patient: "P. Adebayo",  type: "Pressure ulcer II",  due: "09:30", status: "Scheduled",  nurseLed: true,  doc: "Complete" },
  { id: "W-203", patient: "H. Ibrahim",  type: "Diabetic foot",      due: "08:00", status: "Delayed",    nurseLed: false, doc: "Pending", overdueMin: 55 },
  { id: "W-204", patient: "N. Silva",    type: "Surgical incision",  due: "10:30", status: "Physician Rescheduled", nurseLed: false, doc: "N/A" },
  { id: "W-205", patient: "R. Kumar",    type: "Central line site",  due: "11:00", status: "Scheduled",  nurseLed: true,  doc: "Pending" },
];

const IV_ACCESS = [
  { id: "IV-31", patient: "M. Al-Farsi", reason: "3× failed attempts",    escalated: true,  responder: "IV Expert – A. Rahim", response: "8 min",  status: "Completed" },
  { id: "IV-32", patient: "S. Okoye",    reason: "Difficult veins",       escalated: true,  responder: "IV Expert – J. Silva", response: "12 min", status: "In Progress" },
  { id: "IV-33", patient: "T. Nakamura", reason: "Pediatric cannulation", escalated: true,  responder: "Awaiting",             response: "—",      status: "Pending" },
  { id: "IV-34", patient: "L. Haddad",   reason: "Extravasation risk",    escalated: false, responder: "Nurse (bedside)",      response: "5 min",  status: "Completed" },
];

type TimelineStatus = "Completed" | "Pending" | "Delayed" | "Rescheduled";
const TIMELINE: { time: string; label: string; status: TimelineStatus; note: string }[] = [
  { time: "08:00", label: "Laboratory",       status: "Completed",   note: "Morning bloods drawn — 24 of 26" },
  { time: "09:00", label: "Wound Review",     status: "Delayed",     note: "3 dressings awaiting nurse-led review" },
  { time: "10:00", label: "Medication",       status: "Pending",     note: "AM round in progress" },
  { time: "11:30", label: "Radiology",        status: "Rescheduled", note: "CT slot moved from 09:15" },
  { time: "14:00", label: "Physician Review", status: "Pending",     note: "6 patients on round list" },
  { time: "16:00", label: "Follow-up",        status: "Pending",     note: "Handover + reassessments" },
];

const AI_INSIGHTS = [
  { tone: "danger"  as const, title: "Bottleneck: Laboratory collections in ICU",  body: "3 emergency collections in ICU are >20 min overdue. Consider dispatching phlebotomy runner or reassigning to charge nurse." },
  { tone: "warning" as const, title: "Radiology reports pending TAT breach",       body: "CT Chest (RAD-506) delayed 35 min — turnaround KPI at risk. Notify reporting radiologist." },
  { tone: "warning" as const, title: "Wound review backlog on Medical Ward",       body: "Delayed diabetic foot review (W-203) requires physician assessment. Nurse-led not permitted per policy." },
  { tone: "info"    as const, title: "Optimize morning cluster (08:00–10:00)",     body: "Sequence: labs → wound dressings → medication reduces ward crossings by ~22% and saves ≈18 nurse-minutes/shift." },
];

// ---------------- Helpers ----------------

function statusTone(s: string): "success" | "warning" | "danger" | "info" | "neutral" {
  if (s === "Completed" || s === "Complete") return "success";
  if (s === "Delayed") return "danger";
  if (s === "Pending" || s === "Scheduled" || s === "Reporting" || s === "In Progress") return "info";
  if (s.includes("Rescheduled")) return "warning";
  return "neutral";
}

function priorityTone(p: string): "danger" | "info" | "neutral" {
  if (p === "Emergency") return "danger";
  if (p === "Routine") return "info";
  return "neutral";
}

// ---------------- Component ----------------

function WorkflowIntelligencePage() {
  const navigate = useNavigate();
  const [session, setSess] = useState<Session | null>(null);

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
      <main className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 sm:px-6">

        {/* Header */}
        <header className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Activity className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                    Nursing Workflow Intelligence
                  </h1>
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                    Prototype
                  </span>
                </div>
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                  AI-assisted coordination of clinical workflows across departments — designed to
                  reduce documentation burden, improve communication, and help nurses complete tasks
                  efficiently. This is a workflow management system, not an EMR.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:min-w-[320px]">
              <MiniStat label="Open tasks"  value="42" tone="info" />
              <MiniStat label="Delayed"     value="7"  tone="danger" />
              <MiniStat label="Nurse-mins saved" value="86" tone="success" />
            </div>
          </div>
        </header>

        {/* 1. Laboratory Workflow */}
        <section>
          <SectionTitle icon={FlaskConical} title="Laboratory Workflow" subtitle="Collections, schedules and critical result acknowledgement" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Kpi icon={FlaskConical} label="Pending Collections" value={9} tone="info" />
            <Kpi icon={AlertTriangle} label="Emergency" value={3} tone="danger" />
            <Kpi icon={ClipboardList} label="Routine" value={6} tone="info" />
            <Kpi icon={TimerReset} label="Delayed" value={2} tone="warning" hint=">15 min overdue" />
          </div>

          <div className="mt-3 grid gap-4 lg:grid-cols-3">
            <Widget title="Collection Schedule" icon={Clock} className="lg:col-span-2">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                      <th className="pb-2 pr-3 font-medium">Time</th>
                      <th className="pb-2 pr-3 font-medium">Patient</th>
                      <th className="pb-2 pr-3 font-medium">Priority</th>
                      <th className="pb-2 pr-3 font-medium">Requester</th>
                      <th className="pb-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {LAB_COLLECTIONS.map((c) => (
                      <tr key={c.id} className="border-b border-border/60 last:border-0">
                        <td className="py-2 pr-3 font-mono text-xs text-muted-foreground">{c.due}</td>
                        <td className="py-2 pr-3">
                          <div className="font-medium">{c.patient}</div>
                          <div className="text-[11px] text-muted-foreground">{c.room} · {c.id}</div>
                        </td>
                        <td className="py-2 pr-3"><StatusPill tone={priorityTone(c.priority)}>{c.priority}</StatusPill></td>
                        <td className="py-2 pr-3 text-xs text-muted-foreground">{c.requester}</td>
                        <td className="py-2">
                          <StatusPill tone={statusTone(c.status)}>
                            {c.status}{c.overdueMin ? ` · +${c.overdueMin}m` : ""}
                          </StatusPill>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Widget>

            <Widget title="Critical Results — Acknowledgement" icon={AlertTriangle} subtitle="Awaiting clinician sign-off">
              <div className="space-y-2">
                {CRITICAL_RESULTS.map((r) => (
                  <div key={r.id} className={`rounded-lg border p-3 ${r.ack ? "border-border bg-background" : "border-destructive/40 bg-destructive/5"}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-medium">{r.patient}</div>
                        <div className="text-xs text-muted-foreground">{r.test}</div>
                        <div className="mt-1 text-[11px] text-muted-foreground">Flagged {r.flagged}</div>
                      </div>
                      {r.ack ? (
                        <StatusPill tone="success"><CheckCircle2 className="h-3 w-3" /> Ack</StatusPill>
                      ) : (
                        <StatusPill tone="danger">Unacknowledged</StatusPill>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Widget>
          </div>
        </section>

        {/* 2. Radiology Workflow */}
        <section>
          <SectionTitle icon={Scan} title="Radiology Workflow" subtitle="Imaging requests, reporting and turnaround" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <Kpi icon={Scan} label="Pending Requests" value={5} tone="info" />
            <Kpi icon={CalendarClock} label="Scheduled" value={8} tone="info" />
            <Kpi icon={CheckCircle2} label="Completed Today" value={11} tone="success" />
            <Kpi icon={ClipboardList} label="Reports Pending" value={4} tone="warning" />
            <Kpi icon={TimerReset} label="Delayed Reports" value={2} tone="danger" />
          </div>

          <div className="mt-3 grid gap-4 lg:grid-cols-3">
            <Widget title="Report Turnaround (KPI)" icon={Activity}>
              <div className="flex flex-col items-center py-2">
                <div className="text-4xl font-bold text-primary">42<span className="text-xl font-medium text-muted-foreground"> min</span></div>
                <div className="mt-1 text-xs text-muted-foreground">Avg report TAT · Target ≤ 45 min</div>
                <div className="mt-4 w-full">
                  <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
                    <span>Within target</span><span>82%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-primary" style={{ width: "82%" }} />
                  </div>
                </div>
              </div>
            </Widget>

            <Widget title="Imaging Queue" icon={Scan} className="lg:col-span-2">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {RADIOLOGY.map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{r.exam}</div>
                      <div className="truncate text-[11px] text-muted-foreground">{r.patient} · {r.id} · ETA {r.eta}</div>
                    </div>
                    <StatusPill tone={statusTone(r.stage)}>
                      {r.stage}{r.overdueMin ? ` · +${r.overdueMin}m` : ""}
                    </StatusPill>
                  </div>
                ))}
              </div>
            </Widget>
          </div>
        </section>

        {/* 3. Wound Care Workflow */}
        <section>
          <SectionTitle icon={Bandage} title="Wound Care Workflow" subtitle="Dressings, surgical reviews and documentation" />
          <div className="grid gap-4 lg:grid-cols-3">
            <Widget title="Scheduled Dressings & Reviews" icon={Bandage} className="lg:col-span-2">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                      <th className="pb-2 pr-3 font-medium">Due</th>
                      <th className="pb-2 pr-3 font-medium">Patient</th>
                      <th className="pb-2 pr-3 font-medium">Type</th>
                      <th className="pb-2 pr-3 font-medium">Nurse-led</th>
                      <th className="pb-2 pr-3 font-medium">Docs</th>
                      <th className="pb-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {WOUND_CARE.map((w) => (
                      <tr key={w.id} className="border-b border-border/60 last:border-0">
                        <td className="py-2 pr-3 font-mono text-xs text-muted-foreground">{w.due}</td>
                        <td className="py-2 pr-3">
                          <div className="font-medium">{w.patient}</div>
                          <div className="text-[11px] text-muted-foreground">{w.id}</div>
                        </td>
                        <td className="py-2 pr-3 text-xs">{w.type}</td>
                        <td className="py-2 pr-3">
                          <StatusPill tone={w.nurseLed ? "success" : "neutral"}>
                            {w.nurseLed ? "Permitted" : "Physician req."}
                          </StatusPill>
                        </td>
                        <td className="py-2 pr-3"><StatusPill tone={statusTone(w.doc)}>{w.doc}</StatusPill></td>
                        <td className="py-2">
                          <StatusPill tone={statusTone(w.status)}>
                            {w.status}{w.overdueMin ? ` · +${w.overdueMin}m` : ""}
                          </StatusPill>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Widget>

            <div className="space-y-3">
              <Kpi icon={Bandage} label="Reviews Today" value={12} tone="info" />
              <Kpi icon={TimerReset} label="Delayed" value={1} tone="danger" />
              <Kpi icon={CalendarClock} label="Physician Rescheduled" value={1} tone="warning" />
              <div className="rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground shadow-sm">
                <div className="mb-1 font-medium text-foreground">Policy note</div>
                Nurse-led dressing is permitted for stable post-op and pressure injuries per hospital policy. Physician review required for infected or non-healing wounds.
              </div>
            </div>
          </div>
        </section>

        {/* 4. IV Access Workflow */}
        <section>
          <SectionTitle icon={Syringe} title="IV Access Workflow" subtitle="Escalation to IV Expert Nurse per hospital policy" />
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="grid grid-cols-2 gap-3 lg:col-span-1">
              <Kpi icon={Syringe} label="Difficult Cannulations" value={4} tone="warning" />
              <Kpi icon={ArrowRight} label="Escalated to IV Expert" value={3} tone="info" />
              <Kpi icon={Clock} label="Avg Response" value="9 min" tone="success" />
              <Kpi icon={CheckCircle2} label="Completed" value={2} tone="success" />
            </div>

            <Widget title="IV Escalation Queue" icon={Syringe} className="lg:col-span-2">
              <div className="space-y-2">
                {IV_ACCESS.map((i) => (
                  <div key={i.id} className="rounded-lg border border-border bg-background p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-medium">{i.patient} <span className="text-[11px] font-normal text-muted-foreground">· {i.id}</span></div>
                        <div className="text-xs text-muted-foreground">{i.reason}</div>
                      </div>
                      <StatusPill tone={statusTone(i.status)}>{i.status}</StatusPill>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                      <span>Responder: <span className="text-foreground">{i.responder}</span></span>
                      <span>Response time: <span className="text-foreground">{i.response}</span></span>
                      {i.escalated && <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-primary">Policy escalation</span>}
                    </div>
                  </div>
                ))}
              </div>
            </Widget>
          </div>
        </section>

        {/* 5. Shift Task Timeline */}
        <section>
          <SectionTitle icon={Clock} title="Shift Task Timeline" subtitle="Coordinated cadence across the shift" />
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
              <LegendDot color="hsl(160 60% 45%)" label="Completed" />
              <LegendDot color="hsl(210 85% 55%)" label="Pending" />
              <LegendDot color="hsl(0 75% 55%)" label="Delayed" />
              <LegendDot color="hsl(35 85% 55%)" label="Rescheduled" />
            </div>

            <ol className="relative space-y-4 border-l-2 border-dashed border-border pl-6">
              {TIMELINE.map((t) => {
                const tone = t.status === "Completed" ? "success"
                  : t.status === "Delayed" ? "danger"
                  : t.status === "Rescheduled" ? "warning" : "info";
                const dot = t.status === "Completed" ? "hsl(160 60% 45%)"
                  : t.status === "Delayed" ? "hsl(0 75% 55%)"
                  : t.status === "Rescheduled" ? "hsl(35 85% 55%)" : "hsl(210 85% 55%)";
                return (
                  <li key={t.time} className="relative">
                    <span
                      className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-card"
                      style={{ background: dot }}
                    />
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="w-14 font-mono text-sm text-muted-foreground">{t.time}</div>
                      <div className="text-sm font-semibold text-foreground">{t.label}</div>
                      <StatusPill tone={tone}>{t.status}</StatusPill>
                    </div>
                    <div className="ml-[68px] text-xs text-muted-foreground">{t.note}</div>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {/* 6. AI Workflow Assistant */}
        <section>
          <SectionTitle icon={Sparkles} title="AI Workflow Assistant" pill="AI Prototype" subtitle="Bottleneck analysis and workflow recommendations" />
          <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 via-card to-card p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-semibold">Workflow assistant summary</div>
                <div className="text-[11px] text-muted-foreground">Updated 2 min ago · Demo insights</div>
              </div>
              <span className="ml-auto rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                AI Prototype
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {AI_INSIGHTS.map((r) => (
                <div key={r.title} className="flex gap-3 rounded-xl border border-border bg-background p-4">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    r.tone === "danger" ? "bg-destructive/15 text-destructive" :
                    r.tone === "warning" ? "bg-warning/20 text-warning-foreground" :
                    "bg-primary/10 text-primary"
                  }`}>
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold">{r.title}</h4>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{r.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <AiChip icon={AlertTriangle} label="Bottlenecks" value="Labs · Wound review" />
              <AiChip icon={TimerReset} label="Departments needing attention" value="ICU · Medical Ward" />
              <AiChip icon={Stethoscope} label="Recommended focus" value="Sequence AM cluster tasks" />
            </div>
          </div>
        </section>

        {/* Footer vision */}
        <section className="rounded-xl border border-border bg-card p-5 text-center text-sm text-muted-foreground shadow-sm">
          Our vision is to build an integrated AI-powered healthcare intelligence ecosystem supporting
          workforce excellence, evidence-based practice, innovation, research, learning, and executive
          decision-making.
        </section>

      </main>
    </EcosystemLayout>
  );
}

// ---------------- UI helpers ----------------

function SectionTitle({
  icon: Icon, title, subtitle, pill,
}: { icon: typeof Activity; title: string; subtitle?: string; pill?: string }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
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
}: { icon: typeof Activity; label: string; value: string | number; tone: "info" | "success" | "warning" | "danger"; hint?: string }) {
  const map = {
    info: "text-primary bg-primary/10",
    success: "text-success bg-success/15",
    warning: "text-warning-foreground bg-warning/20",
    danger: "text-destructive bg-destructive/15",
  };
  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
      <div className="flex items-center gap-2">
        <div className={`flex h-8 w-8 items-center justify-center rounded-md ${map[tone]}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="text-lg font-semibold text-foreground">{value}</div>
        </div>
      </div>
      {hint && <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: string; tone: "info" | "success" | "danger" }) {
  const map = {
    info: "border-primary/30 text-primary",
    success: "border-success/40 text-success",
    danger: "border-destructive/40 text-destructive",
  };
  return (
    <div className={`rounded-lg border bg-background/60 px-3 py-2 text-center ${map[tone]}`}>
      <div className="text-lg font-bold leading-tight">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function AiChip({ icon: Icon, label, value }: { icon: typeof Activity; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-border bg-background p-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="truncate text-sm font-medium text-foreground">{value}</div>
      </div>
    </div>
  );
}
