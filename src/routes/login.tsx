import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Lock, Mail, AlertCircle, Eye, EyeOff, ShieldCheck, Loader2, ArrowLeft, CheckCircle2, Phone,
} from "lucide-react";
import {
  signInWithEmail, sendPasswordReset, hydrateSession,
  SUPPORT_PHONE, SUPPORT_PHONE_DISPLAY,
} from "@/lib/auth";
import { landingForRole } from "@/lib/workspaces";
import logo from "@/assets/nos-logo.png.asset.json";

/** Only same-origin, in-app paths may be used as a post-login destination. */
function safeRedirect(value: unknown): string | null {
  if (typeof value !== "string") return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  if (value.startsWith("/login") || value.startsWith("/reset-password")) return null;
  return value;
}

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => {
    const r = safeRedirect(search.redirect);
    return r ? { redirect: r } : {};
  },

  head: () => ({
    meta: [
      { title: "Sign in · NOS Health" },
      { name: "description", content: "Secure sign-in for the NOS Health Clinical & Workforce Intelligence Platform. Authorized users only." },
      { property: "og:title", content: "Sign in · NOS Health" },
      { property: "og:description", content: "Secure sign-in for the NOS Health Clinical & Workforce Intelligence Platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Authenticated users should never sit on the login screen.
  useEffect(() => {
    let cancelled = false;
    hydrateSession()
      .then((s) => {
        if (cancelled) return;
        if (s) navigate({ to: search.redirect ?? landingForRole(s.role), replace: true });
        else setChecking(false);
      })
      .catch(() => !cancelled && setChecking(false));
    return () => { cancelled = true; };
  }, [navigate, search.redirect]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Enter your email address and password.");
      return;
    }
    setLoading(true);
    try {
      const s = await signInWithEmail(email.trim(), password);
      setPassword("");
      navigate({ to: search.redirect ?? landingForRole(s.role), replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    if (!email.trim()) {
      setError("Enter the email address linked to your account.");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordReset(email.trim());
      setNotice("If an account exists for that address, a password reset link has been sent.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send the reset email.");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Checking your session…
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-secondary via-background to-accent/40 px-4 py-10">
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <img src={logo.url} alt="NOS Health" className="h-14 w-auto" />
          <h1 className="mt-3 text-xl font-semibold tracking-tight text-foreground">NOS HEALTH</h1>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Clinical &amp; Workforce Intelligence Platform
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card/95 p-6 shadow-sm sm:p-8">
          {mode === "signin" ? (
            <form onSubmit={handleLogin} className="space-y-4" noValidate>
              <h2 className="text-base font-semibold text-foreground">Sign in</h2>

              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-medium text-muted-foreground">Email</label>
                <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-ring">
                  <Mail className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  <input
                    id="email" name="email" type="email" autoComplete="email" required
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@hospital.org"
                    className="w-full bg-transparent text-sm outline-none"
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-xs font-medium text-muted-foreground">Password</label>
                  <button
                    type="button"
                    onClick={() => { setMode("forgot"); setError(""); setNotice(""); }}
                    className="text-xs font-medium text-primary underline-offset-2 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-ring">
                  <Lock className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  <input
                    id="password" name="password" required
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-transparent text-sm outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="text-muted-foreground transition hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && <ErrorNote>{error}</ErrorNote>}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-70"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-4" noValidate>
              <button
                type="button"
                onClick={() => { setMode("signin"); setError(""); setNotice(""); }}
                className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
              </button>
              <h2 className="text-base font-semibold text-foreground">Reset your password</h2>
              <p className="text-xs text-muted-foreground">
                Enter your work email address and we will send a secure reset link.
              </p>

              <div className="space-y-1.5">
                <label htmlFor="reset-email" className="text-xs font-medium text-muted-foreground">Email</label>
                <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-ring">
                  <Mail className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  <input
                    id="reset-email" type="email" autoComplete="email" required
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@hospital.org"
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </div>

              {error && <ErrorNote>{error}</ErrorNote>}
              {notice && (
                <div className="flex items-start gap-2 rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
                  <CheckCircle2 className="mt-0.5 h-4 w-4" /> {notice}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-70"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>
          )}

          <div className="mt-5 flex items-start gap-2 border-t border-border pt-4 text-[11px] leading-snug text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
            <span>Authorized users only. Access is monitored and protected.</span>
          </div>

          <a
            href={`tel:${SUPPORT_PHONE}`}
            className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <span className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> Need help signing in?</span>
            <span className="font-mono">{SUPPORT_PHONE_DISPLAY}</span>
          </a>
        </div>
      </div>
    </div>
  );
}

function ErrorNote({ children }: { children: React.ReactNode }) {
  return (
    <div role="alert" className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {children}
    </div>
  );
}
