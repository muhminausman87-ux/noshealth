import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { WorkforceNav } from "@/components/WorkforceNav";
import {
  Users,
  CalendarClock,
  Gauge,
  AlertTriangle,
  ShieldAlert,
  Activity,
  Clock,
  RefreshCw,
  ChevronRight,
  CheckCircle2,
  Info,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Building2,
  UserCheck,
  UserMinus,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { StatusPill } from "@/components/Widget";
import {
  buildWorkforceStateSnapshot,
  workforceSignals,
  ZONE_LABEL,
  type UnitCoverage,
  type Zone,
  type WorkforceSummary,
  type WorkforceSignal,
} from "@/lib/workforce-ops";
import { DEPARTMENTS } from "@/lib/departments";
import {
  demoNurses,
  demoLeave,
  demoRoster,
  demoRequirements,
  isoDay,
  SHIFTS,
} from "@/lib/fromex-scheduling";

export const Route = createFileRoute("/_authenticated/workforce-intelligence")({
  head: () => ({
    meta: [
      { title: "Workforce Intelligence - NOS Health" },
      {
        name: "description",
        content:
          "Operational staffing conditions, shift-level coverage, and evidence-informed workforce signals for nursing leadership.",
      },
    ],
  }),
  component: WorkforceIntelligencePage,
});

const ZONE_TONE: Record<Zone, "success" | "warning" | "danger"> = {
  safe: "success",
  watch: "warning",
  critical: "danger",
};

type Tab = "overview" | "coverage" | "signals";

export default function WorkforceIntelligencePage() {
  const [targetDate, setTargetDate] = useState(isoDay(0));
  const [targetShift, setTargetShift] = useState<"day" | "evening" | "night">("day");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const summary = useMemo(() => {
    const allDepts = DEPARTMENTS.map((d) => d.id);
    const selectedDepts =
      deptFilter === "all" ? allDepts : [deptFilter as (typeof allDepts)[number]];
    const nurses = selectedDepts.flatMap((d) => demoNurses(d));
    const leave = demoLeave(nurses);
    const dObj = new Date(`${targetDate}T00:00:00`);
    const days = [targetDate];
    for (let i = 1; i <= 3; i++) {
      const nd = new Date(dObj);
      nd.setDate(nd.getDate() + i);
      days.push(nd.toISOString().slice(0, 10));
    }
    const roster = selectedDepts.flatMap((d) =>
      demoRoster(
        d,
        nurses.filter((n) => n.dept === d),
        days,
      ),
    );
    const requirements = selectedDepts.flatMap((d) => demoRequirements(d, days));
    return buildWorkforceStateSnapshot({
      targetDate,
      targetShift,
      departments: selectedDepts,
      nurses,
      roster,
      requirements,
      leave,
    });
  }, [targetDate, targetShift, deptFilter]);

  const signals = useMemo(() => workforceSignals(summary), [summary]);
  const shiftDef = SHIFTS.find((s) => s.id === targetShift);
  const shiftLabel = shiftDef
    ? `${shiftDef.label} Shift (${shiftDef.start} – ${shiftDef.end})`
    : `${targetShift} shift`;

  const selectedDeptName =
    deptFilter === "all"
      ? "All Units"
      : DEPARTMENTS.find((d) => d.id === deptFilter)?.name ?? deptFilter;

  const displayDate = (() => {
    try {
      return new Date(`${targetDate}T00:00:00`).toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return targetDate;
    }
  })();

  const highSeveritySignalsCount = signals.filter((s) => s.tone !== "info").length;

  return (
    <main className="mx-auto max-w-[1440px] px-4 py-4 sm:px-6 flex flex-col gap-4 font-sans">
      <WorkforceNav activeTab="dashboard" />

      {/* 1. Module Header */}
      <header className="flex flex-col gap-3 rounded-xl border border-border/80 bg-card p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
              <Activity className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Hospital Workforce Operations</span>
            </div>
            <h1 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Workforce Intelligence
            </h1>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              Operational staffing capacity, coverage gaps, and evidence-informed workforce signals for nursing leadership.
            </p>

            {/* Context badges */}
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-secondary/80 px-2.5 py-1 text-[11px] font-medium text-foreground">
                <Clock className="h-3 w-3 text-primary" />
                <span className="font-semibold">{shiftLabel}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-secondary/80 px-2.5 py-1 text-[11px] font-medium text-foreground">
                <Building2 className="h-3 w-3 text-muted-foreground" />
                <span>Scope: <strong className="text-foreground">{selectedDeptName}</strong></span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-secondary/40 px-2.5 py-1 text-[11px] text-muted-foreground">
                <span>{displayDate}</span>
              </span>
              <span className="inline-flex items-center rounded-md border border-primary/20 bg-primary/5 px-2 py-0.5 text-[10px] font-medium text-primary">
                Prototype · Seeded Demo Dataset
              </span>
            </div>
          </div>

          {/* Action Link & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <Link
              to="/scheduling"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-[12px] font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <CalendarClock className="h-3.5 w-3.5" />
              <span>Open Duty Scheduling</span>
              <ArrowRight className="h-3 w-3 ml-0.5 opacity-80" />
            </Link>
          </div>
        </div>

        {/* Operational Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/60 bg-muted/40 p-2 text-[12px]">
          <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-medium px-1">
            <SlidersHorizontal className="h-3 w-3 text-primary" />
            <span>Operational Controls:</span>
          </div>

          <div className="flex items-center gap-1.5">
            <label htmlFor="unit-filter" className="sr-only">Unit</label>
            <select
              id="unit-filter"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="h-8 rounded border border-border bg-background px-2.5 text-[12px] font-medium text-foreground focus:border-primary focus:outline-none"
              aria-label="Filter by unit"
            >
              <option value="all">All Units ({DEPARTMENTS.length})</option>
              {DEPARTMENTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <label htmlFor="date-filter" className="sr-only">Date</label>
            <input
              id="date-filter"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="h-8 rounded border border-border bg-background px-2 text-[12px] font-medium text-foreground focus:border-primary focus:outline-none"
              aria-label="Select date"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <label htmlFor="shift-filter" className="sr-only">Shift</label>
            <select
              id="shift-filter"
              value={targetShift}
              onChange={(e) => setTargetShift(e.target.value as "day" | "evening" | "night")}
              className="h-8 rounded border border-border bg-background px-2 text-[12px] font-medium text-foreground focus:border-primary focus:outline-none"
              aria-label="Select shift"
            >
              {SHIFTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label} ({s.start} - {s.end})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              setTargetDate(isoDay(0));
              setDeptFilter("all");
              setTargetShift("day");
            }}
            className="flex h-8 items-center gap-1 rounded border border-border bg-background px-2 text-[11px] font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition ml-auto"
            title="Reset to today and all units"
            aria-label="Reset filters to default"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        </div>
      </header>

      {/* Empty / Unreliable Data State */}
      {summary.isEmpty ? (
        <EmptyState
          message="Workforce status cannot be reliably determined: No active staffing records or demand requirements exist for the selected scope and shift."
          onReset={() => {
            setTargetDate(isoDay(0));
            setDeptFilter("all");
            setTargetShift("day");
          }}
        />
      ) : (
        <>
          {/* 2. Workforce Status Banner */}
          <WorkforceStatusBanner summary={summary} />

          {/* 3. KPI Hierarchy: 2 Featured + 4 Secondary Cards */}
          <KpiHierarchy summary={summary} />

          {/* 4. Tab Navigation */}
          <div className="border-b border-border/80">
            <nav
              className="-mb-px flex items-center justify-between gap-4 text-[13px] font-medium"
              aria-label="Workforce Intelligence tabs"
            >
              <div className="flex gap-6">
                <TabButton
                  id="overview"
                  active={activeTab === "overview"}
                  onClick={() => setActiveTab("overview")}
                >
                  Overview
                </TabButton>
                <TabButton
                  id="coverage"
                  active={activeTab === "coverage"}
                  onClick={() => setActiveTab("coverage")}
                >
                  Unit Coverage
                </TabButton>
                <TabButton
                  id="signals"
                  active={activeTab === "signals"}
                  onClick={() => setActiveTab("signals")}
                >
                  <span>Workforce Signals</span>
                  {highSeveritySignalsCount > 0 && (
                    <span className="ml-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive/90 px-1 text-[9px] font-bold text-white">
                      {highSeveritySignalsCount}
                    </span>
                  )}
                </TabButton>
              </div>

              <div className="hidden sm:flex items-center pb-2">
                <Link
                  to="/scheduling"
                  className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1"
                >
                  <span>Go to Duty Scheduling</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </nav>
          </div>

          {/* 5. Tab Content Views */}
          <div className="pb-8">
            {activeTab === "overview" && (
              <OverviewTab
                summary={summary}
                signals={signals}
                onNavigateTab={setActiveTab}
              />
            )}
            {activeTab === "coverage" && <CoverageTab units={summary.units} />}
            {activeTab === "signals" && <SignalsTab signals={signals} />}
          </div>
        </>
      )}
    </main>
  );
}

/**
 * 4. Workforce Status Banner
 * Evaluates real calculated staffing zone and explains current operational condition.
 */
function WorkforceStatusBanner({ summary }: { summary: WorkforceSummary }) {
  const zone = summary.zone;
  const underUnits = summary.unitsOverCapacity.map((u) => u.key);
  const gapPos = summary.gapHrs >= 0;

  const config = {
    safe: {
      wrapper:
        "border-l-4 border-l-[var(--color-success)] border border-[color-mix(in_srgb,var(--color-success)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_7%,transparent)] text-[#0d5c40]",
      badge: "bg-[var(--color-success)] text-white",
      icon: ShieldCheck,
      title: "Safe Staffing Status",
      explanation:
        summary.openShifts > 0
          ? `All monitored units currently meet minimum safe coverage thresholds (${summary.coveragePct}% overall). Note: ${summary.openShifts} upcoming shift slot${summary.openShifts > 1 ? "s" : ""} remain unfilled in the next 72 hours.`
          : `All monitored units meet or exceed required coverage at ${summary.coveragePct}% with a surplus of ${summary.gapHrs} hours. No immediate redeployment required.`,
    },
    watch: {
      wrapper:
        "border-l-4 border-l-[var(--color-warning)] border border-[color-mix(in_srgb,var(--color-warning)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)] text-[#4a3211]",
      badge: "bg-[var(--color-warning)] text-foreground",
      icon: AlertTriangle,
      title: "Staffing Watch Active",
      explanation:
        underUnits.length > 0
          ? `Coverage pressure in ${underUnits.join(", ")}. Scheduled hours are within 10% of demand threshold. Monitor patient admissions and nurse-to-patient ratios closely.`
          : `Staffing is tight across scheduled units (${summary.coveragePct}% coverage). Available hours are within 10% of requirements. Monitor for unexpected call-offs.`,
    },
    critical: {
      wrapper:
        "border-l-4 border-l-[var(--color-destructive)] border border-[color-mix(in_srgb,var(--color-destructive)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-destructive)_7%,transparent)] text-[var(--color-destructive)]",
      badge: "bg-[var(--color-destructive)] text-white",
      icon: ShieldAlert,
      title: "Critical Coverage Shortfall",
      explanation:
        underUnits.length > 0
          ? `Immediate clinical review required: ${underUnits.join(", ")} ${underUnits.length > 1 ? "have" : "has"} severe hours deficit (${Math.abs(summary.gapHrs)}h shortfall total). Consider float pool redeployment or escalation.`
          : `Staffing demand exceeds available scheduled hours institution-wide (${Math.abs(summary.gapHrs)}h deficit). Immediate nursing supervisor intervention recommended.`,
    },
  }[zone];

  const Icon = config.icon;

  return (
    <section
      aria-label="Workforce Status Banner"
      role="status"
      aria-live="polite"
      className={`flex items-start gap-3 rounded-xl p-3.5 sm:p-4 shadow-xs ${config.wrapper}`}
    >
      <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-background/80 shadow-2xs">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${config.badge}`}>
            {ZONE_LABEL[zone]} Condition
          </span>
          <h2 className="text-[12px] sm:text-[13px] font-bold tracking-tight">
            {config.title}
          </h2>
        </div>
        <p className="mt-1 text-[11px] sm:text-[12px] leading-snug font-normal opacity-95">
          {config.explanation}
        </p>
      </div>
      <div className="hidden md:flex flex-col items-end text-right shrink-0">
        <span className="text-[10px] font-semibold uppercase tracking-wider opacity-70">
          Institution Ratio
        </span>
        <span className="text-[13px] font-bold tabular-nums">
          {summary.coveragePct}% ({gapPos ? "+" : ""}{summary.gapHrs}h)
        </span>
      </div>
    </section>
  );
}

/**
 * 5. KPI Hierarchy
 * Two featured KPI cards (Coverage and Staffing Gap) plus four secondary operational measures.
 */
function KpiHierarchy({ summary }: { summary: WorkforceSummary }) {
  const gapPos = summary.gapHrs >= 0;

  return (
    <div className="flex flex-col gap-3">
      {/* Featured Primary KPIs (2 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Featured Card 1: Shift Coverage */}
        <div
          className={`rounded-xl border border-border bg-card p-4 shadow-sm flex flex-col justify-between border-l-4 ${
            summary.zone === "safe"
              ? "border-l-[var(--color-success)]"
              : summary.zone === "watch"
              ? "border-l-[var(--color-warning)]"
              : "border-l-[var(--color-destructive)]"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Primary Measure 01 · Shift Coverage
              </span>
              <div className="mt-1 flex items-baseline gap-2.5">
                <span
                  className={`text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums ${
                    summary.zone === "safe"
                      ? "text-[var(--color-success)]"
                      : summary.zone === "watch"
                      ? "text-[#8a5b12]"
                      : "text-[var(--color-destructive)]"
                  }`}
                >
                  {summary.coveragePct}%
                </span>
                <StatusPill tone={ZONE_TONE[summary.zone]}>
                  {summary.coverageStatus}
                </StatusPill>
              </div>
            </div>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary/80 text-muted-foreground">
              <Gauge className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2.5 text-[11px] text-muted-foreground">
            <span>Hours Scheduled vs Required:</span>
            <span className="font-semibold tabular-nums text-foreground">
              {summary.availableHrs}h / {summary.requiredHrs}h req
            </span>
          </div>
        </div>

        {/* Featured Card 2: Staffing Capacity Gap */}
        <div
          className={`rounded-xl border border-border bg-card p-4 shadow-sm flex flex-col justify-between border-l-4 ${
            gapPos
              ? "border-l-[var(--color-success)]"
              : "border-l-[var(--color-destructive)]"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Primary Measure 02 · Capacity Gap
              </span>
              <div className="mt-1 flex items-baseline gap-2.5">
                <span
                  className={`text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums ${
                    gapPos ? "text-[var(--color-success)]" : "text-[var(--color-destructive)]"
                  }`}
                >
                  {gapPos ? "+" : ""}
                  {summary.gapHrs}h
                </span>
                <StatusPill tone={gapPos ? "success" : "danger"}>
                  {gapPos ? "Capacity Surplus" : "Hours Shortfall"}
                </StatusPill>
              </div>
            </div>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary/80 text-muted-foreground">
              {gapPos ? (
                <TrendingUp className="h-5 w-5 text-[var(--color-success)]" />
              ) : (
                <TrendingDown className="h-5 w-5 text-[var(--color-destructive)]" />
              )}
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2.5 text-[11px] text-muted-foreground">
            <span>Operating Condition:</span>
            <span className="font-medium text-foreground">
              {gapPos
                ? `${summary.gapHrs} hours available above baseline requirements`
                : `${Math.abs(summary.gapHrs)} hours deficit against patient demand`}
            </span>
          </div>
        </div>
      </div>

      {/* Secondary Verified Measures (4 Compact Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SecondaryKpiCard
          label="Scheduled on Shift"
          value={summary.scheduledStaff}
          unit="nurses"
          sub="Active on current roster"
          icon={UserCheck}
        />
        <SecondaryKpiCard
          label="Required Demand"
          value={summary.requiredHrs}
          unit="hrs"
          sub="Shift staffing target"
          icon={Clock}
        />
        <SecondaryKpiCard
          label="Staff on Leave"
          value={summary.onLeave}
          unit="nurses"
          sub="Approved absence / sick"
          icon={UserMinus}
          tone={summary.onLeave > 0 ? "warning" : undefined}
        />
        <SecondaryKpiCard
          label="Open Shifts (72h)"
          value={summary.openShifts}
          unit="slots"
          sub="Unfilled upcoming shifts"
          icon={CalendarClock}
          tone={summary.openShifts > 0 ? "warning" : "success"}
        />
      </div>
    </div>
  );
}

function SecondaryKpiCard({
  label,
  value,
  unit,
  sub,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number | string;
  unit?: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "success" | "warning" | "danger";
}) {
  const toneMap = {
    success: "text-[var(--color-success)]",
    warning: "text-[#8a5b12]",
    danger: "text-[var(--color-destructive)]",
  };

  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-2xs flex flex-col justify-between">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
            {label}
          </p>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span
              className={`text-lg font-bold tracking-tight tabular-nums ${
                tone ? toneMap[tone] : "text-foreground"
              }`}
            >
              {value}
            </span>
            {unit && <span className="text-[11px] text-muted-foreground font-medium">{unit}</span>}
          </div>
        </div>
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-secondary/70 text-muted-foreground">
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
      <p className="mt-1 text-[10px] text-muted-foreground/80 truncate">{sub}</p>
    </div>
  );
}

function TabButton({
  id,
  active,
  onClick,
  children,
}: {
  id: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      id={`tab-${id}`}
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`inline-flex items-center whitespace-nowrap pb-2.5 pt-2 px-1 text-[13px] font-medium border-b-2 transition-colors ${
        active
          ? "border-primary text-primary font-semibold"
          : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
      }`}
    >
      {children}
    </button>
  );
}

/**
 * 7. Overview Tab
 * Horizontal bar chart by unit + Needs Attention list + Short Workforce Signals section
 */
function OverviewTab({
  summary,
  signals,
  onNavigateTab,
}: {
  summary: WorkforceSummary;
  signals: WorkforceSignal[];
  onNavigateTab: (tab: Tab) => void;
}) {
  const chartData = summary.units.map((u) => ({
    name: u.key,
    coverage: u.coveragePct,
    zone: u.zone,
    reqHrs: u.reqHrs,
    availHrs: u.availHrs,
    gapHrs: u.gapHrs,
  }));

  const attentionUnits = summary.units
    .filter((u) => u.zone !== "safe")
    .sort((a, b) => a.coveragePct - b.coveragePct);

  const actionableSignals = signals
    .filter((s) => s.tone === "warning" || s.tone === "danger")
    .slice(0, 3);

  const barFill = (zone: string) => {
    if (zone === "critical") return "var(--color-destructive)";
    if (zone === "watch") return "var(--color-warning)";
    return "var(--color-success)";
  };

  const chartHeight = Math.max(200, chartData.length * 36);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-3">
      {/* Left Column: Horizontal Bar Chart of Unit Coverage */}
      <div className="lg:col-span-6 rounded-xl border border-border bg-card p-4 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[12px] font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wide">
              <Gauge className="h-3.5 w-3.5 text-primary" />
              Staffing Coverage by Unit
            </h3>
            <span className="text-[10px] text-muted-foreground font-medium">
              100% = Baseline demand met
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mb-3 leading-snug">
            Available scheduled hours vs. required staffing hours for current shift.
          </p>

          {chartData.length === 0 ? (
            <div className="py-12 text-center text-[11px] text-muted-foreground italic">
              No unit coverage figures available for the current selection.
            </div>
          ) : (
            <div style={{ height: chartHeight }} className="w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 4, right: 24, left: 4, bottom: 4 }}
                  barCategoryGap="28%"
                >
                  <XAxis
                    type="number"
                    domain={[0, 140]}
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                    tickCount={6}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={70}
                    tick={{ fontSize: 11, fontWeight: 500, fill: "var(--color-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(18, 104, 216, 0.04)" }}
                    formatter={(v: any) => [`${v}%`, "Coverage"]}
                    contentStyle={{
                      fontSize: 11,
                      border: "1px solid var(--color-border)",
                      borderRadius: 6,
                      background: "var(--color-card)",
                      color: "var(--color-foreground)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    }}
                  />
                  <ReferenceLine
                    x={100}
                    stroke="var(--color-border)"
                    strokeDasharray="3 3"
                    label={{
                      value: "100% Target",
                      position: "insideTopRight",
                      fill: "var(--color-muted-foreground)",
                      fontSize: 9,
                    }}
                  />
                  <Bar dataKey="coverage" radius={[0, 4, 4, 0]} maxBarSize={14}>
                    {chartData.map((entry, idx) => (
                      <Cell key={idx} fill={barFill(entry.zone)} fillOpacity={0.88} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap items-center justify-between border-t border-border/50 pt-2.5 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-xs bg-[var(--color-success)]" />
              <span>Covered (&ge; 100%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-xs bg-[var(--color-warning)]" />
              <span>Tight (90-99%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-xs bg-[var(--color-destructive)]" />
              <span>Shortfall (&lt; 90%)</span>
            </span>
          </div>
          <button
            onClick={() => onNavigateTab("coverage")}
            className="text-primary hover:underline font-medium flex items-center gap-0.5"
          >
            <span>View Full Matrix</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Right Column: Attention Section + Short Signals Section */}
      <div className="lg:col-span-6 flex flex-col gap-4">
        {/* Concise Attention / Priority Section */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[12px] font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wide">
              <AlertTriangle className="h-3.5 w-3.5 text-[var(--color-warning-foreground)]" />
              Staffing Attention & Priorities
            </h3>
            <button
              onClick={() => onNavigateTab("coverage")}
              className="text-[11px] font-medium text-primary hover:underline flex items-center gap-0.5"
            >
              <span>All units ({summary.units.length})</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          {attentionUnits.length === 0 ? (
            <div className="flex items-center gap-2.5 rounded-lg border border-[var(--color-success)]/20 bg-[var(--color-success)]/5 px-3 py-2.5 text-[11px] text-[#0d5c40]">
              <CheckCircle2 className="h-4 w-4 text-[var(--color-success)] shrink-0" />
              <span>All monitored units currently satisfy minimum required nursing hours.</span>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {attentionUnits.map((u) => {
                const isCritical = u.zone === "critical";
                return (
                  <div
                    key={u.key}
                    className="flex items-center justify-between py-2.5 first:pt-1 last:pb-1"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${
                          isCritical
                            ? "bg-[var(--color-destructive)] animate-pulse"
                            : "bg-[var(--color-warning)]"
                        }`}
                      />
                      <div className="min-w-0">
                        <span className="text-[12px] font-bold text-foreground block truncate">
                          {u.key}
                        </span>
                        <span className="text-[10px] text-muted-foreground block">
                          {u.availHrs}h scheduled of {u.reqHrs}h required ({u.nurses} staff)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span
                        className={`text-[11px] font-bold tabular-nums ${
                          isCritical
                            ? "text-[var(--color-destructive)]"
                            : "text-[#8a5b12]"
                        }`}
                      >
                        {u.gapHrs}h
                      </span>
                      <StatusPill tone={ZONE_TONE[u.zone]}>{u.status}</StatusPill>
                      <Link
                        to="/scheduling"
                        className="rounded border border-border px-2 py-1 text-[10px] font-semibold text-primary hover:bg-secondary transition flex items-center gap-1"
                        title={`Manage roster for ${u.key}`}
                      >
                        <span>Schedule</span>
                        <ArrowRight className="h-2.5 w-2.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Short Workforce Signals Section */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex flex-col flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[12px] font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wide">
              <ShieldAlert className="h-3.5 w-3.5 text-primary" />
              Active Operational Signals
            </h3>
            <button
              onClick={() => onNavigateTab("signals")}
              className="text-[11px] font-medium text-primary hover:underline flex items-center gap-0.5"
            >
              <span>All signals ({signals.length})</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          {actionableSignals.length === 0 ? (
            <div className="flex items-center gap-2.5 rounded-lg bg-secondary/50 px-3 py-2.5 text-[11px] text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-[var(--color-success)] shrink-0" />
              <span>No critical or warning staffing alerts for this shift.</span>
            </div>
          ) : (
            <div className="space-y-2 flex-1">
              {actionableSignals.map((s) => (
                <div
                  key={s.id}
                  className={`rounded-lg border-l-3 pl-3 pr-2 py-2 bg-muted/20 ${
                    s.tone === "danger"
                      ? "border-l-[var(--color-destructive)]"
                      : "border-l-[var(--color-warning)]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-foreground">{s.title}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                      {s.unit}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1 leading-snug">
                    {s.observation}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Direct CTA to scheduling */}
          <Link
            to="/scheduling"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/5 py-2 text-[11px] font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground"
          >
            <CalendarClock className="h-3.5 w-3.5" />
            <span>Open Duty Scheduling Engine</span>
            <ArrowRight className="h-3 w-3 ml-1" />
          </Link>
        </div>
      </div>

      {/* Bottom Context Banner: Workload Balance & Governance */}
      <div className="lg:col-span-12 flex items-start gap-2.5 rounded-xl border border-border/70 bg-secondary/30 p-3.5 text-[11px] text-muted-foreground">
        <Info className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
        <div className="min-w-0">
          <p className="leading-relaxed">
            <strong className="text-foreground">Workload Distribution Index: </strong>
            <span className="font-semibold text-foreground">{summary.balanceScore}/100</span> ({summary.balanceLabel}).
            {" "}A score below 85 indicates cross-unit variance where certain departments carry excess capacity while others have unmet demand. Prioritize cross-unit float redeployments before approving unbudgeted overtime. All recommendations require authorized human nurse manager approval.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * 8. Unit Coverage Tab
 * Compact, highly legible table with required, available, scheduled, leave, coverage %, gap, status, and action.
 */
function CoverageTab({ units }: { units: UnitCoverage[] }) {
  if (!units.length) {
    return (
      <EmptyState message="No unit coverage data is available for the selected parameters." />
    );
  }

  return (
    <div className="pt-3 flex flex-col gap-3">
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-[12px]">
            <thead>
              <tr className="border-b border-border bg-secondary/60 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3 text-right">Required (h)</th>
                <th className="px-4 py-3 text-right">Scheduled (h)</th>
                <th className="px-4 py-3 text-right">On Duty</th>
                <th className="px-4 py-3 text-right">On Leave</th>
                <th className="px-4 py-3 text-right">Senior %</th>
                <th className="px-4 py-3 text-right">Coverage</th>
                <th className="px-4 py-3 text-right">Gap</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Roster Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {units.map((u) => {
                const gapPos = u.gapHrs >= 0;
                const isCritical = u.zone === "critical";
                const isWatch = u.zone === "watch";

                return (
                  <tr
                    key={u.key}
                    className={`transition hover:bg-primary/[0.02] ${
                      isCritical
                        ? "bg-[color-mix(in_srgb,var(--color-destructive)_3%,transparent)]"
                        : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full shrink-0 ${
                            isCritical
                              ? "bg-[var(--color-destructive)]"
                              : isWatch
                              ? "bg-[var(--color-warning)]"
                              : "bg-[var(--color-success)]"
                          }`}
                        />
                        <span className="font-bold text-foreground">{u.key}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                      {u.reqHrs}h
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-foreground font-medium">
                      {u.availHrs}h
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                      {u.nurses}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                      {u.onLeave > 0 ? (
                        <span className="font-semibold text-amber-700 dark:text-amber-400">
                          {u.onLeave}
                        </span>
                      ) : (
                        "0"
                      )}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                      {u.seniorPct}%
                    </td>
                    <td
                      className={`px-4 py-3 text-right tabular-nums font-bold ${
                        isCritical
                          ? "text-[var(--color-destructive)]"
                          : isWatch
                          ? "text-[#8a5b12]"
                          : "text-foreground"
                      }`}
                    >
                      {u.coveragePct}%
                    </td>
                    <td
                      className={`px-4 py-3 text-right tabular-nums font-semibold ${
                        gapPos ? "text-[var(--color-success)]" : "text-[var(--color-destructive)]"
                      }`}
                    >
                      {gapPos ? "+" : ""}
                      {u.gapHrs}h
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusPill tone={ZONE_TONE[u.zone]}>{u.status}</StatusPill>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {u.zone !== "safe" ? (
                        <Link
                          to="/scheduling"
                          className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition"
                          title={`Manage duty schedule for ${u.key}`}
                        >
                          <span>Manage</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      ) : (
                        <span className="text-[10px] text-muted-foreground/60 italic">Adequate</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footnote */}
        <div className="border-t border-border/60 bg-secondary/30 px-4 py-2.5 text-[10px] text-muted-foreground flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span>
            <strong>Calculation Method: </strong>Coverage % = (Available Scheduled Hours / Required Demand Hours) &times; 100.
            A unit below 100% indicates a staffing gap on this shift.
          </span>
          <span className="text-muted-foreground/70">
            Source: Authoritative scheduling state
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * 9. Workforce Signals Tab
 * Clear, structured signals with Title, Unit, Evidence, Severity, and Suggested Next Steps.
 */
function SignalsTab({ signals }: { signals: WorkforceSignal[] }) {
  if (!signals.length) {
    return (
      <EmptyState message="No operational workforce signals could be derived from the current shift data." />
    );
  }

  return (
    <div className="pt-3 flex flex-col gap-4">
      <div className="grid gap-3.5 sm:grid-cols-2">
        {signals.map((s) => {
          const isInfo = s.tone === "info";
          const isDanger = s.tone === "danger";

          return (
            <div
              key={s.id}
              className={`rounded-xl border bg-card p-4 shadow-sm flex flex-col justify-between ${
                isDanger
                  ? "border-[var(--color-destructive)]/40 bg-[color-mix(in_srgb,var(--color-destructive)_2%,transparent)]"
                  : s.tone === "warning"
                  ? "border-[var(--color-warning)]/40 bg-[color-mix(in_srgb,var(--color-warning)_2%,transparent)]"
                  : "border-border"
              }`}
            >
              <div>
                {/* Header: Title and Unit/Tone Badges */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                        isDanger
                          ? "bg-[var(--color-destructive)]/15 text-[var(--color-destructive)]"
                          : s.tone === "warning"
                          ? "bg-[var(--color-warning)]/15 text-[#8a5b12]"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {isInfo ? (
                        <Info className="h-3.5 w-3.5" />
                      ) : (
                        <AlertTriangle className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <h4 className="text-[12px] font-bold text-foreground leading-snug">
                      {s.title}
                    </h4>
                  </div>
                  <StatusPill tone={s.tone}>{s.unit}</StatusPill>
                </div>

                {/* Evidence / Data Source */}
                <div className="mt-2 rounded-md bg-secondary/40 p-2.5 text-[11px] leading-relaxed border border-border/50">
                  <span className="font-semibold text-foreground/90 block mb-0.5">
                    Observed Evidence:
                  </span>
                  <span className="text-muted-foreground">{s.observation}</span>
                </div>
              </div>

              {/* Advisory Recommendation */}
              <div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 p-2.5 text-[11px]">
                <div className="flex items-center gap-1.5 font-bold text-primary mb-1">
                  <Activity className="h-3.5 w-3.5" />
                  <span>Advisory Recommendation (Human Decision Required)</span>
                </div>
                <p className="text-foreground/80 leading-snug">{s.recommendation}</p>
                <div className="mt-2 pt-2 border-t border-primary/10 flex items-center justify-end">
                  <Link
                    to="/scheduling"
                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary hover:underline"
                  >
                    <span>Open in Duty Scheduling</span>
                    <ArrowRight className="h-2.5 w-2.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Human In The Loop Governance Notice */}
      <div className="flex items-start gap-2.5 rounded-xl border border-border/70 bg-secondary/30 p-3.5 text-[11px] text-muted-foreground">
        <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
        <p className="leading-relaxed">
          <strong className="text-foreground">Human-in-the-Loop Clinical Governance: </strong>
          Workforce signals are deterministic rule-based operational advisories derived from published schedules, leave allocations, and shift demand requirements. They are designed to support clinical nurse managers and directors in timely decision-making. No automated roster modifications or clinical reassignment actions are taken without human review and confirmation.
        </p>
      </div>
    </div>
  );
}

function EmptyState({
  message,
  onReset,
}: {
  message: string;
  onReset?: () => void;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/30 p-10 text-center flex flex-col items-center justify-center gap-3">
      <Activity className="h-8 w-8 text-muted-foreground/30" />
      <p className="text-[12px] text-muted-foreground max-w-md leading-relaxed">{message}</p>
      {onReset && (
        <button
          onClick={onReset}
          className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-[12px] font-semibold text-foreground hover:bg-secondary transition"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Reset to Default View</span>
        </button>
      )}
    </div>
  );
}
