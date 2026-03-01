"use client";

import { cn } from "@/lib/utils";

export function MainContentWrapper({ children }: { children: React.ReactNode }) {
  return (
    <main
      className={cn(
        "flex-1 w-full flex flex-col min-h-screen"
      )}
    >
      {children}
    </main>
  );
}
