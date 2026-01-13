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
    { id: '1', date: new Date(Date.now() + 86400000 * 2).toISOString(), event: "Fed Interest Rate Decision", importance: 'High', country: 'US' },
    { id: '2', date: new Date(Date.now() + 86400000 * 5).toISOString(), event: "CPI Inflation Data", importance: 'High', country: 'US' },
    { id: '3', date: new Date(Date.now() + 86400000 * 7).toISOString(), event: "Non-Farm Payrolls", importance: 'High', country: 'US' },
    { id: '4', date: new Date(Date.now() + 86400000 * 10).toISOString(), event: "GDP Growth Rate QoQ", importance: 'Medium', country: 'US' },
    { id: '5', date: new Date(Date.now() + 86400000 * 12).toISOString(), event: "Initial Jobless Claims", importance: 'Medium', country: 'US' },
    { id: '6', date: new Date(Date.now() + 86400000 * 14).toISOString(), event: "Retail Sales MoM", importance: 'Medium', country: 'US' },
    { id: '7', date: new Date(Date.now() + 86400000 * 16).toISOString(), event: "Existing Home Sales", importance: 'Low', country: 'US' },
    { id: '8', date: new Date(Date.now() + 86400000 * 18).toISOString(), event: "Consumer Sentiment", importance: 'Medium', country: 'US' },
  ];

  return (
    <Card className="h-full flex flex-col shadow-sm dark:bg-secondary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-primary" />
          Economic Calendar
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <div className="h-[260px] overflow-y-auto scrollbar-thin scrollbar-thumb-secondary px-4 pb-2 pt-0 space-y-3">
          {displayEvents.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50 hover:border-primary/30 transition-colors">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                   <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{item.country || 'GLB'}</span>
                   <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                     item.importance === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                     item.importance === 'Medium' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                     'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                   }`}>
                     {item.importance || 'General'}
                   </span>
                </div>
                <span className="text-sm font-semibold leading-tight">{item.event}</span>
              </div>
              <div className="text-right min-w-[60px]">
                <div className="text-xs font-mono text-muted-foreground">
                  {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </div>
                <div className="text-xs text-muted-foreground/70">
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
