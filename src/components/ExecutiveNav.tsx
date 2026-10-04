import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Activity,
  Users,
  Award,
  AlertTriangle,
  Zap,
  FileBarChart,
} from "lucide-react";

export type ExecutiveTabId =
  | "overview"
  | "performance"
  | "workforce"
  | "quality"
  | "risk"
  | "trends"
  | "reports";

interface ExecutiveNavProps {
  activeTab?: ExecutiveTabId;
}

interface NavItem {
  id: ExecutiveTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  to?: string;
  comingSoon?: boolean;
}

const TABS: NavItem[] = [
  {
    id: "overview",
    label: "Executive Overview",
    icon: LayoutDashboard,
    to: "/executive-intelligence",
  },
  {
    id: "performance",
    label: "Hospital Performance",
    icon: Activity,
    to: "/digital-twin",
  },
  {
    id: "workforce",
    label: "Workforce Intelligence",
    icon: Users,
    comingSoon: true,
  },
  {
    id: "quality",
    label: "Quality Intelligence",
    icon: Award,
    comingSoon: true,
  },
  {
    id: "risk",
    label: "Operational Risk",
    icon: AlertTriangle,
    comingSoon: true,
  },
  {
    id: "trends",
    label: "Strategic Trends",
    icon: Zap,
    comingSoon: true,
  },
  {
    id: "reports",
    label: "Executive Reports",
    icon: FileBarChart,
    comingSoon: true,
  },
];

export function ExecutiveNav({ activeTab }: ExecutiveNavProps) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  const currentTab: ExecutiveTabId =
    activeTab ??
    (pathname === "/digital-twin"
      ? "performance"
      : "overview");

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none border-b border-border/70">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;

        if (tab.comingSoon || !tab.to) {
          return (
            <span
              key={tab.id}
              className="inline-flex items-center gap-2 whitespace-nowrap px-3 py-1.5 text-[12px] font-medium text-muted-foreground/50 rounded-lg cursor-not-allowed shrink-0 select-none"
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border">
                Soon
              </span>
            </span>
          );
        }

        return (
          <Link
            key={tab.id}
            to={tab.to}
            className={`inline-flex items-center gap-2 whitespace-nowrap px-3.5 py-1.5 text-[12px] font-medium rounded-lg transition-colors cursor-pointer shrink-0 ${
              isActive
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Icon
              className={`h-3.5 w-3.5 ${
                isActive ? "text-primary-foreground" : "text-muted-foreground"
              }`}
            />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
