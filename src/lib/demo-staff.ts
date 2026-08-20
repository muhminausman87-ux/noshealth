/**
 * DEMO DATA ONLY — not clinical or HR records.
 *
 * This is a synthetic nursing roster used by prototype dashboards
 * (AdminWorkforce, AdminPerformance). It contains no credentials and no real
 * employee information. Production workforce data must come from the database
 * through RLS-protected queries.
 */
import type { Department } from "./departments";

export interface DemoStaffMember {
  username: string;
  name: string;
  role: "staff";
  assignedDept: Department;
  title: string;
}

export const DEMO_STAFF: DemoStaffMember[] = [
  { username: "achen", name: "RN A. Chen", role: "staff", assignedDept: "ed", title: "ED Nurse" },
  { username: "spriya", name: "RN S. Priya", role: "staff", assignedDept: "icu", title: "ICU Nurse" },
  { username: "jthomas", name: "RN J. Thomas", role: "staff", assignedDept: "medsurg", title: "Med-Surg Nurse" },
  { username: "mfatima", name: "RN M. Fatima", role: "staff", assignedDept: "maternity", title: "Maternity Nurse" },
  { username: "kraj", name: "RN K. Raj", role: "staff", assignedDept: "cardiac", title: "Cardiac Nurse" },
  { username: "lpaul", name: "RN L. Paul", role: "staff", assignedDept: "labour", title: "Labour Room Nurse" },
  { username: "nsingh", name: "RN N. Singh", role: "staff", assignedDept: "pediatric", title: "Pediatric Nurse" },
  { username: "rjoseph", name: "RN R. Joseph", role: "staff", assignedDept: "medical", title: "Medical Ward Nurse" },
  { username: "ddas", name: "RN D. Das", role: "staff", assignedDept: "surgical", title: "Surgical Ward Nurse" },
  { username: "anair", name: "RN A. Nair", role: "staff", assignedDept: "opd", title: "OPD Nurse" },
  { username: "pgeorge", name: "RN P. George", role: "staff", assignedDept: "daycare", title: "Day Care Nurse" },
  { username: "tkurian", name: "RN T. Kurian", role: "staff", assignedDept: "ot", title: "OT Scrub Nurse" },
];
