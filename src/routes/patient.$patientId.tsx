import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Department } from "@/lib/departments";
import {
  Activity, AlertTriangle, ArrowLeft, BookOpen, Brain, BrainCircuit, Calculator, ClipboardList,
  Clock, Droplet, FileText, FlaskConical, Footprints, Gauge, HeartCrack, HeartPulse, LineChart, ListChecks,
  Network, NotebookPen, Pill, Receipt, Scan, ScanBarcode, Send, ShieldAlert, ShieldCheck,
  Stethoscope, Thermometer, TimerReset, User, Workflow,
} from "lucide-react";
import { getPatient } from "@/lib/patients";
import type { PatientFull, VitalSet } from "@/lib/patients";
import { getClinicalExtras, type Lab } from "@/lib/patient-extras";
import { getSession, type Session } from "@/lib/auth";
import { getDept } from "@/lib/departments";
import { AIAssistant } from "@/components/AIAssistant";
import {
  VitalsTrend, GcsTrend, LabEntry, EHRModules, CPRSheet, CustomParams,
  HandoverTypeSelector, HandoverExtraForm, type HandoverType,
} from "@/components/PatientEntry";
import { EBPSearch, DoseCalculator, ProcedureGuides, NewDrugBadge, isNewDrug } from "@/components/EBPReferences";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/patient/$patientId")({
  head: () => ({ meta: [{ title: "Patient · SyncCare EHR" }] }),
  component: PatientPage,
});

