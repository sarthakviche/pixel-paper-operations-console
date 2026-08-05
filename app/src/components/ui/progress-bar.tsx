"use client";

import React from 'react';
import { cn } from '@/lib/cn';

export interface ProgressBarProps {
  active: boolean;
  stage?: 0 | 1;
  labels?: [string, string];
}

export const ProgressBar = ({ active, stage = 0, labels }: ProgressBarProps) => {
  if (!active) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center">
      <div className="h-1 w-full bg-[#1B2024] overflow-hidden">
        <div className="h-full bg-gradient-to-r from-transparent via-[#4ADE80] to-transparent w-full animate-[skeletonPulse_1.5s_linear_infinite]" style={{ backgroundSize: '200% 100%' }} />
      </div>
      {labels && (
        <div className="mt-2 px-4 py-1 rounded-full bg-[#1B2024] border border-[rgba(255,255,255,0.06)] text-xs text-[#F5F7F8] shadow-lg animate-in slide-in-from-top-4 fade-in duration-300">
          {labels[stage]}
        </div>
      )}
    </div>
  );
};
