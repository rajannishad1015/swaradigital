'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTransition, useState } from 'react'
import { cn } from '@/lib/utils'
import { 
    LayoutDashboard, 
    Disc, 
    ListMusic, 
    FileBarChart, 
    Ticket, 
    CreditCard, 
    ShieldCheck, 
    Wrench, 
    UserPlus, 
    HelpCircle, 
    LogOut,
    ChevronDown,
    PlusCircle,
    Clock,
} from 'lucide-react'
import { Button } from './ui/button'
import PlanGateModal from './plan-gate-modal'

type PlanType = 'none' | 'solo' | 'multi' | 'elite'

interface SidebarProps {
    user: any
    signOut: () => Promise<void>
    pendingTickets: number
    hasActivity: boolean
    className?: string
    planType?: PlanType
    activePlanName?: string
}

// Which plans count as multi/elite
function hasPremiumAccess(plan?: PlanType) {
    return plan === 'multi' || plan === 'elite'
}

export default function Sidebar({ user, signOut, pendingTickets, hasActivity, className, planType, activePlanName }: SidebarProps) {
    const pathname = usePathname()
    const [modalOpen, setModalOpen] = useState(false)
    const [modalFeature, setModalFeature] = useState('')
    const [modalPlan, setModalPlan] = useState<'multi' | 'elite'>('multi')

    const showPremiumAlert = (featureName: string, requiredPlan: 'multi' | 'elite' = 'multi') => {
        setModalFeature(featureName)
        setModalPlan(requiredPlan)
        setModalOpen(true)
    }

    const isPremium = hasPremiumAccess(planType)

    return (
        <>
            <PlanGateModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                featureName={modalFeature}
                requiredPlan={modalPlan}
            />

            <div className={cn("w-64 flex-shrink-0 bg-zinc-950 text-zinc-400 flex flex-col h-screen border-r border-zinc-800 relative z-20", className)}>
                {/* Logo Section */}
                <div className="p-7 pb-10">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="absolute inset-0 bg-indigo-500/20 blur-xl" />
                            <div className="relative w-9 h-9 bg-white flex items-center justify-center rounded-sm shadow-2xl">
                                <Disc className="w-5 h-5 text-black" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-base font-bold text-white tracking-tight leading-none">
                                SwaraDigital
                            </h1>
                            <p className="text-[9px] text-zinc-500 font-medium uppercase tracking-[0.15em] mt-1.5 font-mono">Artist Portal</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-3 space-y-0.5 scrollbar-hide">
                    <p className="px-4 text-[9px] font-semibold text-zinc-600 uppercase tracking-[0.15em] mb-3">Management</p>
                    <NavItem href="/dashboard" icon={LayoutDashboard} label="Overview" active={pathname === '/dashboard'} />
                    {hasActivity && <NavItem href="/dashboard/activity" icon={Clock} label="Recent Activity" active={pathname === '/dashboard/activity'} />}
                    <NavItem href="/dashboard/catalog" icon={ListMusic} label="Releases" active={pathname === '/dashboard/catalog'} />
                    <NavItem href="/dashboard/upload" icon={PlusCircle} label="New Delivery" active={pathname === '/dashboard/upload'} />
                    <NavItem href="/dashboard/billing" icon={CreditCard} label="Billing & Plans" active={pathname === '/dashboard/billing'} />
                    
                    <div className="h-6" />
                    <p className="px-4 text-[9px] font-semibold text-zinc-600 uppercase tracking-[0.15em] mb-3">Enterprise</p>
                    
                    {/* Premium-only items */}
                    <NavItem
                        href={isPremium ? "/dashboard/reports" : "#"}
                        icon={FileBarChart}
                        label="Analytics"
                        active={pathname === '/dashboard/reports'}
                        premiumLocked={!isPremium}
                        onLockedClick={() => showPremiumAlert('Analytics')}
                    />
                    <NavItem
                        href={isPremium ? "/dashboard/finance" : "#"}
                        icon={CreditCard}
                        label="Finance"
                        active={pathname === '/dashboard/finance'}
                        premiumLocked={!isPremium}
                        onLockedClick={() => showPremiumAlert('Finance Dashboard')}
                    />
                    <div className="relative">
                        <NavItem href="/dashboard/support" icon={Ticket} label="Support" active={pathname?.startsWith('/dashboard/support')} />
                        {pendingTickets > 0 && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-lg shadow-rose-500/20 animate-pulse">
                                {pendingTickets}
                            </span>
                        )}
                    </div>
                    <NavItem href="/dashboard/settings" icon={Wrench} label="Settings" active={pathname === '/dashboard/settings'} />
                    
                    <div className="h-6" />
                    <p className="px-4 text-[9px] font-semibold text-zinc-600 uppercase tracking-[0.15em] mb-3">Protection</p>
                    
                    <NavGroup
                        icon={ShieldCheck}
                        label="Rights Manager"
                        premiumLocked={!isPremium}
                        onLockedClick={() => showPremiumAlert('Rights Manager')}
                        items={[
                            { href: "/dashboard/rights/ugc-claims", label: "UGC Claims" },
                            { href: "/dashboard/rights/whitelist", label: "Whitelist" }
                        ]}
                    />

                    <div className="py-4 px-4">
                        <div className="h-px bg-zinc-800/50" />
                    </div>

                    <NavGroup
                        icon={Wrench}
                        label="Tools"
                        premiumLocked={!isPremium}
                        onLockedClick={() => showPremiumAlert('Tools')}
                        items={[
                            { href: "/dashboard/tools/media-studio", label: "Media Studio" },
                            { href: "/dashboard/tools/profile-linking", label: "Profile Linking" },
                            { href: "/dashboard/tools/advanced-options", label: "Advanced Options" }
                        ]}
                    />

                    <div className="py-4 px-4">
                        <div className="h-px bg-zinc-800/50" />
                    </div>

                    <NavItem href="#" icon={UserPlus} label="Invite Artist" badge="Soon" disabled />
                    <NavItem href="/dashboard/faq" icon={HelpCircle} label="Documentation" active={pathname === '/dashboard/faq'} />
                </nav>

                {/* Footer / User Profile */}
                <div className="p-6 border-t border-zinc-800">
                    <Link href="/dashboard/settings" className="flex items-center gap-3 mb-5 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors group/profile">
                         <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 text-xs font-semibold group-hover/profile:border-indigo-500/50 transition-colors">
                            {user.email?.[0].toUpperCase()}
                         </div>
                         <div className="overflow-hidden flex-1">
                            <p className="text-xs font-semibold text-zinc-100 truncate group-hover/profile:text-indigo-400 transition-colors">{user.user_metadata?.full_name || 'Verified Artist'}</p>
                            <p className="text-[10px] text-zinc-500 font-medium truncate tracking-tight">{activePlanName || 'Edit Profile'}</p>
                         </div>
                    </Link>
                    
                    <form action={signOut}>
                        <Button 
                            variant="ghost" 
                            className="w-full justify-start gap-2.5 h-10 transition-all duration-200 hover:bg-white/5 hover:text-white text-zinc-500 rounded-lg group" 
                            type="submit"
                        >
                            <LogOut size={14} className="opacity-60 group-hover:opacity-100" />
                            <span className="text-xs font-medium">Log Out</span>
                        </Button>
                    </form>
                </div>
            </div>
        </>
    )
}

