/**
 * NOS — India Regulatory Baseline for nursing duty scheduling.
 *
 * Nothing here is a legal opinion. Each entry records WHAT was configured,
 * WHO the authority is, WHICH jurisdiction it was configured for, and whether
 * the institution has verified applicability. Optimisation preferences are
 * stored separately (kind: "standard" | "institutional") and are never
 * presented as legal requirements.
 */

export type RuleKind =
  | "legal_central"
  | "legal_state"
  | "nursing_standard"
  | "institutional"
  | "contractual"
  | "preference";

export const RULE_KIND_LABEL: Record<RuleKind, string> = {
  legal_central: "Legal — Central",
  legal_state: "Legal — State",
  nursing_standard: "Nursing standard",
  institutional: "Institutional policy",
  contractual: "Employment contract",
  preference: "Employee preference / AI optimisation",
};

export const RULE_KIND_TONE: Record<RuleKind, string> = {
  legal_central: "#1d4ed8",
  legal_state: "#7c3aed",
  nursing_standard: "#0d9488",
  institutional: "#0891b2",
  contractual: "#a16207",
  preference: "#64748b",
};

export type VerificationStatus = "verified" | "pending_verification" | "not_applicable";

export interface RegulatoryRule {
  id: string;
  kind: RuleKind;
  topic:
    | "working_hours"
    | "overtime"
    | "breaks"
    | "weekly_rest"
    | "night_work"
    | "women_night_work"
    | "maternity"
    | "creche"
    | "staffing"
    | "skill_mix";
  regulation: string;
  section: string;
  authority: string;
  jurisdiction: string;
  effectiveDate: string;
  sourceUrl: string;
  applicability: string;
  lastVerified: string;
  status: VerificationStatus;
  note?: string;
}

export const INDIAN_STATES = [
  "Central only",
  "Kerala",
  "Karnataka",
  "Maharashtra",
  "Tamil Nadu",
  "Telangana",
  "Delhi (NCT)",
  "West Bengal",
  "Gujarat",
  "Uttar Pradesh",
  "Other / not listed",
] as const;
export type IndianState = (typeof INDIAN_STATES)[number];

export interface WomenNightWorkSafeguards {
  consentRecorded: boolean;
  transportProvided: boolean;
  safePickupDrop: boolean;
  workplaceSafety: boolean;
  lighting: boolean;
  washroomAccess: boolean;
  safeEntryExit: boolean;
  maternityProtectionsApplied: boolean;
  poshCompliance: boolean;
}

export const SAFEGUARD_LABEL: Record<keyof WomenNightWorkSafeguards, string> = {
  consentRecorded: "Night-work consent recorded",
  transportProvided: "Transportation available",
  safePickupDrop: "Safe pickup / drop",
  workplaceSafety: "Workplace safety measures",
  lighting: "Adequate lighting",
  washroomAccess: "Access to toilets / washrooms",
  safeEntryExit: "Safe entry and exit",
  maternityProtectionsApplied: "Maternity protections applied",
  poshCompliance: "POSH compliance in place",
};

export interface FamilySupportFacilities {
  crecheAvailable: boolean;
  crecheHours: string;
  crecheEligibility: string;
  shiftCompatibility: string;
}

export interface RegulatoryBaseline {
  jurisdictionLevel: "Central" | "Central + State";
  state: IndianState;
  /** Statutory baseline the institution has configured. */
  standardDailyHours: number;
  standardWeeklyHours: number;
  overtimeThresholdDaily: number;
  overtimeThresholdWeekly: number;
  overtimeMultiplier: number;
  /** Contractual/institutional week — may differ from the statutory baseline. */
  contractualWeeklyHours: number;
  continuousWorkBeforeBreakHours: number;
  requiredBreakMinutes: number;
  breakRequiresCoverage: boolean;
  weeklyHolidaysPerWeek: number;
  compensatoryOffRequired: boolean;
  publicHolidaysPerYear: number;
  womenNightWorkPermitted: boolean;
  safeguards: WomenNightWorkSafeguards;
  familySupport: FamilySupportFacilities;
  rules: RegulatoryRule[];
}

export const REGULATORY_DISCLAIMER =
  "Regulatory information — verify applicability with the institution/legal authority. NOS validates the roster against configured regulatory and institutional rules. Final legal applicability and approval remain with the institution and its authorised personnel.";

