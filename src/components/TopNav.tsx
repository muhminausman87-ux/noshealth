import { Bell, ChevronDown, LogOut, Search, ShieldCheck, Stethoscope } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { Department } from "@/lib/departments";
import { DEPARTMENTS, getDept } from "@/lib/departments";
import { PATIENTS } from "@/lib/patients";
import type { Session } from "@/lib/auth";
import logo from "@/assets/nos-logo.png.asset.json";

interface Props {
  active: Department;
  onChange: (d: Department) => void;
  session: Session;
  onLogout: () => void;
}

export function TopNav({ active, onChange, session, onLogout }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const activeMeta = getDept(active);
  const isAdmin = session.role === "admin";

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return PATIENTS.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.mrn.toLowerCase().includes(term) ||
        p.room.toLowerCase().includes(term) ||
        p.id.toLowerCase().includes(term),
    ).slice(0, 8);
  }, [q]);

  const goTo = (id: string) => {
    setSearchOpen(false);
    setQ("");
    navigate({ to: "/patient/$patientId", params: { patientId: id } });
  };


  return (
    <header
      className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur"
      style={{ borderTop: `3px solid ${activeMeta.color}` }}
    >
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-4 px-6 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <div className="text-base font-semibold leading-tight text-foreground">
              SyncCare <span className="text-primary">EHR</span>
            </div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Clinical workspace
            </div>
          </div>
        </div>

        {/* Dept switcher: admin = all, staff = own + pulled (locked) */}
        <div className="relative">
          {isAdmin ? (
            <>
              <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 rounded-lg border border-border bg-secondary/60 px-3 py-2 text-sm font-medium hover:bg-secondary"
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: activeMeta.color }} />
                {activeMeta.name}
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
              {open && (
                <div className="absolute left-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
                  <div className="max-h-96 overflow-y-auto py-1">
                    {DEPARTMENTS.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => {
                          onChange(d.id);
                          setOpen(false);
                        }}
                        className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-secondary ${
                          d.id === active ? "bg-secondary/60 font-medium text-primary" : "text-foreground"
                        }`}
                      >
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                        {d.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/60 px-3 py-2 text-sm font-medium">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: activeMeta.color }} />
              {activeMeta.name}
              {session.pulled && (
                <span className="ml-1 rounded-full bg-warning/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-warning-foreground">
                  Pulled
                </span>
              )}
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div ref={searchRef} className="relative hidden md:block">
            <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => { setQ(e.target.value); setSearchOpen(true); }}
                onFocus={() => setSearchOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && results[0]) goTo(results[0].id);
                  if (e.key === "Escape") setSearchOpen(false);
                }}
                placeholder="Search patient, MRN, room…"
                className="w-64 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            {searchOpen && q.trim() && (
              <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
                {results.length === 0 ? (
                  <div className="px-3 py-4 text-center text-sm text-muted-foreground">No matches</div>
                ) : (
                  <ul className="max-h-80 overflow-y-auto py-1">
                    {results.map((p) => {
                      const m = getDept(p.dept);
                      return (
                        <li key={p.id}>
                          <button
                            onClick={() => goTo(p.id)}
                            className="flex w-full items-start gap-2.5 px-3 py-2 text-left hover:bg-secondary"
                          >
                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: m.color }} />
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-medium text-foreground">{p.name}</div>
                              <div className="truncate text-[11px] text-muted-foreground">
                                MRN {p.mrn} · {p.room} · {m.short}
                              </div>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>

          <button className="relative rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
          </button>
          <div className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5">
            {isAdmin ? (
              <ShieldCheck className="h-4 w-4 text-primary" />
            ) : (
              <Stethoscope className="h-4 w-4 text-primary" />
            )}
            <div className="text-sm">
              <div className="font-medium leading-tight">{session.name}</div>
              <div className="text-[10px] text-muted-foreground">{session.title}</div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
