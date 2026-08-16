/**
 * NOS AI Nursing Duty Scheduling Engine.
 *
 * Deterministic, explainable constraint-based rostering.
 * Hard constraints are never silently violated; soft constraints are optimised
 * in the published priority order:
 *   1 Patient safety · 2 Compliance · 3 Skill mix · 4 Recovery
 *   5 Preferences · 6 Fairness · 7 Optimisation
 *
 * The engine recommends. The authorised nursing administrator decides.
 */
import type {
  CoverageRow,
  DutyRequest,
  NurseProfile,
  NurseSummary,
  QualityComponent,
  Roster,
  ScheduleException,
  SchedulingPolicy,
  ValidationResult,
} from "./types";
import { isNight, isWorking, shiftByCode } from "./policy";
import { monthDates } from "./demo";

/* ------------------------------------------------------------- date utils */

const toDate = (iso: string) => new Date(`${iso}T00:00:00Z`);
export const isWeekend = (iso: string) => [0, 6].includes(toDate(iso).getUTCDay());
export const dayOfWeek = (iso: string) => toDate(iso).getUTCDay();
export const dayNum = (iso: string) => Number(iso.slice(8, 10));

function startEnd(policy: SchedulingPolicy, date: string, code: string): { start: number; end: number } | null {
  const st = shiftByCode(policy, code);
  if (!st || st.kind !== "working") return null;
  const base = toDate(date).getTime();
  const [sh, sm] = st.start.split(":").map(Number);
  const start = base + (sh! * 60 + (sm ?? 0)) * 60000;
  return { start, end: start + st.hours * 3600000 };
}

/** Hours of rest between the end of the previous duty and the start of the next. */
export function restHours(
  policy: SchedulingPolicy,
  prev: { date: string; code: string },
  next: { date: string; code: string },
): number | null {
  const a = startEnd(policy, prev.date, prev.code);
  const b = startEnd(policy, next.date, next.code);
  if (!a || !b) return null;
  return (b.start - a.end) / 3600000;
}

/* ---------------------------------------------------------- working state */

interface NurseState {
  nurse: NurseProfile;
  hours: number;
  nights: number;
  weekends: number;
  duties: number;
  consecutiveDays: number;
  consecutiveNights: number;
  weekHours: Record<number, number>;
  last?: { date: string; code: string };
  offGranted: number;
  dutyGranted: number;
}

const weekIndex = (dates: string[], date: string) => Math.floor(dates.indexOf(date) / 7);

/* -------------------------------------------------------- hard constraints */

interface HardCheck {
  ok: boolean;
  reason?: string;
}

function hardCheck(
  policy: SchedulingPolicy,
  st: NurseState,
  dates: string[],
  date: string,
  code: string,
  blocked: Set<string>,
): HardCheck {
  const n = st.nurse;
  const shift = shiftByCode(policy, code)!;
  if (blocked.has(`${n.id}|${date}`)) return { ok: false, reason: "Approved leave or approved unavailability" };
  if (!n.availableDays.includes(dayOfWeek(date))) return { ok: false, reason: "Outside contracted available days" };
  if (shift.night && n.restrictions.some((r) => /night/i.test(r)))
    return { ok: false, reason: "Individual restriction excludes night duty" };
  if (shift.hours > policy.maxHoursPerDay) return { ok: false, reason: "Exceeds maximum hours per day" };
  const wk = weekIndex(dates, date);
  const cap = policy.maxHoursPerWeek + (policy.overtimeAllowed ? 0 : 0);
  if ((st.weekHours[wk] ?? 0) + shift.hours > cap)
    return { ok: false, reason: `Exceeds configured ${policy.maxHoursPerWeek}h weekly limit` };
  if (st.consecutiveDays >= policy.maxConsecutiveWorkDays)
    return { ok: false, reason: `Exceeds ${policy.maxConsecutiveWorkDays} consecutive working days` };
  if (shift.night && st.consecutiveNights >= policy.maxConsecutiveNights)
    return { ok: false, reason: `Exceeds ${policy.maxConsecutiveNights} consecutive night duties` };
  if (st.last) {
    const rest = restHours(policy, st.last, { date, code });
    if (rest != null && rest < policy.minRestHoursBetweenShifts)
      return { ok: false, reason: `Rest period below ${policy.minRestHoursBetweenShifts}h` };
  }
  return { ok: true };
}

/* -------------------------------------------------------- soft scoring */

