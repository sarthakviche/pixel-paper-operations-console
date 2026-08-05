import React from 'react';
import { cn } from '@/lib/cn';

export interface Tab {
  id: string;
  label: string;
  count?: number;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs = ({ tabs, activeTab, onChange, className }: TabsProps) => {
  return (
    <div className={cn('flex border-b border-[rgba(255,255,255,0.06)] overflow-x-auto no-scrollbar', className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative flex items-center min-h-[44px] px-4 text-sm font-medium transition-colors whitespace-nowrap outline-none',
              isActive ? 'text-[#F5F7F8]' : 'text-[#8C949C] hover:text-[#C8CDD1]'
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={cn(
                'ml-2 rounded-full px-2 py-0.5 text-xs',
                isActive ? 'bg-[rgba(74,222,128,0.1)] text-[#4ADE80]' : 'bg-[#1B2024] text-[#8C949C]'
              )}>
                {tab.count}
              </span>
            )}
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#4ADE80] animate-in fade-in duration-200" />
            )}
          </button>
        );
      })}
    </div>
  );
};
