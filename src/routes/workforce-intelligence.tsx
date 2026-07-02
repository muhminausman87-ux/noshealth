import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Users, UserMinus, CalendarClock, Briefcase, Activity, Flame,
  HeartPulse, Sparkles, TrendingUp, TrendingDown,
  AlertTriangle, Layers, Gauge,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area,
} from "recharts";
import { Widget, StatusPill } from "@/components/Widget";
import { EcosystemLayout } from "@/components/EcosystemLayout";
import { getSession, type Session } from "@/lib/auth";

export const Route = createFileRoute("/workforce-intelligence")({
  head: () => ({
    meta: [
      { title: "Workforce Intelligence · NOS Ecosystem" },
      { name: "description", content: "Executive workforce intelligence dashboard for nurse managers and hospital administrators." },
    ],
  }),
  component: WorkforceIntelligencePage,
});

// ---------------- Mock prototype data (no DB writes) ----------------
const DEPTS = [
  { key: "ED", onDuty: 14, patients: 42, acuityHigh: 9, acuityMed: 18, acuityLow: 15, overtime: 22, coverage: 88 },
  { key: "ICU", onDuty: 10, patients: 12, acuityHigh: 11, acuityMed: 1,  acuityLow: 0,  overtime: 31, coverage: 82 },
  { key: "Med-Surg", onDuty: 16, patients: 44, acuityHigh: 6, acuityMed: 22, acuityLow: 16, overtime: 18, coverage: 91 },
  { key: "Maternity", onDuty: 8,  patients: 14, acuityHigh: 2, acuityMed: 6,  acuityLow: 6,  overtime: 6,  coverage: 96 },
  { key: "Cardiac", onDuty: 9,  patients: 18, acuityHigh: 4, acuityMed: 9,  acuityLow: 5,  overtime: 12, coverage: 90 },
  { key: "Pediatric", onDuty: 7, patients: 15, acuityHigh: 2, acuityMed: 7, acuityLow: 6,  overtime: 4,  coverage: 94 },
  { key: "OT", onDuty: 6, patients: 8, acuityHigh: 3, acuityMed: 3, acuityLow: 2, overtime: 9, coverage: 89 },
];

const SKILL_MIX = [
  { name: "RN", value: 58, color: "hsl(210 85% 55%)" },
  { name: "LPN", value: 22, color: "hsl(160 65% 45%)" },
  { name: "CNA", value: 15, color: "hsl(35 85% 55%)" },
  { name: "Float", value: 5, color: "hsl(280 60% 60%)" },
];

const FATIGUE = [
  { d: "Mon", score: 32 }, { d: "Tue", score: 38 }, { d: "Wed", score: 41 },
  { d: "Thu", score: 47 }, { d: "Fri", score: 52 }, { d: "Sat", score: 61 }, { d: "Sun", score: 58 },
];

const OVERTIME_TREND = [
  { w: "W-6", h: 180 }, { w: "W-5", h: 210 }, { w: "W-4", h: 240 },
  { w: "W-3", h: 235 }, { w: "W-2", h: 268 }, { w: "W-1", h: 292 }, { w: "This", h: 305 },
];

const VACANCY_TREND = [
  { m: "Jan", v: 12 }, { m: "Feb", v: 11 }, { m: "Mar", v: 14 },
  { m: "Apr", v: 13 }, { m: "May", v: 15 }, { m: "Jun", v: 17 }, { m: "Jul", v: 16 },
];

const DEMAND_FORECAST = [
  { t: "06:00", now: 55, fc: 58 }, { t: "10:00", now: 68, fc: 72 },
  { t: "14:00", now: 74, fc: 79 }, { t: "18:00", now: 82, fc: 91 },
  { t: "22:00", now: 71, fc: 84 }, { t: "02:00", now: 60, fc: 66 },
];

