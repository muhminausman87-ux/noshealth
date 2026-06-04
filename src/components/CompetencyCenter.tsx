import { useMemo, useState } from "react";
import {
  ShieldAlert, Building2, Users2, Stethoscope, Crown, BarChart3,
  Search, CheckCircle2, Clock, AlertTriangle, Circle, BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Status = "complete" | "due" | "overdue" | "pending";

interface Comp {
  name: string;
  desc: string;
  target: string;
  freq: string;
  status: Status;
  evidence?: string;
}

interface Pillar {
  id: string;
  label: string;
  icon: any;
  tone: string;
  items: Comp[];
}

// Condensed from the NOS Competency Centre — kept tight on purpose.
const PILLARS: Pillar[] = [
  {
    id: "mandatory",
    label: "Mandatory",
    icon: ShieldAlert,
    tone: "var(--color-destructive)",
    items: [
      { name: "Infection Prevention & Control", desc: "Hand hygiene, PPE",                target: "All nursing",     freq: "Annual",   status: "complete" },
      { name: "SBAR Communication",             desc: "Structured handover",              target: "All nursing",     freq: "Annual",   status: "complete" },
      { name: "Environmental Safety",           desc: "Hazmat, fire & safety",            target: "All nursing",     freq: "Annual",   status: "complete" },
      { name: "Occupational Health & Safety",   desc: "Needlestick & exposure",           target: "All nursing",     freq: "Annual",   status: "due" },
      { name: "Disaster Awareness",             desc: "Mass casualty, evacuation",        target: "All nursing",     freq: "Annual",   status: "overdue" },
      { name: "Pain Management",                desc: "VAS, NRS, FLACC + multimodal",     target: "All nursing",     freq: "Annual",   status: "complete" },
      { name: "Manual Handling & Ergonomics",   desc: "Safe patient transfers",           target: "All EHS",         freq: "Annual",   status: "complete" },
      { name: "Code Management",                desc: "All codes + crash cart",           target: "All nursing",     freq: "Biannual", status: "due" },
      { name: "Life Support (BLS · ACLS · NLS)",desc: "Per AHA / local guidelines",       target: "All nursing",     freq: "Every 2y", status: "complete" },
      { name: "Early Warning (MEWS · PEWS)",    desc: "Score & escalate",                 target: "All nursing",     freq: "Annual",   status: "complete" },
      { name: "Age-Specific Care",              desc: "Lifespan considerations",          target: "All nursing",     freq: "Annual",   status: "due" },
      { name: "Mental Health Assessment",       desc: "PHQ-9, Columbia, de-escalation",   target: "All nursing",     freq: "Annual",   status: "overdue" },
      { name: "Behavioural Changes",            desc: "Delirium screening (CAM)",         target: "All nursing",     freq: "Annual",   status: "pending" },
      { name: "Patient Rights & Ethics",        desc: "Consent, dignity, confidentiality",target: "All nursing",     freq: "Annual",   status: "complete" },
    ],
  },
  {
    id: "departmental",
    label: "Departmental",
    icon: Building2,
    tone: "var(--color-tone-sky)",
    items: [
      { name: "Haemodynamic Monitoring",         desc: "Art line, CVP, PAC",              target: "ICU RN",   freq: "Annual",   status: "complete" },
      { name: "Ventilator Management",           desc: "Modes, weaning, VAP bundle",      target: "ICU RN",   freq: "Annual",   status: "complete" },
      { name: "Vasoactive Medications",          desc: "Vasopressors & inotropes",        target: "ICU RN",   freq: "Annual",   status: "complete" },
      { name: "CRRT / CVVHDF",                   desc: "Circuit, anticoag, balance",      target: "ICU RN",   freq: "Biannual", status: "due" },
      { name: "Sedation & Delirium (ABCDEF)",    desc: "RASS, CAM-ICU, awakening",        target: "ICU RN",   freq: "Annual",   status: "complete" },
      { name: "IABP Management",                 desc: "Timing, augmentation, weaning",   target: "Senior ICU", freq: "Biannual", status: "due" },
      { name: "Sepsis Hour-1 Bundle",            desc: "Lactate, cultures, antibiotics",  target: "ICU RN",   freq: "Annual",   status: "complete" },
      { name: "Organ Donation (DBD / DCD)",      desc: "Pathways, family, referral",      target: "ICU RN",   freq: "Annual",   status: "pending" },
    ],
  },
  {
    id: "shared",
    label: "Shared Governance",
    icon: Users2,
    tone: "var(--color-tone-violet)",
    items: [
      { name: "Practice Council",                 desc: "Clinical policy & EBP",          target: "Volunteer", freq: "Ongoing", status: "complete" },
      { name: "Quality & Safety Council",         desc: "Incident & audit review",        target: "Volunteer", freq: "Ongoing", status: "complete" },
      { name: "Education Council",                desc: "Competency design",              target: "Volunteer", freq: "Ongoing", status: "due" },
      { name: "Wellbeing & Workforce Council",    desc: "Burnout, rosters, support",      target: "Chair",     freq: "Ongoing", status: "complete" },
      { name: "Nurse Wellbeing Policy",           desc: "Rest breaks & support access",   target: "Reviewer",  freq: "Annual",  status: "due" },
      { name: "VAP Bundle Compliance Audit",      desc: "Monthly cycle",                  target: "Lead",      freq: "Monthly", status: "complete" },
    ],
  },
  {
    id: "clinical",
    label: "Clinical Specialties",
    icon: Stethoscope,
    tone: "var(--color-tone-mint)",
    items: [
      { name: "12-Lead ECG",          desc: "Rhythm + ST changes",   target: "All clinical", freq: "Annual", status: "complete", evidence: "AHA/ACC 2024" },
      { name: "Tracheostomy Care",    desc: "Inner cannula, suction",target: "Resp/ICU",     freq: "Annual", status: "complete", evidence: "NSA 2023" },
      { name: "Chest Drain",          desc: "Underwater seal",       target: "Resp/Surg",    freq: "Annual", status: "complete", evidence: "BTS 2023" },
      { name: "IV Therapy / CVC",     desc: "CLABSI bundle",         target: "All clinical", freq: "Annual", status: "due",      evidence: "INS 2024" },
      { name: "Blood Transfusion",    desc: "Pre-checks & reactions",target: "All clinical", freq: "Annual", status: "complete", evidence: "BCSH 2023" },
      { name: "Wound & Pressure Injury", desc: "Braden, offloading", target: "All clinical", freq: "Annual", status: "complete", evidence: "EPUAP 2024" },
      { name: "NG Tube Care",         desc: "pH + x-ray confirm",    target: "All clinical", freq: "Annual", status: "complete", evidence: "NPSA 2024" },
      { name: "Urinary Catheter",     desc: "CAUTI bundle",          target: "All clinical", freq: "Annual", status: "complete", evidence: "CDC 2024" },
    ],
  },
  {
    id: "leadership",
    label: "Leadership",
    icon: Crown,
    tone: "var(--color-tone-amber)",
    items: [
      { name: "Shift Coordination",    desc: "Charge nurse basics",   target: "Senior RN", freq: "Annual", status: "complete" },
      { name: "Conflict Resolution",   desc: "Team & patient",        target: "Senior RN", freq: "Annual", status: "due" },
      { name: "Coaching & Mentoring",  desc: "Preceptor toolkit",     target: "Preceptor", freq: "Annual", status: "complete" },
      { name: "Just Culture",          desc: "System-first incident", target: "All",       freq: "Annual", status: "complete" },
    ],
  },
];

const STATUS_META: Record<Status, { label: string; tone: string; icon: any }> = {
  complete: { label: "Complete",    tone: "var(--color-tone-mint)",   icon: CheckCircle2 },
  due:      { label: "Due soon",    tone: "var(--color-tone-amber)",  icon: Clock },
  overdue:  { label: "Overdue",     tone: "var(--color-destructive)", icon: AlertTriangle },
  pending:  { label: "Not started", tone: "var(--color-muted-foreground, #94a3b8)", icon: Circle },
};

export function CompetencyCenter() {
  const [active, setActive] = useState<string>("mandatory");
  const [q, setQ] = useState("");

  const pillar = PILLARS.find((p) => p.id === active)!;
  const filtered = useMemo(
    () =>
      pillar.items.filter((i) =>
        (i.name + i.desc).toLowerCase().includes(q.toLowerCase()),
      ),
    [pillar, q],
  );

  const totals = useMemo(() => {
    const all = PILLARS.flatMap((p) => p.items);
    return {
      total: all.length,
      complete: all.filter((i) => i.status === "complete").length,
      due: all.filter((i) => i.status === "due").length,
      overdue: all.filter((i) => i.status === "overdue").length,
    };
  }, []);

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5 text-primary" /> Competency centre
          </div>
          <h3 className="mt-1 text-base font-semibold text-foreground">Your professional pathway</h3>
          <p className="text-xs text-muted-foreground">
            Five pillars · short modules · take them at your pace, no pressure.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Pill tone="var(--color-tone-mint)" label={`${totals.complete} done`} />
          <Pill tone="var(--color-tone-amber)" label={`${totals.due} due`} />
          <Pill tone="var(--color-destructive)" label={`${totals.overdue} overdue`} />
        </div>
      </header>

      {/* Pillar tabs */}
      <div className="-mx-1 mb-4 flex flex-wrap gap-1.5 overflow-x-auto px-1">
        {PILLARS.map((p) => {
          const Icon = p.icon;
          const isOn = p.id === active;
          return (
            <button
              key={p.id}
              onClick={() => setActive(p.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                isOn
                  ? "border-transparent text-white"
                  : "border-border bg-background/40 text-muted-foreground hover:text-foreground"
              }`}
              style={isOn ? { background: p.tone } : undefined}
            >
              <Icon className="h-3.5 w-3.5" />
              {p.label}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${isOn ? "bg-white/20" : "bg-secondary"}`}>
                {p.items.length}
              </span>
            </button>
          );
        })}
        <button
          onClick={() => setActive("__overview__")}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium ${
            active === "__overview__"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background/40 text-muted-foreground hover:text-foreground"
          }`}
        >
          <BarChart3 className="h-3.5 w-3.5" /> Overview
        </button>
      </div>

      {active === "__overview__" ? (
        <Overview />
      ) : (
        <>
          <div className="mb-3 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={`Search ${pillar.label.toLowerCase()}…`}
                className="h-8 pl-7 text-sm"
              />
            </div>
          </div>

          <ul className="space-y-2">
            {filtered.map((c) => {
              const s = STATUS_META[c.status];
              const Icon = s.icon;
              return (
                <li
                  key={c.name}
                  className="flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-background/40 p-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{c.name}</span>
                      <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {c.freq}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{c.desc}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                      <span>{c.target}</span>
                      {c.evidence && <span>· {c.evidence}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
                      style={{ background: `color-mix(in oklab, ${s.tone} 18%, transparent)`, color: s.tone }}
                    >
                      <Icon className="h-3 w-3" /> {s.label}
                    </span>
                    <Button size="sm" variant={c.status === "complete" ? "outline" : "default"} className="h-7 px-3 text-xs">
                      {c.status === "complete" ? "View" : c.status === "overdue" ? "Start now" : "Open"}
                    </Button>
                  </div>
                </li>
              );
            })}
            {filtered.length === 0 && (
              <li className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                Nothing matches your search.
              </li>
            )}
          </ul>
        </>
      )}
    </section>
  );
}

function Pill({ tone, label }: { tone: string; label: string }) {
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={{ background: `color-mix(in oklab, ${tone} 18%, transparent)`, color: tone }}
    >
      {label}
    </span>
  );
}

function Overview() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {PILLARS.map((p) => {
        const done = p.items.filter((i) => i.status === "complete").length;
        const pct = Math.round((done / p.items.length) * 100);
        const Icon = p.icon;
        return (
          <div key={p.id} className="rounded-xl border border-border bg-background/40 p-3">
            <div className="flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ background: `color-mix(in oklab, ${p.tone} 18%, transparent)`, color: p.tone }}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-foreground">{p.label}</div>
                <div className="text-[11px] text-muted-foreground">{done} of {p.items.length} complete</div>
              </div>
              <span className="text-sm font-semibold" style={{ color: p.tone }}>{pct}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: p.tone }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
