import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { STAFF } from "@/lib/auth";
import { getDept, DEPARTMENTS, type Department } from "@/lib/departments";
import { patientsByDept } from "@/lib/patients";
import {
  CalendarDays,
  Clock,
  Hourglass,
  Timer,
  Flame,
  Brain,
  Users,
  Filter,
} from "lucide-react";

type ShiftCode = "M" | "E" | "N" | "O";
const SHIFT_META: Record<ShiftCode, { label: string; hours: number; tone: string }> = {
  M: { label: "Morning 07–15", hours: 8, tone: "var(--color-tone-mint)" },
  E: { label: "Evening 15–22", hours: 7, tone: "var(--color-tone-amber)" },
  N: { label: "Night  22–07", hours: 9, tone: "var(--color-tone-violet)" },
  O: { label: "Off",            hours: 0, tone: "var(--color-muted-foreground)" },
};

// Deterministic pseudo-random based on string
function seeded(str: string, salt = 0) {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return ((h >>> 0) % 1000) / 1000;
}

interface StaffRow {
  username: string;
  name: string;
  title: string;
  dept: Department;
  schedule: ShiftCode[]; // 7 days, Mon..Sun
  contractedHours: number;
  workedHours: number;
  pendingHours: number;
  burnout: number;
  pulled: boolean;
}

