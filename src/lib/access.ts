/**
 * FROMEX access model — Phase 1.
 *
 * Access is never decided by role alone. It is decided by the combination of
 *   INSTITUTION + ROLE + DEPARTMENT + RESPONSIBILITY (+ patient assignment).
 *
 * This module is the single client-side source of truth for *presentation*
 * (which workspaces/modules a user is offered). It is NOT a security boundary:
 * every institution-owned entity is isolated in the database through RLS
 * policies scoped to `private.user_institution(auth.uid())`.
 */
import type { Department } from "./departments";
import type { Role } from "./auth";
import type { WorkspaceId } from "./workspaces";
import { supabase } from "@/integrations/supabase/client";

/** Responsibilities are stored per employee in `public.employee_responsibilities`. */
export type Responsibility =
  | "bedside_nurse"
  | "charge_nurse"
  | "nursing_admin"
  | "quality"
  | "hr"
  | "executive"
  | "institution_admin";

export const RESPONSIBILITY_LABEL: Record<Responsibility, string> = {
  bedside_nurse: "Bedside Nurse",
  charge_nurse: "Charge Nurse",
  nursing_admin: "Nursing Administration",
  quality: "Quality / EBP",
  hr: "Workforce Operations",
  executive: "Executive",
  institution_admin: "Institution Admin",
};

export interface AccessContext {
  institutionId?: string;
  institutionName?: string;
  role: Role;
  department?: Department;
  responsibilities: Responsibility[];
}

/** Workspaces a context may enter. Least privilege: clinical care first. */
export function allowedWorkspaces(ctx: AccessContext): WorkspaceId[] {
  const r = new Set(ctx.responsibilities);
  const ws = new Set<WorkspaceId>();

  // Clinical care is available to anyone with a clinical role.
  if (["staff", "doctor", "lab", "radiology", "admin"].includes(ctx.role)) ws.add("clinical");

  // Wellbeing and growth are employee-domain surfaces — every employee owns their own.
  ws.add("wellbeing");
  ws.add("growth");

  if (r.has("charge_nurse") || r.has("nursing_admin") || r.has("hr")) ws.add("workforce");
  if (r.has("quality") || r.has("nursing_admin")) ws.add("excellence");
  if (r.has("executive")) {
    ws.add("executive");
    ws.add("workforce");
    ws.add("excellence");
  }
  if (ctx.role === "admin" || r.has("institution_admin")) {
    (["clinical", "workforce", "wellbeing", "growth", "excellence", "executive"] as WorkspaceId[])
      .forEach((w) => ws.add(w));
  }
  return Array.from(ws);
}

export function canEnterWorkspace(ctx: AccessContext, id: WorkspaceId): boolean {
  return allowedWorkspaces(ctx).includes(id);
}

/**
 * Progressive disclosure: a bedside clinician's primary surface is their own
 * responsibility. Institution-wide analytics stay available only to the
 * responsibilities that own them.
 */
export function isBedsideFirst(ctx: AccessContext): boolean {
  if (ctx.role === "admin") return false;
  const r = new Set(ctx.responsibilities);
  return !r.has("nursing_admin") && !r.has("executive") && !r.has("hr");
}

/** Audit trail — best effort, never blocks the user's workflow. */
export async function recordAudit(input: {
  institutionId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  result?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    const { data } = await supabase.auth.getUser();
    if (!data.user || !input.institutionId) return;
    await supabase.from("audit_events").insert({
      institution_id: input.institutionId,
      actor_id: data.user.id,
      action: input.action,
      entity_type: input.entityType ?? null,
      entity_id: input.entityId ?? null,
      result: input.result ?? "success",
      metadata: (input.metadata ?? {}) as never,
    });
  } catch {
    /* auditing must never break clinical workflow */
  }
}
