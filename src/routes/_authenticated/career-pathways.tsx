import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { EmployeeGrowthNav } from "@/components/EmployeeGrowthNav";
import {
  Briefcase,
  LayoutDashboard,
  GitFork,
  CheckSquare,
  UserCheck,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  Users,
  Award,
  PlusCircle,
  FileText,
  Building2,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { DEPARTMENTS, Department } from "@/lib/departments";

/* ── Route Definition ─────────────────────────────────────────── */
export const Route = createFileRoute("/_authenticated/career-pathways")({
  validateSearch: (search: Record<string, unknown>): { tab?: string } => ({
    tab: typeof search.tab === "string" ? search.tab : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Career Pathways · Employee Growth · NOS" },
      {
        name: "description",
        content:
          "Transparent clinical career ladders, objective progression criteria, nurse readiness checklists, and advancement portfolios.",
      },
    ],
  }),
  component: CareerPathwaysPage,
});

/* ── Secondary Tabs ───────────────────────────────────────────── */
type TabId = "overview" | "paths" | "requirements" | "readiness" | "progress";

interface TabDef {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const TABS: TabDef[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "paths", label: "Career Paths", icon: GitFork, badge: 4 },
  { id: "requirements", label: "Advancement Criteria", icon: CheckSquare },
  { id: "readiness", label: "Readiness Checklists", icon: UserCheck, badge: 6 },
  { id: "progress", label: "Ladder Progress", icon: TrendingUp },
];

/* ── Types & Demo Dataset ─────────────────────────────────────── */
export interface CareerLadderTrack {
  id: string;
  trackName: string;
  description: string;
  levels: {
    grade: string;
    title: string;
    typicalTenure: string;
    keyScope: string;
  }[];
}

export interface TrackRequirement {
  fromGrade: string;
  toGrade: string;
  track: string;
  minYearsInGrade: number;
  requiredCertifications: string[];
  mandatoryCompetencies: string[];
  educationRequirement: string;
  portfolioDeliverables: string[];
}

export interface NurseReadinessRecord {
  id: string;
  nurseName: string;
  currentRole: string;
  targetRole: string;
  department: string;
  track: string;
  yearsInGrade: number;
  requiredYears: number;
  criteriaMetCount: number;
  totalCriteriaCount: number;
  status: "Ready for Committee Review" | "In Preparation" | "Missing Competency" | "Portfolio Pending";
  checklist: { item: string; met: boolean }[];
}

export interface LadderProgressApplication {
  id: string;
  nurseName: string;
  targetGrade: string;
  department: string;
  submittedDate: string;
  committeeReviewDate: string;
  sponsorManager: string;
  reviewStatus: "Under Committee Review" | "Portfolio Endorsed" | "Action Plan Assigned";
}

