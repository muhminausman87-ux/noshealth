import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { PATIENTS } from "@/lib/patients";

export default defineTool({
  name: "get_patient",
  title: "Get patient details",
  description:
    "Fetch the full demo record for one patient by id (e.g. 'p-icu-01'): vitals, medications, GCS, pain, allergies, and clinical note.",
  inputSchema: {
    id: z.string().min(1).describe("Patient id from list_patients."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ id }) => {
    const patient = PATIENTS.find((p) => p.id === id);
    if (!patient) {
      return {
        content: [{ type: "text", text: `No patient found with id "${id}".` }],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(patient, null, 2) }],
      structuredContent: { patient },
    };
  },
});
