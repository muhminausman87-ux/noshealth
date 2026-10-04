import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { WorkforceNav } from "@/components/WorkforceNav";
import {
  Users,
  LayoutDashboard,
  Sparkles,
  Search,
  Filter,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building2,
  ShieldCheck,
  Award,
  ArrowUpRight,
  UserCheck,
  Calendar,
  Send,
  HelpCircle,
  RefreshCw,
  PlusCircle,
  XCircle,
  SlidersHorizontal,
  ChevronRight,
  FileText,
  BadgeCheck,
} from "lucide-react";
import { DEPARTMENTS, Department, getDept } from "@/lib/departments";

/* ── Route Definition ─────────────────────────────────────────── */
export const Route = createFileRoute("/_authenticated/float-pool")({
  validateSearch: (search: Record<string, unknown>): { tab?: string } => ({
    tab: typeof search.tab === "string" ? search.tab : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Float Pool · Workforce Operations · NOS" },
      {
        name: "description",
        content:
          "Flexible workforce deployment, transparent competency-based matching, and safe nursing staff redistribution.",
      },
    ],
  }),
  component: FloatPoolPage,
});

/* ── Secondary Tabs ───────────────────────────────────────────── */
type TabId = "overview" | "available" | "matching" | "requests" | "assignments" | "history";

interface TabDef {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const TABS: TabDef[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "available", label: "Available Nurses", icon: Users, badge: 8 },
  { id: "matching", label: "Skill & Competency Match", icon: Sparkles },
  { id: "requests", label: "Unit Requests", icon: AlertTriangle, badge: 5 },
  { id: "assignments", label: "Assignments", icon: UserCheck, badge: 6 },
  { id: "history", label: "Float History", icon: Clock },
];

/* ── Types & Demo Dataset ─────────────────────────────────────── */
export type Grade = "RN" | "SN" | "EN" | "CN";

export interface FloatNurse {
  id: string;
  name: string;
  grade: Grade;
  homeUnit: string;
  homeDeptId: Department;
  currentAvailability: "Available Now" | "Next Shift" | "Rest Window" | "On Standby";
  shiftAvailability: ("day" | "evening" | "night")[];
  competencies: string[];
  currentWeeklyHours: number;
  maxWeeklyHours: number;
  floatEligibility: "Eligible" | "Conditional (Preceptor Required)" | "Rest Restricted";
  restHoursSinceLastShift: number;
  unitFamiliarity: Record<string, "High" | "Moderate" | "Orientation Required">;
}

export interface UnitFloatRequest {
  id: string;
  deptId: Department;
  unitName: string;
  shift: "day" | "evening" | "night";
  date: string;
  numberRequested: number;
  requiredCompetency: string;
  reason: string;
  priority: "Urgent" | "High" | "Normal";
  status: "Pending Match" | "In Review" | "Assigned" | "Escalated";
  requestedBy: string;
  timeSubmitted: string;
}

export interface FloatAssignment {
  id: string;
  nurseId: string;
  nurseName: string;
  grade: Grade;
  homeUnit: string;
  deployedUnit: string;
  shift: "day" | "evening" | "night";
  date: string;
  roleDescription: string;
  preceptorSupervisor: string;
  approvedBy: string;
  status: "Active" | "Scheduled" | "In Handover" | "Completed";
  startedAt: string;
}

export interface FloatHistoryRecord {
  id: string;
  date: string;
  nurseName: string;
  grade: Grade;
  homeUnit: string;
  floatedUnit: string;
  shift: string;
  hours: number;
  reason: string;
  clinicalFeedback: string;
  loggedBy: string;
  auditId: string;
}

