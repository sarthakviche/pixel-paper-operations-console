# Technical Requirements Document — Agency Video/Graphics PM Tool

Version 1.0 — for direct handoff to a coding agent. Build sprint-by-sprint in the order given in §14; don't skip ahead.

---

## 1. System Overview

A responsive web app (phone/tablet/laptop, one codebase) for video/graphics agencies to manage clients, projects, and a per-line production workflow driven by LLM transcript breakdown.

**Stack (fixed, non-negotiable):**
- Frontend: **Next.js (App Router) + React + TypeScript**
- Styling: **Tailwind CSS**, mobile-first breakpoints
- Backend: **Supabase** — Postgres, Auth, Storage, Edge Functions
- LLM: **Gemini API** (transcript breakdown, structured JSON output)
- Image generation: Gemini/Imagen (or swappable free-tier provider) — behind an abstraction, decided at implementation time
- Hosting: Vercel (frontend) + Supabase (backend) — assume this unless told otherwise

**Non-negotiables the coding agent must not violate:**
1. Every screen must render correctly at 375px (phone), 768px (tablet), and 1280px+ (laptop) with no horizontal scroll.
2. No API keys (Gemini, image-gen) ever shipped to the client. All LLM/image calls go through Supabase Edge Functions.
3. All data access must be enforced by Postgres Row Level Security (RLS), not just app-layer checks.
4. Editors must only ever see/query rows they're assigned to; enforce via RLS, not UI hiding.

---

## 2. Architecture Diagram (textual)

```
[Browser: Next.js PWA-capable web app]
        |
        | Supabase JS client (auth, db reads via RLS, storage)
        v
[Supabase: Postgres + Auth + Storage]
        ^
        | invoked via supabase-js functions.invoke()
        |
[Supabase Edge Functions]
   - breakdown-transcript   -> calls Gemini API
   - generate-image         -> calls Gemini/Imagen API
   - (both hold secrets, never exposed to client)
        |
        v
[External APIs: Gemini API, Image-gen API]
```

---

## 3. Auth & Roles

### 3.1 Auth provider
Supabase Auth, email/password to start (magic link optional nice-to-have). No social login required for MVP.

### 3.2 Roles
Stored in `profiles.role`: `admin`, `manager`, `editor`. Treat `admin` and `manager` as equivalent permission-wise for MVP (both = full access) unless told to differentiate later — don't build a separate manager-restriction layer speculatively.

### 3.3 Session handling
- Use Supabase's SSR-safe auth helpers for Next.js (`@supabase/ssr`), not the deprecated auth-helpers package.
- Protect all routes under `/app/*` with middleware that redirects unauthenticated users to `/login`.
- On login, fetch `profiles` row and store role in a React context (`UserContext`) available app-wide — do not refetch role on every navigation.

---

## 4. Database Schema (full SQL)

```sql
-- Enable extension for UUIDs if not already
create extension if not exists "pgcrypto";

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('admin','manager','editor')),
  avatar_url text,
  created_at timestamptz default now()
);

create table clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  name text not null,
  status text not null default 'draft'
    check (status in ('draft','breakdown','in_production','review','approved','delivered')),
  deadline date,
  transcript_raw text,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table project_milestones (          -- for project-level calendar (draft due, review due, etc.)
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  label text not null,
  due_date date not null,
  completed boolean default false,
  created_at timestamptz default now()
);

create table project_editors (
  project_id uuid not null references projects(id) on delete cascade,
  editor_id uuid not null references profiles(id),
  assigned_at timestamptz default now(),
  primary key (project_id, editor_id)
);

create table transcript_lines (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  line_order int not null,
  text text not null,
  output_type text check (output_type in
    ('motion_graphics','b_roll','static_image_animation','text_animation','split_screen','live_footage','other')),
  llm_suggested_type text,      -- original LLM suggestion, kept even if edited
  llm_confidence numeric,
  status text not null default 'not_started'
    check (status in ('not_started','in_progress','needs_review','approved')),
  assigned_editor_id uuid references profiles(id),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (project_id, line_order)
);

create table assets (
  id uuid primary key default gen_random_uuid(),
  transcript_line_id uuid not null references transcript_lines(id) on delete cascade,
  storage_path text not null,
  asset_type text not null check (asset_type in ('uploaded','ai_generated')),
  generation_prompt text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table activity_log (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  actor_id uuid references profiles(id),
  action text not null,
  meta jsonb,
  created_at timestamptz default now()
);

-- Indexes
create index idx_projects_client on projects(client_id);
create index idx_projects_deadline on projects(deadline);
create index idx_transcript_lines_project on transcript_lines(project_id, line_order);
create index idx_transcript_lines_assigned on transcript_lines(assigned_editor_id);
create index idx_assets_line on assets(transcript_line_id);
create index idx_milestones_project on project_milestones(project_id, due_date);
```

