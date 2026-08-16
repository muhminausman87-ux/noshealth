/**
 * FROMEX — Intelligent Duty Scheduling & Human-Centered Rostering.
 *
 * Scheduling CONSUMES workforce signals (demand, capacity, competency,
 * availability, leave, institution policy). It never recomputes them:
 * Nursing Workforce Intelligence remains the source of truth for demand,
 * capacity, forecast and workload (see src/lib/fromex-workforce.ts).
 *
 * Everything here is explainable, rules-based prototype logic on seeded demo
 * data — labelled "AI Prototype" in the UI. Nothing publishes or assigns by
 * itself: AI recommends, authorised humans decide, institution policy governs.
 */
import type { Department } from "./departments";
import { getDept } from "./departments";
import type { Role } from "./auth";
import type { Responsibility } from "./access";
import type { DemandLevel } from "./fromex-workforce";

/* ------------------------------------------------------------------ types */

export type ShiftCode = "day" | "evening" | "night";

export const SHIFTS: { id: ShiftCode; label: string; start: string; end: string; hours: number }[] = [
  { id: "day", label: "Day", start: "07:00", end: "15:00", hours: 8 },
  { id: "evening", label: "Evening", start: "15:00", end: "23:00", hours: 8 },
  { id: "night", label: "Night", start: "23:00", end: "07:00", hours: 8 },
];

export type LeaveType = "annual" | "casual" | "sick" | "study" | "maternity" | "other";

export const LEAVE_LABEL: Record<LeaveType, string> = {
  annual: "Annual leave",
  casual: "Casual leave",
  sick: "Sick leave",
  study: "Study leave",
  maternity: "Maternity leave",
  other: "Institution-defined leave",
};

/** A request is not a guarantee. Status is always explicit. */
export type RequestStatus = "submitted" | "under_review" | "approved" | "declined" | "scheduled";

export const REQUEST_STATUS_LABEL: Record<RequestStatus, string> = {
  submitted: "Submitted",
  under_review: "Under review",
  approved: "Approved",
  declined: "Declined",
  scheduled: "Scheduled",
};

export const REQUEST_STATUS_TONE: Record<RequestStatus, string> = {
  submitted: "var(--color-muted-foreground)",
  under_review: "#d97706",
  approved: "#0d9488",
  declined: "#dc2626",
  scheduled: "#2563eb",
};

export type RequestKind =
  | "day_off"
  | "preferred_shift"
  | "availability"
  | "leave"
  | "shift_exchange";

export const REQUEST_KIND_LABEL: Record<RequestKind, string> = {
  day_off: "Requested day off",
  preferred_shift: "Preferred duty",
  availability: "Availability update",
  leave: "Leave request",
  shift_exchange: "Shift exchange",
};

export type CompetencyCode = "icu" | "ed" | "paeds" | "midwifery" | "cardiac" | "preceptor" | "acls";

export const COMPETENCY_LABEL: Record<CompetencyCode, string> = {
  icu: "ICU qualified",
  ed: "ED qualified",
  paeds: "Paediatric qualified",
  midwifery: "Midwifery",
  cardiac: "Cardiac care",
  preceptor: "Preceptor",
  acls: "ACLS",
};

export interface Nurse {
  id: string;
  name: string;
  grade: "RN" | "SN" | "EN" | "CN"; // registered / senior / enrolled / charge
  dept: Department;
  competencies: CompetencyCode[];
  /** Governed competency layer is owned by Employee Growth; shown read-only here. */
  contractedHours: number;
  preferences: { preferredShifts: ShiftCode[]; avoidShifts: ShiftCode[]; note?: string };
}

export interface LeaveRecord {
  id: string;
  nurseId: string;
  type: LeaveType;
  from: string; // ISO date
  to: string;
  status: "approved" | "requested";
  hoursImpact: number;
}

export interface DutyRequest {
  id: string;
  nurseId: string;
  kind: RequestKind;
  detail: string;
  date: string;
  status: RequestStatus;
  submittedAt: string;
  policyNote?: string;
}

