import { Link, useRouterState } from "@tanstack/react-router";
import {
  UserRound,
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  HeartPulse,
  Pill,
  BookOpen,
  Workflow,
  FlaskConical,
  Bot,
} from "lucide-react";

export type ClinicalTabId =
  | "census"
  | "overview"
  | "documentation"
  | "tasks"
  | "vitals"
  | "meds"
  | "careplans"
  | "handover"
  | "investigations"
  | "ai";

interface ClinicalNavProps {
  activeTab?: ClinicalTabId;
}

interface NavItem {
  id: ClinicalTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  to?: string;
  comingSoon?: boolean;
}

const TABS: NavItem[] = [
  {
    id: "census",
    label: "Patient Census",
    icon: UserRound,
    to: "/clinical",
  },
  {
    id: "overview",
    label: "Patient Overview",
    icon: LayoutDashboard,
    to: "/",
  },
  {
    id: "documentation",
    label: "Clinical Documentation",
    icon: FileText,
    to: "/procedure-documentation",
  },
  {
    id: "tasks",
    label: "Clinical Tasks",
    icon: ClipboardCheck,
    comingSoon: true,
  },
  {
    id: "vitals",
    label: "Vitals & Observations",
    icon: HeartPulse,
    comingSoon: true,
  },
  {
    id: "meds",
    label: "Medication Management",
    icon: Pill,
    comingSoon: true,
  },
  {
    id: "careplans",
    label: "Nursing Care Plans",
    icon: BookOpen,
    comingSoon: true,
  },
  {
    id: "handover",
    label: "Handover / SBAR",
    icon: Workflow,
    comingSoon: true,
  },
  {
    id: "investigations",
    label: "Investigations",
    icon: FlaskConical,
    comingSoon: true,
  },
  {
    id: "ai",
    label: "Clinical AI Assistant",
    icon: Bot,
    comingSoon: true,
  },
];

export function ClinicalNav({ activeTab }: ClinicalNavProps) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  const currentTab: ClinicalTabId =
    activeTab ??
    (pathname === "/procedure-documentation"
      ? "documentation"
      : pathname === "/"
      ? "overview"
      : "census");

  return (
    <nav
      className="w-full min-w-0 max-w-full overflow-x-auto overflow-y-hidden pb-1 border-b border-border/70 shrink"
      style={{
        scrollbarWidth: "thin",
        WebkitOverflowScrolling: "touch",
      }}
      aria-label="Clinical Navigation"
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
