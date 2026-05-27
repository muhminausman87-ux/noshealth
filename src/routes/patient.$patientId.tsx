import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Activity, AlertTriangle, ArrowLeft, BookOpen, Brain, ClipboardList,
  Droplet, HeartPulse, Pill, ShieldAlert, Stethoscope, Thermometer, User,
} from "lucide-react";
import { getPatient } from "@/lib/patients";
import { getSession, type Session } from "@/lib/auth";
import { getDept } from "@/lib/departments";
import { AIAssistant } from "@/components/AIAssistant";

export const Route = createFileRoute("/patient/$patientId")({
  head: () => ({ meta: [{ title: "Patient · SyncCare EHR" }] }),
  component: PatientPage,
});

function PatientPage() {
  const { patientId } = useParams({ from: "/patient/$patientId" });
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);

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
                        <div className="text-sm font-medium text-foreground">
                          {m.name} <span className="text-muted-foreground">· {m.dose}</span>
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

          {/* Shift quick notes */}
          <Box title="Shift quick note" icon={ClipboardList} accent="var(--color-tone-sky)" className="md:col-span-2 xl:col-span-3">
            <textarea
              placeholder="Type SBAR handover note here…"
              className="h-28 w-full resize-none rounded-lg border border-border bg-background/60 p-3 text-sm outline-none focus:border-primary"
            />
          </Box>
        </div>
      </main>

      <AIAssistant />
    </div>
  );
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
