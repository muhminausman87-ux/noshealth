import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { EcosystemLayout } from "@/components/EcosystemLayout";
import { Widget, StatusPill } from "@/components/Widget";
import {
  ClipboardList,
  Package,
  Pill,
  Warehouse,
  Boxes,
  Wrench,
  Trash2,
  Clock,
  FileText,
  ShieldCheck,
  StickyNote,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Building2,
  Receipt,
  ShoppingBag,
  Layers,
  Award,
  BookCheck,
  Users,
  Gauge,
  Timer,
  ClipboardCheck,
  Repeat,
  ArrowRight,
  Stethoscope,
} from "lucide-react";

export const Route = createFileRoute("/procedure-documentation")({
  head: () => ({
    meta: [
      { title: "Intelligent Procedure Documentation — NOS Ecosystem" },
      {
        name: "description",
        content:
          "Document a nursing procedure once and automatically prepare structured information for pharmacy, CSSD, billing, audit and inventory.",
      },
    ],
  }),
  component: ProcedureDocPage,
});

// ---------- Demo template library ----------

type ProcedureTemplate = {
  id: string;
  name: string;
  category: string;
  duration: string;
  consent: string;
  consumables: string[];
  medications: string[];
  pharmacy: string[];
  store: string[];
  cssdTray: string[];
  reusable: string[];
  disposable: string[];
  documentation: string[];
  policy: string[];
};

