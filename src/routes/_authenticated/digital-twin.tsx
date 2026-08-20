import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Activity, AlertTriangle, Ambulance, Baby, Beaker, Brain, ClipboardList,
  FlaskConical, HeartPulse, Hospital, Lightbulb, MessageSquare, Pill,
  Radio, ShieldCheck, Sparkles, Stethoscope, ThumbsUp, TrendingUp, Users,
  Workflow, Wrench, X, Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { EcosystemLayout } from "@/components/EcosystemLayout";
import { StatusPill } from "@/components/Widget";
import { getSession, type Session } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/digital-twin")({
  head: () => ({
    meta: [
      { title: "Hospital Digital Twin · NOS Ecosystem" },
      { name: "description", content: "AI-powered real-time visualization of hospital operations for nursing leadership." },
      { property: "og:title", content: "Hospital Digital Twin · NOS Ecosystem" },
      { property: "og:description", content: "Hospital-wide operational awareness — a live digital twin, not another dashboard." },
    ],
  }),
  component: DigitalTwinPage,
});

// ---------------- Types ----------------
type Tone = "success" | "warning" | "danger" | "info";
type DeptKey =
  | "icu" | "ed" | "medsurg" | "surgical" | "peds" | "maternity"
  | "ot" | "cssd" | "pharmacy" | "lab" | "radiology";

type Dept = {
  key: DeptKey;
  name: string;
  short: string;
  icon: LucideIcon;
  // grid position (percent) inside the map viewport
  x: number; y: number;
  // live indicators
  workforceHealth: number;   // 0–100
  staffingLevel: number;     // 0–100 (coverage)
  patientAcuity: "Low" | "Medium" | "High";
  bedOccupancy: number;      // 0–100 (%)
  burnoutRisk: number;       // 0–100
  documentationStatus: "On track" | "Behind" | "Delayed";
  pendingTasks: number;
  criticalResults: number;
  equipmentIssues: number;
  aiOperationalRisk: "Low" | "Moderate" | "Elevated" | "High";
  // panel detail
  nursesOnDuty: number;
  patientCount: number;
  highPriorityPatients: number;
  openWorkflowTasks: number;
  delayedInvestigations: number;
  outstandingConcerns: number;
  informaticsChampion: string;
  latestIdea: string;
  latestAppreciation: string;
  aiRecommendations: string[];
};

type FlowType =
  | "Patient Flow" | "Laboratory Requests" | "Radiology Requests"
  | "Pharmacy Activity" | "CSSD Flow" | "Workforce Support" | "Transfer Requests";

