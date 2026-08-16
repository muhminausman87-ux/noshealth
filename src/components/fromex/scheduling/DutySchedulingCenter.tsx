import { useMemo, useState } from "react";
import { CalendarClock } from "lucide-react";
import { DEPARTMENTS, type Department } from "@/lib/departments";
import type { Session } from "@/lib/auth";
import {
  DEMO_SCHEDULING_POLICY,
  SCHEDULING_VIEWS,
  analyseConflicts,
  analyseCoverage,
  analyseFairness,
  analyseLeaveImpact,
  availableSchedulingViews,
  demoChangeHistory,
  demoLeave,
  demoNurses,
  demoRequests,
  demoRequirements,
  demoRoster,
  isoDay,
  recoverySignals,
  schedulingRecommendations,
  type ChangeEntry,
  type DutyRequest,
  type ScheduleStage,
  type SchedulingDecision,
  type SchedulingSection,
  type SchedulingView,
} from "@/lib/fromex-scheduling";
import {
  ApprovalPanel,
  AvailabilityPanel,
  BreakPanel,
  ConflictsPanel,
  CoveragePanel,
  FairnessPanel,
  GeneratePanel,
  HistoryPanel,
  LeaveImpactPanel,
  MyDutyPanel,
  PolicyPanel,
  RecommendationsPanel,
  RecoveryPanel,
  RequestsPanel,
  RosterPanel,
  SkillMixPanel,
} from "./Panels";

/**
 * Intelligent Duty Scheduling — human-centered rostering inside Workforce Operations.
 * Role-aware presentation only; institution isolation remains with RLS.
 */
