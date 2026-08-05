"use client";

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/context/user-context';
import { Client } from '@/types/domain.types';

interface NewClientFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (client: Client) => void;
}

export function NewClientForm({ open, onClose, onSuccess }: NewClientFormProps) {
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useUser();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || name.trim().length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }
    if (!user) {
      setError('You must be logged in to create a client.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: insertError } = await supabase
        .from('clients')
        .insert({
          name: name.trim(),
          notes: notes.trim() || null,
          created_by: user.id
        } as any)
        .select()
        .single();

      if (insertError) throw insertError;
      
      setName('');
      setNotes('');
      onSuccess(data as Client);
    } catch (err: any) {
      setError(err.message || 'Failed to create client.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="New Client">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-[var(--bg-secondary)] border border-[#F87171] text-[#F87171] text-sm rounded-lg">
            {error}
          </div>
        )}
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#C8CDD1]">Client Name <span className="text-[#F87171]">*</span></label>
          <Input 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="e.g. Acme Corp" 
            autoFocus
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#C8CDD1]">Notes</label>
          <Textarea 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)} 
            placeholder="Any context or background info..." 
            rows={4}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[rgba(255,255,255,0.06)]">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="bg-[#4ADE80] hover:bg-[#22c55e] text-[#0E1113]">
            {loading ? 'Creating...' : 'Create Client'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
