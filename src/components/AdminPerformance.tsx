import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DEMO_STAFF } from "@/lib/demo-staff";
import { getDept, DEPARTMENTS, type Department } from "@/lib/departments";
import {
  CalendarCog, Award, MessageSquare, Star, Send, Save, Sparkles,
  TrendingUp, ThumbsUp, Trophy, Plus,
} from "lucide-react";

type ShiftCode = "M" | "E" | "N" | "O";
const SHIFTS: { code: ShiftCode; label: string; tone: string }[] = [
  { code: "M", label: "Morning",  tone: "var(--color-tone-mint)" },
  { code: "E", label: "Evening",  tone: "var(--color-tone-amber)" },
  { code: "N", label: "Night",    tone: "var(--color-tone-violet)" },
  { code: "O", label: "Off",      tone: "var(--color-muted-foreground)" },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function seeded(str: string, salt = 0) {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return ((h >>> 0) % 1000) / 1000;
}

const KUDOS_TEMPLATES = [
  "Excellent handover today — clear & concise SBAR.",
  "Great teamwork during the code blue. Thank you!",
  "Spot recognition: outstanding patient communication.",
  "Audit-ready documentation. Keep it up!",
];

interface StaffPerf {
  username: string;
  name: string;
  title: string;
  dept: Department;
  schedule: ShiftCode[];
  punctuality: number;     // 0-100
  documentation: number;   // 0-100
  patientFeedback: number; // 0-100
  teamwork: number;        // 0-100
  kudosCount: number;
}

function buildStaff(): StaffPerf[] {
  return DEMO_STAFF.map((u) => {
    const schedule: ShiftCode[] = Array.from({ length: 7 }, (_, i) => {
      const r = seeded(u.username, i);
      if (r < 0.18) return "O";
      if (r < 0.5) return "M";
      if (r < 0.78) return "E";
      return "N";
    });
    return {
      username: u.username,
      name: u.name,
      title: u.title,
      dept: u.assignedDept!,
      schedule,
      punctuality:     Math.round(70 + seeded(u.username, 1) * 30),
      documentation:   Math.round(65 + seeded(u.username, 2) * 35),
      patientFeedback: Math.round(70 + seeded(u.username, 3) * 30),
      teamwork:        Math.round(72 + seeded(u.username, 4) * 28),
      kudosCount:      Math.floor(seeded(u.username, 5) * 6),
    };
  });
}

interface Kudo { to: string; message: string; at: string; }

export function AdminPerformance() {
  const [staff, setStaff] = useState<StaffPerf[]>(buildStaff);
  const [filter, setFilter] = useState<Department | "all">("all");
  const [kudos, setKudos] = useState<Kudo[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = useMemo(
    () => (filter === "all" ? staff : staff.filter((s) => s.dept === filter)),
    [staff, filter],
  );

  const setShift = (username: string, dayIdx: number, code: ShiftCode) => {
    setStaff((all) =>
      all.map((s) =>
        s.username === username
          ? { ...s, schedule: s.schedule.map((c, i) => (i === dayIdx ? code : c)) }
          : s,
      ),
    );
  };

  const sendKudos = (to: string, message: string) => {
    if (!message.trim()) return;
    const k = { to, message, at: new Date().toLocaleString() };
    setKudos((arr) => [k, ...arr]);
    setStaff((all) => all.map((s) => (s.username === to ? { ...s, kudosCount: s.kudosCount + 1 } : s)));
    setToast(`Sent to ${staff.find((s) => s.username === to)?.name ?? to}`);
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <section className="mt-8">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Admin tools
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Rota editor · Performance · Spot recognition
          </h2>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-1.5">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as Department | "all")}
            className="bg-transparent text-xs text-foreground outline-none"
          >
            <option value="all">All departments</option>
            {DEPARTMENTS.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      <Tabs defaultValue="rota">
        <TabsList className="bg-card">
          <TabsTrigger value="rota"><CalendarCog className="mr-1.5 h-3.5 w-3.5" />Edit rota</TabsTrigger>
          <TabsTrigger value="perf"><TrendingUp className="mr-1.5 h-3.5 w-3.5" />Performance</TabsTrigger>
          <TabsTrigger value="kudos"><Award className="mr-1.5 h-3.5 w-3.5" />Spot recognition</TabsTrigger>
          <TabsTrigger value="msg"><MessageSquare className="mr-1.5 h-3.5 w-3.5" />Quick message</TabsTrigger>
        </TabsList>

        {/* ROTA EDITOR */}
        <TabsContent value="rota">
          <Panel>
            <p className="mb-3 text-xs text-muted-foreground">
              Click any shift cell to cycle Morning → Evening → Night → Off. Changes are saved instantly to the live roster.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-3 py-2">Nurse</th>
                    <th className="px-3 py-2">Unit</th>
                    {DAYS.map((d) => <th key={d} className="px-2 py-2 text-center">{d}</th>)}
                    <th className="px-3 py-2 text-center">New shift</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => {
                    const m = getDept(r.dept);
                    return (
                      <tr key={r.username} className="border-t border-border/60">
                        <td className="px-3 py-2">
                          <div className="font-medium text-foreground">{r.name}</div>
                          <div className="text-[11px] text-muted-foreground">{r.title}</div>
                        </td>
                        <td className="px-3 py-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px]"
                                style={{ background: `color-mix(in oklab, ${m.color} 18%, transparent)`, color: m.color }}>
                            {m.short}
                          </span>
                        </td>
                        {r.schedule.map((s, i) => {
                          const meta = SHIFTS.find((x) => x.code === s)!;
                          return (
                            <td key={i} className="px-1 py-2 text-center">
                              <button
                                onClick={() => {
                                  const next = SHIFTS[(SHIFTS.findIndex((x) => x.code === s) + 1) % SHIFTS.length].code;
                                  setShift(r.username, i, next);
                                }}
                                className="inline-flex h-7 w-9 items-center justify-center rounded-md text-[11px] font-semibold transition hover:scale-110"
                                style={{
                                  background: s === "O" ? "transparent" : `color-mix(in oklab, ${meta.tone} 18%, transparent)`,
                                  color: s === "O" ? "var(--color-muted-foreground)" : meta.tone,
                                  border: s === "O" ? "1px dashed var(--color-border)" : "none",
                                }}
                                title={`Click to change · ${meta.label}`}
                              >
                                {s}
                              </button>
                            </td>
                          );
                        })}
                        <td className="px-2 py-2 text-center">
                          <select
                            className="rounded-md border border-border bg-background px-1.5 py-1 text-[11px]"
                            value=""
                            onChange={(e) => {
                              const code = e.target.value as ShiftCode;
                              const idx = r.schedule.findIndex((c) => c === "O");
                              setShift(r.username, idx >= 0 ? idx : 0, code);
                            }}
                          >
                            <option value="">+ add</option>
                            {SHIFTS.filter((x) => x.code !== "O").map((x) => (
                              <option key={x.code} value={x.code}>{x.label}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                onClick={() => { setToast("Rota published to all staff devices"); setTimeout(() => setToast(null), 2500); }}
              >
                <Save className="h-3.5 w-3.5" /> Publish rota
              </button>
            </div>
          </Panel>
        </TabsContent>

        {/* PERFORMANCE */}
        <TabsContent value="perf">
          <Panel>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {filtered.map((s) => {
                const overall = Math.round((s.punctuality + s.documentation + s.patientFeedback + s.teamwork) / 4);
                const tone = overall >= 85 ? "var(--color-tone-mint)" : overall >= 70 ? "var(--color-tone-amber)" : "var(--color-destructive)";
                const m = getDept(s.dept);
                return (
                  <div key={s.username} className="rounded-xl border border-border bg-background/40 p-4"
                       style={{ borderLeft: `4px solid ${tone}` }}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-foreground">{s.name}</div>
                        <div className="text-[11px] text-muted-foreground">{m.short} · {s.title}</div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-1 text-2xl font-semibold" style={{ color: tone }}>
                          <Trophy className="h-4 w-4" />{overall}
                        </div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">overall</div>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                      <Metric label="Punctuality" value={s.punctuality} />
                      <Metric label="Documentation" value={s.documentation} />
                      <Metric label="Patient feedback" value={s.patientFeedback} />
                      <Metric label="Teamwork" value={s.teamwork} />
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Star className="h-3 w-3 text-warning" /> {s.kudosCount} kudos
                      </span>
                      <button
                        className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary hover:bg-primary/20"
                        onClick={() => sendKudos(s.username, "Great work — appreciated by Nursing Director.")}
                      >
                        <ThumbsUp className="h-3 w-3" /> Appreciate
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        </TabsContent>

        {/* SPOT KUDOS */}
        <TabsContent value="kudos">
          <Panel>
            <SpotKudos staff={filtered} templates={KUDOS_TEMPLATES} onSend={sendKudos} />
            <div className="mt-5">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent recognition</h4>
              {kudos.length === 0 ? (
                <p className="text-xs text-muted-foreground">No kudos sent yet.</p>
              ) : (
                <ul className="space-y-2">
                  {kudos.map((k, i) => {
                    const s = staff.find((x) => x.username === k.to);
                    return (
                      <li key={i} className="flex items-start gap-2 rounded-lg border border-border bg-background/40 p-3 text-sm">
                        <Award className="mt-0.5 h-4 w-4 text-warning" />
                        <div className="flex-1">
                          <div className="font-medium text-foreground">{s?.name ?? k.to}</div>
                          <div className="text-xs text-muted-foreground">{k.message}</div>
                          <div className="mt-1 text-[10px] text-muted-foreground">{k.at}</div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </Panel>
        </TabsContent>

        {/* QUICK MESSAGE */}
        <TabsContent value="msg">
          <Panel>
            <QuickMessage staff={filtered} onSend={(to, msg) => sendKudos(to, msg)} />
          </Panel>
        </TabsContent>
      </Tabs>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg border border-border bg-card px-4 py-2 text-sm shadow-lg">
          <span className="inline-flex items-center gap-2 text-foreground">
            <Sparkles className="h-4 w-4 text-primary" />{toast}
          </span>
        </div>
      )}
    </section>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="mt-3 rounded-2xl border border-border bg-card p-4 shadow-sm">{children}</div>;
}

function Metric({ label, value }: { label: string; value: number }) {
  const tone = value >= 85 ? "var(--color-tone-mint)" : value >= 70 ? "var(--color-tone-amber)" : "var(--color-destructive)";
  return (
    <div>
      <div className="flex justify-between text-muted-foreground">
        <span>{label}</span><span className="font-semibold" style={{ color: tone }}>{value}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-background/60">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: tone }} />
      </div>
    </div>
  );
}

function SpotKudos({
  staff, templates, onSend,
}: { staff: StaffPerf[]; templates: string[]; onSend: (to: string, msg: string) => void }) {
  const [to, setTo] = useState(staff[0]?.username ?? "");
  const [msg, setMsg] = useState(templates[0]);
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_2fr_auto]">
      <select className="rounded-md border border-border bg-background px-2 py-1.5 text-sm" value={to} onChange={(e) => setTo(e.target.value)}>
        {staff.map((s) => <option key={s.username} value={s.username}>{s.name} — {getDept(s.dept).short}</option>)}
      </select>
      <div>
        <textarea
          className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
          rows={2} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Write a quick appreciation…"
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {templates.map((t) => (
            <button key={t} onClick={() => setMsg(t)}
                    className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground hover:bg-secondary">
              <Plus className="mr-0.5 inline h-3 w-3" />{t.slice(0, 28)}…
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={() => { onSend(to, msg); setMsg(""); }}
        className="inline-flex h-9 items-center justify-center gap-1.5 self-start rounded-md bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
      >
        <Award className="h-3.5 w-3.5" /> Send kudos
      </button>
    </div>
  );
}

function QuickMessage({ staff, onSend }: { staff: StaffPerf[]; onSend: (to: string, msg: string) => void }) {
  const [to, setTo] = useState(staff[0]?.username ?? "");
  const [msg, setMsg] = useState("");
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Send an on-the-spot message that lands on the nurse's dashboard immediately. Use for coaching, reminders, or thank-you notes.
      </p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_3fr_auto]">
        <select className="rounded-md border border-border bg-background px-2 py-1.5 text-sm" value={to} onChange={(e) => setTo(e.target.value)}>
          {staff.map((s) => <option key={s.username} value={s.username}>{s.name}</option>)}
        </select>
        <input className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
               placeholder="Type message…" value={msg} onChange={(e) => setMsg(e.target.value)} />
        <button
          onClick={() => { if (msg.trim()) { onSend(to, msg); setMsg(""); } }}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Send className="h-3.5 w-3.5" /> Send
        </button>
      </div>
    </div>
  );
}
