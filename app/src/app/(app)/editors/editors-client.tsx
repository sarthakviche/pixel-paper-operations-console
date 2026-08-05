"use client";

import React from 'react';
import { Profile } from '@/types/domain.types';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export interface EditorStats {
  editor: Profile;
  activeAssignments: number;
  approvedLines: number;
}

interface EditorsClientProps {
  editors: EditorStats[];
}

export function EditorsClient({ editors }: EditorsClientProps) {
  const supabase = createClient();

  const handleInvite = async () => {
    const email = window.prompt("Enter the editor's email to invite:");
    if (!email) return;

    // This would typically go through an API route that uses the service role key
    // since auth.admin requires service role. For this mock UI we'll just log it.
    console.log('Would invite', email);
    alert(`Invitation sent to ${email}`);
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
    <div className="w-full max-w-6xl mx-auto py-8 px-4 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold text-[var(--text-primary)] tracking-tight">Editors</h1>
        <button
          onClick={handleInvite}
          className="px-4 py-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.12)] text-[var(--text-primary)] font-medium text-sm rounded-md hover:bg-[rgba(255,255,255,0.1)] transition-all flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="22" y1="11" x2="16" y2="11"></line></svg>
          Invite Editor
        </button>
      </div>

      {editors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-[rgba(255,255,255,0.12)] rounded-xl bg-[rgba(255,255,255,0.02)]">
          <div className="w-16 h-16 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center mb-4 text-[var(--text-muted)]">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <h3 className="text-lg font-medium text-[var(--text-primary)] mb-1">No editors yet</h3>
          <p className="text-[var(--text-muted)] text-sm text-center mb-6">Invite your first team member to start assigning work.</p>
          <button
            onClick={handleInvite}
            className="px-4 py-2 bg-[var(--text-primary)] text-[#000] font-medium text-sm rounded-md hover:bg-[#fff] transition-all"
          >
            Invite Editor
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block w-full bg-[var(--bg-secondary)] border border-[rgba(255,255,255,0.06)] rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.06)] bg-[var(--bg-primary)]">
                  <th className="p-4 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Editor</th>
                  <th className="p-4 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Active Assignments</th>
                  <th className="p-4 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider text-right">Approved Lines (Payment)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.06)]">
                {editors.map(({ editor, activeAssignments, approvedLines }) => (
                  <tr key={editor.id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors group">
                    <td className="p-4">
                      <Link href={`/editors/${editor.id}`} className="flex items-center gap-3 w-fit">
                        {editor.avatar_url ? (
                          <img src={editor.avatar_url} alt={editor.full_name} className="w-10 h-10 rounded-full object-cover bg-[var(--bg-primary)]" />
                        ) : (
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium text-white" style={{ backgroundColor: getAvatarColor(editor.full_name) }}>
                            {editor.full_name.charAt(0)}
                          </div>
                        )}
                        <span className="font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">{editor.full_name}</span>
                      </Link>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[rgba(255,255,255,0.05)] text-[var(--text-secondary)]">
                        {activeAssignments} Projects
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-semibold text-[var(--status-success)]">{approvedLines}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="flex flex-col gap-4 md:hidden">
            {editors.map(({ editor, activeAssignments, approvedLines }) => (
              <Link href={`/editors/${editor.id}`} key={editor.id}>
                <div className="bg-[var(--bg-secondary)] border border-[rgba(255,255,255,0.06)] rounded-xl p-4 flex flex-col gap-4 hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                  <div className="flex items-center gap-3">
                    {editor.avatar_url ? (
                      <img src={editor.avatar_url} alt={editor.full_name} className="w-12 h-12 rounded-full object-cover bg-[var(--bg-primary)]" />
                    ) : (
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-base font-medium text-white" style={{ backgroundColor: getAvatarColor(editor.full_name) }}>
                        {editor.full_name.charAt(0)}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="font-medium text-[var(--text-primary)] text-lg">{editor.full_name}</span>
                      <span className="text-sm text-[var(--text-muted)]">Editor</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-3 border-t border-[rgba(255,255,255,0.06)]">
                    <div className="flex flex-col">
                      <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">Active</span>
                      <span className="text-sm text-[var(--text-secondary)]">{activeAssignments} Projects</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">Approved</span>
                      <span className="text-base font-semibold text-[var(--status-success)]">{approvedLines} Lines</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
