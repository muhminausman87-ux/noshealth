import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { EmployeeGrowthNav } from "@/components/EmployeeGrowthNav";
import {
  ClipboardCheck,
  LayoutDashboard,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  Users,
  BookOpen,
  Building2,
  ChevronRight,
  ShieldCheck,
  Award,
  PlusCircle,
  FileText,
  Sparkles,
  ArrowUpRight,
  GraduationCap,
} from "lucide-react";
import { DEPARTMENTS, Department } from "@/lib/departments";

/* ── Route Definition ─────────────────────────────────────────── */
export const Route = createFileRoute("/_authenticated/learning")({
  validateSearch: (search: Record<string, unknown>): { tab?: string } => ({
    tab: typeof search.tab === "string" ? search.tab : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Training · Employee Growth · NOS" },
      {
        name: "description",
        content:
          "Mandatory training programs, scheduled sessions, unit-level compliance tracking, and training history.",
      },
    ],
  }),
  component: TrainingPage,
});

/* ── Secondary Tabs ───────────────────────────────────────────── */
type TabId = "overview" | "required" | "upcoming" | "completion" | "history";

interface TabDef {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const TABS: TabDef[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "required", label: "Required Training", icon: ShieldCheck, badge: 6 },
  { id: "upcoming", label: "Upcoming Sessions", icon: Calendar, badge: 4 },
  { id: "completion", label: "Completion Rates", icon: CheckCircle2 },
  { id: "history", label: "Training History", icon: Clock },
];

/* ── Types & Demo Dataset ─────────────────────────────────────── */
export interface RequiredTrainingProgram {
  id: string;
  title: string;
  category: "Mandatory Regulatory" | "Clinical Safety" | "Infection Control" | "Hospital Systems";
  targetAudience: string;
  frequency: "Annual" | "Bi-Annual" | "Triennial" | "One-Time";
  totalEnrolled: number;
  completedCount: number;
  complianceRate: number; // percentage
  nextDueDate: string;
  urgency: "Normal" | "Urgent" | "Critical";
}

export interface ScheduledTrainingSession {
  id: string;
  programTitle: string;
  instructor: string;
  location: string;
  date: string;
  time: string;
  capacity: number;
  registeredCount: number;
  status: "Open" | "Waitlist" | "Completed" | "Cancelled";
}

export interface EmployeeTrainingRecord {
  id: string;
  nurseName: string;
  role: string;
  department: string;
  programTitle: string;
  completedDate: string;
  expiryDate: string;
  scoreOrStatus: string;
  provider: string;
  certificateId: string;
}

export interface UnitCompletionBreakdown {
  unit: string;
  deptId: Department;
  staffCount: number;
  completedStaff: number;
  pendingStaff: number;
  overdueStaff: number;
  complianceRate: number;
}

const DEMO_REQUIRED_PROGRAMS: RequiredTrainingProgram[] = [
  {
    id: "TR-01",
    title: "Basic Life Support (BLS) Healthcare Provider",
    category: "Clinical Safety",
    targetAudience: "All Clinical Nursing Staff",
    frequency: "Bi-Annual",
    totalEnrolled: 340,
    completedCount: 322,
    complianceRate: 94.7,
    nextDueDate: "2026-11-15",
    urgency: "Normal",
  },
  {
    id: "TR-02",
    title: "Infection Prevention & Aseptic Non-Touch Technique (ANTT)",
    category: "Infection Control",
    targetAudience: "All Inpatient & Ambulatory Units",
    frequency: "Annual",
    totalEnrolled: 410,
    completedCount: 388,
    complianceRate: 94.6,
    nextDueDate: "2026-10-30",
    urgency: "Normal",
  },
  {
    id: "TR-03",
    title: "Medication Administration & High-Alert Drug Safety",
    category: "Clinical Safety",
    targetAudience: "Registered Nurses & Nurse Leaders",
    frequency: "Annual",
    totalEnrolled: 290,
    completedCount: 258,
    complianceRate: 88.9,
    nextDueDate: "2026-10-20",
    urgency: "Urgent",
  },
  {
    id: "TR-04",
    title: "Fire Safety & Hospital Evacuation Protocols",
    category: "Mandatory Regulatory",
    targetAudience: "Hospital-wide Clinical & Support Staff",
    frequency: "Annual",
    totalEnrolled: 520,
    completedCount: 495,
    complianceRate: 95.1,
    nextDueDate: "2026-12-01",
    urgency: "Normal",
  },
  {
    id: "TR-05",
    title: "Electronic Health Record (EHR) Security & HIPAA",
    category: "Hospital Systems",
    targetAudience: "All System Users",
    frequency: "Annual",
    totalEnrolled: 480,
    completedCount: 462,
    complianceRate: 96.2,
    nextDueDate: "2026-11-05",
    urgency: "Normal",
  },
  {
    id: "TR-06",
    title: "Safe Patient Handling & Mobility (SPHM)",
    category: "Clinical Safety",
    targetAudience: "Bedside Nurses & Healthcare Assistants",
    frequency: "Annual",
    totalEnrolled: 280,
    completedCount: 235,
    complianceRate: 83.9,
    nextDueDate: "2026-10-15",
    urgency: "Urgent",
  },
];

