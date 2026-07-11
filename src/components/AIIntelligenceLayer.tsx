import {
  Sparkles, Activity, ClipboardList, ShieldCheck, Brain,
  TrendingUp, TrendingDown, ArrowRight, AlertTriangle,
  Users, HeartPulse, FileText, GraduationCap, Award,
  Waves, LineChart, ArrowDownRight, ArrowUpRight, Radio,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";

export type ModuleKey = "workforce" | "workflow" | "documentation" | "excellence";

const MODULES: Record<ModuleKey, { title: string; to: string; icon: LucideIcon; color: string }> = {
  workforce:     { title: "Workforce Intelligence",           to: "/workforce-intelligence",   icon: Users,        color: "#2563eb" },
  workflow:      { title: "Nursing Workflow Intelligence",    to: "/workflow-intelligence",    icon: Activity,     color: "#0d9488" },
  documentation: { title: "Intelligent Procedure Documentation", to: "/procedure-documentation", icon: ClipboardList, color: "#7c3aed" },
  excellence:    { title: "Clinical Excellence Hub",          to: "/clinical-excellence",      icon: ShieldCheck,  color: "#db2777" },
};

function AIBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
      <Sparkles className="h-3 w-3" /> AI Prototype
    </span>
  );
}

type Insight = { text: string; target: ModuleKey; tone?: "info" | "warning" | "danger" | "success" };

const INSIGHTS: Record<ModuleKey, { headline: string; items: Insight[] }> = {
  workforce: {
    headline: "Burnout risk rising 8% this week in ICU & ED",
    items: [
      { text: "Downstream impact on Clinical Excellence bundle compliance projected -4%", target: "excellence", tone: "warning" },
      { text: "Expected increase in documentation burden (+22 min / nurse / shift)", target: "documentation", tone: "warning" },
      { text: "Departments needing staffing review: ICU, ED, Cardiac", target: "workflow", tone: "danger" },
    ],
  },
  workflow: {
    headline: "Workflow delays up 12% in ED handoffs",
    items: [
      { text: "Patient throughput impact: avg LOS +38 min in ED", target: "workflow", tone: "danger" },
      { text: "Likely departments affected: ICU boarding, Med-Surg admissions", target: "workforce", tone: "warning" },
      { text: "Recommended staffing adjustment: +2 float nurses to ED evening shift", target: "workforce", tone: "info" },
    ],
  },
  documentation: {
    headline: "Documentation completeness dropped to 88% in Med-Surg",
    items: [
      { text: "Possible billing delay: 14 pending charge captures", target: "documentation", tone: "warning" },
      { text: "Audit readiness impact: JCI compliance projected 91% (was 96%)", target: "excellence", tone: "danger" },
      { text: "Recommend workflow review — handoff template gaps detected", target: "workflow", tone: "info" },
    ],
  },
  excellence: {
    headline: "CLABSI bundle compliance decreased to 82% in ICU",
    items: [
      { text: "Affected ICU staffing: 3 nurses without recent bundle refresher", target: "workforce", tone: "warning" },
      { text: "Recommend refresher training within 72 hrs (Infection Prevention SOP-04)", target: "excellence", tone: "info" },
      { text: "Notify Informatics Champion — documentation gap in daily bundle audit", target: "documentation", tone: "danger" },
    ],
  },
};

const TONE = {
  info:    { bg: "bg-primary/8",     border: "border-primary/25",     dot: "bg-primary",     text: "text-primary" },
  warning: { bg: "bg-warning/10",    border: "border-warning/30",     dot: "bg-warning",     text: "text-warning-foreground" },
  danger:  { bg: "bg-destructive/8", border: "border-destructive/25", dot: "bg-destructive", text: "text-destructive" },
  success: { bg: "bg-success/10",    border: "border-success/25",     dot: "bg-success",     text: "text-success" },
} as const;

