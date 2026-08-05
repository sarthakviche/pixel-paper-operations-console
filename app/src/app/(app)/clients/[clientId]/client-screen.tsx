"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { EmptyState } from '@/components/ui/empty-state';
import { NewProjectForm } from '@/components/features/clients/new-project-form';
// Assuming ProjectsTable exists as mentioned
import { ProjectsTable } from '@/components/features/dashboard/projects-table';
import { Client, Project } from '@/types/domain.types';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/cn';

interface ClientScreenProps {
  client: Client;
  projects: Project[];
  clientId: string;
}

type TabType = 'projects' | 'calendar' | 'notes';

export function ClientScreen({ client, projects, clientId }: ClientScreenProps) {
  const [activeTab, setActiveTab] = useState<TabType>('projects');
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [notes, setNotes] = useState(client.notes || '');
  const [savingNotes, setSavingNotes] = useState(false);
  
  const supabase = createClient();

  const handleNotesBlur = async () => {
    if (notes === client.notes) return;
    setSavingNotes(true);
    try {
      await (supabase.from('clients') as any).update({ notes: notes }).eq('id', clientId);
    } catch (e) {
      console.error("Failed to save notes", e);
    } finally {
      setSavingNotes(false);
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col h-full bg-[var(--bg-primary)] p-6 md:p-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm font-medium text-[#8C949C]">
        <Link href="/clients" className="hover:text-[#F5F7F8] transition-colors">Clients</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-[#F5F7F8]">{client.name}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#F5F7F8]">{client.name}</h1>
          {client.notes && (
            <p className="text-[#8C949C] text-sm mt-1 line-clamp-1 max-w-xl">{client.notes}</p>
          )}
        </div>
        <Button 
          onClick={() => setIsNewProjectOpen(true)}
          className="bg-[#4ADE80] hover:bg-[#22c55e] text-[#0E1113] whitespace-nowrap"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-[rgba(255,255,255,0.06)]">
        {(['projects', 'calendar', 'notes'] as TabType[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "pb-4 text-sm font-medium capitalize transition-colors relative",
              activeTab === tab ? "text-[#F5F7F8]" : "text-[#8C949C] hover:text-[#C8CDD1]"
            )}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#4ADE80] rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        {activeTab === 'projects' && (
          <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[rgba(255,255,255,0.06)] overflow-hidden">
            {projects.length > 0 ? (
              <ProjectsTable projects={projects as any} />
            ) : (
              <div className="p-12">
                <EmptyState 
                  title="No projects yet"
                  description="Create a project to start tracking work for this client."
                  action={{
                    label: "Create Project",
                    onClick: () => setIsNewProjectOpen(true)
                  }}
                />
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'calendar' && (
          <div className="flex items-center justify-center h-64 bg-[var(--bg-secondary)] rounded-2xl border border-[rgba(255,255,255,0.06)]">
            <EmptyState 
              title="Coming Soon"
              description="Calendar view is planned for Sprint 4."
            />
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="max-w-3xl relative">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleNotesBlur}
              placeholder="Add client notes, contact info, preferences..."
              className="min-h-[300px] bg-[var(--bg-secondary)] resize-y"
            />
            {savingNotes && (
              <span className="absolute bottom-3 right-3 text-xs text-[#8C949C]">Saving...</span>
            )}
          </div>
        )}
      </div>

      <NewProjectForm
        open={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
        clientId={clientId}
        onSuccess={() => {
          setIsNewProjectOpen(false);
          // Normally would refresh or route, but let's let NewProjectForm handle it
        }}
      />
    </div>
  );
}
