import { createClient } from '@/utils/supabase/server'
import PayoutList from './payout-list'
import Link from 'next/link'
import { DollarSign, Clock, CheckCircle2, XCircle } from 'lucide-react'

export default async function PayoutsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const supabase = await createClient()
  const status = (await searchParams).status || 'pending'
  
  // Fetch Requests
  let dbQuery = supabase
    .from('payout_requests')
    .select(`
        *,
        profiles (
            full_name,
            artist_name,
            email,
            bank_name,
            account_number,
            ifsc_code
        )
    `)
    .order('created_at', { ascending: false })

  if (status !== 'all') {
    dbQuery = dbQuery.eq('status', status)
  }

  const { data: requests } = await dbQuery

  const stats = [
      { 
        label: 'Pending', 
        status: 'pending', 
        icon: Clock, 
        color: 'text-amber-400', 
        bgColor: 'bg-amber-500/10 border-amber-500/20',
        activeColor: 'text-amber-400',
        activeBg: 'bg-amber-500/10 border-amber-500/30 ring-1 ring-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
      },
      { 
        label: 'Approved', 
        status: 'approved', 
        icon: CheckCircle2, 
        color: 'text-emerald-400', 
        bgColor: 'bg-emerald-500/10 border-emerald-500/20',
        activeColor: 'text-emerald-400',
        activeBg: 'bg-emerald-500/10 border-emerald-500/30 ring-1 ring-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
      },
      { 
        label: 'Rejected', 
        status: 'rejected', 
        icon: XCircle, 
        color: 'text-rose-400', 
        bgColor: 'bg-rose-500/10 border-rose-500/20',
        activeColor: 'text-rose-400',
        activeBg: 'bg-rose-500/10 border-rose-500/30 ring-1 ring-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]'
      },
  ]

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 mt-2">
         <div>
            <div className="flex items-center gap-3 mb-1">
               <DollarSign className="w-8 h-8 text-emerald-500" />
               <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Payout Requests</h1>
            </div>
            <p className="text-zinc-400 font-mono text-xs tracking-widest uppercase">
               Review and process artist withdrawal requests
            </p>
         </div>
      </div>

      {/* Tabs */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          {stats.map((s) => {
             const isActive = status === s.status;
             return (
               <Link key={s.status} href={`/dashboard/payouts?status=${s.status}`} className="group relative">
                  <div className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${isActive ? s.activeBg : 'bg-zinc-900/40 border-white/5 hover:bg-white/[0.02] hover:border-white/10'}`}>
                      <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl border ${s.bgColor}`}>
                              <s.icon className={`h-5 w-5 ${s.color}`} />
                          </div>
                          <span className={`font-black text-sm uppercase tracking-wide ${isActive ? s.activeColor : 'text-zinc-400 group-hover:text-white transition-colors'}`}>{s.label} Requests</span>
                      </div>
                  </div>
               </Link>
             )
          })}
      </div>

      {/* Table Wrapper */}
      <div className="rounded-2xl border border-white/5 bg-zinc-900/40 backdrop-blur-md overflow-hidden shadow-2xl">
        <PayoutList requests={requests || []} />
      </div>
    </div>
  )
}
