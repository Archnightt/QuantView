import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingDashboard() {
    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-pulse">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                <div className="w-full md:w-1/2 space-y-2">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <div className="w-full md:w-1/2 flex justify-end gap-4 z-10">
                    <Skeleton className="h-10 w-full max-w-md rounded-md" />
                </div>
            </div>

            {/* 1. Ticker Row */}
            <div className="w-full py-2 flex items-center gap-4 overflow-hidden border-b border-border/40 pb-4">
                <Skeleton className="h-4 w-32 shrink-0" />
                <Skeleton className="h-4 w-32 shrink-0" />
                <Skeleton className="h-4 w-32 shrink-0" />
                <Skeleton className="h-4 w-32 shrink-0" />
                <Skeleton className="h-4 w-32 shrink-0" />
            </div>

            {/* Grid skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[400px]">
                <div className="col-span-1 lg:col-span-3">
                    <Skeleton className="h-[200px] w-full rounded-xl" />
                </div>
                <div className="col-span-1 lg:col-span-6">
                    <Skeleton className="h-[400px] w-full rounded-xl" />
                </div>
                <div className="col-span-1 lg:col-span-3">
                    <Skeleton className="h-[400px] w-full rounded-xl" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <Skeleton className="h-[400px] w-full rounded-xl bg-card" />
            </div>
        </div>
    );
}
