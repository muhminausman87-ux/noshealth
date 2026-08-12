/**
 * FROMEX Phase 3 — Nursing Workforce Intelligence model.
 *
 * PATIENT ACUITY → NURSING DEMAND → CARE COMPLEXITY + TIME-SENSITIVE WORKLOAD →
 * NURSING CAPACITY → INDIVIDUAL WORKLOAD → PREDICTED DEMAND → CAPACITY RISK →
 * AI RECOMMENDATION → POLICY ESCALATION → HUMAN DECISION → OUTCOME →
 * GOVERNED INSTITUTIONAL LEARNING
 *
 * Everything here is transparent, rules-based **prototype logic**. It is not a
 * trained model and not clinically validated. Thresholds, escalation chains and
 * communication pathways are institution-configurable; the values below are
 * demo configuration only.
 *
 * PERSISTENCE: this phase ships isolated seeded demo data so the flow can be
 * evaluated end to end. See TODO(persistence) markers for the Supabase-backed
 * follow-up — no existing table, RLS policy or route is changed by this module.
 */
import type { Department } from "./departments";
import { getDept } from "./departments";
import type { Responsibility } from "./access";
import type { Role } from "./auth";

export type DemandLevel = "low" | "moderate" | "high" | "very_high";
export type CapacityLevel = "adequate" | "watch" | "strained" | "critical";

export const DEMAND_LABEL: Record<DemandLevel, string> = {
  low: "Low",
  moderate: "Moderate",
  high: "High",
  very_high: "Very high",
};

export const CAPACITY_LABEL: Record<CapacityLevel, string> = {
  adequate: "Adequate",
  watch: "Watch",
  strained: "Strained",
  critical: "Critical",
};

export const DEMAND_TONE: Record<DemandLevel, string> = {
  low: "var(--color-success)",
  moderate: "var(--color-primary)",
  high: "var(--color-warning)",
  very_high: "var(--color-destructive)",
};

export const CAPACITY_TONE_L: Record<CapacityLevel, string> = {
  adequate: "var(--color-success)",
  watch: "var(--color-primary)",
  strained: "var(--color-warning)",
  critical: "var(--color-destructive)",
};

/* --------------------------------------------------------------- MODEL --- */

export interface PatientDemandContributor {
  /** Existing patient record id when available — never duplicated here. */
  patientId: string;
  label: string;
  room: string | null;
  mews: number | null;
  acuity: "low" | "moderate" | "high" | "critical";
  /** Share of the unit's current nursing demand (0–1). */
  share: number;
  drivers: string[];
}

export interface PatientDemand {
  department: Department;
  patients: number;
  highAcuityPatients: number;
  timeSensitiveWorkload: number;
  admissions: number;
  discharges: number;
  transfers: number;
  level: DemandLevel;
  /** Explains the demand level in plain language. */
  drivers: string[];
  contributors: PatientDemandContributor[];
}

export interface NursingDemand {
  /** Weighted nursing hours the current patient picture generates this shift. */
  requiredHours: number;
  complexityIndex: number;
  timeSensitiveTasks: number;
}

export interface CompetencyRequirement {
  code: string;
  label: string;
  requiredNurses: number;
  qualifiedAvailable: number;
  coverage: "adequate" | "limited" | "gap";
  reason: string;
}

export interface Certification {
  code: string;
  label: string;
  expiresOn: string | null;
}

/** Growth-domain view of the same governed competency record. */
export interface EmployeeCompetency {
  employeeId: string;
  competencies: string[];
  certifications: Certification[];
  developmentGaps: string[];
}

export interface WorkforceCapacity {
  department: Department;
  shift: string;
  availableNurses: number;
  assignedNurses: number;
  availableHours: number;
  competency: CompetencyRequirement[];
  level: CapacityLevel;
  reasons: string[];
}

export interface NurseWorkload {
  employeeId: string;
  displayName: string;
  patients: number;
  highAcuityPatients: number;
  timeSensitiveTasks: number;
  admissionDischargeActivity: number;
  workload: DemandLevel;
  /** Wellbeing signal — never silently applied as a capacity penalty. */
  recovery: RecoverySignal;
}

