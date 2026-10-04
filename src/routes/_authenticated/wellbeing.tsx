import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  HeartPulse,
  LayoutDashboard,
  BatteryCharging,
  Coffee,
  Scale,
  CalendarClock,
  MessageCircleHeart,
  LifeBuoy,
  UserCheck,
  Users,
  CalendarCheck,
  ShieldCheck,
} from "lucide-react";

/* ── route config ─────────────────────────────────────────────── */
export const Route = createFileRoute("/_authenticated/wellbeing")({
  validateSearch: (search: Record<string, unknown>): { tab?: string } => ({
    tab: typeof search.tab === "string" ? search.tab : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Employee Wellbeing – NOS Health" },
      {
        name: "description",
        content:
          "Support and retain nurses through wellbeing insight. Designed by a nurse — built around the nurse.",
      },
    ],
  }),
  component: EmployeeWellbeingPage,
});

/* ── tab model ────────────────────────────────────────────────── */
type TabId =
  | "overview"
  | "fatigue"
  | "breaks"
  | "workload"
  | "shift"
  | "feedback"
  | "support"
  | "retention";

interface TabDef {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: TabDef[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "fatigue", label: "Fatigue & Rest", icon: BatteryCharging },
  { id: "breaks", label: "Breaks", icon: Coffee },
  { id: "workload", label: "Workload", icon: Scale },
  { id: "shift", label: "Shift Patterns", icon: CalendarClock },
  { id: "feedback", label: "Nurse Feedback", icon: MessageCircleHeart },
  { id: "support", label: "Support", icon: LifeBuoy },
  { id: "retention", label: "Retention", icon: UserCheck },
];

/* ── CSS-in-JS tokens (mirrors the HTML reference) ────────────── */
const V = {
  bg: "var(--wb-bg, #EEF2F7)",
  panel: "var(--wb-panel, #FFFFFF)",
  ink: "var(--wb-ink, #101828)",
  inkSoft: "var(--wb-ink-soft, #5B6472)",
  line: "var(--wb-line, #E1E6ED)",
  blue: "var(--wb-blue, #2458E6)",
  blueSoft: "var(--wb-blue-soft, #E8EEFD)",
  watchBg: "var(--wb-watch-bg, #FBF0DD)",
  watch: "var(--wb-watch, #A8760F)",
  radius: "14px",
} as const;

