import * as XLSX from "xlsx";
import type { NurseProfile, Roster, SchedulingPolicy } from "./types";
import { dayNum } from "./engine";

/** Sheet 1 header uses day-of-month numbers, matching an Excel duty roster. */
export function exportRosterWorkbook(roster: Roster, policy: SchedulingPolicy, nurses: NurseProfile[]) {
  const wb = XLSX.utils.book_new();
  const byId = (id: string) => nurses.find((n) => n.id === id);

  const header = ["Nurse ID", "Nurse", "Designation", ...roster.dates.map((d) => String(dayNum(d))), "Total Hrs", "Nights", "OFF"];
  const rows = roster.nurseIds.map((id) => {
    const n = byId(id);
    const s = roster.summaries.find((x) => x.nurseId === id);
    return [
      id,
      n?.name ?? id,
      n?.designation ?? "",
      ...roster.dates.map((d) => roster.cells[id]?.[d] ?? ""),
      s?.totalHours ?? 0,
      s?.nights ?? 0,
      s?.offDays ?? 0,
    ];
  });
  const s1 = XLSX.utils.aoa_to_sheet([
    [`Monthly Duty Roster — ${policy.institution} · ${roster.unit} · ${roster.month}`],
    [`Policy ${policy.name} ${policy.version} · Generated ${roster.generatedAt.slice(0, 16).replace("T", " ")} by ${roster.generatedBy}`],
    [],
    header,
    ...rows,
  ]);
  s1["!cols"] = [{ wch: 12 }, { wch: 22 }, { wch: 18 }, ...roster.dates.map(() => ({ wch: 4 })), { wch: 9 }, { wch: 7 }, { wch: 6 }];
  XLSX.utils.book_append_sheet(wb, s1, "Monthly Duty Roster");

  const s2 = XLSX.utils.aoa_to_sheet([
    ["Nurse", "Designation", "Total Hours", "Duties", "Nights", "Weekends", "OFF Days", "Leave", "Overtime Hrs", "OFF Requests", "Duty Requests", "Risk Flags"],
    ...roster.summaries.map((s) => {
      const n = byId(s.nurseId);
      return [
        n?.name ?? s.nurseId,
        n?.designation ?? "",
        s.totalHours,
        s.duties,
        s.nights,
        s.weekends,
        s.offDays,
        s.leaveDays,
        s.overtimeHours,
        `${s.offRequestsGranted}/${s.offRequestsTotal}`,
        `${s.dutyRequestsGranted}/${s.dutyRequestsTotal}`,
        s.flags.join("; "),
      ];
    }),
  ]);
  XLSX.utils.book_append_sheet(wb, s2, "Nurse Summary");

  const s3 = XLSX.utils.aoa_to_sheet([
    ["Date", "Shift", "Required", "Scheduled", "Shortage/Surplus", "Senior Required", "Senior Scheduled", "Skill Mix Status"],
    ...roster.coverage.map((c) => [
      c.date,
      c.shiftCode,
      c.required,
      c.scheduled,
      c.scheduled - c.required,
      c.requiredSenior,
      c.scheduledSenior,
      c.competencyMet && c.scheduledSenior >= c.requiredSenior ? "Met" : "Gap",
    ]),
  ]);
  XLSX.utils.book_append_sheet(wb, s3, "Staffing Coverage");

  const s4 = XLSX.utils.aoa_to_sheet([
    ["Policy", policy.name],
    ["Version", policy.version],
    ["Institution", policy.institution],
    ["Effective from", policy.effectiveFrom],
    [],
    ["Rule", "Value", "Reference", "Verification"],
    ...([
      ["Max hours / day", policy.maxHoursPerDay, "maxHoursPerDay"],
      ["Max hours / week", policy.maxHoursPerWeek, "maxHoursPerWeek"],
      ["Min rest between shifts (h)", policy.minRestHoursBetweenShifts, "minRestHoursBetweenShifts"],
      ["Max consecutive working days", policy.maxConsecutiveWorkDays, ""],
      ["Max consecutive nights", policy.maxConsecutiveNights, "maxConsecutiveNights"],
      ["Min days off / week", policy.minDaysOffPerWeek, ""],
      ["Max nights / month", policy.maxNightsPerMonth, ""],
      ["Weekend duties / month", policy.weekendDutiesPerMonth, ""],
      ["Overtime allowed", policy.overtimeAllowed ? "Yes" : "No", ""],
      ["Max overtime hrs / month", policy.maxOvertimeHoursPerMonth, ""],
      ["Break minutes / shift", policy.breakMinutesPerShift, "breakMinutesPerShift"],
    ] as [string, string | number, string][]).map(([label, value, key]) => {
      const src = key ? policy.sources[key] : undefined;
      return [label, value, src?.reference ?? "Institutional policy", src ? (src.verified ? "Institution verified" : "Requires institutional/legal verification") : "Institution verified"];
    }),
    [],
    ["Department staffing requirements"],
    ["Shift", "Min nurses", "Min senior", "Required competency", "Nurse:patient ratio"],
    ...policy.requirements.map((r) => [r.shiftCode, r.minNurses, r.minSenior, r.requiredCompetency ?? "—", r.nursePatientRatio ?? "—"]),
    [],
    ["Institution-specific restrictions"],
    ...policy.restrictions.map((r) => [r]),
  ]);
  s4["!cols"] = [{ wch: 30 }, { wch: 16 }, { wch: 60 }, { wch: 38 }];
  XLSX.utils.book_append_sheet(wb, s4, "Policy & Rules");

  const s5 = XLSX.utils.aoa_to_sheet([
    ["Severity", "Category", "Date", "Shift", "Nurse", "Message", "Override by", "Override reason"],
    ...roster.exceptions.map((e) => [
      e.severity,
      e.category,
      e.date ?? "",
      e.shiftCode ?? "",
      e.nurseId ? (byId(e.nurseId)?.name ?? e.nurseId) : "",
      e.message,
      e.overridden?.by ?? "",
      e.overridden?.reason ?? "",
    ]),
  ]);
  s5["!cols"] = [{ wch: 10 }, { wch: 28 }, { wch: 12 }, { wch: 7 }, { wch: 20 }, { wch: 90 }, { wch: 18 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, s5, "Exceptions");

  XLSX.writeFile(wb, `NOS-Duty-Roster-${roster.unit.replace(/\s+/g, "-")}-${roster.month}.xlsx`);
}

export interface ImportDiff {
  nurseId: string;
  nurseName: string;
  date: string;
  from: string;
  to: string;
}

/** Read an edited roster back. Nothing is accepted before validation. */
export async function parseRosterWorkbook(
  file: File,
  roster: Roster,
  nurses: NurseProfile[],
): Promise<{ diffs: ImportDiff[]; cells: Record<string, Record<string, string>>; errors: string[] }> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]!];
  const errors: string[] = [];
  if (!sheet) return { diffs: [], cells: roster.cells, errors: ["The uploaded file has no readable sheet."] };
  const aoa = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, { header: 1, blankrows: false });
  const headerIdx = aoa.findIndex((r) => String(r[0] ?? "").trim().toLowerCase() === "nurse id");
  if (headerIdx < 0) return { diffs: [], cells: roster.cells, errors: ["Could not find the roster header row (expected 'Nurse ID')."] };
  const header = aoa[headerIdx]!;
  const dayCols = new Map<number, string>();
  header.forEach((h, i) => {
    const d = Number(h);
    if (i >= 3 && Number.isFinite(d) && d >= 1 && d <= 31) {
      const iso = roster.dates.find((x) => dayNum(x) === d);
      if (iso) dayCols.set(i, iso);
    }
  });

  const cells: Record<string, Record<string, string>> = JSON.parse(JSON.stringify(roster.cells));
  const diffs: ImportDiff[] = [];
  aoa.slice(headerIdx + 1).forEach((row) => {
    const id = String(row[0] ?? "").trim();
    const nurse = nurses.find((n) => n.id === id);
    if (!nurse) {
      if (id) errors.push(`Unknown nurse ID "${id}" in the uploaded file — row ignored.`);
      return;
    }
    dayCols.forEach((iso, col) => {
      const to = String(row[col] ?? "").trim().toUpperCase();
      if (!to) return;
      const from = roster.cells[id]?.[iso] ?? "";
      if (from !== to) {
        diffs.push({ nurseId: id, nurseName: nurse.name, date: iso, from, to });
        cells[id]![iso] = to;
      }
    });
  });
  return { diffs, cells, errors };
}
