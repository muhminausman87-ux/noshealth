import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { EmployeeGrowthNav } from "@/components/EmployeeGrowthNav";
import {
  Rocket,
  LayoutDashboard,
  Target,
  Activity,
  HeartHandshake,
  TrendingUp,
  CheckCircle2,
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
  Calendar,
} from "lucide-react";
import { DEPARTMENTS, Department } from "@/lib/departments";

/* ── Route Definition ─────────────────────────────────────────── */
export const Route = createFileRoute("/_authenticated/professional-development")({
  validateSearch: (search: Record<string, unknown>): { tab?: string } => ({
    tab: typeof search.tab === "string" ? search.tab : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Professional Development · Employee Growth · NOS" },
      {
        name: "description",
        content:
          "Support structured professional growth, nurse-defined development goals, mentorship pairings, and clinical activity portfolios.",
      },
    ],
  }),
  component: ProfessionalDevelopmentPage,
});

/* ── Secondary Tabs ───────────────────────────────────────────── */
type TabId = "overview" | "goals" | "activities" | "mentorship" | "progress";

interface TabDef {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const TABS: TabDef[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "goals", label: "Development Goals", icon: Target, badge: 5 },
  { id: "activities", label: "Development Activities", icon: Activity, badge: 8 },
  { id: "mentorship", label: "Mentorship", icon: HeartHandshake, badge: 4 },
  { id: "progress", label: "Progress & Reviews", icon: TrendingUp },
];

/* ── Types & Demo Dataset ─────────────────────────────────────── */
export interface DevelopmentGoal {
  id: string;
  nurseName: string;
  department: string;
  goalTitle: string;
  category: "Clinical Mastery" | "Leadership & Mentorship" | "Quality & Safety" | "Research & EBP";
  targetDate: string;
  status: "In Progress" | "Under Review" | "Achieved" | "Pending Action";
  managerFeedback: string;
  milestones: { text: string; done: boolean }[];
}

export interface DevelopmentActivity {
  id: string;
  title: string;
  type: "Workshop" | "QI Committee" | "Journal Club" | "Case Presentation" | "Specialty Rotation";
  leadNurse: string;
  department: string;
  date: string;
  hoursEarned: number;
  learningOutcome: string;
  verifiedBy: string;
}

export interface MentorshipPairing {
  id: string;
  mentorName: string;
  mentorRole: string;
  menteeName: string;
  menteeRole: string;
  department: string;
  focusArea: string;
  meetingCadence: string;
  lastSessionDate: string;
  nextSessionDate: string;
  notesSummary: string;
}

