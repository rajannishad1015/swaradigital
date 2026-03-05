import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Users, Music, Clock, DollarSign, LifeBuoy, X, ShieldCheck, Activity, Database, Server } from 'lucide-react'
import { getAnalyticsData } from './analytics-actions'
import AnalyticsCharts from '@/components/admin/analytics/charts'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch counts in parallel
  const [
    { count: totalTracks },
    { count: pendingTracks },
    { count: takedownTracks },
    { count: totalArtists },
    { count: pendingPayouts },
    { count: openTickets },
    analyticsData
  ] = await Promise.all([
    supabase.from('tracks').select('*', { count: 'exact', head: true }),
    supabase.from('tracks').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('tracks').select('*', { count: 'exact', head: true }).eq('status', 'takedown_requested'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('payout_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    getAnalyticsData()
  ])

  const stats = [
    { label: 'Total Uploads', value: totalTracks || 0, icon: Music, gradient: 'from-blue-500/20 to-indigo-500/0', border: 'group-hover:border-blue-500/30', text: 'text-blue-400' },
    { label: 'Pending Review', value: pendingTracks || 0, icon: Clock, gradient: 'from-amber-500/20 to-orange-500/0', border: 'group-hover:border-amber-500/30', text: 'text-amber-400' },
    { label: 'Takedowns', value: takedownTracks || 0, icon: X, gradient: 'from-rose-500/20 to-red-500/0', border: 'group-hover:border-rose-500/30', text: 'text-rose-400' },
    { label: 'Pending Support', value: openTickets || 0, icon: LifeBuoy, gradient: 'from-pink-500/20 to-rose-500/0', border: 'group-hover:border-pink-500/30', text: 'text-pink-400' },
    { label: 'Active Artists', value: totalArtists || 0, icon: Users, gradient: 'from-emerald-500/20 to-teal-500/0', border: 'group-hover:border-emerald-500/30', text: 'text-emerald-400' },
    { label: 'Pending Payouts', value: pendingPayouts || 0, icon: DollarSign, gradient: 'from-purple-500/20 to-fuchsia-500/0', border: 'group-hover:border-purple-500/30', text: 'text-purple-400' },
  ]

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 mt-2">
         <div>
            <div className="flex items-center gap-3 mb-1">
               <ShieldCheck className="w-8 h-8 text-indigo-500" />
               <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Command Center</h1>
            </div>
            <p className="text-zinc-400 font-mono text-xs tracking-widest uppercase">
               MusicFlow Administrative Operations
            </p>
         </div>
         
         <div className="flex items-center gap-3 bg-zinc-900/40 border border-white/10 rounded-lg p-2 pr-4">
             <div className="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                 <Activity className="w-4 h-4 text-emerald-400" />
             </div>
             <div className="flex flex-col">
                 <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-none">Platform Status</span>
                 <div className="flex items-center gap-1.5 mt-1">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-[pulse_2s_ease-in-out_infinite]" />
                     <span className="text-xs font-black text-emerald-400 uppercase tracking-widest leading-none">All Systems Operational</span>
                 </div>
             </div>
         </div>
      </div>
      
      {/* Metrics Grid */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className={`group relative p-4 bg-zinc-900/30 rounded-xl border border-white/5 transition-all duration-300 hover:border-white/10 hover:bg-zinc-900/80`}>
             <div className="flex flex-col justify-between h-full relative z-10">
                 <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg bg-black/40 border border-white/5`}>
                        <stat.icon className={`h-4 w-4 ${stat.text}`} />
                    </div>
                 </div>
                 <div>
                    <p className={`text-2xl font-black text-white tracking-tight leading-none mb-1`}>{stat.value.toLocaleString()}</p>
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest line-clamp-1">{stat.label}</h3>
                 </div>
             </div>
          </div>
        ))}
      </div>
      
      {/* Analytics Section */}
      <div className="rounded-xl overflow-hidden border border-white/5 bg-zinc-900/20 mb-8 p-1">
          <AnalyticsCharts data={analyticsData} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
          {/* Quick Actions */}
          <div className="xl:col-span-2 p-6 bg-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group/actions">
             <div className="absolute inset-0 bg-gradient-to-bl from-indigo-500/5 to-transparent pointer-events-none opacity-0 group-hover/actions:opacity-100 transition-opacity duration-700" />
             
             <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20">
                      <Clock className="w-4 h-4" />
                   </div>
                   <h3 className="text-md font-black text-white uppercase tracking-widest">Operational Actions</h3>
                </div>
             </div>
             
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 relative z-10">
                <Link href="/dashboard/content?status=pending" className="group rounded-2xl bg-black/40 border border-white/5 p-5 hover:bg-white/[0.04] transition-all text-center flex flex-col items-center gap-4 hover:border-indigo-500/40 hover:shadow-[0_0_30px_rgba(99,102,241,0.1)]">
                   <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-transform shadow-inner relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Music className="w-5 h-5 text-zinc-400 group-hover:text-indigo-400 relative z-10" />
                   </div>
                   <div className="space-y-1">
                        <span className="block text-xs font-black text-white uppercase tracking-wider">Content Review</span>
                        <span className="block text-[10px] text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20 w-fit mx-auto">{pendingTracks || 0} Pending</span>
                   </div>
                </Link>
                
                <Link href="/dashboard/content?status=takedown_requested" className="group rounded-2xl bg-black/40 border border-white/5 p-5 hover:bg-white/[0.04] transition-all text-center flex flex-col items-center gap-4 hover:border-rose-500/40 hover:shadow-[0_0_30px_rgba(244,63,94,0.1)]">
                   <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-transform shadow-inner relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <X className="w-5 h-5 text-zinc-400 group-hover:text-rose-400 relative z-10" />
                   </div>
                   <div className="space-y-1">
                        <span className="block text-xs font-black text-white uppercase tracking-wider">Takedowns</span>
                        <span className="block text-[10px] text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20 w-fit mx-auto">{takedownTracks || 0} Requests</span>
                   </div>
                </Link>

                <Link href="/dashboard/support?status=open" className="group rounded-2xl bg-black/40 border border-white/5 p-5 hover:bg-white/[0.04] transition-all text-center flex flex-col items-center gap-4 hover:border-pink-500/40 hover:shadow-[0_0_30px_rgba(236,72,153,0.1)]">
                   <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-transform shadow-inner relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <LifeBuoy className="w-5 h-5 text-zinc-400 group-hover:text-pink-400 relative z-10" />
                   </div>
                   <div className="space-y-1">
                        <span className="block text-xs font-black text-white uppercase tracking-wider">Support</span>
                        <span className="block text-[10px] text-pink-400 font-bold bg-pink-500/10 px-2 py-0.5 rounded-full border border-pink-500/20 w-fit mx-auto">{openTickets || 0} Open</span>
                   </div>
                </Link>

                <Link href="/dashboard/payouts" className="group rounded-2xl bg-black/40 border border-white/5 p-5 hover:bg-white/[0.04] transition-all text-center flex flex-col items-center gap-4 hover:border-emerald-500/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                   <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-transform shadow-inner relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <DollarSign className="w-5 h-5 text-zinc-400 group-hover:text-emerald-400 relative z-10" />
                   </div>
                   <div className="space-y-1">
                        <span className="block text-xs font-black text-white uppercase tracking-wider">Payouts</span>
                        <span className="block text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 w-fit mx-auto">{pendingPayouts || 0} Pending</span>
                   </div>
                </Link>

                <Link href="/dashboard/users" className="group rounded-2xl bg-black/40 border border-white/5 p-5 hover:bg-white/[0.04] transition-all text-center flex flex-col items-center gap-4 hover:border-purple-500/40 hover:shadow-[0_0_30px_rgba(168,85,247,0.1)] sm:col-span-2 md:col-span-1 border-dashed">
                   <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-transform shadow-inner relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Users className="w-5 h-5 text-zinc-400 group-hover:text-purple-400 relative z-10" />
                   </div>
                   <div className="space-y-1 pb-1">
                        <span className="block text-xs font-black text-white uppercase tracking-wider">User Matrix</span>
                        <span className="block text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1 group-hover:text-purple-400/70 transition-colors">Access Database</span>
                   </div>
                </Link>
             </div>
          </div>

          <div className="p-6 bg-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group/health h-full">
             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none opacity-0 group-hover/health:opacity-100 transition-opacity duration-700" />
             
             <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                   <Server className="w-4 h-4" />
                </div>
                <h3 className="text-md font-black text-white uppercase tracking-widest">System Health</h3>
             </div>
             
             <div className="space-y-3 relative z-10 h-full flex flex-col">
                <div className="flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-white/5 group-hover/health:border-white/10 transition-colors">
                   <div className="flex items-center gap-3">
                       <Database className="w-4 h-4 text-zinc-500" />
                       <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Main Database</span>
                   </div>
                   <span className="flex items-center gap-1.5 text-emerald-400 font-bold text-[10px] uppercase tracking-wider bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Connected
                   </span>
                </div>
                <div className="flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-white/5 group-hover/health:border-white/10 transition-colors">
                   <div className="flex items-center gap-3">
                       <Server className="w-4 h-4 text-zinc-500" />
                       <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Object Storage</span>
                   </div>
                   <span className="flex items-center gap-1.5 text-emerald-400 font-bold text-[10px] uppercase tracking-wider bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active
                   </span>
                </div>
                <div className="flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-white/5 group-hover/health:border-white/10 transition-colors flex-1 items-start sm:items-center">
                   <div className="flex items-center gap-3">
                       <ShieldCheck className="w-4 h-4 text-zinc-500" />
                       <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Root Auth</span>
                   </div>
                   <span className="flex items-center gap-1.5 text-indigo-400 font-bold text-[10px] uppercase tracking-wider bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.1)]">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> Verified Session
                   </span>
                </div>
             </div>
          </div>
      </div>
    </div>
  )
}
