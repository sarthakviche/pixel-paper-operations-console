"use client";

import React, { useState } from 'react';
import { cn } from '@/lib/cn';
import { TranscriptLine } from '@/types/domain.types';

interface TimelineViewProps {
  lines: TranscriptLine[];
  onSegmentClick: (lineId: string) => void;
  selectedLineId?: string;
}

export function TimelineView({ lines, onSegmentClick, selectedLineId }: TimelineViewProps) {
  const [hoveredLineId, setHoveredLineId] = useState<string | null>(null);

  const getSegmentColor = (outputType: string) => {
    switch (outputType) {
      case 'motion_graphics':
        return 'bg-[var(--accent-primary)]';
      case 'b_roll':
        return 'bg-[var(--status-info)]';
      case 'static_image_animation':
        return 'bg-[var(--accent-light)]';
      case 'text_animation':
        return 'bg-[var(--status-warning)]';
      case 'split_screen':
        return 'bg-[rgba(74,222,128,0.4)]';
      case 'live_footage':
        return 'bg-[var(--status-success)]';
      default:
        return 'bg-muted';
    }
  };

  const getSegmentBorder = (outputType: string) => {
    switch (outputType) {
      case 'motion_graphics':
        return 'border-[var(--accent-primary)]';
      case 'b_roll':
        return 'border-[var(--status-info)]';
      case 'static_image_animation':
        return 'border-[var(--accent-light)]';
      case 'text_animation':
        return 'border-[var(--status-warning)]';
      case 'split_screen':
        return 'border-[rgba(74,222,128,0.4)]';
      case 'live_footage':
        return 'border-[var(--status-success)]';
      default:
        return 'border-muted';
    }
  };

  const legend = [
    { type: 'motion_graphics', label: 'Motion Graphics', color: 'bg-[var(--accent-primary)]' },
    { type: 'b_roll', label: 'B-Roll', color: 'bg-[var(--status-info)]' },
    { type: 'static_image_animation', label: 'Static Image', color: 'bg-[var(--accent-light)]' },
    { type: 'text_animation', label: 'Text', color: 'bg-[var(--status-warning)]' },
    { type: 'split_screen', label: 'Split Screen', color: 'bg-[rgba(74,222,128,0.4)]' },
    { type: 'live_footage', label: 'Live Footage', color: 'bg-[var(--status-success)]' },
    { type: 'other', label: 'Other', color: 'bg-muted' },
  ];

  return (
    <div className="w-full space-y-4">
      <div className="text-sm text-muted-foreground">Timeline view is for pacing review</div>
      <div className="relative w-full overflow-x-auto pb-4">
        <div className="flex min-w-max">
          {lines.map((line) => {
            const isSelected = selectedLineId === line.id;
            const isHovered = hoveredLineId === line.id;

            return (
              <div
                key={line.id}
                onClick={() => onSegmentClick(line.id)}
                onMouseEnter={() => setHoveredLineId(line.id)}
                onMouseLeave={() => setHoveredLineId(null)}
                className={cn(
                  "relative flex-1 min-w-[120px] h-[80px] p-2 cursor-pointer transition-all duration-300 border-r border-[rgba(255,255,255,0.06)] md:h-[80px] h-12 flex flex-col justify-between overflow-hidden",
                  getSegmentColor(line.output_type || ''),
                  isSelected && "ring-2 ring-[var(--accent-primary)] ring-offset-2 ring-offset-[var(--bg-primary)] z-10",
                  isHovered ? "brightness-110" : ""
                )}
              >
                <div className="hidden md:flex justify-between items-center text-xs font-medium text-black mix-blend-plus-lighter opacity-80">
                  <span>{line.line_order}</span>
                  <span className="truncate max-w-[60px]">{line.output_type?.replace(/_/g, ' ') || ''}</span>
                </div>
                <div className="hidden md:block text-sm font-medium text-black mix-blend-plus-lighter truncate mt-1">
                  {line.text}
                </div>

                {isHovered && (
                  <div className="absolute top-full left-0 mt-2 p-3 bg-[var(--bg-elevated)] border border-[rgba(255,255,255,0.12)] rounded-md shadow-lg z-50 min-w-[200px] max-w-[300px]">
                    <div className="text-xs text-[var(--accent-primary)] mb-1">
                      {line.output_type?.replace(/_/g, ' ').toUpperCase() || ''}
                    </div>
                    <div className="text-sm text-[var(--text-primary)]">
                      {line.text}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-[var(--text-secondary)]">
        {legend.map((item) => (
          <div key={item.type} className="flex items-center gap-1.5">
            <div className={cn("w-2.5 h-2.5 rounded-full", item.color)} />
            <span className="capitalize">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