/* ── page component ───────────────────────────────────────────── */
export default function EmployeeWellbeingPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();

  const activeTab: TabId = (
    TABS.some((t) => t.id === search.tab) ? search.tab : "overview"
  ) as TabId;

  const setActiveTab = (tab: TabId) =>
    navigate({ to: "/wellbeing", search: { tab } });

  return (
    <div
      className="flex flex-col flex-1 min-h-0 font-sans"
      style={{
        /* CSS custom properties used by child elements */
        "--wb-bg": "#EEF2F7",
        "--wb-panel": "#FFFFFF",
        "--wb-ink": "#101828",
        "--wb-ink-soft": "#5B6472",
        "--wb-line": "#E1E6ED",
        "--wb-blue": "#2458E6",
        "--wb-blue-soft": "#E8EEFD",
        "--wb-watch-bg": "#FBF0DD",
        "--wb-watch": "#A8760F",
      } as React.CSSProperties}
    >
      {/* ── header + tabs ───────────────────────────────────── */}
      <header className="shrink-0" style={{ padding: "14px 20px 0" }}>
        <div>
          <h1
            className="flex items-center gap-2"
            style={{ fontSize: 17, fontWeight: 700, color: V.ink }}
          >
            <HeartPulse
              className="h-[18px] w-[18px]"
              style={{ color: V.blue }}
            />
            Employee Wellbeing
          </h1>
          <p
            style={{
              fontSize: 12,
              color: V.inkSoft,
              marginTop: 2,
              marginBottom: 10,
            }}
          >
            Support and retain nurses through wellbeing insight. Designed by a
            nurse — built around the nurse.
          </p>
        </div>

        {/* tab bar */}
        <nav
          className="flex gap-1 overflow-x-auto scrollbar-none"
          style={{
            paddingBottom: 10,
            borderBottom: `1px solid ${V.line}`,
          }}
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                type="button"
                className="shrink-0 flex items-center gap-1.5 cursor-pointer"
                style={{
                  fontFamily: "inherit",
                  fontSize: "12.3px",
                  fontWeight: active ? 600 : 500,
                  color: active ? V.blue : V.inkSoft,
                  background: "transparent",
                  border: "none",
                  padding: "8px 12px",
                  borderRadius: "8px 8px 0 0",
                  whiteSpace: "nowrap",
                  borderBottom: `2px solid ${active ? V.blue : "transparent"}`,
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (!active)
                    (e.currentTarget.style.background = V.blueSoft);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <Icon className="h-[15px] w-[15px]" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </header>

      {/* ── panel area ──────────────────────────────────────── */}
      <main
        className="flex-1 min-h-0 overflow-y-auto"
        style={{ padding: "14px 20px 14px" }}
      >
        {activeTab === "overview" && (
          <OverviewPanel onSelectTab={setActiveTab} />
        )}
        {activeTab === "fatigue" && <FatiguePanel />}
        {activeTab === "breaks" && <BreaksPanel />}
        {activeTab === "workload" && <WorkloadPanel />}
        {activeTab === "shift" && <ShiftPanel />}
        {activeTab === "feedback" && <FeedbackPanel />}
        {activeTab === "support" && <SupportPanel />}
        {activeTab === "retention" && <RetentionPanel />}
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PANEL 1 — OVERVIEW
   ═══════════════════════════════════════════════════════════════ */
function OverviewPanel({
  onSelectTab,
}: {
  onSelectTab: (tab: TabId) => void;
}) {
  return (
    <div className="flex flex-col gap-3 h-full">
      {/* KPI row */}
      <div
        className="grid gap-2.5"
        style={{ gridTemplateColumns: "repeat(4, 1fr)" }}
      >
        <KpiCard
          label="Nurses on Duty"
          desc="How many nurses are working right now."
          onClick={() => onSelectTab("workload")}
        />
        <KpiCard
          label="Rest Concerns"
          desc="Nurses who may not be getting enough rest between shifts."
          onClick={() => onSelectTab("fatigue")}
        />
        <KpiCard
          label="Breaks Pending"
          desc="Breaks that are due but not yet recorded as taken."
          onClick={() => onSelectTab("breaks")}
        />
        <KpiCard
          label="Workload Alerts"
          desc="Units carrying more patients than usual right now."
          onClick={() => onSelectTab("workload")}
        />
      </div>

      {/* "not connected yet" card */}
      <div
        className="flex-1 rounded-[14px]"
        style={{
          background: V.panel,
          border: `1px solid ${V.line}`,
          padding: "15px 17px",
        }}
      >
        <h2
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: V.ink,
            marginBottom: 3,
          }}
        >
          Not connected yet
        </h2>
        <p style={{ fontSize: 12, color: V.inkSoft }}>
          These numbers will appear once Employee Wellbeing is connected to live
          scheduling data. Tap any card above to see what that section will show.
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PANELS 2-7 — EMPTY STATES (Coming Soon)
   ═══════════════════════════════════════════════════════════════ */
function FatiguePanel() {
  return (
    <EmptyState
      icon={BatteryCharging}
      title="Nurses Getting Enough Rest"
      description="Shows whether nurses are getting proper rest between shifts — including back-to-back workdays and switching from night to day shifts."
      tagline="Coming soon — will use the existing duty roster"
    />
  );
}

function BreaksPanel() {
  return (
    <EmptyState
      icon={Coffee}
      title="Breaks"
      description={'Shows breaks that were taken, missed, or delayed. A break only shows as "taken" once it\'s actually recorded.'}
      tagline="Coming soon"
    />
  );
}

function WorkloadPanel() {
  return (
    <EmptyState
      icon={Scale}
      title="Workload Alerts"
      description="Shows when a unit is short-staffed or carrying a heavier patient load than usual."
      tagline="Coming soon — uses the same numbers already shown in Workforce Operations"
    />
  );
}

function ShiftPanel() {
  return (
    <EmptyState
      icon={CalendarClock}
      title="Shift Patterns"
      description="Shows shift order, rest time between shifts, and consecutive workdays — including night-to-day switches."
      tagline="Coming soon — uses the existing duty roster"
    />
  );
}

function FeedbackPanel() {
  return (
    <EmptyState
      icon={MessageCircleHeart}
      title="Nurse Feedback"
      description="A private, voluntary way for nurses to share how they're doing and whether they need support. Individual responses are only visible to authorized staff."
      tagline="Coming soon"
    />
  );
}

function SupportPanel() {
  return (
    <EmptyState
      icon={LifeBuoy}
      title="Support"
      description="A simple place to find your hospital's approved support resources and who to contact for help."
      tagline="Coming soon"
    />
  );
}

/* ═══════════════════════════════════════════════════════════════
   PANEL 8 — RETENTION
   ═══════════════════════════════════════════════════════════════ */
function RetentionPanel() {
  return (
    <div className="flex flex-col gap-3 h-full">
      {/* main card */}
      <div
        className="rounded-[14px]"
        style={{
          background: V.panel,
          border: `1px solid ${V.line}`,
          padding: "15px 17px",
        }}
      >
        <h2
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: V.ink,
            marginBottom: 3,
          }}
        >
          Nurse Retention
        </h2>
        <p
          style={{
            fontSize: 12,
            color: V.inkSoft,
            marginBottom: 10,
          }}
        >
          Understand what helps nurses stay and what needs improvement.
        </p>

        {/* 3 retention cards */}
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
        >
          <RetentionCard
            icon={Users}
            title="Staff Retention"
            desc="Understand how many nurses stay with the organisation."
            status="Data not connected"
          />
          <RetentionCard
            icon={CalendarCheck}
            title="Schedule Stability"
            desc="Review whether nurses receive predictable duty rosters."
            status="Data not connected"
          />
          <RetentionCard
            icon={MessageCircleHeart}
            title="Nurse Feedback"
            desc="Understand common workplace concerns from anonymous feedback."
            status="Coming soon"
          />
        </div>
      </div>

      {/* privacy notice */}
      <div
        className="rounded-xl"
        style={{
          background: V.blueSoft,
          padding: "13px 16px",
          fontSize: 12,
          lineHeight: 1.55,
          color: V.ink,
        }}
      >
        <strong style={{ color: V.blue }}>How we protect nurses:</strong>{" "}
        Retention insights help improve working conditions. NOS Health does not
        rank individual nurses or predict who will leave.
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HELPER COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

/** Overview KPI button card */
function KpiCard({
  label,
  desc,
  onClick,
}: {
  label: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer text-left transition-colors"
      style={{
        fontFamily: "inherit",
        background: V.panel,
        border: `1px solid ${V.line}`,
        borderRadius: 12,
        padding: 14,
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.borderColor = V.blue)
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.borderColor = V.line)
      }
    >
      <div
        style={{
          fontSize: 13,
          color: V.inkSoft,
          fontWeight: 500,
        }}
      >
        —
      </div>
      <div
        style={{
          fontSize: 12.5,
          fontWeight: 600,
          marginTop: 3,
          color: V.ink,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 11,
          color: V.inkSoft,
          marginTop: 3,
          lineHeight: 1.4,
        }}
      >
        {desc}
      </div>
    </button>
  );
}

/** Coming-soon empty state panel */
function EmptyState({
  icon: Icon,
  title,
  description,
  tagline,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  tagline: string;
}) {
  return (
    <div
      className="h-full rounded-[14px]"
      style={{
        background: V.panel,
        border: `1px solid ${V.line}`,
        padding: "15px 17px",
      }}
    >
      <div
        className="h-full flex flex-col items-center justify-center gap-2 text-center"
        style={{
          border: `1px dashed ${V.line}`,
          borderRadius: 12,
          padding: 26,
          color: V.inkSoft,
          fontSize: "13.5px",
        }}
      >
        {/* icon badge */}
        <div
          className="flex items-center justify-center"
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: V.blueSoft,
            color: V.blue,
            marginBottom: 4,
          }}
        >
          <Icon className="h-5 w-5" />
        </div>

        <strong style={{ color: V.ink, fontSize: "14.5px" }}>{title}</strong>
        <span style={{ maxWidth: 420 }}>{description}</span>
        <span
          className="inline-block"
          style={{
            marginTop: 6,
            fontSize: 11,
            background: V.blueSoft,
            color: V.blue,
            padding: "4px 11px",
            borderRadius: 99,
          }}
        >
          {tagline}
        </span>
      </div>
    </div>
  );
}

/** Retention sub-card */
function RetentionCard({
  icon: Icon,
  title,
  desc,
  status,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  status: string;
}) {
  return (
    <div
      className="flex flex-col"
      style={{
        border: `1px solid ${V.line}`,
        borderRadius: 12,
        padding: 16,
      }}
    >
      <div
        className="flex items-center justify-center"
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          background: V.blueSoft,
          color: V.blue,
          marginBottom: 10,
        }}
      >
        <Icon className="h-[18px] w-[18px]" />
      </div>
      <h3
        style={{
          fontSize: "13.5px",
          fontWeight: 600,
          marginBottom: 4,
          color: V.ink,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: "11.8px",
          color: V.inkSoft,
          lineHeight: 1.5,
          marginBottom: 10,
        }}
      >
        {desc}
      </p>
      <span
        style={{
          alignSelf: "flex-start",
          fontSize: "10.5px",
          fontWeight: 600,
          padding: "4px 10px",
          borderRadius: 99,
          background: V.watchBg,
          color: V.watch,
        }}
      >
        {status}
      </span>
    </div>
  );
}
