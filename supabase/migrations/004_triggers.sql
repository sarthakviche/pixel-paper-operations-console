-- ─────────────────────────────────────────────────────
-- AUTO-UPDATE updated_at COLUMNS
-- ─────────────────────────────────────────────────────
create or replace function touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_clients_updated
  before update on clients
  for each row execute function touch_updated_at();

create trigger trg_projects_updated
  before update on projects
  for each row execute function touch_updated_at();

create trigger trg_lines_updated
  before update on transcript_lines
  for each row execute function touch_updated_at();

-- ─────────────────────────────────────────────────────
-- AUTO-CREATE PROFILE ON USER SIGNUP
-- This trigger fires when a new row is inserted in auth.users
-- It creates a corresponding profiles row with role='editor' by default
-- Managers must be promoted manually in the Supabase dashboard
-- ─────────────────────────────────────────────────────
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'editor'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
