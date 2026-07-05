import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { PATIENTS } from "@/lib/patients";
import { DEPARTMENTS } from "@/lib/departments";

const deptIds = DEPARTMENTS.map((d) => d.id) as [string, ...string[]];

export default defineTool({
  name: "list_patients",
  title: "List patients",
  description:
    "List demo patients in the NOS Ecosystem, optionally filtered by department or clinical status. Returns a compact roster (id, name, room, MRN, department, status).",
  inputSchema: {
    department: z
      .enum(deptIds as [string, ...string[]])
      .optional()
      .describe("Filter by department id (e.g. ed, icu, medsurg)."),
    status: z
      .enum(["stable", "watch", "critical"])
      .optional()
      .describe("Filter by clinical status."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ department, status }) => {
    const rows = PATIENTS.filter(
      (p) => (!department || p.dept === department) && (!status || p.status === status),
    ).map((p) => ({
      id: p.id,
      name: p.name,
      age: p.age,
      sex: p.sex,
      mrn: p.mrn,
      room: p.room,
      department: p.dept,
      status: p.status,
      reason: p.reasonForAdmission,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(rows, null, 2) }],
      structuredContent: { count: rows.length, patients: rows },
    };
  },
});
