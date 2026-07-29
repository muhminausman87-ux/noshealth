# Workspace Restructuring Plan

Reorganize the app into 6 independent workspaces, each with its own sidebar and landing page. No backend, routing target pages, or module functionality changes — only navigation shell, a workspace selector, and role-based post-login routing.

## New Route Structure

```
/workspace                    → Administrator workspace selector (6 cards)
/clinical                     → Clinical Workspace landing
/workforce                    → Workforce Operations landing (alias of existing /workforce-intelligence content)
/wellbeing                    → Employee Wellbeing landing
/growth                       → Employee Growth landing
/excellence                   → Clinical Excellence landing (reuses /clinical-excellence)
/executive                    → Executive Intelligence landing (reuses /executive-intelligence)
```

Existing module routes (`/procedure-documentation`, `/digital-twin`, `/workflow-intelligence`, `/research`, `/ebp`, `/learning`, `/clinical-excellence`, `/executive-intelligence`, `/workforce-intelligence`, `/patient/$id`, `/nursing-workforce-twin`) remain untouched and function as module pages linked from workspace sidebars.

## Workspace Shell

Add `src/components/WorkspaceShell.tsx`:
- Accepts `workspace` config: name, color, modules `[{label, to, icon}]`
- Renders workspace-scoped sidebar (replaces global `AppSidebar` inside its subtree) showing ONLY that workspace's modules
- Header shows workspace name + "Switch Workspace" button → `/workspace` (Admin) or logout for non-admins
- Landing page (index of each workspace route) shows module cards + brief purpose text

## Workspace Definitions

Add `src/lib/workspaces.ts` with the 6 workspaces from the spec, each mapping modules to existing routes (new module labels reuse existing pages; modules without a dedicated page link to placeholder sections within the workspace landing — no new module functionality built).

## Role-Based Post-Login Routing

Edit `src/routes/login.tsx` (and `src/routes/index.tsx` admin redirect) so post-login destination is derived from role:

- `staff` / charge nurse / physician (`doctor`) / allied (`lab`, `radiology`) → `/clinical`
- Nurse Manager / Supervisor → `/workforce`
- CNO → `/executive`
- Educator → `/growth`
- Quality Manager → `/excellence`
- HR → `/wellbeing`
- `admin` (Administrator) → `/workspace`

Existing DB roles are limited (`admin`, `nurse`, `doctor`, `lab`, `radiology`). Since the spec's finer roles (Nurse Manager, CNO, Educator, etc.) do not exist in the schema and the user said "do not change backend," map only what exists:

- `admin` → `/workspace` selector
- `nurse` (staff) → `/clinical`
- `doctor` → `/clinical`
- `lab` → `/clinical`
- `radiology` → `/clinical`

Additional roles can be exercised by the admin via the selector (which shows all 6 workspaces).

## Global Sidebar Behavior

`AppSidebar` in `__root.tsx` continues to render (icon-rail collapsed by default). Inside a workspace route we override it via a workspace-scoped sidebar rendered in the page, and hide the global one on those routes — simpler: keep the global one but replace `AppSidebar` content contextually based on current path prefix using a `useWorkspaceForPath` helper. This keeps `__root` structure intact.

## Files

**New**
- `src/lib/workspaces.ts` — 6 workspace configs
- `src/components/WorkspaceShell.tsx` — reusable shell/landing
- `src/routes/workspace.tsx` — Admin selector page
- `src/routes/clinical.tsx`, `workforce.tsx`, `wellbeing.tsx`, `growth.tsx`, `excellence.tsx`, `executive.tsx` — landings

**Modified**
- `src/components/AppSidebar.tsx` — driven by current workspace context (falls back to full nav when none)
- `src/routes/login.tsx` — role-based post-login redirect
- `src/routes/index.tsx` — admin → `/workspace`, staff → `/clinical`

## Out of Scope

- No backend / RLS / schema changes
- No changes to existing module pages' content
- No new module functionality — modules without dedicated pages appear as cards on the workspace landing labeled "Available in this workspace"
