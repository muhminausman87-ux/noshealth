import { useMemo, useState } from "react";
import { ClipboardCheck, Users, Info } from "lucide-react";
import { Widget } from "@/components/Widget";

/**
 * Acuity Scoring System — Ward & ICU
 * Source: Sajin Nair / Muhmina Usman vision — "Right Patient · Right Nurse · Right Care · Right Outcome"
 *
 * Ward total: 0–30   ICU total: 0–36
 * Each parameter is scored 0 / 1 / 2 / 3 by the bedside nurse on every shift.
 * The total drives the recommended nurse : patient ratio for the next shift.
 */

type Mode = "ward" | "icu";

interface Param {
  key: string;
  label: string;
  levels: [string, string, string, string]; // 0,1,2,3
}

const WARD_PARAMS: Param[] = [
  { key: "mobility",  label: "Mobility",                 levels: ["Independent", "Needs minimal assistance", "Needs major assistance", "Restriction / bedbound"] },
  { key: "hygiene",   label: "Personal Hygiene",         levels: ["Independent", "Partial assistance", "Full assistance", "Complete nursing care"] },
  { key: "feeding",   label: "Feeding & Nutrition",      levels: ["Self-feeding", "Supervision required", "Assisted feeding", "Tube feeding / TPN"] },
  { key: "meds",      label: "Medication Administration",levels: ["Oral", "Multiple oral", "IV medications", "High-risk medications"] },
  { key: "vitals",    label: "Vital Signs Monitoring",   levels: ["Routine", "2–3 times / day", "4–6 times / day", "Hourly monitoring"] },
  { key: "o2",        label: "Oxygen Therapy",           levels: ["Not required", "≤ 2 L/min", "3–5 L/min", "> 5 L/min continuous"] },
  { key: "wound",     label: "Wound Care / Dressing",    levels: ["None", "Simple dressing", "Complex dressing", "Multiple dressings"] },
  { key: "edu",       label: "Patient Education",        levels: ["Minimal", "Routine education", "Repeated education", "Intensive counselling"] },
  { key: "elim",      label: "Elimination Care",         levels: ["Independent", "Assistance required", "Catheter / Diaper care", "Continuous care"] },
  { key: "doc",       label: "Documentation & Monitoring", levels: ["Routine", "Moderate", "Extensive", "Continuous documentation"] },
];

const ICU_PARAMS: Param[] = [
  { key: "basic",    label: "Basic Activities",        levels: ["Minimal", "Observation", "Continuous obs", "1:1 care"] },
  { key: "hyg",      label: "Hygiene Procedures",      levels: ["Independent", "Partial", "Full assist", "Total care"] },
  { key: "inf",      label: "Infection Control",       levels: ["Routine", "Isolation", "Multiple dressings", "Complex isolation"] },
  { key: "med",      label: "Medication",              levels: ["Routine", "Multiple", "IV infusion", "Vasoactive drugs"] },
  { key: "cvs",      label: "Cardiovascular Support",  levels: ["Stable", "Monitor", "Invasive monitor", "Advanced support"] },
  { key: "vent",     label: "Ventilatory Support",     levels: ["Room air", "Oxygen", "NIV", "Mechanical ventilation"] },
  { key: "renal",    label: "Renal Support",           levels: ["Normal", "Catheter", "Dialysis", "CRRT"] },
  { key: "metab",    label: "Metabolic Support",       levels: ["Stable", "Correction", "Treatment", "Complex support"] },
  { key: "neuro",    label: "Neurological Support",    levels: ["Routine", "Neuro obs", "ICP monitoring", "Advanced neuro"] },
  { key: "spec",     label: "Specific Interventions",  levels: ["None", "Minor", "Major", "Emergency intervention"] },
  { key: "mob",      label: "Mobilization",            levels: ["Independent", "Assist", "Frequent reposition", "Total care"] },
  { key: "support",  label: "Patient / Relative Support", levels: ["Routine", "Frequent", "Counselling", "Complex"] },
];

