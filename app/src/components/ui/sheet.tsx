"use client";

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/cn';

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Sheet = ({ open, onClose, title, children, className }: SheetProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-250 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative z-50 w-full max-h-[90vh] bg-[#1B2024] rounded-t-[20px] shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-250 ease-[cubic-bezier(0.2,0.8,0.2,1)]',
          className
        )}
      >
        <div className="flex justify-center p-2" onClick={onClose}>
          <div className="w-12 h-1.5 rounded-full bg-[rgba(255,255,255,0.2)] cursor-pointer" />
        </div>
        {title && (
          <div className="px-6 pb-4 pt-2 border-b border-[rgba(255,255,255,0.06)]">
            <h2 className="text-lg font-semibold text-[#F5F7F8]">{title}</h2>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};
