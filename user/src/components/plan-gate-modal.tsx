'use client'

import { useRouter } from 'next/navigation'
import { Crown, X, Zap, Rocket } from 'lucide-react'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'

interface PlanGateModalProps {
    isOpen: boolean
    onClose: () => void
    featureName: string
    requiredPlan: 'multi' | 'elite'
}

const planDetails = {
    multi: {
        name: 'Multi Artist Plan',
        price: '₹1,499/year',
        color: 'from-indigo-500 to-purple-600',
        glowColor: 'shadow-indigo-500/20',
        textColor: 'text-indigo-400',
        borderColor: 'border-indigo-500/30',
        bgColor: 'bg-indigo-500/10',
        icon: Rocket,
        perks: [
            'Unlimited releases per year',
            'Up to 5 artist profiles',
            'Priority support',
            'Advanced analytics',
            'Rights Manager & Tools',
            'Finance dashboard',
        ],
    },
    elite: {
        name: 'Elite Label Plan',
        price: '₹4,999/year',
        color: 'from-amber-500 to-orange-600',
        glowColor: 'shadow-amber-500/20',
        textColor: 'text-amber-400',
        borderColor: 'border-amber-500/30',
        bgColor: 'bg-amber-500/10',
        icon: Crown,
        perks: [
            'Everything in Multi Artist',
            'Up to 20 artist profiles',
            'Dedicated account manager',
            'Custom label branding',
            'Bulk upload tools',
            'Revenue reporting',
        ],
    },
}

export default function PlanGateModal({ isOpen, onClose, featureName, requiredPlan }: PlanGateModalProps) {
    const router = useRouter()
    const plan = planDetails[requiredPlan]
    const Icon = plan.icon

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={cn(
                "relative w-full max-w-md rounded-2xl border bg-zinc-950 shadow-2xl",
                plan.borderColor,
                `shadow-2xl ${plan.glowColor}`
            )}>
                {/* Glow header */}
                <div className={cn("h-1 w-full rounded-t-2xl bg-gradient-to-r", plan.color)} />

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-500 hover:text-white hover:bg-white/10 transition-all"
                >
                    <X size={14} />
                </button>

                <div className="p-7">
                    {/* Header */}
                    <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-5", plan.bgColor, plan.textColor)}>
                        <Icon size={12} />
                        Premium Feature
                    </div>

                    <h2 className="text-xl font-bold text-white mb-2">
                        Unlock <span className={plan.textColor}>{featureName}</span>
                    </h2>
                    <p className="text-zinc-400 text-sm mb-6">
                        This feature is available on the <strong className="text-zinc-200">{plan.name}</strong>. Upgrade to get access to this and much more.
                    </p>

                    {/* Perks */}
                    <div className={cn("rounded-xl border p-4 mb-6 space-y-2.5", plan.borderColor, plan.bgColor)}>
                        {plan.perks.map((perk) => (
                            <div key={perk} className="flex items-center gap-2.5">
                                <div className={cn("w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0", plan.bgColor)}>
                                    <Zap size={9} className={plan.textColor} />
                                </div>
                                <span className="text-zinc-300 text-xs">{perk}</span>
                            </div>
                        ))}
                    </div>

                    {/* Price + CTA */}
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-zinc-500 text-xs">Starting at</p>
                            <p className="text-white font-bold text-lg">{plan.price}</p>
                        </div>
                        <Button
                            onClick={() => {
                                onClose()
                                router.push('/dashboard/billing')
                            }}
                            className={cn(
                                "bg-gradient-to-r text-white font-semibold px-6 py-2 h-auto rounded-xl shadow-lg flex-1",
                                plan.color,
                                `shadow-lg ${plan.glowColor}`
                            )}
                        >
                            Upgrade Now
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
