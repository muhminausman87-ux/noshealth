import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  CalendarClock,
  ClipboardList,
  Download,
  FileSpreadsheet,
  Gauge,
  HeartPulse,
  History,
  LayoutDashboard,
  ListChecks,
  Scale,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  Siren,
  Sparkles,
  Upload,
  UserRound,
  Users,
} from "lucide-react";
import { DEPARTMENTS, getDept, type Department } from "@/lib/departments";
import type { Session } from "@/lib/auth";
import type {
  AuditEntry,
  DutyRequest,
  NurseProfile,
  Roster,
  ScheduleException,
  SchedulingPolicy,
} from "@/lib/scheduling/types";
import { COMPETENCY_LABEL, REQUEST_KIND_LABEL } from "@/lib/scheduling/types";
import { defaultPolicy } from "@/lib/scheduling/policy";
import { currentMonth, demoNurses, demoRequests } from "@/lib/scheduling/demo";
import { emergencyOptions, generateSchedule, recompute, validateChange } from "@/lib/scheduling/engine";
import { exportRosterWorkbook, parseRosterWorkbook, type ImportDiff } from "@/lib/scheduling/excel";
import { RosterGrid, CodeChip } from "./RosterGrid";
import { defaultRegulatoryBaseline, type RegulatoryBaseline } from "@/lib/scheduling/regulatory";
import { DEFAULT_STAFFING_STANDARDS, DEFAULT_WORKLOAD, type StaffingStandard, type WorkloadInputs } from "@/lib/scheduling/staffing-standards";
import { validateCompliance } from "@/lib/scheduling/compliance";
import { experienceScores, fairness, fatigueRisk, scheduleStability } from "@/lib/scheduling/wellbeing";
import {
  CompliancePanel,
  Disclaimer,
  FairnessPanel,
  MySchedulePanel,
  RegulatoryBaselinePanel,
  StaffingStandardsPanel,
  VersionRecord,
  WellbeingPanel,
} from "./CompliancePanels";

export const ENGINE_VERSION = "NOS Scheduling Engine v2.0 (India compliance + employee experience)";
export const STANDARDS_VERSION = "NOS Nursing Staffing Standards Library v1.0";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "staff", label: "Staff", icon: Users },
  { id: "requests", label: "Requests", icon: ClipboardList },
  { id: "policies", label: "Policies", icon: Settings2 },
  { id: "regulatory", label: "India Regulatory Baseline", icon: Scale },
  { id: "standards", label: "Staffing Standards & Workload", icon: Stethoscope },
  { id: "generate", label: "Generate Schedule", icon: Sparkles },
  { id: "roster", label: "Monthly Roster", icon: CalendarClock },
  { id: "coverage", label: "Coverage", icon: ListChecks },
  { id: "compliance", label: "India Labour Compliance", icon: ShieldCheck },
  { id: "wellbeing", label: "Fatigue & Wellbeing", icon: HeartPulse },
  { id: "fairness", label: "Fairness", icon: Scale },
  { id: "myschedule", label: "My Schedule", icon: UserRound },
  { id: "exceptions", label: "Exceptions", icon: AlertTriangle },
  { id: "emergency", label: "Emergency Mode", icon: Siren },
  { id: "excel", label: "Excel Export/Import", icon: FileSpreadsheet },
  { id: "audit", label: "Audit Log", icon: History },
] as const;
type TabId = (typeof TABS)[number]["id"];

const SEV_TONE: Record<ScheduleException["severity"], string> = {
  critical: "#dc2626",
  high: "#ea580c",
  moderate: "#d97706",
  info: "#0891b2",
};
const SEV_LABEL: Record<ScheduleException["severity"], string> = {
  critical: "Critical",
  high: "High risk",
  moderate: "Moderate",
  info: "Informational",
};

function Section({ title, subtitle, right, children }: { title: string; subtitle?: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-foreground">{title}</h2>
          {subtitle && <p className="mt-0.5 max-w-3xl text-[11px] text-muted-foreground">{subtitle}</p>}
        </div>
        {right}
      </header>
      {children}
    </section>
  );
}

function AiTag() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
      <Sparkles className="h-3 w-3" aria-hidden="true" /> AI Prototype
    </span>
  );
}

