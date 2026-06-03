import { useState } from "react";
import { Inbox, CheckCircle2, Clock, FileBarChart, Send } from "lucide-react";
import type { Session } from "@/lib/auth";

type Tab = "queue" | "inprogress" | "results" | "qc";

const MOCK = [
  { id: "L-9001", mrn: "P-1042", patient: "M. Joseph",  tests: ["CBC","CRP"],      doctor: "Dr. Patel", priority: "Routine", status: "queue" },
  { id: "L-9002", mrn: "P-1051", patient: "R. Khan",    tests: ["BMP","ABG"],      doctor: "Dr. Rao",   priority: "STAT",    status: "queue" },
  { id: "L-9003", mrn: "P-1077", patient: "S. Pillai",  tests: ["LFT"],            doctor: "Dr. Shah",  priority: "Routine", status: "inprogress" },
  { id: "L-9000", mrn: "P-1020", patient: "A. Iyer",    tests: ["Blood Cx ×2"],    doctor: "Dr. Khan",  priority: "STAT",    status: "results" },
];

export function LabDashboard({ session }: { session: Session }) {
  const [tab, setTab] = useState<Tab>("queue");
  const list = MOCK.filter(m => m.status === tab || (tab === "results" && m.status === "results"));

  return (
    <div className="space-y-5">
      <header className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-primary">Laboratory workspace</div>
            <h2 className="text-xl font-semibold">{session.name} · {session.title}</h2>
            <p className="text-sm text-muted-foreground">Orders from physicians flow here. Post results back to the patient chart.</p>
          </div>
        </div>
      </header>

      <Tabs tab={tab} setTab={setTab} tabs={[
        { id: "queue",      label: "Order Queue",  icon: Inbox },
        { id: "inprogress", label: "In Progress",  icon: Clock },
        { id: "results",    label: "Enter Results",icon: FileBarChart },
        { id: "qc",         label: "QC & Audit",   icon: CheckCircle2 },
      ]} />

      <div className="rounded-xl border border-border bg-card p-5">
        {tab !== "qc" && tab !== "results" && <Queue list={list} />}
        {tab === "results" && <ResultEntry list={list} />}
        {tab === "qc" && <QC />}
      </div>
    </div>
  );
}

function Tabs<T extends string>({ tab, setTab, tabs }: { tab: T; setTab: (t: T) => void; tabs: { id: T; label: string; icon: typeof Inbox }[] }) {
  return (
    <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-card p-1">
      {tabs.map(t => {
        const Icon = t.icon;
        const active = tab === t.id;
        return (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}>
            <Icon className="h-3.5 w-3.5" />{t.label}
          </button>
        );
      })}
    </div>
  );
}

function Queue({ list }: { list: typeof MOCK }) {
  return (
    <table className="w-full text-sm">
      <thead className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
        <tr><th className="py-2">Order</th><th>Patient</th><th>Tests</th><th>Ordered by</th><th>Priority</th><th></th></tr>
      </thead>
      <tbody>
        {list.map(r => (
          <tr key={r.id} className="border-t border-border">
            <td className="py-2 font-mono text-xs">{r.id}</td>
            <td>{r.patient}<div className="text-[10px] text-muted-foreground">{r.mrn}</div></td>
            <td>{r.tests.join(", ")}</td>
            <td>{r.doctor}</td>
            <td><span className={`rounded-full px-2 py-0.5 text-[10px] ${r.priority === "STAT" ? "bg-destructive/15 text-destructive" : "bg-secondary text-foreground"}`}>{r.priority}</span></td>
            <td><button className="text-xs text-primary hover:underline">Accept / Process</button></td>
          </tr>
        ))}
        {list.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-xs text-muted-foreground">Queue empty.</td></tr>}
      </tbody>
    </table>
  );
}

function ResultEntry({ list }: { list: typeof MOCK }) {
  const sample = list[0] ?? MOCK[3];
  const tests = [
    { name: "Hb",       unit: "g/dL", ref: "12–16" },
    { name: "WBC",      unit: "×10⁹/L", ref: "4–11" },
    { name: "Platelet", unit: "×10⁹/L", ref: "150–450" },
    { name: "Na",       unit: "mmol/L", ref: "135–145" },
    { name: "K",        unit: "mmol/L", ref: "3.5–5.0" },
    { name: "Creat",    unit: "mg/dL", ref: "0.6–1.3" },
  ];
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Result entry · {sample.id} ({sample.patient})</h3>
        <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90">
          <Send className="h-3.5 w-3.5" />Post to chart
        </button>
      </div>
      <table className="w-full text-sm">
        <thead className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
          <tr><th className="py-2">Analyte</th><th>Result</th><th>Unit</th><th>Reference</th><th>Flag</th></tr>
        </thead>
        <tbody>
          {tests.map(t => (
            <tr key={t.name} className="border-t border-border">
              <td className="py-2 font-medium">{t.name}</td>
              <td><input className="w-24 rounded-md border border-input bg-background px-2 py-1 text-sm" /></td>
              <td className="text-xs text-muted-foreground">{t.unit}</td>
              <td className="text-xs text-muted-foreground">{t.ref}</td>
              <td><select className="rounded-md border border-input bg-background px-2 py-1 text-xs"><option>—</option><option>↑ High</option><option>↓ Low</option><option>!! Critical</option></select></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function QC() {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {[
        { k: "Levey-Jennings", v: "In control" },
        { k: "Calibration",    v: "Today 06:00" },
        { k: "Reagent lot",    v: "Exp 2026-09" },
        { k: "Critical callouts", v: "2 today" },
        { k: "TAT (STAT)",     v: "38 min avg" },
        { k: "TAT (Routine)",  v: "3 h 20 m" },
      ].map(c => (
        <div key={c.k} className="rounded-md border border-border bg-secondary/30 p-3">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{c.k}</div>
          <div className="text-sm font-semibold">{c.v}</div>
        </div>
      ))}
    </div>
  );
}


