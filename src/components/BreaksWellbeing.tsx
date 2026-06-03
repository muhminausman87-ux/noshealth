import { useEffect, useMemo, useState } from "react";
import { Coffee, Droplets, Toilet, Clock, Award, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type BreakKind = "water" | "toilet" | "meal";
interface BreakLog {
  kind: BreakKind;
  at: string;
  skipped?: boolean;
  reason?: string;
  patientCare?: boolean;
}

const BREAK_DEFS: { kind: BreakKind; label: string; icon: any; everyMin: number; tone: string }[] = [
  { kind: "water",  label: "Hydration",   icon: Droplets, everyMin: 60,  tone: "var(--color-tone-sky)" },
  { kind: "toilet", label: "Restroom",    icon: Toilet,   everyMin: 180, tone: "var(--color-tone-mint)" },
  { kind: "meal",   label: "Meal / tea",  icon: Coffee,   everyMin: 240, tone: "var(--color-tone-amber)" },
];

export function BreaksWellbeing() {
  const [logs, setLogs] = useState<BreakLog[]>([]);
  const [skipFor, setSkipFor] = useState<BreakKind | null>(null);
  const [reason, setReason] = useState("");
  const [patientCare, setPatientCare] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const lastByKind = useMemo(() => {
    const m: Record<string, BreakLog | undefined> = {};
    for (const l of logs) if (!l.skipped) m[l.kind] = l;
    return m;
  }, [logs]);

  const rewards = useMemo(
    () => logs.filter((l) => l.skipped && l.patientCare).length * 10,
    [logs],
  );

  const takeBreak = (kind: BreakKind) => {
    setLogs((p) => [{ kind, at: new Date().toISOString() }, ...p]);
    toast.success("Break logged — well done taking care of yourself.");
  };

  const submitSkip = () => {
    if (!skipFor || !reason.trim()) return;
    setLogs((p) => [
      { kind: skipFor, at: new Date().toISOString(), skipped: true, reason: reason.trim(), patientCare },
      ...p,
    ]);
    if (patientCare) toast.success("Logged — +10 care-points for prioritising patient care.");
    else toast.message("Skip logged — please take your next break.");
    setSkipFor(null);
    setReason("");
    setPatientCare(false);
  };

  return (
    <section className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Biological break reminders
          </h3>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Award className="h-3.5 w-3.5" /> {rewards} care-points
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {BREAK_DEFS.map((b) => {
          const last = lastByKind[b.kind];
          const sinceMin = last ? Math.floor((now - new Date(last.at).getTime()) / 60000) : null;
          const overdue = sinceMin === null || sinceMin >= b.everyMin;
          const Icon = b.icon;
          return (
            <div
              key={b.kind}
              className="rounded-xl border border-border bg-background/40 p-3"
              style={{ borderLeft: `4px solid ${b.tone}` }}
            >
              <div className="flex items-start gap-2">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ background: `color-mix(in oklab, ${b.tone} 18%, transparent)`, color: b.tone }}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-foreground">{b.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {sinceMin === null
                      ? "Not taken yet this shift"
                      : `${sinceMin} min ago · every ${b.everyMin} min`}
                  </div>
                </div>
                {overdue && (
                  <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-warning">
                    Due
                  </span>
                )}
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" className="flex-1" onClick={() => takeBreak(b.kind)}>
                  <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Taken
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSkipFor(b.kind)}>
                  Skip
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {skipFor && (
        <div className="mt-4 rounded-xl border border-warning/40 bg-warning/5 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-warning">
            <AlertCircle className="h-4 w-4" /> Why was {BREAK_DEFS.find((b) => b.kind === skipFor)?.label} skipped?
          </div>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Code blue in Bay 3, transfusing patient, family counselling…"
            rows={2}
          />
          <label className="mt-2 flex items-center gap-2 text-xs text-foreground">
            <input
              type="checkbox"
              checked={patientCare}
              onChange={(e) => setPatientCare(e.target.checked)}
            />
            Skipped due to direct patient-care priority (+10 care-points)
          </label>
          <div className="mt-3 flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => setSkipFor(null)}>
              Cancel
            </Button>
            <Button size="sm" onClick={submitSkip} disabled={!reason.trim()}>
              Log reason
            </Button>
          </div>
        </div>
      )}

      {logs.length > 0 && (
        <div className="mt-4 max-h-44 overflow-auto rounded-xl border border-border bg-background/30 p-3 text-xs">
          {logs.slice(0, 8).map((l, i) => (
            <div key={i} className="flex items-center justify-between gap-2 border-b border-border/40 py-1 last:border-0">
              <span className="font-medium text-foreground capitalize">{l.kind}</span>
              <span className="text-muted-foreground">{new Date(l.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              <span className={l.skipped ? "text-warning" : "text-success"}>
                {l.skipped ? `Skipped — ${l.reason}` : "Taken"}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
