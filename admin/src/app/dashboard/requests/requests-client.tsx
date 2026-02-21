'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RequestType, updateRequestStatus } from './actions'
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table"
import { Button } from '@/components/ui/button'
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Check, X, ExternalLink, Shield, ShieldCheck, Music, History, Loader2 } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from 'sonner'

interface RequestsClientProps {
    initialRequests: any[]
    activeType: RequestType
    activeStatus: string
}

export default function RequestsClient({ initialRequests, activeType, activeStatus }: RequestsClientProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedRequest, setSelectedRequest] = useState<any>(null)
    const [rejectionReason, setRejectionReason] = useState('')
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Reset search when type changes to ensure isolation
    useEffect(() => {
        setSearchQuery('')
    }, [activeType])

    const filteredRequests = initialRequests.filter(req => {
        const matchesStatus = activeStatus === 'all' || req.status === activeStatus
        const matchesSearch = 
            (req.profiles?.artist_name || req.profiles?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (req.profiles?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (req.channel_name || req.content_url || req.artist_name || '').toLowerCase().includes(searchQuery.toLowerCase())
        return matchesStatus && matchesSearch
    })

    const handleTypeChange = (type: RequestType) => {
        startTransition(() => {
            router.push(`/dashboard/requests?type=${type}&status=${activeStatus}`)
        })
    }

    const handleStatusFilterChange = (status: string) => {
        startTransition(() => {
            router.push(`/dashboard/requests?type=${activeType}&status=${status}`)
        })
    }

    const handleAction = async (id: string, status: 'approved' | 'rejected' | 'processing' | 'pending', reason?: string) => {
        setIsSubmitting(true)
        try {
            await updateRequestStatus(id, activeType, status, reason)
            toast.success(`Request ${status} successfully`)
            router.refresh()
            setIsRejectDialogOpen(false)
            setRejectionReason('')
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Approved</Badge>
            case 'rejected': return <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20">Rejected</Badge>
            case 'processing': return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">Processing</Badge>
            case 'pending': return <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">Pending</Badge>
            default: return <Badge variant="outline" className="text-zinc-500 border-white/10 uppercase font-bold text-[9px]">{status}</Badge>
        }
    }

    return (
        <div className="space-y-6">
            {/* Tabs & Controls */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-1 p-1 bg-zinc-900/50 border border-white/5 rounded-xl w-fit">
                    {[
                        { id: 'profiling', label: 'Artist Profiling', icon: ShieldCheck },
                        { id: 'ugc', label: 'UGC Claims', icon: Music },
                        { id: 'whitelist', label: 'Whitelisting', icon: Shield }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTypeChange(tab.id as RequestType)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeType === tab.id ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                        >
                            <tab.icon size={14} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full md:max-w-md">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                        <Input 
                            placeholder="Search user, email, or details..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-zinc-900/50 border-white/5 text-white placeholder:text-zinc-600 focus:bg-zinc-900 h-10 rounded-xl"
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                        {['pending', 'approved', 'rejected', 'all'].map((s) => (
                            <Button 
                                key={s}
                                variant={activeStatus === s ? 'default' : 'ghost'} 
                                size="sm" 
                                onClick={() => handleStatusFilterChange(s)}
                                className={`text-[10px] font-bold uppercase tracking-widest h-8 px-4 rounded-lg transition-all ${activeStatus === s ? 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/20' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                            >
                                {s}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Table */}
            <div className="relative bg-zinc-900/30 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
                {isPending && (
                    <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-[2px] z-50 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Updating Queue...</p>
                        </div>
                    </div>
                )}
                <Table>
                    <TableHeader className="bg-white/5 border-b border-white/5">
                        <TableRow className="hover:bg-transparent border-white/5">
                            <TableHead className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] py-4">User Details</TableHead>
                            <TableHead className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] py-4">Request Info</TableHead>
                            <TableHead className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] py-4">Status</TableHead>
                            <TableHead className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] py-4 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredRequests.length > 0 ? (
                            filteredRequests.map((req) => (
                                <TableRow key={req.id} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                                    <TableCell className="py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-white text-sm">{req.profiles?.artist_name || req.profiles?.full_name || 'Unknown'}</span>
                                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{req.profiles?.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4">
                                        {activeType === 'profiling' && (
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-zinc-300 font-medium">{req.artist_name}</span>
                                                    <Badge variant="outline" className="text-[9px] h-4 px-1.5 bg-white/5 border-white/10 text-zinc-500 uppercase">Profiling</Badge>
                                                </div>
                                                <div className="flex gap-3 text-[10px]">
                                                    {req.facebook_url && <a href={req.facebook_url} target="_blank" className="text-indigo-400 hover:underline flex items-center gap-1"><ExternalLink size={10} /> Facebook</a>}
                                                    {req.instagram_url && <a href={req.instagram_url} target="_blank" className="text-pink-400 hover:underline flex items-center gap-1"><ExternalLink size={10} /> Instagram</a>}
                                                </div>
                                                <div className="text-[10px] text-zinc-500 italic truncate max-w-[200px]">
                                                    Ref: {req.albums?.title || req.tracks?.title || 'N/A'}
                                                </div>
                                            </div>
                                        )}
                                        {activeType === 'ugc' && (
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-zinc-300 font-medium">{req.claim_type} Claim</span>
                                                    <Badge variant="outline" className="text-[9px] h-4 px-1.5 bg-white/5 border-white/10 text-zinc-500 uppercase">{req.platform}</Badge>
                                                </div>
                                                <a href={req.content_url} target="_blank" className="text-indigo-400 hover:underline text-[10px] truncate max-w-[200px] flex items-center gap-1">
                                                    <ExternalLink size={10} /> {req.content_url}
                                                </a>
                                                <div className="text-[10px] text-zinc-500 italic">
                                                    Track: {req.tracks?.title || 'N/A'}
                                                </div>
                                            </div>
                                        )}
                                        {activeType === 'whitelist' && (
                                             <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-zinc-300 font-medium">{req.channel_name}</span>
                                                    <Badge variant="outline" className="text-[9px] h-4 px-1.5 bg-white/5 border-white/10 text-zinc-500 uppercase">{req.channel_type || 'N/A'}</Badge>
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                                                    <span className="uppercase">{req.platform}</span>
                                                    <span>•</span>
                                                    <a href={req.channel_url} target="_blank" className="text-indigo-400 hover:underline flex items-center gap-1"><ExternalLink size={10} /> Channel Link</a>
                                                </div>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <div className="flex flex-col gap-1">
                                            {getStatusBadge(req.status)}
                                            {req.status === 'rejected' && req.rejection_reason && (
                                                <span className="text-[10px] text-rose-400/60 max-w-[150px] italic truncate">{req.rejection_reason}</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right py-4">
                                        <div className="flex justify-end gap-2">
                                            {req.status === 'pending' && (
                                                <>
                                                    <Button 
                                                        size="sm" 
                                                        onClick={() => handleAction(req.id, 'approved')}
                                                        disabled={isSubmitting}
                                                        className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 h-8 rounded-lg font-bold text-xs"
                                                    >
                                                        <Check size={14} className="mr-1.5" /> Approve
                                                    </Button>
                                                    <Button 
                                                        size="sm" 
                                                        variant="ghost" 
                                                        onClick={() => {
                                                            setSelectedRequest(req)
                                                            setIsRejectDialogOpen(true)
                                                        }}
                                                        disabled={isSubmitting}
                                                        className="text-rose-400 hover:text-white hover:bg-rose-500 border border-transparent hover:border-rose-500/20 h-8 rounded-lg font-bold text-xs"
                                                    >
                                                        <X size={14} className="mr-1.5" /> Reject
                                                    </Button>
                                                </>
                                            )}
                                            {req.status !== 'pending' && (
                                                <Button 
                                                    size="sm" 
                                                    variant="ghost" 
                                                    onClick={() => handleAction(req.id, 'pending')}
                                                    disabled={isSubmitting}
                                                    className="text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10 h-8 rounded-lg font-bold text-xs"
                                                >
                                                    <History size={14} className="mr-1.5" /> Revert
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={4} className="text-center py-20">
                                    <div className="flex flex-col items-center justify-center opacity-40">
                                        <History size={48} className="text-zinc-600 mb-4" />
                                        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">No requests found</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Rejection Dialog */}
            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent className="bg-zinc-950 border-white/10 text-white sm:rounded-2xl rounded-2xl max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <X className="text-rose-500" size={20} /> Reject Request
                        </DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            Please provide a reason for rejecting this request. This will be visible to the artist.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Rejection Reason</label>
                            <Textarea 
                                placeholder="e.g. Invalid channel link, profile details mismatch..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="min-h-[120px] bg-zinc-900/50 border-white/10 focus-visible:ring-rose-500/50 resize-none rounded-xl"
                            />
                        </div>
                    </div>
                    <DialogFooter className="flex-row gap-2">
                        <Button variant="ghost" className="flex-1 rounded-xl h-11" onClick={() => setIsRejectDialogOpen(false)}>Cancel</Button>
                        <Button 
                            variant="destructive" 
                            className="flex-2 bg-rose-500 hover:bg-rose-600 rounded-xl h-11"
                            onClick={() => handleAction(selectedRequest.id, 'rejected', rejectionReason)}
                            disabled={!rejectionReason.trim() || isSubmitting}
                        >
                            Confirm Rejection
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