### 4.1 Trigger: `updated_at` auto-touch
```sql
create or replace function touch_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger trg_projects_updated before update on projects
  for each row execute function touch_updated_at();
create trigger trg_lines_updated before update on transcript_lines
  for each row execute function touch_updated_at();
```

---

## 5. Row Level Security

Enable RLS on every table below, then apply policies.

```sql
alter table clients enable row level security;
alter table projects enable row level security;
alter table project_milestones enable row level security;
alter table project_editors enable row level security;
alter table transcript_lines enable row level security;
alter table assets enable row level security;
alter table activity_log enable row level security;

-- Helper: is the caller admin/manager?
create or replace function is_manager() returns boolean as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role in ('admin','manager')
  );
$$ language sql stable;

-- clients: managers full access, editors no direct access (they access via projects)
create policy clients_manager_all on clients
  for all using (is_manager()) with check (is_manager());

-- projects: managers full access; editors can SELECT projects they're assigned to
create policy projects_manager_all on projects
  for all using (is_manager()) with check (is_manager());
create policy projects_editor_select on projects
  for select using (
    exists (select 1 from project_editors pe
            where pe.project_id = projects.id and pe.editor_id = auth.uid())
  );

-- project_milestones: same pattern as projects
create policy milestones_manager_all on project_milestones
  for all using (is_manager()) with check (is_manager());
create policy milestones_editor_select on project_milestones
  for select using (
    exists (select 1 from project_editors pe
            where pe.project_id = project_milestones.project_id and pe.editor_id = auth.uid())
  );

-- project_editors: managers manage; editors can see their own assignment rows
create policy project_editors_manager_all on project_editors
  for all using (is_manager()) with check (is_manager());
create policy project_editors_self_select on project_editors
  for select using (editor_id = auth.uid());

-- transcript_lines: managers full access; editors select+update only their assigned lines
create policy lines_manager_all on transcript_lines
  for all using (is_manager()) with check (is_manager());
create policy lines_editor_select on transcript_lines
  for select using (assigned_editor_id = auth.uid());
create policy lines_editor_update on transcript_lines
  for update using (assigned_editor_id = auth.uid())
  with check (assigned_editor_id = auth.uid());

-- assets: managers full access; editors can insert/select assets for lines assigned to them
create policy assets_manager_all on assets
  for all using (is_manager()) with check (is_manager());
create policy assets_editor_select on assets
  for select using (
    exists (select 1 from transcript_lines tl
            where tl.id = assets.transcript_line_id and tl.assigned_editor_id = auth.uid())
  );
create policy assets_editor_insert on assets
  for insert with check (
    exists (select 1 from transcript_lines tl
            where tl.id = assets.transcript_line_id and tl.assigned_editor_id = auth.uid())
  );

-- activity_log: managers full read; inserts allowed from any authenticated user (system logs their own actions)
create policy activity_manager_select on activity_log
  for select using (is_manager());
create policy activity_insert_self on activity_log
  for insert with check (actor_id = auth.uid());
```

**Note for the coding agent:** test RLS with the Supabase SQL editor's "impersonate user" feature before wiring up the frontend — do not assume policies are correct just because they compile.

---

## 6. Storage

### 6.1 Bucket
Single bucket: `project-assets` (private, not public).

Path convention:
```
project-assets/{project_id}/{transcript_line_id}/{asset_id}.{ext}
```

### 6.2 Storage policies
```sql
-- Managers: full access
create policy storage_manager_all on storage.objects
  for all using (
    bucket_id = 'project-assets' and is_manager()
  ) with check (
    bucket_id = 'project-assets' and is_manager()
  );

-- Editors: access only to paths under lines assigned to them.
-- Implement by checking the transcript_line_id segment of the path against assignment.
create policy storage_editor_select on storage.objects
  for select using (
    bucket_id = 'project-assets' and
    exists (
      select 1 from transcript_lines tl
      where tl.assigned_editor_id = auth.uid()
        and (storage.foldername(name))[2] = tl.id::text
    )
  );
```
Serve files via signed URLs (`createSignedUrl`, short expiry e.g. 1 hour) generated on demand — never make the bucket public.

---

## 7. Edge Functions

### 7.1 `breakdown-transcript`
**Trigger:** called from the Project Screen when a manager submits a transcript.
**Input:** `{ project_id: string, transcript: string }`
**Behavior:**
1. Verify caller is `admin`/`manager` (check via service-role query against `profiles`).
2. Call Gemini API with system prompt (§8.1) + transcript.
3. Parse response as JSON array; validate against schema (§8.2) with a library like `zod`.
4. If validation fails, retry once with an appended "your last response was invalid JSON, return ONLY the array" instruction. If it fails twice, return an error to the client — do not silently insert bad data.
5. Bulk-insert into `transcript_lines` (`line_order`, `text`, `output_type` = suggestion, `llm_suggested_type` = same value, `llm_confidence`).
6. Update `projects.status` to `breakdown`.
7. Insert an `activity_log` row.
8. Return the created lines to the client.

