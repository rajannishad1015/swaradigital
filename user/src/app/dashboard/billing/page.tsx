'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import {
    createRazorpayOrder, createRazorpaySubscription,
    verifyRazorpaySubscription, verifyRazorpayPayment
} from '../actions'
import { Check, Loader2, Lock, Sparkles, ArrowRight, Music, Zap, Crown } from 'lucide-react'
import { toast } from 'sonner'
import Script from 'next/script'
import { cn } from '@/lib/utils'
import Link from 'next/link'

function BillingContent() {
    const supabase = createClient()
    const searchParams = useSearchParams()
    const isRequired = searchParams.get('required') === 'true'
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<any>(null)
    const [activePlanName, setActivePlanName] = useState<string | null>(null)
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    useEffect(() => {
        supabase.auth.getUser().then(async ({ data: { user } }) => {
            if (!user) { setLoading(false); return }
            const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
            setProfile(prof)
            if (prof?.plan_type === 'multi' || prof?.plan_type === 'elite') {
                // Try active first, then fall back to any non-expired subscription
                const { data: sub } = await supabase
                    .from('subscriptions').select('plan_name, status').eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle()
                if (sub) setActivePlanName(sub.plan_name)
            }
            setLoading(false)
        })
    }, [])

    const pay = async (id: 'solo' | 'multi_monthly' | 'multi_yearly') => {
        if (!(window as any).Razorpay) {
            toast.error('Payment SDK not loaded. Please refresh the page.')
            return
        }
        setActionLoading(id)
        try {
            if (id !== 'solo') {
                const { subscriptionId } = await createRazorpaySubscription(id)
                const rzp = new (window as any).Razorpay({
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                    subscription_id: subscriptionId,
                    name: 'SwaraDigital',
                    description: id === 'multi_monthly' ? 'Monthly Plan — Unlimited' : 'Yearly Plan — Best Value',
                    handler: async (r: any) => {
                        try {
                            await verifyRazorpaySubscription(r.razorpay_subscription_id, r.razorpay_payment_id, r.razorpay_signature, id)
                            toast.success('Subscription activated!')
                            window.location.reload()
                        } catch (e: any) {
                            toast.error(e.message || 'Subscription verification failed')
                            setActionLoading(null)
                        }
                    },
                    prefill: { email: profile?.email, name: profile?.full_name },
                    theme: { color: '#818cf8' },
                    modal: { ondismiss: () => setActionLoading(null) }
                })
                rzp.on('payment.failed', () => setActionLoading(null))
                rzp.open()
            }
        } catch (e: any) {
            toast.error(e.message || 'Payment failed')
            setActionLoading(null)
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-5 h-5 animate-spin text-zinc-700" />
        </div>
    )

    const planType = profile?.plan_type || 'none'
    const hasActiveSubscription = planType === 'multi' || planType === 'elite'
    const isMultiMonthly = planType === 'multi' && (activePlanName === 'multi_monthly' || activePlanName === 'multi_artist')
    const isMultiYearly = planType === 'multi' && activePlanName === 'multi_yearly'
    // Fallback: if plan is multi but we couldn't determine which sub, treat as multi (show Current Plan on both)
    const isMultiUnknown = planType === 'multi' && !isMultiMonthly && !isMultiYearly

    return (
        <div className="min-h-screen pb-20 bg-[#0A0A10]">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />

            {isRequired && (
                <div className="mb-10 flex items-center gap-3 px-4 py-3.5 rounded-xl bg-amber-950/30 border border-amber-800/30">
                    <Lock className="w-4 h-4 text-amber-500 shrink-0" />
                    <p className="text-sm text-amber-300/80">
                        <span className="font-semibold text-amber-200">Access restricted.</span> Purchase a plan to unlock your full dashboard.
                    </p>
                </div>
            )}

            <div className="text-center mb-16 max-w-xl mx-auto pt-12">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#2A2A40] bg-[#0A0A10] mb-8 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-[#93C5FD]" />
                    <span className="text-[11px] font-bold text-[#93C5FD] uppercase tracking-[0.15em]">100% Royalties · 150+ Stores</span>
                </div>
                <h1 className="text-5xl md:text-[64px] font-black tracking-tighter text-white leading-[1.05] mb-6">
                    The right plan for<br />
                    <span className="text-[#B8A1FE]">every artist.</span>
                </h1>
                <p className="text-[#A0A0B0] text-[17px] font-medium leading-relaxed">
                    No hidden fees. No royalty cuts. Just your music, everywhere.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto items-start">

                {/* Solo */}
                <div className={cn(
                    "rounded-2xl border p-6 flex flex-col gap-6 transition-all border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
                )}>
                    <div>
                        <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center mb-4 mt-[42px]">
                            <Music className="w-5 h-5 text-zinc-400" />
                        </div>
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Single Artist</p>
                        <div className="flex items-baseline gap-1 mb-1">
                            <span className="text-3xl font-black text-white">₹99</span>
                            <span className="text-zinc-600 text-sm">/ release</span>
                        </div>
                        <p className="text-xs text-zinc-600">Pay once per release. No subscription.</p>
                    </div>
                    {(planType === 'multi' || planType === 'elite' || planType === 'solo') ? (
                        <div className="w-full h-10 rounded-lg text-xs font-bold flex items-center justify-center gap-2 bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed">
                            <Check className="w-3.5 h-3.5" /> Covered by your plan
                        </div>
                    ) : (
                        <Link
                            href="/dashboard/upload"
                            className="w-full h-10 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-500 transition-all duration-200"
                        >
                            Pay while releasing <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    )}
                    <ul className="space-y-2.5 text-sm">
                        {['1 Artist Profile', '150+ Streaming Stores', '100% Royalties', 'YouTube Content ID', 'Basic Dashboard'].map(f => (
                            <li key={f} className="flex items-center gap-2.5 text-zinc-400">
                                <Check className="w-3.5 h-3.5 text-zinc-600 shrink-0" />{f}
                            </li>
                        ))}
                        {['Analytics & Finance', 'Rights Manager'].map(f => (
                            <li key={f} className="flex items-center gap-2.5 text-zinc-700 line-through">
                                <div className="w-3.5 h-3.5 shrink-0" />{f}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Monthly */}
                <div className={cn(
                    "rounded-2xl border p-6 flex flex-col gap-6 transition-all",
                    (isMultiMonthly || isMultiUnknown) ? "border-violet-500 bg-violet-950/40" : "border-violet-500/30 bg-violet-950/20 hover:border-violet-500/50"
                )}>
                    <div>
                        {(isMultiMonthly || isMultiUnknown) ? (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 mb-4">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Current Plan</span>
                            </div>
                        ) : (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/15 border border-violet-500/25 mb-4">
                                <Zap className="w-3 h-3 text-violet-400" />
                                <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Flexible</span>
                            </div>
                        )}
                        <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center mb-4">
                            <Zap className="w-5 h-5 text-violet-400" />
                        </div>
                        <p className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-1">Monthly</p>
                        <div className="flex items-baseline gap-1 mb-1">
                            <span className="text-3xl font-black text-white">₹499</span>
                            <span className="text-violet-400/60 text-sm">/ month</span>
                        </div>
                        <p className="text-xs text-violet-400/40">Unlimited releases, cancel anytime.</p>
                    </div>
                    <PlanBtn id="multi_monthly" isActive={isMultiMonthly || isMultiUnknown} isDowngrade={hasActiveSubscription && !isMultiMonthly && !isMultiUnknown} loading={actionLoading} onPay={pay} label="Subscribe Monthly" />
                    <ul className="space-y-2.5 text-sm">
                        {['1 Artist Profile', 'Unlimited Releases', '150+ Streaming Stores', '100% Royalties', 'Real-time Analytics', 'Finance Dashboard', 'Rights Manager', 'Full Tools Suite'].map(f => (
                            <li key={f} className="flex items-center gap-2.5 text-violet-200/80">
                                <Check className="w-3.5 h-3.5 text-violet-400 shrink-0" />{f}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Yearly — Best Value */}
                <div className={cn(
                    "rounded-2xl border flex flex-col gap-6 overflow-hidden relative transition-all",
                    isMultiYearly ? "border-indigo-500 bg-indigo-950/60" : "border-indigo-500/40 bg-indigo-950/30 hover:border-indigo-500/70",
                    "shadow-2xl shadow-indigo-950/50 md:-mt-3 md:mb-3"
                )}>
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent" />

                    <div className="p-6 pb-0">
                        {isMultiYearly ? (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 mb-4">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Current Plan</span>
                            </div>
                        ) : (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/25 mb-4">
                                <Crown className="w-3 h-3 text-indigo-400" />
                                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Best Value</span>
                            </div>
                        )}
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-4">
                            <Crown className="w-5 h-5 text-indigo-400" />
                        </div>
                        <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Yearly</p>
                        <div className="flex items-baseline gap-1 mb-0.5">
                            <span className="text-3xl font-black text-white">₹1,499</span>
                            <span className="text-indigo-400/60 text-sm">/ year</span>
                        </div>
                        <p className="text-xs text-emerald-400/70 mb-1 font-medium">Save ₹4,489 vs monthly</p>
                        <p className="text-xs text-indigo-400/40">Unlimited releases, all year round.</p>
                    </div>

                    <div className="px-6">
                        <PlanBtn id="multi_yearly" isActive={isMultiYearly} isDowngrade={hasActiveSubscription && !isMultiYearly} loading={actionLoading} onPay={pay} label="Subscribe Yearly" highlight />
                    </div>

                    <div className="px-6 pb-6">
                        <ul className="space-y-2.5 text-sm">
                            {['1 Artist Profile', 'Unlimited Releases', '150+ Streaming Stores', '100% Royalties', 'Real-time Analytics', 'Finance Dashboard', 'Rights Manager', 'Full Tools Suite', 'Priority Support'].map(f => (
                                <li key={f} className="flex items-center gap-2.5 text-indigo-200/80">
                                    <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />{f}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            <p className="text-center text-zinc-700 text-xs mt-10">
                All plans include UPC/ISRC codes, YouTube Content ID, and global delivery across 150+ DSPs.
            </p>
        </div>
    )
}

function PlanBtn({ id, isActive, isDowngrade, loading, onPay, label, highlight }: {
    id: string, isActive: boolean, isDowngrade?: boolean, loading: string | null,
    onPay: (id: any) => void, label: string, highlight?: boolean
}) {
    const isLoading = loading === id
    return (
        <button
            onClick={() => onPay(id)}
            disabled={isActive || isLoading || isDowngrade}
            className={cn(
                "w-full h-10 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2",
                (isActive || isDowngrade)
                    ? "bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed"
                    : highlight
                        ? "bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/25 hover:-translate-y-0.5"
                        : "border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-500"
            )}
        >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
             isActive ? <><Check className="w-3.5 h-3.5" /> Current Plan</> :
             isDowngrade ? <><Lock className="w-3.5 h-3.5" /> Active Plan Exists</> :
             <>{label} <ArrowRight className="w-3.5 h-3.5" /></>}
        </button>
    )
}

export default function BillingPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-5 h-5 animate-spin text-zinc-700" />
            </div>
        }>
            <BillingContent />
        </Suspense>
    )
}
