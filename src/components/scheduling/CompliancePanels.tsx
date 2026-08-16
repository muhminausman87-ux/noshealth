import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import type { DutyRequest, NurseProfile, Roster, SchedulingPolicy } from "@/lib/scheduling/types";
import { REQUEST_KIND_LABEL, type RequestKind } from "@/lib/scheduling/types";
import { isNight, isWorking } from "@/lib/scheduling/policy";
import {
  INDIAN_STATES,
  REGULATORY_DISCLAIMER,
  RULE_KIND_LABEL,
  RULE_KIND_TONE,
  SAFEGUARD_LABEL,
  STATE_DISCLAIMER,
  indiaBaselineRules,
  missingSafeguards,
  type IndianState,
  type RegulatoryBaseline,
  type WomenNightWorkSafeguards,
} from "@/lib/scheduling/regulatory";
import {
  STATUS_LABEL,
  STATUS_TONE,
  type ComplianceReport,
  type ComplianceStatus,
} from "@/lib/scheduling/compliance";
import {
  CONCERN_LABEL,
  CONCERN_TONE,
  declineExplanation,
  type ExperienceRow,
  type FairnessDimension,
  type FairnessRow,
  type FatigueRow,
  type StabilityReport,
} from "@/lib/scheduling/wellbeing";
import {
  calculateRequiredWorkforce,
  type StaffingStandard,
  type WorkloadInputs,
} from "@/lib/scheduling/staffing-standards";

/* ------------------------------------------------------------- primitives */

export function Panel({
  title,
  subtitle,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
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

function Tag({ children, tone }: { children: React.ReactNode; tone: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
      style={{ color: tone, borderColor: `${tone}55`, background: `${tone}12` }}
    >
      {children}
    </span>
  );
}

export function StatusTag({ status }: { status: ComplianceStatus }) {
  return <Tag tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Tag>;
}

function Proto() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
      <Sparkles className="h-3 w-3" aria-hidden="true" /> AI Prototype
    </span>
  );
}

function Num({ label, value, onChange, suffix }: { label: string; value: number; onChange: (v: number) => void; suffix?: string }) {
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
    </label>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-[12px] text-foreground">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-3.5 w-3.5" />
      {label}
    </label>
  );
}

const Th = ({ children }: { children: React.ReactNode }) => (
  <th className="whitespace-nowrap px-2 py-1.5 text-left font-semibold text-muted-foreground">{children}</th>
);
const Td = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <td className={`whitespace-nowrap px-2 py-1.5 text-foreground ${className}`}>{children}</td>
);

export function Disclaimer() {
  return (
    <p className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-[11px] leading-relaxed text-foreground">
      {REGULATORY_DISCLAIMER}
    </p>
  );
}

/* --------------------------------------------------- regulatory baseline */

