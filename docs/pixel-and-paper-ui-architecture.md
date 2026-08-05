# Pixel and Paper — Internal Platform UI Architecture & Design Spec

Applying the Brand Design System v1.0 to the Agency PM Tool. Desktop-first at 1440px, scaling down to tablet/phone. This document is the single source of truth for design tokens, IA, components, and screen specs — build against it directly.

---

## 1. UI Architecture (before any screen)

### 1.1 Navigation Structure
**Left sidebar, persistent, two states (expanded 240px / collapsed 72px, icon-only).**

```
[Logo mark]
─────────────
Dashboard
Clients
Editors
Approvals
─────────────
(workspace switcher, if multi-workspace later)
─────────────
Profile / Settings (bottom, pinned)
```

- Selected item: green-accent left border (2px) + `Elevated Surface` background, not a filled pill — restrained per brand.
- No top nav tabs. Top bar is minimal: breadcrumb (left) + global search (center-left) + notification bell + profile avatar (right). This is the Linear/Arc pattern — the sidebar owns primary navigation, the top bar owns context and search.
- Breadcrumb pattern inside Client/Project screens: `Clients / Acme Co. / Q3 Launch Video` — click any crumb to jump up a level. This replaces a "back button" entirely.

### 1.2 Information Architecture (Sitemap)
```
/dashboard
/clients
  /clients/:clientId
    /clients/:clientId/projects/:projectId
      → line view (default)
      → timeline view
      → frame inspector (overlay, not a route)
/editors
  /editors/:editorId  (payment-split detail)
/approvals
/settings
/login
```

Three levels deep, max. No level should ever require the user to remember where they came from — breadcrumbs and sidebar state always answer that.

### 1.3 Component Library (inventory, design-system driven)
Primitives (own every visual decision, nothing hardcoded downstream):
- `Surface` (bg-primary / bg-secondary / bg-elevated variants)
- `Text` (heading/body/muted/disabled variants, maps to token colors)
- `Button` (primary / secondary / ghost / danger)
- `Input`, `Textarea`, `Select`, `Dropdown`
- `Badge` / `StatusPill`
- `Card`
- `Avatar`
- `Table` (minimal borders, large row height)
- `Modal`, `Drawer` (side panel), `Sheet` (bottom, mobile)
- `Tooltip`, `Popover`
- `Tabs`
- `CommandPalette` (⌘K — Raycast-inspired, global "jump to client/project" search)
- `SkeletonLoader`
- `EmptyState`
- `Toast`
- `ProgressIndicator` (thin, top-of-screen, for async LLM/image actions — not a spinner)
- `Calendar` (agenda + month variants)
- `Timeline` (video-editor-style track)
- `AIChip` (context tag showing "AI-suggested" on LLM-generated content)
- `ConfidenceIndicator` (subtle, for LLM output_type confidence)

### 1.4 Design Tokens
Pull directly from the brand doc — do not introduce new values.

**Color tokens**
```
--bg-primary: #0E1113
--bg-secondary: #151A1D
--bg-elevated: #1B2024

--text-primary: #F5F7F8
--text-secondary: #C8CDD1
--text-muted: #8C949C
--text-disabled: #5E656D

--accent-primary: #4ADE80
--accent-dark: #22C55E
--accent-light: #86EFAC

--status-success: #4ADE80
--status-warning: #FACC15
--status-danger: #F87171
--status-info: #60A5FA

--border-subtle: rgba(255,255,255,0.06)
--border-strong: rgba(255,255,255,0.12)
```

**Typography tokens**
```
--font-primary: 'Inter'
--font-display: 'Instrument Serif'   /* hero/marketing surfaces only, never inside the app shell */

Display: 56 / Semibold
H1: 40 / Semibold
H2: 32 / Semibold
H3: 24 / Medium
H4: 20 / Medium
Body Large: 18 / Regular
Body: 16 / Regular
Small: 14 / Regular
Caption: 12 / Regular, text-muted
```

**Spacing tokens** (4/8/12/16/24/32/48/64/96 — nothing outside this scale, ever)

**Radius tokens**
```
--radius-card: 16px
--radius-button: 12px
--radius-input: 12px
--radius-modal: 20px
--radius-panel: 18px
```

