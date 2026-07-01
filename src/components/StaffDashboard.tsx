import { Link } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  Bell,
  Brain,
  ClipboardList,
  Clock,
  Eye,
  FileText,
  Flame,
  Pill,
  Quote,
  Sparkles,
  Stethoscope,
  Users,
  ChevronRight,
} from "lucide-react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getDept } from "@/lib/departments";
import type { Session } from "@/lib/auth";

const QUOTES = [
  { q: "Caring is the essence of nursing.", a: "Jean Watson" },
  { q: "To do what nobody else will do, in a way nobody else can — that is to be a nurse.", a: "Rawsi Williams" },
  { q: "Save one life, you're a hero. Save a hundred lives, you're a nurse.", a: "Anonymous" },
  { q: "Constant attention by a good nurse may be just as important as a major operation by a surgeon.", a: "Dag Hammarskjöld" },
];

interface DeptPatient {
  id: string;
  name: string;
  age: number;
  sex: string;
  mrn: string;
  room: string | null;
  status: "stable" | "watch" | "critical";
  shortNote: string;
}

interface Props { session: Session }

/** Simple vital-sign alert logic (adult defaults). */
function vitalAlerts(v: {
  heart_rate: number | null;
  systolic_bp: number | null;
  diastolic_bp: number | null;
  respiratory_rate: number | null;
  spo2: number | null;
  temperature: number | string | null;
}): string[] {
  const alerts: string[] = [];
  if (v.heart_rate != null && (v.heart_rate > 120 || v.heart_rate < 50)) alerts.push(`HR ${v.heart_rate}`);
  if (v.systolic_bp != null && (v.systolic_bp < 90 || v.systolic_bp > 180)) alerts.push(`BP ${v.systolic_bp}/${v.diastolic_bp ?? "-"}`);
  if (v.respiratory_rate != null && (v.respiratory_rate > 24 || v.respiratory_rate < 10)) alerts.push(`RR ${v.respiratory_rate}`);
  if (v.spo2 != null && v.spo2 < 92) alerts.push(`SpO₂ ${v.spo2}%`);
  const t = typeof v.temperature === "string" ? parseFloat(v.temperature) : v.temperature;
  if (t != null && !Number.isNaN(t) && (t >= 38.5 || t <= 35.5)) alerts.push(`Temp ${t}°`);
  return alerts;
}

