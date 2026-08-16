/**
 * Three-layer roster validation.
 *   Layer 1 — Legal compliance (configured Central/State rules)
 *   Layer 2 — Institutional compliance (policy + SOP)
 *   Layer 3 — Employee wellbeing (fatigue, recovery, fairness, predictability)
 *
 * NOS validates against CONFIGURED rules. It does not certify legal compliance.
 */
import type { NurseProfile, Roster, SchedulingPolicy } from "./types";
import { isNight, isWorking, shiftByCode } from "./policy";
import { isWeekend, restHours } from "./engine";
import { missingSafeguards, type RegulatoryBaseline } from "./regulatory";

export type ComplianceStatus = "compliant" | "warning" | "violation" | "not_applicable" | "shortage" | "gap";

export const STATUS_LABEL: Record<ComplianceStatus, string> = {
  compliant: "Compliant",
  warning: "Warning",
  violation: "Violation",
  not_applicable: "Not applicable",
  shortage: "Shortage",
  gap: "Gap",
};

export const STATUS_TONE: Record<ComplianceStatus, string> = {
  compliant: "#0d9488",
  warning: "#d97706",
  violation: "#dc2626",
  not_applicable: "#64748b",
  shortage: "#dc2626",
  gap: "#ea580c",
};

export interface ComplianceCheck {
  id: string;
  area: string;
  layer: 1 | 2 | 3;
  basis: string;
  status: ComplianceStatus;
  detail: string;
  affected: string[];
}

export interface HoursLedgerRow {
  nurseId: string;
  name: string;
  contractedHours: number;
  scheduledHours: number;
  regularHours: number;
  overtimeHours: number;
  dailyExcessDays: number;
  weeklyExcessWeeks: number;
  estimatedOvertimeEntitlement: string;
  consecutiveWorkdays: number;
  nights: number;
  weekends: number;
  institutionalPolicy: string;
  exceptionStatus: string;
}

const weekChunks = (dates: string[]) => {
  const out: string[][] = [];
  for (let i = 0; i < dates.length; i += 7) out.push(dates.slice(i, i + 7));
  return out;
};

export function hoursLedger(
  roster: Roster,
  policy: SchedulingPolicy,
  base: RegulatoryBaseline,
  nurses: NurseProfile[],
): HoursLedgerRow[] {
  return nurses.map((n) => {
    const row = roster.cells[n.id] ?? {};
    const hoursOn = (d: string) => shiftByCode(policy, row[d] ?? "")?.hours ?? 0;
    const scheduled = roster.dates.reduce((a, d) => a + hoursOn(d), 0);
    const dailyExcessDays = roster.dates.filter((d) => hoursOn(d) > base.overtimeThresholdDaily).length;
    const weeks = weekChunks(roster.dates);
    let overtime = 0;
    let weeklyExcessWeeks = 0;
    weeks.forEach((w) => {
      const h = w.reduce((a, d) => a + hoursOn(d), 0);
      if (h > base.overtimeThresholdWeekly) {
        overtime += h - base.overtimeThresholdWeekly;
        weeklyExcessWeeks += 1;
      }
    });
    let consec = 0;
    let maxConsec = 0;
    roster.dates.forEach((d) => {
      if (isWorking(policy, row[d] ?? "")) {
        consec += 1;
        maxConsec = Math.max(maxConsec, consec);
      } else consec = 0;
    });
    const contracted = Math.round((n.contractedHoursPerWeek / 7) * roster.dates.length);
    const nights = roster.dates.filter((d) => isNight(policy, row[d] ?? "")).length;
    const weekends = roster.dates.filter((d) => isWeekend(d) && isWorking(policy, row[d] ?? "")).length;
    return {
      nurseId: n.id,
      name: n.name,
      contractedHours: contracted,
      scheduledHours: Math.round(scheduled),
      regularHours: Math.round(scheduled - overtime),
      overtimeHours: Math.round(overtime),
      dailyExcessDays,
      weeklyExcessWeeks,
      estimatedOvertimeEntitlement:
        overtime > 0
          ? `${Math.round(overtime)}h at the configured ${base.overtimeMultiplier}× overtime rate — payroll treatment per institutional policy`
          : "None",
      consecutiveWorkdays: maxConsec,
      nights,
      weekends,
      institutionalPolicy: policy.overtimeAllowed
        ? `Overtime permitted up to ${policy.maxOvertimeHoursPerMonth}h/month`
        : "Overtime not permitted by institutional policy",
      exceptionStatus:
        overtime > policy.maxOvertimeHoursPerMonth
          ? "Emergency overtime — administrative review required"
          : overtime > 0
            ? "Within configured institutional limit"
            : "No exception",
    };
  });
}

