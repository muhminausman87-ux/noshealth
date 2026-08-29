import { useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  Clock3,
  Download,
  History,
  Info,
  Layers,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import type {
  StaffingStandard,
  StandardStatus,
  SourceType,
} from "@/lib/scheduling/staffing-standards";

const STATUS_META: Record<StandardStatus, { label: string; className: string }> = {
  pending: { label: "Pending verification", className: "border-warning/40 bg-warning/10 text-warning-foreground" },
  active: { label: "Active", className: "border-success/40 bg-success/10 text-success" },
  draft: { label: "Draft", className: "border-border bg-muted text-muted-foreground" },
  expired: { label: "Expired", className: "border-destructive/35 bg-destructive/10 text-destructive" },
  review: { label: "Requires review", className: "border-primary/35 bg-primary/10 text-primary" },
};

const SOURCE_TYPES: SourceType[] = [
  "Institution Policy",
  "Regulatory Reference",
  "Accreditation Requirement",
  "Evidence Reference",
  "Local Configuration",
  "Pending Verification",
];

const SHIFTS = ["Day shift", "Night shift"];

function statusOf(s: StaffingStandard): StandardStatus {
  return s.status ?? (s.verified ? "active" : "pending");
}

function StatusBadge({ status }: { status: StandardStatus }) {
  const m = STATUS_META[status];
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${m.className}`}>
      {m.label}
    </span>
  );
}

function SummaryCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: typeof Layers;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card,0_1px_2px_rgba(0,0,0,0.04))]">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-foreground">{value}</div>
      <div className="mt-0.5 text-[11px] text-muted-foreground">{hint}</div>
    </div>
  );
}

function GhostButton({
  children,
  icon: Icon,
}: {
  children: React.ReactNode;
  icon: typeof Plus;
}) {
  return (
    <button
      type="button"
      title="Prototype action — not yet connected"
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {children}
    </button>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 py-2.5 last:border-b-0">
      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="max-w-[60%] text-right text-xs text-foreground">{value}</span>
    </div>
  );
}

export function StaffingStandardsLibrary({
  standards,
  onStandards,
  selectedId,
  onSelect,
}: {
  standards: StaffingStandard[];
  onStandards: (s: StaffingStandard[]) => void;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | StandardStatus>("all");
  const [sourceType, setSourceType] = useState<"all" | SourceType>("all");
  const [shift, setShift] = useState<"all" | string>("all");
  const [sort, setSort] = useState<"unit" | "status" | "reviewed">("unit");
  const [drawerId, setDrawerId] = useState<string | null>(null);

  const pending = standards.filter((s) => statusOf(s) === "pending").length;
  const active = standards.filter((s) => statusOf(s) === "active").length;
  const lastReviewed = standards.map((s) => s.lastReviewed).filter(Boolean).sort().pop();

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = standards.filter((s) => {
      if (q && !s.unit.toLowerCase().includes(q) && !s.source.toLowerCase().includes(q)) return false;
      if (status !== "all" && statusOf(s) !== status) return false;
      if (sourceType !== "all" && (s.sourceType ?? "Pending Verification") !== sourceType) return false;
      if (shift !== "all" && !(s.appliesTo ?? SHIFTS).includes(shift)) return false;
      return true;
    });
    return [...filtered].sort((a, b) => {
      if (sort === "status") return statusOf(a).localeCompare(statusOf(b)) || a.unit.localeCompare(b.unit);
      if (sort === "reviewed") return (a.lastReviewed ?? "").localeCompare(b.lastReviewed ?? "");
      return a.unit.localeCompare(b.unit);
    });
  }, [standards, query, status, sourceType, shift, sort]);

  const drawer = standards.find((s) => s.id === drawerId) ?? null;

  const openDrawer = (id: string) => {
    onSelect(id);
    setDrawerId(id);
  };

  const selectCls =
    "rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <div className="space-y-5">
      {/* header */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
              Workforce Operations · Reference layer
              <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[9px] tracking-wider text-muted-foreground">
                Demo configuration
              </span>
            </div>
            <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-foreground">Nursing Staffing Standards</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Configure the staffing rules used by NOS to estimate nursing capacity requirements across units.
            </p>
            <p className="mt-2 flex items-start gap-1.5 rounded-lg border border-border bg-muted/50 px-3 py-2 text-[11px] text-muted-foreground">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
              Staffing rules are institution-specific and may vary by jurisdiction, accreditation requirements, patient
              acuity, service model, and approved hospital policy. Example values only — configurable by authorized
              institution administrators.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              title="Prototype action — not yet connected"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Add Staffing Standard
            </button>
            <GhostButton icon={Download}>Import Standards</GhostButton>
            <GhostButton icon={History}>View Change History</GhostButton>
          </div>
        </div>
      </section>

      {/* summary */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Configured Units" value={String(standards.length)} hint="Units with a staffing rule" icon={Layers} />
        <SummaryCard label="Active Standards" value={String(active)} hint="Approved for operational use" icon={ShieldCheck} />
        <SummaryCard label="Pending Verification" value={String(pending)} hint="Awaiting authorized review" icon={ClipboardCheck} />
        <SummaryCard label="Last Reviewed" value={lastReviewed ?? "Not reviewed"} hint="Most recent governance review" icon={Clock3} />
      </div>

      {/* toolbar + table */}
      <section className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search units..."
              aria-label="Search units"
              className="w-full rounded-lg border border-border bg-background py-1.5 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className={selectCls}>
            <option value="all">All statuses</option>
            {(Object.keys(STATUS_META) as StandardStatus[]).map((s) => (
              <option key={s} value={s}>{STATUS_META[s].label}</option>
            ))}
          </select>
          <select aria-label="Source type" value={sourceType} onChange={(e) => setSourceType(e.target.value as typeof sourceType)} className={selectCls}>
            <option value="all">All source types</option>
            {SOURCE_TYPES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select aria-label="Shift" value={shift} onChange={(e) => setShift(e.target.value)} className={selectCls}>
            <option value="all">All shifts</option>
            {SHIFTS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select aria-label="Sort by" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className={selectCls}>
            <option value="unit">Sort: Unit</option>
            <option value="status">Sort: Status</option>
            <option value="reviewed">Sort: Last reviewed</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left">
                {["Unit", "Nurse : Patient / Bed", "Senior Coverage", "Source Type", "Source / Reference", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr
                  key={s.id}
                  className={`border-b border-border/60 transition-colors last:border-b-0 hover:bg-muted/40 ${s.id === selectedId ? "bg-primary/5" : ""}`}
                >
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => openDrawer(s.id)} className="font-semibold text-foreground hover:text-primary">
                      {s.unit}
                    </button>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-foreground">
                    1 :{" "}
                    <input
                      aria-label={`${s.unit} nurse to bed ratio`}
                      type="number"
                      min={0.5}
                      step={0.5}
                      value={s.nursePerBeds}
                      onChange={(e) =>
                        onStandards(standards.map((x) => (x.id === s.id ? { ...x, nursePerBeds: Number(e.target.value) } : x)))
                      }
                      className="w-16 rounded-md border border-border bg-background px-1.5 py-0.5 tabular-nums"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      aria-label={`${s.unit} senior coverage`}
                      type="number"
                      min={0}
                      value={s.minSeniorPerShift}
                      onChange={(e) =>
                        onStandards(standards.map((x) => (x.id === s.id ? { ...x, minSeniorPerShift: Number(e.target.value) } : x)))
                      }
                      className="w-16 rounded-md border border-border bg-background px-1.5 py-0.5 tabular-nums"
                    />
                    <span className="ml-1 text-[11px] text-muted-foreground">/ shift</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{s.sourceType ?? "Pending Verification"}</td>
                  <td className="max-w-[260px] px-4 py-3 text-muted-foreground">{s.source}</td>
                  <td className="px-4 py-3"><StatusBadge status={statusOf(s)} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <button type="button" onClick={() => openDrawer(s.id)} className="rounded-md px-1.5 py-0.5 font-medium text-primary hover:bg-primary/10">
                        View
                      </button>
                      <button type="button" onClick={() => openDrawer(s.id)} className="rounded-md px-1.5 py-0.5 text-muted-foreground hover:bg-muted">
                        Edit
                      </button>
                      <button type="button" onClick={() => openDrawer(s.id)} className="rounded-md px-1.5 py-0.5 text-muted-foreground hover:bg-muted">
                        Review
                      </button>
                      <button type="button" onClick={() => openDrawer(s.id)} className="rounded-md px-1.5 py-0.5 text-muted-foreground hover:bg-muted">
                        History
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-xs text-muted-foreground">
                    No staffing standards match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* how it connects */}
      <section className="rounded-2xl border border-border bg-muted/30 p-5">
        <h3 className="text-sm font-semibold tracking-tight text-foreground">How this supports Workforce Intelligence</h3>
        <ol className="mt-3 flex flex-wrap items-stretch gap-2">
          {[
            "Define the staffing requirement",
            "Compare requirement with available nursing capacity",
            "Identify potential staffing imbalance",
            "Support operational review",
            "Escalate according to institutional policy",
          ].map((step, i, arr) => (
            <li key={step} className="flex items-center gap-2">
              <div className="flex min-w-[170px] max-w-[210px] items-start gap-2 rounded-xl border border-border bg-card px-3 py-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                  {i + 1}
                </span>
                <span className="text-[11px] leading-snug text-foreground">{step}</span>
              </div>
              {i < arr.length - 1 && <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />}
            </li>
          ))}
        </ol>
        <p className="mt-3 text-[11px] text-muted-foreground">
          NOS supports operational decision-making. Staffing rules remain institution-configured and require authorized
          governance.
        </p>
      </section>

      {/* drawer */}
      {drawer && (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={`${drawer.unit} staffing standard`}>
          <button type="button" aria-label="Close details" className="flex-1 bg-foreground/25 backdrop-blur-[1px]" onClick={() => setDrawerId(null)} />
          <aside className="h-full w-full max-w-md overflow-y-auto border-l border-border bg-card p-5 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">Staffing standard</div>
                <h3 className="mt-1 text-lg font-semibold tracking-tight text-foreground">{drawer.unit} Staffing Standard</h3>
              </div>
              <button type="button" onClick={() => setDrawerId(null)} aria-label="Close" className="rounded-md p-1 text-muted-foreground hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4">
              <div className="mt-1 divide-y divide-border/60">
                <DetailRow label="Status" value={<StatusBadge status={statusOf(drawer)} />} />
                <DetailRow label="Staffing ratio" value={`1 nurse : ${drawer.nursePerBeds} patient(s)`} />
                <DetailRow label="Senior coverage" value={`${drawer.minSeniorPerShift} nurse(s) / shift`} />
                <DetailRow label="Source type" value={drawer.sourceType ?? "Pending Verification"} />
                <DetailRow label="Source" value={drawer.source} />
                <DetailRow label="Applies to" value={(drawer.appliesTo ?? SHIFTS).join(" · ")} />
                <DetailRow label="Effective date" value={drawer.effectiveFrom ?? "Not configured"} />
                <DetailRow label="Last reviewed" value={drawer.lastReviewed ?? "Not reviewed"} />
                <DetailRow label="Approved by" value={drawer.approvedBy ?? "Not configured"} />
                <DetailRow label="Review status" value={STATUS_META[statusOf(drawer)].label} />
              </div>
            </div>

            <p className="mt-4 flex items-start gap-1.5 rounded-lg border border-warning/35 bg-warning/10 px-3 py-2 text-[11px] text-warning-foreground">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              This configuration can influence workforce capacity calculations. Verify and approve the source before
              activating it for operational use.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setDrawerId(null)}
                className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
              >
                Close
              </button>
              <GhostButton icon={Pencil}>Edit Standard</GhostButton>
              <button
                type="button"
                title="Prototype action — not yet connected"
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
              >
                <ClipboardCheck className="h-3.5 w-3.5" aria-hidden="true" /> Review / Verify
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
