import {
  LayoutDashboard,
  Users,
  Workflow,
  Award,
  BookOpen,
  FlaskConical,
  GraduationCap,
  LineChart,
  ClipboardList,
  UserRound,
  FileBarChart2,
  Building2,
  Settings,
  Activity,
} from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import logo from "@/assets/nos-logo.png.asset.json";

type NavItem = {
  title: string;
  url?: string;
  icon: React.ComponentType<{ className?: string }>;
  soon?: boolean;
};

const CLINICAL: NavItem[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Patients", url: "/", icon: UserRound },
  { title: "Procedure Documentation", url: "/procedure-documentation", icon: ClipboardList },
  { title: "Clinical Excellence Hub", url: "/clinical-excellence", icon: Award },
  { title: "Evidence-Based Practice", url: "/ebp", icon: BookOpen },
];

const INTELLIGENCE: NavItem[] = [
  { title: "Workforce Intelligence", url: "/workforce-intelligence", icon: Users },
  { title: "Nursing Workflow Intelligence", url: "/workflow-intelligence", icon: Workflow },
  { title: "Executive Intelligence", url: "/executive-intelligence", icon: LineChart },
  { title: "Hospital Digital Twin", url: "/digital-twin", icon: Activity },
];

const KNOWLEDGE: NavItem[] = [
  { title: "Research & Innovation", url: "/research", icon: FlaskConical },
  { title: "Learning & Development", url: "/learning", icon: GraduationCap },
];

const OPERATIONS: NavItem[] = [
  { title: "Reports", icon: FileBarChart2, soon: true },
  { title: "Administration", icon: Building2, soon: true },
  { title: "Settings", icon: Settings, soon: true },
];

export function AppSidebar({ collapsible = "icon" }: { collapsible?: "icon" | "offcanvas" | "none" }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  const renderGroup = (label: string, items: NavItem[]) => (
    <SidebarGroup>
      {!collapsed && (
        <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const Icon = item.icon;
            const active = item.url ? pathname === item.url : false;
            return (
              <SidebarMenuItem key={item.title}>
                {item.url && !item.soon ? (
                  <SidebarMenuButton
                    asChild
                    isActive={active}
                    tooltip={item.title}
                    className="data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-semibold"
                  >
                    <Link to={item.url} className="flex items-center gap-2">
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                ) : (
                  <SidebarMenuButton
                    tooltip={`${item.title} (coming soon)`}
                    className="opacity-60 cursor-not-allowed"
                    onClick={(e) => e.preventDefault()}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.title}</span>
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
  );

  return (
    <Sidebar collapsible={collapsible} className="border-r border-border">
      <SidebarHeader className="border-b border-border/60 py-3">
        <Link to="/" className="flex items-center gap-2 px-2">
          <img src={logo.url} alt="NOS Ecosystem" className="h-8 w-8 rounded-md object-contain" />
          {!collapsed && (
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold leading-tight text-foreground">
                NOS <span className="text-primary">Ecosystem</span>
              </div>
              <div className="truncate text-[10px] uppercase tracking-wider text-muted-foreground">
                Clinical Workspace
              </div>
            </div>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent className="gap-0">
        {renderGroup("Clinical", CLINICAL)}
        {renderGroup("Intelligence", INTELLIGENCE)}
        {renderGroup("Knowledge", KNOWLEDGE)}
        {renderGroup("Operations", OPERATIONS)}
      </SidebarContent>
    </Sidebar>
  );
}
