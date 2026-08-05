"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Search, Folder, User, Briefcase } from 'lucide-react';
import { cn } from '@/lib/cn';

interface CommandItem {
  id: string;
  name: string;
  context?: string;
  icon?: React.ReactNode;
}

export interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  clients?: CommandItem[];
  projects?: CommandItem[];
  editors?: CommandItem[];
}

export const CommandPalette = ({ open, onClose, clients = [], projects = [], editors = [] }: CommandPaletteProps) => {
  const [query, setQuery] = useState('');
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
      setQuery('');
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  const filterItems = (items: CommandItem[]) => 
    items.filter(item => item.name.toLowerCase().includes(query.toLowerCase()));

  const filteredClients = filterItems(clients);
  const filteredProjects = filterItems(projects);
  const filteredEditors = filterItems(editors);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-50 w-full max-w-[560px] bg-[#1B2024] rounded-xl shadow-2xl border border-[rgba(255,255,255,0.12)] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-center px-4 border-b border-[rgba(255,255,255,0.06)]">
          <Search className="w-5 h-5 text-[#8C949C]" />
          <input
            autoFocus
            className="flex-1 h-14 bg-transparent border-none px-3 text-[#F5F7F8] placeholder:text-[#8C949C] focus:outline-none focus:ring-0 text-lg"
            placeholder="Search projects, clients, or editors..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filteredProjects.length > 0 && (
            <div className="mb-4">
              <div className="px-2 py-1.5 text-xs font-semibold text-[#8C949C] uppercase tracking-wider">Projects</div>
              {filteredProjects.map(project => (
                <CommandRow key={project.id} item={project} icon={<Folder className="w-4 h-4" />} />
              ))}
            </div>
          )}
          {filteredClients.length > 0 && (
            <div className="mb-4">
              <div className="px-2 py-1.5 text-xs font-semibold text-[#8C949C] uppercase tracking-wider">Clients</div>
              {filteredClients.map(client => (
                <CommandRow key={client.id} item={client} icon={<Briefcase className="w-4 h-4" />} />
              ))}
            </div>
          )}
          {filteredEditors.length > 0 && (
            <div>
              <div className="px-2 py-1.5 text-xs font-semibold text-[#8C949C] uppercase tracking-wider">Editors</div>
              {filteredEditors.map(editor => (
                <CommandRow key={editor.id} item={editor} icon={<User className="w-4 h-4" />} />
              ))}
            </div>
          )}
          {query && !filteredProjects.length && !filteredClients.length && !filteredEditors.length && (
            <div className="p-4 text-center text-sm text-[#8C949C]">
              No results found.
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

const CommandRow = ({ item, icon }: { item: CommandItem; icon: React.ReactNode }) => (
  <button className="w-full flex items-center px-2 py-2.5 rounded-lg text-left text-sm text-[#F5F7F8] hover:bg-[rgba(255,255,255,0.06)] transition-colors focus:bg-[rgba(255,255,255,0.06)] focus:outline-none group">
    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-[#151A1D] rounded-md mr-3 text-[#C8CDD1] group-hover:text-[#F5F7F8]">
      {item.icon || icon}
    </div>
    <div className="flex flex-col flex-1">
      <span className="font-medium">{item.name}</span>
      {item.context && <span className="text-xs text-[#8C949C] mt-0.5">{item.context}</span>}
    </div>
  </button>
);

export const useCommandPalette = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return { open, setOpen };
};
