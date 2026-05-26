import type { Department } from "./departments";

export type Role = "staff" | "admin";

export interface DemoUser {
  username: string;
  password: string;
  name: string;
  role: Role;
  assignedDept?: Department; // staff only
  title: string;
}

export const STAFF: DemoUser[] = [
  { username: "admin",   password: "admin123", name: "Dr. R. Menon",  role: "admin", title: "Nursing Director" },
  { username: "achen",   password: "nurse123", name: "RN A. Chen",    role: "staff", assignedDept: "ed",        title: "ED Nurse" },
  { username: "spriya",  password: "nurse123", name: "RN S. Priya",   role: "staff", assignedDept: "icu",       title: "ICU Nurse" },
  { username: "jthomas", password: "nurse123", name: "RN J. Thomas",  role: "staff", assignedDept: "medsurg",   title: "Med-Surg Nurse" },
  { username: "mfatima", password: "nurse123", name: "RN M. Fatima",  role: "staff", assignedDept: "maternity", title: "Maternity Nurse" },
  { username: "kraj",    password: "nurse123", name: "RN K. Raj",     role: "staff", assignedDept: "cardiac",   title: "Cardiac Nurse" },
  { username: "lpaul",   password: "nurse123", name: "RN L. Paul",    role: "staff", assignedDept: "labour",    title: "Labour Room Nurse" },
  { username: "nsingh",  password: "nurse123", name: "RN N. Singh",   role: "staff", assignedDept: "pediatric", title: "Pediatric Nurse" },
  { username: "rjoseph", password: "nurse123", name: "RN R. Joseph",  role: "staff", assignedDept: "medical",   title: "Medical Ward Nurse" },
  { username: "ddas",    password: "nurse123", name: "RN D. Das",     role: "staff", assignedDept: "surgical",  title: "Surgical Ward Nurse" },
  { username: "anair",   password: "nurse123", name: "RN A. Nair",    role: "staff", assignedDept: "opd",       title: "OPD Nurse" },
  { username: "pgeorge", password: "nurse123", name: "RN P. George",  role: "staff", assignedDept: "daycare",   title: "Day Care Nurse" },
  { username: "tkurian", password: "nurse123", name: "RN T. Kurian",  role: "staff", assignedDept: "ot",        title: "OT Scrub Nurse" },
];

export interface Session {
  username: string;
  name: string;
  title: string;
  role: Role;
  assignedDept?: Department;
  activeDept: Department; // current dept (own or pulled-to)
  pulled: boolean;
}

const KEY = "synccare.session";

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function setSession(s: Session | null) {
  if (typeof window === "undefined") return;
  if (s) localStorage.setItem(KEY, JSON.stringify(s));
  else localStorage.removeItem(KEY);
}

export function findUser(username: string, password: string, role: Role): DemoUser | null {
  return (
    STAFF.find(
      (u) =>
        u.username.toLowerCase() === username.trim().toLowerCase() &&
        u.password === password &&
        u.role === role,
    ) ?? null
  );
}

export const SUPPORT_PHONE = "+918075918850";
export const SUPPORT_PHONE_DISPLAY = "+91 80759 18850";
