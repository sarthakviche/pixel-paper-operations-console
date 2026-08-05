"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  CheckSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/cn";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Clients", href: "/clients", icon: Building2 },
  { name: "Editors", href: "/editors", icon: Users },
  { name: "Approvals", href: "/approvals", icon: CheckSquare },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("pp_sidebar_expanded");
    if (stored !== null) {
      setIsExpanded(stored === "true");
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    localStorage.setItem("pp_sidebar_expanded", String(newState));
  };

  if (!mounted) {
    return (
      <aside className="hidden md:flex flex-col h-screen border-r border-strong bg-primary w-[240px] shrink-0" />
    );
  }

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col h-screen border-r border-strong bg-primary transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] shrink-0",
        isExpanded ? "w-[240px]" : "w-[72px]"
      )}
    >
      {/* Brand Header */}
      <div className="h-[56px] flex items-center justify-center border-b border-subtle shrink-0">
        {isExpanded ? (
          <div className="flex flex-col items-center">
            <h1 className="text-primary font-bold text-lg leading-tight">
              Pixel <span className="text-accent-primary">&amp;</span> Paper
            </h1>
            <span className="text-muted text-[10px] uppercase tracking-widest">
              Operations
            </span>
          </div>
        ) : (
          <h1 className="text-primary font-bold text-xl">
            P<span className="text-accent-primary">&amp;</span>P
          </h1>
        )}
      </div>

      {/* Nav Links */}
      <div className="flex-1 py-4 flex flex-col gap-2 overflow-y-auto px-3">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center rounded-md transition-all duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] h-10 group",
                isActive
                  ? "bg-elevated border-l-2 border-accent-primary text-primary"
                  : "text-muted hover:bg-elevated hover:text-primary border-l-2 border-transparent",
                isExpanded ? "px-3 justify-start" : "justify-center"
              )}
              title={!isExpanded ? item.name : undefined}
            >
              <Icon
                className={cn(
                  "shrink-0",
                  isActive ? "text-accent-primary" : "text-muted group-hover:text-primary",
                  isExpanded ? "mr-3 h-5 w-5" : "h-5 w-5"
                )}
              />
              {isExpanded && <span className="font-medium text-sm">{item.name}</span>}
            </Link>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-subtle flex flex-col gap-2 shrink-0">
        <Link
          href="/settings"
          className={cn(
            "flex items-center rounded-md transition-all duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] h-10 group",
            pathname.startsWith("/settings")
              ? "bg-elevated border-l-2 border-accent-primary text-primary"
              : "text-muted hover:bg-elevated hover:text-primary border-l-2 border-transparent",
            isExpanded ? "px-3 justify-start" : "justify-center"
          )}
          title={!isExpanded ? "Settings" : undefined}
        >
          <Settings
            className={cn(
              "shrink-0",
              pathname.startsWith("/settings") ? "text-accent-primary" : "text-muted group-hover:text-primary",
              isExpanded ? "mr-3 h-5 w-5" : "h-5 w-5"
            )}
          />
          {isExpanded && <span className="font-medium text-sm">Settings</span>}
        </Link>
        <button
          onClick={toggleSidebar}
          className={cn(
            "flex items-center rounded-md text-muted hover:text-primary hover:bg-elevated transition-all duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] h-10 border-l-2 border-transparent",
            isExpanded ? "px-3 justify-start" : "justify-center"
          )}
          title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {isExpanded ? (
            <>
              <ChevronLeft className="h-5 w-5 mr-3 shrink-0" />
              <span className="font-medium text-sm">Collapse</span>
            </>
          ) : (
            <ChevronRight className="h-5 w-5 shrink-0" />
          )}
        </button>
      </div>
    </aside>
  );
}