export interface WeeklyRestRow {
  nurseId: string;
  name: string;
  weeks: { label: string; offDays: number; ok: boolean }[];
  weekendDuties: number;
  compensatoryOwed: number;
}

export function weeklyRest(roster: Roster, policy: SchedulingPolicy, base: RegulatoryBaseline, nurses: NurseProfile[]): WeeklyRestRow[] {
  const weeks = weekChunks(roster.dates);
  return nurses.map((n) => {
    const row = roster.cells[n.id] ?? {};
    const detail = weeks.map((w, i) => {
      const offDays = w.filter((d) => !isWorking(policy, row[d] ?? "")).length;
      return { label: `Week ${i + 1}`, offDays, ok: offDays >= base.weeklyHolidaysPerWeek };
    });
    return {
      nurseId: n.id,
      name: n.name,
      weeks: detail,
      weekendDuties: roster.dates.filter((d) => isWeekend(d) && isWorking(policy, row[d] ?? "")).length,
      compensatoryOwed: base.compensatoryOffRequired ? detail.filter((w) => !w.ok).length : 0,
    };
  });
}

export interface BreakRow {
  shift: string;
  continuousHours: number;
  requiredBreakMinutes: number;
  rosteredBreakMinutes: number;
  coverageAvailable: boolean;
  status: ComplianceStatus;
  note: string;
}

export function breakCompliance(policy: SchedulingPolicy, base: RegulatoryBaseline, coverageOk: boolean): BreakRow[] {
  return policy.shiftTypes
    .filter((s) => s.kind === "working")
    .map((s) => {
      const needsBreak = s.hours > base.continuousWorkBeforeBreakHours;
      const covered = coverageOk || !base.breakRequiresCoverage;
      const status: ComplianceStatus = !needsBreak
        ? "not_applicable"
        : policy.breakMinutesPerShift < base.requiredBreakMinutes
          ? "violation"
          : covered
            ? "compliant"
            : "warning";
      return {
        shift: `${s.code} · ${s.label} (${s.hours}h)`,
        continuousHours: s.hours,
        requiredBreakMinutes: needsBreak ? base.requiredBreakMinutes : 0,
        rosteredBreakMinutes: policy.breakMinutesPerShift,
        coverageAvailable: covered,
        status,
        note: !needsBreak
          ? "Below the configured continuous-work threshold."
          : status === "violation"
            ? "Rostered break is below the configured statutory baseline."
            : covered
              ? "Break rostered and relief coverage assumed available."
              : "A break is rostered but no safe relief coverage is recorded — the nurse cannot be shown as on break.",
      };
    });
}

export interface ComplianceReport {
  checks: ComplianceCheck[];
  layer1: ComplianceStatus;
  layer2: ComplianceStatus;
  layer3: ComplianceStatus;
  readyForApproval: boolean;
  ledger: HoursLedgerRow[];
  rest: WeeklyRestRow[];
  breaks: BreakRow[];
}

const worst = (list: ComplianceStatus[]): ComplianceStatus => {
  if (list.includes("violation") || list.includes("shortage")) return "violation";
  if (list.includes("gap")) return "gap";
  if (list.includes("warning")) return "warning";
  return "compliant";
};

