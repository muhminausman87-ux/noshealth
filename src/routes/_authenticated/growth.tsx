import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { EmployeeGrowthNav } from "@/components/EmployeeGrowthNav";
import {
  BadgeCheck,
  LayoutDashboard,
  UserCheck,
  ClipboardList,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Building2,
  ChevronRight,
  ShieldCheck,
  FileCheck,
  PlusCircle,
  FileText,
  Sparkles,
  ArrowUpRight,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { DEPARTMENTS, Department } from "@/lib/departments";

/* ── Route Definition ─────────────────────────────────────────── */
export const Route = createFileRoute("/_authenticated/growth")({
  validateSearch: (search: Record<string, unknown>): { tab?: string } => ({
    tab: typeof search.tab === "string" ? search.tab : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Competency Management · Employee Growth · NOS" },
      {
        name: "description",
        content:
          "Workforce competency tracking, objective clinical skill evaluations, unit-level competency coverage, and renewal compliance.",
      },
    ],
  }),
  component: CompetencyManagementPage,
});

/* ── Secondary Tabs ───────────────────────────────────────────── */
type TabId = "overview" | "profile" | "assessments" | "gaps" | "expiry";

interface TabDef {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const TABS: TabDef[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "profile", label: "Competency Profile", icon: UserCheck, badge: 14 },
  { id: "assessments", label: "Assessments", icon: ClipboardList, badge: 5 },
  { id: "gaps", label: "Competency Gaps", icon: AlertTriangle, badge: 3 },
  { id: "expiry", label: "Expiry & Renewal", icon: Clock, badge: 4 },
];

/* ── Types & Demo Dataset ─────────────────────────────────────── */
export type CompetencyLevel = "Novice" | "Advanced Beginner" | "Competent" | "Proficient" | "Expert";
export type CompetencyCategory = "Clinical Critical Care" | "General Nursing" | "Emergency & Trauma" | "Medication & Infusion" | "Operational & Leadership";

export interface NurseCompetency {
  id: string;
  competencyName: string;
  category: CompetencyCategory;
  level: CompetencyLevel;
  lastAssessedDate: string;
  nextReviewDate: string;
  assessor: string;
  status: "Active" | "Renewal Due" | "Action Plan Required" | "Expired";
  clinicalEvidence: string;
}

export interface NurseProfile {
  id: string;
  name: string;
  role: string;
  department: string;
  deptId: Department;
  experienceYears: number;
  overallCompliance: number; // percentage
  competencies: NurseCompetency[];
}

export interface AssessmentRecord {
  id: string;
  nurseId: string;
  nurseName: string;
  department: string;
  competencyName: string;
  category: CompetencyCategory;
  scheduledDate: string;
  assessor: string;
  status: "Scheduled" | "In Review" | "Signed Off" | "Action Plan";
  targetLevel: CompetencyLevel;
  notes: string;
}

export interface UnitCompetencyGap {
  unit: string;
  deptId: Department;
  competency: string;
  requiredRosterCount: number;
  currentAvailableCount: number;
  coverageRatio: number;
  urgency: "High" | "Moderate" | "Low";
  recommendedAction: string;
}

