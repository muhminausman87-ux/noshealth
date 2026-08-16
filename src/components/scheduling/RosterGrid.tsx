import { useState } from "react";
import type { NurseProfile, Roster, SchedulingPolicy, ValidationResult } from "@/lib/scheduling/types";
import { dayNum, isWeekend, validateChange } from "@/lib/scheduling/engine";

const CODE_TONE: Record<string, string> = {
  M: "#0ea5e9",
  E: "#7c3aed",
  N: "#1e293b",
  D: "#0d9488",
  OC: "#d97706",
  OFF: "#94a3b8",
  WO: "#94a3b8",
  AL: "#16a34a",
  SL: "#dc2626",
};

export function CodeChip({ code }: { code: string }) {
  const tone = CODE_TONE[code] ?? "var(--color-muted-foreground)";
  return (
    <span
      className="inline-flex min-w-7 items-center justify-center rounded px-1 py-0.5 text-[10px] font-semibold"
      style={{ background: `color-mix(in oklab, ${tone} 16%, transparent)`, color: tone }}
    >
      {code}
    </span>
  );
}

interface Props {
  roster: Roster;
  policy: SchedulingPolicy;
  nurses: NurseProfile[];
  canEdit: boolean;
  onChange: (nurseId: string, date: string, code: string, override?: string) => void;
}

export function RosterGrid({ roster, policy, nurses, canEdit, onChange }: Props) {
  const [sel, setSel] = useState<{ nurseId: string; date: string } | null>(null);
  const [pending, setPending] = useState<{ code: string; result: ValidationResult } | null>(null);
  const [overrideReason, setOverrideReason] = useState("");

  const nurse = sel ? nurses.find((n) => n.id === sel.nurseId) : null;
  const summary = (id: string) => roster.summaries.find((s) => s.nurseId === id);

  const tryCode = (code: string) => {
    if (!sel) return;
    const result = validateChange(roster, policy, nurses, sel.nurseId, sel.date, code);
    setPending({ code, result });
  };

  const apply = (override?: string) => {
    if (!sel || !pending) return;
    onChange(sel.nurseId, sel.date, pending.code, override);
    setPending(null);
    setOverrideReason("");
    setSel(null);
  };

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="min-w-full border-collapse text-[11px]">
          <thead>
            <tr className="bg-muted/60">
              <th className="sticky left-0 z-10 min-w-44 border-b border-border bg-muted/90 px-2 py-2 text-left font-semibold text-foreground">
                Nurse
              </th>
              {roster.dates.map((d) => (
                <th
                  key={d}
                  className={`border-b border-l border-border px-1 py-2 text-center font-semibold tabular-nums ${
                    isWeekend(d) ? "bg-muted text-primary" : "text-muted-foreground"
                  }`}
                >
                  {dayNum(d)}
                </th>
              ))}
              {["Hrs", "N", "OFF"].map((h) => (
                <th key={h} className="border-b border-l border-border px-2 py-2 text-center font-semibold text-muted-foreground">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {roster.nurseIds.map((id) => {
              const n = nurses.find((x) => x.id === id);
              const s = summary(id);
              return (
                <tr key={id} className="hover:bg-muted/30">
                  <th className="sticky left-0 z-10 border-b border-border bg-card px-2 py-1 text-left font-medium">
                    <div className="text-foreground">{n?.name}</div>
                    <div className="text-[10px] font-normal text-muted-foreground">{n?.designation}</div>
                  </th>
                  {roster.dates.map((d) => {
                    const code = roster.cells[id]?.[d] ?? "";
                    const active = sel?.nurseId === id && sel.date === d;
                    return (
                      <td
                        key={d}
                        className={`border-b border-l border-border p-0.5 text-center ${isWeekend(d) ? "bg-muted/40" : ""} ${
                          active ? "outline outline-2 outline-primary" : ""
                        }`}
                      >
                        <button
                          type="button"
                          disabled={!canEdit}
                          onClick={() => {
                            setSel({ nurseId: id, date: d });
                            setPending(null);
                          }}
                          className="w-full disabled:cursor-default"
                          aria-label={`${n?.name} ${d} ${code}`}
                        >
                          <CodeChip code={code} />
                        </button>
                      </td>
                    );
                  })}
                  <td className="border-b border-l border-border px-2 text-center tabular-nums text-foreground">{s?.totalHours}</td>
                  <td className="border-b border-l border-border px-2 text-center tabular-nums text-foreground">{s?.nights}</td>
                  <td className="border-b border-l border-border px-2 text-center tabular-nums text-muted-foreground">{s?.offDays}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
        <span className="font-semibold uppercase tracking-wider">Shift codes</span>
        {policy.shiftTypes.map((s) => (
          <span key={s.code} className="inline-flex items-center gap-1">
            <CodeChip code={s.code} /> {s.label}
            {s.kind === "working" && <span className="tabular-nums">({s.start}–{s.end})</span>}
          </span>
        ))}
      </div>

      {sel && nurse && (
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-sm font-semibold text-foreground">
                {nurse.name} · {sel.date}
              </div>
              <div className="text-[11px] text-muted-foreground">
                Currently {roster.cells[sel.nurseId]?.[sel.date] ?? "—"} · every change is validated against{" "}
                {policy.name} {policy.version} before it is applied.
              </div>
            </div>
            <button type="button" onClick={() => { setSel(null); setPending(null); }} className="text-[11px] text-muted-foreground underline">
              Close
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {policy.shiftTypes.map((s) => (
              <button
                key={s.code}
                type="button"
                onClick={() => tryCode(s.code)}
                className={`rounded-lg border px-2.5 py-1 text-xs font-medium ${
                  pending?.code === s.code ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:bg-muted"
                }`}
              >
                {s.code} · {s.label}
              </button>
            ))}
          </div>

          {pending && (
            <div
              className="mt-3 rounded-lg border p-3 text-xs"
              style={{
                borderColor:
                  pending.result.level === "blocked" ? "#dc2626" : pending.result.level === "warning" ? "#d97706" : "var(--color-border)",
              }}
            >
              <ul className="space-y-1">
                {pending.result.messages.map((m) => (
                  <li key={m} className="text-foreground">{m}</li>
                ))}
              </ul>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {pending.result.level !== "blocked" && (
                  <button
                    type="button"
                    onClick={() => apply()}
                    className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                  >
                    Apply change
                  </button>
                )}
                {pending.result.level === "blocked" && policy.emergencyOverrideAllowed && (
                  <>
                    <input
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      placeholder="Reason for authorised override (recorded in the audit log)"
                      className="min-w-72 flex-1 rounded-lg border border-border bg-background px-2 py-1.5 text-xs"
                    />
                    <button
                      type="button"
                      disabled={overrideReason.trim().length < 5}
                      onClick={() => apply(overrideReason.trim())}
                      className="rounded-lg border border-destructive px-3 py-1.5 text-xs font-semibold text-destructive disabled:opacity-40"
                    >
                      Override with authorisation
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
