import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { EmployeeGrowthNav } from "@/components/EmployeeGrowthNav";
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Calendar,
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
  ExternalLink,
} from "lucide-react";
import { DEPARTMENTS, Department } from "@/lib/departments";

/* ── Route Definition ─────────────────────────────────────────── */
export const Route = createFileRoute("/_authenticated/education")({
  validateSearch: (search: Record<string, unknown>): { tab?: string } => ({
    tab: typeof search.tab === "string" ? search.tab : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Education · Employee Growth · NOS" },
      {
        name: "description",
        content:
          "Academic nursing programs, clinical fellowships, accredited courses, learning plans, and continuing nursing education (CNE) credits.",
      },
    ],
  }),
  component: EducationPage,
});

/* ── Secondary Tabs ───────────────────────────────────────────── */
type TabId = "overview" | "courses" | "plans" | "progress" | "history";

interface TabDef {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const TABS: TabDef[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "courses", label: "Courses", icon: BookOpen, badge: 6 },
  { id: "plans", label: "Learning Plans", icon: Award, badge: 4 },
  { id: "progress", label: "Academic Progress", icon: GraduationCap, badge: 8 },
  { id: "history", label: "Education History", icon: Clock },
];

/* ── Types & Demo Dataset ─────────────────────────────────────── */
export interface AcademicCourse {
  id: string;
  title: string;
  code: string;
  institution: string;
  cneCredits: number;
  durationWeeks: number;
  specialty: "Critical Care" | "Emergency & Trauma" | "Pediatrics & Neonatal" | "Nursing Leadership" | "Pharmacology";
  level: "Post-Graduate Diploma" | "Specialty Certificate" | "Fellowship Module";
  enrolledCount: number;
  deliveryMode: "Hybrid (Virtual + Simulation)" | "On-Campus" | "Self-Paced Online";
  description: string;
}

export interface SpecialtyLearningPlan {
  id: string;
  title: string;
  specialtyTrack: string;
  targetRole: string;
  totalModules: number;
  estimatedMonths: number;
  prerequisites: string[];
  enrolledNurses: number;
  description: string;
}

export interface NurseAcademicProgress {
  id: string;
  nurseName: string;
  role: string;
  department: string;
  planOrCourse: string;
  institution: string;
  progressPercent: number;
  completedCredits: number;
  totalCredits: number;
  academicStatus: "In Progress" | "Practicum Phase" | "Completed" | "Pending Review";
  advisor: string;
  expectedCompletion: string;
}

export interface EducationHistoryRecord {
  id: string;
  nurseName: string;
  qualification: string;
  institution: string;
  yearGraduated: number;
  cnePointsEarned: number;
  verifiedBy: string;
  verificationStatus: "Verified" | "Primary Source Verified (PSV)";
}

const DEMO_COURSES: AcademicCourse[] = [
  {
    id: "CRS-101",
    title: "Advanced Hemodynamic Monitoring & Shock Management",
    code: "ICU-702",
    institution: "University School of Nursing & NOS Health Academy",
    cneCredits: 24,
    durationWeeks: 8,
    specialty: "Critical Care",
    level: "Post-Graduate Diploma",
    enrolledCount: 16,
    deliveryMode: "Hybrid (Virtual + Simulation)",
    description: "In-depth pathophysiology of circulatory failure, invasive arterial line monitoring, and inotrope titration.",
  },
  {
    id: "CRS-102",
    title: "Emergency Trauma Nursing Practicum & Resuscitation",
    code: "EM-605",
    institution: "National Trauma Institute",
    cneCredits: 30,
    durationWeeks: 12,
    specialty: "Emergency & Trauma",
    level: "Specialty Certificate",
    enrolledCount: 12,
    deliveryMode: "Hybrid (Virtual + Simulation)",
    description: "Advanced triage, mass casualty management, procedural sedation, and rapid thoracic decompression support.",
  },
  {
    id: "CRS-103",
    title: "Neonatal Resuscitation & High-Dependency Care",
    code: "PED-501",
    institution: "Children's Health Academic Consortium",
    cneCredits: 20,
    durationWeeks: 6,
    specialty: "Pediatrics & Neonatal",
    level: "Specialty Certificate",
    enrolledCount: 9,
    deliveryMode: "On-Campus",
    description: "Comprehensive NRP guidelines, non-invasive ventilation for neonates, and therapeutic hypothermia.",
  },
  {
    id: "CRS-104",
    title: "Clinical Nurse Preceptorship & Mentorship Leadership",
    code: "LDR-401",
    institution: "Healthcare Leadership Institute",
    cneCredits: 15,
    durationWeeks: 4,
    specialty: "Nursing Leadership",
    level: "Fellowship Module",
    enrolledCount: 22,
    deliveryMode: "Self-Paced Online",
    description: "Adult learning theories, objective clinical evaluation, constructivist feedback, and preceptor governance.",
  },
  {
    id: "CRS-105",
    title: "Advanced Pharmacotherapy & High-Alert Medication Safety",
    code: "PHM-504",
    institution: "Clinical Pharmacy & Therapeutics College",
    cneCredits: 18,
    durationWeeks: 6,
    specialty: "Pharmacology",
    level: "Specialty Certificate",
    enrolledCount: 14,
    deliveryMode: "Self-Paced Online",
    description: "Pharmacokinetics in organ failure, antimicrobial stewardship, and oncology vesicant safety.",
  },
  {
    id: "CRS-106",
    title: "Evidence-Based Nursing Practice & Clinical Inquiry",
    code: "RES-601",
    institution: "University Centre for Health Research",
    cneCredits: 20,
    durationWeeks: 8,
    specialty: "Nursing Leadership",
    level: "Post-Graduate Diploma",
    enrolledCount: 11,
    deliveryMode: "Hybrid (Virtual + Simulation)",
    description: "Systematic literature appraisal, clinical audit design, and bedside translation of clinical guidelines.",
  },
];

