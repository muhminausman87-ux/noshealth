import { Activity, ClipboardList, Pill, Users } from "lucide-react";
import { StatusPill, Widget } from "@/components/Widget";
import { AcuityScoring } from "@/components/AcuityScoring";
import { getDept, type Department } from "@/lib/departments";

const ACUITY_DEPTS: Department[] = [
  "medsurg", "medical", "surgical", "cardiac", "pediatric",
  "maternity", "labour", "daycare", "ed", "icu",
];

interface Patient {
  name: string;
  room: string;
  detail: string;
  status: "stable" | "watch" | "critical";
}

const PATIENTS: Record<Department, Patient[]> = {
  ed: [], icu: [], medsurg: [],
  maternity: [
    { name: "Aisha Khan",    room: "M-12", detail: "G2P1 · 39w · early labour", status: "watch" },
    { name: "Priya Nair",    room: "M-08", detail: "Postpartum day 1 · stable", status: "stable" },
    { name: "Reena Joseph",  room: "M-15", detail: "PIH · BP monitoring",       status: "watch" },
  ],
  cardiac: [
    { name: "Mohammed Ali",  room: "C-04", detail: "Post-MI day 2 · on telemetry", status: "watch" },
    { name: "George Paul",   room: "C-07", detail: "CHF · diuresis in progress",   status: "stable" },
    { name: "Sara Iqbal",    room: "C-09", detail: "Unstable angina · NPO",        status: "critical" },
  ],
  labour: [
    { name: "Neha Sharma",   room: "LR-1", detail: "Active phase · 6 cm",          status: "watch" },
    { name: "Fatima Beegum", room: "LR-2", detail: "Latent · monitoring CTG",      status: "stable" },
  ],
  pediatric: [
    { name: "Arjun (4 y)",   room: "P-03", detail: "Bronchiolitis · O₂ 1L NC",    status: "watch" },
    { name: "Meera (7 y)",   room: "P-05", detail: "Post-appendectomy day 1",     status: "stable" },
    { name: "Ravi (2 y)",    room: "P-06", detail: "Febrile seizure · obs",       status: "watch" },
  ],
  medical: [
    { name: "John Doe",      room: "MW-21", detail: "CAP · IV Ceftriaxone",       status: "stable" },
    { name: "Suresh Pillai", room: "MW-19", detail: "DKA resolving · insulin gtt",status: "watch" },
    { name: "Asha Devi",     room: "MW-22", detail: "CKD stage 4 · fluid balance",status: "stable" },
  ],
  surgical: [
    { name: "Vinod Kumar",   room: "SW-11", detail: "POD#1 lap chole",            status: "stable" },
    { name: "Lakshmi R.",    room: "SW-14", detail: "POD#0 hemicolectomy",        status: "watch" },
  ],
  opd: [
    { name: "Walk-in queue", room: "Lobby", detail: "12 waiting · avg wait 18 min", status: "stable" },
  ],
  daycare: [
    { name: "Joseph K.",     room: "DC-2", detail: "Chemo cycle 3 · in infusion", status: "watch" },
    { name: "Mary T.",       room: "DC-4", detail: "Iron infusion · 45 min left", status: "stable" },
  ],
  ot: [
    { name: "OR-1",          room: "OR-1", detail: "Lap appendectomy · in progress · 32 min", status: "watch" },
    { name: "OR-2",          room: "OR-2", detail: "Cleaning · turnover ETA 12 min",            status: "stable" },
    { name: "OR-3",          room: "OR-3", detail: "Available",                                  status: "stable" },
  ],
};

export function GenericView({ dept }: { dept: Department }) {
  const meta = getDept(dept);
  const patients = PATIENTS[dept] ?? [];
  const stats = {
    total: patients.length,
    critical: patients.filter((p) => p.status === "critical").length,
    watch: patients.filter((p) => p.status === "watch").length,
  };

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <Widget title={`${meta.short} Census`} icon={Users} subtitle="Current shift">
        <div className="grid grid-cols-3 gap-3">
          <Tile label="Total" value={stats.total} accent={meta.color} />
          <Tile label="Watch" value={stats.watch} accent="#f59e0b" />
          <Tile label="Critical" value={stats.critical} accent="#dc2626" />
        </div>
      </Widget>

      <Widget title="Shift Tasks" icon={ClipboardList} subtitle="Top of mind">
        <ul className="space-y-2 text-sm">
          <Task done text="Bedside handover" />
          <Task done text="Safety rounds" />
          <Task text="08:00 medication pass" />
          <Task text="Document I/O" />
          <Task text="Discharge teaching — 2 patients" />
        </ul>
      </Widget>

      <Widget title="Unit Activity" icon={Activity} subtitle="Live">
        <div className="space-y-2 text-sm">
          <Row k="Admissions today" v="3" />
          <Row k="Discharges pending" v="2" />
          <Row k="Pending orders" v="5" />
          <Row k="Pending labs" v="4" />
        </div>
      </Widget>

      <Widget
        title="Patient Board"
        icon={Pill}
        subtitle={`${patients.length} patient${patients.length === 1 ? "" : "s"}`}
        className="lg:col-span-3"
      >
        {patients.length === 0 ? (
          <p className="text-sm text-muted-foreground">No patients assigned.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="pb-2 font-medium">Room</th>
                  <th className="pb-2 font-medium">Patient</th>
                  <th className="pb-2 font-medium">Notes</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p.room + p.name} className="border-t border-border">
                    <td className="py-2.5 font-medium text-foreground">{p.room}</td>
                    <td className="py-2.5">{p.name}</td>
                    <td className="py-2.5 text-muted-foreground">{p.detail}</td>
                    <td className="py-2.5">
                      <StatusPill
                        tone={
                          p.status === "critical"
                            ? "danger"
                            : p.status === "watch"
                              ? "warning"
                              : "success"
                        }
                      >
                        {p.status.toUpperCase()}
                      </StatusPill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Widget>

      {ACUITY_DEPTS.includes(dept) && (
        <AcuityScoring mode={dept === "icu" ? "icu" : "ward"} className="lg:col-span-3" />
      )}
    </div>
  );
}

function Tile({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold" style={{ color: accent }}>
        {value}
      </div>
    </div>
  );
}

function Task({ text, done }: { text: string; done?: boolean }) {
  return (
    <li className="flex items-center gap-2">
      <input
        type="checkbox"
        defaultChecked={done}
        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
      />
      <span className={done ? "text-muted-foreground line-through" : "text-foreground"}>
        {text}
      </span>
    </li>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between border-b border-border pb-1.5 last:border-none">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium text-foreground">{v}</span>
    </div>
  );
}
