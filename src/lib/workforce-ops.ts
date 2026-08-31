/**
 * Workforce Operations — single source of truth for the Workforce Operations
 * Dashboard (`/workforce-intelligence`) and the Nursing Capacity Intelligence
 * panel embedded inside it.
 *
 * IMPORTANT: every number below is SEEDED DEMO / PROTOTYPE data. It is not
 * connected to a live HRIS, roster or EHR feed. All derived values (coverage,
 * gaps, open shifts, risk status) are computed from this one dataset so the
 * dashboard can never show contradictory figures.
 *
 * AI outputs derived from this data are recommendations only —
 * authorized healthcare professionals decide.
 */

export type UnitLoad = {
  /** Unit / department short name. */
  key: string;
  patients: number;
  /** High-acuity patients contributing most nursing hours. */
  high: number;
  /** Nurses scheduled on the current shift. */
  nurses: number;
  /** Nursing hours required by patient demand this shift. */
  reqHrs: number;
  /** Nursing hours available from the scheduled roster this shift. */
  availHrs: number;
  /** Shift slots left unfilled on the published roster (next 72h). */
  openShifts: number;
  /** Scheduled staff currently on approved or sick leave. */
  onLeave: number;
  /** Share of scheduled nurses that are senior / specialty-competent. */
  seniorNurses: number;
};

/** Seeded demo roster + demand snapshot (current shift). */
export const UNIT_LOAD: UnitLoad[] = [
  { key: "ICU", patients: 12, high: 11, nurses: 10, reqHrs: 96, availHrs: 80, openShifts: 4, onLeave: 2, seniorNurses: 5 },
  { key: "ED", patients: 42, high: 9, nurses: 14, reqHrs: 132, availHrs: 112, openShifts: 3, onLeave: 2, seniorNurses: 6 },
  { key: "Med-Surg", patients: 44, high: 6, nurses: 16, reqHrs: 140, availHrs: 128, openShifts: 2, onLeave: 3, seniorNurses: 5 },
  { key: "Cardiac", patients: 18, high: 4, nurses: 9, reqHrs: 74, availHrs: 72, openShifts: 1, onLeave: 1, seniorNurses: 3 },
  { key: "Maternity", patients: 14, high: 2, nurses: 8, reqHrs: 52, availHrs: 64, openShifts: 0, onLeave: 1, seniorNurses: 3 },
  { key: "Pediatric", patients: 15, high: 2, nurses: 7, reqHrs: 58, availHrs: 56, openShifts: 1, onLeave: 0, seniorNurses: 2 },
  { key: "OT", patients: 8, high: 3, nurses: 6, reqHrs: 44, availHrs: 48, openShifts: 1, onLeave: 0, seniorNurses: 3 },
];

export type Zone = "safe" | "watch" | "critical";

/** Utilisation zone: required hours as a percentage of available hours. */
export function zoneFor(utilisationPct: number): Zone {
  if (utilisationPct >= 100) return "critical";
  if (utilisationPct >= 90) return "watch";
  return "safe";
}

export const ZONE_LABEL: Record<Zone, string> = {
  safe: "Safe",
  watch: "Watch",
  critical: "Critical",
};

export type UnitCoverage = UnitLoad & {
  /** Required hours as % of available hours (demand pressure). */
  utilisationPct: number;
  /** Available hours as % of required hours (coverage of demand). */
  coveragePct: number;
  /** availHrs - reqHrs. Negative = shortfall. */
  gapHrs: number;
  zone: Zone;
  status: string;
  seniorPct: number;
};

function pct(numerator: number, denominator: number): number {
  if (!denominator) return 0;
  return Math.round((numerator / denominator) * 100);
}

export function unitCoverage(u: UnitLoad): UnitCoverage {
  const utilisationPct = pct(u.reqHrs, u.availHrs);
  const coveragePct = pct(u.availHrs, u.reqHrs);
  const zone = zoneFor(utilisationPct);
  return {
    ...u,
    utilisationPct,
    coveragePct,
    gapHrs: u.availHrs - u.reqHrs,
    zone,
    status: zone === "critical" ? "Shortfall" : zone === "watch" ? "Tight" : "Covered",
    seniorPct: pct(u.seniorNurses, u.nurses),
  };
}

export type WorkforceSummary = {
  units: UnitCoverage[];
  totalPatients: number;
  highAcuity: number;
  /** Nurses scheduled on the current shift. */
  scheduledStaff: number;
  /** Scheduled + those currently on leave = establishment on the roster. */
  totalStaff: number;
  onLeave: number;
  openShifts: number;
  requiredHrs: number;
  availableHrs: number;
  /** Available hours as % of required hours across the institution. */
  coveragePct: number;
  /** Required hours as % of available hours across the institution. */
  utilisationPct: number;
  gapHrs: number;
  zone: Zone;
  coverageStatus: string;
  /** 0-100, higher = demand spread evenly across units. */
  balanceScore: number;
  balanceLabel: string;
  unitsOverCapacity: UnitCoverage[];
  seniorPct: number;
  /** True when there is no usable demo/roster data at all. */
  isEmpty: boolean;
  generatedAt: string;
};

