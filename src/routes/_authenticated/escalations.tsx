import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { WorkforceNav } from "@/components/WorkforceNav";
import {
  AlertTriangle,
  LayoutDashboard,
  Users,
  Activity,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Building2,
  ShieldCheck,
  Search,
  Filter,
  PlusCircle,
  FileText,
  ArrowRight,
  UserCheck,
  UserX,
  Send,
  AlertCircle,
  TrendingUp,
  XCircle,
  Info,
  Timer,
  ChevronRight,
  Shield,
  Layers,
} from "lucide-react";
import { DEPARTMENTS, Department, getDept } from "@/lib/departments";

/* ── Route Definition ─────────────────────────────────────────── */
export const Route = createFileRoute("/_authenticated/escalations")({
  validateSearch: (search: Record<string, unknown>): { tab?: string } => ({
    tab: typeof search.tab === "string" ? search.tab : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Escalations · Workforce Operations · NOS" },
      {
        name: "description",
        content:
          "Operational escalation, SLA response tracking, and resolution management across staffing, workload, and operational safety.",
      },
    ],
  }),
  component: EscalationsPage,
});

/* ── Secondary Tabs ───────────────────────────────────────────── */
type TabId = "overview" | "active" | "staffing" | "workload" | "safety" | "history";

interface TabDef {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const TABS: TabDef[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "active", label: "Active Escalations", icon: AlertTriangle, badge: 9 },
  { id: "staffing", label: "Staffing", icon: Users, badge: 4 },
  { id: "workload", label: "Workload", icon: Activity, badge: 3 },
  { id: "safety", label: "Safety", icon: ShieldAlert, badge: 2 },
  { id: "history", label: "Resolution History", icon: Clock },
];

/* ── Types & Demo Dataset ─────────────────────────────────────── */
export type EscalationCategory = "staffing" | "workload" | "safety";
export type PriorityLevel = "Critical" | "High" | "Medium" | "Low";
export type EscalationStatus = "Open" | "In Investigation" | "Action Planned" | "Awaiting Sign-off" | "Resolved";

export interface EscalationItem {
  id: string;
  title: string;
  description: string;
  category: EscalationCategory;
  deptId: Department;
  unitName: string;
  priority: PriorityLevel;
  createdTime: string;
  timeElapsed: string;
  slaMinutesRemaining: number; // e.g. 15 for critical
  owner: string;
  ownerAssigned: boolean;
  status: EscalationStatus;
  requiredAction: string;
  suggestedMitigation: string;
  loggedBy: string;
  notes: string[];
}

export interface ResolvedEscalationRecord {
  id: string;
  title: string;
  category: EscalationCategory;
  unitName: string;
  owner: string;
  actionTaken: string;
  resolutionTimeMinutes: number;
  resolvedAt: string;
  finalStatus: string;
  auditSignoff: string;
}

