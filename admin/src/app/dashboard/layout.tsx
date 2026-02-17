import AdminSidebar from '@/components/admin-sidebar'
import { Toaster } from "@/components/ui/sonner"
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

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

    // Check Role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
    
    if (profile?.role !== 'admin') {
        redirect('/login?error=Access Denied')
    }

    // Fetch Pending Tickets Count
    const { count: pendingTickets } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open')

    // Sign out action
    async function signOut() {
        'use server'
        const supabase = await createClient()
        await supabase.auth.signOut()
        redirect('/login')
    }

  return (
    <div className="flex h-screen overflow-hidden bg-black selection:bg-indigo-500/30">
        {/* Background Gradients */}
        <div className="fixed inset-0 z-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-900/20 to-transparent opacity-40 blur-3xl" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-3xl" />
        </div>

      {/* Sidebar - Client Component */}
      <AdminSidebar user={user} pendingTickets={pendingTickets || 0} />

      {/* Main Content */}
      <div className="flex-1 bg-transparent p-0 overflow-y-auto overflow-x-hidden relative z-10 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        <div className="max-w-7xl mx-auto p-4 pt-32 md:p-8">
            {children}
        </div>
        <Toaster theme="dark" position="bottom-right" />
      </div>
    </div>
  )
}
