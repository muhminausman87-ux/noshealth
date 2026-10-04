import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { WorkforceNav } from "@/components/WorkforceNav";
import {
  Repeat,
  LayoutDashboard,
  CalendarDays,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  ShieldCheck,
  Search,
  PlusCircle,
  FileText,
  Info,
  BarChart3,
} from "lucide-react";
import { DEPARTMENTS, Department, getDept } from "@/lib/departments";

/* ── Route Definition ─────────────────────────────────────────── */
export const Route = createFileRoute("/_authenticated/leave-management")({
  validateSearch: (search: Record<string, unknown>): { tab?: string } => ({
    tab: typeof search.tab === "string" ? search.tab : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Leave Management · Workforce Operations · NOS" },
      {
        name: "description",
        content:
          "Manage workforce availability, leave calendar, manager approvals workflow, and pre-approval coverage impact analysis.",
      },
    ],
  }),
  component: LeaveManagementPage,
});

/* ── Secondary Tabs ───────────────────────────────────────────── */
type TabId = "overview" | "calendar" | "requests" | "approvals" | "coverage" | "patterns";

interface TabDef {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const TABS: TabDef[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "calendar", label: "Leave Calendar", icon: CalendarDays },
  { id: "requests", label: "Requests", icon: FileText, badge: 12 },
  { id: "approvals", label: "Approvals", icon: CheckCircle2, badge: 5 },
  { id: "coverage", label: "Coverage Impact", icon: AlertTriangle },
  { id: "patterns", label: "Leave Patterns", icon: BarChart3 },
];

/* ── Types & Demo Dataset ─────────────────────────────────────── */
export type LeaveType = "Annual" | "Sick" | "Study / CPD" | "Casual" | "Maternity / Parental" | "Compassionate";

export interface LeaveRequestItem {
  id: string;
  employeeName: string;
  employeeGrade: "RN" | "SN" | "EN" | "CN";
  deptId: Department;
  unitName: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  hoursImpact: number;
  submittedDate: string;
  status: "Submitted" | "Under Review" | "Approved" | "Declined";
  reasonNote: string;
  reviewedBy?: string;
  reviewNotes?: string;
  competencies: string[];
}

export interface OverlappingAbsenceAlert {
  id: string;
  deptId: Department;
  unitName: string;
  dateRange: string;
  overlappingCount: number;
  totalScheduledNurses: number;
  skillMixConcern: string;
  severity: "Critical" | "Warning" | "Moderate";
}

