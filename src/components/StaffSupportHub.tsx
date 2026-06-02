import { useMemo, useState } from "react";
import {
  Phone, Languages, ShieldAlert, HeartPulse, GraduationCap, Sparkles,
  LogOut, BookOpen, Award, Compass, Brain, AlertTriangle, ArrowRightLeft,
  CheckCircle2, ClipboardCheck, Users, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { DEPARTMENTS, getDept, type Department } from "@/lib/departments";
import type { Session } from "@/lib/auth";

// ---- Hospital hotlines (Cerner-style quick contacts) -----------------------
const HOTLINES = {
  incharge:   { label: "Shift in-charge",     number: "+918075918850", icon: ShieldAlert,  tone: "var(--color-tone-amber)" },
  translator: { label: "Translator desk",     number: "+911800123456", icon: Languages,    tone: "var(--color-tone-sky)" },
  wellness:   { label: "Wellness hotline",    number: "+911800111222", icon: HeartPulse,   tone: "var(--color-tone-mint)" },
  career:     { label: "Career guidance",     number: "+911800111333", icon: Compass,      tone: "var(--color-tone-violet)" },
  mental:     { label: "Mental health support", number: "+911800599599", icon: Brain,      tone: "var(--color-tone-teal)" },
};

// ---- Competency matrix per dept (which units a nurse is signed off for) ----
const COMPETENCY: Record<string, Department[]> = {
  achen:   ["ed", "medsurg"],
  spriya:  ["icu", "ed"],
  jthomas: ["medsurg", "medical", "surgical"],
  mfatima: ["maternity", "labour"],
  kraj:    ["cardiac", "icu"],
  lpaul:   ["labour", "maternity"],
  nsingh:  ["pediatric"],
  rjoseph: ["medical", "medsurg"],
  ddas:    ["surgical", "medsurg"],
  anair:   ["opd"],
  pgeorge: ["daycare", "opd"],
  tkurian: ["ot"],
};

const COURSES = [
  { dept: "icu" as Department,       title: "Ventilator basics & ABG",           hours: 6,  level: "Foundation" },
  { dept: "ed" as Department,        title: "Triage & ACLS refresher",           hours: 8,  level: "Core" },
  { dept: "cardiac" as Department,   title: "12-lead ECG interpretation",        hours: 4,  level: "Core" },
  { dept: "pediatric" as Department, title: "PEWS & pediatric dosing",           hours: 5,  level: "Foundation" },
  { dept: "maternity" as Department, title: "CTG interpretation",                hours: 4,  level: "Core" },
  { dept: "ot" as Department,        title: "Aseptic scrub & instrument count",  hours: 6,  level: "Foundation" },
];

// ---- Mandatory audit/training items (always-on compliance) -----------------
const AUDIT_ITEMS = [
  { id: "bls",     title: "BLS / CPR recertification",       due: "in 24 days", status: "ok" as const },
  { id: "hand",    title: "Hand hygiene audit",              due: "weekly",     status: "ok" as const },
  { id: "fire",    title: "Fire & evacuation drill",         due: "in 9 days",  status: "warn" as const },
  { id: "ipc",     title: "Infection prevention module",     due: "overdue 3d", status: "fail" as const },
  { id: "consent", title: "Informed consent documentation",  due: "monthly",    status: "ok" as const },
];

const QUIT_REASONS = [
  "Physically exhausted",
  "Feeling unwell / sick",
  "Family emergency",
  "Mental fatigue / overwhelmed",
  "Workplace conflict",
  "Other (specify)",
];

interface Props { session: Session }

export function StaffSupportHub({ session }: Props) {
  const competencies = COMPETENCY[session.username] ?? [session.assignedDept!];
  const eligibleCourses = useMemo(
    () => COURSES.filter((c) => !competencies.includes(c.dept)),
    [competencies],
  );

  return (
    <section className="mt-8 space-y-5">
      <header className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Support, wellness & growth
        </h2>
      </header>

      {/* Quick-call strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {(Object.entries(HOTLINES) as [keyof typeof HOTLINES, typeof HOTLINES[keyof typeof HOTLINES]][]).map(([k, h]) => (
          <a
            key={k}
            href={`tel:${h.number}`}
            className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            style={{ borderLeft: `4px solid ${h.tone}` }}
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ background: `color-mix(in oklab, ${h.tone} 18%, transparent)`, color: h.tone }}
            >
              <h.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {h.label}
              </div>
              <div className="flex items-center gap-1 text-sm font-semibold text-foreground">
                <Phone className="h-3 w-3 text-primary" /> Call
              </div>
            </div>
          </a>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <PullOutCard session={session} competencies={competencies} />
        <CompetencyCard competencies={competencies} courses={eligibleCourses} />
        <AuditCard />
        <EndShiftCard session={session} />
      </div>
    </section>
  );
}

// ---------- Pull-out / cross-cover request --------------------------------
function PullOutCard({ session, competencies }: { session: Session; competencies: Department[] }) {
  const [target, setTarget] = useState<Department>("icu");
  const [open, setOpen] = useState(false);
  const inCompetency = competencies.includes(target);

  return (
    <Card icon={ArrowRightLeft} accent="var(--color-tone-amber)" title="Cross-department cover">
      <p className="text-xs text-muted-foreground">
        Request to be pulled to another unit for this shift. Requests outside your competency
        require <strong>special permission</strong> from the nursing supervisor.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <select
          value={target}
          onChange={(e) => setTarget(e.target.value as Department)}
          className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
        >
          {DEPARTMENTS.filter((d) => d.id !== session.assignedDept).map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
        <span
          className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
          style={{
            background: inCompetency ? "color-mix(in oklab, var(--color-tone-mint) 18%, transparent)"
                                     : "color-mix(in oklab, var(--color-destructive) 18%, transparent)",
            color: inCompetency ? "var(--color-tone-mint)" : "var(--color-destructive)",
          }}
        >
          {inCompetency ? "Within competency" : "Outside competency"}
        </span>
      </div>
      <div className="mt-3 flex gap-2">
        <Button size="sm" onClick={() => setOpen(true)}>
          {inCompetency ? "Submit pull request" : "Request supervisor approval"}
        </Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {inCompetency ? "Pull request submitted" : "Approval required"}
            </DialogTitle>
            <DialogDescription>
              You are requesting to cover <strong>{getDept(target).name}</strong>.
              {inCompetency
                ? " You are signed-off for this unit. Charge nurse has been notified."
                : " This unit is outside your competency. The request has been routed to the nursing supervisor's portal — you cannot start the shift until approved."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            {!inCompetency && (
              <a
                href={`tel:${HOTLINES.incharge.number}`}
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm hover:bg-secondary"
              >
                <Phone className="h-3.5 w-3.5" /> Call supervisor
              </a>
            )}
            <Button onClick={() => setOpen(false)}>OK</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ---------- Competency / learning pathway ---------------------------------
function CompetencyCard({ competencies, courses }: { competencies: Department[]; courses: typeof COURSES }) {
  return (
    <Card icon={GraduationCap} accent="var(--color-tone-violet)" title="Competency builder">
      <p className="text-xs text-muted-foreground">
        Sign-off units &amp; recommended micro-courses you can complete during free time
        to expand where you can safely cover.
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {competencies.map((c) => {
          const m = getDept(c);
          return (
            <span key={c} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]"
                  style={{ background: `color-mix(in oklab, ${m.color} 18%, transparent)`, color: m.color }}>
              <Award className="h-3 w-3" /> {m.short}
            </span>
          );
        })}
      </div>
      <div className="mt-3 space-y-1.5">
        {courses.slice(0, 4).map((c, i) => {
          const m = getDept(c.dept);
          return (
            <div key={i} className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-background/40 p-2.5">
              <div className="min-w-0">
                <div className="text-sm font-medium text-foreground">{c.title}</div>
                <div className="text-[11px] text-muted-foreground">
                  {m.short} · {c.level} · {c.hours}h
                </div>
              </div>
              <Button size="sm" variant="outline" className="gap-1">
                <BookOpen className="h-3.5 w-3.5" /> Start
              </Button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ---------- Audit / mandatory training ------------------------------------
function AuditCard() {
  return (
    <Card icon={ClipboardCheck} accent="var(--color-tone-sky)" title="Audit & mandatory training">
      <p className="text-xs text-muted-foreground">
        Protected learning time. All staff are equally trained &amp; informed before any
        department audit visits.
      </p>
      <ul className="mt-3 space-y-1.5">
        {AUDIT_ITEMS.map((a) => {
          const tone =
            a.status === "fail" ? "var(--color-destructive)"
            : a.status === "warn" ? "var(--color-tone-amber)"
            : "var(--color-tone-mint)";
          const Icon = a.status === "fail" ? AlertTriangle : a.status === "warn" ? AlertTriangle : CheckCircle2;
          return (
            <li key={a.id} className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-background/40 p-2.5">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" style={{ color: tone }} />
                <div>
                  <div className="text-sm font-medium text-foreground">{a.title}</div>
                  <div className="text-[11px]" style={{ color: tone }}>{a.due}</div>
                </div>
              </div>
              <Button size="sm" variant="outline">Open module</Button>
            </li>
          );
        })}
      </ul>
      <div className="mt-3 flex items-center gap-2 rounded-lg border border-dashed border-border bg-background/40 p-2.5 text-[11px] text-muted-foreground">
        <Users className="h-3.5 w-3.5 text-primary" />
        Charge nurse is notified to free your desk for the next mandatory session.
      </div>
    </Card>
  );
}

// ---------- End-shift / quit with reason ----------------------------------
function EndShiftCard({ session }: { session: Session }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"reason" | "solutions" | "confirm">("reason");
  const [reason, setReason] = useState<string>("");
  const [notes, setNotes] = useState("");

  const reset = () => { setStep("reason"); setReason(""); setNotes(""); };

  return (
    <Card icon={LogOut} accent="var(--color-destructive)" title="End shift early / step away">
      <p className="text-xs text-muted-foreground">
        Too exhausted or unwell? You can leave after informing your in-charge.
        Documenting the exact reason helps you return with a clear mind &amp; body.
      </p>
      <div className="mt-3">
        <Button variant="destructive" onClick={() => { reset(); setOpen(true); }}>
          Request to end my shift
        </Button>
      </div>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
        <DialogContent className="max-w-lg">
          {step === "reason" && (
            <>
              <DialogHeader>
                <DialogTitle>What's the reason, {session.name.replace(/^RN\s+/, "")}?</DialogTitle>
                <DialogDescription>
                  Honest answer stays confidential — only your in-charge sees it.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-1.5">
                {QUIT_REASONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setReason(r)}
                    className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                      reason === r ? "border-primary bg-primary/10 text-foreground" : "border-border bg-background/40 hover:bg-secondary"
                    }`}
                  >
                    <span>{r}</span>
                    {reason === r && <CheckCircle2 className="h-4 w-4 text-primary" />}
                  </button>
                ))}
                {reason === "Other (specify)" && (
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Describe briefly…"
                    className="mt-2"
                  />
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button disabled={!reason} onClick={() => setStep("solutions")}>Continue</Button>
              </div>
            </>
          )}

          {step === "solutions" && (
            <>
              <DialogHeader>
                <DialogTitle>Before you go — explore your benefits</DialogTitle>
                <DialogDescription>
                  You've reached the maximum support entitlement. Try one of these first:
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Solution icon={HeartPulse} title="Use scheduled leave" sub="2 days available" tone="var(--color-tone-mint)" />
                <Solution icon={Brain}      title="Mental health support" sub="24/7 confidential line" tone="var(--color-tone-teal)" phone={HOTLINES.mental.number} />
                <Solution icon={Compass}    title="Career guidance"   sub="Book a 30-min session" tone="var(--color-tone-violet)" phone={HOTLINES.career.number} />
                <Solution icon={Sparkles}   title="Wellness pathway"  sub="Yoga, nutrition, sleep" tone="var(--color-tone-sky)" phone={HOTLINES.wellness.number} />
              </div>
              <p className="text-[11px] text-muted-foreground">
                These open a separate Wellness portal &amp; never block you from leaving.
              </p>
              <div className="flex justify-between gap-2">
                <Button variant="outline" onClick={() => setStep("reason")}>Back</Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    I'll stay & try one
                  </Button>
                  <Button variant="destructive" onClick={() => setStep("confirm")}>
                    Still need to leave
                  </Button>
                </div>
              </div>
            </>
          )}

          {step === "confirm" && (
            <>
              <DialogHeader>
                <DialogTitle>Notify in-charge</DialogTitle>
                <DialogDescription>
                  Reason: <strong>{reason}</strong>
                  {notes && <> — {notes}</>}<br />
                  Your handover will be auto-routed to the on-shift charge nurse.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <a
                  href={`tel:${HOTLINES.incharge.number}`}
                  className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-secondary"
                >
                  <Phone className="h-4 w-4" /> Call in-charge
                </a>
                <Button onClick={() => setOpen(false)} className="gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Logged &amp; signed out
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function Solution({
  icon: Icon, title, sub, tone, phone,
}: { icon: React.ComponentType<{ className?: string }>; title: string; sub: string; tone: string; phone?: string }) {
  const content = (
    <div className="flex h-full items-start gap-2.5 rounded-xl border border-border bg-background/40 p-3 transition hover:-translate-y-0.5 hover:shadow-sm"
         style={{ borderLeft: `3px solid ${tone}` }}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg"
           style={{ background: `color-mix(in oklab, ${tone} 18%, transparent)`, color: tone }}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="text-sm font-medium text-foreground">{title}</div>
        <div className="text-[11px] text-muted-foreground">{sub}</div>
      </div>
    </div>
  );
  return phone ? <a href={`tel:${phone}`}>{content}</a> : <button className="text-left">{content}</button>;
}

// ---------- Generic card --------------------------------------------------
function Card({
  icon: Icon, title, accent, children,
}: { icon: React.ComponentType<{ className?: string }>; title: string; accent: string; children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm"
         style={{ borderTop: `3px solid ${accent}` }}>
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl"
             style={{ background: `color-mix(in oklab, ${accent} 18%, transparent)`, color: accent }}>
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
}
