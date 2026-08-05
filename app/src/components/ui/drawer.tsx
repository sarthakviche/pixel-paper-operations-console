"use client";

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Drawer = ({ open, onClose, title, children, className }: DrawerProps) => {
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
    <div className="fixed inset-0 z-50 flex justify-end">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-250 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative z-50 h-full w-full max-w-[var(--inspector-width,420px)] bg-[#1B2024] shadow-2xl border-l border-[rgba(255,255,255,0.06)] flex flex-col animate-in slide-in-from-right duration-250 ease-[cubic-bezier(0.2,0.8,0.2,1)]',
          className
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-[rgba(255,255,255,0.06)]">
          {title && <h2 className="text-lg font-semibold text-[#F5F7F8]">{title}</h2>}
          <button onClick={onClose} className="text-[#8C949C] hover:text-[#F5F7F8] rounded-full p-1 transition-colors ml-auto">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};
