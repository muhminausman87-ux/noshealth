import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listDepartments from "./tools/list-departments";
import listPatients from "./tools/list-patients";
import getPatient from "./tools/get-patient";
import workforcePulse from "./tools/workforce-pulse";

const supabaseUrl = (process.env.SUPABASE_URL ?? "https://supabase.invalid").replace(/\/+$/, "");

export default defineMcp({
  name: "nos-ecosystem-mcp",
  title: "NOS Ecosystem MCP",
  version: "0.1.0",
  instructions:
    "Read-only tools for the NOS Ecosystem (NOSHealth) nursing workforce intelligence demo. Use list_departments and list_patients to explore the roster, get_patient for a full clinical demo record, and workforce_pulse for today's workforce health, burnout risk, and staffing coverage.",
  auth: auth.oauth.issuer({
    issuer: `${supabaseUrl}/auth/v1`,
    acceptedAudiences: "authenticated",
    requireOAuthClientClaim: false,
  }),
  tools: [listDepartments, listPatients, getPatient, workforcePulse],
});
