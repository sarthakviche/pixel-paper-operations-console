"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Paperclip, AlertCircle } from 'lucide-react';
import type { TranscriptLine } from '@/types/domain.types';

export function TranscriptUploadForm({ projectId, onLinesGenerated }: { projectId: string, onLinesGenerated: (lines: TranscriptLine[]) => void }) {
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [stage, setStage] = useState<0 | 1>(0);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleSubmit = async () => {
    if (!transcript.trim()) return;
    setIsProcessing(true);
    setError(null);
    setStage(0);

    setTimeout(() => {
      setStage(1);
    }, 1500);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('breakdown-transcript', {
        body: { project_id: projectId, transcript }
      });
      
      if (fnError) throw fnError;
      onLinesGenerated(data.lines);
    } catch (err: any) {
      setError(err.message || 'Failed to breakdown transcript.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setTranscript(event.target?.result as string);
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-[640px] mx-auto mt-12 p-8 bg-bg-secondary rounded-xl border border-[rgba(255,255,255,0.06)] shadow-lg">
      <h3 className="text-xl font-semibold text-text-primary mb-2">Break down your transcript</h3>
      <p className="text-sm text-text-muted mb-6">Paste your script or upload a file to automatically generate structured segments.</p>
      
      {error && (
        <div className="mb-4 p-4 bg-[rgba(248,113,113,0.1)] border border-status-danger rounded-md flex items-start space-x-3 text-status-danger">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium">Error processing transcript</p>
            <p className="text-xs mt-1 opacity-80">{error}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSubmit} className="text-status-danger hover:bg-status-danger hover:text-white">Retry</Button>
        </div>
      )}
      
      <div className="relative mb-6">
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Paste your transcript here..."
          className="w-full min-h-[200px] p-4 bg-bg-primary border border-[rgba(255,255,255,0.12)] rounded-md text-text-primary focus:outline-none focus:border-accent-primary resize-y"
          disabled={isProcessing}
        />
        <div className="absolute bottom-4 right-4">
          <label className="cursor-pointer">
            <input type="file" accept=".txt,.srt" className="hidden" onChange={handleFileUpload} disabled={isProcessing} />
            <div className="flex items-center space-x-2 text-text-muted hover:text-text-primary bg-bg-elevated px-3 py-1.5 rounded-md border border-[rgba(255,255,255,0.06)] transition-colors">
              <Paperclip className="w-4 h-4" />
              <span className="text-xs font-medium">Upload File</span>
            </div>
          </label>
        </div>
      </div>
      
      <div className="flex flex-col items-center">
        <Button 
          className="w-full bg-accent-primary text-black hover:bg-[#3bce70] h-12 text-base font-semibold"
          onClick={handleSubmit}
          disabled={isProcessing || !transcript.trim()}
        >
          {isProcessing ? 'Processing...' : 'Break Down Transcript'}
        </Button>
        <p className="text-xs text-text-muted mt-3">Powered by AI. You can edit the breakdown later.</p>
      </div>

      <ProgressBar active={isProcessing} stage={stage} labels={["Reading transcript...", "Structuring segments..."]} />
    </div>
  );
}
