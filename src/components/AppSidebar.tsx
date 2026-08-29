import { LogOut, LayoutGrid } from "lucide-react";
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
import logo from "@/assets/nos-logo.png.asset.json";
import {
  WORKSPACE_LIST,
  ADMIN_NAV,
  getWorkspaceForPath,
  type Workspace,
} from "@/lib/workspaces";
import { getSession, signOut, type Session } from "@/lib/auth";
import { allowedWorkspaces, type AccessContext } from "@/lib/access";

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

  // "Where am I?" — the active workspace is derived from the current route.
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

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  return (
    <Sidebar collapsible={collapsible} className="border-r border-border">
      <SidebarHeader className="border-b border-border/60 py-3">
        <Link to="/workspace" className="flex items-center gap-2 px-2">
          <img
            src={logo.url}
            alt="NOS Workspace"
            className="h-8 w-8 rounded-md object-contain"
          />
          {!collapsed && (
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold uppercase leading-tight tracking-[0.14em] text-foreground">
                NOS <span className="text-primary">Workspace</span>
              </div>
              <div
                className="truncate text-[10px] uppercase tracking-wider"
                style={{ color: activeWorkspace?.color }}
              >
                {session?.institutionName
                  ? `${session.institutionName} · ${activeWorkspace?.short ?? "Home"}`
                  : (activeWorkspace?.short ?? "Workspace home")}
              </div>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-0">
        {/* Primary navigation — the six NOS workspaces. */}
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              Workspaces
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleWorkspaces.map((ws) => {
                const WIcon = ws.icon;
                const active = activeWorkspace?.id === ws.id;
                return (
                  <SidebarMenuItem key={ws.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={ws.name}
                      className="data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-semibold"
                    >
                      <Link to={ws.landing} className="flex items-center gap-2">
                        <WIcon
                          className="h-4 w-4 shrink-0"
                        />
                        <span className="truncate">{ws.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* "What can I do here?" — modules of the active workspace only. */}
        {activeWorkspace && (
          <SidebarGroup className="mt-1 border-t border-border/60 pt-2">
            {!collapsed && (
              <SidebarGroupLabel
                className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: activeWorkspace.color }}
              >
                <activeWorkspace.icon className="h-3 w-3" />
                {activeWorkspace.name}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {activeWorkspace.modules.map((item) => {
                  const MIcon = item.icon;
                  const active = item.to ? pathname === item.to : false;
                  const enabled = Boolean(item.to);
                  return (
                    <SidebarMenuItem key={item.label}>
                      {enabled ? (
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          tooltip={item.label}
                          className="data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-semibold"
                        >
                          <Link to={item.to!} className="flex items-center gap-2">
                            <MIcon className="h-4 w-4 shrink-0" />
                            <span className="truncate">{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      ) : (
                        <SidebarMenuButton
                          tooltip={`${item.label} (coming soon)`}
                          className="opacity-60 cursor-not-allowed"
                          onClick={(e) => e.preventDefault()}
                        >
                          <MIcon className="h-4 w-4 shrink-0" />
                          <span className="truncate">{item.label}</span>
                          {!collapsed && (
                            <span className="ml-auto rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
                              Soon
                            </span>
                          )}
                        </SidebarMenuButton>
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Administration — secondary, kept separate from workspaces. */}
        <SidebarGroup className="mt-1 border-t border-border/60 pt-2">
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
      </SidebarContent>

      <SidebarFooter className="border-t border-border/60">
        <SidebarMenu>
          {canSwitchWorkspace && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Switch workspace">
                <Link to="/workspace" className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4 shrink-0" />
                  <span className="truncate">Switch workspace</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
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
