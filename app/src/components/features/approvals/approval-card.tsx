"use client";

import React, { useState } from 'react';
import { ApprovalQueueItem } from '@/types/domain.types';
import { createClient } from '@/lib/supabase/client';
import { Popover } from '@/components/ui/popover';
import { cn } from '@/lib/cn';

interface ApprovalCardProps {
  item: ApprovalQueueItem;
  onApprove: (lineId: string) => void;
  onReject: (lineId: string, reason?: string) => void;
}

export function ApprovalCard({ item, onApprove, onReject }: ApprovalCardProps) {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isExiting, setIsExiting] = useState(false);
  
  const supabase = createClient();

  const handleApprove = async () => {
    setIsApproving(true);
    const { error } = await supabase
      .from('transcript_lines')
      // @ts-ignore
      .update({ status: 'approved' } as any)
      .eq('id', item.line.id);

    if (error) {
      console.error('Failed to approve', error);
      setIsApproving(false);
      // In a real app, toast.error('Failed to approve');
      return;
    }
    
    setIsExiting(true);
    setTimeout(() => {
      onApprove(item.line.id);
    }, 200);
  };

  const handleReject = async () => {
    setIsRejecting(true);
    const newNotes = rejectReason || item.line.notes || null;
    
    const { error } = await supabase
      .from('transcript_lines')
      // @ts-ignore
      .update({ status: 'in_progress', notes: newNotes } as any)
      .eq('id', item.line.id);

    if (error) {
      console.error('Failed to reject', error);
      setIsRejecting(false);
      return;
    }

    setIsExiting(true);
    setTimeout(() => {
      onReject(item.line.id, rejectReason);
    }, 200);
  };

  return (
    <div className={cn(
      "bg-[var(--bg-secondary)] rounded-[var(--radius-card)] p-5 border border-[rgba(255,255,255,0.06)] flex flex-col sm:flex-row gap-5 transition-all duration-200",
      isExiting ? "opacity-0 scale-95 h-0 overflow-hidden p-0 m-0 border-0" : "opacity-100"
    )}>
      {item.asset && item.asset.storage_path ? (
        <div className="w-[60px] h-[60px] rounded-md overflow-hidden shrink-0 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.06)]">
          {/* Note: In a real implementation this would fetch the signed URL */}
          <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-xs">IMG</div>
        </div>
      ) : (
        <div className="w-[60px] h-[60px] rounded-md overflow-hidden shrink-0 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.06)] flex items-center justify-center">
          <span className="text-[var(--text-muted)] text-[10px]">No Asset</span>
        </div>
      )}

      <div className="flex-1 flex flex-col justify-center min-w-0">
        <div className="text-xs text-[var(--text-muted)] mb-1 truncate">
          {item.client.name} / {item.project.name}
        </div>
        <div className="text-sm md:text-base text-[var(--text-primary)] line-clamp-3 leading-relaxed">
          {item.line.text}
        </div>
        
        {item.line.assigned_editor_id && (
          <div className="mt-2 text-xs text-[var(--text-secondary)]">
            Editor ID: {item.line.assigned_editor_id.substring(0, 8)}...
          </div>
        )}
      </div>

      <div className="flex sm:flex-col items-center sm:items-end justify-center gap-3 shrink-0 mt-2 sm:mt-0">
        <button
          onClick={handleApprove}
          disabled={isApproving || isRejecting}
          className="px-4 py-2 bg-[var(--status-success)] text-[#000] font-medium text-sm rounded-md hover:brightness-110 transition-all disabled:opacity-50"
        >
          {isApproving ? 'Approving...' : 'Approve'}
        </button>
        
        <Popover
          trigger={
            <button
              disabled={isApproving || isRejecting}
              className="px-4 py-2 bg-transparent border border-[rgba(255,255,255,0.12)] text-[var(--text-secondary)] font-medium text-sm rounded-md hover:bg-[rgba(255,255,255,0.05)] hover:text-[var(--text-primary)] transition-all disabled:opacity-50"
            >
              Reject
            </button>
          }
          className="w-80 p-4 right-0"
        >
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-medium text-[var(--text-primary)]">Reason for rejection (optional)</h4>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="What needs to be changed?"
              className="w-full h-24 bg-[var(--bg-primary)] border border-[rgba(255,255,255,0.12)] rounded-md p-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] resize-none"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={handleReject}
                disabled={isRejecting}
                className="px-3 py-1.5 bg-[var(--status-danger)] text-white text-sm font-medium rounded-md hover:brightness-110 transition-all"
              >
                {isRejecting ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </Popover>
      </div>
    </div>
  );
}
