import type { Department } from "@/lib/departments";
import type { CompetencyCode, DutyRequest, NurseProfile } from "./types";

const FIRST = [
  "Aisha", "Rahul", "Maria", "Joseph", "Fatima", "Neha", "Samuel", "Priya", "Daniel", "Grace",
  "Ibrahim", "Lucy", "Arjun", "Hannah", "Peter", "Zainab", "Thomas", "Meera", "Anna", "Yusuf",
  "Sarah", "Nikhil", "Elena", "Mark",
];
const LAST = [
  "Kurian", "Menon", "D'Souza", "Fernandes", "Sharma", "Abraham", "Iqbal", "Thomas", "Varghese",
  "Nair", "Pillai", "George", "Khan", "Joseph", "Rao",
];

function seeded(n: number) {
  let s = n * 9301 + 49297;
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280);
}

function competenciesFor(dept: Department, rnd: () => number): CompetencyCode[] {
  const base: CompetencyCode[] = [];
  if (dept === "icu") base.push("icu");
  if (dept === "ed") base.push("ed");
  if (dept === "pediatric") base.push("paeds");
  if (dept === "maternity" || dept === "labour") base.push("midwifery");
  if (dept === "cardiac") base.push("cardiac");
  if (rnd() > 0.5) base.push("acls");
  if (rnd() > 0.75) base.push("preceptor");
  return base;
}

export function demoNurses(dept: Department, count = 20): NurseProfile[] {
  const rnd = seeded(dept.length * 7 + count);
  return Array.from({ length: count }, (_, i) => {
    const senior = i % 3 === 0;
    const charge = i === 0;
    const comps = competenciesFor(dept, rnd);
    // Roughly a fifth of the unit lacks the specialty competency (training pipeline).
    const specialty = comps[0];
    if (!senior && specialty && rnd() > 0.8) comps.shift();
    const employment = i % 9 === 8 ? "prn" : i % 7 === 6 ? "part_time" : "full_time";
    return {
      id: `${dept}-n${i + 1}`,
      name: `${FIRST[i % FIRST.length]} ${LAST[(i * 3) % LAST.length]}`,
      designation: charge ? "Charge Nurse" : senior ? "Senior Staff Nurse" : "Staff Nurse",
      dept,
      grade: charge ? "Charge Nurse" : senior ? "Senior Nurse" : i % 6 === 5 ? "Enrolled Nurse" : "Staff Nurse",
      senior: senior || charge,
      qualification: senior ? "B.Sc Nursing" : i % 3 === 0 ? "GNM" : "B.Sc Nursing",
      competencies: comps,
      certifications: comps.includes("acls") ? ["BLS", "ACLS"] : ["BLS"],
      experienceYears: senior ? 6 + (i % 7) : 1 + (i % 5),
      employment,
      contractedHoursPerWeek: employment === "full_time" ? 42 : employment === "part_time" ? 24 : 12,
      availableDays: employment === "part_time" ? [1, 2, 3, 4, 5] : [0, 1, 2, 3, 4, 5, 6],
      preferredShifts: i % 3 === 0 ? ["M"] : i % 3 === 1 ? ["E"] : ["N"],
      preferredOffDays: [i % 7],
      restrictions: i % 11 === 3 ? ["No night duty — occupational health advice"] : [],
      history: {
        nightsLast30: Math.round(rnd() * 8),
        weekendsLast30: Math.round(rnd() * 4),
        hoursLast7: 24 + Math.round(rnd() * 20),
        lastShiftCode: i % 3 === 2 ? "N" : "M",
      },
    } satisfies NurseProfile;
  });
}

export function demoRequests(nurses: NurseProfile[], month: string): DutyRequest[] {
  const out: DutyRequest[] = [];
  const day = (d: number) => `${month}-${String(d).padStart(2, "0")}`;
  nurses.slice(0, 10).forEach((n, i) => {
    out.push({
      id: `req-off-${n.id}`,
      nurseId: n.id,
      kind: "preferred_off",
      date: day(3 + ((i * 3) % 22)),
      reason: i % 3 === 0 ? "Family commitment" : undefined,
      status: "submitted",
      submittedAt: day(1),
    });
  });
  nurses.slice(3, 8).forEach((n, i) => {
    out.push({
      id: `req-duty-${n.id}`,
      nurseId: n.id,
      kind: "preferred_duty",
      date: day(6 + i * 2),
      shiftCode: n.preferredShifts[0] ?? "M",
      status: "submitted",
      submittedAt: day(1),
    });
  });
  nurses.slice(11, 13).forEach((n, i) => {
    out.push({
      id: `req-leave-${n.id}`,
      nurseId: n.id,
      kind: "leave",
      date: day(9 + i * 5),
      dateTo: day(13 + i * 5),
      reason: "Annual leave",
      status: "approved",
      submittedAt: day(1),
    });
  });
  const cw = nurses[14];
  if (cw) {
    out.push({
      id: `req-cw-${cw.id}`,
      nurseId: cw.id,
      kind: "cannot_work",
      date: day(20),
      reason: "Examination",
      status: "approved",
      submittedAt: day(2),
    });
  }
  return out;
}

export function monthDates(month: string): string[] {
  const [y, m] = month.split("-").map(Number);
  const days = new Date(y!, m!, 0).getDate();
  return Array.from({ length: days }, (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`);
}

export const currentMonth = () => new Date().toISOString().slice(0, 7);
