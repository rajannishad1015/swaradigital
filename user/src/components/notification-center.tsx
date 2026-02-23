'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bell, Check, Trash2, ExternalLink, Info, BellOff, AlertCircle, ShieldCheck, ArrowRight } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { fetchNotifications, markAsRead, markAllAsRead, deleteNotification } from '@/app/dashboard/notifications/actions'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

export default function NotificationCenter() {
    const [notifications, setNotifications] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const supabase = createClient()

    const unreadCount = notifications.filter(n => !n.is_read).length

    const loadNotifications = useCallback(async () => {
        const data = await fetchNotifications(10)
        setNotifications(data)
        setLoading(false)
    }, [])

    useEffect(() => {
        loadNotifications()

        // Subscribe to real-time changes
        const channel = supabase
            .channel('notification-center-changes')
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

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        const result = await deleteNotification(id)
        if (result.success) {
            setNotifications(prev => prev.filter(n => n.id !== id))
        }
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'upload_status': return <Info className="w-4 h-4 text-indigo-400" />
            case 'takedown_approved': return <AlertCircle className="w-4 h-4 text-rose-400" />
            case 'takedown_refused': return <ShieldCheck className="w-4 h-4 text-emerald-400" />
            case 'support_reply': return <Info className="w-4 h-4 text-sky-400" />
            case 'payment': return <Info className="w-4 h-4 text-amber-400" />
            case 'security': return <ShieldCheck className="w-4 h-4 text-rose-500" />
            default: return <Info className="w-4 h-4 text-zinc-400" />
        }
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full hover:bg-white/5 transition-colors group">
                    <Bell className={cn(
                        "h-5 w-5 transition-all duration-300",
                        unreadCount > 0 ? "text-indigo-400" : "text-zinc-500 group-hover:text-zinc-300"
                    )} />
                    {unreadCount > 0 && (
                        <span className="absolute top-2.5 right-2.5 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent 
                className="w-[calc(100vw-32px)] sm:w-[380px] p-0 bg-zinc-950/95 backdrop-blur-2xl border-white/10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] mr-4 sm:mr-0 overflow-hidden" 
                align="end"
                sideOffset={8}
            >
                <div className="flex items-center justify-between p-4 bg-white/[0.02] border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-200">Notifications</h3>
                        {unreadCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-bold text-indigo-400">
                                {unreadCount} NEW
                            </span>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <button 
                            onClick={handleMarkAllRead}
                            className="text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-indigo-400 transition-colors"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>

                <ScrollArea className="h-[400px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-[300px] gap-3">
                            <div className="relative">
                                <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                                <div className="absolute inset-0 blur-sm bg-indigo-500/20 rounded-full animate-pulse" />
                            </div>
                            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.3em]">Loading...</p>
                        </div>
                    ) : notifications.length > 0 ? (
                        <div className="divide-y divide-white/5">
                            {notifications.map((notification) => (
                                <div 
                                    key={notification.id} 
                                    onClick={() => notification.link ? null : handleMarkAsRead(notification.id)}
                                    className={cn(
                                        "p-4 transition-all relative group cursor-pointer",
                                        !notification.is_read ? "bg-white/[0.03] hover:bg-white/[0.05]" : "bg-transparent opacity-60 hover:opacity-100 hover:bg-white/[0.01]"
                                    )}
                                >
                                    <div className="flex gap-4">
                                        <div className="mt-1 shrink-0">
                                            <div className={cn(
                                                "w-8 h-8 rounded-lg flex items-center justify-center border transition-colors",
                                                !notification.is_read ? "bg-zinc-900 border-white/10" : "bg-zinc-950 border-white/5"
                                            )}>
                                                {getTypeIcon(notification.type)}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0 space-y-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-[13px] font-bold text-white leading-tight truncate">{notification.title}</p>
                                                {!notification.is_read && (
                                                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                                                )}
                                            </div>
                                            <p className="text-[11px] text-zinc-400 leading-normal line-clamp-2 italic">{notification.message}</p>
                                            <div className="flex items-center justify-between pt-2">
                                                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-tighter">
                                                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                                </span>
                                                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                                    {!notification.is_read && (
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleMarkAsRead(notification.id)
                                                            }}
                                                            className="h-6 w-6 rounded-md bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-colors"
                                                            title="Mark as read"
                                                        >
                                                            <Check size={12} />
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={(e) => handleDelete(notification.id, e)}
                                                        className="h-6 w-6 rounded-md bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                    {notification.link && (
                                                        <Link 
                                                            href={notification.link}
                                                            onClick={() => {
                                                                handleMarkAsRead(notification.id)
                                                                setOpen(false)
                                                            }}
                                                            className="h-6 w-6 rounded-md bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white flex items-center justify-center transition-colors"
                                                            title="View details"
                                                        >
                                                            <ArrowRight size={12} />
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[300px] text-center px-12">
                            <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-6 border border-white/5">
                                <BellOff className="h-8 w-8 text-zinc-800" />
                            </div>
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-2">No Notifications</p>
                            <p className="text-[11px] text-zinc-600 font-bold leading-relaxed italic">You don't have any notifications at the moment.</p>
                        </div>
                    )}
                </ScrollArea>

                <div className="p-4 bg-white/[0.02] border-t border-white/5">
                    <Link 
                        href="/dashboard/notifications" 
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-center gap-2 group/btn py-2"
                    >
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 group-hover/btn:text-white transition-colors">View All Notifications</p>
                        <ArrowRight size={12} className="text-zinc-600 group-hover/btn:text-indigo-400 group-hover/btn:translate-x-1 transition-all" />
                    </Link>
                </div>
            </PopoverContent>
        </Popover>
    )
}