/**
 * Derive every dashboard figure from one dataset.
 * Safe against an empty dataset — callers can render an empty state.
 */
export function workforceSummary(loads: UnitLoad[] = UNIT_LOAD): WorkforceSummary {
  const units = loads.map(unitCoverage);
  const sum = (fn: (u: UnitCoverage) => number) => units.reduce((a, u) => a + fn(u), 0);

  const requiredHrs = sum((u) => u.reqHrs);
  const availableHrs = sum((u) => u.availHrs);
  const scheduledStaff = sum((u) => u.nurses);
  const onLeave = sum((u) => u.onLeave);
  const utilisationPct = pct(requiredHrs, availableHrs);
  const coveragePct = pct(availableHrs, requiredHrs);
  const zone = zoneFor(utilisationPct);

  // Workload balance: coefficient of variation of per-unit utilisation.
  const ratios = units.filter((u) => u.availHrs > 0).map((u) => u.reqHrs / u.availHrs);
  const mean = ratios.length ? ratios.reduce((a, b) => a + b, 0) / ratios.length : 0;
  const variance = ratios.length
    ? ratios.reduce((a, b) => a + (b - mean) ** 2, 0) / ratios.length
    : 0;
  const cv = mean > 0 ? Math.sqrt(variance) / mean : 0;
  const balanceScore = Math.max(0, Math.min(100, Math.round((1 - cv) * 100)));

  return {
    units,
    totalPatients: sum((u) => u.patients),
    highAcuity: sum((u) => u.high),
    scheduledStaff,
    totalStaff: scheduledStaff + onLeave,
    onLeave,
    openShifts: sum((u) => u.openShifts),
    requiredHrs,
    availableHrs,
    coveragePct,
    utilisationPct,
    gapHrs: availableHrs - requiredHrs,
    zone,
    coverageStatus:
      zone === "critical" ? "Under-covered" : zone === "watch" ? "Tight coverage" : "Covered",
    balanceScore,
    balanceLabel: balanceScore >= 85 ? "Balanced" : balanceScore >= 70 ? "Uneven" : "Imbalanced",
    unitsOverCapacity: units
      .filter((u) => u.zone === "critical")
      .sort((a, b) => b.utilisationPct - a.utilisationPct),
    seniorPct: pct(sum((u) => u.seniorNurses), scheduledStaff),
    isEmpty: units.length === 0 || availableHrs === 0,
    generatedAt: "Current shift · seeded demo snapshot",
  };
}

/**
 * AI workforce signals — derived, explainable, and always advisory.
 * Each signal states the observation and asks for a human decision.
 */
export type WorkforceSignal = {
  id: string;
  unit: string;
  tone: "danger" | "warning" | "info";
  title: string;
  observation: string;
  recommendation: string;
};

export function workforceSignals(s: WorkforceSummary): WorkforceSignal[] {
  const signals: WorkforceSignal[] = [];

  for (const u of s.unitsOverCapacity.slice(0, 3)) {
    signals.push({
      id: `capacity-${u.key}`,
      unit: u.key,
      tone: u.utilisationPct >= 110 ? "danger" : "warning",
      title: "Potential coverage pressure detected",
      observation: `${u.reqHrs}h required vs ${u.availHrs}h scheduled (${u.coveragePct}% coverage, ${Math.abs(u.gapHrs)}h short).`,
      recommendation: `Review float pool or reassign ${u.high > 4 ? "low-acuity" : "non-urgent"} workload. Requires manager review.`,
    });
  }

  if (s.openShifts > 0) {
    signals.push({
      id: "open-shifts",
      unit: "Institution",
      tone: s.openShifts >= 8 ? "danger" : "warning",
      title: "Unfilled shifts on the published roster",
      observation: `${s.openShifts} shift slots remain unfilled across ${s.units.filter((u) => u.openShifts > 0).length} units in the next 72h.`,
      recommendation: "Open the duty scheduling engine to fill or re-balance. Human decision required.",
    });
  }

  if (s.balanceScore < 85) {
    signals.push({
      id: "balance",
      unit: "Institution",
      tone: "info",
      title: "Workload distributed unevenly across units",
      observation: `Workload balance index ${s.balanceScore}/100 (${s.balanceLabel}) — some units carry spare hours while others are short.`,
      recommendation: "Consider cross-unit redistribution before approving overtime. Review recommended.",
    });
  }

  if (!signals.length) {
    signals.push({
      id: "stable",
      unit: "Institution",
      tone: "info",
      title: "No coverage pressure detected",
      observation: `${s.coveragePct}% coverage across all units with ${s.gapHrs}h spare.`,
      recommendation: "Continue routine monitoring. No action required.",
    });
  }

  return signals;
}