**Shadow token**
```
--shadow-soft: 0 8px 32px rgba(0,0,0,0.18)
```

### 1.5 Grid System
- 12-column, max width 1440px, content width 1200px, centered.
- Sidebar (240px expanded) is outside the grid; content area is the 1200px grid.
- Gutter: 24px. Margin: 32px minimum on desktop.

### 1.6 Spacing System
Applied by role, not by feel:
- Between unrelated sections: 64–96px
- Between related blocks within a section: 32–48px
- Between a label and its content: 8–12px
- Card internal padding: 24–32px

### 1.7 Responsive Behavior
Desktop-first (1440px primary), collapsing down:
- **1280–1440px:** full 3-pane layouts where relevant (list + detail + inspector)
- **768–1279px:** collapse to 2-pane, Inspector becomes an overlay Drawer
- **<768px:** single column, sidebar collapses to a bottom nav or hamburger, Inspector becomes a bottom Sheet, Calendar defaults to agenda view

### 1.8 States (every data-bearing component needs all four)
- **Loading:** skeleton screens matching the exact shape of the eventual content — never a centered spinner except for sub-second inline actions.
- **Empty:** abstract minimal line-art illustration + one sentence of helpful copy + one primary action. Never a bare "No data."
- **Success:** quiet — a toast or an inline checkmark fade-in, never a modal celebration.
- **Error:** inline, specific, with a retry action. Red used sparingly — text-primary with a small `status-danger` icon, not a red-flooded banner.

### 1.9 AI Interaction Patterns
- Every LLM-touched piece of UI (transcript breakdown, generated output_type, generated image) carries an `AIChip` — small, muted, says "AI Suggested" — so users always know what's machine-origin vs. human-edited.
- **Streaming:** transcript breakdown results stream in line-by-line as they're parsed, not a blocking spinner then a dump of 40 rows at once.
- **Thinking indicator:** while `breakdown-transcript` runs, show a slim animated top-bar progress line (accent-light gradient, low opacity) with copy like "Reading transcript..." → "Structuring segments..." — two-stage, not generic "Loading."
- **Confidence:** `ConfidenceIndicator` renders as a tiny 3-bar or dot-strength icon next to `output_type`, not a raw percentage — raw numbers read as noisy/technical, which fights the "calm" value.
- **Editable-by-design:** every AI suggestion is a normal editable control (dropdown, text field) from the first frame — never a locked "AI result" the user has to explicitly unlock.

### 1.10 Motion Specifications
- Durations: 150/200/250ms, 300ms hard ceiling.
- Easing: `ease-out` or `cubic-bezier(.2,.8,.2,1)` — everywhere, no exceptions.
- Hover: 1.02 scale max + soft glow (accent, low opacity) — never a hard color swap.
- Page/panel transitions: fade + slight slide (8–12px), never bounce.
- Drawer/Sheet: slide from edge, 250ms, backdrop fade simultaneously (not sequentially).

---

## 2. Screen-by-Screen Breakdown

### 2.1 Dashboard
**Purpose:** Answer "what needs my attention right now?" across the whole agency.
**Primary workflow:** Scan status → jump into whatever's at risk.
**User goal:** Triage in under 30 seconds.

**Wireframe hierarchy (top to bottom):**
1. Top bar: breadcrumb "Dashboard", search, notifications, avatar
2. H1 "Dashboard" + muted subtext (e.g. "3 projects need attention")
3. Row of 4 summary `Card`s: Pending / Awaiting Approval / Overdue / In Progress — numeral in H2 weight, label in Caption, muted icon top-right, no color-flooding (numbers in text-primary, only the icon tints by status)
4. Section: "All Projects" (H3) with view toggle (Table / Calendar) top-right, ghost-button style
5. Table: Client, Project, Status (`StatusPill`), Deadline, Editor(s) (stacked `Avatar`s), last updated — 56–64px row height, hover = `bg-elevated`, no zebra striping, no vertical borders, only `border-subtle` row dividers
6. Calendar toggle state: month grid, events as small green-accent dots per day, click day → agenda expand

**Component breakdown:** `SummaryCard`, `Table`, `StatusPill`, `Avatar` (stacked group), `Calendar`, `Toast` (for background sync confirmations)

