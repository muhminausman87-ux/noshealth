import type { Department } from "@/lib/departments";
import type { SchedulingPolicy, ShiftType } from "./types";

export const DEFAULT_SHIFT_TYPES: ShiftType[] = [
  { code: "M", label: "Morning", start: "07:00", end: "14:00", hours: 7, kind: "working", countsAsDuty: true },
  { code: "E", label: "Evening", start: "14:00", end: "21:00", hours: 7, kind: "working", countsAsDuty: true },
  { code: "N", label: "Night", start: "21:00", end: "07:00", hours: 10, kind: "working", night: true, countsAsDuty: true },
  { code: "D", label: "Long day", start: "08:00", end: "20:00", hours: 12, kind: "working", countsAsDuty: true },
  { code: "OC", label: "On call", start: "00:00", end: "00:00", hours: 0, kind: "oncall" },
  { code: "OFF", label: "Off duty", start: "", end: "", hours: 0, kind: "off" },
  { code: "WO", label: "Weekly off", start: "", end: "", hours: 0, kind: "off" },
  { code: "AL", label: "Annual leave", start: "", end: "", hours: 0, kind: "leave" },
  { code: "SL", label: "Sick leave", start: "", end: "", hours: 0, kind: "leave" },
];

export const ROSTERED_SHIFT_CODES = ["M", "E", "N"];

/**
 * A worked example of an institution's *own* approved policy. Values are
 * editable; regulatory items carry a reference and a verification flag rather
 * than an invented national rule.
 */
export function defaultPolicy(dept: Department, institution = "Demo Institution"): SchedulingPolicy {
  return {
    id: "pol-demo",
    name: `${institution} Nursing Duty Policy`,
    version: "v1.0",
    institution,
    effectiveFrom: new Date().toISOString().slice(0, 10),
    shiftTypes: DEFAULT_SHIFT_TYPES,
    maxHoursPerDay: 12,
    maxHoursPerWeek: 48,
    minRestHoursBetweenShifts: 11,
    maxConsecutiveWorkDays: 6,
    maxConsecutiveNights: 3,
    minDaysOffPerWeek: 1,
    maxNightsPerMonth: 8,
    weekendDutiesPerMonth: 2,
    overtimeAllowed: true,
    maxOvertimeHoursPerMonth: 16,
    breakMinutesPerShift: 30,
    breakMustBeCovered: true,
    leaveIsHardConstraint: true,
    swapsRequireApproval: true,
    emergencyOverrideAllowed: true,
    restrictions: [
      "Newly qualified nurses are not rostered as the sole senior on a night shift.",
      "Night duty is not assigned within 24 hours of returning from approved leave.",
    ],
    requirements: [
      { dept, shiftCode: "M", minNurses: 5, minSenior: 2, requiredCompetency: competencyFor(dept), nursePatientRatio: "1:6" },
      { dept, shiftCode: "E", minNurses: 4, minSenior: 1, requiredCompetency: competencyFor(dept), nursePatientRatio: "1:8" },
      { dept, shiftCode: "N", minNurses: 3, minSenior: 1, requiredCompetency: competencyFor(dept), nursePatientRatio: "1:10" },
    ],
    sources: {
      maxHoursPerWeek: {
        reference:
          "Institutional HR policy, aligned to the working-hours limit adopted by the institution. Jurisdictional statutory limits vary.",
        verified: false,
      },
      minRestHoursBetweenShifts: {
        reference:
          "Institution-adopted rest interval; commonly cited occupational-health guidance recommends a continuous rest period between duties.",
        verified: false,
      },
      maxConsecutiveNights: {
        reference: "Institution fatigue-management policy (nursing administration approved).",
        verified: true,
      },
      breakMinutesPerShift: {
        reference: "Institution break policy for nursing duty.",
        verified: true,
      },
      requirements: {
        reference: "Department staffing establishment approved by nursing administration.",
        verified: true,
      },
    },
  };
}

function competencyFor(dept: Department) {
  if (dept === "icu") return "icu" as const;
  if (dept === "ed") return "ed" as const;
  if (dept === "pediatric") return "paeds" as const;
  if (dept === "labour" || dept === "maternity") return "midwifery" as const;
  if (dept === "cardiac") return "cardiac" as const;
  return undefined;
}

export const shiftByCode = (policy: SchedulingPolicy, code: string) =>
  policy.shiftTypes.find((s) => s.code === code);

export const isWorking = (policy: SchedulingPolicy, code: string) =>
  shiftByCode(policy, code)?.kind === "working";

export const isNight = (policy: SchedulingPolicy, code: string) =>
  Boolean(shiftByCode(policy, code)?.night);
