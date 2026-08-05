import { format, formatDistanceToNow, isPast, isWithinInterval, addDays, parseISO } from "date-fns";

/**
 * Format a date string as a human-readable short date.
 * e.g. "Aug 5, 2026"
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MMM d, yyyy");
}

/**
 * Format a date as a relative string.
 * e.g. "3 days ago", "in 2 weeks"
 */
export function formatRelativeDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

/**
 * Returns true if date is in the past (before today).
 */
export function isOverdue(date: string | Date | null | undefined): boolean {
  if (!date) return false;
  const d = typeof date === "string" ? parseISO(date) : date;
  return isPast(d);
}

/**
 * Returns true if date is within N days from now.
 */
export function isWithinDays(date: string | Date | null | undefined, days: number): boolean {
  if (!date) return false;
  const d = typeof date === "string" ? parseISO(date) : date;
  return isWithinInterval(d, { start: new Date(), end: addDays(new Date(), days) });
}

/**
 * Truncate text to a max length with ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

/**
 * Get initials from a full name (up to 2 characters).
 * e.g. "John Doe" → "JD"
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Generate a stable background color for an avatar based on name.
 * Returns a tailwind-compatible CSS color string.
 */
const AVATAR_COLORS = [
  "#4ADE80", "#60A5FA", "#FACC15", "#F87171",
  "#A78BFA", "#34D399", "#FB923C", "#38BDF8",
];

export function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/**
 * Pluralize a word based on count.
 * e.g. pluralize("project", 1) → "1 project"
 *      pluralize("project", 3) → "3 projects"
 */
export function pluralize(word: string, count: number, plural?: string): string {
  const pluralForm = plural ?? `${word}s`;
  return `${count} ${count === 1 ? word : pluralForm}`;
}

/**
 * Convert a snake_case string to Title Case.
 * e.g. "in_production" → "In Production"
 */
export function snakeToTitle(str: string): string {
  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Generate a unique ID (not for DB use — for UI keying).
 */
export function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}
