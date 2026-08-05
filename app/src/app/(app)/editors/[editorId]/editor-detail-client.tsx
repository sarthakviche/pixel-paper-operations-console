"use client";

import React from 'react';
import { Profile } from '@/types/domain.types';
import Link from 'next/link';

export interface PaymentSplitRow {
  projectId: string;
  projectName: string;
  clientId: string;
  clientName: string;
  approvedLines: number;
  totalLines: number;
  percentComplete: number;
}

interface EditorDetailClientProps {
  editor: Profile;
  paymentRows: PaymentSplitRow[];
  totalApproved: number;
}

export function EditorDetailClient({ editor, paymentRows, totalApproved }: EditorDetailClientProps) {
  const handleExportCSV = () => {
    const headers = ['Project Name', 'Client Name', 'Approved Lines', 'Total Lines', '% Complete'];
    const csvContent = [
      headers.join(','),
      ...paymentRows.map(row => 
        `"${row.projectName}","${row.clientName}",${row.approvedLines},${row.totalLines},${row.percentComplete.toFixed(2)}%`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${editor.full_name.replace(/\s+/g, '_').toLowerCase()}_payments.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getAvatarColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4 flex flex-col gap-8">
      <div className="text-sm text-[var(--text-muted)] flex items-center gap-2">
        <Link href="/editors" className="hover:text-[var(--text-primary)] transition-colors">Editors</Link>
        <span>/</span>
        <span className="text-[var(--text-primary)]">{editor.full_name}</span>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start md:items-end justify-between">
        <div className="flex items-center gap-5">
          {editor.avatar_url ? (
            <img src={editor.avatar_url} alt={editor.full_name} className="w-20 h-20 rounded-full object-cover border-2 border-[rgba(255,255,255,0.1)]" />
          ) : (
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-medium text-white border-2 border-[rgba(255,255,255,0.1)]" style={{ backgroundColor: getAvatarColor(editor.full_name) }}>
              {editor.full_name.charAt(0)}
            </div>
          )}
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-semibold text-[var(--text-primary)] tracking-tight">{editor.full_name}</h1>
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 text-xs font-medium bg-[rgba(255,255,255,0.05)] text-[var(--text-secondary)] rounded-md uppercase tracking-wider">
                Editor
              </span>
              <span className="text-[var(--text-muted)] text-sm">{editor.full_name}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-transparent border border-[rgba(255,255,255,0.12)] text-[var(--text-primary)] font-medium text-sm rounded-md hover:bg-[rgba(255,255,255,0.05)] transition-all flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Export CSV
        </button>
      </div>

      <div className="bg-[var(--bg-secondary)] border border-[rgba(255,255,255,0.06)] rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[var(--text-muted)] text-sm">Payment Summary</span>
          <p className="text-lg text-[var(--text-primary)]">
            <span className="font-semibold text-[var(--status-success)]">{totalApproved}</span> total approved lines across {paymentRows.length} {paymentRows.length === 1 ? 'project' : 'projects'}
          </p>
        </div>
      </div>

      {paymentRows.length === 0 ? (
        <div className="py-12 text-center border border-[rgba(255,255,255,0.06)] rounded-xl bg-[var(--bg-secondary)]">
          <p className="text-[var(--text-muted)]">No approved lines yet.</p>
        </div>
      ) : (
        <div className="w-full bg-[var(--bg-secondary)] border border-[rgba(255,255,255,0.06)] rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.06)] bg-[var(--bg-primary)]">
                <th className="p-4 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Project</th>
                <th className="p-4 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Client</th>
                <th className="p-4 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider text-right">Approved Lines</th>
                <th className="p-4 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider text-right">Total Lines</th>
                <th className="p-4 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider text-right">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.06)]">
              {paymentRows.map((row) => (
                <tr key={row.projectId} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors group">
                  <td className="p-4">
                    <Link href={`/projects/${row.projectId}`} className="font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
                      {row.projectName}
                    </Link>
                  </td>
                  <td className="p-4 text-[var(--text-secondary)]">
                    {row.clientName}
                  </td>
                  <td className="p-4 text-right">
                    <span className="font-semibold text-[var(--status-success)]">{row.approvedLines}</span>
                  </td>
                  <td className="p-4 text-right text-[var(--text-secondary)]">
                    {row.totalLines}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <span className="text-sm text-[var(--text-secondary)]">{row.percentComplete.toFixed(0)}%</span>
                      <div className="w-16 h-1.5 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[var(--status-success)] rounded-full" 
                          style={{ width: `${Math.min(row.percentComplete, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
