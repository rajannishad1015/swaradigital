import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 bg-white/5" />
          <Skeleton className="h-4 w-24 bg-white/5" />
        </div>
        <div className="flex gap-3">
            <Skeleton className="h-10 w-10 rounded-full bg-white/5" />
            <Skeleton className="h-10 w-10 rounded-full bg-white/5" />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl bg-white/5" />
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Skeleton className="col-span-4 h-[400px] rounded-xl bg-white/5" />
        <Skeleton className="col-span-3 h-[400px] rounded-xl bg-white/5" />
      </div>
    </div>
  )
}