const PROCEDURES: ProcedureTemplate[] = [
  {
    id: "foley",
    name: "Foley Catheter Insertion",
    category: "Urology · Bedside",
    duration: "12–18 min",
    consent: "Verbal consent (documented). Written consent if long-term indwelling.",
    consumables: ["Foley catheter 16 Fr", "Sterile gloves ×2", "Underpad", "Cleansing wipes", "10 mL syringe"],
    medications: ["Sterile water for balloon 10 mL", "2% Lignocaine jelly 6 mL"],
    pharmacy: ["Lignocaine jelly (controlled dispense)"],
    store: ["Urine drainage bag 2 L", "Catheter fixation strap", "Biohazard bag"],
    cssdTray: ["Catheterization tray (sterile)"],
    reusable: ["Kidney tray", "Sponge holder"],
    disposable: ["Catheter", "Drainage bag", "Gloves"],
    documentation: ["Time in/out", "Catheter size & lot", "Urine output color/volume", "CAUTI bundle checklist"],
    policy: [
      "Follow CAUTI prevention bundle (INF-08).",
      "Re-assess necessity every 24h.",
      "Two-person verification for pediatric or difficult insertion.",
    ],
  },
  {
    id: "ng",
    name: "NG Tube Insertion",
    category: "GI · Bedside",
    duration: "10–15 min",
    consent: "Verbal consent documented.",
    consumables: ["NG tube 16 Fr", "Lubricant gel", "pH strip", "Adhesive tape", "50 mL syringe"],
    medications: ["Lignocaine viscous 2% (optional)"],
    pharmacy: ["Lignocaine viscous"],
    store: ["Drainage bag", "Skin barrier film"],
    cssdTray: ["Not required"],
    reusable: ["Stethoscope"],
    disposable: ["NG tube", "Syringe", "Gloves"],
    documentation: ["Tube length inserted", "pH aspirate value", "Placement confirmation method"],
    policy: [
      "pH ≤5.5 required before first feed.",
      "X-ray confirmation for high-risk patients (POL-NG-02).",
    ],
  },
  {
    id: "transfusion",
    name: "Blood Transfusion",
    category: "Hematology · Bedside",
    duration: "2–4 hr (monitored)",
    consent: "Written informed consent mandatory.",
    consumables: ["Blood administration set (170 µm filter)", "Y-connector", "0.9% Normal Saline 100 mL"],
    medications: ["Paracetamol 500 mg PO (pre-med, if ordered)", "Hydrocortisone 100 mg IV (if ordered)"],
    pharmacy: ["Pre-medications per order"],
    store: ["Blood cooler receipt slip", "Transfusion label pack"],
    cssdTray: ["Not required"],
    reusable: ["Vital signs monitor", "IV pole"],
    disposable: ["Blood set", "Gloves"],
    documentation: [
      "Two-nurse product verification",
      "Baseline & q15min vitals ×1 hr",
      "Any reaction (type, time, action)",
    ],
    policy: [
      "Two-nurse independent check at bedside (POL-TX-01).",
      "Complete within 4 hours of issue.",
      "Report reactions within 30 min to blood bank.",
    ],
  },
  {
    id: "central-line",
    name: "Central Line Dressing",
    category: "Vascular · Sterile",
    duration: "10 min",
    consent: "Verbal consent documented.",
    consumables: ["Chlorhexidine 2% swab", "Sterile transparent dressing", "Sterile gloves"],
    medications: ["Chlorhexidine 2% solution"],
    pharmacy: ["Chlorhexidine (antiseptic register)"],
    store: ["Transparent dressing (7×9 cm)", "Skin protectant wipes"],
    cssdTray: ["Small dressing tray (sterile)"],
    reusable: ["Sponge holder"],
    disposable: ["Dressing", "Gloves", "Swabs"],
    documentation: ["Site appearance", "CLABSI bundle checklist", "Next change due date"],
    policy: [
      "Change q7 days or if soiled (INF-CL-04).",
      "Escalate to MO if redness, drainage, or tenderness.",
    ],
  },
  {
    id: "vac",
    name: "VAC Dressing",
    category: "Wound · Sterile",
    duration: "25–40 min",
    consent: "Written consent for first application.",
    consumables: ["VAC foam", "Adhesive drape", "Tubing & canister", "Saline for irrigation"],
    medications: ["Analgesic per order (pre-procedure)"],
    pharmacy: ["Analgesic dispense"],
    store: ["VAC canister 300 mL", "Foam packs"],
    cssdTray: ["Wound care tray (sterile)"],
    reusable: ["VAC pump unit"],
    disposable: ["Foam", "Drape", "Canister"],
    documentation: ["Wound dimensions", "Exudate volume/type", "Pain score pre/post", "Photo (if consented)"],
    policy: [
      "Change every 48–72h (WC-VAC-03).",
      "Physician review required if wound bed deteriorates.",
    ],
  },
  {
    id: "chest-tube",
    name: "Chest Tube Care",
    category: "Respiratory · Sterile",
    duration: "20 min",
    consent: "Verbal consent documented.",
    consumables: ["Sterile gauze", "Occlusive dressing", "Chlorhexidine swabs"],
    medications: ["Lignocaine 1% (if MO-led site care)"],
    pharmacy: ["Lignocaine"],
    store: ["Chest drain bottle", "Sterile water 500 mL"],
    cssdTray: ["Chest tube dressing tray"],
    reusable: ["Suction unit"],
    disposable: ["Drain bottle", "Gauze"],
    documentation: ["Drainage volume/character", "Swing & bubbling", "Insertion site status"],
    policy: [
      "Never clamp without physician order (POL-CT-01).",
      "Two-person handling during transport.",
    ],
  },
  {
    id: "trach",
    name: "Tracheostomy Care",
    category: "Airway · Sterile",
    duration: "15–20 min",
    consent: "Verbal consent documented.",
    consumables: ["Sterile suction catheter", "Trach dressing", "Twill tie", "Saline 0.9%"],
    medications: ["Nebulized saline (if ordered)"],
    pharmacy: ["Nebules"],
    store: ["Suction catheters kit", "Spare trach tube (same size + one smaller)"],
    cssdTray: ["Tracheostomy care tray"],
    reusable: ["Suction unit", "Ambu bag"],
    disposable: ["Suction catheters", "Dressing"],
    documentation: ["Secretion color/amount", "Stoma condition", "Cuff pressure"],
    policy: [
      "Emergency trach box at bedside at all times (AIR-07).",
      "Two-person tie change within first 7 days.",
    ],
  },
  {
    id: "cpr",
    name: "CPR (Adult Advanced)",
    category: "Emergency · Team",
    duration: "Event-driven",
    consent: "Implied consent (emergency).",
    consumables: ["Bag-valve mask", "IV cannula 18G ×2", "IO needle", "ECG electrodes"],
    medications: ["Adrenaline 1 mg IV", "Amiodarone 300 mg IV", "0.9% NaCl 500 mL"],
    pharmacy: ["Crash cart replenishment slip"],
    store: ["Defib pads", "Airway kit"],
    cssdTray: ["Intubation tray (sterile)"],
    reusable: ["Defibrillator", "ECG monitor"],
    disposable: ["Pads", "Cannulae"],
    documentation: ["Code timeline", "Rhythms & shocks", "Drugs (dose/time)", "ROSC/outcome"],
    policy: [
      "Follow ACLS 2025 algorithm.",
      "Debrief within 24h (QI-CODE-01).",
    ],
  },
  {
    id: "ext-fix",
    name: "External Fixator Care",
    category: "Ortho · Sterile",
    duration: "20 min per site",
    consent: "Verbal consent documented.",
    consumables: ["Sterile gauze", "Chlorhexidine 0.5% aq.", "Cotton swabs"],
    medications: ["Analgesic per order"],
    pharmacy: ["Analgesic"],
    store: ["Pin-site care kit"],
    cssdTray: ["Pin-site dressing tray"],
    reusable: ["Kidney tray"],
    disposable: ["Gauze", "Swabs"],
    documentation: ["Pin sites (0–5 grading)", "Signs of infection", "Patient education notes"],
    policy: [
      "Weekly pin-site assessment (ORTH-EF-02).",
      "Escalate redness/discharge to ortho MO.",
    ],
  },
  {
    id: "iv",
    name: "IV Cannulation",
    category: "Vascular · Bedside",
    duration: "5–10 min",
    consent: "Verbal consent documented.",
    consumables: ["IV cannula 20G", "Alcohol swab", "Transparent dressing", "Tourniquet"],
    medications: ["0.9% NaCl flush 10 mL"],
    pharmacy: ["Flush syringes"],
    store: ["Cannula fixation dressing", "Sharps container"],
    cssdTray: ["Not required"],
    reusable: ["Tourniquet"],
    disposable: ["Cannula", "Swabs", "Dressing"],
    documentation: ["Site, gauge, attempts", "Patency check", "VIP score baseline"],
    policy: [
      "Max 2 attempts per nurse — escalate to IV Expert (POL-IV-11).",
      "Resite q72–96h or per VIP score.",
    ],
  },
];

