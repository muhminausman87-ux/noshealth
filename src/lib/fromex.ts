/**
 * FROMEX Phase 2 — intelligence model.
 *
 * PATIENT NEED → PATIENT ACUITY → NURSING WORKLOAD → NURSING CAPACITY →
 * PRIORITY → WORKFLOW ACTION → ESCALATION
 *
 * IMPORTANT: everything in this module is transparent, rules-based
 * **prototype logic**. It is NOT a trained machine-learning model and NOT a
 * clinically validated scoring system. Thresholds and weights are institution
 * configurable (stored as an `institution_policies` row of kind
 * `workload_model`) — the values below are only defaults for demonstration.
 */

export type AcuityLevel = "low" | "moderate" | "high" | "critical";
export type WorkloadLevel = AcuityLevel;
export type CapacityStatus = "balanced" | "watch" | "strained" | "critical";

/** Institution-configurable workload model. Never hardcode as universal policy. */
export interface WorkloadModel {
  weights: Record<string, number>;
  /** Workload score bands. */
  thresholds: { moderate: number; high: number; critical: number };
  /** MEWS bands used for the demo acuity classification. */
  mews_thresholds: { moderate: number; high: number; critical: number };
}

export const DEFAULT_WORKLOAD_MODEL: WorkloadModel = {
  weights: {
    acuity: 3,
    medication: 2,
    monitoring: 2,
    assessment: 1.5,
    interventions: 1.5,
    isolation: 1.5,
    fall_risk: 1,
    procedure: 2,
    documentation: 1,
    admission_discharge: 1.5,
  },
  thresholds: { moderate: 6, high: 11, critical: 16 },
  mews_thresholds: { moderate: 3, high: 5, critical: 7 },
};

export const FACTOR_LABEL: Record<string, string> = {
  acuity: "Patient acuity",
  medication: "Medication activity",
  monitoring: "Monitoring frequency",
  assessment: "Assessment / reassessment",
  interventions: "Active interventions",
  isolation: "Isolation precautions",
  fall_risk: "Fall precautions",
  procedure: "Procedures",
  documentation: "Documentation",
  admission_discharge: "Admission / discharge activity",
};

export const LEVEL_TONE: Record<AcuityLevel, string> = {
  low: "var(--color-success)",
  moderate: "var(--color-primary)",
  high: "var(--color-warning)",
  critical: "var(--color-destructive)",
};

export const CAPACITY_TONE: Record<CapacityStatus, string> = {
  balanced: "var(--color-success)",
  watch: "var(--color-primary)",
  strained: "var(--color-warning)",
  critical: "var(--color-destructive)",
};

/* ------------------------------------------------------------------ MEWS -- */

export interface MewsTrend {
  current: number | null;
  previous: number | null;
  direction: "up" | "down" | "stable" | "unknown";
  delta: number;
  since?: string | null;
  label: string;
}

/** Modified Early Warning Score (MEWS) trend — current vs previous reading. */
export function mewsTrend(
  current: number | null | undefined,
  previous: number | null | undefined,
  previousAt?: string | null,
): MewsTrend {
  if (current == null) {
    return { current: null, previous: previous ?? null, direction: "unknown", delta: 0, label: "MEWS not recorded" };
  }
  if (previous == null) {
    return { current, previous: null, direction: "unknown", delta: 0, since: previousAt, label: `MEWS ${current}` };
  }
  const delta = current - previous;
  const direction = delta > 0 ? "up" : delta < 0 ? "down" : "stable";
  const arrow = direction === "up" ? "↑" : direction === "down" ? "↓" : "→";
  return {
    current,
    previous,
    direction,
    delta,
    since: previousAt,
    label: `MEWS ${previous} → ${current} ${arrow}`,
  };
}

export function relativeTime(iso?: string | null): string {
  if (!iso) return "";
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (Number.isNaN(mins)) return "";
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const h = Math.round(mins / 60);
  return h < 24 ? `${h} h ago` : `${Math.round(h / 24)} d ago`;
}

