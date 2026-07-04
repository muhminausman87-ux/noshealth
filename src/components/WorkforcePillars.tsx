import {
  Heart, MessageSquare, ShieldCheck, Sparkles, ArrowRight, Compass,
  GraduationCap, Wrench, Bot, Rocket, Activity, Target, TrendingUp,
  AlertTriangle, Lightbulb, ThumbsUp, Workflow,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { StatusPill } from "@/components/Widget";
import { NurseVoiceCenter } from "@/components/NurseVoiceCenter";

/**
 * Workforce Intelligence — Strategic Pillars
 * Philosophy hero + Nurse Voice Intelligence Center + Support the Leader + Informatics Network.
 */
export function WorkforcePillars() {
  return (
    <div className="space-y-6">
      <PhilosophyHero />
      <NurseVoiceCenter />
      <SupportTheLeader />
      <InformaticsNetwork />
    </div>
  );
}

// ---------------- Philosophy Hero ----------------
function PhilosophyHero() {
  return (
    <section className="overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
            <Compass className="h-3 w-3" /> Workforce Intelligence Philosophy
          </span>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Supporting nurses. Strengthening teams. <br className="hidden sm:block" />
            Improving patient care through Workforce Intelligence.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Technology should reduce burden, strengthen teamwork, improve workforce wellbeing,
            and help nursing leaders make better decisions.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-1">
          <PillarChip icon={Heart} label="Protect the Nurse" />
          <PillarChip icon={MessageSquare} label="Listen to the Nurse" />
          <PillarChip icon={ShieldCheck} label="Support the Leader" />
          <PillarChip icon={Rocket} label="Empower Champions" />
        </div>
      </div>
    </section>
  );
}

function PillarChip({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-1.5 text-xs font-medium text-foreground backdrop-blur">
      <Icon className="h-3.5 w-3.5 text-primary" />
      {label}
    </div>
  );
}

// Nurse Voice Intelligence Center lives in NurseVoiceCenter.tsx

// ---------------- Support the Nurse Leader ----------------
type Priority = "High" | "Medium" | "Low";
const LEADER_INSIGHTS: {
  title: string;
  matters: string;
  action: string;
  impact: string;
  priority: Priority;
  icon: LucideIcon;
}[] = [
  {
    title: "ICU evening shift trending below safe ratio",
    matters: "Two nurses are approaching consecutive-shift thresholds — extending them risks fatigue-related errors.",
    action: "Deploy one float nurse from Med-Surg for the 18:00–22:00 window and offer voluntary recovery time.",
    impact: "Restores safe ratio, protects two nurses from over-extension, keeps ICU workload under 1.1×.",
    priority: "High",
    icon: AlertTriangle,
  },
  {
    title: "Emergency team showing early fatigue signals",
    matters: "Missed breaks up 9 this week; wellbeing check-ins report rising strain.",
    action: "Schedule a 10-minute stand-up with the ED lead and confirm break coverage for the next 3 shifts.",
    impact: "Reduces burnout risk index by an estimated 6–8 points within one week.",
    priority: "High",
    icon: Activity,
  },
  {
    title: "Med-Surg sustaining 94% coverage — recognize the team",
    matters: "Consistent coverage and balanced skill mix should be reinforced, not assumed.",
    action: "Send a team appreciation note and highlight the unit in the weekly leadership brief.",
    impact: "Strengthens retention signals; supports the workforce stability score.",
    priority: "Medium",
    icon: ThumbsUp,
  },
  {
    title: "Duplicate vitals charting flagged by frontline",
    matters: "Two nurses have surfaced the same workflow barrier — it likely affects many more.",
    action: "Add to the informatics backlog and pair with the ICU champion for a 2-week fix.",
    impact: "Saves an estimated ~4 min per patient, freeing capacity for direct care.",
    priority: "Medium",
    icon: Workflow,
  },
];

function SupportTheLeader() {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold tracking-tight">Support the Nurse Leader</h2>
            <p className="text-xs text-muted-foreground">
              Every insight comes with context, a recommended action, and expected impact
            </p>
          </div>
        </div>
        <StatusPill tone="info">Decision Support</StatusPill>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {LEADER_INSIGHTS.map((it) => (
          <article key={it.title} className="flex flex-col rounded-lg border border-border bg-background p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <it.icon className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">{it.title}</h3>
              </div>
              <PriorityBadge p={it.priority} />
            </div>

            <dl className="mt-3 space-y-2 text-xs">
              <InsightRow icon={Sparkles} label="Why this matters" body={it.matters} />
              <InsightRow icon={ArrowRight} label="Recommended action" body={it.action} />
              <InsightRow icon={Target} label="Expected impact" body={it.impact} />
            </dl>

            <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
              <button className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground hover:bg-primary/90">
                Take action
              </button>
              <button className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-foreground hover:bg-secondary">
                Discuss with team
              </button>
              <button className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-foreground hover:bg-secondary">
                Snooze
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function InsightRow({ icon: Icon, label, body }: { icon: LucideIcon; label: string; body: string }) {
  return (
    <div className="flex gap-2">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
      <div>
        <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</dt>
        <dd className="mt-0.5 text-xs leading-relaxed text-foreground">{body}</dd>
      </div>
    </div>
  );
}

function PriorityBadge({ p }: { p: Priority }) {
  const tone = p === "High" ? "danger" : p === "Medium" ? "warning" : "success";
  return <StatusPill tone={tone}>{p} priority</StatusPill>;
}

// ---------------- Informatics Champions Network ----------------
type AdoptionTone = "success" | "warning" | "info";
const CHAMPIONS: {
  name: string;
  dept: string;
  activeIssues: number;
  trainingRequests: number;
  productFeedback: number;
  workflowIdeas: number;
  aiSuggestions: number;
  adoption: number;
  adoptionLabel: string;
  adoptionTone: AdoptionTone;
}[] = [
  { name: "Sara N.", dept: "ICU", activeIssues: 3, trainingRequests: 2, productFeedback: 5, workflowIdeas: 4, aiSuggestions: 2, adoption: 88, adoptionLabel: "Strong", adoptionTone: "success" },
  { name: "Miguel R.", dept: "Emergency", activeIssues: 4, trainingRequests: 3, productFeedback: 6, workflowIdeas: 3, aiSuggestions: 3, adoption: 74, adoptionLabel: "Growing", adoptionTone: "warning" },
  { name: "Aisha K.", dept: "Med-Surg", activeIssues: 2, trainingRequests: 1, productFeedback: 4, workflowIdeas: 5, aiSuggestions: 2, adoption: 92, adoptionLabel: "Strong", adoptionTone: "success" },
  { name: "Lena P.", dept: "Maternity", activeIssues: 1, trainingRequests: 2, productFeedback: 3, workflowIdeas: 2, aiSuggestions: 1, adoption: 81, adoptionLabel: "Strong", adoptionTone: "success" },
  { name: "David O.", dept: "Cardiac", activeIssues: 2, trainingRequests: 4, productFeedback: 2, workflowIdeas: 3, aiSuggestions: 2, adoption: 69, adoptionLabel: "Building", adoptionTone: "info" },
  { name: "Priya S.", dept: "Pediatric", activeIssues: 1, trainingRequests: 1, productFeedback: 4, workflowIdeas: 4, aiSuggestions: 3, adoption: 86, adoptionLabel: "Strong", adoptionTone: "success" },
];

function InformaticsNetwork() {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Rocket className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold tracking-tight">
              Informatics Champions — Collaborative Improvement Network
            </h2>
            <p className="text-xs text-muted-foreground">
              Frontline partners shaping the platform · a two-way channel for continuous improvement
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusPill tone="success">6 active champions</StatusPill>
          <StatusPill tone="info">21 open ideas</StatusPill>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {CHAMPIONS.map((c) => (
          <article key={c.name} className="rounded-lg border border-border bg-background p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-sm font-semibold text-foreground">{c.name}</div>
                <div className="text-[11px] text-muted-foreground">{c.dept}</div>
              </div>
              <StatusPill tone={c.adoptionTone}>{c.adoptionLabel}</StatusPill>
            </div>

            <dl className="mt-3 grid grid-cols-2 gap-2">
              <ChampionStat icon={AlertTriangle} label="Active issues" value={c.activeIssues} />
              <ChampionStat icon={GraduationCap} label="Training requests" value={c.trainingRequests} />
              <ChampionStat icon={MessageSquare} label="Product feedback" value={c.productFeedback} />
              <ChampionStat icon={Wrench} label="Workflow ideas" value={c.workflowIdeas} />
              <ChampionStat icon={Bot} label="AI suggestions" value={c.aiSuggestions} />
              <ChampionStat icon={TrendingUp} label="Adoption" value={`${c.adoption}%`} />
            </dl>

            <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
              <button className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-[11px] font-medium text-foreground hover:bg-secondary">
                <MessageSquare className="h-3 w-3" /> Message
              </button>
              <button className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-[11px] font-medium text-foreground hover:bg-secondary">
                <Lightbulb className="h-3 w-3" /> Review ideas
              </button>
              <button className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-[11px] font-medium text-foreground hover:bg-secondary">
                <ThumbsUp className="h-3 w-3" /> Recognize
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ChampionStat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number | string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-card px-2 py-1.5">
      <Icon className="h-3.5 w-3.5 text-primary" />
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-xs font-semibold text-foreground">{value}</div>
      </div>
    </div>
  );
}