const DEMO_NURSE_PROFILES: NurseProfile[] = [
  {
    id: "NUR-101",
    name: "Elena Rostova",
    role: "Senior Staff Nurse (SN)",
    department: "Intensive Care Unit (ICU)",
    deptId: "icu",
    experienceYears: 7,
    overallCompliance: 96,
    competencies: [
      {
        id: "c-1",
        competencyName: "Continuous Renal Replacement Therapy (CRRT)",
        category: "Clinical Critical Care",
        level: "Expert",
        lastAssessedDate: "2026-08-15",
        nextReviewDate: "2027-08-15",
        assessor: "Dr. L. Thorne (ICU Intensivist)",
        status: "Active",
        clinicalEvidence: "120+ CRRT operational hours without adverse circuit clotting; Lead Preceptor.",
      },
      {
        id: "c-2",
        competencyName: "Mechanical Ventilation & Weaning Protocols",
        category: "Clinical Critical Care",
        level: "Proficient",
        lastAssessedDate: "2026-06-10",
        nextReviewDate: "2027-06-10",
        assessor: "Charge Nurse G. Henderson",
        status: "Active",
        clinicalEvidence: "Supervised 18 complex spontaneous breathing trials in ARDS patients.",
      },
      {
        id: "c-3",
        competencyName: "Arterial Line Insertion & Transducer Management",
        category: "Clinical Critical Care",
        level: "Proficient",
        lastAssessedDate: "2025-11-20",
        nextReviewDate: "2026-11-20",
        assessor: "Nurse Educator P. Vance",
        status: "Renewal Due",
        clinicalEvidence: "Zero line infection rate; annual practical observation scheduled.",
      },
      {
        id: "c-4",
        competencyName: "Advanced Cardiac Life Support (ACLS)",
        category: "Emergency & Trauma",
        level: "Expert",
        lastAssessedDate: "2026-01-14",
        nextReviewDate: "2028-01-14",
        assessor: "AHA Certified Board",
        status: "Active",
        clinicalEvidence: "Lead resuscitator in 8 code blue events with full protocol adherence.",
      },
    ],
  },
  {
    id: "NUR-102",
    name: "Marcus Vance",
    role: "Staff Nurse (RN)",
    department: "Medical Ward",
    deptId: "medical",
    experienceYears: 4,
    overallCompliance: 88,
    competencies: [
      {
        id: "c-5",
        competencyName: "Complex Wound Vacuum-Assisted Closure (VAC)",
        category: "General Nursing",
        level: "Competent",
        lastAssessedDate: "2026-04-12",
        nextReviewDate: "2027-04-12",
        assessor: "Wound Care Specialist T. Hall",
        status: "Active",
        clinicalEvidence: "Managed 14 diabetic foot ulcer VAC systems safely.",
      },
      {
        id: "c-6",
        competencyName: "Central Venous Catheter (CVC) Dressing & Blood Draws",
        category: "Medication & Infusion",
        level: "Competent",
        lastAssessedDate: "2025-10-30",
        nextReviewDate: "2026-10-30",
        assessor: "Charge Nurse L. Moreau",
        status: "Renewal Due",
        clinicalEvidence: "Aseptic technique verified under direct observation.",
      },
      {
        id: "c-7",
        competencyName: "Intravenous Chemotherapy Administration",
        category: "Medication & Infusion",
        level: "Advanced Beginner",
        lastAssessedDate: "2026-02-18",
        nextReviewDate: "2026-11-18",
        assessor: "Oncology Lead C. Alvarez",
        status: "Action Plan Required",
        clinicalEvidence: "Requires co-signature for cytotoxic vesicant infusions.",
      },
    ],
  },
  {
    id: "NUR-103",
    name: "Amina Al-Mansoor",
    role: "Senior Staff Nurse (SN)",
    department: "Emergency Department (ED)",
    deptId: "ed",
    experienceYears: 6,
    overallCompliance: 94,
    competencies: [
      {
        id: "c-8",
        competencyName: "Emergency Severity Index (ESI) Triage",
        category: "Emergency & Trauma",
        level: "Expert",
        lastAssessedDate: "2026-07-02",
        nextReviewDate: "2027-07-02",
        assessor: "Triage Lead Dr. R. Patel",
        status: "Active",
        clinicalEvidence: "Over 850 primary triage assessments with 99.2% concordance.",
      },
      {
        id: "c-9",
        competencyName: "Major Trauma Resuscitation Protocol",
        category: "Emergency & Trauma",
        level: "Proficient",
        lastAssessedDate: "2026-05-19",
        nextReviewDate: "2027-05-19",
        assessor: "Trauma Coordinator M. Blake",
        status: "Active",
        clinicalEvidence: "Primary bedside nurse in 24 poly-trauma admissions.",
      },
      {
        id: "c-10",
        competencyName: "Pediatric Advanced Life Support (PALS)",
        category: "Emergency & Trauma",
        level: "Proficient",
        lastAssessedDate: "2024-10-15",
        nextReviewDate: "2026-10-15",
        assessor: "Resuscitation Council",
        status: "Renewal Due",
        clinicalEvidence: "Scheduled for practical re-evaluation session next week.",
      },
    ],
  },
  {
    id: "NUR-104",
    name: "Carlos Reyes",
    role: "Staff Nurse (RN)",
    department: "Surgical Ward",
    deptId: "surgical",
    experienceYears: 3,
    overallCompliance: 91,
    competencies: [
      {
        id: "c-11",
        competencyName: "Epidural & Patient-Controlled Analgesia (PCA)",
        category: "Medication & Infusion",
        level: "Competent",
        lastAssessedDate: "2026-03-22",
        nextReviewDate: "2027-03-22",
        assessor: "Pain Management Nurse Lead",
        status: "Active",
        clinicalEvidence: "25 successful patient post-op pain management setups.",
      },
      {
        id: "c-12",
        competencyName: "Surgical Drain Removal & Care",
        category: "General Nursing",
        level: "Proficient",
        lastAssessedDate: "2026-01-10",
        nextReviewDate: "2027-01-10",
        assessor: "Charge Nurse V. Larson",
        status: "Active",
        clinicalEvidence: "Zero complication wound drain removals documented.",
      },
    ],
  },
];

