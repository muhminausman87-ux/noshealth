import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  BedDouble,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  ShieldAlert,
  Sun,
  UserRound,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@/lib/auth";
import { getDept } from "@/lib/departments";
import {
  acuityFromMews,
  computeWorkload,
  formatTime,
  isOverdue,
  mewsTrend,
  priorityFor,
  PRIORITY_LABEL,
  LEVEL_TONE,
  type AcuityLevel,
  type PriorityBand,
} from "@/lib/fromex";
import { fetchEscalationPolicy, fetchMyShift, type EscalationPolicy, type ShiftData } from "@/lib/fromex-data";
import { AiPrototype, LevelPill, MetricBar, MewsChip, WorkloadExplainer } from "@/components/fromex/Bits";

const BAND_TONE: Record<PriorityBand, string> = {
  attention_now: "var(--color-destructive)",
  high: "var(--color-warning)",
  planned: "var(--color-primary)",
  routine: "var(--color-success)",
};

/** Demonstration values until shift documentation is connected to real data. */
const SHIFT_PROGRESS = [
  { label: "Medication", value: 82 },
  { label: "Assessments", value: 91 },
  { label: "Documentation", value: 65 },
  { label: "Handover", value: 25 },
];

/**
 * Patient-first bedside home screen.
 * SHIFT CONTEXT → WHAT NEEDS ME NOW? → MY PATIENTS → COMING UP → SHIFT PROGRESS
 * Hospital-wide intelligence intentionally stays out of this screen.
 */