export function validateCompliance(
  roster: Roster,
  policy: SchedulingPolicy,
  base: RegulatoryBaseline,
  nurses: NurseProfile[],
  wellbeing: { fatigueHigh: number; fairnessConcerns: number; predictability: number },
): ComplianceReport {
  const ledger = hoursLedger(roster, policy, base, nurses);
  const rest = weeklyRest(roster, policy, base, nurses);
  const coverageOk = roster.coverage.every((c) => c.scheduled >= c.required);
  const breaks = breakCompliance(policy, base, coverageOk);
  const byId = new Map(nurses.map((n) => [n.id, n]));
  const checks: ComplianceCheck[] = [];

  const dailyExcess = ledger.filter((l) => l.dailyExcessDays > 0);
  checks.push({
    id: "c-hours",
    area: "Working hours",
    layer: 1,
    basis: `Configured baseline ${base.standardDailyHours}h/day · ${base.jurisdictionLevel}${base.state !== "Central only" ? ` · ${base.state}` : ""}`,
    status: dailyExcess.length ? "warning" : "compliant",
    detail: dailyExcess.length
      ? `${dailyExcess.length} nurse(s) have shifts longer than the ${base.standardDailyHours}h daily baseline. Hours beyond the threshold must be treated as overtime.`
      : `No duty exceeds the configured ${base.standardDailyHours}h daily baseline.`,
    affected: dailyExcess.map((l) => l.name),
  });

  const weeklyExcess = ledger.filter((l) => l.weeklyExcessWeeks > 0);
  checks.push({
    id: "c-weekly",
    area: "Weekly hours",
    layer: 1,
    basis: `Configured baseline ${base.standardWeeklyHours}h/week (contractual standard ${base.contractualWeeklyHours}h)`,
    status: weeklyExcess.length ? "warning" : "compliant",
    detail: weeklyExcess.length
      ? `${weeklyExcess.length} nurse(s) exceed ${base.standardWeeklyHours}h in at least one week.`
      : `All nurses remain within the ${base.standardWeeklyHours}h weekly baseline.`,
    affected: weeklyExcess.map((l) => l.name),
  });

  const otBreach = ledger.filter((l) => l.overtimeHours > policy.maxOvertimeHoursPerMonth);
  checks.push({
    id: "c-ot",
    area: "Overtime",
    layer: 1,
    basis: `Overtime beyond the statutory threshold · institutional cap ${policy.maxOvertimeHoursPerMonth}h/month`,
    status: otBreach.length ? "violation" : ledger.some((l) => l.overtimeHours > 0) ? "warning" : "compliant",
    detail: otBreach.length
      ? `Emergency overtime — administrative review required for ${otBreach.length} nurse(s).`
      : "Overtime, where present, remains within the configured institutional cap.",
    affected: otBreach.map((l) => l.name),
  });

  const restBreaches: string[] = [];
  nurses.forEach((n) => {
    const row = roster.cells[n.id] ?? {};
    roster.dates.forEach((d, i) => {
      const prev = roster.dates[i - 1];
      if (!prev) return;
      const a = row[prev];
      const b = row[d];
      if (!a || !b || !isWorking(policy, a) || !isWorking(policy, b)) return;
      const r = restHours(policy, { date: prev, code: a }, { date: d, code: b });
      if (r != null && r < policy.minRestHoursBetweenShifts) restBreaches.push(`${n.name} ${d}`);
    });
  });
  checks.push({
    id: "c-rest",
    area: "Rest between duties",
    layer: 1,
    basis: `Institution-adopted rest interval of ${policy.minRestHoursBetweenShifts}h`,
    status: restBreaches.length ? "violation" : "compliant",
    detail: restBreaches.length
      ? `${restBreaches.length} duty pair(s) fall below the configured rest interval.`
      : "Every duty pair meets the configured rest interval.",
    affected: restBreaches.slice(0, 8),
  });

  const restShort = rest.filter((r) => r.weeks.some((w) => !w.ok));
  checks.push({
    id: "c-weekly-off",
    area: "Weekly off",
    layer: 1,
    basis: `${base.weeklyHolidaysPerWeek} weekly holiday per week${base.compensatoryOffRequired ? " · compensatory holiday required where not given" : ""}`,
    status: restShort.length ? "violation" : "compliant",
    detail: restShort.length
      ? `${restShort.length} nurse(s) have a week without the required weekly holiday. Compensatory holiday must be scheduled.`
      : "Every nurse receives the required weekly holiday in each week.",
    affected: restShort.map((r) => r.name),
  });

  const nightLoad = ledger.filter((l) => l.nights > policy.maxNightsPerMonth);
  checks.push({
    id: "c-night",
    area: "Night work",
    layer: 2,
    basis: `Institutional night-duty ceiling ${policy.maxNightsPerMonth}/month, max ${policy.maxConsecutiveNights} consecutive`,
    status: nightLoad.length ? "warning" : "compliant",
    detail: nightLoad.length
      ? `${nightLoad.length} nurse(s) exceed the configured monthly night ceiling.`
      : "Night-duty exposure is within the configured institutional ceiling.",
    affected: nightLoad.map((l) => l.name),
  });

  const missing = missingSafeguards(base.safeguards);
  const womenOnNights = nurses.filter(
    (n) => n.gender === "female" && roster.dates.some((d) => isNight(policy, roster.cells[n.id]?.[d] ?? "")),
  );
  const noConsent = womenOnNights.filter((n) => n.nightWorkConsent === false);
  checks.push({
    id: "c-women-night",
    area: "Women night-work safeguards",
    layer: 1,
    basis: "Applicable conditions: consent, transportation and safe & secure working conditions",
    status: !womenOnNights.length
      ? "not_applicable"
      : missing.length || noConsent.length
        ? "violation"
        : "compliant",
    detail: !womenOnNights.length
      ? "No woman employee is rostered on night duty in this period."
      : missing.length || noConsent.length
        ? `Night assignment blocked / requires administrative resolution — ${[...missing.map((m) => m), ...(noConsent.length ? [`${noConsent.length} consent record(s) missing`] : [])].join(", ")}.`
        : `${womenOnNights.length} nurse(s) rostered at night with all recorded safeguards satisfied. Night duty is never restricted on the basis of gender.`,
    affected: noConsent.map((n) => n.name),
  });

  const breakIssues = breaks.filter((b) => b.status === "violation" || b.status === "warning");
  checks.push({
    id: "c-breaks",
    area: "Breaks",
    layer: 1,
    basis: `Break after ${base.continuousWorkBeforeBreakHours}h continuous work · ${base.requiredBreakMinutes} minutes${base.breakRequiresCoverage ? " · relief coverage required" : ""}`,
    status: breaks.some((b) => b.status === "violation") ? "violation" : breakIssues.length ? "warning" : "compliant",
    detail: breakIssues.length
      ? breakIssues.map((b) => `${b.shift}: ${b.note}`).join(" ")
      : "Break duration and relief coverage satisfy the configured rules.",
    affected: [],
  });

  const short = roster.coverage.filter((c) => c.scheduled < c.required);
  checks.push({
    id: "c-staffing",
    area: "Nursing staffing",
    layer: 2,
    basis: "Configured nursing staffing standard + workload/acuity adjustment",
    status: short.length ? "shortage" : "compliant",
    detail: short.length
      ? `${short.length} shift(s) below the configured minimum staffing.`
      : "Every shift meets the configured minimum staffing.",
    affected: short.slice(0, 8).map((c) => `${c.date} ${c.shiftCode}`),
  });

  const mix = roster.coverage.filter((c) => c.scheduledSenior < c.requiredSenior || !c.competencyMet);
  checks.push({
    id: "c-mix",
    area: "Skill mix",
    layer: 2,
    basis: "Senior mix and required department competency per shift",
    status: mix.length ? "gap" : "compliant",
    detail: mix.length ? `${mix.length} shift(s) with a senior or competency gap.` : "Senior mix and competency requirements are met on every shift.",
    affected: mix.slice(0, 8).map((c) => `${c.date} ${c.shiftCode}`),
  });

  const restricted = nurses.filter((n) => n.workRestriction);
  checks.push({
    id: "c-restrictions",
    area: "Protected work restrictions",
    layer: 2,
    basis: "Authorised HR / occupational-health restriction. Underlying medical information is never displayed.",
    status: restricted.some((n) =>
      n.workRestriction?.noNightDuty && roster.dates.some((d) => isNight(policy, roster.cells[n.id]?.[d] ?? "")),
    )
      ? "violation"
      : restricted.length
        ? "compliant"
        : "not_applicable",
    detail: restricted.length
      ? `${restricted.length} employee(s) carry a recorded work restriction. Display shows only "Work restriction applies".`
      : "No recorded work restrictions in this workforce.",
    affected: [],
  });

  checks.push({
    id: "c-fatigue",
    area: "Fatigue & recovery",
    layer: 3,
    basis: "Scheduling-derived fatigue risk indicator — not a medical assessment",
    status: wellbeing.fatigueHigh > 2 ? "violation" : wellbeing.fatigueHigh ? "warning" : "compliant",
    detail: wellbeing.fatigueHigh
      ? `${wellbeing.fatigueHigh} nurse(s) at high fatigue concern. Circadian/Recovery Risk — administrative review required.`
      : "No nurse is at high fatigue concern on this roster.",
    affected: [],
  });
  checks.push({
    id: "c-fairness",
    area: "Fairness",
    layer: 3,
    basis: "Workload-weighted distribution against the department average",
    status: wellbeing.fairnessConcerns > 1 ? "warning" : "compliant",
    detail: wellbeing.fairnessConcerns
      ? `${wellbeing.fairnessConcerns} distribution dimension(s) show significant imbalance.`
      : "Night, weekend, holiday and overtime load are evenly distributed.",
    affected: [],
  });
  checks.push({
    id: "c-predictability",
    area: "Predictability",
    layer: 3,
    basis: "Publication lead time and post-publication changes",
    status: wellbeing.predictability >= 75 ? "compliant" : wellbeing.predictability >= 55 ? "warning" : "violation",
    detail: `Schedule stability score ${wellbeing.predictability}/100.`,
    affected: [],
  });

  const layer1 = worst(checks.filter((c) => c.layer === 1).map((c) => c.status));
  const layer2 = worst(checks.filter((c) => c.layer === 2).map((c) => c.status));
  const layer3 = worst(checks.filter((c) => c.layer === 3).map((c) => c.status));
  void byId;

  return {
    checks,
    layer1,
    layer2,
    layer3,
    readyForApproval: layer1 !== "violation" && layer2 !== "violation" && layer3 !== "violation",
    ledger,
    rest,
    breaks,
  };
}