const DEMO_LADDER_TRACKS: CareerLadderTrack[] = [
  {
    id: "TRK-01",
    trackName: "Clinical Practice & Advanced Specialty",
    description: "Expert bedside care, advanced clinical decision-making, and specialized diagnostic care.",
    levels: [
      { grade: "RN-1", title: "Staff Nurse (Novice / Beginner)", typicalTenure: "0 - 2 Years", keyScope: "Direct patient care under unit preceptor guidance." },
      { grade: "RN-2", title: "Staff Nurse (Competent)", typicalTenure: "2 - 4 Years", keyScope: "Independent bedside care and complex patient assignments." },
      { grade: "SN-1", title: "Senior Staff Nurse (Proficient)", typicalTenure: "4 - 7 Years", keyScope: "Unit preceptor, code blue lead, and specialized procedures." },
      { grade: "CNS", title: "Clinical Nurse Specialist (Expert)", typicalTenure: "7+ Years", keyScope: "Hospital-wide clinical consultation and advanced practice." },
    ],
  },
  {
    id: "TRK-02",
    trackName: "Clinical Nursing Leadership & Operations",
    description: "Bedside leadership, shift coordination, staff development, and operational management.",
    levels: [
      { grade: "SN-1", title: "Charge Nurse / Shift Leader", typicalTenure: "4 - 6 Years", keyScope: "Shift coordination, bed management, and clinical escalation." },
      { grade: "NM", title: "Nurse Manager (Ward / Unit)", typicalTenure: "6 - 10 Years", keyScope: "Unit staffing, budget governance, quality, and staff retention." },
      { grade: "ADON", title: "Assistant Director of Nursing", typicalTenure: "10+ Years", keyScope: "Clinical directorate strategy and multidisciplinary governance." },
    ],
  },
  {
    id: "TRK-03",
    trackName: "Clinical Nursing Education",
    description: "Workforce upskilling, simulation training, curriculum design, and academic development.",
    levels: [
      { grade: "SN-1", title: "Unit-Based Clinical Preceptor", typicalTenure: "3 - 5 Years", keyScope: "Orientation of new graduates and clinical onboarding." },
      { grade: "CNE", title: "Clinical Nurse Educator", typicalTenure: "5 - 8 Years", keyScope: "Simulation lab instruction, OSCE assessment, and CNE courses." },
      { grade: "PNE", title: "Principal Nurse Educator", typicalTenure: "8+ Years", keyScope: "Hospital-wide education policy and university partnership leads." },
    ],
  },
  {
    id: "TRK-04",
    trackName: "Nursing Informatics & Systems Intelligence",
    description: "Digital workflow optimization, clinical AI governance, EHR usability, and analytics.",
    levels: [
      { grade: "RN-2", title: "Unit Informatics Super-User", typicalTenure: "2 - 4 Years", keyScope: "EHR bedside support and workflow feedback champion." },
      { grade: "NIS", title: "Nursing Informatics Specialist", typicalTenure: "4 - 8 Years", keyScope: "Clinical decision support design and system workflow audits." },
      { grade: "CNIO", title: "Chief Nursing Information Officer", typicalTenure: "8+ Years", keyScope: "Strategic clinical technology roadmap and data ethics." },
    ],
  },
];

const DEMO_REQUIREMENTS: TrackRequirement[] = [
  {
    fromGrade: "Staff Nurse (RN)",
    toGrade: "Senior Staff Nurse (SN)",
    track: "Clinical Practice Track",
    minYearsInGrade: 3,
    requiredCertifications: ["BLS Healthcare Provider", "ACLS or PALS Current", "Specialty Board Cert"],
    mandatoryCompetencies: ["Arterial Lines / Airway Management", "Direct Preceptorship", "Code Blue Resuscitation"],
    educationRequirement: "Bachelor of Science in Nursing (BSN)",
    portfolioDeliverables: ["1 Clinical Case Study Presentation", "2 Unit Quality Audits Completed", "Preceptor Portfolio Sign-Off"],
  },
  {
    fromGrade: "Senior Staff Nurse (SN)",
    toGrade: "Clinical Nurse Specialist (CNS)",
    track: "Clinical Practice Track",
    minYearsInGrade: 4,
    requiredCertifications: ["CCRN / CEN / Specialty Master Board", "Advanced Life Support Lead"],
    mandatoryCompetencies: ["CRRT Dialyzer Expert", "Complex Hemodynamic Consultation", "Ventilator Weaning Protocol Lead"],
    educationRequirement: "Master of Science in Nursing (MSN) or Post-Graduate Diploma",
    portfolioDeliverables: ["Evidence-Based Practice Guideline Authoring", "Interdisciplinary Mortality Review Lead", "Peer-Reviewed Presentation"],
  },
  {
    fromGrade: "Senior Staff Nurse (SN)",
    toGrade: "Nurse Manager (NM)",
    track: "Leadership & Operations Track",
    minYearsInGrade: 3,
    requiredCertifications: ["Healthcare Leadership Certificate", "Financial & Rostering Management"],
    mandatoryCompetencies: ["Bed Placement & Flow Management", "Conflict De-Escalation", "Incident Root Cause Analysis"],
    educationRequirement: "BSN + Healthcare Management Certification",
    portfolioDeliverables: ["Unit Staffing Efficiency Plan", "Retention & Wellbeing Initiative Report", "Annual Unit Operating Plan"],
  },
];

