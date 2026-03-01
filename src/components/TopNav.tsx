"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
    LayoutDashboard,
    Newspaper,
    LineChart,
    Settings,
    Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import Image from "next/image";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BoostPanel } from "@/components/BoostPanel";
import { useTheme } from "next-themes";
import { StockSearch } from "@/components/StockSearch";

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

export function TopNav() {
    const pathname = usePathname();
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const logoSrc = mounted && resolvedTheme === "dark" ? "/dark-logo.webp" : "/logo.webp";

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto max-w-[1600px] flex h-16 items-center justify-between px-4">

                {/* Left: Logo */}
                <div className="flex items-center gap-6 md:gap-10">
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="relative w-32 h-8">
                            {mounted && (
                                <Image
                                    fill
                                    alt="QuantView Logo"
                                    src={logoSrc}
                                    className="object-contain"
                                    priority
                                />
                            )}
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-1">
                        {routes.map((route) => {
                            const isActive = pathname === route.href;
                            return (
                                <Link
                                    key={route.href}
                                    href={route.href}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors",
                                        isActive
                                            ? cn("bg-neutral-100 dark:bg-white/10", route.color)
                                            : "text-muted-foreground hover:text-foreground hover:bg-neutral-50 dark:hover:bg-white/5"
                                    )}
                                >
                                    <route.icon className={cn("h-4 w-4", route.color)} />
                                    {route.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Right: Actions / Search / Settings */}
                <div className="flex items-center gap-4">
                    <div className="hidden md:block w-64 lg:w-80">
                        <StockSearch />
                    </div>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" className="hidden md:flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-background/50 hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors px-4">
                                <span className="text-sm font-medium">Theme</span>
                                <Settings className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-[300px] p-0 border-none bg-transparent shadow-none mt-2">
                            <div className="rounded-3xl border border-white/20 bg-white/80 dark:bg-black/60 backdrop-blur-xl shadow-2xl p-5">
                                <BoostPanel />
                            </div>
                        </PopoverContent>
                    </Popover>

                    {/* Mobile Menu Toggle */}
                    <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle mobile menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="p-0 flex flex-col pt-10 px-6">
                            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                            <div className="space-y-4">
                                {routes.map((route) => {
                                    const isActive = pathname === route.href;
                                    return (
                                        <Link
                                            key={route.href}
                                            href={route.href}
                                            onClick={() => setIsMobileOpen(false)}
                                            className={cn(
                                                "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors",
                                                isActive
                                                    ? cn("bg-neutral-100 dark:bg-white/10", route.color)
                                                    : "text-muted-foreground hover:text-foreground hover:bg-neutral-50 dark:hover:bg-white/5"
                                            )}
                                        >
                                            <route.icon className={cn("h-5 w-5", route.color)} />
                                            {route.label}
                                        </Link>
                                    );
                                })}
                            </div>
                            <div className="mt-8 pt-8 border-t border-border/50">
                                <h4 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">Appearance</h4>
                                <BoostPanel />
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

            </div>
        </header>
    );
}
