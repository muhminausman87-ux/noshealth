import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { EmployeeGrowthNav } from "@/components/EmployeeGrowthNav";
import {
  Award,
  LayoutDashboard,
  BadgeCheck,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  Users,
  PlusCircle,
  FileText,
  Calendar,
  Building2,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { DEPARTMENTS, Department } from "@/lib/departments";

/* ── Route Definition ─────────────────────────────────────────── */
export const Route = createFileRoute("/_authenticated/certifications")({
  validateSearch: (search: Record<string, unknown>): { tab?: string } => ({
    tab: typeof search.tab === "string" ? search.tab : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Certifications · Employee Growth · NOS" },
      {
        name: "description",
        content:
          "Professional nursing board certifications, credential tracking, expiry monitoring, and role requirement compliance.",
      },
    ],
  }),
  component: CertificationsPage,
});

/* ── Secondary Tabs ───────────────────────────────────────────── */
type TabId = "overview" | "active" | "expiring" | "requirements" | "history";

interface TabDef {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const TABS: TabDef[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "active", label: "Active Certifications", icon: BadgeCheck, badge: 18 },
  { id: "expiring", label: "Expiring Soon", icon: Clock, badge: 4 },
  { id: "requirements", label: "Role Requirements", icon: ShieldCheck },
  { id: "history", label: "Certification History", icon: FileText },
];

/* ── Types & Demo Dataset ─────────────────────────────────────── */
export interface NurseCertification {
  id: string;
  nurseName: string;
  role: string;
  department: string;
  deptId: Department;
  certificationName: string;
  code: string;
  issuingBoard: string;
  issueDate: string;
  expiryDate: string;
  status: "Active" | "Expiring in 30 Days" | "Expiring in 60 Days" | "Renewal In Progress" | "Expired";
  renewalRequirement: string;
  licenseNumber: string;
}

export interface RoleCertificationRequirement {
  role: string;
  unit: string;
  mandatoryCerts: string[];
  recommendedCerts: string[];
  complianceRate: number;
}

export interface CertificationHistoryAudit {
  id: string;
  nurseName: string;
  certificationName: string;
  action: "Renewed" | "Initial Issuance" | "Audit Verified" | "Recertification Exam Passed";
  actionDate: string;
  verifiedBy: string;
  previousExpiry: string;
  newExpiry: string;
}

