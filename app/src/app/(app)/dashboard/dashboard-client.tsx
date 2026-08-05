"use client";

import { useState } from "react";
import { DashboardProject, DashboardSummary } from "@/types/domain.types";
import { SummaryCards } from "@/components/features/dashboard/summary-cards";
import { ProjectsTable } from "@/components/features/dashboard/projects-table";
import { cn } from "@/lib/cn";
import { LayoutGrid, Calendar as CalendarIcon, X, RotateCw } from "lucide-react";
import { useRouter } from "next/navigation";

type FilterType = 'all' | 'pending' | 'awaiting_approval' | 'overdue' | 'in_progress' | null;

interface DashboardClientProps {
  projects: DashboardProject[];
  summary: DashboardSummary;
  error?: string;
}

export function DashboardClient({ projects, summary, error }: DashboardClientProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>(null);
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const router = useRouter();

  const filteredProjects = projects.filter((project) => {
    if (!activeFilter || activeFilter === 'all') return true;
    
    switch(activeFilter) {
      case 'pending': return project.status === 'draft' || project.status === 'breakdown';
      case 'awaiting_approval': return project.status === 'review';
      case 'overdue': return project.deadline_status === 'overdue';
      case 'in_progress': return project.status === 'in_production';
      default: return true;
    }
  });

  const needsAttention = summary.overdue + summary.awaiting_approval;

  return (
    <div className="flex flex-col gap-8 w-full min-h-screen bg-[var(--bg-primary)] p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-[#F5F7F8]">Dashboard</h1>
        <p className="text-[#8C949C]">
          {needsAttention > 0 
            ? `${needsAttention} projects need attention` 
            : "All clear! No projects currently need immediate attention."}
        </p>
      </div>

      <SummaryCards 
        summary={summary} 
        activeFilter={activeFilter} 
        onFilter={(key) => setActiveFilter(key as FilterType)} 
      />

      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-medium text-[#F5F7F8]">All Projects</h2>
            {activeFilter && activeFilter !== 'all' && (
              <button
                onClick={() => setActiveFilter(null)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-sm rounded-full bg-[var(--bg-elevated)] text-[#C8CDD1] hover:text-[#F5F7F8] transition-colors border border-[rgba(255,255,255,0.06)]"
              >
                <span className="capitalize">{activeFilter.replace('_', ' ')}</span>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 bg-[var(--bg-secondary)] p-1 rounded-lg border border-[rgba(255,255,255,0.06)]">
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                viewMode === 'table' 
                  ? "bg-[var(--bg-elevated)] text-[#F5F7F8] shadow-sm" 
                  : "text-[#8C949C] hover:text-[#F5F7F8]"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors hidden sm:flex",
                viewMode === 'calendar' 
                  ? "bg-[var(--bg-elevated)] text-[#F5F7F8] shadow-sm" 
                  : "text-[#8C949C] hover:text-[#F5F7F8]"
              )}
            >
              <CalendarIcon className="w-4 h-4" />
              <span>Calendar</span>
            </button>
          </div>
        </div>

        {error ? (
          <div className="flex flex-col items-center justify-center p-8 bg-[var(--bg-secondary)] rounded-[16px] border border-[rgba(255,255,255,0.06)] gap-4">
            <p className="text-red-400 font-medium">Failed to load projects: {error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-elevated)] hover:bg-[rgba(255,255,255,0.12)] text-[#F5F7F8] rounded-lg transition-colors border border-[rgba(255,255,255,0.06)]"
            >
              <RotateCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        ) : viewMode === 'table' ? (
          <ProjectsTable projects={filteredProjects} />
        ) : (
          <div className="flex flex-col items-center justify-center p-12 bg-[var(--bg-secondary)] rounded-[16px] border border-[rgba(255,255,255,0.06)]">
            <CalendarIcon className="w-12 h-12 text-[#8C949C] mb-4" />
            <h3 className="text-lg font-medium text-[#F5F7F8] mb-2">Calendar View</h3>
            <p className="text-[#8C949C] text-center max-w-sm">
              Calendar representation of your projects is under construction.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
