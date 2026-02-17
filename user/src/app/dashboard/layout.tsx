import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Toaster } from "@/components/ui/sonner"
import Sidebar from '@/components/sidebar'
import MobileSidebar from '@/components/mobile-sidebar'
import NotificationCenter from '@/components/notification-center'
import ArtistSwitcher from '@/components/artist-switcher'
import PageTransition from '@/components/page-transition'
import Breadcrumbs from '@/components/breadcrumbs'

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

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, id, status')
        .eq('id', user.id)
        .single()

    if (profile?.status === 'banned' || profile?.status === 'suspended') {
        const supabase = await createClient()
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

    async function signOut() {
        'use server'
        const supabase = await createClient()
        await supabase.auth.signOut()
        redirect('/login')
    }

    // Fetch Pending Tickets Count for User
    const { count: pendingTickets } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('artist_id', user.id)
        .neq('status', 'resolved')
        .neq('status', 'closed')

    // Check for any activity (New User Logic)
    const [{ count: trackCount }, { count: payoutCount }, { count: ticketCount }] = await Promise.all([
        supabase.from('tracks').select('*', { count: 'exact', head: true }).eq('artist_id', user.id),
        supabase.from('payout_requests').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('artist_id', user.id)
    ])

    const hasActivity = (trackCount || 0) > 0 || (payoutCount || 0) > 0 || (ticketCount || 0) > 0

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar 
        user={user} 
        signOut={signOut} 
        pendingTickets={pendingTickets || 0} 
        hasActivity={hasActivity}
        className="hidden md:flex"
      />

      {/* Main Content - Cinematic Midnight */}
      <div className="flex-1 bg-zinc-950 relative flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-10 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-30">
            <div className="flex items-center gap-4">
               <MobileSidebar 
                   user={user} 
                   signOut={signOut} 
                   pendingTickets={pendingTickets || 0} 
                   hasActivity={hasActivity}
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
      <Toaster />
    </div>
  )
}