export interface ShiftAssignment {
  id: string;
  date: string; // ISO date
  shift: ShiftCode;
  dept: Department;
  nurseId: string;
  role: "charge" | "bedside" | "float";
  status: "draft" | "approved" | "published";
  breakPlanned: boolean;
  breakCovered: boolean;
}

export interface CoverageRequirement {
  dept: Department;
  shift: ShiftCode;
  requiredNurses: number;
  requiredCompetencies: { code: CompetencyCode; count: number }[];
  demand: DemandLevel;
  expectedDemand: DemandLevel;
}

/* --------------------------------------------------- institution policy */

export interface SchedulingPriority {
  key: string;
  label: string;
  rank: number;
}

/** Suggested default hierarchy — institutions reorder this in configuration. */
export const DEFAULT_PRIORITIES: SchedulingPriority[] = [
  { key: "safety", label: "Patient safety / required coverage", rank: 1 },
  { key: "competency", label: "Required competency / skill mix", rank: 2 },
  { key: "policy", label: "Institutional policy", rank: 3 },
  { key: "leave", label: "Approved leave", rank: 4 },
  { key: "recovery", label: "Minimum recovery requirements", rank: 5 },
  { key: "fairness", label: "Fairness", rank: 6 },
  { key: "preference", label: "Nurse preferences", rank: 7 },
  { key: "optimisation", label: "Operational optimisation", rank: 8 },
];

export interface SchedulingPolicy {
  code: string;
  title: string;
  shiftHours: number;
  maxConsecutiveShifts: number;
  maxConsecutiveNights: number;
  minRecoveryHours: number;
  nightToEarlyBlocked: boolean;
  maxWeeklyHours: number;
  overtimeRequiresConsent: boolean;
  weekendsPerFourWeeks: number;
  protectedBreakMinutes: number;
  leaveNoticeDays: number;
  shiftExchangeAllowed: boolean;
  dutyRequestWindowDays: number;
  autoPublish: false; // never
  priorities: SchedulingPriority[];
}

/** Seeded demo configuration — NOT a hardcoded universal rule set. */
export const DEMO_SCHEDULING_POLICY: SchedulingPolicy = {
  code: "SCH-01",
  title: "Nursing duty scheduling & recovery policy (demo configuration)",
  shiftHours: 8,
  maxConsecutiveShifts: 5,
  maxConsecutiveNights: 3,
  minRecoveryHours: 11,
  nightToEarlyBlocked: true,
  maxWeeklyHours: 48,
  overtimeRequiresConsent: true,
  weekendsPerFourWeeks: 2,
  protectedBreakMinutes: 30,
  leaveNoticeDays: 14,
  shiftExchangeAllowed: true,
  dutyRequestWindowDays: 21,
  autoPublish: false,
  priorities: DEFAULT_PRIORITIES,
};

/* ------------------------------------------------------------ role views */

export type SchedulingSection =
  | "overview"
  | "roster"
  | "generate"
  | "availability"
  | "requests"
  | "leaveImpact"
  | "patterns"
  | "recovery"
  | "skillMix"
  | "coverage"
  | "conflicts"
  | "aiRecommendations"
  | "approval"
  | "history"
  | "myRequests";

export type SchedulingView = "nurse" | "charge" | "manager" | "workforce_ops" | "governance";

export interface SchedulingViewConfig {
  label: string;
  focus: string;
  canApprove: boolean;
  sections: SchedulingSection[];
}