/** Fatigue / recovery is a separate wellbeing signal by default. */
export interface RecoverySignal {
  consecutiveShifts: number;
  nightPattern: boolean;
  breakTaken: boolean;
  overtimeHours: number;
  /** Institutions may opt in to include this in capacity — off by default. */
  note: string;
}

export interface DemandForecastPoint {
  time: string;
  level: DemandLevel;
  capacity: CapacityLevel;
  drivers: string[];
}

export interface WorkforceRisk {
  department: Department;
  demand: DemandLevel;
  capacity: CapacityLevel;
  risk: CapacityLevel;
  headline: string;
}

export type DecisionKind = "accepted" | "declined" | "overridden" | "deferred";

export type OverrideReason =
  | "staffing_arranged"
  | "clinical_context"
  | "operational_constraint"
  | "policy_consideration"
  | "data_issue"
  | "other";

export const OVERRIDE_REASON_LABEL: Record<OverrideReason, string> = {
  staffing_arranged: "Staffing already arranged",
  clinical_context: "Clinical context not represented",
  operational_constraint: "Operational constraint",
  policy_consideration: "Policy consideration",
  data_issue: "Data issue",
  other: "Other",
};

export interface AIRecommendation {
  id: string;
  department: Department;
  severity: "info" | "watch" | "urgent";
  whatHappened: string;
  why: string[];
  predicted: string;
  options: string[];
  responsibleRole: string;
  /** Minimum information needed to open the contributing patients. */
  contributingPatients: string[];
}

export interface HumanDecision {
  recommendationId: string;
  decision: DecisionKind;
  decidedByRole: string;
  decidedAt: string;
  overrideReason?: OverrideReason;
  note?: string;
}

export interface EscalationStep {
  role: string;
  afterMinutes: number;
  channel: CommunicationChannel;
}

export type CommunicationChannel =
  | "in_app"
  | "prominent_alert"
  | "call_pathway"
  | "integrated_comms"
  | "sms_email"
  | "escalation_only";

export const CHANNEL_LABEL: Record<CommunicationChannel, string> = {
  in_app: "In-app alert",
  prominent_alert: "Prominent alert",
  call_pathway: "Call pathway",
  integrated_comms: "Integrated communication system",
  sms_email: "SMS / email (if institution permits)",
  escalation_only: "Escalation only",
};

export interface EscalationEvent {
  id: string;
  department: Department;
  signal: string;
  severity: "watch" | "urgent";
  policyCode: string;
  chain: EscalationStep[];
  currentStep: number;
  status: "awaiting_acknowledgement" | "acknowledged" | "resolved";
  raisedAt: string;
}

export interface OutcomeRecord {
  recommendationId: string;
  predicted: string;
  recommendation: string;
  decision: DecisionKind;
  actualOutcome: string;
  recordedAt: string;
}

/** Demo escalation configuration. NEVER treat this as a universal hierarchy. */
export interface WorkforceInstitutionPolicy {
  code: string;
  title: string;
  severityThreshold: CapacityLevel;
  acknowledgementMinutes: number;
  chain: EscalationStep[];
  fatigueAffectsCapacity: boolean;
}

export const DEMO_WORKFORCE_POLICY: WorkforceInstitutionPolicy = {
  code: "WFI-CAP-01",
  title: "Nursing capacity threshold escalation (demo configuration)",
  severityThreshold: "strained",
  acknowledgementMinutes: 15,
  chain: [
    { role: "Staffing Coordinator", afterMinutes: 0, channel: "in_app" },
    { role: "Nursing Supervisor", afterMinutes: 15, channel: "call_pathway" },
    { role: "Nurse Manager", afterMinutes: 30, channel: "integrated_comms" },
    { role: "Director of Nursing", afterMinutes: 60, channel: "prominent_alert" },
  ],
  fatigueAffectsCapacity: false,
};

/* -------------------------------------------------------- ROLE AWARENESS -- */

export type WorkforceView =
  | "coordinator"
  | "manager"
  | "supervisor"
  | "director"
  | "operations"
  | "hr"
  | "governance";