const INITIAL_ESCALATIONS: EscalationItem[] = [
  {
    id: "ESC-801",
    title: "ICU Night Shift: Unfilled Senior Ventilator RN Slot",
    description: "3 mechanical vent admissions received in last 2 hours. Minimum 1:2 ICU ratio requires 1 additional ACLS/Ventilator certified nurse immediately.",
    category: "staffing",
    deptId: "icu",
    unitName: "Intensive Care Unit (ICU)",
    priority: "Critical",
    createdTime: "18:30 (25 min ago)",
    timeElapsed: "25 min",
    slaMinutesRemaining: 5,
    owner: "Nurse Supervisor K. Daniels",
    ownerAssigned: true,
    status: "In Investigation",
    requiredAction: "Dispatch Float Pool nurse Elena Rostova (ICU Certified) or call in on-call critical care RN.",
    suggestedMitigation: "Float Pool Central roster shows 2 available ICU certified nurses ready for deployment.",
    loggedBy: "Charge Nurse G. Henderson",
    notes: ["18:40 — Supervisor acknowledged, reviewing Float Pool availability."],
  },
  {
    id: "ESC-802",
    title: "Emergency Dept: 2 Short-Notice Sick Call-ins for Evening Shift",
    description: "2 triage-competent RNs called in sick 45 minutes prior to evening shift start during high admission intake.",
    category: "staffing",
    deptId: "ed",
    unitName: "Emergency Department (ED)",
    priority: "Critical",
    createdTime: "17:45 (1h 10m ago)",
    timeElapsed: "1h 10m",
    slaMinutesRemaining: -10, // SLA breached
    owner: "Unassigned",
    ownerAssigned: false,
    status: "Open",
    requiredAction: "Assign duty supervisor to mobilize on-call ED roster and reallocate 1 float triage RN.",
    suggestedMitigation: "Nurse Amina Al-Mansoor (SN) available for evening shift dispatch.",
    loggedBy: "ED Triage Lead Dr. R. Patel",
    notes: [],
  },
  {
    id: "ESC-803",
    title: "ED Resuscitation Bay: 140% Bed Capacity Surge",
    description: "6 pending resus transfers awaiting beds. Nurse-to-patient workload index exceeded safe threshold.",
    category: "workload",
    deptId: "ed",
    unitName: "Emergency Department (ED)",
    priority: "Critical",
    createdTime: "18:15 (40 min ago)",
    timeElapsed: "40 min",
    slaMinutesRemaining: 20,
    owner: "ED Lead Nurse T. Bennett",
    ownerAssigned: true,
    status: "Action Planned",
    requiredAction: "Authorize emergency surge protocol: activate fast-track discharge lounge and assign runner nurse.",
    suggestedMitigation: "Reallocate bedside non-clinical tasks to ward runner assistant.",
    loggedBy: "ED Lead Nurse T. Bennett",
    notes: ["18:25 — Clinical Director notified; rapid discharge lounge opened."],
  },
  {
    id: "ESC-804",
    title: "Med-Surg Floor: Float Request Unfulfilled for 4 Hours",
    description: "Post-op admission surge from afternoon elective surgical list. Float request REQ-403 still in review.",
    category: "staffing",
    deptId: "medsurg",
    unitName: "Medical-Surg Floor",
    priority: "High",
    createdTime: "15:00 (3h 55m ago)",
    timeElapsed: "3h 55m",
    slaMinutesRemaining: 5,
    owner: "Workforce Coordinator S. Miller",
    ownerAssigned: true,
    status: "In Investigation",
    requiredAction: "Expedite float assignment from donor unit (Maternity surplus).",
    suggestedMitigation: "Carlos Reyes (RN) eligible for immediate Med-Surg step-down care.",
    loggedBy: "Charge Nurse C. Watson",
    notes: ["16:00 — Evaluated donor unit capacity."],
  },
  {
    id: "ESC-805",
    title: "Medical Ward: Bedside Nurse Assigned 5 High-Acuity Patients",
    description: "Ratio imbalance on Medical Bay 3: 1 RN managing 5 complex multi-morbidity patients (safe ratio standard is 1:3).",
    category: "workload",
    deptId: "medical",
    unitName: "Medical Ward",
    priority: "High",
    createdTime: "17:10 (1h 45m ago)",
    timeElapsed: "1h 45m",
    slaMinutesRemaining: 15,
    owner: "Charge Nurse L. Moreau",
    ownerAssigned: true,
    status: "Action Planned",
    requiredAction: "Rebalance patient assignments with Bay 1; redistribute medication rounds to senior nurse.",
    suggestedMitigation: "Transfer 2 stable observation patients to Day Care pod.",
    loggedBy: "Staff Nurse M. Vance",
    notes: ["17:30 — Initial workload assessment completed."],
  },
  {
    id: "ESC-806",
    title: "Delayed 2-Nurse Verification for Blood Product Transfusion",
    description: "Operational bottleneck: Bedside nurse unable to secure second registered nurse for mandatory dual verification due to short staffing.",
    category: "safety",
    deptId: "surgical",
    unitName: "Surgical Ward",
    priority: "High",
    createdTime: "18:00 (55 min ago)",
    timeElapsed: "55 min",
    slaMinutesRemaining: 5,
    owner: "Charge Nurse V. Larson",
    ownerAssigned: true,
    status: "In Investigation",
    requiredAction: "Dispatch Surgical charge nurse to assist with bedside verification checklist immediately.",
    suggestedMitigation: "Non-diagnostic operational workflow safety rule: do not bypass 2-nurse sign-off.",
    loggedBy: "Staff Nurse D. Chen",
    notes: [],
  },
  {
    id: "ESC-807",
    title: "Cardiac Ward: Consecutive Night Shift Limit Alert",
    description: "Circadian safety rule: Nurse Sarah Jenkins scheduled for 4th consecutive night shift (institution policy cap is 3 nights).",
    category: "staffing",
    deptId: "cardiac",
    unitName: "Cardiac Ward",
    priority: "Medium",
    createdTime: "14:00 (4h 55m ago)",
    timeElapsed: "4h 55m",
    slaMinutesRemaining: 65,
    owner: "Nurse Manager L. Moreau",
    ownerAssigned: true,
    status: "Action Planned",
    requiredAction: "Swap night shift assignment with day-rest staff member to avoid fatigue risk.",
    suggestedMitigation: "Sophie Dubois available to cover night duty.",
    loggedBy: "Duty Scheduling Engine Signal",
    notes: ["15:00 — Employee contacted; agrees with schedule swap."],
  },
  {
    id: "ESC-808",
    title: "Surgical Ward: Documentation & Order Backlog (18 Delayed Orders)",
    description: "High administrative burden signal: 18 post-operative medication and lab orders delayed past standard processing target.",
    category: "workload",
    deptId: "surgical",
    unitName: "Surgical Ward",
    priority: "Medium",
    createdTime: "16:20 (2h 35m ago)",
    timeElapsed: "2h 35m",
    slaMinutesRemaining: 85,
    owner: "Unassigned",
    ownerAssigned: false,
    status: "Open",
    requiredAction: "Assign ward administration runner to assist clinical staff with EHR documentation workflow.",
    suggestedMitigation: "Reallocate non-clinical order transcription.",
    loggedBy: "Workflow Intelligence Signal",
    notes: [],
  },
  {
    id: "ESC-809",
    title: "Isolation Room Negative Pressure Airflow Operational Alert",
    description: "Environmental monitoring signal: Negative pressure sensor in Isolation Room 4 (ICU) reading near threshold limit.",
    category: "safety",
    deptId: "icu",
    unitName: "Intensive Care Unit (ICU)",
    priority: "High",
    createdTime: "17:55 (1h ago)",
    timeElapsed: "1h 00m",
    slaMinutesRemaining: 0,
    owner: "Estates & Nursing Safety Officer",
    ownerAssigned: true,
    status: "In Investigation",
    requiredAction: "Escalate to Hospital Estates & Clinical Safety lead for urgent airflow calibration.",
    suggestedMitigation: "Non-diagnostic operational safety alert. Clinical management notified.",
    loggedBy: "Ward Environmental Sensor System",
    notes: ["18:10 — Estates engineer dispatched to check ventilation filters."],
  },
];