export const SCHEDULING_VIEWS: Record<SchedulingView, SchedulingViewConfig> = {
  nurse: {
    label: "My duty (nurse)",
    focus: "Your upcoming duty and your own requests. No unit-wide analytics.",
    canApprove: false,
    sections: ["myRequests"],
  },
  charge: {
    label: "Charge nurse (unit)",
    focus: "Unit coverage, skill mix, recovery concerns and conflicts for the current roster.",
    canApprove: false,
    sections: [
      "overview",
      "coverage",
      "roster",
      "skillMix",
      "conflicts",
      "recovery",
      "requests",
      "aiRecommendations",
    ],
  },
  manager: {
    label: "Nurse manager",
    focus: "Generate, review, adjust, approve and publish the duty schedule.",
    canApprove: true,
    sections: [
      "overview",
      "generate",
      "coverage",
      "roster",
      "skillMix",
      "conflicts",
      "recovery",
      "patterns",
      "requests",
      "availability",
      "leaveImpact",
      "aiRecommendations",
      "approval",
      "history",
    ],
  },
  workforce_ops: {
    label: "Workforce operations",
    focus: "Leave impact, availability, fairness distribution and staffing pressure.",
    canApprove: true,
    sections: [
      "overview",
      "coverage",
      "availability",
      "leaveImpact",
      "patterns",
      "requests",
      "aiRecommendations",
      "history",
    ],
  },
  governance: {
    label: "Governance / quality",
    focus: "Policy configuration, fairness signals, override records and change history.",
    canApprove: false,
    sections: ["overview", "patterns", "recovery", "conflicts", "history"],
  },
};

export function availableSchedulingViews(input: {
  role: Role;
  responsibilities: Responsibility[];
}): SchedulingView[] {
  const r = new Set(input.responsibilities);
  const views = new Set<SchedulingView>();
  views.add("nurse"); // every employee owns their own duty requests
  if (r.has("charge_nurse")) views.add("charge");
  if (r.has("nursing_admin")) {
    views.add("charge");
    views.add("manager");
  }
  if (r.has("hr")) views.add("workforce_ops");
  if (r.has("executive")) views.add("workforce_ops");
  if (r.has("quality")) views.add("governance");
  if (input.role === "admin" || r.has("institution_admin")) {
    (Object.keys(SCHEDULING_VIEWS) as SchedulingView[]).forEach((v) => views.add(v));
  }
  return Array.from(views);
}

/* --------------------------------------------------------------- helpers */

export const deptShort = (d: Department) => getDept(d).short;
export const deptTone = (d: Department) => getDept(d).color;

