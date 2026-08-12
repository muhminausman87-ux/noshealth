import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  BedDouble,
  ClipboardList,
  ShieldAlert,
  UserRound,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@/lib/auth";
import { getDept, type Department } from "@/lib/departments";

type AssignedPatient = {
  assignmentId: string;
  careRole: string;
  shift: string;
  patient: {
    id: string;
    full_name: string;
    mrn: string;
    room: string | null;
    dept: Department;
    status: "stable" | "watch" | "critical";
    short_note: string | null;
    reason_for_admission: string;
  };
};

type Policy = { code: string; title: string; summary: string | null };

const STATUS_TONE: Record<string, { label: string; color: string }> = {
  critical: { label: "Needs me now", color: "var(--color-destructive)" },
  watch: { label: "Watch closely", color: "var(--color-warning)" },
  stable: { label: "Stable", color: "var(--color-success)" },
};

/**
 * Responsibility-first home screen for bedside clinicians.
 * Shows only the patients this employee is assigned to, inside their own
 * institution. Assignments and patient rows are both tenant-isolated in the
 * database — this component never widens that boundary.
 */
export function MyResponsibility({ session }: { session: Session }) {
  const [rows, setRows] = useState<AssignedPatient[] | null>(null);
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        if (!cancelled) setRows([]);
        return;
      }
      const [{ data, error: aErr }, { data: pol }] = await Promise.all([
        supabase
          .from("patient_assignments")
          .select(
            "id, care_role, shift, patients(id, full_name, mrn, room, dept, status, short_note, reason_for_admission)",
          )
          .eq("employee_id", user.user.id)
          .eq("active", true),
        supabase
          .from("institution_policies")
          .select("code, title, summary")
          .eq("kind", "escalation")
          .eq("active", true)
          .limit(1)
          .maybeSingle(),
      ]);
      if (cancelled) return;
      if (aErr) setError(aErr.message);
      setPolicy(pol ?? null);
      setRows(
        (data ?? [])
          .filter((r) => r.patients)
          .map((r) => ({
            assignmentId: r.id,
            careRole: r.care_role,
            shift: r.shift,
            patient: r.patients as unknown as AssignedPatient["patient"],
          })),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const priority = (rows ?? []).slice().sort((a, b) => {
    const rank = { critical: 0, watch: 1, stable: 2 } as const;
    return rank[a.patient.status] - rank[b.patient.status];
  });
  const needsAttention = priority.filter((p) => p.patient.status !== "stable").length;

  return (
    <section className="mb-8 space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {session.institutionName ?? "Your institution"}
            {session.assignedDept ? ` · ${getDept(session.assignedDept).name}` : ""}
          </div>
          <h2 className="mt-0.5 text-xl font-semibold tracking-tight text-foreground">
            My responsibility right now
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Patients currently assigned to you. Everything else stays one click away.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs">
          <UserRound className="h-4 w-4 text-primary" />
          <span className="font-semibold text-foreground">{rows?.length ?? "—"}</span>
          <span className="text-muted-foreground">assigned</span>
          <span className="mx-1 h-3 w-px bg-border" />
          <AlertTriangle className="h-4 w-4 text-warning" />
          <span className="font-semibold text-foreground">{needsAttention}</span>
          <span className="text-muted-foreground">need attention</span>
        </div>
      </header>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Could not load your assignments: {error}
        </div>
      )}

      {rows === null && (
        <div className="rounded-2xl border border-border bg-card px-4 py-6 text-sm text-muted-foreground">
          Loading your assignments…
        </div>
      )}

      {rows !== null && rows.length === 0 && !error && (
        <div className="rounded-2xl border border-dashed border-border bg-card/60 px-4 py-6">
          <div className="flex items-start gap-3">
            <BedDouble className="mt-0.5 h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-sm font-semibold text-foreground">No active assignments</div>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                Your charge nurse or nursing administration assigns patients for each shift. Once an
                assignment exists for you in this institution, the patients appear here first —
                before any dashboard.
              </p>
            </div>
          </div>
        </div>
      )}

      {priority.length > 0 && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {priority.map(({ assignmentId, careRole, shift, patient }) => {
            const tone = STATUS_TONE[patient.status] ?? STATUS_TONE.stable;
            return (
              <Link
                key={assignmentId}
                to="/patient/$patientId"
                params={{ patientId: patient.id }}
                className="group rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-foreground">
                      {patient.full_name}
                    </div>
                    <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
                      {patient.room ? `${patient.room} · ` : ""}MRN {patient.mrn} ·{" "}
                      {getDept(patient.dept).short}
                    </div>
                  </div>
                  <span
                    className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                    style={{
                      background: `color-mix(in oklab, ${tone.color} 15%, transparent)`,
                      color: tone.color,
                    }}
                  >
                    {tone.label}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                  {patient.short_note || patient.reason_for_admission}
                </p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="capitalize">
                    {careRole.replace(/_/g, " ")} · {shift} shift
                  </span>
                  <span className="inline-flex items-center gap-1 font-medium text-primary">
                    Open chart
                    <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {policy && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 text-primary" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{policy.title}</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {policy.code} · Institution policy
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{policy.summary}</p>
              <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <ClipboardList className="h-3 w-3" />
                Escalation steps follow your institution's configured pathway. FROMEX supports the
                decision — it does not replace clinical judgement.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