const DEMO_UPCOMING_SESSIONS: ScheduledTrainingSession[] = [
  {
    id: "SES-201",
    programTitle: "High-Alert Medication Safety & Double-Check Standards",
    instructor: "Clinical Pharmacist Dr. K. Evans & Nurse Educator P. Vance",
    location: "Clinical Simulation Lab 3B",
    date: "2026-10-08",
    time: "09:00 - 12:00",
    capacity: 20,
    registeredCount: 18,
    status: "Open",
  },
  {
    id: "SES-202",
    programTitle: "Basic Life Support (BLS) Practical Megacode Assessment",
    instructor: "Resuscitation Training Officer M. Jenkins",
    location: "Education Centre Room 102",
    date: "2026-10-11",
    time: "13:30 - 16:30",
    capacity: 15,
    registeredCount: 15,
    status: "Waitlist",
  },
  {
    id: "SES-203",
    programTitle: "Safe Patient Handling & Ergonomics Practical Workshop",
    instructor: "Physical Therapy Lead S. Martinez",
    location: "Physiotherapy Gym & Mock Ward",
    date: "2026-10-14",
    time: "10:00 - 12:00",
    capacity: 25,
    registeredCount: 19,
    status: "Open",
  },
  {
    id: "SES-204",
    programTitle: "Infection Prevention: Clostridium Difficile & Isolation Best Practices",
    instructor: "Infection Control Specialist T. Miller",
    location: "Main Auditorium & Hybrid Virtual Stream",
    date: "2026-10-22",
    time: "14:00 - 15:30",
    capacity: 50,
    registeredCount: 32,
    status: "Open",
  },
];

const DEMO_UNIT_COMPLETION: UnitCompletionBreakdown[] = [
  {
    unit: "Intensive Care Unit (ICU)",
    deptId: "icu",
    staffCount: 48,
    completedStaff: 46,
    pendingStaff: 2,
    overdueStaff: 0,
    complianceRate: 95.8,
  },
  {
    unit: "Emergency Department (ED)",
    deptId: "ed",
    staffCount: 62,
    completedStaff: 57,
    pendingStaff: 4,
    overdueStaff: 1,
    complianceRate: 91.9,
  },
  {
    unit: "Medical Ward",
    deptId: "medical",
    staffCount: 54,
    completedStaff: 47,
    pendingStaff: 5,
    overdueStaff: 2,
    complianceRate: 87.0,
  },
  {
    unit: "Surgical Ward",
    deptId: "surgical",
    staffCount: 50,
    completedStaff: 46,
    pendingStaff: 4,
    overdueStaff: 0,
    complianceRate: 92.0,
  },
  {
    unit: "Cardiac Care",
    deptId: "cardiac",
    staffCount: 38,
    completedStaff: 36,
    pendingStaff: 2,
    overdueStaff: 0,
    complianceRate: 94.7,
  },
  {
    unit: "Pediatric Ward",
    deptId: "pediatric",
    staffCount: 32,
    completedStaff: 31,
    pendingStaff: 1,
    overdueStaff: 0,
    complianceRate: 96.8,
  },
];

