import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { WorkforceNav } from "@/components/WorkforceNav";
import {
  Activity,
  LayoutDashboard,
  FlaskConical,
  Scan,
  ClipboardList,
  Syringe,
  Clock,
  BrainCircuit,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { getSession, type Session } from "@/lib/auth";

/* ── Route definition ─────────────────────────────────────────── */
export const Route = createFileRoute("/_authenticated/workflow-intelligence")({
  validateSearch: (search: Record<string, unknown>): { tab?: string } => ({
    tab: typeof search.tab === "string" ? search.tab : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Workflow Intelligence · NOS Health" },
      {
        name: "description",
        content:
          "AI-assisted coordination of clinical workflows across laboratory, radiology, wound care, and IV access.",
      },
    ],
  }),
  component: WorkflowIntelligencePage,
});

/* ── Tab IDs and model ────────────────────────────────────────── */
type TabId =
  | "overview"
  | "lab"
  | "rad"
  | "wound"
  | "iv"
  | "timeline"
  | "assistant";

interface TabDef {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const TABS: TabDef[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "lab", label: "Laboratory", icon: FlaskConical, badge: 2 },
  { id: "rad", label: "Radiology", icon: Scan, badge: 2 },
  { id: "wound", label: "Wound Care", icon: ClipboardList, badge: 1 },
  { id: "iv", label: "IV Access", icon: Syringe },
  { id: "timeline", label: "Shift Timeline", icon: Clock },
  { id: "assistant", label: "AI Assistant", icon: BrainCircuit },
];

/* ── Reference Demo Dataset ───────────────────────────────────── */
const PRIORITY_ITEMS = [
  {
    dept: "Wound Care",
    targetTab: "wound" as TabId,
    patient: "H. Ibrahim · W-203 · Diabetic foot",
    statusText: "DELAYED +55M",
    pillType: "crit",
    requester: "Physician req.",
  },
  {
    dept: "Radiology",
    targetTab: "rad" as TabId,
    patient: "T. Nakamura · RAD-506 · CT Chest",
    statusText: "DELAYED +35M",
    pillType: "crit",
    requester: "Reporting radiologist",
  },
  {
    dept: "Laboratory",
    targetTab: "lab" as TabId,
    patient: "R. Kumar · ICU-04 · LAB-1042",
    statusText: "DELAYED +22M",
    pillType: "crit",
    requester: "Dr. Aisha N.",
  },
  {
    dept: "Laboratory",
    targetTab: "lab" as TabId,
    patient: "S. Okoye · Troponin 3.2 ng/mL",
    statusText: "UNACKNOWLEDGED · 27 min",
    pillType: "crit",
    requester: "Awaiting clinician sign-off",
  },
  {
    dept: "Laboratory",
    targetTab: "lab" as TabId,
    patient: "R. Kumar · Potassium 6.4 mmol/L",
    statusText: "UNACKNOWLEDGED · 12 min",
    pillType: "crit",
    requester: "Awaiting clinician sign-off",
  },
  {
    dept: "IV Access",
    targetTab: "iv" as TabId,
    patient: "T. Nakamura · IV-33 · Pediatric cannulation",
    statusText: "PENDING",
    pillType: "watch",
    requester: "Awaiting responder",
  },
];

type TimelineStatus = "completed" | "delayed" | "pending" | "rescheduled";

const TIMELINE_DATA: {
  status: TimelineStatus;
  time: string;
  dept: string;
  badge: string;
  desc: string;
}[] = [
  {
    status: "completed",
    time: "08:00",
    dept: "Laboratory",
    badge: "COMPLETED",
    desc: "Morning bloods drawn — 24 of 26",
  },
  {
    status: "delayed",
    time: "09:00",
    dept: "Wound Review",
    badge: "DELAYED",
    desc: "3 dressings awaiting nurse-led review",
  },
  {
    status: "pending",
    time: "10:00",
    dept: "Medication",
    badge: "PENDING",
    desc: "AM round in progress",
  },
  {
    status: "rescheduled",
    time: "11:30",
    dept: "Radiology",
    badge: "RESCHEDULED",
    desc: "CT slot moved from 09:15",
  },
  {
    status: "pending",
    time: "14:00",
    dept: "Physician Review",
    badge: "PENDING",
    desc: "6 patients on round list",
  },
  {
    status: "pending",
    time: "16:00",
    dept: "Follow-up",
    badge: "PENDING",
    desc: "Handoff + reassessments",
  },
];

