import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "lucide-react"
import { ActivityFeed } from "@/components/activity-feed"
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function ActivityPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return <div>Log in required</div>
  }

  // Fetch all activity types
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isLabel = profile?.role === 'label'
  
  let artistIds: string[] = []
  if (isLabel) {
    const { data: managed } = await supabase.from('profiles').select('id').eq('label_id', user.id)
    artistIds = managed?.map(a => a.id) || []
  }

  // Setup queries
  let trackQuery = supabase.from('tracks').select('*, albums(title, type)')
  let ticketQuery = supabase.from('tickets').select('*')
  
  if (isLabel) {
    trackQuery = trackQuery.in('artist_id', artistIds)
    ticketQuery = ticketQuery.in('user_id', artistIds)
  } else {
    trackQuery = trackQuery.eq('artist_id', user.id)
    ticketQuery = ticketQuery.eq('user_id', user.id)
  }

  const { data: tracks } = await trackQuery.order('created_at', { ascending: false })
  const { data: payouts } = await supabase.from('payout_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
  const { data: tickets } = await ticketQuery.order('created_at', { ascending: false })

  const activities = [
    ...(tracks?.map(t => ({ id: t.id, type: 'upload' as const, title: `Uploaded ${t.title}`, status: t.status, date: t.created_at, description: t.artist })) || []),
    ...(payouts?.map(p => ({ id: p.id, type: 'payout' as const, title: `Payout Request ($${p.amount})`, status: p.status, date: p.created_at })) || []),
    ...(tickets?.map(t => ({ id: t.id, type: 'ticket' as const, title: `Support Ticket: ${t.subject}`, status: t.status, date: t.created_at })) || [])
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-white">Activity Ledger</h2>
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-[0.2em] mt-2">Comprehensive System Logs</p>
        </div>
        <Link href="/dashboard">
          <Button variant="ghost" className="text-zinc-500 hover:text-white font-bold text-[10px] uppercase tracking-widest">
            ← Back to Overview
          </Button>
        </Link>
      </div>

      <div className="grid gap-6">
        <ActivityFeed activities={activities} />
      </div>
    </div>
  )
}
