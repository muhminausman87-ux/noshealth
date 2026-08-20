import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/nos-logo.png.asset.json";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Set a new password · NOS Health" },
      { name: "description", content: "Set a new password for your NOS Health account using a secure recovery link." },
      { property: "og:title", content: "Set a new password · NOS Health" },
      { property: "og:description", content: "Set a new password for your NOS Health account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [valid, setValid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  // Supabase delivers the recovery session through the URL hash on arrival.
  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      setValid(Boolean(data.session));
      setReady(true);
    };
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setValid(true);
        setReady(true);
      }
    });
    void check();
    return () => { cancelled = true; sub.subscription.unsubscribe(); };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Use at least 8 characters."); return; }
    if (password !== confirm) { setError("The two passwords do not match."); return; }
    setSaving(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (err) { setError("Could not update the password. Request a new reset link and try again."); return; }
    setDone(true);
    await supabase.auth.signOut();
    setTimeout(() => navigate({ to: "/login", replace: true }), 1800);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-secondary via-background to-accent/40 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <img src={logo.url} alt="NOS Health" className="h-14 w-auto" />
          <h1 className="mt-3 text-xl font-semibold tracking-tight text-foreground">NOS HEALTH</h1>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Clinical &amp; Workforce Intelligence Platform
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card/95 p-6 shadow-sm sm:p-8">
          <h2 className="mb-4 text-base font-semibold text-foreground">Set a new password</h2>

          {!ready && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Verifying your reset link…
            </div>
          )}

          {ready && !valid && (
            <div className="space-y-4">
              <div role="alert" className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                This reset link is invalid or has expired.
              </div>
              <button
                onClick={() => navigate({ to: "/login" })}
                className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Back to sign in
              </button>
            </div>
          )}

          {ready && valid && !done && (
            <form onSubmit={submit} className="space-y-4" noValidate>
              <PasswordField
                id="new-password" label="New password" value={password} onChange={setPassword}
                show={show} onToggle={() => setShow((v) => !v)}
              />
              <PasswordField
                id="confirm-password" label="Confirm new password" value={confirm} onChange={setConfirm}
                show={show} onToggle={() => setShow((v) => !v)}
              />
              {error && (
                <div role="alert" className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
                </div>
              )}
              <button
                type="submit" disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-70"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? "Updating…" : "Update password"}
              </button>
            </form>
          )}

          {done && (
            <div className="flex items-start gap-2 rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
              <CheckCircle2 className="mt-0.5 h-4 w-4" /> Password updated. Redirecting you to sign in…
            </div>
          )}

          <div className="mt-5 flex items-start gap-2 border-t border-border pt-4 text-[11px] text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
            <span>Authorized users only. Access is monitored and protected.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PasswordField({
  id, label, value, onChange, show, onToggle,
}: {
  id: string; label: string; value: string; onChange: (v: string) => void; show: boolean; onToggle: () => void;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-ring">
        <Lock className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        <input
          id={id} type={show ? "text" : "password"} autoComplete="new-password" required
          value={value} onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className="w-full bg-transparent text-sm outline-none"
        />
        <button
          type="button" onClick={onToggle}
          aria-label={show ? "Hide password" : "Show password"}
          className="text-muted-foreground transition hover:text-foreground"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