**Interaction details:** Row click → navigates to Project Screen. Summary cards are filters — clicking "Overdue" filters the table in place (no navigation), with a visible "Clear filter" ghost chip appearing next to the H3.

**Edge cases:** Zero active projects → EmptyState with "Create your first client" CTA. All projects healthy → summary cards still show, but "Overdue" card renders in text-muted (0) instead of danger tint — don't manufacture urgency where none exists.

**Responsive:** <1280px, summary cards go 2×2 grid; <768px, table becomes stacked cards (Client/Project as heading, StatusPill + deadline inline below), calendar defaults to agenda.

---

### 2.2 Clients
**Purpose:** Browse and enter client workspaces.
**Primary workflow:** Scan → click into a client.
**User goal:** Find the right client fast, or create a new one.

**Wireframe hierarchy:**
1. Top bar (breadcrumb "Clients")
2. H1 "Clients" + primary `Button` "New Client" top-right (only primary-green button on this screen — this is the one important action)
3. Grid of `ClientCard`: client name (H4), muted metadata line ("4 active projects · Next deadline in 3 days"), no logo placeholder clutter if no logo uploaded — just a soft initials avatar
4. Search/filter bar above grid (ghost input, no heavy border)

**Interaction details:** Card hover = 1.02 scale + soft shadow lift, 200ms. Click → Client Screen.

**Edge cases:** Zero clients → full-page EmptyState, illustration + "Create your first client."

**Responsive:** 1280px+ = 3–4 col grid; 768–1279px = 2 col; <768px = 1 col stacked cards.

---

### 2.3 Client Screen
**Purpose:** Single client's full project list + their deadline picture.
**Primary workflow:** Review projects → open one, or check upcoming deadlines.
**User goal:** Understand this client's current state at a glance.

**Wireframe hierarchy:**
1. Breadcrumb: Clients / [Client Name]
2. Client header: H1 name, muted contact/notes line, "New Project" primary button
3. Tabs (`Tabs` component, underline style, not boxed): "Projects" / "Calendar" / "Notes"
4. Projects tab: table, same visual language as Dashboard table but pre-filtered
5. Calendar tab: same `Calendar` component, scope=client

**Component breakdown:** `Tabs`, `Table`, `Calendar`, `Button`

**Edge cases:** New client with zero projects → EmptyState inside the tab body, not full-page (header/tabs still visible for orientation).