export const STATE_DISCLAIMER = "State-specific applicability requires verification.";

const today = () => new Date().toISOString().slice(0, 10);

/** Central baseline entries, sourced only from Government of India material. */
export function indiaBaselineRules(state: IndianState): RegulatoryRule[] {
  const central: RegulatoryRule[] = [
    {
      id: "reg-osh-hours",
      kind: "legal_central",
      topic: "working_hours",
      regulation: "Occupational Safety, Health and Working Conditions Code, 2020",
      section: "Chapter VI — Hours of work and annual leave with wages",
      authority: "Ministry of Labour & Employment, Government of India",
      jurisdiction: "India (Central)",
      effectiveDate: "2020-09-28",
      sourceUrl: "https://www.indiacode.nic.in/handle/123456789/16063",
      applicability:
        "Establishments covered by the Code, as notified. Applicability to a specific hospital depends on establishment type and notified rules.",
      lastVerified: today(),
      status: "pending_verification",
      note: "Configured baseline: 8 hours per day and 48 hours per week.",
    },
    {
      id: "reg-osh-overtime",
      kind: "legal_central",
      topic: "overtime",
      regulation: "Occupational Safety, Health and Working Conditions Code, 2020",
      section: "Overtime wages",
      authority: "Ministry of Labour & Employment, Government of India",
      jurisdiction: "India (Central)",
      effectiveDate: "2020-09-28",
      sourceUrl: "https://www.indiacode.nic.in/handle/123456789/16063",
      applicability:
        "Work beyond the statutory threshold is treated as overtime and attracts overtime wages at the rate prescribed by the applicable rules.",
      lastVerified: today(),
      status: "pending_verification",
    },
    {
      id: "reg-osh-rest",
      kind: "legal_central",
      topic: "breaks",
      regulation: "Occupational Safety, Health and Working Conditions Code, 2020",
      section: "Rest intervals / spread-over",
      authority: "Ministry of Labour & Employment, Government of India",
      jurisdiction: "India (Central)",
      effectiveDate: "2020-09-28",
      sourceUrl: "https://www.indiacode.nic.in/handle/123456789/16063",
      applicability: "Rest interval after the prescribed period of continuous work.",
      lastVerified: today(),
      status: "pending_verification",
    },
    {
      id: "reg-osh-weekly-off",
      kind: "legal_central",
      topic: "weekly_rest",
      regulation: "Occupational Safety, Health and Working Conditions Code, 2020",
      section: "Weekly holiday and compensatory holiday",
      authority: "Ministry of Labour & Employment, Government of India",
      jurisdiction: "India (Central)",
      effectiveDate: "2020-09-28",
      sourceUrl: "https://www.indiacode.nic.in/handle/123456789/16063",
      applicability:
        "One weekly holiday; where the weekly holiday is not given, compensatory holiday as prescribed.",
      lastVerified: today(),
      status: "pending_verification",
    },
    {
      id: "reg-osh-women-night",
      kind: "legal_central",
      topic: "women_night_work",
      regulation: "Occupational Safety, Health and Working Conditions Code Central Rules",
      section: "Employment of women beyond permitted hours — conditions",
      authority: "Ministry of Labour & Employment, Government of India",
      jurisdiction: "India (Central)",
      effectiveDate: "2020-09-28",
      sourceUrl: "https://labour.gov.in/",
      applicability:
        "Women may be employed at night where permitted, subject to consent, transportation and safe and secure working conditions.",
      lastVerified: today(),
      status: "pending_verification",
      note: "NOS never blocks night duty on the basis of gender. It blocks only when the required safeguards are not recorded.",
    },
    {
      id: "reg-maternity",
      kind: "legal_central",
      topic: "maternity",
      regulation: "Maternity Benefit Act, 1961 (as amended)",
      section: "Maternity benefit and workplace protections",
      authority: "Ministry of Labour & Employment, Government of India",
      jurisdiction: "India (Central)",
      effectiveDate: "1961-12-12",
      sourceUrl: "https://www.indiacode.nic.in/handle/123456789/1622",
      applicability:
        "Applies to eligible women employees. NOS records only an authorised HR/occupational-health work restriction, never clinical detail.",
      lastVerified: today(),
      status: "pending_verification",
    },
    {
      id: "reg-creche",
      kind: "legal_central",
      topic: "creche",
      regulation: "Labour framework — crèche facility provisions",
      section: "Crèche facility",
      authority: "Ministry of Labour & Employment, Government of India",
      jurisdiction: "India (Central)",
      effectiveDate: "2017-04-01",
      sourceUrl: "https://labour.gov.in/",
      applicability:
        "Establishments meeting the prescribed threshold. NOS does not assume a facility exists — the institution records what it provides.",
      lastVerified: today(),
      status: "pending_verification",
    },
    {
      id: "reg-inc-staffing",
      kind: "nursing_standard",
      topic: "staffing",
      regulation: "Indian Nursing Council — nursing staffing norms",
      section: "Staffing norms for hospital nursing services",
      authority: "Indian Nursing Council",
      jurisdiction: "India",
      effectiveDate: "2020-01-01",
      sourceUrl: "https://www.indiannursingcouncil.org/",
      applicability:
        "Nursing standard, not a labour statute. Values are configurable per institution, state, unit and accreditation requirement.",
      lastVerified: today(),
      status: "pending_verification",
    },
    {
      id: "reg-dghs-workload",
      kind: "nursing_standard",
      topic: "staffing",
      regulation: "DGHS Hospital Manual (Guidelines for hospital services)",
      section: "Nursing services — deployment by workload",
      authority: "Directorate General of Health Services, Ministry of Health & Family Welfare",
      jurisdiction: "India",
      effectiveDate: "2002-01-01",
      sourceUrl: "https://dghs.gov.in/",
      applicability:
        "Adequate nursing personnel in each shift according to workload and area of deployment, with equitable distribution of nursing workload.",
      lastVerified: today(),
      status: "pending_verification",
    },
    {
      id: "reg-posh",
      kind: "legal_central",
      topic: "night_work",
      regulation: "Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013",
      section: "Employer duties",
      authority: "Ministry of Women & Child Development, Government of India",
      jurisdiction: "India (Central)",
      effectiveDate: "2013-12-09",
      sourceUrl: "https://www.indiacode.nic.in/handle/123456789/2104",
      applicability: "All workplaces. Recorded here as a safeguard condition for night duty planning.",
      lastVerified: today(),
      status: "pending_verification",
    },
  ];

  if (state === "Central only" || state === "Other / not listed") return central;

  return [
    ...central,
    {
      id: `reg-state-${state}`,
      kind: "legal_state",
      topic: "working_hours",
      regulation: `${state} Shops and Commercial Establishments / State labour rules`,
      section: "Hours of work, rest interval, weekly holiday, night work conditions",
      authority: `Labour Department, Government of ${state}`,
      jurisdiction: state,
      effectiveDate: "—",
      sourceUrl: "https://labour.gov.in/state-labour-laws",
      applicability:
        "State rules may apply in addition to, or more favourably than, the Central framework for this establishment type.",
      lastVerified: today(),
      status: "pending_verification",
      note: STATE_DISCLAIMER,
    },
  ];
}

