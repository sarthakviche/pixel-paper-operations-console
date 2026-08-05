-- ─────────────────────────────────────────────────────
-- ENABLE RLS ON ALL TABLES
-- ─────────────────────────────────────────────────────
alter table clients enable row level security;
alter table projects enable row level security;
alter table project_milestones enable row level security;
alter table project_editors enable row level security;
alter table transcript_lines enable row level security;
alter table assets enable row level security;
alter table activity_log enable row level security;

-- profiles: every authenticated user can read their own profile
-- managers can read all profiles (needed for editor assignment UI)
alter table profiles enable row level security;
create policy profiles_self on profiles
  for select using (id = auth.uid());
create policy profiles_manager_select on profiles
  for select using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','manager'))
  );
create policy profiles_self_update on profiles
  for update using (id = auth.uid()) with check (id = auth.uid());
-- Insert: triggered via Supabase auth hook / trigger — allow service role only
create policy profiles_insert on profiles
  for insert with check (id = auth.uid());

-- ─────────────────────────────────────────────────────
-- HELPER: is the caller admin/manager?
-- ─────────────────────────────────────────────────────
create or replace function is_manager() returns boolean as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role in ('admin','manager')
  );
$$ language sql stable security definer;

-- ─────────────────────────────────────────────────────
-- CLIENTS
-- managers: full access
-- editors: no direct access (they access via projects)
-- ─────────────────────────────────────────────────────
create policy clients_manager_all on clients
  for all using (is_manager()) with check (is_manager());

-- ─────────────────────────────────────────────────────
-- PROJECTS
-- managers: full access
-- editors: SELECT only on projects they're assigned to
-- ─────────────────────────────────────────────────────
create policy projects_manager_all on projects
  for all using (is_manager()) with check (is_manager());
create policy projects_editor_select on projects
  for select using (
    exists (
      select 1 from project_editors pe
      where pe.project_id = projects.id and pe.editor_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────
-- PROJECT MILESTONES
-- same scoping as projects
-- ─────────────────────────────────────────────────────
create policy milestones_manager_all on project_milestones
  for all using (is_manager()) with check (is_manager());
create policy milestones_editor_select on project_milestones
  for select using (
    exists (
      select 1 from project_editors pe
      where pe.project_id = project_milestones.project_id and pe.editor_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────
-- PROJECT EDITORS
-- managers: manage all
-- editors: see their own assignment rows
-- ─────────────────────────────────────────────────────
create policy project_editors_manager_all on project_editors
  for all using (is_manager()) with check (is_manager());
create policy project_editors_self_select on project_editors
  for select using (editor_id = auth.uid());

-- ─────────────────────────────────────────────────────
-- TRANSCRIPT LINES
-- managers: full access
-- editors: SELECT + UPDATE only on their assigned lines
-- ─────────────────────────────────────────────────────
create policy lines_manager_all on transcript_lines
  for all using (is_manager()) with check (is_manager());
create policy lines_editor_select on transcript_lines
  for select using (assigned_editor_id = auth.uid());
create policy lines_editor_update on transcript_lines
  for update using (assigned_editor_id = auth.uid())
  with check (assigned_editor_id = auth.uid());

-- ─────────────────────────────────────────────────────
-- ASSETS
-- managers: full access
-- editors: insert/select for lines assigned to them
-- ─────────────────────────────────────────────────────
create policy assets_manager_all on assets
  for all using (is_manager()) with check (is_manager());
create policy assets_editor_select on assets
  for select using (
    exists (
      select 1 from transcript_lines tl
      where tl.id = assets.transcript_line_id and tl.assigned_editor_id = auth.uid()
    )
  );
create policy assets_editor_insert on assets
  for insert with check (
    exists (
      select 1 from transcript_lines tl
      where tl.id = assets.transcript_line_id and tl.assigned_editor_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────
-- ACTIVITY LOG
-- managers: full read
-- any authenticated user can insert their own action rows
-- ─────────────────────────────────────────────────────
create policy activity_manager_select on activity_log
  for select using (is_manager());
create policy activity_insert_self on activity_log
  for insert with check (actor_id = auth.uid());