const DEMO_FLOAT_NURSES: FloatNurse[] = [
  {
    id: "fn-01",
    name: "Elena Rostova",
    grade: "SN",
    homeUnit: "Central Float Pool",
    homeDeptId: "medsurg",
    currentAvailability: "Available Now",
    shiftAvailability: ["day", "evening", "night"],
    competencies: ["ICU Certified", "ACLS", "Ventilator Care", "Arterial Lines"],
    currentWeeklyHours: 24,
    maxWeeklyHours: 40,
    floatEligibility: "Eligible",
    restHoursSinceLastShift: 16,
    unitFamiliarity: { ICU: "High", ED: "High", "Med-Surg": "High", Cardiac: "Moderate" },
  },
  {
    id: "fn-02",
    name: "Marcus Vance",
    grade: "RN",
    homeUnit: "Medical Ward",
    homeDeptId: "medical",
    currentAvailability: "Available Now",
    shiftAvailability: ["day", "evening"],
    competencies: ["ACLS", "Wound Care", "IV Cannulation", "Telemetry"],
    currentWeeklyHours: 28,
    maxWeeklyHours: 40,
    floatEligibility: "Eligible",
    restHoursSinceLastShift: 14,
    unitFamiliarity: { "Med-Surg": "High", Cardiac: "High", Medical: "High", ICU: "Orientation Required" },
  },
  {
    id: "fn-03",
    name: "Amina Al-Mansoor",
    grade: "SN",
    homeUnit: "Emergency Dept",
    homeDeptId: "ed",
    currentAvailability: "Available Now",
    shiftAvailability: ["evening", "night"],
    competencies: ["ED Triage", "Trauma", "ACLS", "PALS", "Procedural Sedation"],
    currentWeeklyHours: 32,
    maxWeeklyHours: 40,
    floatEligibility: "Eligible",
    restHoursSinceLastShift: 20,
    unitFamiliarity: { ED: "High", ICU: "Moderate", "Med-Surg": "Moderate" },
  },
  {
    id: "fn-04",
    name: "Carlos Reyes",
    grade: "RN",
    homeUnit: "Central Float Pool",
    homeDeptId: "medsurg",
    currentAvailability: "Available Now",
    shiftAvailability: ["day", "evening"],
    competencies: ["Med-Surg", "Orthopedics", "IV Cannulation", "Blood Transfusion"],
    currentWeeklyHours: 16,
    maxWeeklyHours: 36,
    floatEligibility: "Eligible",
    restHoursSinceLastShift: 24,
    unitFamiliarity: { "Med-Surg": "High", Surgical: "High", OPD: "Moderate" },
  },
  {
    id: "fn-05",
    name: "Sophie Dubois",
    grade: "CN",
    homeUnit: "Cardiac Care",
    homeDeptId: "cardiac",
    currentAvailability: "Next Shift",
    shiftAvailability: ["day", "night"],
    competencies: ["Cardiac Step-Down", "Telemetry", "ACLS", "Preceptor", "Central Lines"],
    currentWeeklyHours: 36,
    maxWeeklyHours: 44,
    floatEligibility: "Eligible",
    restHoursSinceLastShift: 12,
    unitFamiliarity: { Cardiac: "High", ICU: "High", "Med-Surg": "Moderate" },
  },
  {
    id: "fn-06",
    name: "David Chen",
    grade: "EN",
    homeUnit: "Surgical Ward",
    homeDeptId: "surgical",
    currentAvailability: "Available Now",
    shiftAvailability: ["day", "evening"],
    competencies: ["Post-Op Recovery", "Wound Dressings", "Vitals Monitoring"],
    currentWeeklyHours: 20,
    maxWeeklyHours: 36,
    floatEligibility: "Conditional (Preceptor Required)",
    restHoursSinceLastShift: 15,
    unitFamiliarity: { Surgical: "High", "Med-Surg": "Moderate", ICU: "Orientation Required" },
  },
  {
    id: "fn-07",
    name: "Priya Sharma",
    grade: "RN",
    homeUnit: "Pediatric Ward",
    homeDeptId: "pediatric",
    currentAvailability: "Available Now",
    shiftAvailability: ["day", "evening", "night"],
    competencies: ["PALS", "Neonatal Basics", "Pediatric Cannulation", "Preceptor"],
    currentWeeklyHours: 24,
    maxWeeklyHours: 40,
    floatEligibility: "Eligible",
    restHoursSinceLastShift: 18,
    unitFamiliarity: { Pediatric: "High", Maternity: "Moderate", ED: "Moderate" },
  },
  {
    id: "fn-08",
    name: "Kofi Mensah",
    grade: "SN",
    homeUnit: "Central Float Pool",
    homeDeptId: "icu",
    currentAvailability: "Available Now",
    shiftAvailability: ["day", "night"],
    competencies: ["ICU Qualified", "CRRT / Hemodialysis", "ACLS", "Emergency Response"],
    currentWeeklyHours: 30,
    maxWeeklyHours: 42,
    floatEligibility: "Eligible",
    restHoursSinceLastShift: 22,
    unitFamiliarity: { ICU: "High", ED: "High", Cardiac: "High" },
  },
  {
    id: "fn-09",
    name: "Hannah Lindqvist",
    grade: "RN",
    homeUnit: "Maternity Ward",
    homeDeptId: "maternity",
    currentAvailability: "On Standby",
    shiftAvailability: ["night"],
    competencies: ["Midwifery", "Postnatal Care", "NRP", "Obstetric Triage"],
    currentWeeklyHours: 32,
    maxWeeklyHours: 40,
    floatEligibility: "Eligible",
    restHoursSinceLastShift: 14,
    unitFamiliarity: { Maternity: "High", Labour: "High", Pediatric: "Moderate" },
  },
  {
    id: "fn-10",
    name: "Liam O'Connor",
    grade: "RN",
    homeUnit: "Operation Theatre",
    homeDeptId: "ot",
    currentAvailability: "Rest Window",
    shiftAvailability: ["day"],
    competencies: ["Scrub / Circulating", "PACU Recovery", "ACLS"],
    currentWeeklyHours: 38,
    maxWeeklyHours: 40,
    floatEligibility: "Rest Restricted",
    restHoursSinceLastShift: 7, // < 11h minimum recovery policy
    unitFamiliarity: { OT: "High", DayCare: "High", Surgical: "Moderate" },
  },
];

const INITIAL_REQUESTS: UnitFloatRequest[] = [
  {
    id: "REQ-401",
    deptId: "icu",
    unitName: "Intensive Care Unit (ICU)",
    shift: "night",
    date: "Today",
    numberRequested: 2,
    requiredCompetency: "ICU Certified / ACLS",
    reason: "Acuity surge (3 mechanical vent admissions) + 1 emergency sick call",
    priority: "Urgent",
    status: "Pending Match",
    requestedBy: "Charge Nurse G. Henderson",
    timeSubmitted: "18:25 (35 min ago)",
  },
  {
    id: "REQ-402",
    deptId: "ed",
    unitName: "Emergency Department (ED)",
    shift: "evening",
    date: "Today",
    numberRequested: 1,
    requiredCompetency: "ED Triage / Trauma",
    reason: "Influx of multi-trauma arrivals + overcrowding in Bay 2",
    priority: "Urgent",
    status: "Pending Match",
    requestedBy: "Triage Lead Dr. R. Patel",
    timeSubmitted: "17:50 (1h 10m ago)",
  },
  {
    id: "REQ-403",
    deptId: "medsurg",
    unitName: "Medical-Surg Floor",
    shift: "night",
    date: "Today",
    numberRequested: 1,
    requiredCompetency: "Med-Surg / IV Cannulation",
    reason: "Post-op admission surge from afternoon elective surgical list",
    priority: "High",
    status: "In Review",
    requestedBy: "Nurse Manager C. Watson",
    timeSubmitted: "16:40 (2h 20m ago)",
  },
  {
    id: "REQ-404",
    deptId: "cardiac",
    unitName: "Cardiac Ward",
    shift: "day",
    date: "Tomorrow",
    numberRequested: 1,
    requiredCompetency: "Telemetry / ACLS",
    reason: "Scheduled staff on approved emergency study leave",
    priority: "Normal",
    status: "Pending Match",
    requestedBy: "Charge Nurse L. Moreau",
    timeSubmitted: "14:15 (4h 45m ago)",
  },
  {
    id: "REQ-405",
    deptId: "pediatric",
    unitName: "Pediatric Ward",
    shift: "evening",
    date: "Today",
    numberRequested: 1,
    requiredCompetency: "PALS / Pediatric Cannulation",
    reason: "1:1 high-observation pediatric respiratory case",
    priority: "High",
    status: "Assigned",
    requestedBy: "Charge Nurse M. Rossi",
    timeSubmitted: "15:00 (4h ago)",
  },
];

