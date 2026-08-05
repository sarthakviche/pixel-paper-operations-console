"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/cn';
import { CalendarEvent } from '@/types/calendar.types';
import { getStatusColor, getStatusLabel } from '@/lib/calendar-utils';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface CalendarViewProps {
  scope: 'master' | 'client' | 'project';
  events: CalendarEvent[];
  defaultView?: 'month' | 'agenda';
  className?: string;
}

export function CalendarView({ scope, events, defaultView, className }: CalendarViewProps) {
  const [currentView, setCurrentView] = useState<'month' | 'agenda'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (window.innerWidth < 768) {
      setCurrentView('agenda');
    } else {
      setCurrentView(defaultView || 'month');
    }
  }, [defaultView]);

  const getClientColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    
    const days = [];
    // Previous month days
    for (let i = 0; i < firstDay; i++) {
      const prevDate = new Date(year, month, -firstDay + i + 1);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    // Next month days to fill 42 cells (6 rows)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    return days;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear();
    });
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToday = () => {
    setCurrentDate(new Date());
  };

  const [expandedDate, setExpandedDate] = useState<Date | null>(null);

  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate);
    const today = new Date();

    return (
      <div className="flex flex-col w-full bg-[var(--bg-secondary)] rounded-xl border border-[rgba(255,255,255,0.06)] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[rgba(255,255,255,0.06)]">
          <div className="text-lg font-medium text-[var(--text-primary)]">
            {currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={goToday} className="px-3 py-1.5 text-sm rounded-md bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] transition-colors text-[var(--text-primary)]">Today</button>
            <button onClick={prevMonth} className="p-1.5 rounded-md hover:bg-[rgba(255,255,255,0.05)] text-[var(--text-secondary)]"><ChevronLeft size={18} /></button>
            <button onClick={nextMonth} className="p-1.5 rounded-md hover:bg-[rgba(255,255,255,0.05)] text-[var(--text-secondary)]"><ChevronRight size={18} /></button>
          </div>
        </div>
        <div className="grid grid-cols-7 w-full border-b border-[rgba(255,255,255,0.06)] bg-[var(--bg-primary)]">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-2 text-center text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 w-full">
          {days.map((dayObj, i) => {
            const dayEvents = getEventsForDate(dayObj.date);
            const isToday = dayObj.date.getDate() === today.getDate() && dayObj.date.getMonth() === today.getMonth() && dayObj.date.getFullYear() === today.getFullYear();
            const isExpanded = expandedDate?.getTime() === dayObj.date.getTime();

            return (
              <div
                key={i}
                onClick={() => dayEvents.length > 0 && setExpandedDate(isExpanded ? null : dayObj.date)}
                className={cn(
                  "min-h-[100px] p-2 border-r border-b border-[rgba(255,255,255,0.06)] transition-colors relative",
                  dayEvents.length > 0 ? "cursor-pointer hover:bg-[rgba(255,255,255,0.02)]" : "",
                  !dayObj.isCurrentMonth && "opacity-40",
                  isToday && "ring-1 ring-inset ring-[var(--accent-primary)]"
                )}
              >
                <div className={cn("text-sm font-medium mb-1", isToday ? "text-[var(--accent-primary)]" : "text-[var(--text-secondary)]")}>
                  {dayObj.date.getDate()}
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {dayEvents.map((evt, j) => (
                    <div key={j} className="w-2 h-2 rounded-full" style={{ backgroundColor: getStatusColor(evt.status) }} title={evt.title} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        {expandedDate && (
          <div className="p-4 bg-[var(--bg-elevated)] border-t border-[rgba(255,255,255,0.06)]">
            <h4 className="text-sm font-medium text-[var(--text-primary)] mb-3">
              Events for {expandedDate.toLocaleDateString()}
            </h4>
            <div className="flex flex-col gap-2">
              {getEventsForDate(expandedDate).map((evt, i) => (
                <Link href={evt.href} key={i}>
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: getStatusColor(evt.status) }} />
                    <div className="flex flex-col">
                      <span className="text-sm text-[var(--text-primary)] font-medium">{evt.title}</span>
                      {scope === 'master' && evt.clientName && (
                        <span className="text-xs text-[var(--text-secondary)]">Client: {evt.clientName}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAgendaView = () => {
    // Group events by day
    const grouped = events.reduce((acc, event) => {
      const dateStr = new Date(event.date).toLocaleDateString();
      if (!acc[dateStr]) acc[dateStr] = [];
      acc[dateStr].push(event);
      return acc;
    }, {} as Record<string, CalendarEvent[]>);

    const sortedDates = Object.keys(grouped).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    if (sortedDates.length === 0) {
      return (
        <div className="py-12 text-center border border-[rgba(255,255,255,0.06)] rounded-xl bg-[var(--bg-secondary)]">
          <p className="text-[var(--text-muted)]">No upcoming deadlines.</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-6">
        {sortedDates.map(dateStr => (
          <div key={dateStr} className="flex flex-col gap-3">
            <div className="text-sm font-medium text-[var(--text-muted)]">
              {formatDate(new Date(dateStr))}
            </div>
            <div className="flex flex-col gap-2">
              {grouped[dateStr].map((evt, i) => (
                <Link href={evt.href} key={i}>
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.04)] transition-all">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: getStatusColor(evt.status) }} />
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-base text-[var(--text-primary)] font-medium truncate">{evt.title}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-[var(--text-secondary)]">{getStatusLabel(evt.status)}</span>
                        {scope === 'master' && evt.clientName && (
                          <>
                            <span className="text-[var(--text-muted)] text-xs">•</span>
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getClientColor(evt.clientName) }} />
                              <span className="text-xs text-[var(--text-secondary)] truncate">{evt.clientName}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={cn("w-full flex flex-col gap-4", className)}>
      <div className="hidden md:flex items-center justify-end">
        <div className="flex bg-[rgba(255,255,255,0.05)] p-1 rounded-lg">
          <button
            onClick={() => setCurrentView('month')}
            className={cn("px-4 py-1.5 text-sm font-medium rounded-md transition-colors", currentView === 'month' ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]")}
          >
            Month
          </button>
          <button
            onClick={() => setCurrentView('agenda')}
            className={cn("px-4 py-1.5 text-sm font-medium rounded-md transition-colors", currentView === 'agenda' ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]")}
          >
            Agenda
          </button>
        </div>
      </div>
      
      {currentView === 'month' ? renderMonthView() : renderAgendaView()}
    </div>
  );
}
