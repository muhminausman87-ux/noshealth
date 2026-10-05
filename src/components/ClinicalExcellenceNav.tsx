import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  BookOpen,
  Sparkles,
  ClipboardCheck,
  Shield,
  Target,
} from "lucide-react";

export type ExcellenceTabId =
  | "quality"
  | "ebp"
  | "improvement"
  | "audits"
  | "ipc"
  | "nsqi";

interface ClinicalExcellenceNavProps {
  activeTab?: ExcellenceTabId;
}

interface NavItem {
  id: ExcellenceTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  to?: string;
  comingSoon?: boolean;
}

const TABS: NavItem[] = [
  {
    id: "quality",
    label: "Quality Dashboard",
    icon: LayoutDashboard,
    to: "/clinical-excellence",
  },
  {
    id: "ebp",
    label: "Evidence-Based Practice",
    icon: BookOpen,
    to: "/ebp",
  },
  {
    id: "improvement",
    label: "Clinical Improvement",
    icon: Sparkles,
    to: "/research",
  },
  {
    id: "audits",
    label: "Clinical Audits",
    icon: ClipboardCheck,
    comingSoon: true,
  },
  {
    id: "ipc",
    label: "Infection Prevention & Control",
    icon: Shield,
    comingSoon: true,
  },
  {
    id: "nsqi",
    label: "Nursing Quality Indicators",
    icon: Target,
    comingSoon: true,
  },
];

export function ClinicalExcellenceNav({ activeTab }: ClinicalExcellenceNavProps) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  const currentTab: ExcellenceTabId =
    activeTab ??
    (pathname === "/ebp"
      ? "ebp"
      : pathname === "/research"
      ? "improvement"
      : "quality");

  return (
    <nav
      className="w-full min-w-0 max-w-full overflow-x-auto overflow-y-hidden pb-1 border-b border-border/70 shrink"
      style={{
        scrollbarWidth: "thin",
        WebkitOverflowScrolling: "touch",
      }}
      aria-label="Clinical Excellence Navigation"
    >
      <div
        className="flex items-center gap-1.5 flex-nowrap pr-6 sm:pr-12"
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
    </nav>
  );
}