const RECOMMENDATIONS = [
  { tone: "info" as const, title: "Reallocate 1 ICU nurse", body: "ICU staffing shows 1.2× workload vs. capacity — consider pulling a floater from Med-Surg for the evening shift." },
  { tone: "warning" as const, title: "Medical ward workload rising", body: "Predicted admissions up 18% next 24h. Pre-schedule additional coverage." },
  { tone: "danger" as const, title: "Evening shift risk", body: "18:00–22:00 forecast staffing gap of 9% across ED and ICU. Open on-call list." },
  { tone: "warning" as const, title: "ED overtime review", body: "Overtime hours up 26% MoM in Emergency. Review roster balance and skill mix." },
];

// ---------------- Component ----------------
function WorkforceIntelligencePage() {
  const navigate = useNavigate();
  const [session, setSess] = useState<Session | null>(null);

  useEffect(() => {
    const s = getSession();
    if (!s) { navigate({ to: "/login" }); return; }
    setSess(s);
  }, [navigate]);

  if (!session) {
    return <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">Loading…</div>;
  }

  const totalOnDuty = DEPTS.reduce((a, d) => a + d.onDuty, 0);
  const totalPatients = DEPTS.reduce((a, d) => a + d.patients, 0);
  const ratio = (totalPatients / totalOnDuty).toFixed(1);

  return (
    <EcosystemLayout>
      <main className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 sm:px-6">

        {/* Workforce Pulse (first thing admins see) */}
        <WorkforcePulse />

        {/* Executive Summary */}
        <ExecutiveSummary totalOnDuty={totalOnDuty} deptCount={DEPTS.length} />



        {/* 1. Workforce Overview */}
        <section>
          <SectionTitle icon={Users} title="Workforce Overview" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
            <Kpi icon={Users} label="Nurses on Duty" value={totalOnDuty} tone="info" />
            <Kpi icon={UserMinus} label="On Leave" value={9} tone="warning" hint="4 planned · 5 sick" />
            <Kpi icon={CalendarClock} label="Open Shifts" value={12} tone="danger" hint="Next 72h" />
            <Kpi icon={Briefcase} label="Vacant Positions" value={16} tone="warning" hint="Recruiting" />
            <Kpi icon={Gauge} label="Overall Coverage" value="89%" tone="success" />
          </div>

          <div className="mt-3 rounded-xl border border-border bg-card p-4">
            <div className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Department staffing status</div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {DEPTS.map((d) => {
                const tone = d.coverage >= 92 ? "success" : d.coverage >= 85 ? "warning" : "danger";
                return (
                  <div key={d.key} className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2">
                    <div>
                      <div className="text-sm font-medium">{d.key}</div>
                      <div className="text-[11px] text-muted-foreground">{d.onDuty} nurses · {d.patients} pts</div>
                    </div>
                    <StatusPill tone={tone}>{d.coverage}%</StatusPill>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 2. Staffing Analytics */}
        <section>
          <SectionTitle icon={Activity} title="Staffing Analytics" />
          <div className="grid gap-4 lg:grid-cols-3">
            <Widget title="Staffing by Department" icon={Users} className="lg:col-span-2">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={DEPTS}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="key" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="onDuty" name="On duty" fill="hsl(210 85% 55%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="patients" name="Patients" fill="hsl(160 65% 45%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Widget>

            <Widget title="Skill Mix Distribution" icon={Layers}>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={SKILL_MIX} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2}>
                      {SKILL_MIX.map((s) => <Cell key={s.name} fill={s.color} />)}
                    </Pie>
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Widget>

            <Widget title="Nurse-to-Patient Ratio" icon={Gauge}>
              <div className="flex flex-col items-center justify-center py-4">
                <div className="text-4xl font-bold text-primary">1 : {ratio}</div>
                <div className="mt-1 text-xs text-muted-foreground">Hospital-wide average</div>
                <div className="mt-4 w-full space-y-1.5">
                  {DEPTS.slice(0, 4).map((d) => (
                    <div key={d.key} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{d.key}</span>
                      <span className="font-mono">1 : {(d.patients / d.onDuty).toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Widget>

            <Widget title="Shift Coverage" icon={CalendarClock}>
              <div className="space-y-2.5">
                {["Morning", "Evening", "Night"].map((s, i) => {
                  const v = [94, 82, 88][i];
                  return (
                    <div key={s}>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="font-medium">{s}</span>
                        <span className="text-muted-foreground">{v}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-secondary">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${v}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Widget>

            <Widget title="Overtime Hours (7 weeks)" icon={TrendingUp}>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={OVERTIME_TREND}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="w" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Line type="monotone" dataKey="h" stroke="hsl(25 90% 55%)" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Widget>
          </div>
        </section>

        {/* 3. Burnout Intelligence */}
        <section>
          <SectionTitle icon={Flame} title="Burnout Intelligence" pill="Prototype" />
          <div className="grid gap-4 lg:grid-cols-3">
            <Widget title="Burnout Risk Score" icon={Flame}>
              <div className="flex flex-col items-center py-3">
                <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-warning/30 to-destructive/30">
                  <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-card">
                    <div className="text-3xl font-bold text-warning-foreground">58</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Moderate</div>
                  </div>
                </div>
                <StatusPill tone="warning">+12 vs last week</StatusPill>
              </div>
            </Widget>

            <Widget title="Fatigue Trend (7d)" icon={HeartPulse} className="lg:col-span-2">
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={FATIGUE}>
                    <defs>
                      <linearGradient id="fatigueG" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(0 75% 60%)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="hsl(0 75% 60%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="d" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Area type="monotone" dataKey="score" stroke="hsl(0 75% 55%)" strokeWidth={2} fill="url(#fatigueG)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Widget>

            <Kpi icon={CalendarClock} label="Consecutive Shifts (avg)" value="4.2" tone="warning" hint="Threshold: 3" />
            <Kpi icon={AlertTriangle} label="Missed Breaks (this week)" value={38} tone="danger" hint="+9 vs last week" />
            <Kpi icon={TrendingUp} label="High-workload Nurses" value={22} tone="warning" hint="≥ 1.3× workload index" />
          </div>
        </section>

        {/* 4. Patient Acuity & Workload */}
        <section>
          <SectionTitle icon={Activity} title="Patient Acuity & Workload" />
          <div className="grid gap-4 lg:grid-cols-3">
            <Widget title="Acuity Distribution by Department" icon={Layers} className="lg:col-span-2">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={DEPTS}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="key" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="acuityHigh" stackId="a" name="High" fill="hsl(0 75% 55%)" />
                    <Bar dataKey="acuityMed"  stackId="a" name="Med"  fill="hsl(35 85% 55%)" />
                    <Bar dataKey="acuityLow"  stackId="a" name="Low"  fill="hsl(160 60% 45%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Widget>

            <Widget title="Workload Heatmap" icon={Flame}>
              <div className="space-y-1.5">
                {DEPTS.map((d) => {
                  const load = d.patients / d.onDuty;
                  const pct = Math.min(100, (load / 6) * 100);
                  const color = load > 4 ? "hsl(0 75% 55%)" : load > 2.5 ? "hsl(35 85% 55%)" : "hsl(160 60% 45%)";
                  return (
                    <div key={d.key} className="flex items-center gap-2">
                      <div className="w-20 text-xs text-muted-foreground">{d.key}</div>
                      <div className="h-5 flex-1 overflow-hidden rounded bg-secondary">
                        <div className="h-full rounded transition-all" style={{ width: `${pct}%`, background: color }} />
                      </div>
                      <div className="w-10 text-right text-xs font-mono">{load.toFixed(1)}</div>
                    </div>
                  );
                })}
              </div>
            </Widget>

            <Kpi icon={HeartPulse} label="High Dependency Patients" value={DEPTS.reduce((a, d) => a + d.acuityHigh, 0)} tone="danger" />

            <Widget title="Staffing Demand Forecast (24h)" icon={TrendingUp} className="lg:col-span-2">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={DEMAND_FORECAST}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="t" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="now" name="Actual" stroke="hsl(210 85% 55%)" strokeWidth={2} />
                    <Line type="monotone" dataKey="fc"  name="AI Forecast" stroke="hsl(280 60% 60%)" strokeWidth={2} strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Widget>
          </div>
        </section>

        {/* 5. AI Staffing Recommendations */}
        <section>
          <SectionTitle icon={Sparkles} title="AI Staffing Recommendations" pill="Prototype" />
          <div className="grid gap-3 md:grid-cols-2">
            {RECOMMENDATIONS.map((r) => (
              <div key={r.title} className="flex gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  r.tone === "danger" ? "bg-destructive/15 text-destructive" :
                  r.tone === "warning" ? "bg-warning/20 text-warning-foreground" :
                  "bg-primary/10 text-primary"
                }`}>
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold">{r.title}</h4>
                    <StatusPill tone={r.tone}>AI</StatusPill>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{r.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. Operational KPIs */}
        <section>
          <SectionTitle icon={Gauge} title="Operational KPIs" />
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="grid grid-cols-2 gap-3">
              <Kpi icon={TrendingUp} label="Staff Retention" value="91%" tone="success" hint="12-mo rolling" />
              <Kpi icon={UserMinus} label="Absenteeism" value="4.2%" tone="warning" hint="Target ≤ 3%" />
              <Kpi icon={TrendingDown} label="Overtime Trend" value="+18%" tone="danger" hint="vs last month" />
              <Kpi icon={Briefcase} label="Utilization" value="87%" tone="info" />
            </div>

            <Widget title="Vacancy Trend" icon={Briefcase} className="lg:col-span-2">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={VACANCY_TREND}>
                    <defs>
                      <linearGradient id="vacG" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(210 85% 55%)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="hsl(210 85% 55%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="m" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Area type="monotone" dataKey="v" name="Vacancies" stroke="hsl(210 85% 55%)" strokeWidth={2} fill="url(#vacG)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Widget>
          </div>
        </section>

        <footer className="pt-2 pb-8 text-center text-[11px] text-muted-foreground">
          Workforce Intelligence · Prototype dashboard · Data shown is illustrative and not connected to live records.
        </footer>
      </main>
    </EcosystemLayout>
  );
}

// ---------------- Sub components ----------------
function SectionTitle({ icon: Icon, title, pill }: { icon: any; title: string; pill?: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      {pill && (
        <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
          {pill}
        </span>
      )}
    </div>
  );
}

function Kpi({
  icon: Icon, label, value, tone, hint,
}: {
  icon: any; label: string; value: string | number;
  tone: "info" | "success" | "warning" | "danger" | "neutral";
  hint?: string;
}) {
  const toneMap = {
    info: "text-primary bg-primary/10",
    success: "text-success bg-success/15",
    warning: "text-warning-foreground bg-warning/20",
    danger: "text-destructive bg-destructive/15",
    neutral: "text-muted-foreground bg-secondary",
  };
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className={`flex h-8 w-8 items-center justify-center rounded-md ${toneMap[tone]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
      {hint && <div className="mt-1 text-[10px] text-muted-foreground/80">{hint}</div>}
    </div>
  );
}

// ---------------- Executive Summary ----------------
function ExecutiveSummary({ totalOnDuty, deptCount }: { totalOnDuty: number; deptCount: number }) {
  // Demo values (no live data source)
  const openShifts = 12;
  const staffingGap = 9; // percent
  const burnoutRisk = 58; // 0-100
  const healthScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(100 - staffingGap * 1.8 - Math.max(0, burnoutRisk - 40) * 0.6 - openShifts * 0.8),
    ),
  );

  const scoreTone =
    healthScore >= 80
      ? { label: "Healthy", color: "hsl(var(--success))", ring: "text-success", bg: "from-success/20 to-success/5" }
      : healthScore >= 60
        ? { label: "Watch", color: "hsl(35 90% 55%)", ring: "text-warning-foreground", bg: "from-warning/25 to-warning/5" }
        : { label: "Critical", color: "hsl(var(--destructive))", ring: "text-destructive", bg: "from-destructive/25 to-destructive/5" };

  const circumference = 2 * Math.PI * 52;
  const dash = (healthScore / 100) * circumference;

  const cards: ExecKpiProps[] = [
    { icon: Users, label: "Nurses on Duty", value: totalOnDuty, trend: "up", delta: "+4 vs yesterday", status: "success", hint: `${deptCount} departments` },
    { icon: AlertTriangle, label: "Staffing Gap", value: `${staffingGap}%`, trend: "up", delta: "+2% vs last week", status: "warning", hint: "Evening shift most affected" },
    { icon: Flame, label: "Burnout Risk", value: burnoutRisk, trend: "up", delta: "+12 vs last week", status: burnoutRisk > 65 ? "danger" : "warning", hint: "Moderate index" },
    { icon: CalendarClock, label: "Open Shifts", value: openShifts, trend: "down", delta: "-3 vs yesterday", status: "danger", hint: "Next 72h" },
  ];

  return (
    <section className="space-y-4">
      {/* Health Score hero */}
      <div className={`rounded-2xl border border-border bg-gradient-to-br ${scoreTone.bg} via-card to-card p-5 shadow-sm sm:p-6`}>
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 sm:gap-6">
          <div className="relative shrink-0">
            <svg viewBox="0 0 120 120" className="h-28 w-28 -rotate-90 sm:h-32 sm:w-32">
              <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--border))" strokeWidth="10" />
              <circle
                cx="60" cy="60" r="52" fill="none"
                stroke={scoreTone.color} strokeWidth="10" strokeLinecap="round"
                strokeDasharray={`${dash} ${circumference}`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className={`text-3xl font-bold sm:text-4xl ${scoreTone.ring}`}>{healthScore}</div>
              <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">/ 100</div>
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Executive Summary</div>
              <StatusPill tone="info">Prototype</StatusPill>
            </div>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              Hospital Workforce Health Score
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Composite index of staffing coverage, burnout risk, and open shifts.
              Current status: <span className={`font-semibold ${scoreTone.ring}`}>{scoreTone.label}</span>.
            </p>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => <ExecKpi key={c.label} {...c} />)}
      </div>
    </section>
  );
}

type ExecKpiProps = {
  icon: any;
  label: string;
  value: string | number;
  trend: "up" | "down";
  delta: string;
  status: "success" | "warning" | "danger" | "info";
  hint?: string;
};

function ExecKpi({ icon: Icon, label, value, trend, delta, status, hint }: ExecKpiProps) {
  const statusMap = {
    success: { icon: "bg-success/15 text-success", dot: "bg-success", ring: "border-success/30" },
    warning: { icon: "bg-warning/20 text-warning-foreground", dot: "bg-warning", ring: "border-warning/40" },
    danger:  { icon: "bg-destructive/15 text-destructive", dot: "bg-destructive", ring: "border-destructive/30" },
    info:    { icon: "bg-primary/10 text-primary", dot: "bg-primary", ring: "border-primary/30" },
  }[status];

  const TrendIcon = trend === "up" ? TrendingUp : TrendingDown;
  // For "gap", "burnout", "open shifts" up is bad; for "on duty" up is good.
  // Delta color is neutral to the metric — use status as source of truth.
  const trendColor = status === "success" ? "text-success"
    : status === "danger" ? "text-destructive"
    : status === "warning" ? "text-warning-foreground"
    : "text-primary";

  return (
    <div className={`rounded-xl border ${statusMap.ring} bg-card p-4 shadow-sm transition-shadow hover:shadow-md`}>
      <div className="flex items-start justify-between gap-2">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${statusMap.icon}`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full bg-background px-2 py-0.5 text-[11px] font-medium ${trendColor}`}>
          <TrendIcon className="h-3 w-3" />
          {delta}
        </span>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <div className="text-3xl font-semibold tracking-tight text-foreground">{value}</div>
        <span className={`h-1.5 w-1.5 rounded-full ${statusMap.dot}`} />
      </div>
      <div className="mt-0.5 text-xs font-medium text-foreground">{label}</div>
      {hint && <div className="mt-0.5 text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