const INITIAL_ASSESSMENTS: AssessmentRecord[] = [
  {
    id: "ASM-301",
    nurseId: "NUR-101",
    nurseName: "Elena Rostova",
    department: "Intensive Care Unit (ICU)",
    competencyName: "Arterial Line Insertion & Transducer Management",
    category: "Clinical Critical Care",
    scheduledDate: "2026-10-12",
    assessor: "Nurse Educator P. Vance",
    status: "Scheduled",
    targetLevel: "Proficient",
    notes: "Annual direct observation audit and aseptic transducer zeroing check.",
  },
  {
    id: "ASM-302",
    nurseId: "NUR-102",
    nurseName: "Marcus Vance",
    department: "Medical Ward",
    competencyName: "Central Venous Catheter (CVC) Dressing & Blood Draws",
    category: "Medication & Infusion",
    scheduledDate: "2026-10-18",
    assessor: "Charge Nurse L. Moreau",
    status: "Scheduled",
    targetLevel: "Competent",
    notes: "Review dressing protocol and chlorhexidine prep adherence.",
  },
  {
    id: "ASM-303",
    nurseId: "NUR-103",
    nurseName: "Amina Al-Mansoor",
    department: "Emergency Department (ED)",
    competencyName: "Pediatric Advanced Life Support (PALS)",
    category: "Emergency & Trauma",
    scheduledDate: "2026-10-09",
    assessor: "Resuscitation Council Assessor",
    status: "In Review",
    targetLevel: "Proficient",
    notes: "Simulation lab completed; awaiting practical megacode sign-off.",
  },
  {
    id: "ASM-304",
    nurseId: "NUR-102",
    nurseName: "Marcus Vance",
    department: "Medical Ward",
    competencyName: "Intravenous Chemotherapy Administration",
    category: "Medication & Infusion",
    scheduledDate: "2026-10-25",
    assessor: "Oncology Lead C. Alvarez",
    status: "Action Plan",
    targetLevel: "Competent",
    notes: "3 mentored infusion runs remaining under oncology preceptorship.",
  },
  {
    id: "ASM-305",
    nurseId: "NUR-104",
    nurseName: "Carlos Reyes",
    department: "Surgical Ward",
    competencyName: "Blood Transfusion & Reaction Management",
    category: "Medication & Infusion",
    scheduledDate: "2026-09-28",
    assessor: "Charge Nurse V. Larson",
    status: "Signed Off",
    targetLevel: "Competent",
    notes: "Full two-nurse verification workflow verified with zero errors.",
  },
];