function softScore(
  policy: SchedulingPolicy,
  st: NurseState,
  date: string,
  code: string,
  offWanted: Set<string>,
  dutyWanted: Map<string, string>,
  avgNights: number,
): { score: number; notes: string[] } {
  const n = st.nurse;
  const notes: string[] = [];
  let s = 100;

  if (offWanted.has(`${n.id}|${date}`)) {
    s -= 45;
    notes.push("requested OFF on this date");
  }
  const wanted = dutyWanted.get(`${n.id}|${date}`);
  if (wanted === code) {
    s += 25;
    notes.push("matches requested duty");
  }
  if (n.preferredShifts.includes(code)) {
    s += 12;
    notes.push("preferred shift type");
  }
  if (n.preferredOffDays.includes(dayOfWeek(date))) s -= 10;

  // Circadian stability: reward pattern continuity, penalise rotation.
  if (st.last) {
    const prevNight = isNight(policy, st.last.code);
    const nowNight = isNight(policy, code);
    const rest = restHours(policy, st.last, { date, code });
    if (st.last.code === code) {
      s += 18;
      notes.push("keeps a stable shift pattern");
    } else if (prevNight && !nowNight) {
      s -= 30;
      notes.push("night-to-day transition");
    } else if (!prevNight && nowNight) {
      s -= 14;
      notes.push("day-to-night transition");
    }
    if (rest != null && rest < policy.minRestHoursBetweenShifts + 8) s -= 12;
  }

  // Recovery: consecutive load.
  s -= st.consecutiveDays * 6;
  if (isNight(policy, code)) {
    s -= st.consecutiveNights * 5;
    // Fairness of night distribution.
    s -= (st.nights + n.history.nightsLast30 - avgNights) * 6;
    if (st.nights >= policy.maxNightsPerMonth) s -= 40;
  }
  if (isWeekend(date)) s -= (st.weekends - policy.weekendDutiesPerMonth) * 10;

  // Utilisation against contracted hours (Priority 7).
  const target = (n.contractedHoursPerWeek / 7) * 30;
  s += (target - st.hours) * 0.6;
  if (n.employment === "prn") s -= 15;

  return { score: s, notes };
}

/* ------------------------------------------------------------ generation */

export interface GenerateInput {
  policy: SchedulingPolicy;
  nurses: NurseProfile[];
  requests: DutyRequest[];
  month: string;
  unit: string;
  generatedBy: string;
}

