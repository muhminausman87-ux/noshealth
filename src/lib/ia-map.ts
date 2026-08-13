/**
 * FROMEX Information Architecture map (internal reference — not user facing).
 *
 * Layer order:
 *   patient → clinical care → nursing workflow → workforce capacity →
 *   wellbeing → growth → clinical excellence → institutional intelligence
 *
 * Rules encoded here:
 *  - Every feature has exactly ONE owning module (source of truth).
 *  - Other modules may show a SUMMARY / SIGNAL and link to the owner.
 *  - Nothing is deleted: routes and components stay available even when a
 *    duplicate surface is downgraded to a contextual link.
 */

export type IaLayer =
  | "patient"
  | "clinical"
  | "workflow"
  | "workforce"
  | "wellbeing"
  | "growth"
  | "excellence"
  | "executive";

export type IaAction = "keep" | "reference" | "summarize" | "contextualize" | "defer" | "hide-from-role";

export type IaEntry = {
  feature: string;
  owner: IaLayer;
  ownerRoute: string;
  primaryUser: string;
  duplicatedIn: string[];
  action: IaAction;
  note: string;
};

export const SOURCE_ROUTES: Record<IaLayer, { label: string; route: string }> = {
  patient: { label: "Patient Workspace", route: "/clinical" },
  clinical: { label: "Clinical Workspace", route: "/clinical" },
  workflow: { label: "Workflow Intelligence", route: "/workflow-intelligence" },
  workforce: { label: "Workforce Intelligence", route: "/workforce-intelligence" },
  wellbeing: { label: "Wellbeing Intelligence", route: "/wellbeing" },
  growth: { label: "Employee Growth", route: "/growth" },
  excellence: { label: "Clinical Excellence", route: "/clinical-excellence" },
  executive: { label: "Executive Intelligence", route: "/executive-intelligence" },
};

export const IA_MAP: IaEntry[] = [
  {
    feature: "Patient acuity / MEWS / patient chart",
    owner: "clinical",
    ownerRoute: "/clinical",
    primaryUser: "Bedside nurse, clinical team",
    duplicatedIn: ["Workforce Intelligence", "Nursing Workforce Intelligence", "Digital Twin"],
    action: "summarize",
    note: "Workforce receives a calculated demand signal plus 'view contributing patients' link.",
  },
  {
    feature: "Nursing task prioritisation & shift timeline",
    owner: "workflow",
    ownerRoute: "/workflow-intelligence",
    primaryUser: "Nurse, charge nurse",
    duplicatedIn: ["Workforce Intelligence", "MyResponsibility"],
    action: "reference",
    note: "MyResponsibility keeps the bedside slice; institution-wide workflow lives in Workflow Intelligence.",
  },
  {
    feature: "Capacity vs demand, staffing gap, float allocation",
    owner: "workforce",
    ownerRoute: "/workforce-intelligence",
    primaryUser: "Charge nurse, nurse manager, director",
    duplicatedIn: ["Executive Intelligence", "Workflow Intelligence", "Digital Twin"],
    action: "reference",
    note: "Other modules show severity + timestamp + link only.",
  },
  {
    feature: "Burnout / fatigue / recovery / breaks",
    owner: "wellbeing",
    ownerRoute: "/wellbeing",
    primaryUser: "Nurse, wellbeing lead",
    duplicatedIn: ["Workforce Intelligence", "Executive Intelligence"],
    action: "contextualize",
    note: "Workforce shows a single recovery signal; no wellbeing dashboard reproduction, no automatic staffing penalty.",
  },
  {
    feature: "Competency & certification records",
    owner: "growth",
    ownerRoute: "/growth",
    primaryUser: "Nurse, educator, manager",
    duplicatedIn: ["Workforce Intelligence"],
    action: "summarize",
    note: "Workforce queries only competencies relevant to current demand (qualified available staff count).",
  },
  {
    feature: "Audits, EBP, IPC, quality indicators",
    owner: "excellence",
    ownerRoute: "/clinical-excellence",
    primaryUser: "Quality lead, CNO",
    duplicatedIn: ["Executive Intelligence", "Staff wellbeing hub"],
    action: "reference",
    note: "Elsewhere: a single compliance figure with a link.",
  },
  {
    feature: "AI recommendation (detailed: what / why / options / decision)",
    owner: "workforce",
    ownerRoute: "/workforce-intelligence",
    primaryUser: "Nurse manager, supervisor, director",
    duplicatedIn: ["Executive Intelligence", "Workflow Intelligence", "Clinical dashboards"],
    action: "reference",
    note: "Originating module owns the decision surface; others display summary + severity + link.",
  },
  {
    feature: "Executive synthesis (what happened / why / risk / next)",
    owner: "executive",
    ownerRoute: "/executive-intelligence",
    primaryUser: "Executive, CNO",
    duplicatedIn: ["Workforce Intelligence"],
    action: "summarize",
    note: "Executive layer links out rather than re-rendering source dashboards.",
  },
];
