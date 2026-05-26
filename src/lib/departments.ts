export type Department = "ed" | "medsurg" | "icu";

export const DEPARTMENTS: { id: Department; short: string; name: string; color: string }[] = [
  { id: "ed", short: "Emergency", name: "Emergency Department (ED)", color: "oklch(0.58 0.22 25)" },
  { id: "medsurg", short: "Medical-Surg", name: "Medical-Surg Floor", color: "oklch(0.62 0.13 155)" },
  { id: "icu", short: "ICU", name: "Intensive Care Unit (ICU)", color: "oklch(0.52 0.13 235)" },
];
