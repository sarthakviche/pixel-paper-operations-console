import { parseISO, isBefore, isWithinInterval, addDays } from "date-fns";
import type { CalendarEvent, CalendarEventStatus } from "@/types/calendar.types";

/**
 * Compute the status color classification for a project deadline.
 * This logic is the single source of truth — do NOT duplicate inline in components.
 *
 * Rules (from TRD §11):
 * - overdue: deadline < today AND project.status != 'delivered'
 * - at_risk:  deadline within 3 days AND status NOT IN ('approved', 'delivered')
 * - on_track: everything else
 */
export function computeDeadlineStatus(
  deadline: string | null | undefined,
  projectStatus: string
): CalendarEventStatus {
  if (!deadline) return "on_track";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadlineDate = parseISO(deadline);

  if (isBefore(deadlineDate, today) && projectStatus !== "delivered") {
    return "overdue";
  }

  const isNearlyDue = isWithinInterval(deadlineDate, {
    start: today,
    end: addDays(today, 3),
  });

  if (isNearlyDue && !["approved", "delivered"].includes(projectStatus)) {
    return "at_risk";
  }

  return "on_track";
}

/**
 * Get the color CSS variable for a given calendar event status.
 */
export function getStatusColor(status: CalendarEventStatus): string {
  switch (status) {
    case "overdue":  return "var(--status-danger)";
    case "at_risk":  return "var(--status-warning)";
    case "on_track": return "var(--status-success)";
  }
}

/**
 * Get a human-readable label for a calendar event status.
 */
export function getStatusLabel(status: CalendarEventStatus): string {
  switch (status) {
    case "overdue":  return "Overdue";
    case "at_risk":  return "At Risk";
    case "on_track": return "On Track";
  }
}

/**
 * Group a flat array of CalendarEvents by their date (YYYY-MM-DD).
 */
export function groupEventsByDate(
  events: CalendarEvent[]
): Map<string, CalendarEvent[]> {
  const map = new Map<string, CalendarEvent[]>();
  for (const event of events) {
    const key = event.date.slice(0, 10); // normalize to YYYY-MM-DD
    const existing = map.get(key) ?? [];
    map.set(key, [...existing, event]);
  }
  return map;
}

/**
 * Get all days in a given month as Date objects.
 */
export function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

/**
 * Get the first day of the week (0=Sun) for the month grid start.
 */
export function getMonthGridStart(year: number, month: number): Date {
  const firstDay = new Date(year, month, 1);
  const dayOfWeek = firstDay.getDay();
  const start = new Date(firstDay);
  start.setDate(start.getDate() - dayOfWeek);
  return start;
}
