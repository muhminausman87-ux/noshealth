import { useState } from "react";
import { Brain, BellRing, History, Check, X, Repeat, Clock3 } from "lucide-react";
import { AiPrototype } from "@/components/fromex/Bits";
import { Section } from "./Sections";
import {
  CHANNEL_LABEL,
  OVERRIDE_REASON_LABEL,
  type AIRecommendation,
  type DecisionKind,
  type EscalationEvent,
  type HumanDecision,
  type OutcomeRecord,
  type OverrideReason,
} from "@/lib/fromex-workforce";

const DECISIONS: { kind: DecisionKind; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { kind: "accepted", label: "Accept", icon: Check },
  { kind: "declined", label: "Decline", icon: X },
  { kind: "overridden", label: "Override", icon: Repeat },
  { kind: "deferred", label: "Defer", icon: Clock3 },
];

const DECISION_PAST: Record<DecisionKind, string> = {
  accepted: "Accepted",
  declined: "Declined",
  overridden: "Overridden",
  deferred: "Deferred",
};

/* ------------------------------------------------ 5. AI recommendations -- */

export function RecommendationSection({
  recommendations,
  decisions,
  onDecide,
  canDecide,
  decidedByRole,
}: {
  recommendations: AIRecommendation[];
  decisions: Record<string, HumanDecision>;
  onDecide: (d: HumanDecision) => void;
  canDecide: boolean;
  decidedByRole: string;
}) {
  return (
    <Section
      icon={Brain}
      title="AI workforce recommendation"
      subtitle="What happened, why, what is predicted, what can be considered, and who is responsible."
      ai
    >
      <div className="space-y-3">
        {recommendations.map((r) => (
          <RecommendationCard
            key={r.id}
            rec={r}
            decision={decisions[r.id]}
            onDecide={onDecide}
            canDecide={canDecide}
            decidedByRole={decidedByRole}
          />
        ))}
      </div>
      <p className="mt-3 text-[11px] italic text-muted-foreground">
        AI Prototype recommends — it does not decide or execute. Human decision remains final.
      </p>
    </Section>
  );
}

