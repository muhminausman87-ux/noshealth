import {
  Stethoscope,
  Users,
  HeartHandshake,
  GraduationCap,
  Award,
  LineChart,
  ClipboardList,
  UserRound,
  LayoutDashboard,
  Pill,
  FileText,
  FlaskConical,
  BookOpen,
  ClipboardCheck,
  Workflow,
  Activity,
  Shield,
  Coffee,
  BatteryLow,
  Sparkles,
  BadgeCheck,
  Rocket,
  Zap,
  Target,
  Briefcase,
  CalendarClock,
  HeartPulse,
  Gauge,
  TrendingUp,
  AlertTriangle,
  FileBarChart,
  Layers,
  Repeat,
  CalendarDays,
  MessageSquareHeart,
  LifeBuoy,
  UserCheck,
  Bot,
  Settings,
  Plug,
  ShieldCheck,
} from "lucide-react";
import type { Role } from "./auth";

export type WorkspaceId =
  | "clinical"
  | "workforce"
  | "wellbeing"
  | "growth"
  | "excellence"
  | "executive";

export type WorkspaceModule = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  to?: string; // if omitted, module is "coming soon"
};

export type Workspace = {
  id: WorkspaceId;
  name: string;
  short: string;
  purpose: string;
  /** Subtle tonal accent — always within/near the FROMEX blue family. */
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  landing: string; // route
  modules: WorkspaceModule[];
};

export const WORKSPACES: Record<WorkspaceId, Workspace> = {
  clinical: {
    id: "clinical",
    name: "Clinical Workspace",
    short: "Clinical",
    purpose: "Patient care and clinical workflow for bedside teams.",
    color: "#1268d8",
    icon: Stethoscope,
    landing: "/clinical",
    modules: [
      { label: "Patient Census", icon: UserRound, to: "/clinical" },
      { label: "Patient Overview", icon: LayoutDashboard, to: "/" },
      { label: "Clinical Documentation", icon: FileText, to: "/procedure-documentation" },
      { label: "Clinical Tasks", icon: ClipboardCheck },
      { label: "Vitals & Observations", icon: HeartPulse },
      { label: "Medication Management", icon: Pill },
      { label: "Nursing Care Plans", icon: BookOpen },
      { label: "Handover / SBAR", icon: Workflow },
      { label: "Investigations", icon: FlaskConical },
      { label: "Clinical AI Assistant", icon: Bot },
    ],
  },
  workforce: {
    id: "workforce",
    name: "Workforce Operations",
    short: "Workforce",
    purpose: "Workforce planning and hospital operations for nursing leadership.",
    color: "#28a9f5",
    icon: Users,
    landing: "/workforce-intelligence",
    modules: [
      { label: "Workforce Operations Dashboard", icon: LayoutDashboard, to: "/workforce-intelligence" },
      { label: "AI Duty Scheduling Engine", icon: CalendarClock, to: "/scheduling" },
      { label: "Shift Management", icon: CalendarDays, to: "/scheduling" },
      { label: "Workflow Intelligence", icon: Activity, to: "/workflow-intelligence" },
      { label: "Assignments", icon: ClipboardList, to: "/workforce" },
      { label: "Float Pool", icon: Users, to: "/float-pool" },
      { label: "Leave Management", icon: Repeat, to: "/leave-management" },
      { label: "Escalations", icon: AlertTriangle, to: "/escalations" },
    ],
  },
  wellbeing: {
    id: "wellbeing",
    name: "Employee Wellbeing",
    short: "Wellbeing",
    purpose: "Support and retain nurses through wellbeing intelligence.",
    color: "#0f8fb5",
    icon: HeartHandshake,
    landing: "/wellbeing",
    modules: [
      { label: "Wellbeing Overview", icon: LayoutDashboard, to: "/wellbeing" },
      { label: "Fatigue & Rest", icon: BatteryLow },
      { label: "Break Management", icon: Coffee },
      { label: "Workload Signals", icon: Activity },
      { label: "Shift Patterns", icon: CalendarDays },
      { label: "Nurse Feedback", icon: MessageSquareHeart },
      { label: "Support Resources", icon: LifeBuoy },
      { label: "Retention Insights", icon: UserCheck },
    ],
  },
  growth: {
    id: "growth",
    name: "Employee Growth",
    short: "Growth",
    purpose: "Professional development, competencies, and career pathways.",
    color: "#3d5bd9",
    icon: GraduationCap,
    landing: "/growth",
    modules: [
      { label: "Competency Management", icon: BadgeCheck, to: "/growth" },
      { label: "Training", icon: ClipboardCheck, to: "/learning" },
      { label: "Education", icon: GraduationCap, to: "/education" },
      { label: "Professional Development", icon: Rocket, to: "/professional-development" },
      { label: "Skills Matrix", icon: Layers, to: "/skills-matrix" },
      { label: "Certifications", icon: Award, to: "/certifications" },
      { label: "Career Pathways", icon: Briefcase, to: "/career-pathways" },
      { label: "Growth Plans", icon: TrendingUp, to: "/growth-plans" },
    ],
  },
  excellence: {
    id: "excellence",
    name: "Clinical Excellence",
    short: "Excellence",
    purpose: "Quality improvement, audits, and evidence-based practice.",
    color: "#0a5bb5",
    icon: Award,
    landing: "/clinical-excellence",
    modules: [
      { label: "Quality Dashboard", icon: LayoutDashboard, to: "/clinical-excellence" },
      { label: "Evidence-Based Practice", icon: BookOpen, to: "/ebp" },
      { label: "Clinical Improvement", icon: Sparkles, to: "/research" },
      { label: "Clinical Audits", icon: ClipboardCheck },
      { label: "Infection Prevention & Control", icon: Shield },
      { label: "Nursing Quality Indicators", icon: Target },
    ],
  },
  executive: {
    id: "executive",
    name: "Executive Intelligence",
    short: "Executive",
    purpose: "Executive decision support and strategic intelligence.",
    color: "#073b8f",
    icon: LineChart,
    landing: "/executive-intelligence",
    modules: [
      { label: "Executive Overview", icon: LayoutDashboard, to: "/executive-intelligence" },
      { label: "Hospital Performance", icon: Activity, to: "/digital-twin" },
      { label: "Workforce Intelligence", icon: Users },
      { label: "Quality Intelligence", icon: Award },
      { label: "Operational Risk", icon: AlertTriangle },
      { label: "Strategic Trends", icon: Zap },
      { label: "Executive Reports", icon: FileBarChart },
    ],
  },
};

