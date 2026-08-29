/**
 * Nursing Staffing Standards Library + workload-based staffing calculation.
 *
 * Ratios are configurable examples, NOT universal hard-coded law:
 *   Required Workforce = Staffing Standard + Workload/Acuity Adjustment + Skill Mix Requirement
 */

export type SourceType =
  | "Institution Policy"
  | "Regulatory Reference"
  | "Accreditation Requirement"
  | "Evidence Reference"
  | "Local Configuration"
  | "Pending Verification";

export type StandardStatus = "pending" | "active" | "draft" | "expired" | "review";

export interface StaffingStandard {
  id: string;
  unit: string;
  nursePerBeds: number; // e.g. 6 => 1 nurse : 6 beds
  minSeniorPerShift: number;
  source: string;
  authority: string;
  sourceType?: SourceType;
  status?: StandardStatus;
  appliesTo?: string[];
  effectiveFrom?: string;
  lastReviewed?: string;
  approvedBy?: string;
  accreditation?: string;
  configurable: true;
  verified: boolean;
}

const demo = (
  id: string,
  unit: string,
  nursePerBeds: number,
  minSeniorPerShift: number,
  source: string,
  sourceType: SourceType,
): StaffingStandard => ({
  id,
  unit,
  nursePerBeds,
  minSeniorPerShift,
  source,
  authority: "Institution",
  sourceType,
  status: "pending",
  appliesTo: ["Day shift", "Night shift"],
  configurable: true,
  verified: false,
});

export const DEFAULT_STAFFING_STANDARDS: StaffingStandard[] = [
  demo("std-ward", "General ward", 6, 1, "Example configuration — institution-approved general ward staffing policy", "Local Configuration"),
  demo("std-icu", "ICU", 1, 2, "Institution-approved ICU staffing policy", "Institution Policy"),
  demo("std-hdu", "HDU", 2, 1, "Institution-approved high-dependency staffing policy", "Institution Policy"),
  demo("std-nicu", "NICU", 2, 1, "Institution-approved neonatal staffing policy", "Institution Policy"),
  demo("std-picu", "PICU", 1, 1, "Institution-approved paediatric critical-care policy", "Institution Policy"),
  demo("std-sncu", "SNCU", 3, 1, "Institution-approved SNCU policy", "Institution Policy"),
  demo("std-ed", "Emergency", 3, 1, "Institution-approved emergency staffing establishment", "Institution Policy"),
  demo("std-ot", "Operation theatre", 1, 1, "Institution-approved OT staffing establishment", "Institution Policy"),
  demo("std-labour", "Labour room", 2, 1, "Institution-approved labour-room policy", "Institution Policy"),
  demo("std-spec", "Speciality unit", 4, 1, "Institution-approved speciality staffing policy", "Institution Policy"),
];


export interface WorkloadInputs {
  beds: number;
  census: number;
  admissions: number;
  discharges: number;
  transfers: number;
  procedures: number;
  isolationPatients: number;
  oneToOnePatients: number;
  highDependencyPatients: number;
  emergencyWorkloadIndex: number; // 0..10
  turnoverIndex: number; // 0..10
}

export const DEFAULT_WORKLOAD: WorkloadInputs = {
  beds: 24,
  census: 21,
  admissions: 5,
  discharges: 4,
  transfers: 2,
  procedures: 6,
  isolationPatients: 2,
  oneToOnePatients: 1,
  highDependencyPatients: 4,
  emergencyWorkloadIndex: 4,
  turnoverIndex: 5,
};

export interface StaffingCalculation {
  baseFromStandard: number;
  workloadAdjustment: number;
  skillMixRequirement: number;
  requiredPerShift: number;
  drivers: { label: string; value: number }[];
}

/** Deterministic, fully explainable. No opaque model. */
export function calculateRequiredWorkforce(
  std: StaffingStandard,
  w: WorkloadInputs,
  minSeniorPerShift = std.minSeniorPerShift,
): StaffingCalculation {
  const base = Math.ceil(Math.max(w.census, 1) / Math.max(std.nursePerBeds, 0.5));

  const drivers = [
    { label: "1:1 patients", value: w.oneToOnePatients * 1 },
    { label: "High-dependency patients", value: w.highDependencyPatients * 0.25 },
    { label: "Isolation patients", value: w.isolationPatients * 0.2 },
    { label: "Admissions / discharges / transfers", value: (w.admissions + w.discharges + w.transfers) * 0.12 },
    { label: "Procedures", value: w.procedures * 0.1 },
    { label: "Emergency workload", value: w.emergencyWorkloadIndex * 0.15 },
    { label: "Patient turnover", value: w.turnoverIndex * 0.1 },
  ];
  const workloadAdjustment = Math.round(drivers.reduce((a, d) => a + d.value, 0) * 10) / 10;
  const skillMixRequirement = minSeniorPerShift;
  const requiredPerShift = Math.max(minSeniorPerShift, Math.ceil(base + workloadAdjustment));

  return {
    baseFromStandard: base,
    workloadAdjustment,
    skillMixRequirement,
    requiredPerShift,
    drivers: drivers.map((d) => ({ ...d, value: Math.round(d.value * 10) / 10 })),
  };
}
