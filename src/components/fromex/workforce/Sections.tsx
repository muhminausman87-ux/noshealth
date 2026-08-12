import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  Clock,
  HeartHandshake,
  Users,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { AiPrototype } from "@/components/fromex/Bits";
import {
  CAPACITY_LABEL,
  CAPACITY_TONE_L,
  DEMAND_LABEL,
  DEMAND_TONE,
  deptColor,
  deptName,
  type CapacityLevel,
  type DemandForecastPoint,
  type DemandLevel,
  type NurseWorkload,
  type PatientDemand,
  type WorkforceCapacity,
  type WorkforceRisk,
} from "@/lib/fromex-workforce";

/* ------------------------------------------------------------ primitives */

export function Section({
  title,
  subtitle,
  icon: Icon,
  ai,
  children,
}: {
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  ai?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
        <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>
        {ai && <AiPrototype />}
        {subtitle && <p className="basis-full text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

export function LevelBadge({ level, kind }: { level: DemandLevel | CapacityLevel; kind: "demand" | "capacity" }) {
  const tone =
    kind === "demand" ? DEMAND_TONE[level as DemandLevel] : CAPACITY_TONE_L[level as CapacityLevel];
  const label =
    kind === "demand" ? DEMAND_LABEL[level as DemandLevel] : CAPACITY_LABEL[level as CapacityLevel];
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider"
      style={{ background: `color-mix(in oklab, ${tone} 14%, transparent)`, color: tone }}
    >
      {label}
    </span>
  );
}

function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="text-xl font-semibold tabular-nums tracking-tight text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
      {hint && <div className="mt-0.5 text-[10px] text-muted-foreground/80">{hint}</div>}
    </div>
  );
}

/* --------------------------------------------------------- 1. demand now */

export function PatientDemandSection({ demand }: { demand: PatientDemand }) {
  return (
    <Section
      icon={Activity}
      title="Patient demand now"
      subtitle="How much nursing demand are our patients generating right now?"
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted-foreground">Current demand</span>
        <LevelBadge level={demand.level} kind="demand" />
        <span className="text-xs text-muted-foreground">{deptName(demand.department)} · current shift</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="High-acuity patients" value={demand.highAcuityPatients} hint="Rising MEWS or high dependency" />
        <Stat label="Time-sensitive workload" value={demand.timeSensitiveWorkload} hint="Medications, reassessments, procedures" />
        <Stat
          label="Admissions / discharges"
          value={demand.admissions + demand.discharges}
          hint={`${demand.admissions} admission · ${demand.discharges} discharge`}
        />
        <Stat label="Patients in unit" value={demand.patients} hint={`${demand.transfers} transfer in progress`} />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-muted/30 p-3">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Why demand is at this level
          </div>
          <ul className="space-y-1 text-xs text-foreground">
            {demand.drivers.map((d) => (
              <li key={d} className="flex gap-2">
                <span className="text-primary">·</span>
                {d}
              </li>
            ))}
          </ul>
        </div>

        <ContributingPatients demand={demand} />
      </div>
    </Section>
  );
}