export function StaffDashboard({ session }: Props) {
  const meta = getDept(session.activeDept);

  // Patients in this dept (RLS-scoped)
  const { data: patients = [] } = useQuery<DeptPatient[]>({
    queryKey: ["patients", "by-dept", session.activeDept],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patients")
        .select("id, full_name, age, sex, mrn, room, status, short_note, admitted_on")
        .eq("dept", session.activeDept)
        .is("discharged_on", null)
        .order("admitted_on", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((p) => ({
        id: p.id,
        name: p.full_name,
        age: p.age,
        sex: p.sex,
        mrn: p.mrn,
        room: p.room,
        status: p.status as "stable" | "watch" | "critical",
        shortNote: p.short_note ?? "",
      }));
    },
  });

  const patientIds = patients.map((p) => p.id);
  const idKey = patientIds.join(",");

  // Latest vitals per patient (fetched together, sorted client-side)
  const { data: latestVitals = [] } = useQuery({
    enabled: patientIds.length > 0,
    queryKey: ["vitals", "latest", idKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vitals")
        .select("patient_id, heart_rate, systolic_bp, diastolic_bp, respiratory_rate, spo2, temperature, recorded_at")
        .in("patient_id", patientIds)
        .order("recorded_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      const seen = new Set<string>();
      const latest: typeof data = [];
      for (const row of data ?? []) {
        if (seen.has(row.patient_id)) continue;
        seen.add(row.patient_id);
        latest.push(row);
      }
      return latest;
    },
  });

  // Medications due today, active
  const { data: medsDue = [] } = useQuery({
    enabled: patientIds.length > 0,
    queryKey: ["meds", "due-today", idKey],
    queryFn: async () => {
      const start = new Date(); start.setHours(0, 0, 0, 0);
      const end = new Date(); end.setHours(23, 59, 59, 999);
      const { data, error } = await supabase
        .from("medications")
        .select("id, patient_id, medication_name, dose, route, frequency, next_due, status")
        .in("patient_id", patientIds)
        .eq("status", "active")
        .gte("next_due", start.toISOString())
        .lte("next_due", end.toISOString())
        .order("next_due", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  // Recent nursing notes across assigned patients
  const { data: recentNotes = [] } = useQuery({
    enabled: patientIds.length > 0,
    queryKey: ["notes", "recent", idKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nursing_notes")
        .select("id, patient_id, note_type, body, recorded_at")
        .in("patient_id", patientIds)
        .order("recorded_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data ?? [];
    },
  });

  const patientById = new Map(patients.map((p) => [p.id, p]));
  const vitalsAlerts = latestVitals
    .map((v) => ({ v, alerts: vitalAlerts(v) }))
    .filter((x) => x.alerts.length > 0)
    .slice(0, 5);

  const criticalCount = patients.filter((p) => p.status === "critical").length;
  const watchCritical = patients.filter((p) => p.status !== "stable").length;

  const priorityPatient =
    patients.find((p) => p.status === "critical") ??
    patients.find((p) => p.status === "watch") ??
    patients[0];

  // Notifications = synthesized from data (no placeholders)
  const notifications: { id: string; icon: any; tone: string; title: string; sub: string; to?: string; params?: any }[] = [];
  for (const { v, alerts } of vitalsAlerts) {
    const p = patientById.get(v.patient_id);
    if (!p) continue;
    notifications.push({
      id: `v-${v.patient_id}`,
      icon: Activity,
      tone: "var(--color-destructive)",
      title: `Abnormal vitals · ${p.name}`,
      sub: alerts.join(" · "),
      to: "/patient/$patientId",
      params: { patientId: p.id },
    });
  }
  for (const m of medsDue.slice(0, 4)) {
    const p = patientById.get(m.patient_id);
    if (!p) continue;
    const t = new Date(m.next_due as string);
    notifications.push({
      id: `m-${m.id}`,
      icon: Pill,
      tone: "var(--color-tone-violet)",
      title: `${m.medication_name} due · ${p.name}`,
      sub: `${m.dose ?? ""} ${m.route ?? ""} · ${t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
      to: "/patient/$patientId",
      params: { patientId: p.id },
    });
  }

  // Mock shift metrics
  const shiftStart = 7;
  const shiftEnd = 19;
  const now = new Date();
  const hour = now.getHours() + now.getMinutes() / 60;
  const worked = Math.max(0, Math.min(shiftEnd - shiftStart, hour - shiftStart));
  const remaining = Math.max(0, shiftEnd - shiftStart - worked);
  const pct = Math.min(100, (worked / (shiftEnd - shiftStart)) * 100);

  const burnout = Math.min(95, 38 + patients.length * 6 + (session.pulled ? 12 : 0));
  const burnTone =
    burnout > 70 ? { label: "High", color: "var(--color-destructive)", tip: "Take a 10-min break — debrief with charge." }
    : burnout > 45 ? { label: "Moderate", color: "var(--color-tone-amber)", tip: "Hydrate, micro-pause between rounds." }
    : { label: "Low", color: "var(--color-tone-mint)", tip: "Pace looks healthy — keep it up." };

  const quote = QUOTES[now.getDate() % QUOTES.length];

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      {/* Greeting + Quote */}
      <BoxCard accent="var(--color-tone-teal)" className="lg:col-span-2">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {now.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short" })}
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Good {hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening"}, {session.name.replace(/^RN\s+/, "")}
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {meta.name} · {session.pulled ? "Covering shift" : "Home unit"}
            </p>
          </div>
        </div>
        <div className="mt-4 flex gap-3 rounded-xl bg-background/40 p-4">
          <Quote className="mt-0.5 h-5 w-5 shrink-0 text-primary/80" />
          <div>
            <p className="text-[15px] italic leading-relaxed text-foreground">"{quote.q}"</p>
            <p className="mt-1 text-xs text-muted-foreground">— {quote.a}</p>
          </div>
        </div>
      </BoxCard>

      {/* Shift Summary */}
      <BoxCard accent="var(--color-tone-sky)">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--color-tone-sky)]/15 text-[color:var(--color-tone-sky)]">
            <Clock className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Shift summary
            </div>
            <div className="mt-0.5 flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-foreground">{remaining.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">h to go</span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-background/60">
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--color-tone-sky)" }} />
            </div>
            <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground">
              <span>{worked.toFixed(1)}h done · 07:00 → 19:00</span>
              <span>{patients.length} pt · {medsDue.length} meds</span>
            </div>
          </div>
        </div>
      </BoxCard>

      {/* Burnout */}
      <BoxCard accent={burnTone.color}>
        <div className="flex items-start gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: `color-mix(in oklab, ${burnTone.color} 18%, transparent)`, color: burnTone.color }}
          >
            <Flame className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Burn-out predictor</div>
              <Brain className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="mt-0.5 flex items-baseline gap-2">
              <span className="text-3xl font-semibold" style={{ color: burnTone.color }}>{burnout}</span>
              <span className="text-sm font-medium" style={{ color: burnTone.color }}>{burnTone.label}</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{burnTone.tip}</p>
          </div>
        </div>
      </BoxCard>

      {/* KPI stats */}
      <BoxCard accent="var(--color-tone-mint)">
        <Stat label="Assigned patients" value={patients.length} hint="under your care" />
      </BoxCard>
      <BoxCard accent="var(--color-destructive)">
        <Stat label="Critical patients" value={criticalCount} hint={`${watchCritical} watch/critical`} />
      </BoxCard>
      <BoxCard accent="var(--color-tone-violet)">
        <Stat label="Meds due today" value={medsDue.length} hint="active orders" />
      </BoxCard>

      {/* Quick actions */}
      <BoxCard accent="var(--color-tone-teal)" className="lg:col-span-3">
        <div className="mb-3 flex items-center gap-2">
          <Stethoscope className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Quick actions
          </h3>
          {priorityPatient && (
            <span className="ml-2 text-[11px] text-muted-foreground">
              for <strong className="text-foreground">{priorityPatient.name}</strong>
              {priorityPatient.room ? ` · ${priorityPatient.room}` : ""}
            </span>
          )}
        </div>
        {priorityPatient ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <QuickAction to="/patient/$patientId" params={{ patientId: priorityPatient.id }} icon={Activity} label="Record Vitals" tone="var(--color-tone-sky)" />
            <QuickAction to="/patient/$patientId" params={{ patientId: priorityPatient.id }} icon={FileText} label="Add Nursing Note" tone="var(--color-tone-mint)" />
            <QuickAction to="/patient/$patientId" params={{ patientId: priorityPatient.id }} icon={Eye} label="View Patient" tone="var(--color-tone-teal)" />
            <QuickAction to="/patient/$patientId" params={{ patientId: priorityPatient.id }} icon={Pill} label="Medication Record" tone="var(--color-tone-violet)" />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No assigned patient yet — actions will appear once a patient is on your list.</p>
        )}
      </BoxCard>

      {/* Vital alerts */}
      <div className="lg:col-span-2">
        <SectionHeader icon={AlertTriangle} title="Latest vital-sign alerts" count={vitalsAlerts.length} />
        {vitalsAlerts.length === 0 ? (
          <EmptyCard text="No abnormal vitals recorded." accent="var(--color-tone-mint)" />
        ) : (
          <div className="space-y-2">
            {vitalsAlerts.map(({ v, alerts }) => {
              const p = patientById.get(v.patient_id);
              if (!p) return null;
              return (
                <Link
                  key={v.patient_id}
                  to="/patient/$patientId"
                  params={{ patientId: p.id }}
                  className="flex items-start gap-3 rounded-xl border border-border bg-card p-3 shadow-sm transition hover:border-destructive/40"
                  style={{ borderLeft: "4px solid var(--color-destructive)" }}
                >
                  <Activity className="mt-0.5 h-4 w-4 text-destructive" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-foreground">{p.name}</span>
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(v.recorded_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      MRN {p.mrn}{p.room ? ` · ${p.room}` : ""} · {alerts.join(" · ")}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Recent nursing notes */}
        <div className="mt-6">
          <SectionHeader icon={ClipboardList} title="Recent nursing notes" count={recentNotes.length} />
          {recentNotes.length === 0 ? (
            <EmptyCard text="No nursing notes yet." accent="var(--color-tone-teal)" />
          ) : (
            <div className="space-y-2">
              {recentNotes.map((n) => {
                const p = patientById.get(n.patient_id);
                return (
                  <Link
                    key={n.id}
                    to="/patient/$patientId"
                    params={{ patientId: n.patient_id }}
                    className="block rounded-xl border border-border bg-card p-3 shadow-sm transition hover:border-primary/40"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {n.note_type}
                        </span>
                        <span className="truncate text-sm font-semibold text-foreground">{p?.name ?? "Patient"}</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(n.recorded_at).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{n.body}</p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Notification panel */}
      <div>
        <SectionHeader icon={Bell} title="Notifications" count={notifications.length} />
        {notifications.length === 0 ? (
          <EmptyCard text="You're all caught up." accent="var(--color-tone-mint)" />
        ) : (
          <div className="space-y-2">
            {notifications.slice(0, 8).map((n) => {
              const Icon = n.icon;
              const inner = (
                <div
                  className="flex items-start gap-3 rounded-xl border border-border bg-card p-3 shadow-sm transition hover:border-primary/40"
                  style={{ borderLeft: `4px solid ${n.tone}` }}
                >
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: `color-mix(in oklab, ${n.tone} 18%, transparent)`, color: n.tone }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-foreground">{n.title}</div>
                    <div className="truncate text-xs text-muted-foreground">{n.sub}</div>
                  </div>
                </div>
              );
              return n.to ? (
                <Link key={n.id} to={n.to} params={n.params}>{inner}</Link>
              ) : (
                <div key={n.id}>{inner}</div>
              );
            })}
          </div>
        )}
      </div>

      {/* Patient list */}
      <div className="lg:col-span-3">
        <div className="mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            My assigned patients
          </h3>
          <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">
            {patients.length}
          </span>
        </div>

        {patients.length === 0 ? (
          <EmptyCard text="No patients found." accent="var(--color-tone-teal)" />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {patients.map((p) => {
              const tone =
                p.status === "critical" ? "var(--color-destructive)"
                : p.status === "watch" ? "var(--color-tone-amber)"
                : "var(--color-tone-mint)";
              return (
                <Link
                  key={p.id}
                  to="/patient/$patientId"
                  params={{ patientId: p.id }}
                  className="group block rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
                  style={{ borderLeft: `4px solid ${tone}` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        {p.room ?? "Room —"} · {p.age}{p.sex}
                      </div>
                      <div className="text-base font-semibold text-foreground">{p.name}</div>
                    </div>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                      style={{ background: `color-mix(in oklab, ${tone} 18%, transparent)`, color: tone }}
                    >
                      {p.status}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.shortNote}</p>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">MRN {p.mrn}</span>
                    <span className="flex items-center gap-1 text-primary opacity-0 transition-opacity group-hover:opacity-100">
                      Open <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, count }: { icon: any; title: string; count: number }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <Icon className="h-4 w-4 text-primary" />
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">{count}</span>
    </div>
  );
}

function EmptyCard({ text, accent }: { text: string; accent: string }) {
  return (
    <BoxCard accent={accent}>
      <p className="text-sm text-muted-foreground">{text}</p>
    </BoxCard>
  );
}

function QuickAction({
  to, params, icon: Icon, label, tone,
}: { to: string; params: any; icon: any; label: string; tone: string }) {
  return (
    <Link
      to={to}
      params={params}
      className="group flex items-center gap-2 rounded-xl border border-border bg-card p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
      style={{ borderLeft: `3px solid ${tone}` }}
    >
      <div
        className="flex h-9 w-9 items-center justify-center rounded-lg"
        style={{ background: `color-mix(in oklab, ${tone} 18%, transparent)`, color: tone }}
      >
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-sm font-medium text-foreground">{label}</span>
    </Link>
  );
}

function BoxCard({
  children,
  accent,
  className = "",
}: {
  children: React.ReactNode;
  accent: string;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
      />
      {children}
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: number | string; hint: string }) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-3xl font-semibold text-foreground">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}