// ---------- Component ----------

const VARIATION_TAGS = [
  { id: "attempt", label: "Additional Attempt" },
  { id: "condition", label: "Patient Condition" },
  { id: "emergency", label: "Emergency" },
  { id: "contamination", label: "Contamination" },
  { id: "equipment", label: "Equipment Failure" },
  { id: "other", label: "Other" },
];

const DEPARTMENTS = [
  { id: "emr", name: "Patient Medical Record", icon: FileText, status: "Ready for Review" as const },
  { id: "billing", name: "Billing Review", icon: Receipt, status: "Pending" as const },
  { id: "pharmacy", name: "Pharmacy", icon: Pill, status: "Ready for Review" as const },
  { id: "store", name: "Store Inventory", icon: ShoppingBag, status: "Ready for Review" as const },
  { id: "cssd", name: "CSSD", icon: Layers, status: "Pending" as const },
  { id: "quality", name: "Quality", icon: Award, status: "Completed" as const },
  { id: "audit", name: "Audit", icon: BookCheck, status: "Ready for Review" as const },
  { id: "workforce", name: "Workforce Analytics", icon: Users, status: "Completed" as const },
];

function ProcedureDocPage() {
  const [selectedId, setSelectedId] = useState<string>("foley");
  const [completed, setCompleted] = useState(false);
  const [variations, setVariations] = useState<string[]>([]);
  const [additionalItems, setAdditionalItems] = useState("");
  const [itemsNotUsed, setItemsNotUsed] = useState("");
  const [clinicalReason, setClinicalReason] = useState("");

  const procedure = useMemo(
    () => PROCEDURES.find((p) => p.id === selectedId) ?? PROCEDURES[0],
    [selectedId],
  );

  const toggleVariation = (id: string) =>
    setVariations((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]));

  return (
    <EcosystemLayout>
      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">
        {/* Header */}
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ClipboardCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                NOS Ecosystem · New Module
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Intelligent Procedure Documentation
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Document once. Use everywhere.</span>{" "}
                AI-assisted structuring of a single nursing procedure into pharmacy, CSSD,
                billing, audit and inventory-ready information.
              </p>
            </div>
          </div>
          <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
            Demo · Prototype
          </span>
        </header>

        {/* Workflow strip */}
        <ol className="mb-6 grid grid-cols-2 gap-2 rounded-xl border border-border bg-card p-2 text-[11px] font-medium text-muted-foreground sm:grid-cols-6">
          {["Select", "Template", "Completion", "AI Summary", "Departments", "Burden Saved"].map(
            (s, i) => (
              <li
                key={s}
                className="flex items-center gap-2 rounded-lg bg-secondary/50 px-2.5 py-2"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary">
                  {i + 1}
                </span>
                <span className="truncate text-foreground">{s}</span>
              </li>
            ),
          )}
        </ol>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            {/* STEP 1 */}
            <Widget title="Step 1 · Select Procedure" icon={Stethoscope} subtitle="Choose from the standardized nursing procedure library">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                {PROCEDURES.map((p) => {
                  const on = p.id === selectedId;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedId(p.id);
                        setCompleted(false);
                        setVariations([]);
                      }}
                      className={`rounded-lg border p-2.5 text-left text-xs transition ${
                        on
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-secondary/60"
                      }`}
                    >
                      <div className="line-clamp-2 font-semibold leading-snug">{p.name}</div>
                      <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                        {p.category}
                      </div>
                    </button>
                  );
                })}
              </div>
            </Widget>

            {/* STEP 2 */}
            <Widget
              title="Step 2 · Standard Procedure Template"
              icon={ClipboardList}
              subtitle={`${procedure.name} — auto-populated from hospital SOP`}
            >
              <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg bg-secondary/40 p-3 text-xs">
                <span className="inline-flex items-center gap-1.5 text-foreground">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <strong>Duration:</strong> {procedure.duration}
                </span>
                <span className="inline-flex items-center gap-1.5 text-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  <strong>Consent:</strong> {procedure.consent}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                <TemplateList icon={Package} title="Required Consumables" items={procedure.consumables} />
                <TemplateList icon={Pill} title="Required Medications" items={procedure.medications} />
                <TemplateList icon={Warehouse} title="Pharmacy Items" items={procedure.pharmacy} />
                <TemplateList icon={Boxes} title="Store Items" items={procedure.store} />
                <TemplateList icon={Layers} title="CSSD Tray" items={procedure.cssdTray} />
                <TemplateList icon={Wrench} title="Reusable Instruments" items={procedure.reusable} />
                <TemplateList icon={Trash2} title="Disposable Items" items={procedure.disposable} />
                <TemplateList icon={FileText} title="Required Documentation" items={procedure.documentation} />
                <TemplateList icon={StickyNote} title="Hospital Policy Notes" items={procedure.policy} />
              </div>
            </Widget>

            {/* STEP 3 */}
            <Widget
              title="Step 3 · Procedure Completion"
              icon={CheckCircle2}
              subtitle="Nurse documents only what differs from standard"
            >
              <div className="space-y-4">
                <label className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
                  <input
                    type="checkbox"
                    checked={completed}
                    onChange={(e) => setCompleted(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-[color:var(--color-primary)]"
                  />
                  <span className="text-sm">
                    <span className="font-medium text-foreground">Procedure completed</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      Timestamp and performer auto-captured from session
                    </span>
                  </span>
                </label>

                <div>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Variations from standard
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {VARIATION_TAGS.map((t) => {
                      const on = variations.includes(t.id);
                      return (
                        <button
                          key={t.id}
                          onClick={() => toggleVariation(t.id)}
                          className={`rounded-full border px-3 py-1 text-xs transition ${
                            on
                              ? "border-primary bg-primary/15 text-primary"
                              : "border-border bg-card text-foreground hover:border-primary/40"
                          }`}
                        >
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Field
                    label="Additional items used"
                    placeholder="e.g. 2nd cannula (20G), extra 5×5 gauze"
                    value={additionalItems}
                    onChange={setAdditionalItems}
                  />
                  <Field
                    label="Items not used"
                    placeholder="e.g. Lignocaine jelly (patient allergic)"
                    value={itemsNotUsed}
                    onChange={setItemsNotUsed}
                  />
                  <Field
                    label="Clinical reason"
                    placeholder="e.g. Difficult vasculature, escalated to IV Expert"
                    value={clinicalReason}
                    onChange={setClinicalReason}
                    full
                  />
                </div>
              </div>
            </Widget>

            {/* STEP 4 */}
            <Widget
              title="Step 4 · AI Documentation Summary"
              icon={Sparkles}
              subtitle="Auto-drafted from the template + completion inputs"
            >
              <div className="mb-3 flex items-center gap-2">
                <StatusPill tone="info">AI Prototype</StatusPill>
                <span className="text-[11px] text-muted-foreground">
                  Editable by the nurse before finalizing
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <SummaryCard
                  icon={FileText}
                  title="Clinical Summary"
                  body={`${procedure.name} performed successfully. Standard sterile technique followed per SOP. ${
                    variations.length ? `Variations noted: ${variations.map((v) => VARIATION_TAGS.find((t) => t.id === v)?.label).join(", ")}.` : "No variations from standard protocol."
                  } ${clinicalReason ? `Clinical note: ${clinicalReason}.` : ""}`}
                />
                <SummaryCard
                  icon={Package}
                  title="Resources Used"
                  body={`Consumables and medications drawn as per template. ${additionalItems ? `Additional: ${additionalItems}.` : ""} Reusable instruments returned to CSSD for reprocessing.`}
                />
                <SummaryCard
                  icon={AlertTriangle}
                  title="Resource Variance"
                  body={`${additionalItems || itemsNotUsed ? `Variance detected — ${additionalItems ? `+${additionalItems}` : ""}${itemsNotUsed ? ` / -${itemsNotUsed}` : ""}. Flag for store & pharmacy reconciliation.` : "No variance from planned resource pack."}`}
                />
                <SummaryCard
                  icon={Receipt}
                  title="Suggested Billing Notes"
                  body="Procedure code auto-mapped. Consumables aggregated per hospital chargemaster. Nurse review not required for standard packs."
                />
                <SummaryCard
                  icon={ShoppingBag}
                  title="Suggested Inventory Notes"
                  body="Auto-decrement store items on completion. Trigger re-order if VAC canister or CVC dressing kit falls below par level."
                />
                <SummaryCard
                  icon={BookCheck}
                  title="Suggested Audit Notes"
                  body="Compliance with bundle checklist captured. Two-nurse verification steps timestamped. Ready for monthly QI review."
                />
              </div>
            </Widget>

            {/* STEP 5 */}
            <Widget
              title="Step 5 · Department Impact"
              icon={Building2}
              subtitle="Structured data auto-routed to downstream systems"
            >
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {DEPARTMENTS.map((d) => (
                  <DeptRow key={d.id} name={d.name} icon={d.icon} status={d.status} />
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-secondary/40 p-2.5 text-[11px] text-muted-foreground">
                <ArrowRight className="h-3.5 w-3.5 text-primary" />
                One completion event → 8 downstream department packages generated.
              </div>
            </Widget>
          </div>

          {/* STEP 6 sidebar */}
          <aside className="space-y-4 xl:sticky xl:top-4 xl:self-start">
            <Widget title="Step 6 · Documentation Burden Saved" icon={Gauge} subtitle="Impact of this single procedure event">
              <div className="space-y-3">
                <Metric icon={Repeat} label="Manual documentation steps avoided" value="14" tone="success" />
                <Metric icon={Layers} label="Duplicate entries prevented" value="9" tone="success" />
                <Metric icon={Timer} label="Estimated nursing time saved" value="11.5 min" tone="info" />
                <Metric icon={ClipboardCheck} label="Documentation completeness" value="98%" tone="success" />
                <Metric icon={Gauge} label="Workflow efficiency" value="+37%" tone="info" />
              </div>
            </Widget>

            <Widget title="Design Philosophy" icon={Sparkles}>
              <ul className="space-y-1.5 text-xs text-foreground">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Document once.</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Use everywhere.</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Reduce nursing burden.</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Improve accuracy.</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Support hospital operations.</li>
              </ul>
              <div className="mt-3">
                <StatusPill tone="info">AI Prototype</StatusPill>
              </div>
            </Widget>
          </aside>
        </div>

        <AutomaticInformationFlow />
        <AIDocumentationIntelligence />
        <ClinicalWorkflowImpact />
      </main>
    </EcosystemLayout>
  );
}

// ---------- Subcomponents ----------

function TemplateList({
  icon: Icon,
  title,
  items,
}: {
  icon: typeof Package;
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-lg border border-border bg-card/60 p-3">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-foreground">
        <Icon className="h-3.5 w-3.5 text-primary" />
        {title}
      </div>
      <ul className="space-y-1 text-[12px] text-muted-foreground">
        {items.map((it) => (
          <li key={it} className="flex items-start gap-1.5">
            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary/60" />
            <span className="leading-snug">{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  full,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  full?: boolean;
}) {
  return (
    <label className={`block ${full ? "md:col-span-2" : ""}`}>
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
    </label>
  );
}

function SummaryCard({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof FileText;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-gradient-to-br from-primary/[0.04] to-transparent p-3">
      <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-foreground">
        <Icon className="h-3.5 w-3.5 text-primary" />
        {title}
      </div>
      <p className="text-[12px] leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

function DeptRow({
  name,
  icon: Icon,
  status,
}: {
  name: string;
  icon: typeof FileText;
  status: "Ready for Review" | "Pending" | "Completed";
}) {
  const tone: "info" | "warning" | "success" =
    status === "Completed" ? "success" : status === "Pending" ? "warning" : "info";
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card p-2.5">
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 text-xs font-medium text-foreground truncate">{name}</div>
      </div>
      <StatusPill tone={tone}>{status}</StatusPill>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Gauge;
  label: string;
  value: string;
  tone: "success" | "info";
}) {
  const color = tone === "success" ? "text-success" : "text-primary";
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card/60 p-2.5">
      <div className="flex items-center gap-2 min-w-0">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className="text-[12px] text-muted-foreground">{label}</span>
      </div>
      <span className={`text-sm font-semibold ${color}`}>{value}</span>
    </div>
  );
}
