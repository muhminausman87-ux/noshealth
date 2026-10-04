import { useRef, useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  BadgeCheck,
  ClipboardCheck,
  GraduationCap,
  Rocket,
  Layers,
  Award,
  Briefcase,
  TrendingUp,
} from "lucide-react";

export type GrowthTabId =
  | "competency"
  | "training"
  | "education"
  | "development"
  | "matrix"
  | "certifications"
  | "pathways"
  | "plans";

interface EmployeeGrowthNavProps {
  activeTab?: GrowthTabId;
}

interface NavItem {
  id: GrowthTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  to: string;
  comingSoon?: boolean;
}

const TABS: NavItem[] = [
  {
    id: "competency",
    label: "Competency Management",
    icon: BadgeCheck,
    to: "/growth",
  },
  {
    id: "training",
    label: "Training",
    icon: ClipboardCheck,
    to: "/learning",
  },
  {
    id: "education",
    label: "Education",
    icon: GraduationCap,
    to: "/education",
  },
  {
    id: "development",
    label: "Professional Development",
    icon: Rocket,
    to: "/professional-development",
  },
  {
    id: "matrix",
    label: "Skills Matrix",
    icon: Layers,
    to: "/skills-matrix",
  },
  {
    id: "certifications",
    label: "Certifications",
    icon: Award,
    to: "/certifications",
  },
  {
    id: "pathways",
    label: "Career Pathways",
    icon: Briefcase,
    to: "/career-pathways",
  },
  {
    id: "plans",
    label: "Growth Plans",
    icon: TrendingUp,
    to: "/growth-plans",
  },
];

export function EmployeeGrowthNav({ activeTab }: EmployeeGrowthNavProps) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const navRef = useRef<HTMLElement>(null);

  const currentTab: GrowthTabId =
    activeTab ??
    (pathname.startsWith("/learning")
      ? "training"
      : pathname.startsWith("/education")
      ? "education"
      : pathname.startsWith("/professional-development")
      ? "development"
      : pathname.startsWith("/skills-matrix")
      ? "matrix"
      : pathname.startsWith("/certifications")
      ? "certifications"
      : pathname.startsWith("/career-pathways")
      ? "pathways"
      : pathname.startsWith("/growth-plans")
      ? "plans"
      : "competency");

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
      aria-label="Employee Growth Navigation"
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
