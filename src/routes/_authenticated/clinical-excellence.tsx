import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ShieldCheck,
  Activity,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Microscope,
  ClipboardCheck,
  GraduationCap,
  Stethoscope,
  Building2,
  Award,
  Target,
  Droplets,
  Wind,
  Trash2,
  Syringe,
  Bug,
  HandMetal,
  BookOpen,
  FileText,
  Users2,
  ArrowUpRight,
  ArrowDownRight,
  Gauge,
  Star,
  HeartPulse,
  ScrollText,
  FlaskConical,
  Shield,
  Layers,
  Search,
  ExternalLink,
  Clock,
  UserCheck,
} from "lucide-react";
import { ClinicalExcellenceNav } from "@/components/ClinicalExcellenceNav";
import { Widget, StatusPill } from "@/components/Widget";
import { AIIntelligenceLayer } from "@/components/AIIntelligenceLayer";
import { ExecutiveDecisionSupport } from "@/components/ExecutiveDecisionSupport";

export const Route = createFileRoute("/_authenticated/clinical-excellence")({
  validateSearch: (search: Record<string, unknown>): { tab?: string } => ({
    tab: typeof search.tab === "string" ? search.tab : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Clinical Excellence Hub · NOS Ecosystem" },
      {
        name: "description",
        content:
          "Evidence-Based Care, Infection Prevention, Patient Safety and Quality Improvement — AI-assisted clinical excellence intelligence.",
      },
    ],
  }),
  component: ClinicalExcellencePage,
});

// -------------------- Tab Model --------------------

export type ExcellenceHubTabId =
  | "quality"
  | "bundles"
  | "safety"
  | "ipc"
  | "audits"
  | "ebp"
  | "competency";