const DEMO_CERTIFICATIONS: NurseCertification[] = [
  {
    id: "CERT-01",
    nurseName: "Elena Rostova",
    role: "Senior Staff Nurse (SN)",
    department: "Intensive Care Unit (ICU)",
    deptId: "icu",
    certificationName: "Critical Care Registered Nurse (CCRN)",
    code: "CCRN-Adult",
    issuingBoard: "American Association of Critical-Care Nurses (AACN)",
    issueDate: "2024-11-15",
    expiryDate: "2026-11-15",
    status: "Expiring in 60 Days",
    renewalRequirement: "100 Synergy CERP points or CCRN renewal exam",
    licenseNumber: "CCRN-883901",
  },
  {
    id: "CERT-02",
    nurseName: "Elena Rostova",
    role: "Senior Staff Nurse (SN)",
    department: "Intensive Care Unit (ICU)",
    deptId: "icu",
    certificationName: "Advanced Cardiac Life Support (ACLS)",
    code: "ACLS-P",
    issuingBoard: "American Heart Association (AHA)",
    issueDate: "2026-01-10",
    expiryDate: "2028-01-10",
    status: "Active",
    renewalRequirement: "Practical megacode & written re-test every 2 years",
    licenseNumber: "AHA-ACL-2026-401",
  },
  {
    id: "CERT-03",
    nurseName: "Marcus Vance",
    role: "Staff Nurse (RN)",
    department: "Medical Ward",
    deptId: "medical",
    certificationName: "Medical-Surgical Registered Nurse (CMSRN)",
    code: "CMSRN",
    issuingBoard: "Medical-Surgical Nursing Certification Board (MSNCB)",
    issueDate: "2023-10-20",
    expiryDate: "2026-10-20",
    status: "Expiring in 30 Days",
    renewalRequirement: "90 contact hours of continuing nursing education",
    licenseNumber: "MSNCB-119283",
  },
  {
    id: "CERT-04",
    nurseName: "Amina Al-Mansoor",
    role: "Senior Staff Nurse (SN)",
    department: "Emergency Department (ED)",
    deptId: "ed",
    certificationName: "Certified Emergency Nurse (CEN)",
    code: "BCEN-CEN",
    issuingBoard: "Board of Certification for Emergency Nursing (BCEN)",
    issueDate: "2025-05-12",
    expiryDate: "2029-05-12",
    status: "Active",
    renewalRequirement: "100 emergency contact hours every 4 years",
    licenseNumber: "BCEN-773019",
  },
  {
    id: "CERT-05",
    nurseName: "Amina Al-Mansoor",
    role: "Senior Staff Nurse (SN)",
    department: "Emergency Department (ED)",
    deptId: "ed",
    certificationName: "Trauma Certified Registered Nurse (TCRN)",
    code: "TCRN",
    issuingBoard: "Board of Certification for Emergency Nursing (BCEN)",
    issueDate: "2024-09-01",
    expiryDate: "2026-11-01",
    status: "Expiring in 60 Days",
    renewalRequirement: "50 trauma-specific CNE hours",
    licenseNumber: "TCRN-401928",
  },
  {
    id: "CERT-06",
    nurseName: "Carlos Reyes",
    role: "Staff Nurse (RN)",
    department: "Surgical Ward",
    deptId: "surgical",
    certificationName: "Certified Perioperative Nurse (CNOR)",
    code: "CCI-CNOR",
    issuingBoard: "Competency & Credentialing Institute (CCI)",
    issueDate: "2025-02-14",
    expiryDate: "2030-02-14",
    status: "Active",
    renewalRequirement: "Perioperative portfolio audit every 5 years",
    licenseNumber: "CCI-550921",
  },
  {
    id: "CERT-07",
    nurseName: "Priya Sharma",
    role: "Staff Nurse (RN)",
    department: "Pediatric Ward",
    deptId: "pediatric",
    certificationName: "Certified Pediatric Nurse (CPN)",
    code: "PNCB-CPN",
    issuingBoard: "Pediatric Nursing Certification Board (PNCB)",
    issueDate: "2024-04-10",
    expiryDate: "2027-04-10",
    status: "Active",
    renewalRequirement: "Annual documentation of pediatric contact hours",
    licenseNumber: "PNCB-902184",
  },
];

const DEMO_REQUIREMENTS: RoleCertificationRequirement[] = [
  {
    role: "ICU Staff Nurse / Senior Nurse",
    unit: "Intensive Care Unit (ICU)",
    mandatoryCerts: ["BLS Healthcare Provider", "ACLS", "CCRN (Within 2 Years)"],
    recommendedCerts: ["CRRT Specialty Badge", "CMC (Cardiac Medicine)"],
    complianceRate: 96.2,
  },
  {
    role: "Emergency Staff Nurse",
    unit: "Emergency Department (ED)",
    mandatoryCerts: ["BLS", "ACLS", "PALS", "TNCC / TCRN"],
    recommendedCerts: ["CEN (Certified Emergency Nurse)"],
    complianceRate: 92.5,
  },
  {
    role: "Medical-Surgical Staff Nurse",
    unit: "Medical & Surgical Inpatient",
    mandatoryCerts: ["BLS", "Infection Control / ANTT"],
    recommendedCerts: ["CMSRN (Medical-Surgical)", "Wound Care (WCC)"],
    complianceRate: 94.0,
  },
  {
    role: "Pediatric Staff Nurse",
    unit: "Pediatric & NICU",
    mandatoryCerts: ["BLS", "PALS", "NRP (for Neonatal)"],
    recommendedCerts: ["CPN (Certified Pediatric Nurse)"],
    complianceRate: 97.5,
  },
];

