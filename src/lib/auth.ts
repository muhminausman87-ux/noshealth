import type { Department } from "./departments";

export type Role = "staff" | "admin" | "doctor" | "lab" | "radiology";

export interface DemoUser {
  username: string;
  password: string;
  name: string;
  role: Role;
  assignedDept?: Department;
  title: string;
}

export const STAFF: DemoUser[] = [
  { username: "admin",   password: "admin123", name: "Dr. R. Menon",  role: "admin", title: "Nursing Director" },

  // Nurses
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

  // Doctors (login by username only — designation is separate)
  { username: "dpatel",  password: "doc123",   name: "Dr. P. Patel",  role: "doctor", assignedDept: "medical",  title: "Internal Medicine" },
  { username: "dkhan",   password: "doc123",   name: "Dr. A. Khan",   role: "doctor", assignedDept: "ed",       title: "ED Physician" },
  { username: "drao",    password: "doc123",   name: "Dr. V. Rao",    role: "doctor", assignedDept: "icu",      title: "Intensivist" },
  { username: "dshah",   password: "doc123",   name: "Dr. M. Shah",   role: "doctor", assignedDept: "ot",       title: "Surgeon" },
  { username: "diyer",   password: "doc123",   name: "Dr. K. Iyer",   role: "doctor", assignedDept: "daycare",  title: "Day-Care Consultant" },

  // Lab technicians
  { username: "lab1",    password: "lab123",   name: "Tech S. Roy",   role: "lab",    title: "Lab Technician (Biochem)" },
  { username: "lab2",    password: "lab123",   name: "Tech H. Ali",   role: "lab",    title: "Lab Technician (Haem)" },

  // Radiology
  { username: "rad1",    password: "rad123",   name: "Rad. T. Bose",  role: "radiology", title: "Radiology Technologist" },
  { username: "rad2",    password: "rad123",   name: "Dr. N. Verma",  role: "radiology", title: "Radiologist" },
];

export interface Session {
  username: string;
  name: string;
  title: string;
  role: Role;
  assignedDept?: Department;
  activeDept: Department;
  pulled: boolean;
}

const KEY = "synccare.session";
const EMERG_KEY = "synccare.emergency";

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

/** Auto-detect role from username + password (no role tab required at login). */
export function findUserAny(username: string, password: string): DemoUser | null {
  return (
    STAFF.find(
      (u) =>
        u.username.toLowerCase() === username.trim().toLowerCase() &&
        u.password === password,
    ) ?? null
  );
}

// Hospital-wide healthcare emergency mode (Code Yellow / mass casualty / outbreak).
// When ON: surge protocol banner shown, staff get emergency-pay (+50%) and comp-off note.
export function getEmergency(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(EMERG_KEY) === "1";
}
export function setEmergency(on: boolean) {
  if (typeof window === "undefined") return;
  if (on) localStorage.setItem(EMERG_KEY, "1");
  else localStorage.removeItem(EMERG_KEY);
  window.dispatchEvent(new CustomEvent("synccare-emergency"));
}

export const SUPPORT_PHONE = "+852685497";
export const SUPPORT_PHONE_DISPLAY = "852 685 497";

export const FOUNDER_LINKEDIN = "https://www.linkedin.com/in/muhmina-usman-a9b54557";

// Demo accounts to show on the login screen (passwords intentionally visible for demo).
export const DEMO_ACCOUNTS: { role: string; username: string; password: string; name: string }[] = [
  { role: "Admin / Nursing Director", username: "admin",  password: "admin123", name: "Dr. R. Menon" },
  { role: "Nurse (ED)",               username: "achen",  password: "nurse123", name: "RN A. Chen" },
  { role: "Nurse (ICU)",              username: "spriya", password: "nurse123", name: "RN S. Priya" },
  { role: "Doctor (Medicine)",        username: "dpatel", password: "doc123",   name: "Dr. P. Patel" },
  { role: "Doctor (Surgeon)",         username: "dshah",  password: "doc123",   name: "Dr. M. Shah" },
  { role: "Lab Technician",           username: "lab1",   password: "lab123",   name: "Tech S. Roy" },
  { role: "Radiology",                username: "rad1",   password: "rad123",   name: "Rad. T. Bose" },
];