interface Tier {
  label: string;
  ratio: string;
  tone: string;
  range: string;
}

function wardTier(score: number): Tier {
  if (score <= 10) return { label: "Low acuity",       ratio: "1 : 6–8", tone: "var(--color-tone-mint)",   range: "0–10" };
  if (score <= 20) return { label: "Moderate acuity",  ratio: "1 : 4–5", tone: "var(--color-tone-sky)",    range: "11–20" };
  if (score <= 25) return { label: "High acuity",      ratio: "1 : 3–4", tone: "var(--color-tone-amber)",  range: "21–25" };
  return            { label: "Very high acuity",       ratio: "1 : 1–2", tone: "var(--color-tone-rose)",   range: "26–30" };
}
function icuTier(score: number): Tier {
  if (score <= 16) return { label: "Low ICU acuity",       ratio: "1 : 2", tone: "var(--color-tone-mint)",  range: "0–16" };
  if (score <= 30) return { label: "High ICU acuity",      ratio: "1 : 1", tone: "var(--color-tone-amber)", range: "17–30" };
  return            { label: "Very high ICU acuity",       ratio: "2 : 1", tone: "var(--color-tone-rose)",  range: "> 30" };
}

interface Props {
  mode?: Mode;
  patientName?: string;
  className?: string;
}

export function AcuityScoring({ mode = "ward", patientName, className }: Props) {
  const params = mode === "icu" ? ICU_PARAMS : WARD_PARAMS;
  const [scores, setScores] = useState<Record<string, number>>(() =>
    Object.fromEntries(params.map((p) => [p.key, 0]))
  );

  const total = useMemo(() => Object.values(scores).reduce((a, b) => a + b, 0), [scores]);
  const tier = mode === "icu" ? icuTier(total) : wardTier(total);
  const max = mode === "icu" ? 36 : 30;

  return (
    <Widget
      title={`Acuity Scoring — ${mode === "icu" ? "ICU" : "Ward"}`}
      icon={ClipboardCheck}
      subtitle={patientName ? `Patient · ${patientName}` : "Right Patient · Right Nurse · Right Care · Right Outcome"}
      className={className}
    >
      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-background p-3">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Total score</div>
          <div className="mt-0.5 text-2xl font-semibold text-foreground">
            {total} <span className="text-sm font-normal text-muted-foreground">/ {max}</span>
          </div>
        </div>
        <div
          className="rounded-lg border p-3"
          style={{ borderColor: tier.tone, background: `color-mix(in oklab, ${tier.tone} 12%, var(--color-background))` }}
        >
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Acuity level · {tier.range}</div>
          <div className="mt-0.5 text-sm font-semibold text-foreground">{tier.label}</div>
        </div>
        <div className="rounded-lg border border-border bg-background p-3">
          <div className="flex items-center gap-1 text-[11px] uppercase tracking-wider text-muted-foreground">
            <Users className="h-3 w-3" /> Recommended ratio
          </div>
          <div className="mt-0.5 text-sm font-semibold text-foreground">Nurse {tier.ratio} Patient</div>
        </div>
      </div>

      <div className="space-y-2">
        {params.map((p) => (
          <div key={p.key} className="rounded-md border border-border bg-background p-2.5">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-foreground">{p.label}</span>
              <span className="text-[11px] text-muted-foreground">{p.levels[scores[p.key]]}</span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {[0, 1, 2, 3].map((s) => {
                const on = scores[p.key] === s;
                return (
                  <button
                    key={s}
                    onClick={() => setScores({ ...scores, [p.key]: s })}
                    className={`rounded px-2 py-1 text-xs font-medium transition ${
                      on
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-card text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-start gap-2 rounded-md border border-border bg-muted/40 p-2.5 text-[11px] text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Reassess on admission, every shift, and when condition changes. The score drives the next-shift staffing ratio
        and supports NABH / JCI compliance.
      </div>
    </Widget>
  );
}
