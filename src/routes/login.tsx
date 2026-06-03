import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Activity, Lock, Phone, ShieldCheck, Stethoscope, User, AlertCircle, ArrowLeftRight, FlaskConical, Scan, HeartPulse } from "lucide-react";
import { DEPARTMENTS } from "@/lib/departments";
import {
  STAFF, findUser, setSession,
  SUPPORT_PHONE, SUPPORT_PHONE_DISPLAY,
  type Role,
} from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in · SyncCare EHR" },
      { name: "description", content: "Sign-in for nurses, doctors, lab, radiology and admin." },
    ],
  }),
  component: LoginPage,
});

const ROLE_PASS: Record<Role, string> = {
  admin: "admin123", staff: "nurse123", doctor: "doc123", lab: "lab123", radiology: "rad123",
};

function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("staff");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pulled, setPulled] = useState(false);
  const [pulledDept, setPulledDept] = useState(DEPARTMENTS[0].id);
  const [error, setError] = useState("");

  const demoHints = useMemo(
    () => STAFF.filter((s) => s.role === role).slice(0, 4).map((s) => ({ u: s.username, p: s.password })),
    [role],
  );

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const user = findUser(username, password, role);
    if (!user) {
      setError("Invalid credentials. Try one of the demo accounts below, or call support.");
      return;
    }
    if (role === "admin") {
      setSession({ username: user.username, name: user.name, title: user.title, role: "admin", activeDept: "ed", pulled: false });
    } else if (role === "staff") {
      const active = pulled ? pulledDept : user.assignedDept!;
      setSession({ username: user.username, name: user.name, title: user.title, role: "staff", assignedDept: user.assignedDept, activeDept: active, pulled });
    } else {
      setSession({
        username: user.username, name: user.name, title: user.title,
        role, assignedDept: user.assignedDept,
        activeDept: user.assignedDept ?? "medical",
        pulled: false,
      });
    }
    navigate({ to: "/" });
  };

  const roleLabel =
    role === "admin" ? "Admin" : role === "staff" ? "Nurse" :
    role === "doctor" ? "Doctor" : role === "lab" ? "Lab Tech" : "Radiology";

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-accent/40 px-4 py-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-semibold">SyncCare <span className="text-primary">EHR</span></div>
            <div className="text-xs text-muted-foreground">Clinical workspace · sign in</div>
          </div>
        </div>

        <div className="grid w-full gap-6 md:grid-cols-[1fr_360px]">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
            <div className="mb-5 grid grid-cols-2 gap-1 rounded-lg bg-secondary p-1 sm:grid-cols-5">
              <RoleTab active={role === "staff"}     onClick={() => setRole("staff")}     icon={Stethoscope} label="Nurse" />
              <RoleTab active={role === "doctor"}    onClick={() => setRole("doctor")}    icon={HeartPulse}  label="Doctor" />
              <RoleTab active={role === "lab"}       onClick={() => setRole("lab")}       icon={FlaskConical} label="Lab" />
              <RoleTab active={role === "radiology"} onClick={() => setRole("radiology")} icon={Scan}        label="Radiology" />
              <RoleTab active={role === "admin"}     onClick={() => setRole("admin")}     icon={ShieldCheck} label="Admin" />
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <Field icon={User} label="Username">
                <input value={username} onChange={(e) => setUsername(e.target.value)}
                  placeholder={demoHints[0]?.u ?? "username"}
                  className="w-full bg-transparent text-sm outline-none" autoFocus />
              </Field>
              <Field icon={Lock} label="Password">
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" className="w-full bg-transparent text-sm outline-none" />
              </Field>

              {role === "staff" && (
                <div className="rounded-lg border border-border bg-secondary/40 p-3">
                  <label className="flex items-start gap-2 text-sm">
                    <input type="checkbox" checked={pulled} onChange={(e) => setPulled(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary" />
                    <span>
                      <span className="flex items-center gap-1.5 font-medium text-foreground">
                        <ArrowLeftRight className="h-3.5 w-3.5" /> Sign in as a pulled-out staff
                      </span>
                      <span className="text-xs text-muted-foreground">Use this when covering a different unit than your home department.</span>
                    </span>
                  </label>
                  {pulled && (
                    <div className="mt-3">
                      <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Pulled to</label>
                      <select value={pulledDept} onChange={(e) => setPulledDept(e.target.value as typeof pulledDept)}
                        className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary">
                        {DEPARTMENTS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4" /> {error}
                </div>
              )}

              <button type="submit" className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">
                Sign in as {roleLabel}
              </button>
            </form>

            <div className="mt-5 border-t border-border pt-4">
              <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Can't sign in?</div>
              <a href={`tel:${SUPPORT_PHONE}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-success transition-colors hover:bg-success/15">
                <span className="flex items-center gap-2"><Phone className="h-4 w-4" /><span className="text-sm font-semibold">Call IT Support</span></span>
                <span className="text-sm font-mono">{SUPPORT_PHONE_DISPLAY}</span>
              </a>
            </div>
          </div>

          <aside className="rounded-2xl border border-border bg-card/70 p-5 text-sm shadow-sm">
            <div className="mb-2 font-semibold text-foreground">Demo accounts</div>
            <p className="mb-3 text-xs text-muted-foreground">Prototype only — tap any account to autofill.</p>
            <ul className="space-y-1.5">
              {demoHints.map((d) => {
                const u = STAFF.find((s) => s.username === d.u)!;
                return (
                  <li key={d.u}>
                    <button type="button" onClick={() => { setUsername(d.u); setPassword(d.p); }}
                      className="flex w-full items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2 text-left hover:border-primary/50 hover:bg-secondary/40">
                      <span>
                        <div className="text-sm font-medium text-foreground">{u.name}</div>
                        <div className="text-[11px] text-muted-foreground">{u.title}</div>
                      </span>
                      <span className="font-mono text-[11px] text-muted-foreground">{d.u}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="mt-3 text-[11px] text-muted-foreground">Password: <span className="font-mono">{ROLE_PASS[role]}</span></div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function RoleTab({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: typeof Stethoscope; label: string }) {
  return (
    <button type="button" onClick={onClick}
      className={`flex items-center justify-center gap-1.5 rounded-md px-2 py-2 text-xs font-medium transition-colors ${
        active ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
      }`}>
      <Icon className="h-4 w-4" />{label}
    </button>
  );
}

function Field({ icon: Icon, label, children }: { icon: typeof User; label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
        <Icon className="h-4 w-4 text-muted-foreground" />
        {children}
      </div>
    </label>
  );
}
