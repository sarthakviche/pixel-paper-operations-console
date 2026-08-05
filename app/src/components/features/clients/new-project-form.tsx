"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/context/user-context';
import { Project } from '@/types/domain.types';

interface NewProjectFormProps {
  open: boolean;
  onClose: () => void;
  clientId: string;
  onSuccess?: (project: Project) => void;
}

export function NewProjectForm({ open, onClose, clientId, onSuccess }: NewProjectFormProps) {
  const [name, setName] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useUser();
  const supabase = createClient();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || name.trim().length < 2) {
      setError('Project name must be at least 2 characters.');
      return;
    }
    if (!user) {
      setError('You must be logged in to create a project.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: insertError } = await supabase
        .from('projects')
        .insert({
          name: name.trim(),
          deadline: deadline || null,
          client_id: clientId,
          status: 'draft',
          created_by: user.id
        } as any)
        .select()
        .single();

      if (insertError) throw insertError;
      
      setName('');
      setDeadline('');
      
      if (onSuccess) {
        onSuccess(data as Project);
      }
      
      const project = data as any;
      // Navigate to the new project screen
      router.push(`/projects/${project.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create project.');
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="New Project">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-[var(--bg-secondary)] border border-[#F87171] text-[#F87171] text-sm rounded-lg">
            {error}
          </div>
        )}
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#C8CDD1]">Project Name <span className="text-[#F87171]">*</span></label>
          <Input 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="e.g. Website Redesign" 
            autoFocus
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#C8CDD1]">Deadline <span className="text-[#8C949C] font-normal">(Optional)</span></label>
          <Input 
            type="date"
            value={deadline} 
            onChange={(e) => setDeadline(e.target.value)}
            className="text-[#F5F7F8] [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[rgba(255,255,255,0.06)]">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="bg-[#4ADE80] hover:bg-[#22c55e] text-[#0E1113]">
            {loading ? 'Creating...' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
