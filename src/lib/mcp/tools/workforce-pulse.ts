import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { DEPARTMENTS } from "@/lib/departments";

// Deterministic demo pulse derived from department metadata so MCP clients get
// stable, meaningful output without a database.
function pulseFor(deptId: string) {
  const seed = deptId.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const rand = (offset: number, range: number, base: number) =>
    base + ((seed * 9301 + offset * 49297) % 233280) % range;
  const health = rand(1, 20, 72);
  const burnout = rand(2, 25, 18);
  const staffing = rand(3, 30, 65);
  return {
    healthScore: health,
    burnoutRiskPct: burnout,
    staffingCoveragePct: staffing,
    openConcerns: rand(4, 6, 1),
    appreciationsThisWeek: rand(5, 12, 3),
  };
}

export default defineTool({
  name: "workforce_pulse",
  title: "Workforce pulse",
  description:
    "Return today's NOSHealth Workforce Pulse (demo): overall workforce health, burnout risk, staffing coverage, and open concerns per department.",
  inputSchema: {
    department: z
      .string()
      .optional()
      .describe("Optional department id to scope the pulse (e.g. 'ed'). Omit for hospital-wide."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ department }) => {
    const scope = department
      ? DEPARTMENTS.filter((d) => d.id === department)
      : DEPARTMENTS;
    if (scope.length === 0) {
      return {
        content: [{ type: "text", text: `Unknown department "${department}".` }],
        isError: true,
      };
    }
    const pulses = scope.map((d) => ({
      department: d.id,
      name: d.name,
      ...pulseFor(d.id),
    }));
    const overall = {
      healthScore: Math.round(
        pulses.reduce((s, p) => s + p.healthScore, 0) / pulses.length,
      ),
      burnoutRiskPct: Math.round(
        pulses.reduce((s, p) => s + p.burnoutRiskPct, 0) / pulses.length,
      ),
      staffingCoveragePct: Math.round(
        pulses.reduce((s, p) => s + p.staffingCoveragePct, 0) / pulses.length,
      ),
      openConcerns: pulses.reduce((s, p) => s + p.openConcerns, 0),
      appreciationsThisWeek: pulses.reduce((s, p) => s + p.appreciationsThisWeek, 0),
    };
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ overall, byDepartment: pulses }, null, 2),
        },
      ],
      structuredContent: { overall, byDepartment: pulses },
    };
  },
});
