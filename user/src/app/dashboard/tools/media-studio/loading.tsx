import { Skeleton } from "@/components/ui/skeleton"

export default function MediaStudioLoading() {
    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-pulse">
            {/* Header Skeleton */}
            <div className="p-10 bg-zinc-900/50 border border-zinc-800 rounded-3xl relative overflow-hidden">
                <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <Skeleton className="w-12 h-12 bg-white/5 rounded-xl" />
                            <Skeleton className="h-10 w-64 bg-white/5" />
                        </div>
                        <Skeleton className="h-6 w-96 bg-white/5" />
                    </div>
                    
                    <Skeleton className="h-14 w-80 bg-zinc-950 rounded-2xl border border-zinc-800" />
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Main Content Skeleton */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-24 rounded-2xl bg-zinc-900/30 border border-zinc-900" />
                        ))}
                    </div>

                    <Skeleton className="h-48 rounded-3xl border-2 border-dashed border-zinc-800 bg-zinc-900/10" />

                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <Skeleton className="h-4 w-32 bg-white/5" />
                            <Skeleton className="h-10 w-32 bg-white/5 rounded-xl" />
                        </div>
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-24 rounded-2xl bg-zinc-900/40 border border-zinc-800" />
                        ))}
                    </div>
                </div>

                {/* Sidebar Controls Skeleton */}
                <div className="space-y-6">
                    <div className="p-8 bg-zinc-900 rounded-3xl space-y-8 border border-white/5 h-[600px]">
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-48 bg-white/5" />
                            <Skeleton className="h-4 w-full bg-white/5" />
                        </div>
                        <div className="space-y-6">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full bg-white/5 rounded-xl" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
LineNumber: 1
