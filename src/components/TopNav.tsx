import { Activity, Bell, Search, Stethoscope } from "lucide-react";
import type { Department } from "@/lib/departments";
import { DEPARTMENTS } from "@/lib/departments";

interface Props {
  active: Department;
  onChange: (d: Department) => void;
}

export function TopNav({ active, onChange }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] items-center gap-6 px-6 py-3">
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

        <nav className="ml-4 flex items-center gap-1 rounded-lg bg-secondary/60 p-1">
          {DEPARTMENTS.map((d) => {
            const isActive = active === d.id;
            return (
              <button
                key={d.id}
                onClick={() => onChange(d.id)}
                className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-card text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: d.color }}
                />
                {d.short}
              </button>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground md:flex">
            <Search className="h-4 w-4" />
            <span>Search patient, order, note…</span>
          </div>
          <button className="relative rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
          </button>
          <div className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5">
            <Stethoscope className="h-4 w-4 text-primary" />
            <div className="text-sm">
              <div className="font-medium leading-tight">RN A. Chen</div>
              <div className="text-[10px] text-muted-foreground">Shift 07:00 — 19:00</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
