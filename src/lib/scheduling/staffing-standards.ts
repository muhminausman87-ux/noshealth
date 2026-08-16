/**
 * Nursing Staffing Standards Library + workload-based staffing calculation.
 *
 * Ratios are configurable examples, NOT universal hard-coded law:
 *   Required Workforce = Staffing Standard + Workload/Acuity Adjustment + Skill Mix Requirement
 */

export interface StaffingStandard {
  id: string;
  unit: string;
  nursePerBeds: number; // e.g. 6 => 1 nurse : 6 beds
  minSeniorPerShift: number;
  source: string;
  authority: string;
  accreditation?: string;
  configurable: true;
  verified: boolean;
}

export const DEFAULT_STAFFING_STANDARDS: StaffingStandard[] = [
  { id: "std-ward", unit: "General ward", nursePerBeds: 6, minSeniorPerShift: 1, source: "Indian Nursing Council staffing norms (example value — configurable)", authority: "Indian Nursing Council", configurable: true, verified: false },
  { id: "std-icu", unit: "ICU", nursePerBeds: 1, minSeniorPerShift: 2, source: "Indian Nursing Council staffing norms (example value — configurable)", authority: "Indian Nursing Council", configurable: true, verified: false },
  { id: "std-hdu", unit: "HDU", nursePerBeds: 2, minSeniorPerShift: 1, source: "Indian Nursing Council staffing norms (example value — configurable)", authority: "Indian Nursing Council", configurable: true, verified: false },
  { id: "std-nicu", unit: "NICU", nursePerBeds: 2, minSeniorPerShift: 1, source: "Institution-approved neonatal staffing policy", authority: "Institution", configurable: true, verified: false },
  { id: "std-picu", unit: "PICU", nursePerBeds: 1, minSeniorPerShift: 1, source: "Institution-approved paediatric critical-care policy", authority: "Institution", configurable: true, verified: false },
  { id: "std-sncu", unit: "SNCU", nursePerBeds: 3, minSeniorPerShift: 1, source: "Institution-approved SNCU policy", authority: "Institution", configurable: true, verified: false },
  { id: "std-ed", unit: "Emergency", nursePerBeds: 3, minSeniorPerShift: 1, source: "Institution-approved emergency staffing establishment", authority: "Institution", configurable: true, verified: false },
  { id: "std-ot", unit: "Operation theatre", nursePerBeds: 1, minSeniorPerShift: 1, source: "Institution-approved OT staffing establishment", authority: "Institution", configurable: true, verified: false },
  { id: "std-labour", unit: "Labour room", nursePerBeds: 2, minSeniorPerShift: 1, source: "Institution-approved labour-room policy", authority: "Institution", configurable: true, verified: false },
  { id: "std-spec", unit: "Speciality unit", nursePerBeds: 4, minSeniorPerShift: 1, source: "Institution-approved speciality staffing policy", authority: "Institution", configurable: true, verified: false },
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
