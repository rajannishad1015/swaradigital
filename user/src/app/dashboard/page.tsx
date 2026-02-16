import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { UploadCloud } from 'lucide-react'
import TrackList from './track-list'
import RevenueCard from '@/components/revenue-card'
import DashboardHome from '@/components/dashboard-home'

export default async function DashboardPage({ searchParams }: { searchParams: { artistId?: string } }) {
  const awaitedParams = await searchParams
  const artistId = awaitedParams.artistId as string
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return <div>Log in required</div>
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, balance, artist_name, bank_name, account_number, ifsc_code, paypal_email, upi_id')
    .eq('id', user.id)
    .single()

  const isLabel = profile?.role === 'label'

  let artistIds: string[] = []
  let managedArtists: { id: string, balance: number }[] = []
  if (isLabel) {
    const { data: artistList } = await supabase
        .from('profiles')
        .select('id, balance')
        .eq('label_id', user.id)
    managedArtists = artistList?.map(a => ({ id: a.id, balance: Number(a.balance || 0) })) || []
    artistIds = managedArtists.map(a => a.id)
  }

  // Setup queries
  let trackQuery = supabase.from('tracks').select('*, albums(cover_art_url, title)')
  let ticketQuery = supabase.from('tickets').select('*', { count: 'exact', head: true }).in('status', ['open', 'in_progress'])

  if (artistId) {
      trackQuery = trackQuery.eq('artist_id', artistId)
      ticketQuery = ticketQuery.eq('user_id', artistId)
  } else if (isLabel) {
      trackQuery = trackQuery.in('artist_id', artistIds)
      ticketQuery = ticketQuery.in('user_id', artistIds)
  } else {
      trackQuery = trackQuery.eq('artist_id', user.id)
      ticketQuery = ticketQuery.eq('user_id', user.id)
  }

  // Wrap database queries in try-catch for safety
  let payouts: any[] = []
  let tracks: any[] = []
  let ticketCount = 0
  let tickets: any[] = []

  try {
    const { data: payoutData } = await supabase.from('payout_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    payouts = payoutData || []

    const { data: trackData } = await trackQuery.order('created_at', { ascending: false })
    tracks = trackData || []

    const { count, data: ticketData } = await ticketQuery
    ticketCount = count || 0
    tickets = ticketData || []
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    // Continue with empty arrays - dashboard will show empty states
  }

  // 3. Aggregate Stats
  const allTracks = tracks || []
  const totalReleases = allTracks.length
  const approvedCount = allTracks.filter(t => t?.status === 'approved').length
  
  // Status Counts (with null safety)
  const statusCounts = [
      { status: 'approved', count: approvedCount },
      { status: 'rejected', count: allTracks.filter(t => t?.status === 'rejected').length },
      { status: 'pending', count: allTracks.filter(t => t?.status === 'pending').length },
      { status: 'draft', count: allTracks.filter(t => t?.status === 'draft').length },
  ]

  // Genre Counts (Top 5) with null safety
  const genreMap = new Map<string, number>()
  allTracks.forEach(t => {
      if (t?.genre && typeof t.genre === 'string') {
          genreMap.set(t.genre, (genreMap.get(t.genre) || 0) + 1)
      }
  })
  
  const genres = Array.from(genreMap.entries())
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Fallback if no genres - provide placeholder data for charts
  if (genres.length === 0) {
      genres.push({ genre: 'Upload tracks to see genre analytics', count: 0 })
  }


  // Generate Activity Feed with null safety
  const activities = [
      ...(allTracks?.filter(t => t?.id && t?.title).map(t => ({ 
        id: t.id, 
        type: 'upload' as const, 
        title: `Uploaded ${t.title}`, 
        status: t.status || 'draft', 
        date: t.created_at, 
        description: t.artist 
      })) || []),
      ...(payouts?.filter(p => p?.id && p?.amount).map(p => ({ 
        id: p.id, 
        type: 'payout' as const, 
        title: `Payout Request ($${p.amount})`, 
        status: p.status || 'pending', 
        date: p.created_at 
      })) || []),
      ...(tickets?.filter(t => t?.id && t?.subject).map(t => ({ 
        id: t.id, 
        type: 'ticket' as const, 
        title: `Support Ticket: ${t.subject}`, 
        status: t.status || 'open', 
        date: t.created_at 
      })) || [])
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3)

  // Calculate Aggregate Revenue with safety checks
  let totalRevenue = 0
  try {
    if (!artistId && isLabel) {
        // Sum up balances of all managed artists PLUS label's own balance
        const artistsBalance = managedArtists.reduce((acc, curr) => {
          const balance = Number(curr?.balance || 0)
          return acc + (isNaN(balance) ? 0 : balance)
        }, 0)
        const labelBalance = Number(profile?.balance || 0)
        totalRevenue = (isNaN(labelBalance) ? 0 : labelBalance) + artistsBalance
    } else if (artistId) {
        const { data: artistProfile } = await supabase.from('profiles').select('balance').eq('id', artistId).single()
        const balance = Number(artistProfile?.balance || 0)
        totalRevenue = isNaN(balance) ? 0 : balance
    } else {
        const balance = Number(profile?.balance || 0)
        totalRevenue = isNaN(balance) ? 0 : balance
    }
  } catch (error) {
    console.error('Error calculating revenue:', error)
    totalRevenue = 0
  }

  const stats = {
      total: totalReleases,
      approved: approvedCount,
      revenue: totalRevenue,
      tickets: ticketCount || 0,
      statusCounts,
      genres,
      activities,
      // Safe success rate calculation - prevent division by zero
      successRate: totalReleases > 0 ? Math.round((approvedCount / totalReleases) * 100) : 0
  }

    const currentDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    })

    return (
        <div className="space-y-10">
            {/* Cinematic Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter text-white">
                        Good day, {profile?.artist_name || user?.user_metadata?.full_name?.split(' ')[0] || 'Artist'}
                    </h2>
                    <p className="text-sm text-zinc-500 font-bold mt-2 uppercase tracking-[0.3em] ml-1">{currentDate}</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/upload">
                        <Button className="h-12 px-8 bg-white hover:bg-indigo-500 text-black hover:text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all rounded-full shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                            <UploadCloud className="mr-2 h-4 w-4" />
                            Launch Release
                        </Button>
                    </Link>
                </div>
            </div>

            <DashboardHome 
                user={user} 
                tracks={allTracks} 
                stats={stats} 
                bankDetails={{
                    bankName: profile?.bank_name,
                    accountNumber: profile?.account_number,
                    ifscCode: profile?.ifsc_code,
                    paypalEmail: profile?.paypal_email,
                    upiId: profile?.upi_id
                }}
                profile={profile}
            />
        </div>
    )
}
