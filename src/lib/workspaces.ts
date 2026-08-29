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
  Brain,
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
      { label: "Vitals & Observations", icon: HeartPulse },
      { label: "Medication Management", icon: Pill },
      { label: "Nursing Care Plans", icon: BookOpen },
      { label: "Clinical Tasks", icon: ClipboardCheck, to: "/workflow-intelligence" },
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
    landing: "/workforce",
    modules: [
      // Source of truth for capacity vs demand decisions.
      {
        label: "Nursing Workforce Intelligence",
        icon: LineChart,
        to: "/nursing-workforce-intelligence",
      },
      { label: "Intelligent Duty Scheduling", icon: CalendarClock, to: "/scheduling" },
      { label: "Roster Management", icon: CalendarDays, to: "/duty-scheduling" },
      { label: "Staffing & Capacity", icon: Gauge, to: "/unit-capacity" },
      { label: "Assignment Management", icon: ClipboardList, to: "/workforce-intelligence" },
      { label: "Leave Management", icon: Repeat },
      { label: "Float / Resource Pool", icon: Layers, to: "/nursing-workforce-twin" },
      { label: "Workforce Analytics", icon: Activity, to: "/workflow-intelligence" },
      { label: "Escalations", icon: AlertTriangle },
    ],
  },
  wellbeing: {
    id: "wellbeing",
    name: "Employee Wellbeing",
    short: "Wellbeing",
    purpose: "Support and retain nurses through wellbeing intelligence.",
    color: "#16a37b",
    icon: HeartHandshake,
    landing: "/wellbeing",
    modules: [
      { label: "Wellbeing Overview", icon: LayoutDashboard, to: "/wellbeing" },
      { label: "Fatigue & Recovery Signals", icon: BatteryLow },
      { label: "Break Management", icon: Coffee },
      { label: "Workload Signals", icon: Activity },
      { label: "Shift Pattern Insights", icon: CalendarDays },
      { label: "Wellbeing Check-ins", icon: MessageSquareHeart },
      { label: "Support Resources", icon: LifeBuoy },
      { label: "Retention Insights", icon: UserCheck },
    ],
  },
  growth: {
    id: "growth",
    name: "Employee Growth",
    short: "Growth",
    purpose: "Professional development, competencies, and career pathways.",
    color: "#5b6ee0",
    icon: GraduationCap,
    landing: "/growth",
    modules: [
      { label: "Competency Management", icon: BadgeCheck },
      { label: "Skills Matrix", icon: Layers },
      { label: "Training", icon: ClipboardCheck, to: "/learning" },
      { label: "Education", icon: GraduationCap, to: "/learning" },
      { label: "Certifications", icon: Award },
      { label: "Career Pathways", icon: Briefcase },
      { label: "Professional Development", icon: Rocket, to: "/research" },
      { label: "Growth Plans", icon: TrendingUp },
    ],
  },
  excellence: {
    id: "excellence",
    name: "Clinical Excellence",
    short: "Excellence",
    purpose: "Quality improvement, audits, and evidence-based practice.",
    color: "#e0a03a",
    icon: Award,
    landing: "/excellence",
    modules: [
      { label: "Quality Dashboard", icon: LayoutDashboard, to: "/clinical-excellence" },
      { label: "Clinical Audits", icon: ClipboardCheck },
      { label: "Infection Prevention & Control", icon: Shield },
      { label: "Nursing Quality Indicators", icon: Target },
      { label: "Evidence-Based Practice", icon: BookOpen, to: "/ebp" },
      { label: "Clinical Improvement", icon: Sparkles, to: "/research" },
    ],
  },
  executive: {
    id: "executive",
    name: "Executive Intelligence",
    short: "Executive",
    purpose: "Executive decision support and strategic intelligence.",
    color: "#d4657a",
    icon: LineChart,
    landing: "/executive",
    modules: [
      { label: "Executive Overview", icon: LayoutDashboard, to: "/executive-intelligence" },
      { label: "Hospital Performance", icon: Activity, to: "/digital-twin" },
      { label: "Workforce Intelligence", icon: Users, to: "/nursing-workforce-intelligence" },
      { label: "Quality Intelligence", icon: Award, to: "/clinical-excellence" },
      { label: "Operational Risk", icon: AlertTriangle },
      { label: "Strategic Trends", icon: Zap },
      { label: "Executive Reports", icon: FileBarChart },
    ],
  },
};

export const WORKSPACE_LIST = Object.values(WORKSPACES);

/** Global, workspace-independent navigation shown above workspace modules. */
export const GLOBAL_NAV: { label: string; icon: React.ComponentType<{ className?: string }>; to?: string }[] = [
  { label: "Workspaces", icon: Layers, to: "/workspace" },
  { label: "Tasks", icon: ClipboardCheck },
  { label: "Messages", icon: MessageSquareHeart },
  { label: "Reports", icon: FileBarChart },
  { label: "Analytics", icon: Brain },
  { label: "Support", icon: LifeBuoy },
];

// Map a pathname to its owning workspace (best-effort).
export function getWorkspaceForPath(pathname: string): Workspace | null {
  if (pathname.startsWith("/clinical-excellence")) return WORKSPACES.excellence;
  if (pathname.startsWith("/clinical")) return WORKSPACES.clinical;
  if (pathname.startsWith("/patient/")) return WORKSPACES.clinical;
  if (pathname.startsWith("/procedure-documentation")) return WORKSPACES.clinical;
  if (pathname.startsWith("/workforce")) return WORKSPACES.workforce;
  if (pathname.startsWith("/nursing-workforce")) return WORKSPACES.workforce;
  if (pathname.startsWith("/workflow-intelligence")) return WORKSPACES.workforce;
  if (pathname.startsWith("/duty-scheduling")) return WORKSPACES.workforce;
  if (pathname.startsWith("/scheduling")) return WORKSPACES.workforce;
  if (pathname.startsWith("/unit-capacity")) return WORKSPACES.workforce;
  if (pathname.startsWith("/wellbeing")) return WORKSPACES.wellbeing;
  if (pathname.startsWith("/growth")) return WORKSPACES.growth;
  if (pathname.startsWith("/learning")) return WORKSPACES.growth;
  if (pathname.startsWith("/excellence")) return WORKSPACES.excellence;
  if (pathname.startsWith("/ebp")) return WORKSPACES.excellence;
  if (pathname.startsWith("/research")) return WORKSPACES.excellence;
  if (pathname.startsWith("/executive")) return WORKSPACES.executive;
  if (pathname.startsWith("/digital-twin")) return WORKSPACES.executive;
  return null;
}

export function landingForRole(role: Role): string {
  switch (role) {
    case "admin":
      return "/workspace";
    case "doctor":
    case "lab":
    case "radiology":
    case "staff":
    default:
      return "/clinical";
  }
}