const DEMO_READINESS_RECORDS: NurseReadinessRecord[] = [
  {
    id: "RDN-01",
    nurseName: "Elena Rostova",
    currentRole: "Senior Staff Nurse (SN)",
    targetRole: "Clinical Nurse Specialist (CNS - Critical Care)",
    department: "Intensive Care Unit (ICU)",
    track: "Clinical Practice Track",
    yearsInGrade: 4.5,
    requiredYears: 4,
    criteriaMetCount: 5,
    totalCriteriaCount: 5,
    status: "Ready for Committee Review",
    checklist: [
      { item: "Minimum 4 years active ICU experience", met: true },
      { item: "Current CCRN Board Certification", met: true },
      { item: "Master's Degree Coursework Progress >= 80%", met: true },
      { item: "Lead Author on Unit Hemodynamic Guideline", met: true },
      { item: "Clinical Nurse Director Endorsement", met: true },
    ],
  },
  {
    id: "RDN-02",
    nurseName: "Marcus Vance",
    currentRole: "Staff Nurse (RN)",
    targetRole: "Senior Staff Nurse (SN - Medical)",
    department: "Medical Ward",
    track: "Clinical Practice Track",
    yearsInGrade: 3.2,
    requiredYears: 3,
    criteriaMetCount: 4,
    totalCriteriaCount: 5,
    status: "Missing Competency",
    checklist: [
      { item: "Minimum 3 years inpatient experience", met: true },
      { item: "Current CMSRN Board Certification", met: true },
      { item: "Preceptor Foundation Course Completed", met: true },
      { item: "Independent Charge Nurse Rotation Sign-off", met: false },
      { item: "Annual Clinical Evaluation Score >= Satisfactory", met: true },
    ],
  },
  {
    id: "RDN-03",
    nurseName: "Amina Al-Mansoor",
    currentRole: "Senior Staff Nurse (SN)",
    targetRole: "Clinical Nurse Educator (Emergency & Trauma)",
    department: "Emergency Department (ED)",
    track: "Clinical Education Track",
    yearsInGrade: 3.8,
    requiredYears: 3,
    criteriaMetCount: 4,
    totalCriteriaCount: 5,
    status: "Portfolio Pending",
    checklist: [
      { item: "Minimum 3 years emergency specialty experience", met: true },
      { item: "Current CEN & TNCC Instructor Credentials", met: true },
      { item: "Simulation Scenario Design Portfolio", met: false },
      { item: "20 Mentored Clinical Teaching Hours", met: true },
      { item: "Education Committee Nomination", met: true },
    ],
  },
  {
    id: "RDN-04",
    nurseName: "Carlos Reyes",
    currentRole: "Staff Nurse (RN)",
    targetRole: "Senior Staff Nurse (SN - Surgical)",
    department: "Surgical Ward",
    track: "Clinical Practice Track",
    yearsInGrade: 2.5,
    requiredYears: 3,
    criteriaMetCount: 3,
    totalCriteriaCount: 5,
    status: "In Preparation",
    checklist: [
      { item: "Minimum 3 years surgical nursing (Current: 2.5 yrs)", met: false },
      { item: "Current CNOR Certification", met: true },
      { item: "Preceptor Accreditation", met: true },
      { item: "Wound VAC Complex Care Master Sign-off", met: true },
      { item: "Unit QI Project Lead", met: false },
    ],
  },
];