**Responsive:** Tabs remain tabs at all breakpoints (don't collapse to accordion — three tabs is light enough). Table → stacked cards <768px as on Dashboard.

---

### 2.4 Project Screen (core screen)
**Purpose:** Manage one video end-to-end — the most information-dense screen, so hierarchy matters most here.
**Primary workflow:** Transcript → breakdown → per-line assignment and status tracking → approval.
**User goal:** Always know "what's the next unblocked action on this video?"

**Wireframe hierarchy:**
1. Breadcrumb: Clients / [Client] / [Project Name]
2. Header row: H2 project name (inline-editable on click, no separate edit mode), `StatusPill` (large variant), deadline (muted, calendar icon), assigned editors (`Avatar` stack)
3. View toggle: "Line-by-Line" / "Timeline" (`Tabs`-style toggle, top-right of content area)
4. **Empty state (no transcript yet):** centered `TranscriptUploadForm` — large `Textarea` + "Break Down Transcript" primary button, minimal, nothing else on screen competing for attention
5. **Populated state — Line-by-Line:** each `TranscriptLineRow`: line text (Body), `AIChip` + `output_type` dropdown, `ConfidenceIndicator`, assigned editor `Avatar`, `StatusPill` (small), row click → opens `FrameInspector`
6. **Populated state — Timeline:** horizontal `Timeline` track, segments color-coded by output_type using accent variants (avoid introducing new hues — use accent-light/dark/status tones only), click segment → same `FrameInspector`
7. `FrameInspector` (Drawer, right side, 420px, desktop): line text + context, editable output_type, notes field, assigned editor, asset preview + "Generate Image" (ghost button, opens inline prompt field), status control, manager-only Approve button

**Interaction details:** Streaming breakdown — as `breakdown-transcript` returns lines, they animate in top-to-bottom with a 40ms stagger, each fading + sliding 8px — reinforces "this is being generated," not "this is a static list that popped in."

**Edge cases:** Breakdown fails (LLM error) → inline error card in place of the empty state, "Something went wrong reading this transcript" + Retry button, transcript text preserved in the textarea so nothing is lost. Very long transcript (100+ lines) → virtualized list, Inspector still opens instantly.

**Responsive:** <1280px, Inspector becomes an overlay Drawer instead of persistent side pane. <768px, Timeline view is de-emphasized (Line-by-Line is default and primary), Inspector becomes a bottom Sheet, view toggle becomes a `Select` dropdown instead of tabs to save header width.

---

### 2.5 Editors (Roster)
**Purpose:** Roster + the payment-split source-of-truth report.
**Primary workflow:** Check who's assigned what, pull a completion report.
**User goal:** Trustworthy attribution data, no ambiguity.

**Wireframe hierarchy:**
1. H1 "Editors" + "Invite Editor" secondary button
2. Table: Avatar, Name, Active assignments (count), Approved lines (count, this is the payment-relevant number, rendered in text-primary weight to signal importance)
3. Row click → editor detail: per-project breakdown table + "Export CSV" ghost button

**Edge cases:** Editor with zero approved lines yet → row renders normally, count shows "0" in text-muted, not hidden.

**Responsive:** Table → stacked cards <768px, same pattern as Dashboard.

---

### 2.6 Approvals Queue
**Purpose:** Cross-client punch-list of anything blocked on a manager decision.
**Primary workflow:** Review → approve/reject in place, no navigation required.
**User goal:** Clear the queue to zero.

**Wireframe hierarchy:**
1. H1 "Approvals" + muted count subtext ("7 items pending")
2. List of `ApprovalCard`: client/project context line (Caption, muted), the line text or asset thumbnail, Approve (primary, small) / Reject (ghost) inline buttons
3. Reject opens a small `Popover` for an optional one-line reason, not a full modal — keep the friction proportional to the action

**Interaction details:** Approve triggers the card to fade + collapse out (200ms) rather than an instant disappearance — gives quiet confirmation the action landed.

**Edge cases:** Empty queue → EmptyState with a genuinely calm tone ("Nothing pending — nice work.") not a generic placeholder.

**Responsive:** List format works unchanged down to phone width — this screen was single-column by design from the start.

---

## 3. High-Fidelity Visual Direction

- Base canvas is `--bg-primary` full-bleed; content sits on `--bg-secondary` cards; only truly floating elements (dropdowns, command palette, modals) use `--bg-elevated`.
- Borders are almost never drawn — hierarchy comes from the three-tier background system plus spacing, per brand doc. Where a border is unavoidable (table row dividers), use `--border-subtle`, never `--border-strong` except on focus states or hover-active inputs.
- Buttons: primary button is the *only* saturated green surface on any given screen — audit every screen for "is there more than one primary button visible at once?" and if so, demote all but one to secondary/ghost.
- Command palette (⌘K) is the fast path for power users — search clients, projects, editors, jump anywhere in under 2 keystrokes. This is a Raycast-brand-reference made literal, and it's what makes the tool feel like an OS rather than a CRUD dashboard.

## 4. Accessibility Considerations
- Status is never color-only: `StatusPill` always carries a text label; `ConfidenceIndicator` and Timeline segment colors get a tooltip with the text equivalent.
- Minimum contrast: `--text-muted` (#8C949C) on `--bg-primary` (#0E1113) should be verified against WCAG AA for body-sized text before shipping — dark editorial palettes often fail this at the "muted" tier, so test it, don't assume.
- All interactive elements keyboard-navigable; Drawer/Sheet trap focus while open and return focus to the triggering element on close.
- Motion respects `prefers-reduced-motion` — fall back to instant state changes, no forced animation.

## 5. Future Scalability Considerations
- Component library should be built as a standalone token-driven package from day one (even if it's just a local `/components/ui` folder with strict token usage) so a second Pixel and Paper product can adopt it without a rebuild.
- Workspace switcher slot already reserved in the sidebar IA (§1.1) even though multi-workspace isn't in scope yet — costs nothing now, avoids an IA rework later.
- AI interaction patterns (streaming, confidence, AI chips) are defined as reusable primitives, not one-off treatments on the transcript feature, so future AI features (e.g. AI-assisted client notes) inherit the same visual language automatically.
