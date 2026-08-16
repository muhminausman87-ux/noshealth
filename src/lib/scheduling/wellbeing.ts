/**
 * Employee Experience Optimization layer.
 *
 * Fatigue risk indicator, work-life balance (Schedule Experience Score),
 * workload-weighted fairness and schedule predictability.
 *
 * These are workforce scheduling indicators only. They are not medical
 * assessments and must never be used for disciplinary action.
 */
import type { NurseProfile, Roster, SchedulingPolicy } from "./types";
import { isNight, isWorking, shiftByCode } from "./policy";
import { isWeekend, restHours } from "./engine";

export type Concern = "low" | "moderate" | "high";

export const CONCERN_LABEL: Record<Concern, string> = {
  low: "🟢 Lower concern",
  moderate: "🟡 Moderate concern",
  high: "🔴 High concern",
};
export const CONCERN_TONE: Record<Concern, string> = {
  low: "#0d9488",
  moderate: "#d97706",
  high: "#dc2626",
};

export interface FatigueRow {
  nurseId: string;
  name: string;
  score: number; // 0..100, higher = more fatigue risk
  concern: Concern;
  maxConsecutive: number;
  nights: number;
  maxConsecutiveNights: number;
  shortRecoveries: number;
  rapidTransitions: number;
  overtimeHours: number;
  drivers: string[];
}

export function fatigueRisk(roster: Roster, policy: SchedulingPolicy, nurses: NurseProfile[]): FatigueRow[] {
  return nurses.map((n) => {
    const row = roster.cells[n.id] ?? {};
    let consec = 0;
    let maxConsec = 0;
    let nConsec = 0;
    let maxNConsec = 0;
    let nights = 0;
    let shortRecoveries = 0;
    let rapidTransitions = 0;
    let hours = 0;

    roster.dates.forEach((d, i) => {
      const code = row[d] ?? "";
      const working = isWorking(policy, code);
      hours += shiftByCode(policy, code)?.hours ?? 0;
      if (working) {
        consec += 1;
        maxConsec = Math.max(maxConsec, consec);
      } else consec = 0;
      if (isNight(policy, code)) {
        nights += 1;
        nConsec += 1;
        maxNConsec = Math.max(maxNConsec, nConsec);
      } else nConsec = 0;

      const prev = roster.dates[i - 1];
      const prevCode = prev ? row[prev] : undefined;
      if (prev && prevCode && working && isWorking(policy, prevCode)) {
        const r = restHours(policy, { date: prev, code: prevCode }, { date: d, code });
        if (r != null && r < policy.minRestHoursBetweenShifts + 6) shortRecoveries += 1;
        if (isNight(policy, prevCode) !== isNight(policy, code)) rapidTransitions += 1;
      }
    });

    const contracted = (n.contractedHoursPerWeek / 7) * roster.dates.length;
    const overtime = Math.max(0, Math.round(hours - contracted));

    const drivers: string[] = [];
    let score = 0;
    const add = (v: number, label: string) => {
      if (v > 0) {
        score += v;
        drivers.push(label);
      }
    };
    add(Math.max(0, maxConsec - policy.maxConsecutiveWorkDays + 2) * 8, `${maxConsec} consecutive duties`);
    add(Math.max(0, maxNConsec - 1) * 9, `${maxNConsec} consecutive nights`);
    add(Math.min(20, nights * 2), `${nights} night duties`);
    add(shortRecoveries * 7, `${shortRecoveries} short recovery interval(s)`);
    add(rapidTransitions * 5, `${rapidTransitions} rapid shift transition(s)`);
    add(Math.min(25, overtime * 1.2), `${overtime}h above contracted hours`);
    add(Math.min(10, Math.max(0, n.history.hoursLast7 - 40) * 0.5), "high workload in the previous week");

    const bounded = Math.min(100, Math.round(score));
    const concern: Concern = bounded >= 60 ? "high" : bounded >= 35 ? "moderate" : "low";
    return {
      nurseId: n.id,
      name: n.name,
      score: bounded,
      concern,
      maxConsecutive: maxConsec,
      nights,
      maxConsecutiveNights: maxNConsec,
      shortRecoveries,
      rapidTransitions,
      overtimeHours: overtime,
      drivers: drivers.length ? drivers : ["Stable pattern with adequate recovery"],
    };
  });
}

/* ------------------------------------------------------------- fairness */

export interface FairnessDimension {
  key: string;
  label: string;
  average: number;
  spread: number;
  verdict: "Fair" | "Moderate imbalance" | "High imbalance";
  outliers: { name: string; value: number }[];
}