**Error handling:** wrap Gemini call in try/catch; on API failure return `{ error: 'llm_unavailable' }` with HTTP 502 so the frontend can show a retry state, not a silent failure.

### 7.2 `generate-image`
**Input:** `{ transcript_line_id: string, prompt: string }`
**Behavior:**
1. Verify caller has access to this line (manager, or assigned editor).
2. Call image-gen API with prompt.
3. Upload resulting image bytes to Storage at the path convention in §6.1.
4. Insert `assets` row with `asset_type='ai_generated'`, `generation_prompt=prompt`.
5. Return the new asset row (including a signed URL for immediate preview).

**Rate limiting:** since this is a free-tier-sensitive operation, add a simple per-user daily counter (table or Postgres function) and reject with a clear error once a configurable cap is hit — don't let one user exhaust the whole team's quota silently.

---

## 8. LLM Integration Detail

### 8.1 System prompt — transcript breakdown (exact text to use)
```
You are breaking a video script/transcript into production segments for a
video editing agency. Split the transcript into logical lines or beats —
do not merge unrelated ideas, do not split a single sentence unnecessarily.

For each segment, output an object with exactly these fields:
- line_order: integer, starting at 1, sequential
- text: the exact original text for this segment, unmodified
- output_type: one of ["motion_graphics", "b_roll", "static_image_animation",
  "text_animation", "split_screen", "live_footage", "other"]
- confidence: float between 0 and 1, your confidence in the output_type choice
- reasoning: one short sentence explaining the choice

Return ONLY a JSON array of these objects. No prose, no markdown code fences,
no explanation text before or after the array.
```

### 8.2 Response schema (zod, for validation in the Edge Function)
```typescript
import { z } from "zod";

const OutputType = z.enum([
  "motion_graphics", "b_roll", "static_image_animation",
  "text_animation", "split_screen", "live_footage", "other"
]);

const LineSchema = z.object({
  line_order: z.number().int().positive(),
  text: z.string().min(1),
  output_type: OutputType,
  confidence: z.number().min(0).max(1),
  reasoning: z.string().optional()
});

const BreakdownResponseSchema = z.array(LineSchema).min(1);
```

### 8.3 Provider abstraction
Wrap the actual API call so the provider can be swapped without touching calling code:
```typescript
// lib/llm/breakdownProvider.ts
export async function classifyTranscript(transcript: string): Promise<LlmLine[]> {
  // implementation calls Gemini today; swap internals only if provider changes
}
```
Do the same for image generation (`lib/imagegen/provider.ts`) since the PRD explicitly leaves that provider undecided.

---

## 9. Frontend Architecture

### 9.1 Route structure (Next.js App Router)
```
/app
  /login
  /(app)                        -- authenticated layout wrapper
    /dashboard                  -- Master Dashboard
    /clients                    -- Clients grid
    /clients/[clientId]         -- Client Screen
    /clients/[clientId]/projects/[projectId]   -- Project Screen
    /editors                    -- Roster + payment-split report
    /approvals                  -- Approvals queue
```

### 9.2 State management
- Server data: fetched via Supabase client in Server Components where possible; use client components + `useEffect`/SWR only where interactivity requires it (line editing, sidebar).
- Global client state: React Context for `UserContext` (auth/role) only. Do not introduce Redux/Zustand for an app this size — Supabase + Server Components + local component state is sufficient.
- Realtime (optional, sprint 4+): Supabase Realtime subscriptions on `transcript_lines` so multiple people viewing the same project see live status updates. Not required for MVP; flag as a stretch item.

### 9.3 Component inventory (minimum set the coding agent should produce)
- `<DashboardSummaryCards />`
- `<ProjectsTable />` (used on Dashboard, filtered variant on Client Screen)
- `<CalendarView />` — shared component, props: `scope: 'master'|'client'|'project'`, `events: CalendarEvent[]`, `view: 'agenda'|'month'`
- `<ClientCard />` / `<ClientGrid />`
- `<TranscriptUploadForm />`
- `<LineByLineList />` + `<TranscriptLineRow />`
- `<TimelineView />` (segment track, click-to-open inspector)
- `<FrameInspector />` — renders as `<Sheet>` (side panel) on tablet/laptop, bottom sheet (`<Drawer>`) on phone, via one responsive component, not two separate components
- `<EditorRoster />` + `<PaymentSplitReport />`
- `<ApprovalsQueueTable />`
- `<StatusPill />` (shared, color-coded by status string)

---

## 10. Responsive Design System

