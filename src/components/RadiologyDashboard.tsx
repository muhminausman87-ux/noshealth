import { useState } from "react";
import { Scan, Inbox, Image as ImageIcon, FileSignature, Send } from "lucide-react";
import type { Session } from "@/lib/auth";

type Tab = "queue" | "acquire" | "report" | "archive";

const MOCK = [
  { id: "R-5001", mrn: "P-1042", patient: "M. Joseph", study: "X-ray Chest PA", doctor: "Dr. Patel", priority: "Routine", status: "queue" },
  { id: "R-5002", mrn: "P-1051", patient: "R. Khan",   study: "USG Abdomen",    doctor: "Dr. Rao",   priority: "STAT",    status: "queue" },
  { id: "R-5003", mrn: "P-1077", patient: "S. Pillai", study: "CT Brain plain", doctor: "Dr. Shah",  priority: "STAT",    status: "acquire" },
  { id: "R-4999", mrn: "P-1020", patient: "A. Iyer",   study: "MRI L-spine",    doctor: "Dr. Khan",  priority: "Routine", status: "report" },
];

export function RadiologyDashboard({ session }: { session: Session }) {
  const [tab, setTab] = useState<Tab>("queue");
  const list = MOCK.filter(m => m.status === tab);

  return (
    <div className="space-y-5">
      <header className="rounded-xl border border-border bg-card p-5">
        <div className="text-xs font-medium uppercase tracking-wider text-primary">Radiology workspace</div>
        <h2 className="text-xl font-semibold">{session.name} · {session.title}</h2>
        <p className="text-sm text-muted-foreground">Acquire studies, draft reports, sign-off, and post to chart.</p>
      </header>

      <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-card p-1">
        {[
          { id: "queue", label: "Request Queue", icon: Inbox },
          { id: "acquire", label: "Acquisition", icon: ImageIcon },
          { id: "report", label: "Reporting", icon: FileSignature },
          { id: "archive", label: "Archive (PACS)", icon: Scan },
        ].map(t => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id as Tab)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium ${
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}>
              <Icon className="h-3.5 w-3.5" />{t.label}
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        {tab !== "report" && <Queue list={list} />}
        {tab === "report" && <Report />}
      </div>
    </div>
  );
}

function Queue({ list }: { list: typeof MOCK }) {
  return (
    <table className="w-full text-sm">
      <thead className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
        <tr><th className="py-2">Req</th><th>Patient</th><th>Study</th><th>Requested by</th><th>Priority</th><th></th></tr>
      </thead>
      <tbody>
        {list.map(r => (
          <tr key={r.id} className="border-t border-border">
            <td className="py-2 font-mono text-xs">{r.id}</td>
            <td>{r.patient}<div className="text-[10px] text-muted-foreground">{r.mrn}</div></td>
            <td>{r.study}</td>
            <td>{r.doctor}</td>
            <td><span className={`rounded-full px-2 py-0.5 text-[10px] ${r.priority === "STAT" ? "bg-destructive/15 text-destructive" : "bg-secondary"}`}>{r.priority}</span></td>
            <td><button className="text-xs text-primary hover:underline">Open</button></td>
          </tr>
        ))}
        {list.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-xs text-muted-foreground">Nothing here.</td></tr>}
      </tbody>
    </table>
  );
}

function Report() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Draft report · R-4999 · MRI L-spine</h3>
        <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90">
          <Send className="h-3.5 w-3.5" />Sign & post to chart
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {["Technique","Findings","Comparison","Impression"].map(s => (
          <label key={s} className="block rounded-md border border-input bg-background px-3 py-2">
            <span className="block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{s}</span>
            <textarea rows={4} className="w-full bg-transparent text-sm outline-none" />
          </label>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground">Critical findings auto-page the requesting clinician per hospital policy.</p>
    </div>
  );
}