const RESOLVED_HISTORY: ResolvedEscalationRecord[] = [
  {
    id: "ESC-789",
    title: "Paediatric Ward: 1:1 High Observation Respiratory Cover",
    category: "staffing",
    unitName: "Pediatric Ward",
    owner: "Charge Nurse M. Rossi",
    actionTaken: "Priya Sharma (RN) deployed from Float Pool to cover 1:1 RSV isolation observation.",
    resolutionTimeMinutes: 32,
    resolvedAt: "2026-10-03 15:32",
    finalStatus: "Resolved",
    auditSignoff: "Approved by Workforce Coordinator S. Miller",
  },
  {
    id: "ESC-788",
    title: "Labour Room: Unexpected Multi-Gestation Arrival",
    category: "workload",
    unitName: "Labour Room",
    owner: "Maternity Lead H. Lindqvist",
    actionTaken: "Cross-covered 1 Midwife from Postnatal Ward; second stage delivery completed safely.",
    resolutionTimeMinutes: 45,
    resolvedAt: "2026-10-03 13:15",
    finalStatus: "Resolved",
    auditSignoff: "Signed off by Dr. E. Nwosu (Obstetric Lead)",
  },
  {
    id: "ESC-787",
    title: "Medication Cupboard Key Handover Delay During Shift Change",
    category: "safety",
    unitName: "Medical-Surg Floor",
    owner: "Charge Nurse C. Watson",
    actionTaken: "Dual custody audit completed; key returned and electronic log updated.",
    resolutionTimeMinutes: 18,
    resolvedAt: "2026-10-02 23:18",
    finalStatus: "Resolved",
    auditSignoff: "Logged in Pharmacy Safety Audit Trail",
  },
  {
    id: "ESC-786",
    title: "Cardiac Step-Down: Telemetry Monitor Gateway Disconnection",
    category: "safety",
    unitName: "Cardiac Ward",
    owner: "Biomedical Engineering & Charge Nurse",
    actionTaken: "Backup telemetry hub activated; all 12 patient wave streams restored.",
    resolutionTimeMinutes: 24,
    resolvedAt: "2026-10-02 19:40",
    finalStatus: "Resolved",
    auditSignoff: "Verified by Clinical Engineering On-Call",
  },
];