export function DutySchedulingCenter({ session }: { session: Session }) {
  const views = useMemo(
    () => availableSchedulingViews({ role: session.role, responsibilities: session.responsibilities ?? [] }),
    [session.role, session.responsibilities],
  );
  const [view, setView] = useState<SchedulingView>(views.find((v) => v !== "nurse") ?? "nurse");
  const [dept, setDept] = useState<Department>(session.assignedDept ?? "medical");
  const [stage, setStage] = useState<ScheduleStage>("analysed");
  const [decisions, setDecisions] = useState<Record<string, SchedulingDecision>>({});
  const [history, setHistory] = useState<ChangeEntry[]>(() => demoChangeHistory());

  const policy = DEMO_SCHEDULING_POLICY;
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => isoDay(i)), []);
  const nurses = useMemo(() => demoNurses(dept), [dept]);
  const leave = useMemo(() => demoLeave(nurses), [nurses]);
  const [requests, setRequests] = useState<DutyRequest[]>(() => demoRequests(demoNurses(dept)));
  const roster = useMemo(() => demoRoster(dept, nurses, days), [dept, nurses, days]);
  const requirements = useMemo(() => demoRequirements(dept, days), [dept, days]);

  const coverage = useMemo(
    () => analyseCoverage(requirements, roster, nurses, leave, days),
    [requirements, roster, nurses, leave, days],
  );
  const conflicts = useMemo(
    () => analyseConflicts(coverage, roster, nurses, leave, policy, days),
    [coverage, roster, nurses, leave, policy, days],
  );
  const fairness = useMemo(() => analyseFairness(roster, nurses, policy), [roster, nurses, policy]);
  const recovery = useMemo(() => recoverySignals(conflicts, nurses), [conflicts, nurses]);
  const leaveImpact = useMemo(() => analyseLeaveImpact(leave, nurses, dept), [leave, nurses, dept]);
  const recommendations = useMemo(
    () => schedulingRecommendations({ coverage, conflicts, fairness, leaveImpact, nurses }),
    [coverage, conflicts, fairness, leaveImpact, nurses],
  );

  const cfg = SCHEDULING_VIEWS[view];
  const has = (s: SchedulingSection) => cfg.sections.includes(s);
  const me = nurses[1]!;

  const log = (action: string, detail: string) =>
    setHistory((p) => [
      { id: `h${p.length + 1}-${Date.now()}`, at: new Date().toISOString().slice(0, 10), actor: cfg.label, action, detail },
      ...p,
    ]);

  if (!views.length) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
        Duty scheduling is available to the responsibilities configured by your institution.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
          <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
          FROMEX Workforce Operations
        </div>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          Intelligent Duty Scheduling
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A safe, patient-responsive and human-centered nursing schedule — balancing patient demand, institutional
          requirements, nurse capability, availability, recovery and wellbeing.
        </p>

        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Responsibility view
            <select
              value={view}
              onChange={(e) => setView(e.target.value as SchedulingView)}
              className="mt-1 block rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-normal normal-case tracking-normal text-foreground"
            >
              {views.map((v) => (
                <option key={v} value={v}>
                  {SCHEDULING_VIEWS[v].label}
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
            <div>{session.institutionName ?? "Institution"} · 7-day roster period</div>
            <div className="tabular-nums">{days[0]} → {days[days.length - 1]}</div>
          </div>
        </div>

        <p className="mt-3 text-[11px] text-muted-foreground">{cfg.focus}</p>
      </header>

      {has("myRequests") && (
        <MyDutyPanel
          nurse={me}
          roster={roster}
          requests={requests.filter((r) => r.nurseId === me.id)}
          onSubmit={(kind) =>
            setRequests((p) => [
              {
                id: `r${p.length + 1}-${Date.now()}`,
                nurseId: me.id,
                kind,
                detail: "Submitted from My Duty Requests",
                date: isoDay(7),
                status: "submitted",
                submittedAt: isoDay(0),
                policyNote: "Reviewed against institution duty-request rules",
              },
              ...p,
            ])
          }
        />
      )}

      {has("overview") && <OverviewBlock />}

      {has("generate") && (
        <GeneratePanel
          stage={stage}
          policy={policy}
          conflicts={conflicts}
          onGenerate={() => {
            setStage("analysed");
            log("Schedule generated", "Draft roster regenerated from demand, availability, leave and policy inputs.");
          }}
        />
      )}
      {has("coverage") && <CoveragePanel coverage={coverage} days={days} />}
      {has("roster") && (
        <RosterPanel roster={roster} nurses={nurses} days={days} leave={leave} conflicts={conflicts} dept={dept} />
      )}
      {has("skillMix") && <SkillMixPanel coverage={coverage} />}
      {has("conflicts") && <ConflictsPanel conflicts={conflicts} nurses={nurses} />}
      {has("recovery") && (
        <>
          <RecoveryPanel signals={recovery} nurses={nurses} />
          <BreakPanel roster={roster} policy={policy} />
        </>
      )}
      {has("patterns") && <FairnessPanel rows={fairness} nurses={nurses} />}
      {has("availability") && <AvailabilityPanel nurses={nurses} leave={leave} />}
      {has("leaveImpact") && <LeaveImpactPanel impact={leaveImpact} />}
      {has("requests") && (
        <RequestsPanel
          requests={requests}
          nurses={nurses}
          canDecide={cfg.canApprove}
          onSetStatus={(id, status) => {
            setRequests((p) => p.map((r) => (r.id === id ? { ...r, status } : r)));
            log("Duty request updated", `Request ${id} set to ${status}.`);
          }}
        />
      )}
      {has("aiRecommendations") && (
        <RecommendationsPanel
          recommendations={recommendations}
          decisions={decisions}
          canDecide={cfg.canApprove}
          decidedByRole={cfg.label}
          onDecide={(d) => {
            setDecisions((p) => ({ ...p, [d.recommendationId]: d }));
            log("AI recommendation decision", `${d.kind} — ${d.reason || "no reason recorded"}`);
          }}
        />
      )}
      {has("approval") && (
        <ApprovalPanel
          stage={stage}
          canApprove={cfg.canApprove}
          onAdvance={(s) => {
            setStage(s);
            log("Approval workflow", `Schedule moved to ${s}.`);
          }}
        />
      )}
      {(has("overview") || has("history")) && <PolicyPanel policy={policy} />}
      {has("history") && <HistoryPanel entries={history} />}

      <footer className="pb-8 text-center text-[11px] text-muted-foreground">
        Demo configuration and seeded prototype data. AI recommends, authorised humans decide, institutional policy
        governs. NOS supports decision-making — it does not replace clinical or operational judgement.
      </footer>
    </div>
  );

  function OverviewBlock() {
    const { OverviewPanel } = require("./Panels") as typeof import("./Panels");
    return <OverviewPanel dept={dept} coverage={coverage} conflicts={conflicts} stage={stage} policy={policy} />;
  }
}
