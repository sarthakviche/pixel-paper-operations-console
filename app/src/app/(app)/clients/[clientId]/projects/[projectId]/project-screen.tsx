"use client";

import { useState } from 'react';
import { ProjectHeader } from '@/components/features/projects/project-header';
import { TranscriptUploadForm } from '@/components/features/projects/transcript-upload-form';
import { LineByLineList } from '@/components/features/projects/line-by-line-list';
import { FrameInspector } from '@/components/features/projects/frame-inspector';
import { useUser } from '@/context/user-context';
import type { Project, TranscriptLine, Profile } from '@/types/domain.types';
import { cn } from '@/lib/cn';

function ViewToggle({ viewMode, onChange }: { viewMode: 'lines' | 'timeline', onChange: (mode: 'lines' | 'timeline') => void }) {
  return (
    <div className="flex items-center space-x-2 my-4 bg-bg-secondary p-1 rounded-md w-fit">
      <button 
        className={cn("px-4 py-2 text-sm rounded-md transition-colors", viewMode === 'lines' ? "bg-bg-elevated text-text-primary shadow" : "text-text-muted hover:text-text-secondary")} 
        onClick={() => onChange('lines')}
      >
        Line by Line
      </button>
      <button 
        className={cn("px-4 py-2 text-sm rounded-md transition-colors", viewMode === 'timeline' ? "bg-bg-elevated text-text-primary shadow" : "text-text-muted hover:text-text-secondary")} 
        onClick={() => onChange('timeline')}
      >
        Timeline
      </button>
    </div>
  );
}

function TimelineView({ lines, onSegmentClick }: { lines: TranscriptLine[], onSegmentClick: (id: string) => void }) {
  return (
    <div className="p-8 text-center text-text-muted border border-dashed border-[rgba(255,255,255,0.12)] rounded-lg">
      Timeline View is under construction.
    </div>
  );
}

interface ProjectScreenProps {
  project: Project;
  lines: TranscriptLine[];
  projectEditors: Profile[];
  allEditors: Profile[];
  clientId: string;
  projectId: string;
}

export function ProjectScreen({ project, lines, projectEditors, allEditors, clientId, projectId }: ProjectScreenProps) {
  const { user, isManager } = useUser();
  const [viewMode, setViewMode] = useState<'lines' | 'timeline'>('lines');
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
  const [localLines, setLocalLines] = useState<TranscriptLine[]>(lines);

  const handleLinesGenerated = (newLines: TranscriptLine[]) => {
    setLocalLines(newLines);
  };

  const handleLineUpdate = (updatedLine: TranscriptLine) => {
    setLocalLines(prev => prev.map(l => l.id === updatedLine.id ? updatedLine : l));
  };

  return (
    <div className="w-full h-full flex flex-col">
      <ProjectHeader project={project} editors={projectEditors} onUpdate={(updates) => {}} />
      <div className="flex-1 overflow-auto px-4 md:px-8 pb-8">
        <ViewToggle viewMode={viewMode} onChange={setViewMode} />
        
        {localLines.length === 0 ? (
          <TranscriptUploadForm projectId={projectId} onLinesGenerated={handleLinesGenerated} />
        ) : viewMode === 'lines' ? (
          <LineByLineList 
            lines={localLines} 
            onLineClick={setSelectedLineId} 
            onLineUpdate={handleLineUpdate} 
            allEditors={allEditors} 
            isManager={isManager} 
            selectedLineId={selectedLineId || undefined}
          />
        ) : (
          <TimelineView lines={localLines} onSegmentClick={setSelectedLineId} />
        )}
      </div>
      
      {selectedLineId && (
        <FrameInspector
          line={localLines.find(l => l.id === selectedLineId)!}
          contextLines={localLines}
          allEditors={allEditors}
          isManager={isManager}
          onClose={() => setSelectedLineId(null)}
          onUpdate={handleLineUpdate}
        />
      )}
    </div>
  );
}
