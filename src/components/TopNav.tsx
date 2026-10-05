import { ChevronDown, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { Department } from "@/lib/departments";
import { DEPARTMENTS, getDept } from "@/lib/departments";
import { PATIENTS } from "@/lib/patients";
import type { Session } from "@/lib/auth";

interface Props {
  active: Department;
  onChange: (d: Department) => void;
  session: Session;
  onLogout?: () => void;
}

export function TopNav({ active, onChange, session }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const activeMeta = getDept(active);
  const isAdmin = session.role === "admin";

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
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
        p.id.toLowerCase().includes(term)
    ).slice(0, 8);
  }, [q]);

  const goTo = (id: string) => {
    setSearchOpen(false);
    setQ("");
    navigate({ to: "/patient/$patientId", params: { patientId: id } });
  };

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/80 p-3 shadow-xs min-w-0 max-w-full"
      style={{ borderLeft: `4px solid ${activeMeta.color}` }}
    >
      {/* Department Selector */}
      <div className="flex flex-wrap items-center gap-2 min-w-0 max-w-full">
        <span className="text-xs font-medium text-muted-foreground shrink-0">Department:</span>
        <div className="relative min-w-0 max-w-full">
          {isAdmin ? (
            <>
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 rounded-lg border border-border bg-secondary/60 px-2.5 sm:px-3 py-1.5 text-xs font-semibold hover:bg-secondary transition max-w-full min-w-0"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: activeMeta.color }}
                />
                <span className="text-foreground truncate max-w-[150px] sm:max-w-none">{activeMeta.name}</span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              </button>
              {open && (
                <div className="absolute left-0 top-full z-50 mt-1.5 w-64 max-w-[calc(100vw-2.5rem)] overflow-hidden rounded-lg border border-border bg-card shadow-xl">
                  <div className="max-h-72 overflow-y-auto py-1">
                    {DEPARTMENTS.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => {
                          onChange(d.id);
                          setOpen(false);
                        }}
                        className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs hover:bg-secondary ${
                          d.id === active
                            ? "bg-secondary/60 font-semibold text-primary"
                            : "text-foreground"
                        }`}
                      >
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: d.color }}
                        />
                        <span className="truncate">{d.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/60 px-2.5 sm:px-3 py-1.5 text-xs font-semibold max-w-full min-w-0">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: activeMeta.color }}
              />
              <span className="text-foreground truncate">{activeMeta.name}</span>
              {session.pulled && (
                <span className="ml-1 rounded-full bg-warning/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-warning-foreground shrink-0">
                  Pulled
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Patient Search */}
      <div ref={searchRef} className="relative w-full sm:w-auto sm:flex-1 sm:max-w-sm min-w-0">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs min-w-0">
          <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && results[0]) goTo(results[0].id);
              if (e.key === "Escape") setSearchOpen(false);
            }}
            placeholder="Search patient name, MRN, room…"
            className="w-full min-w-0 bg-transparent text-xs outline-none placeholder:text-muted-foreground/70"
          />
        </div>
        {searchOpen && q.trim() && (
          <div className="absolute right-0 top-full z-50 mt-1.5 w-full sm:w-80 max-w-[calc(100vw-2.5rem)] overflow-hidden rounded-lg border border-border bg-card shadow-2xl">
            {results.length === 0 ? (
              <div className="px-3 py-3 text-center text-xs text-muted-foreground">
                No matching patients found
              </div>
            ) : (
              <ul className="max-h-72 overflow-y-auto py-1">
                {results.map((p) => {
                  const m = getDept(p.dept);
                  return (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => goTo(p.id)}
                        className="flex w-full items-start gap-2.5 px-3 py-2 text-left hover:bg-secondary cursor-pointer"
                      >
                        <span
                          className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: m.color }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-xs font-semibold text-foreground">
                            {p.name}
                          </div>
                          <div className="truncate text-[10.5px] text-muted-foreground">
                            MRN {p.mrn} · Bed {p.room} · {m.short}
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
    </div>
  );
}
