import { createClient } from '@/lib/supabase/server';
import { ClientGrid } from '@/components/features/clients/client-grid';

export const metadata = {
  title: 'Clients',
};

export default async function ClientsPage() {
  const supabase = await createClient();
  
  // Using PostgREST resource embedding to fetch counts and derived data isn't straightforward
  // without a view or RPC. We'll fetch clients and related projects, then compute.
  const { data: clients, error } = await supabase
    .from('clients')
    .select(`
      *,
      projects (id, status, deadline)
    `)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error("Error fetching clients:", error);
  }

  const formattedClients = (clients || []).map((client: any) => {
    let activeProjectCount = 0;
    let nextDeadline: string | undefined = undefined;
    
    if (client.projects) {
      (client.projects as any[]).forEach((p: any) => {
        if (p.status !== 'delivered') {
          activeProjectCount++;
        }
        if (p.deadline && p.status !== 'approved' && p.status !== 'delivered') {
          const pDate = new Date(p.deadline);
          if (!nextDeadline || pDate < new Date(nextDeadline)) {
            nextDeadline = p.deadline;
          }
        }
      });
    }

    return {
      ...client,
      active_project_count: activeProjectCount,
      next_deadline: nextDeadline || null
    };
  });

  return (
    <div className="flex-1 w-full flex flex-col min-h-screen bg-[var(--bg-primary)]">
      <ClientGrid clients={formattedClients} />
    </div>
  );
}