const DEMO_LEARNING_PLANS: SpecialtyLearningPlan[] = [
  {
    id: "LP-01",
    title: "Critical Care Nurse Specialist Pathway",
    specialtyTrack: "Intensive Care & High Dependency",
    targetRole: "Staff Nurse (RN) → Senior Staff Nurse (SN)",
    totalModules: 5,
    estimatedMonths: 12,
    prerequisites: ["2 Years Inpatient Experience", "BLS & ACLS Current", "Preceptor Endorsement"],
    enrolledNurses: 8,
    description: "Structured fellowship combining advanced hemodynamics, mechanical ventilation, CRRT, and clinical simulation rotations.",
  },
  {
    id: "LP-02",
    title: "Emergency & Disaster Nursing Fellowship",
    specialtyTrack: "Emergency Department",
    targetRole: "Staff Nurse (RN) → Emergency Nurse Specialist",
    totalModules: 4,
    estimatedMonths: 9,
    prerequisites: ["1 Year Acute Experience", "PALS & ACLS Current"],
    enrolledNurses: 6,
    description: "Specialized clinical pathway covering adult/pediatric trauma, acute toxidromes, and disaster triage management.",
  },
  {
    id: "LP-03",
    title: "Clinical Nurse Educator Foundation Track",
    specialtyTrack: "Academic & Clinical Education",
    targetRole: "Senior Staff Nurse (SN) → Nurse Educator",
    totalModules: 4,
    estimatedMonths: 8,
    prerequisites: ["4 Years Clinical Experience", "Preceptor Certification"],
    enrolledNurses: 5,
    description: "Curriculum development, OSCE design, simulation scenario writing, and clinical competency governance.",
  },
  {
    id: "LP-04",
    title: "Cardiac Care & Telemetry Specialist",
    specialtyTrack: "Cardiology & Interventional Ward",
    targetRole: "Staff Nurse (RN) → Cardiac Care Lead",
    totalModules: 3,
    estimatedMonths: 6,
    prerequisites: ["1 Year Med-Surg Experience", "ECG Rhythm Interpretation"],
    enrolledNurses: 7,
    description: "Electrophysiology, 12-lead ECG analysis, post-PCI management, and temporary pacemaker troubleshooting.",
  },
];