export interface FairnessRow {
  nurseId: string;
  name: string;
  shifts: number;
  hours: number;
  nights: number;
  weekends: number;
  holidays: number;
  difficult: number;
  overtime: number;
  emergencyCover: number;
  maxConsecutive: number;
  weightedLoad: number;
  vsAverage: number; // percentage points against the department average
}

const verdictFor = (spread: number, avg: number): FairnessDimension["verdict"] => {
  const rel = avg > 0 ? spread / avg : spread;
  if (rel <= 0.35) return "Fair";
  if (rel <= 0.75) return "Moderate imbalance";
  return "High imbalance";
};

export function fairness(
  roster: Roster,
  policy: SchedulingPolicy,
  nurses: NurseProfile[],
  holidays: string[] = [],
): { rows: FairnessRow[]; dimensions: FairnessDimension[] } {
  const fatigue = new Map(fatigueRisk(roster, policy, nurses).map((f) => [f.nurseId, f]));

  const rows: FairnessRow[] = nurses.map((n) => {
    const row = roster.cells[n.id] ?? {};
    const worked = roster.dates.filter((d) => isWorking(policy, row[d] ?? ""));
    const hours = worked.reduce((a, d) => a + (shiftByCode(policy, row[d]!)?.hours ?? 0), 0);
    const nights = worked.filter((d) => isNight(policy, row[d]!)).length;
    const weekends = worked.filter((d) => isWeekend(d)).length;
    const holidayDuties = worked.filter((d) => holidays.includes(d)).length;
    const f = fatigue.get(n.id)!;
    const difficult = nights + holidayDuties + f.shortRecoveries;
    // Workload-weighted: a night or holiday duty costs more than a day duty.
    const weightedLoad =
      Math.round((hours + nights * 4 + weekends * 2 + holidayDuties * 5 + f.overtimeHours * 1.5) * 10) / 10;
    return {
      nurseId: n.id,
      name: n.name,
      shifts: worked.length,
      hours: Math.round(hours),
      nights,
      weekends,
      holidays: holidayDuties,
      difficult,
      overtime: f.overtimeHours,
      emergencyCover: roster.exceptions.filter((e) => e.nurseId === n.id && e.category === "Authorised override").length,
      maxConsecutive: f.maxConsecutive,
      weightedLoad,
      vsAverage: 0,
    };
  });

  const avgWeighted = rows.reduce((a, r) => a + r.weightedLoad, 0) / Math.max(rows.length, 1);
  rows.forEach((r) => (r.vsAverage = avgWeighted ? Math.round(((r.weightedLoad - avgWeighted) / avgWeighted) * 100) : 0));

  const dim = (key: string, label: string, pick: (r: FairnessRow) => number): FairnessDimension => {
    const vals = rows.map(pick);
    const avg = vals.reduce((a, b) => a + b, 0) / Math.max(vals.length, 1);
    const spread = Math.max(...vals, 0) - Math.min(...vals, 0);
    return {
      key,
      label,
      average: Math.round(avg * 10) / 10,
      spread,
      verdict: verdictFor(spread, avg),
      outliers: rows
        .filter((r) => pick(r) > avg * 1.4 && pick(r) > 0)
        .sort((a, b) => pick(b) - pick(a))
        .slice(0, 3)
        .map((r) => ({ name: r.name, value: pick(r) })),
    };
  };

  const dimensions = [
    dim("nights", "Night duty distribution", (r) => r.nights),
    dim("weekends", "Weekend duty distribution", (r) => r.weekends),
    dim("holidays", "Public/institutional holiday duty", (r) => r.holidays),
    dim("difficult", "Difficult assignment distribution", (r) => r.difficult),
    dim("overtime", "Overtime distribution", (r) => r.overtime),
    dim("weighted", "Workload-weighted total load", (r) => r.weightedLoad),
  ];

  return { rows, dimensions };
}

/* -------------------------------------------------------- predictability */

export interface StabilityInput {
  publishedAt?: string; // ISO date
  firstShiftDate?: string;
  totalChanges: number;
  lastMinuteChanges: number;
  nurseRequestedChanges: number;
  managementChanges: number;
  emergencyChanges: number;
}

export interface StabilityReport {
  score: number;
  leadDays: number;
  input: StabilityInput;
  notes: string[];
}

