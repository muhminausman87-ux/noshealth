import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Compass,
  LayoutDashboard,
  UserRound,
  Award,
  Workflow,
  ClipboardList,
  Users,
  FlaskConical,
  GraduationCap,
  LineChart,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const ITEMS: { label: string; to: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard },
  { label: "Patients", to: "/", icon: UserRound },
  { label: "Clinical Excellence", to: "/clinical-excellence", icon: Award },
  { label: "Workflow Intelligence", to: "/workflow-intelligence", icon: Workflow },
  { label: "Procedure Documentation", to: "/procedure-documentation", icon: ClipboardList },
  { label: "Workforce Intelligence", to: "/workforce-intelligence", icon: Users },
  { label: "Research", to: "/research", icon: FlaskConical },
  { label: "Learning", to: "/learning", icon: GraduationCap },
  { label: "Executive Intelligence", to: "/executive-intelligence", icon: LineChart },
];

export function QuickNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Quick navigation"
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 ring-1 ring-primary/40 transition hover:scale-105 hover:bg-primary/90"
      >
        <Compass className="h-5 w-5" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-[320px] p-0 sm:w-[360px]">
          <SheetHeader className="border-b border-border px-5 py-4">
            <SheetTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Quick navigation
            </SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 p-3">
            {ITEMS.map((it) => {
              const Icon = it.icon;
              return (
                <Link
                  key={it.label}
                  to={it.to}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition hover:bg-primary/10 hover:text-primary"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="truncate">{it.label}</span>
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
