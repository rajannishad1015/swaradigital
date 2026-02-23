'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import React, { useState, useMemo } from "react"
import { Play, Pause, AlertCircle, Edit2, Trash2, ShieldAlert, ClipboardCheck, ChevronDown, ChevronRight, Disc } from 'lucide-react'
import { bulkDeleteTracks, requestTakedown, deleteTrack, requestCorrection } from "./actions"
import Link from 'next/link'
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"

export default function TrackList({ tracks }: { tracks: any[] }) {
  const [isTakedownOpen, setIsTakedownOpen] = useState(false)
  const [isCorrectionOpen, setIsCorrectionOpen] = useState(false)
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null)
  
  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})

  const [takedownReason, setTakedownReason] = useState('')
  const [correctionField, setCorrectionField] = useState('title')
  const [correctionValue, setCorrectionValue] = useState('')
  const [correctionReason, setCorrectionReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Grouping Logic
  const groupedReleases = useMemo(() => {
    const groups: Record<string, any> = {}
    
    tracks.forEach(track => {
      const albumId = track.album_id || `single-${track.id}`
      if (!groups[albumId]) {
        groups[albumId] = {
          id: albumId,
          isAlbum: !!track.album_id,
          albumData: track.albums,
          tracks: [],
          title: track.albums?.title || track.title,
          type: (track.albums?.type || (track.album_id ? 'album' : 'single')).toUpperCase(),
          genre: track.genre,
          status: track.status, // We'll simplify this to the first track's status or logic-based
          created_at: track.created_at,
          cover_art_url: track.albums?.cover_art_url
        }
      }
      groups[albumId].tracks.push(track)
    })
    
    return Object.values(groups).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [tracks])

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  // Helper Functions
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">Rejected</Badge>
      case 'draft':
        return <Badge className="bg-zinc-500/10 text-zinc-500 hover:bg-zinc-500/20 border-zinc-500/20">Draft</Badge>
      case 'pending':
        return <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20">Pending</Badge>
      default:
        return <Badge variant="outline" className="text-zinc-400 border-zinc-700">{status}</Badge>
    }
  }

  // Bulk Actions Handlers
  const handleSelectAll = (checked: boolean) => {
      if (checked) {
          setSelectedIds(tracks.map(t => t.id))
      } else {
          setSelectedIds([])
      }
  }

  const handleSelectOne = (checked: boolean, id: string) => {
      if (checked) {
          setSelectedIds(prev => [...prev, id])
      } else {
          setSelectedIds(prev => prev.filter(tid => tid !== id))
      }
  }

  const handleBulkDelete = async () => {
      if (selectedIds.length === 0) return
      if (!confirm(`Are you sure you want to delete ${selectedIds.length} tracks? This cannot be undone.`)) return

      setIsSubmitting(true)
      try {
          await bulkDeleteTracks(selectedIds)
          toast.success(`Successfully deleted ${selectedIds.length} tracks`)
          setSelectedIds([])
      } catch (err: any) {
          toast.error(err.message || "Bulk delete failed")
      } finally {
          setIsSubmitting(false)
      }
  }

  // Individual Action Handlers
  const handleDelete = async (id: string) => {
      if (!confirm("Are you sure you want to delete this track? This action cannot be undone.")) return

      try {
          await deleteTrack(id)
          toast.success("Track deleted successfully")
      } catch (err: any) {
          toast.error(err.message || "Failed to delete track")
      }
  }

  const openTakedownDialog = (id: string) => {
      setSelectedTrackId(id)
      setTakedownReason('')
      setIsTakedownOpen(true)
  }

  const submitTakedown = async () => {
      if (!selectedTrackId) return
      if (!takedownReason.trim()) {
          toast.error("Please provide a reason for takedown")
          return
      }

      setIsSubmitting(true)
      try {
          await requestTakedown(selectedTrackId, takedownReason)
          toast.success("Takedown request submitted")
          setIsTakedownOpen(false)
      } catch (err: any) {
          toast.error(err.message || "Failed to submit request")
      } finally {
          setIsSubmitting(false)
      }
  }

  // Filter selectable tracks for "Delete" (Draft/Rejected only)
  const canDeleteSelected = selectedIds.length > 0 && selectedIds.every(id => {
      const track = tracks.find(t => t.id === id)
      return track && (track.status === 'draft' || track.status === 'rejected')
  })

  return (
    <div className="rounded-md relative pb-20">
        <div className="hidden md:block">
            <Table>
                <TableHeader>
                    <TableRow className="border-white/5 hover:bg-transparent">
                        <TableHead className="w-[40px]">
                            <Checkbox 
                                checked={tracks.length > 0 && selectedIds.length === tracks.length}
                                onCheckedChange={handleSelectAll}
                                className="border-zinc-600 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                            />
                        </TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 h-10 w-[80px]">Cover</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 h-10">Title / Release</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 h-10">Genre</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 h-10">Status</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 h-10 text-right">Date</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 h-10 w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {groupedReleases.map((release) => (
                        <React.Fragment key={release.id}>
                            <TableRow className={`border-white/5 hover:bg-white/[0.02] transition-colors group ${expandedRows[release.id] ? 'bg-white/[0.04]' : ''}`}>
                                <TableCell className="py-4">
                                    {release.tracks.length === 1 ? (
                                        <Checkbox 
                                            checked={selectedIds.includes(release.tracks[0].id)}
                                            onCheckedChange={(checked) => handleSelectOne(checked as boolean, release.tracks[0].id)}
                                            className="border-zinc-600 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                                        />
                                    ) : (
                                         <div className="w-4" />
                                    )}
                                </TableCell>
                                <TableCell className="py-4">
                                    <div className="relative h-12 w-12 rounded-lg overflow-hidden shadow-lg border border-white/10 group-hover:border-white/30 transition-all">
                                        <img src={release.cover_art_url || "/placeholder.png"} alt="Cover" className="h-full w-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            {release.tracks.length === 1 ? <Play size={16} className="text-white fill-white" /> : <Disc size={16} className="text-white" />}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-white tracking-tight group-hover:text-indigo-400 transition-colors uppercase">{release.title}</span>
                                            {release.tracks.length > 1 && (
                                                <Badge variant="outline" className="text-[9px] h-4 px-1 bg-white/5 border-white/10 text-zinc-500 font-bold">
                                                    {release.tracks.length} TRACKS
                                                </Badge>
                                            )}
                                        </div>
                                         <span className="text-[10px] text-zinc-500 font-mono mt-1 flex items-center gap-2 uppercase">
                                             <span className="bg-white/5 px-1.5 py-0.5 rounded border border-white/5">{release.type}</span>
                                             {release.albumData?.upc && (
                                                 <span className="bg-white/5 px-1.5 py-0.5 rounded border border-white/5">UPC: {release.albumData.upc}</span>
                                             )}
                                             {release.tracks.length === 1 && release.tracks[0].isrc && (
                                                 <span className="bg-white/5 px-1.5 py-0.5 rounded border border-white/5">ISRC: {release.tracks[0].isrc}</span>
                                             )}
                                         </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-xs font-medium text-zinc-400 bg-white/5 px-2 py-1 rounded-md border border-white/5">
                                        {release.genre}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    {release.tracks.length === 1 ? getStatusBadge(release.tracks[0].status) : (
                                        <Badge variant="outline" className="text-zinc-500 border-zinc-800">MULTIPLE</Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <span className="text-xs font-medium text-zinc-500 tabular-nums">
                                        {new Date(release.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    {release.tracks.length > 1 ? (
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => toggleRow(release.id)}
                                            className="h-8 w-8 text-zinc-500 hover:text-white"
                                        >
                                            {expandedRows[release.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                        </Button>
                                    ) : (
                                        <div className="flex items-center gap-1">
                                            {(release.tracks[0].status === 'draft' || release.tracks[0].status === 'rejected') && (
                                                <>
                                                    <Link href={`/dashboard/tracks/${release.tracks[0].id}`}>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-white/10 rounded-full">
                                                            <Edit2 size={14} />
                                                        </Button>
                                                    </Link>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => handleDelete(release.tracks[0].id)}
                                                        className="h-8 w-8 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-full"
                                                    >
                                                        <Trash2 size={14} />
                                                    </Button>
                                                </>
                                            )}
                                            {release.tracks[0].status === 'approved' && (
                                                 <Button 
                                                 variant="ghost" 
                                                 size="icon" 
                                                 onClick={() => openTakedownDialog(release.tracks[0].id)}
                                                 className="h-8 w-8 text-zinc-500 hover:text-amber-500 hover:bg-amber-500/10 rounded-full"
                                             >
                                                 <ShieldAlert size={14} />
                                             </Button>
                                            )}
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                            
                            {/* Expanded Tracks */}
                            {expandedRows[release.id] && release.tracks.map((track: any, index: number) => (
                                <TableRow key={track.id} className="border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
                                    <TableCell className="pl-8">
                                        <Checkbox 
                                            checked={selectedIds.includes(track.id)}
                                            onCheckedChange={(checked) => handleSelectOne(checked as boolean, track.id)}
                                            className="border-zinc-600 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                                        />
                                    </TableCell>
                                    <TableCell className="text-[10px] font-bold text-zinc-600 text-center">
                                        {index + 1}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-zinc-300 text-sm">{track.title}</span>
                                            <span className="text-[9px] text-zinc-600 font-mono">ISRC: {track.isrc || 'PENDING'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell colSpan={2}>
                                        {getStatusBadge(track.status)}
                                    </TableCell>
                                    <TableCell colSpan={2} className="text-right">
                                        <div className="flex justify-end items-center gap-1">
                                            {(track.status === 'draft' || track.status === 'rejected') && (
                                                <>
                                                    <Link href={`/dashboard/tracks/${track.id}`}>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-600 hover:text-white">
                                                            <Edit2 size={12} />
                                                        </Button>
                                                    </Link>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => handleDelete(track.id)}
                                                        className="h-7 w-7 text-zinc-600 hover:text-red-500"
                                                    >
                                                        <Trash2 size={12} />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </React.Fragment>
                    ))}
                </TableBody>
            </Table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
            {/* Mobile Select All Header */}
            {tracks.length > 0 && (
                <div className="flex items-center gap-2 mb-4 px-1">
                    <Checkbox 
                        checked={tracks.length > 0 && selectedIds.length === tracks.length}
                        onCheckedChange={handleSelectAll}
                        className="border-zinc-600 data-[state=checked]:bg-indigo-500"
                    />
                    <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Select All Tracks</span>
                </div>
            )}

            {groupedReleases.map((release) => (
                <div key={release.id} className={`bg-white/5 border border-white/5 rounded-xl overflow-hidden transition-colors ${expandedRows[release.id] ? 'bg-white/10' : ''}`}>
                    <div className="p-4" onClick={() => release.tracks.length > 1 && toggleRow(release.id)}>
                        <div className="flex gap-4">
                            <div className="relative h-16 w-16 rounded-lg overflow-hidden shadow-lg border border-white/10 shrink-0">
                                <img src={release.cover_art_url || "/placeholder.png"} alt="Cover" className="h-full w-full object-cover" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <div className="pr-2">
                                        <h3 className="font-bold text-white text-sm truncate uppercase leading-tight">{release.title}</h3>
                                         <p className="text-[10px] text-zinc-500 font-mono mt-0.5 uppercase">
                                            {(release.type || 'SINGLE').toUpperCase()}
                                            {release.albumData?.upc && ` • UPC: ${release.albumData.upc}`}
                                            {release.tracks.length === 1 && release.tracks[0].isrc && ` • ISRC: ${release.tracks[0].isrc}`}
                                         </p>
                                    </div>
                                    {release.tracks.length === 1 ? getStatusBadge(release.tracks[0].status) : (
                                        <div className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded text-[10px] font-bold text-zinc-500">
                                            {release.tracks.length} <Disc size={10} />
                                        </div>
                                    )}
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-zinc-400">
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-zinc-600 block">Genre</span>
                                        {release.genre}
                                    </div>
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-zinc-600 block">Date</span>
                                        {new Date(release.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {release.tracks.length > 1 && (
                            <div className="mt-3 flex items-center justify-center border-t border-white/5 pt-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest gap-1">
                                {expandedRows[release.id] ? 'Hide' : 'View'} {release.tracks.length} Tracks {expandedRows[release.id] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                            </div>
                        )}
                    </div>

                    {/* Mobile Expanded Tracks */}
                    {expandedRows[release.id] && release.tracks.length > 1 && (
                        <div className="bg-black/20 border-t border-white/5">
                            {release.tracks.map((track: any, index: number) => (
                                <div key={track.id} className="p-3 border-b border-white/5 last:border-0 flex items-center gap-3">
                                    <Checkbox 
                                        checked={selectedIds.includes(track.id)}
                                        onCheckedChange={(checked) => handleSelectOne(checked as boolean, track.id)}
                                        className="border-zinc-600 data-[state=checked]:bg-indigo-500"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-white truncate">{index + 1}. {track.title}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            {getStatusBadge(track.status)}
                                            <span className="text-[9px] text-zinc-600 font-mono">ISRC: {track.isrc || 'PENDING'}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        {(track.status === 'draft' || track.status === 'rejected') && (
                                            <Link href={`/dashboard/tracks/${track.id}`}>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-500">
                                                    <Edit2 size={12} />
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Single Track Actions */}
                    {release.tracks.length === 1 && (
                        <div className="px-4 pb-4 border-t border-white/5 pt-3 flex justify-end gap-2">
                             {(release.tracks[0].status === 'draft' || release.tracks[0].status === 'rejected') && (
                                <>
                                    <Link href={`/dashboard/tracks/${release.tracks[0].id}`}>
                                        <Button variant="ghost" size="sm" className="h-8 md:h-8 text-zinc-400">
                                            <Edit2 size={14} className="mr-2" /> Edit
                                        </Button>
                                    </Link>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => handleDelete(release.tracks[0].id)}
                                        className="h-8 md:h-8 text-red-400"
                                    >
                                        <Trash2 size={14} className="mr-2" /> Delete
                                    </Button>
                                </>
                             )}
                        </div>
                    )}
                </div>
            ))}
        </div>

        {selectedIds.length > 0 && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-zinc-900/90 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full flex items-center gap-6 shadow-2xl z-50 animate-in slide-in-from-bottom-5">
                <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest">
                    {selectedIds.length} Selected
                </span>
                <div className="h-4 w-px bg-white/10"></div>
                <div className="flex items-center gap-2">
                    {canDeleteSelected ? (
                        <Button 
                            onClick={handleBulkDelete} 
                            disabled={isSubmitting}
                            variant="destructive"
                            size="sm"
                            className="rounded-full h-8 text-xs font-bold uppercase tracking-wider bg-red-500 hover:bg-red-600"
                        >
                            {isSubmitting ? 'Deleting...' : 'Delete Selected'}
                        </Button>
                    ) : (
                        <span className="text-[10px] text-zinc-500 italic">Selection contains non-deletable items</span>
                    )}
                    <Button 
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedIds([])}
                        className="rounded-full h-8 text-xs text-zinc-400 hover:text-white"
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        )}

        <Dialog open={isCorrectionOpen} onOpenChange={setIsCorrectionOpen}>
            <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-indigo-400">
                        <ClipboardCheck size={20} /> Request Correction
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Suggest metadata updates for your approved release. Admins will review the changes.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label className="text-zinc-300">Field to Correct</Label>
                        <select 
                            value={correctionField} 
                            onChange={(e) => setCorrectionField(e.target.value)}
                            className="bg-white/5 border border-white/10 text-white rounded-md p-2 text-sm"
                        >
                            <option value="title">Release Title</option>
                            <option value="isrc">ISRC</option>
                            <option value="genre">Genre</option>
                            <option value="primary_artist">Artist Name</option>
                            <option value="p_line">P-Line</option>
                            <option value="c_line">C-Line</option>
                        </select>
                    </div>
                    <div className="grid gap-2">
                        <Label className="text-zinc-300">New Value</Label>
                        <Input
                            value={correctionValue}
                            onChange={(e) => setCorrectionValue(e.target.value)}
                            placeholder="Enter the correct metadata..."
                            className="bg-white/5 border-white/10 text-white"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label className="text-zinc-300">Reason / Reference</Label>
                        <Textarea
                            value={correctionReason}
                            onChange={(e) => setCorrectionReason(e.target.value)}
                            placeholder="Why is this change necessary?"
                            className="bg-white/5 border-white/10 text-white min-h-[80px]"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsCorrectionOpen(false)} className="text-zinc-400 hover:text-white">Cancel</Button>
                    <Button 
                        onClick={async () => {
                            if (!selectedTrackId) return;
                            setIsSubmitting(true);
                            try {
                                await requestCorrection(selectedTrackId, correctionField, correctionValue, correctionReason);
                                toast.success("Correction request submitted");
                                setIsCorrectionOpen(false);
                            } catch (err: any) {
                                toast.error(err.message || "Failed to submit request");
                            } finally {
                                setIsSubmitting(false);
                            }
                        }} 
                        disabled={isSubmitting} 
                        className="bg-indigo-600 hover:bg-indigo-500 text-white"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Update'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <Dialog open={isTakedownOpen} onOpenChange={setIsTakedownOpen}>
            <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-amber-500">
                        <ShieldAlert size={20} /> Request Takedown
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Are you sure you want to take down this release? This action will notify the admin team.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="reason" className="text-zinc-300">Reason for removal</Label>
                        <Textarea
                            id="reason"
                            value={takedownReason}
                            onChange={(e) => setTakedownReason(e.target.value)}
                            placeholder="Please explain why you want to take down this release..."
                            className="bg-white/5 border-white/10 text-white min-h-[100px]"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsTakedownOpen(false)} className="text-zinc-400 hover:text-white">Cancel</Button>
                    <Button onClick={submitTakedown} disabled={isSubmitting} className="bg-amber-600 hover:bg-amber-500 text-white">
                        {isSubmitting ? 'Submitting...' : 'Submit Request'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  )
}
