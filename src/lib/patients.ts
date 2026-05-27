import type { Department } from "./departments";

export interface VitalSet {
  hr: number; bp: string; rr: number; spo2: number; temp: string;
}

export interface PatientFull {
  id: string;
  name: string;
  age: number;
  sex: "M" | "F";
  mrn: string;
  room: string;
  dept: Department;
  status: "stable" | "watch" | "critical";
  admittedOn: string;
  reasonForAdmission: string;
  historySummary: string;
  allergy: { agent: string; reaction: string; severity: "mild" | "moderate" | "severe" } | null;
  codeStatus: string;
  vitals: VitalSet;
  pain: { score: number; site: string; character: string; lastDose: string; plan: string };
  gcs: { eye: number; verbal: number; motor: number };
  medications: { name: string; dose: string; route: string; freq: string; nextDue: string; status: "due" | "given" | "scheduled" }[];
  shortNote: string;
}

const make = (p: PatientFull) => p;

export const PATIENTS: PatientFull[] = [
  make({
    id: "p-medical-01",
    name: "John Doe", age: 47, sex: "M", mrn: "987-654-321", room: "MW-21",
    dept: "medical", status: "stable", admittedOn: "2026-05-25",
    reasonForAdmission: "Community-acquired pneumonia, right lower lobe. Admitted via ED with productive cough, fever, hypoxia (SpO₂ 91% RA).",
    historySummary: "Type 2 DM (10 y), HTN, ex-smoker (20 pack-years). No prior hospitalisations in last 2 years.",
    allergy: { agent: "Penicillin", reaction: "Anaphylaxis (1998)", severity: "severe" },
    codeStatus: "Full Code",
    vitals: { hr: 88, bp: "128/78", rr: 18, spo2: 96, temp: "37.2" },
    pain: { score: 3, site: "Right chest", character: "Pleuritic, sharp on deep inspiration", lastDose: "Paracetamol 1 g · 06:00", plan: "PRN paracetamol q6h, reassess q4h" },
    gcs: { eye: 4, verbal: 5, motor: 6 },
    medications: [
      { name: "Ceftriaxone", dose: "2 g", route: "IV", freq: "OD", nextDue: "10:00", status: "due" },
      { name: "Azithromycin", dose: "500 mg", route: "PO", freq: "OD", nextDue: "09:00", status: "given" },
      { name: "Salbutamol neb", dose: "2.5 mg", route: "Neb", freq: "Q6H", nextDue: "12:00", status: "scheduled" },
      { name: "Insulin Aspart", dose: "Sliding scale", route: "SC", freq: "AC + HS", nextDue: "12:00", status: "scheduled" },
    ],
    shortNote: "CAP · IV Ceftriaxone",
  }),
  make({
    id: "p-medical-02",
    name: "Suresh Pillai", age: 56, sex: "M", mrn: "881-204-552", room: "MW-19",
    dept: "medical", status: "watch", admittedOn: "2026-05-26",
    reasonForAdmission: "Diabetic ketoacidosis. Presented with vomiting, polyuria, BGL 38 mmol/L, ketones 4+.",
    historySummary: "T1DM since age 14, recurrent DKA, poor compliance with insulin.",
    allergy: null,
    codeStatus: "Full Code",
    vitals: { hr: 104, bp: "118/72", rr: 22, spo2: 98, temp: "36.8" },
    pain: { score: 2, site: "Abdomen", character: "Cramping, intermittent", lastDose: "None this shift", plan: "Reassess hourly, PRN paracetamol" },
    gcs: { eye: 4, verbal: 5, motor: 6 },
    medications: [
      { name: "Insulin (Regular) gtt", dose: "0.1 U/kg/h", route: "IV", freq: "Cont", nextDue: "—", status: "given" },
      { name: "0.9% NaCl", dose: "250 mL/h", route: "IV", freq: "Cont", nextDue: "—", status: "given" },
      { name: "Potassium Chloride", dose: "20 mmol", route: "IV", freq: "PRN K<4", nextDue: "11:00", status: "due" },
    ],
    shortNote: "DKA resolving · insulin gtt",
  }),
  make({
    id: "p-medical-03",
    name: "Asha Devi", age: 68, sex: "F", mrn: "773-090-118", room: "MW-22",
    dept: "medical", status: "stable", admittedOn: "2026-05-24",
    reasonForAdmission: "CKD stage 4 with volume overload. Admitted for diuresis and electrolyte management.",
    historySummary: "Hypertension, T2DM, CKD stage 4 (baseline eGFR 22). No dialysis yet.",
    allergy: { agent: "Sulfa drugs", reaction: "Rash", severity: "mild" },
    codeStatus: "Full Code",
    vitals: { hr: 76, bp: "138/82", rr: 16, spo2: 97, temp: "36.6" },
    pain: { score: 0, site: "—", character: "Denies pain", lastDose: "—", plan: "Reassess each shift" },
    gcs: { eye: 4, verbal: 5, motor: 6 },
    medications: [
      { name: "Furosemide", dose: "40 mg", route: "IV", freq: "BD", nextDue: "10:00", status: "due" },
      { name: "Amlodipine", dose: "10 mg", route: "PO", freq: "OD", nextDue: "08:00", status: "given" },
      { name: "Sevelamer", dose: "800 mg", route: "PO", freq: "TDS w/ meals", nextDue: "12:00", status: "scheduled" },
    ],
    shortNote: "CKD 4 · fluid balance",
  }),

  // ED
  make({
    id: "p-ed-01",
    name: "Ramesh Iyer", age: 62, sex: "M", mrn: "555-001-902", room: "ED-7",
    dept: "ed", status: "critical", admittedOn: "2026-05-27",
    reasonForAdmission: "Chest pain radiating to left arm, diaphoresis. STEMI suspected (ST elevation V2–V4).",
    historySummary: "HTN, dyslipidemia, smoker. No prior cardiac events documented.",
    allergy: { agent: "Penicillin", reaction: "Anaphylaxis", severity: "severe" },
    codeStatus: "Full Code",
    vitals: { hr: 112, bp: "148/92", rr: 22, spo2: 94, temp: "37.8" },
    pain: { score: 8, site: "Central chest → left arm", character: "Crushing, constant", lastDose: "Morphine 4 mg IV · 06:55", plan: "Titrate morphine, prep for cath lab" },
    gcs: { eye: 4, verbal: 5, motor: 6 },
    medications: [
      { name: "Aspirin", dose: "300 mg", route: "PO chew", freq: "STAT", nextDue: "given", status: "given" },
      { name: "Clopidogrel", dose: "600 mg", route: "PO", freq: "STAT", nextDue: "given", status: "given" },
      { name: "Heparin", dose: "5000 U", route: "IV bolus", freq: "STAT", nextDue: "—", status: "given" },
      { name: "GTN infusion", dose: "5 µg/min", route: "IV", freq: "Cont", nextDue: "—", status: "due" },
    ],
    shortNote: "Chest pain · STEMI suspected",
  }),

  // ICU
  make({
    id: "p-icu-01",
    name: "Vikram Shah", age: 58, sex: "M", mrn: "401-552-887", room: "ICU-3",
    dept: "icu", status: "critical", admittedOn: "2026-05-26",
    reasonForAdmission: "Septic shock secondary to urosepsis. Intubated, on norepinephrine.",
    historySummary: "BPH with chronic indwelling catheter, T2DM.",
    allergy: null,
    codeStatus: "Full Code",
    vitals: { hr: 124, bp: "92/54", rr: 22, spo2: 95, temp: "38.6" },
    pain: { score: 0, site: "Sedated", character: "Unable to assess (RASS −3)", lastDose: "Fentanyl 50 µg · 06:30", plan: "Maintain RASS −2 to 0, CPOT q2h" },
    gcs: { eye: 1, verbal: 1, motor: 4 },
    medications: [
      { name: "Norepinephrine", dose: "0.18 µg/kg/min", route: "IV", freq: "Cont", nextDue: "—", status: "given" },
      { name: "Meropenem", dose: "1 g", route: "IV", freq: "Q8H", nextDue: "10:00", status: "due" },
      { name: "Propofol", dose: "30 µg/kg/min", route: "IV", freq: "Cont", nextDue: "—", status: "given" },
    ],
    shortNote: "Septic shock · norepi 0.18",
  }),

  // Med-Surg
  make({
    id: "p-medsurg-01",
    name: "Anil Verma", age: 64, sex: "M", mrn: "220-110-441", room: "MS-12",
    dept: "medsurg", status: "stable", admittedOn: "2026-05-25",
    reasonForAdmission: "POD #1 elective laparoscopic cholecystectomy.",
    historySummary: "GERD, well-controlled HTN. Uneventful surgery.",
    allergy: null,
    codeStatus: "Full Code",
    vitals: { hr: 74, bp: "126/78", rr: 16, spo2: 98, temp: "36.9" },
    pain: { score: 4, site: "RUQ port sites", character: "Aching, worse on movement", lastDose: "Tramadol 50 mg · 07:00", plan: "PCA off, regular paracetamol + PRN tramadol" },
    gcs: { eye: 4, verbal: 5, motor: 6 },
    medications: [
      { name: "Paracetamol", dose: "1 g", route: "PO", freq: "Q6H", nextDue: "10:00", status: "due" },
      { name: "Pantoprazole", dose: "40 mg", route: "IV", freq: "OD", nextDue: "09:00", status: "scheduled" },
      { name: "Enoxaparin", dose: "40 mg", route: "SC", freq: "OD", nextDue: "20:00", status: "scheduled" },
    ],
    shortNote: "POD#1 lap chole",
  }),

  // Maternity
  make({
    id: "p-maternity-01",
    name: "Aisha Khan", age: 29, sex: "F", mrn: "612-770-009", room: "M-12",
    dept: "maternity", status: "watch", admittedOn: "2026-05-27",
    reasonForAdmission: "G2P1, 39 weeks, early labour. Membranes intact, cervix 3 cm.",
    historySummary: "Previous SVD 2022, uncomplicated antenatal course.",
    allergy: null,
    codeStatus: "Full Code",
    vitals: { hr: 92, bp: "118/74", rr: 18, spo2: 99, temp: "36.8" },
    pain: { score: 6, site: "Lower abdomen / back", character: "Cramping with contractions q5min", lastDose: "Non-pharm: warm pack, breathing", plan: "Reassess for epidural at 5 cm" },
    gcs: { eye: 4, verbal: 5, motor: 6 },
    medications: [
      { name: "RL infusion", dose: "100 mL/h", route: "IV", freq: "Cont", nextDue: "—", status: "given" },
      { name: "Ranitidine", dose: "50 mg", route: "IV", freq: "Q6H", nextDue: "12:00", status: "scheduled" },
    ],
    shortNote: "G2P1 · 39w · early labour",
  }),

  // Cardiac
  make({
    id: "p-cardiac-01",
    name: "Mohammed Ali", age: 71, sex: "M", mrn: "118-447-220", room: "C-04",
    dept: "cardiac", status: "watch", admittedOn: "2026-05-25",
    reasonForAdmission: "Post-MI day 2, on telemetry. Stent to LAD, EF 40%.",
    historySummary: "Long-standing HTN, dyslipidemia, T2DM.",
    allergy: { agent: "Aspirin", reaction: "GI bleeding (historic)", severity: "moderate" },
    codeStatus: "Full Code",
    vitals: { hr: 82, bp: "122/76", rr: 16, spo2: 97, temp: "36.7" },
    pain: { score: 1, site: "Chest", character: "Mild dull ache, no radiation", lastDose: "Paracetamol 1 g · 06:00", plan: "Reassess hourly, escalate if score >3" },
    gcs: { eye: 4, verbal: 5, motor: 6 },
    medications: [
      { name: "Clopidogrel", dose: "75 mg", route: "PO", freq: "OD", nextDue: "08:00", status: "given" },
      { name: "Atorvastatin", dose: "80 mg", route: "PO", freq: "OD", nextDue: "20:00", status: "scheduled" },
      { name: "Bisoprolol", dose: "2.5 mg", route: "PO", freq: "OD", nextDue: "08:00", status: "given" },
    ],
    shortNote: "Post-MI day 2 · telemetry",
  }),

  // Labour
  make({
    id: "p-labour-01",
    name: "Neha Sharma", age: 27, sex: "F", mrn: "990-221-336", room: "LR-1",
    dept: "labour", status: "watch", admittedOn: "2026-05-27",
    reasonForAdmission: "Active phase of labour, cervix 6 cm, CTG reactive.",
    historySummary: "Primigravida, uncomplicated antenatal.",
    allergy: null,
    codeStatus: "Full Code",
    vitals: { hr: 96, bp: "120/78", rr: 18, spo2: 99, temp: "37.0" },
    pain: { score: 7, site: "Pelvis / back", character: "Contractions q3min, strong", lastDose: "Epidural in situ · 07:10", plan: "Top-up PRN, monitor block height" },
    gcs: { eye: 4, verbal: 5, motor: 6 },
    medications: [
      { name: "Bupivacaine 0.1% + Fentanyl", dose: "Epidural infusion", route: "Epidural", freq: "Cont", nextDue: "—", status: "given" },
      { name: "RL", dose: "125 mL/h", route: "IV", freq: "Cont", nextDue: "—", status: "given" },
    ],
    shortNote: "Active phase · 6 cm",
  }),

  // Pediatric
  make({
    id: "p-pediatric-01",
    name: "Arjun S.", age: 4, sex: "M", mrn: "330-114-552", room: "P-03",
    dept: "pediatric", status: "watch", admittedOn: "2026-05-26",
    reasonForAdmission: "Bronchiolitis, requiring O₂ 1L via nasal cannula.",
    historySummary: "Term baby, fully immunised, no prior admissions.",
    allergy: null,
    codeStatus: "Full Code",
    vitals: { hr: 130, bp: "98/60", rr: 32, spo2: 94, temp: "37.6" },
    pain: { score: 2, site: "—", character: "FLACC 2 — mildly fussy", lastDose: "Paracetamol 120 mg · 06:00", plan: "PRN paracetamol weight-based, reassess q4h" },
    gcs: { eye: 4, verbal: 5, motor: 6 },
    medications: [
      { name: "Nebulised hypertonic saline 3%", dose: "4 mL", route: "Neb", freq: "Q4H", nextDue: "10:00", status: "due" },
      { name: "Paracetamol", dose: "120 mg", route: "PO", freq: "Q6H PRN", nextDue: "PRN", status: "scheduled" },
    ],
    shortNote: "Bronchiolitis · O₂ 1L NC",
  }),

  // Surgical
  make({
    id: "p-surgical-01",
    name: "Vinod Kumar", age: 52, sex: "M", mrn: "771-009-118", room: "SW-11",
    dept: "surgical", status: "stable", admittedOn: "2026-05-26",
    reasonForAdmission: "POD #1 laparoscopic cholecystectomy, uncomplicated.",
    historySummary: "GERD, no prior surgery.",
    allergy: null,
    codeStatus: "Full Code",
    vitals: { hr: 78, bp: "124/76", rr: 16, spo2: 98, temp: "36.8" },
    pain: { score: 3, site: "Abdomen ports", character: "Aching", lastDose: "Tramadol 50 mg · 06:30", plan: "Regular paracetamol, PRN tramadol" },
    gcs: { eye: 4, verbal: 5, motor: 6 },
    medications: [
      { name: "Paracetamol", dose: "1 g", route: "PO", freq: "Q6H", nextDue: "10:00", status: "due" },
      { name: "Enoxaparin", dose: "40 mg", route: "SC", freq: "OD", nextDue: "20:00", status: "scheduled" },
    ],
    shortNote: "POD#1 lap chole",
  }),

  // OPD/Day care/OT — simple placeholders so list is never empty
  make({
    id: "p-opd-01",
    name: "Walk-in: R. Pillai", age: 38, sex: "M", mrn: "OPD-2261", room: "OPD-4",
    dept: "opd", status: "stable", admittedOn: "2026-05-27",
    reasonForAdmission: "Follow-up: hypertension review.",
    historySummary: "HTN on amlodipine 5 mg.",
    allergy: null, codeStatus: "Full Code",
    vitals: { hr: 76, bp: "134/84", rr: 14, spo2: 99, temp: "36.6" },
    pain: { score: 0, site: "—", character: "—", lastDose: "—", plan: "—" },
    gcs: { eye: 4, verbal: 5, motor: 6 },
    medications: [{ name: "Amlodipine", dose: "5 mg", route: "PO", freq: "OD", nextDue: "Home", status: "scheduled" }],
    shortNote: "HTN follow-up",
  }),
  make({
    id: "p-daycare-01",
    name: "Joseph K.", age: 60, sex: "M", mrn: "DC-44211", room: "DC-2",
    dept: "daycare", status: "watch", admittedOn: "2026-05-27",
    reasonForAdmission: "Chemotherapy cycle 3 — FOLFOX.",
    historySummary: "Colon Ca stage III, post-op.",
    allergy: null, codeStatus: "Full Code",
    vitals: { hr: 84, bp: "118/72", rr: 16, spo2: 98, temp: "36.7" },
    pain: { score: 1, site: "—", character: "Mild fatigue, no acute pain", lastDose: "—", plan: "Monitor for infusion reaction" },
    gcs: { eye: 4, verbal: 5, motor: 6 },
    medications: [
      { name: "Ondansetron", dose: "8 mg", route: "IV", freq: "Pre-chemo", nextDue: "given", status: "given" },
      { name: "Oxaliplatin", dose: "Per protocol", route: "IV", freq: "Cycle 3", nextDue: "Running", status: "given" },
    ],
    shortNote: "Chemo cycle 3 · infusion",
  }),
  make({
    id: "p-ot-01",
    name: "OR-1 case: K. Menon", age: 41, sex: "M", mrn: "OT-99023", room: "OR-1",
    dept: "ot", status: "watch", admittedOn: "2026-05-27",
    reasonForAdmission: "Lap appendectomy — in progress (32 min).",
    historySummary: "Healthy, no comorbidities.",
    allergy: null, codeStatus: "Full Code",
    vitals: { hr: 72, bp: "112/68", rr: 12, spo2: 100, temp: "36.4" },
    pain: { score: 0, site: "Under GA", character: "—", lastDose: "Intra-op opioids", plan: "PACU pain protocol" },
    gcs: { eye: 1, verbal: 1, motor: 1 },
    medications: [
      { name: "Sevoflurane", dose: "1.8% MAC", route: "Inhaled", freq: "Cont", nextDue: "—", status: "given" },
      { name: "Cefazolin", dose: "2 g", route: "IV", freq: "Pre-incision", nextDue: "given", status: "given" },
    ],
    shortNote: "Lap appendectomy · intra-op",
  }),
];

export const getPatient = (id: string) => PATIENTS.find((p) => p.id === id);
export const patientsByDept = (d: Department) => PATIENTS.filter((p) => p.dept === d);
