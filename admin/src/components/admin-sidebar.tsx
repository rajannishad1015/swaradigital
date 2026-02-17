'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, Users, Music, Settings, LogOut, DollarSign, LifeBuoy, Megaphone, Menu, X } from 'lucide-react'
import { signOut } from '@/app/dashboard/actions'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface AdminSidebarProps {
    user: any
    pendingTickets: number
}

export default function AdminSidebar({ user, pendingTickets }: AdminSidebarProps) {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)

    const navItems = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/users', label: 'Artists & Users', icon: Users },
        { href: '/dashboard/content', label: 'Content Review', icon: Music },
        { href: '/dashboard/payouts', label: 'Payouts', icon: DollarSign },
        { href: '/dashboard/revenue', label: 'Revenue Ingestion', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg> },
    ]

    const managementItems = [
        { href: '/dashboard/support', label: 'Support', icon: LifeBuoy, badge: pendingTickets },
        { href: '/dashboard/announcements', label: 'Broadcasts', icon: Megaphone },
        { href: '/dashboard/settings', label: 'System Settings', icon: Settings },
    ]

    return (
        <>
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-zinc-950/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-4 z-50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <span className="font-black text-xs text-white">A</span>
                    </div>
                    <span className="font-bold text-white tracking-tight">MusicFlow</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="text-white hover:bg-white/10">
                    {isOpen ? <X /> : <Menu />}
                </Button>
            </div>

            {/* Sidebar Container - Mobile Overlay */}
            <div className={cn(
                "fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300",
                isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            )} onClick={() => setIsOpen(false)} />

            {/* Sidebar Content */}
            <div className={cn(
                "fixed md:static inset-y-0 left-0 z-50 w-64 bg-zinc-950/50 backdrop-blur-xl border-r border-white/10 text-white p-4 flex flex-col transition-transform duration-300 transform md:transform-none",
                isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}>
                <div className="mb-8 px-2 hidden md:flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <span className="font-black text-xs">A</span>
                    </div>
                    <div>
                        <h1 className="text-sm font-bold tracking-tight">MusicFlow</h1>
                        <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Admin Portal</p>
                    </div>
                </div>

                <div className="mt-14 md:mt-0 flex-1 overflow-y-auto no-scrollbar">
                    <div className="mb-6 px-2">
                        <p className="text-[10px] uppercase font-bold text-zinc-600 tracking-widest mb-2">Main Menu</p>
                        <nav className="space-y-1">
                            {navItems.map((item: any) => (
                                <Link 
                                    key={item.href} 
                                    href={item.href} 
                                    onClick={() => setIsOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                                        pathname === item.href 
                                            ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" 
                                            : "text-zinc-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    {typeof item.icon === 'object' && 'type' in item.icon ? (
                                        <span className={cn("transition-colors", pathname === item.href ? "text-indigo-400" : "text-zinc-500 group-hover:text-indigo-400")}>{item.icon}</span>
                                    ) : (
                                        <item.icon size={16} className={cn("transition-colors", pathname === item.href ? "text-indigo-400" : "text-zinc-500 group-hover:text-indigo-400")} />
                                    )}
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="mb-6 px-2">
                        <p className="text-[10px] uppercase font-bold text-zinc-600 tracking-widest mb-2">Management</p>
                        <nav className="space-y-1">
                            {managementItems.map((item) => (
                                <Link 
                                    key={item.href} 
                                    href={item.href} 
                                    onClick={() => setIsOpen(false)}
                                    className={cn(
                                        "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                                        pathname === item.href 
                                            ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" 
                                            : "text-zinc-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon size={16} className={cn("transition-colors", pathname === item.href ? "text-indigo-400" : "text-zinc-500 group-hover:text-indigo-400")} />
                                        {item.label}
                                    </div>
                                    {(item.badge || 0) > 0 && (
                                        <span className="bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.2)]">
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>

                <div className="mt-auto px-2">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 mb-4">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/20">
                            {user.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate">Administrator</p>
                            <p className="text-[10px] text-zinc-500 truncate">{user.email}</p>
                        </div>
                    </div>
                    <form action={signOut}>
                        <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-red-500/10 hover:text-red-400 text-zinc-400 h-10 rounded-lg" type="submit">
                            <LogOut size={16} />
                            Secure Logout
                        </Button>
                    </form>
                </div>
            </div>
        </>
    )
}
