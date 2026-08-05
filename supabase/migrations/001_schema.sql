-- Enable extension for UUIDs if not already
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────
-- PROFILES (extends Supabase auth.users)
-- ─────────────────────────────────────────────────────
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('admin','manager','editor')),
  avatar_url text,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────────────
-- CLIENTS
-- ─────────────────────────────────────────────────────
create table clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─────────────────────────────────────────────────────
-- PROJECTS
-- ─────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────
-- PROJECT MILESTONES (for project-level calendar)
-- ─────────────────────────────────────────────────────
create table project_milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  label text not null,
  due_date date not null,
  completed boolean default false,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────────────
-- PROJECT EDITORS (many-to-many, project ↔ assigned editors)
-- ─────────────────────────────────────────────────────
create table project_editors (
  project_id uuid not null references projects(id) on delete cascade,
  editor_id uuid not null references profiles(id),
  assigned_at timestamptz default now(),
  primary key (project_id, editor_id)
);

-- ─────────────────────────────────────────────────────
-- TRANSCRIPT LINES
-- ─────────────────────────────────────────────────────
create table transcript_lines (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  line_order int not null,
  text text not null,
  output_type text check (output_type in (
    'motion_graphics','b_roll','static_image_animation',
    'text_animation','split_screen','live_footage','other'
  )),
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

-- ─────────────────────────────────────────────────────
-- ASSETS
-- ─────────────────────────────────────────────────────
create table assets (
  id uuid primary key default gen_random_uuid(),
  transcript_line_id uuid not null references transcript_lines(id) on delete cascade,
  storage_path text not null,     -- Supabase Storage object path
  asset_type text not null check (asset_type in ('uploaded','ai_generated')),
  generation_prompt text,         -- if ai_generated, store the prompt used
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────────────
-- ACTIVITY LOG
-- ─────────────────────────────────────────────────────
create table activity_log (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  actor_id uuid references profiles(id),
  action text not null,
  meta jsonb,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────────────
create index idx_projects_client on projects(client_id);
create index idx_projects_deadline on projects(deadline);
create index idx_projects_status on projects(status);
create index idx_transcript_lines_project on transcript_lines(project_id, line_order);
create index idx_transcript_lines_assigned on transcript_lines(assigned_editor_id);
create index idx_transcript_lines_status on transcript_lines(status);
create index idx_assets_line on assets(transcript_line_id);
create index idx_milestones_project on project_milestones(project_id, due_date);
create index idx_activity_log_project on activity_log(project_id, created_at desc);
