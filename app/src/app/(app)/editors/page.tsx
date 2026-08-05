import { createClient } from '@/lib/supabase/server';
import { EditorsClient, EditorStats } from './editors-client';
import { Profile } from '@/types/domain.types';

export const metadata = {
  title: 'Editors - Pixel & Paper',
};

export default async function EditorsPage() {
  const supabase = await createClient();

  // Fetch all profiles where role='editor'
  const { data: editors, error: editorsError } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'editor');

  if (editorsError) {
    console.error('Error fetching editors', editorsError);
  }

  // Fetch stats for each editor
  // In a real app, this might be a more optimized SQL view or RPC
  const statsPromises = (editors || []).map(async (editor: Profile) => {
    const { count: activeAssignments } = await supabase
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .contains('assigned_editors', [editor.id]); // Assumes assigned_editors is an array in projects, or we query differently

    const { count: approvedLines } = await supabase
      .from('transcript_lines')
      .select('id', { count: 'exact', head: true })
      .eq('assigned_editor_id', editor.id)
      .eq('status', 'approved');

    return {
      editor,
      activeAssignments: activeAssignments || 0,
      approvedLines: approvedLines || 0,
    };
  });

  const editorStats: EditorStats[] = await Promise.all(statsPromises);

  return <EditorsClient editors={editorStats} />;
}
