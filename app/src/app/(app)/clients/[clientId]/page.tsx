import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { ClientScreen } from './client-screen';

export default async function ClientPage({ params }: { params: { clientId: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { clientId } = params;

  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .single();

  if (clientError || !client) {
    notFound();
  }

  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select(`
      *,
      editor:editors(id, name, avatar_url)
    `)
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (projectsError) {
    console.error("Error fetching projects:", projectsError);
  }

  return <ClientScreen client={client} projects={projects || []} clientId={clientId} />;
}