const INITIAL_ASSIGNMENTS: FloatAssignment[] = [
  {
    id: "ASN-901",
    nurseId: "fn-07",
    nurseName: "Priya Sharma",
    grade: "RN",
    homeUnit: "Pediatric Ward",
    deployedUnit: "Pediatric Ward (1:1 Isolation)",
    shift: "evening",
    date: "Today",
    roleDescription: "1:1 Pediatric RSV Respiratory Case (Bed P-08)",
    preceptorSupervisor: "Charge Nurse M. Rossi",
    approvedBy: "Workforce Coordinator S. Miller",
    status: "Active",
    startedAt: "15:00",
  },
  {
    id: "ASN-902",
    nurseId: "fn-08",
    nurseName: "Kofi Mensah",
    grade: "SN",
    homeUnit: "Central Float Pool",
    deployedUnit: "Intensive Care Unit (ICU)",
    shift: "day",
    date: "Today",
    roleDescription: "ICU Pod B · Arterial Line & Continuous Sedation Support",
    preceptorSupervisor: "Charge Nurse G. Henderson",
    approvedBy: "Nurse Supervisor K. Daniels",
    status: "Active",
    startedAt: "07:00",
  },
  {
    id: "ASN-903",
    nurseId: "fn-04",
    nurseName: "Carlos Reyes",
    grade: "RN",
    homeUnit: "Central Float Pool",
    deployedUnit: "Surgical Ward",
    shift: "day",
    date: "Today",
    roleDescription: "Post-op joint replacement step-down care (Beds 12-15)",
    preceptorSupervisor: "Charge Nurse V. Larson",
    approvedBy: "Workforce Coordinator S. Miller",
    status: "In Handover",
    startedAt: "07:00",
  },
  {
    id: "ASN-904",
    nurseId: "fn-03",
    nurseName: "Amina Al-Mansoor",
    grade: "SN",
    homeUnit: "Emergency Dept",
    deployedUnit: "Emergency Dept (Fast Track & Triage)",
    shift: "evening",
    date: "Today",
    roleDescription: "Evening Peak Resuscitation & Rapid Triage Coverage",
    preceptorSupervisor: "ED Lead Nurse T. Bennett",
    approvedBy: "Nurse Supervisor K. Daniels",
    status: "Scheduled",
    startedAt: "15:00",
  },
  {
    id: "ASN-905",
    nurseId: "fn-02",
    nurseName: "Marcus Vance",
    grade: "RN",
    homeUnit: "Medical Ward",
    deployedUnit: "Cardiac Ward",
    shift: "day",
    date: "Yesterday",
    roleDescription: "Step-down Telemetry Observation",
    preceptorSupervisor: "Charge Nurse L. Moreau",
    approvedBy: "Workforce Coordinator S. Miller",
    status: "Completed",
    startedAt: "Yesterday 07:00",
  },
  {
    id: "ASN-906",
    nurseId: "fn-01",
    nurseName: "Elena Rostova",
    grade: "SN",
    homeUnit: "Central Float Pool",
    deployedUnit: "Intensive Care Unit (ICU)",
    shift: "night",
    date: "Yesterday",
    roleDescription: "Post-arrest cooling protocol monitoring",
    preceptorSupervisor: "Charge Nurse G. Henderson",
    approvedBy: "Nurse Supervisor K. Daniels",
    status: "Completed",
    startedAt: "Yesterday 23:00",
  },
];

const DEMO_HISTORY: FloatHistoryRecord[] = [
  {
    id: "HIST-801",
    date: "2026-10-02",
    nurseName: "Elena Rostova",
    grade: "SN",
    homeUnit: "Central Float Pool",
    floatedUnit: "Intensive Care Unit (ICU)",
    shift: "Night (23:00 - 07:00)",
    hours: 8,
    reason: "Acuity spike / Post-arrest patient coverage",
    clinicalFeedback: "Exceptional hemodynamic monitoring; safe handover completed.",
    loggedBy: "Charge Nurse G. Henderson",
    auditId: "AUD-FLT-20261002-01",
  },
  {
    id: "HIST-802",
    date: "2026-10-02",
    nurseName: "Marcus Vance",
    grade: "RN",
    homeUnit: "Medical Ward",
    floatedUnit: "Cardiac Ward",
    shift: "Day (07:00 - 15:00)",
    hours: 8,
    reason: "Unplanned sick leave cover",
    clinicalFeedback: "High competency on telemetry; smoothly adapted to ward pacing.",
    loggedBy: "Charge Nurse L. Moreau",
    auditId: "AUD-FLT-20261002-02",
  },
  {
    id: "HIST-803",
    date: "2026-10-01",
    nurseName: "Amina Al-Mansoor",
    grade: "SN",
    homeUnit: "Emergency Dept",
    floatedUnit: "ICU Step-down",
    shift: "Evening (15:00 - 23:00)",
    hours: 8,
    reason: "Surge from ED mass transit admission",
    clinicalFeedback: "Excellent emergency escalation skills and arterial line management.",
    loggedBy: "Nurse Supervisor K. Daniels",
    auditId: "AUD-FLT-20261001-08",
  },
  {
    id: "HIST-804",
    date: "2026-10-01",
    nurseName: "Carlos Reyes",
    grade: "RN",
    homeUnit: "Central Float Pool",
    floatedUnit: "Medical-Surg Floor",
    shift: "Day (07:00 - 15:00)",
    hours: 8,
    reason: "Cover for staff attending mandatory ACLS recertification",
    clinicalFeedback: "Reliable documentation; patient medication rounds completed without delay.",
    loggedBy: "Charge Nurse C. Watson",
    auditId: "AUD-FLT-20261001-09",
  },
  {
    id: "HIST-805",
    date: "2026-09-30",
    nurseName: "Kofi Mensah",
    grade: "SN",
    homeUnit: "Central Float Pool",
    floatedUnit: "Cardiac Ward",
    shift: "Night (23:00 - 07:00)",
    hours: 8,
    reason: "2 emergency telemetry transfers from Emergency",
    clinicalFeedback: "Proficient cardiac rhythm interpretation and preceptor support.",
    loggedBy: "Charge Nurse L. Moreau",
    auditId: "AUD-FLT-20260930-03",
  },
];