export function MyResponsibility({ session }: { session: Session }) {
  const [data, setData] = useState<ShiftData | null>(null);
  const [policy, setPolicy] = useState<EscalationPolicy | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openWhy, setOpenWhy] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        if (!cancelled) setData({ patients: [], acuity: {}, tasks: [], model: undefined as never });
        return;
      }
      try {
        const [shift, pol] = await Promise.all([fetchMyShift(user.user.id), fetchEscalationPolicy()]);
        if (cancelled) return;
        setData(shift);
        setPolicy(pol);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load your shift");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = useMemo(() => {
    if (!data) return [];
    return data.patients
      .map(({ patient, careRole, shift }) => {
        const a = data.acuity[patient.id];
        const trend = mewsTrend(a?.mews_current, a?.mews_previous, a?.mews_previous_at);
        const acuity = (a?.acuity_level as AcuityLevel) ?? acuityFromMews(a?.mews_current, data.model);
        const tasks = data.tasks.filter((t) => t.patient_id === patient.id);
        const timeSensitive = tasks.filter((t) => t.time_sensitive && t.status !== "done").length;
        const workload = computeWorkload(a?.workload_factors, acuity, timeSensitive, data.model);
        const priority = priorityFor({ acuity, trend, tasks });
        return { patient, careRole, shift, trend, acuity, tasks, workload, priority };
      })
      .sort((a, b) => b.priority.score - a.priority.score);
  }, [data]);

  const needsMeNow = rows
    .flatMap((r) =>
      r.tasks
        .filter((t) => isOverdue(t) || (t.time_sensitive && t.due_at && new Date(t.due_at).getTime() - Date.now() < 30 * 60000))
        .map((t) => ({ row: r, task: t })),
    )
    .sort((a, b) => (a.task.due_at ?? "").localeCompare(b.task.due_at ?? ""))
    .slice(0, 5);

  const comingUp = rows
    .flatMap((r) => r.tasks.map((t) => ({ row: r, task: t })))
    .filter(({ task }) => !isOverdue(task) && task.due_at)
    .sort((a, b) => (a.task.due_at ?? "").localeCompare(b.task.due_at ?? ""))
    .slice(0, 5);

  const needsAttention = rows.filter((r) => r.priority.band === "attention_now" || r.priority.band === "high").length;
  const escalationNeeded = rows.some((r) => r.acuity === "critical" || r.trend.direction === "up");

  return (
    <section className="mb-8 space-y-5">
      {/* SHIFT CONTEXT */}
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {session.institutionName ?? "Your institution"}
            {session.assignedDept ? ` · ${getDept(session.assignedDept).name}` : ""}
          </div>
          <h2 className="mt-0.5 text-xl font-semibold tracking-tight text-foreground">
            {session.name} · day shift
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Which patient needs you now — ordered by acuity, MEWS trend and time-sensitive tasks.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs">
          <UserRound className="h-4 w-4 text-primary" aria-hidden="true" />
          <span className="font-semibold text-foreground">{data ? rows.length : "—"}</span>
          <span className="text-muted-foreground">assigned</span>
          <span className="mx-1 h-3 w-px bg-border" />
          <AlertTriangle className="h-4 w-4 text-warning" aria-hidden="true" />
          <span className="font-semibold text-foreground">{needsAttention}</span>
          <span className="text-muted-foreground">need attention</span>
        </div>
      </header>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Could not load your shift: {error}
        </div>
      )}

      {data === null && !error && (
        <div className="rounded-2xl border border-border bg-card px-4 py-6 text-sm text-muted-foreground">
          Loading your shift…
        </div>
      )}

      {data !== null && rows.length === 0 && !error && (
        <div className="rounded-2xl border border-dashed border-border bg-card/60 px-4 py-6">
          <div className="flex items-start gap-3">
            <BedDouble className="mt-0.5 h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <div>
              <div className="text-sm font-semibold text-foreground">No active assignments</div>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                Once your charge nurse assigns patients for this shift, they appear here first — ordered
                by who needs you now.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* WHAT NEEDS ME NOW? */}
      {needsMeNow.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-foreground">What needs me now?</h3>
            <AiPrototype />
          </div>
          <ul className="space-y-2">
            {needsMeNow.map(({ row, task }) => {
              const overdue = isOverdue(task);
              const tone = overdue ? BAND_TONE.attention_now : BAND_TONE.high;
              return (
                <li key={task.id}>
                  <Link
                    to="/patient/$patientId"
                    params={{ patientId: row.patient.id }}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2 transition hover:border-primary/40"
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ background: tone }}
                        aria-hidden="true"
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-foreground">
                          {row.patient.room ?? row.patient.mrn} · {task.label}
                        </span>
                        <span className="block truncate text-[11px] text-muted-foreground">
                          {overdue ? "Overdue" : `Due ${formatTime(task.due_at)}`}
                          {task.detail ? ` · ${task.detail}` : ""}
                        </span>
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* MY PATIENTS — priority ordered */}
      {rows.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-foreground">My patients · priority order</h3>
            <AiPrototype>AI Prototype ranking</AiPrototype>
          </div>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {rows.map((r) => {
              const tone = BAND_TONE[r.priority.band];
              return (
                <article key={r.patient.id} className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-foreground">
                        {r.patient.room ? `${r.patient.room} · ` : ""}
                        {r.patient.full_name}
                      </div>
                      <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
                        MRN {r.patient.mrn} · {getDept(r.patient.dept).short} · {r.careRole.replace(/_/g, " ")}
                      </div>
                    </div>
                    <span
                      className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                      style={{ background: `color-mix(in oklab, ${tone} 15%, transparent)`, color: tone }}
                    >
                      {PRIORITY_LABEL[r.priority.band]}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <MewsChip trend={r.trend} />
                    <LevelPill level={r.acuity} label={`${r.acuity} acuity`} />
                    <LevelPill level={r.workload.level} label={`${r.workload.level} workload`} />
                  </div>

                  {r.priority.reasons.length > 0 && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {r.priority.reasons.join(" · ")}
                    </p>
                  )}

                  {openWhy === r.patient.id && (
                    <div className="mt-3">
                      <WorkloadExplainer workload={r.workload} />
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Link
                      to="/patient/$patientId"
                      params={{ patientId: r.patient.id }}
                      className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground"
                    >
                      Open patient
                      <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setOpenWhy(openWhy === r.patient.id ? null : r.patient.id)}
                      aria-expanded={openWhy === r.patient.id}
                      className="rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
                    >
                      {openWhy === r.patient.id ? "Hide explanation" : "Why this priority?"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* COMING UP */}
      {comingUp.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-primary" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-foreground">Coming up</h3>
          </div>
          <ul className="space-y-1.5">
            {comingUp.map(({ row, task }) => (
              <li key={task.id} className="flex items-baseline gap-3 text-sm">
                <span className="w-12 shrink-0 tabular-nums text-muted-foreground">{formatTime(task.due_at)}</span>
                <span className="text-foreground">
                  {task.label} — {row.patient.room ?? row.patient.mrn}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* SHIFT PROGRESS */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4 text-primary" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-foreground">Shift progress</h3>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Demo data
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SHIFT_PROGRESS.map((s) => (
            <MetricBar key={s.label} label={s.label} value={s.value} />
          ))}
        </div>
      </div>

      {/* INSTITUTION ESCALATION PROTOCOL */}
      {policy && escalationNeeded && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 text-primary" aria-hidden="true" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-foreground">Institution protocol applies</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {policy.code} · {policy.title}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{policy.summary}</p>
              <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <ClipboardList className="h-3 w-3" aria-hidden="true" />
                The responsible person is determined by your institution's configured escalation pathway
                (department, role, assignment, shift). FROMEX supports the decision — it does not replace
                clinical judgment.
              </p>
            </div>
          </div>
        </div>
      )}

      {rows.length > 0 && needsMeNow.length === 0 && (
        <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <CheckCircle2 className="h-3.5 w-3.5 text-success" aria-hidden="true" />
          Nothing overdue right now.
        </p>
      )}

      <p className="text-[11px] text-muted-foreground">
        Prioritisation, workload and acuity signals shown here are transparent prototype logic
        (labelled <span className="font-medium">AI Prototype</span>) — not a clinically validated model.
      </p>
      <span className="sr-only" style={{ color: LEVEL_TONE.low }} />
    </section>
  );
}