/** Demo classification only — institutions configure their own thresholds. */
export function acuityFromMews(score: number | null | undefined, m = DEFAULT_WORKLOAD_MODEL): AcuityLevel {
  if (score == null) return "low";
  if (score >= m.mews_thresholds.critical) return "critical";
  if (score >= m.mews_thresholds.high) return "high";
  if (score >= m.mews_thresholds.moderate) return "moderate";
  return "low";
}

/* -------------------------------------------------------------- WORKLOAD -- */

export interface WorkloadBreakdown {
  score: number;
  level: WorkloadLevel;
  /** Ordered, human-readable contributions — used to answer "why?". */
  contributions: { key: string; label: string; points: number }[];
}

/**
 * Transparent weighted workload model:
 * workload = acuity contribution + care complexity + time-sensitive tasks +
 *            intervention requirements.
 * The calculation is intentionally explainable — never a black box.
 */
export function computeWorkload(
  factors: Record<string, number> | null | undefined,
  acuity: AcuityLevel,
  timeSensitiveTasks = 0,
  model: WorkloadModel = DEFAULT_WORKLOAD_MODEL,
): WorkloadBreakdown {
  const contributions: WorkloadBreakdown["contributions"] = [];
  const acuityPoints = { low: 0, moderate: 1, high: 2, critical: 3 }[acuity] * model.weights.acuity;
  if (acuityPoints) contributions.push({ key: "acuity", label: FACTOR_LABEL.acuity, points: acuityPoints });

  for (const [key, raw] of Object.entries(factors ?? {})) {
    const weight = model.weights[key];
    if (!weight || !raw) continue;
    contributions.push({ key, label: FACTOR_LABEL[key] ?? key, points: raw * weight });
  }
  if (timeSensitiveTasks > 0) {
    contributions.push({
      key: "time_sensitive",
      label: "Time-sensitive tasks",
      points: timeSensitiveTasks * 1.5,
    });
  }
  contributions.sort((a, b) => b.points - a.points);
  const score = contributions.reduce((s, c) => s + c.points, 0);
  const level: WorkloadLevel =
    score >= model.thresholds.critical
      ? "critical"
      : score >= model.thresholds.high
        ? "high"
        : score >= model.thresholds.moderate
          ? "moderate"
          : "low";
  return { score: Math.round(score * 10) / 10, level, contributions };
}

/* -------------------------------------------------------------- PRIORITY -- */

export type PriorityBand = "attention_now" | "high" | "planned" | "routine";

export const PRIORITY_LABEL: Record<PriorityBand, string> = {
  attention_now: "Attention now",
  high: "High priority",
  planned: "Planned priority",
  routine: "Routine",
};

export interface PriorityResult {
  band: PriorityBand;
  score: number;
  reasons: string[];
}

export interface TaskLike {
  task_type: string;
  label: string;
  due_at: string | null;
  time_sensitive: boolean;
  status: string;
}

export function isOverdue(t: TaskLike): boolean {
  if (t.status === "done") return false;
  return t.status === "overdue" || (!!t.due_at && new Date(t.due_at).getTime() < Date.now());
}

/** Prototype prioritisation — explainable signals, no validated clinical model. */
export function priorityFor(input: {
  acuity: AcuityLevel;
  trend: MewsTrend;
  tasks: TaskLike[];
}): PriorityResult {
  const reasons: string[] = [];
  let score = { low: 0, moderate: 2, high: 5, critical: 8 }[input.acuity];
  if (input.acuity !== "low") reasons.push(`${input.acuity} acuity`);

  if (input.trend.direction === "up" && input.trend.current != null) {
    score += 3 + input.trend.delta;
    reasons.push(`${input.trend.label} increasing${input.trend.since ? ` (${relativeTime(input.trend.since)})` : ""}`);
  } else if (input.trend.direction === "down") {
    reasons.push(`${input.trend.label} improving`);
  }

  const overdue = input.tasks.filter(isOverdue);
  if (overdue.length) {
    score += 3 * overdue.length;
    reasons.push(`${overdue.length} overdue task${overdue.length > 1 ? "s" : ""}`);
  }
  const soon = input.tasks.filter(
    (t) =>
      !isOverdue(t) &&
      t.time_sensitive &&
      t.due_at &&
      new Date(t.due_at).getTime() - Date.now() < 30 * 60000,
  );
  if (soon.length) {
    score += 2 * soon.length;
    reasons.push(`${soon.length} time-sensitive task${soon.length > 1 ? "s" : ""} due soon`);
  }
  const discharge = input.tasks.some((t) => t.task_type === "discharge" || t.task_type === "education");
  if (discharge) reasons.push("Discharge activity pending");

  const band: PriorityBand =
    score >= 12 ? "attention_now" : score >= 6 ? "high" : discharge ? "planned" : "routine";
  return { band, score, reasons };
}

