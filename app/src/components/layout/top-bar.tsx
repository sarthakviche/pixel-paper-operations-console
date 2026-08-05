"use client";

import { useState } from "react";
import { Search, Bell, LogOut, User as UserIcon, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/user-context";
import { Breadcrumb, BreadcrumbItem } from "./breadcrumb";
// import { CommandPalette } from "../ui/command-palette";
// import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";

interface TopBarProps {
  breadcrumbItems?: BreadcrumbItem[];
}

export function TopBar({ breadcrumbItems }: TopBarProps) {
  const { user } = useUser();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      // const supabase = createClient();
      // await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <>
      <header className="sticky top-0 z-40 flex h-[56px] items-center justify-between bg-primary border-b border-subtle px-4 sm:px-6 shrink-0 w-full">
        <div className="flex items-center gap-4 flex-1 overflow-hidden">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        <div className="flex items-center gap-2 sm:gap-4 ml-4">
          <button
            onClick={() => setIsCommandOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary hover:bg-elevated border border-subtle hover:border-strong transition-all duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] text-muted hover:text-primary max-w-[200px]"
          >
            <Search className="h-4 w-4" />
            <span className="text-sm hidden sm:inline-block">Search...</span>
            <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-subtle bg-primary px-1.5 font-mono text-[10px] font-medium text-muted ml-4">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>

          <button className="relative p-2 rounded-full text-muted hover:text-primary hover:bg-elevated transition-colors">
            <Bell className="h-5 w-5" />
            {/* Unread badge placeholder */}
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent-primary" />
          </button>

          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center justify-center h-8 w-8 rounded-full bg-elevated border border-strong text-sm font-medium text-primary hover:border-accent-primary transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-primary"
            >
              {getInitials(user?.user_metadata?.full_name || user?.email || "User")}
            </button>

            {isProfileOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsProfileOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 rounded-md bg-elevated border border-strong shadow-lg z-50 py-1">
                  <div className="px-4 py-2 border-b border-subtle mb-1">
                    <p className="text-sm font-medium text-primary truncate">
                      {user?.user_metadata?.full_name || user?.email || "User"}
                    </p>
                    <p className="text-xs text-muted truncate">
                      {user?.email || "user@example.com"}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      router.push("/settings/profile");
                    }}
                    className="flex w-full items-center px-4 py-2 text-sm text-secondary hover:bg-secondary hover:text-primary"
                  >
                    <UserIcon className="mr-2 h-4 w-4" />
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      router.push("/settings");
                    }}
                    className="flex w-full items-center px-4 py-2 text-sm text-secondary hover:bg-secondary hover:text-primary"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center px-4 py-2 text-sm text-danger hover:bg-secondary"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 
        <CommandPalette 
          isOpen={isCommandOpen} 
          onClose={() => setIsCommandOpen(false)} 
        /> 
      */}
    </>
  );
}
