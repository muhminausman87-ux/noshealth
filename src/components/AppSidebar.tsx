import { LogOut, LayoutGrid, ChevronsUpDown, Check } from "lucide-react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NOS_MARK, NOS_LOGO_ALT } from "@/lib/branding";
import {
  WORKSPACE_LIST,
  ADMIN_NAV,
  getWorkspaceForPath,
  type Workspace,
} from "@/lib/workspaces";
import { getSession, signOut, type Session } from "@/lib/auth";
import { allowedWorkspaces, type AccessContext } from "@/lib/access";

/**
 * Minimal global sidebar.
 *
 * Global navigation answers "Where am I?" — it exposes ONLY the six NOS
 * workspaces through a single workspace selector. Individual modules are
 * intentionally NOT shown here; they live on each workspace's landing page
 * (WorkspaceLanding), keeping the global rail clean:
 *
 *   GLOBAL NAVIGATION = workspaces
 *   WORKSPACE NAVIGATION = modules (on the workspace page)
 *   PAGE = actual functionality
 */
export function AppSidebar({
  collapsible = "icon",
}: {
  collapsible?: "icon" | "offcanvas" | "none";
}) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();

  const [session, setSess] = useState<Session | null>(null);
  useEffect(() => {
    setSess(getSession());
  }, [pathname]);

  const activeWorkspace: Workspace | null = getWorkspaceForPath(pathname);

  const ctx: AccessContext | null = session
    ? {
        role: session.role,
        department: session.assignedDept,
        institutionId: session.institutionId,
        responsibilities: session.responsibilities ?? [],
      }
    : null;
  const allowed = ctx ? allowedWorkspaces(ctx) : WORKSPACE_LIST.map((w) => w.id);
  const visibleWorkspaces = WORKSPACE_LIST.filter((w) => allowed.includes(w.id));
  const canSwitchWorkspace = ctx ? allowed.length > 1 : false;

  // Administration is shown only where appropriate (leadership roles).
  const canSeeAdmin = session ? session.role === "admin" : false;

  const ActiveIcon = activeWorkspace?.icon;

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  return (
    <Sidebar collapsible={collapsible} className="border-r border-border">
      {/* 1. NOS brand */}
      <SidebarHeader className="border-b border-border/60 py-3">
        <Link to="/workspace" className="flex items-center gap-2 px-2">
          <img
            src={NOS_MARK}
            alt={NOS_LOGO_ALT}
            className="h-8 w-8 rounded-md object-contain"
          />
          {!collapsed && (
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold uppercase leading-tight tracking-[0.14em] text-foreground">
                NOS <span className="text-primary">Workspace</span>
              </div>
              {session?.institutionName && (
                <div className="truncate text-[10px] uppercase tracking-wider text-muted-foreground">
                  {session.institutionName}
                </div>
              )}
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-0">
        {/* 2. Workspace selector — the only global navigation mechanism. */}
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              Workspace
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      tooltip={activeWorkspace?.name ?? "Select workspace"}
                      className="h-9 border border-border/70 bg-muted/40 hover:bg-muted/70"
                    >
                      {ActiveIcon ? (
                        <ActiveIcon
                          className="h-4 w-4 shrink-0"
                        />
                      ) : (
                        <LayoutGrid className="h-4 w-4 shrink-0" />
                      )}
                      <span className="truncate font-medium">
                        {activeWorkspace?.name ?? "Select workspace"}
                      </span>
                      {!collapsed && (
                        <ChevronsUpDown className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      )}
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="right"
                    align="start"
                    className="w-64"
                  >
                    <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      NOS Workspaces
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {visibleWorkspaces.map((ws) => {
                      const WIcon = ws.icon;
                      const active = activeWorkspace?.id === ws.id;
                      return (
                        <DropdownMenuItem
                          key={ws.id}
                          onSelect={() => navigate({ to: ws.landing })}
                          className="flex items-start gap-2.5 py-2"
                        >
                          <WIcon
                            className="mt-0.5 h-4 w-4 shrink-0"
                          />
                          <span className="flex min-w-0 flex-col">
                            <span className="truncate text-sm font-medium">
                              {ws.name}
                            </span>
                            <span className="line-clamp-2 text-[11px] text-muted-foreground">
                              {ws.purpose}
                            </span>
                          </span>
                          {active && (
                            <Check className="ml-auto mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          )}
                        </DropdownMenuItem>
                      );
                    })}
                    {canSwitchWorkspace && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onSelect={() => navigate({ to: "/workspace" })}
                          className="flex items-center gap-2.5"
                        >
                          <LayoutGrid className="h-4 w-4" />
                          <span className="text-sm">Workspace home</span>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* 3. Administration — only where appropriate. */}
        {canSeeAdmin && (
          <SidebarGroup className="mt-auto border-t border-border/60 pt-2">
            {!collapsed && (
              <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                Administration
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {ADMIN_NAV.map((item) => {
                  const AIcon = item.icon;
                  const active = item.to ? pathname === item.to : false;
                  return (
                    <SidebarMenuItem key={item.label}>
                      {item.to ? (
                        <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                          <Link to={item.to} className="flex items-center gap-2">
                            <AIcon className="h-4 w-4 shrink-0" />
                            <span className="truncate">{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      ) : (
                        <SidebarMenuButton
                          tooltip={`${item.label} (coming soon)`}
                          className="opacity-55 cursor-not-allowed"
                          onClick={(e) => e.preventDefault()}
                        >
                          <AIcon className="h-4 w-4 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </SidebarMenuButton>
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* 4. Sign out */}
      <SidebarFooter className="border-t border-border/60">
        <SidebarMenu>
          {session && (
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Sign out"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span className="truncate">Sign out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
