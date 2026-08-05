import { createClient } from '@/lib/supabase/server';
import { ApprovalsClient } from './approvals-client';
import { ApprovalQueueItem } from '@/types/domain.types';

export const metadata = {
  title: 'Approvals - Pixel & Paper',
};

export default async function ApprovalsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch transcript lines needing review
  // Joins with projects to get project and client info
  // Joins with assets to get the thumbnail
  const { data: lines, error } = await supabase
    .from('transcript_lines')
    .select(`
      *,
      project:projects (
        id,
        name,
        client_id,
        client:clients (
          id,
          name
        )
      ),
      assets (
        id,
        storage_path,
        asset_type
      )
    `)
    .eq('status', 'needs_review')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching approvals', error);
  }

  // Transform data into ApprovalQueueItem format
  const initialItems: ApprovalQueueItem[] = (lines || []).map((line: any) => ({
    line: line as any,
    project: { name: line.project?.name || 'Unknown Project' } as any,
    client: { name: line.project?.client?.name || 'Unknown Client' } as any,
    asset: line.assets && line.assets.length > 0 ? line.assets[0] : undefined
  }));

  return <ApprovalsClient initialItems={initialItems} />;
}