export function RegulatoryBaselinePanel({
  base,
  onChange,
}: {
  base: RegulatoryBaseline;
  onChange: (b: RegulatoryBaseline) => void;
}) {
  const set = <K extends keyof RegulatoryBaseline>(k: K, v: RegulatoryBaseline[K]) => onChange({ ...base, [k]: v });
  const setSafe = (k: keyof WomenNightWorkSafeguards, v: boolean) =>
    onChange({ ...base, safeguards: { ...base.safeguards, [k]: v } });
  const missing = missingSafeguards(base.safeguards);

  return (
    <>
      <Panel
        title="India Regulatory Baseline"
        subtitle="Legal, state, nursing-standard, institutional, contractual and preference layers are kept distinct. An optimisation preference is never presented as a legal requirement."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block rounded-lg border border-border bg-background p-3">
            <span className="text-[11px] font-semibold text-foreground">Jurisdiction level</span>
            <select
              value={base.jurisdictionLevel}
              onChange={(e) => set("jurisdictionLevel", e.target.value as RegulatoryBaseline["jurisdictionLevel"])}
              className="mt-1 w-full rounded-md border border-border bg-card px-2 py-1 text-sm text-foreground"
            >
              <option>Central</option>
              <option>Central + State</option>
            </select>
          </label>
          <label className="block rounded-lg border border-border bg-background p-3">
            <span className="text-[11px] font-semibold text-foreground">State</span>
            <select
              value={base.state}
              onChange={(e) => {
                const s = e.target.value as IndianState;
                onChange({ ...base, state: s, rules: indiaBaselineRules(s) });
              }}
              className="mt-1 w-full rounded-md border border-border bg-card px-2 py-1 text-sm text-foreground"
            >
              {INDIAN_STATES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <span className="mt-1 block text-[10px] text-amber-600">{STATE_DISCLAIMER}</span>
          </label>
          <Num label="Standard daily hours (statutory baseline)" value={base.standardDailyHours} onChange={(v) => set("standardDailyHours", v)} suffix="h/day" />
          <Num label="Standard weekly hours (statutory baseline)" value={base.standardWeeklyHours} onChange={(v) => set("standardWeeklyHours", v)} suffix="h/week" />
          <Num label="Contractual / institutional week" value={base.contractualWeeklyHours} onChange={(v) => set("contractualWeeklyHours", v)} suffix="h/week" />
          <Num label="Overtime threshold — daily" value={base.overtimeThresholdDaily} onChange={(v) => set("overtimeThresholdDaily", v)} suffix="h" />
          <Num label="Overtime threshold — weekly" value={base.overtimeThresholdWeekly} onChange={(v) => set("overtimeThresholdWeekly", v)} suffix="h" />
          <Num label="Overtime rate multiplier" value={base.overtimeMultiplier} onChange={(v) => set("overtimeMultiplier", v)} suffix="×" />
          <Num label="Continuous work before break" value={base.continuousWorkBeforeBreakHours} onChange={(v) => set("continuousWorkBeforeBreakHours", v)} suffix="h" />
          <Num label="Required break" value={base.requiredBreakMinutes} onChange={(v) => set("requiredBreakMinutes", v)} suffix="min" />
          <Num label="Weekly holidays per week" value={base.weeklyHolidaysPerWeek} onChange={(v) => set("weeklyHolidaysPerWeek", v)} suffix="day(s)" />
          <Num label="Public holidays per year" value={base.publicHolidaysPerYear} onChange={(v) => set("publicHolidaysPerYear", v)} suffix="days" />
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <Check label="Break requires safe relief coverage" checked={base.breakRequiresCoverage} onChange={(v) => set("breakRequiresCoverage", v)} />
          <Check label="Compensatory holiday required where weekly holiday not given" checked={base.compensatoryOffRequired} onChange={(v) => set("compensatoryOffRequired", v)} />
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">
          A 40-hour week is treated as an institutional/contractual standard, configured separately from the statutory
          baseline. NOS does not assume every hospital employee has a 40-hour week.
        </p>
        <div className="mt-3">
          <Disclaimer />
        </div>
      </Panel>

      <Panel
        title="Women night-work safeguards"
        subtitle="Women may work night shifts where legally permitted and the applicable conditions are satisfied. NOS never applies a gender-based prohibition; it blocks only when required safeguards are missing."
      >
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.keys(SAFEGUARD_LABEL) as (keyof WomenNightWorkSafeguards)[]).map((k) => (
            <Check key={k} label={SAFEGUARD_LABEL[k]} checked={base.safeguards[k]} onChange={(v) => setSafe(k, v)} />
          ))}
        </div>
        {missing.length > 0 && (
          <p className="mt-3 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-[11px] text-foreground">
            Night assignment blocked / requires administrative resolution — missing:{" "}
            {missing.map((m) => SAFEGUARD_LABEL[m]).join(", ")}.
          </p>
        )}
      </Panel>

      <Panel
        title="Protected conditions & family support"
        subtitle="Only voluntarily disclosed, lawfully collectable information necessary for workplace accommodation is used. Roster users see only “Work restriction applies”."
      >
        <div className="grid gap-2 sm:grid-cols-2">
          <Check label="Crèche facility available" checked={base.familySupport.crecheAvailable} onChange={(v) => onChange({ ...base, familySupport: { ...base.familySupport, crecheAvailable: v } })} />
          <label className="block rounded-lg border border-border bg-background p-3">
            <span className="text-[11px] font-semibold text-foreground">Crèche operating hours</span>
            <input
              value={base.familySupport.crecheHours}
              onChange={(e) => onChange({ ...base, familySupport: { ...base.familySupport, crecheHours: e.target.value } })}
              className="mt-1 w-full rounded-md border border-border bg-card px-2 py-1 text-sm text-foreground"
            />
          </label>
          <label className="block rounded-lg border border-border bg-background p-3">
            <span className="text-[11px] font-semibold text-foreground">Eligibility</span>
            <input
              value={base.familySupport.crecheEligibility}
              onChange={(e) => onChange({ ...base, familySupport: { ...base.familySupport, crecheEligibility: e.target.value } })}
              className="mt-1 w-full rounded-md border border-border bg-card px-2 py-1 text-sm text-foreground"
            />
          </label>
          <label className="block rounded-lg border border-border bg-background p-3">
            <span className="text-[11px] font-semibold text-foreground">Shift compatibility</span>
            <input
              value={base.familySupport.shiftCompatibility}
              onChange={(e) => onChange({ ...base, familySupport: { ...base.familySupport, shiftCompatibility: e.target.value } })}
              className="mt-1 w-full rounded-md border border-border bg-card px-2 py-1 text-sm text-foreground"
            />
          </label>
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">
          NOS does not assume a facility exists. Authorised HR/occupational-health restrictions (night-duty, heavy-duty,
          temporary accommodation, maternity-related protection) are honoured by the engine without exposing the
          underlying medical information.
        </p>
      </Panel>

      <Panel title="Regulatory register" subtitle="Authoritative government and nursing-council sources only. No blogs, commercial sites or search summaries.">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-border">
                <Th>Layer</Th>
                <Th>Regulation</Th>
                <Th>Section / rule</Th>
                <Th>Authority</Th>
                <Th>Jurisdiction</Th>
                <Th>Effective</Th>
                <Th>Applicability</Th>
                <Th>Last verified</Th>
                <Th>Status</Th>
                <Th>Source</Th>
              </tr>
            </thead>
            <tbody>
              {base.rules.map((r) => (
                <tr key={r.id} className="border-b border-border/60 align-top">
                  <Td><Tag tone={RULE_KIND_TONE[r.kind]}>{RULE_KIND_LABEL[r.kind]}</Tag></Td>
                  <td className="px-2 py-1.5 text-foreground">{r.regulation}</td>
                  <td className="px-2 py-1.5 text-muted-foreground">{r.section}</td>
                  <td className="px-2 py-1.5 text-muted-foreground">{r.authority}</td>
                  <Td>{r.jurisdiction}</Td>
                  <Td>{r.effectiveDate}</Td>
                  <td className="max-w-[280px] px-2 py-1.5 text-muted-foreground">
                    {r.applicability}
                    {r.note && <em className="mt-1 block not-italic text-amber-600">{r.note}</em>}
                  </td>
                  <Td>{r.lastVerified}</Td>
                  <Td>
                    <Tag tone={r.status === "verified" ? "#0d9488" : "#d97706"}>
                      {r.status === "verified" ? "Verified" : "Pending verification"}
                    </Tag>
                  </Td>
                  <Td>
                    <a href={r.sourceUrl} target="_blank" rel="noreferrer" className="text-primary underline">
                      Open
                    </a>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3">
          <Disclaimer />
        </div>
      </Panel>
    </>
  );
}

/* ---------------------------------------------- staffing standards library */

export function StaffingStandardsPanel({
  standards,
  onStandards,
  workload,
  onWorkload,
  selectedId,
  onSelect,
}: {
  standards: StaffingStandard[];
  onStandards: (s: StaffingStandard[]) => void;
  workload: WorkloadInputs;
  onWorkload: (w: WorkloadInputs) => void;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const std = standards.find((s) => s.id === selectedId) ?? standards[0]!;
  const calc = calculateRequiredWorkforce(std, workload);

  return (
    <>
      <Panel
        title="Nursing Staffing Standards Library"
        subtitle="Example values only — configurable by institution, state, unit and accreditation requirement. Nursing standards are not labour statutes."
      >
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-border">
                <Th>Unit</Th>
                <Th>Nurse : beds</Th>
                <Th>Min senior / shift</Th>
                <Th>Authority</Th>
                <Th>Source</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {standards.map((s) => (
                <tr key={s.id} className={`border-b border-border/60 ${s.id === selectedId ? "bg-primary/5" : ""}`}>
                  <Td>
                    <button type="button" className="font-semibold text-primary underline" onClick={() => onSelect(s.id)}>
                      {s.unit}
                    </button>
                  </Td>
                  <Td>
                    1 :{" "}
                    <input
                      type="number"
                      value={s.nursePerBeds}
                      onChange={(e) => onStandards(standards.map((x) => (x.id === s.id ? { ...x, nursePerBeds: Number(e.target.value) } : x)))}
                      className="w-16 rounded-md border border-border bg-card px-1 py-0.5 tabular-nums"
                    />
                  </Td>
                  <Td>
                    <input
                      type="number"
                      value={s.minSeniorPerShift}
                      onChange={(e) => onStandards(standards.map((x) => (x.id === s.id ? { ...x, minSeniorPerShift: Number(e.target.value) } : x)))}
                      className="w-16 rounded-md border border-border bg-card px-1 py-0.5 tabular-nums"
                    />
                  </Td>
                  <Td>{s.authority}</Td>
                  <td className="max-w-[280px] px-2 py-1.5 text-muted-foreground">{s.source}</td>
                  <Td>
                    <Tag tone={s.verified ? "#0d9488" : "#d97706"}>{s.verified ? "Verified" : "Pending verification"}</Tag>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel
        title="Workload-based staffing"
        subtitle="Required Workforce = Staffing Standard + Workload/Acuity Adjustment + Skill Mix Requirement. Staffing is never derived from bed count alone."
        right={<Proto />}
      >
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {(
            [
              ["beds", "Beds"],
              ["census", "Census"],
              ["admissions", "Admissions"],
              ["discharges", "Discharges"],
              ["transfers", "Transfers"],
              ["procedures", "Procedures"],
              ["isolationPatients", "Isolation patients"],
              ["oneToOnePatients", "1:1 patients"],
              ["highDependencyPatients", "High-dependency patients"],
              ["emergencyWorkloadIndex", "Emergency workload (0–10)"],
              ["turnoverIndex", "Patient turnover (0–10)"],
            ] as [keyof WorkloadInputs, string][]
          ).map(([k, label]) => (
            <Num key={k} label={label} value={workload[k]} onChange={(v) => onWorkload({ ...workload, [k]: v })} />
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-background p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Base from standard</div>
            <div className="mt-1 text-xl font-semibold tabular-nums text-foreground">{calc.baseFromStandard}</div>
            <div className="text-[11px] text-muted-foreground">{std.unit} · 1:{std.nursePerBeds} on a census of {workload.census}</div>
          </div>
          <div className="rounded-xl border border-border bg-background p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Workload / acuity adjustment</div>
            <div className="mt-1 text-xl font-semibold tabular-nums text-foreground">+{calc.workloadAdjustment}</div>
            <div className="text-[11px] text-muted-foreground">Deployment by workload and area (DGHS Hospital Manual).</div>
          </div>
          <div className="rounded-xl border border-primary/40 bg-primary/5 p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-primary">Required per shift</div>
            <div className="mt-1 text-xl font-semibold tabular-nums text-primary">{calc.requiredPerShift}</div>
            <div className="text-[11px] text-muted-foreground">Including a skill-mix requirement of {calc.skillMixRequirement} senior nurse(s).</div>
          </div>
        </div>

        <ul className="mt-3 grid gap-1 sm:grid-cols-2">
          {calc.drivers.map((d) => (
            <li key={d.label} className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-1.5 text-[11px]">
              <span className="text-muted-foreground">{d.label}</span>
              <span className="font-semibold tabular-nums text-foreground">+{d.value}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}

/* ------------------------------------------------- compliance dashboard */

export function CompliancePanel({ report, base }: { report: ComplianceReport; base: RegulatoryBaseline }) {
  const layers: [string, ComplianceStatus, string][] = [
    ["Layer 1 — Legal compliance", report.layer1, `Configured Central${base.state !== "Central only" ? ` + ${base.state}` : ""} rules`],
    ["Layer 2 — Institutional compliance", report.layer2, "Hospital policy, SOPs and staffing establishment"],
    ["Layer 3 — Employee wellbeing", report.layer3, "Fatigue, recovery, fairness, predictability and preferences"],
  ];

  return (
    <>
      <Panel title="India Labour Compliance" subtitle="Validation against the configured regulatory and institutional rules.">
        <div className="grid gap-3 sm:grid-cols-3">
          {layers.map(([label, status, note]) => (
            <div key={label} className="rounded-xl border border-border bg-background p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-foreground">{label}</span>
                <StatusTag status={status} />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">{note}</p>
            </div>
          ))}
        </div>
        <div
          className={`mt-3 rounded-xl border p-3 text-[12px] font-semibold ${
            report.readyForApproval ? "border-teal-600/40 bg-teal-600/10 text-teal-700" : "border-destructive/40 bg-destructive/10 text-destructive"
          }`}
        >
          {report.readyForApproval
            ? "Ready for Administrative Approval — all three validation layers passed against the configured rules."
            : "Not ready for administrative approval — resolve the violations below or record an authorised override with a reason."}
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-border">
                <Th>Area</Th>
                <Th>Layer</Th>
                <Th>Status</Th>
                <Th>Basis</Th>
                <Th>Detail</Th>
                <Th>Affected</Th>
              </tr>
            </thead>
            <tbody>
              {report.checks.map((c) => (
                <tr key={c.id} className="border-b border-border/60 align-top">
                  <Td className="font-semibold">{c.area}</Td>
                  <Td>{c.layer}</Td>
                  <Td><StatusTag status={c.status} /></Td>
                  <td className="max-w-[240px] px-2 py-1.5 text-muted-foreground">{c.basis}</td>
                  <td className="max-w-[360px] px-2 py-1.5 text-foreground">{c.detail}</td>
                  <td className="max-w-[200px] px-2 py-1.5 text-muted-foreground">{c.affected.join(", ") || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3">
          <Disclaimer />
        </div>
      </Panel>

      <Panel
        title="Overtime & Excess Hours Monitor"
        subtitle="Regular hours, overtime, daily/weekly excess and estimated overtime entitlement against the configured statutory threshold."
      >
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-border">
                <Th>Nurse</Th>
                <Th>Contracted</Th>
                <Th>Scheduled</Th>
                <Th>Regular</Th>
                <Th>Overtime</Th>
                <Th>Daily excess</Th>
                <Th>Weekly excess</Th>
                <Th>Consecutive days</Th>
                <Th>Nights</Th>
                <Th>Entitlement (estimated)</Th>
                <Th>Exception status</Th>
              </tr>
            </thead>
            <tbody>
              {report.ledger.map((l) => (
                <tr key={l.nurseId} className="border-b border-border/60">
                  <Td className="font-semibold">{l.name}</Td>
                  <Td>{l.contractedHours}h</Td>
                  <Td>{l.scheduledHours}h</Td>
                  <Td>{l.regularHours}h</Td>
                  <Td className={l.overtimeHours ? "font-semibold text-amber-600" : ""}>{l.overtimeHours}h</Td>
                  <Td>{l.dailyExcessDays} day(s)</Td>
                  <Td>{l.weeklyExcessWeeks} week(s)</Td>
                  <Td>{l.consecutiveWorkdays}</Td>
                  <Td>{l.nights}</Td>
                  <td className="max-w-[260px] px-2 py-1.5 text-muted-foreground">{l.estimatedOvertimeEntitlement}</td>
                  <td className="px-2 py-1.5 text-foreground">{l.exceptionStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">
          Where overtime becomes unavoidable in an emergency, record reason, authoriser, date/time, nurse, shift, hours and
          compensation status in the audit log via an authorised override.
        </p>
      </Panel>

      <Panel title="Weekly rest, holidays and compensatory off" subtitle="Weekly holiday, compensatory holiday and weekend/holiday duty distribution.">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-border">
                <Th>Nurse</Th>
                {report.rest[0]?.weeks.map((w) => <Th key={w.label}>{w.label}</Th>)}
                <Th>Weekend duties</Th>
                <Th>Compensatory off owed</Th>
              </tr>
            </thead>
            <tbody>
              {report.rest.map((r) => (
                <tr key={r.nurseId} className="border-b border-border/60">
                  <Td className="font-semibold">{r.name}</Td>
                  {r.weeks.map((w) => (
                    <Td key={w.label} className={w.ok ? "" : "font-semibold text-destructive"}>
                      {w.offDays} off
                    </Td>
                  ))}
                  <Td>{r.weekendDuties}</Td>
                  <Td className={r.compensatoryOwed ? "font-semibold text-amber-600" : ""}>{r.compensatoryOwed}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Break compliance" subtitle="A break is not counted merely because it appears on the roster — safe relief coverage must exist where the institution requires it.">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-border">
                <Th>Shift</Th>
                <Th>Continuous work</Th>
                <Th>Required break</Th>
                <Th>Rostered break</Th>
                <Th>Relief coverage</Th>
                <Th>Status</Th>
                <Th>Note</Th>
              </tr>
            </thead>
            <tbody>
              {report.breaks.map((b) => (
                <tr key={b.shift} className="border-b border-border/60">
                  <Td className="font-semibold">{b.shift}</Td>
                  <Td>{b.continuousHours}h</Td>
                  <Td>{b.requiredBreakMinutes} min</Td>
                  <Td>{b.rosteredBreakMinutes} min</Td>
                  <Td>{b.coverageAvailable ? "Available" : "Not recorded"}</Td>
                  <Td><StatusTag status={b.status} /></Td>
                  <td className="max-w-[340px] px-2 py-1.5 text-muted-foreground">{b.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}

/* ---------------------------------------------------- wellbeing & fatigue */

export function WellbeingPanel({
  fatigue,
  experience,
  stability,
  nightRows,
}: {
  fatigue: FatigueRow[];
  experience: ExperienceRow[];
  stability: StabilityReport;
  nightRows: { name: string; nights: number; maxConsecutiveNights: number; transitions: number; recovery: string }[];
}) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <>
      <Panel
        title="Fatigue Risk Indicator"
        subtitle="A workforce scheduling risk indicator derived from the roster only. This is not a medical assessment and must not be used for disciplinary action."
        right={<Proto />}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-border">
                <Th>Nurse</Th>
                <Th>Indicator</Th>
                <Th>Score</Th>
                <Th>Consecutive duties</Th>
                <Th>Nights</Th>
                <Th>Consecutive nights</Th>
                <Th>Short recovery</Th>
                <Th>Rapid transitions</Th>
                <Th>Overtime</Th>
                <Th>Drivers</Th>
              </tr>
            </thead>
            <tbody>
              {[...fatigue].sort((a, b) => b.score - a.score).map((f) => (
                <tr key={f.nurseId} className="border-b border-border/60">
                  <Td className="font-semibold">{f.name}</Td>
                  <Td><Tag tone={CONCERN_TONE[f.concern]}>{CONCERN_LABEL[f.concern]}</Tag></Td>
                  <Td>{f.score}</Td>
                  <Td>{f.maxConsecutive}</Td>
                  <Td>{f.nights}</Td>
                  <Td>{f.maxConsecutiveNights}</Td>
                  <Td>{f.shortRecoveries}</Td>
                  <Td>{f.rapidTransitions}</Td>
                  <Td>{f.overtimeHours}h</Td>
                  <td className="max-w-[300px] px-2 py-1.5 text-muted-foreground">{f.drivers.join(" · ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel
        title="Night Duty Safety Module"
        subtitle="Preferred pattern: stable shift pattern → adequate recovery → transition. Night → early morning → night and night → day → night are avoided unless operationally necessary."
      >
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-border">
                <Th>Nurse</Th>
                <Th>Night shifts</Th>
                <Th>Consecutive nights</Th>
                <Th>Transitions</Th>
                <Th>Recovery assessment</Th>
              </tr>
            </thead>
            <tbody>
              {nightRows.map((r) => (
                <tr key={r.name} className="border-b border-border/60">
                  <Td className="font-semibold">{r.name}</Td>
                  <Td>{r.nights}</Td>
                  <Td>{r.maxConsecutiveNights}</Td>
                  <Td>{r.transitions}</Td>
                  <td className="px-2 py-1.5 text-muted-foreground">{r.recovery}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Schedule Stability Score" subtitle="Predictability: publication lead time and post-publication changes.">
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-border bg-background p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Stability score</div>
            <div className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{stability.score}/100</div>
          </div>
          <div className="rounded-xl border border-border bg-background p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Publication lead time</div>
            <div className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{stability.leadDays}d</div>
          </div>
          <div className="rounded-xl border border-border bg-background p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Roster changes</div>
            <div className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{stability.input.totalChanges}</div>
            <div className="text-[11px] text-muted-foreground">
              {stability.input.nurseRequestedChanges} nurse-requested · {stability.input.managementChanges} management ·{" "}
              {stability.input.emergencyChanges} emergency
            </div>
          </div>
          <div className="rounded-xl border border-border bg-background p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Changes after publication</div>
            <div className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{stability.input.lastMinuteChanges}</div>
          </div>
        </div>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-[11px] text-muted-foreground">
          {stability.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </Panel>

      <Panel
        title="Employee Schedule Experience Score"
        subtitle="An optimisation tool for nursing administration. It is never used for performance management or disciplinary action."
        right={<Proto />}
      >
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {[...experience].sort((a, b) => a.score - b.score).map((e) => (
            <div key={e.nurseId} className="rounded-xl border border-border bg-background p-3">
              <button type="button" className="flex w-full items-center justify-between gap-2 text-left" onClick={() => setOpen(open === e.nurseId ? null : e.nurseId)}>
                <span className="text-[12px] font-semibold text-foreground">{e.name}</span>
                <span
                  className="text-sm font-semibold tabular-nums"
                  style={{ color: e.score >= 80 ? "#0d9488" : e.score >= 60 ? "#d97706" : "#dc2626" }}
                >
                  {e.score}/100
                </span>
              </button>
              {open === e.nurseId && (
                <ul className="mt-2 space-y-1">
                  {e.components.map((c) => (
                    <li key={c.label} className="text-[11px]">
                      <span className="flex items-center justify-between">
                        <span className="text-foreground">{c.label}</span>
                        <span className="tabular-nums text-muted-foreground">{Math.round(c.score)}</span>
                      </span>
                      <span className="block text-muted-foreground">{c.note}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}

/* ------------------------------------------------------ fairness dashboard */

export function FairnessPanel({ rows, dimensions }: { rows: FairnessRow[]; dimensions: FairnessDimension[] }) {
  const tone = (v: FairnessDimension["verdict"]) => (v === "Fair" ? "#0d9488" : v === "Moderate imbalance" ? "#d97706" : "#dc2626");
  return (
    <>
      <Panel title="Fairness Dashboard" subtitle="Compared against the department average, using workload-weighted load rather than raw duty counts.">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {dimensions.map((d) => (
            <div key={d.key} className="rounded-xl border border-border bg-background p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[12px] font-semibold text-foreground">{d.label}</span>
                <Tag tone={tone(d.verdict)}>{d.verdict}</Tag>
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">
                Department average {d.average} · spread {d.spread}
              </div>
              {d.outliers.length > 0 && (
                <div className="mt-1 text-[11px] text-muted-foreground">
                  Above average: {d.outliers.map((o) => `${o.name} (${o.value})`).join(", ")}
                </div>
              )}
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Per-nurse distribution" subtitle="Total shifts, hours, nights, weekends, holidays, difficult assignments, overtime and emergency coverage.">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-border">
                <Th>Nurse</Th>
                <Th>Shifts</Th>
                <Th>Hours</Th>
                <Th>Nights</Th>
                <Th>Weekends</Th>
                <Th>Holidays</Th>
                <Th>Difficult</Th>
                <Th>Overtime</Th>
                <Th>Emergency cover</Th>
                <Th>Consecutive</Th>
                <Th>Weighted load</Th>
                <Th>vs department average</Th>
              </tr>
            </thead>
            <tbody>
              {[...rows].sort((a, b) => b.vsAverage - a.vsAverage).map((r) => (
                <tr key={r.nurseId} className="border-b border-border/60">
                  <Td className="font-semibold">{r.name}</Td>
                  <Td>{r.shifts}</Td>
                  <Td>{r.hours}h</Td>
                  <Td>{r.nights}</Td>
                  <Td>{r.weekends}</Td>
                  <Td>{r.holidays}</Td>
                  <Td>{r.difficult}</Td>
                  <Td>{r.overtime}h</Td>
                  <Td>{r.emergencyCover}</Td>
                  <Td>{r.maxConsecutive}</Td>
                  <Td>{r.weightedLoad}</Td>
                  <Td
                    className="font-semibold"
                    style={{ color: Math.abs(r.vsAverage) > 20 ? "#dc2626" : Math.abs(r.vsAverage) > 10 ? "#d97706" : "#0d9488" }}
                  >
                    {r.vsAverage >= 0 ? "+" : ""}
                    {r.vsAverage}%
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}

/* ------------------------------------------------------------ my schedule */

const KINDS: RequestKind[] = [
  "preferred_duty",
  "preferred_off",
  "leave",
  "preferred_shift_type",
  "cannot_work",
  "preferred_department",
];

export function MySchedulePanel({
  nurses,
  roster,
  policy,
  requests,
  fatigue,
  experience,
  onSubmit,
}: {
  nurses: NurseProfile[];
  roster: Roster | null;
  policy: SchedulingPolicy;
  requests: DutyRequest[];
  fatigue: FatigueRow[];
  experience: ExperienceRow[];
  onSubmit: (r: DutyRequest) => void;
}) {
  const [nurseId, setNurseId] = useState(nurses[0]?.id ?? "");
  const [kind, setKind] = useState<RequestKind>("preferred_off");
  const [date, setDate] = useState(roster?.dates[0] ?? "");
  const [reason, setReason] = useState("");

  const nurse = nurses.find((n) => n.id === nurseId) ?? nurses[0];
  const row = nurse && roster ? (roster.cells[nurse.id] ?? {}) : {};
  const mine = requests.filter((r) => r.nurseId === nurse?.id);
  const f = fatigue.find((x) => x.nurseId === nurse?.id);
  const x = experience.find((e) => e.nurseId === nurse?.id);

  const counts = useMemo(() => {
    if (!roster) return { duties: 0, hours: 0, nights: 0, off: 0, leave: 0 };
    const dates = roster.dates;
    return {
      duties: dates.filter((d) => isWorking(policy, row[d] ?? "")).length,
      hours: roster.summaries.find((s) => s.nurseId === nurse?.id)?.totalHours ?? 0,
      nights: dates.filter((d) => isNight(policy, row[d] ?? "")).length,
      off: dates.filter((d) => ["OFF", "WO"].includes(row[d] ?? "")).length,
      leave: dates.filter((d) => ["AL", "SL"].includes(row[d] ?? "")).length,
    };
  }, [roster, row, policy, nurse?.id]);

  const declineReason = (r: DutyRequest) => {
    const cov = roster?.coverage.find((c) => c.date === r.date);
    return declineExplanation({
      nurseName: nurse?.name ?? "",
      date: r.date ?? "the requested date",
      kind: REQUEST_KIND_LABEL[r.kind].toLowerCase(),
      unit: roster?.unit ?? "the unit",
      minRequired: cov?.required ?? 0,
      scheduled: cov?.scheduled ?? 0,
    });
  };

  return (
    <>
      <Panel
        title="My Schedule"
        subtitle="Each nurse sees their own roster, requests and outcomes. Manager approval is always required — AI never decides a request."
        right={
          <select value={nurseId} onChange={(e) => setNurseId(e.target.value)} className="rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground">
            {nurses.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name}
              </option>
            ))}
          </select>
        }
      >
        {!roster ? (
          <p className="text-sm text-muted-foreground">No roster has been generated for this period yet.</p>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {[
                ["Duties", counts.duties],
                ["Scheduled hours", `${counts.hours}h`],
                ["Night duties", counts.nights],
                ["OFF days", counts.off],
                ["Leave days", counts.leave],
                ["Experience score", x ? `${x.score}/100` : "—"],
              ].map(([l, v]) => (
                <div key={String(l)} className="rounded-xl border border-border bg-background p-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{l}</div>
                  <div className="mt-1 text-lg font-semibold tabular-nums text-foreground">{v}</div>
                </div>
              ))}
            </div>

            {nurse?.workRestriction && (
              <p className="mt-3 rounded-xl border border-border bg-muted/40 p-3 text-[11px] text-foreground">
                Work restriction applies. Details are held by HR / occupational health and are not shown on the roster.
              </p>
            )}
            {f && (
              <p className="mt-3 text-[11px]">
                Fatigue indicator: <Tag tone={CONCERN_TONE[f.concern]}>{CONCERN_LABEL[f.concern]}</Tag>{" "}
                <span className="text-muted-foreground">{f.drivers.join(" · ")}</span>
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-1">
              {roster.dates.map((d) => {
                const c = row[d] ?? "";
                const working = isWorking(policy, c);
                return (
                  <div
                    key={d}
                    className={`w-[52px] rounded-lg border p-1 text-center text-[10px] ${
                      working ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground"
                    }`}
                  >
                    <div className="tabular-nums">{d.slice(8)}</div>
                    <div className="font-semibold">{c || "—"}</div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Panel>

      <Panel title="My requests" subtitle="Every declined request carries an operational explanation. NOS never says “AI rejected your request”.">
        <div className="space-y-2">
          {mine.length === 0 && <p className="text-[12px] text-muted-foreground">No requests submitted for this period.</p>}
          {mine.map((r) => (
            <div key={r.id} className="rounded-xl border border-border bg-background p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[12px] font-semibold text-foreground">
                  {REQUEST_KIND_LABEL[r.kind]} · {r.date ?? "—"}
                  {r.dateTo ? ` → ${r.dateTo}` : ""}
                </span>
                <Tag tone={r.status === "approved" ? "#0d9488" : r.status === "declined" ? "#dc2626" : "#0891b2"}>{r.status}</Tag>
              </div>
              {r.reason && <p className="mt-1 text-[11px] text-muted-foreground">Reason given: {r.reason}</p>}
              <p className="mt-1 text-[11px] text-muted-foreground">
                {r.status === "declined" ? declineReason(r) : (r.outcome ?? "Awaiting nursing administration review.")}
              </p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Request a change" subtitle="Shift swap, OFF, leave, preference, cannot-work or emergency request. Manager approval remains required.">
        <div className="grid gap-2 sm:grid-cols-4">
          <label className="block rounded-lg border border-border bg-background p-3">
            <span className="text-[11px] font-semibold text-foreground">Request type</span>
            <select value={kind} onChange={(e) => setKind(e.target.value as RequestKind)} className="mt-1 w-full rounded-md border border-border bg-card px-2 py-1 text-sm text-foreground">
              {KINDS.map((k) => (
                <option key={k} value={k}>
                  {REQUEST_KIND_LABEL[k]}
                </option>
              ))}
            </select>
          </label>
          <label className="block rounded-lg border border-border bg-background p-3">
            <span className="text-[11px] font-semibold text-foreground">Date</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 w-full rounded-md border border-border bg-card px-2 py-1 text-sm text-foreground" />
          </label>
          <label className="block rounded-lg border border-border bg-background p-3 sm:col-span-2">
            <span className="text-[11px] font-semibold text-foreground">Reason (optional)</span>
            <input value={reason} onChange={(e) => setReason(e.target.value)} className="mt-1 w-full rounded-md border border-border bg-card px-2 py-1 text-sm text-foreground" placeholder="Family commitment, education, transport, religious observance…" />
          </label>
        </div>
        <button
          type="button"
          className="mt-3 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
          onClick={() => {
            if (!nurse || !date) return;
            onSubmit({
              id: `req-${Date.now()}`,
              nurseId: nurse.id,
              kind,
              date,
              reason: reason || undefined,
              status: "submitted",
              submittedAt: new Date().toISOString().slice(0, 10),
            });
            setReason("");
          }}
        >
          Submit request for approval
        </button>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Preferences are considered, never guaranteed. Patient safety, legal compliance, institutional requirements,
          skill mix, minimum safe staffing and recovery protection rank above preference.
        </p>
      </Panel>
    </>
  );
}

/* -------------------------------------------------------- version record */

export function VersionRecord({
  base,
  policy,
  roster,
  standardsVersion,
  engineVersion,
  approver,
}: {
  base: RegulatoryBaseline;
  policy: SchedulingPolicy;
  roster: Roster | null;
  standardsVersion: string;
  engineVersion: string;
  approver?: string;
}) {
  const rows: [string, string][] = [
    ["Regulatory framework", `India baseline · ${base.jurisdictionLevel} · ${base.rules.length} recorded rules`],
    ["State", base.state],
    ["Institution", policy.institution],
    ["Policy version", `${policy.name} · ${policy.version} · effective ${policy.effectiveFrom}`],
    ["Nursing staffing standard version", standardsVersion],
    ["AI engine version", engineVersion],
    ["Date generated", roster?.generatedAt ?? "—"],
    ["Date approved", roster?.status === "approved" || roster?.status === "published" ? new Date().toISOString().slice(0, 10) : "—"],
    ["Approver", approver ?? "—"],
  ];
  return (
    <Panel title="Version control record" subtitle="Six months later, the institution can answer: which rules and policies were used to create this roster?">
      <dl className="grid gap-2 sm:grid-cols-2">
        {rows.map(([k, v]) => (
          <div key={k} className="rounded-lg border border-border bg-background px-3 py-2">
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{k}</dt>
            <dd className="text-[12px] text-foreground">{v}</dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}
