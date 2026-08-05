"use client";

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const Modal = ({ open, onClose, title, description, children, className }: ModalProps) => {
  const panelRef = useRef<HTMLDivElement>(null);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-250 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative z-50 w-full max-w-lg rounded-[20px] bg-[#1B2024] p-6 shadow-xl border border-[rgba(255,255,255,0.06)] animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-250 ease-[cubic-bezier(0.2,0.8,0.2,1)]',
          className
        )}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            {title && <h2 className="text-lg font-semibold text-[#F5F7F8]">{title}</h2>}
            {description && <p className="text-sm text-[#8C949C] mt-1">{description}</p>}
          </div>
          <button onClick={onClose} className="text-[#8C949C] hover:text-[#F5F7F8] rounded-full p-1 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};
