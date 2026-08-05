"use client";

import { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ToastProvider } from "@/components/ui/toast";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <div className="flex h-screen w-full bg-primary overflow-hidden">
        <Sidebar />
        
        <div className="flex flex-col flex-1 min-w-0 h-full relative">
          <TopBar />
          
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 pb-24 md:pb-6 relative bg-primary text-secondary">
            {children}
          </main>
        </div>

        <BottomNav />
      </div>
    </ToastProvider>
  );
}