export interface WorkforceViewConfig {
  id: WorkforceView;
  label: string;
  scope: "unit" | "multi_unit" | "institution";
  focus: string;
  sections: {
    demand: boolean;
    capacity: boolean;
    forecast: boolean;
    imbalance: boolean;
    recommendation: boolean;
    escalation: boolean;
    outcomes: boolean;
    individualWorkload: boolean;
    competency: boolean;
    workforceTrends: boolean;
    governance: boolean;
  };
}

const S = (o: Partial<WorkforceViewConfig["sections"]>): WorkforceViewConfig["sections"] => ({
  demand: true,
  capacity: true,
  forecast: false,
  imbalance: false,
  recommendation: true,
  escalation: false,
  outcomes: false,
  individualWorkload: false,
  competency: false,
  workforceTrends: false,
  governance: false,
  ...o,
});

export const WORKFORCE_VIEWS: Record<WorkforceView, WorkforceViewConfig> = {
  coordinator: {
    id: "coordinator",
    label: "Staffing Coordinator",
    scope: "multi_unit",
    focus: "Current capacity, unit demand, assignments, float resources and predicted shortages.",
    sections: S({ forecast: true, imbalance: true, individualWorkload: true, competency: true, escalation: true }),
  },
  manager: {
    id: "manager",
    label: "Nurse Manager",
    scope: "unit",
    focus: "Unit workload, patient demand, assignment balance, capability coverage and predicted demand.",
    sections: S({ forecast: true, individualWorkload: true, competency: true, outcomes: true }),
  },
  supervisor: {
    id: "supervisor",
    label: "Nursing Supervisor",
    scope: "multi_unit",
    focus: "Multi-unit pressure, escalation, capacity imbalance and float options.",
    sections: S({ forecast: true, imbalance: true, escalation: true, competency: true }),
  },
  director: {
    id: "director",
    label: "Director of Nursing",
    scope: "institution",
    focus: "Institution-wide demand, capacity trends, workforce risk and escalation patterns.",
    sections: S({ forecast: true, imbalance: true, escalation: true, outcomes: true, workforceTrends: true }),
  },
  operations: {
    id: "operations",
    label: "Hospital Operations",
    scope: "institution",
    focus: "Operational capacity, department pressure, forecasting and cross-department impact.",
    sections: S({ forecast: true, imbalance: true, escalation: true }),
  },
  hr: {
    id: "hr",
    label: "HR + Nursing",
    scope: "institution",
    focus: "Workforce trends, staffing patterns, capability gaps and development needs.",
    sections: S({ demand: false, imbalance: true, competency: true, workforceTrends: true, recommendation: false }),
  },
  governance: {
    id: "governance",
    label: "Workforce Intelligence (governed)",
    scope: "institution",
    focus: "Governed intelligence, prediction quality, institutional learning and configuration visibility.",
    sections: S({ forecast: true, imbalance: true, outcomes: true, governance: true, escalation: true }),
  },
};

/** Map the signed-in responsibility/role onto the views they may enter. */
export function availableViews(input: { role: Role; responsibilities: Responsibility[] }): WorkforceView[] {
  const r = new Set(input.responsibilities);
  const views = new Set<WorkforceView>();
  if (r.has("charge_nurse")) views.add("manager");
  if (r.has("nursing_admin")) {
    views.add("coordinator");
    views.add("supervisor");
    views.add("director");
  }
  if (r.has("hr")) views.add("hr");
  if (r.has("executive")) {
    views.add("director");
    views.add("operations");
  }
  if (r.has("quality")) views.add("governance");
  if (input.role === "admin" || r.has("institution_admin")) {
    (Object.keys(WORKFORCE_VIEWS) as WorkforceView[]).forEach((v) => views.add(v));
  }
  return Array.from(views);
}

/** Presentation gate only — data isolation is enforced by institution RLS. */
export function canEnterWorkforceIntelligence(input: {
  role: Role;
  responsibilities: Responsibility[];
}): boolean {
  return availableViews(input).length > 0;
}