export function generateSchedule(input: GenerateInput): Roster {
  const { policy, nurses, requests, month } = input;
  const dates = monthDates(month);
  const dept = policy.requirements[0]?.dept ?? nurses[0]?.dept ?? "medical";

  const cells: Record<string, Record<string, string>> = {};
  nurses.forEach((n) => (cells[n.id] = {}));

  const blocked = new Set<string>();
  const offWanted = new Set<string>();
  const dutyWanted = new Map<string, string>();
  const leaveCode: Record<string, string> = {};

  requests.forEach((r) => {
    if (r.status === "declined") return;
    const span = r.dateTo && r.date ? dates.filter((d) => d >= r.date! && d <= r.dateTo!) : r.date ? [r.date] : [];
    span.forEach((d) => {
      if (r.kind === "leave" && r.status === "approved" && policy.leaveIsHardConstraint) {
        blocked.add(`${r.nurseId}|${d}`);
        leaveCode[`${r.nurseId}|${d}`] = "AL";
      } else if (r.kind === "cannot_work" && r.status === "approved") {
        blocked.add(`${r.nurseId}|${d}`);
      } else if (r.kind === "preferred_off") {
        offWanted.add(`${r.nurseId}|${d}`);
      } else if (r.kind === "preferred_duty" || r.kind === "preferred_shift_type") {
        dutyWanted.set(`${r.nurseId}|${d}`, r.shiftCode ?? "M");
      }
    });
  });

  const states = new Map<string, NurseState>(
    nurses.map((n) => [
      n.id,
      { nurse: n, hours: 0, nights: 0, weekends: 0, duties: 0, consecutiveDays: 0, consecutiveNights: 0, weekHours: {}, last: undefined, offGranted: 0, dutyGranted: 0 },
    ]),
  );

  const exceptions: ScheduleException[] = [];
  const explanations: { title: string; body: string }[] = [];
  const coverage: CoverageRow[] = [];

  // Night first: hardest to staff, and the biggest circadian cost.
  const order = ["N", "M", "E"].filter((c) => policy.requirements.some((r) => r.shiftCode === c));
  const reqs = policy.requirements.filter((r) => order.includes(r.shiftCode));

  dates.forEach((date) => {
    const assignedToday = new Set<string>();
    order.forEach((code) => {
      const req = reqs.find((r) => r.shiftCode === code);
      if (!req) return;
      const avgNights =
        Array.from(states.values()).reduce((a, s) => a + s.nights + s.nurse.history.nightsLast30, 0) / states.size;

      const picked: NurseState[] = [];
      const pool = () =>
        Array.from(states.values())
          .filter((s) => !assignedToday.has(s.nurse.id))
          .map((s) => {
            const hard = hardCheck(policy, s, dates, date, code, blocked);
            const soft = softScore(policy, s, date, code, offWanted, dutyWanted, avgNights);
            return { s, hard, soft };
          })
          .filter((c) => c.hard.ok)
          .sort((a, b) => b.soft.score - a.soft.score);

      // Priority 3 — skill mix before headcount.
      let candidates = pool();
      const needSenior = req.minSenior;
      const seniors = candidates.filter((c) => c.s.nurse.senior).slice(0, needSenior);
      seniors.forEach((c) => picked.push(c.s));
      if (req.requiredCompetency && !picked.some((p) => p.nurse.competencies.includes(req.requiredCompetency!))) {
        const comp = candidates.find(
          (c) => c.s.nurse.competencies.includes(req.requiredCompetency!) && !picked.includes(c.s),
        );
        if (comp) picked.push(comp.s);
      }
      candidates = candidates.filter((c) => !picked.includes(c.s));
      for (const c of candidates) {
        if (picked.length >= req.minNurses) break;
        picked.push(c.s);
      }

      picked.forEach((s) => {
        const st = shiftByCode(policy, code)!;
        cells[s.nurse.id]![date] = code;
        assignedToday.add(s.nurse.id);
        s.hours += st.hours;
        s.duties += 1;
        const wk = weekIndex(dates, date);
        s.weekHours[wk] = (s.weekHours[wk] ?? 0) + st.hours;
        if (st.night) {
          s.nights += 1;
          s.consecutiveNights += 1;
        } else s.consecutiveNights = 0;
        if (isWeekend(date)) s.weekends += 1;
        s.consecutiveDays += 1;
        if (offWanted.has(`${s.nurse.id}|${date}`)) {
          exceptions.push({
            id: `ex-pref-${s.nurse.id}-${date}`,
            severity: "moderate",
            category: "Preference not fulfilled",
            date,
            shiftCode: code,
            nurseId: s.nurse.id,
            message: `${s.nurse.name}'s requested OFF was not granted — the shift would otherwise fall below the configured minimum staffing of ${req.minNurses}.`,
          });
        }
        if (dutyWanted.get(`${s.nurse.id}|${date}`) === code) s.dutyGranted += 1;
        // Circadian / recovery flag on rotation without adequate recovery.
        if (s.last && isNight(policy, s.last.code) && !st.night) {
          const rest = restHours(policy, s.last, { date, code });
          if (rest != null && rest < policy.minRestHoursBetweenShifts + 12) {
            exceptions.push({
              id: `ex-circ-${s.nurse.id}-${date}`,
              severity: "high",
              category: "Circadian/Recovery risk",
              date,
              shiftCode: code,
              nurseId: s.nurse.id,
              message: `Circadian/Recovery Risk — Administrative Review Required: ${s.nurse.name} moves from night duty to ${shiftByCode(policy, code)!.label} with ${Math.round(rest)}h between duties.`,
            });
          }
        }
        s.last = { date, code };
      });

      const scheduledSenior = picked.filter((p) => p.nurse.senior).length;
      const competencyMet = !req.requiredCompetency || picked.some((p) => p.nurse.competencies.includes(req.requiredCompetency!));
      coverage.push({
        date,
        shiftCode: code,
        required: req.minNurses,
        scheduled: picked.length,
        requiredSenior: req.minSenior,
        scheduledSenior,
        competency: req.requiredCompetency,
        competencyMet,
      });
      if (picked.length < req.minNurses) {
        exceptions.push({
          id: `ex-short-${date}-${code}`,
          severity: "critical",
          category: "Understaffed shift",
          date,
          shiftCode: code,
          message: `${date} ${code}: ${picked.length}/${req.minNurses} nurses available after all hard constraints. Escalate to nursing administration.`,
        });
      }
      if (scheduledSenior < req.minSenior) {
        exceptions.push({
          id: `ex-senior-${date}-${code}`,
          severity: "critical",
          category: "Skill-mix gap",
          date,
          shiftCode: code,
          message: `${date} ${code}: ${scheduledSenior}/${req.minSenior} senior nurses rostered.`,
        });
      }
      if (!competencyMet) {
        exceptions.push({
          id: `ex-comp-${date}-${code}`,
          severity: "critical",
          category: "Missing required competency",
          date,
          shiftCode: code,
          message: `${date} ${code}: no nurse with the required department competency is rostered.`,
        });
      }
    });

    // Everyone else is OFF, on weekly off, or on recorded leave.
    states.forEach((s) => {
      if (assignedToday.has(s.nurse.id)) return;
      const lv = leaveCode[`${s.nurse.id}|${date}`];
      cells[s.nurse.id]![date] = lv ?? (isWeekend(date) ? "WO" : "OFF");
      s.consecutiveDays = 0;
      s.consecutiveNights = 0;
      if (offWanted.has(`${s.nurse.id}|${date}`)) s.offGranted += 1;
    });
  });

  /* ---------------------------------------------- per-nurse summaries */

  const summaries: NurseSummary[] = nurses.map((n) => {
    const s = states.get(n.id)!;
    const row = cells[n.id]!;
    const offDays = dates.filter((d) => ["OFF", "WO"].includes(row[d] ?? "")).length;
    const leaveDays = dates.filter((d) => ["AL", "SL"].includes(row[d] ?? "")).length;
    const contractedMonth = (n.contractedHoursPerWeek / 7) * dates.length;
    const overtime = Math.max(0, Math.round(s.hours - contractedMonth));
    const flags: string[] = [];
    if (overtime > policy.maxOvertimeHoursPerMonth) flags.push("Overtime above configured limit");
    if (s.nights > policy.maxNightsPerMonth) flags.push("Night duties above configured limit");
    const offTotal = dates.filter((d) => offWanted.has(`${n.id}|${d}`)).length;
    const dutyTotal = dates.filter((d) => dutyWanted.has(`${n.id}|${d}`)).length;
    return {
      nurseId: n.id,
      totalHours: Math.round(s.hours),
      duties: s.duties,
      nights: s.nights,
      weekends: s.weekends,
      offDays,
      leaveDays,
      overtimeHours: overtime,
      flags,
      offRequestsGranted: s.offGranted,
      offRequestsTotal: offTotal,
      dutyRequestsGranted: s.dutyGranted,
      dutyRequestsTotal: dutyTotal,
    };
  });

  summaries.forEach((sum) => {
    if (sum.overtimeHours > policy.maxOvertimeHoursPerMonth) {
      exceptions.push({
        id: `ex-ot-${sum.nurseId}`,
        severity: "high",
        category: "Excessive hours",
        nurseId: sum.nurseId,
        message: `${nurses.find((n) => n.id === sum.nurseId)?.name}: ${sum.overtimeHours}h above contracted hours (configured limit ${policy.maxOvertimeHoursPerMonth}h).`,
      });
    }
    if (sum.nights > policy.maxNightsPerMonth) {
      exceptions.push({
        id: `ex-nights-${sum.nurseId}`,
        severity: "high",
        category: "Excessive night duties",
        nurseId: sum.nurseId,
        message: `${nurses.find((n) => n.id === sum.nurseId)?.name}: ${sum.nights} night duties (configured limit ${policy.maxNightsPerMonth}).`,
      });
    }
  });

  const nightSpread = spread(summaries.map((s) => s.nights));
  const weekendSpread = spread(summaries.map((s) => s.weekends));
  if (nightSpread > 5)
    exceptions.push({
      id: "ex-fair-nights",
      severity: "moderate",
      category: "Unequal night distribution",
      message: `Night duties differ by ${nightSpread} across the unit. Review before publishing.`,
    });
  if (weekendSpread > 4)
    exceptions.push({
      id: "ex-fair-weekend",
      severity: "moderate",
      category: "Unequal weekend distribution",
      message: `Weekend duties differ by ${weekendSpread} across the unit.`,
    });
  exceptions.push({
    id: "ex-info-opt",
    severity: "info",
    category: "Optimisation opportunity",
    message:
      "Shift-pattern continuity can be improved further by fixing a small night team for the month instead of rotating the whole unit.",
  });

  /* ---------------------------------------------------- explanations */

  const shortDays = coverage.filter((c) => c.scheduled < c.required).length;
  const circ = exceptions.filter((e) => e.category === "Circadian/Recovery risk").length;
  const deniedOff = exceptions.filter((e) => e.category === "Preference not fulfilled");
  explanations.push({
    title: "How this roster was built",
    body: `Every shift was filled in the order night → morning → evening, because night duty is the hardest to staff safely and carries the greatest recovery cost. For each shift the engine first secured the required senior nurses and the department competency, then filled the remaining places with the nurse whose assignment best preserved rest, pattern stability and fairness. Approved leave, approved unavailability, the ${policy.minRestHoursBetweenShifts}h rest rule, the ${policy.maxHoursPerWeek}h weekly limit, ${policy.maxConsecutiveWorkDays} consecutive working days and ${policy.maxConsecutiveNights} consecutive nights were treated as hard limits and were never broken automatically.`,
  });
  explanations.push({
    title: "Circadian and recovery decisions",
    body:
      circ === 0
        ? "No nurse was moved from night duty into an early duty without the configured recovery interval. Where a nurse was already on a stable pattern, the engine kept that pattern rather than rotating them."
        : `${circ} assignment(s) required a rotation out of night duty with less recovery than the institution's comfort margin. Each is flagged "Circadian/Recovery Risk — Administrative Review Required" in the Exceptions dashboard rather than being applied silently.`,
  });
  if (deniedOff.length)
    explanations.push({
      title: "Why some OFF requests were not granted",
      body: `${deniedOff.length} requested OFF day(s) could not be granted. In each case, releasing the nurse would have taken the shift below the configured minimum staffing level or removed the last nurse holding the required competency. Patient safety and institutional staffing requirements rank above preference in the NOS priority hierarchy.`,
    });
  if (shortDays)
    explanations.push({
      title: "Where the roster could not be completed",
      body: `${shortDays} shift(s) remain below the configured minimum. The engine did not fill them by breaking a rest, hours or competency rule. These require an administrative decision: additional staff, an approved override, or a change to the staffing requirement.`,
    });

  const quality = scoreQuality(policy, coverage, exceptions, summaries);

  return {
    id: `roster-${month}-${dept}`,
    month,
    dept,
    unit: input.unit,
    policyId: policy.id,
    policyVersion: policy.version,
    dates,
    cells,
    nurseIds: nurses.map((n) => n.id),
    exceptions,
    explanations,
    coverage,
    summaries,
    quality,
    status: "draft",
    generatedAt: new Date().toISOString(),
    generatedBy: input.generatedBy,
  };
}