const DEMO_GOALS: DevelopmentGoal[] = [
  {
    id: "G-101",
    nurseName: "Elena Rostova",
    department: "Intensive Care Unit (ICU)",
    goalTitle: "Attain ECMO (Extracorporeal Membrane Oxygenation) Bedside Certification",
    category: "Clinical Mastery",
    targetDate: "2027-02-15",
    status: "In Progress",
    managerFeedback: "Excellent initiative; 2 simulation wet-lab runs completed. Scheduled for clinical proctoring.",
    milestones: [
      { text: "Complete Advanced ECMO Cannulation & Circuit Theory", done: true },
      { text: "Attend 16-hour High-Fidelity Simulation Wet Lab", done: true },
      { text: "Complete 40 Supervised Bedside ECMO Nursing Hours", done: false },
    ],
  },
  {
    id: "G-102",
    nurseName: "Marcus Vance",
    department: "Medical Ward",
    goalTitle: "Transition into Charge Nurse & Bed Management Rotation",
    category: "Leadership & Mentorship",
    targetDate: "2026-12-30",
    status: "In Progress",
    managerFeedback: "Demonstrated strong conflict resolution skills during recent night shifts.",
    milestones: [
      { text: "Complete Charge Nurse Leadership Workshop", done: true },
      { text: "Shadow Experienced Charge Nurse for 4 Shifts", done: true },
      { text: "Lead 2 Independent Weekend Ward Shifts under Supervision", done: false },
    ],
  },
  {
    id: "G-103",
    nurseName: "Amina Al-Mansoor",
    department: "Emergency Department (ED)",
    goalTitle: "Lead Unit-Based Quality Improvement on Door-to-Needle Sepsis Time",
    category: "Quality & Safety",
    targetDate: "2026-11-20",
    status: "Under Review",
    managerFeedback: "Data collection phase completed; protocol submitted to ED Clinical Governance Committee.",
    milestones: [
      { text: "Audit 50 Sepsis Protocol Triage Encounters", done: true },
      { text: "Design Rapid Lactate Point-of-Care Workflow", done: true },
      { text: "Present Protocol to Departmental Faculty", done: true },
    ],
  },
  {
    id: "G-104",
    nurseName: "Carlos Reyes",
    department: "Surgical Ward",
    goalTitle: "Clinical Preceptorship Accreditation for New Graduate Onboarding",
    category: "Leadership & Mentorship",
    targetDate: "2026-10-31",
    status: "Achieved",
    managerFeedback: "Successfully certified as Unit Preceptor. Assigned to mentor 2 graduate nurses this fall.",
    milestones: [
      { text: "Complete Adult Learning & Preceptor Principles", done: true },
      { text: "Supervise 1 Student Practicum Rotation", done: true },
      { text: "Submit Reflective Portfolio for Education Sign-Off", done: true },
    ],
  },
];

const DEMO_ACTIVITIES: DevelopmentActivity[] = [
  {
    id: "ACT-301",
    title: "Critical Care Multidisciplinary Morbidity & Mortality Review",
    type: "Case Presentation",
    leadNurse: "Elena Rostova",
    department: "Intensive Care Unit (ICU)",
    date: "2026-09-24",
    hoursEarned: 3,
    learningOutcome: "Presented nursing perspective on early recognition of septic shock hypoperfusion.",
    verifiedBy: "Dr. L. Thorne (ICU Intensivist)",
  },
  {
    id: "ACT-302",
    title: "Vascular Access Quality Improvement Taskforce",
    type: "QI Committee",
    leadNurse: "Marcus Vance",
    department: "Medical Ward",
    date: "2026-09-15",
    hoursEarned: 4,
    learningOutcome: "Evaluated ultrasound-guided peripheral IV cannulation success rates on medical ward.",
    verifiedBy: "Charge Nurse L. Moreau",
  },
  {
    id: "ACT-303",
    title: "Emergency Triage Case Studies & Pediatric Red Flags",
    type: "Journal Club",
    leadNurse: "Amina Al-Mansoor",
    department: "Emergency Department (ED)",
    date: "2026-09-29",
    hoursEarned: 2,
    learningOutcome: "Reviewed latest evidence on atypical pediatric appendicitis presentations in triage.",
    verifiedBy: "Triage Lead Dr. R. Patel",
  },
  {
    id: "ACT-304",
    title: "Post-Anesthesia Care Unit (PACU) Cross-Specialty Rotation",
    type: "Specialty Rotation",
    leadNurse: "Carlos Reyes",
    department: "Surgical Ward",
    date: "2026-08-20",
    hoursEarned: 16,
    learningOutcome: "Completed 2-day immersive rotation focusing on immediate post-extubation airway safety.",
    verifiedBy: "PACU Nurse Manager",
  },
];

