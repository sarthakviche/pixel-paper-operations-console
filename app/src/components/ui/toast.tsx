"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/cn';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      {typeof document !== 'undefined' && createPortal(
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={() => removeToast(t.id)} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-[#4ADE80]" />,
    error: <AlertCircle className="w-5 h-5 text-[#F87171]" />,
    warning: <AlertTriangle className="w-5 h-5 text-[#FACC15]" />,
    info: <Info className="w-5 h-5 text-[#60A5FA]" />,
  };

  return (
    <div className={cn(
      'pointer-events-auto flex items-center gap-3 bg-[#1B2024] border border-[rgba(255,255,255,0.06)] shadow-lg rounded-lg p-4 min-w-[300px] max-w-md animate-in slide-in-from-bottom-2 fade-in duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]'
    )}>
      {icons[toast.type]}
      <p className="text-sm font-medium text-[#F5F7F8] flex-1">{toast.message}</p>
      <button onClick={onDismiss} className="text-[#8C949C] hover:text-[#F5F7F8] transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
