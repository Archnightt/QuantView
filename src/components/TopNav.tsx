"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
    BarChart3,
    LayoutDashboard,
    Moon,
    Newspaper,
    Sun,
    Search,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StockSearch } from "./StockSearch";

const routes = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/",
    },
    {
        label: "News",
        icon: Newspaper,
        href: "/news",
    },
    {
        label: "Analysis",
        icon: BarChart3,
        href: "/analysis",
    },
];

export function TopNav() {
    const pathname = usePathname();
    const { resolvedTheme, setTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            
            // Only apply hide logic if we've scrolled past the initial sticky threshold (e.g. 50px)
            if (currentScrollY > 50) {
                if (currentScrollY > lastScrollY) {
                    setIsVisible(false); // scrolling down
                } else {
                    setIsVisible(true);  // scrolling up
                }
            } else {
                setIsVisible(true); // always show at the very top
            }
            
            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    return (
        <>
            {/* Static Header (Absolute so it scrolls away) */}
            <div className="absolute left-0 right-0 top-6 z-40 pointer-events-none">
                <div className="mx-auto flex h-12 max-w-[1440px] items-center justify-between px-4 md:px-8">
                    <Link
                        href="/"
                        className="group flex min-w-0 items-center gap-3 transition-opacity hover:opacity-80 pointer-events-auto"
                        aria-label="QuantView dashboard"
                    >
                        <Image
                            src="/dark-alt-logo.webp"
                            alt="QuantView"
                            width={32}
                            height={32}
                            className="hidden dark:block h-8 w-8 shrink-0 object-contain"
                        />
                        <Image
                            src="/alt-logo.webp"
                            alt="QuantView"
                            width={32}
                            height={32}
                            className="block dark:hidden h-8 w-8 shrink-0 object-contain"
                        />
                        <span className="hidden min-w-0 sm:block">
                            <span className="block text-sm font-bold leading-none tracking-tight text-foreground">
                                QuantView
                            </span>
                            <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                                Market desk
                            </span>
                        </span>
                    </Link>

                    <button
                        onClick={() => setTheme(isDark ? "light" : "dark")}
                        className="relative flex h-7 w-14 shrink-0 cursor-pointer items-center rounded-full transition-all duration-300 bg-[#e5e5e5] shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] dark:bg-[#2a2a2b] dark:shadow-none pointer-events-auto"
                        title="Toggle theme"
                        aria-label="Toggle theme"
                    >
                        <div
                            className="absolute left-[2px] top-[2px] z-10 h-6 w-6 rounded-full transition-transform duration-300 translate-x-7 bg-[#333333] shadow-md dark:translate-x-0 dark:bg-white dark:shadow-sm"
                        />
                        <div className="relative flex w-full items-center justify-between px-1.5">
                            <Sun className="h-3.5 w-3.5 transition-opacity duration-300 text-[#333333] opacity-100 dark:opacity-0" strokeWidth={2.5} />
                            <Moon className="h-3.5 w-3.5 transition-opacity duration-300 opacity-0 dark:text-white dark:opacity-100" strokeWidth={2.5} />
                        </div>
                        <span className="sr-only">Toggle theme</span>
                    </button>
                </div>
            </div>

            {/* Floating Navigation Pill */}
            <div className={cn(
                "sticky top-6 z-50 mt-6 mb-1 flex h-12 w-full items-center justify-center px-4 pointer-events-none transition-all duration-300 ease-in-out",
                isVisible ? "translate-y-0 opacity-100" : "-translate-y-24 opacity-0"
            )}>
                <div className="pointer-events-auto flex items-center justify-center p-1.5 gap-2 rounded-full border border-border/70 bg-card/70 shadow-sm shadow-black/5 backdrop-blur-xl dark:bg-card/62 dark:shadow-black/20">
                    <nav className="flex items-center justify-center gap-1">
                        {routes.map((route) => {
                            const isActive = pathname === route.href;

                            return (
                                <Link
                                    key={route.href}
                                    href={route.href}
                                    className={cn(
                                        "inline-flex h-9 shrink-0 items-center gap-2 rounded-full px-3.5 text-xs font-bold transition-colors",
                                        isActive
                                            ? "bg-foreground text-background shadow-sm"
                                            : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                                    )}
                                >
                                    <route.icon className="h-3.5 w-3.5" />
                                    <span>{route.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <StockSearch
                        enableShortcut={false}
                        customTrigger={(open) => (
                            <button
                                onClick={open}
                                aria-label="Search"
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white dark:bg-zinc-800 shadow-sm transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700 ml-1.5"
                            >
                                <Search className="h-4 w-4 text-foreground" />
                            </button>
                        )}
                    />
                </div>
            </div>
        </>
    );
}
