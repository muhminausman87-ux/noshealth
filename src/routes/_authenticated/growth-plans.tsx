import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { EmployeeGrowthNav } from "@/components/EmployeeGrowthNav";
import {
  TrendingUp,
  LayoutDashboard,
  FileCheck,
  Target,
  ListTodo,
  CalendarCheck,
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
  MessageSquare,
} from "lucide-react";
import { DEPARTMENTS, Department } from "@/lib/departments";

/* ── Route Definition ─────────────────────────────────────────── */
export const Route = createFileRoute("/_authenticated/growth-plans")({
  validateSearch: (search: Record<string, unknown>): { tab?: string } => ({
    tab: typeof search.tab === "string" ? search.tab : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Growth Plans · Employee Growth · NOS" },
      {
        name: "description",
        content:
          "Human-controlled annual growth plans, nurse-defined developmental goals, structured action items, and manager progress reviews.",
      },
    ],
  }),
  component: GrowthPlansPage,
});

/* ── Secondary Tabs ───────────────────────────────────────────── */
type TabId = "overview" | "plans" | "goals" | "actions" | "review";

interface TabDef {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const TABS: TabDef[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "plans", label: "Growth Plans", icon: FileCheck, badge: 8 },
  { id: "goals", label: "Development Goals", icon: Target, badge: 6 },
  { id: "actions", label: "Development Actions", icon: ListTodo, badge: 12 },
  { id: "review", label: "Progress Review", icon: CalendarCheck },
];

/* ── Types & Demo Dataset ─────────────────────────────────────── */
export interface NurseGrowthPlan {
  id: string;
  nurseName: string;
  role: string;
  department: string;
  deptId: Department;
  planCycle: string; // e.g., "2026 - 2027 Annual Cycle"
  primaryFocusArea: string;
  supervisingManager: string;
  status: "Active" | "Mid-Year Review Scheduled" | "Completed" | "Draft";
  goalCount: number;
  completedGoalCount: number;
  actionCount: number;
  lastUpdated: string;
}

export interface GrowthGoal {
  id: string;
  planId: string;
  nurseName: string;
  title: string;
  category: "Clinical Mastery" | "Leadership & Mentorship" | "Quality & Safety" | "Specialty Certification";
  successCriteria: string;
  targetQuarter: string;
  status: "In Progress" | "Achieved" | "On Track" | "Needs Attention";
  notes: string;
}

export interface DevelopmentActionItem {
  id: string;
  goalId: string;
  nurseName: string;
  actionTitle: string;
  actionType: "Simulation Wet Lab" | "Clinical Shadowing" | "Coursework" | "Ward Committee";
  dueDate: string;
  status: "Completed" | "In Progress" | "Pending Scheduling";
  evidenceNote: string;
}

export interface GrowthReviewRecord {
  id: string;
  nurseName: string;
  department: string;
  reviewType: "Mid-Year Developmental Check-in" | "Annual Growth Appraisal";
  scheduledDate: string;
  managerName: string;
  nurseSelfReflection: string;
  managerComments: string;
  reviewStatus: "Completed" | "Scheduled" | "Action Plan Agreed";
}