const UNIT_GAPS: UnitCompetencyGap[] = [
  {
    unit: "Intensive Care Unit (ICU)",
    deptId: "icu",
    competency: "Continuous Renal Replacement Therapy (CRRT)",
    requiredRosterCount: 12,
    currentAvailableCount: 8,
    coverageRatio: 0.67,
    urgency: "High",
    recommendedAction: "Prioritize 4 bedside nurses for upcoming CRRT simulation cohort.",
  },
  {
    unit: "Emergency Department (ED)",
    deptId: "ed",
    competency: "Procedural Sedation Monitoring",
    requiredRosterCount: 16,
    currentAvailableCount: 12,
    coverageRatio: 0.75,
    urgency: "Moderate",
    recommendedAction: "Schedule evening shift RNs for airway management skill sign-off.",
  },
  {
    unit: "Medical Ward",
    deptId: "medical",
    competency: "PICC Line Care & Dressing",
    requiredRosterCount: 10,
    currentAvailableCount: 7,
    coverageRatio: 0.70,
    urgency: "Moderate",
    recommendedAction: "Host ward-based practical workshop with Vascular Access Team.",
  },
  {
    unit: "Surgical Ward",
    deptId: "surgical",
    competency: "Chest Tube Drainage & Emergency Clamping",
    requiredRosterCount: 14,
    currentAvailableCount: 13,
    coverageRatio: 0.93,
    urgency: "Low",
    recommendedAction: "On track; 1 new graduate in supervised orientation.",
  },
];

/* ── Main Component ───────────────────────────────────────────── */
export default function CompetencyManagementPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();

  const activeTab: TabId = (
    TABS.some((t) => t.id === search.tab) ? search.tab : "overview"
  ) as TabId;

  const setActiveTab = (tab: TabId) => {
    navigate({
      to: "/growth",
      search: { tab },
    });
  };

  const [assessments, setAssessments] = useState<AssessmentRecord[]>(INITIAL_ASSESSMENTS);
  const [nurseSearch, setNurseSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleSignOffAssessment = (id: string) => {
    setAssessments((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: "Signed Off" as const } : a
      )
    );
    showToast(`Assessment ${id} verified and signed off successfully.`);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 font-sans bg-[#F8FAFC] text-slate-900">
      {/* ── Level 2: Primary Employee Growth Navigation ────────── */}
      <div className="w-full min-w-0 px-4 sm:px-6 pt-3 pb-1 bg-white border-b border-slate-200 shrink-0">
        <EmployeeGrowthNav activeTab="competency" />
      </div>

      {/* ── Module Header & Level 3: Secondary Tabs ───────────── */}
      <header className="px-5 pt-4 pb-3 bg-white border-b border-slate-200/80 shrink-0 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.14em] text-blue-600">
              <BadgeCheck className="h-3.5 w-3.5" />
              <span>Employee Growth · Clinical Competency</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-0.5">
              Competency Management
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Objective skill evaluations, verified clinical proficiencies, unit-level coverage gaps, and credential renewals.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-md border border-blue-200 bg-blue-50 text-blue-700">
              Benner Clinical Ladder Model
            </span>
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-md border border-slate-200 bg-slate-100 text-slate-600">
              Demo Dataset
            </span>
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-md border border-slate-200 bg-slate-50 text-slate-600">
              Human-Governed Sign-Off
            </span>
          </div>
        </div>

        {/* Level 3 Secondary Horizontal Tab Bar */}
        <nav
          className="flex gap-1 overflow-x-auto pt-2 scrollbar-none"
          aria-label="Competency Management Secondary Tabs"
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
                        : tab.id === "expiry"
                        ? "bg-amber-100 text-amber-700"
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
            profiles={DEMO_NURSE_PROFILES}
            assessments={assessments}
            gaps={UNIT_GAPS}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === "profile" && (
          <CompetencyProfilePanel
            profiles={DEMO_NURSE_PROFILES}
            search={nurseSearch}
            setSearch={setNurseSearch}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
          />
        )}

        {activeTab === "assessments" && (
          <AssessmentsPanel
            assessments={assessments}
            onSignOff={handleSignOffAssessment}
          />
        )}

        {activeTab === "gaps" && <CompetencyGapsPanel gaps={UNIT_GAPS} />}

        {activeTab === "expiry" && (
          <ExpiryRenewalPanel
            profiles={DEMO_NURSE_PROFILES}
            onRenew={(compName, nurseName) =>
              showToast(`Renewal workflow initiated for ${nurseName} (${compName}).`)
            }
          />
        )}
      </main>
    </div>
  );
}

