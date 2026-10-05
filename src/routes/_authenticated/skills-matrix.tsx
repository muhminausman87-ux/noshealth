import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { EmployeeGrowthNav } from "@/components/EmployeeGrowthNav";
import {
  Layers,
  LayoutDashboard,
  Building2,
  Users,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Search,
  Filter,
  Clock,
  PlusCircle,
  FileText,
  Sparkles,
  ChevronRight,
  Zap,
} from "lucide-react";
import { DEPARTMENTS, Department } from "@/lib/departments";

/* ── Route Definition ─────────────────────────────────────────── */
export const Route = createFileRoute("/_authenticated/skills-matrix")({
  validateSearch: (search: Record<string, unknown>): { tab?: string } => ({
    tab: typeof search.tab === "string" ? search.tab : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Skills Matrix · Employee Growth · NOS" },
      {
        name: "description",
        content:
          "Transparent clinical skill availability, unit skill matrices, verified nurse skill profiles, and shift coverage impact.",
      },
    ],
  }),
  component: SkillsMatrixPage,
});

/* ── Secondary Tabs ───────────────────────────────────────────── */
type TabId = "overview" | "units" | "nurses" | "gaps" | "coverage";

interface TabDef {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const TABS: TabDef[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "units", label: "Unit Skills Matrix", icon: Building2 },
  { id: "nurses", label: "Nurse Skills Roster", icon: Users, badge: 10 },
  { id: "gaps", label: "Skill Deficits", icon: AlertTriangle, badge: 3 },
  { id: "coverage", label: "Coverage Impact", icon: ShieldCheck },
];

/* ── Types & Demo Dataset ─────────────────────────────────────── */
export interface ClinicalSkill {
  id: string;
  name: string;
  category: "Critical Care" | "Emergency" | "Vascular & Infusion" | "Perioperative" | "Specialized Care";
  criticalLevel: "Mandatory Core" | "Advanced Specialty" | "High-Risk Procedural";
}

export interface UnitSkillDistribution {
  unit: string;
  deptId: Department;
  totalNurses: number;
  crrtQualified: number;
  arterialLineQualified: number;
  triageQualified: number;
  chemoCertified: number;
  vacQualified: number;
  sedationQualified: number;
}

export interface NurseSkillProfile {
  id: string;
  name: string;
  role: string;
  department: string;
  deptId: Department;
  verifiedSkills: string[];
  inTrainingSkills: string[];
  lastVerificationDate: string;
}

export interface SkillGapItem {
  unit: string;
  skillName: string;
  requiredPerShift: number;
  currentlyRostered: number;
  gapDeficit: number;
  shiftImpact: "Day & Night" | "Night Shift Vulnerability" | "Weekend Surge";
  mitigationRecommendation: string;
}

export interface CoverageImpactScenario {
  unit: string;
  scenario: string;
  vulnerabilityLevel: "High" | "Moderate" | "Controlled";
  missingSkillThreshold: string;
  operationalRisk: string;
  safeProtocolAction: string;
}

const CORE_SKILLS: ClinicalSkill[] = [
  { id: "sk-1", name: "Continuous Renal Replacement (CRRT)", category: "Critical Care", criticalLevel: "High-Risk Procedural" },
  { id: "sk-2", name: "Arterial Line Management", category: "Critical Care", criticalLevel: "Mandatory Core" },
  { id: "sk-3", name: "Emergency Severity Index (ESI) Triage", category: "Emergency", criticalLevel: "Mandatory Core" },
  { id: "sk-4", name: "Intravenous Chemotherapy", category: "Vascular & Infusion", criticalLevel: "High-Risk Procedural" },
  { id: "sk-5", name: "Complex Wound VAC Management", category: "Specialized Care", criticalLevel: "Mandatory Core" },
  { id: "sk-6", name: "Procedural Sedation Monitoring", category: "Emergency", criticalLevel: "Advanced Specialty" },
];

