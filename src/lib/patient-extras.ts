import type { PatientFull } from "./patients";

export interface Lab {
  panel: string;
  test: string;
  value: string;
  unit: string;
  ref: string;
  flag: "normal" | "high" | "low" | "critical";
  takenAt: string;
}

export interface IOEntry {
  time: string;
  intake: { route: string; item: string; ml: number }[];
  output: { route: string; item: string; ml: number }[];
}

export interface IOChart {
  shiftStart: string;
  totals: { intake: number; output: number; balance: number };
  entries: IOEntry[];
}

export interface NursingNote {
  time: string;
  author: string;
  type: "Assessment" | "Intervention" | "Family" | "Escalation" | "Education";
  body: string;
}

export interface CarePlanItem {
  problem: string;
  goal: string;
  interventions: string[];
  evaluation: string;
  status: "active" | "resolved" | "ongoing";
}

export interface Handover {
  situation: string;
  background: string;
  assessment: string;
  recommendation: string;
  pendingTasks: { task: string; due: string; priority: "low" | "med" | "high" }[];
}

export interface ClinicalExtras {
  labs: Lab[];
  io: IOChart;
  notes: NursingNote[];
  carePlan: CarePlanItem[];
  handover: Handover;
}

/** Build realistic clinical extras derived from the patient context. */
export function getClinicalExtras(p: PatientFull): ClinicalExtras {
  const critical = p.status === "critical";
  const watch = p.status === "watch";

  // ---- Labs ----
  const labs: Lab[] = [
    { panel: "FBC", test: "Hb",          value: critical ? "9.4" : "12.8", unit: "g/dL",   ref: "12–16",   flag: critical ? "low" : "normal",   takenAt: "06:30" },
    { panel: "FBC", test: "WBC",         value: critical ? "18.2" : watch ? "11.6" : "7.4", unit: "10⁹/L", ref: "4–11", flag: critical ? "critical" : watch ? "high" : "normal", takenAt: "06:30" },
    { panel: "FBC", test: "Platelets",   value: "245",                     unit: "10⁹/L",  ref: "150–400", flag: "normal",                       takenAt: "06:30" },
    { panel: "U&E", test: "Na⁺",         value: "138",                     unit: "mmol/L", ref: "135–145", flag: "normal",                       takenAt: "06:30" },
    { panel: "U&E", test: "K⁺",          value: critical ? "5.6" : "4.2",  unit: "mmol/L", ref: "3.5–5.0", flag: critical ? "high" : "normal",  takenAt: "06:30" },
    { panel: "U&E", test: "Creatinine",  value: p.dept === "medical" || critical ? "168" : "82", unit: "µmol/L", ref: "60–110", flag: p.dept === "medical" || critical ? "high" : "normal", takenAt: "06:30" },
    { panel: "U&E", test: "Urea",        value: critical ? "12.4" : "5.1", unit: "mmol/L", ref: "2.5–7.5", flag: critical ? "high" : "normal",  takenAt: "06:30" },
    { panel: "ABG", test: "pH",          value: critical ? "7.28" : "7.38", unit: "",      ref: "7.35–7.45", flag: critical ? "low" : "normal", takenAt: "05:45" },
    { panel: "ABG", test: "Lactate",     value: critical ? "3.8" : "1.4",  unit: "mmol/L", ref: "<2.0",     flag: critical ? "critical" : "normal", takenAt: "05:45" },
    { panel: "Glucose", test: "BGL",     value: p.dept === "medical" ? "11.4" : "6.2", unit: "mmol/L", ref: "4–8", flag: p.dept === "medical" ? "high" : "normal", takenAt: "07:00" },
    { panel: "CRP",  test: "CRP",        value: critical ? "182" : watch ? "64" : "8", unit: "mg/L", ref: "<5", flag: critical ? "critical" : watch ? "high" : "normal", takenAt: "06:30" },
  ];

  // ---- I/O chart (last 4 hours) ----
  const baseIntake = critical ? 220 : 140;
  const baseOutput = critical ? 90  : 130;
  const entries: IOEntry[] = ["04:00", "06:00", "08:00", "10:00"].map((time, i) => ({
    time,
    intake: [
      { route: "IV", item: i % 2 === 0 ? "0.9% NaCl" : "RL", ml: baseIntake + i * 10 },
      ...(i === 1 ? [{ route: "PO", item: "Oral fluids", ml: 60 }] : []),
    ],
    output: [
      { route: "Urine", item: "Catheter / void", ml: baseOutput + i * 5 },
      ...(i === 2 ? [{ route: "Drain", item: "Surgical drain", ml: 25 }] : []),
    ],
  }));
  const totalIntake = entries.reduce((s, e) => s + e.intake.reduce((a, b) => a + b.ml, 0), 0);
  const totalOutput = entries.reduce((s, e) => s + e.output.reduce((a, b) => a + b.ml, 0), 0);
  const io: IOChart = {
    shiftStart: "04:00",
    totals: { intake: totalIntake, output: totalOutput, balance: totalIntake - totalOutput },
    entries,
  };

  // ---- Nursing notes ----
  const notes: NursingNote[] = [
    {
      time: "07:10", author: "RN handover",  type: "Assessment",
      body: `Received from night shift. Patient ${critical ? "drowsy, RASS −2, on supports" : watch ? "alert, mildly anxious" : "alert and oriented, comfortable"}. ${p.shortNote}.`,
    },
    {
      time: "08:00", author: "RN bedside",   type: "Intervention",
      body: `Vital signs documented (HR ${p.vitals.hr}, BP ${p.vitals.bp}, SpO₂ ${p.vitals.spo2}%). ${p.medications[0]?.name ?? "Routine meds"} administered as scheduled.`,
    },
    {
      time: "09:15", author: "RN bedside",   type: "Assessment",
      body: `Pain reassessed — score ${p.pain.score}/10 at ${p.pain.site || "no specific site"}. ${p.pain.plan}.`,
    },
    ...(critical
      ? [{ time: "09:40", author: "RN", type: "Escalation" as const, body: "Notified MO of trending tachycardia and rising lactate. Plan: repeat ABG in 1 h, fluid challenge 250 mL." }]
      : []),
    {
      time: "10:00", author: "Family RN",    type: "Family",
      body: "Spouse updated on plan of care and current status. Questions answered, leaflet provided.",
    },
  ];

  // ---- Care plan ----
  const carePlan: CarePlanItem[] = [
    {
      problem: critical ? "Impaired tissue perfusion related to acute illness" : "Risk for ineffective therapeutic regimen",
      goal: "Maintain MAP > 65 mmHg and SpO₂ ≥ 94% throughout shift",
      interventions: [
        "Continuous cardiac and SpO₂ monitoring",
        "Strict hourly I/O and fluid balance",
        "Titrate vasoactive/oxygen therapy per protocol",
      ],
      evaluation: critical ? "MAP labile, requires ongoing titration" : "Targets currently met",
      status: critical ? "active" : "ongoing",
    },
    {
      problem: "Acute pain related to underlying diagnosis",
      goal: "Pain score ≤ 3/10 within 1 hour of intervention",
      interventions: ["Multimodal analgesia per chart", "Non-pharmacological measures (positioning, reassurance)", "Reassess pain q2h"],
      evaluation: p.pain.score <= 3 ? "Goal achieved" : "Goal not met — escalating",
      status: p.pain.score <= 3 ? "resolved" : "active",
    },
    {
      problem: "Risk of healthcare-associated infection",
      goal: "No new HAI during admission",
      interventions: ["Hand hygiene 5 moments", "Daily line/catheter review", "Aseptic dressing changes"],
      evaluation: "Lines/catheter sites clean and dry. CRP trending.",
      status: "ongoing",
    },
    ...(p.allergy
      ? [{
          problem: `Allergy: ${p.allergy.agent} (${p.allergy.severity})`,
          goal: "Prevent inadvertent exposure",
          interventions: ["Red allergy band in situ", "Allergy flagged in EHR & meds chart", "Educate patient/family"],
          evaluation: "Band verified at start of shift",
          status: "ongoing" as const,
        }]
      : []),
  ];

  // ---- SBAR handover ----
  const handover: Handover = {
    situation: `${p.name}, ${p.age} y ${p.sex}, Room ${p.room}. ${p.shortNote}. Current status: ${p.status.toUpperCase()}.`,
    background: `${p.reasonForAdmission} Past history: ${p.historySummary} Allergy: ${p.allergy ? `${p.allergy.agent} — ${p.allergy.reaction}` : "NKDA"}. Code: ${p.codeStatus}.`,
    assessment: `Vitals HR ${p.vitals.hr}, BP ${p.vitals.bp}, RR ${p.vitals.rr}, SpO₂ ${p.vitals.spo2}%, T ${p.vitals.temp}°C. Pain ${p.pain.score}/10. GCS ${p.gcs.eye + p.gcs.verbal + p.gcs.motor}/15. ${critical ? "Concerns: clinically unstable, requires close monitoring." : watch ? "Concerns: needs reassessment for any deterioration." : "No acute concerns this shift."}`,
    recommendation: critical
      ? "Continue current supports, repeat bloods in 2 h, escalate to MO for any further deterioration."
      : watch
        ? "Continue plan of care, reassess every 2 h, escalate if new red-flag features."
        : "Routine monitoring, mobilise as tolerated, prepare discharge planning if criteria met.",
    pendingTasks: [
      { task: `Administer ${p.medications.find((m) => m.status === "due")?.name ?? "scheduled meds"}`, due: "next hour", priority: critical ? "high" : "med" },
      { task: "Reassess pain & vitals", due: "in 1 h", priority: "med" },
      { task: "Update fluid balance chart", due: "end of shift", priority: "low" },
      ...(critical ? [{ task: "Repeat ABG & lactate", due: "in 2 h", priority: "high" as const }] : []),
    ],
  };

  return { labs, io, notes, carePlan, handover };
}