const DEMO_TRAINING_HISTORY: EmployeeTrainingRecord[] = [
  {
    id: "REC-901",
    nurseName: "Elena Rostova",
    role: "Senior Staff Nurse (SN)",
    department: "Intensive Care Unit (ICU)",
    programTitle: "Basic Life Support (BLS) Healthcare Provider",
    completedDate: "2026-08-10",
    expiryDate: "2028-08-10",
    scoreOrStatus: "100% (Pass)",
    provider: "American Heart Association (AHA)",
    certificateId: "BLS-2026-99214",
  },
  {
    id: "REC-902",
    nurseName: "Marcus Vance",
    role: "Staff Nurse (RN)",
    department: "Medical Ward",
    programTitle: "Infection Prevention & ANTT",
    completedDate: "2026-05-18",
    expiryDate: "2027-05-18",
    scoreOrStatus: "95% (Pass)",
    provider: "Hospital Clinical Education Dept",
    certificateId: "INF-2026-44320",
  },
  {
    id: "REC-903",
    nurseName: "Amina Al-Mansoor",
    role: "Senior Staff Nurse (SN)",
    department: "Emergency Department (ED)",
    programTitle: "Safe Patient Handling & Mobility (SPHM)",
    completedDate: "2026-07-22",
    expiryDate: "2027-07-22",
    scoreOrStatus: "Verified Competent",
    provider: "Occupational Safety Institute",
    certificateId: "SPH-2026-11890",
  },
  {
    id: "REC-904",
    nurseName: "Carlos Reyes",
    role: "Staff Nurse (RN)",
    department: "Surgical Ward",
    programTitle: "EHR Security & HIPAA Compliance",
    completedDate: "2026-09-04",
    expiryDate: "2027-09-04",
    scoreOrStatus: "100% (Pass)",
    provider: "Hospital Informatics Academy",
    certificateId: "HIPAA-2026-78821",
  },
  {
    id: "REC-905",
    nurseName: "Priya Sharma",
    role: "Staff Nurse (RN)",
    department: "Pediatric Ward",
    programTitle: "Medication Administration Safety",
    completedDate: "2026-04-11",
    expiryDate: "2027-04-11",
    scoreOrStatus: "98% (Pass)",
    provider: "Pharmacy Safety Committee",
    certificateId: "MED-2026-30019",
  },
];

/* ── Main Component ───────────────────────────────────────────── */
export default function TrainingPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();

  const activeTab: TabId = (
    TABS.some((t) => t.id === search.tab) ? search.tab : "overview"
  ) as TabId;

  const setActiveTab = (tab: TabId) => {
    navigate({
      to: "/learning",
      search: { tab },
    });
  };

  const [programs] = useState<RequiredTrainingProgram[]>(DEMO_REQUIRED_PROGRAMS);
  const [sessions, setSessions] = useState<ScheduledTrainingSession[]>(DEMO_UPCOMING_SESSIONS);
  const [history] = useState<EmployeeTrainingRecord[]>(DEMO_TRAINING_HISTORY);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleRegisterSession = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId ? { ...s, registeredCount: s.registeredCount + 1 } : s
      )
    );
    showToast("Registration confirmed for scheduled training session.");
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 font-sans bg-[#F8FAFC] text-slate-900">
      {/* ── Level 2: Primary Employee Growth Navigation ────────── */}
      <div className="w-full min-w-0 px-4 sm:px-6 pt-3 pb-1 bg-white border-b border-slate-200 shrink-0">
        <EmployeeGrowthNav activeTab="training" />
      </div>

      {/* ── Module Header & Level 3: Secondary Tabs ───────────── */}
      <header className="px-5 pt-4 pb-3 bg-white border-b border-slate-200/80 shrink-0 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.14em] text-blue-600">
              <ClipboardCheck className="h-3.5 w-3.5" />
              <span>Employee Growth · Mandatory & Continuing Training</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-0.5">
              Training Management
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Mandatory hospital programs, live training sessions, departmental completion tracking, and compliance logs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-md border border-blue-200 bg-blue-50 text-blue-700">
              Regulatory Compliance Standard
            </span>
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-md border border-slate-200 bg-slate-100 text-slate-600">
              Demo Dataset
            </span>
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-md border border-slate-200 bg-slate-50 text-slate-600">
              Verified Records
            </span>
          </div>
        </div>

        {/* Level 3 Secondary Horizontal Tab Bar */}
        <nav
          className="flex gap-1 overflow-x-auto pt-2 scrollbar-none"
          aria-label="Training Secondary Tabs"
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
                      tab.id === "required"
                        ? "bg-blue-100 text-blue-700"
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
            programs={programs}
            sessions={sessions}
            unitBreakdown={DEMO_UNIT_COMPLETION}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === "required" && <RequiredTrainingPanel programs={programs} />}

        {activeTab === "upcoming" && (
          <UpcomingSessionsPanel sessions={sessions} onRegister={handleRegisterSession} />
        )}

        {activeTab === "completion" && <CompletionRatesPanel unitBreakdown={DEMO_UNIT_COMPLETION} />}

        {activeTab === "history" && <TrainingHistoryPanel history={history} />}
      </main>
    </div>
  );
}

