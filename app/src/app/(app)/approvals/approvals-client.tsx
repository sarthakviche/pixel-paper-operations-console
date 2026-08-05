"use client";

import React, { useState } from 'react';
import { ApprovalQueueItem } from '@/types/domain.types';
import { ApprovalCard } from '@/components/features/approvals/approval-card';

interface ApprovalsClientProps {
  initialItems: ApprovalQueueItem[];
}

export function ApprovalsClient({ initialItems }: ApprovalsClientProps) {
  const [items, setItems] = useState<ApprovalQueueItem[]>(initialItems);

  const handleApprove = (lineId: string) => {
    setItems(prev => prev.filter(item => item.line.id !== lineId));
  };

  const handleReject = (lineId: string) => {
    setItems(prev => prev.filter(item => item.line.id !== lineId));
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold text-[var(--text-primary)] tracking-tight">Approvals</h1>
        <p className="text-[var(--text-muted)] text-sm">
          {items.length} {items.length === 1 ? 'item' : 'items'} pending review
        </p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-[rgba(255,255,255,0.12)] rounded-xl bg-[rgba(255,255,255,0.02)]">
          <div className="w-16 h-16 rounded-full bg-[rgba(74,222,128,0.1)] flex items-center justify-center mb-4 text-[var(--status-success)]">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <h3 className="text-lg font-medium text-[var(--text-primary)] mb-1">Nothing pending</h3>
          <p className="text-[var(--text-muted)] text-sm text-center">Nice work. All segments have been reviewed.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map(item => (
            <ApprovalCard
              key={item.line.id}
              item={item}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </div>
  );
}
