'use client'

import { ShieldCheck, Search, AlertCircle, Info, Filter, Clock, CheckCircle2, MoreVertical, ExternalLink, Plus, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { getUgcClaims, submitUgcClaim, getWhitelistedChannels } from "../actions"
import { getReleasesAndTracks } from "../../tools/profile-linking/actions"
import { toast } from "sonner"

export default function UGCClaimsPage() {
    const [claims, setClaims] = useState<any[]>([])
    const [tracks, setTracks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [open, setOpen] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        platform: 'YouTube',
        content_url: '',
        claim_type: 'monetize' as const,
        track_id: null as string | null
    })

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        try {
            const [claimsData, selectionData] = await Promise.all([
                getUgcClaims(),
                getReleasesAndTracks()
            ])
            setClaims(claimsData)
            setTracks(selectionData.tracks)
        } catch (error) {
            console.error(error)
            toast.error("Failed to load data")
        } finally {
            setLoading(false)
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!formData.content_url) return toast.error("Content URL is required")
        
        setIsSubmitting(true)
        try {
            await submitUgcClaim(formData as any)
            toast.success("Claim submitted successfully")
            setOpen(false)
            setFormData({ platform: 'YouTube', content_url: '', claim_type: 'monetize', track_id: null })
            loadData()
        } catch (error: any) {
            toast.error(error.message || "Failed to submit claim")
        } finally {
            setIsSubmitting(false)
        }
    }

    const approvedCount = claims.filter(c => c.status === 'approved').length
    const rejectedCount = claims.filter(c => c.status === 'rejected').length
    const pendingCount = claims.filter(c => c.status === 'pending').length

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shadow-inner">
                            <ShieldCheck size={20} />
                        </div>
                        <p className="text-[10px] uppercase font-black tracking-[0.2em] text-indigo-500/80">Rights Manager</p>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight">UGC Claims</h1>
                    <p className="text-zinc-400 text-sm mt-2 max-w-2xl">Manage and monitor user-generated content claims across platforms like YouTube, Facebook, and Instagram.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-white hover:bg-zinc-200 text-black font-bold">
                                <Plus size={16} className="mr-2" />
                                Submit New Claim
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-zinc-950 border-white/10 text-white">
                            <DialogHeader>
                                <DialogTitle>Submit New Rights Claim</DialogTitle>
                                <DialogDescription className="text-zinc-500">
                                    Provide the URL of the content you wish to claim or monetize.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="platform">Platform</Label>
                                    <Select value={formData.platform} onValueChange={(v) => setFormData({...formData, platform: v})}>
                                        <SelectTrigger className="bg-zinc-900 border-white/10">
                                            <SelectValue placeholder="Select platform" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                            <SelectItem value="YouTube">YouTube</SelectItem>
                                            <SelectItem value="Facebook">Facebook</SelectItem>
                                            <SelectItem value="Instagram">Instagram</SelectItem>
                                            <SelectItem value="TikTok">TikTok</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="content_url">Content URL</Label>
                                    <Input 
                                        id="content_url"
                                        placeholder="https://youtube.com/watch?v=..." 
                                        className="bg-zinc-900 border-white/10"
                                        value={formData.content_url}
                                        onChange={(e) => setFormData({...formData, content_url: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="track_id">Associated Track (Optional)</Label>
                                    <Select value={formData.track_id || 'none'} onValueChange={(v) => setFormData({...formData, track_id: v === 'none' ? null : v})}>
                                        <SelectTrigger className="bg-zinc-900 border-white/10">
                                            <SelectValue placeholder="Select track (Optional)" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                            <SelectItem value="none">No specific track</SelectItem>
                                            {tracks.map((track) => (
                                                <SelectItem key={track.id} value={track.id}>
                                                    {track.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="claim_type">Claim Action</Label>
                                    <Select value={formData.claim_type} onValueChange={(v: any) => setFormData({...formData, claim_type: v})}>
                                        <SelectTrigger className="bg-zinc-900 border-white/10">
                                            <SelectValue placeholder="Select action" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                            <SelectItem value="monetize">Monetize (Earn royalties)</SelectItem>
                                            <SelectItem value="track">Track (Monitor only)</SelectItem>
                                            <SelectItem value="block">Block (Take down content)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <DialogFooter className="pt-4">
                                    <Button 
                                        type="button" 
                                        variant="ghost" 
                                        onClick={() => setOpen(false)}
                                        className="text-zinc-400 hover:text-white"
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        type="submit" 
                                        disabled={isSubmitting}
                                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                                        Submit Claim
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Approved Claims", value: approvedCount, sub: "Successfully processed", icon: ShieldCheck, color: "text-emerald-400" },
                    { label: "Rejected", value: rejectedCount, sub: "Claims not processed", icon: X, color: "text-rose-400" },
                    { label: "Pending Review", value: pendingCount, sub: "Awaiting action", icon: Clock, color: "text-amber-400" }
                ].map((stat, i) => (
                    <Card key={i} className="bg-zinc-950/50 border-white/5 shadow-xl transition-all duration-300 hover:border-white/10 group">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest mb-1">{stat.label}</p>
                                    <h3 className="text-3xl font-black text-white">{stat.value}</h3>
                                    <p className="text-[11px] text-zinc-500 mt-1">{stat.sub}</p>
                                </div>
                                <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${stat.color} group-hover:scale-110 transition-transform`}>
                                    <stat.icon size={20} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content Area */}
            <Card className="bg-zinc-950/50 border-white/5 shadow-2xl overflow-hidden min-h-[400px]">
                <CardHeader className="p-8 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
                                Recent Claims
                                {claims.length > 0 && <Badge variant="outline" className="bg-zinc-900 border-white/10 text-zinc-500 font-bold uppercase tracking-widest text-[9px]">{claims.length} Records</Badge>}
                            </CardTitle>
                            <CardDescription className="text-zinc-500 mt-1">Audit trail of all your content ID and manual claims.</CardDescription>
                        </div>
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                            <Input 
                                placeholder="Search by Track ID or Platform..." 
                                className="pl-10 h-10 bg-zinc-900/50 border-white/5 focus:border-indigo-500/50 text-white transition-all"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-20">
                            <Loader2 className="animate-spin text-indigo-500 mb-4" size={32} />
                            <p className="text-zinc-500 text-sm">Loading claims data...</p>
                        </div>
                    ) : claims.length > 0 ? (
                        <>
                            {/* Desktop Table View */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                <thead className="bg-white/5 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                                    <tr>
                                        <th className="px-8 py-4">Platform</th>
                                        <th className="px-8 py-4">Track</th>
                                        <th className="px-8 py-4">Content URL</th>
                                        <th className="px-8 py-4">Type</th>
                                        <th className="px-8 py-4">Status</th>
                                        <th className="px-8 py-4">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {claims.map((claim) => (
                                        <tr key={claim.id} className="hover:bg-white/[0.02] transition-colors group text-sm">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-[10px] font-bold text-zinc-400 tracking-tighter uppercase whitespace-nowrap overflow-hidden">
                                                        {claim.platform.substring(0,2)}
                                                    </div>
                                                    <span className="font-medium text-zinc-300">{claim.platform}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-zinc-200">{claim.track?.title || 'N/A'}</span>
                                                    <span className="text-[10px] text-zinc-500 font-mono tracking-tighter uppercase">{claim.track?.isrc || 'NO ISRC'}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <a href={claim.content_url} target="_blank" className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 max-w-[200px] truncate">
                                                    {claim.content_url}
                                                    <ExternalLink size={12} />
                                                </a>
                                            </td>
                                            <td className="px-8 py-5 uppercase text-[10px] font-bold tracking-widest text-zinc-500">
                                                {claim.claim_type}
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col gap-1">
                                                    <Badge variant="outline" className={
                                                        claim.status === 'approved' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                                        claim.status === 'processing' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                                                        claim.status === 'rejected' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                                                        'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                                                    }>
                                                        {claim.status}
                                                    </Badge>
                                                    {claim.status === 'rejected' && claim.rejection_reason && (
                                                        <span className="text-[10px] text-rose-500/70 font-medium italic max-w-[150px] truncate" title={claim.rejection_reason}>
                                                            {claim.rejection_reason}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-zinc-500 text-xs">
                                                {new Date(claim.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="block md:hidden divide-y divide-white/5 bg-black/20">
                                {claims.map((claim) => (
                                    <div key={claim.id} className="p-5 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-[10px] font-black text-zinc-400 uppercase">
                                                    {claim.platform.substring(0,2)}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-white uppercase tracking-tight">{claim.platform}</p>
                                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{claim.claim_type}</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className={`rounded-full px-2.5 py-0 text-[7px] font-black uppercase tracking-wider border-none w-fit ${
                                                claim.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
                                                claim.status === 'processing' ? 'bg-amber-500/10 text-amber-400' :
                                                claim.status === 'rejected' ? 'bg-rose-500/10 text-rose-400' :
                                                'bg-indigo-500/10 text-indigo-400'
                                            }`}>
                                                {claim.status}
                                            </Badge>
                                        </div>

                                        <div className="p-3 bg-white/[0.03] rounded-xl border border-white/5 space-y-2">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Associated Track</span>
                                                <span className="text-xs font-bold text-zinc-200">{claim.track?.title || 'N/A'}</span>
                                                <span className="text-[9px] text-zinc-600 font-mono">{claim.track?.isrc || 'NO ISRC'}</span>
                                            </div>
                                            <div className="pt-2 border-t border-white/5">
                                                <a href={claim.content_url} target="_blank" className="text-indigo-400 hover:text-indigo-300 flex items-center gap-2 text-[10px] truncate">
                                                    <ExternalLink size={12} />
                                                    {claim.content_url}
                                                </a>
                                            </div>
                                        </div>

                                        {claim.status === 'rejected' && claim.rejection_reason && (
                                            <div className="p-3 bg-rose-500/5 rounded-xl border border-rose-500/10">
                                                <p className="text-[9px] text-rose-400 font-bold uppercase leading-relaxed">
                                                    <span className="text-rose-500 mr-2">!</span>
                                                    {claim.rejection_reason}
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between text-[9px] text-zinc-600 font-bold uppercase tracking-widest px-1">
                                            <span>Claim ID: {claim.id.substring(0,8)}</span>
                                            <span>{new Date(claim.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-20 text-center">
                            <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-700 mb-6 drop-shadow-2xl">
                                <Search size={32} />
                            </div>
                            <h4 className="text-lg font-bold text-white">No active claims found</h4>
                            <p className="text-zinc-500 text-sm max-w-sm mt-2 mx-auto">
                                Submit your ISRC or YouTube URL to begin monitoring user-generated content. Claims will appear here once identified.
                            </p>
                            <div className="flex items-center gap-4 mt-8">
                                <Button variant="outline" className="border-white/5 bg-zinc-900 hover:bg-white/5 text-zinc-300">
                                    Learn More
                                </Button>
                                <Button onClick={() => setOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8">
                                    Get Started
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Information Alert */}
            <div className="flex items-start gap-4 p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 mb-10">
                <div className="mt-1 p-2 rounded-lg bg-indigo-500/10">
                    <Info size={18} className="text-indigo-400" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-white mb-1 tracking-wide uppercase">Content ID & Rights Monitoring</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed max-w-4xl">
                        Our Rights Manager monitors platforms using both fingerprinting and AI-powered scanning. 
                        Once a claim is identified, you can choose to <span className="text-emerald-400 font-medium">Monetize</span>, 
                        <span className="text-amber-400 font-medium">Track</span>, or <span className="text-rose-400 font-medium">Block</span> the content worldwide or in specific territories. 
                        Note that platforms like YouTube may take up to 48 hours to process manual claims.
                    </p>
                </div>
            </div>
        </div>
    )
}
