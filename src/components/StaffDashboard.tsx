import { Link } from "@tanstack/react-router";
import { Brain, Clock, Quote, Sparkles, Users, ChevronRight, Flame } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
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

export function StaffDashboard({ session }: Props) {
  const meta = getDept(session.activeDept);
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

  // Mock shift metrics
  const shiftStart = 7; // 07:00
  const shiftEnd = 19;  // 19:00
  const now = new Date();
  const hour = now.getHours() + now.getMinutes() / 60;
  const worked = Math.max(0, Math.min(shiftEnd - shiftStart, hour - shiftStart));
  const remaining = Math.max(0, shiftEnd - shiftStart - worked);
  const pct = Math.min(100, (worked / (shiftEnd - shiftStart)) * 100);

  // Mock burnout score 0-100
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

      {/* Hours to be completed */}
      <BoxCard accent="var(--color-tone-sky)">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--color-tone-sky)]/15 text-[color:var(--color-tone-sky)]">
            <Clock className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Shift hours
            </div>
            <div className="mt-0.5 flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-foreground">{remaining.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">h to go</span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-background/60">
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--color-tone-sky)" }} />
            </div>
            <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground">
              <span>{worked.toFixed(1)}h done</span>
              <span>07:00 → 19:00</span>
            </div>
          </div>
        </div>
      </BoxCard>

      {/* Burnout prediction */}
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
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Burn-out predictor
              </div>
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

      {/* Mini stats */}
      <BoxCard accent="var(--color-tone-mint)">
        <Stat label="Assigned patients" value={patients.length} hint="under your care" />
      </BoxCard>
      <BoxCard accent="var(--color-tone-amber)">
        <Stat
          label="Watch / Critical"
          value={patients.filter((p) => p.status !== "stable").length}
          hint="prioritise rounds"
        />
      </BoxCard>
      <BoxCard accent="var(--color-tone-violet)">
        <Stat
          label="Meds due now"
          value={patients.reduce((a, p) => a + p.medications.filter((m) => m.status === "due").length, 0)}
          hint="next 30 min"
        />
      </BoxCard>

      {/* My patients */}
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
          <BoxCard accent="var(--color-tone-teal)">
            <p className="text-sm text-muted-foreground">No patients assigned to you right now.</p>
          </BoxCard>
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
                        {p.room} · {p.age}{p.sex}
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
