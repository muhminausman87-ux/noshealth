import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, LogOut } from "lucide-react";
import { WORKSPACE_LIST } from "@/lib/workspaces";
import { getSession, signOut, type Session } from "@/lib/auth";
import { allowedWorkspaces } from "@/lib/access";
import logo from "@/assets/nos-logo.png.asset.json";

export const Route = createFileRoute("/_authenticated/workspace")({
  head: () => ({
    meta: [
      { title: "Workspace Selector · NOS Ecosystem" },
      {
        name: "description",
        content:
          "Choose a NOS workspace — Clinical, Workforce Operations, Wellbeing, Growth, Clinical Excellence, or Executive Intelligence.",
      },
      { property: "og:title", content: "Workspace Selector · NOS Ecosystem" },
      {
        property: "og:description",
        content:
          "Independent enterprise workspaces for clinical care, workforce operations, wellbeing, growth, quality, and executive intelligence.",
      },
    ],
  }),
  component: WorkspaceSelector,
});

function WorkspaceSelector() {
  const navigate = useNavigate();
  const [session, setSess] = useState<Session | null>(null);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      navigate({ to: "/login" });
      return;
    }
    setSess(s);
  }, [navigate]);

  const allowed = session
    ? allowedWorkspaces({
        role: session.role,
        department: session.assignedDept,
        institutionId: session.institutionId,
        responsibilities: session.responsibilities ?? [],
      })
    : [];
  const visible = WORKSPACE_LIST.filter((w) => allowed.includes(w.id));

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  if (!session) return null;

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12 lg:py-16">
      <header className="mb-10 flex flex-wrap items-start justify-between gap-6">
        <div className="flex items-start gap-4">
          <img src={logo.url} alt="NOS Workspace" className="h-12 w-12 object-contain" />
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              NOS Workspace
            </div>
            <div className="mt-2 text-sm text-muted-foreground">Welcome, {session.name}</div>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
              Choose a workspace
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              You see only the workspaces authorised for your institution, role and
              responsibility. Open one to load just its modules and navigation.
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
        >
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </button>
      </header>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/60 p-10 text-center">
          <div className="text-sm font-semibold text-foreground">
            You don't currently have access to any workspace
          </div>
          <p className="mx-auto mt-2 max-w-md text-xs text-muted-foreground">
            Workspace access is granted by your institution based on your role and
            responsibility. Contact your nursing administration to request access.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((w) => {
            const Icon = w.icon;
            return (
              <Link
                key={w.id}
                to={w.landing}
                className="group flex min-h-[190px] flex-col rounded-2xl border border-border bg-card p-6 transition duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[var(--shadow-card-hover)]"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{
                      background: `color-mix(in oklab, ${w.color} 12%, transparent)`,
                      color: w.color,
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/60 transition group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
                <div className="text-[15px] font-semibold text-foreground">{w.name}</div>
                <p className="mt-1.5 flex-1 text-xs leading-relaxed text-muted-foreground">
                  {w.purpose}
                </p>
                <div className="mt-5 text-[11px] font-medium text-muted-foreground/80">
                  {w.modules.length} modules
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <p className="mt-12 text-center text-[11px] text-muted-foreground/70">
        NOS Workspace · A FROMEX Health Tech product
      </p>
    </div>
  );
}
