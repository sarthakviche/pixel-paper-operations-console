"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Avatar } from '@/components/ui/avatar';
import { StatusPill } from '@/components/ui/status-pill';
import { Button } from '@/components/ui/button';
import { Calendar, Plus } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Project, Profile } from '@/types/domain.types';
import { useUser } from '@/context/user-context';

export function ProjectHeader({ project, editors, onUpdate }: { project: Project, editors: Profile[], onUpdate: (updates: Partial<Project>) => void }) {
  const [name, setName] = useState(project.name);
  const [isSaving, setIsSaving] = useState(false);
  const { isManager } = useUser();
  const supabase = createClient();

  const handleNameBlur = async () => {
    if (name === project.name) return;
    setIsSaving(true);
    // @ts-ignore
    await supabase.from('projects').update({ name } as any).eq('id', project.id);
    setIsSaving(false);
    onUpdate({ name });
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[rgba(255,255,255,0.06)] px-4 md:px-8 py-6 bg-bg-primary">
      <div className="flex flex-col space-y-2">
        <input 
          type="text" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleNameBlur}
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
          className={`text-2xl font-bold bg-transparent border-none outline-none focus:ring-1 focus:ring-accent-primary rounded px-1 -ml-1 transition-opacity ${isSaving ? 'opacity-50' : ''}`}
        />
        <div className="flex items-center space-x-4 text-sm text-text-muted">
          <StatusPill status={project.status} size="lg" />
          <div className="flex items-center space-x-1 cursor-pointer hover:text-text-secondary transition-colors">
            <Calendar className="w-4 h-4" />
            <span>{project.deadline ? formatDate(project.deadline) : 'Set deadline'}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-6 mt-4 md:mt-0">
        <div className="flex -space-x-2">
          {editors.map(ed => (
            <Avatar key={ed.id} src={ed.avatar_url || undefined} name={ed.full_name || 'E'} className="border-2 border-bg-primary" />
          ))}
        </div>
        {isManager && (
          <Button variant="ghost" size="sm" className="text-text-muted hover:text-text-primary">
            <Plus className="w-4 h-4 mr-1" />
            Add Milestone
          </Button>
        )}
      </div>
    </div>
  );
}
