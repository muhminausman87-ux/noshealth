/**
 * NOS AI Nursing Duty Scheduling Engine — data model.
 *
 * Nothing here hard-codes a national duty-hour rule. Every legal/regulatory
 * value is a configurable institutional constraint carrying its own reference
 * text, so each institution declares the policy that governs its rosters.
 */
import type { Department } from "@/lib/departments";

export type ShiftKind = "working" | "off" | "leave" | "oncall";

export interface ShiftType {
  code: string; // institution-customisable, e.g. "M"
  label: string;
  start: string; // HH:MM
  end: string; // HH:MM
  hours: number;
  kind: ShiftKind;
  /** Night shifts drive circadian and night-duty rules. */
  night?: boolean;
  countsAsDuty?: boolean;
}

export interface DeptRequirement {
  dept: Department;
  shiftCode: string;
  minNurses: number;
  minSenior: number;
  requiredCompetency?: CompetencyCode;
  nursePatientRatio?: string;
}

export type CompetencyCode =
  | "icu"
  | "ed"
  | "paeds"
  | "midwifery"
  | "cardiac"
  | "acls"
  | "preceptor";

export const COMPETENCY_LABEL: Record<CompetencyCode, string> = {
  icu: "Critical care (ICU)",
  ed: "Emergency care",
  paeds: "Paediatrics",
  midwifery: "Midwifery",
  cardiac: "Cardiac care",
  acls: "ACLS",
  preceptor: "Preceptor",
};

/** A configured rule may cite a source; uncertain ones must be flagged. */
export interface RuleSource {
  reference: string;
  verified: boolean; // false => "Requires institutional/legal verification"
}

export interface SchedulingPolicy {
  id: string;
  name: string;
  version: string;
  institution: string;
  effectiveFrom: string;
  shiftTypes: ShiftType[];
  maxHoursPerDay: number;
  maxHoursPerWeek: number;
  minRestHoursBetweenShifts: number;
  maxConsecutiveWorkDays: number;
  maxConsecutiveNights: number;
  minDaysOffPerWeek: number;
  maxNightsPerMonth: number;
  weekendDutiesPerMonth: number;
  overtimeAllowed: boolean;
  maxOvertimeHoursPerMonth: number;
  breakMinutesPerShift: number;
  breakMustBeCovered: boolean;
  requirements: DeptRequirement[];
  leaveIsHardConstraint: boolean;
  swapsRequireApproval: boolean;
  emergencyOverrideAllowed: boolean;
  restrictions: string[];
  sources: Record<string, RuleSource>;
}

export interface NurseProfile {
  id: string;
  name: string;
  designation: string;
  dept: Department;
  grade: "Charge Nurse" | "Senior Nurse" | "Staff Nurse" | "Enrolled Nurse";
  senior: boolean;
  qualification: string;
  competencies: CompetencyCode[];
  certifications: string[];
  experienceYears: number;
  employment: "full_time" | "part_time" | "prn";
  contractedHoursPerWeek: number;
  availableDays: number[]; // 0=Sun..6=Sat
  preferredShifts: string[];
  preferredOffDays: number[];
  restrictions: string[];
  history: { nightsLast30: number; weekendsLast30: number; hoursLast7: number; lastShiftCode?: string };
}

export type RequestKind =
  | "preferred_duty"
  | "preferred_off"
  | "leave"
  | "cannot_work"
  | "preferred_department"
  | "preferred_shift_type";

export const REQUEST_KIND_LABEL: Record<RequestKind, string> = {
  preferred_duty: "Preferred duty",
  preferred_off: "Preferred OFF",
  leave: "Leave",
  cannot_work: "Cannot work",
  preferred_department: "Preferred department",
  preferred_shift_type: "Preferred shift type",
};

export type RequestStatus = "submitted" | "approved" | "declined";

export interface DutyRequest {
  id: string;
  nurseId: string;
  kind: RequestKind;
  date?: string;
  dateTo?: string;
  shiftCode?: string;
  reason?: string;
  status: RequestStatus;
  submittedAt: string;
  outcome?: string; // filled by the engine after generation
}

export type ExceptionSeverity = "critical" | "high" | "moderate" | "info";

export interface ScheduleException {
  id: string;
  severity: ExceptionSeverity;
  category: string;
  date?: string;
  shiftCode?: string;
  nurseId?: string;
  message: string;
  overridden?: { by: string; reason: string; at: string };
}

export interface CoverageRow {
  date: string;
  shiftCode: string;
  required: number;
  scheduled: number;
  requiredSenior: number;
  scheduledSenior: number;
  competency?: CompetencyCode;
  competencyMet: boolean;
}

export interface NurseSummary {
  nurseId: string;
  totalHours: number;
  duties: number;
  nights: number;
  weekends: number;
  offDays: number;
  leaveDays: number;
  overtimeHours: number;
  flags: string[];
  offRequestsGranted: number;
  offRequestsTotal: number;
  dutyRequestsGranted: number;
  dutyRequestsTotal: number;
}

export interface QualityComponent {
  key: string;
  label: string;
  weight: number;
  score: number; // 0..100
  note: string;
}

export interface ScheduleQuality {
  score: number;
  components: QualityComponent[];
}

export interface AuditEntry {
  id: string;
  at: string;
  actor: string;
  action: string;
  detail: string;
  policyVersion: string;
}

export interface Roster {
  id: string;
  month: string; // YYYY-MM
  dept: Department;
  unit: string;
  policyId: string;
  policyVersion: string;
  dates: string[];
  /** nurseId -> date -> shift code */
  cells: Record<string, Record<string, string>>;
  nurseIds: string[];
  exceptions: ScheduleException[];
  explanations: { title: string; body: string }[];
  coverage: CoverageRow[];
  summaries: NurseSummary[];
  quality: ScheduleQuality;
  status: "draft" | "approved" | "published";
  generatedAt: string;
  generatedBy: string;
}

export interface ValidationResult {
  level: "ok" | "warning" | "blocked";
  messages: string[];
}
