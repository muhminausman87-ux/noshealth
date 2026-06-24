import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, Phone, User, AlertCircle, Linkedin, KeyRound } from "lucide-react";
import {
  signInWithEmail,
  SUPPORT_PHONE, SUPPORT_PHONE_DISPLAY,
  DEMO_ACCOUNTS, FOUNDER_LINKEDIN,
} from "@/lib/auth";
import logo from "@/assets/nos-logo.png.asset.json";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in · NOS Ecosystems" },
      { name: "description", content: "Sign in to NOS Ecosystems." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const user = findUserAny(username, password);
    if (!user) {
      setError("Invalid username or password.");
      return;
    }
    if (user.role === "admin") {
      setSession({ username: user.username, name: user.name, title: user.title, role: "admin", activeDept: "ed", pulled: false });
    } else if (user.role === "staff") {
      setSession({ username: user.username, name: user.name, title: user.title, role: "staff", assignedDept: user.assignedDept, activeDept: user.assignedDept!, pulled: false });
    } else {
      setSession({
        username: user.username, name: user.name, title: user.title,
        role: user.role, assignedDept: user.assignedDept,
        activeDept: user.assignedDept ?? "medical",
        pulled: false,
      });
    }
    navigate({ to: "/" });
  };

  const fillDemo = (u: string, p: string) => { setUsername(u); setPassword(p); setError(""); };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-secondary via-background to-accent/40 px-4 py-10">
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-6">
        <img src={logo.url} alt="NOS Ecosystems" className="h-16 w-auto" />

        <div className="grid w-full gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card/95 p-6 shadow-sm md:p-8">
            <h1 className="mb-4 text-lg font-semibold text-foreground">Sign in</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <Field icon={User} label="Username">
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                className="w-full bg-transparent text-sm outline-none"
                autoFocus
              />
            </Field>
            <Field icon={Lock} label="Password">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent text-sm outline-none"
              />
            </Field>

            {error && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4" /> {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              Sign in
            </button>
          </form>

          <div className="mt-5 border-t border-border pt-4">
            <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Need help?
            </div>
            <a
              href={`tel:${SUPPORT_PHONE}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-success transition-colors hover:bg-success/15"
            >
              <span className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span className="text-sm font-semibold">Call Support</span>
              </span>
              <span className="font-mono text-sm">{SUPPORT_PHONE_DISPLAY}</span>
            </a>
          </div>
        </div>

        {/* Demo accounts + founder */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card/95 p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Demo accounts</h2>
            </div>
            <p className="mb-3 text-xs text-muted-foreground">
              Click any role to auto-fill the form. The system detects role automatically — no role tab needed.
            </p>
            <ul className="space-y-1.5">
              {DEMO_ACCOUNTS.map((d) => (
                <li key={d.username}>
                  <button
                    type="button"
                    onClick={() => fillDemo(d.username, d.password)}
                    className="flex w-full items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2 text-left text-xs transition hover:border-primary/40 hover:bg-accent"
                  >
                    <span>
                      <span className="block font-medium text-foreground">{d.role}</span>
                      <span className="block text-[10px] text-muted-foreground">{d.name}</span>
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {d.username} / {d.password}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <a
            href={FOUNDER_LINKEDIN}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-2xl border border-border bg-card/95 p-4 text-sm shadow-sm transition hover:border-primary/40"
          >
            <Linkedin className="h-5 w-5 text-primary" />
            <div className="min-w-0">
              <div className="font-medium text-foreground">Built on the vision of Muhmina Usman</div>
              <div className="truncate text-[11px] text-muted-foreground">
                Right Patient · Right Nurse · Right Care · Right Outcome
              </div>
            </div>
          </a>
        </aside>
        </div>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, children }: { icon: typeof User; label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
        <Icon className="h-4 w-4 text-muted-foreground" />
        {children}
      </div>
    </label>
  );
}
