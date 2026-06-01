import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Activity, AlertTriangle, ArrowLeft, BookOpen, Brain, ClipboardList,
  Droplet, FlaskConical, HeartCrack, HeartPulse, LineChart, ListChecks,
  Network, NotebookPen, Pill, Send, ShieldAlert, Stethoscope, Thermometer, User,
} from "lucide-react";
import { getPatient } from "@/lib/patients";
import { getClinicalExtras, type Lab } from "@/lib/patient-extras";
import { getSession, type Session } from "@/lib/auth";
import { getDept } from "@/lib/departments";
import { AIAssistant } from "@/components/AIAssistant";
import {
  VitalsTrend, GcsTrend, LabEntry, EHRModules, CPRSheet,
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

  useEffect(() => {
    const s = getSession();
    if (!s) { navigate({ to: "/login" }); return; }
    setSession(s);
  }, [navigate]);

  const patient = getPatient(patientId);

  if (!session) return null;
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

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/85 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-6 py-3">
          <Link
            to="/"
            className="flex items-center gap-1.5 rounded-md border border-border bg-secondary/60 px-3 py-1.5 text-sm hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-primary">
              <User className="h-5 w-5" />
            </div>
            <div>
              <div className="text-base font-semibold text-foreground">{patient.name}</div>
              <div className="text-xs text-muted-foreground">
                {patient.sex} · {patient.age} y · MRN {patient.mrn} · Room {patient.room}
              </div>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span
              className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider"
              style={{ background: `color-mix(in oklab, ${meta.color} 18%, transparent)`, color: meta.color }}
            >
              {meta.short}
            </span>
            <span
              className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider"
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
              {patient.status}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-6 py-6">
        {/* Allergy strip */}
        <div
          className="mb-5 flex items-start gap-3 rounded-xl border p-4"
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

        {/* Boxes */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {/* Current admission */}
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

          {/* GCS */}
          <Box title="Glasgow Coma Scale" icon={Brain} accent={gcsTone}>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-semibold" style={{ color: gcsTone }}>{gcsTotal}</span>
              <span className="text-sm text-muted-foreground">/ 15</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <Mini label="Eye" value={`${patient.gcs.eye}/4`} />
              <Mini label="Verbal" value={`${patient.gcs.verbal}/5`} />
              <Mini label="Motor" value={`${patient.gcs.motor}/6`} />
            </div>
          </Box>

          {/* Vital signs */}
          <Box title="Vital signs" icon={HeartPulse} accent="var(--color-tone-rose)" className="md:col-span-2 xl:col-span-2">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              <Vital icon={HeartPulse} label="HR"   value={`${patient.vitals.hr}`} unit="bpm"  flag={patient.vitals.hr > 110 || patient.vitals.hr < 50} />
              <Vital icon={Activity}   label="BP"   value={patient.vitals.bp}      unit="mmHg" />
              <Vital icon={Stethoscope}label="RR"   value={`${patient.vitals.rr}`} unit="/min" flag={patient.vitals.rr > 24} />
              <Vital icon={Droplet}    label="SpO₂" value={`${patient.vitals.spo2}`} unit="%"  flag={patient.vitals.spo2 < 94} />
              <Vital icon={Thermometer}label="Temp" value={patient.vitals.temp}   unit="°C"   flag={parseFloat(patient.vitals.temp) > 38} />
            </div>
          </Box>

          {/* Pain management */}
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

          {/* Medications */}
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

        {/* Clinical tabs */}
        <div className="mt-6">
          <Tabs defaultValue="labs" className="w-full">
            <TabsList className="flex w-full flex-wrap gap-1 bg-card/60 p-1">
              <TabsTrigger value="labs" className="gap-1.5"><FlaskConical className="h-3.5 w-3.5" />Labs</TabsTrigger>
              <TabsTrigger value="trends" className="gap-1.5"><LineChart className="h-3.5 w-3.5" />Trends & entry</TabsTrigger>
              <TabsTrigger value="io" className="gap-1.5"><Droplet className="h-3.5 w-3.5" />I / O chart</TabsTrigger>
              <TabsTrigger value="notes" className="gap-1.5"><NotebookPen className="h-3.5 w-3.5" />Nursing notes</TabsTrigger>
              <TabsTrigger value="careplan" className="gap-1.5"><ListChecks className="h-3.5 w-3.5" />Care plan</TabsTrigger>
              <TabsTrigger value="cpr" className="gap-1.5"><HeartCrack className="h-3.5 w-3.5" />CPR</TabsTrigger>
              <TabsTrigger value="ehr" className="gap-1.5"><Network className="h-3.5 w-3.5" />EHR modules</TabsTrigger>
              <TabsTrigger value="handover" className="gap-1.5"><Send className="h-3.5 w-3.5" />Handover</TabsTrigger>
            </TabsList>

            {/* TRENDS & ENTRY */}
            <TabsContent value="trends" className="mt-4 space-y-5">
              <VitalsTrend patient={patient} />
              <GcsTrend patient={patient} />
              <LabEntry />
            </TabsContent>

            {/* CPR */}
            <TabsContent value="cpr" className="mt-4">
              <CPRSheet patient={patient} />
            </TabsContent>

            {/* EHR */}
            <TabsContent value="ehr" className="mt-4">
              <EHRModules />
            </TabsContent>


            {/* LABS */}
            <TabsContent value="labs" className="mt-4">
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
            <TabsContent value="io" className="mt-4">
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
            <TabsContent value="notes" className="mt-4">
              <Box title="Nursing notes — this shift" icon={NotebookPen} accent="var(--color-tone-violet)">
                <ul className="space-y-3">
                  {extras.notes.map((n, i) => (
                    <li key={i} className="rounded-xl border border-border bg-background/60 p-3">
                      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                        <span className="font-semibold text-foreground">{n.time}</span>
                        <span>·</span>
                        <span>{n.author}</span>
                        <span
                          className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold"
                          style={{ background: "color-mix(in oklab, var(--color-tone-violet) 18%, transparent)", color: "var(--color-tone-violet)" }}
                        >
                          {n.type}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-foreground">{n.body}</p>
                    </li>
                  ))}
                </ul>
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
            <TabsContent value="careplan" className="mt-4">
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
            <TabsContent value="handover" className="mt-4">
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
          </Tabs>
        </div>
      </main>

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
