/**
 * FROMEX Phase 2 data access — all queries are institution-scoped by the
 * Phase 1 RLS policies (`private.user_institution` / `private.can_access_patient`).
 * No tenant filtering logic is duplicated here.
 */
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_WORKLOAD_MODEL, type WorkloadModel } from "./fromex";
import type { Department } from "./departments";

export interface AcuityRow {
  patient_id: string;
  department: Department | null;
  mews_current: number | null;
  mews_previous: number | null;
  mews_previous_at: string | null;
  mews_recorded_at: string;
  acuity_level: string;
  complexity_indicators: unknown;
  workload_factors: Record<string, number>;
  workload_score: number;
  workload_level: string;
}

export interface TaskRow {
  id: string;
  patient_id: string | null;
  assigned_to: string | null;
  task_type: string;
  label: string;
  detail: string | null;
  due_at: string | null;
  time_sensitive: boolean;
  status: string;
}

export interface PatientRow {
  id: string;
  full_name: string;
  mrn: string;
  room: string | null;
  dept: Department;
  status: "stable" | "watch" | "critical";
  short_note: string | null;
  reason_for_admission: string;
}

export interface CapacityRow {
  employee_id: string;
  department: Department;
  shift: string;
  available_minutes: number;
  break_minutes: number;
  on_leave: boolean;
  competency_level: string;
  responsibility_level: string;
  notes: string | null;
}

const asFactors = (v: unknown): Record<string, number> =>
  v && typeof v === "object" ? (v as Record<string, number>) : {};

/** Institution-configured prototype workload model (falls back to defaults). */
export async function fetchWorkloadModel(): Promise<WorkloadModel> {
  const { data } = await supabase
    .from("institution_policies")
    .select("escalation_pathway")
    .eq("kind", "workload_model")
    .eq("active", true)
    .limit(1)
    .maybeSingle();
  const cfg = data?.escalation_pathway as Partial<WorkloadModel> | null;
  if (!cfg?.weights) return DEFAULT_WORKLOAD_MODEL;
  return {
    weights: { ...DEFAULT_WORKLOAD_MODEL.weights, ...cfg.weights },
    thresholds: { ...DEFAULT_WORKLOAD_MODEL.thresholds, ...(cfg.thresholds ?? {}) },
    mews_thresholds: { ...DEFAULT_WORKLOAD_MODEL.mews_thresholds, ...(cfg.mews_thresholds ?? {}) },
  };
}

export interface ShiftData {
  patients: { patient: PatientRow; careRole: string; shift: string }[];
  acuity: Record<string, AcuityRow>;
  tasks: TaskRow[];
  model: WorkloadModel;
}

/** Patients assigned to the signed-in employee, with acuity and open tasks. */
export async function fetchMyShift(userId: string): Promise<ShiftData> {
  const { data: assigns } = await supabase
    .from("patient_assignments")
    .select(
      "care_role, shift, patients(id, full_name, mrn, room, dept, status, short_note, reason_for_admission)",
    )
    .eq("employee_id", userId)
    .eq("active", true);

  const patients = (assigns ?? [])
    .filter((a) => a.patients)
    .map((a) => ({
      patient: a.patients as unknown as PatientRow,
      careRole: a.care_role,
      shift: a.shift,
    }));
  const ids = patients.map((p) => p.patient.id);

  const [{ data: acu }, { data: tasks }, model] = await Promise.all([
    ids.length
      ? supabase.from("patient_acuity").select("*").in("patient_id", ids)
      : Promise.resolve({ data: [] as unknown[] }),
    supabase
      .from("workflow_tasks")
      .select("id, patient_id, assigned_to, task_type, label, detail, due_at, time_sensitive, status")
      .eq("assigned_to", userId)
      .neq("status", "done"),
    fetchWorkloadModel(),
  ]);

  const acuity: Record<string, AcuityRow> = {};
  for (const r of (acu ?? []) as Record<string, unknown>[]) {
    acuity[r.patient_id as string] = {
      ...(r as unknown as AcuityRow),
      workload_factors: asFactors(r.workload_factors),
    };
  }
  return { patients, acuity, tasks: (tasks ?? []) as TaskRow[], model };
}

export interface UnitData {
  patients: PatientRow[];
  acuity: Record<string, AcuityRow>;
  tasks: TaskRow[];
  capacity: CapacityRow[];
  assignments: { patient_id: string; employee_id: string }[];
  nurses: Record<string, string>;
  model: WorkloadModel;
}

/** Unit-level snapshot for charge nurses and nursing administration. */
export async function fetchUnit(): Promise<UnitData> {
  const [{ data: acu }, { data: tasks }, { data: cap }, { data: assigns }, model] = await Promise.all([
    supabase.from("patient_acuity").select("*"),
    supabase
      .from("workflow_tasks")
      .select("id, patient_id, assigned_to, task_type, label, detail, due_at, time_sensitive, status")
      .neq("status", "done"),
    supabase.from("nursing_capacity").select("*"),
    supabase
      .from("patient_assignments")
      .select("patient_id, employee_id, patients(id, full_name, mrn, room, dept, status, short_note, reason_for_admission)")
      .eq("active", true),
    fetchWorkloadModel(),
  ]);

  const acuity: Record<string, AcuityRow> = {};
  for (const r of (acu ?? []) as Record<string, unknown>[]) {
    acuity[r.patient_id as string] = {
      ...(r as unknown as AcuityRow),
      workload_factors: asFactors(r.workload_factors),
    };
  }
  const patients: PatientRow[] = [];
  const assignments: { patient_id: string; employee_id: string }[] = [];
  for (const a of assigns ?? []) {
    if (a.patients) patients.push(a.patients as unknown as PatientRow);
    assignments.push({ patient_id: a.patient_id, employee_id: a.employee_id });
  }

  const employeeIds = Array.from(
    new Set([...assignments.map((a) => a.employee_id), ...((cap ?? []) as CapacityRow[]).map((c) => c.employee_id)]),
  );
  const nurses: Record<string, string> = {};
  if (employeeIds.length) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", employeeIds);
    for (const p of profiles ?? []) nurses[p.id] = p.full_name;
  }

  return {
    patients,
    acuity,
    tasks: (tasks ?? []) as TaskRow[],
    capacity: (cap ?? []) as CapacityRow[],
    assignments,
    nurses,
    model,
  };
}

export interface EscalationPolicy {
  code: string;
  title: string;
  summary: string | null;
  escalation_pathway: unknown;
}

/** Institution-configured escalation pathway (Phase 1 policy engine). */
export async function fetchEscalationPolicy(): Promise<EscalationPolicy | null> {
  const { data } = await supabase
    .from("institution_policies")
    .select("code, title, summary, escalation_pathway")
    .eq("kind", "escalation")
    .eq("active", true)
    .limit(1)
    .maybeSingle();
  return (data as EscalationPolicy) ?? null;
}
