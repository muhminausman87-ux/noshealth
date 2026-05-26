export type Department =
  | "ed"
  | "medsurg"
  | "icu"
  | "maternity"
  | "cardiac"
  | "labour"
  | "pediatric"
  | "medical"
  | "surgical"
  | "opd"
  | "daycare"
  | "ot";

export interface DeptMeta {
  id: Department;
  short: string;
  name: string;
  color: string; // hex/oklch accent for the unit
  tint: string;  // soft background tint
}

export const DEPARTMENTS: DeptMeta[] = [
  { id: "ed",        short: "Emergency",     name: "Emergency Department (ED)",   color: "#dc2626", tint: "#fee2e2" },
  { id: "icu",       short: "ICU",           name: "Intensive Care Unit (ICU)",   color: "#2563eb", tint: "#dbeafe" },
  { id: "medsurg",   short: "Med-Surg",      name: "Medical-Surg Floor",          color: "#0d9488", tint: "#ccfbf1" },
  { id: "maternity", short: "Maternity",     name: "Maternity Ward",              color: "#db2777", tint: "#fce7f3" },
  { id: "cardiac",   short: "Cardiac",       name: "Cardiac Ward",                color: "#e11d48", tint: "#ffe4e6" },
  { id: "labour",    short: "Labour",        name: "Labour Room",                 color: "#c026d3", tint: "#fae8ff" },
  { id: "pediatric", short: "Pediatric",     name: "Pediatric Ward",              color: "#f59e0b", tint: "#fef3c7" },
  { id: "medical",   short: "Medical",       name: "Medical Ward",                color: "#0ea5e9", tint: "#e0f2fe" },
  { id: "surgical",  short: "Surgical",      name: "Surgical Ward",               color: "#7c3aed", tint: "#ede9fe" },
  { id: "opd",       short: "OPD",           name: "Out-Patient Department",      color: "#16a34a", tint: "#dcfce7" },
  { id: "daycare",   short: "Day Care",      name: "Day Care Ward",               color: "#0891b2", tint: "#cffafe" },
  { id: "ot",        short: "OT",            name: "Operation Theatre",           color: "#0f766e", tint: "#99f6e4" },
];

export const getDept = (id: Department) => DEPARTMENTS.find((d) => d.id === id)!;