function Stat({ label, value, tone, hint }: { label: string; value: string | number; tone?: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-xl font-semibold tabular-nums" style={{ color: tone ?? "var(--color-foreground)" }}>
        {value}
      </div>
      {hint && <div className="mt-0.5 text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

function NumField({ label, value, onChange, suffix, source }: { label: string; value: number; onChange: (v: number) => void; suffix?: string; source?: { reference: string; verified: boolean } }) {
  return (
    <label className="block rounded-lg border border-border bg-background p-3">
      <span className="text-[11px] font-semibold text-foreground">{label}</span>
      <span className="mt-1 flex items-center gap-2">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-24 rounded-md border border-border bg-card px-2 py-1 text-sm tabular-nums text-foreground"
        />
        {suffix && <span className="text-[11px] text-muted-foreground">{suffix}</span>}
      </span>
      {source && (
        <span className="mt-1.5 block text-[10px] leading-snug text-muted-foreground">
          Source: {source.reference}{" "}
          {!source.verified && (
            <em className="font-semibold not-italic text-amber-600">· Requires institutional/legal verification</em>
          )}
        </span>
      )}
    </label>
  );
}

export function SchedulingEngine({ session }: { session: Session }) {
  const canApprove =
    session.role === "admin" ||
    (session.responsibilities ?? []).some((r) => ["charge_nurse", "nursing_admin", "hr", "institution_admin"].includes(r));

  const [tab, setTab] = useState<TabId>("dashboard");
  const [dept, setDept] = useState<Department>(session.assignedDept ?? "medical");
  const [unit, setUnit] = useState("Unit A");
  const [month, setMonth] = useState(currentMonth());
  const [headcount, setHeadcount] = useState(20);
  const [policy, setPolicy] = useState<SchedulingPolicy>(() => defaultPolicy(session.assignedDept ?? "medical", session.institutionName ?? "Demo Institution"));
  const nurses = useMemo(() => demoNurses(dept, headcount), [dept, headcount]);
  const [requests, setRequests] = useState<DutyRequest[]>(() => demoRequests(demoNurses(session.assignedDept ?? "medical", 20), currentMonth()));
  const [roster, setRoster] = useState<Roster | null>(null);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [importReport, setImportReport] = useState<{ diffs: ImportDiff[]; errors: string[]; issues: string[]; cells: Record<string, Record<string, string>> } | null>(null);
  const [base, setBase] = useState<RegulatoryBaseline>(() => defaultRegulatoryBaseline("Kerala"));
  const [standards, setStandards] = useState<StaffingStandard[]>(DEFAULT_STAFFING_STANDARDS);
  const [standardId, setStandardId] = useState("std-ward");
  const [workload, setWorkload] = useState<WorkloadInputs>(DEFAULT_WORKLOAD);
  const [publishedAt, setPublishedAt] = useState<string | undefined>(undefined);
  const [changes, setChanges] = useState({ total: 0, lastMinute: 0, nurse: 0, management: 0, emergency: 0 });
  const [emergency, setEmergency] = useState<{ date: string; shift: string; absent?: string }>({ date: "", shift: "N" });
  const fileRef = useRef<HTMLInputElement>(null);

  const log = (action: string, detail: string) =>
    setAudit((p) => [
      { id: `a${p.length + 1}-${Date.now()}`, at: new Date().toISOString().slice(0, 16).replace("T", " "), actor: `${session.name} (${session.title})`, action, detail, policyVersion: policy.version },
      ...p,
    ]);

  const syncPolicyDept = (d: Department) => {
    setDept(d);
    setPolicy((p) => ({ ...p, requirements: p.requirements.map((r) => ({ ...r, dept: d })) }));
  };

  const generate = () => {
    const r = generateSchedule({ policy, nurses, requests, month, unit: `${getDept(dept).short} · ${unit}`, generatedBy: session.name });
    setRoster(r);
    setRequests((prev) =>
      prev.map((q) => {
        if (q.kind !== "preferred_off" || !q.date) return q;
        const granted = !["M", "E", "N", "D"].includes(r.cells[q.nurseId]?.[q.date] ?? "");
        return { ...q, outcome: granted ? "Granted in the generated roster" : "Not granted — minimum staffing would be breached" };
      }),
    );
    setTab("roster");
    log("Schedule generated", `${getDept(dept).short} · ${unit} · ${month} · quality ${r.quality.score}/100 · ${r.exceptions.length} exception(s).`);
  };

  const applyEdit = (nurseId: string, date: string, code: string, override?: string) => {
    if (!roster) return;
    const next = recompute({ ...roster, cells: { ...roster.cells, [nurseId]: { ...roster.cells[nurseId], [date]: code } }, status: "draft" }, policy, nurses);
    if (override)
      next.exceptions = [
        {
          id: `ex-ovr-${nurseId}-${date}`,
          severity: "high",
          category: "Authorised override",
          date,
          nurseId,
          message: `Hard rule overridden for ${nurses.find((n) => n.id === nurseId)?.name} on ${date} → ${code}.`,
          overridden: { by: session.name, reason: override, at: new Date().toISOString().slice(0, 16).replace("T", " ") },
        },
        ...next.exceptions,
      ];
    setRoster(next);
    setChanges((c) => ({
      ...c,
      total: c.total + 1,
      lastMinute: c.lastMinute + (publishedAt ? 1 : 0),
      management: c.management + 1,
      emergency: c.emergency + (override ? 1 : 0),
    }));
    log(override ? "Manual change (override)" : "Manual change", `${nurses.find((n) => n.id === nurseId)?.name} ${date} → ${code}${override ? ` · Reason: ${override}` : ""}`);
  };

  const onImport = async (file: File) => {
    if (!roster) return;
    const { diffs, cells, errors } = await parseRosterWorkbook(file, roster, nurses);
    const issues: string[] = [];
    let working = roster;
    diffs.forEach((d) => {
      const res = validateChange(working, policy, nurses, d.nurseId, d.date, d.to);
      if (res.level !== "ok") issues.push(`${d.nurseName} ${d.date} ${d.from}→${d.to}: ${res.messages.join(" ")}`);
      working = { ...working, cells: { ...working.cells, [d.nurseId]: { ...working.cells[d.nurseId], [d.date]: d.to } } };
    });
    const validated = recompute({ ...roster, cells }, policy, nurses);
    validated.exceptions
      .filter((e) => e.severity === "critical")
      .forEach((e) => issues.push(`${e.category}: ${e.message}`));
    setImportReport({ diffs, errors, issues, cells });
    log("Excel import validated", `${diffs.length} change(s) detected, ${issues.length} issue(s) raised. Not yet accepted.`);
  };

  const acceptImport = () => {
    if (!roster || !importReport) return;
    setRoster(recompute({ ...roster, cells: importReport.cells, status: "draft" }, policy, nurses));
    log("Excel import accepted", `${importReport.diffs.length} change(s) approved by ${session.name}.`);
    setImportReport(null);
    setTab("roster");
  };

  /* ---------------------------------------------------------------- views */

  const fatigue = useMemo(() => (roster ? fatigueRisk(roster, policy, nurses) : []), [roster, policy, nurses]);
  const fairData = useMemo(
    () => (roster ? fairness(roster, policy, nurses) : { rows: [], dimensions: [] }),
    [roster, policy, nurses],
  );
  const stability = useMemo(
    () =>
      scheduleStability({
        publishedAt,
        firstShiftDate: roster?.dates[0],
        totalChanges: changes.total,
        lastMinuteChanges: changes.lastMinute,
        nurseRequestedChanges: changes.nurse,
        managementChanges: changes.management,
        emergencyChanges: changes.emergency,
      }),
    [publishedAt, roster, changes],
  );
  const experience = useMemo(
    () => (roster ? experienceScores(roster, policy, nurses, stability) : []),
    [roster, policy, nurses, stability],
  );
  const compliance = useMemo(
    () =>
      roster
        ? validateCompliance(roster, policy, base, nurses, {
            fatigueHigh: fatigue.filter((f) => f.concern === "high").length,
            fairnessConcerns: fairData.dimensions.filter((d) => d.verdict !== "Fair").length,
            predictability: stability.score,
          })
        : null,
    [roster, policy, base, nurses, fatigue, fairData, stability],
  );
  const nightRows = useMemo(
    () =>
      fatigue.map((f) => ({
        name: f.name,
        nights: f.nights,
        maxConsecutiveNights: f.maxConsecutiveNights,
        transitions: f.rapidTransitions,
        recovery:
          f.shortRecoveries > 1 || f.maxConsecutiveNights > policy.maxConsecutiveNights
            ? "Circadian/Recovery Risk — Administrative Review Required"
            : f.rapidTransitions
              ? "Transition present; recovery interval within the configured rest rule."
              : "Stable pattern with adequate recovery.",
      })),
    [fatigue, policy.maxConsecutiveNights],
  );

  const q = roster?.quality;
  const critical = roster?.exceptions.filter((e) => e.severity === "critical") ?? [];
  const high = roster?.exceptions.filter((e) => e.severity === "high") ?? [];

  return (
    <div className="space-y-5">
      <header className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
          <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" /> NOS Workforce Operations · Scheduling
        </div>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">AI Nursing Duty Scheduling Engine</h1>
        <p className="mt-1 max-w-4xl text-sm text-muted-foreground">
          The safest and fairest feasible roster for this institution, department, workforce and month — built from the
          institution's own approved policy, nurse competency, availability, requests and recovery needs. AI generates
          and explains; the authorised nursing administrator reviews, edits, approves and publishes.
        </p>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Workflow: Configure policy → Enter workforce → Collect requests → AI generates → Validate → Review risks →
          Edit → Approve → Publish → Export/Share → Monitor changes.
        </p>
      </header>

      <nav className="flex flex-wrap gap-1.5" aria-label="Scheduling">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium ${
              tab === t.id ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            <t.icon className="h-3.5 w-3.5" aria-hidden="true" />
            {t.label}
          </button>
        ))}
      </nav>

      {/* ------------------------------------------------------ dashboard */}
      {tab === "dashboard" && (
        <>
          <Section title="Scheduling dashboard" subtitle={`${policy.institution} · ${getDept(dept).name} · ${unit} · ${month}`} right={<AiTag />}>
            {roster ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Stat label="Schedule quality" value={`${q!.score}/100`} tone={q!.score >= 85 ? "#0d9488" : q!.score >= 70 ? "#d97706" : "#dc2626"} hint="Not a clinical safety certification" />
                <Stat label="Critical exceptions" value={critical.length} tone={critical.length ? "#dc2626" : "#0d9488"} hint="Understaffing, skill mix, hard rules" />
                <Stat label="High-risk exceptions" value={high.length} tone={high.length ? "#ea580c" : "#0d9488"} hint="Recovery, excessive hours or nights" />
                <Stat label="Status" value={roster.status} hint={`Policy ${roster.policyVersion} · generated by ${roster.generatedBy}`} />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No roster generated yet for {month}. Configure the policy, review staff and requests, then run{" "}
                <button type="button" className="font-semibold text-primary underline" onClick={() => setTab("generate")}>
                  Generate AI Schedule
                </button>
                .
              </p>
            )}
          </Section>

          {roster && (
            <Section title="Why this schedule?" subtitle="Plain-language reasoning for the nursing administrator." right={<AiTag />}>
              <div className="space-y-3">
                {roster.explanations.map((e) => (
                  <div key={e.title} className="rounded-xl border border-border bg-background p-3">
                    <div className="text-xs font-semibold text-foreground">{e.title}</div>
                    <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{e.body}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {roster && (
            <Section title="NOS Schedule Quality Score" subtitle="Weighted, explainable components. Deductions are always shown." right={<Gauge className="h-4 w-4 text-muted-foreground" />}>
              <div className="space-y-2">
                {q!.components.map((c) => (
                  <div key={c.key}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-foreground">
                        {c.label} <span className="text-muted-foreground">· weight {Math.round(c.weight * 100)}%</span>
                      </span>
                      <span className="font-semibold tabular-nums text-foreground">{c.score}</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full" style={{ width: `${c.score}%`, background: c.score >= 85 ? "#0d9488" : c.score >= 70 ? "#d97706" : "#dc2626" }} />
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">{c.note}</div>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </>
      )}

      {/* ---------------------------------------------------------- staff */}
      {tab === "staff" && (
        <Section
          title="Nurse scheduling profiles"
          subtitle="Competency, contract, availability and recent duty history feed the engine. Competency governance remains owned by Employee Growth."
        >
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-[11px]">
              <thead className="text-muted-foreground">
                <tr className="border-b border-border">
                  {["Nurse", "Designation / grade", "Qualification", "Competencies", "Contract", "Available days", "Preferred", "Restrictions", "Nights (30d)", "Weekends (30d)"].map((h) => (
                    <th key={h} className="px-2 py-2 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {nurses.map((n) => (
                  <tr key={n.id} className="border-b border-border/60">
                    <td className="px-2 py-2 font-medium text-foreground">{n.name}<div className="text-[10px] text-muted-foreground">{n.id} · {n.experienceYears}y</div></td>
                    <td className="px-2 py-2 text-muted-foreground">{n.designation}<div className="text-[10px]">{n.grade}</div></td>
                    <td className="px-2 py-2 text-muted-foreground">{n.qualification}</td>
                    <td className="px-2 py-2 text-muted-foreground">{n.competencies.map((c) => COMPETENCY_LABEL[c]).join(", ") || "—"}</td>
                    <td className="px-2 py-2 text-muted-foreground">{n.employment.replace("_", " ")}<div className="text-[10px]">{n.contractedHoursPerWeek}h/wk</div></td>
                    <td className="px-2 py-2 tabular-nums text-muted-foreground">{n.availableDays.length === 7 ? "All" : n.availableDays.map((d) => "SMTWTFS"[d]).join("")}</td>
                    <td className="px-2 py-2 text-muted-foreground">{n.preferredShifts.join("/")}</td>
                    <td className="px-2 py-2 text-muted-foreground">{n.restrictions.join("; ") || "—"}</td>
                    <td className="px-2 py-2 text-center tabular-nums text-muted-foreground">{n.history.nightsLast30}</td>
                    <td className="px-2 py-2 text-center tabular-nums text-muted-foreground">{n.history.weekendsLast30}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* -------------------------------------------------------- requests */}
      {tab === "requests" && (
        <Section
          title="Duty requests"
          subtitle="Requests are preferences, not guarantees. Approved leave and approved unavailability become hard constraints; OFF and duty preferences are optimised where operationally possible."
        >
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-[11px]">
              <thead className="text-muted-foreground">
                <tr className="border-b border-border">
                  {["Nurse", "Request", "Dates", "Shift", "Reason", "Status", "Engine outcome", canApprove ? "Decision" : ""].filter(Boolean).map((h) => (
                    <th key={h} className="px-2 py-2 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => {
                  const n = nurses.find((x) => x.id === r.nurseId);
                  return (
                    <tr key={r.id} className="border-b border-border/60">
                      <td className="px-2 py-2 font-medium text-foreground">{n?.name ?? r.nurseId}</td>
                      <td className="px-2 py-2 text-muted-foreground">{REQUEST_KIND_LABEL[r.kind]}</td>
                      <td className="px-2 py-2 tabular-nums text-muted-foreground">{r.date}{r.dateTo ? ` → ${r.dateTo}` : ""}</td>
                      <td className="px-2 py-2">{r.shiftCode ? <CodeChip code={r.shiftCode} /> : <span className="text-muted-foreground">—</span>}</td>
                      <td className="px-2 py-2 text-muted-foreground">{r.reason ?? "—"}</td>
                      <td className="px-2 py-2 font-medium capitalize text-foreground">{r.status}</td>
                      <td className="px-2 py-2 text-muted-foreground">{r.outcome ?? "Pending generation"}</td>
                      {canApprove && (
                        <td className="px-2 py-2">
                          <span className="flex gap-1">
                            {(["approved", "declined"] as const).map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => {
                                  setRequests((p) => p.map((x) => (x.id === r.id ? { ...x, status: s } : x)));
                                  log("Duty request decision", `${n?.name}: ${REQUEST_KIND_LABEL[r.kind]} ${s}.`);
                                }}
                                className="rounded border border-border px-2 py-0.5 text-[10px] font-semibold text-foreground hover:bg-muted"
                              >
                                {s === "approved" ? "Approve" : "Decline"}
                              </button>
                            ))}
                          </span>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* -------------------------------------------------------- policies */}
      {tab === "policies" && (
        <>
          <Section
            title="Scheduling policy & rules"
            subtitle={`${policy.name} ${policy.version} · effective ${policy.effectiveFrom}. NOS does not assume a universal national duty-hour rule: national/state regulation, institutional policy, department requirements and individual preferences are kept distinct, and the institution's approved policy controls scheduling behaviour.`}
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <NumField label="Maximum hours per day" value={policy.maxHoursPerDay} suffix="h" onChange={(v) => setPolicy({ ...policy, maxHoursPerDay: v })} />
              <NumField label="Maximum hours per week" value={policy.maxHoursPerWeek} suffix="h" source={policy.sources.maxHoursPerWeek} onChange={(v) => setPolicy({ ...policy, maxHoursPerWeek: v })} />
              <NumField label="Minimum rest between shifts" value={policy.minRestHoursBetweenShifts} suffix="h" source={policy.sources.minRestHoursBetweenShifts} onChange={(v) => setPolicy({ ...policy, minRestHoursBetweenShifts: v })} />
              <NumField label="Maximum consecutive working days" value={policy.maxConsecutiveWorkDays} onChange={(v) => setPolicy({ ...policy, maxConsecutiveWorkDays: v })} />
              <NumField label="Maximum consecutive nights" value={policy.maxConsecutiveNights} source={policy.sources.maxConsecutiveNights} onChange={(v) => setPolicy({ ...policy, maxConsecutiveNights: v })} />
              <NumField label="Required days off per week" value={policy.minDaysOffPerWeek} onChange={(v) => setPolicy({ ...policy, minDaysOffPerWeek: v })} />
              <NumField label="Night duties per month (limit)" value={policy.maxNightsPerMonth} onChange={(v) => setPolicy({ ...policy, maxNightsPerMonth: v })} />
              <NumField label="Weekend duties per month (target)" value={policy.weekendDutiesPerMonth} onChange={(v) => setPolicy({ ...policy, weekendDutiesPerMonth: v })} />
              <NumField label="Maximum overtime hours per month" value={policy.maxOvertimeHoursPerMonth} suffix="h" onChange={(v) => setPolicy({ ...policy, maxOvertimeHoursPerMonth: v })} />
              <NumField label="Break minutes per shift" value={policy.breakMinutesPerShift} suffix="min" source={policy.sources.breakMinutesPerShift} onChange={(v) => setPolicy({ ...policy, breakMinutesPerShift: v })} />
            </div>

            <div className="mt-3 flex flex-wrap gap-4 text-xs text-foreground">
              {([
                ["overtimeAllowed", "Overtime permitted"],
                ["breakMustBeCovered", "Breaks must be covered"],
                ["leaveIsHardConstraint", "Approved leave is a hard constraint"],
                ["swapsRequireApproval", "Shift swaps require approval"],
                ["emergencyOverrideAllowed", "Authorised override permitted"],
              ] as const).map(([key, label]) => (
                <label key={key} className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={policy[key] as boolean} onChange={(e) => setPolicy({ ...policy, [key]: e.target.checked })} />
                  {label}
                </label>
              ))}
            </div>
          </Section>

          <Section title="Shift types" subtitle="Shift codes, timings and duration are institution-customisable.">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-[11px]">
                <thead className="text-muted-foreground">
                  <tr className="border-b border-border">{["Code", "Label", "Start", "End", "Hours", "Type"].map((h) => <th key={h} className="px-2 py-2 font-semibold">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {policy.shiftTypes.map((s, i) => (
                    <tr key={s.code} className="border-b border-border/60">
                      <td className="px-2 py-1"><CodeChip code={s.code} /></td>
                      <td className="px-2 py-1">
                        <input
                          value={s.label}
                          onChange={(e) => {
                            const st = [...policy.shiftTypes];
                            st[i] = { ...s, label: e.target.value };
                            setPolicy({ ...policy, shiftTypes: st });
                          }}
                          className="w-36 rounded border border-border bg-background px-1.5 py-0.5 text-[11px]"
                        />
                      </td>
                      {(["start", "end"] as const).map((k) => (
                        <td key={k} className="px-2 py-1">
                          <input
                            value={s[k]}
                            disabled={s.kind !== "working"}
                            onChange={(e) => {
                              const st = [...policy.shiftTypes];
                              st[i] = { ...s, [k]: e.target.value };
                              setPolicy({ ...policy, shiftTypes: st });
                            }}
                            className="w-20 rounded border border-border bg-background px-1.5 py-0.5 text-[11px] tabular-nums disabled:opacity-40"
                          />
                        </td>
                      ))}
                      <td className="px-2 py-1">
                        <input
                          type="number"
                          value={s.hours}
                          disabled={s.kind !== "working"}
                          onChange={(e) => {
                            const st = [...policy.shiftTypes];
                            st[i] = { ...s, hours: Number(e.target.value) };
                            setPolicy({ ...policy, shiftTypes: st });
                          }}
                          className="w-16 rounded border border-border bg-background px-1.5 py-0.5 text-[11px] tabular-nums disabled:opacity-40"
                        />
                      </td>
                      <td className="px-2 py-1 capitalize text-muted-foreground">{s.night ? "night duty" : s.kind}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="Department staffing requirements" subtitle="Minimum nurses, seniority mix, competency and nurse-to-patient ratio per shift.">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-[11px]">
                <thead className="text-muted-foreground">
                  <tr className="border-b border-border">{["Shift", "Minimum nurses", "Minimum senior", "Required competency", "Nurse:patient ratio"].map((h) => <th key={h} className="px-2 py-2 font-semibold">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {policy.requirements.map((r, i) => (
                    <tr key={r.shiftCode} className="border-b border-border/60">
                      <td className="px-2 py-1"><CodeChip code={r.shiftCode} /></td>
                      {(["minNurses", "minSenior"] as const).map((k) => (
                        <td key={k} className="px-2 py-1">
                          <input
                            type="number"
                            value={r[k]}
                            onChange={(e) => {
                              const rs = [...policy.requirements];
                              rs[i] = { ...r, [k]: Number(e.target.value) };
                              setPolicy({ ...policy, requirements: rs });
                            }}
                            className="w-16 rounded border border-border bg-background px-1.5 py-0.5 text-[11px] tabular-nums"
                          />
                        </td>
                      ))}
                      <td className="px-2 py-1 text-muted-foreground">{r.requiredCompetency ? COMPETENCY_LABEL[r.requiredCompetency] : "—"}</td>
                      <td className="px-2 py-1 tabular-nums text-muted-foreground">{r.nursePatientRatio ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="mt-3 space-y-1 text-[11px] text-muted-foreground">
              {policy.restrictions.map((r) => (
                <li key={r}>• {r}</li>
              ))}
            </ul>
          </Section>
        </>
      )}

      {/* -------------------------------------------------------- generate */}
      {tab === "generate" && (
        <>
          <Section title="Generate AI schedule" subtitle="Select the scheduling context, then generate the complete monthly roster." right={<AiTag />}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <label className="text-[11px] font-semibold text-foreground">
                Institution
                <input value={policy.institution} onChange={(e) => setPolicy({ ...policy, institution: e.target.value })} className="mt-1 block w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs font-normal" />
              </label>
              <label className="text-[11px] font-semibold text-foreground">
                Department
                <select value={dept} onChange={(e) => syncPolicyDept(e.target.value as Department)} className="mt-1 block w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs font-normal">
                  {DEPARTMENTS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </label>
              <label className="text-[11px] font-semibold text-foreground">
                Unit
                <input value={unit} onChange={(e) => setUnit(e.target.value)} className="mt-1 block w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs font-normal" />
              </label>
              <label className="text-[11px] font-semibold text-foreground">
                Scheduling month
                <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="mt-1 block w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs font-normal tabular-nums" />
              </label>
              <label className="text-[11px] font-semibold text-foreground">
                Number of nurses
                <input type="number" min={6} max={40} value={headcount} onChange={(e) => setHeadcount(Number(e.target.value))} className="mt-1 block w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs font-normal tabular-nums" />
              </label>
              <label className="text-[11px] font-semibold text-foreground">
                Applicable policy
                <div className="mt-1 rounded-lg border border-border bg-muted/40 px-2 py-1.5 text-xs font-normal text-muted-foreground">{policy.name} · {policy.version}</div>
              </label>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button type="button" onClick={generate} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                <Sparkles className="h-4 w-4" aria-hidden="true" /> Generate AI Schedule
              </button>
              <span className="text-[11px] text-muted-foreground">
                Shift pattern: {policy.requirements.map((r) => r.shiftCode).join(" / ")} · every hard constraint is enforced during generation.
              </span>
            </div>
          </Section>

          <Section title="Scheduling priority hierarchy" subtitle="Applied in strict order when preferences and requirements conflict.">
            <ol className="grid gap-2 sm:grid-cols-2">
              {[
                ["Patient safety", "Adequate staffing and required competencies."],
                ["Legal / institutional compliance", "Configured hours, rest, leave and overtime rules."],
                ["Clinical skill mix", "Required seniority, competency and specialty coverage."],
                ["Nurse recovery", "Avoid fatigue-producing and circadian-disruptive patterns."],
                ["Nurse preferences", "OFF and duty requests wherever operationally possible."],
                ["Fairness", "Balance of nights, weekends and difficult duties."],
                ["Optimisation", "Overall schedule quality and workforce utilisation."],
              ].map(([t, d], i) => (
                <li key={t} className="rounded-xl border border-border bg-background p-3">
                  <div className="text-xs font-semibold text-foreground">Priority {i + 1} — {t}</div>
                  <div className="text-[11px] text-muted-foreground">{d}</div>
                </li>
              ))}
            </ol>
          </Section>
        </>
      )}

      {/* ----------------------------------------------- regulatory baseline */}
      {tab === "regulatory" && <RegulatoryBaselinePanel base={base} onChange={setBase} />}

      {/* -------------------------------------- staffing standards & workload */}
      {tab === "standards" && (
        <StaffingStandardsPanel
          standards={standards}
          onStandards={setStandards}
          workload={workload}
          onWorkload={setWorkload}
          selectedId={standardId}
          onSelect={setStandardId}
        />
      )}

      {/* --------------------------------------------------- compliance */}
      {tab === "compliance" && (
        <>
          {compliance ? (
            <>
              <CompliancePanel report={compliance} base={base} />
              <VersionRecord
                base={base}
                policy={policy}
                roster={roster}
                standardsVersion={STANDARDS_VERSION}
                engineVersion={ENGINE_VERSION}
                approver={roster?.status === "draft" ? undefined : session.name}
              />
            </>
          ) : (
            <Section title="India Labour Compliance" subtitle="Generate a roster to run the three-layer validation.">
              <p className="text-sm text-muted-foreground">No roster generated yet for {month}.</p>
              <div className="mt-3"><Disclaimer /></div>
            </Section>
          )}
        </>
      )}

      {/* ------------------------------------------------- wellbeing */}
      {tab === "wellbeing" && (
        roster ? (
          <WellbeingPanel fatigue={fatigue} experience={experience} stability={stability} nightRows={nightRows} />
        ) : (
          <Section title="Fatigue & wellbeing" subtitle="Generate a roster first.">
            <p className="text-sm text-muted-foreground">No roster generated yet for {month}.</p>
          </Section>
        )
      )}

      {/* -------------------------------------------------- fairness */}
      {tab === "fairness" && (
        roster ? (
          <FairnessPanel rows={fairData.rows} dimensions={fairData.dimensions} />
        ) : (
          <Section title="Fairness dashboard" subtitle="Generate a roster first.">
            <p className="text-sm text-muted-foreground">No roster generated yet for {month}.</p>
          </Section>
        )
      )}

      {/* ------------------------------------------------ my schedule */}
      {tab === "myschedule" && (
        <MySchedulePanel
          nurses={nurses}
          roster={roster}
          policy={policy}
          requests={requests}
          fatigue={fatigue}
          experience={experience}
          onSubmit={(r) => {
            setRequests((p) => [r, ...p]);
            setChanges((c) => ({ ...c, nurse: c.nurse + 1 }));
            log("Duty request submitted", `${nurses.find((n) => n.id === r.nurseId)?.name} · ${r.kind} · ${r.date ?? "—"} · awaiting manager approval.`);
          }}
        />
      )}

      {/* ---------------------------------------------------------- roster */}
      {tab === "roster" && (
        <Section
          title="Monthly duty roster"
          subtitle={roster ? `${roster.unit} · ${roster.month} · ${roster.status} · click any cell to edit; every change is validated before it is applied.` : undefined}
          right={
            roster && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-border px-2 py-0.5 text-[11px] font-semibold text-foreground">Quality {roster.quality.score}/100</span>
                <button type="button" onClick={() => exportRosterWorkbook(roster, policy, nurses)} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted">
                  <Download className="h-3.5 w-3.5" aria-hidden="true" /> Export to Excel
                </button>
                {canApprove && roster.status !== "published" && (
                  <button
                    type="button"
                    onClick={() => {
                      const next = roster.status === "draft" ? "approved" : "published";
                      setRoster({ ...roster, status: next });
                      if (next === "published") setPublishedAt(new Date().toISOString().slice(0, 10));
                      log(next === "approved" ? "Schedule approved" : "Schedule published", `${roster.unit} ${roster.month} · ${critical.length} critical exception(s) at the time of ${next}.`);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                  >
                    <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" /> {roster.status === "draft" ? "Approve schedule" : "Publish schedule"}
                  </button>
                )}
              </div>
            )
          }
        >
          {roster ? (
            <RosterGrid roster={roster} policy={policy} nurses={nurses} canEdit={canApprove} onChange={applyEdit} />
          ) : (
            <p className="text-sm text-muted-foreground">Generate a schedule first.</p>
          )}
        </Section>
      )}

      {/* -------------------------------------------------------- coverage */}
      {tab === "coverage" && (
        <Section title="Staffing coverage" subtitle="Required vs scheduled staff, seniority and competency status for every shift.">
          {roster ? (
            <div className="max-h-[36rem] overflow-auto">
              <table className="min-w-full text-left text-[11px]">
                <thead className="sticky top-0 bg-card text-muted-foreground">
                  <tr className="border-b border-border">{["Date", "Shift", "Required", "Scheduled", "Shortage/Surplus", "Senior", "Skill mix"].map((h) => <th key={h} className="px-2 py-2 font-semibold">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {roster.coverage.map((c) => {
                    const delta = c.scheduled - c.required;
                    const gap = !c.competencyMet || c.scheduledSenior < c.requiredSenior;
                    return (
                      <tr key={`${c.date}-${c.shiftCode}`} className="border-b border-border/60">
                        <td className="px-2 py-1 tabular-nums text-foreground">{c.date}</td>
                        <td className="px-2 py-1"><CodeChip code={c.shiftCode} /></td>
                        <td className="px-2 py-1 tabular-nums text-muted-foreground">{c.required}</td>
                        <td className="px-2 py-1 tabular-nums text-foreground">{c.scheduled}</td>
                        <td className="px-2 py-1 tabular-nums font-semibold" style={{ color: delta < 0 ? "#dc2626" : delta > 0 ? "#0d9488" : "var(--color-muted-foreground)" }}>{delta > 0 ? `+${delta}` : delta}</td>
                        <td className="px-2 py-1 tabular-nums text-muted-foreground">{c.scheduledSenior}/{c.requiredSenior}</td>
                        <td className="px-2 py-1 font-semibold" style={{ color: gap ? "#dc2626" : "#0d9488" }}>{gap ? "Gap" : "Met"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Generate a schedule first.</p>
          )}
        </Section>
      )}

      {/* ------------------------------------------------------ exceptions */}
      {tab === "exceptions" && (
        <Section title="Exception dashboard" subtitle="Critical, high-risk, moderate and informational findings across the roster." right={<ShieldAlert className="h-4 w-4 text-muted-foreground" />}>
          {roster ? (
            <div className="space-y-4">
              {(["critical", "high", "moderate", "info"] as const).map((sev) => {
                const items = roster.exceptions.filter((e) => e.severity === sev);
                return (
                  <div key={sev}>
                    <div className="mb-1.5 flex items-center gap-2">
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider" style={{ background: `color-mix(in oklab, ${SEV_TONE[sev]} 15%, transparent)`, color: SEV_TONE[sev] }}>
                        {SEV_LABEL[sev]}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{items.length} finding(s)</span>
                    </div>
                    {items.length === 0 ? (
                      <p className="text-[11px] text-muted-foreground">None.</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {items.slice(0, 40).map((e) => (
                          <li key={e.id} className="rounded-lg border border-border bg-background p-2.5 text-[11px]">
                            <div className="font-semibold text-foreground">{e.category}</div>
                            <div className="text-muted-foreground">{e.message}</div>
                            {e.overridden && (
                              <div className="mt-1 text-[10px] text-amber-600">
                                Override by {e.overridden.by} at {e.overridden.at} — {e.overridden.reason}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Generate a schedule first.</p>
          )}
        </Section>
      )}

      {/* ------------------------------------------------------- emergency */}
      {tab === "emergency" && (
        <Section
          title="Emergency staffing mode"
          subtitle="Sick call or unfilled shift: NOS ranks safe replacement options on competency, recovery, recent workload and contract — never simply the nurse with the fewest shifts."
          right={<AiTag />}
        >
          {roster ? (
            <>
              <div className="flex flex-wrap items-end gap-3">
                <label className="text-[11px] font-semibold text-foreground">
                  Date
                  <select value={emergency.date || roster.dates[0]} onChange={(e) => setEmergency({ ...emergency, date: e.target.value })} className="mt-1 block rounded-lg border border-border bg-background px-2 py-1.5 text-xs font-normal tabular-nums">
                    {roster.dates.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </label>
                <label className="text-[11px] font-semibold text-foreground">
                  Shift
                  <select value={emergency.shift} onChange={(e) => setEmergency({ ...emergency, shift: e.target.value })} className="mt-1 block rounded-lg border border-border bg-background px-2 py-1.5 text-xs font-normal">
                    {policy.requirements.map((r) => <option key={r.shiftCode} value={r.shiftCode}>{r.shiftCode}</option>)}
                  </select>
                </label>
                <label className="text-[11px] font-semibold text-foreground">
                  Absent nurse (sick call)
                  <select value={emergency.absent ?? ""} onChange={(e) => setEmergency({ ...emergency, absent: e.target.value || undefined })} className="mt-1 block rounded-lg border border-border bg-background px-2 py-1.5 text-xs font-normal">
                    <option value="">Unfilled shift</option>
                    {nurses.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
                  </select>
                </label>
              </div>
              <ul className="mt-4 space-y-2">
                {emergencyOptions(roster, policy, nurses, emergency.date || roster.dates[0]!, emergency.shift, emergency.absent)
                  .slice(0, 8)
                  .map((o) => (
                    <li key={o.nurse.id} className="rounded-xl border border-border bg-background p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-xs font-semibold text-foreground">
                          {o.nurse.name} <span className="font-normal text-muted-foreground">· {o.nurse.designation} · {o.nurse.employment.replace("_", " ")}</span>
                        </div>
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                          style={{
                            background: `color-mix(in oklab, ${o.safety === "recommended" ? "#0d9488" : o.safety === "caution" ? "#d97706" : "#dc2626"} 15%, transparent)`,
                            color: o.safety === "recommended" ? "#0d9488" : o.safety === "caution" ? "#d97706" : "#dc2626",
                          }}
                        >
                          {o.safety === "recommended" ? "Safe to assign" : o.safety === "caution" ? "Assign with caution" : "Not advised"}
                        </span>
                      </div>
                      <ul className="mt-1 space-y-0.5 text-[11px] text-muted-foreground">
                        {o.reasons.slice(0, 4).map((r) => <li key={r}>• {r}</li>)}
                      </ul>
                      {canApprove && o.safety !== "not_advised" && (
                        <button
                          type="button"
                          onClick={() => applyEdit(o.nurse.id, emergency.date || roster.dates[0]!, emergency.shift)}
                          className="mt-2 rounded-lg border border-border px-2.5 py-1 text-[11px] font-semibold text-foreground hover:bg-muted"
                        >
                          Assign emergency cover
                        </button>
                      )}
                    </li>
                  ))}
              </ul>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Generate a schedule first.</p>
          )}
        </Section>
      )}

      {/* ----------------------------------------------------------- excel */}
      {tab === "excel" && (
        <>
          <Section title="Excel export" subtitle="Five sheets: monthly duty roster, nurse summary, staffing coverage, policy & rules, exceptions. The exported file stays fully editable.">
            <button
              type="button"
              disabled={!roster}
              onClick={() => roster && exportRosterWorkbook(roster, policy, nurses)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40"
            >
              <Download className="h-4 w-4" aria-hidden="true" /> Export to Excel
            </button>
          </Section>

          <Section title="Import edited Excel" subtitle="Uploaded rosters are never accepted automatically — NOS detects each change and validates it against the current policy first.">
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void onImport(f);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              disabled={!roster}
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-40"
            >
              <Upload className="h-4 w-4" aria-hidden="true" /> Upload edited roster
            </button>

            {importReport && (
              <div className="mt-4 space-y-3">
                <div className="text-xs font-semibold text-foreground">Validation report — {importReport.diffs.length} change(s) detected</div>
                {importReport.errors.map((e) => <p key={e} className="text-[11px] text-destructive">{e}</p>)}
                <div className="max-h-64 overflow-auto rounded-lg border border-border">
                  <table className="min-w-full text-left text-[11px]">
                    <thead className="bg-muted/60 text-muted-foreground">
                      <tr>{["Nurse", "Date", "From", "To"].map((h) => <th key={h} className="px-2 py-1.5 font-semibold">{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {importReport.diffs.map((d) => (
                        <tr key={`${d.nurseId}-${d.date}`} className="border-t border-border/60">
                          <td className="px-2 py-1 text-foreground">{d.nurseName}</td>
                          <td className="px-2 py-1 tabular-nums text-muted-foreground">{d.date}</td>
                          <td className="px-2 py-1"><CodeChip code={d.from || "—"} /></td>
                          <td className="px-2 py-1"><CodeChip code={d.to} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {importReport.issues.length > 0 && (
                  <div className="rounded-lg border border-destructive/50 p-3">
                    <div className="text-[11px] font-semibold text-destructive">{importReport.issues.length} issue(s) raised by validation</div>
                    <ul className="mt-1 space-y-0.5 text-[11px] text-muted-foreground">
                      {importReport.issues.slice(0, 20).map((i) => <li key={i}>• {i}</li>)}
                    </ul>
                  </div>
                )}
                <div className="flex gap-2">
                  <button type="button" disabled={!canApprove} onClick={acceptImport} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-40">
                    Approve and apply import
                  </button>
                  <button type="button" onClick={() => setImportReport(null)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground">
                    Discard
                  </button>
                </div>
              </div>
            )}
          </Section>
        </>
      )}

      {/* ----------------------------------------------------------- audit */}
      {tab === "audit" && (
        <Section title="Audit log" subtitle="Generation, manual changes, overrides, imports, approvals and rejections — with actor, time and policy version.">
          {audit.length === 0 ? (
            <p className="text-sm text-muted-foreground">No scheduling actions recorded in this session yet.</p>
          ) : (
            <ul className="space-y-1.5">
              {audit.map((a) => (
                <li key={a.id} className="rounded-lg border border-border bg-background p-2.5 text-[11px]">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-foreground">{a.action}</span>
                    <span className="tabular-nums text-muted-foreground">{a.at} · {a.actor} · policy {a.policyVersion}</span>
                  </div>
                  <div className="text-muted-foreground">{a.detail}</div>
                </li>
              ))}
            </ul>
          )}
        </Section>
      )}

      <footer className="pb-8 text-center text-[11px] text-muted-foreground">
        NOS does not replace the Nursing Superintendent or Nurse Manager. The engine provides decision support,
        optimisation and risk detection; the authorised nursing administrator retains final approval. Regulatory values
        are configurable institutional constraints — items marked "Requires institutional/legal verification" must be
        confirmed against the applicable jurisdiction.
      </footer>
      <footer className="space-y-2 pb-8">
        <Disclaimer />
        <p className="text-center text-[11px] text-muted-foreground">
          Workflow: Policy → Workforce → Requests → AI generation → Compliance validation → Wellbeing validation →
          Manager review → Approval → Publish. The Nursing Superintendent / Nurse Manager remains the final
          decision-maker; AI never makes a roster legally binding on its own.
        </p>
      </footer>
    </div>
  );
}
