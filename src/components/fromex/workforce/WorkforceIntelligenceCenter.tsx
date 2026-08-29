import { useMemo, useState } from "react";
import { Users2 } from "lucide-react";
import { DEPARTMENTS, type Department } from "@/lib/departments";
import type { Session } from "@/lib/auth";
import {
  availableViews,
  demoSnapshot,
  WORKFORCE_VIEWS,
  type HumanDecision,
  type WorkforceView,
} from "@/lib/fromex-workforce";
import {
  CapacitySection,
  ForecastSection,
  GovernanceSection,
  ImbalanceSection,
  PatientDemandSection,
  TrendsSection,
  WorkloadSection,
} from "./Sections";
import { EscalationSection, OutcomeSection, RecommendationSection } from "./DecisionPanel";

/**
 * Nursing Workforce Intelligence command centre.
 * Role-aware presentation only — institution data isolation stays with RLS.
 */
export function WorkforceIntelligenceCenter({ session }: { session: Session }) {
  const views = useMemo(
    () => availableViews({ role: session.role, responsibilities: session.responsibilities ?? [] }),
    [session.role, session.responsibilities],
  );
  const [view, setView] = useState<WorkforceView>(views[0] ?? "manager");
  const [dept, setDept] = useState<Department>(session.assignedDept ?? "medical");
  const [decisions, setDecisions] = useState<Record<string, HumanDecision>>({});
  const [acknowledged, setAcknowledged] = useState<Record<string, string>>({});

  const cfg = WORKFORCE_VIEWS[view] ?? WORKFORCE_VIEWS.manager;
  const snap = useMemo(() => demoSnapshot(dept), [dept]);

  if (!views.length) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
        Nursing Workforce Intelligence is available to workforce and nursing leadership responsibilities configured by
        your institution.
      </div>
    );
  }

  const canDecide = view !== "hr" && view !== "governance";

  return (
    <div className="space-y-5">
      <header className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
          <Users2 className="h-3.5 w-3.5" aria-hidden="true" />
          Workforce Operations
        </div>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          Nursing Workforce Intelligence
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Patient demand → nursing capacity → operational action.
        </p>


        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Responsibility view
            <select
              value={view}
              onChange={(e) => setView(e.target.value as WorkforceView)}
              className="mt-1 block rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-normal normal-case tracking-normal text-foreground"
            >
              {views.map((v) => (
                <option key={v} value={v}>
                  {WORKFORCE_VIEWS[v].label}
                </option>
              ))}
            </select>
          </label>

          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Department
            <select
              value={dept}
              onChange={(e) => setDept(e.target.value as Department)}
              className="mt-1 block rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-normal normal-case tracking-normal text-foreground"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.short}
                </option>
              ))}
            </select>
          </label>

          <div className="text-[11px] text-muted-foreground">
            <div>{session.institutionName ?? "Institution"} · {snap.shift} shift</div>
            <div className="tabular-nums">
              {new Date(snap.generatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · scope:{" "}
              {cfg.scope.replace("_", " ")}
            </div>
          </div>
        </div>

        <p className="mt-3 text-[11px] text-muted-foreground">{cfg.focus}</p>
      </header>

      <ShiftOverview snap={snap} />

      {cfg.sections.recommendation && (
        <RecommendationSection
          recommendations={snap.recommendations}
          decisions={decisions}
          canDecide={canDecide}
          decidedByRole={cfg.label}
          onDecide={(d) => setDecisions((p) => ({ ...p, [d.recommendationId]: d }))}
        />
      )}
      {cfg.sections.escalation && (
        <EscalationSection
          escalations={snap.escalations}
          acknowledged={acknowledged}
          canAcknowledge={canDecide}
          onAcknowledge={(id) => setAcknowledged((p) => ({ ...p, [id]: new Date().toISOString() }))}
        />
      )}

      {cfg.sections.demand && (
        <Disclosure title="Why — patient demand detail" caption="Acuity, workload drivers and contributing patients">
          <PatientDemandSection demand={snap.demand} />
        </Disclosure>
      )}
      {cfg.sections.capacity && (
        <Disclosure title="Capacity detail" caption="Staffing mix, available hours and competency coverage">
          <CapacitySection capacity={snap.capacity} showCompetency={cfg.sections.competency} />
        </Disclosure>
      )}
      {cfg.sections.imbalance && (
        <Disclosure title="Risk by unit" caption="Where demand and capacity are diverging">
          <ImbalanceSection risks={snap.risks} />
        </Disclosure>
      )}
      {cfg.sections.forecast && (
        <Disclosure title="Forecast — next shifts" caption="AI Prototype projection of demand and cover">
          <ForecastSection forecast={snap.forecast} />
        </Disclosure>
      )}
      {cfg.sections.individualWorkload && (
        <Disclosure title="Individual nurse workload" caption="Per-nurse load and recovery signals">
          <WorkloadSection workloads={snap.workloads} />
        </Disclosure>
      )}
      {cfg.sections.workforceTrends && (
        <Disclosure title="Workforce trends" caption="Longer-term movement across the institution">
          <TrendsSection />
        </Disclosure>
      )}
      {cfg.sections.outcomes && (
        <Disclosure title="Outcomes of decisions taken" caption="What changed after action was recorded">
          <OutcomeSection
            outcomes={snap.outcomes}
            liveDecisions={Object.values(decisions)}
            recommendations={snap.recommendations}
          />
        </Disclosure>
      )}
      {cfg.sections.governance && (
        <Disclosure title="Governance & policy" caption="Institutional rules applied to these recommendations">
          <GovernanceSection
            policyCode={snap.policy.code}
            policyTitle={snap.policy.title}
            acknowledgementMinutes={snap.policy.acknowledgementMinutes}
            fatigueAffectsCapacity={snap.policy.fatigueAffectsCapacity}
          />
        </Disclosure>
      )}

      <footer className="pb-8 text-center text-[11px] text-muted-foreground">
        Demo configuration and seeded prototype data. NOS supports decision-making with explainable prototype
        intelligence — it does not replace clinical or operational judgement.
      </footer>
    </div>
  );
}
