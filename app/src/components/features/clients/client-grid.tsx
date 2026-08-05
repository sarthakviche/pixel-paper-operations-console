"use client";

import React, { useState } from 'react';
import { ClientCard, ClientWithStats } from './client-card';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { NewClientForm } from './new-client-form';
import { useRouter } from 'next/navigation';

interface ClientGridProps {
  clients: ClientWithStats[];
}

export function ClientGrid({ clients }: ClientGridProps) {
  const [search, setSearch] = useState('');
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const router = useRouter();

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full space-y-6 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#F5F7F8]">Clients</h1>
        <Button 
          onClick={() => setIsNewClientOpen(true)}
          className="bg-[#4ADE80] hover:bg-[#22c55e] text-[#0E1113]"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Client
        </Button>
      </div>

      {clients.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C949C]" />
          <input 
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border-b border-[rgba(255,255,255,0.06)] focus:border-[#4ADE80] py-2 pl-9 pr-4 text-[#F5F7F8] placeholder:text-[#8C949C] outline-none transition-colors"
          />
        </div>
      )}

      {clients.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <EmptyState 
            title="No clients yet"
            description="Create your first client to start organizing projects."
            action={{
              label: "Create your first client",
              onClick: () => setIsNewClientOpen(true)
            }}
          />
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <EmptyState 
            title="No results found"
            description={`No clients match the search "${search}".`}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filteredClients.map(client => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      )}

      <NewClientForm 
        open={isNewClientOpen} 
        onClose={() => setIsNewClientOpen(false)} 
        onSuccess={() => {
          setIsNewClientOpen(false);
          router.refresh();
        }}
      />
    </div>
  );
}