const INITIAL_LEAVE_REQUESTS: LeaveRequestItem[] = [
  {
    id: "LV-101",
    employeeName: "Elena Rostova",
    employeeGrade: "SN",
    deptId: "icu",
    unitName: "Intensive Care Unit (ICU)",
    leaveType: "Annual",
    startDate: "2026-10-12",
    endDate: "2026-10-16",
    totalDays: 5,
    hoursImpact: 40,
    submittedDate: "2026-09-28",
    status: "Under Review",
    reasonNote: "Scheduled family annual leave.",
    competencies: ["ICU Certified", "ACLS", "Ventilator Care"],
  },
  {
    id: "LV-102",
    employeeName: "Marcus Vance",
    employeeGrade: "RN",
    deptId: "medical",
    unitName: "Medical Ward",
    leaveType: "Study / CPD",
    startDate: "2026-10-15",
    endDate: "2026-10-16",
    totalDays: 2,
    hoursImpact: 16,
    submittedDate: "2026-10-01",
    status: "Submitted",
    reasonNote: "Attending Advanced ECG & Cardiac Rhythm Recognition course.",
    competencies: ["ACLS", "Wound Care", "Telemetry"],
  },
  {
    id: "LV-103",
    employeeName: "Sarah Jenkins",
    employeeGrade: "CN",
    deptId: "icu",
    unitName: "Intensive Care Unit (ICU)",
    leaveType: "Annual",
    startDate: "2026-10-14",
    endDate: "2026-10-18",
    totalDays: 5,
    hoursImpact: 40,
    submittedDate: "2026-09-25",
    status: "Under Review",
    reasonNote: "Annual leave approved in preliminary schedule.",
    competencies: ["ICU Certified", "Charge Nurse", "CRRT"],
  },
  {
    id: "LV-104",
    employeeName: "Tariq Mansoor",
    employeeGrade: "RN",
    deptId: "ed",
    unitName: "Emergency Department (ED)",
    leaveType: "Casual",
    startDate: "2026-10-08",
    endDate: "2026-10-09",
    totalDays: 2,
    hoursImpact: 16,
    submittedDate: "2026-10-02",
    status: "Submitted",
    reasonNote: "Urgent domestic personal appointment.",
    competencies: ["ED Triage", "Trauma", "ACLS"],
  },
  {
    id: "LV-105",
    employeeName: "Kofi Mensah",
    employeeGrade: "SN",
    deptId: "icu",
    unitName: "Intensive Care Unit (ICU)",
    leaveType: "Study / CPD",
    startDate: "2026-10-15",
    endDate: "2026-10-15",
    totalDays: 1,
    hoursImpact: 8,
    submittedDate: "2026-09-30",
    status: "Under Review",
    reasonNote: "Hospital clinical audit presentation and preceptor training.",
    competencies: ["ICU Certified", "ACLS", "CRRT"],
  },
  {
    id: "LV-106",
    employeeName: "Priya Sharma",
    employeeGrade: "RN",
    deptId: "pediatric",
    unitName: "Pediatric Ward",
    leaveType: "Annual",
    startDate: "2026-10-20",
    endDate: "2026-10-25",
    totalDays: 6,
    hoursImpact: 48,
    submittedDate: "2026-09-20",
    status: "Approved",
    reasonNote: "Annual vacation planned in advance.",
    reviewedBy: "Nurse Manager M. Rossi",
    reviewNotes: "Coverage secured via internal shift balance.",
    competencies: ["PALS", "Neonatal Basics"],
  },
  {
    id: "LV-107",
    employeeName: "Carlos Reyes",
    employeeGrade: "RN",
    deptId: "medsurg",
    unitName: "Medical-Surg Floor",
    leaveType: "Annual",
    startDate: "2026-10-22",
    endDate: "2026-10-28",
    totalDays: 7,
    hoursImpact: 56,
    submittedDate: "2026-09-18",
    status: "Approved",
    reasonNote: "Annual family holiday.",
    reviewedBy: "Nurse Manager C. Watson",
    competencies: ["Med-Surg", "Orthopedics"],
  },
  {
    id: "LV-108",
    employeeName: "Hannah Lindqvist",
    employeeGrade: "RN",
    deptId: "maternity",
    unitName: "Maternity Ward",
    leaveType: "Maternity / Parental",
    startDate: "2026-11-01",
    endDate: "2027-02-01",
    totalDays: 92,
    hoursImpact: 520,
    submittedDate: "2026-08-15",
    status: "Approved",
    reasonNote: "Statutory maternity leave.",
    reviewedBy: "Director of Nursing",
    reviewNotes: "Long-term fixed float backfill requested.",
    competencies: ["Midwifery", "NRP"],
  },
  {
    id: "LV-109",
    employeeName: "David Chen",
    employeeGrade: "EN",
    deptId: "surgical",
    unitName: "Surgical Ward",
    leaveType: "Sick",
    startDate: "2026-10-03",
    endDate: "2026-10-04",
    totalDays: 2,
    hoursImpact: 16,
    submittedDate: "2026-10-03",
    status: "Approved",
    reasonNote: "Acute medical illness.",
    reviewedBy: "Charge Nurse V. Larson",
    reviewNotes: "Medical certificate provided.",
    competencies: ["Post-Op Recovery"],
  },
  {
    id: "LV-110",
    employeeName: "Sophie Dubois",
    employeeGrade: "CN",
    deptId: "cardiac",
    unitName: "Cardiac Ward",
    leaveType: "Study / CPD",
    startDate: "2026-10-09",
    endDate: "2026-10-10",
    totalDays: 2,
    hoursImpact: 16,
    submittedDate: "2026-09-29",
    status: "Approved",
    reasonNote: "Advanced telemetry symposium.",
    reviewedBy: "Nurse Manager L. Moreau",
    competencies: ["Cardiac Step-Down", "Telemetry", "ACLS"],
  },
  {
    id: "LV-111",
    employeeName: "Liam O'Connor",
    employeeGrade: "RN",
    deptId: "ot",
    unitName: "Operation Theatre",
    leaveType: "Annual",
    startDate: "2026-10-05",
    endDate: "2026-10-07",
    totalDays: 3,
    hoursImpact: 24,
    submittedDate: "2026-10-01",
    status: "Declined",
    reasonNote: "Short notice leave during major joint replacement list.",
    reviewedBy: "OT Theatre Lead",
    reviewNotes: "Elective major joint replacement list requires all scrub-trained RNs. Rescheduling requested.",
    competencies: ["PACU Recovery", "ACLS"],
  },
  {
    id: "LV-112",
    employeeName: "Fatima Zahra",
    employeeGrade: "SN",
    deptId: "ed",
    unitName: "Emergency Department (ED)",
    leaveType: "Compassionate",
    startDate: "2026-10-04",
    endDate: "2026-10-06",
    totalDays: 3,
    hoursImpact: 24,
    submittedDate: "2026-10-03",
    status: "Approved",
    reasonNote: "Family emergency.",
    reviewedBy: "ED Lead Nurse T. Bennett",
    reviewNotes: "Compassionate leave approved per hospital policy.",
    competencies: ["ED Triage", "Trauma", "ACLS"],
  },
];

