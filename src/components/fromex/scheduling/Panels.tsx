import { useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  CalendarDays,
  CalendarRange,
  ClipboardList,
  Coffee,
  GitBranch,
  History,
  Inbox,
  Layers,
  Moon,
  Scale,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { AiPrototype } from "@/components/fromex/Bits";
import { SourceLink } from "@/components/SourceLink";
import {
  CONFLICT_LABEL,
  COMPETENCY_LABEL,
  LEAVE_LABEL,
  REQUEST_KIND_LABEL,
  REQUEST_STATUS_LABEL,
  REQUEST_STATUS_TONE,
  SHIFTS,
  STAGE_LABEL,
  STAGE_ORDER,
  dayLabel,
  deptShort,
  deptTone,
  isWeekend,
  type ChangeEntry,
  type CoverageResult,
  type DecisionKind,
  type DutyRequest,
  type FairnessRow,
  type LeaveImpactRow,
  type LeaveRecord,
  type Nurse,
  type RecoverySignalRow,
  type ScheduleConflict,
  type ScheduleStage,
  type SchedulingDecision,
  type SchedulingPolicy,
  type SchedulingRecommendation,
  type Severity,
  type ShiftAssignment,
  type ShiftCode,
} from "@/lib/fromex-scheduling";
import type { Department } from "@/lib/departments";

/* ------------------------------------------------------------ primitives */

const SEV_TONE: Record<Severity, string> = {
  info: "var(--color-muted-foreground)",
  review: "#d97706",
  high: "#dc2626",
};

export function Panel({
  title,
  subtitle,
  icon: Icon,
  ai,
  aside,
  children,
}: {
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  ai?: boolean;
  aside?: ReactNode;
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
        <div className="ml-auto">{aside}</div>
        {subtitle && <p className="basis-full text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function Tag({ tone, children }: { tone: string; children: ReactNode }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
      style={{ background: `color-mix(in oklab, ${tone} 15%, transparent)`, color: tone }}
    >
      {children}
    </span>
  );
}

function Stat({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-semibold tabular-nums" style={{ color: tone ?? "var(--color-foreground)" }}>
        {value}
      </div>
      {hint && <div className="mt-0.5 text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

/* ------------------------------------------------------------- overview */

export function OverviewPanel({
  dept,
  coverage,
  conflicts,
  stage,
  policy,
}: {
  dept: Department;
  coverage: CoverageResult[];
  conflicts: ScheduleConflict[];
  stage: ScheduleStage;
  policy: SchedulingPolicy;
}) {
  const gap = coverage.reduce((s, c) => s + c.gap, 0);
  const capability = coverage.filter((c) => c.capabilityAtRisk).length;
  const high = conflicts.filter((c) => c.severity === "high").length;
  return (
    <Panel
      title="Schedule overview"
      icon={CalendarRange}
      subtitle={`${deptShort(dept)} · rolling 7-day roster period · ${policy.title}`}
      aside={<Tag tone="var(--color-primary)">{STAGE_LABEL[stage]}</Tag>}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Shifts in period" value={String(coverage.length)} hint="Day · Evening · Night" />
        <Stat label="Potential capacity gap" value={`${gap} RN`} hint="Across the period" tone={gap ? "#dc2626" : undefined} />
        <Stat
          label="Capability at risk"
          value={`${capability} shift${capability === 1 ? "" : "s"}`}
          hint="Competency below requirement"
          tone={capability ? "#d97706" : undefined}
        />
        <Stat label="High-severity conflicts" value={String(high)} hint="Human review required" tone={high ? "#dc2626" : undefined} />
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">
        Demand, capacity and forecast signals are consumed from{" "}
        <SourceLink layer="workforce" label="Nursing Workforce Intelligence" /> — duty scheduling
        does not recalculate them.
      </p>
    </Panel>
  );
}

/* ------------------------------------------------------------- coverage */

export function CoveragePanel({ coverage, days }: { coverage: CoverageResult[]; days: string[] }) {
  return (
    <Panel
      title="Coverage vs patient demand"
      icon={Users}
      ai
      subtitle="Required nursing capacity is derived from patient demand before the roster is generated."
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-xs">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="py-2 pr-3">Shift</th>
              {days.map((d) => (
                <th key={d} className="px-2 py-2 font-semibold">
                  {dayLabel(d)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SHIFTS.map((s) => (
              <tr key={s.id} className="border-t border-border">
                <td className="py-2 pr-3 font-medium text-foreground">
                  {s.label}
                  <div className="text-[10px] text-muted-foreground">
                    {s.start}–{s.end}
                  </div>
                </td>
                {days.map((d) => {
                  const c = coverage.find((x) => x.date === d && x.shift === s.id);
                  if (!c) return <td key={d} className="px-2 py-2" />;
                  const tone = c.gap > 0 ? "#dc2626" : c.capabilityAtRisk ? "#d97706" : "#0d9488";
                  return (
                    <td key={d} className="px-2 py-2">
                      <div className="rounded-lg border border-border p-2" style={{ borderColor: `color-mix(in oklab, ${tone} 35%, transparent)` }}>
                        <div className="font-semibold tabular-nums" style={{ color: tone }}>
                          {c.scheduled}/{c.required}
                        </div>
                        <div className="text-[10px] text-muted-foreground">demand {c.demand.replace("_", " ")}</div>
                        {c.capabilityAtRisk && <div className="text-[10px] font-medium text-amber-600">capability at risk</div>}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* --------------------------------------------------------------- roster */

export function RosterPanel({
  roster,
  nurses,
  days,
  leave,
  conflicts,
  dept,
}: {
  roster: ShiftAssignment[];
  nurses: Nurse[];
  days: string[];
  leave: LeaveRecord[];
  conflicts: ScheduleConflict[];
  dept: Department;
}) {
  const [shiftFilter, setShiftFilter] = useState<ShiftCode | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published">("all");
  const [nurseFilter, setNurseFilter] = useState<string>("all");
  const [openDay, setOpenDay] = useState<string | null>(days[0] ?? null);
  const byId = useMemo(() => new Map(nurses.map((n) => [n.id, n])), [nurses]);

  const onLeave = (nurseId: string, date: string) =>
    leave.find((l) => l.nurseId === nurseId && date >= l.from && date <= l.to);

  return (
    <Panel title="Duty roster" icon={CalendarDays} subtitle="Progressive disclosure — open a day to see its assignments.">
      <div className="mb-3 flex flex-wrap gap-2 text-[11px]">
        <select
          aria-label="Filter by shift"
          value={shiftFilter}
          onChange={(e) => setShiftFilter(e.target.value as ShiftCode | "all")}
          className="rounded-lg border border-border bg-background px-2 py-1"
        >
          <option value="all">All shifts</option>
          {SHIFTS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter by status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | "draft" | "published")}
          className="rounded-lg border border-border bg-background px-2 py-1"
        >
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
        <select
          aria-label="Filter by employee"
          value={nurseFilter}
          onChange={(e) => setNurseFilter(e.target.value)}
          className="rounded-lg border border-border bg-background px-2 py-1"
        >
          <option value="all">All employees</option>
          {nurses.map((n) => (
            <option key={n.id} value={n.id}>
              {n.name}
            </option>
          ))}
        </select>
        <span className="inline-flex items-center rounded-lg border border-border px-2 py-1 text-muted-foreground">
          {deptShort(dept)}
        </span>
      </div>

      <div className="space-y-2">
        {days.map((d) => {
          const items = roster.filter(
            (a) =>
              a.date === d &&
              (shiftFilter === "all" || a.shift === shiftFilter) &&
              (statusFilter === "all" || (statusFilter === "published" ? a.status === "published" : a.status !== "published")) &&
              (nurseFilter === "all" || a.nurseId === nurseFilter),
          );
          const open = openDay === d;
          return (
            <div key={d} className="rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setOpenDay(open ? null : d)}
                className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left"
                aria-expanded={open}
              >
                <span className="text-sm font-medium text-foreground">
                  {dayLabel(d)} {isWeekend(d) && <Tag tone="#7c3aed">weekend</Tag>}
                </span>
                <span className="text-[11px] text-muted-foreground">{items.length} assignments</span>
              </button>
              {open && (
                <div className="grid gap-2 border-t border-border p-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items.length === 0 && <p className="text-xs text-muted-foreground">No assignments match the filters.</p>}
                  {items.map((a) => {
                    const n = byId.get(a.nurseId);
                    const lv = onLeave(a.nurseId, a.date);
                    const flag = conflicts.find((c) => c.nurseId === a.nurseId && c.date === a.date);
                    return (
                      <div key={a.id} className="rounded-lg border border-border bg-background p-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-foreground">{n?.name}</span>
                          <Tag tone={deptTone(a.dept)}>{n?.grade}</Tag>
                        </div>
                        <div className="mt-1 text-[11px] text-muted-foreground">
                          {SHIFTS.find((s) => s.id === a.shift)?.label} · {a.role} · {deptShort(a.dept)}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {(n?.competencies ?? []).slice(0, 2).map((c) => (
                            <Tag key={c} tone="#0891b2">
                              {COMPETENCY_LABEL[c]}
                            </Tag>
                          ))}
                          <Tag tone={a.status === "published" ? "#0d9488" : "var(--color-muted-foreground)"}>{a.status}</Tag>
                          {lv && <Tag tone="#dc2626">{LEAVE_LABEL[lv.type]}</Tag>}
                          {!a.breakCovered && <Tag tone="#d97706">break uncovered</Tag>}
                        </div>
                        {flag && (
                          <p className="mt-2 flex items-start gap-1 text-[11px]" style={{ color: SEV_TONE[flag.severity] }}>
                            <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
                            <span>
                              <AiPrototype /> {flag.message}
                            </span>
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------------ skill mix */

export function SkillMixPanel({ coverage }: { coverage: CoverageResult[] }) {
  const rows = coverage.filter((c) => c.competency.length).slice(0, 12);
  const atRisk = rows.filter((r) => r.capabilityAtRisk);
  return (
    <Panel title="Skill mix & capability" icon={BadgeCheck} ai subtitle="Numerical staffing adequacy does not guarantee capability.">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Capacity</div>
          <div className="mt-1 text-sm font-semibold text-foreground">
            {coverage.every((c) => c.gap === 0) ? "Numerically adequate" : "Below configured minimum on some shifts"}
          </div>
        </div>
        <div className="rounded-xl border border-border p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Capability</div>
          <div className="mt-1 text-sm font-semibold" style={{ color: atRisk.length ? "#d97706" : "#0d9488" }}>
            {atRisk.length ? "At risk" : "Requirement met"}
          </div>
        </div>
      </div>
      <ul className="mt-3 space-y-2">
        {rows.map((r) => (
          <li key={`${r.date}-${r.shift}`} className="flex flex-wrap items-center gap-2 rounded-lg border border-border p-2 text-xs">
            <span className="font-medium text-foreground">
              {dayLabel(r.date)} · {r.shift}
            </span>
            {r.competency.map((c) => (
              <Tag key={c.code} tone={c.available < c.required ? "#d97706" : "#0d9488"}>
                {COMPETENCY_LABEL[c.code]} {c.available}/{c.required}
              </Tag>
            ))}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] text-muted-foreground">
        Certification and competency development remain owned by{" "}
        <SourceLink layer="growth" label="Employee Growth" />; only operationally relevant competency is surfaced here.
      </p>
    </Panel>
  );
}

/* ------------------------------------------------------------ conflicts */

export function ConflictsPanel({ conflicts, nurses }: { conflicts: ScheduleConflict[]; nurses: Nurse[] }) {
  const byId = useMemo(() => new Map(nurses.map((n) => [n.id, n])), [nurses]);
  const grouped = useMemo(() => {
    const m = new Map<string, ScheduleConflict[]>();
    conflicts.forEach((c) => m.set(c.kind, [...(m.get(c.kind) ?? []), c]));
    return Array.from(m.entries());
  }, [conflicts]);

  return (
    <Panel title="Schedule conflicts" icon={AlertTriangle} ai subtitle="A conflict is surfaced for human review — never resolved automatically.">
      {!conflicts.length && <p className="text-sm text-muted-foreground">No conflicts detected in this roster period.</p>}
      <div className="space-y-3">
        {grouped.map(([kind, list]) => (
          <div key={kind} className="rounded-xl border border-border p-3">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">{CONFLICT_LABEL[kind as keyof typeof CONFLICT_LABEL]}</span>
              <Tag tone={SEV_TONE[list[0]!.severity]}>{list.length}</Tag>
            </div>
            <ul className="space-y-1">
              {list.slice(0, 4).map((c) => (
                <li key={c.id} className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {dayLabel(c.date)}
                    {c.nurseId ? ` · ${byId.get(c.nurseId)?.name}` : ""}
                  </span>{" "}
                  — {c.message}
                  {c.policyRef && <span className="ml-1 text-[10px] uppercase tracking-wider">[{c.policyRef}]</span>}
                </li>
              ))}
              {list.length > 4 && <li className="text-[11px] text-muted-foreground">+ {list.length - 4} more</li>}
            </ul>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ------------------------------------------------- recovery & wellbeing */

export function RecoveryPanel({ signals, nurses }: { signals: RecoverySignalRow[]; nurses: Nurse[] }) {
  const byId = useMemo(() => new Map(nurses.map((n) => [n.id, n])), [nurses]);
  return (
    <Panel
      title="Recovery & wellbeing signals"
      icon={Moon}
      ai
      subtitle="Non-punitive signals. FROMEX cannot prevent circadian disruption — it flags patterns for review."
    >
      <ul className="grid gap-2 sm:grid-cols-2">
        {signals.slice(0, 8).map((s) => (
          <li key={s.nurseId} className="rounded-xl border border-border p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-foreground">{byId.get(s.nurseId)?.name}</span>
              <Tag tone={SEV_TONE[s.tone]}>{s.label}</Tag>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">{s.detail}</p>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] text-muted-foreground">
        Fatigue analytics, support and recognition remain owned by{" "}
        <SourceLink layer="wellbeing" label="Employee Wellbeing" />. Wellbeing information stays separate from capacity
        scoring unless the institution configures otherwise.
      </p>
    </Panel>
  );
}

export function BreakPanel({ roster, policy }: { roster: ShiftAssignment[]; policy: SchedulingPolicy }) {
  const uncovered = roster.filter((a) => !a.breakCovered).length;
  return (
    <Panel title="Breaks & protected meal periods" icon={Coffee} subtitle="Breaks are scheduled work, not spare capacity.">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Planned breaks" value={String(roster.filter((a) => a.breakPlanned).length)} />
        <Stat label="Without cover" value={String(uncovered)} tone={uncovered ? "#d97706" : undefined} hint="Requires break coverage" />
        <Stat label="Protected period" value={`${policy.protectedBreakMinutes} min`} hint="Institution configured" />
      </div>
    </Panel>
  );
}

/* -------------------------------------------------------------- fairness */

export function FairnessPanel({ rows, nurses }: { rows: FairnessRow[]; nurses: Nurse[] }) {
  const byId = useMemo(() => new Map(nurses.map((n) => [n.id, n])), [nurses]);
  return (
    <Panel
      title="Shift pattern & workload distribution"
      icon={Scale}
      ai
      subtitle="A distribution signal for leaders — not an employee performance score."
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-xs">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="py-2">Employee</th>
              <th className="py-2">Duties</th>
              <th className="py-2">Nights</th>
              <th className="py-2">Weekends</th>
              <th className="py-2">Hours</th>
              <th className="py-2">Additional</th>
              <th className="py-2">Signal</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.nurseId} className="border-t border-border">
                <td className="py-2 font-medium text-foreground">{byId.get(r.nurseId)?.name}</td>
                <td className="py-2 tabular-nums">{r.totalShifts}</td>
                <td className="py-2 tabular-nums">{r.nights}</td>
                <td className="py-2 tabular-nums">{r.weekends}</td>
                <td className="py-2 tabular-nums">{r.hours}</td>
                <td className="py-2 tabular-nums">{r.overtimeHours}</td>
                <td className="py-2">
                  <Tag tone={r.signal === "review" ? "#d97706" : r.signal === "watch" ? "#0891b2" : "#0d9488"}>
                    {r.signal === "review" ? "Review distribution" : r.signal === "watch" ? "Watch" : "Balanced"}
                  </Tag>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* --------------------------------------------------- availability/leave */

export function AvailabilityPanel({ nurses, leave }: { nurses: Nurse[]; leave: LeaveRecord[] }) {
  return (
    <Panel title="Nurse availability & preferences" icon={ClipboardList} subtitle="Availability and personal commitments are inputs, not obstacles.">
      <ul className="grid gap-2 sm:grid-cols-2">
        {nurses.map((n) => {
          const lv = leave.filter((l) => l.nurseId === n.id);
          return (
            <li key={n.id} className="rounded-xl border border-border p-3 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground">{n.name}</span>
                <Tag tone="var(--color-muted-foreground)">{n.contractedHours}h contract</Tag>
              </div>
              <div className="mt-1 text-muted-foreground">
                Prefers: {n.preferences.preferredShifts.join(", ") || "—"}
                {n.preferences.avoidShifts.length ? ` · avoids: ${n.preferences.avoidShifts.join(", ")}` : ""}
              </div>
              {n.preferences.note && <div className="mt-1 text-[11px] text-muted-foreground">{n.preferences.note}</div>}
              <div className="mt-1 flex flex-wrap gap-1">
                {lv.map((l) => (
                  <Tag key={l.id} tone={l.status === "approved" ? "#0d9488" : "#d97706"}>
                    {LEAVE_LABEL[l.type]} · {l.status}
                  </Tag>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

export function LeaveImpactPanel({ impact }: { impact: LeaveImpactRow }) {
  return (
    <Panel title="Leave impact on capacity" icon={Layers} ai subtitle="Approved leave is never cancelled automatically.">
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Approved leave" value={String(impact.approvedRequests)} />
        <Stat label="Nursing hours affected" value={`${impact.hoursLost} h`} tone="#d97706" />
        <Stat label="Department" value={deptShort(impact.dept)} />
        <Stat label="Demand window" value={impact.demandWindow.replace("_", " ")} />
      </div>
      <p className="mt-3 text-sm text-foreground">{impact.note}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {impact.competenciesAffected.map((c) => (
          <Tag key={c} tone="#0891b2">
            {COMPETENCY_LABEL[c]} affected
          </Tag>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        <AiPrototype /> Review coverage before finalising the schedule.
      </p>
    </Panel>
  );
}

/* -------------------------------------------------------- duty requests */

export function RequestsPanel({
  requests,
  nurses,
  canDecide,
  onSetStatus,
}: {
  requests: DutyRequest[];
  nurses: Nurse[];
  canDecide: boolean;
  onSetStatus: (id: string, status: DutyRequest["status"]) => void;
}) {
  const byId = useMemo(() => new Map(nurses.map((n) => [n.id, n])), [nurses]);
  return (
    <Panel
      title="Duty requests"
      icon={Inbox}
      subtitle="Requested is not approved, and approved is not scheduled. Institution policy determines handling."
    >
      <ul className="space-y-2">
        {requests.map((r) => (
          <li key={r.id} className="rounded-xl border border-border p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-foreground">{byId.get(r.nurseId)?.name}</span>
              <Tag tone="var(--color-primary)">{REQUEST_KIND_LABEL[r.kind]}</Tag>
              <Tag tone={REQUEST_STATUS_TONE[r.status]}>{REQUEST_STATUS_LABEL[r.status]}</Tag>
              <span className="ml-auto text-[11px] text-muted-foreground">{dayLabel(r.date)}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{r.detail}</p>
            {r.policyNote && <p className="mt-1 text-[11px] text-muted-foreground">Policy: {r.policyNote}</p>}
            {canDecide && r.status !== "scheduled" && (
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onSetStatus(r.id, "under_review")}
                  className="rounded-lg border border-border px-2 py-1 text-[11px] font-medium text-foreground hover:bg-muted"
                >
                  Mark under review
                </button>
                <button
                  type="button"
                  onClick={() => onSetStatus(r.id, "approved")}
                  className="rounded-lg bg-primary px-2 py-1 text-[11px] font-medium text-primary-foreground"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => onSetStatus(r.id, "declined")}
                  className="rounded-lg border border-border px-2 py-1 text-[11px] font-medium text-foreground hover:bg-muted"
                >
                  Decline with reason
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/** Nurse-facing view — no unit-wide analytics. */
export function MyDutyPanel({
  nurse,
  roster,
  requests,
  onSubmit,
}: {
  nurse: Nurse;
  roster: ShiftAssignment[];
  requests: DutyRequest[];
  onSubmit: (kind: DutyRequest["kind"]) => void;
}) {
  const mine = roster.filter((a) => a.nurseId === nurse.id).slice(0, 8);
  return (
    <>
      <Panel title="My upcoming duty" icon={CalendarDays} subtitle={`${nurse.name} · ${deptShort(nurse.dept)}`}>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {mine.map((a) => (
            <li key={a.id} className="rounded-xl border border-border p-3 text-xs">
              <div className="text-sm font-medium text-foreground">{dayLabel(a.date)}</div>
              <div className="text-muted-foreground">
                {SHIFTS.find((s) => s.id === a.shift)?.label} · {a.role}
              </div>
              <Tag tone={a.status === "published" ? "#0d9488" : "var(--color-muted-foreground)"}>{a.status}</Tag>
            </li>
          ))}
          {!mine.length && <li className="text-xs text-muted-foreground">No duty scheduled in this period.</li>}
        </ul>
      </Panel>

      <Panel title="My duty requests" icon={Inbox} subtitle="Submit a request — your institution's policy determines the outcome.">
        <div className="mb-3 flex flex-wrap gap-2">
          {(["day_off", "preferred_shift", "leave", "shift_exchange", "availability"] as DutyRequest["kind"][]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => onSubmit(k)}
              className="rounded-lg border border-border px-3 py-1.5 text-[11px] font-medium text-foreground hover:bg-muted"
            >
              {REQUEST_KIND_LABEL[k]}
            </button>
          ))}
        </div>
        <ul className="space-y-2">
          {requests.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-border p-3 text-xs">
              <span className="font-medium text-foreground">{REQUEST_KIND_LABEL[r.kind]}</span>
              <span className="text-muted-foreground">{r.detail}</span>
              <span className="ml-auto">
                <Tag tone={REQUEST_STATUS_TONE[r.status]}>{REQUEST_STATUS_LABEL[r.status]}</Tag>
              </span>
            </li>
          ))}
          {!requests.length && <li className="text-xs text-muted-foreground">No requests submitted yet.</li>}
        </ul>
      </Panel>
    </>
  );
}

/* ------------------------------------------------ AI recommendations */

export function RecommendationsPanel({
  recommendations,
  decisions,
  canDecide,
  decidedByRole,
  onDecide,
}: {
  recommendations: SchedulingRecommendation[];
  decisions: Record<string, SchedulingDecision>;
  canDecide: boolean;
  decidedByRole: string;
  onDecide: (d: SchedulingDecision) => void;
}) {
  const [reason, setReason] = useState<Record<string, string>>({});
  return (
    <Panel
      title="AI scheduling recommendations"
      icon={Sparkles}
      ai
      subtitle="AI recommends. Authorised humans decide. The assistant never assigns, cancels leave, forces overtime or publishes."
    >
      <div className="space-y-3">
        {recommendations.map((r) => {
          const d = decisions[r.id];
          return (
            <article key={r.id} className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">{r.title}</h3>
                <Tag tone={SEV_TONE[r.severity]}>{r.severity === "high" ? "Action needed" : "Review"}</Tag>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{r.rationale}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {r.basedOn.map((b) => (
                  <Tag key={b} tone="var(--color-muted-foreground)">
                    {b}
                  </Tag>
                ))}
              </div>
              <div className="mt-3 rounded-lg border border-border bg-muted/30 p-3">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Potential options — human decision required
                </div>
                <ol className="mt-1 list-decimal space-y-1 pl-5 text-xs text-foreground">
                  {r.options.map((o) => (
                    <li key={o}>{o}</li>
                  ))}
                </ol>
              </div>

              {d ? (
                <p className="mt-3 text-[11px] text-muted-foreground">
                  {d.kind} by {d.decidedBy} · {new Date(d.decidedAt).toLocaleString()} — {d.reason || "no reason recorded"}
                </p>
              ) : canDecide ? (
                <div className="mt-3 space-y-2">
                  <input
                    aria-label={`Reason for decision on ${r.title}`}
                    value={reason[r.id] ?? ""}
                    onChange={(e) => setReason((p) => ({ ...p, [r.id]: e.target.value }))}
                    placeholder="Reason (recorded with the decision)"
                    className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs"
                  />
                  <div className="flex flex-wrap gap-2">
                    {(["accepted", "modified", "declined", "overridden"] as DecisionKind[]).map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() =>
                          onDecide({
                            recommendationId: r.id,
                            kind: k,
                            reason: reason[r.id] ?? "",
                            decidedBy: decidedByRole,
                            decidedAt: new Date().toISOString(),
                          })
                        }
                        className={
                          k === "accepted"
                            ? "rounded-lg bg-primary px-3 py-1.5 text-[11px] font-medium text-primary-foreground"
                            : "rounded-lg border border-border px-3 py-1.5 text-[11px] font-medium text-foreground hover:bg-muted"
                        }
                      >
                        {k[0]!.toUpperCase() + k.slice(1)}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Overriding a recommendation carries no penalty and no employee scoring.
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-[11px] text-muted-foreground">Read-only in this responsibility view.</p>
              )}
            </article>
          );
        })}
      </div>
    </Panel>
  );
}

/* --------------------------------------------- generation and approval */

export function GeneratePanel({
  stage,
  onGenerate,
  conflicts,
  policy,
}: {
  stage: ScheduleStage;
  onGenerate: () => void;
  conflicts: ScheduleConflict[];
  policy: SchedulingPolicy;
}) {
  return (
    <Panel title="Create / generate schedule" icon={GitBranch} subtitle="Generation produces a draft for review — it never publishes.">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onGenerate}
          className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
        >
          Generate draft schedule
        </button>
        <span className="text-[11px] text-muted-foreground">
          Inputs: patient demand · staffing minimums · competency requirements · approved leave · availability · duty
          requests · recovery rules · fairness
        </span>
      </div>
      {stage !== "draft" && (
        <p className="mt-3 text-xs text-muted-foreground">
          <AiPrototype /> Draft analysed against {policy.title}: {conflicts.length} item
          {conflicts.length === 1 ? "" : "s"} require human review before approval.
        </p>
      )}
    </Panel>
  );
}

export function ApprovalPanel({
  stage,
  canApprove,
  onAdvance,
}: {
  stage: ScheduleStage;
  canApprove: boolean;
  onAdvance: (s: ScheduleStage) => void;
}) {
  const idx = STAGE_ORDER.indexOf(stage);
  return (
    <Panel title="Approval & publish" icon={ShieldCheck} subtitle="Draft → analysis → conflict review → approval → publish → change tracking.">
      <ol className="flex flex-wrap gap-2">
        {STAGE_ORDER.map((s, i) => (
          <li key={s}>
            <Tag tone={i <= idx ? "#0d9488" : "var(--color-muted-foreground)"}>{STAGE_LABEL[s]}</Tag>
          </li>
        ))}
      </ol>
      <div className="mt-3 flex flex-wrap gap-2">
        {canApprove ? (
          <>
            <button
              type="button"
              disabled={idx >= STAGE_ORDER.length - 1}
              onClick={() => onAdvance(STAGE_ORDER[Math.min(idx + 1, STAGE_ORDER.length - 1)]!)}
              className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"
            >
              Advance to {STAGE_LABEL[STAGE_ORDER[Math.min(idx + 1, STAGE_ORDER.length - 1)]!]}
            </button>
            <button
              type="button"
              onClick={() => onAdvance("draft")}
              className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
            >
              Return to draft
            </button>
          </>
        ) : (
          <p className="text-xs text-muted-foreground">Approval requires an authorised leadership responsibility.</p>
        )}
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Schedules are never published automatically; publishing notifies staff and starts change tracking.
      </p>
    </Panel>
  );
}

export function HistoryPanel({ entries }: { entries: ChangeEntry[] }) {
  return (
    <Panel title="Change history & audit trail" icon={History} subtitle="Every generation, decision, override and publish is recorded.">
      <ol className="space-y-2">
        {entries.map((e) => (
          <li key={e.id} className="rounded-xl border border-border p-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-foreground">{e.action}</span>
              <Tag tone="var(--color-muted-foreground)">{e.actor}</Tag>
              <span className="ml-auto text-[11px] text-muted-foreground">{e.at}</span>
            </div>
            <p className="mt-1 text-muted-foreground">{e.detail}</p>
          </li>
        ))}
      </ol>
    </Panel>
  );
}

export function PolicyPanel({ policy }: { policy: SchedulingPolicy }) {
  return (
    <Panel title="Institution scheduling policy" icon={ShieldCheck} subtitle={`${policy.code} — configurable per institution; nothing here is hardcoded as a universal rule.`}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Shift duration" value={`${policy.shiftHours} h`} />
        <Stat label="Max consecutive duties" value={String(policy.maxConsecutiveShifts)} />
        <Stat label="Max consecutive nights" value={String(policy.maxConsecutiveNights)} />
        <Stat label="Min recovery interval" value={`${policy.minRecoveryHours} h`} />
        <Stat label="Max weekly hours" value={`${policy.maxWeeklyHours} h`} />
        <Stat label="Weekends / 4 weeks" value={String(policy.weekendsPerFourWeeks)} />
        <Stat label="Leave notice" value={`${policy.leaveNoticeDays} days`} />
        <Stat label="Shift exchange" value={policy.shiftExchangeAllowed ? "Permitted" : "Not permitted"} />
      </div>
      <div className="mt-3 rounded-xl border border-border p-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Configured scheduling priority hierarchy
        </div>
        <ol className="mt-1 list-decimal space-y-0.5 pl-5 text-xs text-foreground">
          {policy.priorities.map((p) => (
            <li key={p.key}>{p.label}</li>
          ))}
        </ol>
      </div>
    </Panel>
  );
}