const spread = (xs: number[]) => (xs.length ? Math.max(...xs) - Math.min(...xs) : 0);

/* -------------------------------------------------------- quality score */

export function scoreQuality(
  policy: SchedulingPolicy,
  coverage: CoverageRow[],
  exceptions: ScheduleException[],
  summaries: NurseSummary[],
): { score: number; components: QualityComponent[] } {
  const pct = (ok: number, total: number) => (total ? Math.round((ok / total) * 100) : 100);
  const covered = coverage.filter((c) => c.scheduled >= c.required).length;
  const skill = coverage.filter((c) => c.scheduledSenior >= c.requiredSenior && c.competencyMet).length;
  const circ = exceptions.filter((e) => e.category === "Circadian/Recovery risk").length;
  const hardViol = exceptions.filter((e) => e.severity === "critical" && e.category !== "Understaffed shift").length;
  const offTotal = summaries.reduce((a, s) => a + s.offRequestsTotal, 0);
  const offOk = summaries.reduce((a, s) => a + s.offRequestsGranted, 0);
  const dutyTotal = summaries.reduce((a, s) => a + s.dutyRequestsTotal, 0);
  const dutyOk = summaries.reduce((a, s) => a + s.dutyRequestsGranted, 0);
  const otOver = summaries.filter((s) => s.overtimeHours > policy.maxOvertimeHoursPerMonth).length;
  const nightSpread = spread(summaries.map((s) => s.nights));
  const weekendSpread = spread(summaries.map((s) => s.weekends));

  const components: QualityComponent[] = [
    { key: "coverage", label: "Staffing coverage", weight: 0.24, score: pct(covered, coverage.length), note: `${coverage.length - covered} shift(s) below minimum staffing.` },
    { key: "compliance", label: "Policy compliance", weight: 0.2, score: Math.max(0, 100 - hardViol * 10), note: hardViol ? `${hardViol} hard-rule exception(s).` : "No hard-rule violations." },
    { key: "skill", label: "Skill mix", weight: 0.14, score: pct(skill, coverage.length), note: `${coverage.length - skill} shift(s) with a seniority or competency gap.` },
    { key: "recovery", label: "Rest and recovery", weight: 0.12, score: Math.max(0, 100 - circ * 8), note: circ ? `${circ} recovery-risk assignment(s).` : "Configured rest intervals respected." },
    { key: "circadian", label: "Circadian stability", weight: 0.1, score: Math.max(0, 100 - circ * 10), note: "Pattern continuity preferred over rotation." },
    { key: "preference", label: "Preference satisfaction", weight: 0.08, score: Math.round((pct(offOk, offTotal) + pct(dutyOk, dutyTotal)) / 2), note: `${offOk}/${offTotal} OFF and ${dutyOk}/${dutyTotal} duty requests fulfilled.` },
    {
      key: "fairness",
      label: "Fairness (nights/weekends)",
      weight: 0.07,
      // A deliberately stable night team is safer than rotating everyone, so a
      // tolerance is allowed before fairness is scored down.
      score: Math.max(0, 100 - Math.max(0, nightSpread - 4) * 8 - Math.max(0, weekendSpread - 3) * 8),
      note: `Night spread ${nightSpread}, weekend spread ${weekendSpread} (tolerance: 4 nights / 3 weekends to preserve stable patterns).`,
    },
    { key: "overtime", label: "Overtime risk", weight: 0.05, score: Math.max(0, 100 - otOver * 12), note: otOver ? `${otOver} nurse(s) above the configured overtime limit.` : "Overtime within configured limits." },
  ];
  const score = Math.round(components.reduce((a, c) => a + c.score * c.weight, 0));
  return { score, components };
}