function PatientPage() {
  const { patientId } = useParams({ from: "/patient/$patientId" });
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [handoverType, setHandoverType] = useState<HandoverType>("shift");
  const [activeSection, setActiveSection] = useState("summary");

  useEffect(() => {
    const s = getSession();
    if (!s) { navigate({ to: "/login" }); return; }
    setSession(s);
  }, [navigate]);

  const isMock = !!getPatient(patientId);
  const { data: dbPatient, isPending: patientPending } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("id", patientId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !isMock,
  });
  const { data: dbVitals } = useQuery({
    queryKey: ["vitals", patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vitals")
        .select("*")
        .eq("patient_id", patientId)
        .order("recorded_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !isMock,
  });
  const { data: dbGcs } = useQuery({
    queryKey: ["gcs", patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gcs_scores")
        .select("*")
        .eq("patient_id", patientId)
        .order("recorded_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !isMock,
  });
  const { data: dbNotes } = useQuery({
    queryKey: ["nursing_notes", patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nursing_notes")
        .select("*, profiles(full_name)")
        .eq("patient_id", patientId)
        .order("recorded_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !isMock,
  });

  let patient: PatientFull | undefined = getPatient(patientId);
  if (!patient && dbPatient) {
    const v = dbVitals;
    const vitals: VitalSet = v
      ? {
          hr: v.heart_rate ?? 0,
          bp:
            v.systolic_bp != null && v.diastolic_bp != null
              ? `${v.systolic_bp}/${v.diastolic_bp}`
              : "—",
          rr: v.respiratory_rate ?? 0,
          spo2: v.spo2 ?? 0,
          temp: v.temperature != null ? String(v.temperature) : "—",
        }
      : { hr: 0, bp: "—", rr: 0, spo2: 0, temp: "—" };

    patient = {
      id: dbPatient.id,
      name: dbPatient.full_name,
      age: dbPatient.age,
      sex: dbPatient.sex as "M" | "F",
      mrn: dbPatient.mrn,
      room: dbPatient.room ?? "",
      dept: dbPatient.dept as Department,
      status: dbPatient.status as "stable" | "watch" | "critical",
      admittedOn: dbPatient.admitted_on,
      reasonForAdmission: dbPatient.reason_for_admission,
      historySummary: dbPatient.history_summary ?? "",
      allergy: null,
      codeStatus: dbPatient.code_status,
      vitals,
      pain: { score: 0, site: "—", character: "—", lastDose: "—", plan: "—" },
      gcs: dbGcs
        ? { eye: dbGcs.eye_score ?? 0, verbal: dbGcs.verbal_score ?? 0, motor: dbGcs.motor_score ?? 0 }
        : { eye: 4, verbal: 5, motor: 6 },
      medications: [],
      shortNote: dbPatient.short_note ?? "",
    };
  }

  if (!session) return null;
  if (!isMock && patientPending) return null;
  if (!patient) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Link to="/" className="text-sm text-primary hover:underline">← Back</Link>
        <p className="mt-4 text-muted-foreground">Patient not found.</p>
      </div>
    );
  }

  const meta = getDept(patient.dept);
  const extras = getClinicalExtras(patient);
  const gcsTotal = patient.gcs.eye + patient.gcs.verbal + patient.gcs.motor;
  const gcsTone =
    gcsTotal >= 13 ? "var(--color-tone-mint)"
    : gcsTotal >= 9 ? "var(--color-tone-amber)"
    : "var(--color-destructive)";

  // Chart section navigation (user-facing list)
  const sections: { v: string; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
    { v: "summary",   label: "Patient Summary",          Icon: BookOpen },
    { v: "assess",    label: "Assessment",               Icon: Stethoscope },
    { v: "trends",    label: "Vital Signs",              Icon: HeartPulse },
    { v: "meds",      label: "Medication Administration", Icon: Pill },
    { v: "labs",      label: "Laboratory Results",       Icon: FlaskConical },
    { v: "radiology", label: "Radiology",                Icon: Scan },
    { v: "io",        label: "Fluid Balance",            Icon: Droplet },
    { v: "notes",     label: "Nursing Notes",            Icon: NotebookPen },
    { v: "careplan",  label: "Care Plan",                Icon: ListChecks },
    { v: "handover",  label: "SBAR / Handover",          Icon: Send },
    { v: "procdoc",   label: "Procedure Documentation",  Icon: Workflow },
    { v: "discharge", label: "Discharge Planning",       Icon: FileText },
    { v: "billing",   label: "Billing Summary",          Icon: Receipt },
    { v: "timeline",  label: "Clinical Timeline",        Icon: TimerReset },
    { v: "cpr",       label: "CPR / Code Sheet",         Icon: HeartCrack },
    { v: "ehr",       label: "EHR Modules",              Icon: Network },
    { v: "ebp",       label: "EBP & Tools",              Icon: Calculator },
  ];
  const activeLabel = sections.find((s) => s.v === activeSection)?.label ?? "Patient Summary";

  return (
    <div className="flex h-[calc(100vh-2.75rem)] flex-col overflow-hidden bg-background">
      {/* Sticky patient banner — shown once */}
      <header className="shrink-0 border-b border-border bg-card/95 backdrop-blur">
        <div className="flex items-center gap-3 px-4 py-2">
          <Link
            to="/"
            className="flex items-center gap-1.5 rounded-md border border-border bg-secondary/60 px-2.5 py-1 text-xs hover:bg-secondary"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Patient list
          </Link>
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
              <User className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-foreground">
                {patient.name}
                <span className="ml-2 text-[11px] font-normal text-muted-foreground">
                  {patient.sex} · {patient.age} y
                </span>
              </div>
              <div className="truncate text-[11px] text-muted-foreground">
                MRN {patient.mrn} · {meta.name} · Bed {patient.room}
              </div>
            </div>
          </div>

          <div className="ml-2 hidden min-w-0 flex-1 items-center gap-x-4 gap-y-1 lg:flex lg:flex-wrap">
            <HeaderField k="Dx" v={patient.shortNote || patient.reasonForAdmission.split(".")[0]} />
            <HeaderField k="Consultant" v="Dr. R. Nair" />
            <HeaderField k="Primary Nurse" v={session.name ?? "N. On duty"} />
            <HeaderField k="Isolation" v="Standard" />
          </div>

          <PatientAcuityStrip patient={patient} />

          <div className="ml-auto flex items-center gap-1.5">
            {patient.allergy ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-destructive/40 bg-destructive/10 px-2 py-0.5 text-[11px] font-semibold text-destructive">
                <ShieldAlert className="h-3 w-3" /> {patient.allergy.agent}
              </span>
            ) : (
              <span className="rounded-md border border-border bg-card px-2 py-0.5 text-[11px] text-muted-foreground">NKA</span>
            )}
            <span className="rounded-md border border-border bg-card px-2 py-0.5 text-[11px] text-muted-foreground">
              Code: {patient.codeStatus}
            </span>
            <span
              className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
              style={{
                background:
                  patient.status === "critical"
                    ? "color-mix(in oklab, var(--color-destructive) 18%, transparent)"
                    : patient.status === "watch"
                      ? "color-mix(in oklab, var(--color-tone-amber) 18%, transparent)"
                      : "color-mix(in oklab, var(--color-tone-mint) 18%, transparent)",
                color:
                  patient.status === "critical"
                    ? "var(--color-destructive)"
                    : patient.status === "watch"
                      ? "var(--color-tone-amber)"
                      : "var(--color-tone-mint)",
              }}
            >
              Risk: {patient.status}
            </span>
          </div>
        </div>
      </header>

      {/* 3-column EMR workspace */}
      <Tabs
        value={activeSection}
        onValueChange={setActiveSection}
        orientation="vertical"
        className="flex min-h-0 flex-1"
      >
        {/* LEFT — clinical navigation (20%) */}
        <aside className="flex w-[20%] min-w-[200px] shrink-0 flex-col border-r border-border bg-card/60">
          <div className="border-b border-border px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Chart sections
          </div>
          <TabsList className="flex h-auto flex-col items-stretch gap-0.5 overflow-y-auto rounded-none bg-transparent p-2">
            {sections.map(({ v, label, Icon }) => (
              <TabsTrigger
                key={v}
                value={v}
                className="justify-start gap-2 rounded-md px-2.5 py-1.5 text-[13px] data-[state=active]:bg-primary/10 data-[state=active]:font-semibold data-[state=active]:text-primary"
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="mt-auto border-t border-border px-3 py-2 text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              Auto-save on
            </span>
          </div>
        </aside>

        {/* CENTER — clinical workspace (60%) */}
        <div className="relative flex w-[60%] min-w-0 flex-1 flex-col">


          <div className="flex items-center justify-between border-b border-border bg-card/40 px-4 py-1.5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {activeLabel}
            </div>
            <div className="text-[11px] text-muted-foreground">Last update: just now</div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 pb-20">
            {/* SUMMARY */}
            <TabsContent value="summary" className="mt-0 space-y-4">
              <div
                className="flex items-start gap-3 rounded-xl border p-3"
                style={{
                  borderColor: patient.allergy
                    ? "color-mix(in oklab, var(--color-destructive) 40%, transparent)"
                    : "color-mix(in oklab, var(--color-tone-mint) 40%, transparent)",
                  background: patient.allergy
                    ? "color-mix(in oklab, var(--color-destructive) 10%, transparent)"
                    : "color-mix(in oklab, var(--color-tone-mint) 10%, transparent)",
                }}
              >
                {patient.allergy ? (
                  <ShieldAlert className="mt-0.5 h-5 w-5 text-destructive" />
                ) : (
                  <ShieldAlert className="mt-0.5 h-5 w-5" style={{ color: "var(--color-tone-mint)" }} />
                )}
                <div className="flex-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Allergy status
                  </div>
                  {patient.allergy ? (
                    <div className="text-sm font-medium text-foreground">
                      <span className="text-destructive">{patient.allergy.agent}</span> — {patient.allergy.reaction}
                      <span className="ml-2 rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-destructive">
                        {patient.allergy.severity}
                      </span>
                    </div>
                  ) : (
                    <div className="text-sm font-medium text-foreground">No known allergies</div>
                  )}
                </div>
                <span className="rounded-md border border-border bg-card px-2 py-1 text-[11px] text-muted-foreground">
                  Code: {patient.codeStatus}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Box title="Current admission" icon={BookOpen} accent="var(--color-tone-teal)" className="xl:col-span-2">
                  <div className="space-y-3 text-sm">
                    <KV k="Admitted" v={new Date(patient.admittedOn).toLocaleDateString()} />
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Reason for admission
                      </div>
                      <p className="mt-1 leading-relaxed text-foreground">{patient.reasonForAdmission}</p>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Relevant history
                      </div>
                      <p className="mt-1 leading-relaxed text-foreground">{patient.historySummary}</p>
                    </div>
                  </div>
                </Box>

                <Box title="Glasgow Coma Scale" icon={Brain} accent={gcsTone}>
                  {dbPatient && !dbGcs ? (
                    <p className="text-sm text-muted-foreground">No GCS recorded</p>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-semibold" style={{ color: gcsTone }}>{gcsTotal}</span>
                        <span className="text-sm text-muted-foreground">/ 15</span>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                        <Mini label="Eye" value={`${patient.gcs.eye}/4`} />
                        <Mini label="Verbal" value={`${patient.gcs.verbal}/5`} />
                        <Mini label="Motor" value={`${patient.gcs.motor}/6`} />
                      </div>
                    </>
                  )}
                </Box>

                <Box title="Vital signs" icon={HeartPulse} accent="var(--color-tone-rose)" className="md:col-span-2 xl:col-span-2">
                  {dbPatient && !dbVitals ? (
                    <p className="text-sm text-muted-foreground">No vitals recorded</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                      <Vital icon={HeartPulse} label="HR"   value={`${patient.vitals.hr}`} unit="bpm"  flag={patient.vitals.hr > 110 || patient.vitals.hr < 50} />
                      <Vital icon={Activity}   label="BP"   value={patient.vitals.bp}      unit="mmHg" />
                      <Vital icon={Stethoscope}label="RR"   value={`${patient.vitals.rr}`} unit="/min" flag={patient.vitals.rr > 24} />
                      <Vital icon={Droplet}    label="SpO₂" value={`${patient.vitals.spo2}`} unit="%"  flag={patient.vitals.spo2 < 94} />
                      <Vital icon={Thermometer}label="Temp" value={patient.vitals.temp}   unit="°C"   flag={parseFloat(patient.vitals.temp) > 38} />
                    </div>
                  )}
                </Box>

                <Box title="Pain management" icon={AlertTriangle} accent="var(--color-tone-amber)">
                  <div className="flex items-baseline gap-2">
                    <span
                      className="text-5xl font-semibold"
                      style={{
                        color: patient.pain.score >= 7 ? "var(--color-destructive)"
                          : patient.pain.score >= 4 ? "var(--color-tone-amber)"
                          : "var(--color-tone-mint)",
                      }}
                    >
                      {patient.pain.score}
                    </span>
                    <span className="text-sm text-muted-foreground">/ 10</span>
                  </div>
                  <dl className="mt-3 space-y-2 text-sm">
                    <KV k="Site" v={patient.pain.site} />
                    <KV k="Character" v={patient.pain.character} />
                    <KV k="Last dose" v={patient.pain.lastDose} />
                    <KV k="Plan" v={patient.pain.plan} />
                  </dl>
                </Box>

                <Box title="Medications" icon={Pill} accent="var(--color-tone-violet)" className="md:col-span-2 xl:col-span-3">
                  <ul className="divide-y divide-border">
                    {patient.medications.map((m) => {
                      const tone =
                        m.status === "due" ? "var(--color-tone-amber)"
                        : m.status === "given" ? "var(--color-tone-mint)"
                        : "var(--color-tone-sky)";
                      return (
                        <li key={m.name} className="flex items-center justify-between gap-3 py-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-8 w-8 items-center justify-center rounded-lg"
                              style={{ background: `color-mix(in oklab, ${tone} 18%, transparent)`, color: tone }}
                            >
                              <Pill className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-foreground">
                                <span>{m.name} <span className="text-muted-foreground">· {m.dose}</span></span>
                                {isNewDrug(m.name) && <NewDrugBadge name={m.name} />}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {m.route} · {m.freq} · next {m.nextDue}
                              </div>
                            </div>
                          </div>
                          <span
                            className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                            style={{ background: `color-mix(in oklab, ${tone} 18%, transparent)`, color: tone }}
                          >
                            {m.status}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </Box>
              </div>
            </TabsContent>

            {/* EBP & TOOLS */}
            <TabsContent value="ebp" className="mt-0 space-y-5">
              <EBPSearch patient={patient} />
              <DoseCalculator patient={patient} />
              <ProcedureGuides />
            </TabsContent>

            {/* TRENDS & ENTRY */}
            <TabsContent value="trends" className="mt-0 space-y-5">
              <VitalsTrend patient={patient} />
              <GcsTrend patient={patient} />
              <LabEntry />
              <CustomParams />
            </TabsContent>

            {/* CPR */}
            <TabsContent value="cpr" className="mt-0">
              <CPRSheet patient={patient} />
            </TabsContent>

            {/* EHR */}
            <TabsContent value="ehr" className="mt-0">
              <EHRModules />
            </TabsContent>

            {/* LABS */}
            <TabsContent value="labs" className="mt-0">
              <Box title="Latest results" icon={FlaskConical} accent="var(--color-tone-sky)">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                        <th className="py-2 pr-3">Panel</th>
                        <th className="py-2 pr-3">Test</th>
                        <th className="py-2 pr-3">Value</th>
                        <th className="py-2 pr-3">Unit</th>
                        <th className="py-2 pr-3">Reference</th>
                        <th className="py-2 pr-3">Flag</th>
                        <th className="py-2 pr-3">Taken</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {extras.labs.map((l, i) => (
                        <tr key={i}>
                          <td className="py-2 pr-3 text-muted-foreground">{l.panel}</td>
                          <td className="py-2 pr-3 font-medium text-foreground">{l.test}</td>
                          <td className="py-2 pr-3 font-semibold" style={{ color: labFlagColor(l.flag) }}>{l.value}</td>
                          <td className="py-2 pr-3 text-muted-foreground">{l.unit}</td>
                          <td className="py-2 pr-3 text-muted-foreground">{l.ref}</td>
                          <td className="py-2 pr-3">
                            <span
                              className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                              style={{ background: `color-mix(in oklab, ${labFlagColor(l.flag)} 18%, transparent)`, color: labFlagColor(l.flag) }}
                            >
                              {l.flag}
                            </span>
                          </td>
                          <td className="py-2 pr-3 text-muted-foreground">{l.takenAt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Box>
            </TabsContent>

            {/* I/O */}
            <TabsContent value="io" className="mt-0">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                <Box title="Intake" icon={Droplet} accent="var(--color-tone-sky)">
                  <div className="text-3xl font-semibold text-foreground">{extras.io.totals.intake} <span className="text-sm font-normal text-muted-foreground">mL</span></div>
                  <div className="mt-1 text-xs text-muted-foreground">Since shift start ({extras.io.shiftStart})</div>
                </Box>
                <Box title="Output" icon={Droplet} accent="var(--color-tone-amber)">
                  <div className="text-3xl font-semibold text-foreground">{extras.io.totals.output} <span className="text-sm font-normal text-muted-foreground">mL</span></div>
                  <div className="mt-1 text-xs text-muted-foreground">Urine + drains + losses</div>
                </Box>
                <Box title="Balance" icon={Activity} accent={extras.io.totals.balance >= 0 ? "var(--color-tone-mint)" : "var(--color-tone-rose)"}>
                  <div
                    className="text-3xl font-semibold"
                    style={{ color: extras.io.totals.balance >= 0 ? "var(--color-tone-mint)" : "var(--color-tone-rose)" }}
                  >
                    {extras.io.totals.balance > 0 ? "+" : ""}{extras.io.totals.balance} <span className="text-sm font-normal text-muted-foreground">mL</span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{extras.io.totals.balance >= 0 ? "Positive balance" : "Negative balance"}</div>
                </Box>
              </div>
              <div className="mt-5">
                <Box title="Hourly entries" icon={ClipboardList} accent="var(--color-tone-teal)">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                          <th className="py-2 pr-3">Time</th>
                          <th className="py-2 pr-3">Intake</th>
                          <th className="py-2 pr-3 text-right">mL in</th>
                          <th className="py-2 pr-3">Output</th>
                          <th className="py-2 pr-3 text-right">mL out</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {extras.io.entries.map((e) => {
                          const intakeMl = e.intake.reduce((s, x) => s + x.ml, 0);
                          const outputMl = e.output.reduce((s, x) => s + x.ml, 0);
                          return (
                            <tr key={e.time}>
                              <td className="py-2 pr-3 font-medium text-foreground">{e.time}</td>
                              <td className="py-2 pr-3 text-muted-foreground">{e.intake.map((i) => `${i.route} ${i.item}`).join(", ")}</td>
                              <td className="py-2 pr-3 text-right font-semibold" style={{ color: "var(--color-tone-sky)" }}>{intakeMl}</td>
                              <td className="py-2 pr-3 text-muted-foreground">{e.output.map((o) => `${o.route} ${o.item}`).join(", ")}</td>
                              <td className="py-2 pr-3 text-right font-semibold" style={{ color: "var(--color-tone-amber)" }}>{outputMl}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Box>
              </div>
            </TabsContent>

            {/* NOTES */}
            <TabsContent value="notes" className="mt-0">
              <Box title="Nursing notes — this shift" icon={NotebookPen} accent="var(--color-tone-violet)">
                {dbPatient && !dbNotes?.length ? (
                  <p className="text-sm text-muted-foreground">No nursing notes recorded</p>
                ) : (
                  <ul className="space-y-3">
                    {(dbNotes ?? extras.notes).map((n: any, i: number) => (
                      <li key={n.id ?? i} className="rounded-xl border border-border bg-background/60 p-3">
                        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                          <span className="font-semibold text-foreground">
                            {n.recorded_at ? new Date(n.recorded_at).toLocaleString() : n.time}
                          </span>
                          <span>·</span>
                          <span>{n.profiles?.full_name ?? n.author ?? "Unknown"}</span>
                          <span
                            className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold"
                            style={{ background: "color-mix(in oklab, var(--color-tone-violet) 18%, transparent)", color: "var(--color-tone-violet)" }}
                          >
                            {n.note_type ?? n.type}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-foreground">{n.body}</p>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-4">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Add note</label>
                  <textarea
                    placeholder="Type a new nursing note…"
                    className="mt-1 h-24 w-full resize-none rounded-lg border border-border bg-background/60 p-3 text-sm outline-none focus:border-primary"
                  />
                </div>
              </Box>
            </TabsContent>

            {/* CARE PLAN */}
            <TabsContent value="careplan" className="mt-0">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {extras.carePlan.map((cp, i) => {
                  const tone =
                    cp.status === "active" ? "var(--color-tone-amber)"
                    : cp.status === "resolved" ? "var(--color-tone-mint)"
                    : "var(--color-tone-teal)";
                  return (
                    <Box key={i} title={cp.problem} icon={ListChecks} accent={tone}>
                      <div className="space-y-3 text-sm">
                        <KV k="Goal" v={cp.goal} />
                        <div>
                          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Interventions</div>
                          <ul className="mt-1 list-disc space-y-1 pl-5 text-foreground">
                            {cp.interventions.map((iv, k) => <li key={k}>{iv}</li>)}
                          </ul>
                        </div>
                        <KV k="Evaluation" v={cp.evaluation} />
                        <div>
                          <span
                            className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                            style={{ background: `color-mix(in oklab, ${tone} 18%, transparent)`, color: tone }}
                          >
                            {cp.status}
                          </span>
                        </div>
                      </div>
                    </Box>
                  );
                })}
              </div>
            </TabsContent>

            {/* HANDOVER */}
            <TabsContent value="handover" className="mt-0">
              <HandoverTypeSelector value={handoverType} onChange={setHandoverType} />
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <HandoverExtraForm type={handoverType} patient={patient} />
                <Box title="Situation" icon={AlertTriangle} accent="var(--color-tone-rose)">
                  <p className="text-sm leading-relaxed text-foreground">{extras.handover.situation}</p>
                </Box>
                <Box title="Background" icon={BookOpen} accent="var(--color-tone-teal)">
                  <p className="text-sm leading-relaxed text-foreground">{extras.handover.background}</p>
                </Box>
                <Box title="Assessment" icon={Stethoscope} accent="var(--color-tone-sky)">
                  <p className="text-sm leading-relaxed text-foreground">{extras.handover.assessment}</p>
                </Box>
                <Box title="Recommendation" icon={Send} accent="var(--color-tone-mint)">
                  <p className="text-sm leading-relaxed text-foreground">{extras.handover.recommendation}</p>
                </Box>
                <Box title="Pending tasks" icon={ListChecks} accent="var(--color-tone-amber)" className="md:col-span-2">
                  <ul className="divide-y divide-border">
                    {extras.handover.pendingTasks.map((t, i) => {
                      const tone =
                        t.priority === "high" ? "var(--color-destructive)"
                        : t.priority === "med" ? "var(--color-tone-amber)"
                        : "var(--color-tone-sky)";
                      return (
                        <li key={i} className="flex items-center justify-between gap-3 py-2.5">
                          <div className="flex items-center gap-3">
                            <input type="checkbox" className="h-4 w-4 rounded border-border" />
                            <div>
                              <div className="text-sm font-medium text-foreground">{t.task}</div>
                              <div className="text-xs text-muted-foreground">Due {t.due}</div>
                            </div>
                          </div>
                          <span
                            className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                            style={{ background: `color-mix(in oklab, ${tone} 18%, transparent)`, color: tone }}
                          >
                            {t.priority}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </Box>
                <Box title="Free-text handover" icon={ClipboardList} accent="var(--color-tone-violet)" className="md:col-span-2">
                  <textarea
                    defaultValue={`S: ${extras.handover.situation}\n\nB: ${extras.handover.background}\n\nA: ${extras.handover.assessment}\n\nR: ${extras.handover.recommendation}`}
                    className="h-44 w-full resize-none rounded-lg border border-border bg-background/60 p-3 text-sm leading-relaxed outline-none focus:border-primary"
                  />
                </Box>
              </div>
            </TabsContent>

            {/* ASSESSMENT */}
            <TabsContent value="assess" className="mt-0 space-y-4">
              <Box title="Systems assessment" icon={Stethoscope} accent="var(--color-tone-sky)">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {[
                    { s: "Neurological", f: "GCS 15, alert & oriented ×3, PERRLA, no focal deficits." },
                    { s: "Cardiovascular", f: `HR ${patient.vitals.hr} regular, BP ${patient.vitals.bp}, peripheral pulses +2, no oedema.` },
                    { s: "Respiratory", f: `RR ${patient.vitals.rr}, SpO₂ ${patient.vitals.spo2}% RA, bilateral air entry, occasional crackles RLL.` },
                    { s: "GI / Nutrition", f: "Abdomen soft, non-tender, bowel sounds present. On soft diet." },
                    { s: "Genitourinary", f: "Voiding clear urine, no catheter, no dysuria." },
                    { s: "Skin / Integument", f: "Braden 18. Intact, no pressure injuries. IV site R forearm clean, dry." },
                  ].map((r) => (
                    <div key={r.s} className="rounded-lg border border-border bg-background/60 p-3">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{r.s}</div>
                      <p className="mt-1 text-sm text-foreground">{r.f}</p>
                    </div>
                  ))}
                </div>
              </Box>
              <Box title="Clinical impression · AI Prototype" icon={Brain} accent="var(--color-tone-violet)">
                <p className="text-sm leading-relaxed text-foreground">
                  Trends suggest gradual clinical improvement; SpO₂ stable, temperature trending down.
                  Continue current plan, reassess pain and respiratory effort every 4 hours.
                </p>
              </Box>
            </TabsContent>

            {/* MEDICATION ADMINISTRATION */}
            <TabsContent value="meds" className="mt-0 space-y-4">
              <Box title="Medication administration record (MAR)" icon={Pill} accent="var(--color-tone-violet)">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                        <th className="py-2 pr-3">Drug</th>
                        <th className="py-2 pr-3">Dose</th>
                        <th className="py-2 pr-3">Route</th>
                        <th className="py-2 pr-3">Freq</th>
                        <th className="py-2 pr-3">Next</th>
                        <th className="py-2 pr-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {patient.medications.map((m) => {
                        const tone = m.status === "due" ? "var(--color-tone-amber)"
                          : m.status === "given" ? "var(--color-tone-mint)" : "var(--color-tone-sky)";
                        return (
                          <tr key={m.name}>
                            <td className="py-2 pr-3 font-medium text-foreground">{m.name}</td>
                            <td className="py-2 pr-3 text-muted-foreground">{m.dose}</td>
                            <td className="py-2 pr-3 text-muted-foreground">{m.route}</td>
                            <td className="py-2 pr-3 text-muted-foreground">{m.freq}</td>
                            <td className="py-2 pr-3 text-muted-foreground">{m.nextDue}</td>
                            <td className="py-2 pr-3">
                              <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase" style={{ background: `color-mix(in oklab, ${tone} 18%, transparent)`, color: tone }}>{m.status}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Box>
            </TabsContent>

            {/* RADIOLOGY */}
            <TabsContent value="radiology" className="mt-0 space-y-4">
              <Box title="Imaging studies" icon={Scan} accent="var(--color-tone-teal)">
                <ul className="divide-y divide-border">
                  {[
                    { study: "Chest X-Ray PA", date: "2026-05-26 09:12", status: "Reported", finding: "Right lower lobe consolidation, no effusion." },
                    { study: "CT Chest (contrast)", date: "2026-05-26 16:40", status: "Reported", finding: "Consolidation confirmed. No PE." },
                    { study: "USG Abdomen", date: "2026-05-27 07:20", status: "Pending", finding: "Awaiting radiologist read." },
                  ].map((r) => (
                    <li key={r.study} className="flex items-start justify-between gap-3 py-2.5">
                      <div>
                        <div className="text-sm font-medium text-foreground">{r.study}</div>
                        <div className="text-xs text-muted-foreground">{r.date} · {r.finding}</div>
                      </div>
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase text-secondary-foreground">{r.status}</span>
                    </li>
                  ))}
                </ul>
              </Box>
            </TabsContent>

            {/* PROCEDURE DOCUMENTATION */}
            <TabsContent value="procdoc" className="mt-0 space-y-4">
              <Box title="Procedures — this admission" icon={Workflow} accent="var(--color-tone-sky)">
                <ul className="divide-y divide-border">
                  {[
                    { p: "Peripheral IV cannulation", when: "2026-05-25 10:14", by: "N. Priya", note: "20G, R forearm, first attempt." },
                    { p: "Nebulisation — Salbutamol", when: "2026-05-26 06:00", by: "N. Aisha", note: "Tolerated well, SpO₂ 96→98%." },
                    { p: "Blood culture ×2", when: "2026-05-25 22:30", by: "N. Priya", note: "Aseptic technique, sent to lab." },
                  ].map((x) => (
                    <li key={x.p} className="py-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">{x.p}</span>
                        <span className="text-xs text-muted-foreground">{x.when} · {x.by}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{x.note}</p>
                    </li>
                  ))}
                </ul>
              </Box>
            </TabsContent>

            {/* DISCHARGE PLANNING */}
            <TabsContent value="discharge" className="mt-0 space-y-4">
              <Box title="Discharge readiness" icon={FileText} accent="var(--color-tone-mint)">
                <ul className="space-y-2 text-sm">
                  {[
                    ["Medical stability", true],
                    ["Medication reconciliation", true],
                    ["Patient education completed", false],
                    ["Follow-up appointment scheduled", false],
                    ["Home support / transport arranged", true],
                  ].map(([k, ok]) => (
                    <li key={String(k)} className="flex items-center justify-between rounded-lg border border-border bg-background/60 px-3 py-2">
                      <span className="text-foreground">{String(k)}</span>
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase" style={{ background: ok ? "color-mix(in oklab, var(--color-tone-mint) 18%, transparent)" : "color-mix(in oklab, var(--color-tone-amber) 18%, transparent)", color: ok ? "var(--color-tone-mint)" : "var(--color-tone-amber)" }}>{ok ? "Done" : "Pending"}</span>
                    </li>
                  ))}
                </ul>
              </Box>
              <Box title="Estimated date of discharge · AI Prototype" icon={TimerReset} accent="var(--color-tone-violet)">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-semibold text-foreground">2026-05-30</span>
                  <span className="text-xs text-muted-foreground">Confidence 78% · updated hourly</span>
                </div>
              </Box>
            </TabsContent>

            {/* BILLING */}
            <TabsContent value="billing" className="mt-0 space-y-4">
              <Box title="Billing summary" icon={Receipt} accent="var(--color-tone-amber)">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {[
                    ["Bed & nursing", "₹ 24,500"],
                    ["Pharmacy", "₹ 8,720"],
                    ["Investigations", "₹ 12,340"],
                    ["Procedures", "₹ 3,900"],
                    ["Consultation", "₹ 5,000"],
                    ["Consumables", "₹ 2,180"],
                    ["Sub-total", "₹ 56,640"],
                    ["Estimated balance", "₹ 12,300"],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-lg border border-border bg-background/60 px-3 py-2">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{k}</div>
                      <div className="mt-0.5 text-sm font-semibold text-foreground">{v}</div>
                    </div>
                  ))}
                </div>
              </Box>
            </TabsContent>

            {/* CLINICAL TIMELINE */}
            <TabsContent value="timeline" className="mt-0 space-y-4">
              <Box title="Clinical timeline — this admission" icon={TimerReset} accent="var(--color-tone-teal)">
                <ol className="relative space-y-4 border-l border-border pl-4">
                  {[
                    { t: "Day 0 · 22:14", e: "Admitted via ED — CAP suspected, IV Ceftriaxone started." },
                    { t: "Day 1 · 06:00", e: "Overnight stable. SpO₂ 94→96% RA. Ongoing IV antibiotics." },
                    { t: "Day 1 · 14:20", e: "Chest X-Ray confirms RLL consolidation." },
                    { t: "Day 2 · 09:00", e: "Afebrile x 12h. Oral step-down planned tomorrow if trend continues." },
                    { t: "Day 2 · 15:30", e: "Physiotherapy: chest clearance, ambulation on flat surface." },
                  ].map((x) => (
                    <li key={x.t} className="relative">
                      <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{x.t}</div>
                      <div className="text-sm text-foreground">{x.e}</div>
                    </li>
                  ))}
                </ol>
              </Box>
            </TabsContent>
          </div>


          {/* Sticky action bar */}
          <div className="absolute inset-x-0 bottom-0 z-10 flex items-center gap-2 border-t border-border bg-card/95 px-4 py-2 backdrop-blur">
            <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              Auto-saved just now
            </span>
            <div className="ml-auto flex items-center gap-2">
              <button className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-secondary">
                Save draft
              </button>
              <button className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90">
                Submit
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT — clinical action panel (20%) */}
        <aside className="flex w-[20%] min-w-[240px] shrink-0 flex-col border-l border-border bg-card/60">
          <div className="flex items-center justify-between border-b border-border px-4 py-2">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Documentation
            </div>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              {activeLabel}
            </span>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            <RightPanel section={activeSection} patient={patient} />
          </div>
          <div className="flex items-center gap-2 border-t border-border px-3 py-2">
            <button className="flex-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium hover:bg-secondary">
              Save
            </button>
            <button className="flex-1 rounded-md bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90">
              Submit
            </button>
          </div>
        </aside>
      </Tabs>


      <AIAssistant />
    </div>
  );
}


function labFlagColor(flag: Lab["flag"]) {
  switch (flag) {
    case "critical": return "var(--color-destructive)";
    case "high":     return "var(--color-tone-amber)";
    case "low":      return "var(--color-tone-sky)";
    default:         return "var(--color-tone-mint)";
  }
}

function Box({
  title, icon: Icon, accent, children, className = "",
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm ${className}`}
      style={{ boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${accent} 18%, transparent)` }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1"
        style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
      />
      <header className="mb-4 flex items-center gap-2.5">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ background: `color-mix(in oklab, ${accent} 18%, transparent)`, color: accent }}
        >
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </header>
      {children}
    </section>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/60 pb-1.5 last:border-none last:pb-0">
      <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{k}</dt>
      <dd className="max-w-[60%] text-right text-sm text-foreground">{v}</dd>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-background/60 px-2 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

function Vital({
  icon: Icon, label, value, unit, flag,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: string; unit: string; flag?: boolean;
}) {
  return (
    <div
      className="rounded-xl border border-border bg-background/60 p-3"
      style={flag ? { borderColor: "color-mix(in oklab, var(--color-destructive) 50%, transparent)" } : undefined}
    >
      <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className={`mt-1 text-2xl font-semibold ${flag ? "text-destructive" : "text-foreground"}`}>
        {value} <span className="text-xs font-normal text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}

function HeaderField({ k, v }: { k: string; v: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{k}</div>
      <div className="truncate text-[12px] font-medium text-foreground">{v}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

const inputCls =
  "w-full rounded-md border border-border bg-background/70 px-2.5 py-1.5 text-sm outline-none focus:border-primary";

function RightPanel({ section, patient }: { section: string; patient: PatientFull }) {
  switch (section) {
    case "trends":
    case "summary":
      return (
        <div className="space-y-3">
          <Field label="HR (bpm)"><input className={inputCls} defaultValue={patient.vitals.hr} /></Field>
          <Field label="BP (mmHg)"><input className={inputCls} defaultValue={patient.vitals.bp} /></Field>
          <Field label="RR (/min)"><input className={inputCls} defaultValue={patient.vitals.rr} /></Field>
          <Field label="SpO₂ (%)"><input className={inputCls} defaultValue={patient.vitals.spo2} /></Field>
          <Field label="Temperature (°C)"><input className={inputCls} defaultValue={patient.vitals.temp} /></Field>
          <Field label="Pain score (0–10)"><input className={inputCls} type="number" min={0} max={10} defaultValue={patient.pain.score} /></Field>
          <Field label="GCS (E/V/M)">
            <div className="flex gap-1.5">
              <input className={inputCls} defaultValue={patient.gcs.eye} />
              <input className={inputCls} defaultValue={patient.gcs.verbal} />
              <input className={inputCls} defaultValue={patient.gcs.motor} />
            </div>
          </Field>
        </div>
      );
    case "assess":
      return (
        <div className="space-y-3">
          <Field label="Assessment findings"><textarea rows={4} className={inputCls} placeholder="Objective findings…" /></Field>
          <Field label="Clinical impression"><textarea rows={3} className={inputCls} placeholder="Working impression…" /></Field>
          <Field label="Priority">
            <select className={inputCls} defaultValue="routine">
              <option value="routine">Routine</option>
              <option value="urgent">Urgent</option>
              <option value="stat">STAT</option>
            </select>
          </Field>
        </div>
      );
    case "meds":
      return (
        <div className="space-y-3">
          <Field label="Medication">
            <select className={inputCls}>
              {patient.medications.map((m) => <option key={m.name}>{m.name}</option>)}
            </select>
          </Field>
          <Field label="Administration route"><input className={inputCls} placeholder="IV / PO / SC…" /></Field>
          <Field label="Barcode scan">
            <div className="flex items-center gap-2 rounded-md border border-dashed border-border bg-background/40 px-2.5 py-2 text-xs text-muted-foreground">
              <ScanBarcode className="h-4 w-4" /> Scan patient & drug
            </div>
          </Field>
          <Field label="Remarks"><textarea rows={3} className={inputCls} placeholder="Response, adverse events…" /></Field>
        </div>
      );
    case "notes":
      return (
        <div className="space-y-3">
          <Field label="Note type">
            <select className={inputCls} defaultValue="progress">
              <option value="progress">Progress</option>
              <option value="event">Event</option>
              <option value="handover">Handover</option>
            </select>
          </Field>
          <Field label="Note body"><textarea rows={6} className={inputCls} placeholder="Structured documentation…" /></Field>
          <button className="w-full rounded-md border border-dashed border-primary/40 bg-primary/5 px-2.5 py-1.5 text-xs font-semibold text-primary">
            ✨ AI documentation assist · AI Prototype
          </button>
        </div>
      );
    case "labs":
      return (
        <div className="space-y-3">
          <Field label="Order status">
            <select className={inputCls}>
              <option>Ordered</option><option>Collected</option><option>Resulted</option>
            </select>
          </Field>
          <Field label="Collection time"><input className={inputCls} type="datetime-local" /></Field>
          <Field label="Critical result acknowledged">
            <label className="flex items-center gap-2 text-xs text-foreground">
              <input type="checkbox" className="h-4 w-4 rounded border-border" /> Acknowledge critical value
            </label>
          </Field>
          <Field label="Comments"><textarea rows={3} className={inputCls} /></Field>
        </div>
      );
    case "radiology":
      return (
        <div className="space-y-3">
          <Field label="Modality">
            <select className={inputCls}><option>X-Ray</option><option>CT</option><option>MRI</option><option>USG</option></select>
          </Field>
          <Field label="Region"><input className={inputCls} placeholder="Chest, abdomen…" /></Field>
          <Field label="Clinical indication"><textarea rows={3} className={inputCls} /></Field>
        </div>
      );
    case "io":
      return (
        <div className="space-y-3">
          <Field label="Intake — type"><input className={inputCls} placeholder="Oral / IV / NG…" /></Field>
          <Field label="Volume in (mL)"><input className={inputCls} type="number" /></Field>
          <Field label="Output — type"><input className={inputCls} placeholder="Urine / Drain…" /></Field>
          <Field label="Volume out (mL)"><input className={inputCls} type="number" /></Field>
        </div>
      );
    case "careplan":
      return (
        <div className="space-y-3">
          <Field label="Problem"><input className={inputCls} /></Field>
          <Field label="Goal"><input className={inputCls} /></Field>
          <Field label="Interventions"><textarea rows={4} className={inputCls} /></Field>
          <Field label="Evaluation"><textarea rows={3} className={inputCls} /></Field>
        </div>
      );
    case "handover":
      return (
        <div className="space-y-3">
          <Field label="Situation"><textarea rows={3} className={inputCls} /></Field>
          <Field label="Background"><textarea rows={3} className={inputCls} /></Field>
          <Field label="Assessment"><textarea rows={3} className={inputCls} /></Field>
          <Field label="Recommendation"><textarea rows={3} className={inputCls} /></Field>
        </div>
      );
    case "procdoc":
      return (
        <div className="space-y-3">
          <Field label="Procedure"><input className={inputCls} placeholder="e.g. IV cannulation" /></Field>
          <Field label="Performed by"><input className={inputCls} /></Field>
          <Field label="Time"><input className={inputCls} type="datetime-local" /></Field>
          <Field label="Outcome / notes"><textarea rows={4} className={inputCls} /></Field>
        </div>
      );
    case "discharge":
      return (
        <div className="space-y-3">
          <Field label="Planned discharge date"><input className={inputCls} type="date" /></Field>
          <Field label="Follow-up plan"><textarea rows={4} className={inputCls} /></Field>
          <Field label="Patient education"><textarea rows={3} className={inputCls} /></Field>
        </div>
      );
    case "billing":
      return (
        <div className="space-y-3">
          <Field label="Payer"><input className={inputCls} placeholder="Insurance / Self…" /></Field>
          <Field label="Pre-authorisation #"><input className={inputCls} /></Field>
          <Field label="Notes"><textarea rows={4} className={inputCls} /></Field>
        </div>
      );
    case "timeline":
      return (
        <div className="space-y-3">
          <Field label="Event time"><input className={inputCls} type="datetime-local" /></Field>
          <Field label="Event"><textarea rows={5} className={inputCls} placeholder="Describe the clinical event…" /></Field>
        </div>
      );
    default:
      return (
        <div className="rounded-md border border-dashed border-border bg-background/40 p-3 text-xs text-muted-foreground">
          Select a chart section to open its documentation form.
        </div>
      );
  }
}

function PatientAcuityStrip({ patient }: { patient: PatientFull }) {
  const acuity = useMemo(() => {
    const level = patient.status === "critical" ? 5 : patient.status === "watch" ? 3 : 2;
    const tone =
      level === 5 ? "var(--color-destructive)"
      : level === 4 ? "var(--color-tone-rose)"
      : level === 3 ? "var(--color-tone-amber)"
      : level === 2 ? "var(--color-tone-sky)"
      : "var(--color-tone-mint)";
    return {
      level,
      tone,
      news2: patient.status === "critical" ? 8 : patient.status === "watch" ? 4 : 1,
      careHours: patient.status === "critical" ? 12.0 : patient.status === "watch" ? 6.5 : 3.5,
      fallRisk: patient.status === "critical" ? "High" : patient.status === "watch" ? "Moderate" : "Low",
      braden: patient.status === "critical" ? 12 : patient.status === "watch" ? 16 : 22,
      sepsis: patient.status === "critical" ? "In progress" : "Completed",
      isolation: patient.dept === "icu" ? "Contact" : "Standard",
      aiRisk: patient.status === "critical" ? 94 : patient.status === "watch" ? 67 : 22,
    };
  }, [patient.status, patient.dept]);

  const chipBase =
    "flex flex-col rounded-md border border-border bg-card px-2 py-1 min-w-[3.25rem]";
  const chipLabel = "text-[9px] font-medium uppercase tracking-wider text-muted-foreground";
  const chipValue = "text-xs font-semibold text-foreground";

  return (
    <div className="hidden items-center gap-2 xl:flex">
      <div
        className="flex items-center gap-1.5 rounded-md border px-2 py-1"
        style={{
          borderColor: `color-mix(in oklab, ${acuity.tone} 45%, transparent)`,
          background: `color-mix(in oklab, ${acuity.tone} 12%, var(--color-card))`,
        }}
      >
        <Gauge className="h-3.5 w-3.5 shrink-0" style={{ color: acuity.tone }} />
        <div>
          <div className={chipLabel}>Acuity</div>
          <div className="text-xs font-bold" style={{ color: acuity.tone }}>
            Level {acuity.level}
          </div>
        </div>
      </div>

      <div className={chipBase}>
        <div className={chipLabel}>NEWS2</div>
        <div className={chipValue}>{acuity.news2}</div>
      </div>

      <div className={chipBase}>
        <div className={chipLabel}>Care hrs</div>
        <div className={chipValue}>{acuity.careHours.toFixed(1)}h</div>
      </div>

      <div className={chipBase}>
        <div className={chipLabel}>Fall risk</div>
        <div className="flex items-center gap-1 text-xs font-semibold text-foreground">
          <Footprints className="h-3 w-3 text-muted-foreground" />
          {acuity.fallRisk}
        </div>
      </div>

      <div className={chipBase}>
        <div className={chipLabel}>Braden</div>
        <div className={chipValue}>{acuity.braden}</div>
      </div>

      <div className={chipBase}>
        <div className={chipLabel}>Sepsis</div>
        <div className="flex items-center gap-1 text-xs font-semibold text-foreground">
          <ShieldCheck className="h-3 w-3 text-success" />
          {acuity.sepsis}
        </div>
      </div>

      <div className={chipBase}>
        <div className={chipLabel}>Isolation</div>
        <div className={chipValue}>{acuity.isolation}</div>
      </div>

      <div
        className="flex items-center gap-1.5 rounded-md border px-2 py-1"
        style={{
          borderColor: "color-mix(in oklab, var(--color-primary) 35%, transparent)",
          background: "color-mix(in oklab, var(--color-primary) 8%, var(--color-card))",
        }}
      >
        <BrainCircuit className="h-3.5 w-3.5 shrink-0 text-primary" />
        <div>
          <div className={chipLabel}>AI Risk · Prototype</div>
          <div className="text-xs font-bold text-primary">{acuity.aiRisk}%</div>
        </div>
      </div>
    </div>
  );
}