const DEMO_UNIT_DISTRIBUTIONS: UnitSkillDistribution[] = [
  {
    unit: "Intensive Care Unit (ICU)",
    deptId: "icu",
    totalNurses: 48,
    crrtQualified: 18,
    arterialLineQualified: 42,
    triageQualified: 12,
    chemoCertified: 4,
    vacQualified: 36,
    sedationQualified: 28,
  },
  {
    unit: "Emergency Department (ED)",
    deptId: "ed",
    totalNurses: 62,
    crrtQualified: 6,
    arterialLineQualified: 24,
    triageQualified: 48,
    chemoCertified: 2,
    vacQualified: 20,
    sedationQualified: 44,
  },
  {
    unit: "Medical Ward",
    deptId: "medical",
    totalNurses: 54,
    crrtQualified: 0,
    arterialLineQualified: 8,
    triageQualified: 6,
    chemoCertified: 14,
    vacQualified: 44,
    sedationQualified: 4,
  },
  {
    unit: "Surgical Ward",
    deptId: "surgical",
    totalNurses: 50,
    crrtQualified: 2,
    arterialLineQualified: 12,
    triageQualified: 8,
    chemoCertified: 6,
    vacQualified: 48,
    sedationQualified: 16,
  },
  {
    unit: "Cardiac Care",
    deptId: "cardiac",
    totalNurses: 38,
    crrtQualified: 4,
    arterialLineQualified: 32,
    triageQualified: 10,
    chemoCertified: 0,
    vacQualified: 18,
    sedationQualified: 22,
  },
];

const DEMO_NURSE_SKILLS: NurseSkillProfile[] = [
  {
    id: "NS-101",
    name: "Elena Rostova",
    role: "Senior Staff Nurse (SN)",
    department: "Intensive Care Unit (ICU)",
    deptId: "icu",
    verifiedSkills: ["CRRT", "Arterial Lines", "Ventilator Weaning", "Procedural Sedation", "ACLS"],
    inTrainingSkills: ["ECMO Priming"],
    lastVerificationDate: "2026-08-15",
  },
  {
    id: "NS-102",
    name: "Marcus Vance",
    role: "Staff Nurse (RN)",
    department: "Medical Ward",
    deptId: "medical",
    verifiedSkills: ["Wound VAC", "Telemetry", "IV Cannulation", "Central Line Dressing"],
    inTrainingSkills: ["Chemotherapy Administration"],
    lastVerificationDate: "2026-05-20",
  },
  {
    id: "NS-103",
    name: "Amina Al-Mansoor",
    role: "Senior Staff Nurse (SN)",
    department: "Emergency Department (ED)",
    deptId: "ed",
    verifiedSkills: ["ESI Triage", "Trauma Resuscitation", "Procedural Sedation", "PALS", "ACLS"],
    inTrainingSkills: ["Rapid Ultrasound Guidance"],
    lastVerificationDate: "2026-07-02",
  },
  {
    id: "NS-104",
    name: "Carlos Reyes",
    role: "Staff Nurse (RN)",
    department: "Surgical Ward",
    deptId: "surgical",
    verifiedSkills: ["Wound VAC", "Epidural / PCA", "Surgical Drain Removal", "BLS"],
    inTrainingSkills: ["Arterial Lines"],
    lastVerificationDate: "2026-03-22",
  },
  {
    id: "NS-105",
    name: "Kofi Mensah",
    role: "Senior Staff Nurse (SN)",
    department: "Intensive Care Unit (ICU)",
    deptId: "icu",
    verifiedSkills: ["CRRT", "Arterial Lines", "Hemodialysis", "Ventilator Weaning", "ACLS"],
    inTrainingSkills: [],
    lastVerificationDate: "2026-09-01",
  },
];

const DEMO_SKILL_GAPS: SkillGapItem[] = [
  {
    unit: "Intensive Care Unit (ICU)",
    skillName: "Continuous Renal Replacement (CRRT)",
    requiredPerShift: 3,
    currentlyRostered: 2,
    gapDeficit: 1,
    shiftImpact: "Night Shift Vulnerability",
    mitigationRecommendation: "Deploy Float Pool CRRT certified nurse (Kofi Mensah) for tonight's shift.",
  },
  {
    unit: "Emergency Department (ED)",
    skillName: "Procedural Sedation Monitoring",
    requiredPerShift: 4,
    currentlyRostered: 3,
    gapDeficit: 1,
    shiftImpact: "Weekend Surge",
    mitigationRecommendation: "Assign senior triage nurse with sedation credential to resuscitation bay.",
  },
  {
    unit: "Medical Ward",
    skillName: "Chemotherapy Vesicant Administration",
    requiredPerShift: 2,
    currentlyRostered: 1,
    gapDeficit: 1,
    shiftImpact: "Day & Night",
    mitigationRecommendation: "Cross-cover with oncology clinical nurse specialist for planned infusions.",
  },
];

