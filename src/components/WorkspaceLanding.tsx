import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import type { Workspace } from "@/lib/workspaces";

export function WorkspaceLanding({ workspace }: { workspace: Workspace }) {
  const Icon = workspace.icon;
  return (
    <div className="mx-auto max-w-[1400px] px-6 py-6">
      <header className="mb-6 flex items-start gap-3 border-b border-border pb-4">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-md border"
          style={{
            background: `color-mix(in srgb, ${workspace.color} 8%, transparent)`,
            borderColor: `color-mix(in srgb, ${workspace.color} 28%, transparent)`,
            color: workspace.color,
          }}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="nos-eyebrow">NOS Workspace</div>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
            {workspace.name}
          </h1>
          <p className="mt-1 max-w-2xl text-[12.5px] leading-relaxed text-muted-foreground">{workspace.purpose}</p>
        </div>
      </header>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="nos-eyebrow">Modules</h2>
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
                className={`group flex h-full items-start gap-3 rounded-lg border p-3.5 transition ${
                  enabled
                    ? "border-border bg-card shadow-[var(--shadow-card)] hover:border-primary/45 hover:bg-accent/40"
                    : "border-dashed border-border/70 bg-muted/40"
                }`}
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border"
                  style={{
                    background: `color-mix(in srgb, ${workspace.color} 8%, transparent)`,
                    borderColor: `color-mix(in srgb, ${workspace.color} 26%, transparent)`,
                    color: workspace.color,
                  }}
                >
                  <MIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="truncate text-[13px] font-semibold text-foreground">
                      {m.label}
                    </div>
                    {!enabled && (
                      <span className="rounded-full border border-border bg-muted px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
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

      <section className="mt-8 rounded-lg border border-border bg-card p-4">
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <Sparkles className="mt-0.5 h-4 w-4 text-primary" />
          <p>
            <span className="font-semibold text-foreground">{workspace.name}</span> is one of six
            independent NOS workspaces. Use the global sidebar on the left to switch workspaces at any time.
          </p>
        </div>
      </section>
    </div>
  );
}
