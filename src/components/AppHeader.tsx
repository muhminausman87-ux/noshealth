import { useEffect, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Bell, ChevronDown, LayoutGrid, LogOut, UserRound } from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getSession, signOut, type Session } from "@/lib/auth";
import { getWorkspaceForPath } from "@/lib/workspaces";
import logo from "@/assets/nos-logo.png.asset.json";

/**
 * Global NOS Workspace application shell header.
 * The product is always presented as "NOS Workspace" — FROMEX Health Tech is
 * the parent company and appears only as a subtle footer attribution.
 */
export function AppHeader() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    setSession(getSession());
  }, [pathname]);

  const workspace = getWorkspaceForPath(pathname);

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  const initials = (session?.name ?? "NOS")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-13 items-center gap-3 border-b border-border bg-card px-3 sm:px-4">
      <SidebarTrigger className="shrink-0" />

      <Link to="/workspace" className="flex min-w-0 items-center gap-2.5">
        <img src={logo.url} alt="NOS Workspace" className="h-7 w-7 shrink-0 object-contain" />
        <span className="truncate text-[12.5px] font-bold uppercase tracking-[0.18em] text-foreground">
          NOS <span className="text-primary">Workspace</span>
        </span>
      </Link>

      {workspace && (
        <div className="hidden min-w-0 items-center gap-2 border-l border-border/70 pl-3 md:flex">
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ background: workspace.color }}
          />
          <span className="truncate text-xs font-medium text-muted-foreground">
            {workspace.name}
          </span>
        </div>
      )}

      <div className="ml-auto flex items-center gap-1.5">
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-1.5 py-1 transition hover:bg-accent">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
              {initials}
            </span>
            <span className="hidden min-w-0 text-left sm:block">
              <span className="block truncate text-xs font-semibold leading-tight text-foreground">
                {session?.name ?? "Signed in"}
              </span>
              <span className="block truncate text-[10px] leading-tight text-muted-foreground">
                {session?.title ?? "NOS Workspace"}
              </span>
            </span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="text-xs">
              <div className="font-semibold text-foreground">{session?.name ?? "Signed in"}</div>
              <div className="font-normal text-muted-foreground">{session?.title ?? "—"}</div>
              {session?.institutionName && (
                <div className="mt-0.5 font-normal text-muted-foreground">
                  {session.institutionName}
                </div>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="text-xs">
              <Link to="/workspace">
                <LayoutGrid className="mr-2 h-3.5 w-3.5" /> Switch workspace
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs" disabled>
              <UserRound className="mr-2 h-3.5 w-3.5" /> Profile & preferences
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs" onSelect={handleSignOut}>
              <LogOut className="mr-2 h-3.5 w-3.5" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
