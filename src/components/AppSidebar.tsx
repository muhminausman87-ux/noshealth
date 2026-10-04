import { useEffect, useState } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Stethoscope,
  Building2,
  HeartHandshake,
  GraduationCap,
  Award,
  LineChart,
  LogOut,
  Settings,
  LayoutGrid,
} from "lucide-react";

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
import { NOS_MARK, NOS_LOGO_ALT } from "@/lib/branding";
import { getSession, signOut, type Session } from "@/lib/auth";
import { WORKSPACES, getWorkspaceForPath, type WorkspaceId } from "@/lib/workspaces";

interface MainWorkspaceItem {
  id: WorkspaceId;
  name: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  description: string;
}

const MAIN_WORKSPACES: MainWorkspaceItem[] = [
  {
    id: "clinical",
    name: "Clinical Workspace",
    to: "/clinical",
    icon: Stethoscope,
    accentColor: "#38bdf8",
    description: "Bedside EHR, patient census & clinical documentation",
  },
  {
    id: "workforce",
    name: "Workforce Operations",
    to: "/workforce-intelligence",
    icon: Building2,
    accentColor: "#38bdf8",
    description: "Workforce capacity, scheduling & workflow intelligence",
  },
  {
    id: "wellbeing",
    name: "Employee Wellbeing",
    to: "/wellbeing",
    icon: HeartHandshake,
    accentColor: "#38bdf8",
    description: "Nurse fatigue, rest, breaks & retention insights",
  },
  {
    id: "growth",
    name: "Employee Growth",
    to: "/growth",
    icon: GraduationCap,
    accentColor: "#38bdf8",
    description: "Competency management, training & professional growth",
  },
  {
    id: "excellence",
    name: "Clinical Excellence",
    to: "/clinical-excellence",
    icon: Award,
    accentColor: "#38bdf8",
    description: "Quality dashboards, evidence-based practice & audits",
  },
  {
    id: "executive",
    name: "Executive Intelligence",
    to: "/executive-intelligence",
    icon: LineChart,
    accentColor: "#38bdf8",
    description: "Strategic executive overview, risk & hospital twin",
  },
];

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

  const activeWorkspace = getWorkspaceForPath(pathname);

  const handleLogout = async () => {
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
    <Sidebar
      collapsible={collapsible}
      className="border-r border-[#1a1c2e] bg-[#0c0d18] text-[#8e93a6] font-sans select-none"
      style={{ backgroundColor: "#0c0d18" }}
    >
      {/* 1. Header: NOS Brand Mark */}
      <SidebarHeader className="border-b border-[#181a2b] bg-[#0c0d18] px-3.5 py-3">
        <Link to="/workspace" className="flex items-center gap-2.5">
          <img
            src={NOS_MARK}
            alt={NOS_LOGO_ALT}
            className="h-6 w-6 rounded-md object-contain shrink-0 ring-1 ring-white/10"
          />
          {!collapsed && (
            <div className="min-w-0">
              <div className="truncate text-[12.5px] font-bold uppercase tracking-[0.14em] text-white">
                NOS <span className="text-[#38bdf8]">Health</span>
              </div>
              <div className="truncate text-[9.5px] font-mono tracking-wider text-[#636882]">
                {session?.institutionName ?? "Hospital Operations"}
              </div>
            </div>
          )}
        </Link>
      </SidebarHeader>

      {/* 2. Global Workspaces Main Navigation (6 Primary Workspaces ONLY) */}
      <SidebarContent className="bg-[#0c0d18] px-2.5 py-3 gap-1 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded">
        <SidebarGroup className="p-0">
          {!collapsed && (
            <SidebarGroupLabel className="px-2 pb-1.5 text-[9px] font-mono font-bold uppercase tracking-[0.18em] text-[#5b6178]">
              Main Workspaces
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {MAIN_WORKSPACES.map((ws) => {
                const Icon = ws.icon;
                const isActive = activeWorkspace?.id === ws.id;

                return (
                  <SidebarMenuItem key={ws.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={ws.name}
                      className={`group relative h-9 px-2.5 text-[12.5px] rounded-lg transition-all ${
                        isActive
                          ? "bg-white/[0.09] text-white font-semibold shadow-xs border border-white/10"
                          : "text-[#8e93a6] hover:bg-white/[0.04] hover:text-[#e1e4ec] border border-transparent"
                      }`}
                    >
                      <Link to={ws.to} className="flex items-center gap-2.5 w-full">
                        <Icon
                          className={`h-4 w-4 shrink-0 transition-colors ${
                            isActive
                              ? "text-[#38bdf8]"
                              : "text-[#626880] group-hover:text-[#a0a6bd]"
                          }`}
                        />
                        {!collapsed && (
                          <>
                            <span className="truncate flex-1 tracking-tight">
                              {ws.name}
                            </span>
                            {isActive && (
                              <span
                                className="ml-auto h-2 w-2 rounded-full bg-[#38bdf8] shrink-0"
                                style={{
                                  boxShadow: "0 0 6px rgba(56, 189, 248, 0.8)",
                                }}
                                aria-hidden="true"
                              />
                            )}
                          </>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* 3. Footer: Session, Workspace Directory & Logout */}
      <SidebarFooter className="border-t border-[#181a2b] bg-[#0c0d18] p-2 flex flex-col gap-1">
        {session && !collapsed && (
          <div className="flex items-center gap-2 rounded-md bg-[#121424] p-1.5 border border-[#1b1e33]">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[9px] font-bold text-[#38bdf8]">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[10.5px] font-medium text-[#d0d4e4] leading-tight">
                {session.name ?? "Clinical User"}
              </div>
              <div className="truncate text-[9px] text-[#636882] leading-tight capitalize">
                {session.role ?? "Staff"}
              </div>
            </div>
          </div>
        )}

        <SidebarMenu className="gap-0.5">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Workspace Directory"
              className="h-7 px-2 text-[11px] text-[#787e96] hover:bg-white/[0.04] hover:text-[#d0d4e4]"
            >
              <Link to="/workspace" className="flex items-center gap-2">
                <LayoutGrid className="h-3.5 w-3.5 shrink-0 text-[#636882]" />
                {!collapsed && <span className="truncate">Workspace Directory</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {session && (
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Sign out"
                onClick={handleLogout}
                className="h-7 px-2 text-[11px] text-[#787e96] hover:bg-white/[0.04] hover:text-rose-400"
              >
                <LogOut className="h-3.5 w-3.5 shrink-0" />
                {!collapsed && <span className="truncate">Sign out</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