const OVERLAPPING_ALERTS: OverlappingAbsenceAlert[] = [
  {
    id: "OVL-01",
    deptId: "icu",
    unitName: "Intensive Care Unit (ICU)",
    dateRange: "2026-10-14 to 2026-10-16",
    overlappingCount: 3,
    totalScheduledNurses: 10,
    skillMixConcern: "Overlapping leave for 2 Senior ICU RNs + 1 Charge Nurse reduces ventilator-competent staff to 4 (baseline required is 6).",
    severity: "Critical",
  },
  {
    id: "OVL-02",
    deptId: "ed",
    unitName: "Emergency Department (ED)",
    dateRange: "2026-10-08 to 2026-10-09",
    overlappingCount: 2,
    totalScheduledNurses: 14,
    skillMixConcern: "2 Triage certified nurses on casual/compassionate leave during expected Friday evening surge.",
    severity: "Warning",
  },
  {
    id: "OVL-03",
    deptId: "medsurg",
    unitName: "Medical-Surg Floor",
    dateRange: "2026-10-22 to 2026-10-25",
    overlappingCount: 3,
    totalScheduledNurses: 16,
    skillMixConcern: "Multiple overlapping annual leaves during peak autumn intake. Float pool buffer recommended.",
    severity: "Moderate",
  },
];