interface TabDef {
  id: ExcellenceHubTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const TABS: TabDef[] = [
  { id: "quality", label: "Quality Dashboard", icon: Gauge, badge: "Overview" },
  { id: "bundles", label: "Bundle Compliance", icon: ShieldCheck, badge: "10 Bundles" },
  { id: "safety", label: "Patient Safety & Quality", icon: HeartPulse, badge: "20 Depts" },
  { id: "ipc", label: "Infection Prevention", icon: Shield, badge: "2 Alerts" },
  { id: "audits", label: "Clinical Audits", icon: ClipboardCheck, badge: "128 Done" },
  { id: "ebp", label: "Evidence-Based Practice", icon: BookOpen, badge: "214 Guidelines" },
  { id: "competency", label: "Clinical Competency", icon: GraduationCap, badge: "92%" },
];

// -------------------- Data Sets --------------------

type Trend = "up" | "down" | "flat";
type Risk = "low" | "moderate" | "high" | "critical";

const BUNDLES: {
  name: string;
  dept: string;
  compliance: number;
  overdue: number;
  trend: Trend;
  risk: Risk;
  ai: string;
}[] = [
  { name: "Sepsis Bundle", dept: "ED / ICU", compliance: 92, overdue: 3, trend: "up", risk: "low", ai: "Maintain lactate re-check adherence within 3h window." },
  { name: "CLABSI Prevention", dept: "ICU / NICU", compliance: 88, overdue: 5, trend: "up", risk: "moderate", ai: "Reinforce daily line necessity review in ICU-B." },
  { name: "CAUTI Prevention", dept: "ICU / Med-Surg", compliance: 81, overdue: 9, trend: "down", risk: "high", ai: "Trial nurse-driven removal protocol in Medical Ward." },
  { name: "VAP Prevention", dept: "ICU", compliance: 94, overdue: 1, trend: "up", risk: "low", ai: "Sustain HOB 30–45° audit twice per shift." },
  { name: "Pressure Injury Prevention", dept: "All wards", compliance: 86, overdue: 7, trend: "flat", risk: "moderate", ai: "Prioritise Braden re-score for LOS >5 days." },
  { name: "Falls Prevention", dept: "Medical / Geri", compliance: 83, overdue: 6, trend: "down", risk: "high", ai: "Deploy hourly rounding tracker on Medical-3." },
  { name: "Medication Safety", dept: "All wards", compliance: 90, overdue: 4, trend: "up", risk: "moderate", ai: "Focus double-check compliance on high-alert drugs." },
  { name: "Surgical Safety Checklist", dept: "OT / Recovery", compliance: 96, overdue: 0, trend: "up", risk: "low", ai: "Excellent — nominate OT for CQI recognition." },
  { name: "Stroke Bundle", dept: "ED / Neuro", compliance: 79, overdue: 8, trend: "down", risk: "high", ai: "Reduce door-to-CT time; simulation drill recommended." },
  { name: "Acute Coronary Syndrome", dept: "ED / Cardiac", compliance: 91, overdue: 2, trend: "up", risk: "low", ai: "Sustain ECG within 10min; add refresher for triage." },
];

const DEPT_CARDS: {
  name: string;
  compliance: number;
  safety: number;
  bundles: number;
  docs: number;
  issues: number;
  infection: Risk;
}[] = [
  { name: "ICU", compliance: 92, safety: 94, bundles: 90, docs: 89, issues: 3, infection: "moderate" },
  { name: "Emergency", compliance: 87, safety: 88, bundles: 86, docs: 82, issues: 6, infection: "moderate" },
  { name: "Medical Ward", compliance: 84, safety: 86, bundles: 82, docs: 80, issues: 7, infection: "moderate" },
  { name: "Surgical Ward", compliance: 90, safety: 91, bundles: 89, docs: 86, issues: 4, infection: "low" },
  { name: "Operating Theatre", compliance: 96, safety: 97, bundles: 96, docs: 93, issues: 1, infection: "low" },
  { name: "Recovery (PACU)", compliance: 93, safety: 94, bundles: 92, docs: 90, issues: 2, infection: "low" },
  { name: "NICU", compliance: 94, safety: 96, bundles: 93, docs: 91, issues: 2, infection: "moderate" },
  { name: "PICU", compliance: 91, safety: 93, bundles: 90, docs: 88, issues: 3, infection: "moderate" },
  { name: "Pediatrics", compliance: 89, safety: 90, bundles: 87, docs: 85, issues: 4, infection: "low" },
  { name: "Maternity", compliance: 92, safety: 93, bundles: 90, docs: 88, issues: 3, infection: "low" },
  { name: "Labour Room", compliance: 90, safety: 92, bundles: 88, docs: 85, issues: 4, infection: "low" },
  { name: "Dialysis", compliance: 88, safety: 89, bundles: 85, docs: 82, issues: 5, infection: "high" },
  { name: "Endoscopy", compliance: 91, safety: 92, bundles: 90, docs: 87, issues: 3, infection: "moderate" },
  { name: "Cath Lab", compliance: 93, safety: 94, bundles: 91, docs: 89, issues: 2, infection: "low" },
  { name: "Radiology", compliance: 89, safety: 90, bundles: 86, docs: 84, issues: 3, infection: "low" },
  { name: "Laboratory", compliance: 95, safety: 95, bundles: 93, docs: 92, issues: 1, infection: "low" },
  { name: "Blood Bank", compliance: 97, safety: 98, bundles: 96, docs: 95, issues: 0, infection: "low" },
  { name: "CSSD", compliance: 94, safety: 95, bundles: 93, docs: 91, issues: 2, infection: "low" },
  { name: "Pharmacy", compliance: 96, safety: 96, bundles: 95, docs: 94, issues: 1, infection: "low" },
  { name: "OPD", compliance: 86, safety: 87, bundles: 82, docs: 80, issues: 5, infection: "low" },
];

const IPC_METRICS = [
  { label: "Hand Hygiene", value: 91, icon: HandMetal, tone: "success" as const },
  { label: "Isolation Compliance", value: 88, icon: ShieldCheck, tone: "success" as const },
  { label: "PPE Compliance", value: 93, icon: ShieldCheck, tone: "success" as const },
  { label: "Environmental Cleaning", value: 89, icon: Droplets, tone: "success" as const },
  { label: "Sterilization (CSSD)", value: 96, icon: FlaskConical, tone: "success" as const },
  { label: "CSSD Monitoring", value: 94, icon: Microscope, tone: "success" as const },
  { label: "Waste Segregation", value: 90, icon: Trash2, tone: "success" as const },
  { label: "Sharps Safety", value: 92, icon: Syringe, tone: "success" as const },
  { label: "HAI Trend (30d)", value: 76, icon: Bug, tone: "warning" as const, suffix: "↓" },
  { label: "Antibiotic Stewardship", value: 84, icon: Wind, tone: "success" as const },
  { label: "Isolation Rooms in Use", value: 7, icon: Building2, tone: "info" as const, unit: "rooms" },
  { label: "Active IPC Alerts", value: 2, icon: AlertTriangle, tone: "warning" as const, unit: "alerts" },
];

const NSQI = [
  { label: "Patient Falls (per 1k pt-days)", value: "2.4", delta: "-0.6", good: true },
  { label: "Pressure Injuries (HAPI)", value: "1.1", delta: "-0.2", good: true },
  { label: "Medication Errors (per 1k)", value: "0.8", delta: "-0.1", good: true },
  { label: "Near Misses reported", value: "34", delta: "+8", good: true },
  { label: "Patient Satisfaction (HCAHPS)", value: "88%", delta: "+2", good: true },
  { label: "Pain Assessment Compliance", value: "94%", delta: "+1", good: true },
  { label: "Hourly Rounding", value: "89%", delta: "-2", good: false },
  { label: "Nursing Documentation Quality", value: "91%", delta: "+3", good: true },
  { label: "EWS Compliance", value: "93%", delta: "+1", good: true },
  { label: "Rapid Response Activations", value: "18", delta: "-4", good: true },
];

const AUDIT = [
  { label: "Completed Audits (Q)", value: 128, tone: "success" as const },
  { label: "Pending Audits", value: 24, tone: "warning" as const },
  { label: "High-Priority Findings", value: 9, tone: "danger" as const },
  { label: "Corrective Actions Open", value: 17, tone: "warning" as const },
  { label: "CAPA Closed on-time", value: "82%", tone: "success" as const },
  { label: "Audit Compliance", value: "90%", tone: "success" as const },
];

const AUDIT_FINDINGS = [
  {
    title: "Sepsis 3-Hour Bundle Adherence Audit",
    dept: "Emergency & ICU",
    lead: "Dr. Rachel Thorne (Quality Lead)",
    compliance: "92%",
    status: "On Track",
    capa: "Automated serum lactate re-order prompt integrated into clinical order set.",
  },
  {
    title: "High-Alert Medication Double-Check Audit",
    dept: "Medical Ward & Surgical Ward",
    lead: "Sarah Jenkins, RN (CNO Auditor)",
    compliance: "86%",
    status: "Action Required",
    capa: "Scanner hardware audit and dual-signoff reinforcement simulation scheduled.",
  },
  {
    title: "Surgical Count & WHO Checklist Verification",
    dept: "Operating Theatre & PACU",
    lead: "Marcus Vance, RN (Surgical Lead)",
    compliance: "100%",
    status: "Verified",
    capa: "Full compliance sustained for 180 consecutive days. CQI commendation issued.",
  },
  {
    title: "Inpatient Restraint Documentation Review",
    dept: "ICU & Neuro Ward",
    lead: "Elena Rostova (Compliance Specialist)",
    compliance: "89%",
    status: "Watch",
    capa: "Standardized 2-hour restraint reassessment template pushed to bedside chart.",
  },
];

const EBP = [
  { label: "Clinical Guidelines", value: 214, sub: "Active hospital library" },
  { label: "Hospital SOPs", value: 187, sub: "Nursing + clinical SOPs" },
  { label: "Policies", value: 96, sub: "Reviewed adherence 92%" },
  { label: "Clinical Pathways", value: 41, sub: "In active bedside use" },
  { label: "PICO Questions Open", value: 12, sub: "Under clinical review" },
  { label: "Journal Club Sessions", value: 8, sub: "Conducted this quarter" },
  { label: "Evidence Updates (30d)", value: 23, sub: "Pushed to departmental units" },
  { label: "Practice-Change Projects", value: 6, sub: "Active hospital pilots" },
];

const EBP_PILOTS = [
  {
    title: "Nurse-Driven Urinary Catheter Removal Protocol",
    ward: "Medical Ward 3 & 4",
    impact: "Target 25% CAUTI reduction",
    status: "Active Pilot",
    evidenceLevel: "Level I Evidence",
  },
  {
    title: "Updated Sepsis 2026 Resuscitation Guidelines",
    ward: "ED & ICU",
    impact: "Door-to-antibiotic <45 min",
    status: "Hospital-wide Rollout",
    evidenceLevel: "Level I Evidence",
  },
  {
    title: "Daily Chlorhexidine Bathing in Critical Care",
    ward: "ICU-A & ICU-B",
    impact: "CLABSI rate suppression",
    status: "Sustained Practice",
    evidenceLevel: "Level II Evidence",
  },
  {
    title: "Enhanced Recovery After Surgery (ERAS) Colorectal",
    ward: "Surgical Ward & OT",
    impact: "1.4 day LOS reduction",
    status: "Active Pilot",
    evidenceLevel: "Level I Evidence",
  },
];

const COMPETENCY = [
  { label: "Mandatory Training", value: 92, tone: "success" as const },
  { label: "Competency Validation", value: 88, tone: "success" as const },
  { label: "Certification Expiring 60d", value: 14, tone: "warning" as const, unit: "staff" },
  { label: "Clinical Skills Verified", value: 90, tone: "success" as const },
  { label: "Simulation Training", value: 76, tone: "warning" as const },
  { label: "New Staff Orientation", value: 95, tone: "success" as const },
  { label: "Annual Competency", value: 87, tone: "success" as const },
];

const SPECIALIZED_SKILLS = [
  { skill: "Advanced Vascular Access & Ultrasound-guided IV", validated: 91, target: 95 },
  { skill: "High-Alert Medication Administration & Independent Check", validated: 94, target: 100 },
  { skill: "Emergency Airway & Rapid Sequence Intubation Assist", validated: 89, target: 90 },
  { skill: "Chest Tube & Thoracostomy Nursing Care", validated: 86, target: 90 },
  { skill: "Continuous Renal Replacement Therapy (CRRT)", validated: 82, target: 85 },
];

const AI_ASSIST = [
  { label: "Departments requiring attention", items: ["Medical Ward — CAUTI trend", "ED — Stroke door-to-CT", "Dialysis — HAI cluster watch"] },
  { label: "High-risk bundle compliance", items: ["Stroke Bundle · 79%", "CAUTI · 81%", "Falls · 83%"] },
  { label: "Possible infection risks", items: ["Dialysis line-associated cluster (early signal)", "ICU-B CLABSI rate creeping upward"] },
  { label: "Documentation gaps", items: ["Pain reassessment on Medical-3", "Braden re-score for LOS >5d"] },
  { label: "Patient safety risks", items: ["Falls uptick on Medical evening shift", "High-alert med double-check variance"] },
  { label: "Suggested QI initiatives", items: ["Nurse-driven CAUTI removal protocol", "Stroke drill sim in ED", "Braden PDSA cycle"] },
  { label: "Suggested EBP implementation", items: ["Updated sepsis 2026 guideline rollout", "Chlorhexidine bathing in ICU-B"] },
  { label: "Suggested audits", items: ["Falls process audit — Medical-3", "Line-days audit — Dialysis"] },
  { label: "Suggested staff education", items: ["High-alert medication refresher", "Isolation don/doff simulation"] },
];

// -------------------- Helpers --------------------

const riskTone: Record<Risk, "success" | "info" | "warning" | "danger"> = {
  low: "success",
  moderate: "info",
  high: "warning",
  critical: "danger",
};

const TrendIcon = ({ t }: { t: Trend }) =>
  t === "up" ? (
    <TrendingUp className="h-3.5 w-3.5 text-success" />
  ) : t === "down" ? (
    <TrendingDown className="h-3.5 w-3.5 text-destructive" />
  ) : (
    <span className="h-0.5 w-3 rounded bg-muted-foreground/60" />
  );

function Bar({
  value,
  tone = "primary",
}: {
  value: number;
  tone?: "primary" | "success" | "warning" | "danger";
}) {
  const color =
    tone === "success"
      ? "bg-success"
      : tone === "warning"
      ? "bg-warning"
      : tone === "danger"
      ? "bg-destructive"
      : "bg-primary";
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
      <div className={`h-full ${color}`} style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  badge,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {badge}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-background/50 p-2 border border-border/40">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

// -------------------- Main Component --------------------

function ClinicalExcellencePage() {
  const search = Route.useSearch();
  const navigate = useNavigate();

  const [bundleFilter, setBundleFilter] = useState<"all" | Risk>("all");
  const [deptSearch, setDeptSearch] = useState("");

  const activeTab: ExcellenceHubTabId = (
    TABS.some((t) => t.id === search.tab) ? search.tab : "quality"
  ) as ExcellenceHubTabId;

  const handleTabChange = (tabId: ExcellenceHubTabId) => {
    navigate({
      to: "/clinical-excellence",
      search: { tab: tabId === "quality" ? undefined : tabId },
      replace: true,
    });
  };

  const bundles = useMemo(
    () => (bundleFilter === "all" ? BUNDLES : BUNDLES.filter((b) => b.risk === bundleFilter)),
    [bundleFilter]
  );

  const filteredDepts = useMemo(() => {
    const q = deptSearch.trim().toLowerCase();
    if (!q) return DEPT_CARDS;
    return DEPT_CARDS.filter((d) => d.name.toLowerCase().includes(q));
  }, [deptSearch]);

  const execScore = 89;
  const scoreParts = [
    { k: "Quality", v: 90 },
    { k: "Safety", v: 92 },
    { k: "Bundles", v: 88 },
    { k: "IPC", v: 91 },
    { k: "EBP", v: 84 },
    { k: "Competency", v: 87 },
    { k: "Documentation", v: 89 },
    { k: "Patient Safety", v: 90 },
  ];

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-4 sm:px-6 sm:py-6 flex flex-col gap-4">
      {/* 1. Workspace Sub-Navbar */}
      <ClinicalExcellenceNav activeTab="quality" />

      {/* 2. Header */}
      <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary sm:h-14 sm:w-14">
          <Award className="h-6 w-6 sm:h-7 sm:w-7" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Clinical Excellence Hub
            </h1>
            <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
              Enterprise
            </span>
          </div>
          <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">
            Evidence-Based Care · Infection Prevention · Patient Safety · Quality Improvement
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <StatusPill tone="info">Live Architecture</StatusPill>
        </div>
      </header>

      {/* 3. Horizontal Internal Tabs Navigation Bar */}
      <nav
        aria-label="Clinical Excellence Navigation"
        className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none border-b border-border/70"
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`inline-flex items-center gap-2 whitespace-nowrap px-3.5 py-1.5 text-[12.5px] font-medium rounded-lg transition-all cursor-pointer shrink-0 select-none ${
                isActive
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs ring-1 ring-primary/20"
                  : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground border border-transparent"
              }`}
            >
              <Icon
                className={`h-3.5 w-3.5 ${
                  isActive ? "text-primary-foreground" : "text-muted-foreground"
                }`}
              />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-mono font-medium ${
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground border border-border/60"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* 4. Tab Content Panels */}

      {/* ── TAB 1: Quality Dashboard ─────────────────────────────── */}
      {activeTab === "quality" && (
        <div className="flex flex-col gap-6 animate-in fade-in-50 duration-150">
          {/* Executive Clinical Score Banner */}
          <section className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-card to-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Executive Clinical Score
                </h2>
              </div>
              <StatusPill tone="info">AI Prototype</StatusPill>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
              <div className="rounded-xl border border-border bg-card p-5 text-center flex flex-col justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Overall Clinical Score
                  </div>
                  <div className="mt-1 text-5xl font-semibold text-foreground">{execScore}</div>
                  <div className="mt-1 flex items-center justify-center gap-1 text-xs text-success">
                    <ArrowUpRight className="h-3.5 w-3.5" /> +3 vs last quarter
                  </div>
                  <div className="mt-2 text-[11px] text-muted-foreground">
                    Hospital Target Benchmark: 84
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-left">
                  <div className="rounded-md bg-success/10 p-2 text-[11px]">
                    <div className="font-medium text-success">Top Performer</div>
                    <div className="text-foreground">Blood Bank · 97</div>
                  </div>
                  <div className="rounded-md bg-warning/15 p-2 text-[11px]">
                    <div className="font-medium text-warning-foreground">Needs Support</div>
                    <div className="text-foreground">OPD · 86</div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {scoreParts.map((p) => (
                  <div key={p.k} className="rounded-xl border border-border bg-card p-3">
                    <div className="text-[11px] text-muted-foreground">{p.k}</div>
                    <div className="mt-0.5 text-xl font-semibold text-foreground">{p.v}</div>
                    <div className="mt-2">
                      <Bar
                        value={p.v}
                        tone={p.v >= 90 ? "success" : p.v >= 80 ? "primary" : "warning"}
                      />
                    </div>
                  </div>
                ))}
                <div className="col-span-2 rounded-xl border border-primary/20 bg-primary/5 p-3 sm:col-span-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                    <Sparkles className="h-3.5 w-3.5" /> AI Summary · AI Prototype
                  </div>
                  <p className="mt-1 text-sm text-foreground leading-relaxed">
                    Overall clinical excellence is trending upward, led by Operating Theatre, Blood Bank, and
                    Pharmacy. Key focus areas this quarter: Stroke door-to-CT latency in Emergency, CAUTI in
                    Medical Ward, and fall signals on evening shifts. Recommend deploying nurse-driven CAUTI
                    removal protocol and an ED simulation drill.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* AI Clinical Excellence Assistant */}
          <section className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/5 via-card to-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  AI Clinical Excellence Assistant
                </h2>
              </div>
              <StatusPill tone="info">AI Prototype</StatusPill>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {AI_ASSIST.map((a) => (
                <div key={a.label} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Target className="h-3.5 w-3.5 text-primary" />
                    {a.label}
                  </div>
                  <ul className="mt-2 space-y-1.5">
                    {a.items.map((i) => (
                      <li key={i} className="flex items-start gap-2 text-[12px] text-foreground">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        <span>{i}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-border bg-card p-3 text-xs text-muted-foreground">
              <span className="mr-1 rounded bg-primary/15 px-1.5 py-0.5 font-semibold uppercase tracking-wider text-primary">
                AI Prototype
              </span>
              Insights above are model-generated recommendations for demonstration only. Clinical decisions remain with the care team.
            </div>
          </section>

          {/* Intelligence Pillars & Philosophy Footer */}
          <ExecutiveDecisionSupport module="excellence" />
          <AIIntelligenceLayer module="excellence" />

          <section className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground shadow-sm">
            <div className="flex items-center gap-2 text-foreground">
              <Star className="h-4 w-4 text-primary" />
              <span className="font-semibold">Clinical Excellence through Workforce Intelligence</span>
            </div>
            <p className="mt-1 leading-relaxed">
              The objective is not only compliance — it is to improve patient outcomes, reduce infections,
              strengthen evidence-based nursing practice, support accreditation readiness, and empower nursing
              leadership through continuous quality intelligence.
            </p>
          </section>
        </div>
      )}

      {/* ── TAB 2: Bundle Compliance ─────────────────────────────── */}
      {activeTab === "bundles" && (
        <div className="flex flex-col gap-5 animate-in fade-in-50 duration-150">
          <SectionHeader
            icon={ShieldCheck}
            title="Hospital Bundle Compliance"
            subtitle="Evidence-based care bundles across emergency, critical care, surgical and medical units"
            badge={<StatusPill tone="info">10 Bundles Tracked</StatusPill>}
          />

          {/* KPI Highlight Strip */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-border bg-card p-3.5">
              <div className="text-[11px] text-muted-foreground uppercase tracking-wider">Average Compliance</div>
              <div className="mt-1 text-2xl font-bold text-foreground">88.4%</div>
              <div className="mt-1 text-[11px] text-success flex items-center gap-1">
                <ArrowUpRight className="h-3.5 w-3.5" /> +2.1% this month
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-3.5">
              <div className="text-[11px] text-muted-foreground uppercase tracking-wider">Overdue Tasks</div>
              <div className="mt-1 text-2xl font-bold text-foreground">40</div>
              <div className="mt-1 text-[11px] text-warning flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> Across 7 wards
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-3.5">
              <div className="text-[11px] text-muted-foreground uppercase tracking-wider">Top Adherence</div>
              <div className="mt-1 text-2xl font-bold text-foreground">96%</div>
              <div className="mt-1 text-[11px] text-muted-foreground">Surgical Safety (OT)</div>
            </div>
            <div className="rounded-xl border border-border bg-card p-3.5">
              <div className="text-[11px] text-muted-foreground uppercase tracking-wider">Attention Area</div>
              <div className="mt-1 text-2xl font-bold text-destructive">79%</div>
              <div className="mt-1 text-[11px] text-destructive">Stroke Bundle (ED)</div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {(["all", "low", "moderate", "high", "critical"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setBundleFilter(f)}
                  type="button"
                  className={`rounded-full border px-3 py-1 text-xs capitalize transition cursor-pointer ${
                    bundleFilter === f
                      ? "border-primary bg-primary/10 text-primary font-semibold"
                      : "border-border text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {f === "all" ? "All bundles (10)" : `${f} risk (${BUNDLES.filter((b) => b.risk === f).length})`}
                </button>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              Showing {bundles.length} of {BUNDLES.length} bundles
            </span>
          </div>

          {/* Bundle Cards Grid */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {bundles.map((b) => (
              <div
                key={b.name}
                className="flex flex-col rounded-xl border border-border bg-card p-4 shadow-sm hover:border-primary/40 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-foreground">{b.name}</div>
                    <div className="text-[11px] text-muted-foreground">{b.dept}</div>
                  </div>
                  <StatusPill tone={riskTone[b.risk]}>{b.risk} risk</StatusPill>
                </div>
                <div className="mt-3 flex items-end justify-between">
                  <div className="text-2xl font-semibold text-foreground">{b.compliance}%</div>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <TrendIcon t={b.trend} />
                    <span className="capitalize">{b.trend}</span> trend
                  </div>
                </div>
                <div className="mt-1.5">
                  <Bar
                    value={b.compliance}
                    tone={b.compliance >= 90 ? "success" : b.compliance >= 80 ? "primary" : "warning"}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    {b.overdue} overdue checklist items
                  </span>
                </div>
                <div className="mt-3 rounded-md bg-primary/5 p-2.5 text-[11px] text-foreground border border-primary/15">
                  <div className="flex items-center gap-1 font-semibold text-primary mb-1">
                    <Sparkles className="h-3 w-3" />
                    <span>AI PROTOTYPE RECOMMENDATION</span>
                  </div>
                  {b.ai}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: Patient Safety & Quality ───────────────────────── */}
      {activeTab === "safety" && (
        <div className="flex flex-col gap-6 animate-in fade-in-50 duration-150">
          {/* Section 3A: NSQI */}
          <div>
            <SectionHeader
              icon={HeartPulse}
              title="Nursing Sensitive Quality Indicators (NSQI)"
              subtitle="Outcome-based clinical nursing metrics benchmarked against national clinical standards"
              badge={<StatusPill tone="info">10 Core Indicators</StatusPill>}
            />
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {NSQI.map((n) => (
                <div key={n.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                  <div className="text-[11px] text-muted-foreground min-h-[28px]">{n.label}</div>
                  <div className="mt-2 flex items-end justify-between">
                    <div className="text-2xl font-semibold text-foreground">{n.value}</div>
                    <span
                      className={`inline-flex items-center gap-0.5 text-[11px] font-medium ${
                        n.good ? "text-success" : "text-destructive"
                      }`}
                    >
                      {n.good ? (
                        <ArrowDownRight className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      )}
                      {n.delta}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3B: Department Quality Dashboard */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <SectionHeader
                icon={Building2}
                title="Department Quality Dashboard"
                subtitle="Compliance, patient safety, documentation quality, and infection risk across all 20 departments"
              />
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Filter departments..."
                  value={deptSearch}
                  onChange={(e) => setDeptSearch(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background/60 pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredDepts.map((d) => (
                <div
                  key={d.name}
                  className="rounded-xl border border-border bg-card p-4 shadow-sm hover:border-primary/40 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-foreground">{d.name}</div>
                    <StatusPill tone={riskTone[d.infection]}>{d.infection} risk</StatusPill>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                    <MetricCard label="Compliance" value={`${d.compliance}%`} />
                    <MetricCard label="Safety" value={`${d.safety}%`} />
                    <MetricCard label="Bundles" value={`${d.bundles}%`} />
                    <MetricCard label="Docs Quality" value={`${d.docs}%`} />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">{d.issues} open issues</span>
                    <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 font-semibold uppercase tracking-wider text-primary">
                      <Sparkles className="h-3 w-3" /> AI Prototype
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: Infection Prevention ──────────────────────────── */}
      {activeTab === "ipc" && (
        <div className="flex flex-col gap-6 animate-in fade-in-50 duration-150">
          <SectionHeader
            icon={Shield}
            title="Infection Prevention & Control (IPC)"
            subtitle="Hospital-wide infection surveillance, sterilization monitoring, hygiene compliance and active outbreaks"
            badge={<StatusPill tone="warning">2 Active Alerts</StatusPill>}
          />

          {/* Active IPC Surveillance Summary */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-warning/30 bg-warning/5 p-4">
              <div className="flex items-center gap-2 text-warning font-semibold text-xs uppercase tracking-wider">
                <AlertTriangle className="h-4 w-4" /> Active IPC Alert 1 · Dialysis Unit
              </div>
              <p className="mt-1.5 text-xs text-foreground leading-relaxed">
                Early cluster surveillance signal detected on Dialysis Unit (vascular line-associated).
                IPC nurse specialist assigned for environmental culture swabs and line re-insertion technique audit.
              </p>
            </div>
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
              <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
                <ShieldCheck className="h-4 w-4" /> Active IPC Alert 2 · ICU-B Central Lines
              </div>
              <p className="mt-1.5 text-xs text-foreground leading-relaxed">
                CLABSI rate in ICU-B elevated over 30-day baseline. Daily chlorhexidine gluconate (CHG) bathing protocol
                and line necessity rounds verified for all 12 beds.
              </p>
            </div>
          </div>

          {/* 12 Core IPC Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {IPC_METRICS.map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="text-[11px] font-medium leading-tight">{m.label}</span>
                  </div>
                  <div className="mt-2 text-xl font-semibold text-foreground">
                    {m.value}
                    {(m as any).unit ? "" : "%"} {(m as any).suffix ?? ""}
                    {(m as any).unit && (
                      <span className="ml-1 text-[11px] font-normal text-muted-foreground">
                        {(m as any).unit}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Surveillance & Environmental Panels */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <HandMetal className="h-4 w-4 text-primary" />
                  Hand Hygiene Observation Rates by Department
                </h3>
                <StatusPill tone="success">91% Target Met</StatusPill>
              </div>
              <div className="mt-3 space-y-2.5 text-xs">
                {[
                  { dept: "Operating Theatre & Recovery", val: 98 },
                  { dept: "Intensive Care Unit (ICU)", val: 94 },
                  { dept: "NICU & PICU", val: 93 },
                  { dept: "Emergency Department", val: 89 },
                  { dept: "General Medical Wards", val: 87 },
                ].map((row) => (
                  <div key={row.dept}>
                    <div className="flex justify-between text-muted-foreground mb-1">
                      <span>{row.dept}</span>
                      <span className="font-semibold text-foreground">{row.val}%</span>
                    </div>
                    <Bar value={row.val} tone={row.val >= 90 ? "success" : "warning"} />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Microscope className="h-4 w-4 text-primary" />
                  CSSD & Environmental Sterility Logs
                </h3>
                <StatusPill tone="info">All Autoclaves Validated</StatusPill>
              </div>
              <div className="mt-3 space-y-2 text-xs">
                <div className="rounded-lg bg-background/50 p-2.5 border border-border/50 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-foreground">Autoclave Biological Indicators (BIs)</div>
                    <div className="text-[11px] text-muted-foreground">Steam sterilization biological spores 24h incubation</div>
                  </div>
                  <span className="text-success font-semibold">100% Negative (Passed)</span>
                </div>
                <div className="rounded-lg bg-background/50 p-2.5 border border-border/50 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-foreground">Air Filtration & HEPA Positive Pressure</div>
                    <div className="text-[11px] text-muted-foreground">OT-1 through OT-6 differential pressure monitoring</div>
                  </div>
                  <span className="text-success font-semibold">Compliant (+25 Pa)</span>
                </div>
                <div className="rounded-lg bg-background/50 p-2.5 border border-border/50 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-foreground">Water Quality Testing (Dialysis Loop)</div>
                    <div className="text-[11px] text-muted-foreground">Endotoxin count & RO chemical purity weekly audit</div>
                  </div>
                  <span className="text-success font-semibold">0.02 EU/mL (Passed)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: Clinical Audits ────────────────────────────────── */}
      {activeTab === "audits" && (
        <div className="flex flex-col gap-6 animate-in fade-in-50 duration-150">
          <SectionHeader
            icon={ClipboardCheck}
            title="Clinical Audit Center"
            subtitle="Clinical audit registry, quality findings, corrective and preventive actions (CAPA), and regulatory reviews"
            badge={<StatusPill tone="success">128 Completed</StatusPill>}
          />

          {/* Audit Metrics */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {AUDIT.map((a) => (
              <div key={a.label} className="rounded-xl border border-border bg-card p-3.5 shadow-sm">
                <div className="text-[11px] text-muted-foreground">{a.label}</div>
                <div className="mt-1 text-2xl font-bold text-foreground">{a.value}</div>
                <div className="mt-2">
                  <StatusPill tone={a.tone}>
                    {a.tone === "danger" ? "action needed" : a.tone === "warning" ? "watch" : "on track"}
                  </StatusPill>
                </div>
              </div>
            ))}
          </div>

          {/* Top Performing Departments */}
          <div className="rounded-xl border border-success/30 bg-success/5 p-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-success" />
              <div>
                <div className="text-sm font-semibold text-foreground">
                  Top-Performing Departments in Clinical Audit Compliance
                </div>
                <div className="text-xs text-muted-foreground">
                  100% on-time audit closures sustained for two consecutive quarters
                </div>
              </div>
            </div>
            <div className="text-xs font-semibold text-success bg-success/15 px-3 py-1.5 rounded-lg border border-success/30">
              Operating Theatre · Blood Bank · Pharmacy · Laboratory
            </div>
          </div>

          {/* Audit Registry & Action Plans Table */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <ScrollText className="h-4 w-4 text-primary" />
                Active Clinical Audit Findings & Corrective Action Plans (CAPA)
              </h3>
              <span className="text-xs text-muted-foreground">{AUDIT_FINDINGS.length} Major Active Findings</span>
            </div>
            <div className="mt-3 space-y-3">
              {AUDIT_FINDINGS.map((item) => (
                <div
                  key={item.title}
                  className="rounded-lg border border-border/80 bg-background/50 p-3.5 flex flex-col gap-2"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold text-foreground">{item.title}</div>
                      <div className="text-xs text-muted-foreground">
                        Unit: {item.dept} · Lead Auditor: {item.lead}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground">
                        Adherence: {item.compliance}
                      </span>
                      <StatusPill
                        tone={
                          item.status === "Verified"
                            ? "success"
                            : item.status === "On Track"
                            ? "info"
                            : item.status === "Watch"
                            ? "warning"
                            : "danger"
                        }
                      >
                        {item.status}
                      </StatusPill>
                    </div>
                  </div>
                  <div className="rounded bg-primary/5 p-2 text-xs text-foreground border border-primary/10">
                    <span className="font-semibold text-primary mr-1">CAPA Resolution:</span>
                    {item.capa}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 6: Evidence-Based Practice ───────────────────────── */}
      {activeTab === "ebp" && (
        <div className="flex flex-col gap-6 animate-in fade-in-50 duration-150">
          <SectionHeader
            icon={BookOpen}
            title="Evidence-Based Practice (EBP)"
            subtitle="Hospital clinical guidelines, standard operating procedures, active PICO inquiries, and clinical practice change projects"
            badge={
              <Link
                to="/ebp"
                className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition cursor-pointer"
              >
                <span>Open Dedicated EBP Portal</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            }
          />

          {/* EBP Library Metric Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {EBP.map((e) => (
              <div key={e.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="text-[11px] text-muted-foreground">{e.label}</div>
                <div className="mt-1 text-2xl font-bold text-foreground">{e.value}</div>
                <div className="mt-1 text-[11px] text-muted-foreground">{e.sub}</div>
              </div>
            ))}
          </div>

          {/* Active EBP Practice-Change Pilots */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Active Nursing Practice-Change Initiatives & EBP Pilots
              </h3>
              <StatusPill tone="info">6 Active Projects</StatusPill>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              {EBP_PILOTS.map((pilot) => (
                <div
                  key={pilot.title}
                  className="rounded-lg border border-border bg-background/50 p-3.5 flex flex-col justify-between gap-2"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-sm font-semibold text-foreground">{pilot.title}</div>
                      <StatusPill tone="info">{pilot.status}</StatusPill>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">Target Ward: {pilot.ward}</div>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-border/60">
                    <span className="text-success font-medium flex items-center gap-1">
                      <Target className="h-3 w-3" /> {pilot.impact}
                    </span>
                    <span className="text-[11px] text-muted-foreground">{pilot.evidenceLevel}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 7: Clinical Competency ───────────────────────────── */}
      {activeTab === "competency" && (
        <div className="flex flex-col gap-6 animate-in fade-in-50 duration-150">
          <SectionHeader
            icon={GraduationCap}
            title="Clinical Competency & Nursing Skills Verification"
            subtitle="Mandatory training compliance, clinical skill verification, simulation education, and certification renewal"
            badge={<StatusPill tone="success">92% Mandatory Completed</StatusPill>}
          />

          {/* Competency Overview Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {COMPETENCY.map((c) => (
              <div key={c.label} className="rounded-xl border border-border bg-card p-3.5 shadow-sm">
                <div className="text-[11px] text-muted-foreground min-h-[28px]">{c.label}</div>
                <div className="mt-1 text-xl font-bold text-foreground">
                  {c.value}
                  {(c as any).unit ? "" : "%"}
                  {(c as any).unit && (
                    <span className="text-xs font-normal text-muted-foreground ml-1">{(c as any).unit}</span>
                  )}
                </div>
                <div className="mt-2">
                  <StatusPill tone={c.tone}>
                    {typeof c.value === "number" && !(c as any).unit ? (c.value >= 90 ? "target met" : "action") : "watch"}
                  </StatusPill>
                </div>
              </div>
            ))}
          </div>

          {/* Specialized Nursing Skills Verification Matrix */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-primary" />
                Specialized High-Risk Clinical Skills Verification Matrix
              </h3>
              <span className="text-xs text-muted-foreground">Annual Clinical Validation</span>
            </div>
            <div className="mt-3 space-y-3">
              {SPECIALIZED_SKILLS.map((skill) => (
                <div key={skill.skill} className="rounded-lg bg-background/50 p-3 border border-border/60">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-foreground">{skill.skill}</span>
                    <span className="text-muted-foreground">
                      Verified: <strong className="text-foreground">{skill.validated}%</strong> (Target: {skill.target}%)
                    </span>
                  </div>
                  <Bar value={skill.validated} tone={skill.validated >= skill.target ? "success" : "warning"} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
