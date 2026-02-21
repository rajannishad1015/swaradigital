'use client'

import { useState, useEffect } from 'react'
import { 
    History, 
    Music, 
    User, 
    Facebook, 
    Instagram, 
    Send, 
    Clock, 
    AlertCircle, 
    Loader2, 
    PlayCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { getReleasesAndTracks, submitLinkRequest, getLinkHistory } from './actions'
import { Skeleton } from "@/components/ui/skeleton"

export default function ProfileLinkingPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [albums, setAlbums] = useState<any[]>([])
    const [tracks, setTracks] = useState<any[]>([])
    const [history, setHistory] = useState<any[]>([])
    
    const [formData, setFormData] = useState({
        album_id: '',
        track_id: '',
        artist_name: '',
        facebook_url: '',
        instagram_url: ''
    })

    useEffect(() => {
        loadInitialData()
    }, [])

    async function loadInitialData() {
        try {
            const [selectionData, historyData] = await Promise.all([
                getReleasesAndTracks(),
                getLinkHistory()
            ])
            setAlbums(selectionData.albums)
            setTracks(selectionData.tracks)
            setHistory(historyData)
        } catch (error) {
            toast.error("Failed to load data")
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.album_id || !formData.track_id || !formData.artist_name) {
            toast.error("Please fill in all required fields")
            return
        }

        setIsSubmitting(true)
        try {
            await submitLinkRequest(formData)
            toast.success("Profile linking request submitted")
            setFormData({
                album_id: '',
                track_id: '',
                artist_name: '',
                facebook_url: '',
                instagram_url: ''
            })
            // Refresh history
            const historyData = await getLinkHistory()
            setHistory(historyData)
        } catch (error: any) {
            toast.error(error.message || "Failed to submit request")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="p-6 space-y-8 max-w-4xl mx-auto">
                <Skeleton className="h-8 w-48 bg-white/5" />
                <Skeleton className="h-[300px] w-full bg-white/5 rounded-2xl" />
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
            {/* Page Header - Ultra Compact */}
            <div className="flex items-center justify-between border-b border-white/5 pb-5">
                <div className="space-y-0.5">
                    <h1 className="text-xl font-black text-white tracking-tighter uppercase mb-0">Profile Linking</h1>
                    <p className="text-[9px] text-zinc-500 font-bold tracking-[0.2em] uppercase">Meta-Sync Engine v2</p>
                </div>
                <div className="flex items-center gap-2 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                    <span className="text-[8px] uppercase font-black text-zinc-500 tracking-widest">Logs</span>
                    <span className="text-xs font-black text-white tabular-nums">{history.length}</span>
                </div>
            </div>

            {/* Main Form - Focused & Compact */}
            <div className="relative">
                <Card className="border border-white/10 bg-white/[0.02] backdrop-blur-3xl shadow-xl rounded-2xl overflow-hidden">
                    <CardContent className="p-6 md:p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
                                
                                {/* Select Release */}
                                <div className="space-y-1.5">
                                    <Label className="text-[8px] uppercase font-black text-zinc-500 tracking-[0.2em] ml-1 flex items-center gap-2">
                                        <Music className="w-3 h-3 text-indigo-500" />
                                        Release <span className="text-rose-500">*</span>
                                    </Label>
                                    <Select 
                                        value={formData.album_id} 
                                        onValueChange={(val) => setFormData(prev => ({ ...prev, album_id: val }))}
                                    >
                                        <SelectTrigger className="h-10 bg-black/40 border-white/5 text-white rounded-lg focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-bold text-[11px] uppercase tracking-wider">
                                            <SelectValue placeholder="CHOOSE" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#0c0c0e] border-white/10 text-white max-h-60 w-[var(--radix-select-trigger-width)]">
                                            {albums.map(album => (
                                                <SelectItem key={album.id} value={album.id} className="focus:bg-indigo-500 focus:text-white py-2 text-[11px]">
                                                    {album.title.toUpperCase()}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Select Audio */}
                                <div className="space-y-1.5">
                                    <Label className="text-[8px] uppercase font-black text-zinc-500 tracking-[0.2em] ml-1 flex items-center gap-2">
                                        <PlayCircle className="w-3 h-3 text-indigo-500" />
                                        Audio <span className="text-rose-500">*</span>
                                    </Label>
                                    <Select 
                                        value={formData.track_id} 
                                        onValueChange={(val) => setFormData(prev => ({ ...prev, track_id: val }))}
                                    >
                                        <SelectTrigger className="h-10 bg-black/40 border-white/5 text-white rounded-lg focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-bold text-[11px] uppercase tracking-wider">
                                            <SelectValue placeholder="CHOOSE" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#0c0c0e] border-white/10 text-white max-h-60 w-[var(--radix-select-trigger-width)]">
                                            {tracks
                                                .filter(t => !formData.album_id || t.album_id === formData.album_id)
                                                .map(track => (
                                                <SelectItem key={track.id} value={track.id} className="focus:bg-indigo-500 focus:text-white py-2 text-[11px]">
                                                    {track.title.toUpperCase()}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Artist Name */}
                                <div className="space-y-1.5">
                                    <Label className="text-[8px] uppercase font-black text-zinc-500 tracking-[0.2em] ml-1 flex items-center gap-2">
                                        <User className="w-3 h-3 text-indigo-500" />
                                        Artist Name <span className="text-rose-500">*</span>
                                    </Label>
                                    <Input
                                        placeholder="REQUIRED"
                                        value={formData.artist_name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, artist_name: e.target.value.toUpperCase() }))}
                                        className="h-10 bg-black/40 border-white/5 text-white placeholder:text-zinc-800 rounded-lg focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-black text-[11px]"
                                    />
                                </div>

                                {/* Facebook Link */}
                                <div className="space-y-1.5">
                                    <Label className="text-[8px] uppercase font-black text-zinc-500 tracking-[0.2em] ml-1 flex items-center gap-2">
                                        <Facebook className="w-3 h-3 text-[#1877F2]" />
                                        Facebook Link
                                    </Label>
                                    <Input
                                        placeholder="URL"
                                        value={formData.facebook_url}
                                        onChange={(e) => setFormData(prev => ({ ...prev, facebook_url: e.target.value }))}
                                        className="h-10 bg-black/40 border-white/5 text-white placeholder:text-zinc-800 rounded-lg focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-bold text-[11px]"
                                    />
                                </div>

                                {/* Instagram Link */}
                                <div className="space-y-1.5 md:col-span-2">
                                    <Label className="text-[8px] uppercase font-black text-zinc-500 tracking-[0.2em] ml-1 flex items-center gap-2">
                                        <Instagram className="w-3 h-3 text-[#E4405F]" />
                                        Instagram Link
                                    </Label>
                                    <Input
                                        placeholder="URL"
                                        value={formData.instagram_url}
                                        onChange={(e) => setFormData(prev => ({ ...prev, instagram_url: e.target.value }))}
                                        className="h-10 bg-black/40 border-white/5 text-white placeholder:text-zinc-800 rounded-lg focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-bold text-[11px]"
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end pt-2 border-t border-white/5 pt-6">
                                <Button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="bg-white text-black hover:bg-indigo-500 hover:text-white transition-all font-black text-[9px] uppercase tracking-[0.25em] rounded-full px-8 h-10 group/btn"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span>Send Request</span>
                                            <Send className="w-3 h-3 transition-transform group-hover/btn:translate-x-0.5" />
                                        </div>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* History Section - Slimmer Tracking */}
            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-white/5 rounded-lg border border-white/10">
                        <History className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                    <h2 className="text-sm font-black text-white tracking-widest uppercase">Request Log</h2>
                </div>

                <div className="bg-white/[0.01] border border-white/10 rounded-xl overflow-hidden backdrop-blur-md">
                    {/* Desktop Table View */}
                    <div className="hidden md:block">
                        <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-white/5 bg-white/[0.03] h-10">
                                <TableHead className="text-zinc-500 font-black uppercase tracking-[0.1em] text-[7px] px-5">Release Portfolio</TableHead>
                                <TableHead className="text-zinc-500 font-black uppercase tracking-[0.1em] text-[7px]">Artist Vector</TableHead>
                                <TableHead className="text-zinc-500 font-black uppercase tracking-[0.1em] text-[7px]">Socials</TableHead>
                                <TableHead className="text-zinc-500 font-black uppercase tracking-[0.1em] text-[7px]">Status</TableHead>
                                <TableHead className="text-zinc-500 font-black uppercase tracking-[0.1em] text-[7px] text-right px-5">Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {history.length === 0 ? (
                                <TableRow className="border-none">
                                    <TableCell colSpan={5} className="h-20 text-center text-zinc-700">
                                        <p className="font-black uppercase tracking-widest text-[8px]">Logs Empty</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                history.map((req) => (
                                    <TableRow key={req.id} className="hover:bg-white/[0.02] border-white/5 border-b last:border-0 transition-colors h-11">
                                        <TableCell className="px-5 font-bold text-white text-[10px]">
                                            <div className="flex flex-col">
                                                <span className="truncate max-w-[150px]">{req.albums?.title?.toUpperCase() || 'N/A'}</span>
                                                <span className="text-[8px] text-zinc-500 font-medium truncate max-w-[120px]">{req.tracks?.title?.toUpperCase()}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-indigo-400 font-black text-[9px]">
                                            {req.artist_name}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {req.facebook_url && (
                                                    <a href={req.facebook_url} target="_blank" rel="noopener noreferrer" className="p-1 bg-white/5 rounded border border-white/5 hover:border-white/20">
                                                        <Facebook size={9} className="text-white/70" />
                                                    </a>
                                                )}
                                                {req.instagram_url && (
                                                    <a href={req.instagram_url} target="_blank" rel="noopener noreferrer" className="p-1 bg-white/5 rounded border border-white/5 hover:border-white/20">
                                                        <Instagram size={9} className="text-white/70" />
                                                    </a>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <Badge variant="outline" className={`rounded-full px-2.5 py-0 text-[7px] font-black uppercase tracking-wider border-none w-fit ${
                                                    req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
                                                    req.status === 'rejected' ? 'bg-rose-500/10 text-rose-400' :
                                                    req.status === 'processing' ? 'bg-amber-500/10 text-amber-400' :
                                                    'bg-indigo-500/10 text-indigo-400'
                                                }`}>
                                                    {req.status}
                                                </Badge>
                                                {req.status === 'rejected' && req.rejection_reason && (
                                                    <span className="text-[7px] text-rose-500/70 font-medium italic max-w-[100px] truncate" title={req.rejection_reason}>
                                                        REASON: {req.rejection_reason.toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right text-zinc-600 font-bold text-[8px] px-5 tabular-nums">
                                            {new Date(req.created_at).toLocaleDateString('en-GB')}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                        </Table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="block md:hidden border-t border-white/5">
                        {history.length === 0 ? (
                            <div className="p-10 text-center opacity-40">
                                <p className="font-black uppercase tracking-widest text-[8px] text-zinc-500">Logs Empty</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {history.map((req) => (
                                    <div key={req.id} className="p-5 space-y-4">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-white uppercase tracking-wider truncate max-w-[200px]">
                                                    {req.albums?.title || 'N/A'}
                                                </p>
                                                <p className="text-[8px] text-zinc-500 font-bold uppercase truncate max-w-[180px]">
                                                    {req.tracks?.title || 'N/A'}
                                                </p>
                                            </div>
                                            <Badge variant="outline" className={`rounded-full px-2.5 py-0 text-[7px] font-black uppercase tracking-wider border-none w-fit shrink-0 ${
                                                req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
                                                req.status === 'rejected' ? 'bg-rose-500/10 text-rose-400' :
                                                req.status === 'processing' ? 'bg-amber-500/10 text-amber-400' :
                                                'bg-indigo-500/10 text-indigo-400'
                                            }`}>
                                                {req.status}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-black text-indigo-400 uppercase">{req.artist_name}</span>
                                                    <span className="text-[7px] text-zinc-600 font-bold">{new Date(req.created_at).toLocaleDateString('en-GB')}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {req.facebook_url && (
                                                    <a href={req.facebook_url} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-white/5 rounded border border-white/5">
                                                        <Facebook size={12} className="text-white/70" />
                                                    </a>
                                                )}
                                                {req.instagram_url && (
                                                    <a href={req.instagram_url} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-white/5 rounded border border-white/5">
                                                        <Instagram size={12} className="text-white/70" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>

                                        {req.status === 'rejected' && req.rejection_reason && (
                                            <div className="p-2.5 bg-rose-500/5 rounded-lg border border-rose-500/10">
                                                <p className="text-[8px] text-rose-400 font-bold uppercase leading-relaxed">
                                                    <span className="text-rose-500 mr-2">!</span>
                                                    REASON: {req.rejection_reason}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
