import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Activity, Building2, Clock, Gauge, Scale, TrendingUp, Users } from "lucide-react";
import { getDept, type Department } from "@/lib/departments";
import {
  acuityFromMews,
  capacityVsDemand,
  computeWorkload,
  CAPACITY_TONE,
  isOverdue,
  mewsTrend,
  predictBusyPeriod,
  priorityFor,
  PRIORITY_LABEL,
  type AcuityLevel,
} from "@/lib/fromex";
import { fetchUnit, type UnitData } from "@/lib/fromex-data";
import { AiPrototype, LevelPill, MetricBar, MewsChip } from "@/components/fromex/Bits";

type Scope = "unit" | "institution";

interface Derived {
  patientId: string;
  name: string;
  room: string | null;
  mrn: string;
  dept: Department;
  acuity: AcuityLevel;
  trendUp: boolean;
  workload: number;
  workloadLevel: AcuityLevel;
  priorityBand: keyof typeof PRIORITY_LABEL;
  priorityScore: number;
  employeeId?: string;
  trend: ReturnType<typeof mewsTrend>;
}

/**
 * Responsibility-aware unit view.
 * `unit` = charge nurse snapshot · `institution` = nursing administration view.
 * Both read only what Phase 1 RLS already permits for the signed-in employee.
 */
