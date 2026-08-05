"use client";

import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/cn';
import { AIChip } from '@/components/ui/ai-chip';
import { StatusPill } from '@/components/ui/status-pill';
import { ConfidenceIndicator } from '@/components/ui/confidence-indicator';
import { Avatar } from '@/components/ui/avatar';
import { ChevronRight } from 'lucide-react';
import type { TranscriptLine, Profile } from '@/types/domain.types';

interface TranscriptLineRowProps {
  line: TranscriptLine;
  isSelected: boolean;
  onClick: () => void;
  onUpdate: (line: TranscriptLine) => void;
  allEditors: Profile[];
  isManager: boolean;
  animationDelay?: number;
}

export function TranscriptLineRow({ line, isSelected, onClick, onUpdate, allEditors, isManager, animationDelay = 0 }: TranscriptLineRowProps) {
  const supabase = createClient();
  const isAI = line.output_type === line.llm_suggested_type;
  
  const handleTypeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    const newType = e.target.value as any;
    const updated = { ...line, output_type: newType };
    onUpdate(updated);
    // @ts-ignore
    await supabase.from('transcript_lines').update({ output_type: newType } as any).eq('id', line.id);
  };

  return (
    <div 
      onClick={onClick}
      className={cn(
        "group flex flex-col md:flex-row md:items-center min-h-[60px] p-4 bg-bg-secondary hover:bg-bg-elevated transition-colors duration-150 cursor-pointer animate-in fade-in slide-in-from-bottom-2",
        isSelected && "bg-bg-elevated border-l-2 border-l-accent-primary"
      )}
      style={{ animationDelay: `${animationDelay}ms`, animationFillMode: 'both' }}
    >
      <div className="flex-1 flex items-start md:items-center min-w-0 pr-4">
        <span className="text-text-muted text-xs font-mono w-8 flex-shrink-0 mt-0.5 md:mt-0">{line.line_order}</span>
        <p className="text-text-primary text-sm line-clamp-2 leading-relaxed break-words">{line.text}</p>
      </div>
      
      <div className="flex items-center space-x-4 mt-3 md:mt-0 ml-8 md:ml-0 overflow-x-auto no-scrollbar">
        <div className="flex items-center space-x-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
          {isAI && <AIChip />}
          <select 
            value={line.output_type || ''}
            onChange={handleTypeChange}
            className="bg-transparent text-sm text-text-secondary border-none outline-none focus:ring-1 focus:ring-accent-primary rounded cursor-pointer appearance-none px-1"
          >
            <option className="bg-bg-elevated" value="b_roll">B-Roll</option>
            <option className="bg-bg-elevated" value="talking_head">Talking Head</option>
            <option className="bg-bg-elevated" value="graphic">Graphic</option>
            <option className="bg-bg-elevated" value="text_on_screen">Text on Screen</option>
          </select>
        </div>
        
        {line.llm_confidence !== undefined && line.llm_confidence !== null && (
          <div className="flex-shrink-0 hidden lg:block">
            <ConfidenceIndicator confidence={line.llm_confidence} />
          </div>
        )}
        
        <div className="flex-shrink-0">
          <Avatar src={line.assigned_editor?.avatar_url || undefined} name={line.assigned_editor?.full_name || '?'} size="sm" />
        </div>
        
        <div className="flex-shrink-0" onClick={e => e.stopPropagation()}>
          <StatusPill status={line.status} />
        </div>
        
        <div className="flex-shrink-0 text-text-muted group-hover:text-text-primary transition-colors hidden md:block">
          <ChevronRight className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
