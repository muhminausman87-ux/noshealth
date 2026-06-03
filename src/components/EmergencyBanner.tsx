import { useEffect, useState } from "react";
import { Siren, ShieldAlert } from "lucide-react";
import { getEmergency, setEmergency } from "@/lib/auth";

export function EmergencyBanner({ canToggle = false }: { canToggle?: boolean }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    setOn(getEmergency());
    const fn = () => setOn(getEmergency());
    window.addEventListener("synccare-emergency", fn);
    return () => window.removeEventListener("synccare-emergency", fn);
  }, []);

  if (!on && !canToggle) return null;

  if (!on && canToggle) {
    return (
      <div className="border-b border-border bg-secondary/40">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-6 py-2 text-xs">
          <span className="flex items-center gap-2 text-muted-foreground">
            <ShieldAlert className="h-4 w-4" /> Healthcare-emergency mode is OFF.
          </span>
          <button
            onClick={() => setEmergency(true)}
            className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-1 font-semibold text-destructive hover:bg-destructive/15"
          >
            Activate hospital emergency
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-destructive/40 bg-destructive/15">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-6 py-2 text-sm text-destructive">
        <span className="flex items-center gap-2 font-semibold">
          <Siren className="h-4 w-4 animate-pulse" />
          HEALTHCARE EMERGENCY ACTIVE — surge protocol on. Staff: +50% emergency pay, comp-off after the surge, hot meals & rest pods open.
        </span>
        {canToggle && (
          <button
            onClick={() => setEmergency(false)}
            className="rounded-md border border-destructive/40 bg-card px-3 py-1 text-xs font-semibold text-destructive hover:bg-secondary"
          >
            Stand down
          </button>
        )}
      </div>
    </div>
  );
}
