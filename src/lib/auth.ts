import type { Department } from "./departments";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { recordAudit, type Responsibility } from "./access";

export type Role = "staff" | "admin" | "doctor" | "lab" | "radiology";
type DbRole = Database["public"]["Enums"]["app_role"];

// DB stores 'nurse'; the UI uses 'staff'. Map between them.
const dbRoleToSession = (r: DbRole): Role => (r === "nurse" ? "staff" : r);

export interface Session {
  username: string;
  name: string;
  title: string;
  role: Role;
  assignedDept?: Department;
  activeDept: Department;
  pulled: boolean;
  /** Tenant boundary — every institution-owned query is scoped to this. */
  institutionId?: string;
  institutionName?: string;
  /** Responsibility-based access (see src/lib/access.ts). */
  responsibilities?: Responsibility[];
}

/**
 * SECURITY MODEL
 * --------------
 * Supabase Auth is the only source of truth for identity. The `Session`
 * object below is a *presentation cache* of the signed-in user's profile
 * (name, job role, department) that is re-derived from the database on every
 * authenticated page load. It contains no tokens, no passwords and no
 * credentials, and it is never trusted for data access: every read/write is
 * enforced by Postgres RLS policies scoped to `auth.uid()`.
 */
const KEY = "nos.session.cache";
const EMERG_KEY = "nos.emergency";

/** Load the profile/role/responsibility view of the currently signed-in user. */
async function loadSessionFor(userId: string, email: string | undefined): Promise<Session> {
  const [{ data: profile, error: pErr }, { data: roles, error: rErr }, { data: resp }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("full_name, title, assigned_dept, username, institution_id, institutions(name)")
        .eq("id", userId)
        .maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase.from("employee_responsibilities").select("responsibility").eq("user_id", userId),
    ]);
  if (pErr) throw new Error(pErr.message);
  if (rErr) throw new Error(rErr.message);

  const dbRoles = (roles ?? []).map((r) => r.role as DbRole);
  // Pick highest-privilege role available.
  const priority: DbRole[] = ["admin", "doctor", "nurse", "lab", "radiology"];
  const picked = priority.find((p) => dbRoles.includes(p)) ?? "nurse";
  const role = dbRoleToSession(picked);

  const assignedDept = (profile?.assigned_dept ?? undefined) as Department | undefined;
  const activeDept: Department = assignedDept ?? "ed";

  // Responsibilities come from the institution's configuration. When an
  // institution has not configured them yet, fall back to the job role so the
  // user is never locked out of their own workspace.
  const stored = (resp ?? []).map((r) => r.responsibility as Responsibility);
  const responsibilities: Responsibility[] = stored.length
    ? stored
    : role === "admin"
      ? ["institution_admin"]
      : role === "staff"
        ? ["bedside_nurse"]
        : [];

  return {
    username: profile?.username || email || "",
    name: profile?.full_name || email || "User",
    title: profile?.title || "",
    role,
    assignedDept,
    activeDept,
    pulled: false,
    institutionId: profile?.institution_id ?? undefined,
    institutionName:
      (profile as { institutions?: { name: string } | null } | null)?.institutions?.name ??
      undefined,
    responsibilities,
  };
}

/**
 * Re-derive the session from Supabase Auth + the database. Returns null when
 * there is no valid (non-expired) Supabase session. Called by the route guard
 * on every authenticated navigation, so an expired/revoked session is caught.
 */
export async function hydrateSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    setSession(null);
    return null;
  }
  const cached = getSession();
  const session = await loadSessionFor(data.user.id, data.user.email ?? undefined);
  // Preserve the in-app department the user is currently viewing.
  if (cached && cached.username === session.username) {
    session.activeDept = cached.activeDept;
    session.pulled = cached.pulled;
  }
  setSession(session);
  return session;
}

/** Sign in with Supabase using email + password. Throws a safe Error on failure. */
export async function signInWithEmail(email: string, password: string): Promise<Session> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    // Never surface raw provider internals to the browser.
    throw new Error("Incorrect email or password.");
  }

  const session = await loadSessionFor(data.user.id, data.user.email ?? undefined);
  setSession(session);
  void recordAudit({
    institutionId: session.institutionId,
    action: "auth.login",
    entityType: "user",
    entityId: data.user.id,
  });
  return session;
}

/** Send a password-reset email that lands on the public /reset-password route. */
export async function sendPasswordReset(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw new Error("Unable to send the reset email. Please try again.");
}

/** Sign out of Supabase and clear the local presentation cache. */
export async function signOut(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch {
    /* ignore */
  }
  setSession(null);
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function setSession(s: Session | null) {
  if (typeof window === "undefined") return;
  if (s) localStorage.setItem(KEY, JSON.stringify(s));
  else {
    localStorage.removeItem(KEY);
    localStorage.removeItem("synccare.session");
  }
}

// Hospital-wide healthcare emergency mode (Code Yellow / mass casualty / outbreak).
export function getEmergency(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(EMERG_KEY) === "1";
}
export function setEmergency(on: boolean) {
  if (typeof window === "undefined") return;
  if (on) localStorage.setItem(EMERG_KEY, "1");
  else localStorage.removeItem(EMERG_KEY);
  window.dispatchEvent(new CustomEvent("synccare-emergency"));
}

export const SUPPORT_PHONE = "+852685497";
export const SUPPORT_PHONE_DISPLAY = "852 685 497";

export const FOUNDER_LINKEDIN = "https://www.linkedin.com/in/muhmina-usman-a9b54557";