// ---------------- Demo data ----------------
const DEPTS: Dept[] = [
  {
    key: "ed", name: "Emergency Department", short: "ED", icon: Ambulance,
    x: 12, y: 30,
    workforceHealth: 68, staffingLevel: 78, patientAcuity: "High", bedOccupancy: 94,
    burnoutRisk: 71, documentationStatus: "Delayed", pendingTasks: 14,
    criticalResults: 2, equipmentIssues: 1, aiOperationalRisk: "High",
    nursesOnDuty: 14, patientCount: 42, highPriorityPatients: 9,
    openWorkflowTasks: 18, delayedInvestigations: 5, outstandingConcerns: 4,
    informaticsChampion: "Miguel R.",
    latestIdea: "Auto-flag repeat triage vitals to reduce duplicate charting.",
    latestAppreciation: "Team held safe ratios during the 22:00 surge.",
    aiRecommendations: [
      "Pull 1 float nurse from Med-Surg for the 18:00–22:00 window.",
      "Escalate 2 unacknowledged critical labs to charge nurse.",
      "Pre-open on-call list — admissions trending +42% vs forecast.",
    ],
  },
  {
    key: "icu", name: "Intensive Care Unit", short: "ICU", icon: HeartPulse,
    x: 32, y: 18,
    workforceHealth: 62, staffingLevel: 82, patientAcuity: "High", bedOccupancy: 92,
    burnoutRisk: 74, documentationStatus: "Behind", pendingTasks: 9,
    criticalResults: 1, equipmentIssues: 0, aiOperationalRisk: "Elevated",
    nursesOnDuty: 10, patientCount: 12, highPriorityPatients: 11,
    openWorkflowTasks: 12, delayedInvestigations: 2, outstandingConcerns: 3,
    informaticsChampion: "Sara N.",
    latestIdea: "Bedside handover checklist embedded in the flowsheet.",
    latestAppreciation: "Sustained 1:1 ratio through the weekend.",
    aiRecommendations: [
      "Two nurses approaching consecutive-shift threshold — offer recovery.",
      "Workload index 1.24× — consider evening float allocation.",
    ],
  },
  {
    key: "medsurg", name: "Medical Ward", short: "Med-Surg", icon: Stethoscope,
    x: 55, y: 24,
    workforceHealth: 82, staffingLevel: 91, patientAcuity: "Medium", bedOccupancy: 86,
    burnoutRisk: 41, documentationStatus: "On track", pendingTasks: 6,
    criticalResults: 0, equipmentIssues: 0, aiOperationalRisk: "Low",
    nursesOnDuty: 16, patientCount: 44, highPriorityPatients: 6,
    openWorkflowTasks: 9, delayedInvestigations: 1, outstandingConcerns: 1,
    informaticsChampion: "Aisha K.",
    latestIdea: "Cluster AM medications and vitals into a single round.",
    latestAppreciation: "Excellent workflow performance this week — recognize the team.",
    aiRecommendations: [
      "Team performing above target — send appreciation from CNO desk.",
      "Consider volunteering 1 float nurse to ED evening shift.",
    ],
  },
  {
    key: "surgical", name: "Surgical Ward", short: "Surgical", icon: Wrench,
    x: 78, y: 30,
    workforceHealth: 74, staffingLevel: 86, patientAcuity: "Medium", bedOccupancy: 81,
    burnoutRisk: 48, documentationStatus: "On track", pendingTasks: 7,
    criticalResults: 0, equipmentIssues: 1, aiOperationalRisk: "Moderate",
    nursesOnDuty: 12, patientCount: 28, highPriorityPatients: 4,
    openWorkflowTasks: 10, delayedInvestigations: 2, outstandingConcerns: 2,
    informaticsChampion: "David O.",
    latestIdea: "Pre-op checklist auto-populate from theatre schedule.",
    latestAppreciation: "Zero surgical-site infections this month.",
    aiRecommendations: [
      "One infusion pump flagged — coordinate with biomed for swap.",
      "PACU handover average +6 min — review with theatre team.",
    ],
  },
  {
    key: "peds", name: "Pediatric Ward", short: "Pediatric", icon: Baby,
    x: 18, y: 62,
    workforceHealth: 86, staffingLevel: 94, patientAcuity: "Low", bedOccupancy: 62,
    burnoutRisk: 32, documentationStatus: "On track", pendingTasks: 3,
    criticalResults: 0, equipmentIssues: 0, aiOperationalRisk: "Low",
    nursesOnDuty: 7, patientCount: 15, highPriorityPatients: 2,
    openWorkflowTasks: 4, delayedInvestigations: 0, outstandingConcerns: 0,
    informaticsChampion: "Priya S.",
    latestIdea: "Family-facing rounding board via bedside tablet.",
    latestAppreciation: "Parents' satisfaction score up 8 points.",
    aiRecommendations: [
      "Stable unit — good candidate to lend a float nurse to ED.",
    ],
  },
  {
    key: "maternity", name: "Maternity", short: "Maternity", icon: Baby,
    x: 40, y: 68,
    workforceHealth: 84, staffingLevel: 96, patientAcuity: "Medium", bedOccupancy: 74,
    burnoutRisk: 35, documentationStatus: "On track", pendingTasks: 2,
    criticalResults: 0, equipmentIssues: 0, aiOperationalRisk: "Low",
    nursesOnDuty: 8, patientCount: 14, highPriorityPatients: 2,
    openWorkflowTasks: 5, delayedInvestigations: 0, outstandingConcerns: 1,
    informaticsChampion: "Lena P.",
    latestIdea: "Postpartum wellbeing check auto-scheduled at 6h & 24h.",
    latestAppreciation: "Skin-to-skin compliance at 98% this quarter.",
    aiRecommendations: [
      "Stable — maintain current staffing plan.",
    ],
  },
  {
    key: "ot", name: "Operating Theatre", short: "OT", icon: Activity,
    x: 62, y: 55,
    workforceHealth: 76, staffingLevel: 89, patientAcuity: "High", bedOccupancy: 88,
    burnoutRisk: 46, documentationStatus: "On track", pendingTasks: 5,
    criticalResults: 0, equipmentIssues: 2, aiOperationalRisk: "Moderate",
    nursesOnDuty: 6, patientCount: 8, highPriorityPatients: 3,
    openWorkflowTasks: 6, delayedInvestigations: 1, outstandingConcerns: 1,
    informaticsChampion: "Rita M.",
    latestIdea: "Instrument tray count captured with barcode at handover.",
    latestAppreciation: "First-case on-time starts up to 92%.",
    aiRecommendations: [
      "2 instrument sets awaiting CSSD — escalate turnaround.",
      "Case 4 likely to overrun — notify PACU coordinator.",
    ],
  },
  {
    key: "cssd", name: "CSSD", short: "CSSD", icon: ShieldCheck,
    x: 82, y: 60,
    workforceHealth: 78, staffingLevel: 84, patientAcuity: "Low", bedOccupancy: 0,
    burnoutRisk: 40, documentationStatus: "On track", pendingTasks: 4,
    criticalResults: 0, equipmentIssues: 1, aiOperationalRisk: "Moderate",
    nursesOnDuty: 5, patientCount: 0, highPriorityPatients: 0,
    openWorkflowTasks: 7, delayedInvestigations: 0, outstandingConcerns: 0,
    informaticsChampion: "Omar T.",
    latestIdea: "Real-time tray tracker linked to OT scheduling.",
    latestAppreciation: "Reprocessing turnaround reduced by 12 min.",
    aiRecommendations: [
      "Autoclave #2 due for validation — schedule within 24h.",
      "OT is waiting on 2 sets — prioritize orthopedic tray.",
    ],
  },
  {
    key: "pharmacy", name: "Pharmacy", short: "Pharmacy", icon: Pill,
    x: 30, y: 45,
    workforceHealth: 80, staffingLevel: 88, patientAcuity: "Low", bedOccupancy: 0,
    burnoutRisk: 38, documentationStatus: "On track", pendingTasks: 6,
    criticalResults: 0, equipmentIssues: 0, aiOperationalRisk: "Low",
    nursesOnDuty: 4, patientCount: 0, highPriorityPatients: 0,
    openWorkflowTasks: 11, delayedInvestigations: 0, outstandingConcerns: 0,
    informaticsChampion: "Hana Y.",
    latestIdea: "One-tap flag for antibiotic stewardship alerts.",
    latestAppreciation: "Zero missed high-alert med checks this week.",
    aiRecommendations: [
      "ICU insulin drip stock trending low — replenish before evening.",
    ],
  },
  {
    key: "lab", name: "Laboratory", short: "Lab", icon: FlaskConical,
    x: 50, y: 44,
    workforceHealth: 74, staffingLevel: 82, patientAcuity: "Low", bedOccupancy: 0,
    burnoutRisk: 44, documentationStatus: "Behind", pendingTasks: 9,
    criticalResults: 2, equipmentIssues: 0, aiOperationalRisk: "Elevated",
    nursesOnDuty: 3, patientCount: 0, highPriorityPatients: 0,
    openWorkflowTasks: 22, delayedInvestigations: 4, outstandingConcerns: 1,
    informaticsChampion: "Kenji A.",
    latestIdea: "Auto-route critical values to charge-nurse pager.",
    latestAppreciation: "STAT TAT under 30 min for 96% of samples.",
    aiRecommendations: [
      "2 critical results awaiting acknowledgement — escalate to ED & ICU.",
      "Hematology backlog — reassign 1 tech from chemistry.",
    ],
  },
  {
    key: "radiology", name: "Radiology", short: "Radiology", icon: Radio,
    x: 70, y: 44,
    workforceHealth: 77, staffingLevel: 85, patientAcuity: "Low", bedOccupancy: 0,
    burnoutRisk: 42, documentationStatus: "Behind", pendingTasks: 8,
    criticalResults: 0, equipmentIssues: 1, aiOperationalRisk: "Moderate",
    nursesOnDuty: 4, patientCount: 0, highPriorityPatients: 0,
    openWorkflowTasks: 15, delayedInvestigations: 3, outstandingConcerns: 1,
    informaticsChampion: "Noor B.",
    latestIdea: "Portable X-ray requests batched by ward for transport efficiency.",
    latestAppreciation: "CT throughput +14% after new scheduling window.",
    aiRecommendations: [
      "3 STAT reports pending > 45 min — nudge on-call radiologist.",
      "CT #2 flagged for calibration — plan maintenance window.",
    ],
  },
];

