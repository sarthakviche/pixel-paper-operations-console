"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Drawer } from '@/components/ui/drawer';
import { Sheet } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { AIChip } from '@/components/ui/ai-chip';
import { ConfidenceIndicator } from '@/components/ui/confidence-indicator';
import { Avatar } from '@/components/ui/avatar';
import { StatusPill } from '@/components/ui/status-pill';
import { Paperclip, Image as ImageIcon, Check, X } from 'lucide-react';
import type { TranscriptLine, Profile } from '@/types/domain.types';

export function FrameInspector({ line, contextLines, allEditors, isManager, onClose, onUpdate }: {
  line: TranscriptLine;
  contextLines: TranscriptLine[];
  allEditors: Profile[];
  isManager: boolean;
  onClose: () => void;
  onUpdate: (line: TranscriptLine) => void;
}) {
  const [isDesktop, setIsDesktop] = useState(true);
  const supabase = createClient();
  const [notes, setNotes] = useState(line.notes ?? '');

  useEffect(() => {
    const checkWidth = () => setIsDesktop(window.innerWidth >= 768);
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  const currentIndex = contextLines.findIndex(l => l.id === line.id);
  const prevLine = currentIndex > 0 ? contextLines[currentIndex - 1] : null;
  const nextLine = currentIndex < contextLines.length - 1 ? contextLines[currentIndex + 1] : null;

  const handleNotesBlur = async () => {
    if (notes === line.notes) return;
    const updated = { ...line, notes };
    onUpdate(updated);
    // @ts-ignore
    await supabase.from('transcript_lines').update({ notes } as any).eq('id', line.id);
  };

  const updateStatus = async (status: string) => {
    const updated = { ...line, status: status as any };
    onUpdate(updated);
    // @ts-ignore
    await supabase.from('transcript_lines').update({ status } as any).eq('id', line.id);
  };

  const Container = isDesktop ? Drawer : Sheet;

  return (
    <Container open={true} onClose={onClose} title={`Frame ${line.line_order}`}>
      <div className="flex flex-col h-full overflow-y-auto p-6 space-y-8 bg-bg-elevated text-text-primary">
        
        {/* Context */}
        <div className="space-y-3 bg-[rgba(255,255,255,0.03)] p-4 rounded-lg border border-[rgba(255,255,255,0.06)]">
          {prevLine && <p className="text-sm text-text-muted italic truncate">{prevLine.text}</p>}
          <p className="text-base text-text-primary font-medium">{line.text}</p>
          {nextLine && <p className="text-sm text-text-muted italic truncate">{nextLine.text}</p>}
        </div>

        {/* Output Type */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-text-secondary">Type & Confidence</h4>
            {line.output_type === line.llm_suggested_type && <AIChip />}
          </div>
          <div className="flex items-center space-x-4">
            <select 
              value={line.output_type ?? ''}
              onChange={(e) => {
                const newType = e.target.value as any;
                onUpdate({ ...line, output_type: newType });
                // @ts-ignore
                supabase.from('transcript_lines').update({ output_type: newType } as any).eq('id', line.id);
              }}
              className="flex-1 bg-bg-secondary text-sm border border-[rgba(255,255,255,0.12)] rounded-md px-3 py-2 outline-none focus:border-accent-primary"
            >
              <option value="b_roll">B-Roll</option>
              <option value="talking_head">Talking Head</option>
              <option value="graphic">Graphic</option>
              <option value="text_on_screen">Text on Screen</option>
            </select>
            {line.llm_confidence !== undefined && line.llm_confidence !== null && <ConfidenceIndicator confidence={line.llm_confidence} />}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-text-secondary">Notes</h4>
          <textarea 
            value={notes}
            onChange={e => setNotes(e.target.value)}
            onBlur={handleNotesBlur}
            placeholder="Add production notes..."
            className="w-full h-24 bg-bg-secondary text-sm border border-[rgba(255,255,255,0.12)] rounded-md p-3 outline-none focus:border-accent-primary resize-none"
          />
        </div>

        {/* Assignment */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-text-secondary">Assigned Editor</h4>
          <div className="flex items-center space-x-3">
            <Avatar src={line.assigned_editor?.avatar_url || undefined} name={line.assigned_editor?.full_name || 'U'} />
            {isManager ? (
              <select 
                value={line.assigned_editor_id || ''}
                onChange={(e) => {
                  const val = e.target.value || null;
                  const ed = allEditors.find(x => x.id === val) || null;
                  onUpdate({ ...line, assigned_editor_id: val, assigned_editor: ed as any });
                  // @ts-ignore
                  supabase.from('transcript_lines').update({ assigned_editor_id: val } as any).eq('id', line.id);
                }}
                className="flex-1 bg-bg-secondary text-sm border border-[rgba(255,255,255,0.12)] rounded-md px-3 py-2 outline-none focus:border-accent-primary"
              >
                <option value="">Unassigned</option>
                {allEditors.map(ed => (
                  <option key={ed.id} value={ed.id}>{ed.full_name}</option>
                ))}
              </select>
            ) : (
              <span className="text-sm font-medium">{line.assigned_editor?.full_name || 'Unassigned'}</span>
            )}
          </div>
        </div>

        {/* Asset */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-text-secondary">Asset</h4>
          {line.assets && line.assets.length > 0 ? (
            <div className="w-full aspect-video bg-bg-secondary rounded-md border border-[rgba(255,255,255,0.12)] overflow-hidden relative group">
              <img src={line.assets[0].signed_url || line.assets[0].storage_path} alt="Asset" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="flex-1 bg-bg-secondary border border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.1)]">
                <Paperclip className="w-4 h-4 mr-2" /> Upload
              </Button>
              <Button variant="ghost" size="sm" className="flex-1 bg-bg-secondary border border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.1)]">
                <ImageIcon className="w-4 h-4 mr-2" /> Generate Image
              </Button>
            </div>
          )}
        </div>

        {/* Status Actions */}
        <div className="pt-4 border-t border-[rgba(255,255,255,0.06)] space-y-3">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium">Current Status:</span>
            <StatusPill status={line.status} />
          </div>
          
          <div className="flex gap-2">
            {!isManager && line.status === 'not_started' && (
              <Button className="w-full bg-accent-primary text-black" onClick={() => updateStatus('in_progress')}>Start Work</Button>
            )}
            {!isManager && line.status === 'in_progress' && (
              <Button className="w-full bg-accent-primary text-black" onClick={() => updateStatus('needs_review')}>Submit for Review</Button>
            )}
            {isManager && (
              <>
                <Button className="flex-1 bg-status-success text-black hover:bg-[#3bce70]" onClick={() => updateStatus('approved')}>
                  <Check className="w-4 h-4 mr-2" /> Approve
                </Button>
                <Button variant="ghost" className="flex-1 text-status-danger hover:bg-[rgba(248,113,113,0.1)] hover:text-status-danger" onClick={() => updateStatus('in_progress')}>
                  <X className="w-4 h-4 mr-2" /> Reject
                </Button>
              </>
            )}
          </div>
        </div>

      </div>
    </Container>
  );
}
