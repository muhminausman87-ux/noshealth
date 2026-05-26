import { AlertTriangle, User } from "lucide-react";

export function PatientBanner() {
  return (
    <div className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-8 gap-y-3 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User className="h-5 w-5" />
          </div>
          <div>
            <div className="text-base font-semibold text-foreground">John Doe</div>
            <div className="text-xs text-muted-foreground">Male · 47 y</div>
          </div>
        </div>
        <Field label="DOB" value="05/14/1978" />
        <Field label="MRN" value="987-654-321" />
        <Field label="Encounter" value="ENC-44219" />
        <div className="ml-auto flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-destructive">
          <AlertTriangle className="h-4 w-4" />
          <div className="text-sm">
            <span className="font-semibold">Allergy:</span> Penicillin
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}