const DEMO_LADDER_APPLICATIONS: LadderProgressApplication[] = [
  {
    id: "APP-501",
    nurseName: "Elena Rostova",
    targetGrade: "Clinical Nurse Specialist (CNS)",
    department: "Intensive Care Unit (ICU)",
    submittedDate: "2026-09-15",
    committeeReviewDate: "2026-10-20",
    sponsorManager: "Nurse Director K. Daniels",
    reviewStatus: "Under Committee Review",
  },
  {
    id: "APP-502",
    nurseName: "Marcus Vance",
    targetGrade: "Senior Staff Nurse (SN)",
    department: "Medical Ward",
    submittedDate: "2026-09-28",
    committeeReviewDate: "2026-11-10",
    sponsorManager: "Charge Nurse L. Moreau",
    reviewStatus: "Action Plan Assigned",
  },
  {
    id: "APP-503",
    nurseName: "Amina Al-Mansoor",
    targetGrade: "Clinical Nurse Educator (CNE)",
    department: "Emergency Department (ED)",
    submittedDate: "2026-09-10",
    committeeReviewDate: "2026-10-20",
    sponsorManager: "Triage Lead Dr. R. Patel",
    reviewStatus: "Portfolio Endorsed",
  },
];

/* ── Main Component ───────────────────────────────────────────── */
export default function CareerPathwaysPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();

  const activeTab: TabId = (
    TABS.some((t) => t.id === search.tab) ? search.tab : "overview"
  ) as TabId;

  const setActiveTab = (tab: TabId) => {
    navigate({
      to: "/career-pathways",
      search: { tab },
    });
  };

  const [tracks] = useState<CareerLadderTrack[]>(DEMO_LADDER_TRACKS);
  const [requirements] = useState<TrackRequirement[]>(DEMO_REQUIREMENTS);
  const [readinessRecords] = useState<NurseReadinessRecord[]>(DEMO_READINESS_RECORDS);
  const [applications] = useState<LadderProgressApplication[]>(DEMO_LADDER_APPLICATIONS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 font-sans bg-[#F8FAFC] text-slate-900">
      {/* ── Level 2: Primary Employee Growth Navigation ────────── */}
      <div className="w-full min-w-0 px-4 sm:px-6 pt-3 pb-1 bg-white border-b border-slate-200 shrink-0">
        <EmployeeGrowthNav activeTab="pathways" />
      </div>

      {/* ── Module Header & Level 3: Secondary Tabs ───────────── */}
      <header className="px-5 pt-4 pb-3 bg-white border-b border-slate-200/80 shrink-0 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.14em] text-blue-600">
              <Briefcase className="h-3.5 w-3.5" />
              <span>Employee Growth · Clinical Career Ladders</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-0.5">
              Career Pathways & Clinical Advancement
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Transparent multi-track clinical ladders, objective readiness criteria, portfolio checklists, and review governance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-md border border-blue-200 bg-blue-50 text-blue-700">
              Rule-Based Progression
            </span>
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-md border border-slate-200 bg-slate-100 text-slate-600">
              Demo Dataset
            </span>
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-md border border-slate-200 bg-slate-50 text-slate-600">
              No Predictive Promotion AI
            </span>
          </div>
        </div>

        {/* Level 3 Secondary Horizontal Tab Bar */}
        <nav
          className="flex gap-1 overflow-x-auto pt-2 scrollbar-none"
          aria-label="Career Pathways Secondary Tabs"
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
                  <span className="ml-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-200/70 text-slate-700">
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
            tracks={tracks}
            readinessRecords={readinessRecords}
            applications={applications}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === "paths" && <CareerPathsPanel tracks={tracks} />}

        {activeTab === "requirements" && <RequirementsPanel requirements={requirements} />}

        {activeTab === "readiness" && (
          <ReadinessPanel
            records={readinessRecords}
            onReviewCandidate={(name) =>
              showToast(`Review summary generated for ${name}.`)
            }
          />
        )}

        {activeTab === "progress" && <ProgressApplicationsPanel applications={applications} />}
      </main>
    </div>
  );
}

