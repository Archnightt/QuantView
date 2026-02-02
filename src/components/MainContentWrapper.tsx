"use client";

import { useSidebar } from "@/components/SidebarProvider";
import { cn } from "@/lib/utils";

export function MainContentWrapper({ children }: { children: React.ReactNode }) {
  const { isExpanded } = useSidebar();

  return (
    <main
      className={cn(
        "flex-1 transition-all duration-300 ease-in-out",
        isExpanded ? "md:pl-72" : "md:pl-32"
      )}
    >
      {children}
    </main>
  );
}
