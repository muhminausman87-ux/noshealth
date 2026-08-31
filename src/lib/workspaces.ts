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
      { label: "Workforce Operations Dashboard", icon: LayoutDashboard, to: "/workforce-intelligence" },
      // Source of truth for capacity vs demand decisions.
      {
        label: "Nursing Workforce Intelligence",
        icon: LineChart,
        to: "/nursing-workforce-intelligence",
      },
      { label: "AI Duty Scheduling Engine", icon: CalendarClock, to: "/scheduling" },
      { label: "Intelligent Duty Scheduling", icon: CalendarDays, to: "/duty-scheduling" },
      { label: "Shift Management", icon: CalendarClock, to: "/duty-scheduling" },
      { label: "Nursing Workforce Digital Twin", icon: Layers, to: "/nursing-workforce-twin" },
      { label: "Unit Capacity", icon: Gauge, to: "/unit-capacity" },
      { label: "Workflow Intelligence", icon: Activity, to: "/workflow-intelligence" },
      { label: "Assignment Management", icon: ClipboardList },
      { label: "Float Pool", icon: Users },
      { label: "Leave Management", icon: Repeat },
      { label: "Escalations", icon: AlertTriangle },
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
    color: "#3d5bd9",
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
    color: "#0a5bb5",
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
    color: "#073b8f",
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
