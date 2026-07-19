import {
  Gauge, Users, HeartPulse, Clock, Scale, Sparkles,
  AlertTriangle, CheckCircle2, ShieldAlert, TrendingUp,
} from "lucide-react";

// ---------- Demo data (AI Prototype) ----------
const DEPT_LOAD = [
  { key: "ICU",       patients: 12, high: 11, nurses: 10, reqHrs: 96, availHrs: 80 },
  { key: "ED",        patients: 42, high: 9,  nurses: 14, reqHrs: 132, availHrs: 112 },
  { key: "Med-Surg",  patients: 44, high: 6,  nurses: 16, reqHrs: 140, availHrs: 128 },
  { key: "Cardiac",   patients: 18, high: 4,  nurses: 9,  reqHrs: 74,  availHrs: 72 },
  { key: "Maternity", patients: 14, high: 2,  nurses: 8,  reqHrs: 52,  availHrs: 64 },
  { key: "Pediatric", patients: 15, high: 2,  nurses: 7,  reqHrs: 58,  availHrs: 56 },
  { key: "OT",        patients: 8,  high: 3,  nurses: 6,  reqHrs: 44,  availHrs: 48 },
];

type Zone = "safe" | "watch" | "critical";

function zoneFor(pct: number): Zone {
  if (pct >= 100) return "critical";
  if (pct >= 90) return "watch";
  return "safe";
}

const ZONE_META: Record<Zone, { label: string; color: string; bg: string; ring: string; icon: React.ComponentType<{ className?: string }> }> = {
  safe:     { label: "Safe",     color: "var(--color-tone-mint)",   bg: "color-mix(in oklab, var(--color-tone-mint) 15%, transparent)",   ring: "var(--color-tone-mint)",   icon: CheckCircle2 },
  watch:    { label: "Watch",    color: "var(--color-tone-amber)",  bg: "color-mix(in oklab, var(--color-tone-amber) 15%, transparent)",  ring: "var(--color-tone-amber)",  icon: AlertTriangle },
  critical: { label: "Critical", color: "var(--color-destructive)", bg: "color-mix(in oklab, var(--color-destructive) 15%, transparent)", ring: "var(--color-destructive)", icon: ShieldAlert },
};