export function isoDay(offset: number, base = new Date()): string {
  const d = new Date(base);
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

export function dayLabel(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString([], { weekday: "short", day: "2-digit" });
}

export function isWeekend(iso: string): boolean {
  const day = new Date(`${iso}T00:00:00`).getDay();
  return day === 0 || day === 6;
}

/* ---------------------------------------------------------- demo dataset */

const NAMES = [
  "A. Fernandez", "M. Kurian", "S. Rahman", "J. Okoye", "L. Baptiste", "P. Menon",
  "R. Haddad", "T. Nguyen", "K. Abubakar", "D. Silva", "N. Joseph", "H. Farouk",
];

const COMPETENCY_POOL: CompetencyCode[][] = [
  ["icu", "acls"], ["ed", "acls"], ["cardiac"], ["paeds"], ["icu", "preceptor"],
  ["acls"], ["midwifery"], ["ed"], ["icu", "acls", "preceptor"], ["cardiac", "acls"],
  ["paeds", "preceptor"], [],
];

export function demoNurses(dept: Department): Nurse[] {
  return NAMES.map((name, i) => ({
    id: `n${i + 1}`,
    name,
    grade: i === 0 ? "CN" : i % 5 === 0 ? "SN" : i % 7 === 0 ? "EN" : "RN",
    dept,
    competencies: COMPETENCY_POOL[i] ?? [],
    contractedHours: i % 6 === 0 ? 24 : 40,
    preferences: {
      preferredShifts: i % 3 === 0 ? ["day"] : i % 3 === 1 ? ["evening"] : ["day", "evening"],
      avoidShifts: i % 4 === 0 ? ["night"] : [],
      ...(i % 4 === 0 ? { note: "School run — prefers no night duty on weekdays" } : {}),
    },
  }));
}

export function demoLeave(nurses: Nurse[]): LeaveRecord[] {
  return [
    { id: "l1", nurseId: nurses[2]!.id, type: "annual", from: isoDay(1), to: isoDay(6), status: "approved", hoursImpact: 40 },
    { id: "l2", nurseId: nurses[7]!.id, type: "sick", from: isoDay(0), to: isoDay(2), status: "approved", hoursImpact: 24 },
    { id: "l3", nurseId: nurses[9]!.id, type: "study", from: isoDay(3), to: isoDay(4), status: "approved", hoursImpact: 16 },
    { id: "l4", nurseId: nurses[4]!.id, type: "casual", from: isoDay(5), to: isoDay(5), status: "requested", hoursImpact: 8 },
  ];
}

export function demoRequests(nurses: Nurse[]): DutyRequest[] {
  return [
    { id: "r1", nurseId: nurses[1]!.id, kind: "day_off", detail: "Family commitment", date: isoDay(4), status: "under_review", submittedAt: isoDay(-3), policyNote: "Within duty-request window" },
    { id: "r2", nurseId: nurses[3]!.id, kind: "preferred_shift", detail: "Prefers evening duty", date: isoDay(2), status: "approved", submittedAt: isoDay(-5) },
    { id: "r3", nurseId: nurses[5]!.id, kind: "shift_exchange", detail: "Exchange night duty with A. Fernandez", date: isoDay(3), status: "submitted", submittedAt: isoDay(-1), policyNote: "Exchange permitted where both nurses hold required competency" },
    { id: "r4", nurseId: nurses[6]!.id, kind: "leave", detail: "Annual leave — 3 days", date: isoDay(9), status: "submitted", submittedAt: isoDay(-1) },
    { id: "r5", nurseId: nurses[8]!.id, kind: "availability", detail: "Available for additional evening duty", date: isoDay(1), status: "approved", submittedAt: isoDay(-6) },
    { id: "r6", nurseId: nurses[10]!.id, kind: "day_off", detail: "Personal", date: isoDay(2), status: "declined", submittedAt: isoDay(-4), policyNote: "Declined — minimum coverage on high-demand day" },
  ];
}

const DEMAND_BY_DAY: DemandLevel[] = ["high", "very_high", "high", "moderate", "high", "very_high", "moderate"];

export function demoRequirements(dept: Department, days: string[]): CoverageRequirement[] {
  const need = dept === "icu" ? [10, 8, 8] : dept === "ed" ? [9, 8, 6] : [8, 6, 5];
  const comp: CompetencyCode[] =
    dept === "icu" ? ["icu"] : dept === "ed" ? ["ed"] : dept === "pediatric" ? ["paeds"] : ["acls"];
  return days.flatMap((_, di) =>
    SHIFTS.map((s, si) => ({
      dept,
      shift: s.id,
      requiredNurses: need[si]! - (di % 3 === 2 ? 1 : 0),
      requiredCompetencies: comp.map((c) => ({ code: c, count: 2 })),
      demand: DEMAND_BY_DAY[di % 7]!,
      expectedDemand: DEMAND_BY_DAY[(di + 1) % 7]!,
    })),
  );
}

export function demoRoster(dept: Department, nurses: Nurse[], days: string[]): ShiftAssignment[] {
  const out: ShiftAssignment[] = [];
  let k = 0;
  days.forEach((date, di) => {
    SHIFTS.forEach((s, si) => {
      const count = s.id === "night" ? 4 : s.id === "evening" ? 5 : 6;
      for (let i = 0; i < count; i++) {
        const nurse = nurses[(di * 3 + si * 2 + i * 5) % nurses.length]!;
        out.push({
          id: `a${++k}`,
          date,
          shift: s.id,
          dept,
          nurseId: nurse.id,
          role: i === 0 ? "charge" : i === count - 1 && di % 3 === 0 ? "float" : "bedside",
          status: di < 2 ? "published" : "draft",
          breakPlanned: true,
          breakCovered: !(di % 4 === 1 && s.id === "night"),
        });
      }
    });
  });
  return out;
}

/* --------------------------------------------------------------- ANALYSIS */

export interface CoverageResult {
  date: string;
  shift: ShiftCode;
  required: number;
  scheduled: number;
  gap: number;
  demand: DemandLevel;
  expectedDemand: DemandLevel;
  competency: { code: CompetencyCode; required: number; available: number }[];
  capabilityAtRisk: boolean;
}

export function analyseCoverage(
  reqs: CoverageRequirement[],
  roster: ShiftAssignment[],
  nurses: Nurse[],
  leave: LeaveRecord[],
  days: string[],
): CoverageResult[] {
  const byId = new Map(nurses.map((n) => [n.id, n]));
  const onLeave = (nurseId: string, date: string) =>
    leave.some((l) => l.nurseId === nurseId && l.status === "approved" && date >= l.from && date <= l.to);

  return days.flatMap((date, di) =>
    SHIFTS.map((s) => {
      const req = reqs[di * SHIFTS.length + SHIFTS.indexOf(s)]!;
      const assigned = roster.filter((a) => a.date === date && a.shift === s.id && !onLeave(a.nurseId, date));
      const competency = req.requiredCompetencies.map((rc) => ({
        code: rc.code,
        required: rc.count,
        available: assigned.filter((a) => byId.get(a.nurseId)?.competencies.includes(rc.code)).length,
      }));
      return {
        date,
        shift: s.id,
        required: req.requiredNurses,
        scheduled: assigned.length,
        gap: Math.max(0, req.requiredNurses - assigned.length),
        demand: req.demand,
        expectedDemand: req.expectedDemand,
        competency,
        capabilityAtRisk: competency.some((c) => c.available < c.required),
      };
    }),
  );
}

export type ConflictKind =
  | "coverage_gap"
  | "skill_mix"
  | "recovery"
  | "consecutive"
  | "night_to_early"
  | "leave_conflict"
  | "break_uncovered"
  | "preference";

export const CONFLICT_LABEL: Record<ConflictKind, string> = {
  coverage_gap: "Coverage gap",
  skill_mix: "Skill-mix gap",
  recovery: "Recovery concern",
  consecutive: "Consecutive-duty burden",
  night_to_early: "Night → early transition",
  leave_conflict: "Leave conflict",
  break_uncovered: "Break coverage",
  preference: "Preference not met",
};

export type Severity = "info" | "review" | "high";

export interface ScheduleConflict {
  id: string;
  kind: ConflictKind;
  severity: Severity;
  date: string;
  shift?: ShiftCode;
  nurseId?: string;
  message: string;
  policyRef?: string;
}

const shiftIndex: Record<ShiftCode, number> = { day: 0, evening: 1, night: 2 };

export function analyseConflicts(
  coverage: CoverageResult[],
  roster: ShiftAssignment[],
  nurses: Nurse[],
  leave: LeaveRecord[],
  policy: SchedulingPolicy,
  days: string[],
): ScheduleConflict[] {
  const out: ScheduleConflict[] = [];
  const byId = new Map(nurses.map((n) => [n.id, n]));
  let k = 0;
  const id = () => `c${++k}`;

  coverage.forEach((c) => {
    if (c.gap > 0) {
      out.push({
        id: id(),
        kind: "coverage_gap",
        severity: c.demand === "very_high" ? "high" : "review",
        date: c.date,
        shift: c.shift,
        message: `${c.gap} nurse${c.gap > 1 ? "s" : ""} below configured minimum (${c.scheduled}/${c.required}) with ${c.demand.replace("_", " ")} patient demand.`,
        policyRef: "Staffing minimums",
      });
    }
    c.competency
      .filter((x) => x.available < x.required)
      .forEach((x) =>
        out.push({
          id: id(),
          kind: "skill_mix",
          severity: "high",
          date: c.date,
          shift: c.shift,
          message: `${COMPETENCY_LABEL[x.code]} coverage limited (${x.available}/${x.required}) — staffing count may be numerically adequate while capability is at risk.`,
          policyRef: "Competency requirements",
        }),
      );
  });

  // Per-nurse sequence analysis: recovery, consecutive duties, night→early.
  nurses.forEach((n) => {
    const mine = roster
      .filter((a) => a.nurseId === n.id)
      .sort((a, b) => (a.date === b.date ? shiftIndex[a.shift] - shiftIndex[b.shift] : a.date < b.date ? -1 : 1));
    let consecutive = 0;
    let nights = 0;
    let prev: ShiftAssignment | null = null;
    mine.forEach((a) => {
      if (prev) {
        const dayDiff =
          (new Date(`${a.date}T00:00:00`).getTime() - new Date(`${prev.date}T00:00:00`).getTime()) / 86400000;
        consecutive = dayDiff <= 1 ? consecutive + 1 : 1;
        if (policy.nightToEarlyBlocked && prev.shift === "night" && a.shift === "day" && dayDiff <= 1) {
          out.push({
            id: id(),
            kind: "night_to_early",
            severity: "high",
            date: a.date,
            shift: a.shift,
            nurseId: n.id,
            message: `Night duty followed by an early day duty. Scheduling pattern may increase recovery burden.`,
            policyRef: `Minimum recovery ${policy.minRecoveryHours}h`,
          });
        } else if (dayDiff <= 1 && shiftIndex[a.shift] < shiftIndex[prev.shift]) {
          out.push({
            id: id(),
            kind: "recovery",
            severity: "review",
            date: a.date,
            shift: a.shift,
            nurseId: n.id,
            message: `Backward shift rotation with less than ${policy.minRecoveryHours}h recovery interval.`,
            policyRef: "Recovery interval",
          });
        }
      } else consecutive = 1;
      nights = a.shift === "night" ? nights + 1 : 0;
      if (consecutive === policy.maxConsecutiveShifts + 1) {
        out.push({
          id: id(),
          kind: "consecutive",
          severity: "review",
          date: a.date,
          nurseId: n.id,
          message: `More than ${policy.maxConsecutiveShifts} consecutive duties in this roster period.`,
          policyRef: "Maximum consecutive shifts",
        });
      }
      if (nights === policy.maxConsecutiveNights + 1) {
        out.push({
          id: id(),
          kind: "recovery",
          severity: "high",
          date: a.date,
          nurseId: n.id,
          message: `More than ${policy.maxConsecutiveNights} consecutive night duties.`,
          policyRef: "Night-shift rules",
        });
      }
      if (n.preferences.avoidShifts.includes(a.shift)) {
        out.push({
          id: id(),
          kind: "preference",
          severity: "info",
          date: a.date,
          shift: a.shift,
          nurseId: n.id,
          message: `${n.name} has requested to avoid ${a.shift} duty. Preference not met on this date.`,
        });
      }
      const clash = leave.find(
        (l) => l.nurseId === n.id && l.status === "approved" && a.date >= l.from && a.date <= l.to,
      );
      if (clash) {
        out.push({
          id: id(),
          kind: "leave_conflict",
          severity: "high",
          date: a.date,
          shift: a.shift,
          nurseId: n.id,
          message: `Scheduled during approved ${LEAVE_LABEL[clash.type].toLowerCase()}. Approved leave is never cancelled automatically.`,
          policyRef: "Approved leave",
        });
      }
      prev = a;
    });
  });

  roster
    .filter((a) => !a.breakCovered)
    .forEach((a) =>
      out.push({
        id: id(),
        kind: "break_uncovered",
        severity: "review",
        date: a.date,
        shift: a.shift,
        nurseId: a.nurseId,
        message: `Protected ${policy.protectedBreakMinutes}-minute meal period has no assigned break cover.`,
        policyRef: "Break rules",
      }),
    );

  void byId;
  void days;
  return out;
}

export interface FairnessRow {
  nurseId: string;
  nights: number;
  weekends: number;
  totalShifts: number;
  hours: number;
  overtimeHours: number;
  signal: "balanced" | "watch" | "review";
}

export function analyseFairness(roster: ShiftAssignment[], nurses: Nurse[], policy: SchedulingPolicy): FairnessRow[] {
  const rows = nurses.map((n) => {
    const mine = roster.filter((a) => a.nurseId === n.id);
    const nights = mine.filter((a) => a.shift === "night").length;
    const weekends = mine.filter((a) => isWeekend(a.date)).length;
    const hours = mine.length * policy.shiftHours;
    const weeklyCap = Math.round((n.contractedHours / 40) * policy.maxWeeklyHours);
    return {
      nurseId: n.id,
      nights,
      weekends,
      totalShifts: mine.length,
      hours,
      overtimeHours: Math.max(0, hours - weeklyCap),
      signal: "balanced" as FairnessRow["signal"],
    };
  });
  const avgNights = rows.reduce((s, r) => s + r.nights, 0) / Math.max(1, rows.length);
  return rows.map((r) => ({
    ...r,
    signal:
      r.nights >= avgNights + 2 || r.overtimeHours > 8 ? "review" : r.nights >= avgNights + 1 ? "watch" : "balanced",
  }));
}

export interface RecoverySignalRow {
  nurseId: string;
  label: string;
  tone: Severity;
  detail: string;
}

export function recoverySignals(conflicts: ScheduleConflict[], nurses: Nurse[]): RecoverySignalRow[] {
  return nurses
    .map((n) => {
      const mine = conflicts.filter(
        (c) => c.nurseId === n.id && (c.kind === "recovery" || c.kind === "night_to_early" || c.kind === "consecutive"),
      );
      if (!mine.length) return { nurseId: n.id, label: "Recovery adequate", tone: "info" as Severity, detail: "No recovery concern flagged in this roster period." };
      const high = mine.some((c) => c.severity === "high");
      return {
        nurseId: n.id,
        label: high ? "Recovery needs attention" : "Pattern requires review",
        tone: high ? ("high" as Severity) : ("review" as Severity),
        detail: mine.map((c) => c.message).join(" "),
      };
    })
    .sort((a, b) => (a.tone === b.tone ? 0 : a.tone === "high" ? -1 : b.tone === "high" ? 1 : a.tone === "review" ? -1 : 1));
}

export interface LeaveImpactRow {
  dept: Department;
  approvedRequests: number;
  hoursLost: number;
  competenciesAffected: CompetencyCode[];
  demandWindow: DemandLevel;
  note: string;
}

export function analyseLeaveImpact(leave: LeaveRecord[], nurses: Nurse[], dept: Department): LeaveImpactRow {
  const approved = leave.filter((l) => l.status === "approved");
  const byId = new Map(nurses.map((n) => [n.id, n]));
  const comps = new Set<CompetencyCode>();
  approved.forEach((l) => byId.get(l.nurseId)?.competencies.forEach((c) => comps.add(c)));
  const hours = approved.reduce((s, l) => s + l.hoursImpact, 0);
  return {
    dept,
    approvedRequests: approved.length,
    hoursLost: hours,
    competenciesAffected: Array.from(comps),
    demandWindow: "high",
    note: `${approved.length} approved leave request${approved.length === 1 ? "" : "s"} may reduce ${deptShort(dept)} capacity by ${hours} nursing hours during the projected high-demand period.`,
  };
}

/* ------------------------------------------------- AI prototype guidance */

export interface SchedulingRecommendation {
  id: string;
  title: string;
  rationale: string;
  basedOn: string[];
  options: string[];
  severity: Severity;
}

export function schedulingRecommendations(input: {
  coverage: CoverageResult[];
  conflicts: ScheduleConflict[];
  fairness: FairnessRow[];
  leaveImpact: LeaveImpactRow;
  nurses: Nurse[];
}): SchedulingRecommendation[] {
  const { coverage, conflicts, fairness, leaveImpact, nurses } = input;
  const out: SchedulingRecommendation[] = [];
  const byId = new Map(nurses.map((n) => [n.id, n]));

  const worstGap = [...coverage].sort((a, b) => b.gap - a.gap)[0];
  if (worstGap && worstGap.gap > 0) {
    out.push({
      id: "rec-gap",
      title: `Potential ${worstGap.gap} RN capacity gap — ${dayLabel(worstGap.date)} ${worstGap.shift} shift`,
      rationale: `Patient demand ${worstGap.demand.replace("_", " ")}, expected ${worstGap.expectedDemand.replace("_", " ")}. Required ${worstGap.required} nurses, currently scheduled ${worstGap.scheduled}. All constraints cannot currently be satisfied simultaneously.`,
      basedOn: ["Nursing demand (Workforce Intelligence)", "Approved leave", "Configured staffing minimums"],
      options: [
        "Review qualified float availability",
        "Review voluntary additional staffing (consent required)",
        "Review assignment distribution across the unit",
        "Review approved shift exchange options",
        "Escalate according to institutional policy",
      ],
      severity: "high",
    });
  }

  const skill = conflicts.find((c) => c.kind === "skill_mix");
  if (skill) {
    out.push({
      id: "rec-skill",
      title: "Capability at risk while staffing count is met",
      rationale: `${skill.message} Numerical adequacy does not guarantee required competency coverage.`,
      basedOn: ["Governed competency layer (Employee Growth)", "Unit competency requirements"],
      options: [
        "Reassign a qualified nurse from an over-covered shift",
        "Pair a preceptor with a developing nurse for supervised cover",
        "Review qualified float pool availability",
      ],
      severity: "high",
    });
  }

  const rec = conflicts.find((c) => c.kind === "night_to_early" || c.kind === "recovery");
  if (rec) {
    const n = rec.nurseId ? byId.get(rec.nurseId) : undefined;
    out.push({
      id: "rec-recovery",
      title: `Recovery concern${n ? ` — ${n.name}` : ""}`,
      rationale: `${rec.message} Reviewing this transition may reduce avoidable recovery burden; FROMEX cannot prevent circadian disruption.`,
      basedOn: ["Institution recovery rules", "Roster sequence analysis"],
      options: ["Review this transition", "Offer an alternative shift within the same period", "Accept with documented reason"],
      severity: "review",
    });
  }

  const unfair = fairness.filter((f) => f.signal === "review");
  if (unfair.length) {
    out.push({
      id: "rec-fairness",
      title: "Uneven distribution of night and weekend duty",
      rationale: `${unfair.length} nurse${unfair.length === 1 ? " is" : "s are"} carrying a higher share of night, weekend or additional duty in this period. This is a schedule-distribution signal, not an employee performance measure.`,
      basedOn: ["Roster distribution", "Configured weekend rules"],
      options: ["Rebalance night duty across the eligible pool", "Review overtime consent records", "Discuss with affected nurses before adjusting"],
      severity: "review",
    });
  }

  out.push({
    id: "rec-leave",
    title: "Leave impact on projected capacity",
    rationale: leaveImpact.note,
    basedOn: ["Approved leave register", "Demand forecast (Workforce Intelligence)"],
    options: ["Review coverage before finalising the schedule", "Plan float allocation for the affected days", "Confirm competency cover for affected skills"],
    severity: "review",
  });

  return out;
}

/* ------------------------------------------------------ decisions / audit */

export type ScheduleStage = "draft" | "analysed" | "reviewed" | "approved" | "published";

export const STAGE_LABEL: Record<ScheduleStage, string> = {
  draft: "Draft",
  analysed: "AI Prototype analysis",
  reviewed: "Conflict review",
  approved: "Approved",
  published: "Published",
};

export const STAGE_ORDER: ScheduleStage[] = ["draft", "analysed", "reviewed", "approved", "published"];

export type DecisionKind = "accepted" | "declined" | "modified" | "overridden";

export interface SchedulingDecision {
  recommendationId: string;
  kind: DecisionKind;
  reason: string;
  decidedBy: string;
  decidedAt: string;
}

export interface ChangeEntry {
  id: string;
  at: string;
  actor: string;
  action: string;
  detail: string;
}

export function demoChangeHistory(): ChangeEntry[] {
  return [
    { id: "h1", at: isoDay(-4), actor: "Nurse Manager", action: "Schedule generated", detail: "Draft roster created for 7-day period from demand and availability signals." },
    { id: "h2", at: isoDay(-3), actor: "AI Prototype", action: "Analysis completed", detail: "4 conflicts, 2 recovery concerns and 1 skill-mix gap identified." },
    { id: "h3", at: isoDay(-3), actor: "Charge Nurse", action: "Conflict reviewed", detail: "Night → early transition on Wed reassigned after discussion with the nurse." },
    { id: "h4", at: isoDay(-2), actor: "Nurse Manager", action: "Duty request approved", detail: "Preferred evening duty approved where coverage permitted." },
    { id: "h5", at: isoDay(-2), actor: "Nurse Manager", action: "Schedule approved & published", detail: "First two days published; remaining days remain in draft pending review." },
  ];
}
