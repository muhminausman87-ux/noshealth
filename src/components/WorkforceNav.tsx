import { useRef, useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  CalendarClock,
  CalendarDays,
  Activity,
  ClipboardList,
  Users,
  Repeat,
  AlertTriangle,
} from "lucide-react";

export type WorkforceTabId =
  | "dashboard"
  | "scheduling"
  | "shifts"
  | "workflow"
  | "assignments"
  | "float"
  | "leave"
  | "escalations";

interface WorkforceNavProps {
  activeTab?: WorkforceTabId;
}

interface NavItem {
  id: WorkforceTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  to?: string;
  comingSoon?: boolean;
}

const TABS: NavItem[] = [
  {
    id: "dashboard",
    label: "Workforce Operations Dashboard",
    icon: LayoutDashboard,
    to: "/workforce-intelligence",
  },
  {
    id: "scheduling",
    label: "AI Duty Scheduling Engine",
    icon: CalendarClock,
    to: "/scheduling",
  },
  {
    id: "shifts",
    label: "Shift Management",
    icon: CalendarDays,
    to: "/scheduling",
  },
  {
    id: "workflow",
    label: "Workflow Intelligence",
    icon: Activity,
    to: "/workflow-intelligence",
  },
  {
    id: "assignments",
    label: "Assignments",
    icon: ClipboardList,
    to: "/workforce",
  },
  {
    id: "float",
    label: "Float Pool",
    icon: Users,
    to: "/float-pool",
  },
  {
    id: "leave",
    label: "Leave Management",
    icon: Repeat,
    to: "/leave-management",
  },
  {
    id: "escalations",
    label: "Escalations",
    icon: AlertTriangle,
    to: "/escalations",
  },
];

export function WorkforceNav({ activeTab }: WorkforceNavProps) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const navRef = useRef<HTMLElement>(null);

  const currentTab: WorkforceTabId =
    activeTab ??
    (pathname === "/scheduling" || pathname === "/duty-scheduling"
      ? "scheduling"
      : pathname === "/workflow-intelligence"
      ? "workflow"
      : pathname === "/workforce"
      ? "assignments"
      : pathname.startsWith("/float-pool")
      ? "float"
      : pathname.startsWith("/leave-management")
      ? "leave"
      : pathname.startsWith("/escalations")
      ? "escalations"
      : "dashboard");

  // Keep active tab visible in horizontal scroll track
  useEffect(() => {
    if (navRef.current) {
      const activeEl = navRef.current.querySelector<HTMLElement>('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
      }
    }
  }, [currentTab]);

  return (
    <nav
      ref={navRef}
      className="w-full min-w-0 max-w-full overflow-x-auto overflow-y-hidden pb-1 border-b border-border/70 shrink"
      style={{
        scrollbarWidth: "thin",
        WebkitOverflowScrolling: "touch",
      }}
      aria-label="Workforce Operations Navigation"
    >
      <div
        className="flex items-center gap-1.5 flex-nowrap pr-12 sm:pr-16"
        style={{
          width: "max-content",
          minWidth: "max-content",
        }}
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          if (tab.comingSoon || !tab.to) {
            return (
              <span
                key={tab.id}
                data-active={isActive ? "true" : "false"}
                style={{
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                  width: "fit-content",
                  minWidth: "fit-content",
                }}
                className="inline-flex items-center gap-2 whitespace-nowrap px-3.5 py-1.5 text-[12px] font-medium text-muted-foreground/50 rounded-lg cursor-not-allowed shrink-0 select-none"
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="whitespace-nowrap shrink-0">{tab.label}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border shrink-0">
                  Soon
                </span>
              </span>
            );
          }

          return (
            <Link
              key={tab.id}
              to={tab.to}
              data-active={isActive ? "true" : "false"}
              style={{
                flexShrink: 0,
                whiteSpace: "nowrap",
                width: "fit-content",
                minWidth: "fit-content",
              }}
              className={`inline-flex items-center gap-2 whitespace-nowrap px-3.5 py-1.5 text-[12px] font-medium rounded-lg transition-colors cursor-pointer shrink-0 select-none ${
                isActive
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Icon
                className={`h-3.5 w-3.5 shrink-0 ${
                  isActive ? "text-primary-foreground" : "text-muted-foreground"
                }`}
              />
              <span className="whitespace-nowrap shrink-0">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
