"use client";
import { useState } from 'react';

export function useFrameInspector() {
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
  
  const openInspector = (lineId: string) => setSelectedLineId(lineId);
  const closeInspector = () => setSelectedLineId(null);
  
  return { selectedLineId, openInspector, closeInspector };
}
