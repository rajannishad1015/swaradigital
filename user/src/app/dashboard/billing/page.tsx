'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import {
    createRazorpayOrder, createRazorpaySubscription,
    verifyRazorpaySubscription, verifyRazorpayPayment, updateProfilePlan
} from '../actions'
import { Check, Loader2, Lock, Sparkles, ArrowRight, Music, Users, Building2 } from 'lucide-react'
import { toast } from 'sonner'
import Script from 'next/script'
import { cn } from '@/lib/utils'

function BillingContent() {
    const supabase = createClient()
    const searchParams = useSearchParams()
    const isRequired = searchParams.get('required') === 'true'
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<any>(null)
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    useEffect(() => {
        const fetchProfile = async (userId: string) => {
            try {
                const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
                setProfile(data)
            } finally {
                setLoading(false)
            }
        }

        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                fetchProfile(user.id)
            } else {
                setLoading(false)
            }
        })
    }, [])

    const pay = async (id: string) => {
        setActionLoading(id)
        try {
            if (id === 'solo') {
                const order = await createRazorpayOrder(99, 'PLAN_SWITCH_SOLO')
                new (window as any).Razorpay({
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                    amount: order.amount, currency: order.currency,
                    name: 'SwaraDigital', description: 'Single Artist Plan',
                    order_id: order.orderId,
                    handler: async (r: any) => {
                        await verifyRazorpayPayment(r.razorpay_order_id, r.razorpay_payment_id, r.razorpay_signature)
                        await updateProfilePlan('solo')
                        setProfile((p: any) => ({ ...p, plan_type: 'solo' }))
                        toast.success('Plan activated!')
                    },
                    prefill: { email: profile.email, name: profile.full_name },
                    theme: { color: '#818cf8' }
                }).open()
            } else {
                const { subscriptionId } = await createRazorpaySubscription('multi_artist')
                new (window as any).Razorpay({
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                    subscription_id: subscriptionId,
                    name: 'SwaraDigital', description: 'Multi Artist Plan',
                    handler: async (r: any) => {
                        await verifyRazorpaySubscription(r.razorpay_subscription_id, r.razorpay_payment_id, r.razorpay_signature)
                        toast.success('Subscription activated!')
                        window.location.reload()
                    },
                    prefill: { email: profile.email, name: profile.full_name },
                    theme: { color: '#818cf8' }
                }).open()
            }
        } catch (e: any) {
            toast.error(e.message || 'Payment failed')
        } finally {
            setActionLoading(null)
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-5 h-5 animate-spin text-zinc-700" />
        </div>
    )

    const planType = profile?.plan_type || 'none'

    return (
        <div className="min-h-screen pb-20">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />

            {/* Lock warning */}
            {isRequired && (
                <div className="mb-10 flex items-center gap-3 px-4 py-3.5 rounded-xl bg-amber-950/30 border border-amber-800/30">
                    <Lock className="w-4 h-4 text-amber-500 shrink-0" />
                    <p className="text-sm text-amber-300/80">
                        <span className="font-semibold text-amber-200">Access restricted.</span> Purchase a plan to unlock your full dashboard.
                    </p>
                </div>
            )}

            {/* Hero */}
            <div className="text-center mb-16 max-w-xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 mb-6">
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-widest">100% Royalties · 150+ Stores</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white leading-[1.05] mb-4">
                    The right plan for<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">every artist.</span>
                </h1>
                <p className="text-zinc-500 text-base leading-relaxed">
                    No hidden fees. No royalty cuts. Just your music, everywhere.
                </p>
            </div>

            {/* Plans */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto items-start">

                {/* Solo */}
                <div className={cn(
                    "rounded-2xl border p-6 flex flex-col gap-6 transition-all",
                    planType === 'solo'
                        ? "border-zinc-600 bg-zinc-900"
                        : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
                )}>
                    <div>
                        <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center mb-4">
                            <Music className="w-5 h-5 text-zinc-400" />
                        </div>
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Single Artist</p>
                        <div className="flex items-baseline gap-1 mb-1">
                            <span className="text-3xl font-black text-white">₹99</span>
                            <span className="text-zinc-600 text-sm">/ release</span>
                        </div>
                        <p className="text-xs text-zinc-600">Pay once per release. No subscription.</p>
                    </div>

                    <PlanBtn id="solo" planType={planType} loading={actionLoading} onPay={pay} label="Get Started" />

                    <ul className="space-y-2.5 text-sm">
                        {['1 Artist Profile', '150+ Streaming Stores', '100% Royalties', 'YouTube Content ID', 'Basic Dashboard'].map(f => (
                            <li key={f} className="flex items-center gap-2.5 text-zinc-400">
                                <Check className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                                {f}
                            </li>
                        ))}
                        {['Analytics & Finance', 'Rights Manager', 'Full Tools Suite'].map(f => (
                            <li key={f} className="flex items-center gap-2.5 text-zinc-700 line-through">
                                <div className="w-3.5 h-3.5 shrink-0" />
                                {f}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Multi Artist — elevated */}
                <div className={cn(
                    "rounded-2xl border flex flex-col gap-6 overflow-hidden relative transition-all",
                    planType === 'multi'
                        ? "border-indigo-500 bg-indigo-950/60"
                        : "border-indigo-500/40 bg-indigo-950/30 hover:border-indigo-500/70",
                    "shadow-2xl shadow-indigo-950/50 md:-mt-3 md:mb-3"
                )}>
                    {/* Top glow */}
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent" />

                    <div className="p-6 pb-0">
                        {planType !== 'multi' && (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/25 mb-4">
                                <Sparkles className="w-3 h-3 text-indigo-400" />
                                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Most Popular</span>
                            </div>
                        )}
                        {planType === 'multi' && (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 mb-4">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Current Plan</span>
                            </div>
                        )}

                        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-4">
                            <Users className="w-5 h-5 text-indigo-400" />
                        </div>
                        <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Multi Artist</p>
                        <div className="flex items-baseline gap-1 mb-1">
                            <span className="text-3xl font-black text-white">₹1,499</span>
                            <span className="text-indigo-400/60 text-sm">/ year</span>
                        </div>
                        <p className="text-xs text-indigo-400/40">Unlimited releases, all year round.</p>
                    </div>

                    <div className="px-6">
                        <PlanBtn id="multi" planType={planType} loading={actionLoading} onPay={pay} label="Subscribe Now" highlight />
                    </div>

                    <div className="px-6 pb-6">
                        <ul className="space-y-2.5 text-sm">
                            {['Up to 5 Artist Profiles', 'Unlimited Releases', '150+ Streaming Stores', '100% Royalties', 'Real-time Analytics', 'Finance Dashboard', 'Rights Manager', 'Full Tools Suite', 'Priority Support'].map(f => (
                                <li key={f} className="flex items-center gap-2.5 text-indigo-200/80">
                                    <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                    {f}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Elite */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 p-6 flex flex-col gap-6 transition-all">
                    <div>
                        <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center mb-4">
                            <Building2 className="w-5 h-5 text-zinc-400" />
                        </div>
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Elite Label</p>
                        <div className="flex items-baseline gap-1 mb-1">
                            <span className="text-3xl font-black text-white">Custom</span>
                        </div>
                        <p className="text-xs text-zinc-600">Tailored pricing for your label's needs.</p>
                    </div>

                    <button
                        onClick={() => toast.info('Contact: support@swaradigital.com')}
                        className="w-full h-10 rounded-lg text-xs font-bold border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-500 transition-all flex items-center justify-center gap-2"
                    >
                        Talk to Sales <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <ul className="space-y-2.5 text-sm">
                        {['Up to 20 Artist Profiles', 'Everything in Multi Artist', 'Dedicated Account Manager', 'Custom Label Branding', 'Bulk Upload Tools', 'Advanced Revenue Reports', 'SLA-backed Support'].map(f => (
                            <li key={f} className="flex items-center gap-2.5 text-zinc-400">
                                <Check className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                                {f}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Bottom note */}
            <p className="text-center text-zinc-700 text-xs mt-10">
                All plans include UPC/ISRC codes, YouTube Content ID, and global delivery across 150+ DSPs.
            </p>
        </div>
    )
}

function PlanBtn({ id, planType, loading, onPay, label, highlight }: {
    id: string, planType: string, loading: string | null,
    onPay: (id: string) => void, label: string, highlight?: boolean
}) {
    const isActive = planType === id
    const isLoading = loading === id
    return (
        <button
            onClick={() => onPay(id)}
            disabled={isActive || isLoading}
            className={cn(
                "w-full h-10 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2",
                isActive
                    ? "bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-default"
                    : highlight
                        ? "bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/25 hover:-translate-y-0.5"
                        : "border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-500"
            )}
        >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
             isActive ? <><Check className="w-3.5 h-3.5" /> Current Plan</> :
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