/* ── Panel 1: Overview ────────────────────────────────────────── */
function OverviewPanel({
  tracks,
  readinessRecords,
  applications,
  onNavigateTab,
}: {
  tracks: CareerLadderTrack[];
  readinessRecords: NurseReadinessRecord[];
  applications: LadderProgressApplication[];
  onNavigateTab: (tab: TabId) => void;
}) {
  const readyCandidates = readinessRecords.filter((r) => r.status === "Ready for Committee Review").length;

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Career Ladder Tracks</span>
            <GitFork className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{tracks.length} Pathways</div>
          <p className="text-[11px] text-blue-700 mt-1 font-medium">Practice, Leadership, Education, Informatics</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Ready for Review</span>
            <UserCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{readyCandidates} Candidates</div>
          <p className="text-[11px] text-emerald-600 mt-1 font-medium">100% objective criteria verified</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Applications</span>
            <FileText className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{applications.length} Portfolios</div>
          <p className="text-[11px] text-slate-500 mt-1">Pending committee session</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Governance Rule</span>
            <ShieldCheck className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">Peer Review</div>
          <p className="text-[11px] text-purple-700 mt-1 font-medium">No automated promotion scoring</p>
        </div>
      </div>

      {/* Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Career Ladder Paths */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Clinical Ladder Tracks</h2>
              <p className="text-xs text-slate-500">Structured multi-tier progression opportunities</p>
            </div>
            <button
              onClick={() => onNavigateTab("paths")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>View all</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {tracks.map((t) => (
              <div
                key={t.id}
                className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/70 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{t.trackName}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {t.levels.length} Tiers
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">{t.description}</p>
                <div className="text-[10.5px] text-slate-400">
                  Progression: {t.levels.map((l) => l.grade).join(" → ")}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Readiness Candidates Summary */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Advancement Readiness Portfolio</h2>
              <p className="text-xs text-slate-500">Candidates approaching progression milestones</p>
            </div>
            <button
              onClick={() => onNavigateTab("readiness")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>View checklists</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {readinessRecords.map((r) => (
              <div
                key={r.id}
                className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/70 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900">{r.nurseName}</span>
                    <span className="text-[11px] text-slate-500 ml-1.5">({r.department})</span>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      r.status === "Ready for Committee Review"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-700 font-medium">
                  {r.currentRole} → <span className="text-blue-700 font-bold">{r.targetRole}</span>
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>
                    Criteria Met: {r.criteriaMetCount} / {r.totalCriteriaCount}
                  </span>
                  <span>Tenure: {r.yearsInGrade} yrs</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Panel 2: Career Paths ────────────────────────────────────── */
function CareerPathsPanel({ tracks }: { tracks: CareerLadderTrack[] }) {
  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <h2 className="text-sm font-bold text-slate-900">Hospital Nursing Career Pathways</h2>
        <p className="text-xs text-slate-500">
          Four distinct progression ladders supporting clinical excellence, management, education, and health informatics.
        </p>
      </div>

      <div className="space-y-5">
        {tracks.map((t) => (
          <div
            key={t.id}
            className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-4"
          >
            <div>
              <h3 className="text-sm font-bold text-slate-900">{t.trackName}</h3>
              <p className="text-xs text-slate-500">{t.description}</p>
            </div>

            {/* Ladder Steps */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {t.levels.map((lvl, idx) => (
                <div
                  key={lvl.grade}
                  className="p-3.5 rounded-lg border border-slate-200/80 bg-slate-50/70 space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 font-mono">
                        Tier {idx + 1} · {lvl.grade}
                      </span>
                      <span className="text-[10px] text-slate-400">{lvl.typicalTenure}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">{lvl.title}</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{lvl.keyScope}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Panel 3: Advancement Criteria ────────────────────────────── */
function RequirementsPanel({ requirements }: { requirements: TrackRequirement[] }) {
  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <h2 className="text-sm font-bold text-slate-900">Objective Advancement Criteria</h2>
        <p className="text-xs text-slate-500">
          Transparent prerequisites required for progression across nursing grades. Rule-based and human-audited.
        </p>
      </div>

      <div className="space-y-4">
        {requirements.map((req, idx) => (
          <div
            key={idx}
            className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                  {req.track}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                  {req.fromGrade} <span className="text-slate-400 mx-1.5">→</span> {req.toGrade}
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-md">
                Min. {req.minYearsInGrade} Years in Grade
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-slate-700 block">Required Certifications</span>
                <ul className="list-disc list-inside text-slate-600 space-y-0.5 text-[11.5px]">
                  {req.requiredCertifications.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-700 block">Mandatory Competencies</span>
                <ul className="list-disc list-inside text-slate-600 space-y-0.5 text-[11.5px]">
                  {req.mandatoryCompetencies.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-700 block">Portfolio Deliverables</span>
                <ul className="list-disc list-inside text-slate-600 space-y-0.5 text-[11.5px]">
                  {req.portfolioDeliverables.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              <span className="font-semibold text-slate-700">Education Benchmark: </span>
              {req.educationRequirement}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Panel 4: Readiness Checklists ────────────────────────────── */
function ReadinessPanel({
  records,
  onReviewCandidate,
}: {
  records: NurseReadinessRecord[];
  onReviewCandidate: (name: string) => void;
}) {
  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <h2 className="text-sm font-bold text-slate-900">Individual Advancement Readiness Checklists</h2>
        <p className="text-xs text-slate-500">
          Objective criteria tracking for nurses preparing for clinical ladder applications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {records.map((r) => (
          <div
            key={r.id}
            className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{r.nurseName}</h3>
                  <p className="text-xs text-slate-500">
                    {r.department} · {r.track}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    r.status === "Ready for Committee Review"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : "bg-blue-100 text-blue-800 border border-blue-200"
                  }`}
                >
                  {r.status}
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                <span className="text-slate-500">Target Role: </span>
                <span className="font-bold text-slate-900">{r.targetRole}</span>
              </div>

              {/* Checklist */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                  Objective Criteria ({r.criteriaMetCount}/{r.totalCriteriaCount} Met)
                </span>
                <div className="space-y-1">
                  {r.checklist.map((chk, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                      <CheckCircle2
                        className={`h-3.5 w-3.5 shrink-0 ${
                          chk.met ? "text-emerald-600" : "text-slate-300"
                        }`}
                      />
                      <span className={chk.met ? "text-slate-800" : "text-slate-500"}>
                        {chk.item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">Tenure in Grade: {r.yearsInGrade} Years</span>
              <button
                onClick={() => onReviewCandidate(r.nurseName)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer transition-colors"
              >
                Open Portfolio
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Panel 5: Ladder Progress ─────────────────────────────────── */
function ProgressApplicationsPanel({ applications }: { applications: LadderProgressApplication[] }) {
  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <h2 className="text-sm font-bold text-slate-900">Clinical Ladder Applications & Peer Review</h2>
        <p className="text-xs text-slate-500">
          Formal submissions under review by the Nursing Credentialing & Advancement Committee.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200/80">
              <tr>
                <th className="py-3 px-4">Applicant</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Target Grade</th>
                <th className="py-3 px-4">Submission Date</th>
                <th className="py-3 px-4">Sponsoring Manager</th>
                <th className="py-3 px-4">Review Committee Date</th>
                <th className="py-3 px-4">Review Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{app.nurseName}</td>
                  <td className="py-3.5 px-4 text-slate-600">{app.department}</td>
                  <td className="py-3.5 px-4 font-bold text-blue-700">{app.targetGrade}</td>
                  <td className="py-3.5 px-4 text-slate-600">{app.submittedDate}</td>
                  <td className="py-3.5 px-4 text-slate-500">{app.sponsorManager}</td>
                  <td className="py-3.5 px-4 text-slate-800 font-medium">{app.committeeReviewDate}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${
                        app.reviewStatus === "Portfolio Endorsed"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : app.reviewStatus === "Under Committee Review"
                          ? "bg-blue-100 text-blue-800 border border-blue-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {app.reviewStatus}
                    </span>
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
