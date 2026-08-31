import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Users, UserMinus, CalendarClock, Gauge, Sparkles, AlertTriangle,
  ShieldAlert, ChevronDown, ChevronUp, ArrowRight, Activity, Layers,
  LineChart, Coffee, Clock,
} from "lucide-react";
import { StatusPill } from "@/components/Widget";
import { NursingCapacityIntelligence } from "@/components/NursingCapacityIntelligence";
import { AIWorkforceRisk } from "@/components/AIWorkforceRisk";
import { SourceLink } from "@/components/SourceLink";
import {
  workforceSummary,
  workforceSignals,
  ZONE_LABEL,
  type UnitCoverage,
  type Zone,
} from "@/lib/workforce-ops";

export const Route = createFileRoute("/_authenticated/workforce-intelligence")({
  head: () => ({
    meta: [
      { title: "Workforce Operations Dashboard · NOS" },
      {
        name: "description",
        content:
          "Nursing capacity, unit coverage, roster gaps and workforce risk in one operational view for nursing leadership.",
      },
      { property: "og:title", content: "Workforce Operations Dashboard · NOS" },
      {
        property: "og:description",
        content: "Do we have capacity? Is it aligned with demand? Where are the operational risks?",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WorkforceOperationsDashboard,
});

const RELATED_MODULES = [
  { label: "Nursing Workforce Intelligence", to: "/nursing-workforce-intelligence", icon: LineChart, desc: "Demand → capacity → risk → decision record" },
  { label: "AI Duty Scheduling Engine", to: "/scheduling", icon: CalendarClock, desc: "Generate, edit and export the nursing roster" },
  { label: "Intelligent Duty Scheduling", to: "/duty-scheduling", icon: CalendarClock, desc: "Human-centered rostering and approval" },
  { label: "Nursing Workforce Digital Twin", to: "/nursing-workforce-twin", icon: Layers, desc: "Live-style view of the nursing workforce" },
  { label: "Unit Capacity", to: "/unit-capacity", icon: Gauge, desc: "Patient-level acuity, workload and priority" },
  { label: "Workflow Intelligence", to: "/workflow-intelligence", icon: Activity, desc: "Task sequencing and bottlenecks" },
] as const;

const ZONE_TONE: Record<Zone, "success" | "warning" | "danger"> = {
  safe: "success",
  watch: "warning",
  critical: "danger",
};

function WorkforceOperationsDashboard() {
  const summary = useMemo(() => workforceSummary(), []);
  const signals = useMemo(() => workforceSignals(summary), [summary]);
  const [showMore, setShowMore] = useState(false);

  return (
    <main className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 sm:px-6">
      <header>
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
          <Users className="h-3.5 w-3.5" aria-hidden="true" />
          Workforce Operations
        </div>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          Workforce Operations Dashboard
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Do we have enough nursing capacity, is it aligned with patient demand, and where do
          operational risks need management attention?
        </p>
        <p className="mt-2 text-[11px] text-muted-foreground/90">
          {summary.generatedAt} · Demo / prototype data — not connected to a live HRIS, roster or EHR feed.
        </p>
      </header>

      {summary.isEmpty ? (
        <EmptyState message="No workforce data available for this institution." />
      ) : (
        <>
          {/* A. Workforce Overview */}
          <section>
            <SectionTitle icon={Users} title="Workforce Overview" />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
              <Kpi icon={Users} label="Total Staff" value={summary.totalStaff} tone="info" hint="Roster establishment" />
              <Kpi icon={Users} label="Scheduled Staff" value={summary.scheduledStaff} tone="info" hint="On duty this shift" />
              <Kpi
                icon={Clock}
                label="Available Capacity"
                value={`${summary.availableHrs}h`}
                tone="neutral"
                hint={`${summary.requiredHrs}h required`}
              />
              <Kpi
                icon={Gauge}
                label="Coverage"
                value={`${summary.coveragePct}%`}
                tone={ZONE_TONE[summary.zone]}
                hint={summary.coverageStatus}
              />
              <Kpi
                icon={AlertTriangle}
                label="Capacity Gap"
                value={`${summary.gapHrs >= 0 ? "+" : ""}${summary.gapHrs}h`}
                tone={summary.gapHrs < 0 ? "danger" : "success"}
                hint={summary.gapHrs < 0 ? "Shortfall vs demand" : "Spare hours"}
              />
              <Kpi
                icon={CalendarClock}
                label="Open Shifts"
                value={summary.openShifts}
                tone={summary.openShifts > 0 ? "warning" : "success"}
                hint="Unfilled · next 72h"
              />
              <Kpi
                icon={UserMinus}
                label="Staff on Leave"
                value={summary.onLeave}
                tone="warning"
                hint="Planned and sick"
              />
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Coverage = available nursing hours ÷ required nursing hours. All figures on this page
              derive from the same unit dataset shown below.
            </p>
          </section>

          {/* C. Workforce demand vs capacity (existing component, same dataset) */}
          <NursingCapacityIntelligence />

          {/* B. Unit Capacity */}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <SectionTitle icon={Gauge} title="Unit Capacity & Coverage" />
            <UnitCoverageTable units={summary.units} />
            <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
              <span>Gap = scheduled hours − required hours. Negative values are shortfalls.</span>
              <Link to="/unit-capacity" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
                Open Unit Capacity <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </section>

          {/* E. Workforce risk — AI signals, human decision */}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <SectionTitle icon={ShieldAlert} title="AI Workforce Signals" pill="AI Prototype" />
              <span className="text-[11px] font-medium text-muted-foreground">
                AI recommends · authorized healthcare professionals decide
              </span>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              {signals.map((s) => (
                <div key={s.id} className="flex gap-3 rounded-lg border border-border bg-background p-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
                      s.tone === "danger"
                        ? "bg-destructive/15 text-destructive"
                        : s.tone === "warning"
                          ? "bg-warning/20 text-warning-foreground"
                          : "bg-primary/10 text-primary"
                    }`}
                  >
                    <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{s.title}</span>
                      <StatusPill tone={s.tone}>{s.unit}</StatusPill>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground/80">Observed:</span> {s.observation}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      <span className="font-medium text-primary">AI recommendation:</span> {s.recommendation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] italic text-muted-foreground">
              NOS never assigns staff, publishes rosters or changes shifts automatically. Every
              action above requires a manager decision.
            </p>
          </section>

          {/* D. Shift / roster intelligence — navigation into existing modules */}
          <section>
            <SectionTitle icon={CalendarClock} title="Shift & Roster Intelligence" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {RELATED_MODULES.map((m) => (
                <Link
                  key={m.to}
                  to={m.to}
                  className="group flex items-start gap-3 rounded-xl border border-border bg-card p-3.5 shadow-sm transition hover:border-primary/45 hover:bg-accent/40"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <m.icon className="h-4.5 w-4.5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-semibold text-foreground">{m.label}</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">{m.desc}</div>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
                </Link>
              ))}
            </div>
          </section>

          {/* Executive summary — consistent with the numbers above */}
          <section className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/[0.06] via-card to-card p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-primary">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              </div>
              <h2 className="text-base font-semibold tracking-tight text-foreground">Executive AI Summary</h2>
              <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                AI Prototype
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-foreground">
              Institution-wide nursing capacity is in the{" "}
              <span className="font-semibold">{ZONE_LABEL[summary.zone]}</span> zone at{" "}
              <span className="tabular-nums font-semibold">{summary.coveragePct}%</span> coverage
              ({summary.requiredHrs}h required vs {summary.availableHrs}h scheduled).{" "}
              {summary.unitsOverCapacity.length
                ? `${summary.unitsOverCapacity.map((u) => u.key).join(", ")} ${summary.unitsOverCapacity.length === 1 ? "is" : "are"} below required cover, while other units hold spare hours.`
                : "No unit is currently below required cover."}{" "}
              Workload balance is {summary.balanceLabel.toLowerCase()} ({summary.balanceScore}/100).
            </p>
            <p className="mt-3 text-[11px] italic text-muted-foreground">
              Demo data · AI outputs support — not replace — clinical and operational judgement.
            </p>
          </section>

          <button
            type="button"
            onClick={() => setShowMore((v) => !v)}
            className="mx-auto flex w-full max-w-md items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-secondary"
          >
            {showMore ? (
              <>
                <ChevronUp className="h-4 w-4" /> Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" /> View workforce risk & wellbeing signals
              </>
            )}
          </button>

          {showMore && (
            <>
              {/* E. Predictive workforce risk (existing module) */}
              <AIWorkforceRisk />

              {/* F. Staff wellbeing signal */}
              <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <SectionTitle icon={Coffee} title="Staff Wellbeing Signal" pill="Operational signal" />
                <div className="grid gap-3 sm:grid-cols-3">
                  <Kpi
                    icon={Coffee}
                    label="Units with break risk"
                    value={summary.unitsOverCapacity.length}
                    tone={summary.unitsOverCapacity.length ? "warning" : "success"}
                    hint="Units below required cover"
                  />
                  <Kpi
                    icon={Clock}
                    label="Unfilled shift load"
                    value={summary.openShifts}
                    tone={summary.openShifts > 0 ? "warning" : "success"}
                    hint="Drives overtime requests"
                  />
                  <Kpi
                    icon={Users}
                    label="Senior cover"
                    value={`${summary.seniorPct}%`}
                    tone={summary.seniorPct >= 40 ? "success" : "warning"}
                    hint="Share of scheduled nurses"
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  These are operational wellbeing signals only — no clinical or psychological
                  conclusion is implied. Fatigue, recovery and break management are owned by
                  Employee Wellbeing. <SourceLink layer="wellbeing" />
                </p>
              </section>
            </>
          )}
        </>
      )}

      <footer className="pt-2 pb-8 text-center text-[11px] text-muted-foreground">
        Workforce Operations Dashboard · Prototype · Seeded demo data, not live hospital records.
      </footer>
    </main>
  );
}

// ---------------- Sub components ----------------
function UnitCoverageTable({ units }: { units: UnitCoverage[] }) {
  if (!units.length) return <EmptyState message="No unit capacity data available." />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <th className="py-2 pr-3 font-semibold">Unit</th>
            <th className="py-2 pr-3 text-right font-semibold">Required (h)</th>
            <th className="py-2 pr-3 text-right font-semibold">Scheduled (h)</th>
            <th className="py-2 pr-3 text-right font-semibold">Nurses</th>
            <th className="py-2 pr-3 text-right font-semibold">Coverage</th>
            <th className="py-2 pr-3 text-right font-semibold">Gap</th>
            <th className="py-2 pr-3 text-right font-semibold">Open shifts</th>
            <th className="py-2 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {units.map((u) => (
            <tr key={u.key} className="border-b border-border/60 last:border-0">
              <td className="py-2 pr-3 font-medium text-foreground">{u.key}</td>
              <td className="py-2 pr-3 text-right tabular-nums text-muted-foreground">{u.reqHrs}</td>
              <td className="py-2 pr-3 text-right tabular-nums text-muted-foreground">{u.availHrs}</td>
              <td className="py-2 pr-3 text-right tabular-nums text-muted-foreground">{u.nurses}</td>
              <td className="py-2 pr-3 text-right tabular-nums font-medium text-foreground">{u.coveragePct}%</td>
              <td
                className={`py-2 pr-3 text-right tabular-nums font-medium ${
                  u.gapHrs < 0 ? "text-destructive" : "text-foreground"
                }`}
              >
                {u.gapHrs >= 0 ? "+" : ""}
                {u.gapHrs}h
              </td>
              <td className="py-2 pr-3 text-right tabular-nums text-muted-foreground">{u.openShifts}</td>
              <td className="py-2">
                <StatusPill tone={ZONE_TONE[u.zone]}>{u.status}</StatusPill>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-8 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  pill,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  pill?: string;
}) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      {pill && (
        <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
          {pill}
        </span>
      )}
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  tone,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  tone: "info" | "success" | "warning" | "danger" | "neutral";
  hint?: string;
}) {
  const toneMap = {
    info: "text-primary bg-primary/10",
    success: "text-success bg-success/15",
    warning: "text-warning-foreground bg-warning/20",
    danger: "text-destructive bg-destructive/15",
    neutral: "text-muted-foreground bg-secondary",
  };
  const safeValue =
    typeof value === "number" && !Number.isFinite(value) ? "—" : value === "" ? "—" : value;
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className={`flex h-8 w-8 items-center justify-center rounded-md ${toneMap[tone]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{safeValue}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
      {hint && <div className="mt-1 text-[10px] text-muted-foreground/80">{hint}</div>}
    </div>
  );
}
