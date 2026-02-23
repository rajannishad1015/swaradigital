'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bell, Check, Trash2, Info, BellOff, ArrowLeft, MoreVertical, AlertCircle, ShieldCheck, Trash } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { fetchNotifications, markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications } from './actions'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    const loadNotifications = useCallback(async () => {
        const data = await fetchNotifications(100) // Larger limit for history page
        setNotifications(data)
        setLoading(false)
    }, [])

    useEffect(() => {
        loadNotifications()

        const channel = supabase
            .channel('notifications-page-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'notifications',
                },
                () => {
                    loadNotifications()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [loadNotifications, supabase])

    const handleMarkAsRead = async (id: string) => {
        const result = await markAsRead(id)
        if (result.success) {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
        }
    }

    const handleMarkAllRead = async () => {
        const result = await markAllAsRead()
        if (result.success) {
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        }
    }

    const handleDelete = async (id: string) => {
        const result = await deleteNotification(id)
        if (result.success) {
            setNotifications(prev => prev.filter(n => n.id !== id))
        }
    }

    const handleDeleteAll = async () => {
        if (!confirm('Are you sure you want to clear your entire notification history? This action cannot be undone.')) return
        const result = await deleteAllNotifications()
        if (result.success) {
            setNotifications([])
        }
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'upload_status': return <Info className="w-5 h-5 text-indigo-400" />
            case 'takedown_approved': return <AlertCircle className="w-5 h-5 text-rose-400" />
            case 'takedown_refused': return <ShieldCheck className="w-5 h-5 text-emerald-400" />
            case 'support_reply': return <Info className="w-5 h-5 text-sky-400" />
            case 'payment': return <Info className="w-5 h-5 text-amber-400" />
            case 'security': return <ShieldCheck className="w-5 h-5 text-rose-500" />
            default: return <Info className="w-5 h-5 text-zinc-400" />
        }
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 md:px-0">
                <div className="space-y-4">
                    <Link 
                        href="/dashboard" 
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-white transition-colors group w-fit"
                    >
                        <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Dashboard
                    </Link>
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black tracking-tighter text-white uppercase sm:text-5xl">
                            Notifications
                        </h1>
                        <p className="text-zinc-500 text-sm font-medium tracking-tight max-w-xl">
                            All your system notifications and status updates in one place.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleMarkAllRead}
                        className="bg-transparent border-white/5 hover:bg-white/5 text-[10px] font-black uppercase tracking-widest h-9 px-4"
                        disabled={notifications.filter(n => !n.is_read).length === 0}
                    >
                        <Check className="mr-2 h-3.5 w-3.5" />
                        Mark all as read
                    </Button>
                    
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" className="bg-transparent border-white/5 hover:bg-white/5 h-9 w-9">
                                <MoreVertical size={16} className="text-zinc-400" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-zinc-950 border-white/10 text-zinc-400">
                            <DropdownMenuItem 
                                onClick={handleDeleteAll}
                                className="text-rose-500 focus:text-rose-400 focus:bg-rose-500/10 cursor-pointer text-xs font-bold"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Clear History
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Notifications Grid */}
            {loading ? (
                <div className="grid gap-4 px-4 md:px-0">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-24 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
                    ))}
                </div>
            ) : notifications.length > 0 ? (
                <div className="grid gap-4 px-4 md:px-0">
                    {notifications.map((notification) => (
                        <div 
                            key={notification.id}
                            className={cn(
                                "group relative overflow-hidden rounded-2xl border transition-all duration-300",
                                !notification.is_read 
                                    ? "bg-white/[0.03] border-white/10 shadow-[0_0_30px_-12px_rgba(99,102,241,0.2)]" 
                                    : "bg-transparent border-white/5 opacity-60 hover:opacity-100 hover:bg-white/[0.01]"
                            )}
                        >
                            <div className="p-6 flex gap-6">
                                <div className="shrink-0">
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300",
                                        !notification.is_read 
                                            ? "bg-zinc-900 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)] group-hover:scale-110" 
                                            : "bg-zinc-950 border-white/5"
                                    )}>
                                        {getTypeIcon(notification.type)}
                                    </div>
                                </div>

                                <div className="flex-1 space-y-2 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="space-y-1">
                                            <h3 className={cn(
                                                "text-lg font-bold tracking-tight transition-colors",
                                                !notification.is_read ? "text-white" : "text-zinc-400"
                                            )}>
                                                {notification.title}
                                            </h3>
                                            <p className="text-[13px] text-zinc-500 leading-relaxed max-w-2xl font-medium">
                                                {notification.message}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0 lg:block hidden">
                                            <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest block mb-1">Received</span>
                                            <span className="text-xs font-bold text-zinc-500">
                                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-6">
                                            <span className="text-[10px] text-zinc-600 font-bold block lg:hidden">
                                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/20" />
                                                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                                                     Status: {notification.is_read ? 'Read' : 'New'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {!notification.is_read && (
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                    className="h-8 text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                                                >
                                                    <Check className="mr-2 h-3.5 w-3.5" />
                                                     Mark as read
                                                </Button>
                                            )}
                                            {notification.link && (
                                                <Button 
                                                    asChild
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="h-8 text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                                                >
                                                    <Link href={notification.link}>
                                                        View Details
                                                        <ArrowLeft className="ml-2 h-3.5 w-3.5 rotate-180" />
                                                    </Link>
                                                </Button>
                                            )}
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => handleDelete(notification.id)}
                                                className="h-8 w-8 text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10 transition-all rounded-lg"
                                            >
                                                <Trash size={14} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {!notification.is_read && (
                                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-indigo-500 to-transparent shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 px-8 text-center bg-white/[0.01] rounded-3xl border border-dashed border-white/5">
                    <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mb-8 border border-white/5">
                        <BellOff className="h-10 w-10 text-zinc-800" />
                    </div>
                    <h2 className="text-xl font-bold text-white uppercase tracking-tight mb-2">No Notifications</h2>
                    <p className="text-zinc-600 text-sm font-medium tracking-tight max-w-sm mx-auto leading-relaxed">
                        Your notification history is empty.
                    </p>
                    <Button asChild className="mt-8 bg-zinc-900 hover:bg-zinc-800 text-white border border-white/5 rounded-xl px-8 h-11 text-[11px] font-black uppercase tracking-widest">
                        <Link href="/dashboard">Back to Dashboard</Link>
                    </Button>
                </div>
            )}
        </div>
    )
}