const DEMO_GROWTH_PLANS: NurseGrowthPlan[] = [
  {
    id: "GP-101",
    nurseName: "Elena Rostova",
    role: "Senior Staff Nurse (SN)",
    department: "Intensive Care Unit (ICU)",
    deptId: "icu",
    planCycle: "2026 - 2027 Annual Cycle",
    primaryFocusArea: "Critical Care Specialist Fellowship & Preceptor Governance",
    supervisingManager: "Nurse Director K. Daniels",
    status: "Active",
    goalCount: 3,
    completedGoalCount: 2,
    actionCount: 5,
    lastUpdated: "2026-09-28",
  },
  {
    id: "GP-102",
    nurseName: "Marcus Vance",
    role: "Staff Nurse (RN)",
    department: "Medical Ward",
    deptId: "medical",
    planCycle: "2026 - 2027 Annual Cycle",
    primaryFocusArea: "Charge Nurse Transition & Cardiac Telemetry Lead",
    supervisingManager: "Charge Nurse L. Moreau",
    status: "Mid-Year Review Scheduled",
    goalCount: 3,
    completedGoalCount: 1,
    actionCount: 4,
    lastUpdated: "2026-09-30",
  },
  {
    id: "GP-103",
    nurseName: "Amina Al-Mansoor",
    role: "Senior Staff Nurse (SN)",
    department: "Emergency Department (ED)",
    deptId: "ed",
    planCycle: "2026 - 2027 Annual Cycle",
    primaryFocusArea: "Emergency Nurse Educator & Trauma Protocol Lead",
    supervisingManager: "Triage Lead Dr. R. Patel",
    status: "Active",
    goalCount: 4,
    completedGoalCount: 3,
    actionCount: 6,
    lastUpdated: "2026-09-22",
  },
  {
    id: "GP-104",
    nurseName: "Carlos Reyes",
    role: "Staff Nurse (RN)",
    department: "Surgical Ward",
    deptId: "surgical",
    planCycle: "2026 - 2027 Annual Cycle",
    primaryFocusArea: "Perioperative & Surgical Preceptorship Development",
    supervisingManager: "Charge Nurse V. Larson",
    status: "Active",
    goalCount: 2,
    completedGoalCount: 1,
    actionCount: 3,
    lastUpdated: "2026-08-15",
  },
];

const DEMO_GROWTH_GOALS: GrowthGoal[] = [
  {
    id: "G-201",
    planId: "GP-101",
    nurseName: "Elena Rostova",
    title: "Complete Advanced ICU Fellowship Practicum Requirements",
    category: "Clinical Mastery",
    successCriteria: "Achieve 100% verified clinical practicum hours and submit thesis case study.",
    targetQuarter: "Q4 2026",
    status: "On Track",
    notes: "Direct observation of 10 complex multi-organ failure resuscitations completed.",
  },
  {
    id: "G-202",
    planId: "GP-101",
    nurseName: "Elena Rostova",
    title: "Lead Unit Preceptorship Program for Autumn New Graduate Roster",
    category: "Leadership & Mentorship",
    successCriteria: "Mentor 2 new graduate nurses through 12-week ICU induction with zero safety incidents.",
    targetQuarter: "Q1 2027",
    status: "In Progress",
    notes: "Preceptor feedback logged bi-weekly.",
  },
  {
    id: "G-203",
    planId: "GP-102",
    nurseName: "Marcus Vance",
    title: "Achieve Independent Charge Nurse Verification on Medical Ward",
    category: "Leadership & Mentorship",
    successCriteria: "Complete 6 shadow charge shifts and receive supervisory sign-off.",
    targetQuarter: "Q4 2026",
    status: "In Progress",
    notes: "4 shifts completed; handling bed capacity and handover effectively.",
  },
  {
    id: "G-204",
    planId: "GP-103",
    nurseName: "Amina Al-Mansoor",
    title: "Author ED Rapid Lactate Point-of-Care Sepsis Protocol",
    category: "Quality & Safety",
    successCriteria: "Protocol endorsed by Clinical Governance and implemented in ED Triage.",
    targetQuarter: "Q3 2026",
    status: "Achieved",
    notes: "Implemented with 18-minute reduction in door-to-antibiotic interval.",
  },
];

const DEMO_ACTIONS: DevelopmentActionItem[] = [
  {
    id: "ACT-801",
    goalId: "G-201",
    nurseName: "Elena Rostova",
    actionTitle: "Attend 8-hour Advanced Hemodynamic Wet Lab Simulation",
    actionType: "Simulation Wet Lab",
    dueDate: "2026-10-15",
    status: "Completed",
    evidenceNote: "Certificate of practical simulation hours on file in Education Office.",
  },
  {
    id: "ACT-802",
    goalId: "G-201",
    nurseName: "Elena Rostova",
    actionTitle: "Shadow Cardiothoracic Anesthesia Lead in OR during LVAD placement",
    actionType: "Clinical Shadowing",
    dueDate: "2026-11-05",
    status: "In Progress",
    evidenceNote: "Scheduled with Dr. Thorne.",
  },
  {
    id: "ACT-803",
    goalId: "G-203",
    nurseName: "Marcus Vance",
    actionTitle: "Complete Hospital Bed Coordination & Flow Workshop",
    actionType: "Coursework",
    dueDate: "2026-10-20",
    status: "Completed",
    evidenceNote: "E-learning and interactive scenario sign-off.",
  },
  {
    id: "ACT-804",
    goalId: "G-204",
    nurseName: "Amina Al-Mansoor",
    actionTitle: "Lead ED Sepsis Multidisciplinary Taskforce Monthly Meeting",
    actionType: "Ward Committee",
    dueDate: "2026-10-28",
    status: "In Progress",
    evidenceNote: "Meeting agenda and attendance roster submitted.",
  },
];