const DEMO_ACADEMIC_PROGRESS: NurseAcademicProgress[] = [
  {
    id: "PRG-01",
    nurseName: "Elena Rostova",
    role: "Senior Staff Nurse (SN)",
    department: "Intensive Care Unit (ICU)",
    planOrCourse: "Critical Care Nurse Specialist Pathway",
    institution: "University School of Nursing & NOS Health Academy",
    progressPercent: 85,
    completedCredits: 20,
    totalCredits: 24,
    academicStatus: "Practicum Phase",
    advisor: "Prof. H. Sterling (Academic Lead)",
    expectedCompletion: "Nov 2026",
  },
  {
    id: "PRG-02",
    nurseName: "Marcus Vance",
    role: "Staff Nurse (RN)",
    department: "Medical Ward",
    planOrCourse: "Cardiac Care & Telemetry Specialist",
    institution: "Clinical Pharmacy & Therapeutics College",
    progressPercent: 60,
    completedCredits: 11,
    totalCredits: 18,
    academicStatus: "In Progress",
    advisor: "Nurse Educator P. Vance",
    expectedCompletion: "Jan 2027",
  },
  {
    id: "PRG-03",
    nurseName: "Amina Al-Mansoor",
    role: "Senior Staff Nurse (SN)",
    department: "Emergency Department (ED)",
    planOrCourse: "Emergency & Disaster Nursing Fellowship",
    institution: "National Trauma Institute",
    progressPercent: 90,
    completedCredits: 27,
    totalCredits: 30,
    academicStatus: "Practicum Phase",
    advisor: "Trauma Coordinator M. Blake",
    expectedCompletion: "Dec 2026",
  },
  {
    id: "PRG-04",
    nurseName: "Carlos Reyes",
    role: "Staff Nurse (RN)",
    department: "Surgical Ward",
    planOrCourse: "Advanced Pharmacotherapy & High-Alert Medication Safety",
    institution: "Clinical Pharmacy & Therapeutics College",
    progressPercent: 100,
    completedCredits: 18,
    totalCredits: 18,
    academicStatus: "Completed",
    advisor: "Dr. K. Evans (PharmD)",
    expectedCompletion: "Completed Oct 2026",
  },
];

const DEMO_EDUCATION_HISTORY: EducationHistoryRecord[] = [
  {
    id: "ED-HIST-01",
    nurseName: "Elena Rostova",
    qualification: "Bachelor of Science in Nursing (BSN)",
    institution: "King's College London / National Nursing Board",
    yearGraduated: 2019,
    cnePointsEarned: 84,
    verifiedBy: "Hospital Credentialing Office",
    verificationStatus: "Primary Source Verified (PSV)",
  },
  {
    id: "ED-HIST-02",
    nurseName: "Marcus Vance",
    qualification: "Bachelor of Science in Nursing (BSN)",
    institution: "State University Faculty of Health Sciences",
    yearGraduated: 2022,
    cnePointsEarned: 48,
    verifiedBy: "Hospital Credentialing Office",
    verificationStatus: "Primary Source Verified (PSV)",
  },
  {
    id: "ED-HIST-03",
    nurseName: "Amina Al-Mansoor",
    qualification: "Bachelor of Science in Nursing (BSN)",
    institution: "International Medical University",
    yearGraduated: 2020,
    cnePointsEarned: 76,
    verifiedBy: "Hospital Credentialing Office",
    verificationStatus: "Primary Source Verified (PSV)",
  },
  {
    id: "ED-HIST-04",
    nurseName: "Carlos Reyes",
    qualification: "Diploma in General Nursing & Midwifery",
    institution: "College of Nursing & Allied Health",
    yearGraduated: 2023,
    cnePointsEarned: 35,
    verifiedBy: "Hospital Credentialing Office",
    verificationStatus: "Primary Source Verified (PSV)",
  },
];

/* ── Main Component ───────────────────────────────────────────── */
export default function EducationPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();

  const activeTab: TabId = (
    TABS.some((t) => t.id === search.tab) ? search.tab : "overview"
  ) as TabId;

  const setActiveTab = (tab: TabId) => {
    navigate({
      to: "/education",
      search: { tab },
    });
  };

  const [courses] = useState<AcademicCourse[]>(DEMO_COURSES);
  const [plans] = useState<SpecialtyLearningPlan[]>(DEMO_LEARNING_PLANS);
  const [progress, setProgress] = useState<NurseAcademicProgress[]>(DEMO_ACADEMIC_PROGRESS);
  const [history] = useState<EducationHistoryRecord[]>(DEMO_EDUCATION_HISTORY);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleEnrollCourse = (title: string) => {
    showToast(`Enrollment request submitted for course: ${title}.`);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 font-sans bg-[#F8FAFC] text-slate-900">
      {/* ── Level 2: Primary Employee Growth Navigation ────────── */}
      <div className="w-full min-w-0 px-4 sm:px-6 pt-3 pb-1 bg-white border-b border-slate-200 shrink-0">
        <EmployeeGrowthNav activeTab="education" />
      </div>

      {/* ── Module Header & Level 3: Secondary Tabs ───────────── */}
      <header className="px-5 pt-4 pb-3 bg-white border-b border-slate-200/80 shrink-0 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.14em] text-blue-600">
              <GraduationCap className="h-3.5 w-3.5" />
              <span>Employee Growth · Clinical Education & Academic Programs</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-0.5">
              Education & Academic Development
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Accredited specialty courses, post-graduate pathways, continuing nursing education (CNE) units, and university partnerships.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-md border border-blue-200 bg-blue-50 text-blue-700">
              Accredited CNE Provider
            </span>
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-md border border-slate-200 bg-slate-100 text-slate-600">
              Demo Dataset
            </span>
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-md border border-slate-200 bg-slate-50 text-slate-600">
              Primary Source Verified
            </span>
          </div>
        </div>

        {/* Level 3 Secondary Horizontal Tab Bar */}
        <nav
          className="flex gap-1 overflow-x-auto pt-2 scrollbar-none"
          aria-label="Education Secondary Tabs"
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
            courses={courses}
            plans={plans}
            progress={progress}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === "courses" && (
          <CoursesPanel courses={courses} onEnroll={handleEnrollCourse} />
        )}

        {activeTab === "plans" && <LearningPlansPanel plans={plans} />}

        {activeTab === "progress" && <AcademicProgressPanel progress={progress} />}

        {activeTab === "history" && <EducationHistoryPanel history={history} />}
      </main>
    </div>
  );
}

