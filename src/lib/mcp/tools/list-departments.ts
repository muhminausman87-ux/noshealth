import { defineTool } from "@lovable.dev/mcp-js";
import { DEPARTMENTS } from "@/lib/departments";

export default defineTool({
  name: "list_departments",
  title: "List departments",
  description: "List all hospital departments configured in the NOS Ecosystem workspace.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify(DEPARTMENTS, null, 2) }],
    structuredContent: { departments: DEPARTMENTS },
  }),
});
