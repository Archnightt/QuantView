"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Newspaper,
  LineChart,
  Settings,
  ChevronRight,
  ChevronLeft,
  Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import Image from "next/image";
import { useSidebar } from "@/components/SidebarProvider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BoostPanel } from "@/components/BoostPanel";
import { useTheme } from "next-themes";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
    color: "text-sky-500",
    bgColor: "bg-sky-500/10",
  },
  {
    label: "Market News",
    icon: Newspaper,
    href: "/news",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
  },
  {
    label: "Analysis",
    icon: LineChart,
    href: "/analysis",
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
  },
];

interface MobileSidebarContentProps {
  pathname: string;
  onClose: () => void;
}

const MobileSidebarContent = ({ pathname, onClose }: MobileSidebarContentProps) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="h-full flex flex-col py-4">
      <div className="px-3 py-2 flex-1">
        <Link href="/" className="flex items-center pl-3 mb-14" onClick={onClose}>
          <div className="relative w-40 h-10">
            {mounted && (
              <Image
                fill
                alt="Logo"
                src={resolvedTheme === "dark" ? "/dark-logo.webp" : "/logo.webp"}
                className="object-contain"
              />
            )}
          </div>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              onClick={onClose}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
                pathname === route.href ? cn("text-primary bg-primary/10", route.bgColor, route.color) : "text-muted-foreground"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export function Sidebar() {
  const pathname = usePathname();
  const { isExpanded, toggleSidebar } = useSidebar();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logoSrc = isExpanded
    ? (mounted && resolvedTheme === "dark" ? "/dark-logo.webp" : "/logo.webp")
    : (mounted && resolvedTheme === "dark" ? "/dark-alt-logo.webp" : "/alt-logo.webp");

  return (
    <>
      {/* Desktop Floating Sidebar */}
      <div
        className={cn(
          "hidden md:flex flex-col justify-between fixed left-4 top-4 bottom-4 z-50",
          "bg-card border border-neutral-200 dark:border-white/5",
          "rounded-[1.5rem] overflow-hidden",
          "transition-[width] duration-300 ease-in-out",
          isExpanded ? "w-64" : "w-24"
        )}>
        {/* Top Section: Logo */}
        <div className="flex flex-col items-center py-8 px-2">
          <Link href="/" className="flex items-center justify-center w-full group">
            <div className={cn("relative transition-all duration-300 flex items-center justify-center", isExpanded ? "w-48 h-12" : "w-12 h-12")}>
              {mounted && (
                <Image
                  fill
                  alt="Logo"
                  src={logoSrc}
                  className={cn("object-contain transition-all duration-300", !isExpanded && "rounded-2xl")}
                  priority
                />
              )}
            </div>
          </Link>
        </div>

        {/* Middle Section: Navigation */}
        <div className="flex-1 flex flex-col gap-3 px-4 py-4">
          {routes.map((route) => {
            const isActive = pathname === route.href;
            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "group flex items-center h-14 rounded-2xl transition-all duration-300 overflow-hidden",
                  "hover:bg-neutral-100 dark:hover:bg-white/5",
                  isActive ? cn(route.bgColor, "shadow-sm") : "text-neutral-500 dark:text-neutral-400"
                )}>
                <div className="w-16 shrink-0 flex items-center justify-center">
                  <route.icon className={cn("h-6 w-6 transition-colors", isActive ? route.color : "group-hover:text-neutral-900 dark:group-hover:text-white")} />
                </div>
                <div className={cn("overflow-hidden transition-all duration-300 whitespace-nowrap", isExpanded ? "opacity-100 ml-4 w-auto" : "opacity-0 w-0")}>
                  <span className={cn("text-sm font-semibold", isActive ? route.color : "group-hover:text-neutral-900 dark:group-hover:text-white")}>{route.label}</span>
                </div>
              </Link>
            );
          })}

          {/* Settings / Boost Trigger */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "group flex items-center h-14 rounded-2xl transition-all duration-300 overflow-hidden w-full text-left",
                  "hover:bg-neutral-100 dark:hover:bg-white/5",
                  "text-neutral-500 dark:text-neutral-400"
                )}>
                <div className="w-16 shrink-0 flex items-center justify-center">
                  <Settings className="h-6 w-6 transition-colors group-hover:text-neutral-900 dark:group-hover:text-white" />
                </div>
                <div className={cn("overflow-hidden transition-all duration-300 whitespace-nowrap", isExpanded ? "opacity-100 ml-4 w-auto" : "opacity-0 w-0")}>
                  <span className="text-sm font-semibold group-hover:text-neutral-900 dark:group-hover:text-white">Customize</span>
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent side="right" align="start" className="w-auto p-0 border-none bg-transparent shadow-none ml-4">
              <div className="rounded-3xl border border-white/20 bg-white/80 dark:bg-black/60 backdrop-blur-xl shadow-2xl p-5">
                <BoostPanel />
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Bottom Section: Toggle */}
        <div className="p-4 flex flex-col gap-4">
          {/* Expand Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="w-full h-12 rounded-2xl hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors flex items-center justify-center">
            {isExpanded ? <ChevronLeft className="h-6 w-6" /> : <ChevronRight className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className="md:hidden flex items-center p-4 border-b bg-background sticky top-0 z-50">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>
            <MobileSidebarContent pathname={pathname} onClose={() => setIsMobileOpen(false)} />
          </SheetContent>
        </Sheet>
        <div className="ml-4 flex items-center">
          {mounted && (
            <div className="relative w-32 h-8">
              <Image
                fill
                alt="Logo"
                src={resolvedTheme === "dark" ? "/dark-logo.webp" : "/logo.webp"}
                className="object-contain"
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}