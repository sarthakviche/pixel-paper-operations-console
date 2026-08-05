import { createClient } from '@/lib/supabase/server';
import { EditorDetailClient, PaymentSplitRow } from './editor-detail-client';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: { editorId: string } }) {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', params.editorId)
    .single();

  const profileData = profile as any;

  return {
    title: `${profileData?.full_name || 'Editor'} - Pixel & Paper`,
  };
}

export default async function EditorDetailPage({ params }: { params: { editorId: string } }) {
  const supabase = await createClient();

  const { data: editor, error: editorError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.editorId)
    .single();

  if (editorError || !editor) {
    notFound();
  }

  // Fetch all transcript_lines where assigned_editor_id = editorId AND status='approved'
  // Group by project_id and join with project and client
  const { data: lines, error: linesError } = await supabase
    .from('transcript_lines')
    .select(`
      project_id,
      status,
      project:projects (
        id,
        name,
        client:clients (
          id,
          name
        )
      )
    `)
    .eq('assigned_editor_id', params.editorId);

  if (linesError) {
    console.error('Error fetching lines', linesError);
  }

  // Also need total lines per project for this editor to calculate % complete
  // To avoid complex SQL, we'll process it here
  const projectStats = new Map<string, {
    projectName: string;
    clientName: string;
    clientId: string;
    approvedLines: number;
    totalLines: number;
  }>();

  let totalApproved = 0;

  (lines || []).forEach((line: any) => {
    const projectId = line.project_id;
    if (!projectId) return;

    if (!projectStats.has(projectId)) {
      projectStats.set(projectId, {
        projectName: line.project?.name || 'Unknown Project',
        clientName: line.project?.client?.name || 'Unknown Client',
        clientId: line.project?.client?.id || '',
        approvedLines: 0,
        totalLines: 0,
      });
    }

    const stats = projectStats.get(projectId)!;
    stats.totalLines++;

    if (line.status === 'approved') {
      stats.approvedLines++;
      totalApproved++;
    }
  });

  const paymentRows: PaymentSplitRow[] = Array.from(projectStats.entries())
    .filter(([_, stats]) => stats.approvedLines > 0) // Only show projects with approved lines for payment
    .map(([projectId, stats]) => ({
      projectId,
      projectName: stats.projectName,
      clientId: stats.clientId,
      clientName: stats.clientName,
      approvedLines: stats.approvedLines,
      totalLines: stats.totalLines,
      percentComplete: stats.totalLines > 0 ? (stats.approvedLines / stats.totalLines) * 100 : 0,
    }));

  return (
    <EditorDetailClient
      editor={editor}
      paymentRows={paymentRows}
      totalApproved={totalApproved}
    />
  );
}