const DEMO_REVIEWS: GrowthReviewRecord[] = [
  {
    id: "REV-01",
    nurseName: "Elena Rostova",
    department: "Intensive Care Unit (ICU)",
    reviewType: "Annual Growth Appraisal",
    scheduledDate: "2026-09-28",
    managerName: "Nurse Director K. Daniels",
    nurseSelfReflection: "Focused on bridging clinical excellence and mentoring newer staff. The ICU fellowship has provided deep diagnostic confidence.",
    managerComments: "Elena is performing at an exemplary level. Strongly endorsed for Clinical Nurse Specialist promotion track.",
    reviewStatus: "Completed",
  },
  {
    id: "REV-02",
    nurseName: "Marcus Vance",
    department: "Medical Ward",
    reviewType: "Mid-Year Developmental Check-in",
    scheduledDate: "2026-10-18",
    managerName: "Charge Nurse L. Moreau",
    nurseSelfReflection: "Working on balancing direct patient care while stepping up into charge nurse responsibilities.",
    managerComments: "Great progress on telemetry competence. Focus for next quarter is conflict de-escalation with family members.",
    reviewStatus: "Scheduled",
  },
];

/* ── Main Component ───────────────────────────────────────────── */
export default function GrowthPlansPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();

  const activeTab: TabId = (
    TABS.some((t) => t.id === search.tab) ? search.tab : "overview"
  ) as TabId;

  const setActiveTab = (tab: TabId) => {
    navigate({
      to: "/growth-plans",
      search: { tab },
    });
  };

  const [plans] = useState<NurseGrowthPlan[]>(DEMO_GROWTH_PLANS);
  const [goals] = useState<GrowthGoal[]>(DEMO_GROWTH_GOALS);
  const [actions] = useState<DevelopmentActionItem[]>(DEMO_ACTIONS);
  const [reviews] = useState<GrowthReviewRecord[]>(DEMO_REVIEWS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 font-sans bg-[#F8FAFC] text-slate-900">
      {/* ── Level 2: Primary Employee Growth Navigation ────────── */}
      <div className="w-full min-w-0 px-4 sm:px-6 pt-3 pb-1 bg-white border-b border-slate-200 shrink-0">
        <EmployeeGrowthNav activeTab="plans" />
      </div>

      {/* ── Module Header & Level 3: Secondary Tabs ───────────── */}
      <header className="px-5 pt-4 pb-3 bg-white border-b border-slate-200/80 shrink-0 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.14em] text-blue-600">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Employee Growth · Individual Growth Plans</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-0.5">
              Growth Plans & Performance Reviews
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Human-governed annual growth plans, nurse-defined SMART goals, actionable development tasks, and manager reviews.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-md border border-blue-200 bg-blue-50 text-blue-700">
              Human-Controlled Goals
            </span>
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-md border border-slate-200 bg-slate-100 text-slate-600">
              Demo Dataset
            </span>
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-md border border-slate-200 bg-slate-50 text-slate-600">
              Joint Nurse-Manager Sign-Off
            </span>
          </div>
        </div>

        {/* Level 3 Secondary Horizontal Tab Bar */}
        <nav
          className="flex gap-1 overflow-x-auto pt-2 scrollbar-none"
          aria-label="Growth Plans Secondary Tabs"
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
            plans={plans}
            goals={goals}
            actions={actions}
            reviews={reviews}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === "plans" && (
          <PlansPanel
            plans={plans}
            onCreatePlan={() => showToast("Growth plan creator initialized (prototype demo).")}
          />
        )}

        {activeTab === "goals" && (
          <GoalsPanel
            goals={goals}
            onCreateGoal={() => showToast("New SMART goal drafted.")}
          />
        )}

        {activeTab === "actions" && <ActionsPanel actions={actions} />}

        {activeTab === "review" && (
          <ReviewPanel
            reviews={reviews}
            onStartReview={(name) => showToast(`Appraisal review started for ${name}.`)}
          />
        )}
      </main>
    </div>
  );
}

