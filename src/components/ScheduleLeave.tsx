import { useState } from "react";
import { Calendar, Plane, AlertCircle, ArrowRightLeft, Phone, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { Session } from "@/lib/auth";
import { SUPPORT_PHONE, SUPPORT_PHONE_DISPLAY } from "@/lib/auth";

const ROSTER = [
  { day: "Mon", date: "02", shift: "Morning",  time: "07:00 – 15:00" },
  { day: "Tue", date: "03", shift: "Morning",  time: "07:00 – 15:00" },
  { day: "Wed", date: "04", shift: "Off",      time: "—" },
  { day: "Thu", date: "05", shift: "Evening",  time: "15:00 – 23:00" },
  { day: "Fri", date: "06", shift: "Evening",  time: "15:00 – 23:00" },
  { day: "Sat", date: "07", shift: "Night",    time: "23:00 – 07:00" },
  { day: "Sun", date: "08", shift: "Off",      time: "—" },
];

const BALANCES = [
  { kind: "Annual leave",   used: 8,  total: 24, tone: "var(--color-tone-mint)" },
  { kind: "Sick leave",     used: 2,  total: 10, tone: "var(--color-tone-amber)" },
  { kind: "Comp-off",       used: 1,  total: 5,  tone: "var(--color-tone-sky)" },
];

const LEAVE_TYPES = ["Annual leave", "Sick leave", "Comp-off", "Bereavement", "Personal"];

interface Props { session: Session }

export function ScheduleLeave({ session }: Props) {
  const [type, setType] = useState(LEAVE_TYPES[0]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [note, setNote] = useState("");

  const submit = () => {
    if (!from || !to) { toast.error("Pick start and end dates"); return; }
    toast.success(`${type} request sent to your manager.`);
    setFrom(""); setTo(""); setNote("");
  };

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      {/* This week's roster */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
        <header className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              This week · {session.name.replace(/^RN\s+/, "")}
            </h3>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5">
            <ArrowRightLeft className="h-3.5 w-3.5" /> Swap shift
          </Button>
        </header>

        <div className="grid grid-cols-7 gap-2">
          {ROSTER.map((r) => {
            const tone =
              r.shift === "Off" ? "var(--color-muted-foreground, #94a3b8)"
              : r.shift === "Night" ? "var(--color-tone-violet)"
              : r.shift === "Evening" ? "var(--color-tone-amber)"
              : "var(--color-tone-sky)";
            return (
              <div
                key={r.day}
                className="rounded-xl border border-border bg-background/40 p-2 text-center"
                style={{ borderTop: `3px solid ${tone}` }}
              >
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{r.day}</div>
                <div className="text-base font-semibold text-foreground">{r.date}</div>
                <div className="mt-1 text-[11px] font-medium" style={{ color: tone }}>{r.shift}</div>
                <div className="text-[10px] text-muted-foreground">{r.time}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Leave balances */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Leave balances
        </h3>
        <ul className="space-y-3">
          {BALANCES.map((b) => {
            const pct = Math.round((b.used / b.total) * 100);
            return (
              <li key={b.kind}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-medium text-foreground">{b.kind}</span>
                  <span className="text-muted-foreground">{b.total - b.used} of {b.total} left</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full" style={{ width: `${pct}%`, background: b.tone }} />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Request leave */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
        <header className="mb-3 flex items-center gap-2">
          <Plane className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Request time off
          </h3>
        </header>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="text-xs">
            <span className="mb-1 block text-muted-foreground">Type</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
            >
              {LEAVE_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs">
              <span className="mb-1 block text-muted-foreground">From</span>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </label>
            <label className="text-xs">
              <span className="mb-1 block text-muted-foreground">To</span>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </label>
          </div>
        </div>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Anything your manager should know? (optional)"
          rows={2}
          className="mt-3"
        />
        <div className="mt-3 flex justify-end">
          <Button onClick={submit} className="gap-1.5">
            <CheckCircle2 className="h-4 w-4" /> Send request
          </Button>
        </div>
      </section>

      {/* Absence / unwell */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <header className="mb-2 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-warning" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Unwell or absent today?
          </h3>
        </header>
        <p className="text-xs leading-relaxed text-muted-foreground">
          One tap tells your in-charge. No emails, no chasing — your team will cover.
        </p>
        <div className="mt-3 flex flex-col gap-2">
          <Button variant="outline" onClick={() => toast.success("Absence logged — in-charge notified.")}>
            I can't make it today
          </Button>
          <a
            href={`tel:${SUPPORT_PHONE}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm hover:bg-secondary"
          >
            <Phone className="h-3.5 w-3.5" /> Call in-charge · {SUPPORT_PHONE_DISPLAY}
          </a>
        </div>
      </section>
    </div>
  );
}