/* ── Panel 1: Overview ────────────────────────────────────────── */
function OverviewPanel({
  programs,
  sessions,
  unitBreakdown,
  onNavigateTab,
}: {
  programs: RequiredTrainingProgram[];
  sessions: ScheduledTrainingSession[];
  unitBreakdown: UnitCompletionBreakdown[];
  onNavigateTab: (tab: TabId) => void;
}) {
  const avgCompliance = Math.round(
    programs.reduce((acc, p) => acc + p.complianceRate, 0) / programs.length
  );
  const totalCompleted = programs.reduce((acc, p) => acc + p.completedCount, 0);
  const totalEnrolled = programs.reduce((acc, p) => acc + p.totalEnrolled, 0);

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Hospital Compliance</span>
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{avgCompliance}%</div>
          <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3 w-3" />
            <span>Target &ge; 90% benchmark</span>
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Completed Modules</span>
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {totalCompleted} <span className="text-xs text-slate-400 font-normal">/ {totalEnrolled}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Across 6 mandatory programs</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Upcoming Sessions</span>
            <Calendar className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{sessions.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Scheduled for this month</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Overdue Trainees</span>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700">3 Staff</div>
          <p className="text-[11px] text-amber-700 mt-1 font-medium">Action notices issued</p>
        </div>
      </div>

      {/* Two-Column Grid: Required Programs & Upcoming Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Required Programs */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Mandatory Training Programs</h2>
              <p className="text-xs text-slate-500">Regulatory and clinical safety requirements</p>
            </div>
            <button
              onClick={() => onNavigateTab("required")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>View all</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {programs.slice(0, 4).map((prog) => (
              <div
                key={prog.id}
                className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/70 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 truncate">{prog.title}</h3>
                    <p className="text-[11px] text-slate-500">{prog.category} · Frequency: {prog.frequency}</p>
                  </div>
                  <span
                    className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                      prog.complianceRate >= 90
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {prog.complianceRate}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      prog.complianceRate >= 90 ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                    style={{ width: `${prog.complianceRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Training Sessions */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Upcoming Live Training Sessions</h2>
              <p className="text-xs text-slate-500">Hands-on practicals and simulation sessions</p>
            </div>
            <button
              onClick={() => onNavigateTab("upcoming")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>View sessions</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {sessions.slice(0, 3).map((s) => (
              <div
                key={s.id}
                className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/70 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 truncate">{s.programTitle}</span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      s.status === "Open"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {s.status} ({s.registeredCount}/{s.capacity})
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">Instructor: {s.instructor}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {s.date} · {s.time}
                  </span>
                  <span>{s.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Panel 2: Required Training ───────────────────────────────── */
function RequiredTrainingPanel({ programs }: { programs: RequiredTrainingProgram[] }) {
  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <h2 className="text-sm font-bold text-slate-900">Mandatory Clinical & Safety Programs</h2>
        <p className="text-xs text-slate-500">
          Core regulatory education required for active clinical practice and accreditation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {programs.map((prog) => (
          <div
            key={prog.id}
            className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {prog.category}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">{prog.title}</h3>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  prog.urgency === "Urgent"
                    ? "bg-rose-100 text-rose-800 border border-rose-200"
                    : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                }`}
              >
                {prog.urgency}
              </span>
            </div>

            <p className="text-xs text-slate-600">
              <span className="font-semibold text-slate-700">Target Audience: </span>
              {prog.targetAudience}
            </p>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Completion Progress:</span>
                <span className="font-bold text-slate-900">
                  {prog.completedCount} / {prog.totalEnrolled} staff ({prog.complianceRate}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    prog.complianceRate >= 90 ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                  style={{ width: `${prog.complianceRate}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              <span>Recertification: {prog.frequency}</span>
              <span>Next Hospital Audit: {prog.nextDueDate}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Panel 3: Upcoming Sessions ───────────────────────────────── */
function UpcomingSessionsPanel({
  sessions,
  onRegister,
}: {
  sessions: ScheduledTrainingSession[];
  onRegister: (id: string) => void;
}) {
  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Scheduled Training Sessions</h2>
          <p className="text-xs text-slate-500">
            Instructor-led simulation classes, practical megacodes, and continuing education seminars.
          </p>
        </div>
        <button
          type="button"
          onClick={() => alert("Create new session modal (prototype demo).")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer transition-colors"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          <span>Add Session</span>
        </button>
      </div>

      <div className="space-y-3">
        {sessions.map((s) => (
          <div
            key={s.id}
            className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-4"
          >
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">{s.programTitle}</span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    s.status === "Open"
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {s.status}
                </span>
              </div>
              <p className="text-xs text-slate-600">Instructor: {s.instructor}</p>
              <div className="flex items-center gap-4 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {s.date} · {s.time}
                </span>
                <span>Location: {s.location}</span>
                <span>
                  Enrolled: {s.registeredCount}/{s.capacity}
                </span>
              </div>
            </div>

            <button
              onClick={() => onRegister(s.id)}
              disabled={s.registeredCount >= s.capacity}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer ${
                s.registeredCount < s.capacity
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
            >
              {s.registeredCount < s.capacity ? "Register Staff" : "Session Full"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Panel 4: Completion Rates ────────────────────────────────── */
function CompletionRatesPanel({ unitBreakdown }: { unitBreakdown: UnitCompletionBreakdown[] }) {
  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <h2 className="text-sm font-bold text-slate-900">Unit-Level Training Completion Summary</h2>
        <p className="text-xs text-slate-500">
          Departmental compliance matrix identifying units requiring targeted training follow-ups.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200/80">
              <tr>
                <th className="py-3 px-4">Hospital Unit</th>
                <th className="py-3 px-4">Total Staff</th>
                <th className="py-3 px-4">Compliant</th>
                <th className="py-3 px-4">Pending</th>
                <th className="py-3 px-4">Overdue</th>
                <th className="py-3 px-4">Compliance Rate</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {unitBreakdown.map((u) => (
                <tr key={u.unit} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{u.unit}</td>
                  <td className="py-3.5 px-4 text-slate-600">{u.staffCount}</td>
                  <td className="py-3.5 px-4 text-emerald-700 font-medium">{u.completedStaff}</td>
                  <td className="py-3.5 px-4 text-slate-500">{u.pendingStaff}</td>
                  <td className="py-3.5 px-4 text-rose-600 font-medium">{u.overdueStaff}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{u.complianceRate}%</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${
                        u.complianceRate >= 90
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {u.complianceRate >= 90 ? "Accredited" : "Review Due"}
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

/* ── Panel 5: Training History ────────────────────────────────── */
function TrainingHistoryPanel({ history }: { history: EmployeeTrainingRecord[] }) {
  const [search, setSearch] = useState("");

  const filteredHistory = useMemo(() => {
    return history.filter(
      (h) =>
        h.nurseName.toLowerCase().includes(search.toLowerCase()) ||
        h.department.toLowerCase().includes(search.toLowerCase()) ||
        h.programTitle.toLowerCase().includes(search.toLowerCase())
    );
  }, [history, search]);

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2 flex-1 min-w-0 w-full sm:min-w-[240px]">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search employee training records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs text-slate-800 placeholder-slate-400 bg-transparent border-none outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200/80">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Training Program</th>
                <th className="py-3 px-4">Completed Date</th>
                <th className="py-3 px-4">Valid Until</th>
                <th className="py-3 px-4">Result</th>
                <th className="py-3 px-4">Provider</th>
                <th className="py-3 px-4">Certificate ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistory.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{h.nurseName}</td>
                  <td className="py-3.5 px-4 text-slate-600">{h.department}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">{h.programTitle}</td>
                  <td className="py-3.5 px-4 text-slate-600">{h.completedDate}</td>
                  <td className="py-3.5 px-4 text-slate-600">{h.expiryDate}</td>
                  <td className="py-3.5 px-4 text-emerald-700 font-semibold">{h.scoreOrStatus}</td>
                  <td className="py-3.5 px-4 text-slate-500">{h.provider}</td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">{h.certificateId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
