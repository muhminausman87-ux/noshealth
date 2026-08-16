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
  ScanLine,
  BookOpen,
  ClipboardCheck,
  Workflow,
  Activity,
  Brain,
  Shield,
  Coffee,
  BatteryLow,
  Sparkles,
  Trophy,
  BadgeCheck,
  Rocket,
  Building2,
  Zap,
  Target,
  DollarSign,
  Briefcase,
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
  color: string; // hex or css var
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
    color: "#2563eb",
    icon: Stethoscope,
    landing: "/clinical",
    modules: [
      { label: "Patient List", icon: UserRound, to: "/clinical" },
      { label: "Clinical Dashboard", icon: LayoutDashboard, to: "/" },
      { label: "Assessments", icon: ClipboardCheck },
      { label: "Medication Administration", icon: Pill },
      { label: "Nursing Documentation", icon: FileText },
      { label: "Laboratory Results", icon: FlaskConical },
      { label: "Radiology", icon: ScanLine },
      { label: "Care Plans", icon: BookOpen },
      { label: "Handover", icon: Workflow },
      { label: "Procedure Documentation", icon: ClipboardList, to: "/procedure-documentation" },
    ],
  },
  workforce: {
    id: "workforce",
    name: "Workforce Operations",
    short: "Workforce",
    purpose: "Workforce planning and hospital operations for nursing leadership.",
    color: "#0891b2",
    icon: Users,
    landing: "/workforce",
    modules: [
      // Source of truth for capacity vs demand decisions.
      { label: "Nursing Workforce Intelligence", icon: LineChart, to: "/nursing-workforce-intelligence" },
      // Human-centered rostering; consumes demand/capacity signals, never recomputes them.
      { label: "Intelligent Duty Scheduling", icon: CalendarClock, to: "/duty-scheduling" },
      // Operational overview dashboard (capacity, risk, nurse voice, staffing analytics live here).
      { label: "Workforce Operations Dashboard", icon: LayoutDashboard, to: "/workforce-intelligence" },
      { label: "Nursing Workforce Digital Twin", icon: Activity, to: "/nursing-workforce-twin" },
      { label: "Unit Capacity", icon: Shield, to: "/unit-capacity" },
      { label: "Workflow Intelligence", icon: Brain, to: "/workflow-intelligence" },
      { label: "Float Pool", icon: Users },
      { label: "Shift Management", icon: ClipboardList, to: "/duty-scheduling" },
    ],

  },
  wellbeing: {
    id: "wellbeing",
    name: "Employee Wellbeing",
    short: "Wellbeing",
    purpose: "Support and retain nurses through wellbeing intelligence.",
    color: "#059669",
    icon: HeartHandshake,
    landing: "/wellbeing",
    modules: [
      { label: "Wellbeing Dashboard", icon: LayoutDashboard, to: "/wellbeing" },
      { label: "Burnout Intelligence", icon: BatteryLow },
      { label: "Fatigue Monitoring", icon: Activity },
      { label: "Break Management", icon: Coffee },
      { label: "Peer Recognition", icon: Trophy },
      { label: "Mental Wellbeing", icon: Sparkles },
      { label: "Support Requests", icon: HeartHandshake },
      { label: "Recovery Analytics", icon: LineChart },
    ],
  },
  growth: {
    id: "growth",
    name: "Employee Growth",
    short: "Growth",
    purpose: "Professional development, competencies, and career pathways.",
    color: "#7c3aed",
    icon: GraduationCap,
    landing: "/growth",
    modules: [
      { label: "Learning & Development", icon: GraduationCap, to: "/learning" },
      { label: "Competencies", icon: BadgeCheck },
      { label: "Certifications", icon: Award },
      { label: "Mandatory Training", icon: ClipboardCheck },
      { label: "Career Pathways", icon: Briefcase },
      { label: "Nursing Informatics", icon: LayoutDashboard },
      { label: "Leadership Development", icon: Users },
      { label: "Innovation Projects", icon: Rocket, to: "/research" },
    ],
  },
  excellence: {
    id: "excellence",
    name: "Clinical Excellence",
    short: "Excellence",
    purpose: "Quality improvement, audits, and evidence-based practice.",
    color: "#d97706",
    icon: Award,
    landing: "/excellence",
    modules: [
      { label: "Evidence-Based Practice", icon: BookOpen, to: "/ebp" },
      { label: "Clinical Audits", icon: ClipboardCheck },
      { label: "Infection Prevention", icon: Shield },
      { label: "Quality Indicators", icon: Target },
      { label: "Research", icon: FlaskConical, to: "/research" },
      { label: "Clinical Excellence Dashboard", icon: Award, to: "/clinical-excellence" },
    ],
  },
  executive: {
    id: "executive",
    name: "Executive Intelligence",
    short: "Executive",
    purpose: "Executive decision support and strategic intelligence.",
    color: "#be123c",
    icon: LineChart,
    landing: "/executive",
    modules: [
      { label: "Executive Dashboard", icon: LayoutDashboard, to: "/executive-intelligence" },
      { label: "Hospital Digital Twin", icon: Activity, to: "/digital-twin" },
      { label: "Enterprise Intelligence", icon: Brain, to: "/executive-intelligence" },
      { label: "Strategic KPIs", icon: Target },
      { label: "Workforce Forecasting", icon: Zap },
      { label: "Financial Impact", icon: DollarSign },
      { label: "AI Executive Briefing", icon: Sparkles, to: "/executive-intelligence" },
    ],
  },
};

export const WORKSPACE_LIST = Object.values(WORKSPACES);

// Map a pathname to its owning workspace (best-effort).
export function getWorkspaceForPath(pathname: string): Workspace | null {
  if (pathname.startsWith("/clinical-excellence")) return WORKSPACES.excellence;
  if (pathname.startsWith("/clinical")) return WORKSPACES.clinical;
  if (pathname.startsWith("/patient/")) return WORKSPACES.clinical;
  if (pathname.startsWith("/procedure-documentation")) return WORKSPACES.clinical;
  if (pathname.startsWith("/workforce")) return WORKSPACES.workforce;
  if (pathname.startsWith("/workflow-intelligence")) return WORKSPACES.workforce;
  if (pathname.startsWith("/nursing-workforce-twin")) return WORKSPACES.workforce;
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