export function UnitCapacity({ scope = "unit", department }: { scope?: Scope; department?: Department }) {
  const [data, setData] = useState<UnitData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchUnit()
      .then((d) => !cancelled && setData(d))
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : "Could not load unit data"));
    return () => {
      cancelled = true;
    };
  }, []);

  const derived = useMemo<Derived[]>(() => {
    if (!data) return [];
    const byPatient = new Map(data.assignments.map((a) => [a.patient_id, a.employee_id]));
    return data.patients
      .filter((p) => (scope === "unit" && department ? p.dept === department : true))
      .map((p) => {
        const a = data.acuity[p.id];
        const trend = mewsTrend(a?.mews_current, a?.mews_previous, a?.mews_previous_at);
        const acuity = (a?.acuity_level as AcuityLevel) ?? acuityFromMews(a?.mews_current, data.model);
        const tasks = data.tasks.filter((t) => t.patient_id === p.id);
        const w = computeWorkload(a?.workload_factors, acuity, tasks.filter((t) => t.time_sensitive).length, data.model);
        const pr = priorityFor({ acuity, trend, tasks });
        return {
          patientId: p.id,
          name: p.full_name,
          room: p.room,
          mrn: p.mrn,
          dept: p.dept,
          acuity,
          trend,
          trendUp: trend.direction === "up",
          workload: w.score,
          workloadLevel: w.level,
          priorityBand: pr.band,
          priorityScore: pr.score,
          employeeId: byPatient.get(p.id),
        };
      })
      .sort((a, b) => b.priorityScore - a.priorityScore);
  }, [data, scope, department]);

  const capacity = useMemo(() => {
    if (!data) return null;
    const staff = data.capacity.filter(
      (c) => !c.on_leave && (scope === "unit" && department ? c.department === department : true),
    );
    const totalWorkload = derived.reduce((s, d) => s + d.workload, 0);
    const timeSensitive = data.tasks.filter((t) => t.time_sensitive || isOverdue(t)).length;
    return capacityVsDemand({
      totalWorkload,
      nurses: staff.length,
      availableMinutes: staff.reduce((s, c) => s + (c.available_minutes - c.break_minutes), 0) || staff.length * 480,
      timeSensitiveTasks: timeSensitive,
      highAcuityPatients: derived.filter((d) => d.acuity === "high" || d.acuity === "critical").length,
      admissionDischargeActivity: data.tasks.filter((t) => t.task_type === "discharge" || t.task_type === "admission").length,
    });
  }, [data, derived, scope, department]);

  const busy = useMemo(
    () =>
      data
        ? predictBusyPeriod(
            data.tasks,
            derived.filter((d) => d.acuity === "high" || d.acuity === "critical").length,
            data.tasks.filter((t) => t.task_type === "discharge").length,
          )
        : null,
    [data, derived],
  );

  /** Workload spread across nurses — the fairness question charge nurses ask. */
  const perNurse = useMemo(() => {
    if (!data) return [];
    const map = new Map<string, { name: string; patients: number; workload: number }>();
    for (const d of derived) {
      if (!d.employeeId) continue;
      const e = map.get(d.employeeId) ?? { name: data.nurses[d.employeeId] ?? "Unassigned", patients: 0, workload: 0 };
      e.patients += 1;
      e.workload += d.workload;
      map.set(d.employeeId, e);
    }
    return Array.from(map.values()).sort((a, b) => b.workload - a.workload);
  }, [data, derived]);

  const maxNurseLoad = Math.max(1, ...perNurse.map((n) => n.workload));
  const staffOnDuty = data?.capacity.filter((c) => !c.on_leave).length ?? 0;

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {error}
      </div>
    );
  }
  if (!data) {
    return (
      <div className="rounded-2xl border border-border bg-card px-4 py-6 text-sm text-muted-foreground">
        Loading unit intelligence…
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              {scope === "unit" ? "Unit snapshot" : "Nursing operations"}
            </h2>
            <AiPrototype />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {scope === "unit"
              ? "Where the pressure is right now, and whether the workload is fairly distributed."
              : "Acuity, workload and capacity across the departments you are responsible for."}
          </p>
        </div>
      </header>

      {/* CAPACITY vs DEMAND */}
      {capacity && (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <div
            className="rounded-2xl border p-4"
            style={{
              borderColor: CAPACITY_TONE[capacity.status],
              background: `color-mix(in oklab, ${CAPACITY_TONE[capacity.status]} 8%, var(--color-card))`,
            }}
          >
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Gauge className="h-3.5 w-3.5" aria-hidden="true" /> Capacity vs demand
            </div>
            <div className="mt-1 text-lg font-semibold capitalize text-foreground">{capacity.status}</div>
            <div className="mt-3 space-y-2">
              <MetricBar label="Demand" value={Math.min(100, capacity.demandPct)} tone={CAPACITY_TONE[capacity.status]} />
              <MetricBar label="Available capacity" value={capacity.capacityPct} />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Scale className="h-3.5 w-3.5" aria-hidden="true" /> Why is it {capacity.status}?
            </div>
            <ul className="mt-2 space-y-1.5">
              {capacity.drivers.map((d) => (
                <li key={d.label} className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-foreground">{d.label}</span>
                  <span
                    className="tabular-nums font-medium"
                    style={{ color: d.delta > 0 ? "var(--color-destructive)" : "var(--color-success)" }}
                  >
                    {d.delta > 0 ? "+" : ""}
                    {d.delta}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" /> Predicted busy period
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-lg font-semibold text-foreground">{busy?.window}</span>
              <LevelPill
                level={(busy?.level === "high" ? "high" : busy?.level === "moderate" ? "moderate" : "low") as AcuityLevel}
                label={busy?.level}
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{busy?.reason}</p>
            <p className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">Prototype prediction</p>
          </div>
        </div>
      )}

      {/* HEADLINE COUNTS */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { icon: Users, label: "Patients", value: derived.length },
          { icon: Activity, label: "High / critical acuity", value: derived.filter((d) => d.acuity === "high" || d.acuity === "critical").length },
          { icon: TrendingUp, label: "Deteriorating (MEWS ↑)", value: derived.filter((d) => d.trendUp).length },
          { icon: Building2, label: "Staff on duty", value: staffOnDuty },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-3">
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
              <s.icon className="h-3.5 w-3.5" aria-hidden="true" /> {s.label}
            </div>
            <div className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{s.value}</div>
          </div>
        ))}
      </div>

      {/* WORKLOAD DISTRIBUTION */}
      {perNurse.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-foreground">Workload distribution</h3>
            <AiPrototype />
          </div>
          <ul className="space-y-2.5">
            {perNurse.map((n) => (
              <li key={n.name}>
                <MetricBar
                  label={`${n.name} · ${n.patients} patient${n.patients > 1 ? "s" : ""}`}
                  value={Math.round((n.workload / maxNurseLoad) * 100)}
                />
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Relative prototype workload, not contracted hours. Rebalancing remains a human decision.
          </p>
        </div>
      )}

      {/* PATIENTS NEEDING ATTENTION */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Patients needing attention first</h3>
        <ul className="divide-y divide-border">
          {derived.slice(0, 8).map((d) => (
            <li key={d.patientId} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
              <div className="min-w-0">
                <Link
                  to="/patient/$patientId"
                  params={{ patientId: d.patientId }}
                  className="truncate text-sm font-medium text-foreground hover:text-primary"
                >
                  {d.room ? `${d.room} · ` : ""}
                  {d.name}
                </Link>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
                  <span>{getDept(d.dept).short}</span>
                  <MewsChip trend={d.trend} />
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <LevelPill level={d.acuity} label={`${d.acuity} acuity`} />
                <LevelPill level={d.workloadLevel} label={`workload ${d.workload}`} />
              </div>
            </li>
          ))}
          {derived.length === 0 && (
            <li className="py-3 text-sm text-muted-foreground">No patients in scope for this view.</li>
          )}
        </ul>
      </div>

      <p className="text-[11px] text-muted-foreground">
        All acuity, workload, capacity and prediction figures are transparent prototype calculations labelled
        AI Prototype. NOS supports decision-making — it does not replace clinical judgment.
      </p>
    </section>
  );
}