const FLOWS: { from: DeptKey; to: DeptKey; type: FlowType; intensity: number }[] = [
  { from: "ed",       to: "icu",       type: "Patient Flow",         intensity: 3 },
  { from: "ed",       to: "medsurg",   type: "Patient Flow",         intensity: 2 },
  { from: "ed",       to: "lab",       type: "Laboratory Requests",  intensity: 3 },
  { from: "ed",       to: "radiology", type: "Radiology Requests",   intensity: 3 },
  { from: "icu",      to: "lab",       type: "Laboratory Requests",  intensity: 2 },
  { from: "icu",      to: "pharmacy",  type: "Pharmacy Activity",    intensity: 3 },
  { from: "medsurg",  to: "pharmacy",  type: "Pharmacy Activity",    intensity: 2 },
  { from: "medsurg",  to: "radiology", type: "Radiology Requests",   intensity: 2 },
  { from: "surgical", to: "ot",        type: "Transfer Requests",    intensity: 2 },
  { from: "ot",       to: "cssd",      type: "CSSD Flow",            intensity: 3 },
  { from: "ot",       to: "icu",       type: "Patient Flow",         intensity: 2 },
  { from: "medsurg",  to: "ed",        type: "Workforce Support",    intensity: 1 },
  { from: "peds",     to: "ed",        type: "Workforce Support",    intensity: 1 },
];

