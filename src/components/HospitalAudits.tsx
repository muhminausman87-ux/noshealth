import { useState } from "react";
import {
  Microscope, ShieldCheck, Fish, Heart, GraduationCap,
  AlertOctagon, FileText, Download, ChevronRight, Users2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type AuditKind = "ebp" | "ipc" | "quality" | "wellbeing" | "training" | "rca";

const AUDIT_DEFS: { kind: AuditKind; title: string; icon: any; tone: string; blurb: string; method: string; reports: { month: string; score: number }[] }[] = [
  {
    kind: "ebp", title: "Evidence-Based Practice", icon: Microscope, tone: "var(--color-tone-sky)",
    blurb: "Open to every staff member. Study → Implement → Audit → Practice cycle.",
    method: "PICO question → literature review → bedside protocol → 3-month audit → revise.",
    reports: [{ month: "May", score: 88 }, { month: "Apr", score: 82 }, { month: "Mar", score: 79 }],
  },
  {
    kind: "ipc", title: "Infection Prevention & Control", icon: ShieldCheck, tone: "var(--color-tone-mint)",
    blurb: "Assess precautions → implement bundles → evaluate compliance → audit monthly.",
    method: "Hand-hygiene WHO 5-moments, CLABSI/CAUTI/VAP bundles, isolation audit.",
    reports: [{ month: "May", score: 94 }, { month: "Apr", score: 90 }, { month: "Mar", score: 87 }],
  },
  {
    kind: "quality", title: "Quality & Patient Safety", icon: Fish, tone: "var(--color-tone-violet)",
    blurb: "Fishbone (Ishikawa) cause-mapping. Open access for the quality team to audit.",
    method: "People · Process · Equipment · Environment · Policy · Patient factors.",
    reports: [{ month: "May", score: 86 }, { month: "Apr", score: 84 }, { month: "Mar", score: 80 }],
  },
  {
    kind: "wellbeing", title: "Staff Wellbeing", icon: Heart, tone: "var(--color-tone-rose)",
    blurb: "Burnout, breaks, sleep, peer-support — auditable, anonymised dashboard.",
    method: "Maslach Burnout Inventory · break-compliance · sick-leave trend.",
    reports: [{ month: "May", score: 72 }, { month: "Apr", score: 68 }, { month: "Mar", score: 65 }],
  },
  {
    kind: "training", title: "Training & Development", icon: GraduationCap, tone: "var(--color-tone-amber)",
    blurb: "Competency, mandatory modules, CME hours — hospital-wide view.",
    method: "BLS · ACLS · IPC · Fire · Patient-handling · specialty competencies.",
    reports: [{ month: "May", score: 91 }, { month: "Apr", score: 88 }, { month: "Mar", score: 85 }],
  },
  {
    kind: "rca", title: "Incident RCA (System-first)", icon: AlertOctagon, tone: "var(--color-destructive)",
    blurb: "Root-cause looks at the SYSTEM first, then process — never blames the nurse.",
    method: "5-Whys + Human-Factors framework. Just-culture review board.",
    reports: [{ month: "May", score: 0 }, { month: "Apr", score: 1 }, { month: "Mar", score: 2 }],
  },
];

export function HospitalAudits() {
  const [open, setOpen] = useState<AuditKind | null>("ebp");
  const active = AUDIT_DEFS.find((a) => a.kind === open);

  const download = (title: string) =>
    toast.success(`${title} monthly report queued — sent to your inbox.`);

  return (
    <section className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users2 className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Hospital-wide audit & EBP teams
          </h3>
        </div>
        <span className="text-[11px] text-muted-foreground">
          Open to all staff · no single nurse owns these
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr]">
        <div className="space-y-1.5">
          {AUDIT_DEFS.map((a) => {
            const Icon = a.icon;
            const isOpen = open === a.kind;
            return (
              <button
                key={a.kind}
                onClick={() => setOpen(a.kind)}
                className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition-all ${
                  isOpen ? "border-primary/40 bg-primary/5" : "border-border bg-background/40 hover:border-primary/30"
                }`}
                style={isOpen ? { borderLeft: `4px solid ${a.tone}` } : undefined}
              >
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-md"
                  style={{ background: `color-mix(in oklab, ${a.tone} 18%, transparent)`, color: a.tone }}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="flex-1 font-medium text-foreground">{a.title}</span>
                <ChevronRight className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`} />
              </button>
            );
          })}
        </div>

        {active && (
          <div className="rounded-xl border border-border bg-background/40 p-4" style={{ borderLeft: `4px solid ${active.tone}` }}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-base font-semibold text-foreground">{active.title}</div>
                <p className="mt-1 text-sm text-muted-foreground">{active.blurb}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => download(active.title)}>
                <Download className="mr-1 h-3.5 w-3.5" /> Report
              </Button>
            </div>

            <div className="mt-3 rounded-lg bg-card p-3">
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Scientific method
              </div>
              <div className="mt-1 text-sm text-foreground">{active.method}</div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              {active.reports.map((r) => (
                <div key={r.month} className="rounded-lg border border-border bg-card p-3">
                  <div className="text-[11px] text-muted-foreground">{r.month}</div>
                  <div className="text-xl font-semibold text-foreground">
                    {active.kind === "rca" ? r.score : `${r.score}%`}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {active.kind === "rca" ? "incidents" : "compliance"}
                  </div>
                </div>
              ))}
            </div>

            {active.kind === "rca" && (
              <div className="mt-3 rounded-lg border border-warning/30 bg-warning/5 p-3 text-xs text-foreground">
                <strong>Just-culture rule:</strong> RCA questions the system, workflow and design first.
                The nurse is interviewed as a witness, never a defendant.
              </div>
            )}

            {active.kind === "ebp" && (
              <div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-foreground">
                <FileText className="mr-1 inline h-3.5 w-3.5" />
                Every implemented EBP change attaches a study card to the patient file for traceable audit.
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