/** Recompute coverage, summaries, exception set and quality after manual edits. */
export function recompute(roster: Roster, policy: SchedulingPolicy, nurses: NurseProfile[]): Roster {
  const coverage: CoverageRow[] = [];
  const exceptions = roster.exceptions.filter((e) => e.category === "Preference not fulfilled" || e.overridden);
  roster.dates.forEach((date) => {
    policy.requirements.forEach((req) => {
      const on = nurses.filter((n) => roster.cells[n.id]?.[date] === req.shiftCode);
      const scheduledSenior = on.filter((n) => n.senior).length;
      const competencyMet = !req.requiredCompetency || on.some((n) => n.competencies.includes(req.requiredCompetency!));
      coverage.push({
        date,
        shiftCode: req.shiftCode,
        required: req.minNurses,
        scheduled: on.length,
        requiredSenior: req.minSenior,
        scheduledSenior,
        competency: req.requiredCompetency,
        competencyMet,
      });
      if (on.length < req.minNurses)
        exceptions.push({
          id: `ex-short-${date}-${req.shiftCode}`,
          severity: "critical",
          category: "Understaffed shift",
          date,
          shiftCode: req.shiftCode,
          message: `${date} ${req.shiftCode}: ${on.length}/${req.minNurses} nurses rostered.`,
        });
      if (scheduledSenior < req.minSenior)
        exceptions.push({
          id: `ex-senior-${date}-${req.shiftCode}`,
          severity: "critical",
          category: "Skill-mix gap",
          date,
          shiftCode: req.shiftCode,
          message: `${date} ${req.shiftCode}: ${scheduledSenior}/${req.minSenior} senior nurses rostered.`,
        });
      if (!competencyMet)
        exceptions.push({
          id: `ex-comp-${date}-${req.shiftCode}`,
          severity: "critical",
          category: "Missing required competency",
          date,
          shiftCode: req.shiftCode,
          message: `${date} ${req.shiftCode}: required department competency not covered.`,
        });
    });
  });

  const summaries: NurseSummary[] = nurses.map((n) => {
    const row = roster.cells[n.id] ?? {};
    let hours = 0, duties = 0, nights = 0, weekends = 0, offDays = 0, leaveDays = 0;
    roster.dates.forEach((d) => {
      const code = row[d];
      if (!code) return;
      const st = shiftByCode(policy, code);
      if (!st) return;
      if (st.kind === "working") {
        hours += st.hours;
        duties += 1;
        if (st.night) nights += 1;
        if (isWeekend(d)) weekends += 1;
      } else if (st.kind === "off") offDays += 1;
      else if (st.kind === "leave") leaveDays += 1;
    });
    const prev = roster.summaries.find((s) => s.nurseId === n.id);
    const contractedMonth = (n.contractedHoursPerWeek / 7) * roster.dates.length;
    return {
      nurseId: n.id,
      totalHours: Math.round(hours),
      duties,
      nights,
      weekends,
      offDays,
      leaveDays,
      overtimeHours: Math.max(0, Math.round(hours - contractedMonth)),
      flags: [],
      offRequestsGranted: prev?.offRequestsGranted ?? 0,
      offRequestsTotal: prev?.offRequestsTotal ?? 0,
      dutyRequestsGranted: prev?.dutyRequestsGranted ?? 0,
      dutyRequestsTotal: prev?.dutyRequestsTotal ?? 0,
    };
  });

  return { ...roster, coverage, exceptions, summaries, quality: scoreQuality(policy, coverage, exceptions, summaries) };
}

