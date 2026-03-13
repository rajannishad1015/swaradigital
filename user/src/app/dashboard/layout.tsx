import type { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/sidebar'
import MobileSidebar from '@/components/mobile-sidebar'
import NotificationCenter from '@/components/notification-center'
import ArtistSwitcher from '@/components/artist-switcher'
import PageTransition from '@/components/page-transition'
import Breadcrumbs from '@/components/breadcrumbs'
import { createAdminClient } from '@/utils/supabase/admin'

export const metadata: Metadata = {
  title: 'Artist Dashboard | SwaraDigital',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
        redirect('/login')
    }

    const adminClient = createAdminClient()

    // Fetch profile, pending tickets, activity counts, AND subscription all in parallel
    const [
        { data: profile },
        { count: pendingTickets },
        [trackCountRes, payoutCountRes, ticketCountRes],
        { data: sub }
    ] = await Promise.all([
        supabase.from('profiles').select('role, id, status, label_id, plan_type').eq('id', user.id).single(),
        supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('user_id', user.id).neq('status', 'resolved').neq('status', 'closed'),
        Promise.all([
            supabase.from('tracks').select('*', { count: 'exact', head: true }).eq('artist_id', user.id),
            supabase.from('payout_requests').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
            supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
        ]),
        adminClient.from('subscriptions').select('plan_name').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle()
    ])

    if (profile?.status === 'banned' || profile?.status === 'suspended') {
        await supabase.auth.signOut()
        redirect('/login?error=Your account has been suspended. Please contact support.')
    }

    const isLabel = profile?.role === 'label'
    let artists: any[] = []
    if (isLabel) {
        const { data } = await supabase
            .from('profiles')
            .select('id, artist_name')
            .eq('label_id', user.id)
        artists = data || []
    }

    const trackCount = trackCountRes.count
    const payoutCount = payoutCountRes.count
    const ticketCount = ticketCountRes.count
    const hasActivity = (trackCount || 0) > 0 || (payoutCount || 0) > 0 || (ticketCount || 0) > 0
    let activePlanName = 'Free Tier'
    
    const fetchPlanName = sub?.plan_name || null
    if (profile?.plan_type === 'solo') {
        activePlanName = 'Pay-per-Release'
    } else if (profile?.plan_type === 'multi' || profile?.plan_type === 'elite') {
        if (fetchPlanName === 'multi_yearly' || fetchPlanName === 'multi_artist') activePlanName = 'Pro Yearly'
        else if (fetchPlanName === 'multi_monthly') activePlanName = 'Pro Monthly'
        else if (fetchPlanName === 'elite_label') activePlanName = 'Elite Label'
        else if (profile?.plan_type === 'multi') activePlanName = 'Pro Monthly'
        else activePlanName = 'Elite Label'
    }

    async function signOut() {
        'use server'
        const supabase = await createClient()
        await supabase.auth.signOut()
        redirect('/login')
    }

  // Sanitize user object for client components to prevent Next.js SSR serialization errors
  const safeUser = {
      id: user.id,
      email: user.email,
      user_metadata: { full_name: user.user_metadata?.full_name }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar 
        user={safeUser} 
        signOut={signOut} 
        pendingTickets={pendingTickets || 0} 
        hasActivity={hasActivity}
        planType={profile?.plan_type as any}
        activePlanName={activePlanName}
        className="hidden md:flex"
      />

      {/* Main Content - Cinematic Midnight */}
      <div className="flex-1 bg-zinc-950 relative flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-10 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-30">
            <div className="flex items-center gap-4">
               <MobileSidebar 
                   user={safeUser} 
                   signOut={signOut} 
                   pendingTickets={pendingTickets || 0} 
                   hasActivity={hasActivity}
                   planType={profile?.plan_type as any}
                   activePlanName={activePlanName}
               />
               <div className="hidden sm:block ml-2">
                   <Breadcrumbs />
               </div>
            </div>
            <div className="flex items-center gap-6">
                {isLabel && <ArtistSwitcher artists={artists} />}
                <NotificationCenter />
            </div>
        </header>

        {/* Scrollable Content - Optimized for smooth transitions */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-10 relative will-change-scroll">
             <PageTransition>
               <div className="space-y-12">
                 {children}
               </div>
             </PageTransition>
        </div>
      </div>
      {/* Toaster is rendered in root layout */}
    </div>
  )
}