export function defaultRegulatoryBaseline(state: IndianState = "Kerala"): RegulatoryBaseline {
  return {
    jurisdictionLevel: state === "Central only" ? "Central" : "Central + State",
    state,
    standardDailyHours: 8,
    standardWeeklyHours: 48,
    overtimeThresholdDaily: 8,
    overtimeThresholdWeekly: 48,
    overtimeMultiplier: 2,
    contractualWeeklyHours: 40,
    continuousWorkBeforeBreakHours: 5,
    requiredBreakMinutes: 30,
    breakRequiresCoverage: true,
    weeklyHolidaysPerWeek: 1,
    compensatoryOffRequired: true,
    publicHolidaysPerYear: 12,
    womenNightWorkPermitted: true,
    safeguards: {
      consentRecorded: true,
      transportProvided: true,
      safePickupDrop: true,
      workplaceSafety: true,
      lighting: true,
      washroomAccess: true,
      safeEntryExit: true,
      maternityProtectionsApplied: true,
      poshCompliance: true,
    },
    familySupport: {
      crecheAvailable: false,
      crecheHours: "Not recorded",
      crecheEligibility: "Not recorded",
      shiftCompatibility: "Not recorded — verify with HR before rostering dependent-care staff at night.",
    },
    rules: indiaBaselineRules(state),
  };
}

export const missingSafeguards = (s: WomenNightWorkSafeguards) =>
  (Object.keys(s) as (keyof WomenNightWorkSafeguards)[]).filter((k) => !s[k]);
