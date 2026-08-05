# Agency Video/Graphics PM Tool — Product & System Spec

## 1. Product Summary

An internal operations tool for graphics/video agencies to manage multiple clients, multiple projects per client, and the individual editing workflow of each video — from raw transcript to delivered asset — with editor attribution baked in for payment splitting.

Two functional layers:
1. **Operations Layer** — dashboard, clients, projects, statuses, approvals
2. **Production Layer** — per-video workflow: transcript → LLM line breakdown → shot/segment assignment → editor execution → review

---

## 2. User Roles

| Role | Access |
|---|---|
| **Admin/Owner** | Full access, sees all clients, manages editors & payment splits |
| **Manager/Producer** | Creates clients/projects, uploads transcripts, assigns editors, approves work |
| **Editor** | Sees only assigned projects/segments, updates status on their lines, uploads output |
| **Client (optional, future)** | Read-only review/approval link — not in MVP, flagged as future sprint |

For MVP, keep it to **Admin** and **Editor** as two roles with a permission flag — don't over-engineer roles until you have real usage.

---

## 3. Information Architecture (Screen Map)

```
Login / Auth
 └─ Master Dashboard (Operations Console)
     ├─ Clients (grid/list of folders)
     │   └─ Client Screen
     │       └─ Projects (list within client)
     │           └─ Project Screen (single video, end-to-end)
     │               ├─ Transcript Upload/Input
     │               ├─ Line-by-Line View (default after breakdown)
     │               ├─ Timeline View (toggle)
     │               ├─ Frame Inspector (sidebar, opens from either view)
     │               └─ Project Settings (editors assigned, deadline, status)
     ├─ Editors (roster + payment split records)
     ├─ Approvals Queue (cross-client)
     └─ Account/Team Settings
```

---

## 4. Screen-by-Screen Breakdown

### 4.1 Master Dashboard (Operations Console)
The daily landing screen for managers/admins.

**Contains:**
- Summary cards: Pending Projects, Awaiting Approval, Overdue, In Progress
- A filterable table/kanban of **all active projects across all clients** — columns: Client, Project, Status, Deadline, Assigned Editor(s), Last Updated
- Quick filters: by status, by client, by editor, by deadline proximity
- "Approvals Queue" shortcut — anything a manager needs to sign off on
- Recent activity feed (optional, sprint 2+)

**Design note:** This is the only screen that cuts across clients. Everything else is scoped to a client or project. Treat it like a project-management inbox, not a vanity dashboard.

### 4.2 Clients Screen
- Grid or list of client "folders" (card per client: name/logo, active project count, next deadline)
- "+ New Client" action
- Search/filter clients

### 4.3 Client Screen
Opens when a client folder is clicked.
- Client header (name, contact info, notes)
- List of all projects for this client — table view: Project name, status, deadline, assigned editor, thumbnail
- "+ New Project" action
- Optional: client-level notes/brief repository

### 4.4 Project Screen (core screen — single video, end to end)
This is where most work happens. Think of it as the video's home page.

**Header bar:** project name, client name (breadcrumb), status pill (Draft → Breakdown → In Production → Review → Approved → Delivered), deadline, assigned editor(s), view toggle (**Line-by-Line** / **Timeline**)

**Empty state:** transcript input box — paste text or upload file → triggers LLM breakdown.

**Once a transcript exists**, the screen shows either:

**A. Line-by-Line View**
- Each transcript line as a row/card:
  - Line text
  - LLM-suggested output type (motion graphics / b-roll / static image animation / text animation / split screen / etc.) — editable dropdown, since the LLM suggestion is a starting point not gospel
  - Assigned editor (if per-line assignment is used)
  - Status per line (Not started / In progress / Needs review / Approved)
  - Thumbnail/preview if an asset has been generated or uploaded
  - Click → opens **Frame Inspector** sidebar

