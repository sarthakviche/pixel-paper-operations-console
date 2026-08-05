// ─────────────────────────────────────────────────────
// CALENDAR EVENT TYPES
// Used by the shared CalendarView component.
// Status computation lives in lib/calendar-utils.ts — not in components.
// ─────────────────────────────────────────────────────

export type CalendarEventStatus = "on_track" | "at_risk" | "overdue";

export type CalendarScope = "master" | "client" | "project";

export type CalendarViewMode = "month" | "agenda";

export interface CalendarEvent {
  id: string;
  /** Project name or milestone label — shown in the event slot */
  title: string;
  /** ISO date string (YYYY-MM-DD or full ISO) */
  date: string;
  /** Computed status used for color-coding */
  status: CalendarEventStatus;
  /** For master-scope color-coding by client */
  clientName?: string;
  /** Link to the relevant project or client screen */
  href: string;
}