/* ── Main Component ───────────────────────────────────────────── */
export default function LeaveManagementPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();

  const activeTab: TabId = (
    TABS.some((t) => t.id === search.tab) ? search.tab : "overview"
  ) as TabId;

  const setActiveTab = (tab: TabId) => {
    navigate({
      to: "/leave-management",
      search: { tab },
    });
  };

  const [requests, setRequests] = useState<LeaveRequestItem[]>(INITIAL_LEAVE_REQUESTS);
  const [approvalFeedback, setApprovalFeedback] = useState<string | null>(null);

  // Search & Filter state for Requests Tab
  const [requestSearch, setRequestSearch] = useState("");
  const [requestUnitFilter, setRequestUnitFilter] = useState("all");
  const [requestTypeFilter, setRequestTypeFilter] = useState("all");
  const [requestStatusFilter, setRequestStatusFilter] = useState("all");

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchesSearch =
        req.employeeName.toLowerCase().includes(requestSearch.toLowerCase()) ||
        req.unitName.toLowerCase().includes(requestSearch.toLowerCase()) ||
        req.reasonNote.toLowerCase().includes(requestSearch.toLowerCase());

      const matchesUnit = requestUnitFilter === "all" || req.deptId === requestUnitFilter;
      const matchesType = requestTypeFilter === "all" || req.leaveType === requestTypeFilter;
      const matchesStatus = requestStatusFilter === "all" || req.status === requestStatusFilter;

      return matchesSearch && matchesUnit && matchesType && matchesStatus;
    });
  }, [requests, requestSearch, requestUnitFilter, requestTypeFilter, requestStatusFilter]);

  // Manager Approval Actions
  const handleApprove = (id: string, note?: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "Approved",
              reviewedBy: "Authorized Nurse Manager (You)",
              reviewNotes: note || "Approved after coverage and skill-mix verification.",
            }
          : r
      )
    );
    setApprovalFeedback(`Leave request ${id} approved successfully.`);
    setTimeout(() => setApprovalFeedback(null), 5000);
  };

  const handleDecline = (id: string, reason: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "Declined",
              reviewedBy: "Authorized Nurse Manager (You)",
              reviewNotes: reason || "Declined due to critical staffing constraint.",
            }
          : r
      )
    );
    setApprovalFeedback(`Leave request ${id} declined with rationale recorded.`);
    setTimeout(() => setApprovalFeedback(null), 5000);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 font-sans bg-[#F8FAFC] text-slate-900">
      {/* ── Workforce Operations Subnav ────────────────────────── */}
      <div className="w-full min-w-0 px-4 sm:px-6 pt-3 pb-1 bg-white border-b border-slate-200 shrink-0">
        <WorkforceNav activeTab="leave" />
      </div>

      {/* ── Module Header ─────────────────────────────────────── */}
      <header className="px-5 pt-4 pb-3 bg-white border-b border-slate-200/80 shrink-0 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.14em] text-blue-600">
              <Repeat className="h-3.5 w-3.5" />
              <span>Workforce Operations · Leave Intelligence</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-0.5">
              Leave Management & Staffing Impact
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage workforce availability, review leave calendar, and understand unit coverage impact before human approval.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-md border border-blue-200 bg-blue-50 text-blue-700">
              Prototype · Decision Support
            </span>
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-md border border-slate-200 bg-slate-100 text-slate-600">
              Demo Dataset
            </span>
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-md border border-slate-200 bg-slate-50 text-slate-600">
              Human-Governed Decisions
            </span>
          </div>
        </div>

        {/* ── Secondary Horizontal Tab Bar (Syncs with ?tab=) ───── */}
        <nav
          className="flex gap-1 overflow-x-auto pt-2 scrollbar-none"
          aria-label="Leave Management Secondary Tabs"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const pendingCount = requests.filter(
              (r) => r.status === "Submitted" || r.status === "Under Review"
            ).length;

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
                {tab.id === "approvals" && pendingCount > 0 && (
                  <span className="ml-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800">
                    {pendingCount}
                  </span>
                )}
                {tab.id === "requests" && (
                  <span className="ml-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-200/70 text-slate-700">
                    {requests.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </header>

      {/* ── Toast Feedback Banner ─────────────────────────────── */}
      {approvalFeedback && (
        <div className="mx-5 mt-3 p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{approvalFeedback}</span>
          </div>
          <button
            onClick={() => setApprovalFeedback(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold px-2 py-0.5"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── Tab Content Panels ────────────────────────────────── */}
      <main className="flex-1 min-h-0 p-5 overflow-y-auto">
        {activeTab === "overview" && (
          <LeaveOverviewPanel
            requests={requests}
            overlappingAlerts={OVERLAPPING_ALERTS}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === "calendar" && <LeaveCalendarPanel requests={requests} />}

        {activeTab === "requests" && (
          <LeaveRequestsPanel
            requests={filteredRequests}
            search={requestSearch}
            setSearch={setRequestSearch}
            unitFilter={requestUnitFilter}
            setUnitFilter={setRequestUnitFilter}
            typeFilter={requestTypeFilter}
            setTypeFilter={setRequestTypeFilter}
            statusFilter={requestStatusFilter}
            setStatusFilter={setRequestStatusFilter}
            onCreateRequest={(newReq) => {
              setRequests((prev) => [newReq, ...prev]);
            }}
          />
        )}

        {activeTab === "approvals" && (
          <LeaveApprovalsPanel
            pendingRequests={requests.filter(
              (r) => r.status === "Submitted" || r.status === "Under Review"
            )}
            onApprove={handleApprove}
            onDecline={handleDecline}
          />
        )}

        {activeTab === "coverage" && (
          <CoverageImpactAnalyzer />
        )}

        {activeTab === "patterns" && <LeavePatternsPanel />}
      </main>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/* 1. LEAVE OVERVIEW PANEL                                         */
/* ─────────────────────────────────────────────────────────────── */
function LeaveOverviewPanel({
  requests,
  overlappingAlerts,
  onNavigateTab,
}: {
  requests: LeaveRequestItem[];
  overlappingAlerts: OverlappingAbsenceAlert[];
  onNavigateTab: (tab: TabId) => void;
}) {
  const pendingCount = requests.filter(
    (r) => r.status === "Submitted" || r.status === "Under Review"
  ).length;
  const approvedUpcomingCount = requests.filter((r) => r.status === "Approved").length;

  return (
    <div className="flex flex-col gap-5 max-w-[1400px] mx-auto">
      {/* ── KPI Row ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Pending Requests
            </span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{pendingCount}</span>
            <span className="text-xs text-amber-600 font-medium">Awaiting manager review</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Requires human operational approval
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Approved Upcoming Leave
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{approvedUpcomingCount}</span>
            <span className="text-xs text-emerald-600 font-medium">Roster integrated</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Across next 30 operational days
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Overlapping Absences
            </span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-600">{overlappingAlerts.length} Units</span>
            <span className="text-xs text-rose-600 font-medium">Coverage watch</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            ICU and ED flag multiple concurrent absences
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Upcoming High-Impact Dates
            </span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <CalendarDays className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">Oct 14 – 18</span>
            <span className="text-xs text-blue-600 font-medium">Autumn CPD window</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Peak study leave & national holiday crossover
          </p>
        </div>
      </div>

      {/* ── Two-Column Layout: Overlapping Absences & Pending Approvals ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Overlapping Absences Callouts */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-600" />
                Units with Multiple Overlapping Absences
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Identifies concurrent leaves that threaten minimum skill-mix or nurse-to-patient ratios.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab("coverage")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-200"
            >
              Analyze Coverage Impact →
            </button>
          </div>

          <div className="space-y-3">
            {overlappingAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3.5 rounded-xl border ${
                  alert.severity === "Critical"
                    ? "bg-rose-50/50 border-rose-200"
                    : alert.severity === "Warning"
                    ? "bg-amber-50/50 border-amber-200"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{alert.unitName}</span>
                    <span className="text-[11px] text-slate-500 font-medium">({alert.dateRange})</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      alert.severity === "Critical"
                        ? "bg-rose-100 text-rose-700"
                        : alert.severity === "Warning"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {alert.overlappingCount} Concurrent Absences
                  </span>
                </div>
                <p className="text-xs text-slate-700 mt-1.5 font-medium leading-relaxed">
                  {alert.skillMixConcern}
                </p>
                <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">
                    Scheduled Staff Baseline: <strong>{alert.totalScheduledNurses} RNs</strong>
                  </span>
                  <span className="text-blue-600 font-semibold">Float Pool Allocation Required</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Pending Approvals Widget */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                Requests Awaiting Decision
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                {pendingCount} Pending
              </span>
            </div>

            <div className="space-y-2.5">
              {requests
                .filter((r) => r.status === "Submitted" || r.status === "Under Review")
                .slice(0, 3)
                .map((req) => (
                  <div
                    key={req.id}
                    className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-slate-900">
                        {req.employeeName} ({req.employeeGrade})
                      </span>
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                        {req.leaveType}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      {req.unitName} · {req.startDate} to {req.endDate} ({req.totalDays}d)
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[10.5px]">
                      <span className="text-slate-400">Sub: {req.submittedDate}</span>
                      <button
                        onClick={() => onNavigateTab("approvals")}
                        className="font-semibold text-blue-600 hover:underline"
                      >
                        Review Impact →
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab("approvals")}
            className="mt-4 w-full py-2 text-center text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Open Approvals Workflow
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/* 2. LEAVE CALENDAR PANEL                                         */
/* ─────────────────────────────────────────────────────────────── */
function LeaveCalendarPanel({ requests }: { requests: LeaveRequestItem[] }) {
  const [selectedUnit, setSelectedUnit] = useState("all");

  const approvedLeaves = useMemo(() => {
    return requests.filter(
      (r) =>
        r.status === "Approved" &&
        (selectedUnit === "all" || r.deptId === selectedUnit)
    );
  }, [requests, selectedUnit]);

  // Calendar demo grid representation (October 2026)
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="flex flex-col gap-4 max-w-[1400px] mx-auto">
      {/* Calendar Filter & Header */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-blue-600" />
            October 2026 Workforce Availability Calendar
          </h2>
          <span className="text-[11px] text-slate-400 font-medium">| Month View</span>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="cal-dept" className="text-xs font-medium text-slate-600">
            Filter Unit:
          </label>
          <select
            id="cal-dept"
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none"
          >
            <option value="all">All Hospital Departments</option>
            {DEPARTMENTS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Calendar Matrix View */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4">
        <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-500 pb-2 border-b border-slate-200">
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div className="text-blue-600">Sat</div>
          <div className="text-blue-600">Sun</div>
        </div>

        <div className="grid grid-cols-7 gap-1.5 pt-2">
          {daysInMonth.map((day) => {
            const dateStr = `2026-10-${day.toString().padStart(2, "0")}`;
            const matchingLeaves = approvedLeaves.filter((l) => {
              return dateStr >= l.startDate && dateStr <= l.endDate;
            });

            const isToday = day === 3;
            const isHighImpact = day >= 14 && day <= 18;

            return (
              <div
                key={day}
                className={`min-h-[85px] p-2 rounded-lg border text-left flex flex-col justify-between transition-colors ${
                  isToday
                    ? "border-blue-500 bg-blue-50/40 ring-1 ring-blue-500"
                    : isHighImpact
                    ? "border-amber-200 bg-amber-50/30"
                    : "border-slate-100 bg-slate-50/40 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold ${
                      isToday ? "text-blue-700 font-extrabold" : "text-slate-700"
                    }`}
                  >
                    {day}
                  </span>
                  {matchingLeaves.length > 0 && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800">
                      {matchingLeaves.length} on leave
                    </span>
                  )}
                </div>

                <div className="mt-1 space-y-1">
                  {matchingLeaves.slice(0, 2).map((l) => (
                    <div
                      key={l.id}
                      className="text-[9.5px] font-medium px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-800 truncate shadow-2xs"
                      title={`${l.employeeName} (${l.leaveType})`}
                    >
                      {l.employeeName.split(" ")[0]} · {l.leaveType}
                    </div>
                  ))}
                  {matchingLeaves.length > 2 && (
                    <div className="text-[9px] font-semibold text-slate-400 pl-1">
                      +{matchingLeaves.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/* 3. LEAVE REQUESTS PANEL                                         */
/* ─────────────────────────────────────────────────────────────── */
function LeaveRequestsPanel({
  requests,
  search,
  setSearch,
  unitFilter,
  setUnitFilter,
  typeFilter,
  setTypeFilter,
  statusFilter,
  setStatusFilter,
  onCreateRequest,
}: {
  requests: LeaveRequestItem[];
  search: string;
  setSearch: (s: string) => void;
  unitFilter: string;
  setUnitFilter: (u: string) => void;
  typeFilter: string;
  setTypeFilter: (t: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  onCreateRequest: (req: LeaveRequestItem) => void;
}) {
  const [showModal, setShowModal] = useState(false);
  const [employeeName, setEmployeeName] = useState("");
  const [employeeGrade, setEmployeeGrade] = useState<"RN" | "SN" | "EN" | "CN">("RN");
  const [deptId, setDeptId] = useState<Department>("medsurg");
  const [leaveType, setLeaveType] = useState<LeaveType>("Annual");
  const [startDate, setStartDate] = useState("2026-10-20");
  const [endDate, setEndDate] = useState("2026-10-24");
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dept = getDept(deptId);
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const newReq: LeaveRequestItem = {
      id: `LV-${Math.floor(200 + Math.random() * 800)}`,
      employeeName: employeeName || "Staff Nurse",
      employeeGrade,
      deptId,
      unitName: dept?.name || "Clinical Unit",
      leaveType,
      startDate,
      endDate,
      totalDays,
      hoursImpact: totalDays * 8,
      submittedDate: new Date().toISOString().slice(0, 10),
      status: "Submitted",
      reasonNote: reason || "Standard personal leave request.",
      competencies: ["General Ward Care"],
    };

    onCreateRequest(newReq);
    setShowModal(false);
    setEmployeeName("");
    setReason("");
  };

  return (
    <div className="flex flex-col gap-4 max-w-[1400px] mx-auto">
      {/* Search & Filter Header */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search by employee name or reason..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <select
            value={unitFilter}
            onChange={(e) => setUnitFilter(e.target.value)}
            className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none"
          >
            <option value="all">All Units</option>
            {DEPARTMENTS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none"
          >
            <option value="all">All Leave Types</option>
            <option value="Annual">Annual</option>
            <option value="Sick">Sick</option>
            <option value="Study / CPD">Study / CPD</option>
            <option value="Casual">Casual</option>
            <option value="Maternity / Parental">Maternity</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Declined">Declined</option>
          </select>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          <span>Submit Leave Request</span>
        </button>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold">
                <th className="py-3 px-3.5">Req ID</th>
                <th className="py-3 px-3.5">Employee</th>
                <th className="py-3 px-3.5">Unit</th>
                <th className="py-3 px-3.5">Leave Type</th>
                <th className="py-3 px-3.5">Start Date</th>
                <th className="py-3 px-3.5">End Date</th>
                <th className="py-3 px-3.5">Days (Impact)</th>
                <th className="py-3 px-3.5">Submitted</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5">Reviewer Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3.5 font-bold text-slate-900">{req.id}</td>
                  <td className="py-3 px-3.5 font-semibold text-slate-900">
                    {req.employeeName} ({req.employeeGrade})
                  </td>
                  <td className="py-3 px-3.5 text-slate-600">{req.unitName}</td>
                  <td className="py-3 px-3.5">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                      {req.leaveType}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-slate-700">{req.startDate}</td>
                  <td className="py-3 px-3.5 text-slate-700">{req.endDate}</td>
                  <td className="py-3 px-3.5 font-medium text-slate-900">
                    {req.totalDays} days ({req.hoursImpact}h)
                  </td>
                  <td className="py-3 px-3.5 text-slate-500">{req.submittedDate}</td>
                  <td className="py-3 px-3.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        req.status === "Approved"
                          ? "bg-emerald-100 text-emerald-800"
                          : req.status === "Under Review"
                          ? "bg-amber-100 text-amber-800"
                          : req.status === "Declined"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-slate-500 max-w-[220px]">
                    <div className="line-clamp-1">{req.reviewNotes || req.reasonNote}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submit Leave Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base">Submit New Leave Request</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Employee Name</label>
                  <input
                    type="text"
                    required
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    placeholder="e.g. Rachel Adams"
                    className="w-full h-8 rounded border border-slate-300 px-2 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Grade</label>
                  <select
                    value={employeeGrade}
                    onChange={(e) => setEmployeeGrade(e.target.value as "RN" | "SN" | "EN" | "CN")}
                    className="w-full h-8 rounded border border-slate-300 px-2 text-xs font-medium"
                  >
                    <option value="RN">RN</option>
                    <option value="SN">SN</option>
                    <option value="EN">EN</option>
                    <option value="CN">CN</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Department</label>
                  <select
                    value={deptId}
                    onChange={(e) => setDeptId(e.target.value as Department)}
                    className="w-full h-8 rounded border border-slate-300 px-2 text-xs font-medium"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Leave Type</label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                    className="w-full h-8 rounded border border-slate-300 px-2 text-xs font-medium"
                  >
                    <option value="Annual">Annual Leave</option>
                    <option value="Casual">Casual Leave</option>
                    <option value="Sick">Sick Leave</option>
                    <option value="Study / CPD">Study / CPD</option>
                    <option value="Maternity / Parental">Maternity / Parental</option>
                    <option value="Compassionate">Compassionate Leave</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full h-8 rounded border border-slate-300 px-2 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full h-8 rounded border border-slate-300 px-2 text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Reason / Purpose</label>
                <textarea
                  rows={2}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide brief operational context for manager review..."
                  className="w-full rounded border border-slate-300 p-2 text-xs font-medium"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/* 4. APPROVALS WORKFLOW PANEL (Human-Controlled)                  */
/* ─────────────────────────────────────────────────────────────── */
function LeaveApprovalsPanel({
  pendingRequests,
  onApprove,
  onDecline,
}: {
  pendingRequests: LeaveRequestItem[];
  onApprove: (id: string, note?: string) => void;
  onDecline: (id: string, reason: string) => void;
}) {
  const [managerNotes, setManagerNotes] = useState<Record<string, string>>({});

  return (
    <div className="flex flex-col gap-5 max-w-[1400px] mx-auto">
      {/* Human Decision Principle Callout */}
      <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/70 text-slate-800 text-xs shadow-2xs flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Human Manager Authorization Required</h3>
          <p className="mt-0.5 text-slate-600 leading-relaxed">
            NOS displays operational staffing signals and skill-mix considerations alongside each request. The system does not automatically approve or decline leave; authorized healthcare leadership retains sole decision authority.
          </p>
        </div>
      </div>

      {/* Pending Items List */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
          Pending Leave Requests Requiring Authorization ({pendingRequests.length})
        </h2>

        {pendingRequests.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
            <div className="font-semibold text-slate-800 text-sm">All pending leave requests reviewed!</div>
            <p className="mt-1">No requests currently awaiting manager sign-off.</p>
          </div>
        ) : (
          pendingRequests.map((req) => (
            <div
              key={req.id}
              className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-4"
            >
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    {req.employeeGrade}
                  </div>
                  <div>
                    <span className="font-bold text-sm text-slate-900">{req.employeeName}</span>
                    <span className="text-xs text-slate-500"> · {req.unitName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-100">
                    {req.leaveType}
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    {req.startDate} to {req.endDate} ({req.totalDays} Days · {req.hoursImpact}h)
                  </span>
                </div>
              </div>

              {/* Side-by-Side: Request Details vs Pre-Approval Coverage Impact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Request Rationale */}
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-slate-500" />
                    Request Submission Details
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed italic">
                    "{req.reasonNote}"
                  </p>
                  <div className="text-[11px] text-slate-400">
                    Submitted on: <strong>{req.submittedDate}</strong> · Competencies:{" "}
                    {req.competencies.join(", ")}
                  </div>
                </div>

                {/* Pre-Approval Coverage Impact Preview */}
                <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200/80 space-y-2">
                  <div className="font-semibold text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                    Operational Coverage Considerations
                  </div>
                  <ul className="text-[11.5px] text-slate-700 space-y-1">
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span>
                        Unit scheduled staffing: <strong>10 RNs</strong> (Req: 10 RNs)
                      </span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span>
                        Other approved leave on date: <strong>1 RN (Sarah Jenkins)</strong>
                      </span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span>Float pool availability: <strong>2 ICU qualified float RNs available</strong></span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Decision Actions & Manager Notes */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <input
                  type="text"
                  placeholder="Optional manager note / coverage rationale..."
                  value={managerNotes[req.id] || ""}
                  onChange={(e) =>
                    setManagerNotes((prev) => ({ ...prev, [req.id]: e.target.value }))
                  }
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-none"
                />

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onDecline(req.id, managerNotes[req.id] || "Staffing constraint")}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition"
                  >
                    Decline Request
                  </button>
                  <button
                    onClick={() => onApprove(req.id, managerNotes[req.id])}
                    className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-2xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Approve Leave</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/* 5. COVERAGE IMPACT ANALYZER PANEL                               */
/* ─────────────────────────────────────────────────────────────── */
function CoverageImpactAnalyzer() {
  const [selectedDept, setSelectedDept] = useState<Department>("icu");
  const [analysisDate, setAnalysisDate] = useState("2026-10-15");

  return (
    <div className="flex flex-col gap-5 max-w-[1400px] mx-auto">
      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            Pre-Approval Staffing & Skill Mix Impact Analyzer
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluate unit coverage gaps, open shifts, and minimum competency thresholds before approving leave.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div>
            <label htmlFor="cov-unit" className="text-xs font-semibold text-slate-700 mr-2">
              Target Unit:
            </label>
            <select
              id="cov-unit"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value as Department)}
              className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-800"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="cov-date" className="text-xs font-semibold text-slate-700 mr-2">
              Evaluation Date:
            </label>
            <input
              id="cov-date"
              type="date"
              value={analysisDate}
              onChange={(e) => setAnalysisDate(e.target.value)}
              className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold"
            />
          </div>
        </div>
      </div>

      {/* Simulated Impact Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">
            Baseline Unit Staffing
          </span>
          <div className="mt-2 text-2xl font-bold text-slate-900">10 RNs Scheduled</div>
          <p className="text-[11px] text-slate-500 mt-1">
            Required by patient census: <strong>10 RNs (80h)</strong>
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">
            Staff on Approved / Pending Leave
          </span>
          <div className="mt-2 text-2xl font-bold text-amber-600">2 RNs on Leave</div>
          <p className="text-[11px] text-slate-500 mt-1">
            Available on duty: <strong>8 RNs (64h)</strong> · Shortfall: 16h
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">
            Skill Mix Compliance
          </span>
          <div className="mt-2 text-2xl font-bold text-rose-600">4 / 6 ICU Certified</div>
          <p className="text-[11px] text-slate-500 mt-1">
            Minimum 6 required for high-acuity vent beds
          </p>
        </div>
      </div>

      {/* Operational Recommendations Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-blue-600" />
          Recommended Operational Mitigations
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-100">
            <span className="font-bold text-blue-900">Option 1: Float Pool Request</span>
            <p className="mt-1 text-slate-700">
              Deploy 1 ICU Certified Float RN from Central Float Pool for Night shift to maintain safe 1:2 vent ratio.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-900">Option 2: Voluntary Shift Exchange</span>
            <p className="mt-1 text-slate-700">
              Request voluntary roster swap with staff member on rest day, ensuring 11h recovery policy is preserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/* 6. LEAVE PATTERNS PANEL (Aggregated Only)                       */
/* ─────────────────────────────────────────────────────────────── */
function LeavePatternsPanel() {
  return (
    <div className="flex flex-col gap-5 max-w-[1400px] mx-auto">
      {/* Ethical Guardrail Banner */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs shadow-2xs flex items-start gap-3">
        <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Aggregated Operational Patterns Only</h3>
          <p className="mt-0.5 text-slate-500 leading-relaxed">
            Per institutional workforce governance, leave patterns show unit-level seasonality, advance notice trends, and category distribution. Unsupported individual predictive scoring is disabled.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Leave by Category */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-600" />
            Hospital-Wide Leave by Category
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-slate-700">Annual Leave</span>
                <span className="font-bold text-slate-900">62% (480 hrs)</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: "62%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-slate-700">Sick & Medical Leave</span>
                <span className="font-bold text-slate-900">18% (140 hrs)</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: "18%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-slate-700">Study & CPD Leave</span>
                <span className="font-bold text-slate-900">12% (94 hrs)</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "12%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-slate-700">Casual / Domestic</span>
                <span className="font-bold text-slate-900">8% (62 hrs)</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-500 rounded-full" style={{ width: "8%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Advance Notice Metrics */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            Advance Notice Compliance (&gt;14 Days Policy)
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-slate-700">&gt; 21 Days Notice (Optimal)</span>
                <span className="font-bold text-emerald-600">54%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "54%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-slate-700">14 – 21 Days Notice (Standard)</span>
                <span className="font-bold text-blue-600">28%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: "28%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-slate-700">Short Notice (&lt; 14 Days)</span>
                <span className="font-bold text-amber-600">18%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: "18%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
