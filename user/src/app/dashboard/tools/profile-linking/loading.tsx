import { Skeleton } from "@/components/ui/skeleton"

export default function ProfileLinkingLoading() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
            <div className="space-y-2">
                <Skeleton className="h-10 w-64 bg-white/5" />
                <Skeleton className="h-4 w-96 bg-white/5" />
            </div>

            <div className="grid gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-6 bg-zinc-900 border border-white/5 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Skeleton className="w-12 h-12 rounded-full bg-white/10" />
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-40 bg-white/5" />
                                <Skeleton className="h-4 w-24 bg-white/5" />
                            </div>
                        </div>
                        <Skeleton className="h-10 w-28 bg-white/5 rounded-xl" />
                    </div>
                ))}
            </div>
        </div>
    )
}