function RecommendationCard({
  rec,
  decision,
  onDecide,
  canDecide,
  decidedByRole,
}: {
  rec: AIRecommendation;
  decision?: HumanDecision;
  onDecide: (d: HumanDecision) => void;
  canDecide: boolean;
  decidedByRole: string;
}) {
  const [pending, setPending] = useState<DecisionKind | null>(null);
  const [reason, setReason] = useState<OverrideReason>("staffing_arranged");
  const [note, setNote] = useState("");

  const commit = (kind: DecisionKind) => {
    // TODO(persistence): write to an institution-scoped decision log table.
    onDecide({
      recommendationId: rec.id,
      decision: kind,
      decidedByRole,
      decidedAt: new Date().toISOString(),
      overrideReason: kind === "overridden" || kind === "declined" ? reason : undefined,
      note: note.trim() || undefined,
    });
    setPending(null);
    setNote("");
  };

  const tone = rec.severity === "urgent" ? "var(--color-destructive)" : "var(--color-warning)";

  return (
    <article className="rounded-xl border border-border bg-background p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
          style={{ background: `color-mix(in oklab, ${tone} 14%, transparent)`, color: tone }}
        >
          {rec.severity === "urgent" ? "Action recommended" : "Watch"}
        </span>
        <AiPrototype />
        <span className="ml-auto text-[11px] text-muted-foreground">Responsible: {rec.responsibleRole}</span>
      </div>

      <h3 className="mt-2 text-sm font-semibold text-foreground">{rec.whatHappened}</h3>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Why</div>
          <ul className="mt-1 space-y-1 text-xs text-foreground">
            {rec.why.map((w) => (
              <li key={w} className="flex gap-2">
                <span className="text-primary">·</span>
                {w}
              </li>
            ))}
          </ul>
          <div className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            What is predicted
          </div>
          <p className="mt-1 text-xs text-foreground">{rec.predicted}</p>
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            What can be considered
          </div>
          <ol className="mt-1 space-y-1 text-xs text-foreground">
            {rec.options.map((o, i) => (
              <li key={o} className="flex gap-2">
                <span className="text-primary">{i + 1}.</span>
                {o}
              </li>
            ))}
          </ol>
        </div>
      </div>

      {decision ? (
        <div className="mt-3 rounded-lg border border-border bg-muted/40 p-3 text-xs text-foreground">
          <span className="font-semibold">{DECISION_PAST[decision.decision]}</span> by {decision.decidedByRole} ·{" "}
          {new Date(decision.decidedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          {decision.overrideReason && <> · Reason: {OVERRIDE_REASON_LABEL[decision.overrideReason]}</>}
          {decision.note && <div className="mt-1 text-muted-foreground">“{decision.note}”</div>}
          <div className="mt-1 text-[10px] text-muted-foreground">
            Recorded for governance and institutional learning. Disagreeing with a recommendation carries no score or
            penalty.
          </div>
        </div>
      ) : canDecide ? (
        <div className="mt-3">
          <div className="flex flex-wrap gap-2">
            {DECISIONS.map((d) => (
              <button
                key={d.kind}
                type="button"
                onClick={() =>
                  d.kind === "accepted" || d.kind === "deferred" ? commit(d.kind) : setPending(d.kind)
                }
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
              >
                <d.icon className="h-3.5 w-3.5" aria-hidden="true" />
                {d.label}
              </button>
            ))}
          </div>

          {pending && (
            <div className="mt-3 rounded-lg border border-border bg-muted/40 p-3">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Reason
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as OverrideReason)}
                  className="mt-1 block w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs font-normal normal-case tracking-normal text-foreground"
                >
                  {(Object.keys(OVERRIDE_REASON_LABEL) as OverrideReason[]).map((k) => (
                    <option key={k} value={k}>
                      {OVERRIDE_REASON_LABEL[k]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="mt-2 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Note (optional)
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  className="mt-1 block w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs font-normal normal-case tracking-normal text-foreground"
                  placeholder="Context that the recommendation did not represent"
                />
              </label>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => commit(pending)}
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                >
                  Record {DECISION_PAST[pending].toLowerCase()}
                </button>
                <button
                  type="button"
                  onClick={() => setPending(null)}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="mt-3 text-[11px] text-muted-foreground">
          Decisions on this recommendation are held by {rec.responsibleRole}.
        </p>
      )}
    </article>
  );
}

/* ------------------------------------------------------------ escalation -- */

export function EscalationSection({
  escalations,
  acknowledged,
  onAcknowledge,
  canAcknowledge,
}: {
  escalations: EscalationEvent[];
  acknowledged: Record<string, string>;
  onAcknowledge: (id: string) => void;
  canAcknowledge: boolean;
}) {
  if (!escalations.length) return null;
  return (
    <Section
      icon={BellRing}
      title="Escalation"
      subtitle="Policy-driven. The chain, thresholds and channels below are institution configuration, not a universal hierarchy."
    >
      <div className="space-y-3">
        {escalations.map((e) => {
          const ack = acknowledged[e.id];
          return (
            <div key={e.id} className="rounded-xl border border-border bg-background p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{e.signal}</span>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                  style={{
                    background: ack
                      ? "color-mix(in oklab, var(--color-success) 14%, transparent)"
                      : "color-mix(in oklab, var(--color-destructive) 14%, transparent)",
                    color: ack ? "var(--color-success)" : "var(--color-destructive)",
                  }}
                >
                  {ack ? "Acknowledged" : "Awaiting acknowledgement"}
                </span>
                <span className="ml-auto text-[11px] text-muted-foreground">Policy {e.policyCode}</span>
              </div>

              <ol className="mt-3 space-y-1.5">
                {e.chain.map((s, i) => (
                  <li
                    key={s.role}
                    className={`flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 text-xs ${
                      i === e.currentStep && !ack
                        ? "border-primary/40 bg-primary/5 text-foreground"
                        : "border-border bg-muted/30 text-muted-foreground"
                    }`}
                  >
                    <span className="font-medium text-foreground">{s.role}</span>
                    <span>· {CHANNEL_LABEL[s.channel]}</span>
                    <span className="ml-auto">
                      {s.afterMinutes === 0 ? "immediate" : `after ${s.afterMinutes} min without acknowledgement`}
                    </span>
                  </li>
                ))}
              </ol>

              {ack ? (
                <p className="mt-3 text-[11px] text-muted-foreground">
                  Acknowledged at {new Date(ack).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.
                </p>
              ) : canAcknowledge ? (
                <button
                  type="button"
                  onClick={() => onAcknowledge(e.id)}
                  className="mt-3 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                >
                  Acknowledge
                </button>
              ) : (
                <p className="mt-3 text-[11px] text-muted-foreground">
                  Awaiting acknowledgement from {e.chain[e.currentStep]?.role ?? "the responsible leader"}.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </Section>
  );
}

/* ---------------------------------------------------------------- outcomes */

export function OutcomeSection({
  outcomes,
  liveDecisions,
  recommendations,
}: {
  outcomes: OutcomeRecord[];
  liveDecisions: HumanDecision[];
  recommendations: AIRecommendation[];
}) {
  return (
    <Section
      icon={History}
      title="Workforce outcomes & institutional learning"
      subtitle="Prediction → recommendation → human decision → actual outcome, retained inside the institution's data boundary."
      ai
    >
      <div className="space-y-2">
        {liveDecisions.map((d) => {
          const rec = recommendations.find((r) => r.id === d.recommendationId);
          return (
            <div key={d.recommendationId + d.decidedAt} className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-xs">
              <div className="font-medium text-foreground">{rec?.predicted ?? "Recommendation"}</div>
              <div className="mt-0.5 text-muted-foreground">
                {DECISION_PAST[d.decision]} by {d.decidedByRole}
                {d.overrideReason && ` · ${OVERRIDE_REASON_LABEL[d.overrideReason]}`} · outcome pending review
              </div>
            </div>
          );
        })}
        {outcomes.map((o) => (
          <div key={o.recommendationId} className="rounded-xl border border-border bg-background p-3 text-xs">
            <div className="grid gap-1 md:grid-cols-4">
              <div>
                <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">AI predicted</span>
                {o.predicted}
              </div>
              <div>
                <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">Recommendation</span>
                {o.recommendation}
              </div>
              <div>
                <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">Leader decision</span>
                {DECISION_PAST[o.decision]}
              </div>
              <div>
                <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">Actual outcome</span>
                {o.actualOutcome}
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[10px] text-muted-foreground">
        Learning records support institution-specific review only. No automatic production self-training, no
        cross-institution patient-data training.
      </p>
    </Section>
  );
}