/* ------------------------------------------------------- CAPACITY / DEMAND */

export interface CapacityInput {
  /** Sum of patient workload scores in the unit. */
  totalWorkload: number;
  /** Nurses on duty (excluding leave). */
  nurses: number;
  /** Minutes available across the shift, net of breaks. */
  availableMinutes: number;
  /** Time-sensitive / overdue tasks currently open. */
  timeSensitiveTasks: number;
  highAcuityPatients: number;
  admissionDischargeActivity: number;
}

export interface CapacityResult {
  demandPct: number;
  capacityPct: number;
  status: CapacityStatus;
  /** Explains "why is this unit strained?" — signed percentage drivers. */
  drivers: { label: string; delta: number }[];
}

/** Prototype capacity-vs-demand relationship — operational, not clinical. */
export function capacityVsDemand(input: CapacityInput): CapacityResult {
  const nurses = Math.max(input.nurses, 1);
  // One nurse is modelled as being able to absorb 14 workload points per shift.
  const capacityUnits = nurses * 14;
  const demandPct = Math.min(140, Math.round((input.totalWorkload / capacityUnits) * 100));
  const breakLoss = Math.round((1 - input.availableMinutes / (nurses * 480)) * 100);
  const capacityPct = Math.max(0, Math.min(100, 100 - Math.max(0, breakLoss) - input.timeSensitiveTasks * 2));

  const gap = demandPct - capacityPct;
  const status: CapacityStatus =
    gap >= 25 ? "critical" : gap >= 10 ? "strained" : gap >= 0 ? "watch" : "balanced";

  const drivers = [
    { label: "High-acuity patients", delta: input.highAcuityPatients * 9 },
    { label: "Time-sensitive medications & tasks", delta: input.timeSensitiveTasks * 4 },
    { label: "Admissions / discharges", delta: input.admissionDischargeActivity * 5 },
    { label: "Available nursing capacity", delta: -(100 - capacityPct) },
  ].filter((d) => d.delta !== 0);

  return { demandPct, capacityPct, status, drivers };
}

/* --------------------------------------------------- PREDICTED BUSY PERIOD */

export interface BusyPeriod {
  window: string;
  level: "low" | "moderate" | "high";
  reason: string;
}

/**
 * Prototype Prediction — a simple forward look at scheduled task load.
 * No trained machine-learning model exists; this is arithmetic over the
 * currently known tasks, acuity and admission/discharge activity.
 */
export function predictBusyPeriod(tasks: TaskLike[], highAcuity: number, dischargeCount: number): BusyPeriod {
  const buckets = new Map<number, number>();
  for (const t of tasks) {
    if (!t.due_at || t.status === "done") continue;
    const h = new Date(t.due_at).getHours();
    buckets.set(h, (buckets.get(h) ?? 0) + (t.time_sensitive ? 2 : 1));
  }
  let peakHour = new Date().getHours();
  let peak = 0;
  for (const [h, v] of buckets) if (v > peak) ((peak = v), (peakHour = h));
  const load = peak + highAcuity + dischargeCount;
  const level = load >= 8 ? "high" : load >= 4 ? "moderate" : "low";
  const pad = (n: number) => `${n}`.padStart(2, "0");
  return {
    window: `${pad(peakHour)}:00–${pad((peakHour + 2) % 24)}:00`,
    level,
    reason: [
      peak ? `${peak} scheduled/time-sensitive tasks` : null,
      highAcuity ? `${highAcuity} high-acuity patient${highAcuity > 1 ? "s" : ""}` : null,
      dischargeCount ? `${dischargeCount} discharge activity` : null,
    ]
      .filter(Boolean)
      .join(" + ") || "No concentrated task load detected",
  };
}

export function formatTime(iso?: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
