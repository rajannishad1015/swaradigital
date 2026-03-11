'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Disc, DollarSign, Ticket, Clock, CheckCircle, XCircle, FileText } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { memo } from "react"

interface ActivityItem {
  id: string
  type: 'upload' | 'payout' | 'ticket'
  title: string
  status: string
  date: string
  description?: string
}

interface ActivityFeedProps {
  activities: ActivityItem[]
}

// Performance: Memoize individual activity items to prevent unnecessary re-renders
const ActivityItemComponent = memo(({ item }: { item: ActivityItem }) => {
  const getIcon = (type: string, status: string) => {
    if (type === 'upload') {
      if (status === 'approved') return <CheckCircle className="h-4 w-4 text-emerald-500" />
      if (status === 'rejected') return <XCircle className="h-4 w-4 text-rose-500" />
      return <Disc className="h-4 w-4 text-indigo-500" />
    }
    if (type === 'payout') return <DollarSign className="h-4 w-4 text-emerald-500" />
    if (type === 'ticket') return <Ticket className="h-4 w-4 text-amber-500" />
    return <FileText className="h-4 w-4 text-zinc-500" />
  }

  return (
    <div className="flex gap-4 items-start p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
      <div className="mt-1 bg-white/5 p-2 rounded-full border border-white/5">
        {getIcon(item.type, item.status)}
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex justify-between items-start">
          <p className="text-sm font-bold text-white leading-none">{item.title}</p>
          <span className="text-[10px] text-zinc-500 font-mono" suppressHydrationWarning>
            {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
          </span>
        </div>
        <p className="text-xs text-zinc-400">
          {item.type === 'upload' && `Track Status: ${item.status}`}
          {item.type === 'payout' && `Payout Request: ${item.status}`}
          {item.type === 'ticket' && `Support Ticket: ${item.status}`}
        </p>
      </div>
    </div>
  )
})

ActivityItemComponent.displayName = 'ActivityItem'

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <Card className="bg-white/[0.03] backdrop-blur-xl border-white/10 text-white">
      <CardHeader>
        <CardTitle className="text-sm font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-zinc-600" />
            </div>
            <p className="text-sm font-bold text-zinc-400 mb-2">No Activity Yet</p>
            <p className="text-xs text-zinc-600 max-w-xs mx-auto">
              Start uploading tracks, requesting payouts, or creating support tickets to see your activity here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((item) => (
              <ActivityItemComponent key={item.id} item={item} />
            ))}
          </div>
        )}
        <div className="mt-6">
          <Link
            href="/dashboard/activity"
            className="flex items-center justify-center w-full py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-all group"
          >
            View All Activity
            <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