export const WORKSPACE_LIST = Object.values(WORKSPACES);

/**
 * Secondary Administration navigation — deliberately kept separate from the
 * six NOS workspaces. Items without a route are placeholders (coming soon).
 */
export const ADMIN_NAV: { label: string; icon: React.ComponentType<{ className?: string }>; to?: string }[] = [
  { label: "Settings", icon: Settings },
  { label: "Integrations", icon: Plug },
  { label: "Audit & Security", icon: ShieldCheck },
];

// Map a pathname to its owning workspace (best-effort).
export function getWorkspaceForPath(pathname: string): Workspace | null {
  if (
    pathname === "/" ||
    pathname.startsWith("/clinical") ||
    pathname.startsWith("/patient/") ||
    pathname.startsWith("/procedure-documentation")
  ) {
    return WORKSPACES.clinical;
  }
  if (
    pathname.startsWith("/workforce") ||
    pathname.startsWith("/nursing-workforce") ||
    pathname.startsWith("/workflow-intelligence") ||
    pathname.startsWith("/duty-scheduling") ||
    pathname.startsWith("/scheduling") ||
    pathname.startsWith("/unit-capacity") ||
    pathname.startsWith("/float-pool") ||
    pathname.startsWith("/leave-management") ||
    pathname.startsWith("/escalations")
  ) {
    return WORKSPACES.workforce;
  }
  if (pathname.startsWith("/wellbeing")) {
    return WORKSPACES.wellbeing;
  }
  if (
    pathname.startsWith("/growth") ||
    pathname.startsWith("/learning") ||
    pathname.startsWith("/education") ||
    pathname.startsWith("/professional-development") ||
    pathname.startsWith("/skills-matrix") ||
    pathname.startsWith("/certifications") ||
    pathname.startsWith("/career-pathways") ||
    pathname.startsWith("/growth-plans")
  ) {
    return WORKSPACES.growth;
  }
  if (
    pathname.startsWith("/clinical-excellence") ||
    pathname.startsWith("/excellence") ||
    pathname.startsWith("/ebp")
  ) {
    return WORKSPACES.excellence;
  }
  if (pathname.startsWith("/executive") || pathname.startsWith("/digital-twin")) {
    return WORKSPACES.executive;
  }
  if (pathname.startsWith("/research")) {
    return WORKSPACES.excellence;
  }
  return null;
}

export function landingForRole(role: Role): string {
  switch (role) {
    case "admin":
      return "/workforce-intelligence";
    case "doctor":
    case "lab":
    case "radiology":
    case "staff":
    default:
      return "/clinical";
  }
}
