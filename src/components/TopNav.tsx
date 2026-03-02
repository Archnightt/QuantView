"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Newspaper,
    LineChart,
    Settings,
    Search
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
        <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/60 backdrop-blur-xl">
            <div className="max-w-[98%] mx-auto px-4 h-16 flex items-center justify-between gap-4">

                {/* Left: Logo & Navigation */}
                <div className="flex items-center gap-8">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative w-40 h-10">
                            {mounted && (
                                <Image
                                    fill
                                    alt="Logo"
                                    src={logoSrc}
                                    className="object-contain"
                                    priority
                                />
                            )}
                        </div>
                    </Link>

                    {/* Nav Links */}
                    <div className="hidden md:flex items-center gap-1 bg-secondary/20 p-1 rounded-xl border border-white/5">
                        {routes.map((route) => {
                            const isActive = pathname === route.href;
                            return (
                                <Link
                                    key={route.href}
                                    href={route.href}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                                        isActive
                                            ? "bg-background text-primary shadow-sm border border-white/5"
                                            : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                                    )}
                                >
                                    <route.icon className="h-4 w-4" />
                                    {route.label}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Right: Actions / Search / Settings */}
                <div className="flex items-center gap-4 flex-1 justify-end max-w-xl">
                    <div className="flex-1 hidden sm:block">
                        <StockSearch />
                    </div>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                className="shrink-0 items-center gap-2 rounded-full border border-white/10 bg-background/50 hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-all px-4"
                            >
                                <span className="text-sm font-medium">Theme</span>
                                <Settings className="h-4 w-4" />
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