function ContributingPatients({ demand }: { demand: PatientDemand }) {
  const top = demand.contributors.slice(0, 2);
  const share = Math.round(top.reduce((s, c) => s + c.share, 0) * 100);
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-3">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Contributing patients
        </span>
        <AiPrototype />
      </div>
      <p className="mb-2 text-xs text-foreground">
        {top.length} patients are driving {share}% of current unit nursing demand.
      </p>
      <ul className="space-y-1.5">
        {demand.contributors.map((c) => (
          <li key={c.patientId}>
            <Link
              to="/patient/$patientId"
              params={{ patientId: c.patientId }}
              className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs transition-colors hover:bg-secondary"
            >
              <span className="min-w-0">
                <span className="font-medium text-foreground">{c.label}</span>
                <span className="block truncate text-[11px] text-muted-foreground">{c.drivers.join(" · ")}</span>
              </span>
              <span className="flex shrink-0 items-center gap-1 text-muted-foreground">
                {c.mews != null && <span className="tabular-nums">MEWS {c.mews}</span>}
                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[10px] text-muted-foreground">
        Only the minimum information needed to understand demand is shown here.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------ 2. capacity */

export function CapacitySection({ capacity, showCompetency }: { capacity: WorkforceCapacity; showCompetency: boolean }) {
  return (
    <Section
      icon={Users}
      title="Nursing capacity"
      subtitle="Capacity is staff, relevant capability, current workload and shift context — not headcount."
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted-foreground">Capacity status</span>
        <LevelBadge level={capacity.level} kind="capacity" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Available nurses" value={capacity.availableNurses} />
        <Stat label="Currently assigned" value={capacity.assignedNurses} />
        <Stat label="Available nursing hours" value={`${capacity.availableHours}h`} hint={`${capacity.shift} shift`} />
        <Stat
          label="Relevant capability coverage"
          value={
            capacity.competency.every((c) => c.coverage === "adequate") ? "Adequate" : "Limited"
          }
        />
      </div>

      <div className="mt-4 rounded-xl border border-border bg-muted/30 p-3">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Why this capacity status
        </div>
        <ul className="space-y-1 text-xs text-foreground">
          {capacity.reasons.map((r) => (
            <li key={r} className="flex gap-2">
              <span className="text-primary">·</span>
              {r}
            </li>
          ))}
        </ul>
      </div>

      {showCompetency && (
        <div className="mt-4">
          <div className="mb-2 flex items-center gap-2">
            <BadgeCheck className="h-4 w-4 text-primary" aria-hidden="true" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Operationally relevant capability
            </span>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {capacity.competency.map((c) => (
              <div key={c.code} className="rounded-xl border border-border bg-background p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-foreground">{c.label}</span>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                    style={{
                      background:
                        c.coverage === "adequate"
                          ? "color-mix(in oklab, var(--color-success) 14%, transparent)"
                          : "color-mix(in oklab, var(--color-warning) 18%, transparent)",
                      color:
                        c.coverage === "adequate" ? "var(--color-success)" : "var(--color-warning)",
                    }}
                  >
                    {c.coverage}
                  </span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Required {c.requiredNurses} · qualified available {c.qualifiedAvailable}
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">{c.reason}</p>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground">
            Only capability relevant to the current operational situation is shown. Full competency, certification and
            career information belongs to the Employee Growth workspace and separate permissions.
          </p>
        </div>
      )}
    </Section>
  );
}

/* ------------------------------------------------------------ 3. forecast */

export function ForecastSection({ forecast }: { forecast: DemandForecastPoint[] }) {
  return (
    <Section
      icon={Clock}
      title="What is likely to happen next?"
      subtitle="Two-hour nursing demand outlook with the drivers behind every change."
      ai
    >
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {forecast.map((p) => (
          <div key={p.time} className="rounded-xl border border-border bg-background p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold tabular-nums text-foreground">{p.time}</span>
              <LevelBadge level={p.level} kind="demand" />
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">
              Projected capacity: <span className="font-medium text-foreground">{CAPACITY_LABEL[p.capacity]}</span>
            </div>
            <ul className="mt-2 space-y-1 text-[11px] text-muted-foreground">
              {p.drivers.map((d) => (
                <li key={d} className="flex gap-1.5">
                  <span className="text-primary">+</span>
                  {d}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] italic text-muted-foreground">
        AI Prototype estimates based on current acuity, scheduled activity and known shift context. Not a validated
        forecasting model.
      </p>
    </Section>
  );
}

/* ----------------------------------------------------------- 4. imbalance */

export function ImbalanceSection({ risks }: { risks: WorkforceRisk[] }) {
  const attention = risks.filter((r) => r.risk !== "adequate");
  const settled = risks.length - attention.length;
  return (
    <Section
      icon={AlertTriangle}
      title="Where is the imbalance?"
      subtitle="Only units where attention is required are listed."
    >
      <div className="space-y-2">
        {attention.map((r) => (
          <div key={r.department} className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-background p-3">
            <span
              className="h-8 w-1.5 rounded-full"
              style={{ background: deptColor(r.department) }}
              aria-hidden="true"
            />
            <span className="min-w-[7rem] text-sm font-semibold text-foreground">{deptName(r.department)}</span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              Demand <LevelBadge level={r.demand} kind="demand" />
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              Capacity <LevelBadge level={r.capacity} kind="capacity" />
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              Risk <LevelBadge level={r.risk} kind="capacity" />
            </span>
            <span className="basis-full text-[11px] text-muted-foreground">{r.headline}</span>
          </div>
        ))}
        {settled > 0 && (
          <p className="text-xs text-muted-foreground">
            {settled} other unit{settled > 1 ? "s are" : " is"} currently within available capacity.
          </p>
        )}
      </div>
    </Section>
  );
}

/* -------------------------------------------------- 5. individual workload */

export function WorkloadSection({ workloads }: { workloads: NurseWorkload[] }) {
  return (
    <Section
      icon={Users}
      title="Assignment balance"
      subtitle="Workload distribution across the current team — for support decisions, not performance scoring."
    >
      <div className="grid gap-2 md:grid-cols-3">
        {workloads.map((w) => (
          <div key={w.employeeId} className="rounded-xl border border-border bg-background p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-foreground">{w.displayName}</span>
              <LevelBadge level={w.workload} kind="demand" />
            </div>
            <ul className="mt-2 space-y-0.5 text-[11px] text-muted-foreground">
              <li>{w.patients} patients</li>
              <li>{w.highAcuityPatients} high-acuity patient{w.highAcuityPatients === 1 ? "" : "s"}</li>
              <li>{w.timeSensitiveTasks} time-sensitive tasks</li>
              <li>{w.admissionDischargeActivity} admission / discharge activity</li>
            </ul>
            <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-muted/50 p-2 text-[11px] text-muted-foreground">
              <HeartHandshake className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
              <span>
                Recovery signal: {w.recovery.consecutiveShifts} consecutive shifts
                {w.recovery.nightPattern ? " · night pattern" : ""}
                {w.recovery.overtimeHours ? ` · ${w.recovery.overtimeHours}h overtime` : ""}
                {w.recovery.breakTaken ? " · break taken" : " · break outstanding"}. {w.recovery.note}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/30 p-3">
        <AiPrototype />
        <p className="text-xs text-foreground">
          AI Prototype identifies that assignment distribution appears imbalanced. Reviewing assignments remains a human
          decision — the system never reassigns patients automatically.
        </p>
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground">
        Fatigue and recovery are shown as a separate wellbeing signal and are not applied as a capacity penalty unless
        an institution configures an approved rule.
      </p>
    </Section>
  );
}

/* -------------------------------------------------------- workforce trends */

export function TrendsSection() {
  const rows = [
    { label: "Shifts opening above planned demand (30 days)", value: "18%", note: "Concentrated on evening shifts" },
    { label: "Units repeatedly reaching capacity threshold", value: "2", note: "Medical Ward · Emergency" },
    { label: "Capability coverage gaps raised", value: "5", note: "Critical-care competency most frequent" },
    { label: "Development need signalled by operations", value: "Critical care", note: "Supports Employee Growth planning" },
  ];
  return (
    <Section
      icon={Activity}
      title="Workforce patterns"
      subtitle="Aggregated staffing and capability patterns to support planning and development — no individual scoring."
      ai
    >
      <div className="grid gap-2 md:grid-cols-2">
        {rows.map((r) => (
          <div key={r.label} className="rounded-xl border border-border bg-background p-3">
            <div className="text-lg font-semibold tracking-tight text-foreground">{r.value}</div>
            <div className="text-xs text-foreground">{r.label}</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">{r.note}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------- governance */

export function GovernanceSection({
  policyCode,
  policyTitle,
  acknowledgementMinutes,
  fatigueAffectsCapacity,
}: {
  policyCode: string;
  policyTitle: string;
  acknowledgementMinutes: number;
  fatigueAffectsCapacity: boolean;
}) {
  return (
    <Section
      icon={ShieldCheck}
      title="Governance & configuration"
      subtitle="What this institution has configured, and the boundary the intelligence operates within."
    >
      <dl className="grid gap-2 md:grid-cols-2">
        {[
          ["Active escalation policy", `${policyCode} — ${policyTitle}`],
          ["Acknowledgement window", `${acknowledgementMinutes} minutes`],
          ["Fatigue included in capacity", fatigueAffectsCapacity ? "Yes (configured)" : "No — wellbeing signal only"],
          ["Data boundary", "Institution-isolated. No cross-institution data is used."],
          ["Model learning", "Prediction → decision → outcome records are retained for institution-permitted review only."],
          ["Automatic self-training", "Disabled. No production self-training and no general AI training on patient data."],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl border border-border bg-background p-3">
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{k}</dt>
            <dd className="mt-0.5 text-xs text-foreground">{v}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