const LAB_ROWS = [
  {
    time: "08:15",
    patient: "R. Kumar · ICU-04 · LAB-1042",
    prio: "Emergency",
    prioType: "crit",
    req: "Dr. Aisha N.",
    status: "DELAYED · +22M",
    statusType: "crit",
  },
  {
    time: "08:30",
    patient: "M. Al-Farsi · MED-12 · LAB-1043",
    prio: "Routine",
    prioType: "watch",
    req: "Dr. Patel",
    status: "PENDING",
    statusType: "watch",
  },
  {
    time: "08:45",
    patient: "S. Okoye · ED-07 · LAB-1044",
    prio: "Emergency",
    prioType: "crit",
    req: "Dr. Chen",
    status: "PENDING",
    statusType: "watch",
  },
  {
    time: "09:00",
    patient: "L. Haddad · SUR-03 · LAB-1045",
    prio: "Routine",
    prioType: "watch",
    req: "Dr. Rossi",
    status: "SCHEDULED",
    statusType: "safe",
  },
  {
    time: "09:30",
    patient: "T. Nakamura · MED-08 · LAB-1046",
    prio: "Routine",
    prioType: "watch",
    req: "Dr. Patel",
    status: "SCHEDULED",
    statusType: "safe",
  },
];

const CRITICAL_RESULTS = [
  {
    id: "CR-1",
    patient: "R. Kumar",
    detail: "Potassium 6.4 mmol/L",
    time: "Flagged 12 min ago",
    status: "UNACKNOWLEDGED",
    type: "crit",
    ack: false,
  },
  {
    id: "CR-2",
    patient: "S. Okoye",
    detail: "Troponin 3.2 ng/mL",
    time: "Flagged 27 min ago",
    status: "UNACKNOWLEDGED",
    type: "crit",
    ack: false,
  },
  {
    id: "CR-3",
    patient: "H. Ibrahim",
    detail: "Hb 6.1 g/dL",
    time: "Flagged 1h 05m ago",
    status: "ACK",
    type: "safe",
    ack: true,
  },
];

const RADIOLOGY_QUEUE = [
  { exam: "Chest X-Ray", detail: "R. Kumar · RAD-501 · ETA 10:00", status: "PENDING", type: "watch" },
  { exam: "CT Abdomen", detail: "N. Silva · RAD-502 · ETA 11:30", status: "SCHEDULED", type: "safe" },
  { exam: "MRI Brain", detail: "M. Al-Farsi · RAD-503 · ETA 13:00", status: "SCHEDULED", type: "safe" },
  { exam: "US Doppler", detail: "P. Adebayo · RAD-504 · ETA 07:45", status: "COMPLETED", type: "safe" },
  { exam: "Portable CXR", detail: "L. Haddad · RAD-505 · ETA 08:20", status: "REPORTING", type: "watch" },
  { exam: "CT Chest", detail: "T. Nakamura · RAD-506 · ETA 09:15", status: "DELAYED · +35M", type: "crit" },
];

const WOUND_ROWS = [
  {
    due: "09:00",
    patient: "L. Haddad · W-201",
    type: "Post-op abdominal",
    nurseLed: "PERMITTED",
    nurseLedType: "safe",
    docs: "PENDING",
    docsType: "watch",
    status: "SCHEDULED",
    statusType: "safe",
  },
  {
    due: "09:30",
    patient: "P. Adebayo · W-202",
    type: "Pressure ulcer II",
    nurseLed: "PERMITTED",
    nurseLedType: "safe",
    docs: "COMPLETE",
    docsType: "safe",
    status: "SCHEDULED",
    statusType: "safe",
  },
  {
    due: "08:00",
    patient: "H. Ibrahim · W-203",
    type: "Diabetic foot",
    nurseLed: "PHYSICIAN REQ.",
    nurseLedType: "neutral",
    docs: "PENDING",
    docsType: "watch",
    status: "DELAYED · +55M",
    statusType: "crit",
  },
  {
    due: "10:30",
    patient: "N. Silva · W-204",
    type: "Surgical incision",
    nurseLed: "PHYSICIAN REQ.",
    nurseLedType: "neutral",
    docs: "N/A",
    docsType: "neutral",
    status: "PHYSICIAN RESCHEDULED",
    statusType: "watch",
  },
  {
    due: "11:00",
    patient: "R. Kumar · W-205",
    type: "Central line site",
    nurseLed: "PERMITTED",
    nurseLedType: "safe",
    docs: "PENDING",
    docsType: "watch",
    status: "SCHEDULED",
    statusType: "safe",
  },
];

const IV_PENDING = [
  {
    patient: "T. Nakamura · IV-33",
    detail: "Pediatric cannulation",
    meta: "Responder: Awaiting · Response: —",
    status: "PENDING",
    type: "watch",
  },
];

const IV_PROGRESS = [
  {
    patient: "S. Okoye · IV-32",
    detail: "Difficult veins",
    meta: "Responder: IV Expert – J. Silva · Response 12 min",
    status: "IN PROGRESS",
    type: "watch",
  },
];