const DEMO_CERT_AUDITS: CertificationHistoryAudit[] = [
  {
    id: "AUD-CERT-01",
    nurseName: "Elena Rostova",
    certificationName: "Advanced Cardiac Life Support (ACLS)",
    action: "Renewed",
    actionDate: "2026-01-10",
    verifiedBy: "Hospital Resuscitation Officer",
    previousExpiry: "2026-01-10",
    newExpiry: "2028-01-10",
  },
  {
    id: "AUD-CERT-02",
    nurseName: "Amina Al-Mansoor",
    certificationName: "Certified Emergency Nurse (CEN)",
    action: "Recertification Exam Passed",
    actionDate: "2025-05-12",
    verifiedBy: "Hospital Credentialing Committee",
    previousExpiry: "2025-05-12",
    newExpiry: "2029-05-12",
  },
  {
    id: "AUD-CERT-03",
    nurseName: "Carlos Reyes",
    certificationName: "Certified Perioperative Nurse (CNOR)",
    action: "Initial Issuance",
    actionDate: "2025-02-14",
    verifiedBy: "Surgical Directorate Education Lead",
    previousExpiry: "N/A",
    newExpiry: "2030-02-14",
  },
];

/* ── Main Component ───────────────────────────────────────────── */
export default function CertificationsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();

  const activeTab: TabId = (
    TABS.some((t) => t.id === search.tab) ? search.tab : "overview"
  ) as TabId;

  const setActiveTab = (tab: TabId) => {
    navigate({
      to: "/certifications",
      search: { tab },
    });
  };

  const [certifications, setCertifications] = useState<NurseCertification[]>(DEMO_CERTIFICATIONS);
  const [requirements] = useState<RoleCertificationRequirement[]>(DEMO_REQUIREMENTS);
  const [audits] = useState<CertificationHistoryAudit[]>(DEMO_CERT_AUDITS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleInitiateRenewal = (certName: string, nurseName: string) => {
    showToast(`Renewal paperwork generated for ${nurseName} (${certName}).`);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 font-sans bg-[#F8FAFC] text-slate-900">
      {/* ── Level 2: Primary Employee Growth Navigation ────────── */}
      <div className="w-full min-w-0 px-4 sm:px-6 pt-3 pb-1 bg-white border-b border-slate-200 shrink-0">
        <EmployeeGrowthNav activeTab="certifications" />
      </div>

      {/* ── Module Header & Level 3: Secondary Tabs ───────────── */}
      <header className="px-5 pt-4 pb-3 bg-white border-b border-slate-200/80 shrink-0 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.14em] text-blue-600">
              <Award className="h-3.5 w-3.5" />
              <span>Employee Growth · Board Certifications & Privileges</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-0.5">
              Certifications & Credentialing
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Professional nursing board credentials, license renewal timelines, mandatory unit requirements, and audit logs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-md border border-blue-200 bg-blue-50 text-blue-700">
              Board-Accredited Credentials
            </span>
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-md border border-slate-200 bg-slate-100 text-slate-600">
              Demo Dataset
            </span>
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-md border border-slate-200 bg-slate-50 text-slate-600">
              Human-Governed Privileging
            </span>
          </div>
        </div>

        {/* Level 3 Secondary Horizontal Tab Bar */}
        <nav
          className="flex gap-1 overflow-x-auto pt-2 scrollbar-none"
          aria-label="Certifications Secondary Tabs"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                type="button"
                className={`flex items-center gap-1.5 px-3 py-2 text-[12.5px] font-medium rounded-md cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? "font-semibold text-blue-700 bg-blue-50 border border-blue-200/70 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-blue-600" : "text-slate-500"}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`ml-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      tab.id === "expiring"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-200/70 text-slate-700"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="mx-5 mt-3 p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold px-2 py-0.5"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── Content Viewport ─────────────────────────────────── */}
      <main className="flex-1 min-h-0 p-5 overflow-y-auto">
        {activeTab === "overview" && (
          <OverviewPanel
            certifications={certifications}
            requirements={requirements}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === "active" && <ActiveCertificationsPanel certifications={certifications} />}

        {activeTab === "expiring" && (
          <ExpiringCertificationsPanel
            certifications={certifications}
            onRenew={handleInitiateRenewal}
          />
        )}

        {activeTab === "requirements" && <RequirementsPanel requirements={requirements} />}

        {activeTab === "history" && <CertificationHistoryPanel audits={audits} />}
      </main>
    </div>
  );
}

/* ── Panel 1: Overview ────────────────────────────────────────── */
function OverviewPanel({
  certifications,
  requirements,
  onNavigateTab,
}: {
  certifications: NurseCertification[];
  requirements: RoleCertificationRequirement[];
  onNavigateTab: (tab: TabId) => void;
}) {
  const activeCount = certifications.filter((c) => c.status === "Active").length;
  const expiringCount = certifications.filter(
    (c) => c.status === "Expiring in 30 Days" || c.status === "Expiring in 60 Days"
  ).length;

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Credentials</span>
            <BadgeCheck className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{certifications.length}</div>
          <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3 w-3" />
            <span>{activeCount} fully in-date & verified</span>
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Expiring in 60 Days</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700">{expiringCount}</div>
          <p className="text-[11px] text-amber-700 mt-1 font-medium">Proactive notifications sent</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Role Compliance</span>
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">95.0%</div>
          <p className="text-[11px] text-slate-500 mt-1">Hospital-wide regulatory average</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Certifying Boards</span>
            <Award className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">5 Boards</div>
          <p className="text-[11px] text-purple-700 mt-1 font-medium">AACN, BCEN, MSNCB, PNCB, CCI</p>
        </div>
      </div>

      {/* Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Expiring Soon */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Credentials Approaching Expiry</h2>
              <p className="text-xs text-slate-500">Upcoming renewal deadlines requiring CNE verification</p>
            </div>
            <button
              onClick={() => onNavigateTab("expiring")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>View all</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {certifications
              .filter((c) => c.status !== "Active")
              .slice(0, 3)
              .map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-lg border border-amber-100 bg-amber-50/50 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{c.nurseName}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      {c.status}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800">{c.certificationName}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Unit: {c.department}</span>
                    <span className="font-semibold text-amber-900">Expires: {c.expiryDate}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Role Compliance Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Unit Role Requirements</h2>
              <p className="text-xs text-slate-500">Mandatory credentials adherence by clinical department</p>
            </div>
            <button
              onClick={() => onNavigateTab("requirements")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>View details</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {requirements.map((r) => (
              <div
                key={r.unit}
                className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/70 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{r.unit}</span>
                  <span className="text-xs font-bold text-slate-800">{r.complianceRate}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${r.complianceRate}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  Mandatory: {r.mandatoryCerts.join(" · ")}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Panel 2: Active Certifications ───────────────────────────── */
function ActiveCertificationsPanel({ certifications }: { certifications: NurseCertification[] }) {
  const [search, setSearch] = useState("");

  const filteredCerts = useMemo(() => {
    return certifications.filter(
      (c) =>
        c.nurseName.toLowerCase().includes(search.toLowerCase()) ||
        c.certificationName.toLowerCase().includes(search.toLowerCase()) ||
        c.department.toLowerCase().includes(search.toLowerCase())
    );
  }, [certifications, search]);

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2 flex-1 min-w-0 w-full sm:min-w-[240px]">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search nurse, certification title, or credentialing board..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs text-slate-800 placeholder-slate-400 bg-transparent border-none outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200/80">
              <tr>
                <th className="py-3 px-4">Nurse</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Certification</th>
                <th className="py-3 px-4">Credentialing Board</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">License Number</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCerts.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{c.nurseName}</td>
                  <td className="py-3.5 px-4 text-slate-600">{c.department}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">{c.certificationName}</td>
                  <td className="py-3.5 px-4 text-slate-500">{c.issuingBoard}</td>
                  <td className="py-3.5 px-4 text-slate-600">{c.issueDate}</td>
                  <td className="py-3.5 px-4 text-slate-600">{c.expiryDate}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${
                        c.status === "Active"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">{c.licenseNumber}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Panel 3: Expiring Soon ───────────────────────────────────── */
function ExpiringCertificationsPanel({
  certifications,
  onRenew,
}: {
  certifications: NurseCertification[];
  onRenew: (certName: string, nurseName: string) => void;
}) {
  const expiring = certifications.filter((c) => c.status !== "Active");

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <h2 className="text-sm font-bold text-slate-900">Credential Expiration Watchlist</h2>
        <p className="text-xs text-slate-500">
          Proactive monitoring of credentials expiring within 30 to 60 days.
        </p>
      </div>

      <div className="space-y-3">
        {expiring.map((c) => (
          <div
            key={c.id}
            className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-4"
          >
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">{c.nurseName}</span>
                <span className="text-slate-400">·</span>
                <span className="text-xs text-slate-600">{c.department}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  {c.status}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-800">{c.certificationName}</h3>
              <p className="text-xs text-slate-600">
                <span className="font-semibold text-slate-700">Issuing Board: </span>
                {c.issuingBoard} (Lic: {c.licenseNumber})
              </p>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600">
                <span className="font-semibold text-slate-700">Renewal Requirement: </span>
                {c.renewalRequirement}
              </div>
            </div>

            <div className="text-right space-y-2">
              <div className="text-xs text-slate-500">
                Valid until: <span className="font-bold text-amber-700">{c.expiryDate}</span>
              </div>
              <button
                onClick={() => onRenew(c.certificationName, c.nurseName)}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer transition-colors"
              >
                Initiate Renewal
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Panel 4: Requirements ────────────────────────────────────── */
function RequirementsPanel({ requirements }: { requirements: RoleCertificationRequirement[] }) {
  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <h2 className="text-sm font-bold text-slate-900">Unit & Role Credentialing Matrix</h2>
        <p className="text-xs text-slate-500">
          Hospital-mandated certifications required by clinical specialty and acuity grade.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {requirements.map((r) => (
          <div
            key={r.unit}
            className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {r.unit}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">{r.role}</h3>
              </div>
              <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                {r.complianceRate}% Compliant
              </span>
            </div>

            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Mandatory Regulatory Credentials
              </span>
              <div className="flex flex-wrap gap-1.5">
                {r.mandatoryCerts.map((cert) => (
                  <span
                    key={cert}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200"
                  >
                    <CheckCircle2 className="h-3 w-3 text-blue-600" />
                    {cert}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Recommended Specialty Credentials
              </span>
              <div className="flex flex-wrap gap-1.5">
                {r.recommendedCerts.map((cert) => (
                  <span
                    key={cert}
                    className="text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-200"
                  >
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Panel 5: History ─────────────────────────────────────────── */
function CertificationHistoryPanel({ audits }: { audits: CertificationHistoryAudit[] }) {
  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <h2 className="text-sm font-bold text-slate-900">Credentialing Audit Trail & Renewal History</h2>
        <p className="text-xs text-slate-500">
          Permanent compliance records and primary source audit logs.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200/80">
              <tr>
                <th className="py-3 px-4">Nurse</th>
                <th className="py-3 px-4">Certification</th>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Event Date</th>
                <th className="py-3 px-4">Previous Expiry</th>
                <th className="py-3 px-4">New Expiry Date</th>
                <th className="py-3 px-4">Audited By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {audits.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{a.nurseName}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">{a.certificationName}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-[10.5px] border border-blue-200">
                      {a.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{a.actionDate}</td>
                  <td className="py-3.5 px-4 text-slate-500">{a.previousExpiry}</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-700">{a.newExpiry}</td>
                  <td className="py-3.5 px-4 text-slate-500">{a.verifiedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
