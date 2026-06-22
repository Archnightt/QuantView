"use client";

import { useEffect, useState } from "react";

export function MarketStatusBadge() {
  const [isOpen, setIsOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if market is open (NYSE/NASDAQ hours: 9:30 AM - 4:00 PM EST, Mon-Fri)
    const checkMarketStatus = () => {
      const now = new Date();
      // Convert to EST (UTC-5) or EDT (UTC-4)
      const estTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
      const day = estTime.getDay();
      const hours = estTime.getHours();
      const minutes = estTime.getMinutes();

      // Monday = 1, Friday = 5
      const isWeekday = day >= 1 && day <= 5;
      const timeInMinutes = hours * 60 + minutes;
      const marketOpenMinutes = 9 * 60 + 30; // 9:30 AM
      const marketCloseMinutes = 16 * 60; // 4:00 PM

      const marketOpen = isWeekday && timeInMinutes >= marketOpenMinutes && timeInMinutes < marketCloseMinutes;
      setIsOpen(marketOpen);
    };

    checkMarketStatus();
    const interval = setInterval(checkMarketStatus, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  // Prevent hydration mismatch by returning a static badge initially, or just rendering nothing/placeholder
  if (!mounted) {
    return (
      <div className="inline-flex items-center gap-2.5 rounded-full border border-transparent bg-transparent px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-transparent">
        <span className="relative flex h-2 w-2"></span>
        Loading...
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2.5 rounded-full border border-border/70 bg-card/65 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground backdrop-blur-md shadow-sm transition-colors duration-500">
      <span className="relative flex h-2 w-2">
        {isOpen ? (
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
        ) : (
          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
        )}
      </span>
      {isOpen ? "Market Open" : "Market Closed"}
    </div>
  );
}