const FLOW_COLORS: Record<FlowType, string> = {
  "Patient Flow":        "hsl(210 85% 55%)",
  "Laboratory Requests": "hsl(280 60% 60%)",
  "Radiology Requests":  "hsl(190 70% 50%)",
  "Pharmacy Activity":   "hsl(160 65% 45%)",
  "CSSD Flow":           "hsl(35 85% 55%)",
  "Workforce Support":   "hsl(340 70% 55%)",
  "Transfer Requests":   "hsl(25 90% 55%)",
};

// ---------------- Component ----------------
function DigitalTwinPage() {
  const navigate = useNavigate();
  const [session, setSess] = useState<Session | null>(null);
  const [selected, setSelected] = useState<DeptKey | null>(null);

  useEffect(() => {
    const s = getSession();
    if (!s) { navigate({ to: "/login" }); return; }
    setSess(s);
  }, [navigate]);

  const dept = useMemo(
    () => (selected ? DEPTS.find((d) => d.key === selected) ?? null : null),
    [selected],
  );

  if (!session) {
    return <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">Loading…</div>;
  }

  return (
    <EcosystemLayout>
      <main className="mx-auto max-w-[1500px] space-y-6 px-4 py-6 sm:px-6">
        {/* Header */}
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Hospital className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">Hospital Digital Twin</h1>
                <StatusPill tone="info">AI Prototype</StatusPill>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Real-time operational awareness across every department · not another dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusPill tone="success">
              <span className="mr-1 h-1.5 w-1.5 animate-pulse rounded-full bg-success" /> Live twin
            </StatusPill>
            <span className="text-[11px] text-muted-foreground">Sync · just now</span>
          </div>
        </header>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          {/* Map */}
          <HospitalMap onSelect={setSelected} selected={selected} />

          {/* Executive summary */}
          <ExecutiveSummary />
        </div>

        {/* Flow legend + indicator legend */}
        <FlowLegend />

        {/* Department indicators grid */}
        <DepartmentIndicatorsGrid onSelect={setSelected} />
      </main>

      {/* Side panel */}
      {dept && <DeptSidePanel dept={dept} onClose={() => setSelected(null)} />}
    </EcosystemLayout>
  );
}

