"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

interface CalendarEvent {
  id: string;
  date: string;
  event: string;
  importance?: 'High' | 'Medium' | 'Low';
  country?: string;
}

export function EconomicCalendarWidget({ events }: { events: CalendarEvent[] }) {
  const displayEvents = events && events.length > 0 ? events : [
    { id: '1', date: '2026-03-09T09:00:00Z', event: "Employment Trends Index", importance: 'Medium', country: 'US' },
    { id: '2', date: '2026-03-09T10:00:00Z', event: "NYC Fed Inflation Expectations", importance: 'Medium', country: 'US' },
    { id: '3', date: '2026-03-11T08:30:00Z', event: "CPI Inflation Data (YoY)", importance: 'High', country: 'US' },
    { id: '4', date: '2026-03-12T08:30:00Z', event: "Producer Price Index (PPI)", importance: 'High', country: 'US' },
    { id: '5', date: '2026-03-12T08:30:00Z', event: "Initial Jobless Claims", importance: 'Medium', country: 'US' },
    { id: '6', date: '2026-03-13T08:30:00Z', event: "GDP Growth Rate (Q4 Update)", importance: 'High', country: 'US' },
    { id: '7', date: '2026-03-13T08:30:00Z', event: "Core PCE Price Index", importance: 'High', country: 'US' },
    { id: '8', date: '2026-03-13T10:00:00Z', event: "UoM Consumer Sentiment", importance: 'Medium', country: 'US' },
  ];

  const importanceDot: Record<string, string> = {
    High: 'bg-red-500',
    Medium: 'bg-amber-400',
    Low: 'bg-blue-400',
  };

  const importanceBadge: Record<string, string> = {
    High: 'bg-red-500/10 text-red-500 dark:text-red-400',
    Medium: 'bg-amber-400/10 text-amber-500 dark:text-amber-400',
    Low: 'bg-blue-400/10 text-blue-500 dark:text-blue-400',
  };

  return (
    <Card className="h-[400px] flex flex-col shadow-sm dark:bg-card overflow-hidden">
      <CardHeader className="pb-0 pt-4 px-4">
        <div className="flex items-center gap-2">
          <div className="w-[3px] h-4 rounded-full bg-brand shrink-0" />
          <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
            Economic Calendar
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 p-0 pt-3">
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-secondary px-3 pb-3 space-y-1.5">
          {displayEvents.map((item) => {
            const imp = item.importance || 'Low';
            return (
              <div
                key={item.id}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-secondary/20 border border-border/40 hover:border-brand/20 hover:bg-secondary/40 transition-all duration-150 group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Importance dot */}
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${importanceDot[imp] || 'bg-muted'}`} />
                  <div className="min-w-0">
                    {/* Country + importance badge */}
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] font-mono font-bold text-muted-foreground tracking-wider">
                        {item.country || 'GLB'}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0 rounded font-mono font-bold uppercase tracking-wide ${importanceBadge[imp] || ''}`}>
                        {imp}
                      </span>
                    </div>
                    {/* Event name in sans */}
                    <span className="text-[12.5px] font-sans font-medium text-foreground leading-tight line-clamp-1">
                      {item.event}
                    </span>
                  </div>
                </div>

                {/* Date + time in mono */}
                <div className="text-right shrink-0 pl-2">
                  <div className="text-[11px] font-mono font-semibold text-foreground/80 tabular" suppressHydrationWarning>
                    {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="text-[10px] font-mono text-muted-foreground tabular" suppressHydrationWarning>
                    {new Date(item.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