/* ── Main Component ───────────────────────────────────────────── */
export default function FloatPoolPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();

  const activeTab: TabId = (
    TABS.some((t) => t.id === search.tab) ? search.tab : "overview"
  ) as TabId;

  const setActiveTab = (tab: TabId) => {
    navigate({
      to: "/float-pool",
      search: { tab },
    });
  };

  // State management for interactive actions
  const [requests, setRequests] = useState<UnitFloatRequest[]>(INITIAL_REQUESTS);
  const [assignments, setAssignments] = useState<FloatAssignment[]>(INITIAL_ASSIGNMENTS);
  const [selectedRequestIdForMatch, setSelectedRequestIdForMatch] = useState<string>("REQ-401");
  const [assignNotification, setAssignNotification] = useState<string | null>(null);

  // Filter states
  const [nurseSearch, setNurseSearch] = useState("");
  const [nurseUnitFilter, setNurseUnitFilter] = useState("all");
  const [nurseAvailabilityFilter, setNurseAvailabilityFilter] = useState("all");

  const filteredNurses = useMemo(() => {
    return DEMO_FLOAT_NURSES.filter((nurse) => {
      const matchesSearch =
        nurse.name.toLowerCase().includes(nurseSearch.toLowerCase()) ||
        nurse.competencies.some((c) => c.toLowerCase().includes(nurseSearch.toLowerCase())) ||
        nurse.homeUnit.toLowerCase().includes(nurseSearch.toLowerCase());

      const matchesUnit =
        nurseUnitFilter === "all" ||
        nurse.homeDeptId === nurseUnitFilter ||
        (nurseUnitFilter === "float_pool" && nurse.homeUnit.includes("Float Pool"));

      const matchesAvailability =
        nurseAvailabilityFilter === "all" || nurse.currentAvailability === nurseAvailabilityFilter;

      return matchesSearch && matchesUnit && matchesAvailability;
    });
  }, [nurseSearch, nurseUnitFilter, nurseAvailabilityFilter]);

  // Selected request for matching view
  const currentMatchRequest = useMemo(() => {
    return requests.find((r) => r.id === selectedRequestIdForMatch) || requests[0];
  }, [requests, selectedRequestIdForMatch]);

  // Explainable Rule-Based Matching Evaluation
  const evaluatedCandidates = useMemo(() => {
    if (!currentMatchRequest) return [];

    return DEMO_FLOAT_NURSES.map((nurse) => {
      // 1. Competency Check
      const hasDirectCompetency = nurse.competencies.some((c) =>
        currentMatchRequest.requiredCompetency.toLowerCase().split("/").some((part) =>
          c.toLowerCase().includes(part.trim().toLowerCase())
        )
      );
      const competencyStatus: "Full Match" | "Partial Match" | "Orientation Needed" =
        hasDirectCompetency ? "Full Match" : nurse.grade === "SN" || nurse.grade === "CN" ? "Partial Match" : "Orientation Needed";

      // 2. Shift Compatibility Check
      const isShiftCompatible = nurse.shiftAvailability.includes(currentMatchRequest.shift);

      // 3. Rest & Recovery Policy (11h minimum recovery rule)
      const satisfiesRestPolicy = nurse.restHoursSinceLastShift >= 11;

      // 4. Unit Familiarity
      const targetUnitKey = currentMatchRequest.deptId === "icu" ? "ICU" : currentMatchRequest.deptId === "ed" ? "ED" : currentMatchRequest.deptId === "cardiac" ? "Cardiac" : "Med-Surg";
      const familiarity = nurse.unitFamiliarity[targetUnitKey] || "Orientation Required";

      // 5. Weekly Hours Availability
      const hoursRemaining = nurse.maxWeeklyHours - nurse.currentWeeklyHours;
      const hasAvailableHours = hoursRemaining >= 8;

      // Explainable eligibility flag
      const isDeployable =
        nurse.floatEligibility !== "Rest Restricted" &&
        satisfiesRestPolicy &&
        isShiftCompatible &&
        hasAvailableHours;

      return {
        nurse,
        competencyStatus,
        isShiftCompatible,
        satisfiesRestPolicy,
        familiarity,
        hoursRemaining,
        isDeployable,
        rulesSummary: [
          satisfiesRestPolicy
            ? `Rest rule satisfied (${nurse.restHoursSinceLastShift}h recovery >= 11h policy)`
            : `Rest constraint violated (${nurse.restHoursSinceLastShift}h recovery < 11h policy)`,
          isShiftCompatible
            ? `Shift compatible (${currentMatchRequest.shift} available)`
            : `Not scheduled for ${currentMatchRequest.shift} shift`,
          `Unit familiarity: ${familiarity}`,
          `${hoursRemaining}h remaining under ${nurse.maxWeeklyHours}h weekly cap`,
        ],
      };
    }).sort((a, b) => {
      if (a.isDeployable && !b.isDeployable) return -1;
      if (!a.isDeployable && b.isDeployable) return 1;
      if (a.competencyStatus === "Full Match" && b.competencyStatus !== "Full Match") return -1;
      return 0;
    });
  }, [currentMatchRequest]);

  // Deployment action handler (Explicit Human Approval)
  const handleDeployNurse = (nurse: FloatNurse) => {
    if (!currentMatchRequest) return;

    const newAssignment: FloatAssignment = {
      id: `ASN-${Math.floor(1000 + Math.random() * 9000)}`,
      nurseId: nurse.id,
      nurseName: nurse.name,
      grade: nurse.grade,
      homeUnit: nurse.homeUnit,
      deployedUnit: currentMatchRequest.unitName,
      shift: currentMatchRequest.shift,
      date: currentMatchRequest.date,
      roleDescription: `${currentMatchRequest.reason} · Priority: ${currentMatchRequest.priority}`,
      preceptorSupervisor: "Assigned Charge Nurse",
      approvedBy: "Authorized Healthcare Manager (You)",
      status: "Active",
      startedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setAssignments((prev) => [newAssignment, ...prev]);

    // Update request status
    setRequests((prev) =>
      prev.map((r) =>
        r.id === currentMatchRequest.id
          ? { ...r, status: "Assigned" }
          : r
      )
    );

    setAssignNotification(
      `Float deployment confirmed: ${nurse.name} (${nurse.grade}) assigned to ${currentMatchRequest.unitName} for ${currentMatchRequest.shift} shift.`
    );

    setTimeout(() => {
      setAssignNotification(null);
    }, 6000);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 font-sans bg-[#F8FAFC] text-slate-900">
      {/* ── Workforce Operations Subnav ────────────────────────── */}
      <div className="w-full min-w-0 px-4 sm:px-6 pt-3 pb-1 bg-white border-b border-slate-200 shrink-0">
        <WorkforceNav activeTab="float" />
      </div>

      {/* ── Module Header ─────────────────────────────────────── */}
      <header className="px-5 pt-4 pb-3 bg-white border-b border-slate-200/80 shrink-0 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.14em] text-blue-600">
              <Users className="h-3.5 w-3.5" />
              <span>Workforce Operations · Staff Redistribution</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-0.5">
              Float Pool & Workforce Deployment
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Flexible workforce deployment, safe staff redistribution, and explainable rule-based competency matching.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-md border border-blue-200 bg-blue-50 text-blue-700">
              Prototype · Rules-Based Matching
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
          aria-label="Float Pool Secondary Tabs"
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
                      tab.id === "requests"
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

      {/* ── Toast Notification Banner ─────────────────────────── */}
      {assignNotification && (
        <div className="mx-5 mt-3 p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{assignNotification}</span>
          </div>
          <button
            onClick={() => setAssignNotification(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold px-2 py-0.5"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── Tab Content Panels ────────────────────────────────── */}
      <main className="flex-1 min-h-0 p-5 overflow-y-auto">
        {activeTab === "overview" && (
          <OverviewPanel
            nurses={DEMO_FLOAT_NURSES}
            requests={requests}
            assignments={assignments}
            onNavigateTab={setActiveTab}
            onSelectRequestForMatch={(reqId) => {
              setSelectedRequestIdForMatch(reqId);
              setActiveTab("matching");
            }}
          />
        )}

        {activeTab === "available" && (
          <AvailableNursesPanel
            nurses={filteredNurses}
            search={nurseSearch}
            setSearch={setNurseSearch}
            unitFilter={nurseUnitFilter}
            setUnitFilter={setNurseUnitFilter}
            availabilityFilter={nurseAvailabilityFilter}
            setAvailabilityFilter={setNurseAvailabilityFilter}
            onMatchNurse={(nurse) => {
              setActiveTab("matching");
            }}
          />
        )}

        {activeTab === "matching" && (
          <SkillMatchingPanel
            requests={requests}
            selectedRequestId={selectedRequestIdForMatch}
            onSelectRequestId={setSelectedRequestIdForMatch}
            evaluatedCandidates={evaluatedCandidates}
            currentRequest={currentMatchRequest}
            onDeploy={handleDeployNurse}
          />
        )}

        {activeTab === "requests" && (
          <UnitRequestsPanel
            requests={requests}
            onMatchRequest={(reqId) => {
              setSelectedRequestIdForMatch(reqId);
              setActiveTab("matching");
            }}
            onCreateRequest={(newReq) => {
              setRequests((prev) => [newReq, ...prev]);
            }}
          />
        )}

        {activeTab === "assignments" && (
          <AssignmentsPanel
            assignments={assignments}
            onEndDeployment={(asnId) => {
              setAssignments((prev) =>
                prev.map((a) => (a.id === asnId ? { ...a, status: "Completed" } : a))
              );
            }}
          />
        )}

        {activeTab === "history" && <FloatHistoryPanel records={DEMO_HISTORY} />}
      </main>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/* 1. OVERVIEW PANEL                                               */
/* ─────────────────────────────────────────────────────────────── */
function OverviewPanel({
  nurses,
  requests,
  assignments,
  onNavigateTab,
  onSelectRequestForMatch,
}: {
  nurses: FloatNurse[];
  requests: UnitFloatRequest[];
  assignments: FloatAssignment[];
  onNavigateTab: (tab: TabId) => void;
  onSelectRequestForMatch: (reqId: string) => void;
}) {
  const availableCount = nurses.filter((n) => n.currentAvailability === "Available Now").length;
  const deployedCount = assignments.filter((a) => a.status === "Active").length;
  const openRequestsCount = requests.filter((r) => r.status === "Pending Match" || r.status === "In Review").length;
  const urgentUnfilledCount = requests.filter(
    (r) => r.priority === "Urgent" && r.status === "Pending Match"
  ).length;

  return (
    <div className="flex flex-col gap-5 max-w-[1400px] mx-auto">
      {/* ── KPI Row ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Available Float Nurses
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{availableCount}</span>
            <span className="text-xs text-emerald-600 font-medium">Ready for dispatch</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {nurses.length} total nurses registered in float roster
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Currently Deployed
            </span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{deployedCount}</span>
            <span className="text-xs text-blue-600 font-medium">Active on units</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Covering ICU, ED, Med-Surg, and Cardiac wards
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Open Unit Requests
            </span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{openRequestsCount}</span>
            <span className="text-xs text-amber-600 font-medium">Pending match</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Across 4 clinical units requiring coverage
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Urgent Unfilled
            </span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-600">{urgentUnfilledCount}</span>
            <span className="text-xs text-rose-600 font-medium">High priority</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            ICU Night & ED Triage need immediate action
          </p>
        </div>
      </div>

      {/* ── Two-Column Layout: Coverage Pressure + Open Requests ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Coverage Pressure by Unit */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-600" />
                Coverage Pressure by Unit (Current Shift)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Identifies shortfall units eligible for float nurse redistribution.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab("matching")}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-200"
            >
              <span>Match Available Staff</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold">
                  <th className="py-2.5 px-3">Unit</th>
                  <th className="py-2.5 px-3">Req. Hours</th>
                  <th className="py-2.5 px-3">Scheduled</th>
                  <th className="py-2.5 px-3">Variance</th>
                  <th className="py-2.5 px-3">Pressure Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-medium text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Intensive Care Unit (ICU)
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">96 hrs</td>
                  <td className="py-2.5 px-3 text-slate-600">80 hrs</td>
                  <td className="py-2.5 px-3 font-semibold text-rose-600">-16 hrs (2 RNs)</td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      Critical Shortfall
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => onSelectRequestForMatch("REQ-401")}
                      className="text-xs font-medium text-blue-600 hover:underline"
                    >
                      Resolve & Match
                    </button>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-medium text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Emergency Department (ED)
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">132 hrs</td>
                  <td className="py-2.5 px-3 text-slate-600">112 hrs</td>
                  <td className="py-2.5 px-3 font-semibold text-rose-600">-20 hrs</td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      Critical Surge
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => onSelectRequestForMatch("REQ-402")}
                      className="text-xs font-medium text-blue-600 hover:underline"
                    >
                      Resolve & Match
                    </button>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-medium text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Medical-Surg Floor
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">140 hrs</td>
                  <td className="py-2.5 px-3 text-slate-600">128 hrs</td>
                  <td className="py-2.5 px-3 font-semibold text-amber-600">-12 hrs</td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      Tight Coverage
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => onSelectRequestForMatch("REQ-403")}
                      className="text-xs font-medium text-blue-600 hover:underline"
                    >
                      Resolve & Match
                    </button>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-medium text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Maternity Ward
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">52 hrs</td>
                  <td className="py-2.5 px-3 text-slate-600">64 hrs</td>
                  <td className="py-2.5 px-3 font-semibold text-emerald-600">+12 hrs (Surplus)</td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Surplus Available
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="text-slate-400 text-xs">Donor Unit</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Urgent Requests Snapshot */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-500" />
                Urgent Float Requests
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                {requests.filter((r) => r.status === "Pending Match").length} Pending
              </span>
            </div>

            <div className="space-y-3">
              {requests.slice(0, 3).map((req) => (
                <div
                  key={req.id}
                  className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-900">{req.unitName}</span>
                    <span
                      className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded ${
                        req.priority === "Urgent"
                          ? "bg-rose-100 text-rose-700"
                          : req.priority === "High"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {req.priority}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{req.reason}</p>
                  <div className="mt-2 flex items-center justify-between text-[10.5px] text-slate-400">
                    <span>Req: {req.requiredCompetency}</span>
                    <button
                      onClick={() => onSelectRequestForMatch(req.id)}
                      className="font-semibold text-blue-600 hover:text-blue-800"
                    >
                      Find Candidate →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab("requests")}
            className="mt-4 w-full py-2 text-center text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors"
          >
            View All {requests.length} Requests
          </button>
        </div>
      </div>

      {/* ── Recent Float Deployments ──────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            Recent Float Activity & Deployments
          </h2>
          <button
            onClick={() => onNavigateTab("assignments")}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            Manage Active Assignments ({assignments.filter((a) => a.status === "Active").length})
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {assignments.slice(0, 3).map((asn) => (
            <div
              key={asn.id}
              className="p-3.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-colors shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-slate-900 flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5 text-blue-600" />
                  {asn.nurseName} ({asn.grade})
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    asn.status === "Active"
                      ? "bg-emerald-100 text-emerald-700"
                      : asn.status === "In Handover"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {asn.status}
                </span>
              </div>
              <div className="mt-2 text-xs text-slate-600">
                <p>
                  <strong className="text-slate-700">Home:</strong> {asn.homeUnit}
                </p>
                <p>
                  <strong className="text-slate-700">Deployed:</strong> {asn.deployedUnit}
                </p>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{asn.roleDescription}</p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10.5px] text-slate-400">
                <span>Shift: {asn.shift.toUpperCase()}</span>
                <span>Supv: {asn.preceptorSupervisor}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/* 2. AVAILABLE NURSES PANEL                                       */
/* ─────────────────────────────────────────────────────────────── */
function AvailableNursesPanel({
  nurses,
  search,
  setSearch,
  unitFilter,
  setUnitFilter,
  availabilityFilter,
  setAvailabilityFilter,
  onMatchNurse,
}: {
  nurses: FloatNurse[];
  search: string;
  setSearch: (s: string) => void;
  unitFilter: string;
  setUnitFilter: (u: string) => void;
  availabilityFilter: string;
  setAvailabilityFilter: (a: string) => void;
  onMatchNurse: (nurse: FloatNurse) => void;
}) {
  return (
    <div className="flex flex-col gap-4 max-w-[1400px] mx-auto">
      {/* Search & Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search nurse by name, competency (e.g. ICU, ACLS), or unit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Home Units</option>
              <option value="float_pool">Central Float Pool Only</option>
              {DEPARTMENTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Availabilities</option>
              <option value="Available Now">Available Now</option>
              <option value="Next Shift">Next Shift</option>
              <option value="On Standby">On Standby</option>
              <option value="Rest Window">Rest Window</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <strong className="text-slate-900">{nurses.length}</strong> nurse records
        </div>
      </div>

      {/* Nurses Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold">
                <th className="py-3 px-3.5">Nurse & Grade</th>
                <th className="py-3 px-3.5">Home Unit</th>
                <th className="py-3 px-3.5">Availability</th>
                <th className="py-3 px-3.5">Shifts</th>
                <th className="py-3 px-3.5">Competencies & Skills</th>
                <th className="py-3 px-3.5">Workload / Cap</th>
                <th className="py-3 px-3.5">Eligibility</th>
                <th className="py-3 px-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {nurses.map((nurse) => (
                <tr key={nurse.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3.5 font-medium text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[11px]">
                        {nurse.grade}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{nurse.name}</div>
                        <div className="text-[10.5px] text-slate-400">ID: {nurse.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3.5 text-slate-700 font-medium">
                    {nurse.homeUnit}
                  </td>
                  <td className="py-3 px-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        nurse.currentAvailability === "Available Now"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : nurse.currentAvailability === "Next Shift"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : nurse.currentAvailability === "On Standby"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          nurse.currentAvailability === "Available Now"
                            ? "bg-emerald-500"
                            : nurse.currentAvailability === "Next Shift"
                            ? "bg-blue-500"
                            : "bg-amber-500"
                        }`}
                      />
                      {nurse.currentAvailability}
                    </span>
                  </td>
                  <td className="py-3 px-3.5">
                    <div className="flex flex-wrap gap-1">
                      {nurse.shiftAvailability.map((s) => (
                        <span
                          key={s}
                          className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-medium text-slate-600 uppercase"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-3.5">
                    <div className="flex flex-wrap gap-1 max-w-[260px]">
                      {nurse.competencies.map((comp) => (
                        <span
                          key={comp}
                          className="px-1.5 py-0.5 rounded bg-blue-50 text-[10.5px] font-medium text-blue-700 border border-blue-100"
                        >
                          {comp}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-3.5">
                    <div className="text-slate-700 font-medium">
                      {nurse.currentWeeklyHours}h / {nurse.maxWeeklyHours}h
                    </div>
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          nurse.currentWeeklyHours / nurse.maxWeeklyHours > 0.85
                            ? "bg-rose-500"
                            : "bg-blue-600"
                        }`}
                        style={{
                          width: `${Math.min(100, (nurse.currentWeeklyHours / nurse.maxWeeklyHours) * 100)}%`,
                        }}
                      />
                    </div>
                  </td>
                  <td className="py-3 px-3.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        nurse.floatEligibility === "Eligible"
                          ? "bg-emerald-100 text-emerald-800"
                          : nurse.floatEligibility.includes("Conditional")
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {nurse.floatEligibility}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-right">
                    <button
                      onClick={() => onMatchNurse(nurse)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md transition-colors"
                    >
                      <span>Match</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
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

/* ─────────────────────────────────────────────────────────────── */
/* 3. SKILL & COMPETENCY MATCH PANEL (Transparent Rule Matching)   */
/* ─────────────────────────────────────────────────────────────── */
function SkillMatchingPanel({
  requests,
  selectedRequestId,
  onSelectRequestId,
  evaluatedCandidates,
  currentRequest,
  onDeploy,
}: {
  requests: UnitFloatRequest[];
  selectedRequestId: string;
  onSelectRequestId: (id: string) => void;
  evaluatedCandidates: {
    nurse: FloatNurse;
    competencyStatus: "Full Match" | "Partial Match" | "Orientation Needed";
    isShiftCompatible: boolean;
    satisfiesRestPolicy: boolean;
    familiarity: string;
    hoursRemaining: number;
    isDeployable: boolean;
    rulesSummary: string[];
  }[];
  currentRequest?: UnitFloatRequest;
  onDeploy: (nurse: FloatNurse) => void;
}) {
  return (
    <div className="flex flex-col gap-5 max-w-[1400px] mx-auto">
      {/* Rule-Based Match Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600">
              <ShieldCheck className="h-4 w-4" />
              <span>Transparent Rules-Based Matching Engine</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">
              Match Available Float Staff to Clinical Unit Demands
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Evaluates required competencies, shift compatibility, recovery hours, and unit familiarity. No black-box scores.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <label htmlFor="req-selector" className="text-xs font-semibold text-slate-700">
              Target Request:
            </label>
            <select
              id="req-selector"
              value={selectedRequestId}
              onChange={(e) => onSelectRequestId(e.target.value)}
              className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-none"
            >
              {requests.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.unitName} ({r.shift.toUpperCase()}) — {r.priority}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Request Context Card */}
        {currentRequest && (
          <div className="mt-3.5 p-3 rounded-lg bg-blue-50/70 border border-blue-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <span className="text-slate-500 font-medium">Requesting Unit:</span>{" "}
                <strong className="text-slate-900">{currentRequest.unitName}</strong>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Shift & Date:</span>{" "}
                <strong className="text-slate-900 uppercase">
                  {currentRequest.shift} ({currentRequest.date})
                </strong>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Required Skill:</span>{" "}
                <span className="font-semibold text-blue-700 px-1.5 py-0.5 rounded bg-white border border-blue-200">
                  {currentRequest.requiredCompetency}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Reason:</span>{" "}
                <span className="text-slate-700">{currentRequest.reason}</span>
              </div>
            </div>

            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                currentRequest.priority === "Urgent"
                  ? "bg-rose-100 text-rose-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {currentRequest.priority} Priority
            </span>
          </div>
        )}
      </div>

      {/* Candidate Evaluation List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
          Ranked Candidate Matches ({evaluatedCandidates.length} evaluated against policy constraints)
        </h3>

        {evaluatedCandidates.map(({ nurse, competencyStatus, isDeployable, rulesSummary, familiarity, hoursRemaining }) => (
          <div
            key={nurse.id}
            className={`p-4 rounded-xl border transition-all ${
              isDeployable
                ? "bg-white border-slate-200 shadow-2xs hover:border-blue-300"
                : "bg-slate-50/80 border-slate-200 opacity-75"
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Left Column: Nurse Info */}
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    competencyStatus === "Full Match"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {nurse.grade}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{nurse.name}</span>
                    <span className="text-xs text-slate-500">· Home: {nurse.homeUnit}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        competencyStatus === "Full Match"
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          : competencyStatus === "Partial Match"
                          ? "bg-blue-100 text-blue-700 border border-blue-200"
                          : "bg-amber-100 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {competencyStatus}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    {nurse.competencies.map((comp) => (
                      <span
                        key={comp}
                        className="px-2 py-0.5 text-[10.5px] rounded bg-slate-100 font-medium text-slate-700"
                      >
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Deployment Action */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right text-xs">
                  <div className="font-semibold text-slate-800">
                    {hoursRemaining}h Available
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Familiarity: <strong className="text-slate-600">{familiarity}</strong>
                  </div>
                </div>

                {isDeployable ? (
                  <button
                    onClick={() => onDeploy(nurse)}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition shadow-2xs flex items-center gap-1.5"
                  >
                    <span>Deploy Nurse</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <span className="px-3 py-1 text-xs font-medium rounded-lg bg-slate-200/80 text-slate-500 cursor-not-allowed">
                    Constraint Blocked
                  </span>
                )}
              </div>
            </div>

            {/* Transparent Constraints Breakdown */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
              {rulesSummary.map((rule, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 text-slate-600"
                >
                  {rule.includes("satisfied") || rule.includes("compatible") || rule.includes("High") || rule.includes("remaining") ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                  )}
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/* 4. UNIT REQUESTS PANEL                                          */
/* ─────────────────────────────────────────────────────────────── */
function UnitRequestsPanel({
  requests,
  onMatchRequest,
  onCreateRequest,
}: {
  requests: UnitFloatRequest[];
  onMatchRequest: (reqId: string) => void;
  onCreateRequest: (req: UnitFloatRequest) => void;
}) {
  const [showModal, setShowModal] = useState(false);
  const [newUnit, setNewUnit] = useState<Department>("icu");
  const [newShift, setNewShift] = useState<"day" | "evening" | "night">("night");
  const [newQty, setNewQty] = useState(1);
  const [newCompetency, setNewCompetency] = useState("ICU Certified");
  const [newReason, setNewReason] = useState("");
  const [newPriority, setNewPriority] = useState<"Urgent" | "High" | "Normal">("High");

  const handleSubmitNew = (e: React.FormEvent) => {
    e.preventDefault();
    const dept = getDept(newUnit);
    const req: UnitFloatRequest = {
      id: `REQ-${Math.floor(500 + Math.random() * 500)}`,
      deptId: newUnit,
      unitName: dept?.name || "Clinical Unit",
      shift: newShift,
      date: "Today",
      numberRequested: newQty,
      requiredCompetency: newCompetency,
      reason: newReason || "Operational staffing requirement",
      priority: newPriority,
      status: "Pending Match",
      requestedBy: "Charge Nurse (Direct Entry)",
      timeSubmitted: "Just now",
    };
    onCreateRequest(req);
    setShowModal(false);
    setNewReason("");
  };

  return (
    <div className="flex flex-col gap-4 max-w-[1400px] mx-auto">
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Active Unit Float Requests</h2>
          <p className="text-xs text-slate-500">
            Requests generated by ward charge nurses due to acuity surges or absences.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          <span>Create Float Request</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold">
                <th className="py-3 px-3.5">Request ID</th>
                <th className="py-3 px-3.5">Unit</th>
                <th className="py-3 px-3.5">Shift & Date</th>
                <th className="py-3 px-3.5">Qty</th>
                <th className="py-3 px-3.5">Required Competency</th>
                <th className="py-3 px-3.5">Reason</th>
                <th className="py-3 px-3.5">Priority</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3.5 font-bold text-slate-900">{req.id}</td>
                  <td className="py-3 px-3.5 font-medium text-slate-800">{req.unitName}</td>
                  <td className="py-3 px-3.5 text-slate-600 uppercase font-semibold">
                    {req.shift} · {req.date}
                  </td>
                  <td className="py-3 px-3.5 font-bold text-slate-900">{req.numberRequested} RN</td>
                  <td className="py-3 px-3.5 font-medium text-blue-700">
                    <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-100">
                      {req.requiredCompetency}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-slate-600 max-w-[280px]">
                    <div className="line-clamp-2">{req.reason}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">By: {req.requestedBy} ({req.timeSubmitted})</div>
                  </td>
                  <td className="py-3 px-3.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        req.priority === "Urgent"
                          ? "bg-rose-100 text-rose-700"
                          : req.priority === "High"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {req.priority}
                    </span>
                  </td>
                  <td className="py-3 px-3.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        req.status === "Assigned"
                          ? "bg-emerald-100 text-emerald-800"
                          : req.status === "In Review"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-right">
                    {req.status !== "Assigned" ? (
                      <button
                        onClick={() => onMatchRequest(req.id)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded"
                      >
                        Match Staff
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-600 font-semibold">Assigned</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Request Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base">Submit Float Nurse Request</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitNew} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Requesting Department</label>
                <select
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value as Department)}
                  className="w-full h-8 rounded border border-slate-300 px-2 text-xs font-medium"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Target Shift</label>
                  <select
                    value={newShift}
                    onChange={(e) => setNewShift(e.target.value as "day" | "evening" | "night")}
                    className="w-full h-8 rounded border border-slate-300 px-2 text-xs font-medium uppercase"
                  >
                    <option value="day">Day Shift</option>
                    <option value="evening">Evening Shift</option>
                    <option value="night">Night Shift</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Number of Nurses</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={newQty}
                    onChange={(e) => setNewQty(Number(e.target.value))}
                    className="w-full h-8 rounded border border-slate-300 px-2 text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Required Competencies</label>
                <input
                  type="text"
                  value={newCompetency}
                  onChange={(e) => setNewCompetency(e.target.value)}
                  placeholder="e.g. ICU Certified, ACLS, Telemetry"
                  className="w-full h-8 rounded border border-slate-300 px-2 text-xs font-medium"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Clinical / Operational Reason</label>
                <textarea
                  rows={3}
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  placeholder="Describe acuity surge, unplanned absence, 1:1 observation need..."
                  className="w-full rounded border border-slate-300 p-2 text-xs font-medium"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Priority</label>
                <div className="flex gap-4">
                  {(["Urgent", "High", "Normal"] as const).map((p) => (
                    <label key={p} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="prio"
                        checked={newPriority === p}
                        onChange={() => setNewPriority(p)}
                      />
                      <span className="font-medium text-slate-700">{p}</span>
                    </label>
                  ))}
                </div>
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
/* 5. ASSIGNMENTS PANEL                                            */
/* ─────────────────────────────────────────────────────────────── */
function AssignmentsPanel({
  assignments,
  onEndDeployment,
}: {
  assignments: FloatAssignment[];
  onEndDeployment: (asnId: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4 max-w-[1400px] mx-auto">
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Approved Float Deployments</h2>
          <p className="text-xs text-slate-500">
            Active and scheduled nurse deployments across hospital wards.
          </p>
        </div>
        <span className="text-xs text-slate-500">
          <strong>{assignments.filter((a) => a.status === "Active").length}</strong> currently active
        </span>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold">
                <th className="py-3 px-3.5">Nurse & Grade</th>
                <th className="py-3 px-3.5">Home Unit</th>
                <th className="py-3 px-3.5">Deployed Unit</th>
                <th className="py-3 px-3.5">Shift / Date</th>
                <th className="py-3 px-3.5">Assignment Focus</th>
                <th className="py-3 px-3.5">Supervisor / Preceptor</th>
                <th className="py-3 px-3.5">Approved By</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assignments.map((asn) => (
                <tr key={asn.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3.5 font-bold text-slate-900 flex items-center gap-1.5">
                    <UserCheck className="h-3.5 w-3.5 text-blue-600" />
                    {asn.nurseName} ({asn.grade})
                  </td>
                  <td className="py-3 px-3.5 text-slate-600">{asn.homeUnit}</td>
                  <td className="py-3 px-3.5 font-semibold text-slate-900">{asn.deployedUnit}</td>
                  <td className="py-3 px-3.5 text-slate-600 uppercase font-medium">
                    {asn.shift} · {asn.date}
                  </td>
                  <td className="py-3 px-3.5 text-slate-700 max-w-[240px]">
                    <div className="line-clamp-2">{asn.roleDescription}</div>
                  </td>
                  <td className="py-3 px-3.5 text-slate-600">{asn.preceptorSupervisor}</td>
                  <td className="py-3 px-3.5 text-slate-500">{asn.approvedBy}</td>
                  <td className="py-3 px-3.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        asn.status === "Active"
                          ? "bg-emerald-100 text-emerald-800"
                          : asn.status === "In Handover"
                          ? "bg-amber-100 text-amber-800"
                          : asn.status === "Scheduled"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {asn.status}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-right">
                    {asn.status === "Active" ? (
                      <button
                        onClick={() => onEndDeployment(asn.id)}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:underline"
                      >
                        End Deployment
                      </button>
                    ) : (
                      <span className="text-slate-400 text-xs">—</span>
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

/* ─────────────────────────────────────────────────────────────── */
/* 6. FLOAT HISTORY PANEL                                          */
/* ─────────────────────────────────────────────────────────────── */
function FloatHistoryPanel({ records }: { records: FloatHistoryRecord[] }) {
  return (
    <div className="flex flex-col gap-4 max-w-[1400px] mx-auto">
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Float Movement History & Audit Log</h2>
          <p className="text-xs text-slate-500">
            Historical deployment records, clinical feedback, and compliance timestamps.
          </p>
        </div>
        <span className="text-xs text-slate-500">
          Showing <strong>{records.length}</strong> recent movements
        </span>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold">
                <th className="py-3 px-3.5">Date</th>
                <th className="py-3 px-3.5">Nurse</th>
                <th className="py-3 px-3.5">Home Unit</th>
                <th className="py-3 px-3.5">Floated Unit</th>
                <th className="py-3 px-3.5">Shift & Hours</th>
                <th className="py-3 px-3.5">Reason for Float</th>
                <th className="py-3 px-3.5">Clinical Feedback / Handover Note</th>
                <th className="py-3 px-3.5">Logged By</th>
                <th className="py-3 px-3.5">Audit ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3.5 font-medium text-slate-700">{rec.date}</td>
                  <td className="py-3 px-3.5 font-bold text-slate-900">
                    {rec.nurseName} ({rec.grade})
                  </td>
                  <td className="py-3 px-3.5 text-slate-600">{rec.homeUnit}</td>
                  <td className="py-3 px-3.5 font-semibold text-blue-700">{rec.floatedUnit}</td>
                  <td className="py-3 px-3.5 text-slate-700 font-medium">
                    {rec.shift} ({rec.hours}h)
                  </td>
                  <td className="py-3 px-3.5 text-slate-600 max-w-[200px]">{rec.reason}</td>
                  <td className="py-3 px-3.5 text-slate-700 max-w-[280px]">
                    <div className="italic text-[11px] text-slate-600">"{rec.clinicalFeedback}"</div>
                  </td>
                  <td className="py-3 px-3.5 text-slate-500">{rec.loggedBy}</td>
                  <td className="py-3 px-3.5 font-mono text-[10px] text-slate-400">{rec.auditId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
