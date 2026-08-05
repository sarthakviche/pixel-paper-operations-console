"use client";

import { useState } from "react";
import { DashboardProject } from "@/types/domain.types";
import { StatusPill } from "@/components/ui/status-pill";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate, formatRelativeDate, getInitials, getAvatarColor } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { Search } from "lucide-react";

interface ProjectsTableProps {
  projects: DashboardProject[];
  emptyMessage?: string;
}

export function ProjectsTable({ projects, emptyMessage }: ProjectsTableProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = 
      (project.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
      (project.client_name || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const statuses = Array.from(new Set(projects.map(p => p.status))).filter(Boolean);

  if (projects.length === 0) {
    return (
      <div className="bg-[var(--bg-secondary)] rounded-[16px] p-8 border border-[rgba(255,255,255,0.06)]">
        <EmptyState
          title={emptyMessage || "No projects yet"}
          description="Start by creating a client and adding your first project."
          action={{ label: "Create Client", onClick: () => router.push("/clients/new") }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C949C]" />
          <input
            type="text"
            placeholder="Search projects or clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 min-h-[44px] bg-[var(--bg-secondary)] border border-[rgba(255,255,255,0.06)] rounded-lg text-sm text-[#F5F7F8] placeholder:text-[#8C949C] focus:outline-none focus:border-[#4ADE80] transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <FilterChip 
            label="All" 
            isActive={statusFilter === "all"} 
            onClick={() => setStatusFilter("all")} 
          />
          {statuses.map(status => (
            <FilterChip 
              key={status}
              label={status.replace(/_/g, ' ')} 
              isActive={statusFilter === status} 
              onClick={() => setStatusFilter(status)} 
            />
          ))}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block w-full overflow-x-auto bg-[var(--bg-primary)]">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="text-[#8C949C] border-b border-[rgba(255,255,255,0.06)]">
              <th className="font-medium py-3 px-4 w-[20%]">Client</th>
              <th className="font-medium py-3 px-4 w-[25%]">Project Name</th>
              <th className="font-medium py-3 px-4 w-[15%]">Status</th>
              <th className="font-medium py-3 px-4 w-[15%]">Deadline</th>
              <th className="font-medium py-3 px-4 w-[10%]">Editors</th>
              <th className="font-medium py-3 px-4 w-[15%]">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map((project) => (
              <tr 
                key={project.id}
                onClick={() => router.push(`/clients/${project.client_id}/projects/${project.id}`)}
                className="group border-b border-[rgba(255,255,255,0.06)] last:border-0 hover:bg-[var(--bg-elevated)] cursor-pointer transition-colors"
              >
                <td className="py-3 px-4 h-[60px] text-[#C8CDD1] group-hover:text-[#F5F7F8] transition-colors">
                  {project.client_name}
                </td>
                <td className="py-3 px-4 h-[60px] font-medium text-[#F5F7F8]">
                  {project.name}
                </td>
                <td className="py-3 px-4 h-[60px]">
                  <StatusPill status={project.status} />
                </td>
                <td className="py-3 px-4 h-[60px]">
                  <span className={cn(
                    "block",
                    project.deadline_status === 'overdue' && "text-red-400 font-semibold line-through decoration-red-400/50",
                    project.deadline_status === 'at_risk' && "text-yellow-400",
                    project.deadline_status === 'on_track' && "text-[#8C949C]"
                  )}>
                    {formatDate(project.deadline)}
                  </span>
                </td>
                <td className="py-3 px-4 h-[60px]">
                  <div className="flex items-center -space-x-2">
                    {project.editors?.slice(0, 3).map((editor, i) => (
                      <Avatar key={i} src={editor.avatar_url || undefined} name={editor.full_name} size="sm" className="border-2 border-[var(--bg-primary)]" />
                    ))}
                    {project.editors && project.editors.length > 3 && (
                      <div className="w-8 h-8 rounded-full bg-[var(--bg-elevated)] border-2 border-[var(--bg-primary)] flex items-center justify-center text-xs text-[#C8CDD1] z-10">
                        +{project.editors.length - 3}
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4 h-[60px] text-[#8C949C]">
                  {formatRelativeDate(project.updated_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredProjects.length === 0 && (
          <div className="py-12 text-center text-[#8C949C] bg-[var(--bg-secondary)] rounded-xl border border-[rgba(255,255,255,0.06)] mt-4">
            No projects match your filters.
          </div>
        )}
      </div>

      {/* Mobile Stacked Cards View */}
      <div className="flex flex-col gap-3 md:hidden">
        {filteredProjects.map((project) => (
          <div 
            key={project.id}
            onClick={() => router.push(`/clients/${project.client_id}/projects/${project.id}`)}
            className="flex flex-col p-4 bg-[var(--bg-secondary)] rounded-[16px] border border-[rgba(255,255,255,0.06)] active:bg-[var(--bg-elevated)] transition-colors min-h-[44px] cursor-pointer"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="text-xs text-[#C8CDD1] mb-1">{project.client_name}</div>
                <div className="text-base font-medium text-[#F5F7F8]">{project.name}</div>
              </div>
              <div className="flex items-center -space-x-2">
                {project.editors?.slice(0, 3).map((editor, i) => (
                  <Avatar key={i} src={editor.avatar_url || undefined} name={editor.full_name} size="xs" className="border-2 border-[var(--bg-secondary)]" />
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <StatusPill status={project.status} />
              <span className={cn(
                "text-sm",
                project.deadline_status === 'overdue' && "text-red-400 font-semibold line-through decoration-red-400/50",
                project.deadline_status === 'at_risk' && "text-yellow-400",
                project.deadline_status === 'on_track' && "text-[#8C949C]"
              )}>
                {formatDate(project.deadline)}
              </span>
            </div>
          </div>
        ))}
        {filteredProjects.length === 0 && (
          <div className="py-8 text-center text-[#8C949C] bg-[var(--bg-secondary)] rounded-[16px] border border-[rgba(255,255,255,0.06)]">
            No projects match your filters.
          </div>
        )}
      </div>
    </div>
  );
}

function FilterChip({ label, isActive, onClick }: { label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "whitespace-nowrap px-3 py-1.5 min-h-[44px] rounded-full text-xs font-medium transition-colors border",
        isActive 
          ? "bg-[var(--bg-elevated)] border-[rgba(255,255,255,0.12)] text-[#F5F7F8]" 
          : "bg-transparent border-transparent text-[#C8CDD1] hover:text-[#F5F7F8] hover:bg-[var(--bg-secondary)]"
      )}
    >
      <span className="capitalize">{label}</span>
    </button>
  );
}