const DEMO_COVERAGE_SCENARIOS: CoverageImpactScenario[] = [
  {
    unit: "Intensive Care Unit (ICU)",
    scenario: "Unplanned sick call of senior CRRT nurse during night shift",
    vulnerabilityLevel: "High",
    missingSkillThreshold: "Minimum 2 CRRT nurses required for simultaneous dialyzer alarms",
    operationalRisk: "Delayed fluid removal in acute oliguric renal failure patient",
    safeProtocolAction: "Pre-designated float pool redeployment or charge nurse bedside step-in",
  },
  {
    unit: "Emergency Department (ED)",
    scenario: "Simultaneous arrival of 2 poly-trauma cases requiring conscious sedation",
    vulnerabilityLevel: "Moderate",
    missingSkillThreshold: "1:1 continuous capnography observation nurse per sedation case",
    operationalRisk: "Diversion of triage nurse causing triage queue bottleneck",
    safeProtocolAction: "Escalate to on-duty anesthesia resident and activate trauma float reserve",
  },
  {
    unit: "Medical-Surgical Floor",
    scenario: "Weekend surge of post-op surgical VAC therapy admissions",
    vulnerabilityLevel: "Controlled",
    missingSkillThreshold: "Wound VAC canister seal troubleshooting",
    operationalRisk: "Sub-optimal negative pressure wound healing",
    safeProtocolAction: "Wound care clinical nurse specialist on-call phone consultation protocol",
  },
];

