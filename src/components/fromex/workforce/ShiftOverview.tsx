import { useState, type ReactNode } from "react";
import { ChevronDown, Activity, Users2, AlertTriangle, UserCheck } from "lucide-react";
import {
  CAPACITY_LABEL,
  CAPACITY_TONE_L,
  DEMAND_LABEL,
  DEMAND_TONE,
  deptName,
  type WorkforceSnapshot,
} from "@/lib/fromex-workforce";

/** Compact metric tile — one number, one label, one tonal accent. */
function Tile({
  icon: Icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
  tone?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" aria-hidden="true" />
        {label}
      </div>
      <div
        className="mt-2 text-xl font-semibold tabular-nums"
        style={tone ? { color: tone } : undefined}
      >
        {value}
      </div>
      {sub && <div className="mt-0.5 text-[11px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

/**
 * "Current Shift Overview" — the 5–10 second read.
 * What is happening → do we have capacity → where is the problem.
 */
export function ShiftOverview({ snap }: { snap: WorkforceSnapshot }) {
  const highRisk = snap.risks.filter((r) => r.risk === "strained" || r.risk === "critical");

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile
          icon={Activity}
          label="Patient demand"
          value={DEMAND_LABEL[snap.demand.level]}
          sub={`${snap.demand.patients} patients · ${snap.demand.highAcuityPatients} high acuity`}
          tone={DEMAND_TONE[snap.demand.level]}
        />
        <Tile
          icon={Users2}
          label="Nursing capacity"
          value={CAPACITY_LABEL[snap.capacity.level]}
          sub={`${snap.capacity.availableHours.toFixed(0)} h available this shift`}
          tone={CAPACITY_TONE_L[snap.capacity.level]}
        />
        <Tile
          icon={AlertTriangle}
          label="Units needing attention"
          value={`${highRisk.length}`}
          sub={highRisk.length ? highRisk.map((r) => deptName(r.department)).join(", ") : "None right now"}
          tone={highRisk.length ? "var(--color-warning)" : "var(--color-success)"}
        />
        <Tile
          icon={UserCheck}
          label="Available nurses"
          value={`${snap.capacity.availableNurses}`}
          sub={`${snap.capacity.assignedNurses} currently assigned`}
        />
      </div>

      <div className="rounded-xl border border-border bg-secondary/50 p-4 text-sm leading-relaxed text-foreground">
        <span className="font-semibold">What is happening — </span>
        patient demand on {deptName(snap.demand.department)} is{" "}
        {DEMAND_LABEL[snap.demand.level].toLowerCase()} and nursing capacity is{" "}
        {CAPACITY_LABEL[snap.capacity.level].toLowerCase()}.{" "}
        {highRisk.length
          ? `Attention is needed in ${highRisk.map((r) => deptName(r.department)).join(", ")}.`
          : "No unit is currently showing a capacity imbalance."}
        <span className="mt-1.5 block text-[11px] text-muted-foreground">
          AI Prototype signal · human review required · the responsible role decides.
        </span>
      </div>
    </section>
  );
}

/** Progressive disclosure wrapper — detail stays closed until asked for. */
export function Disclosure({
  title,
  caption,
  defaultOpen = false,
  children,
}: {
  title: string;
  caption?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="rounded-2xl border border-border bg-card/70">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-foreground">{title}</span>
          {caption && (
            <span className="mt-0.5 block text-[11px] text-muted-foreground">{caption}</span>
          )}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="space-y-4 border-t border-border/70 p-4">{children}</div>}
    </section>
  );
}