const DEMO_MENTORSHIPS: MentorshipPairing[] = [
  {
    id: "MEN-01",
    mentorName: "Sophie Dubois (CN)",
    mentorRole: "Clinical Nurse Specialist",
    menteeName: "Marcus Vance (RN)",
    menteeRole: "Staff Nurse",
    department: "Medical / Cardiac",
    focusArea: "Cardiac telemetry interpretation & clinical leadership transition",
    meetingCadence: "Bi-Weekly",
    lastSessionDate: "2026-09-28",
    nextSessionDate: "2026-10-12",
    notesSummary: "Discussed bed delegation strategies and handling difficult patient family communications.",
  },
  {
    id: "MEN-02",
    mentorName: "Elena Rostova (SN)",
    mentorRole: "Senior Critical Care Nurse",
    menteeName: "David Chen (EN)",
    menteeRole: "Enrolled Nurse",
    department: "ICU / Surgical",
    focusArea: "Hemodynamic monitoring fundamentals & arterial line zeroing",
    meetingCadence: "Weekly",
    lastSessionDate: "2026-10-01",
    nextSessionDate: "2026-10-08",
    notesSummary: "Hands-on review of transducer kit priming and pressure wave damping artifacts.",
  },
  {
    id: "MEN-03",
    mentorName: "Kofi Mensah (SN)",
    mentorRole: "Critical Care Float Lead",
    menteeName: "Carlos Reyes (RN)",
    menteeRole: "Staff Nurse",
    department: "Central Float / Surgical",
    focusArea: "Rapid clinical adaptation across high-acuity surgical step-down wards",
    meetingCadence: "Monthly",
    lastSessionDate: "2026-09-18",
    nextSessionDate: "2026-10-18",
    notesSummary: "Reflected on multi-ward float pacing and proactive charge nurse communication.",
  },
];

/* ── Main Component ───────────────────────────────────────────── */
export default function ProfessionalDevelopmentPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();

  const activeTab: TabId = (
    TABS.some((t) => t.id === search.tab) ? search.tab : "overview"
  ) as TabId;

  const setActiveTab = (tab: TabId) => {
    navigate({
      to: "/professional-development",
      search: { tab },
    });
  };

  const [goals] = useState<DevelopmentGoal[]>(DEMO_GOALS);
  const [activities] = useState<DevelopmentActivity[]>(DEMO_ACTIVITIES);
  const [mentorships] = useState<MentorshipPairing[]>(DEMO_MENTORSHIPS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 font-sans bg-[#F8FAFC] text-slate-900">
      {/* ── Level 2: Primary Employee Growth Navigation ────────── */}
      <div className="w-full min-w-0 px-4 sm:px-6 pt-3 pb-1 bg-white border-b border-slate-200 shrink-0">
        <EmployeeGrowthNav activeTab="development" />
      </div>

      {/* ── Module Header & Level 3: Secondary Tabs ───────────── */}
      <header className="px-5 pt-4 pb-3 bg-white border-b border-slate-200/80 shrink-0 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.14em] text-blue-600">
              <Rocket className="h-3.5 w-3.5" />
              <span>Employee Growth · Professional Growth & Mentorship</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-0.5">
              Professional Development
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Structured developmental goals, quality activities, mentorship pairings, and milestone reviews. Non-predictive.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-md border border-blue-200 bg-blue-50 text-blue-700">
              Nurse-Driven SMART Goals
            </span>
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-md border border-slate-200 bg-slate-100 text-slate-600">
              Demo Dataset
            </span>
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-md border border-slate-200 bg-slate-50 text-slate-600">
              Human-Governed Review
            </span>
          </div>
        </div>

        {/* Level 3 Secondary Horizontal Tab Bar */}
        <nav
          className="flex gap-1 overflow-x-auto pt-2 scrollbar-none"
          aria-label="Professional Development Secondary Tabs"
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
            goals={goals}
            activities={activities}
            mentorships={mentorships}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === "goals" && (
          <DevelopmentGoalsPanel
            goals={goals}
            onCreateGoal={() => showToast("New development goal drafted (prototype demo).")}
          />
        )}

        {activeTab === "activities" && <DevelopmentActivitiesPanel activities={activities} />}

        {activeTab === "mentorship" && <MentorshipPanel mentorships={mentorships} />}

        {activeTab === "progress" && <ProgressReviewsPanel goals={goals} />}
      </main>
    </div>
  );
}