**B. Timeline View**
- Horizontal timeline (video-editor-style track), segments colored by output type
- Zoom/scrub controls
- Clicking a segment opens the same Frame Inspector sidebar
- This view is for pacing/flow review, not line-editing — keep it visual, not data-dense

**C. Frame Inspector (Sidebar)**
Opens on top of either view without navigating away. Shows for a single line/segment:
- Full line text + transcript context (line before/after)
- Output type (editable)
- Notes/instructions field
- Assigned editor
- Uploaded/generated asset preview
- Generate Image button (if using AI image gen for that segment) — see §6
- Status controls + approve/reject if manager
- Version history if the segment has been re-uploaded (nice-to-have, not MVP)

### 4.5 Editors Screen (Roster)
- List of editors, contact info, active assignments
- **Payment split ledger**: since assignment is tracked per-line/per-segment, this screen can roll up "how many segments/lines did Editor X complete on Project Y" → gives you the raw data for splitting payment. Don't build a payment *calculator* in MVP — just make sure the attribution data exists cleanly so a manager can pull a report.

### 4.6 Approvals Queue
- Cross-client list of segments/projects sitting in "Needs Review" or "Awaiting Approval"
- One-click approve/reject with comment
- This can honestly just be a filtered view of the dashboard table rather than a separate screen — worth deciding in sprint 1 whether it earns its own route.

---

## 5. Data Model (Supabase / Postgres)

Supabase gives you Postgres + Auth + Storage + Row Level Security — use RLS to scope editors to only their assigned rows, and managers/admins to everything, rather than filtering in application code.

```sql
-- Users (extends Supabase auth.users)
profiles (
  id uuid primary key references auth.users,
  full_name text,
  role text check (role in ('admin','manager','editor')),
  created_at timestamptz default now()
)

clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
)

projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  name text not null,
  status text check (status in ('draft','breakdown','in_production','review','approved','delivered')) default 'draft',
  deadline date,
  transcript_raw text,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
)

project_editors (            -- many-to-many, project ↔ assigned editors
  project_id uuid references projects(id) on delete cascade,
  editor_id uuid references profiles(id),
  primary key (project_id, editor_id)
)

transcript_lines (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  line_order int not null,
  text text not null,
  output_type text,              -- LLM-suggested, editable
  llm_confidence numeric,        -- optional, if you want to surface it
  status text check (status in ('not_started','in_progress','needs_review','approved')) default 'not_started',
  assigned_editor_id uuid references profiles(id),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
)

assets (
  id uuid primary key default gen_random_uuid(),
  transcript_line_id uuid references transcript_lines(id) on delete cascade,
  storage_path text not null,     -- Supabase Storage object path
  asset_type text check (asset_type in ('uploaded','ai_generated')),
  generation_prompt text,         -- if ai_generated, store the prompt used
  created_by uuid references profiles(id),
  created_at timestamptz default now()
)

activity_log (                    -- optional but cheap and useful early
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id),
  actor_id uuid references profiles(id),
  action text,
  meta jsonb,
  created_at timestamptz default now()
)
```

**RLS sketch:**
- `admin`/`manager` roles: full read/write on everything
- `editor` role: read/write only on `transcript_lines` where `assigned_editor_id = auth.uid()`, and read-only on the parent `project`/`client` for context

This schema gives you clean per-line editor attribution for free — the payment-split report is just `SELECT assigned_editor_id, count(*), project_id FROM transcript_lines WHERE status='approved' GROUP BY ...`. No separate payments module needed for MVP.

---

## 6. LLM Pipeline

### 6.1 Transcript Breakdown (Gemini)
Flow: manager pastes/uploads transcript → backend calls Gemini with a system prompt → response parsed into structured lines → inserted into `transcript_lines`.

**System prompt should force structured output** (JSON), e.g.:
```
You are breaking a video script/transcript into production segments for a
video editing agency. For each line or logical beat, output:
- line_order (int)
- text (the original line, unmodified)
- output_type: one of [motion_graphics, b_roll, static_image_animation,
  text_animation, split_screen, live_footage, other]
- reasoning (one short sentence, optional)

Return ONLY a JSON array. No prose, no markdown fences.
```
Parse defensively — strip code fences if present, validate against a schema before insert, and never trust the array length blindly (compare against line count as a sanity check).