/* ── Main Component ───────────────────────────────────────────── */
export default function EscalationsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();

  const activeTab: TabId = (
    TABS.some((t) => t.id === search.tab) ? search.tab : "overview"
  ) as TabId;

  const setActiveTab = (tab: TabId) => {
    navigate({
      to: "/escalations",
      search: { tab },
    });
  };

  const [escalations, setEscalations] = useState<EscalationItem[]>(INITIAL_ESCALATIONS);
  const [resolvedHistory, setResolvedHistory] = useState<ResolvedEscalationRecord[]>(RESOLVED_HISTORY);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredEscalations = useMemo(() => {
    return escalations.filter((esc) => {
      const matchesSearch =
        esc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        esc.unitName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        esc.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = categoryFilter === "all" || esc.category === categoryFilter;
      const matchesPrio = priorityFilter === "all" || esc.priority === priorityFilter;
      const matchesStatus = statusFilter === "all" || esc.status === statusFilter;

      return matchesSearch && matchesCat && matchesPrio && matchesStatus;
    });
  }, [escalations, searchQuery, categoryFilter, priorityFilter, statusFilter]);

  // Action handlers
  const handleAssignOwner = (id: string, ownerName: string) => {
    setEscalations((prev) =>
      prev.map((esc) =>
        esc.id === id
          ? {
              ...esc,
              owner: ownerName || "Authorized Nurse Manager (You)",
              ownerAssigned: true,
              status: "In Investigation",
              notes: [
                ...esc.notes,
                `Assigned to ${ownerName || "Authorized Nurse Manager (You)"} at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
              ],
            }
          : esc
      )
    );
    setToastMessage(`Escalation ${id} owner assigned.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleResolveEscalation = (id: string, resolutionAction: string) => {
    const escToResolve = escalations.find((e) => e.id === id);
    if (!escToResolve) return;

    const resolvedRecord: ResolvedEscalationRecord = {
      id: escToResolve.id,
      title: escToResolve.title,
      category: escToResolve.category,
      unitName: escToResolve.unitName,
      owner: escToResolve.owner !== "Unassigned" ? escToResolve.owner : "Healthcare Leadership",
      actionTaken: resolutionAction || escToResolve.requiredAction,
      resolutionTimeMinutes: 35,
      resolvedAt: new Date().toLocaleString([], { dateStyle: "short", timeStyle: "short" }),
      finalStatus: "Resolved",
      auditSignoff: `Verified by Authorized Manager (${new Date().toLocaleTimeString()})`,
    };

    setResolvedHistory((prev) => [resolvedRecord, ...prev]);
    setEscalations((prev) => prev.filter((e) => e.id !== id));

    setToastMessage(`Escalation ${id} marked as resolved and logged in audit history.`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 font-sans bg-[#F8FAFC] text-slate-900">
      {/* ── Level 2: Workforce Operations Primary Navigation ── */}
      <div className="w-full min-w-0 bg-white border-b border-slate-200 px-4 sm:px-6 pt-3 pb-1 shrink-0">
        <WorkforceNav activeTab="escalations" />
      </div>

      {/* ── Level 3: Escalations Module Secondary Navigation (Dedicated Row) ── */}
      <div className="w-full bg-white/80 border-b border-slate-200/80 px-4 sm:px-6 py-1.5 shrink-0 shadow-2xs">
        <nav
          className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pr-6 min-w-full"
          aria-label="Escalations Secondary Navigation"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const count =
              tab.id === "active"
                ? escalations.length
                : tab.id === "staffing"
                ? escalations.filter((e) => e.category === "staffing").length
                : tab.id === "workload"
                ? escalations.filter((e) => e.category === "workload").length
                : tab.id === "safety"
                ? escalations.filter((e) => e.category === "safety").length
                : undefined;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                type="button"
                className={`inline-flex items-center gap-2 whitespace-nowrap px-3.5 py-1.5 text-[12px] font-medium rounded-lg transition-colors cursor-pointer shrink-0 select-none ${
                  isActive
                    ? "bg-rose-50 text-rose-700 font-semibold border border-rose-200/90 shadow-2xs"
                    : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 border border-transparent"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-rose-600" : "text-slate-400"}`} />
                <span>{tab.label}</span>
                {count !== undefined && count > 0 && (
                  <span
                    className={`ml-0.5 text-[9.5px] font-bold px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? "bg-rose-100 text-rose-800"
                        : "bg-slate-200/70 text-slate-700"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── Module Header Banner ── */}
      <header className="px-4 sm:px-6 pt-3.5 pb-2 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.14em] text-rose-600">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Workforce Operations · Operational Escalations</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-0.5">
              Escalation & Operational Resolution
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Operational escalation, SLA response tracking, and resolution management across staffing, workload, and safety.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-md border border-rose-200 bg-rose-50 text-rose-700">
              Prototype · Operational Signals
            </span>
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-md border border-slate-200 bg-slate-100 text-slate-600">
              Demo Dataset
            </span>
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-md border border-slate-200 bg-slate-50 text-slate-600">
              Non-Diagnostic · Human Governed
            </span>
          </div>
        </div>
      </header>

      {/* ── Toast Notification Banner ─────────────────────────── */}
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

      {/* ── Tab Content Panels ────────────────────────────────── */}
      <main className="flex-1 min-h-0 p-5 overflow-y-auto">
        {activeTab === "overview" && (
          <EscalationsOverviewPanel
            escalations={escalations}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === "active" && (
          <ActiveEscalationsPanel
            escalations={filteredEscalations}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onAssignOwner={handleAssignOwner}
            onResolve={handleResolveEscalation}
            onCreateEscalation={(newEsc) => {
              setEscalations((prev) => [newEsc, ...prev]);
            }}
          />
        )}

        {activeTab === "staffing" && (
          <CategorizedEscalationsPanel
            category="staffing"
            title="Staffing Escalations & Roster Deficits"
            subtitle="Unfilled critical shifts, unexpected sick calls, skill-mix deficits, and float pool requests."
            items={escalations.filter((e) => e.category === "staffing")}
            onAssignOwner={handleAssignOwner}
            onResolve={handleResolveEscalation}
          />
        )}

        {activeTab === "workload" && (
          <CategorizedEscalationsPanel
            category="workload"
            title="Workload & Capacity Escalations"
            subtitle="Bed capacity pressure, assignment ratio imbalances, and workflow/documentation bottlenecks."
            items={escalations.filter((e) => e.category === "workload")}
            onAssignOwner={handleAssignOwner}
            onResolve={handleResolveEscalation}
          />
        )}

        {activeTab === "safety" && (
          <SafetyEscalationsPanel
            items={escalations.filter((e) => e.category === "safety")}
            onAssignOwner={handleAssignOwner}
            onResolve={handleResolveEscalation}
          />
        )}

        {activeTab === "history" && (
          <ResolutionHistoryPanel records={resolvedHistory} />
        )}
      </main>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/* 1. ESCALATIONS OVERVIEW PANEL                                   */
/* ─────────────────────────────────────────────────────────────── */
function EscalationsOverviewPanel({
  escalations,
  onNavigateTab,
}: {
  escalations: EscalationItem[];
  onNavigateTab: (tab: TabId) => void;
}) {
  const activeCount = escalations.length;
  const criticalCount = escalations.filter((e) => e.priority === "Critical").length;
  const unassignedCount = escalations.filter((e) => !e.ownerAssigned).length;
  const slaNearCount = escalations.filter(
    (e) => e.slaMinutesRemaining <= 15
  ).length;

  return (
    <div className="flex flex-col gap-5 max-w-[1400px] mx-auto">
      {/* ── KPI Row ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Active Escalations
            </span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{activeCount}</span>
            <span className="text-xs text-rose-600 font-medium">Open across hospital</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Across ICU, ED, Med-Surg, Surgical wards
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Critical Priority
            </span>
            <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-700">{criticalCount}</span>
            <span className="text-xs text-rose-700 font-medium">Immediate action</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            ICU ventilator shortage & ED surge
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Awaiting Owner
            </span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <UserX className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600">{unassignedCount}</span>
            <span className="text-xs text-amber-600 font-medium">Needs assignment</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Requires duty supervisor triage
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              SLA Deadline Alert
            </span>
            <div className="p-1.5 rounded-lg bg-orange-50 text-orange-600">
              <Timer className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-orange-600">{slaNearCount}</span>
            <span className="text-xs text-orange-600 font-medium">&lt; 15 min or breached</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Requires prompt resolution sign-off
          </p>
        </div>
      </div>

      {/* ── Category Cards Breakdown ──────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigateTab("staffing")}
          className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:border-blue-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <Users className="h-4 w-4 text-blue-600" />
              Staffing Escalations ({escalations.filter((e) => e.category === "staffing").length})
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Unfilled critical shifts, sudden absences, and skill-mix deficits requiring float deployment.
          </p>
        </div>

        <div
          onClick={() => onNavigateTab("workload")}
          className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:border-blue-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-amber-600" />
              Workload Escalations ({escalations.filter((e) => e.category === "workload").length})
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Capacity surges, patient acuity imbalances, and workflow backlog alerts.
          </p>
        </div>

        <div
          onClick={() => onNavigateTab("safety")}
          className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:border-blue-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-rose-600" />
              Operational Safety ({escalations.filter((e) => e.category === "safety").length})
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Non-diagnostic workflow safety bottlenecks, dual verification alerts, and environmental checks.
          </p>
        </div>
      </div>

      {/* ── Urgent Escalations Action Feed ────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-600" />
            Urgent Items Requiring Healthcare Leadership Attention
          </h2>
          <button
            onClick={() => onNavigateTab("active")}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            View All Active ({escalations.length})
          </button>
        </div>

        <div className="space-y-3">
          {escalations.slice(0, 3).map((esc) => (
            <div
              key={esc.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900">{esc.title}</span>
                  <span
                    className={`text-[9.5px] font-bold px-2 py-0.5 rounded ${
                      esc.priority === "Critical"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {esc.priority}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  Unit: <strong>{esc.unitName}</strong> · Elapsed: {esc.timeElapsed}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{esc.description}</p>
              <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <span className="text-slate-500">
                  Owner: <strong>{esc.owner}</strong>
                </span>
                <button
                  onClick={() => onNavigateTab("active")}
                  className="font-semibold text-blue-600 hover:underline"
                >
                  Open & Resolve →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/* 2. ACTIVE ESCALATIONS PANEL (Complete Action List)              */
/* ─────────────────────────────────────────────────────────────── */
function ActiveEscalationsPanel({
  escalations,
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  priorityFilter,
  setPriorityFilter,
  statusFilter,
  setStatusFilter,
  onAssignOwner,
  onResolve,
  onCreateEscalation,
}: {
  escalations: EscalationItem[];
  searchQuery: string;
  setSearchQuery: (s: string) => void;
  categoryFilter: string;
  setCategoryFilter: (c: string) => void;
  priorityFilter: string;
  setPriorityFilter: (p: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  onAssignOwner: (id: string, owner: string) => void;
  onResolve: (id: string, action: string) => void;
  onCreateEscalation: (item: EscalationItem) => void;
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<EscalationCategory>("staffing");
  const [newDept, setNewDept] = useState<Department>("icu");
  const [newPriority, setNewPriority] = useState<PriorityLevel>("High");
  const [newDesc, setNewDesc] = useState("");
  const [newAction, setNewAction] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const dept = getDept(newDept);
    const newEsc: EscalationItem = {
      id: `ESC-${Math.floor(810 + Math.random() * 100)}`,
      title: newTitle,
      description: newDesc,
      category: newCategory,
      deptId: newDept,
      unitName: dept?.name || "Clinical Unit",
      priority: newPriority,
      createdTime: "Just now",
      timeElapsed: "0 min",
      slaMinutesRemaining: newPriority === "Critical" ? 15 : newPriority === "High" ? 60 : 120,
      owner: "Unassigned",
      ownerAssigned: false,
      status: "Open",
      requiredAction: newAction || "Assess and formulate mitigation plan.",
      suggestedMitigation: "Mobilize unit or float pool resources.",
      loggedBy: "Authorized Healthcare Manager (Direct Entry)",
      notes: [],
    };
    onCreateEscalation(newEsc);
    setShowCreateModal(false);
    setNewTitle("");
    setNewDesc("");
    setNewAction("");
  };

  return (
    <div className="flex flex-col gap-4 max-w-[1400px] mx-auto">
      {/* Search & Filter Header */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0 w-full">
          <div className="relative flex-1 min-w-0 w-full sm:min-w-[180px]">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search escalations by title, unit, or issue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700"
          >
            <option value="all">All Categories</option>
            <option value="staffing">Staffing Only</option>
            <option value="workload">Workload Only</option>
            <option value="safety">Safety Only</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700"
          >
            <option value="all">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Investigation">In Investigation</option>
            <option value="Action Planned">Action Planned</option>
          </select>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          <span>Log Escalation</span>
        </button>
      </div>

      {/* Escalations List */}
      <div className="space-y-3.5">
        {escalations.map((esc) => (
          <div
            key={esc.id}
            className={`p-4 sm:p-5 rounded-xl border bg-white shadow-2xs space-y-3 ${
              esc.priority === "Critical"
                ? "border-rose-300"
                : "border-slate-200"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">{esc.title}</span>
                  <span
                    className={`text-[9.5px] font-bold px-2 py-0.5 rounded ${
                      esc.priority === "Critical"
                        ? "bg-rose-100 text-rose-700 border border-rose-200"
                        : esc.priority === "High"
                        ? "bg-amber-100 text-amber-700 border border-amber-200"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {esc.priority}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 uppercase">
                    {esc.category}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Unit: <strong className="text-slate-700">{esc.unitName}</strong> · Logged: {esc.createdTime} by {esc.loggedBy}
                </div>
              </div>

              {/* SLA & Status Pill */}
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1 ${
                    esc.slaMinutesRemaining < 0
                      ? "bg-rose-100 text-rose-800"
                      : esc.slaMinutesRemaining <= 15
                      ? "bg-amber-100 text-amber-800"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  <Timer className="h-3.5 w-3.5" />
                  <span>
                    {esc.slaMinutesRemaining < 0
                      ? `SLA Breached (${Math.abs(esc.slaMinutesRemaining)}m overdue)`
                      : `${esc.slaMinutesRemaining}m SLA remaining`}
                  </span>
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                  {esc.status}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {esc.description}
            </p>

            {/* Required Action & Recommendation */}
            <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-100 text-xs">
              <span className="font-bold text-blue-900">Required Action / Recommendation:</span>
              <p className="text-slate-700 mt-0.5">{esc.requiredAction}</p>
            </div>

            {/* Action Bar */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                Owner:{" "}
                <strong className={esc.ownerAssigned ? "text-slate-900" : "text-amber-600 font-bold"}>
                  {esc.owner}
                </strong>
              </div>

              <div className="flex items-center gap-2">
                {!esc.ownerAssigned && (
                  <button
                    onClick={() => onAssignOwner(esc.id, "Nurse Supervisor")}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition"
                  >
                    Assign Owner
                  </button>
                )}

                <button
                  onClick={() => onResolve(esc.id, esc.requiredAction)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-2xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Mark Resolved</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Log Escalation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base">Log Operational Escalation</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Escalation Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. ICU Shortfall during multi-trauma reception"
                  className="w-full h-8 rounded border border-slate-300 px-2 text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as EscalationCategory)}
                    className="w-full h-8 rounded border border-slate-300 px-2 text-xs font-medium"
                  >
                    <option value="staffing">Staffing</option>
                    <option value="workload">Workload</option>
                    <option value="safety">Operational Safety</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Department</label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value as Department)}
                    className="w-full h-8 rounded border border-slate-300 px-2 text-xs font-medium"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as PriorityLevel)}
                  className="w-full h-8 rounded border border-slate-300 px-2 text-xs font-medium"
                >
                  <option value="Critical">Critical (&lt;15m Response)</option>
                  <option value="High">High (&lt;60m Response)</option>
                  <option value="Medium">Medium (&lt;2h Response)</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Detailed Description</label>
                <textarea
                  rows={2}
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Describe operational bottleneck, ratio strain, or shortage..."
                  className="w-full rounded border border-slate-300 p-2 text-xs font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Required Action</label>
                <input
                  type="text"
                  required
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  placeholder="e.g. Dispatch float pool nurse or reassign beds"
                  className="w-full h-8 rounded border border-slate-300 px-2 text-xs font-medium"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold rounded bg-rose-600 text-white hover:bg-rose-700"
                >
                  Log Escalation
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
/* 3. CATEGORIZED ESCALATIONS PANEL (Staffing / Workload)          */
/* ─────────────────────────────────────────────────────────────── */
function CategorizedEscalationsPanel({
  category,
  title,
  subtitle,
  items,
  onAssignOwner,
  onResolve,
}: {
  category: EscalationCategory;
  title: string;
  subtitle: string;
  items: EscalationItem[];
  onAssignOwner: (id: string, owner: string) => void;
  onResolve: (id: string, action: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4 max-w-[1400px] mx-auto">
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
        <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
      </div>

      <div className="space-y-3">
        {items.map((esc) => (
          <div
            key={esc.id}
            className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900">{esc.title}</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  esc.priority === "Critical"
                    ? "bg-rose-100 text-rose-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {esc.priority}
              </span>
            </div>
            <p className="text-xs text-slate-600">{esc.description}</p>
            <div className="p-2.5 rounded bg-slate-50 text-xs text-slate-700 border border-slate-200/70">
              <strong>Action Plan:</strong> {esc.requiredAction}
            </div>
            <div className="pt-2 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Unit: <strong>{esc.unitName}</strong> · Owner: <strong>{esc.owner}</strong>
              </span>
              <button
                onClick={() => onResolve(esc.id, esc.requiredAction)}
                className="px-3 py-1 text-xs font-semibold rounded bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Resolve
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/* 4. SAFETY ESCALATIONS PANEL (Non-Diagnostic)                    */
/* ─────────────────────────────────────────────────────────────── */
function SafetyEscalationsPanel({
  items,
  onAssignOwner,
  onResolve,
}: {
  items: EscalationItem[];
  onAssignOwner: (id: string, owner: string) => void;
  onResolve: (id: string, action: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4 max-w-[1400px] mx-auto">
      {/* Explicit Clinical Disclaimer */}
      <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/70 text-slate-800 text-xs shadow-2xs flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Operational & Workflow Safety (Non-Diagnostic)</h3>
          <p className="mt-0.5 text-slate-600 leading-relaxed">
            This module monitors operational workflow safety, dual verification readiness, and environmental checks. NOS does not make clinical diagnostic or therapeutic safety decisions; authorized clinical leadership manages all patient care determinations.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((esc) => (
          <div
            key={esc.id}
            className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-rose-600" />
                {esc.title}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700">
                {esc.priority}
              </span>
            </div>
            <p className="text-xs text-slate-600">{esc.description}</p>
            <div className="p-2.5 rounded bg-rose-50/50 text-xs text-slate-800 border border-rose-100">
              <strong>Mitigation Protocol:</strong> {esc.requiredAction}
            </div>
            <div className="pt-2 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Unit: <strong>{esc.unitName}</strong> · Owner: <strong>{esc.owner}</strong>
              </span>
              <button
                onClick={() => onResolve(esc.id, esc.requiredAction)}
                className="px-3 py-1 text-xs font-semibold rounded bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Resolve & Sign Off
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/* 5. RESOLUTION HISTORY PANEL                                     */
/* ─────────────────────────────────────────────────────────────── */
function ResolutionHistoryPanel({ records }: { records: ResolvedEscalationRecord[] }) {
  return (
    <div className="flex flex-col gap-4 max-w-[1400px] mx-auto">
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Escalation Resolution History & Audit Trail</h2>
          <p className="text-xs text-slate-500">
            Audit log of resolved operational escalations and authorized manager sign-offs.
          </p>
        </div>
        <span className="text-xs text-slate-500">
          <strong>{records.length}</strong> resolved records
        </span>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold">
                <th className="py-3 px-3.5">Escalation ID</th>
                <th className="py-3 px-3.5">Title</th>
                <th className="py-3 px-3.5">Category</th>
                <th className="py-3 px-3.5">Unit</th>
                <th className="py-3 px-3.5">Owner</th>
                <th className="py-3 px-3.5">Action Taken</th>
                <th className="py-3 px-3.5">Resolution Time</th>
                <th className="py-3 px-3.5">Audit Signoff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3.5 font-bold text-slate-900">{rec.id}</td>
                  <td className="py-3 px-3.5 font-semibold text-slate-900">{rec.title}</td>
                  <td className="py-3 px-3.5 uppercase text-blue-700 font-medium">
                    {rec.category}
                  </td>
                  <td className="py-3 px-3.5 text-slate-600">{rec.unitName}</td>
                  <td className="py-3 px-3.5 text-slate-800">{rec.owner}</td>
                  <td className="py-3 px-3.5 text-slate-600 max-w-[260px]">
                    <div className="line-clamp-2">{rec.actionTaken}</div>
                  </td>
                  <td className="py-3 px-3.5 font-medium text-emerald-600">
                    {rec.resolutionTimeMinutes} mins
                  </td>
                  <td className="py-3 px-3.5 text-[11px] text-slate-400 font-mono">
                    {rec.auditSignoff}
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