/* ------------------------------------------------------------- DERIVATION */

export function demandFromSignals(d: {
  highAcuityPatients: number;
  timeSensitiveWorkload: number;
  admissions: number;
  discharges: number;
  patients: number;
}): DemandLevel {
  const score =
    d.highAcuityPatients * 3 + d.timeSensitiveWorkload * 1 + (d.admissions + d.discharges) * 2 + d.patients * 0.4;
  if (score >= 26) return "very_high";
  if (score >= 17) return "high";
  if (score >= 10) return "moderate";
  return "low";
}

export function riskFrom(demand: DemandLevel, capacity: CapacityLevel): CapacityLevel {
  const d = { low: 0, moderate: 1, high: 2, very_high: 3 }[demand];
  const c = { adequate: 0, watch: 1, strained: 2, critical: 3 }[capacity];
  const gap = d + c;
  if (gap >= 5) return "critical";
  if (gap >= 3) return "strained";
  if (gap >= 2) return "watch";
  return "adequate";
}

export const deptName = (d: Department) => getDept(d).short;
export const deptColor = (d: Department) => getDept(d).color;

/* --------------------------------------------------------- DEMO SNAPSHOT -- */

export interface WorkforceSnapshot {
  generatedAt: string;
  shift: string;
  demand: PatientDemand;
  nursingDemand: NursingDemand;
  capacity: WorkforceCapacity;
  forecast: DemandForecastPoint[];
  risks: WorkforceRisk[];
  workloads: NurseWorkload[];
  recommendations: AIRecommendation[];
  escalations: EscalationEvent[];
  outcomes: OutcomeRecord[];
  policy: WorkforceInstitutionPolicy;
}

const hhmm = (offsetHours: number) => {
  const d = new Date();
  d.setHours(d.getHours() + offsetHours, 0, 0, 0);
  return `${`${d.getHours()}`.padStart(2, "0")}:00`;
};

/**
 * TODO(persistence): replace with institution-scoped reads from
 * `patient_acuity`, `workflow_tasks`, `nursing_capacity` and
 * `institution_policies`. Seeded demo data is isolated to this function so the
 * swap is a single call-site change.
 */
