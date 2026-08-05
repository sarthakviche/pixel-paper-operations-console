# Pixel & Paper — Operations Console

## What this project is
An internal operations console for video/graphics agencies (Pixel & Paper). Manages multiple clients, multiple projects per client, and the per-line production workflow of each video — from raw transcript to delivered asset — with LLM-powered breakdown and per-editor attribution for payment splitting.

## Tech Stack
- **Frontend**: Next.js 15 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS (mobile-first, design tokens via CSS custom properties)
- **Auth/DB/Storage**: Supabase (Postgres + Auth + Storage)
- **Edge Functions**: Supabase Edge Functions (Deno) — `breakdown-transcript`, `generate-image`
- **LLM**: Gemini API (structured JSON transcript breakdown)
- **Image Generation**: Gemini Imagen (abstracted, swappable)
- **Hosting**: Vercel (frontend) + Supabase (backend)

## Repository Structure
```
app/                       # Next.js app (entire frontend)
  src/
    app/
      (auth)/login/         # Login screen
      (app)/                # Authenticated layout group
        dashboard/          # Master Dashboard
        clients/            # Clients grid + Client screen + Project screen
        editors/            # Editor roster + payment split
        approvals/          # Approvals queue
    components/
      ui/                   # Primitive design-system components
      layout/               # Sidebar, TopBar, Breadcrumb
      features/             # Domain-specific composite components
    lib/                    # Supabase clients, utilities
    hooks/                  # Custom React hooks
    types/                  # Shared TypeScript types
    context/                # React contexts (UserContext)
supabase/
  migrations/               # SQL migrations (run in order: 001→004)
  functions/                # Edge Functions
    breakdown-transcript/
    generate-image/
docs/                       # PRD, TRD, Spec, UI Architecture
ui-references/              # Reference screenshots + HTML mockups
```

## Before You Write Any Code
1. **API keys never go to the client.** All Gemini/image-gen calls go through Supabase Edge Functions only.
2. **RLS is the access control layer.** Never filter by user ID in application code without a corresponding RLS policy.
3. **Design tokens only.** Never hardcode colors, radii, or spacing — use CSS custom properties from `globals.css`.
4. **Server Components by default.** Only add `"use client"` when browser APIs or event handlers are required.
5. **Every UI state must be handled:** loading (skeleton), empty (EmptyState component), error (inline with retry).

## Rules You Must Never Break
- Never call Gemini or image-gen APIs from client-side code — always via Edge Functions
- Never trust `role` from client-supplied values in Edge Functions — re-derive from JWT
- No hardcoded secrets, URLs, or API keys in any file
- Every external API call in Edge Functions must have an explicit timeout
- Status is never communicated by color alone — always include text/icon label
- Interactive targets must be ≥44px on mobile
- No horizontal scroll at 375px viewport width on any screen

## Design System Quick Reference
- **Fonts**: Inter (app), Instrument Serif (display/hero only)
- **Base canvas**: `#0E1113` (--bg-primary)
- **Card surfaces**: `#151A1D` (--bg-secondary)
- **Floating panels**: `#1B2024` (--bg-elevated)
- **Accent (green)**: `#4ADE80` — primary actions only, ONE per screen
- **Motion easing**: `cubic-bezier(.2,.8,.2,1)` — no exceptions
- **Animation max**: 300ms hard ceiling

## When Unsure
State the uncertainty explicitly and propose two options with their tradeoffs. Never make a silent choice on architecture, security, or data integrity.
