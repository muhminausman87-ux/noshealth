import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, LogOut } from "lucide-react";
import { WORKSPACE_LIST } from "@/lib/workspaces";
import { getSession, signOut, type Session } from "@/lib/auth";
import { allowedWorkspaces } from "@/lib/access";
import logo from "@/assets/nos-logo.png.asset.json";

export const Route = createFileRoute("/workspace")({
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

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  if (!session) return null;

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-8">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <img src={logo.url} alt="NOS" className="h-12 w-12 rounded-xl" />
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Welcome, {session.name}
            </div>
            <h1 className="mt-0.5 text-2xl font-semibold tracking-tight text-foreground">
              Choose a workspace
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              NOS is organised into six independent workspaces. Open one to load only its modules
              and navigation.
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
        >
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {WORKSPACE_LIST.map((w) => {
          const Icon = w.icon;
          return (
            <Link
              key={w.id}
              to={w.landing}
              className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div className="mb-3 flex items-center justify-between">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{
                    background: `color-mix(in oklab, ${w.color} 15%, transparent)`,
                    color: w.color,
                  }}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
              <div className="text-base font-semibold text-foreground">{w.name}</div>
              <p className="mt-1 flex-1 text-xs text-muted-foreground">{w.purpose}</p>
              <div className="mt-3 border-t border-border/70 pt-3 text-[11px] text-muted-foreground">
                {w.modules.length} modules
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