const IV_COMPLETED = [
  {
    patient: "M. Al-Farsi · IV-31",
    detail: "3× failed attempts",
    meta: "Responder: IV Expert – A. Rahim · Response 8 min",
    status: "COMPLETED",
    type: "safe",
  },
  {
    patient: "L. Haddad · IV-34",
    detail: "Extravasation risk",
    meta: "Responder: Nurse (bedside) · Response 5 min",
    status: "COMPLETED",
    type: "safe",
  },
];

const AI_INSIGHTS = [
  {
    kind: "obs" as const,
    label: "Observed",
    text: "3 emergency laboratory collections in ICU are overdue by more than 20 minutes.",
  },
  {
    kind: "adv" as const,
    label: "Advisory",
    text: "Review whether the phlebotomy runner or charge nurse can assist with ICU collections.",
  },
  {
    kind: "obs" as const,
    label: "Observed",
    text: "CT Chest (RAD-506) is delayed 35 minutes against the 45-minute turnaround target.",
  },
  {
    kind: "adv" as const,
    label: "Advisory",
    text: "Notify the reporting radiologist of the turnaround risk.",
  },
  {
    kind: "obs" as const,
    label: "Observed",
    text: "Diabetic foot wound review (W-203) is delayed 55 minutes and requires physician assessment; nurse-led review is not permitted for this case per policy.",
  },
  {
    kind: "adv" as const,
    label: "Advisory",
    text: "Confirm physician availability for the delayed review — the system does not approve or override this requirement.",
  },
];

