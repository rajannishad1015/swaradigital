import { Suspense } from 'react'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ProfileEditorDialog from '../settings/profile-editor-dialog'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Building2, Pencil, Wallet, ArrowUpRight, ShieldCheck } from 'lucide-react'
import RevenueCard from '@/components/revenue-card'
import BankCard from '@/components/bank-card'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import WithdrawRequestForm from './withdraw-request-form'
import TransactionList from './transaction-list'
import PayoutList from './payout-list'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import RevenueAnalytics from './revenue-analytics'
import { format, subDays } from 'date-fns'
import FinanceFilters from '@/components/finance/finance-filters'
import FinanceExportButton from '@/components/finance/finance-export-button'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function FinancePage({ searchParams }: { 
    searchParams: Promise<{ 
        artistId?: string, 
        range?: string, 
        search?: string,
        page?: string
    }> 
}) {
  const awaitedParams = await searchParams
  const artistId = awaitedParams.artistId as string
  const range = awaitedParams.range || 'all'
  const search = awaitedParams.search || ''

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }
  const [profileRes, artistsRes] = await Promise.all([
    supabase.from('profiles').select('role, balance, bank_name, account_number, ifsc_code, paypal_email, upi_id').eq('id', user.id).single(),
    supabase.from('profiles').select('id, balance').eq('label_id', user.id)
  ])

  const profile = profileRes.data
  const isLabel = profile?.role === 'label'
  const managedArtists = artistsRes.data?.map(a => ({ id: a.id, balance: Number(a.balance || 0) })) || []
  const artistIds = managedArtists.map(a => a.id)

  // Setup queries
  let revenueQuery = supabase.from('revenue_logs').select('*, tracks(title)')
  let transQuery = supabase.from('transactions').select('*', { count: 'exact' }).order('created_at', { ascending: false })
  let payoutQuery = supabase.from('payout_requests').select('*').order('created_at', { ascending: false })

  // 1. Time Range Filter
  if (range !== 'all') {
      let days = 30
      if (range === '7d') days = 7
      if (range === '90d') days = 90
      if (range === '12m') days = 365
      
      const dateLimitFilter = subDays(new Date(), days).toISOString()
      revenueQuery = revenueQuery.gte('period', dateLimitFilter)
      transQuery = transQuery.gte('created_at', dateLimitFilter)
      payoutQuery = payoutQuery.gte('created_at', dateLimitFilter)
  }

  // 2. Search Filter (Transactions) — escape SQL wildcards
  if (search) {
      const escapedSearch = search.replace(/%/g, '\\%').replace(/_/g, '\\_')
      transQuery = transQuery.ilike('description', `%${escapedSearch}%`)
  }

  if (artistId) {
      revenueQuery = revenueQuery.eq('user_id', artistId)
      transQuery = transQuery.eq('user_id', artistId)
      payoutQuery = payoutQuery.eq('user_id', artistId)
  } else if (isLabel) {
      revenueQuery = revenueQuery.in('user_id', artistIds)
      transQuery = transQuery.in('user_id', artistIds)
      payoutQuery = payoutQuery.in('user_id', artistIds)
  } else {
      revenueQuery = revenueQuery.eq('user_id', user.id)
      transQuery = transQuery.eq('user_id', user.id)
      payoutQuery = payoutQuery.eq('user_id', user.id)
  }

  const page = Number(awaitedParams?.page || 1)
  const pageSize = 20
  const fromOffset = (page - 1) * pageSize
  const toOffset = fromOffset + pageSize - 1

  // Process analytics filter
  const userIdsForAnalytics = artistId ? [artistId] : (isLabel ? artistIds : [user.id])
  const analyticsDateLimit = range !== 'all' 
    ? subDays(new Date(), range === '7d' ? 7 : range === '90d' ? 90 : range === '12m' ? 365 : 30).toISOString().split('T')[0]
    : null

  // Fetch all main data in parallel
  const [revenueRes, transRes, payoutRes, analyticsRes] = await Promise.all([
    revenueQuery.order('period', { ascending: true }),
    transQuery.range(fromOffset, toOffset),
    payoutQuery,
    supabase.rpc('get_revenue_analytics_v2', {
      p_user_ids: userIdsForAnalytics,
      p_start_date: analyticsDateLimit
    })
  ])

  const revenueLogs = revenueRes.data || []
  const transactions = transRes.data || []
  const totalTransactionsCount = transRes.count || 0
  const totalPages = Math.ceil(totalTransactionsCount / pageSize)
  const payoutRequests = payoutRes.data || []

  if (analyticsRes.error) {
    console.error('Error fetching analytics via RPC:', analyticsRes.error)
  }

  const { platformData, trackData, monthlyData, countryData } = analyticsRes.data || {
    platformData: [],
    trackData: [],
    monthlyData: [],
    countryData: []
  }

  const calculatedBalance = artistId || !isLabel 
    ? Number(profile?.balance || 0) 
    : (Number(profile?.balance || 0) + managedArtists.reduce((acc, curr) => acc + curr.balance, 0))

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/5 pb-6">
            <div>
                <h1 className="text-4xl font-black text-white tracking-tight uppercase flex items-center gap-3">
                    <Wallet className="text-indigo-500" size={32} />
                    Finance Center
                </h1>
                <p className="text-zinc-500 mt-2 font-medium">Manage earnings, payouts, and financial health.</p>
            </div>
            <div className="flex items-center gap-3">
                 <ProfileEditorDialog 
                    profile={profile} 
                    trigger={
                        <Button variant="outline" className="border-white/10 hover:bg-white/5 text-zinc-400 hover:text-white transition-all h-10 px-6 font-bold uppercase tracking-wider text-xs">
                            <Pencil size={14} className="mr-2"/> Bank Settings
                        </Button>
                    }
                 />
            </div>
        </div>

        {/* Filters Section */}
        <Suspense fallback={<div className="h-10 w-full bg-zinc-900 rounded-lg animate-pulse" />}>
            <FinanceFilters />
        </Suspense>

        {/* Top Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             <div className="col-span-1 lg:col-span-1 h-full">
                 <RevenueCard 
                    balance={calculatedBalance} 
                    bankDetails={{
                        bankName: profile?.bank_name,
                        accountNumber: profile?.account_number,
                        ifscCode: profile?.ifsc_code,
                        paypalEmail: profile?.paypal_email,
                        upiId: profile?.upi_id
                    }}
                 />
             </div>
             
             <div className="col-span-1 lg:col-span-1 h-full">
                <BankCard 
                    bankName={profile?.bank_name}
                    accountNumber={profile?.account_number}
                    ifscCode={profile?.ifsc_code}
                />
             </div>
             
             {/* Quick Actions / Summary Card */}
             <div className="col-span-1 lg:col-span-1 hidden lg:block">
                 <Card className="h-full bg-zinc-950/50 border-white/5 border-dashed flex flex-col justify-center items-center text-center p-6 space-y-4">
                     <div className="p-3 rounded-full bg-indigo-500/10 text-indigo-400">
                         <ShieldCheck size={24} />
                     </div>
                     <div>
                         <h3 className="text-white font-bold">Secure Payouts</h3>
                         <p className="text-xs text-zinc-500 mt-1 max-w-[200px] mx-auto">All transactions are encrypted and processed via secure gateways.</p>
                     </div>
                     <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> System Operational
                     </div>
                 </Card>
             </div>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="transactions" className="w-full">
            <div className="flex items-center justify-between mb-6">
                <TabsList className="w-full grid grid-cols-3 h-auto p-1 bg-zinc-950/50 border border-white/5 rounded-lg">
                    <TabsTrigger value="transactions" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-500 font-bold text-[10px] md:text-xs uppercase tracking-wider px-1 md:px-6 h-10 rounded-md transition-all w-full">Transactions</TabsTrigger>
                    <TabsTrigger value="analytics" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-zinc-500 font-bold text-[10px] md:text-xs uppercase tracking-wider px-1 md:px-6 h-10 rounded-md transition-all w-full">Analytics</TabsTrigger>
                    <TabsTrigger value="payouts" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-500 font-bold text-[10px] md:text-xs uppercase tracking-wider px-1 md:px-6 h-10 rounded-md transition-all w-full">Payouts</TabsTrigger>
                </TabsList>
            </div>
            
            <TabsContent value="analytics" className="mt-0 focus-visible:ring-0 outline-none">
                <RevenueAnalytics data={{ platformData, trackData, monthlyData, countryData }} />
            </TabsContent>
            
            <TabsContent value="transactions" className="mt-0 focus-visible:ring-0 outline-none">
                <Card className="bg-zinc-950 border-white/10 shadow-2xl overflow-hidden">
                    <CardHeader className="border-b border-white/5 bg-white/[0.01]">
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-white">Recent Activity</CardTitle>
                                <CardDescription className="text-zinc-500 mt-1 text-xs">History of royalties and adjustments.</CardDescription>
                            </div>
                            <FinanceExportButton data={transactions || []} />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Suspense fallback={<div className="h-[400px] w-full bg-zinc-900 animate-pulse rounded-b-xl" />}>
                            <TransactionList 
                                transactions={transactions || []} 
                                currentPage={page}
                                totalPages={totalPages}
                            />
                        </Suspense>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="payouts" className="mt-0 focus-visible:ring-0 outline-none">
                 <Card className="bg-zinc-950 border-white/10 shadow-2xl overflow-hidden">
                    <CardHeader className="border-b border-white/5 bg-white/[0.01]">
                         <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-white">Withdrawal History</CardTitle>
                                <CardDescription className="text-zinc-500 mt-1 text-xs">Track your payout requests and status.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <PayoutList payouts={payoutRequests || []} />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>

    </div>
  )
}