### 10.1 Breakpoints (Tailwind defaults, use as-is)
- `sm`: 640px (treat as phone landscape/small tablet floor)
- `md`: 768px (tablet)
- `lg`: 1024px
- `xl`: 1280px (laptop target)

### 10.2 Layout rules by screen

| Screen | Phone (<768px) | Tablet (768–1279px) | Laptop (≥1280px) |
|---|---|---|---|
| Dashboard | Stacked summary cards, table becomes card list, calendar defaults to agenda | 2-col: cards row + table below | Full table + calendar side-by-side |
| Clients | 1-col card grid | 2-col grid | 3–4 col grid |
| Client Screen | Stacked list, calendar toggle | List + calendar tab | List + calendar visible simultaneously |
| Project Screen | Line-by-Line only by default (Timeline via toggle, simplified), Inspector = bottom drawer | Both views available, Inspector = side panel overlay | Both views + Inspector open alongside list (3-pane if room allows) |
| Frame Inspector | Full-height bottom drawer, swipe to dismiss | Side panel, 40% width | Side panel, fixed 380–420px |

### 10.3 Non-negotiable QA checklist (coding agent must verify before marking any screen "done")
- [ ] No horizontal scroll at 375px width
- [ ] All interactive targets ≥44px tap height on phone
- [ ] Sidebar/inspector never covers navigation in a way that traps the user (always a visible close/back action)
- [ ] Calendar month-grid is not the default view under 768px

---

## 11. Calendar Component Spec

**Data shape:**
```typescript
type CalendarEvent = {
  id: string;
  title: string;              // project name or milestone label
  date: string;                // ISO date
  status: 'on_track' | 'at_risk' | 'overdue';
  clientName?: string;         // for master scope color-coding
  href: string;                // link to project/client screen
};
```

**Status color logic (compute server-side or in a selector, not ad hoc in the component):**
- `overdue`: `deadline < today AND project.status != 'delivered'`
- `at_risk`: `deadline` within 3 days AND status not in `('approved','delivered')`
- `on_track`: everything else

**Views:**
- `agenda` (default <768px): grouped by day, chronological list, infinite-scroll or paginate by week
- `month` (default ≥768px, togglable everywhere): standard month grid, event dots/pills per day, click day to expand

---

## 12. State Machines

### 12.1 Project status
```
draft -> breakdown -> in_production -> review -> approved -> delivered
```
Transitions are one-directional in the UI (no backward dropdown) except managers can force-revert for corrections — implement as an explicit "Revert Status" manager-only action, not a free dropdown, to avoid accidental status corruption.

### 12.2 Transcript line status
```
not_started -> in_progress -> needs_review -> approved
```
- Editor can move `not_started -> in_progress -> needs_review`.
- Only manager/admin can move `needs_review -> approved` (this is the approval gate feeding the payment-split report — must not be self-approvable by the editor who did the work).

---

## 13. Non-Functional Requirements

- **Security:** RLS is the source of truth for access control; never trust client-supplied `role` or `id` values in Edge Functions — always re-derive from the authenticated JWT.
- **Performance:** paginate `transcript_lines` and `projects` queries (limit 50) rather than loading full tables; virtualize the Line-by-Line list if a project exceeds ~100 lines.
- **Error states:** every async action (transcript breakdown, image gen, status change) needs a visible loading state and a visible error state with retry — no silent failures.
- **Offline/flaky network:** not required for MVP, but Supabase client calls should have basic retry-on-network-error wrapping given this is a web app likely used on mobile data.
- **Accessibility:** status colors must carry a text/icon label too, not color alone (color-blind safety) — relevant since status pills are used everywhere.

---

## 14. Build Order (map directly to sprints)

1. **Sprint 1:** Supabase project setup, schema + RLS from §4–§5, Auth flow, `profiles` creation on signup, Dashboard skeleton (table only, no calendar yet), Clients CRUD, Projects CRUD. Responsive layout shell (nav + breakpoint behavior) built here, not bolted on later.
2. **Sprint 2:** `breakdown-transcript` Edge Function, transcript input UI, Line-by-Line view (read-only), provider abstraction for LLM.
3. **Sprint 3:** Editable output_type, editor assignment UI, line status transitions + RLS-enforced editor restrictions, Frame Inspector (responsive: drawer vs. panel).
4. **Sprint 4:** Timeline View, Calendar component (all three scopes), Approvals Queue.
5. **Sprint 5 (optional module):** `generate-image` Edge Function, Storage bucket + policies, image-gen UI in Frame Inspector.
6. **Sprint 6:** Payment-split report (query + simple table/export), activity log surfacing, polish pass against the QA checklist in §10.3.

---

## 15. Explicitly Out of Scope (do not build unless re-scoped)
- Client-facing external portal
- Automated payment calculation/payout integration
- Multi-language transcript support
- Native mobile app (this is a responsive web app only)
