"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Newspaper,
    LineChart,
    Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BoostPanel } from "@/components/BoostPanel";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { StockSearch } from "@/components/StockSearch";

const routes = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/",
    },
    {
        label: "Market News",
        icon: Newspaper,
        href: "/news",
    },
    {
        label: "Analysis",
        icon: LineChart,
        href: "/analysis",
    },
];

export function TopNav() {
    const pathname = usePathname();
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const logoSrc = mounted && resolvedTheme === "dark" ? "/dark-logo.webp" : "/logo.webp";

    return (
        <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border/60"
            style={{ borderBottom: '1px solid hsl(var(--border) / 0.6)', boxShadow: '0 1px 0 0 hsl(var(--brand) / 0.35), 0 2px 12px 0 rgb(0 0 0 / 0.12)' }}>
            {/* Brand accent line at the very top */}
            <div className="h-[2px] w-full" style={{ background: 'linear-gradient(90deg, hsl(var(--brand)) 0%, hsl(var(--brand) / 0.3) 60%, transparent 100%)' }} />

            <div className="max-w-[98%] mx-auto px-4 h-[60px] flex items-center justify-between gap-4">

                {/* Left: Logo & Navigation */}
                <div className="flex items-center gap-8">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group shrink-0">
                        <div className="relative w-36 h-9">
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

                    {/* Nav Links */}
                    <div className="hidden md:flex items-center gap-0.5">
                        {routes.map((route) => {
                            const isActive = pathname === route.href;
                            return (
                                <Link
                                    key={route.href}
                                    href={route.href}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-medium tracking-tight transition-all duration-200",
                                        isActive
                                            ? "bg-brand/10 text-brand dark:text-brand border border-brand/20"
                                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                                    )}
                                >
                                    <route.icon className="h-3.5 w-3.5 shrink-0" />
                                    {route.label}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Right: Search / Settings */}
                <div className="flex items-center gap-3 flex-1 justify-end max-w-2xl">
                    {/* Wider Bloomberg-style search */}
                    <div className="flex-1 hidden sm:block max-w-lg">
                        <StockSearch />
                    </div>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                className="shrink-0 items-center gap-2 rounded-full border border-border/60 bg-secondary/40 hover:bg-secondary hover:border-brand/30 text-muted-foreground hover:text-foreground transition-all px-3.5 text-[13px] h-9"
                            >
                                <Settings className="h-3.5 w-3.5" />
                                <span className="font-medium">Theme</span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent
                            side="bottom"
                            align="end"
                            className="w-auto p-0 border-none bg-transparent shadow-none mt-2"
                        >
                            <div className="rounded-3xl border border-white/20 bg-white/80 dark:bg-black/80 backdrop-blur-xl shadow-2xl p-5 overflow-hidden">
                                <BoostPanel />
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        </nav>
    );
}