/* ── Panel 1: Overview ────────────────────────────────────────── */
function OverviewPanel({
  courses,
  plans,
  progress,
  onNavigateTab,
}: {
  courses: AcademicCourse[];
  plans: SpecialtyLearningPlan[];
  progress: NurseAcademicProgress[];
  onNavigateTab: (tab: TabId) => void;
}) {
  const activeScholars = progress.filter((p) => p.academicStatus !== "Completed").length;
  const totalCneEarned = 243;

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Scholars</span>
            <GraduationCap className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{activeScholars} Nurses</div>
          <p className="text-[11px] text-blue-700 mt-1 font-medium">In post-graduate & fellowship tracks</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Accredited Courses</span>
            <BookOpen className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{courses.length} Active</div>
          <p className="text-[11px] text-slate-500 mt-1">Across 5 clinical specialties</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Learning Plans</span>
            <Award className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{plans.length} Tracks</div>
          <p className="text-[11px] text-emerald-600 mt-1 font-medium">Structured specialty pathways</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">CNE Credits Earned</span>
            <ShieldCheck className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalCneEarned} Hours</div>
          <p className="text-[11px] text-purple-700 mt-1 font-medium">Current academic cycle</p>
        </div>
      </div>

      {/* Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Featured Courses */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Accredited Academic Courses</h2>
              <p className="text-xs text-slate-500">Post-graduate specialty programs with university credits</p>
            </div>
            <button
              onClick={() => onNavigateTab("courses")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>View all</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {courses.slice(0, 3).map((c) => (
              <div
                key={c.id}
                className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/70 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 truncate">{c.title}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    {c.cneCredits} CNE
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">{c.institution}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{c.level} · {c.durationWeeks} Weeks</span>
                  <span>{c.enrolledCount} enrolled</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Academic Progress Summary */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Scholar Milestone Progress</h2>
              <p className="text-xs text-slate-500">Nurses active in specialty academic tracks</p>
            </div>
            <button
              onClick={() => onNavigateTab("progress")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>View progress</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {progress.map((p) => (
              <div
                key={p.id}
                className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/70 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900">{p.nurseName}</span>
                    <span className="text-[11px] text-slate-500 ml-1.5">({p.department})</span>
                  </div>
                  <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {p.progressPercent}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-700 truncate font-medium">{p.planOrCourse}</p>
                <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: `${p.progressPercent}%` }}
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

/* ── Panel 2: Courses ─────────────────────────────────────────── */
function CoursesPanel({
  courses,
  onEnroll,
}: {
  courses: AcademicCourse[];
  onEnroll: (title: string) => void;
}) {
  const [filter, setFilter] = useState("all");

  const filteredCourses = useMemo(() => {
    if (filter === "all") return courses;
    return courses.filter((c) => c.specialty === filter);
  }, [courses, filter]);

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Accredited Clinical Courses</h2>
          <p className="text-xs text-slate-500">
            University-affiliated modules and post-graduate clinical diplomas.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-slate-500 font-medium">Specialty:</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-md px-2 py-1 outline-none"
          >
            <option value="all">All Specialties</option>
            <option value="Critical Care">Critical Care</option>
            <option value="Emergency & Trauma">Emergency & Trauma</option>
            <option value="Pediatrics & Neonatal">Pediatrics & Neonatal</option>
            <option value="Nursing Leadership">Nursing Leadership</option>
            <option value="Pharmacology">Pharmacology</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCourses.map((c) => (
          <div
            key={c.id}
            className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 font-mono">
                    {c.code} · {c.specialty}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-0.5">{c.title}</h3>
                </div>
                <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                  {c.cneCredits} CNE Credits
                </span>
              </div>

              <p className="text-xs text-slate-500">{c.institution}</p>
              <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                {c.description}
              </p>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>{c.level} · {c.durationWeeks} Weeks</span>
                <span>Format: {c.deliveryMode}</span>
              </div>

              <button
                onClick={() => onEnroll(c.title)}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer transition-colors"
              >
                Apply for Course
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Panel 3: Learning Plans ──────────────────────────────────── */
function LearningPlansPanel({ plans }: { plans: SpecialtyLearningPlan[] }) {
  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <h2 className="text-sm font-bold text-slate-900">Structured Specialty Learning Plans</h2>
        <p className="text-xs text-slate-500">
          Multi-phase clinical tracks designed to prepare registered nurses for advanced specialist practice.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.map((lp) => (
          <div
            key={lp.id}
            className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {lp.specialtyTrack}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">{lp.title}</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                {lp.estimatedMonths} Months
              </span>
            </div>

            <p className="text-xs text-slate-600">{lp.description}</p>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1 text-xs">
              <span className="font-semibold text-slate-700">Career Progression Target: </span>
              <span className="text-blue-700 font-medium">{lp.targetRole}</span>
              <div className="text-[11px] text-slate-500 pt-1">
                Prerequisites: {lp.prerequisites.join(" · ")}
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              <span>{lp.totalModules} Core Academic Modules</span>
              <span className="font-semibold text-slate-700">{lp.enrolledNurses} Nurses Enrolled</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Panel 4: Academic Progress ───────────────────────────────── */
function AcademicProgressPanel({ progress }: { progress: NurseAcademicProgress[] }) {
  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <h2 className="text-sm font-bold text-slate-900">Nurse Academic & Fellowship Milestones</h2>
        <p className="text-xs text-slate-500">
          Tracking credit completion, academic advisory reviews, and practicum progress.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200/80">
              <tr>
                <th className="py-3 px-4">Nurse</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Academic Program</th>
                <th className="py-3 px-4">Credits</th>
                <th className="py-3 px-4">Progress</th>
                <th className="py-3 px-4">Academic Status</th>
                <th className="py-3 px-4">Faculty Advisor</th>
                <th className="py-3 px-4">Expected End</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {progress.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{p.nurseName}</td>
                  <td className="py-3.5 px-4 text-slate-600">{p.department}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">{p.planOrCourse}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-700">
                    {p.completedCredits} / {p.totalCredits}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-600"
                          style={{ width: `${p.progressPercent}%` }}
                        />
                      </div>
                      <span className="font-bold text-slate-700">{p.progressPercent}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${
                        p.academicStatus === "Completed"
                          ? "bg-emerald-100 text-emerald-800"
                          : p.academicStatus === "Practicum Phase"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {p.academicStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{p.advisor}</td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">{p.expectedCompletion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Panel 5: Education History ───────────────────────────────── */
function EducationHistoryPanel({ history }: { history: EducationHistoryRecord[] }) {
  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <h2 className="text-sm font-bold text-slate-900">Academic Degrees & Primary Source Verification</h2>
        <p className="text-xs text-slate-500">
          Official academic records verified for hospital credentialing and clinical privileging.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200/80">
              <tr>
                <th className="py-3 px-4">Nurse</th>
                <th className="py-3 px-4">Degree / Qualification</th>
                <th className="py-3 px-4">Awarding Institution</th>
                <th className="py-3 px-4">Graduation Year</th>
                <th className="py-3 px-4">CNE Points Earned</th>
                <th className="py-3 px-4">Verified By</th>
                <th className="py-3 px-4">Verification Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{h.nurseName}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">{h.qualification}</td>
                  <td className="py-3.5 px-4 text-slate-600">{h.institution}</td>
                  <td className="py-3.5 px-4 text-slate-600">{h.yearGraduated}</td>
                  <td className="py-3.5 px-4 font-bold text-blue-700">{h.cnePointsEarned} pts</td>
                  <td className="py-3.5 px-4 text-slate-500">{h.verifiedBy}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <ShieldCheck className="h-3 w-3" />
                      {h.verificationStatus}
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