/* ── Main Component ───────────────────────────────────────────── */
export default function SkillsMatrixPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();

  const activeTab: TabId = (
    TABS.some((t) => t.id === search.tab) ? search.tab : "overview"
  ) as TabId;

  const setActiveTab = (tab: TabId) => {
    navigate({
      to: "/skills-matrix",
      search: { tab },
    });
  };

  const [unitDistributions] = useState<UnitSkillDistribution[]>(DEMO_UNIT_DISTRIBUTIONS);
  const [nurseSkills] = useState<NurseSkillProfile[]>(DEMO_NURSE_SKILLS);
  const [skillGaps] = useState<SkillGapItem[]>(DEMO_SKILL_GAPS);
  const [coverageScenarios] = useState<CoverageImpactScenario[]>(DEMO_COVERAGE_SCENARIOS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 font-sans bg-[#F8FAFC] text-slate-900">
      {/* ── Level 2: Primary Employee Growth Navigation ────────── */}
      <div className="w-full min-w-0 px-4 sm:px-6 pt-3 pb-1 bg-white border-b border-slate-200 shrink-0">
        <EmployeeGrowthNav activeTab="matrix" />
      </div>

      {/* ── Module Header & Level 3: Secondary Tabs ───────────── */}
      <header className="px-5 pt-4 pb-3 bg-white border-b border-slate-200/80 shrink-0 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.14em] text-blue-600">
              <Layers className="h-3.5 w-3.5" />
              <span>Employee Growth · Transparent Skill Matrices</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-0.5">
              Skills Matrix & Clinical Coverage
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Unit-level skill distribution, verified nurse proficiencies, roster deficit analysis, and coverage impact.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-md border border-blue-200 bg-blue-50 text-blue-700">
              Verified Clinical Skills
            </span>
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-md border border-slate-200 bg-slate-100 text-slate-600">
              Demo Dataset
            </span>
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-md border border-slate-200 bg-slate-50 text-slate-600">
              No Predictive AI Scoring
            </span>
          </div>
        </div>

        {/* Level 3 Secondary Horizontal Tab Bar */}
        <nav
          className="flex gap-1 overflow-x-auto pt-2 scrollbar-none"
          aria-label="Skills Matrix Secondary Tabs"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                type="button"
                className={`flex items-center gap-1.5 px-3 py-2 text-[12.5px] font-medium rounded-md cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? "font-semibold text-blue-700 bg-blue-50 border border-blue-200/70 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-blue-600" : "text-slate-500"}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`ml-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      tab.id === "gaps"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-slate-200/70 text-slate-700"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="mx-5 mt-3 p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold px-2 py-0.5"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── Content Viewport ─────────────────────────────────── */}
      <main className="flex-1 min-h-0 p-5 overflow-y-auto">
        {activeTab === "overview" && (
          <OverviewPanel
            unitDistributions={unitDistributions}
            skillGaps={skillGaps}
            coverageScenarios={coverageScenarios}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === "units" && <UnitSkillsPanel unitDistributions={unitDistributions} />}

        {activeTab === "nurses" && <NurseSkillsPanel nurseSkills={nurseSkills} />}

        {activeTab === "gaps" && (
          <SkillGapsPanel
            gaps={skillGaps}
            onResolve={(unit, skill) =>
              showToast(`Resolution workflow initiated for ${unit} (${skill}).`)
            }
          />
        )}

        {activeTab === "coverage" && <CoverageImpactPanel scenarios={coverageScenarios} />}
      </main>
    </div>
  );
}

/* ── Panel 1: Overview ────────────────────────────────────────── */
function OverviewPanel({
  unitDistributions,
  skillGaps,
  coverageScenarios,
  onNavigateTab,
}: {
  unitDistributions: UnitSkillDistribution[];
  skillGaps: SkillGapItem[];
  coverageScenarios: CoverageImpactScenario[];
  onNavigateTab: (tab: TabId) => void;
}) {
  const totalNursesTracked = unitDistributions.reduce((acc, u) => acc + u.totalNurses, 0);

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Tracked Workforce</span>
            <Users className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalNursesTracked} Nurses</div>
          <p className="text-[11px] text-blue-700 mt-1 font-medium">Across 5 acute hospital units</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Critical Skills</span>
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">6 Core Procedures</div>
          <p className="text-[11px] text-emerald-600 mt-1 font-medium">100% verified documentation</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Shift Deficits</span>
            <AlertTriangle className="h-4 w-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-700">{skillGaps.length} Identified</div>
          <p className="text-[11px] text-rose-600 mt-1 font-medium">Night shift CRRT & Sedation</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Coverage Protocols</span>
            <Zap className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{coverageScenarios.length} Active</div>
          <p className="text-[11px] text-slate-500 mt-1">Rule-based safety fallbacks</p>
        </div>
      </div>

      {/* Two-Column Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Unit Matrix Preview */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Unit Critical Skill Availability</h2>
              <p className="text-xs text-slate-500">Number of verified qualified nurses per department</p>
            </div>
            <button
              onClick={() => onNavigateTab("units")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>View full matrix</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {unitDistributions.slice(0, 4).map((u) => (
              <div
                key={u.unit}
                className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/70 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{u.unit}</span>
                  <span className="text-[11px] text-slate-500 font-medium">{u.totalNurses} Total Staff</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600 pt-1">
                  <div className="bg-white p-1.5 rounded border border-slate-100">
                    <span className="text-slate-400 block text-[9.5px]">Arterial Lines</span>
                    <span className="font-bold text-slate-800">{u.arterialLineQualified}</span>
                  </div>
                  <div className="bg-white p-1.5 rounded border border-slate-100">
                    <span className="text-slate-400 block text-[9.5px]">CRRT Dialysis</span>
                    <span className="font-bold text-slate-800">{u.crrtQualified}</span>
                  </div>
                  <div className="bg-white p-1.5 rounded border border-slate-100">
                    <span className="text-slate-400 block text-[9.5px]">Wound VAC</span>
                    <span className="font-bold text-slate-800">{u.vacQualified}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Urgent Deficit Actions */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Immediate Skill Deficit Action Plan</h2>
              <p className="text-xs text-slate-500">Transparent roster shortfall mitigation</p>
            </div>
            <button
              onClick={() => onNavigateTab("gaps")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>View deficits</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {skillGaps.map((gap) => (
              <div
                key={gap.skillName}
                className="p-3.5 rounded-lg border border-rose-100 bg-rose-50/50 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{gap.unit}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                    Deficit: -{gap.gapDeficit}
                  </span>
                </div>
                <p className="text-xs font-semibold text-rose-900">{gap.skillName}</p>
                <p className="text-[11px] text-slate-600">{gap.mitigationRecommendation}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Panel 2: Unit Skills Matrix ──────────────────────────────── */
function UnitSkillsPanel({ unitDistributions }: { unitDistributions: UnitSkillDistribution[] }) {
  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <h2 className="text-sm font-bold text-slate-900">Hospital-Wide Departmental Skill Matrix</h2>
        <p className="text-xs text-slate-500">
          Transparent count of verified nurse proficiencies across critical procedure domains.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200/80">
              <tr>
                <th className="py-3.5 px-4">Hospital Unit</th>
                <th className="py-3.5 px-4">Total Staff</th>
                <th className="py-3.5 px-4">CRRT Dialysis</th>
                <th className="py-3.5 px-4">Arterial Lines</th>
                <th className="py-3.5 px-4">ESI Triage</th>
                <th className="py-3.5 px-4">Chemotherapy</th>
                <th className="py-3.5 px-4">Wound VAC</th>
                <th className="py-3.5 px-4">Sedation Monitor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {unitDistributions.map((u) => (
                <tr key={u.unit} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{u.unit}</td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">{u.totalNurses}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                        u.crrtQualified > 0 ? "bg-blue-50 text-blue-700" : "text-slate-300"
                      }`}
                    >
                      {u.crrtQualified}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{u.arterialLineQualified}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{u.triageQualified}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{u.chemoCertified}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{u.vacQualified}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{u.sedationQualified}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Panel 3: Nurse Skills Roster ─────────────────────────────── */
function NurseSkillsPanel({ nurseSkills }: { nurseSkills: NurseSkillProfile[] }) {
  const [search, setSearch] = useState("");

  const filteredNurses = useMemo(() => {
    return nurseSkills.filter(
      (n) =>
        n.name.toLowerCase().includes(search.toLowerCase()) ||
        n.department.toLowerCase().includes(search.toLowerCase()) ||
        n.verifiedSkills.some((s) => s.toLowerCase().includes(search.toLowerCase()))
    );
  }, [nurseSkills, search]);

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2 flex-1 min-w-0 w-full sm:min-w-[240px]">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search nurse, department, or clinical skill badge..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs text-slate-800 placeholder-slate-400 bg-transparent border-none outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNurses.map((n) => (
          <div
            key={n.id}
            className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{n.name}</h3>
                <p className="text-xs text-slate-500">
                  {n.role} · <span className="text-blue-700 font-medium">{n.department}</span>
                </p>
              </div>
              <span className="text-[10.5px] text-slate-400">Verified: {n.lastVerificationDate}</span>
            </div>

            {/* Verified Skill Badges */}
            <div className="space-y-1.5">
              <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                Verified Clinical Skills ({n.verifiedSkills.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {n.verifiedSkills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200"
                  >
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* In Training */}
            {n.inTrainingSkills.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                  In Progress / Simulation Phase
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {n.inTrainingSkills.map((s) => (
                    <span
                      key={s}
                      className="text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Panel 4: Skill Deficits ──────────────────────────────────── */
function SkillGapsPanel({
  gaps,
  onResolve,
}: {
  gaps: SkillGapItem[];
  onResolve: (unit: string, skill: string) => void;
}) {
  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <h2 className="text-sm font-bold text-slate-900">Identified Clinical Skill Deficits</h2>
        <p className="text-xs text-slate-500">
          Transparent comparison of rostered nurse proficiencies versus minimum shift safety thresholds.
        </p>
      </div>

      <div className="space-y-3">
        {gaps.map((g) => (
          <div
            key={g.skillName}
            className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-4"
          >
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">{g.unit}</span>
                <span className="text-slate-400">·</span>
                <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  Impact: {g.shiftImpact}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-800">{g.skillName}</h3>
              <p className="text-xs text-slate-600">
                Required per shift: <span className="font-bold text-slate-800">{g.requiredPerShift}</span> · Currently Rostered: <span className="font-bold text-rose-700">{g.currentlyRostered}</span> (Shortfall: -{g.gapDeficit})
              </p>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600">
                <span className="font-semibold text-slate-700">Mitigation: </span>
                {g.mitigationRecommendation}
              </div>
            </div>

            <button
              onClick={() => onResolve(g.unit, g.skillName)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer transition-colors"
            >
              Deploy Float Resource
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Panel 5: Coverage Impact ─────────────────────────────────── */
function CoverageImpactPanel({ scenarios }: { scenarios: CoverageImpactScenario[] }) {
  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <h2 className="text-sm font-bold text-slate-900">Operational & Clinical Safety Impact Scenarios</h2>
        <p className="text-xs text-slate-500">
          Rule-based clinical contingency protocols when specialized skills are constrained.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarios.map((sc, idx) => (
          <div
            key={idx}
            className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{sc.unit}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    sc.vulnerabilityLevel === "High"
                      ? "bg-rose-100 text-rose-800 border border-rose-200"
                      : "bg-amber-100 text-amber-800 border border-amber-200"
                  }`}
                >
                  {sc.vulnerabilityLevel} Impact
                </span>
              </div>

              <h3 className="text-xs font-bold text-slate-800">{sc.scenario}</h3>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-[11.5px] text-slate-600 space-y-1">
                <div>
                  <span className="font-semibold text-slate-700">Safety Rule: </span>
                  {sc.missingSkillThreshold}
                </div>
                <div>
                  <span className="font-semibold text-rose-700">Operational Risk: </span>
                  {sc.operationalRisk}
                </div>
              </div>
            </div>

            <div className="p-2.5 bg-blue-50/70 rounded-lg border border-blue-100 text-[11px] text-blue-900 font-medium">
              <span className="font-bold">Protocol Action: </span>
              {sc.safeProtocolAction}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