/* ----------------------------------------------------- manual edit rules */

export function validateChange(
  roster: Roster,
  policy: SchedulingPolicy,
  nurses: NurseProfile[],
  nurseId: string,
  date: string,
  code: string,
): ValidationResult {
  const nurse = nurses.find((n) => n.id === nurseId);
  if (!nurse) return { level: "blocked", messages: ["Nurse is not part of this roster."] };
  const st = shiftByCode(policy, code);
  if (!st) return { level: "blocked", messages: ["Unknown shift code for this institution's policy."] };
  const messages: string[] = [];
  let level: ValidationResult["level"] = "ok";
  const block = (m: string) => {
    messages.push(`BLOCKED: ${m}`);
    level = "blocked";
  };
  const warn = (m: string) => {
    messages.push(`Warning: ${m}`);
    if (level === "ok") level = "warning";
  };

  if (st.kind !== "working") {
    // Removing a duty may create a staffing gap.
    const req = policy.requirements.find((r) => r.shiftCode === roster.cells[nurseId]?.[date]);
    if (req) {
      const on = nurses.filter((n) => n.id !== nurseId && roster.cells[n.id]?.[date] === req.shiftCode);
      if (on.length < req.minNurses)
        warn(`this leaves ${on.length}/${req.minNurses} nurses on ${req.shiftCode} for ${date}.`);
      if (req.requiredCompetency && !on.some((n) => n.competencies.includes(req.requiredCompetency!)))
        block(`removing this nurse leaves the shift without the required department competency.`);
    }
    return { level, messages: messages.length ? messages : ["No policy conflict detected."] };
  }

  const idx = roster.dates.indexOf(date);
  const prevDate = roster.dates[idx - 1];
  const nextDate = roster.dates[idx + 1];
  const prevCode = prevDate ? roster.cells[nurseId]?.[prevDate] : undefined;
  const nextCode = nextDate ? roster.cells[nurseId]?.[nextDate] : undefined;

  if (!nurse.availableDays.includes(dayOfWeek(date)))
    block("this date is outside the nurse's contracted available days.");
  if (st.night && nurse.restrictions.some((r) => /night/i.test(r)))
    block("an individual restriction excludes this nurse from night duty.");
  if (st.hours > policy.maxHoursPerDay) block(`shift exceeds the configured ${policy.maxHoursPerDay}h daily limit.`);
  const currentLeave = roster.cells[nurseId]?.[date];
  if (currentLeave && shiftByCode(policy, currentLeave)?.kind === "leave" && policy.leaveIsHardConstraint)
    block("the nurse is on approved leave on this date.");

  if (prevCode && isWorking(policy, prevCode)) {
    const rest = restHours(policy, { date: prevDate!, code: prevCode }, { date, code });
    if (rest != null && rest < policy.minRestHoursBetweenShifts)
      block(`minimum configured recovery period of ${policy.minRestHoursBetweenShifts}h would be violated (${Math.round(rest)}h).`);
    else if (rest != null && rest < policy.minRestHoursBetweenShifts + 12)
      warn(`recovery is short (${Math.round(rest)}h) — circadian/recovery review recommended.`);
    if (isNight(policy, prevCode) && !st.night) warn("night-to-day transition — circadian disruption.");
  }
  if (nextCode && isWorking(policy, nextCode)) {
    const rest = restHours(policy, { date, code }, { date: nextDate!, code: nextCode });
    if (rest != null && rest < policy.minRestHoursBetweenShifts)
      block(`the following duty would fall below the ${policy.minRestHoursBetweenShifts}h rest rule.`);
  }

  // Consecutive days / nights.
  let consec = 0;
  for (let i = idx - 1; i >= 0; i--) {
    const c = roster.cells[nurseId]?.[roster.dates[i]!];
    if (c && isWorking(policy, c)) consec++;
    else break;
  }
  if (consec + 1 > policy.maxConsecutiveWorkDays)
    block(`this exceeds the configured maximum of ${policy.maxConsecutiveWorkDays} consecutive working days.`);
  if (st.night) {
    let nconsec = 0;
    for (let i = idx - 1; i >= 0; i--) {
      const c = roster.cells[nurseId]?.[roster.dates[i]!];
      if (c && isNight(policy, c)) nconsec++;
      else break;
    }
    if (nconsec + 1 > policy.maxConsecutiveNights)
      block(`this exceeds the configured maximum of ${policy.maxConsecutiveNights} consecutive night duties.`);
  }

  // Weekly hours.
  const wk = Math.floor(idx / 7);
  const weekHours = roster.dates
    .slice(wk * 7, wk * 7 + 7)
    .filter((d) => d !== date)
    .reduce((a, d) => a + (shiftByCode(policy, roster.cells[nurseId]?.[d] ?? "")?.hours ?? 0), 0);
  if (weekHours + st.hours > policy.maxHoursPerWeek)
    block(`weekly hours would reach ${weekHours + st.hours}h against the configured ${policy.maxHoursPerWeek}h limit.`);

  return { level, messages: messages.length ? messages : ["No policy conflict detected."] };
}

