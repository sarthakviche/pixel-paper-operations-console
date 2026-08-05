-- ─────────────────────────────────────────────────────
-- STORAGE BUCKET
-- Create the 'project-assets' bucket (private)
-- Run this in Supabase Dashboard → Storage → New Bucket
-- OR via SQL using the storage schema helpers below
-- ─────────────────────────────────────────────────────

-- Insert bucket via storage.buckets table
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-assets',
  'project-assets',
  false,  -- private: always serve via signed URLs
  52428800,  -- 50MB per file limit
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'video/mp4', 'application/pdf']
)
on conflict (id) do nothing;

-- ─────────────────────────────────────────────────────
-- STORAGE RLS POLICIES
-- ─────────────────────────────────────────────────────

-- Managers: full access to all objects in the bucket
create policy storage_manager_all on storage.objects
  for all using (
    bucket_id = 'project-assets' and is_manager()
  ) with check (
    bucket_id = 'project-assets' and is_manager()
  );

-- Editors: select only objects under transcript lines assigned to them
-- Path convention: project-assets/{project_id}/{transcript_line_id}/{asset_id}.ext
-- We check the 3rd path segment (index 2, 1-based = segment 2) against assigned line IDs
create policy storage_editor_select on storage.objects
  for select using (
    bucket_id = 'project-assets' and
    exists (
      select 1 from transcript_lines tl
      where tl.assigned_editor_id = auth.uid()
        and (storage.foldername(name))[2] = tl.id::text
    )
  );

-- Editors: insert objects under their assigned lines
create policy storage_editor_insert on storage.objects
  for insert with check (
    bucket_id = 'project-assets' and
    exists (
      select 1 from transcript_lines tl
      where tl.assigned_editor_id = auth.uid()
        and (storage.foldername(name))[2] = tl.id::text
    )
  );