function NavItem({ href, icon: Icon, label, active, badge, disabled, premiumLocked, onLockedClick }: { 
    href: string
    icon: any
    label: string
    active?: boolean
    badge?: string
    disabled?: boolean
    premiumLocked?: boolean
    onLockedClick?: () => void
}) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault()
        if (premiumLocked && onLockedClick) {
            onLockedClick()
            return
        }
        if (href === '#') return
        startTransition(() => {
            router.push(href)
        })
    }

    return (
        <Link href={href} onClick={handleClick} className={cn(href === '#' && !premiumLocked && "cursor-default")}>
            <div className={cn(
                "group relative flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-300 ease-out",
                href !== '#' && !premiumLocked && "hover:scale-[1.02] active:scale-[0.98]",
                premiumLocked && "cursor-pointer hover:scale-[1.02] active:scale-[0.98]",
                active 
                    ? "bg-white/10 text-white shadow-lg shadow-indigo-500/10" 
                    : href === '#' && !premiumLocked ? "text-zinc-600" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5",
                isPending && "opacity-60"
            )}>
                {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full shadow-lg shadow-indigo-500/50" />
                )}
                
                <Icon size={16} className={cn(
                    "transition-all duration-300 ease-out",
                    active ? "text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" : "text-zinc-600 group-hover:text-zinc-400 group-hover:scale-110"
                )} />
                <span className="text-xs font-medium tracking-wide flex-1">{label}</span>
                
                {premiumLocked && (
                    <span className="text-[9px] font-bold bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/20 uppercase tracking-wider">Pro</span>
                )}
                {badge && !premiumLocked && (
                    <span className="text-[9px] font-bold bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-700 uppercase tracking-wider">{badge}</span>
                )}
                
                {!active && (
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}
            </div>
        </Link>
    )
}

function NavGroup({ icon: Icon, label, items, premiumLocked, onLockedClick }: { 
    icon: any
    label: string
    items?: { href: string, label: string }[]
    premiumLocked?: boolean
    onLockedClick?: () => void
}) {
    const pathname = usePathname()
    const isAnyChildActive = items?.some(item => pathname === item.href)
    const [isOpen, setIsOpen] = useState(isAnyChildActive)

    const handleToggle = () => {
        if (premiumLocked && onLockedClick) {
            onLockedClick()
            return
        }
        setIsOpen(!isOpen)
    }

    return (
        <div>
            <button 
                onClick={handleToggle}
                className={cn(
                    "w-full flex items-center justify-between px-4 py-2.5 transition-all duration-300 rounded-lg group",
                    (isOpen || isAnyChildActive) ? "text-white bg-white/5" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                )}
            >
                <div className="flex items-center gap-3">
                    <Icon size={16} className={cn(
                        "transition-all duration-200",
                        (isOpen || isAnyChildActive) ? "text-indigo-400" : "text-zinc-600 group-hover:text-zinc-400"
                    )} />
                    <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
                </div>
                {premiumLocked ? (
                    <span className="text-[9px] font-bold bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/20 uppercase tracking-wider">Pro</span>
                ) : (
                    <ChevronDown size={12} className={cn("transition-transform duration-200 text-zinc-600", isOpen && "rotate-180")} />
                )}
            </button>
            
            {isOpen && !premiumLocked && (
                <div className="ml-9 mt-1 space-y-1 py-1 border-l border-zinc-800">
                    {items ? items.map((item) => (
                        <Link key={item.href} href={item.href}>
                            <div className={cn(
                                "group relative flex items-center gap-3 px-4 py-2 text-xs font-medium transition-all duration-300 ease-out hover:scale-[1.02]",
                                pathname === item.href 
                                    ? "text-indigo-400 bg-indigo-500/5 rounded-r-lg" 
                                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5 rounded-r-lg"
                            )}>
                                {pathname === item.href && (
                                    <div className="absolute left-[-1px] top-1/2 -translate-y-1/2 w-0.5 h-4 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                                )}
                                {item.label}
                            </div>
                        </Link>
                    )) : (
                        <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600 italic">No Options Available</div>
                    )}
                </div>
            )}
        </div>
    )
}
