"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const pathname = usePathname();

  // If explicit items provided, use them
  if (items && items.length > 0) {
    return (
      <nav aria-label="Breadcrumb" className="flex items-center space-x-1 sm:space-x-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <div key={index} className="flex items-center">
              {index > 0 && <ChevronRight className="h-3 w-3 text-muted mx-1 sm:mx-2 flex-shrink-0" />}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="text-sm font-medium text-muted hover:text-primary transition-colors duration-200 truncate max-w-[120px] sm:max-w-xs"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    "text-sm font-medium truncate max-w-[120px] sm:max-w-xs",
                    isLast ? "text-primary" : "text-muted"
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </div>
          );
        })}
      </nav>
    );
  }

  // Fallback to path-based generation
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  const generatedItems: BreadcrumbItem[] = [];
  let currentPath = "";

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    let label = segment.charAt(0).toUpperCase() + segment.slice(1);
    
    // Check if it's likely an ID (e.g. dynamic segment)
    if (segment.length > 12 || /^[0-9a-fA-F-]+$/.test(segment)) {
        label = segment.substring(0, 8) + "...";
    }

    generatedItems.push({
      label,
      href: currentPath,
    });
  });

  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-1 sm:space-x-2">
      {generatedItems.map((item, index) => {
        const isLast = index === generatedItems.length - 1;
        return (
          <div key={index} className="flex items-center">
            {index > 0 && <ChevronRight className="h-3 w-3 text-muted mx-1 sm:mx-2 flex-shrink-0" />}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-sm font-medium text-muted hover:text-primary transition-colors duration-200 truncate max-w-[100px] sm:max-w-xs"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  "text-sm font-medium truncate max-w-[100px] sm:max-w-xs",
                  isLast ? "text-primary" : "text-muted"
                )}
                aria-current={isLast ? "page" : undefined}
              >
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