// ---------------- Hospital map (SVG) ----------------
function HospitalMap({ onSelect, selected }: { onSelect: (k: DeptKey) => void; selected: DeptKey | null }) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground">Interactive Hospital Map</h2>
          <p className="text-xs text-muted-foreground">Click a department to open the live operational panel</p>
        </div>
        <StatusPill tone="info">AI Prototype</StatusPill>
      </div>

      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-border bg-background">
        {/* Grid backdrop */}
        <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
          <defs>
            <pattern id="dt-grid" width="5" height="5" patternUnits="userSpaceOnUse">
              <path d="M 5 0 L 0 0 0 5" fill="none" stroke="hsl(var(--border))" strokeWidth="0.15" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#dt-grid)" />

          {/* Animated connections */}
          {FLOWS.map((f, i) => {
            const from = DEPTS.find((d) => d.key === f.from)!;
            const to = DEPTS.find((d) => d.key === f.to)!;
            const color = FLOW_COLORS[f.type];
            const id = `flow-${i}`;
            return (
              <g key={id}>
                <line
                  x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke={color} strokeOpacity="0.25"
                  strokeWidth={0.35 + f.intensity * 0.1}
                  strokeDasharray="1.2 1.2"
                />
                <circle r="0.6" fill={color}>
                  <animateMotion
                    dur={`${5 - f.intensity * 0.6}s`}
                    repeatCount="indefinite"
                    path={`M ${from.x} ${from.y} L ${to.x} ${to.y}`}
                  />
                </circle>
              </g>
            );
          })}
        </svg>

        {/* Department nodes (HTML overlay for interactivity) */}
        {DEPTS.map((d) => {
          const isSel = selected === d.key;
          const tone = riskTone(d.aiOperationalRisk);
          return (
            <button
              key={d.key}
              onClick={() => onSelect(d.key)}
              className={`group absolute -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-card/95 px-2.5 py-1.5 text-left shadow-md backdrop-blur transition ${
                isSel ? "border-primary ring-2 ring-primary/40" : "border-border hover:border-primary/50"
              }`}
              style={{ left: `${d.x}%`, top: `${d.y}%` }}
              title={d.name}
            >
              <div className="flex items-center gap-2">
                <div className={`flex h-7 w-7 items-center justify-center rounded-md ${toneBg(tone)}`}>
                  <d.icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold leading-tight text-foreground">{d.short}</div>
                  <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                    <span className={`inline-block h-1.5 w-1.5 rounded-full ${dotBg(tone)}`} />
                    {d.aiOperationalRisk} risk
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

// ---------------- Flow legend ----------------
function FlowLegend() {
  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Animated Connections</h3>
          <p className="text-[11px] text-muted-foreground">Cross-department flows moving across the hospital right now</p>
        </div>
        <StatusPill tone="info">Live</StatusPill>
      </div>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(FLOW_COLORS) as FlowType[]).map((t) => (
          <div key={t} className="flex items-center gap-2 rounded-full border border-border bg-background px-2.5 py-1">
            <span className="h-2 w-2 rounded-full" style={{ background: FLOW_COLORS[t] }} />
            <span className="text-[11px] font-medium text-foreground">{t}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------------- Department indicators grid ----------------
function DepartmentIndicatorsGrid({ onSelect }: { onSelect: (k: DeptKey) => void }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground">Live Department Indicators</h2>
          <p className="text-xs text-muted-foreground">Ten operational signals per department · click a card to open the side panel</p>
        </div>
        <StatusPill tone="info">AI Prototype</StatusPill>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {DEPTS.map((d) => (
          <article
            key={d.key}
            className="cursor-pointer rounded-xl border border-border bg-background p-4 transition hover:border-primary/50 hover:shadow-md"
            onClick={() => onSelect(d.key)}
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className={`flex h-9 w-9 items-center justify-center rounded-md ${toneBg(riskTone(d.aiOperationalRisk))}`}>
                  <d.icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{d.name}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {d.short}
                  </div>
                </div>
              </div>
              <StatusPill tone={riskTone(d.aiOperationalRisk)}>
                {d.aiOperationalRisk} risk
              </StatusPill>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Bar label="Workforce Health"  value={d.workforceHealth}   tone={scoreTone(d.workforceHealth, true)} />
              <Bar label="Staffing Level"    value={d.staffingLevel}     tone={scoreTone(d.staffingLevel, true)} />
              <Metric label="Patient Acuity" value={d.patientAcuity} tone={acuityTone(d.patientAcuity)} />
              <Bar label="Bed Occupancy"     value={d.bedOccupancy}      tone={occupancyTone(d.bedOccupancy)} />
              <Bar label="Burnout Risk"      value={d.burnoutRisk}       tone={scoreTone(d.burnoutRisk, false)} />
              <Metric label="Documentation"  value={d.documentationStatus} tone={docTone(d.documentationStatus)} />
              <Metric label="Pending Tasks"  value={d.pendingTasks}  tone={countTone(d.pendingTasks, 8)} />
              <Metric label="Critical Results" value={d.criticalResults} tone={d.criticalResults > 0 ? "danger" : "success"} />
              <Metric label="Equipment Issues" value={d.equipmentIssues} tone={d.equipmentIssues > 0 ? "warning" : "success"} />
              <Metric label="AI Op. Risk"      value={d.aiOperationalRisk} tone={riskTone(d.aiOperationalRisk)} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

// ---------------- Executive summary ----------------
function ExecutiveSummary() {
  const attention = DEPTS
    .filter((d) => d.aiOperationalRisk === "High" || d.aiOperationalRisk === "Elevated")
    .slice(0, 4);

  return (
    <aside className="space-y-4 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Brain className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Executive Summary</h3>
            <p className="text-[11px] text-muted-foreground">Hospital-wide operational awareness</p>
          </div>
        </div>
        <StatusPill tone="info">AI Prototype</StatusPill>
      </div>

      <div>
        <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Hospital Operational Status
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2">
          <AlertTriangle className="h-4 w-4 text-warning-foreground" />
          <span className="text-sm font-semibold text-foreground">Stable with focused hotspots</span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Workforce remains stable overall. ED and ICU require staffing support this evening;
          Lab has two critical results awaiting acknowledgement.
        </p>
      </div>

      <div>
        <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Departments Requiring Immediate Attention
        </div>
        <ul className="space-y-1.5">
          {attention.map((d) => (
            <li key={d.key} className="flex items-center justify-between rounded-md border border-border bg-background px-2.5 py-1.5">
              <div className="flex items-center gap-2">
                <d.icon className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium text-foreground">{d.name}</span>
              </div>
              <StatusPill tone={riskTone(d.aiOperationalRisk)}>{d.aiOperationalRisk}</StatusPill>
            </li>
          ))}
        </ul>
      </div>

      <SummaryBlock icon={Sparkles} title="Operational Recommendations (AI Prototype)" items={[
        "Deploy 1 float nurse from Med-Surg to ED for 18:00–22:00.",
        "Escalate 2 critical lab results (Bed 7 K+ 6.8 · Bed 12 Troponin ↑).",
        "Recognize Med-Surg team for sustained 91% coverage.",
      ]} />

      <SummaryBlock icon={TrendingUp} title="Expected Workload — Next Shift" items={[
        "ED: +18% admissions vs baseline.",
        "ICU: 1 anticipated transfer from OT.",
        "Med-Surg: 4 discharges likely — beds freeing up.",
      ]} />

      <SummaryBlock icon={Users} title="Float Nurse Recommendation" items={[
        "Reallocate 1 RN from Pediatric → ED (highest marginal impact).",
        "Hold 1 flex nurse for potential ICU escalation.",
      ]} />

      <SummaryBlock icon={Workflow} title="Potential Bottlenecks" items={[
        "OT waiting on 2 CSSD trays — turnaround risk.",
        "Radiology STAT reports > 45 min TAT.",
        "ED documentation backlog rising in evening window.",
      ]} />
    </aside>
  );
}

function SummaryBlock({ icon: Icon, title, items }: { icon: LucideIcon; title: string; items: string[] }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3 text-primary" /> {title}
      </div>
      <ul className="space-y-1">
        {items.map((it) => (
          <li key={it} className="flex gap-1.5 text-xs leading-relaxed text-foreground">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------------- Side panel ----------------
function DeptSidePanel({ dept, onClose }: { dept: Dept; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-background/60 backdrop-blur-sm" onClick={onClose} />
      <aside className="flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-border bg-card shadow-2xl animate-slide-in-right">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-border bg-card/95 p-4 backdrop-blur">
          <div className="flex items-start gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneBg(riskTone(dept.aiOperationalRisk))}`}>
              <dept.icon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold tracking-tight text-foreground">{dept.name}</h3>
                <StatusPill tone={riskTone(dept.aiOperationalRisk)}>{dept.aiOperationalRisk} risk</StatusPill>
              </div>
              <p className="text-[11px] text-muted-foreground">Live operational panel · demo data</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md border border-border p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Close panel"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="space-y-5 p-4">
          {/* Snapshot */}
          <div className="grid grid-cols-2 gap-2">
            <PanelStat icon={Users}        label="Nurses on duty"        value={dept.nursesOnDuty} />
            <PanelStat icon={Stethoscope}  label="Patient count"         value={dept.patientCount} />
            <PanelStat icon={AlertTriangle} label="High-priority patients" value={dept.highPriorityPatients} tone={dept.highPriorityPatients > 5 ? "danger" : "info"} />
            <PanelStat icon={ClipboardList} label="Open workflow tasks"    value={dept.openWorkflowTasks} tone={countTone(dept.openWorkflowTasks, 10)} />
            <PanelStat icon={Beaker}       label="Delayed investigations" value={dept.delayedInvestigations} tone={dept.delayedInvestigations > 2 ? "warning" : "success"} />
            <PanelStat icon={MessageSquare} label="Outstanding concerns"  value={dept.outstandingConcerns} tone={dept.outstandingConcerns > 2 ? "warning" : "info"} />
          </div>

          {/* Champion */}
          <section className="rounded-xl border border-border bg-background p-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Informatics Champion</div>
                <div className="text-sm font-semibold text-foreground">{dept.informaticsChampion}</div>
              </div>
            </div>
          </section>

          {/* Latest idea + appreciation */}
          <div className="grid gap-2">
            <TextBlock icon={Lightbulb} label="Latest improvement idea" body={dept.latestIdea} tone="info" />
            <TextBlock icon={ThumbsUp}  label="Latest appreciation"     body={dept.latestAppreciation} tone="success" />
          </div>

          {/* AI recommendations */}
          <section className="rounded-xl border border-primary/25 bg-primary/5 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <div className="text-sm font-semibold text-foreground">Operational Recommendations (AI Prototype)</div>
              </div>
              <StatusPill tone="info">AI Prototype</StatusPill>
            </div>
            <ul className="space-y-1.5">
              {dept.aiRecommendations.map((r) => (
                <li key={r} className="flex gap-2 text-xs leading-relaxed text-foreground">
                  <Zap className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </aside>
    </div>
  );
}

// ---------------- Small building blocks ----------------
function Bar({ label, value, tone }: { label: string; value: number; tone: Tone }) {
  return (
    <div className="rounded-md border border-border bg-card px-2 py-1.5">
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span className="uppercase tracking-wider">{label}</span>
        <span className="font-mono text-foreground">{value}%</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: toneColor(tone) }} />
      </div>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string | number; tone: Tone }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border bg-card px-2 py-1.5">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <StatusPill tone={tone}>{value}</StatusPill>
    </div>
  );
}

function PanelStat({ icon: Icon, label, value, tone = "info" }: { icon: LucideIcon; label: string; value: number | string; tone?: Tone }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-background p-2.5">
      <div className={`flex h-8 w-8 items-center justify-center rounded-md ${toneBg(tone)}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-sm font-semibold text-foreground">{value}</div>
      </div>
    </div>
  );
}

function TextBlock({ icon: Icon, label, body, tone }: { icon: LucideIcon; label: string; body: string; tone: Tone }) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="flex items-center gap-2">
        <div className={`flex h-7 w-7 items-center justify-center rounded-md ${toneBg(tone)}`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-foreground">{body}</p>
    </div>
  );
}

// ---------------- tone helpers ----------------
function toneBg(tone: Tone) {
  return tone === "danger"  ? "bg-destructive/15 text-destructive" :
         tone === "warning" ? "bg-warning/20 text-warning-foreground" :
         tone === "success" ? "bg-success/15 text-success" :
                              "bg-primary/10 text-primary";
}
function dotBg(tone: Tone) {
  return tone === "danger"  ? "bg-destructive" :
         tone === "warning" ? "bg-warning" :
         tone === "success" ? "bg-success" : "bg-primary";
}
function toneColor(tone: Tone) {
  return tone === "danger"  ? "hsl(0 75% 55%)" :
         tone === "warning" ? "hsl(35 85% 55%)" :
         tone === "success" ? "hsl(160 60% 45%)" :
                              "hsl(210 85% 55%)";
}
function riskTone(r: Dept["aiOperationalRisk"]): Tone {
  return r === "High" ? "danger" : r === "Elevated" ? "warning" : r === "Moderate" ? "info" : "success";
}
function acuityTone(a: Dept["patientAcuity"]): Tone {
  return a === "High" ? "danger" : a === "Medium" ? "warning" : "success";
}
function docTone(s: Dept["documentationStatus"]): Tone {
  return s === "Delayed" ? "danger" : s === "Behind" ? "warning" : "success";
}
function occupancyTone(v: number): Tone {
  return v >= 90 ? "danger" : v >= 75 ? "warning" : v > 0 ? "success" : "info";
}
function scoreTone(v: number, higherIsBetter: boolean): Tone {
  if (higherIsBetter) return v >= 85 ? "success" : v >= 70 ? "info" : v >= 55 ? "warning" : "danger";
  return v <= 40 ? "success" : v <= 60 ? "warning" : "danger";
}
function countTone(n: number, threshold: number): Tone {
  return n === 0 ? "success" : n < threshold ? "info" : n < threshold * 1.5 ? "warning" : "danger";
}
