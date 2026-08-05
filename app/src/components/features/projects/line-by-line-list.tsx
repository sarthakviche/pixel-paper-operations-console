"use client";

import { TranscriptLineRow } from './transcript-line-row';
import type { TranscriptLine, Profile } from '@/types/domain.types';

export function LineByLineList({ lines, onLineClick, onLineUpdate, allEditors, isManager, selectedLineId }: {
  lines: TranscriptLine[];
  onLineClick: (id: string) => void;
  onLineUpdate: (line: TranscriptLine) => void;
  allEditors: Profile[];
  isManager: boolean;
  selectedLineId?: string;
}) {
  return (
    <div className="w-full flex flex-col pb-20">
      <div className="mb-4 text-sm font-medium text-text-muted px-2">
        {lines.length} segments
      </div>
      <div className="flex flex-col space-y-[1px] bg-[rgba(255,255,255,0.06)] rounded-lg overflow-hidden border border-[rgba(255,255,255,0.06)]">
        {lines.map((line, index) => (
          <TranscriptLineRow
            key={line.id}
            line={line}
            isSelected={selectedLineId === line.id}
            onClick={() => onLineClick(line.id)}
            onUpdate={onLineUpdate}
            allEditors={allEditors}
            isManager={isManager}
            animationDelay={index * 40}
          />
        ))}
      </div>
    </div>
  );
}