export function scheduleStability(s: StabilityInput): StabilityReport {
  const leadDays =
    s.publishedAt && s.firstShiftDate
      ? Math.round((Date.parse(`${s.firstShiftDate}T00:00:00Z`) - Date.parse(`${s.publishedAt}T00:00:00Z`)) / 86400000)
      : 0;
  let score = 100;
  const notes: string[] = [];
  if (!s.publishedAt) {
    score -= 25;
    notes.push("Roster is not yet published — nurses have no confirmed visibility.");
  } else if (leadDays < 14) {
    score -= (14 - Math.max(leadDays, 0)) * 2.5;
    notes.push(`Published ${leadDays} day(s) before the first shift; ≥14 days gives nurses usable notice.`);
  } else notes.push(`Published ${leadDays} days before the first shift.`);
  score -= s.totalChanges * 1.5;
  score -= s.lastMinuteChanges * 5;
  score -= s.managementChanges * 2;
  score += Math.min(6, s.nurseRequestedChanges * 1.5);
  if (s.lastMinuteChanges) notes.push(`${s.lastMinuteChanges} change(s) made close to the shift.`);
  if (s.emergencyChanges) notes.push(`${s.emergencyChanges} emergency change(s) recorded.`);
  return { score: Math.max(0, Math.min(100, Math.round(score))), leadDays, input: s, notes };
}

/* ------------------------------------- employee schedule experience score */

export interface ExperienceRow {
  nurseId: string;
  name: string;
  score: number;
  components: { label: string; score: number; note: string }[];
}

export function experienceScores(
  roster: Roster,
  policy: SchedulingPolicy,
  nurses: NurseProfile[],
  stability: StabilityReport,
): ExperienceRow[] {
  const fatigue = new Map(fatigueRisk(roster, policy, nurses).map((f) => [f.nurseId, f]));
  const { rows } = fairness(roster, policy, nurses);
  const fair = new Map(rows.map((r) => [r.nurseId, r]));

  return nurses.map((n) => {
    const sum = roster.summaries.find((s) => s.nurseId === n.id);
    const f = fatigue.get(n.id)!;
    const fr = fair.get(n.id)!;
    const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 100);

    const components = [
      { label: "Predictability", score: stability.score, note: stability.notes[0] ?? "Publication lead time and change volume." },
      {
        label: "Preferred shifts fulfilled",
        score: pct(sum?.dutyRequestsGranted ?? 0, sum?.dutyRequestsTotal ?? 0),
        note: `${sum?.dutyRequestsGranted ?? 0} of ${sum?.dutyRequestsTotal ?? 0} preferred-duty requests granted.`,
      },
      {
        label: "OFF requests fulfilled",
        score: pct(sum?.offRequestsGranted ?? 0, sum?.offRequestsTotal ?? 0),
        note: `${sum?.offRequestsGranted ?? 0} of ${sum?.offRequestsTotal ?? 0} OFF requests granted.`,
      },
      {
        label: "Recovery time",
        score: Math.max(0, 100 - f.score),
        note: f.drivers.slice(0, 2).join("; "),
      },
      {
        label: "Fair share of load",
        score: Math.max(0, 100 - Math.abs(fr.vsAverage) * 1.5),
        note: `${fr.vsAverage >= 0 ? "+" : ""}${fr.vsAverage}% workload-weighted load against the department average.`,
      },
      {
        label: "Overtime burden",
        score: Math.max(0, 100 - f.overtimeHours * 3),
        note: `${f.overtimeHours}h above contracted hours.`,
      },
      {
        label: "Consecutive working days",
        score: Math.max(0, 100 - Math.max(0, f.maxConsecutive - 4) * 15),
        note: `Longest run: ${f.maxConsecutive} duties.`,
      },
    ];

    return {
      nurseId: n.id,
      name: n.name,
      score: Math.round(components.reduce((a, c) => a + c.score, 0) / components.length),
      components,
    };
  });
}

/* --------------------------------------------- declined-request reasoning */

export function declineExplanation(opts: {
  nurseName: string;
  date: string;
  kind: string;
  unit: string;
  minRequired: number;
  scheduled: number;
  competencyGap?: boolean;
}): string {
  if (opts.competencyGap)
    return `Your ${opts.kind} on ${opts.date} could not be approved because you were the only nurse rostered with the competency required for ${opts.unit} on that shift.`;
  if (opts.scheduled <= opts.minRequired)
    return `Your ${opts.kind} on ${opts.date} could not be approved because approving it would reduce ${opts.unit} below the institution's minimum required staffing level of ${opts.minRequired} nurses for that shift.`;
  return `Your ${opts.kind} on ${opts.date} was reviewed against unit staffing and skill mix and could not be accommodated in this roster period. Nursing administration can review it again with you.`;
}
