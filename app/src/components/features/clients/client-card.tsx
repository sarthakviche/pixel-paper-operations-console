import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { getAvatarColor, getInitials } from '@/lib/utils';
import { Client } from '@/types/domain.types';

export interface ClientWithStats extends Client {
  active_project_count: number;
  next_deadline: string | null;
}

export function ClientCard({ client }: { client: ClientWithStats }) {
  const color = getAvatarColor(client.name);
  const initials = getInitials(client.name);
  
  let deadlineText = '';
  if (client.next_deadline) {
     const days = Math.ceil((new Date(client.next_deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
     deadlineText = ` · Next deadline in ${days} days`;
  }

  return (
    <Link
      href={`/clients/${client.id}`}
      className={cn(
        "group relative flex items-center p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[rgba(255,255,255,0.06)]",
        "transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
        "hover:scale-[1.02] hover:shadow-lg hover:border-[rgba(255,255,255,0.12)]"
      )}
    >
      <div className="flex items-center gap-4 flex-1">
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center text-[var(--bg-primary)] font-semibold text-lg"
          style={{ backgroundColor: color }}
        >
          {initials}
        </div>
        <div>
          <h3 className="text-[18px] font-semibold text-[#F5F7F8]">{client.name}</h3>
          <p className={cn("text-[14px]", client.active_project_count === 0 ? "text-[#8C949C]" : "text-[#C8CDD1]")}>
            {client.active_project_count === 0 
              ? "No active projects" 
              : `${client.active_project_count} active project${client.active_project_count > 1 ? 's' : ''}${deadlineText}`}
          </p>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-[#8C949C] group-hover:text-[#F5F7F8] transition-colors" />
    </Link>
  );
}