/* ── Main Component ───────────────────────────────────────────── */
export default function WorkflowIntelligencePage() {
  const search = Route.useSearch();
  const navigate = useNavigate();

  const [session, setSess] = useState<Session | null>(null);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      navigate({ to: "/login" });
      return;
    }
    setSess(s);
  }, [navigate]);

  // Active Tab state driven by query parameter with fallback to 'overview'
  const activeTab: TabId = (
    TABS.some((t) => t.id === search.tab) ? search.tab : "overview"
  ) as TabId;

  const setActiveTab = (tab: TabId) => {
    navigate({
      to: "/workflow-intelligence",
      search: { tab },
    });
  };

  // State for timeline filter
  const [timelineFilter, setTimelineFilter] = useState<string>("all");

  const filteredTimeline = useMemo(() => {
    if (timelineFilter === "all") return TIMELINE_DATA;
    return TIMELINE_DATA.filter((item) => item.status === timelineFilter);
  }, [timelineFilter]);

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EEF2F7] text-sm text-[#5B6472]">
        Loading Workflow Intelligence…
      </div>
    );
  }

  return (
    <div
      className="flex flex-col flex-1 min-h-0 font-sans text-[#101828]"
      style={{
        backgroundColor: "#EEF2F7",
        minHeight: "100%",
      }}
    >
      {/* ── Workforce Operations Subnav ────────────────────────── */}
      <div className="px-5 pt-3 pb-1 bg-white border-b border-[#E1E6ED] shrink-0">
        <WorkforceNav activeTab="workflow" />
      </div>

      {/* ── Header & Navigation ───────────────────────────────── */}
      <header className="px-5 pt-3.5 shrink-0 bg-transparent">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
          <div>
            <h1 className="text-[17px] font-bold flex items-center gap-2 text-[#101828]">
              <Activity className="h-4 w-4 text-[#2458E6]" />
              Workflow Intelligence
            </h1>
            <p className="text-xs text-[#5B6472] mt-0.5">
              AI-assisted coordination of clinical workflows across departments.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full border border-[#2458E6] bg-[#E8EEFD] text-[#2458E6]">
              AI Prototype
            </span>
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full border border-[#E1E6ED] bg-white text-[#5B6472]">
              Demo Data
            </span>
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full border border-[#E1E6ED] bg-white text-[#5B6472]">
              {session.institutionName ?? "Demo General Hospital"}
            </span>
          </div>
        </div>

        <p className="text-[11.5px] text-[#5B6472] mb-3">
          Coordinate clinical tasks, identify operational bottlenecks, and support
          timely clinical communication across departments.
        </p>

        {/* ── 7 Horizontal Tabs ────────────────────────────────── */}
        <nav
          className="flex gap-1 overflow-x-auto pb-2 border-b border-[#E1E6ED] scrollbar-none"
          aria-label="Workflow Intelligence Tabs"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                type="button"
                className={`flex items-center gap-1.5 px-3 py-2 text-[12.3px] rounded-t-lg border-b-2 cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? "font-semibold text-[#2458E6] border-[#2458E6] bg-transparent"
                    : "font-medium text-[#5B6472] border-transparent hover:bg-[#E8EEFD]"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="ml-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#FBEAE7] text-[#C0392B]">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </header>

      {/* ── Main Viewports: Only Active Panel Rendered ────────── */}
      <main className="flex-1 min-h-0 p-5 overflow-y-auto">
        {activeTab === "overview" && (
          <OverviewPanel onSelectTab={setActiveTab} />
        )}

        {activeTab === "lab" && (
          <LaboratoryPanel />
        )}

        {activeTab === "rad" && (
          <RadiologyPanel />
        )}

        {activeTab === "wound" && (
          <WoundCarePanel />
        )}

        {activeTab === "iv" && (
          <IvAccessPanel />
        )}

        {activeTab === "timeline" && (
          <ShiftTimelinePanel
            filter={timelineFilter}
            onFilterChange={setTimelineFilter}
            items={filteredTimeline}
          />
        )}

        {activeTab === "assistant" && (
          <AiAssistantPanel />
        )}
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PANEL 1: OVERVIEW
   ═══════════════════════════════════════════════════════════════ */
function OverviewPanel({
  onSelectTab,
}: {
  onSelectTab: (tab: TabId) => void;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatBox label="Open tasks" value="42" />
        <StatBox label="Delayed" value="7" valueColor="#C0392B" />
        <StatBox
          label="Nurse-mins saved (prototype metric)"
          value="86"
          valueColor="#2E7D5B"
        />
        <StatBox
          label="Critical / overdue items"
          value="3"
          valueColor="#A8760F"
        />
      </div>

      {/* Department Workflow Summary */}
      <div className="rounded-[14px] border border-[#E1E6ED] bg-white p-3.5">
        <h2 className="text-[12.8px] font-semibold text-[#101828] mb-2">
          Department workflow summary
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <ModuleCard
            icon={FlaskConical}
            title="Laboratory"
            chips={["9 pending", "3 emergency", "2 delayed"]}
            onClick={() => onSelectTab("lab")}
          />
          <ModuleCard
            icon={Scan}
            title="Radiology"
            chips={["5 pending", "11 completed today", "2 delayed reports"]}
            onClick={() => onSelectTab("rad")}
          />
          <ModuleCard
            icon={ClipboardList}
            title="Wound Care"
            chips={["12 reviews today", "1 delayed", "1 physician rescheduled"]}
            onClick={() => onSelectTab("wound")}
          />
          <ModuleCard
            icon={Syringe}
            title="IV Access"
            chips={["4 difficult", "3 escalated", "9 min avg response"]}
            onClick={() => onSelectTab("iv")}
          />
        </div>
      </div>

      {/* Two Column Layout: Priority Attention & Shift Timeline Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-2.5">
        {/* Left Column: Priority Attention */}
        <div className="rounded-[14px] border border-[#E1E6ED] bg-white p-3.5">
          <h2 className="text-[12.8px] font-semibold text-[#101828]">
            Priority attention
          </h2>
          <p className="text-[10.8px] text-[#5B6472] mb-2.5">
            Sorted by elapsed / overdue time
          </p>

          <div className="space-y-1.5">
            {PRIORITY_ITEMS.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2.5 rounded-[9px] border border-[#E1E6ED] border-l-[3px] border-l-[#C0392B] bg-white px-3 py-2 text-[11.4px]"
              >
                <span className="text-[9.5px] uppercase tracking-wider text-[#5B6472] w-20 shrink-0 font-medium">
                  {item.dept}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[#101828] truncate">
                    {item.patient}
                  </div>
                  <div className="text-[10.3px] text-[#5B6472] truncate">
                    {item.requester}
                  </div>
                </div>
                <StatusBadge type={item.pillType} label={item.statusText} />
                <button
                  onClick={() => onSelectTab(item.targetTab)}
                  type="button"
                  className="rounded-[7px] border border-[#E1E6ED] px-2 py-1 text-[10.5px] font-medium text-[#2458E6] hover:bg-[#E8EEFD] transition cursor-pointer"
                >
                  Open
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Shift Task Timeline Preview */}
        <div className="rounded-[14px] border border-[#E1E6ED] bg-white p-3.5 flex flex-col justify-between">
          <div>
            <h2 className="text-[12.8px] font-semibold text-[#101828]">
              Shift task timeline
            </h2>
            <p className="text-[10.8px] text-[#5B6472] mb-2.5">
              Preview — next 3 events
            </p>

            <div className="relative pl-1">
              {TIMELINE_DATA.slice(0, 3).map((item, idx) => (
                <div
                  key={idx}
                  className={`relative pl-3.5 pb-3 border-l-2 text-[11.4px] ${
                    idx === 2 ? "border-l-transparent pb-0" : "border-l-[#E1E6ED]"
                  }`}
                >
                  <span
                    className={`absolute -left-[6px] top-1 h-[11px] w-[11px] rounded-full ${
                      item.status === "completed"
                        ? "bg-[#2E7D5B]"
                        : item.status === "delayed"
                        ? "bg-[#C0392B]"
                        : item.status === "rescheduled"
                        ? "bg-[#A8760F]"
                        : "bg-[#4C7EFF]"
                    }`}
                  />
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10.5px] font-mono text-[#5B6472]">
                      {item.time}
                    </span>
                    <strong className="text-[11.8px] text-[#101828]">
                      {item.dept}
                    </strong>
                    <StatusBadge type={item.status} label={item.badge} />
                  </div>
                  <div className="text-[10.5px] text-[#5B6472] mt-0.5">
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-2 border-t border-[#E1E6ED]/60">
            <button
              onClick={() => onSelectTab("timeline")}
              type="button"
              className="text-[10.6px] font-semibold text-[#2458E6] hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>Open full timeline</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PANEL 2: LABORATORY
   ═══════════════════════════════════════════════════════════════ */
function LaboratoryPanel() {
  const [criticalResults, setCriticalResults] = useState(CRITICAL_RESULTS);

  const toggleAck = (id: string) => {
    setCriticalResults((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              ack: !item.ack,
              status: !item.ack ? "ACK" : "UNACKNOWLEDGED",
              type: !item.ack ? "safe" : "crit",
            }
          : item
      )
    );
  };

  return (
    <div className="flex flex-col gap-2.5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatBox label="Pending collections" value="9" />
        <StatBox label="Emergency" value="3" valueColor="#C0392B" />
        <StatBox label="Routine" value="6" />
        <StatBox label="Delayed >15 min" value="2" valueColor="#C0392B" />
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-2.5">
        {/* Left: Collection Schedule */}
        <div className="rounded-[14px] border border-[#E1E6ED] bg-white p-3.5">
          <h2 className="text-[12.8px] font-semibold text-[#101828] mb-2">
            Collection schedule
          </h2>
          <div className="border border-[#E1E6ED] rounded-[10px] overflow-hidden">
            <table className="w-full text-left text-[11.4px] border-collapse">
              <thead>
                <tr className="bg-white border-b border-[#E1E6ED] text-[9.6px] font-semibold text-[#5B6472]">
                  <th className="py-2 px-2.5">Time</th>
                  <th className="py-2 px-2.5">Patient</th>
                  <th className="py-2 px-2.5">Priority</th>
                  <th className="py-2 px-2.5">Requester</th>
                  <th className="py-2 px-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E1E6ED]">
                {LAB_ROWS.map((row, idx) => (
                  <tr key={idx} className="hover:bg-black/[0.01]">
                    <td className="py-2 px-2.5 font-mono text-[10.5px] text-[#5B6472]">
                      {row.time}
                    </td>
                    <td className="py-2 px-2.5 font-medium text-[#101828]">
                      {row.patient}
                    </td>
                    <td className="py-2 px-2.5">
                      <StatusBadge type={row.prioType} label={row.prio} />
                    </td>
                    <td className="py-2 px-2.5 text-[#5B6472]">{row.req}</td>
                    <td className="py-2 px-2.5">
                      <StatusBadge type={row.statusType} label={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Critical Results */}
        <div className="rounded-[14px] border border-[#E1E6ED] bg-white p-3.5 flex flex-col justify-between">
          <div>
            <h2 className="text-[12.8px] font-semibold text-[#101828]">
              Critical results
            </h2>
            <p className="text-[10.8px] text-[#5B6472] mb-2.5">
              Awaiting clinician sign-off — distinct from nursing collection tasks
            </p>

            <div className="space-y-1.5">
              {criticalResults.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between gap-2 rounded-[9px] border p-2.5 text-[11.4px] transition ${
                    item.ack
                      ? "border-[#E1E6ED] bg-white"
                      : "border-[#C0392B] bg-[#FBEAE7]"
                  }`}
                >
                  <div className="min-w-0">
                    <strong className="block text-[11.8px] text-[#101828]">
                      {item.patient}
                    </strong>
                    <span className="text-[10.5px] text-[#5B6472]">
                      {item.detail} · {item.time}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleAck(item.id)}
                    type="button"
                    title={item.ack ? "Click to toggle" : "Sign-off acknowledgement"}
                    className="cursor-pointer"
                  >
                    <StatusBadge type={item.type} label={item.status} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-2 rounded-lg bg-[#E8EEFD] text-[10.5px] text-[#2458E6]">
            <strong>Clinical Safety Notice: </strong>Critical result notifications
            are advisory. Clinician sign-off must proceed in accordance with
            institutional escalation protocol.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PANEL 3: RADIOLOGY
   ═══════════════════════════════════════════════════════════════ */
function RadiologyPanel() {
  return (
    <div className="flex flex-col gap-2.5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatBox label="Pending requests" value="5" />
        <StatBox label="Scheduled" value="8" />
        <StatBox label="Completed today" value="11" valueColor="#2E7D5B" />
        <StatBox label="Delayed reports" value="2" valueColor="#C0392B" />
      </div>

      {/* Report turnaround KPI */}
      <div className="rounded-[14px] border border-[#E1E6ED] bg-white p-3.5">
        <h2 className="text-[12.8px] font-semibold text-[#101828]">
          Report turnaround (KPI)
        </h2>
        <p className="text-[10.8px] text-[#5B6472] mb-2">
          42 min average · target ≤ 45 min ·{" "}
          <span className="font-mono font-bold text-[#101828]">82%</span> within
          target
        </p>
        <div className="h-2 w-full bg-[#E1E6ED] rounded-full overflow-hidden">
          <div className="h-full bg-[#2458E6] rounded-full" style={{ width: "82%" }} />
        </div>
      </div>

      {/* Imaging Queue */}
      <div className="rounded-[14px] border border-[#E1E6ED] bg-white p-3.5">
        <h2 className="text-[12.8px] font-semibold text-[#101828] mb-2">
          Imaging queue
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {RADIOLOGY_QUEUE.map((item, idx) => (
            <div
              key={idx}
              className="rounded-[11px] border border-[#E1E6ED] bg-white p-3"
            >
              <strong className="text-[12.3px] text-[#101828] block">
                {item.exam}
              </strong>
              <div className="text-[10.5px] text-[#5B6472] mt-1 truncate">
                {item.detail}
              </div>
              <div className="mt-2">
                <StatusBadge type={item.type} label={item.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PANEL 4: WOUND CARE
   ═══════════════════════════════════════════════════════════════ */
function WoundCarePanel() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-2.5">
      {/* Left: Table */}
      <div className="rounded-[14px] border border-[#E1E6ED] bg-white p-3.5">
        <h2 className="text-[12.8px] font-semibold text-[#101828] mb-2">
          Scheduled dressings & reviews
        </h2>
        <div className="border border-[#E1E6ED] rounded-[10px] overflow-hidden">
          <table className="w-full text-left text-[11.4px] border-collapse">
            <thead>
              <tr className="bg-white border-b border-[#E1E6ED] text-[9.6px] font-semibold text-[#5B6472]">
                <th className="py-2 px-2.5">Due</th>
                <th className="py-2 px-2.5">Patient</th>
                <th className="py-2 px-2.5">Type</th>
                <th className="py-2 px-2.5">Nurse-led</th>
                <th className="py-2 px-2.5">Docs</th>
                <th className="py-2 px-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E6ED]">
              {WOUND_ROWS.map((row, idx) => (
                <tr key={idx} className="hover:bg-black/[0.01]">
                  <td className="py-2 px-2.5 font-mono text-[10.5px] text-[#5B6472]">
                    {row.due}
                  </td>
                  <td className="py-2 px-2.5 font-medium text-[#101828]">
                    {row.patient}
                  </td>
                  <td className="py-2 px-2.5 text-[#5B6472]">{row.type}</td>
                  <td className="py-2 px-2.5">
                    <StatusBadge type={row.nurseLedType} label={row.nurseLed} />
                  </td>
                  <td className="py-2 px-2.5">
                    <StatusBadge type={row.docsType} label={row.docs} />
                  </td>
                  <td className="py-2 px-2.5">
                    <StatusBadge type={row.statusType} label={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right: Stats & Hospital Policy */}
      <div className="flex flex-col gap-2.5">
        <div className="grid grid-cols-2 gap-2">
          <StatBox label="Reviews today" value="12" />
          <StatBox label="Delayed" value="1" valueColor="#C0392B" />
        </div>

        <div className="rounded-[14px] border border-[#E1E6ED] bg-white p-3.5 flex-1">
          <h2 className="text-[12.8px] font-semibold text-[#101828] mb-1">
            Hospital policy
          </h2>
          <p className="text-[11.4px] text-[#5B6472] leading-relaxed">
            Nurse-led dressing is permitted for stable post-op and pressure
            injuries per hospital policy. Physician review is required for
            infected or non-healing wounds. AI does not approve or override
            physician-required reviews.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PANEL 5: IV ACCESS
   ═══════════════════════════════════════════════════════════════ */
function IvAccessPanel() {
  return (
    <div className="flex flex-col gap-2.5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatBox label="Difficult cannulation" value="4" />
        <StatBox label="Escalated to IV expert" value="3" />
        <StatBox label="Avg response" value="9 min" />
        <StatBox label="Completed" value="2" valueColor="#2E7D5B" />
      </div>

      {/* IV escalation queue */}
      <div className="rounded-[14px] border border-[#E1E6ED] bg-white p-3.5">
        <h2 className="text-[12.8px] font-semibold text-[#101828]">
          IV escalation queue
        </h2>
        <p className="text-[10.8px] text-[#5B6472] mb-3">
          Pending → In progress → Completed · per hospital escalation policy
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {/* Col 1: Pending */}
          <div>
            <h4 className="text-[10.5px] font-semibold text-[#5B6472] mb-2">
              Pending
            </h4>
            <div className="space-y-1.5">
              {IV_PENDING.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-[9px] border border-[#E1E6ED] p-2.5 text-[11.4px]"
                >
                  <strong className="block text-[11.8px] text-[#101828]">
                    {item.patient}
                  </strong>
                  <span className="text-[10.5px] text-[#5B6472] block">
                    {item.detail} · {item.meta}
                  </span>
                  <div className="mt-1.5">
                    <StatusBadge type={item.type} label={item.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Col 2: In progress */}
          <div>
            <h4 className="text-[10.5px] font-semibold text-[#5B6472] mb-2">
              In progress
            </h4>
            <div className="space-y-1.5">
              {IV_PROGRESS.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-[9px] border border-[#E1E6ED] p-2.5 text-[11.4px]"
                >
                  <strong className="block text-[11.8px] text-[#101828]">
                    {item.patient}
                  </strong>
                  <span className="text-[10.5px] text-[#5B6472] block">
                    {item.detail} · {item.meta}
                  </span>
                  <div className="mt-1.5">
                    <StatusBadge type={item.type} label={item.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Col 3: Completed */}
          <div>
            <h4 className="text-[10.5px] font-semibold text-[#5B6472] mb-2">
              Completed
            </h4>
            <div className="space-y-1.5">
              {IV_COMPLETED.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-[9px] border border-[#E1E6ED] p-2.5 text-[11.4px]"
                >
                  <strong className="block text-[11.8px] text-[#101828]">
                    {item.patient}
                  </strong>
                  <span className="text-[10.5px] text-[#5B6472] block">
                    {item.detail} · {item.meta}
                  </span>
                  <div className="mt-1.5">
                    <StatusBadge type={item.type} label={item.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PANEL 6: SHIFT TIMELINE
   ═══════════════════════════════════════════════════════════════ */
function ShiftTimelinePanel({
  filter,
  onFilterChange,
  items,
}: {
  filter: string;
  onFilterChange: (f: string) => void;
  items: typeof TIMELINE_DATA;
}) {
  const filterOptions = [
    { id: "all", label: "All statuses" },
    { id: "completed", label: "Completed" },
    { id: "pending", label: "Pending" },
    { id: "delayed", label: "Delayed" },
    { id: "rescheduled", label: "Rescheduled" },
  ];

  return (
    <div className="rounded-[14px] border border-[#E1E6ED] bg-white p-3.5">
      <h2 className="text-[12.8px] font-semibold text-[#101828]">
        Shift task timeline
      </h2>
      <p className="text-[10.8px] text-[#5B6472] mb-3">
        Coordinated cadence across the shift
      </p>

      {/* Filter Row */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {filterOptions.map((opt) => {
          const isActive = filter === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onFilterChange(opt.id)}
              type="button"
              className={`px-3 py-1 text-[10.6px] rounded-full border cursor-pointer transition ${
                isActive
                  ? "bg-[#2458E6] text-white border-[#2458E6] font-semibold"
                  : "bg-white text-[#5B6472] border-[#E1E6ED] hover:bg-[#E8EEFD]"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Full Timeline List */}
      <div className="relative pl-1">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={`relative pl-4 pb-4 border-l-2 text-[11.4px] ${
              idx === items.length - 1
                ? "border-l-transparent pb-0"
                : "border-l-[#E1E6ED]"
            }`}
          >
            <span
              className={`absolute -left-[6px] top-1 h-[11px] w-[11px] rounded-full ${
                item.status === "completed"
                  ? "bg-[#2E7D5B]"
                  : item.status === "delayed"
                  ? "bg-[#C0392B]"
                  : item.status === "rescheduled"
                  ? "bg-[#A8760F]"
                  : "bg-[#4C7EFF]"
              }`}
            />
            <div className="flex items-center gap-2">
              <span className="text-[10.5px] font-mono text-[#5B6472]">
                {item.time}
              </span>
              <strong className="text-[11.8px] text-[#101828]">
                {item.dept}
              </strong>
              <StatusBadge type={item.status} label={item.badge} />
            </div>
            <div className="text-[10.5px] text-[#5B6472] mt-0.5">
              {item.desc}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PANEL 7: AI ASSISTANT
   ═══════════════════════════════════════════════════════════════ */
function AiAssistantPanel() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-2.5">
      {/* Left: Observed Evidence & Advisory */}
      <div className="rounded-[14px] border border-[#E1E6ED] bg-white p-3.5">
        <h2 className="text-[12.8px] font-semibold text-[#101828]">
          Observed evidence & advisory
        </h2>
        <p className="text-[10.8px] text-[#5B6472] mb-3">
          Every insight distinguishes what was observed from what is advisory
        </p>

        <div className="space-y-2">
          {AI_INSIGHTS.map((item, idx) => (
            <div
              key={idx}
              className="rounded-[10px] border border-[#E1E6ED] bg-white p-2.5 text-[11.4px]"
            >
              <span
                className={`text-[9px] font-bold tracking-wider uppercase block ${
                  item.kind === "obs" ? "text-[#2458E6]" : "text-[#2E7D5B]"
                }`}
              >
                {item.label}
              </span>
              <p className="text-[11.4px] text-[#101828] leading-relaxed mt-0.5">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Operational Summary & Safety Notice */}
      <div className="flex flex-col gap-2.5">
        <div className="rounded-[14px] border border-[#E1E6ED] bg-white p-3.5">
          <h2 className="text-[12.8px] font-semibold text-[#101828] mb-1">
            Bottlenecks
          </h2>
          <p className="text-[12.6px] font-semibold text-[#101828]">
            Labs · Wound review
          </p>
        </div>

        <div className="rounded-[14px] border border-[#E1E6ED] bg-white p-3.5">
          <h2 className="text-[12.8px] font-semibold text-[#101828] mb-1">
            Departments needing attention
          </h2>
          <p className="text-[12.6px] font-semibold text-[#101828]">
            ICU · Medical Ward
          </p>
        </div>

        <div className="rounded-[14px] border border-[#E1E6ED] bg-white p-3.5">
          <h2 className="text-[12.8px] font-semibold text-[#101828] mb-1">
            Suggested operational action
          </h2>
          <p className="text-[11.6px] text-[#101828] leading-relaxed">
            <strong className="text-[#2E7D5B]">Advisory: </strong>sequence labs →
            wound dressings → medication in the 08:00–10:00 cluster to reduce ward
            crossings.
          </p>
        </div>

        <p className="text-[10.3px] text-[#5B6472] italic leading-relaxed px-1">
          Demo insights — clearly labelled prototype content, not live hospital
          findings. No autonomous changes to schedules, workflows, or staff
          assignments; all actions require human review and existing approval
          permissions.
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HELPER UI COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function StatBox({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string | number;
  valueColor?: string;
}) {
  return (
    <div className="rounded-[11px] border border-[#E1E6ED] bg-white p-2.5">
      <div
        className="font-mono text-[18px] font-semibold leading-tight"
        style={{ color: valueColor ?? "#101828" }}
      >
        {value}
      </div>
      <div className="text-[10px] text-[#5B6472] mt-0.5 leading-tight truncate">
        {label}
      </div>
    </div>
  );
}

function ModuleCard({
  icon: Icon,
  title,
  chips,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  chips: string[];
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      type="button"
      className="text-left rounded-[11px] border border-[#E1E6ED] bg-white p-2.5 hover:border-[#2458E6] transition cursor-pointer flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-1">
          <Icon className="h-4 w-4 text-[#2458E6]" />
          <ArrowRight className="h-3 w-3 text-[#5B6472]" />
        </div>
        <strong className="text-[12.3px] text-[#101828] block">{title}</strong>
      </div>
      <div className="flex flex-wrap gap-1 text-[10.5px] text-[#5B6472] mt-2">
        {chips.map((c, i) => (
          <span
            key={i}
            className="after:content-['·'] last:after:content-none after:ml-1"
          >
            {c}
          </span>
        ))}
      </div>
    </button>
  );
}

function StatusBadge({ type, label }: { type: string; label: string }) {
  let bg = "#E8EEFD";
  let color = "#2458E6";

  if (
    type === "crit" ||
    type === "emergency" ||
    type === "delayed" ||
    type === "unack"
  ) {
    bg = "#FBEAE7";
    color = "#C0392B";
  } else if (
    type === "watch" ||
    type === "pending" ||
    type === "rescheduled" ||
    type === "reporting"
  ) {
    bg = "#FBF0DD";
    color = "#A8760F";
  } else if (
    type === "safe" ||
    type === "completed" ||
    type === "ack" ||
    type === "scheduled" ||
    type === "permitted"
  ) {
    bg = "#E7F4EC";
    color = "#2E7D5B";
  }

  return (
    <span
      className="inline-block text-[9.3px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ backgroundColor: bg, color: color }}
    >
      {label}
    </span>
  );
}