function buildRoster(): StaffRow[] {
  return STAFF.filter((u) => u.role === "staff").map((u) => {
    const schedule: ShiftCode[] = Array.from({ length: 7 }, (_, i) => {
      const r = seeded(u.username, i);
      if (r < 0.18) return "O";
      if (r < 0.5) return "M";
      if (r < 0.78) return "E";
      return "N";
    });
    const worked = schedule.reduce((a, s) => a + SHIFT_META[s].hours, 0);
    const contracted = 40;
    const pending = Math.max(0, contracted - worked);
    const dept = u.assignedDept!;
    const patients = patientsByDept(dept).length;
    const pulled = seeded(u.username, 99) < 0.2;
    const burnout = Math.min(
      98,
      Math.round(28 + worked * 0.7 + patients * 4 + (pulled ? 10 : 0) + seeded(u.username, 7) * 12),
    );
    return {
      username: u.username,
      name: u.name,
      title: u.title,
      dept,
      schedule,
      contractedHours: contracted,
      workedHours: worked,
      pendingHours: pending,
      burnout,
      pulled,
    };
  });
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function AdminWorkforce() {
  const [filter, setFilter] = useState<Department | "all">("all");
  const roster = useMemo(buildRoster, []);
  const filtered = useMemo(
    () => (filter === "all" ? roster : roster.filter((r) => r.dept === filter)),
    [roster, filter],
  );

  const totals = useMemo(() => {
    const worked = filtered.reduce((a, r) => a + r.workedHours, 0);
    const pending = filtered.reduce((a, r) => a + r.pendingHours, 0);
    const contracted = filtered.reduce((a, r) => a + r.contractedHours, 0);
    const avgBurn = filtered.length
      ? Math.round(filtered.reduce((a, r) => a + r.burnout, 0) / filtered.length)
      : 0;
    return { worked, pending, contracted, avgBurn };
  }, [filtered]);

  return (
    <section className="mt-8">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <Users className="h-3.5 w-3.5 text-primary" /> Workforce ops
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Staff scheduling & wellbeing
          </h2>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-1.5">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as Department | "all")}
            className="bg-transparent text-xs text-foreground outline-none"
          >
            <option value="all">All departments</option>
            {DEPARTMENTS.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI strip */}
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi icon={Clock}     accent="var(--color-tone-mint)"   label="Working hours (wk)" value={`${totals.worked}h`} hint={`of ${totals.contracted}h contracted`} />
        <Kpi icon={Hourglass} accent="var(--color-tone-amber)"  label="Pending hours"      value={`${totals.pending}h`} hint="to meet contract" />
        <Kpi icon={Timer}     accent="var(--color-tone-sky)"    label="Total roster"       value={`${filtered.length}`} hint="active nurses" />
        <Kpi icon={Flame}     accent={totals.avgBurn > 65 ? "var(--color-destructive)" : "var(--color-tone-teal)"}
             label="Avg burn-out" value={`${totals.avgBurn}`}    hint={totals.avgBurn > 65 ? "Action recommended" : "Within safe range"} />
      </div>

      <Tabs defaultValue="schedule">
        <TabsList className="bg-card">
          <TabsTrigger value="schedule"><CalendarDays className="mr-1.5 h-3.5 w-3.5" />Schedule</TabsTrigger>
          <TabsTrigger value="working"><Clock className="mr-1.5 h-3.5 w-3.5" />Working hours</TabsTrigger>
          <TabsTrigger value="pending"><Hourglass className="mr-1.5 h-3.5 w-3.5" />Pending hours</TabsTrigger>
          <TabsTrigger value="total"><Timer className="mr-1.5 h-3.5 w-3.5" />Total hours</TabsTrigger>
          <TabsTrigger value="burnout"><Brain className="mr-1.5 h-3.5 w-3.5" />Burn-out model</TabsTrigger>
        </TabsList>

        {/* SCHEDULE */}
        <TabsContent value="schedule">
          <Panel>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-3 py-2">Nurse</th>
                    <th className="px-3 py-2">Unit</th>
                    {DAYS.map((d) => <th key={d} className="px-2 py-2 text-center">{d}</th>)}
                    <th className="px-3 py-2 text-right">Hrs</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => {
                    const m = getDept(r.dept);
                    return (
                      <tr key={r.username} className="border-t border-border/60">
                        <td className="px-3 py-2">
                          <div className="font-medium text-foreground">{r.name}</div>
                          <div className="text-[11px] text-muted-foreground">{r.title}</div>
                        </td>
                        <td className="px-3 py-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px]"
                                style={{ background: `color-mix(in oklab, ${m.color} 18%, transparent)`, color: m.color }}>
                            <span className="h-1.5 w-1.5 rounded-full" style={{ background: m.color }} />
                            {m.short}
                          </span>
                        </td>
                        {r.schedule.map((s, i) => (
                          <td key={i} className="px-2 py-2 text-center">
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[11px] font-semibold"
                                  style={{
                                    background: s === "O" ? "transparent" : `color-mix(in oklab, ${SHIFT_META[s].tone} 18%, transparent)`,
                                    color: s === "O" ? "var(--color-muted-foreground)" : SHIFT_META[s].tone,
                                    border: s === "O" ? "1px dashed var(--color-border)" : "none",
                                  }}
                                  title={SHIFT_META[s].label}>
                              {s}
                            </span>
                          </td>
                        ))}
                        <td className="px-3 py-2 text-right font-medium text-foreground">{r.workedHours}h</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Legend />
          </Panel>
        </TabsContent>

        {/* WORKING HOURS */}
        <TabsContent value="working">
          <Panel>
            <BarList rows={filtered.map((r) => ({
              key: r.username, label: r.name, sub: getDept(r.dept).short,
              value: r.workedHours, max: 50, suffix: "h", tone: "var(--color-tone-mint)",
            }))} />
          </Panel>
        </TabsContent>

        {/* PENDING HOURS */}
        <TabsContent value="pending">
          <Panel>
            <BarList rows={filtered.map((r) => ({
              key: r.username, label: r.name, sub: `Contract ${r.contractedHours}h`,
              value: r.pendingHours, max: 40, suffix: "h",
              tone: r.pendingHours > 12 ? "var(--color-destructive)" : "var(--color-tone-amber)",
            }))} />
          </Panel>
        </TabsContent>

        {/* TOTAL HOURS */}
        <TabsContent value="total">
          <Panel>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((r) => {
                const m = getDept(r.dept);
                const pct = Math.min(100, (r.workedHours / r.contractedHours) * 100);
                return (
                  <div key={r.username} className="rounded-xl border border-border bg-background/40 p-4"
                       style={{ borderLeft: `4px solid ${m.color}` }}>
                    <div className="flex items-baseline justify-between">
                      <div>
                        <div className="text-sm font-semibold text-foreground">{r.name}</div>
                        <div className="text-[11px] text-muted-foreground">{m.short} · {r.title}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-semibold text-foreground">{r.workedHours}h</div>
                        <div className="text-[11px] text-muted-foreground">/ {r.contractedHours}h</div>
                      </div>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-background/60">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: m.color }} />
                    </div>
                    <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
                      <span>Pending {r.pendingHours}h</span>
                      <span>{pct.toFixed(0)}% complete</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        </TabsContent>

        {/* BURNOUT */}
        <TabsContent value="burnout">
          <Panel>
            <p className="mb-3 text-xs text-muted-foreground">
              Predictive score from worked hours, patient load, pulled-shift status and consecutive
              nights. <strong>0–45 Low</strong> · <strong>46–70 Moderate</strong> · <strong>71+ High</strong>.
            </p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {[...filtered].sort((a, b) => b.burnout - a.burnout).map((r) => {
                const tone = r.burnout > 70 ? "var(--color-destructive)"
                  : r.burnout > 45 ? "var(--color-tone-amber)"
                  : "var(--color-tone-mint)";
                const label = r.burnout > 70 ? "High" : r.burnout > 45 ? "Moderate" : "Low";
                const tip = r.burnout > 70
                  ? "Rotate off night rota; offer debrief & 48h rest."
                  : r.burnout > 45
                    ? "Reduce patient load; ensure breaks taken."
                    : "Healthy — sustain current rota.";
                return (
                  <div key={r.username} className="rounded-xl border border-border bg-background/40 p-4"
                       style={{ borderLeft: `4px solid ${tone}` }}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-foreground">{r.name}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {getDept(r.dept).short} · {r.workedHours}h worked{r.pulled ? " · pulled" : ""}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-semibold" style={{ color: tone }}>{r.burnout}</div>
                        <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: tone }}>{label}</div>
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background/60">
                      <div className="h-full rounded-full" style={{ width: `${r.burnout}%`, background: tone }} />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{tip}</p>
                  </div>
                );
              })}
            </div>
          </Panel>
        </TabsContent>
      </Tabs>
    </section>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="mt-3 rounded-2xl border border-border bg-card p-4 shadow-sm">{children}</div>;
}

function Kpi({
  icon: Icon, label, value, hint, accent,
}: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; hint: string; accent: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl"
             style={{ background: `color-mix(in oklab, ${accent} 18%, transparent)`, color: accent }}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="mt-0.5 text-2xl font-semibold text-foreground">{value}</div>
          <div className="text-[11px] text-muted-foreground">{hint}</div>
        </div>
      </div>
    </div>
  );
}

function BarList({
  rows,
}: {
  rows: { key: string; label: string; sub: string; value: number; max: number; suffix: string; tone: string }[];
}) {
  return (
    <div className="space-y-2.5">
      {rows.map((r) => {
        const pct = Math.min(100, (r.value / r.max) * 100);
        return (
          <div key={r.key} className="rounded-lg border border-border/60 bg-background/40 p-3">
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-sm font-medium text-foreground">{r.label}</div>
                <div className="text-[11px] text-muted-foreground">{r.sub}</div>
              </div>
              <div className="text-sm font-semibold" style={{ color: r.tone }}>{r.value}{r.suffix}</div>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-background/60">
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: r.tone }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Legend() {
  return (
    <div className="mt-3 flex flex-wrap gap-3 border-t border-border/60 pt-3 text-[11px] text-muted-foreground">
      {(Object.keys(SHIFT_META) as ShiftCode[]).map((s) => (
        <span key={s} className="inline-flex items-center gap-1.5">
          <span className="inline-flex h-4 w-4 items-center justify-center rounded text-[10px] font-semibold"
                style={{
                  background: s === "O" ? "transparent" : `color-mix(in oklab, ${SHIFT_META[s].tone} 18%, transparent)`,
                  color: s === "O" ? "var(--color-muted-foreground)" : SHIFT_META[s].tone,
                  border: s === "O" ? "1px dashed var(--color-border)" : "none",
                }}>{s}</span>
          {SHIFT_META[s].label}
        </span>
      ))}
    </div>
  );
}