export function NursingCapacityIntelligence() {
  const totalPatients = DEPT_LOAD.reduce((a, d) => a + d.patients, 0);
  const highAcuity    = DEPT_LOAD.reduce((a, d) => a + d.high, 0);
  const nurses        = DEPT_LOAD.reduce((a, d) => a + d.nurses, 0);
  const reqHrs        = DEPT_LOAD.reduce((a, d) => a + d.reqHrs, 0);
  const availHrs      = DEPT_LOAD.reduce((a, d) => a + d.availHrs, 0);
  const capacityPct   = Math.round((reqHrs / availHrs) * 100);
  const zone          = zoneFor(capacityPct);
  const meta          = ZONE_META[zone];
  const ZoneIcon      = meta.icon;

  // Workload balance: coefficient of variation across departments (lower = balanced)
  const loadRatios = DEPT_LOAD.map((d) => d.reqHrs / d.availHrs);
  const mean = loadRatios.reduce((a, b) => a + b, 0) / loadRatios.length;
  const variance = loadRatios.reduce((a, b) => a + (b - mean) ** 2, 0) / loadRatios.length;
  const cv = Math.sqrt(variance) / mean;
  const balanceScore = Math.max(0, Math.min(100, Math.round((1 - cv) * 100)));
  const balanceLabel = balanceScore >= 85 ? "Balanced" : balanceScore >= 70 ? "Uneven" : "Imbalanced";

  const stressedDepts = DEPT_LOAD
    .map((d) => ({ ...d, pct: Math.round((d.reqHrs / d.availHrs) * 100) }))
    .filter((d) => d.pct >= 100)
    .sort((a, b) => b.pct - a.pct);

  const recommendations = zone === "safe"
    ? [
        { title: "Maintain current staffing plan", body: "Capacity is within safe range. Continue routine monitoring of high-acuity units." },
        { title: "Reinforce meal-break coverage", body: "Use spare capacity in Maternity and OT to guarantee 30-min breaks on stretched units." },
      ]
    : [
        { title: "Redistribute Patient Assignment", body: `Move 2 low-acuity patients from ${stressedDepts[0]?.key ?? "ICU"} to a balanced unit to relieve nursing hours.` },
        { title: "Allocate Float Nurse", body: `Deploy 1 float RN to ${stressedDepts[0]?.key ?? "ICU"} for the next shift to close the ${Math.max(0, (stressedDepts[0]?.reqHrs ?? 0) - (stressedDepts[0]?.availHrs ?? 0))}h gap.` },
        { title: "Delay Non-Urgent Tasks", body: "Defer non-urgent admissions and elective procedures on units exceeding 100% capacity until evening shift." },
        { title: "Notify Charge Nurse", body: "Escalate to charge nurse and nursing supervisor to review skill mix and open on-call list." },
      ];

  return (
    <section
      className="relative overflow-hidden rounded-2xl border shadow-sm"
      style={{
        borderColor: meta.ring,
        background: `linear-gradient(180deg, ${meta.bg} 0%, var(--color-card) 55%)`,
      }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/60 p-5">
        <div className="flex items-start gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl"
            style={{ background: `color-mix(in oklab, ${meta.color} 20%, transparent)`, color: meta.color }}
          >
            <Gauge className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">Nursing Capacity Intelligence</h2>
              <span
                className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
              >
                <Sparkles className="h-3 w-3" /> AI Prototype
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Connecting Patient Acuity with Nursing Capacity.</p>
          </div>
        </div>

        {/* Zone chip */}
        <div
          className="flex items-center gap-2 rounded-xl border px-3 py-2"
          style={{ borderColor: meta.ring, background: `color-mix(in oklab, ${meta.color} 12%, transparent)`, color: meta.color }}
        >
          <ZoneIcon className="h-4 w-4" />
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">Capacity zone</span>
            <span className="text-sm font-semibold">{meta.label}</span>
          </div>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-3 p-5 md:grid-cols-4">
        <Metric icon={Users}      label="Total Patients"          value={totalPatients} tone="var(--color-primary)" />
        <Metric icon={HeartPulse} label="High-Acuity Patients"    value={highAcuity} tone="var(--color-destructive)" />
        <Metric icon={Users}      label="Available Nurses"        value={nurses} tone="var(--color-tone-sky)" />
        <Metric icon={Clock}      label="Required Nursing Hours"  value={`${reqHrs}h`} tone="var(--color-tone-amber)" />
        <Metric icon={Clock}      label="Available Nursing Hours" value={`${availHrs}h`} tone="var(--color-tone-mint)" />
        <Metric icon={Gauge}      label="Capacity Score"          value={`${capacityPct}%`} tone={meta.color} hint={`${meta.label} zone`} />
        <Metric icon={Scale}      label="Workload Balance"        value={`${balanceScore}`} tone={balanceScore >= 85 ? "var(--color-tone-mint)" : balanceScore >= 70 ? "var(--color-tone-amber)" : "var(--color-destructive)"} hint={balanceLabel} />
        <Metric icon={TrendingUp} label="Units Over Capacity"     value={stressedDepts.length} tone={stressedDepts.length ? "var(--color-destructive)" : "var(--color-tone-mint)"} hint={stressedDepts.length ? "Action needed" : "All within capacity"} />
      </div>

      {/* Capacity bar */}
      <div className="px-5 pb-4">
        <div className="mb-1.5 flex items-baseline justify-between text-xs">
          <span className="font-medium text-foreground">Hospital-wide capacity utilization</span>
          <span className="font-mono" style={{ color: meta.color }}>{capacityPct}% · {reqHrs}h required / {availHrs}h available</span>
        </div>
        <div className="relative h-3 overflow-hidden rounded-full bg-background/60 ring-1 ring-inset ring-border">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${Math.min(100, capacityPct)}%`, background: meta.color }}
          />
          {/* Threshold markers */}
          <div className="absolute inset-y-0" style={{ left: "90%", width: 1, background: "var(--color-tone-amber)" }} />
          <div className="absolute inset-y-0" style={{ left: "100%", width: 1, background: "var(--color-destructive)" }} />
        </div>
        <div className="mt-1 flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>0%</span>
          <span>Safe · &lt;90</span>
          <span>Watch · 90–99</span>
          <span>Critical · ≥100</span>
        </div>
      </div>

      {/* Department strip */}
      <div className="border-t border-border/60 px-5 py-4">
        <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Department capacity</div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-7">
          {DEPT_LOAD.map((d) => {
            const pct = Math.round((d.reqHrs / d.availHrs) * 100);
            const z = zoneFor(pct);
            const zm = ZONE_META[z];
            return (
              <div
                key={d.key}
                className="rounded-lg border bg-card px-3 py-2"
                style={{ borderColor: `color-mix(in oklab, ${zm.color} 45%, var(--color-border))` }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">{d.key}</span>
                  <span className="h-2 w-2 rounded-full" style={{ background: zm.color }} />
                </div>
                <div className="mt-0.5 text-[10px] text-muted-foreground">{d.patients} pts · {d.nurses} RN</div>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-sm font-semibold" style={{ color: zm.color }}>{pct}%</span>
                  <span className="text-[10px] text-muted-foreground">{d.reqHrs}/{d.availHrs}h</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendation */}
      <div className="border-t border-border/60 p-5">
        <div className="mb-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <div className="text-sm font-semibold text-foreground">Operational Recommendation (AI Prototype)</div>
          <span className="rounded-full border border-primary/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
            AI Prototype
          </span>
        </div>
        <p className="mb-3 text-xs text-muted-foreground">
          {zone === "safe"
            ? "Nursing capacity is within safe operating range. Continue proactive monitoring — high-acuity zones remain the priority."
            : `Workload is exceeding safe capacity in ${stressedDepts.length} unit${stressedDepts.length === 1 ? "" : "s"} (${stressedDepts.map((d) => d.key).join(", ")}). Recommended interventions:`}
        </p>
        <div className="grid gap-2 md:grid-cols-2">
          {recommendations.map((r) => (
            <div
              key={r.title}
              className="flex gap-3 rounded-lg border border-border bg-card p-3"
            >
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{ background: `color-mix(in oklab, ${meta.color} 18%, transparent)`, color: meta.color }}
              >
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground">{r.title}</div>
                <div className="text-xs text-muted-foreground">{r.body}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-[10px] italic text-muted-foreground">
          Demo data · All calculations and recommendations are AI Prototype outputs and not intended for clinical decision-making.
        </div>
      </div>
    </section>
  );
}

function Metric({
  icon: Icon, label, value, tone, hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  tone: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card/80 p-3 backdrop-blur">
      <div className="flex items-center gap-2">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{ background: `color-mix(in oklab, ${tone} 18%, transparent)`, color: tone }}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <div className="mt-1.5 text-2xl font-semibold text-foreground">{value}</div>
      {hint && <div className="text-[10px] text-muted-foreground">{hint}</div>}
    </div>
  );
}
