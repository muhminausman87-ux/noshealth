import { useState } from "react";
import {
  Stethoscope, ClipboardList, FlaskConical, Scan, Syringe, Scissors,
  FileText, LogOut, Plus, Calendar, Pill,
} from "lucide-react";
import type { Session } from "@/lib/auth";

type Tab =
  | "rounds" | "orders" | "lab" | "radiology"
  | "daycare" | "ot" | "discharge" | "notes";

const TABS: { id: Tab; label: string; icon: typeof Stethoscope }[] = [
  { id: "rounds",    label: "Rounds & Admit",    icon: Stethoscope },
  { id: "orders",    label: "Orders / Rx",       icon: ClipboardList },
  { id: "lab",       label: "Lab Orders",        icon: FlaskConical },
  { id: "radiology", label: "Radiology",         icon: Scan },
  { id: "daycare",   label: "Day Care",          icon: Syringe },
  { id: "ot",        label: "OT (Pre/Intra/Post)", icon: Scissors },
  { id: "discharge", label: "Discharge Plan",    icon: LogOut },
  { id: "notes",     label: "Progress Notes",    icon: FileText },
];

export function DoctorDashboard({ session }: { session: Session }) {
  const [tab, setTab] = useState<Tab>("rounds");

  return (
    <div className="space-y-5">
      <header className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-primary">Physician workspace</div>
            <h2 className="text-xl font-semibold">{session.name} · {session.title}</h2>
            <p className="text-sm text-muted-foreground">EBP-driven order entry, OT documentation, and discharge planning.</p>
          </div>
          <div className="flex gap-2 text-xs">
            <Stat label="Active patients" value="14" />
            <Stat label="Pending orders" value="3" tone="warn" />
            <Stat label="OT today" value="2" />
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-card p-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        {tab === "rounds" && <RoundsTab />}
        {tab === "orders" && <OrdersTab />}
        {tab === "lab" && <LabOrderTab />}
        {tab === "radiology" && <RadOrderTab />}
        {tab === "daycare" && <DayCareTab />}
        {tab === "ot" && <OTTab />}
        {tab === "discharge" && <DischargeTab />}
        {tab === "notes" && <NotesTab />}
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "warn" }) {
  return (
    <div className={`rounded-md border px-3 py-1.5 ${tone === "warn" ? "border-warning/40 bg-warning/10 text-warning-foreground" : "border-border bg-secondary/40"}`}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

/* -------- Tab content (presentational mocks, EBP-flavored) -------- */

function RoundsTab() {
  const pts = [
    { id: "P-1042", name: "M. Joseph, 62F", dx: "CAP, T2DM", ward: "Medical-204", acuity: "stable" },
    { id: "P-1051", name: "R. Khan, 71M",   dx: "AKI on CKD",  ward: "Medical-208", acuity: "watch" },
    { id: "P-1077", name: "S. Pillai, 45F", dx: "Post-op Day1 lap chole", ward: "Surgical-12", acuity: "stable" },
  ];
  return (
    <div className="space-y-3">
      <Row title="Today's patient list" action={<Btn icon={Plus}>Admit new</Btn>} />
      <table className="w-full text-sm">
        <thead className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
          <tr><th className="py-2">MRN</th><th>Patient</th><th>Diagnosis</th><th>Bed</th><th>Acuity</th><th></th></tr>
        </thead>
        <tbody>
          {pts.map(p => (
            <tr key={p.id} className="border-t border-border">
              <td className="py-2 font-mono text-xs">{p.id}</td>
              <td>{p.name}</td>
              <td className="text-muted-foreground">{p.dx}</td>
              <td>{p.ward}</td>
              <td><span className={`rounded-full px-2 py-0.5 text-[10px] ${p.acuity === "watch" ? "bg-warning/20 text-warning-foreground" : "bg-success/15 text-success"}`}>{p.acuity}</span></td>
              <td><button className="text-xs text-primary hover:underline">Open chart</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrdersTab() {
  return (
    <div className="space-y-3">
      <Row title="New order set" />
      <div className="grid gap-2 md:grid-cols-2">
        <OrderCard title="IV Fluids" body="NS 0.9% @ 100 ml/hr" />
        <OrderCard title="Antibiotic" body="Ceftriaxone 1g IV BD × 5d" ebp />
        <OrderCard title="Analgesic" body="Paracetamol 1g PO q6h PRN" />
        <OrderCard title="Monitor" body="Vitals q4h, I/O charting" />
      </div>
      <Btn icon={Plus}>Add custom order</Btn>
      <p className="text-[11px] text-muted-foreground">Doses auto-calculated by weight where applicable. EBP-flagged orders link to UpToDate / PubMed.</p>
    </div>
  );
}

function LabOrderTab() {
  const tests = ["CBC", "BMP", "LFT", "CRP", "Procalcitonin", "Blood Cx ×2", "Urine R/M", "ABG"];
  return (
    <div className="space-y-3">
      <Row title="Order labs — sent to Lab queue" />
      <div className="flex flex-wrap gap-2">
        {tests.map(t => (
          <label key={t} className="flex items-center gap-2 rounded-md border border-border bg-secondary/30 px-3 py-1.5 text-xs">
            <input type="checkbox" className="h-3.5 w-3.5" /> {t}
          </label>
        ))}
      </div>
      <Btn icon={FlaskConical}>Send to Laboratory</Btn>
      <p className="text-[11px] text-muted-foreground">Lab technicians see this in their queue and post results back to the chart.</p>
    </div>
  );
}

function RadOrderTab() {
  return (
    <div className="space-y-3">
      <Row title="Imaging request" />
      <div className="grid gap-2 md:grid-cols-2">
        {["X-ray Chest PA", "USG Abdomen", "CT Brain plain", "MRI L-spine", "ECHO 2D", "X-ray KUB"].map(x => (
          <button key={x} className="rounded-md border border-border bg-secondary/30 px-3 py-2 text-left text-xs hover:border-primary/50">
            {x}
          </button>
        ))}
      </div>
      <textarea className="w-full rounded-md border border-border bg-background p-2 text-sm" rows={2} placeholder="Clinical indication (required)…" />
      <Btn icon={Scan}>Send to Radiology</Btn>
    </div>
  );
}

function DayCareTab() {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <Card title="Vaccinations" items={["Influenza", "HepB booster", "Tdap", "HPV", "Rabies PEP"]} />
      <Card title="Injections / Infusions" items={["Iron sucrose", "Rituximab", "Zoledronic acid", "B12 IM"]} />
      <Card title="Minor procedures" items={["I&D abscess", "Suture removal", "Foley change", "Pre-op prep — minor"]} />
    </div>
  );
}

function OTTab() {
  return (
    <div className="space-y-4">
      <Row title="Surgical case — documentation" />
      <div className="grid gap-3 md:grid-cols-4">
        <Phase color="hsl(200 80% 50%)" title="Pre-op" items={["Consent ✓","NPO since 22:00","Site marked","Anaes review"]} />
        <Phase color="hsl(280 70% 55%)" title="Intra-op" items={["Time-out done","Incision 09:14","EBL 120 ml","Counts ✓"]} />
        <Phase color="hsl(150 60% 40%)" title="Recovery (PACU)" items={["Aldrete 9","Pain 2/10","Vitals stable"]} />
        <Phase color="hsl(20 80% 50%)" title="Post-op orders" items={["Analgesia","DVT proph","Diet — sips","Mobilise D1"]} />
      </div>
      <div className="rounded-md border border-border bg-secondary/30 p-3 text-xs">
        <strong>Surgical safety checklist (WHO):</strong> Sign-in · Time-out · Sign-out — completed for this case.
      </div>
    </div>
  );
}

function DischargeTab() {
  return (
    <div className="space-y-3">
      <Row title="Discharge plan (mandatory by admitting doctor)" />
      <Field label="Discharge diagnosis"><input className="w-full bg-transparent text-sm outline-none" placeholder="e.g., Community-acquired pneumonia, resolved" /></Field>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Medications on discharge"><textarea rows={3} className="w-full bg-transparent text-sm outline-none" placeholder="Drug, dose, duration…" /></Field>
        <Field label="Follow-up"><textarea rows={3} className="w-full bg-transparent text-sm outline-none" placeholder="OPD in 7d, repeat CBC…" /></Field>
        <Field label="Diet & activity"><input className="w-full bg-transparent text-sm outline-none" placeholder="e.g., diabetic diet, light activity" /></Field>
        <Field label="Red flags — return immediately if…"><input className="w-full bg-transparent text-sm outline-none" placeholder="Fever > 38.5, breathlessness, chest pain" /></Field>
      </div>
      <Btn icon={LogOut}>Finalise discharge summary</Btn>
    </div>
  );
}

function NotesTab() {
  return (
    <div className="space-y-3">
      <Row title="SOAP / progress note" />
      {["Subjective","Objective","Assessment","Plan"].map(s => (
        <Field key={s} label={s}><textarea rows={2} className="w-full bg-transparent text-sm outline-none" /></Field>
      ))}
      <Btn icon={FileText}>Sign & save</Btn>
    </div>
  );
}

/* -------- helpers -------- */
function Row({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-semibold">{title}</h3>
      {action}
    </div>
  );
}
function Btn({ icon: Icon, children }: { icon: typeof Plus; children: React.ReactNode }) {
  return (
    <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90">
      <Icon className="h-3.5 w-3.5" />{children}
    </button>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block rounded-md border border-input bg-background px-3 py-2">
      <span className="block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
function OrderCard({ title, body, ebp }: { title: string; body: string; ebp?: boolean }) {
  return (
    <div className="rounded-md border border-border bg-secondary/30 p-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold flex items-center gap-1.5"><Pill className="h-3.5 w-3.5 text-primary" />{title}</div>
        {ebp && <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">EBP</span>}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{body}</div>
    </div>
  );
}
function Card({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-md border border-border bg-secondary/30 p-3">
      <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold"><Calendar className="h-3.5 w-3.5 text-primary" />{title}</div>
      <ul className="space-y-1 text-xs text-muted-foreground">
        {items.map(i => <li key={i}>• {i}</li>)}
      </ul>
    </div>
  );
}
function Phase({ color, title, items }: { color: string; title: string; items: string[] }) {
  return (
    <div className="rounded-md border border-border bg-card p-3" style={{ borderTopWidth: 3, borderTopColor: color }}>
      <div className="text-sm font-semibold">{title}</div>
      <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
        {items.map(i => <li key={i}>• {i}</li>)}
      </ul>
    </div>
  );
}


