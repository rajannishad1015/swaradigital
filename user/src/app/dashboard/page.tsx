import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { UploadCloud } from 'lucide-react'
import DashboardHome from '@/components/dashboard-home'

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ artistId?: string }> }) {
  const awaitedParams = await searchParams
  const artistId = awaitedParams.artistId as string
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
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

  // 1. Prepare Filter Logic Early
  let trackQuery = supabase.from('tracks').select('*, albums(cover_art_url, title, type, upc)')
  if (artistId) {
      trackQuery = trackQuery.eq('artist_id', artistId)
  } else if (isLabel) {
      trackQuery = trackQuery.in('artist_id', artistIds)
  } else {
      trackQuery = trackQuery.eq('artist_id', user.id)
  }

  // 2. Fetch All Dashboard Data in Parallel
  let dashboardData: { 
    statusCounts: { status: string; count: number }[];
    topGenres: { genre: string; count: number }[];
    recentTracks: { id: string; title: string; status: string; created_at: string }[];
  } | null = null
  let payouts: { id: string; amount: number; status: string; created_at: string }[] = []
  let tickets: { id: string; subject: string; status: string; created_at: string }[] = []
  let tracks: any[] = [] // Tracks can have many fields, keeping any for now but wrapped in specific array

  try {
    const [dashboardRes, payoutsRes, ticketsRes, tracksRes] = await Promise.all([
      supabase.rpc('get_user_dashboard_data_v2', {
          p_user_id: artistId || user.id
      }),
      supabase.from('payout_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
      supabase.from('tickets').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
      // Performance: Limit to 50 most recent tracks to prevent loading thousands of rows
      trackQuery.order('created_at', { ascending: false }).limit(50)
    ])

    dashboardData = dashboardRes.data
    if (dashboardRes.error) {
      console.error('Error fetching dashboard data via RPC:', dashboardRes.error)
    }

    payouts = payoutsRes.data || []
    tickets = ticketsRes.data || []
    tracks = tracksRes.data || []

    if (payoutsRes.error) console.error('DashboardPage Payouts Error:', payoutsRes.error)
    if (ticketsRes.error) console.error('DashboardPage Tickets Error:', ticketsRes.error)
    if (tracksRes.error) console.error('DashboardPage Tracks Error:', tracksRes.error)

  } catch (err) {
    console.error('Critical DashboardPage Data Fetch Error:', err)
  }

  // 3. Process Data for UI
  const statusCountsRaw = dashboardData?.statusCounts || []
  // Performance: Build map in single pass instead of multiple find() calls
  const statusMap = statusCountsRaw.reduce((acc: Record<string, number>, s: { status: string; count: number }) => {
    acc[s.status] = s.count || 0
    return acc
  }, {} as Record<string, number>)

  const statusCounts = [
    { status: 'approved', count: statusMap['approved'] || 0 },
    { status: 'rejected', count: statusMap['rejected'] || 0 },
    { status: 'pending', count: statusMap['pending'] || 0 },
    { status: 'draft', count: statusMap['draft'] || 0 },
  ]

  const totalReleases = statusCounts.reduce((acc: number, curr: { count: number }) => acc + curr.count, 0)
  const approvedCount = statusCounts[0].count

  // Genre Counts
  const genres = dashboardData?.topGenres?.map((g: { genre: string; count: number }) => ({
    genre: g.genre,
    count: g.count
  })) || []

  if (genres.length === 0) {
    genres.push({ genre: 'Upload tracks for analytics', count: 0 })
  }

  // Recent Activity Generation
  const recentTracks = dashboardData?.recentTracks || []
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const activities = [
      ...recentTracks.map((t: { id: string, title: string, status: string, created_at: string }) => ({ 
        id: `t-${t.id}`, type: 'upload' as const, title: `Release: ${t.title}`, status: t.status, date: t.created_at 
      })),
      ...(payouts?.slice(0, 5).map(p => ({ 
        id: `p-${p.id}`, type: 'payout' as const, title: `Payout: ₹${p.amount}`, status: p.status, date: p.created_at 
      })) || []),
      ...(tickets?.slice(0, 5).map(t => ({ 
        id: `s-${t.id}`, type: 'ticket' as const, title: `Ticket: ${t.subject}`, status: t.status, date: t.created_at 
      })) || [])
  ]
  .filter(a => new Date(a.date) >= sevenDaysAgo)
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3)

  const ticketCountValue = dashboardData?.statusCounts?.find((s: { status: string; count: number }) => s.status === 'open' || s.status === 'in_progress')?.count || 0

  const totalRevenue = (profile?.balance || 0) + (isLabel && !artistId ? managedArtists.reduce((acc, curr) => acc + (curr.balance || 0), 0) : 0)

  const stats = {
      total: totalReleases,
      approved: approvedCount,
      revenue: totalRevenue,
      tickets: ticketCountValue,
      statusCounts,
      genres,
      activities,
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
                            New Release
                        </Button>
                    </Link>
                </div>
            </div>

            <DashboardHome 
                user={{
                    id: user.id,
                    email: user.email,
                    user_metadata: { full_name: user.user_metadata?.full_name }
                }}
                tracks={tracks || []} 
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
