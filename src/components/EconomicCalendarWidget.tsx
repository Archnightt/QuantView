"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

interface CalendarEvent {
  id: string;
  date: string; // ISO date string or formatted time
  event: string;
  importance?: 'High' | 'Medium' | 'Low';
  country?: string;
}

export function EconomicCalendarWidget({ events }: { events: CalendarEvent[] }) {
  // Fallback if no real data is passed (likely due to API limitations)
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

  return (
    <Card className="h-[400px] flex flex-col shadow-sm dark:bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-primary" />
          Economic Calendar
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 p-0">
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-secondary px-4 pb-4 space-y-3">
          {displayEvents.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-background/50 border border-border/50 hover:border-primary/30 transition-colors">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{item.country || 'GLB'}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${item.importance === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    item.importance === 'Medium' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                    {item.importance || 'General'}
                  </span>
                </div>
                <span className="text-sm font-semibold leading-tight">{item.event}</span>
              </div>
              <div className="text-right min-w-[60px]">
                <div className="text-xs font-mono text-muted-foreground" suppressHydrationWarning>
                  {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </div>
                <div className="text-xs text-muted-foreground/70" suppressHydrationWarning>
                  {new Date(item.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
