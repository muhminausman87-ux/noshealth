import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import type { Workspace } from "@/lib/workspaces";

export function WorkspaceLanding({ workspace }: { workspace: Workspace }) {
  const Icon = workspace.icon;
  return (
    <div className="mx-auto max-w-[1400px] px-6 py-8">
      <header className="mb-6 flex items-start gap-4">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{
            background: `color-mix(in oklab, ${workspace.color} 15%, transparent)`,
            color: workspace.color,
          }}
        >
          <Icon className="h-7 w-7" />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            NOS Workspace
          </div>
          <h1 className="mt-0.5 text-2xl font-semibold tracking-tight text-foreground">
            {workspace.name}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{workspace.purpose}</p>
        </div>
      </header>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Modules
          </h2>
          <span className="text-[11px] text-muted-foreground">
            Only modules for this workspace are shown
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {workspace.modules.map((m) => {
            const MIcon = m.icon;
            const enabled = Boolean(m.to);
            const content = (
              <div
                className={`group flex h-full items-start gap-3 rounded-2xl border p-4 transition ${
                  enabled
                    ? "border-border bg-card hover:border-primary/40 hover:shadow-sm"
                    : "border-dashed border-border/60 bg-card/50"
                }`}
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    background: `color-mix(in oklab, ${workspace.color} 12%, transparent)`,
                    color: workspace.color,
                  }}
                >
                  <MIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="truncate text-sm font-semibold text-foreground">
                      {m.label}
                    </div>
                    {!enabled && (
                      <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
                        Soon
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">
                    {enabled ? "Open module" : "Available in this workspace"}
                  </div>
                </div>
                {enabled && (
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
                )}
              </div>
            );
            return enabled ? (
              <Link key={m.label} to={m.to!}>
                {content}
              </Link>
            ) : (
              <div key={m.label}>{content}</div>
            );
          })}
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-border bg-card/70 p-4">
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <Sparkles className="mt-0.5 h-4 w-4 text-primary" />
          <p>
            <span className="font-semibold text-foreground">{workspace.name}</span> is one of six
            independent NOS workspaces. Your navigation on the left shows only the modules for
            this workspace — switch workspaces from the top of the sidebar (Administrator only).
          </p>
        </div>
      </section>
    </div>
  );
}
