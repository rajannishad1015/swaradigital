'use client'

import { useRouter } from 'next/navigation'
import { Sparkles, X, CheckCircle2, Rocket, Crown } from 'lucide-react'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

interface PlanGateModalProps {
    isOpen: boolean
    onClose: () => void
    featureName: string
    requiredPlan: 'multi' | 'elite'
}

const planDetails = {
    multi: {
        name: 'Multi Artist Plan',
        price: '₹499/month',
        // Specific reference image colors for 'Multi'
        accentColor: '#8B5CF6',      // Top border, badge text, button glow
        highlightColor: '#A855F7',   // "Analytics" text (vibrant purple)
        buttonColor: '#7C3AED',      // Solid button background
        hoverButtonColor: '#6D28D9', // Hover button background
        borderColor: '#2A2A40',      // Inner box border
        perks: [
            'Unlimited releases',
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
        // Adjusted reference colors for 'Elite' to keep distinguishability but same vibe
        accentColor: '#F59E0B',      // Top border, badge text, button glow
        highlightColor: '#FBBF24',   // Highlighted feature text
        buttonColor: '#D97706',      // Solid button background 
        hoverButtonColor: '#B45309', // Hover button background
        borderColor: '#3F2C1A',      // Inner box border
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
    const [isMounted, setIsMounted] = useState(false)
    const plan = planDetails[requiredPlan]

    // Use effect to handle animation entrance
    useEffect(() => {
        if (isOpen) {
            setIsMounted(true)
            document.body.style.overflow = 'hidden' // prevent scrolling behind modal
        } else {
            const timeout = setTimeout(() => setIsMounted(false), 300)
            document.body.style.overflow = ''
            return () => clearTimeout(timeout)
        }
    }, [isOpen])

    if (!isOpen && !isMounted) return null

    return (
        <div className={cn(
            "fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 md:p-6",
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
            {/* Backdrop Blur */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Modal Surface - Dark Navy Background from Reference */}
            <div className={cn(
                "relative w-full max-w-[500px] bg-[#0A0A10] border border-white/5 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden",
                "rounded-2xl shadow-2xl",
                isOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-8 scale-95 opacity-0"
            )}>
                
                {/* Glowing Top Line */}
                <div 
                    className="absolute top-0 inset-x-0 h-[3px] shadow-[0_0_15px_rgba(139,92,246,0.5)]" 
                    style={{ backgroundColor: plan.accentColor, boxShadow: `0 0 20px ${plan.accentColor}80` }}
                />

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-transparent text-[#6C6C85] hover:text-white transition-all duration-300"
                >
                    <X size={18} strokeWidth={2} />
                </button>

                <div className="relative pt-10 pb-8 px-6 sm:px-10">
                    {/* Badge */}
                    <div className="flex justify-center mb-6">
                        <div 
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[#2A2A40] bg-[#151525]"
                        >
                            <Sparkles size={14} style={{ color: plan.accentColor }} strokeWidth={2.5} />
                            <span 
                                className="text-[10px] font-bold uppercase tracking-[0.15em]"
                                style={{ color: plan.accentColor }}
                            >
                                Premium Feature
                            </span>
                        </div>
                    </div>

                    {/* Headline */}
                    <div className="text-center mb-8 px-2">
                        <h2 className="text-[34px] font-black tracking-tight mb-3 text-white leading-tight">
                            Unlock <span style={{ color: plan.highlightColor }}>{featureName}</span>
                        </h2>
                        <p className="text-[#A0A0B0] text-[15px] leading-relaxed">
                            You'll need the <strong className="text-white font-semibold">{plan.name}</strong> to access this. Get the ultimate tools to grow your career.
                        </p>
                    </div>

                    {/* Perks Box */}
                    <div 
                        className="rounded-2xl border bg-[#12121A] p-6 mb-8"
                        style={{ borderColor: plan.borderColor }}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                            {plan.perks.map((perk, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="flex-shrink-0">
                                        <CheckCircle2 
                                            size={18} 
                                            style={{ color: plan.accentColor }} 
                                            strokeWidth={2} 
                                        />
                                    </div>
                                    <span className="text-[13px] text-[#D1D1E0] font-medium leading-tight">{perk}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer / CTA */}
                    <div className="flex items-center justify-between mt-2 pt-2">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#6C6C85] mb-1">Starting at</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-[28px] font-extrabold text-white tracking-tight">{plan.price.split('/')[0]}</span>
                                <span className="text-[#6C6C85] text-sm font-medium">/{plan.price.split('/')[1]}</span>
                            </div>
                        </div>
                        
                        <Button
                            onClick={() => {
                                onClose()
                                router.push('/dashboard/billing')
                            }}
                            className="h-12 px-8 rounded-xl font-bold transition-all duration-300 text-white shadow-xl hover:-translate-y-0.5"
                            style={{ 
                                backgroundColor: plan.buttonColor, 
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = plan.hoverButtonColor}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = plan.buttonColor}
                        >
                            Upgrade Now
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