/* ── Panel 1: Overview ────────────────────────────────────────── */
function OverviewPanel({
  profiles,
  assessments,
  gaps,
  onNavigateTab,
}: {
  profiles: NurseProfile[];
  assessments: AssessmentRecord[];
  gaps: UnitCompetencyGap[];
  onNavigateTab: (tab: TabId) => void;
}) {
  const pendingAssessments = assessments.filter(
    (a) => a.status === "Scheduled" || a.status === "In Review"
  );
  const highGaps = gaps.filter((g) => g.urgency === "High");

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Overall Compliance</span>
            <ShieldCheck className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">92.4%</div>
          <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3 w-3" />
            <span>Target &ge; 90% met across all units</span>
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Assessments Due</span>
            <ClipboardList className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{pendingAssessments.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">5 scheduled in next 30 days</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Unit Competency Gaps</span>
            <AlertTriangle className="h-4 w-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-700">{highGaps.length} Priority Gaps</div>
          <p className="text-[11px] text-rose-600 mt-1 font-medium">ICU CRRT roster coverage deficit</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Upcoming Expirations</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">4</div>
          <p className="text-[11px] text-amber-700 mt-1 font-medium">Within 45-day renewal window</p>
        </div>
      </div>

      {/* Two-column layout: Upcoming Assessments & Unit Gaps Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Scheduled Assessments */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Competencies Due for Assessment</h2>
              <p className="text-xs text-slate-500">Upcoming direct clinical observations and practical sign-offs</p>
            </div>
            <button
              onClick={() => onNavigateTab("assessments")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>View all</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {assessments.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-lg border border-slate-100 bg-slate-50/70 flex items-start justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 truncate">{item.nurseName}</span>
                    <span className="text-[10.5px] text-slate-500">· {item.department}</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium mt-0.5 truncate">{item.competencyName}</p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {item.scheduledDate}
                    </span>
                    <span>Assessor: {item.assessor}</span>
                  </div>
                </div>
                <span
                  className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                    item.status === "Signed Off"
                      ? "bg-emerald-100 text-emerald-800"
                      : item.status === "In Review"
                      ? "bg-blue-100 text-blue-800"
                      : item.status === "Action Plan"
                      ? "bg-rose-100 text-rose-800"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Unit Level Competency Gaps */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Unit Competency Distribution</h2>
              <p className="text-xs text-slate-500">Required vs verified roster competency coverage</p>
            </div>
            <button
              onClick={() => onNavigateTab("gaps")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>View gaps</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {gaps.map((gap) => (
              <div key={gap.competency} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-900">{gap.unit}</span>
                    <span className="text-slate-500 ml-1.5 font-normal">({gap.competency})</span>
                  </div>
                  <span className="font-bold text-slate-700">
                    {gap.currentAvailableCount}/{gap.requiredRosterCount} ({Math.round(gap.coverageRatio * 100)}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      gap.coverageRatio >= 0.9
                        ? "bg-emerald-500"
                        : gap.coverageRatio >= 0.75
                        ? "bg-amber-500"
                        : "bg-rose-500"
                    }`}
                    style={{ width: `${Math.min(gap.coverageRatio * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Panel 2: Competency Profile ──────────────────────────────── */
function CompetencyProfilePanel({
  profiles,
  search,
  setSearch,
  categoryFilter,
  setCategoryFilter,
}: {
  profiles: NurseProfile[];
  search: string;
  setSearch: (s: string) => void;
  categoryFilter: string;
  setCategoryFilter: (c: string) => void;
}) {
  const [selectedNurseId, setSelectedNurseId] = useState<string>(profiles[0]?.id || "");

  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.department.toLowerCase().includes(search.toLowerCase()) ||
      p.competencies.some((c) => c.competencyName.toLowerCase().includes(search.toLowerCase()))
    );
  }, [profiles, search]);

  const selectedProfile = profiles.find((p) => p.id === selectedNurseId) || profiles[0];

  const displayedCompetencies = useMemo(() => {
    if (!selectedProfile) return [];
    if (categoryFilter === "all") return selectedProfile.competencies;
    return selectedProfile.competencies.filter((c) => c.category === categoryFilter);
  }, [selectedProfile, categoryFilter]);

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search nurse, unit, or clinical competency..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs text-slate-800 placeholder-slate-400 bg-transparent border-none outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-slate-500 font-medium">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-md px-2 py-1 outline-none"
          >
            <option value="all">All Categories</option>
            <option value="Clinical Critical Care">Clinical Critical Care</option>
            <option value="General Nursing">General Nursing</option>
            <option value="Emergency & Trauma">Emergency & Trauma</option>
            <option value="Medication & Infusion">Medication & Infusion</option>
          </select>
        </div>
      </div>

      {/* Two-column layout: Nurse list & Detailed Competency Portfolio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Nurse Roster Column */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
            Clinical Staff ({filteredProfiles.length})
          </div>
          <div className="space-y-2">
            {filteredProfiles.map((p) => {
              const isSelected = p.id === selectedProfile?.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedNurseId(p.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-blue-50/80 border-blue-300 shadow-2xs"
                      : "bg-white border-slate-200/80 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{p.name}</span>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {p.overallCompliance}% verified
                    </span>
                  </div>
                  <div className="text-[11.5px] text-slate-600 mt-0.5">{p.role}</div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {p.department}
                    </span>
                    <span>{p.competencies.length} competencies</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Nurse Profile Details */}
        <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-5">
          {selectedProfile && (
            <>
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">{selectedProfile.name}</h2>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {selectedProfile.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                    <span>Unit: {selectedProfile.department}</span>
                    <span>·</span>
                    <span>Clinical Experience: {selectedProfile.experienceYears} Years</span>
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-500 font-medium">Compliance Index</div>
                  <div className="text-xl font-bold text-slate-900">{selectedProfile.overallCompliance}%</div>
                </div>
              </div>

              {/* Competency Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Verified Clinical Competencies ({displayedCompetencies.length})
                  </h3>
                  <span className="text-[11px] text-slate-400">Rule-based assessment logs</span>
                </div>

                <div className="space-y-3">
                  {displayedCompetencies.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 rounded-lg border border-slate-200/80 bg-slate-50/50 space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{c.competencyName}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                c.level === "Expert"
                                  ? "bg-purple-100 text-purple-800 border border-purple-200"
                                  : c.level === "Proficient"
                                  ? "bg-blue-100 text-blue-800 border border-blue-200"
                                  : c.level === "Competent"
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : "bg-amber-100 text-amber-800 border border-amber-200"
                              }`}
                            >
                              Level: {c.level}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500">{c.category}</span>
                        </div>

                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            c.status === "Active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : c.status === "Renewal Due"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 bg-white p-2.5 rounded border border-slate-100">
                        <span className="font-semibold text-slate-700">Clinical Evidence: </span>
                        {c.clinicalEvidence}
                      </p>

                      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span>Assessor: {c.assessor}</span>
                        <span>
                          Assessed: {c.lastAssessedDate} · Next Review: {c.nextReviewDate}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Panel 3: Assessments ─────────────────────────────────────── */
function AssessmentsPanel({
  assessments,
  onSignOff,
}: {
  assessments: AssessmentRecord[];
  onSignOff: (id: string) => void;
}) {
  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Clinical Assessment Workflow</h2>
          <p className="text-xs text-slate-500">
            Formal competency evaluations, simulation tests, and preceptor sign-offs.
          </p>
        </div>
        <button
          type="button"
          onClick={() => alert("Schedule new assessment modal (prototype demo).")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer transition-colors"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          <span>Schedule Assessment</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200/80">
              <tr>
                <th className="py-3 px-4">Nurse</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Competency</th>
                <th className="py-3 px-4">Target Level</th>
                <th className="py-3 px-4">Scheduled Date</th>
                <th className="py-3 px-4">Assessor</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assessments.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{a.nurseName}</td>
                  <td className="py-3.5 px-4 text-slate-600">{a.department}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">{a.competencyName}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700 text-[11px]">
                      {a.targetLevel}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{a.scheduledDate}</td>
                  <td className="py-3.5 px-4 text-slate-600">{a.assessor}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${
                        a.status === "Signed Off"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : a.status === "In Review"
                          ? "bg-blue-100 text-blue-800 border border-blue-200"
                          : a.status === "Action Plan"
                          ? "bg-rose-100 text-rose-800 border border-rose-200"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {a.status !== "Signed Off" ? (
                      <button
                        onClick={() => onSignOff(a.id)}
                        className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded cursor-pointer transition-colors"
                      >
                        Sign Off
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-600 font-semibold flex items-center justify-end gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Verified
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Panel 4: Competency Gaps ─────────────────────────────────── */
function CompetencyGapsPanel({ gaps }: { gaps: UnitCompetencyGap[] }) {
  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <h2 className="text-sm font-bold text-slate-900">Unit-Level Competency Gap Analysis</h2>
        <p className="text-xs text-slate-500">
          Aggregated departmental competency availability versus minimum required staffing matrix. Rule-based, non-predictive.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {gaps.map((g) => (
          <div
            key={g.competency}
            className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                  {g.unit}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">{g.competency}</h3>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  g.urgency === "High"
                    ? "bg-rose-100 text-rose-800 border border-rose-200"
                    : g.urgency === "Moderate"
                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                    : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                }`}
              >
                {g.urgency} Urgency
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Verified Available Staff:</span>
                <span className="font-bold text-slate-900">
                  {g.currentAvailableCount} / {g.requiredRosterCount} required
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    g.coverageRatio >= 0.9
                      ? "bg-emerald-500"
                      : g.coverageRatio >= 0.75
                      ? "bg-amber-500"
                      : "bg-rose-500"
                  }`}
                  style={{ width: `${Math.min(g.coverageRatio * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
              <span className="font-semibold text-slate-700">Recommended Action: </span>
              <span className="text-slate-600">{g.recommendedAction}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Panel 5: Expiry & Renewal ────────────────────────────────── */
function ExpiryRenewalPanel({
  profiles,
  onRenew,
}: {
  profiles: NurseProfile[];
  onRenew: (compName: string, nurseName: string) => void;
}) {
  const expiringCompetencies = profiles.flatMap((p) =>
    p.competencies
      .filter((c) => c.status === "Renewal Due" || c.status === "Action Plan Required")
      .map((c) => ({
        nurseName: p.name,
        department: p.department,
        ...c,
      }))
  );

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <h2 className="text-sm font-bold text-slate-900">Competencies & Certifications Approaching Expiry</h2>
        <p className="text-xs text-slate-500">
          Proactive renewal queue to prevent clinical practice lapses and maintain accreditation.
        </p>
      </div>

      <div className="space-y-3">
        {expiringCompetencies.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">{item.nurseName}</span>
                <span className="text-slate-400 text-xs">·</span>
                <span className="text-xs text-slate-600">{item.department}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-800">{item.competencyName}</h3>
              <p className="text-xs text-slate-500">
                Category: {item.category} · Review Due: <span className="font-semibold text-amber-700">{item.nextReviewDate}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                  item.status === "Renewal Due"
                    ? "bg-amber-50 text-amber-800 border border-amber-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}
              >
                {item.status}
              </span>
              <button
                onClick={() => onRenew(item.competencyName, item.nurseName)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer transition-colors"
              >
                Initiate Renewal
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
