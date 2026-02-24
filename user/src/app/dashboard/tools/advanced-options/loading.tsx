import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardHeader, CardContent } from "@/components/ui/card"

export default function AdvancedToolsLoading() {
    return (
        <div className="space-y-12 pb-20 animate-pulse">
            {/* Hero Section Skeleton */}
            <div className="relative overflow-hidden rounded-3xl bg-zinc-900 border border-white/5 p-12 lg:p-20">
                <div className="max-w-2xl space-y-6">
                    <Skeleton className="h-6 w-32 bg-white/5 rounded-full" />
                    <Skeleton className="h-16 w-full bg-white/5 rounded-xl" />
                    <Skeleton className="h-24 w-full bg-white/5 rounded-xl" />
                    <div className="flex items-center gap-4 py-4">
                        <div className="h-px flex-1 bg-zinc-800" />
                        <Skeleton className="h-4 w-24 bg-white/5" />
                        <div className="h-px flex-1 bg-zinc-800" />
                    </div>
                </div>
            </div>

            {/* Features Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Card key={i} className="bg-zinc-900/50 border-white/5 h-48">
                        <CardHeader>
                            <Skeleton className="w-12 h-12 rounded-xl bg-white/10 mb-4" />
                            <div className="flex justify-between items-center mb-2">
                                <Skeleton className="h-6 w-32 bg-white/5" />
                                <Skeleton className="h-4 w-16 bg-white/5 rounded" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-4 w-full bg-white/5 mb-2" />
                            <Skeleton className="h-4 w-3/4 bg-white/5" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Newsletter Section Skeleton */}
            <div className="bg-zinc-900 border border-white/5 rounded-3xl p-12 text-center">
                <Skeleton className="h-10 w-64 bg-white/5 mx-auto mb-4" />
                <Skeleton className="h-6 w-96 bg-white/5 mx-auto mb-8" />
                <Skeleton className="h-12 w-48 bg-white/5 mx-auto rounded-full" />
            </div>
        </div>
    )
}
