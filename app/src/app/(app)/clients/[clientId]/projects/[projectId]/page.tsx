import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProjectScreen } from './project-screen';

export async function generateMetadata({ params }: { params: { projectId: string } }) {
  const supabase = await createClient();
  const { data: project } = await supabase.from('projects').select('name').eq('id', params.projectId).single();
  return { title: (project as any)?.name || 'Project' };
}

export default async function ProjectPage({ params }: { params: { clientId: string; projectId: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: project } = await supabase
    .from('projects')
    .select('*, client:client_id(*)')
    .eq('id', params.projectId)
    .single();

  if (!project) notFound();

  const { data: lines } = await supabase
    .from('transcript_lines')
    .select('*, assigned_editor:assigned_editor_id(*)')
    .eq('project_id', params.projectId)
    .order('line_order', { ascending: true });

  const { data: projectEditors } = await supabase
    .from('project_editors')
    .select('profile:profile_id(*)')
    .eq('project_id', params.projectId);

  const { data: allEditors } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'editor');

  return (
    <ProjectScreen 
      project={project} 
      lines={lines || []} 
      projectEditors={(projectEditors || []).map((pe: any) => pe.profile)} 
      allEditors={allEditors || []}
      clientId={params.clientId}
      projectId={params.projectId}
    />
  );
}