/* ── Panel 1: Overview ────────────────────────────────────────── */
function OverviewPanel({
  goals,
  activities,
  mentorships,
  onNavigateTab,
}: {
  goals: DevelopmentGoal[];
  activities: DevelopmentActivity[];
  mentorships: MentorshipPairing[];
  onNavigateTab: (tab: TabId) => void;
}) {
  const activeGoals = goals.filter((g) => g.status === "In Progress").length;
  const totalActivityHours = activities.reduce((acc, a) => acc + a.hoursEarned, 0);

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Goals</span>
            <Target className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{activeGoals} Goals</div>
          <p className="text-[11px] text-blue-700 mt-1 font-medium">In nurse development plans</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Mentorship Pairs</span>
            <HeartHandshake className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{mentorships.length} Active</div>
          <p className="text-[11px] text-slate-500 mt-1">Cross-specialty pairings</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Activity Hours</span>
            <Activity className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalActivityHours} Hours</div>
          <p className="text-[11px] text-emerald-600 mt-1 font-medium">QI, case reviews & workshops</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Milestones Achieved</span>
            <CheckCircle2 className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">8 Verified</div>
          <p className="text-[11px] text-slate-500 mt-1">Signed off by nurse managers</p>
        </div>
      </div>

      {/* Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Development Goals Summary */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Active Development Goals</h2>
              <p className="text-xs text-slate-500">Individual nurse learning and leadership objectives</p>
            </div>
            <button
              onClick={() => onNavigateTab("goals")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>View all</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {goals.slice(0, 3).map((g) => (
              <div
                key={g.id}
                className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/70 space-y-2"
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
                <p className="text-xs text-slate-800 font-medium">{g.goalTitle}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Category: {g.category}</span>
                  <span>Target: {g.targetDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mentorship Highlights */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Mentorship Pairings</h2>
              <p className="text-xs text-slate-500">Clinical leadership and peer support connections</p>
            </div>
            <button
              onClick={() => onNavigateTab("mentorship")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>View pairs</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {mentorships.map((m) => (
              <div
                key={m.id}
                className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/70 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs">
                    <span className="font-bold text-slate-900">{m.mentorName}</span>
                    <span className="text-slate-400 mx-1.5">→</span>
                    <span className="font-medium text-slate-700">{m.menteeName}</span>
                  </div>
                  <span className="text-[10.5px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                    {m.meetingCadence}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 truncate">{m.focusArea}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Unit: {m.department}</span>
                  <span>Next Session: {m.nextSessionDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Panel 2: Development Goals ───────────────────────────────── */
function DevelopmentGoalsPanel({
  goals,
  onCreateGoal,
}: {
  goals: DevelopmentGoal[];
  onCreateGoal: () => void;
}) {
  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Individual Development Goals (SMART Framework)</h2>
          <p className="text-xs text-slate-500">
            Nurse-defined objectives supported by clinical nurse managers and preceptors.
          </p>
        </div>
        <button
          onClick={onCreateGoal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer transition-colors"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          <span>New Goal</span>
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
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">{g.goalTitle}</h3>
                <p className="text-xs text-slate-500">
                  Nurse: <span className="font-semibold text-slate-700">{g.nurseName}</span> · {g.department}
                </p>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                  g.status === "Achieved"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : g.status === "Under Review"
                    ? "bg-purple-100 text-purple-800 border border-purple-200"
                    : "bg-blue-100 text-blue-800 border border-blue-200"
                }`}
              >
                {g.status}
              </span>
            </div>

            {/* Milestones Checklist */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Action Milestones
              </span>
              <div className="space-y-1">
                {g.milestones.map((m, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                    <CheckCircle2
                      className={`h-3.5 w-3.5 shrink-0 ${
                        m.done ? "text-emerald-600" : "text-slate-300"
                      }`}
                    />
                    <span className={m.done ? "line-through text-slate-400" : ""}>{m.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
              <span className="font-semibold text-slate-700">Manager Note: </span>
              <span className="text-slate-600">{g.managerFeedback}</span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>Target Completion: {g.targetDate}</span>
              <button
                type="button"
                onClick={() => alert("Goal review dialog (prototype demo).")}
                className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
              >
                Review Goal
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Panel 3: Development Activities ──────────────────────────── */
function DevelopmentActivitiesPanel({ activities }: { activities: DevelopmentActivity[] }) {
  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <h2 className="text-sm font-bold text-slate-900">Clinical Development Activities Log</h2>
        <p className="text-xs text-slate-500">
          Peer workshops, journal clubs, morbidity & mortality reviews, and quality improvement initiatives.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200/80">
              <tr>
                <th className="py-3 px-4">Activity Title</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Lead Nurse</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Hours Earned</th>
                <th className="py-3 px-4">Verified By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activities.map((act) => (
                <tr key={act.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 max-w-xs">{act.title}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-[10.5px] border border-blue-200">
                      {act.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">{act.leadNurse}</td>
                  <td className="py-3.5 px-4 text-slate-600">{act.department}</td>
                  <td className="py-3.5 px-4 text-slate-600">{act.date}</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-700">{act.hoursEarned} hrs</td>
                  <td className="py-3.5 px-4 text-slate-500">{act.verifiedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Panel 4: Mentorship ──────────────────────────────────────── */
function MentorshipPanel({ mentorships }: { mentorships: MentorshipPairing[] }) {
  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Clinical Mentorship Program</h2>
          <p className="text-xs text-slate-500">
            One-on-one preceptor and clinical nurse specialist mentorship tracks.
          </p>
        </div>
        <button
          type="button"
          onClick={() => alert("Create mentorship match modal (prototype demo).")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer transition-colors"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          <span>New Pairing</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mentorships.map((m) => (
          <div
            key={m.id}
            className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">
                  {m.meetingCadence} Sessions
                </span>
                <span className="text-[10.5px] text-slate-500">{m.department}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1 text-xs">
                <div>
                  <span className="text-slate-500">Mentor: </span>
                  <span className="font-bold text-slate-900">{m.mentorName}</span>
                </div>
                <div>
                  <span className="text-slate-500">Mentee: </span>
                  <span className="font-semibold text-slate-800">{m.menteeName}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600">
                <span className="font-semibold text-slate-700">Focus: </span>
                {m.focusArea}
              </p>

              <p className="text-xs text-slate-500 bg-white p-2.5 rounded border border-slate-100">
                <span className="font-semibold text-slate-700">Recent Session Log: </span>
                {m.notesSummary}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Next Session: {m.nextSessionDate}</span>
              <button
                type="button"
                onClick={() => alert("Log mentorship session (prototype demo).")}
                className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
              >
                Log Session
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Panel 5: Progress & Reviews ──────────────────────────────── */
function ProgressReviewsPanel({ goals }: { goals: DevelopmentGoal[] }) {
  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <h2 className="text-sm font-bold text-slate-900">Qualitative Milestone & Portfolio Reviews</h2>
        <p className="text-xs text-slate-500">
          Structured review cycle between clinical managers and staff nurses. Non-predictive.
        </p>
      </div>

      <div className="space-y-3">
        {goals.map((g) => (
          <div
            key={g.id}
            className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-4"
          >
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">{g.nurseName}</span>
                <span className="text-slate-400">·</span>
                <span className="text-xs text-slate-600">{g.department}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-800">{g.goalTitle}</h3>
              <p className="text-xs text-slate-600">{g.managerFeedback}</p>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`text-[10.5px] font-semibold px-2.5 py-1 rounded-full ${
                  g.status === "Achieved"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-blue-50 text-blue-800 border border-blue-200"
                }`}
              >
                {g.status}
              </span>
              <button
                type="button"
                onClick={() => alert("Sign off milestone review (prototype demo).")}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer transition-colors"
              >
                Conduct Review
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
