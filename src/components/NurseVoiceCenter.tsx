import { useState } from "react";
import {
  MessageSquare, AlertTriangle, Lightbulb, ThumbsUp, Heart, Sparkles,
  ListChecks, Megaphone, ArrowRight, TrendingUp, TrendingDown, Minus,
  Users, FileText, Radio, Wrench, GraduationCap, CalendarClock, HandHeart,
  CheckCircle2, Clock, PlayCircle, FlaskConical, Rocket, XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { StatusPill } from "@/components/Widget";

/**
 * AI-powered Nurse Voice Intelligence Center.
 * Primary communication + workforce insight hub for nursing leadership.
 * All data is illustrative demo content — no backend writes.
 */

type TabKey =
  | "concerns" | "suggestions" | "appreciation"
  | "wellbeing" | "insights" | "tracker" | "response";

const TABS: { key: TabKey; label: string; icon: LucideIcon }[] = [
  { key: "concerns", label: "Shift Concerns", icon: AlertTriangle },
  { key: "suggestions", label: "Suggestions", icon: Lightbulb },
  { key: "appreciation", label: "Appreciation", icon: ThumbsUp },
  { key: "wellbeing", label: "Wellbeing Check-ins", icon: Heart },
  { key: "insights", label: "AI Insights", icon: Sparkles },
  { key: "tracker", label: "Action Tracker", icon: ListChecks },
  { key: "response", label: "Leadership Response", icon: Megaphone },
];

export function NurseVoiceCenter() {
  const [tab, setTab] = useState<TabKey>("concerns");

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
            <MessageSquare className="h-4.5 w-4.5" />
          </div>
          <div>
            <h2 className="text-base font-semibold tracking-tight">
              Nurse Voice Intelligence Center
            </h2>
            <p className="text-xs text-muted-foreground">
              Trust · transparency · continuous improvement — every message is heard and tracked
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill tone="success">42 messages this week</StatusPill>
          <StatusPill tone="info">Communication Hub</StatusPill>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-1.5 border-b border-border pb-2">
        {TABS.map((t) => {
          const active = t.key === tab;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
              {t.key === "insights" && (
                <span className="ml-1 rounded-full border border-primary/30 bg-background px-1.5 text-[9px] font-semibold uppercase tracking-wider text-primary">
                  AI
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        {tab === "concerns" && <Concerns />}
        {tab === "suggestions" && <Suggestions />}
        {tab === "appreciation" && <Appreciation />}
        {tab === "wellbeing" && <Wellbeing />}
        {tab === "insights" && <AIInsights />}
        {tab === "tracker" && <ActionTracker />}
        {tab === "response" && <LeadershipResponse />}
      </div>
    </section>
  );
}

// ---------------- Shared building blocks ----------------
type Tone = "info" | "success" | "warning" | "danger";

function CategoryChip({ icon: Icon, label, tone = "info" }: { icon: LucideIcon; label: string; tone?: Tone }) {
  const map: Record<Tone, string> = {
    info: "bg-primary/10 text-primary border-primary/20",
    success: "bg-success/15 text-success border-success/30",
    warning: "bg-warning/20 text-warning-foreground border-warning/40",
    danger: "bg-destructive/15 text-destructive border-destructive/30",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${map[tone]}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

function MessageCard({
  from, dept, time, body, category, categoryIcon, categoryTone,
  status, statusTone,
}: {
  from: string; dept: string; time: string; body: string;
  category: string; categoryIcon: LucideIcon; categoryTone: Tone;
  status: string; statusTone: Tone;
}) {
  return (
    <li className="rounded-lg border border-border bg-background p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-foreground">
            {from} <span className="text-muted-foreground">· {dept}</span>
          </span>
          <CategoryChip icon={categoryIcon} label={category} tone={categoryTone} />
        </div>
        <div className="flex items-center gap-2">
          <StatusPill tone={statusTone}>{status}</StatusPill>
          <span className="text-[11px] text-muted-foreground">{time}</span>
        </div>
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-foreground">{body}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <ActionBtn icon={ThumbsUp}>Acknowledge</ActionBtn>
        <ActionBtn icon={ArrowRight}>Respond</ActionBtn>
        <ActionBtn icon={ListChecks}>Add to action tracker</ActionBtn>
      </div>
    </li>
  );
}

function ActionBtn({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <button className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-[11px] font-medium text-foreground hover:bg-secondary">
      <Icon className="h-3 w-3" /> {children}
    </button>
  );
}

// ---------------- Shift Concerns ----------------
function Concerns() {
  const items = [
    { from: "Nurse A.", dept: "ICU", time: "22 min ago", body: "Evening ratio is tight — could use one float nurse for the next 4 hours.", category: "Staffing", categoryIcon: Users, categoryTone: "warning" as Tone, status: "Under review", statusTone: "warning" as Tone },
    { from: "Nurse M.", dept: "Emergency", time: "1 h ago", body: "Triage queue building; requesting support to keep wait times safe.", category: "High workload", categoryIcon: TrendingUp, categoryTone: "danger" as Tone, status: "Acknowledged", statusTone: "info" as Tone },
    { from: "Nurse S.", dept: "Med-Surg", time: "2 h ago", body: "Two IV pumps out of service on the ward — impacting med rounds.", category: "Equipment", categoryIcon: Wrench, categoryTone: "danger" as Tone, status: "In progress", statusTone: "info" as Tone },
    { from: "Nurse H.", dept: "Maternity", time: "3 h ago", body: "Handoff window overlapping with med pass — safety risk during peak.", category: "Patient safety", categoryIcon: AlertTriangle, categoryTone: "danger" as Tone, status: "Escalated", statusTone: "danger" as Tone },
    { from: "Nurse P.", dept: "OT", time: "Today", body: "Preference cards not syncing to the new tablet workflow.", category: "Workflow barrier", categoryIcon: Wrench, categoryTone: "warning" as Tone, status: "In progress", statusTone: "info" as Tone },
  ];
  return <ul className="space-y-2">{items.map((m, i) => <MessageCard key={i} {...m} />)}</ul>;
}

// ---------------- Suggestions ----------------
function Suggestions() {
  const items = [
    { from: "Nurse K.", dept: "Med-Surg", time: "3 h ago", body: "A shared handoff template between shifts would save ~10 min per nurse.", category: "Workflow improvement", categoryIcon: Wrench, categoryTone: "info" as Tone, status: "Under review", statusTone: "warning" as Tone },
    { from: "Nurse L.", dept: "Maternity", time: "Yesterday", body: "Quick-tap medication acknowledgement to reduce charting load.", category: "Product enhancement", categoryIcon: Sparkles, categoryTone: "info" as Tone, status: "Planned", statusTone: "info" as Tone },
    { from: "Nurse J.", dept: "Pediatric", time: "Yesterday", body: "Bedside education videos for parents would cut repeat questions.", category: "Patient care", categoryIcon: HandHeart, categoryTone: "success" as Tone, status: "Pilot", statusTone: "info" as Tone },
    { from: "Nurse D.", dept: "ICU", time: "2 days ago", body: "Reuse of sterile-wrap packaging for training saves ~$400/mo per unit.", category: "Cost-saving", categoryIcon: FileText, categoryTone: "success" as Tone, status: "Implemented", statusTone: "success" as Tone },
  ];
  return <ul className="space-y-2">{items.map((m, i) => <MessageCard key={i} {...m} />)}</ul>;
}

// ---------------- Appreciation ----------------
function Appreciation() {
  const items = [
    { from: "Nurse T.", dept: "Pediatric", time: "35 min ago", body: "Thank you to the float team — the extra hands on evening shift made a real difference.", category: "Peer recognition", categoryIcon: ThumbsUp, categoryTone: "success" as Tone, status: "Shared with team", statusTone: "success" as Tone },
    { from: "Nurse R.", dept: "Cardiac", time: "2 h ago", body: "Leadership check-in this morning was genuinely appreciated.", category: "Manager recognition", categoryIcon: Megaphone, categoryTone: "success" as Tone, status: "Recognized", statusTone: "success" as Tone },
    { from: "Nurse E.", dept: "Med-Surg", time: "Yesterday", body: "Sustained 94% coverage for three weeks — proud of this team.", category: "Team achievement", categoryIcon: Users, categoryTone: "success" as Tone, status: "Highlighted", statusTone: "success" as Tone },
    { from: "Family of pt. #A21", dept: "Maternity", time: "Yesterday", body: "The night nurse was extraordinary — calm, kind, and completely present.", category: "Patient/family feedback", categoryIcon: HandHeart, categoryTone: "success" as Tone, status: "Shared with nurse", statusTone: "success" as Tone },
  ];
  return <ul className="space-y-2">{items.map((m, i) => <MessageCard key={i} {...m} />)}</ul>;
}

// ---------------- Wellbeing Check-ins ----------------
type Mood = "Excellent" | "Good" | "Busy" | "Difficult" | "Overwhelming";
const MOOD_META: Record<Mood, { tone: Tone; color: string }> = {
  Excellent:     { tone: "success", color: "bg-success" },
  Good:          { tone: "success", color: "bg-success/70" },
  Busy:          { tone: "info",    color: "bg-primary" },
  Difficult:     { tone: "warning", color: "bg-warning" },
  Overwhelming:  { tone: "danger",  color: "bg-destructive" },
};

function Wellbeing() {
  const depts = [
    { dept: "ICU",       counts: { Excellent: 1, Good: 3, Busy: 4, Difficult: 3, Overwhelming: 2 } },
    { dept: "Emergency", counts: { Excellent: 0, Good: 2, Busy: 5, Difficult: 4, Overwhelming: 3 } },
    { dept: "Med-Surg",  counts: { Excellent: 3, Good: 6, Busy: 4, Difficult: 1, Overwhelming: 0 } },
    { dept: "Maternity", counts: { Excellent: 2, Good: 5, Busy: 2, Difficult: 1, Overwhelming: 0 } },
    { dept: "Cardiac",   counts: { Excellent: 1, Good: 4, Busy: 3, Difficult: 2, Overwhelming: 1 } },
    { dept: "Pediatric", counts: { Excellent: 2, Good: 5, Busy: 3, Difficult: 1, Overwhelming: 0 } },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">Confidential by design.</span>{" "}
        Individual responses are never shown — only department-level trends are shared with leadership.
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(MOOD_META) as Mood[]).map((m) => (
          <span key={m} className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className={`h-2.5 w-2.5 rounded-sm ${MOOD_META[m].color}`} />
            {m}
          </span>
        ))}
      </div>

      {/* Department trend bars */}
      <div className="space-y-2">
        {depts.map((d) => {
          const total = Object.values(d.counts).reduce((a, b) => a + b, 0);
          return (
            <div key={d.dept} className="rounded-lg border border-border bg-background p-3">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">{d.dept}</span>
                <span className="text-muted-foreground">{total} check-ins this week</span>
              </div>
              <div className="flex h-3 overflow-hidden rounded-full bg-secondary">
                {(Object.keys(MOOD_META) as Mood[]).map((m) => {
                  const pct = (d.counts[m] / total) * 100;
                  return pct > 0 ? (
                    <div key={m} className={`${MOOD_META[m].color}`} style={{ width: `${pct}%` }} title={`${m}: ${d.counts[m]}`} />
                  ) : null;
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------- AI Insights ----------------
function AIInsights() {
  const themes: {
    theme: string;
    reports: number;
    trend: "up" | "down" | "flat";
    trendLabel: string;
    depts: string[];
    summary: string;
    action: string;
    tone: Tone;
    icon: LucideIcon;
  }[] = [
    { theme: "Staffing", reports: 18, trend: "up", trendLabel: "+22% w/w", depts: ["ICU", "Emergency"], summary: "Evening shifts consistently flagged as under-supported; float requests concentrated 18:00–22:00.", action: "Rebalance evening float pool and pre-schedule on-call coverage.", tone: "danger", icon: Users },
    { theme: "Documentation burden", reports: 12, trend: "up", trendLabel: "+15% w/w", depts: ["ICU", "Med-Surg"], summary: "Duplicate vitals charting across two systems is the most-cited barrier this month.", action: "Prioritize informatics backlog item to consolidate vitals capture.", tone: "warning", icon: FileText },
    { theme: "Communication", reports: 9, trend: "flat", trendLabel: "stable", depts: ["Emergency", "OT"], summary: "Handoff window overlaps with med pass in two units — safety concern raised twice.", action: "Pilot staggered handoff windows for two weeks and measure incidents.", tone: "warning", icon: Radio },
    { theme: "Equipment", reports: 7, trend: "up", trendLabel: "+3 this week", depts: ["Med-Surg", "Cardiac"], summary: "IV pump availability trending down; two units out on Med-Surg today.", action: "Escalate biomed maintenance SLA and confirm loaner pool.", tone: "danger", icon: Wrench },
    { theme: "Training", reports: 6, trend: "down", trendLabel: "-2 vs last week", depts: ["Pediatric", "Cardiac"], summary: "New-hire requests for paired shifts have been mostly resolved.", action: "Formalize a 2-week paired-shift standard for all new graduates.", tone: "info", icon: GraduationCap },
    { theme: "Scheduling", reports: 8, trend: "up", trendLabel: "+4 w/w", depts: ["Emergency", "ICU"], summary: "Weekend night rotation perceived as unbalanced; three concerns in past 10 days.", action: "Review 6-week rotation with charge nurses; test alternative pattern.", tone: "warning", icon: CalendarClock },
    { theme: "Teamwork", reports: 5, trend: "down", trendLabel: "-1 w/w", depts: ["Med-Surg", "Maternity"], summary: "Positive signal — appreciation messages outpacing concerns in these units.", action: "Recognize teams publicly and share what's working with other units.", tone: "success", icon: HandHeart },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          Themes are grouped from anonymized messages using pattern detection.
        </p>
        <StatusPill tone="warning">AI Prototype</StatusPill>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {themes.map((t) => {
          const TrendIcon = t.trend === "up" ? TrendingUp : t.trend === "down" ? TrendingDown : Minus;
          const trendColor =
            t.trend === "up" && t.tone !== "success" ? "text-destructive" :
            t.trend === "down" && t.tone !== "success" ? "text-success" :
            "text-muted-foreground";
          const toneRing: Record<Tone, string> = {
            info: "border-primary/30",
            success: "border-success/30",
            warning: "border-warning/40",
            danger: "border-destructive/30",
          };
          const toneIcon: Record<Tone, string> = {
            info: "bg-primary/10 text-primary",
            success: "bg-success/15 text-success",
            warning: "bg-warning/20 text-warning-foreground",
            danger: "bg-destructive/15 text-destructive",
          };
          return (
            <article key={t.theme} className={`rounded-lg border ${toneRing[t.tone]} bg-background p-4`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-md ${toneIcon[t.tone]}`}>
                    <t.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{t.theme}</h3>
                    <div className="text-[11px] text-muted-foreground">{t.reports} reports</div>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${trendColor}`}>
                  <TrendIcon className="h-3 w-3" />
                  {t.trendLabel}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {t.depts.map((d) => (
                  <span key={d} className="rounded-full border border-border bg-card px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {d}
                  </span>
                ))}
              </div>

              <p className="mt-3 text-xs leading-relaxed text-foreground">
                <span className="font-semibold">AI summary: </span>{t.summary}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                <span className="font-semibold text-foreground">Recommended action: </span>{t.action}
              </p>
            </article>
          );
        })}
      </div>
    </div>
  );
}

// ---------------- Action Tracker ----------------
const STAGES = ["Submitted", "Under Review", "In Progress", "Pilot", "Implemented", "Closed"] as const;
type Stage = typeof STAGES[number];
const STAGE_ICON: Record<Stage, LucideIcon> = {
  "Submitted": Clock,
  "Under Review": FileText,
  "In Progress": PlayCircle,
  "Pilot": FlaskConical,
  "Implemented": Rocket,
  "Closed": XCircle,
};

function ActionTracker() {
  const items: { title: string; from: string; dept: string; stage: Stage; updated: string }[] = [
    { title: "Consolidate duplicate vitals charting", from: "Nurse S.", dept: "ICU", stage: "In Progress", updated: "Today" },
    { title: "Stagger handoff and med pass windows", from: "Nurse H.", dept: "Maternity", stage: "Pilot", updated: "2 days ago" },
    { title: "Shared handoff template between shifts", from: "Nurse K.", dept: "Med-Surg", stage: "Under Review", updated: "3 days ago" },
    { title: "Bedside education videos for parents", from: "Nurse J.", dept: "Pediatric", stage: "Pilot", updated: "This week" },
    { title: "Reuse sterile-wrap packaging for training", from: "Nurse D.", dept: "ICU", stage: "Implemented", updated: "Last week" },
    { title: "Preference cards not syncing on tablet", from: "Nurse P.", dept: "OT", stage: "Submitted", updated: "Today" },
    { title: "Rebalance weekend night rotation", from: "Nurse D.", dept: "Emergency", stage: "Under Review", updated: "Yesterday" },
    { title: "Paired shifts for new graduates (2 weeks)", from: "Nurse J.", dept: "Med-Surg", stage: "Closed", updated: "2 weeks ago" },
  ];

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Every concern and suggestion is tracked from submission to closure — visible to the whole team.
      </p>

      <ul className="space-y-2">
        {items.map((it, i) => {
          const stageIndex = STAGES.indexOf(it.stage);
          return (
            <li key={i} className="rounded-lg border border-border bg-background p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground">{it.title}</div>
                  <div className="text-[11px] text-muted-foreground">{it.from} · {it.dept} · updated {it.updated}</div>
                </div>
                <StageBadge stage={it.stage} />
              </div>

              {/* Pipeline */}
              <ol className="mt-3 flex flex-wrap items-center gap-1">
                {STAGES.map((s, idx) => {
                  const active = idx <= stageIndex;
                  const current = idx === stageIndex;
                  const StageIcon = STAGE_ICON[s];
                  return (
                    <li key={s} className="flex items-center">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                          current
                            ? "border-primary bg-primary text-primary-foreground"
                            : active
                            ? "border-primary/30 bg-primary/10 text-primary"
                            : "border-border bg-card text-muted-foreground"
                        }`}
                      >
                        <StageIcon className="h-2.5 w-2.5" />
                        {s}
                      </span>
                      {idx < STAGES.length - 1 && (
                        <span className={`mx-1 h-px w-4 ${idx < stageIndex ? "bg-primary/40" : "bg-border"}`} />
                      )}
                    </li>
                  );
                })}
              </ol>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function StageBadge({ stage }: { stage: Stage }) {
  const toneMap: Record<Stage, Tone> = {
    "Submitted": "info",
    "Under Review": "warning",
    "In Progress": "info",
    "Pilot": "warning",
    "Implemented": "success",
    "Closed": "success",
  };
  return <StatusPill tone={toneMap[stage]}>{stage}</StatusPill>;
}

// ---------------- Leadership Response ----------------
function LeadershipResponse() {
  const updates: {
    author: string; role: string; time: string; title: string; body: string;
    linkedItem?: string; tone: Tone;
  }[] = [
    {
      author: "Dr. Ana Torres", role: "Chief Nursing Officer", time: "Today",
      title: "Vitals consolidation — we heard you",
      body: "Thank you to everyone who flagged duplicate vitals charting. Informatics has scoped a 2-week fix with the ICU champion, and we'll share a progress update Friday.",
      linkedItem: "Consolidate duplicate vitals charting", tone: "info",
    },
    {
      author: "Marcus L.", role: "ICU Nurse Manager", time: "Yesterday",
      title: "Evening float coverage this week",
      body: "Based on your concerns, we've added one guaranteed float nurse for the 18:00–22:00 window through Sunday. Please share how it's landing.",
      linkedItem: "Rebalance evening float pool", tone: "success",
    },
    {
      author: "Priya S.", role: "Pediatric Lead", time: "2 days ago",
      title: "Bedside education pilot goes live",
      body: "The bedside videos suggestion is now in pilot on two rooms. Champions will collect feedback in weekly huddles.",
      linkedItem: "Bedside education videos for parents", tone: "info",
    },
    {
      author: "Dr. Ana Torres", role: "Chief Nursing Officer", time: "Last week",
      title: "Recognizing Med-Surg",
      body: "Med-Surg has sustained 94% coverage for three weeks — thank you. We'll highlight this in the monthly leadership brief.",
      tone: "success",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          Leadership updates so every nurse can see how feedback is being addressed.
        </p>
        <button className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground hover:bg-primary/90">
          <Megaphone className="h-3 w-3" /> Post an update
        </button>
      </div>

      <ul className="space-y-2">
        {updates.map((u, i) => (
          <li key={i} className="rounded-lg border border-border bg-background p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
                  {u.author.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">{u.author}</div>
                  <div className="text-[11px] text-muted-foreground">{u.role} · {u.time}</div>
                </div>
              </div>
              <StatusPill tone={u.tone}>Leadership update</StatusPill>
            </div>
            <div className="mt-2 text-sm font-semibold text-foreground">{u.title}</div>
            <p className="mt-1 text-xs leading-relaxed text-foreground">{u.body}</p>
            {u.linkedItem && (
              <div className="mt-2 inline-flex items-center gap-1 rounded-md border border-dashed border-border bg-card px-2 py-0.5 text-[10px] text-muted-foreground">
                <ListChecks className="h-3 w-3" />
                Linked action: <span className="font-medium text-foreground">{u.linkedItem}</span>
              </div>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              <ActionBtn icon={ThumbsUp}>Thank leadership</ActionBtn>
              <ActionBtn icon={CheckCircle2}>Mark as helpful</ActionBtn>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

