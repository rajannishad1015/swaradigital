'use client'

import { ListPlus, Search, ShieldCheck, Globe, Youtube, Instagram, Facebook, Info, Trash2, PlusCircle, ExternalLink, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { getWhitelistedChannels, whitelistChannel, removeWhitelistedChannel } from "../actions"
import { toast } from "sonner"

export default function WhitelistPage() {
    const [channels, setChannels] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [open, setOpen] = useState(false)
    const [filter, setFilter] = useState('All Platforms')

    // Form State
    const [formData, setFormData] = useState({
        platform: 'YouTube',
        channel_id: '',
        channel_name: '',
        channel_url: '',
        channel_type: ''
    })

    useEffect(() => {
        loadChannels()
    }, [])

    async function loadChannels() {
        try {
            const data = await getWhitelistedChannels()
            setChannels(data)
        } catch (error) {
            console.error(error)
            toast.error("Failed to load whitelisted channels")
        } finally {
            setLoading(false)
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!formData.channel_id || !formData.channel_name || !formData.channel_type) return toast.error("All required fields must be filled")
        
        setIsSubmitting(true)
        try {
            await whitelistChannel(formData)
            toast.success("Channel whitelisted successfully")
            setOpen(false)
            setFormData({ platform: 'YouTube', channel_id: '', channel_name: '', channel_url: '', channel_type: '' })
            loadChannels()
        } catch (error: any) {
            toast.error(error.message || "Failed to whitelist channel")
        } finally {
            setIsSubmitting(false)
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to remove this channel from whitelist?")) return
        
        try {
            await removeWhitelistedChannel(id)
            toast.success("Channel removed from whitelist")
            loadChannels()
        } catch (error: any) {
            toast.error(error.message || "Failed to remove channel")
        }
    }

    const filteredChannels = filter === 'All Platforms' 
        ? channels 
        : channels.filter(c => c.platform === filter)

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-inner">
                            <ListPlus size={20} />
                        </div>
                        <p className="text-[10px] uppercase font-black tracking-[0.2em] text-emerald-500/80">Rights Manager</p>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight">Channel Whitelist</h1>
                    <p className="text-zinc-400 text-sm mt-2 max-w-2xl">Add channels to your whitelist to prevent copyright claims on their content using your music.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-white hover:bg-zinc-200 text-black font-bold">
                                <PlusCircle size={16} className="mr-2" />
                                Whitelist Channel
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-zinc-950 border-white/10 text-white">
                            <DialogHeader>
                                <DialogTitle>Whitelist New Channel</DialogTitle>
                                <DialogDescription className="text-zinc-500">
                                    Exempt a channel from copyright claims for your music.
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
                                            <SelectItem value="Instagram">Instagram</SelectItem>
                                            <SelectItem value="Facebook">Facebook</SelectItem>
                                            <SelectItem value="TikTok">TikTok</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="channel_name">Channel Name</Label>
                                        <Input 
                                            id="channel_name"
                                            placeholder="e.g. T-Series" 
                                            className="bg-zinc-900 border-white/10"
                                            value={formData.channel_name}
                                            onChange={(e) => setFormData({...formData, channel_name: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="channel_type">Channel Type</Label>
                                        <Select value={formData.channel_type} onValueChange={(v) => setFormData({...formData, channel_type: v})}>
                                            <SelectTrigger className="bg-zinc-900 border-white/10">
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-900 border-white/10 text-white font-bold">
                                                <SelectItem value="Artist Channel">Artist Channel</SelectItem>
                                                <SelectItem value="Label Channel">Label Channel</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="channel_id">Channel ID</Label>
                                    <Input 
                                        id="channel_id"
                                        placeholder="UC..." 
                                        className="bg-zinc-900 border-white/10"
                                        value={formData.channel_id}
                                        onChange={(e) => setFormData({...formData, channel_id: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="channel_url">Channel URL (Optional)</Label>
                                    <Input 
                                        id="channel_url"
                                        placeholder="https://youtube.com/@..." 
                                        className="bg-zinc-900 border-white/10"
                                        value={formData.channel_url || ''}
                                        onChange={(e) => setFormData({...formData, channel_url: e.target.value})}
                                    />
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
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                                        Whitelist Channel
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Platform Quick Filter */}
            <div className="flex flex-wrap gap-2">
                {[
                    { name: 'All Platforms', icon: Globe },
                    { name: 'YouTube', icon: Youtube },
                    { name: 'Instagram', icon: Instagram },
                    { name: 'Facebook', icon: Facebook }
                ].map((p, i) => (
                    <Button 
                        key={i} 
                        variant="outline" 
                        onClick={() => setFilter(p.name)}
                        className={`h-11 px-6 bg-zinc-950 border-white/5 hover:bg-white/5 text-zinc-400 hover:text-white transition-all rounded-xl ${filter === p.name ? 'bg-white/5 text-white border-white/10 shadow-lg shadow-indigo-500/5' : ''}`}
                    >
                        <p.icon size={16} className="mr-3" />
                        <span className="text-[11px] font-bold uppercase tracking-widest">{p.name}</span>
                    </Button>
                ))}
            </div>

            {/* Main Content Area */}
            <Card className="bg-zinc-950/50 border-white/5 shadow-2xl overflow-hidden min-h-[450px]">
                <CardHeader className="p-8 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <CardTitle className="text-xl font-bold text-white flex items-center gap-3 text-zinc-100">
                                Whitelisted Channels
                                <span className="px-2 py-0.5 rounded-full bg-zinc-900 border border-white/10 text-zinc-500 font-mono text-xs font-medium">{filteredChannels.length} Total</span>
                            </CardTitle>
                            <CardDescription className="text-zinc-500 mt-1">Verified channels that are exempt from copyright claims.</CardDescription>
                        </div>
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                            <Input 
                                placeholder="Search channels by name or ID..." 
                                className="pl-10 h-11 bg-zinc-900/50 border-white/5 focus:border-emerald-500/50 text-white transition-all rounded-xl"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-20">
                            <Loader2 className="animate-spin text-emerald-500 mb-4" size={32} />
                            <p className="text-zinc-500 text-sm">Loading channels...</p>
                        </div>
                    ) : filteredChannels.length > 0 ? (
                        <>
                            {/* Desktop Table View */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                <thead className="bg-white/5 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                                    <tr>
                                        <th className="px-8 py-4">Channel</th>
                                        <th className="px-8 py-4">Platform</th>
                                        <th className="px-8 py-4">Type</th>
                                        <th className="px-8 py-4">Status</th>
                                        <th className="px-8 py-4">Channel ID</th>
                                        <th className="px-8 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredChannels.map((channel) => (
                                        <tr key={channel.id} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-xs font-bold text-emerald-500">
                                                        {channel.channel_name.substring(0,1)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-zinc-200">{channel.channel_name}</p>
                                                        {channel.channel_url && (
                                                            <a href={channel.channel_url} target="_blank" className="text-[10px] text-zinc-500 hover:text-emerald-400 flex items-center gap-1">
                                                                View Channel <ExternalLink size={10} />
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <Badge variant="outline" className="bg-zinc-900 border-white/5 text-zinc-400 uppercase text-[9px]">
                                                    {channel.platform}
                                                </Badge>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-[10px] uppercase font-black tracking-wider text-zinc-500">{channel.channel_type || 'Artist Channel'}</span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col gap-1">
                                                    {channel.status === 'approved' ? (
                                                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] uppercase px-1.5 py-0">Approved</Badge>
                                                    ) : channel.status === 'rejected' ? (
                                                        <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-[9px] uppercase px-1.5 py-0">Rejected</Badge>
                                                    ) : channel.status === 'processing' ? (
                                                        <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[9px] uppercase px-1.5 py-0">Processing</Badge>
                                                    ) : (
                                                        <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[9px] uppercase px-1.5 py-0">Pending</Badge>
                                                    )}
                                                    {channel.status === 'rejected' && channel.rejection_reason && (
                                                        <span className="text-[9px] text-rose-400/60 italic max-w-[120px] truncate">{channel.rejection_reason}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 font-mono text-xs text-zinc-500">
                                                {channel.channel_id}
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => handleDelete(channel.id)}
                                                    className="text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="block md:hidden divide-y divide-white/5 bg-black/20">
                                {filteredChannels.map((channel) => (
                                    <div key={channel.id} className="p-5 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3 min-w-0 shrink">
                                                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-[10px] font-black text-zinc-400 uppercase shrink-0">
                                                    {channel.platform.toLowerCase() === 'youtube' && <Youtube size={16} className="text-rose-500" />}
                                                    {channel.platform.toLowerCase() === 'facebook' && <Facebook size={16} className="text-blue-500" />}
                                                    {channel.platform.toLowerCase() === 'instagram' && <Instagram size={16} className="text-pink-500" />}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-black text-white uppercase tracking-tight truncate">{channel.channel_name}</p>
                                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{channel.channel_type || 'standard'}</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className={`rounded-full px-2.5 py-0 text-[7px] font-black uppercase tracking-wider border-none shrink-0 ${
                                                channel.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
                                                channel.status === 'processing' ? 'bg-amber-500/10 text-amber-400' :
                                                channel.status === 'rejected' ? 'bg-rose-500/10 text-rose-400' :
                                                'bg-indigo-500/10 text-indigo-400'
                                            }`}>
                                                {channel.status}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest mb-1">Channel ID</span>
                                                <span className="text-[10px] text-zinc-400 font-mono truncate">{channel.channel_id}</span>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 hover:bg-white/5 text-zinc-500"
                                                    onClick={() => {
                                                        const url = channel.platform.toLowerCase() === 'youtube' 
                                                            ? `https://youtube.com/channel/${channel.channel_id}`
                                                            : channel.platform.toLowerCase() === 'instagram'
                                                                ? `https://instagram.com/${channel.channel_id}`
                                                                : `https://facebook.com/${channel.channel_id}`;
                                                        window.open(url, '_blank');
                                                    }}
                                                >
                                                    <ExternalLink size={14} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 hover:bg-rose-500/10 text-rose-500/50 hover:text-rose-500"
                                                    onClick={() => handleDelete(channel.id)}
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest px-1">
                                            Whitelisted on: {new Date(channel.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-24 text-center">
                            <div className="w-24 h-24 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-700 mb-8 rotate-3 shadow-2xl transition-transform hover:rotate-0 duration-500">
                                <ShieldCheck size={40} className="text-zinc-800" />
                            </div>
                            <h4 className="text-xl font-black text-white uppercase tracking-tight">No whitelisted channels</h4>
                            <p className="text-zinc-500 text-sm max-w-sm mt-3 mx-auto leading-relaxed">
                                Prevent accidental copyright claims on your promotional partners, second channels, or authorized users by adding them here.
                            </p>
                            <div className="flex items-center gap-4 mt-10">
                                <Button onClick={() => setOpen(true)} className="bg-emerald-500 hover:bg-emerald-400 text-white font-black uppercase tracking-wider px-10 h-12 rounded-xl shadow-lg shadow-emerald-500/10">
                                    Start Whitelisting
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Best Practices Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
                <Card className="bg-zinc-950/50 border-white/5 border-l-2 border-l-indigo-500/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">How Whitelisting Works</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-zinc-400 leading-relaxed">
                            Whitelisting a channel ID (YouTube UCID, etc.) ensures our system automatically ignores any matches found on that channel. 
                            This is ideal for your own YouTube channel or promo channels you work with frequently.
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-950/50 border-white/5 border-l-2 border-l-emerald-500/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">One-time Clearances</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-zinc-400 leading-relaxed">
                            For single videos, use the <span className="text-white font-bold">Clear Claim</span> tool instead of whitelisting the entire channel. 
                            Whitelist should only be used for trusted partners who will use your music consistently.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
