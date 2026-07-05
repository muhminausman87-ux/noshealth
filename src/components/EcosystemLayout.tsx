import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Brain,
  BookOpen,
  FlaskConical,
  GraduationCap,
  LineChart,
  Activity,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  LogOut,
  ShieldCheck,
  Stethoscope,
  Menu,
  X,
} from "lucide-react";
import { getSession, signOut, type Session } from "@/lib/auth";
import logo from "@/assets/nos-logo.png.asset.json";

export type NosModule = {
  key: string;
  to: string;
  title: string;
  subtitle: string;
  icon: typeof Brain;
  comingSoon?: boolean;
};

export const NOS_MODULES: NosModule[] = [
  {
    key: "workforce",
    to: "/workforce-intelligence",
    title: "Workforce Intelligence",
    subtitle: "AI-powered workforce management and operational analytics",
    icon: Brain,
  },
  {
    key: "ebp",
    to: "/ebp",
    title: "Evidence-Based Practice",
    subtitle: "Clinical evidence, guidelines, and best practices",
    icon: BookOpen,
    comingSoon: true,
  },
  {
    key: "research",
    to: "/research",
    title: "Research & Innovation",
    subtitle: "Research projects, publications, and healthcare innovation",
    icon: FlaskConical,
    comingSoon: true,
  },
  {
    key: "learning",
    to: "/learning",
    title: "Learning & Development",
    subtitle: "Competency, training, certifications, and professional growth",
    icon: GraduationCap,
    comingSoon: true,
  },
  {
    key: "executive",
    to: "/executive-intelligence",
    title: "Executive Intelligence",
    subtitle: "Hospital performance, quality, workforce, and strategic insights",
    icon: LineChart,
    comingSoon: true,
  },
];

export function EcosystemLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const [session, setSession] = useState<Session | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s) { navigate({ to: "/login" }); return; }
    setSession(s);
  }, [navigate]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  if (!session) {
    return <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">Loading…</div>;
  }

  const isAdmin = session.role === "admin";
  const logout = async () => { await signOut(); navigate({ to: "/login" }); };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-card transition-all duration-200 lg:sticky lg:top-0 lg:h-screen ${
          collapsed ? "lg:w-16" : "lg:w-72"
        } ${mobileOpen ? "w-72 translate-x-0" : "w-72 -translate-x-full lg:translate-x-0"}`}
      >
        {/* Brand */}
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-3">
          <img src={logo.url} alt="NOS" className="h-8 w-8 shrink-0 rounded-md object-contain" />
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold leading-tight text-foreground">
                NOS <span className="text-primary">Ecosystem</span>
              </div>
              <div className="truncate text-[10px] uppercase tracking-wider text-muted-foreground">
                Modules
              </div>
            </div>
          )}
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modules */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
          {NOS_MODULES.map((m) => {
            const active = pathname === m.to;
            const Icon = m.icon;
            return (
              <Link
                key={m.key}
                to={m.to}
                className={`group flex items-start gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-secondary"
                }`}
                title={collapsed ? m.title : undefined}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
                    active ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground group-hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                {!collapsed && (
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <div className="truncate text-sm font-medium">{m.title}</div>
                      {m.comingSoon && (
                        <span className="rounded-full border border-warning/40 bg-warning/15 px-1.5 py-0 text-[9px] font-semibold uppercase tracking-wider text-warning-foreground">
                          Soon
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground">
                      {m.subtitle}
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="shrink-0 border-t border-border p-2">
          {!collapsed && (
            <div className="mb-2 flex items-center gap-2 rounded-md px-2 py-2">
              {isAdmin ? <ShieldCheck className="h-4 w-4 shrink-0 text-primary" /> : <Stethoscope className="h-4 w-4 shrink-0 text-primary" />}
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-medium text-foreground">{session.name}</div>
                <div className="truncate text-[10px] text-muted-foreground">{session.title}</div>
              </div>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Link
              to="/"
              className={`flex flex-1 items-center gap-1.5 rounded-md border border-border px-2 py-1.5 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground ${collapsed ? "justify-center" : ""}`}
              title="Clinical dashboard"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {!collapsed && <span>Clinical</span>}
            </Link>
            <button
              onClick={logout}
              className="rounded-md border border-border p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
              title="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="mt-1 hidden w-full items-center justify-center rounded-md border border-border py-1 text-muted-foreground hover:bg-secondary hover:text-foreground lg:flex"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b border-border bg-card/95 px-3 backdrop-blur lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="text-sm font-semibold">
            NOS <span className="text-primary">Ecosystem</span>
          </div>
        </div>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

export function ModulePlaceholder({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: typeof Brain;
  title: string;
  subtitle: string;
}) {
  return (
    <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-10">
      {/* Header */}
      <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:h-14 sm:w-14">
          <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <span className="shrink-0 rounded-full border border-warning/40 bg-warning/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-warning-foreground">
          Coming Soon
        </span>
      </header>

      {/* Empty dashboard scaffold */}
      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex min-h-[160px] flex-col rounded-xl border border-dashed border-border bg-card/60 p-5 shadow-sm"
          >
            <div className="mb-3 flex items-center gap-2">
              <div className="h-3 w-24 rounded bg-secondary" />
              <span className="ml-auto rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                Prototype
              </span>
            </div>
            <div className="space-y-2">
              <div className="h-2 w-full rounded bg-secondary/70" />
              <div className="h-2 w-11/12 rounded bg-secondary/60" />
              <div className="h-2 w-9/12 rounded bg-secondary/50" />
            </div>
            <div className="mt-auto pt-4 text-[11px] text-muted-foreground">
              Module widget placeholder
            </div>
          </div>
        ))}
      </section>

      <section className="mt-4 rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground shadow-sm">
        This module is under construction. Widgets, analytics, and AI insights
        will appear here as the <span className="font-medium text-foreground">{title}</span> capability rolls out.
      </section>
    </main>
  );
}
