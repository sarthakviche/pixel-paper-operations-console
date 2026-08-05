# PRD — Agency Video/Graphics PM Tool

## 1. Problem
Agencies managing multiple clients and video projects lose track of timelines, editor assignments, and status at scale. Payment splitting across editors is unclear without per-segment attribution.

## 2. Product Summary
Internal tool for graphics/video agencies with two layers:
- **Operations layer** — clients, projects, status, deadlines, approvals
- **Production layer** — per-video workflow from transcript to delivered asset, broken down line-by-line via LLM

## 3. Non-Negotiables
- **Fully responsive web app** — one codebase, three first-class targets: phone, tablet, laptop. Not "works on mobile" as an afterthought — every screen (dashboard, client view, project view, timeline, frame inspector) must be designed mobile-first and scale up, not desktop-first and shrink down.
  - Phone: single-column, stacked cards, bottom-sheet-style sidebars instead of side panels
  - Tablet: two-column where it earns its keep (list + detail)
  - Laptop: full multi-pane layout (list + detail + inspector simultaneously)
- **Deadline visibility via calendar**, surfaced at every level of the hierarchy, not just a table view.
- Supabase for Auth + DB + Storage (free tier). Gemini for transcript breakdown. Optional AI image generation, stored in Supabase Storage.

## 4. Calendar Requirement
A calendar view of deadlines exists at three scopes, sharing one component with a scope filter:

| Scope | Shows |
|---|---|
| **Master Dashboard** | Every deadline, across every client — month/week view, color-coded by client |
| **Client Screen** | Only that client's project deadlines |
| **Project Screen** | That project's own milestone dates (if a project has internal sub-deadlines, e.g. draft due / review due / delivery due) |

- Toggle between **List view** and **Calendar view** wherever a deadline list appears — don't force calendar-only.
- Each calendar entry shows a status color (on-track / at-risk / overdue) at a glance, not just a date.
- On phone: calendar collapses to a vertical agenda list by default (day-by-day), with month-grid as an optional expand — a full month grid is unusable at phone width.

## 5. Core Screens
1. **Master Dashboard** — status summary cards, all-projects table, calendar toggle
2. **Clients** — folder grid, one per client
3. **Client Screen** — client's projects list/table + calendar toggle
4. **Project Screen** — single video, end to end:
   - Transcript input → LLM breakdown
   - Line-by-Line view / Timeline view (toggle)
   - Frame Inspector (sidebar on laptop/tablet, bottom sheet on phone)
5. **Editors (Roster)** — assignments + per-line completion data for payment-split reporting
6. **Approvals Queue** — cross-client items pending review

## 6. Key Flows
- Manager uploads transcript → Gemini breaks it into lines with suggested output type → manager/editor edits type, assigns editor, tracks status per line
- Editor uploads or AI-generates an asset per line → status moves to review → manager approves
- Payment split = per-editor count of approved lines per project (report, not a calculator)

## 7. Data Model (summary)
`profiles`, `clients`, `projects`, `project_editors`, `transcript_lines`, `assets`, `activity_log` — Postgres via Supabase, RLS scoping editors to their assigned lines, admins/managers to everything. (Full schema already defined in the system spec — unchanged by this PRD.)

## 8. Tech Stack
- Frontend: React (Next.js), responsive-first component library (avoid fixed-px layouts; use fluid/breakpoint-based design throughout)
- Auth/DB/Storage: Supabase
- LLM: Gemini (system-prompted JSON output for transcript breakdown)
- Image generation: Gemini/Imagen or other free-tier provider, decided at build time — stored in Supabase Storage

## 9. Success Criteria (internal tool, so usage-based not revenue-based)
- A manager can go from raw transcript to fully assigned, status-tracked line breakdown in under 5 minutes
- Every screen usable one-handed on phone without horizontal scrolling
- Payment-split report for a completed project is a single query, no manual reconciliation

## 10. Out of Scope (for now)
- Client-facing review/approval portal
- Automated payment calculation/payout
- Multi-language transcript support
