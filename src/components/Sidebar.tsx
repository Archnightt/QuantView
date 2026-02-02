"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
    color: "text-gray-400",
    bgColor: "bg-gray-400/10",
  },
];

interface MobileSidebarContentProps {
  pathname: string;
  onClose: () => void;
}

const MobileSidebarContent = ({ pathname, onClose }: MobileSidebarContentProps) => (
  <div className="h-full flex flex-col py-4">
    <div className="px-3 py-2 flex-1">
      <Link href="/" className="flex items-center pl-3 mb-14" onClick={onClose}>
        <div className="relative w-8 h-8 mr-4">
           <Image fill alt="Logo" src="/logo.png" className="rounded-full object-cover" />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-sky-500 to-violet-500 bg-clip-text text-transparent">
          AlphaDesk
        </h1>
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

export function Sidebar() {
  const pathname = usePathname();
  const { isExpanded, toggleSidebar } = useSidebar();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
		<>
			{/* Desktop Floating Sidebar */}
			<div
				className={cn(
					"hidden md:flex flex-col justify-between fixed left-4 top-4 bottom-4 z-50",
					"bg-[#f8f8f8] dark:bg-neutral-900 border border-neutral-200 dark:border-white/5",
					"rounded-[1.5rem] overflow-hidden",
					"transition-[width] duration-300 ease-in-out",
					isExpanded ? "w-64" : "w-24"
				)}>
				{/* Top Section: Logo */}
				<div className="flex flex-col items-center py-8 px-4">
					<Link href="/" className="flex items-center w-full group">
						<div className="w-16 shrink-0 flex items-center justify-center">
							<div className="relative w-12 h-12">
								<Image fill alt="Logo" src="/logo.png" className="rounded-2xl object-cover shadow-lg" />
							</div>
						</div>
						<div className={cn("overflow-hidden transition-all duration-300 whitespace-nowrap", isExpanded ? "opacity-100 ml-4 w-auto" : "opacity-0 w-0")}>
							<h1 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">AlphaDesk</h1>
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
				<div className="ml-4 font-bold text-xl bg-gradient-to-r from-sky-500 to-violet-500 bg-clip-text text-transparent">AlphaDesk</div>
			</div>
		</>
	);
}