export function demoSnapshot(dept: Department): WorkforceSnapshot {
  const seedIndex = Math.max(0, "abcdefghijkl".indexOf(dept[0])) % 3;
  const highAcuity = [2, 3, 1][seedIndex];
  const timeSensitive = [7, 9, 4][seedIndex];
  const admissions = [1, 1, 0][seedIndex];
  const discharges = [1, 2, 1][seedIndex];
  const patients = [18, 22, 14][seedIndex];

  const demandLevel = demandFromSignals({
    highAcuityPatients: highAcuity,
    timeSensitiveWorkload: timeSensitive,
    admissions,
    discharges,
    patients,
  });

  const demand: PatientDemand = {
    department: dept,
    patients,
    highAcuityPatients: highAcuity,
    timeSensitiveWorkload: timeSensitive,
    admissions,
    discharges,
    transfers: 1,
    level: demandLevel,
    drivers: [
      `${highAcuity} patients with rising MEWS / high acuity`,
      `${timeSensitive} time-sensitive medications, reassessments and procedures`,
      `${admissions} expected admission · ${discharges} planned discharge`,
      "Increased monitoring and dependency in the current patient mix",
    ],
    contributors: [
      {
        patientId: "demo-301a",
        label: "Patient · Room 301A",
        room: "301A",
        mews: 5,
        acuity: "high",
        share: 0.24,
        drivers: ["MEWS 3 → 5 rising", "Hourly monitoring", "IV medication schedule"],
      },
      {
        patientId: "demo-304a",
        label: "Patient · Room 304A",
        room: "304A",
        mews: 4,
        acuity: "high",
        share: 0.17,
        drivers: ["Post-procedure reassessment", "Isolation precautions"],
      },
      {
        patientId: "demo-302a",
        label: "Patient · Room 302A",
        room: "302A",
        mews: 2,
        acuity: "moderate",
        share: 0.11,
        drivers: ["Discharge education", "Medication reconciliation"],
      },
    ],
  };

  const nursingDemand: NursingDemand = {
    requiredHours: 62 + highAcuity * 4,
    complexityIndex: Math.round((demand.patients * 0.6 + highAcuity * 3 + timeSensitive * 0.8) * 10) / 10,
    timeSensitiveTasks: timeSensitive,
  };

  const competency: CompetencyRequirement[] = [
    {
      code: "critical_care",
      label: "Critical-care competency",
      requiredNurses: 2,
      qualifiedAvailable: seedIndex === 1 ? 1 : 2,
      coverage: seedIndex === 1 ? "limited" : "adequate",
      reason:
        seedIndex === 1
          ? "Two high-acuity patients require critical-care capability; one qualified nurse is available on this shift."
          : "Qualified capability matches the current high-acuity patient requirement.",
    },
    {
      code: "iv_therapy",
      label: "Advanced IV therapy",
      requiredNurses: 3,
      qualifiedAvailable: 4,
      coverage: "adequate",
      reason: "Medication-intensive period is covered by available qualified nurses.",
    },
  ];

  const capacityLevel: CapacityLevel =
    competency.some((c) => c.coverage !== "adequate")
      ? "strained"
      : demandLevel === "very_high"
        ? "watch"
        : "adequate";

  const capacity: WorkforceCapacity = {
    department: dept,
    shift: "Day",
    availableNurses: [8, 6, 7][seedIndex],
    assignedNurses: [7, 6, 6][seedIndex],
    availableHours: [64, 48, 56][seedIndex],
    competency,
    level: capacityLevel,
    reasons: [
      `${[8, 6, 7][seedIndex]} nurses available · ${[7, 6, 6][seedIndex]} currently assigned`,
      `${highAcuity} high-acuity patients and ${admissions + discharges} admission/discharge activities in progress`,
      competency.find((c) => c.coverage !== "adequate")?.reason ?? "Relevant capability coverage is adequate.",
    ],
  };

  const forecast: DemandForecastPoint[] = [
    {
      time: hhmm(0),
      level: demandLevel,
      capacity: capacityLevel,
      drivers: ["Current patient acuity and open time-sensitive tasks"],
    },
    {
      time: hhmm(1),
      level: demandLevel,
      capacity: capacityLevel,
      drivers: ["Scheduled reassessments for two high-acuity patients"],
    },
    {
      time: hhmm(2),
      level: "very_high",
      capacity: "strained",
      drivers: ["Medication-intensive period", "Expected admission", "Procedure schedule"],
    },
    {
      time: hhmm(3),
      level: "very_high",
      capacity: "strained",
      drivers: ["Planned discharge activity", "High-acuity reassessment", "Break coverage overlap"],
    },
  ];

  const risks: WorkforceRisk[] = (
    [
      { department: "medical" as Department, demand: "high" as DemandLevel, capacity: "watch" as CapacityLevel },
      { department: "icu" as Department, demand: "high" as DemandLevel, capacity: "adequate" as CapacityLevel },
      { department: "ed" as Department, demand: "very_high" as DemandLevel, capacity: "strained" as CapacityLevel },
      { department: "pediatric" as Department, demand: "low" as DemandLevel, capacity: "adequate" as CapacityLevel },
    ] as const
  ).map((r) => ({
    department: r.department,
    demand: r.demand,
    capacity: r.capacity,
    risk: riskFrom(r.demand, r.capacity),
    headline:
      r.demand === "low"
        ? "Demand within available capacity."
        : "Patient demand is rising faster than available nursing capacity.",
  }));

  const workloads: NurseWorkload[] = [
    {
      employeeId: "demo-n1",
      displayName: "Nurse A",
      patients: 5,
      highAcuityPatients: 1,
      timeSensitiveTasks: 3,
      admissionDischargeActivity: 1,
      workload: "high",
      recovery: {
        consecutiveShifts: 4,
        nightPattern: false,
        breakTaken: false,
        overtimeHours: 2,
        note: "Break not yet taken this shift.",
      },
    },
    {
      employeeId: "demo-n2",
      displayName: "Nurse B",
      patients: 4,
      highAcuityPatients: 0,
      timeSensitiveTasks: 1,
      admissionDischargeActivity: 0,
      workload: "moderate",
      recovery: {
        consecutiveShifts: 2,
        nightPattern: false,
        breakTaken: true,
        overtimeHours: 0,
        note: "Recovery pattern within institutional guidance.",
      },
    },
    {
      employeeId: "demo-n3",
      displayName: "Nurse C",
      patients: 4,
      highAcuityPatients: 1,
      timeSensitiveTasks: 2,
      admissionDischargeActivity: 1,
      workload: "high",
      recovery: {
        consecutiveShifts: 5,
        nightPattern: true,
        breakTaken: true,
        overtimeHours: 4,
        note: "Fifth consecutive shift with night pattern — wellbeing signal only.",
      },
    },
  ];

  const recommendations: AIRecommendation[] = [
    {
      id: "rec-peak",
      department: dept,
      severity: "urgent",
      whatHappened: "Nursing demand has risen above the level this shift's capacity was planned for.",
      why: [
        `${highAcuity} high-acuity patients driving ${Math.round(
          demand.contributors.slice(0, 2).reduce((s, c) => s + c.share, 0) * 100,
        )}% of current unit demand`,
        `${timeSensitive} time-sensitive medications and reassessments concentrated in the next two hours`,
        `${admissions} expected admission and ${discharges} planned discharge`,
      ],
      predicted: `Demand is projected to exceed available capacity between ${hhmm(2)} and ${hhmm(4)}.`,
      options: [
        "Review current assignment distribution before the projected peak.",
        "Consider available qualified float support.",
        "Consider additional staffing according to institutional policy.",
        "Review non-urgent operational workload where clinically appropriate.",
        "Escalate to the responsible leader if the policy threshold is reached.",
      ],
      responsibleRole: "Nursing Supervisor",
      contributingPatients: demand.contributors.map((c) => c.patientId),
    },
    {
      id: "rec-balance",
      department: dept,
      severity: "watch",
      whatHappened: "Assignment distribution appears imbalanced across the current team.",
      why: [
        "Nurse A carries 5 patients including 1 high-acuity patient and 3 time-sensitive tasks",
        "Nurse B carries 4 patients with moderate workload and no admission activity",
      ],
      predicted: "Without review, time-sensitive tasks may cluster on one nurse during the peak period.",
      options: [
        "Review assignment distribution with the charge nurse.",
        "Consider moving one lower-complexity patient to balance the load.",
      ],
      responsibleRole: "Nurse Manager",
      contributingPatients: [],
    },
  ];

  const escalations: EscalationEvent[] = [
    {
      id: "esc-1",
      department: dept,
      signal: `${getDept(dept).short} capacity threshold reached.`,
      severity: "urgent",
      policyCode: DEMO_WORKFORCE_POLICY.code,
      chain: DEMO_WORKFORCE_POLICY.chain,
      currentStep: 1,
      status: "awaiting_acknowledgement",
      raisedAt: new Date(Date.now() - 9 * 60000).toISOString(),
    },
  ];

  const outcomes: OutcomeRecord[] = [
    {
      recommendationId: "rec-prev-1",
      predicted: "High demand at 12:00",
      recommendation: "Review assignment distribution",
      decision: "accepted",
      actualOutcome: "Demand remained high; assignments rebalanced before the peak.",
      recordedAt: new Date(Date.now() - 26 * 3600000).toISOString(),
    },
    {
      recommendationId: "rec-prev-2",
      predicted: "Capacity strain on evening shift",
      recommendation: "Consider qualified float support",
      decision: "overridden",
      actualOutcome: "Float support already arranged locally; shift completed within capacity.",
      recordedAt: new Date(Date.now() - 50 * 3600000).toISOString(),
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    shift: "Day",
    demand,
    nursingDemand,
    capacity,
    forecast,
    risks,
    workloads,
    recommendations,
    escalations,
    outcomes,
    policy: DEMO_WORKFORCE_POLICY,
  };
}