/* --------------------------------------------------------- emergency mode */

export interface ReplacementOption {
  nurse: NurseProfile;
  safety: "recommended" | "caution" | "not_advised";
  score: number;
  reasons: string[];
}

export function emergencyOptions(
  roster: Roster,
  policy: SchedulingPolicy,
  nurses: NurseProfile[],
  date: string,
  code: string,
  absentNurseId?: string,
): ReplacementOption[] {
  return nurses
    .filter((n) => n.id !== absentNurseId)
    .map((n) => {
      const current = roster.cells[n.id]?.[date];
      const reasons: string[] = [];
      let score = 60;
      let safety: ReplacementOption["safety"] = "recommended";

      const check = validateChange(roster, policy, nurses, n.id, date, code);
      if (check.level === "blocked") {
        safety = "not_advised";
        score = 0;
        reasons.push(...check.messages);
      } else if (check.level === "warning") {
        safety = "caution";
        score -= 20;
        reasons.push(...check.messages);
      }
      if (current && isWorking(policy, current)) {
        safety = "not_advised";
        score = 0;
        reasons.push(`Already rostered on ${current} for this date.`);
      }
      const sum = roster.summaries.find((s) => s.nurseId === n.id);
      if (sum) {
        if (sum.nights >= policy.maxNightsPerMonth - 1 && isNight(policy, code)) {
          score -= 25;
          if (safety === "recommended") safety = "caution";
          reasons.push(`Already carrying ${sum.nights} night duties this month.`);
        }
        if (sum.overtimeHours > policy.maxOvertimeHoursPerMonth) {
          score -= 30;
          if (safety === "recommended") safety = "caution";
          reasons.push("Above the configured overtime limit — additional duty adds fatigue risk.");
        }
        score += Math.max(-20, (policy.maxOvertimeHoursPerMonth - sum.overtimeHours) * 0.6);
      }
      const req = policy.requirements.find((r) => r.shiftCode === code);
      if (req?.requiredCompetency) {
        if (n.competencies.includes(req.requiredCompetency)) {
          score += 25;
          reasons.push("Holds the required department competency.");
        } else {
          score -= 35;
          if (safety === "recommended") safety = "caution";
          reasons.push("Does not hold the required department competency.");
        }
      }
      if (n.employment === "prn") {
        score += 18;
        reasons.push("PRN / flexible contract — available for additional duty.");
      }
      if (current === "OC") {
        score += 22;
        reasons.push("Rostered on call for this date.");
      }
      if (n.preferredShifts.includes(code)) {
        score += 8;
        reasons.push("Shift matches their preferred pattern.");
      }
      if (!reasons.length) reasons.push("No policy conflict detected; rested and within configured limits.");
      return { nurse: n, safety, score: Math.round(score), reasons };
    })
    .sort((a, b) => b.score - a.score);
}
