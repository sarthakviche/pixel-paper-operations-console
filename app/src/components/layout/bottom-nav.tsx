"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Building2, Users, CheckSquare } from "lucide-react";
import { cn } from "@/lib/cn";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Clients", href: "/clients", icon: Building2 },
  { name: "Editors", href: "/editors", icon: Users },
  { name: "Approvals", href: "/approvals", icon: CheckSquare },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-secondary border-t border-subtle pb-safe z-50">
      <div className="flex items-center justify-around h-full px-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200",
                isActive ? "text-accent-primary" : "text-muted hover:text-primary"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "text-accent-primary")} />
              <span className="text-[10px] font-medium leading-none">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