export function RelatedInsights({ module }: { module: ModuleKey }) {
  const data = INSIGHTS[module];
  return (
    <section className="rounded-2xl border border-border bg-gradient-to-br from-card to-primary/5 p-5 shadow-sm">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">Related Insights</h3>
              <AIBadge />
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">{data.headline}</p>
          </div>
        </div>
        <span className="rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Cross-module signal
        </span>
      </header>

      <ul className="space-y-2">
        {data.items.map((i, idx) => {
          const mod = MODULES[i.target];
          const Icon = mod.icon;
          const tone = TONE[i.tone ?? "info"];
          return (
            <li key={idx} className={`flex items-start gap-3 rounded-lg border ${tone.border} ${tone.bg} p-3`}>
              <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${tone.dot}`} />
              <div className="min-w-0 flex-1">
                <p className="text-xs leading-relaxed text-foreground">{i.text}</p>
                <Link
                  to={mod.to}
                  className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                >
                  <Icon className="h-3 w-3" />
                  Open {mod.title}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// -------------------- Hospital Intelligence Feed --------------------
type FeedItem = {
  when: string;
  icon: LucideIcon;
  title: string;
  detail: string;
  tone: keyof typeof TONE;
  trend: "up" | "down" | "flat";
};

const FEED: FeedItem[] = [
  { when: "2 min ago",  icon: HeartPulse,   title: "ICU workload increasing",           detail: "Acuity index 4.6 · 3 new high-acuity admissions in last hour", tone: "danger",  trend: "up" },
  { when: "6 min ago",  icon: Waves,        title: "Emergency Department overcrowding", detail: "Waiting room at 118% · 4 patients boarding > 90 min",           tone: "danger",  trend: "up" },
  { when: "22 min ago", icon: ShieldCheck,  title: "Infection bundle compliance improving", detail: "SSI bundle +6% overnight — Surgical Ward leading",         tone: "success", trend: "up" },
  { when: "38 min ago", icon: FileText,     title: "Documentation quality decreasing",  detail: "Med-Surg completeness 88% · handoff gaps flagged in 12 charts",tone: "warning", trend: "down" },
  { when: "1 hr ago",   icon: GraduationCap,title: "Training completion overdue",       detail: "18 nurses past due on BLS refresher · 6 in Cardiac",           tone: "warning", trend: "flat" },
  { when: "2 hr ago",   icon: Award,        title: "Nurse appreciation increasing",     detail: "42 patient kudos this week (+35% vs last week)",                tone: "success", trend: "up" },
  { when: "3 hr ago",   icon: Users,        title: "Staffing stable in Medical Ward",   detail: "Ratio 1:5 · zero float requests · burnout index low",           tone: "info",    trend: "flat" },
];

function TrendIcon({ trend }: { trend: FeedItem["trend"] }) {
  if (trend === "up") return <ArrowUpRight className="h-3.5 w-3.5" />;
  if (trend === "down") return <ArrowDownRight className="h-3.5 w-3.5" />;
  return <span className="text-[10px]">•</span>;
}

export function HospitalIntelligenceFeed() {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Radio className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">AI Hospital Intelligence Feed</h3>
              <AIBadge />
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Live hospital-wide events synthesized across Workforce, Workflow, Documentation and Clinical Excellence
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-success">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" /> Live
        </span>
      </header>

      <ol className="relative space-y-2 border-l border-border/70 pl-4">
        {FEED.map((f, i) => {
          const tone = TONE[f.tone];
          const Icon = f.icon;
          return (
            <li key={i} className="relative">
              <span className={`absolute -left-[21px] top-3 flex h-3 w-3 items-center justify-center rounded-full ${tone.dot} ring-4 ring-background`} />
              <div className={`flex items-start gap-3 rounded-lg border ${tone.border} ${tone.bg} p-3`}>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-card ${tone.text}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-foreground">{f.title}</span>
                    <span className={`inline-flex items-center gap-0.5 rounded-full bg-card px-1.5 py-0.5 text-[10px] font-medium ${tone.text}`}>
                      <TrendIcon trend={f.trend} />
                    </span>
                    <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">{f.when}</span>
                  </div>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{f.detail}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

// -------------------- Enterprise Intelligence Map --------------------
const MAP_CHAIN: { key: ModuleKey | "executive"; title: string; icon: LucideIcon; sub: string; to?: string }[] = [
  { key: "workforce",     title: "Workforce Intelligence",     icon: Users,         sub: "Staffing · burnout · float pool",         to: "/workforce-intelligence" },
  { key: "workflow",      title: "Workflow Intelligence",      icon: Activity,      sub: "Handoffs · throughput · bottlenecks",     to: "/workflow-intelligence" },
  { key: "documentation", title: "Procedure Documentation",    icon: ClipboardList, sub: "Document once · use everywhere",          to: "/procedure-documentation" },
  { key: "excellence",    title: "Clinical Excellence",        icon: ShieldCheck,   sub: "Bundles · IPC · audits · EBP",            to: "/clinical-excellence" },
  { key: "executive",     title: "Executive Decision Support", icon: LineChart,     sub: "Unified operational intelligence" },
];

export function EnterpriseIntelligenceMap() {
  return (
    <section className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-card to-card p-5 shadow-sm">
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">Enterprise Intelligence Map</h3>
              <AIBadge />
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              NOSHealth is one connected AI ecosystem — every signal flows through the intelligence layer
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
        {MAP_CHAIN.map((n, i) => {
          const Icon = n.icon;
          const isExec = n.key === "executive";
          const inner = (
            <div className={`group flex h-full flex-col rounded-xl border p-4 transition ${
              isExec
                ? "border-primary/50 bg-primary/10"
                : "border-border bg-card hover:border-primary/40"
            }`}>
              <div className="mb-2 flex items-center gap-2">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${isExec ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Layer {i + 1}
                </span>
              </div>
              <div className="text-xs font-semibold text-foreground">{n.title}</div>
              <div className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{n.sub}</div>
              {n.to && (
                <div className="mt-3 inline-flex items-center gap-1 text-[10px] font-medium text-primary opacity-0 transition group-hover:opacity-100">
                  Open <ArrowRight className="h-3 w-3" />
                </div>
              )}
            </div>
          );
          return (
            <div key={n.key} className="relative">
              {n.to ? <Link to={n.to} className="block h-full">{inner}</Link> : inner}
              {i < MAP_CHAIN.length - 1 && (
                <div className="pointer-events-none absolute -bottom-2 left-1/2 z-10 -translate-x-1/2 text-primary/60 lg:-right-3 lg:bottom-1/2 lg:left-auto lg:translate-x-0 lg:translate-y-1/2">
                  <ArrowRight className="hidden h-4 w-4 lg:block" />
                  <div className="lg:hidden">↓</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5 text-success" /> Signals correlated today
          </div>
          <div className="mt-1 text-xl font-semibold text-foreground">1,284</div>
          <div className="text-[11px] text-muted-foreground">across 4 modules · 20 departments</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <AlertTriangle className="h-3.5 w-3.5 text-warning" /> Cross-module alerts
          </div>
          <div className="mt-1 text-xl font-semibold text-foreground">17</div>
          <div className="text-[11px] text-muted-foreground">6 high · 8 medium · 3 low</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <TrendingDown className="h-3.5 w-3.5 text-success" /> Decision latency
          </div>
          <div className="mt-1 text-xl font-semibold text-foreground">-42%</div>
          <div className="text-[11px] text-muted-foreground">vs siloed dashboards baseline</div>
        </div>
      </div>
    </section>
  );
}

// -------------------- Combined layer (feed + map) --------------------
export function AIIntelligenceLayer({ module }: { module: ModuleKey }) {
  return (
    <div className="space-y-5">
      <RelatedInsights module={module} />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <HospitalIntelligenceFeed />
        <EnterpriseIntelligenceMap />
      </div>
    </div>
  );
}