### 6.2 Model choice
Gemini is a reasonable default since you named it, and it's cheap/fast for structured text tasks. If you want a fallback or A/B option, most agencies find any current-generation frontier model (Gemini, GPT, or Claude) handles this kind of classification well — the system prompt matters more than the model. Build the call behind a thin abstraction (`classifyTranscript(transcriptText)`) so swapping providers later is a one-file change, not a rewrite.

---

## 7. Image Generation & Storage (Optional Module)

This is feasible and fits cleanly into the schema above — you don't need a separate system, just an `assets` row with `asset_type = 'ai_generated'`.

**Flow:**
1. From the Frame Inspector, manager/editor clicks "Generate Image" on a segment
2. Prompt field (can be pre-filled from the line text + output_type as a starting prompt)
3. Backend calls an image generation API — since this needs to stay free-tier-friendly, options worth evaluating at build time: Gemini's image generation (Imagen via the Gemini API), or another free-tier image API if terms allow. Pin this decision at sprint-start since free-tier limits change often — don't hardcode a provider assumption into the schema (the schema above already stores `generation_prompt` generically so it doesn't care which provider produced it).
4. Generated image uploaded to **Supabase Storage** bucket (e.g. `project-assets/{project_id}/{line_id}/{uuid}.png`)
5. `storage_path` saved to `assets` table, linked to the `transcript_line_id`

**Storage bucket structure:**
```
project-assets/
  {project_id}/
    {transcript_line_id}/
      {asset_id}.png   -- generated or uploaded
```
Keep uploaded and AI-generated assets in the same bucket/table, differentiated only by `asset_type` — simpler than maintaining two storage paths.

**Supabase free tier check:** 1GB storage, 500MB database, 50k monthly active users on free tier as of general Supabase pricing — fine for an internal tool at concept stage, but images will eat storage fastest. Worth compressing/resizing generated images before storage if volume grows.

---

## 8. Tech Stack (as specified)

| Layer | Choice |
|---|---|
| Auth | Supabase Auth |
| Database | Supabase Postgres (free tier) |
| File Storage | Supabase Storage |
| LLM (transcript breakdown) | Gemini API (structured JSON output) |
| Image Generation | Gemini/Imagen or other free-tier provider — decide at sprint-start |
| Frontend | Not specified — recommend React (Next.js) given Supabase's first-class JS SDK support |
| Backend logic | Supabase Edge Functions (for LLM calls — keeps API keys server-side) or a thin Next.js API layer |

**One flag:** never call Gemini or an image-gen API directly from the client with an embedded API key — route it through a Supabase Edge Function or your Next.js API routes so the key stays server-side.

---

## 9. Suggested Sprint Breakdown

**Sprint 1 — Skeleton**
Auth (Supabase), profiles/roles, Clients CRUD, Projects CRUD, basic Master Dashboard table (no filters yet)

**Sprint 2 — Transcript → Breakdown**
Transcript input, Gemini integration + system prompt, `transcript_lines` generation, Line-by-Line view (read-only first)

**Sprint 3 — Production Workflow**
Editable output_type, editor assignment, status transitions, Frame Inspector sidebar, per-line editor attribution

**Sprint 4 — Timeline View + Approvals**
Timeline visualization, Approvals queue, dashboard filters (by client/editor/status/deadline)

**Sprint 5 — Image Generation (optional module)**
Storage bucket setup, generate-image flow from Frame Inspector, asset gallery per line

**Sprint 6 — Payment Reporting**
Simple report screen: editor × project × approved-line-count, exportable as CSV

This ordering front-loads the hardest unknown (LLM breakdown quality) into Sprint 2 so you find out early if the prompt needs iteration, rather than discovering it after building the whole UI around it.