/* ── Panel 1: Overview ────────────────────────────────────────── */
function OverviewPanel({
  plans,
  goals,
  actions,
  reviews,
  onNavigateTab,
}: {
  plans: NurseGrowthPlan[];
  goals: GrowthGoal[];
  actions: DevelopmentActionItem[];
  reviews: GrowthReviewRecord[];
  onNavigateTab: (tab: TabId) => void;
}) {
  const activePlans = plans.filter((p) => p.status === "Active" || p.status === "Mid-Year Review Scheduled").length;
  const completedGoals = goals.filter((g) => g.status === "Achieved").length;
  const completedActions = actions.filter((a) => a.status === "Completed").length;

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Growth Plans</span>
            <FileCheck className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{activePlans} Staff</div>
          <p className="text-[11px] text-blue-700 mt-1 font-medium">Annual 2026-2027 Cycle</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">SMART Goals</span>
            <Target className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {completedGoals} <span className="text-xs text-slate-400 font-normal">/ {goals.length} Achieved</span>
          </div>
          <p className="text-[11px] text-emerald-600 mt-1 font-medium">Across all clinical wards</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Development Actions</span>
            <ListTodo className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {completedActions} <span className="text-xs text-slate-400 font-normal">/ {actions.length} Done</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Simulation labs & shadowing</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Scheduled Appraisals</span>
            <CalendarCheck className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{reviews.length} Sessions</div>
          <p className="text-[11px] text-purple-700 mt-1 font-medium">Mid-year check-ins upcoming</p>
        </div>
      </div>

      {/* Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Active Plans Summary */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Active Growth Plans</h2>
              <p className="text-xs text-slate-500">Individual nurse developmental focus and goals</p>
            </div>
            <button
              onClick={() => onNavigateTab("plans")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>View all</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {plans.map((p) => (
              <div
                key={p.id}
                className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/70 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900">{p.nurseName}</span>
                    <span className="text-[11px] text-slate-500 ml-1.5">({p.department})</span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {p.status}
                  </span>
                </div>
                <p className="text-[11.5px] text-slate-700 font-medium truncate">{p.primaryFocusArea}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Manager: {p.supervisingManager}</span>
                  <span>
                    Goals: {p.completedGoalCount}/{p.goalCount} · Actions: {p.actionCount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Goals Highlights */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">SMART Goal Milestones</h2>
              <p className="text-xs text-slate-500">Progress against agreed developmental milestones</p>
            </div>
            <button
              onClick={() => onNavigateTab("goals")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>View goals</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {goals.map((g) => (
              <div
                key={g.id}
                className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/70 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{g.nurseName}</span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      g.status === "Achieved"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {g.status}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-800">{g.title}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Category: {g.category}</span>
                  <span>Target: {g.targetQuarter}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Panel 2: Plans ───────────────────────────────────────────── */
function PlansPanel({
  plans,
  onCreatePlan,
}: {
  plans: NurseGrowthPlan[];
  onCreatePlan: () => void;
}) {
  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Individual Nurse Growth Plans</h2>
          <p className="text-xs text-slate-500">
            Collaborative development plans established between clinical staff and nurse supervisors.
          </p>
        </div>
        <button
          onClick={onCreatePlan}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer transition-colors"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          <span>New Growth Plan</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.map((p) => (
          <div
            key={p.id}
            className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{p.nurseName}</h3>
                  <p className="text-xs text-slate-500">
                    {p.role} · <span className="font-semibold text-blue-700">{p.department}</span>
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {p.status}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1 text-xs">
                <span className="font-semibold text-slate-700">Primary Focus Area: </span>
                <p className="text-slate-800 font-medium">{p.primaryFocusArea}</p>
                <div className="text-[11px] text-slate-500 pt-1">
                  Plan Cycle: {p.planCycle} · Supervisor: {p.supervisingManager}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs pt-1">
                <div className="p-2 bg-slate-50 rounded border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">SMART Goals</span>
                  <span className="font-bold text-slate-800">
                    {p.completedGoalCount} / {p.goalCount} Completed
                  </span>
                </div>
                <div className="p-2 bg-slate-50 rounded border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Action Tasks</span>
                  <span className="font-bold text-slate-800">{p.actionCount} Active</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Updated: {p.lastUpdated}</span>
              <button
                type="button"
                onClick={() => alert("Open detailed growth plan modal (prototype demo).")}
                className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
              >
                Manage Plan
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Panel 3: Goals ───────────────────────────────────────────── */
function GoalsPanel({
  goals,
  onCreateGoal,
}: {
  goals: GrowthGoal[];
  onCreateGoal: () => void;
}) {
  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-sm font-bold text-slate-900">SMART Growth Goals</h2>
          <p className="text-xs text-slate-500">
            Specific, Measurable, Achievable, Relevant, and Time-bound development targets.
          </p>
        </div>
        <button
          onClick={onCreateGoal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer transition-colors"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          <span>Add Goal</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((g) => (
          <div
            key={g.id}
            className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                  {g.category}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">{g.title}</h3>
                <p className="text-xs text-slate-500">Nurse: {g.nurseName}</p>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  g.status === "Achieved"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : "bg-blue-100 text-blue-800 border border-blue-200"
                }`}
              >
                {g.status}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1">
              <span className="font-semibold text-slate-700">Success Criteria: </span>
              <p className="text-slate-600">{g.successCriteria}</p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>Target: {g.targetQuarter}</span>
              <span>Notes: {g.notes}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Panel 4: Actions ─────────────────────────────────────────── */
function ActionsPanel({ actions }: { actions: DevelopmentActionItem[] }) {
  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <h2 className="text-sm font-bold text-slate-900">Concrete Development Actions</h2>
        <p className="text-xs text-slate-500">
          Actionable learning tasks, clinical shadow shifts, specialty wet labs, and committee roles.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200/80">
              <tr>
                <th className="py-3 px-4">Action Task</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Assigned Nurse</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Evidence Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {actions.map((act) => (
                <tr key={act.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 max-w-xs">{act.actionTitle}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-[10.5px] border border-blue-200">
                      {act.actionType}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">{act.nurseName}</td>
                  <td className="py-3.5 px-4 text-slate-600">{act.dueDate}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${
                        act.status === "Completed"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-blue-100 text-blue-800 border border-blue-200"
                      }`}
                    >
                      {act.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 text-[11.5px] max-w-xs truncate">
                    {act.evidenceNote}
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

/* ── Panel 5: Review ──────────────────────────────────────────── */
function ReviewPanel({
  reviews,
  onStartReview,
}: {
  reviews: GrowthReviewRecord[];
  onStartReview: (name: string) => void;
}) {
  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <h2 className="text-sm font-bold text-slate-900">Performance & Growth Appraisals</h2>
        <p className="text-xs text-slate-500">
          Formal developmental evaluations and self-reflections conducted jointly with nurse managers.
        </p>
      </div>

      <div className="space-y-4">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{rev.nurseName}</h3>
                <p className="text-xs text-slate-500">
                  {rev.department} · Review Type: <span className="font-semibold text-slate-700">{rev.reviewType}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Date: {rev.scheduledDate}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    rev.reviewStatus === "Completed"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : "bg-purple-100 text-purple-800 border border-purple-200"
                  }`}
                >
                  {rev.reviewStatus}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                <span className="font-bold text-slate-700 block">Nurse Self-Reflection:</span>
                <p className="text-slate-600 leading-relaxed">{rev.nurseSelfReflection}</p>
              </div>

              <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 space-y-1">
                <span className="font-bold text-blue-950 block">Manager Appraisal & Next Steps:</span>
                <p className="text-blue-900 leading-relaxed">{rev.managerComments}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">Reviewing Manager: {rev.managerName}</span>
              {rev.reviewStatus !== "Completed" && (
                <button
                  onClick={() => onStartReview(rev.nurseName)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer transition-colors"
                >
                  Conduct Appraisal
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
