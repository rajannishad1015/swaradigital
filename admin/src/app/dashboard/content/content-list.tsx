'use client'

import { useState, useRef, useEffect } from 'react'
import { updateTrackStatus } from './actions'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Check, X, Download, Search, Music, ExternalLink, Play, Pause, MoreVertical, Disc } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

export default function ContentList({ initialTracks, status = 'pending' }: { initialTracks: any[], status?: string }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTrack, setSelectedTrack] = useState<any>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  
  // Audio Player State
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const filteredTracks = initialTracks.filter(track => 
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (track.profiles?.artist_name || track.profiles?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (track.isrc || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (track.albums?.upc || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (track.albums?.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handlePlayPause = (track: any) => {
    if (currentTrackId === track.id) {
        if (isPlaying) {
            audioRef.current?.pause()
            setIsPlaying(false)
        } else {
            audioRef.current?.play()
            setIsPlaying(true)
        }
    } else {
        if (audioRef.current) {
            audioRef.current.pause()
        }
        setCurrentTrackId(track.id)
        setIsPlaying(true)
        // We'll set the src in the render or effect, but here we just update state
        // actually better to have a single audio element that we control
        setTimeout(() => {
            if(audioRef.current) {
                audioRef.current.src = track.file_url
                audioRef.current.play()
            }
        }, 0)
    }
  }

  const handleApprove = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    try {
        await updateTrackStatus(id, 'approved')
    } catch (e) {
        console.error(e)
    }
  }

  const handleReject = async () => {
    if (!selectedTrack) return
    try {
        await updateTrackStatus(selectedTrack.id, 'rejected', rejectionReason)
        setIsRejectDialogOpen(false)
        setRejectionReason('')
        setSelectedTrack(null)
    } catch (e) {
        console.error(e)
    }
  }

  const openRejectDialog = (track: any, e?: React.MouseEvent) => {
      e?.stopPropagation()
      setSelectedTrack(track)
      setIsRejectDialogOpen(true)
  }

  const handleDownload = (track: any) => {
      // Find all tracks that belong to the same album/EP from the loaded list
      const tracksToExport = track.album_id 
          ? initialTracks.filter((t: any) => t.album_id === track.album_id)
          : [track];

      // Sort by track number if available, otherwise by created_at
      tracksToExport.sort((a, b) => (a.track_number || 0) - (b.track_number || 0));

      // Helper to format JSON lists to string
      const formatList = (val: any) => {
          if (!val) return "";
          try {
              const parsed = typeof val === 'string' ? JSON.parse(val) : val;
              if (Array.isArray(parsed)) {
                  return parsed.map(item => {
                      if (typeof item === 'object') {
                          if (item.name) return item.name;
                          if (item.firstName || item.lastName) return `${item.firstName || ''} ${item.lastName || ''}`.trim();
                          return JSON.stringify(item);
                      }
                      return item;
                  }).join(', ');
              }
              return String(val);
          } catch (e) {
              return String(val);
          }
      }

      // Expanded Metadata Headers
      const headers = [
          "Track Title", "Track Version", "Version Subtitle", "Artist Name", "Featured Artist", 
          "Album Title", "Album Type", "UPC", "ISRC", "Release Date", "Original Release Date",
          "Main Genre", "Sub Genre", "Language", "Title Language", "Lyrics Language",
          "Explicit?", "Explicit Type", "Instrumental?", "Duration (s)", 
          "Track Number", "Label", "P Line (Album)", "C Line (Album)", "Track P Line",
          "Courtesy Line", "Album Description", "Producers", "Composers", "Lyricists", 
          "Publisher", "Production Year", "Price Tier", "Caller Tune Timing", "Distribute Video",
          "Selected Platforms", "Bitrate", "Sample Rate", "Channels", "Encoding",
          "Spotify ID", "Apple ID", "Cover Art URL", "Audio File URL", "Artist Email", "Lyrics"
      ]

      // Map Data Rows
      const rows = tracksToExport.map(t => [
          t.title,
          t.version_type || "",
          t.version_subtitle || "",
          formatList(t.primary_artist) || t.profiles?.artist_name || t.profiles?.full_name || "",
          formatList(t.featuring_artist) || t.albums?.featuring_artist || "",
          t.albums?.title || "Single",
          t.albums?.type || "Single",
          t.albums?.upc || "",
          t.isrc || "",
          t.albums?.release_date || "",
          t.albums?.original_release_date || "",
          t.genre || t.albums?.genre || "",
          t.sub_genre || t.albums?.sub_genre || "",
          t.language || "",
          t.title_language || "",
          t.lyrics_language || "",
          t.is_explicit ? "Yes" : "No",
          t.explicit_type || "",
          t.is_instrumental ? "Yes" : "No",
          t.duration,
          t.track_number,
          t.albums?.label_name || "",
          t.albums?.p_line || "",
          t.albums?.c_line || "",
          t.track_p_line || "",
          t.albums?.courtesy_line || "",
          t.albums?.description || "",
          formatList(t.producers),
          formatList(t.composers),
          formatList(t.lyricists),
          t.publisher || "",
          t.production_year || "",
          t.price_tier || "",
          t.caller_tune_timing || "",
          t.distribute_video ? "Yes" : "No",
          formatList(t.albums?.target_platforms),
          t.bitrate || "",
          t.sample_rate || "",
          t.channels || "",
          t.encoding || "",
          t.primary_artist_spotify_id || t.albums?.primary_artist_spotify_id || "",
          t.primary_artist_apple_id || t.albums?.primary_artist_apple_id || "",
          t.albums?.cover_art_url || "",
          t.file_url,
          t.profiles?.email,
          t.lyrics || ""
      ])

      const csvContent = [
          headers.join(','),
          ...rows.map(row => row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(','))
      ].join('\n')

      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${track.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_metadata.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative w-full md:max-w-md group z-10">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
        <Input 
          placeholder="Search Title, Artist, UPC, ISRC..." 
          className="pl-9 bg-zinc-900/50 border-white/5 text-white placeholder:text-zinc-600 focus-visible:ring-indigo-500/50 h-10 rounded-xl transition-all w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Hidden Audio Element */}
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} onPause={() => setIsPlaying(false)} onPlay={() => setIsPlaying(true)} className="hidden" />

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 bg-white/[0.02] hover:bg-white/[0.02]">
              <TableHead className="w-[300px] text-[10px] uppercase font-black tracking-widest text-zinc-500">Track Info</TableHead>
              <TableHead className="hidden lg:table-cell text-[10px] uppercase font-black tracking-widest text-zinc-500">Album/EP</TableHead>
              <TableHead className="hidden lg:table-cell text-[10px] uppercase font-black tracking-widest text-zinc-500">Identifiers</TableHead>
              <TableHead className="hidden xl:table-cell text-[10px] uppercase font-black tracking-widest text-zinc-500">Genre</TableHead>
              <TableHead className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Preview</TableHead>
              <TableHead className="text-right text-[10px] uppercase font-black tracking-widest text-zinc-500">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTracks.map((track) => (
              <TableRow key={track.id} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative group/cover w-10 h-10 shrink-0">
                        {track.albums?.cover_art_url ? (
                            <img src={track.albums.cover_art_url} alt={track.title} className="w-full h-full object-cover rounded-md shadow-md" />
                        ) : (
                            <div className="w-full h-full bg-zinc-800 rounded-md flex items-center justify-center">
                                <Disc size={16} className="text-zinc-600" />
                            </div>
                        )}
                         <button 
                            onClick={() => handlePlayPause(track)}
                            className={cn(
                                "absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity rounded-md",
                                currentTrackId === track.id && isPlaying ? "opacity-100" : "opacity-0 group-hover/cover:opacity-100"
                            )}
                         >
                            {currentTrackId === track.id && isPlaying ? (
                                <Pause size={16} className="text-white fill-current" />
                            ) : (
                                <Play size={16} className="text-white fill-current" />
                            )}
                         </button>
                    </div>
                    <div className="flex flex-col min-w-0">
                        <a href={`/dashboard/content/${track.id}`} className="font-bold text-white text-sm truncate group-hover:text-indigo-400 transition-colors hover:underline block max-w-[180px]">{track.title}</a>
                        <span className="text-xs text-zinc-500 font-medium truncate block max-w-[180px]">{track.profiles?.artist_name || 'Unknown'}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white truncate max-w-[150px]">{track.albums?.title || 'Single'}</span>
                    <Badge variant="outline" className="w-fit text-[9px] uppercase tracking-wider h-4 px-1 bg-white/5 border-white/10 text-zinc-500 font-bold mt-1">
                      {track.albums?.type || 'single'}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[9px] h-4 px-1 bg-white/5 border-white/10 text-zinc-400 font-mono tracking-wider">UPC</Badge>
                        <span className="text-xs font-mono text-zinc-300">{track.albums?.upc || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[9px] h-4 px-1 bg-white/5 border-white/10 text-zinc-400 font-mono tracking-wider">ISRC</Badge>
                        <span className="text-xs font-mono text-zinc-300">{track.isrc || 'N/A'}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  <Badge variant="secondary" className="bg-white/5 text-zinc-400 hover:bg-white/10 border-white/5">
                    {track.genre}
                  </Badge>
                </TableCell>
                <TableCell>
                  {/* Mini Visualizer / Progress Bar placeholder */}
                   <div className="w-24 h-1 bg-zinc-800 rounded-full overflow-hidden">
                        {currentTrackId === track.id && isPlaying && (
                            <div className="h-full bg-indigo-500 animate-pulse w-2/3" />
                        )}
                   </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-white" onClick={() => handleDownload(track)}>
                          <Download size={14} />
                      </Button>

                      {(!status || status === 'pending') && (
                          <>
                              <Button size="sm" className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 h-8 rounded-lg font-bold text-xs" onClick={(e) => handleApprove(track.id, e)}>
                                  Approve
                              </Button>
                              <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 rounded-lg font-bold text-xs" onClick={(e) => openRejectDialog(track, e)}>
                                  Reject
                              </Button>
                          </>
                      )}

                      {status === 'approved' && (
                          <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 rounded-lg font-bold text-xs" onClick={(e) => openRejectDialog(track, e)}>
                              Take Down
                          </Button>
                      )}
                      
                      {status === 'rejected' && (
                           <Button size="sm" variant="outline" className="h-8 rounded-lg bg-zinc-900 border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-800" onClick={(e) => handleApprove(track.id, e)}>
                              Re-Approve
                          </Button>
                      )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {filteredTracks.map((track) => (
            <div key={track.id} className="bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-2xl p-4 flex flex-col gap-4 active:scale-[0.99] transition-transform">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                         <div className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden shadow-lg border border-white/10">
                            {track.albums?.cover_art_url ? (
                                <img src={track.albums.cover_art_url} alt={track.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                                    <Disc size={20} className="text-zinc-600" />
                                </div>
                            )}
                            <button 
                                onClick={() => handlePlayPause(track)}
                                className="absolute inset-0 bg-black/30 flex items-center justify-center"
                            >
                                <div className={cn(
                                    "w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 transition-transform active:scale-90",
                                    currentTrackId === track.id && isPlaying ? "text-indigo-400" : "text-white"
                                )}>
                                    {currentTrackId === track.id && isPlaying ? (
                                        <Pause size={14} fill="currentColor" />
                                    ) : (
                                        <Play size={14} fill="currentColor" className="ml-0.5" />
                                    )}
                                </div>
                            </button>
                        </div>
                        <div className="pr-2">
                            <h3 className="font-bold text-white text-sm truncate leading-tight">{track.title}</h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <p className="text-[10px] text-zinc-500 font-mono">ID: {track.id.substring(0, 8).toUpperCase()}</p>
                                <span className="text-zinc-700 font-bold">•</span>
                                <p className="text-[10px] text-zinc-500 truncate max-w-[100px] font-medium italic">{track.albums?.title || 'Single'}</p>
                            </div>
                        </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-zinc-500">
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-zinc-950 border-white/10 text-white min-w-[160px] rounded-xl p-1">
                        <DropdownMenuItem onClick={() => handleDownload(track)} className="h-9 px-3 rounded-lg hover:bg-white/5 cursor-pointer">
                            <Download size={14} className="mr-2 opacity-50" /> Download Metadata
                        </DropdownMenuItem>
                        <a href={`/dashboard/content/${track.id}`}>
                            <DropdownMenuItem className="h-9 px-3 rounded-lg hover:bg-white/5 cursor-pointer text-indigo-400 focus:text-indigo-400">
                                <ExternalLink size={14} className="mr-2 opacity-50" /> View Details
                            </DropdownMenuItem>
                        </a>
                      </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Progress bar visual for mobile if playing */}
                {currentTrackId === track.id && (
                    <div className="h-1 bg-zinc-800 rounded-full overflow-hidden w-full">
                         <div className="h-full bg-indigo-500 animate-[progress_30s_linear_infinite] w-full origin-left" />
                    </div>
                )}

                {/* Actions Grid */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                     {(!status || status === 'pending') && (
                          <>
                              <Button className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 h-10 rounded-xl font-bold text-sm transition-all active:scale-95" onClick={(e) => handleApprove(track.id, e)}>
                                  Approve
                              </Button>
                              <Button variant="ghost" className="bg-red-500/5 text-red-400 hover:text-white hover:bg-red-500 border border-red-500/10 h-10 rounded-xl font-bold text-sm transition-all active:scale-95" onClick={(e) => openRejectDialog(track, e)}>
                                  Reject
                              </Button>
                          </>
                      )}
                      
                      {/* Other status actions logic similar to desktop... */}
                      {status === 'approved' && (
                           <Button variant="ghost" className="col-span-2 bg-red-500/5 text-red-400 hover:text-white hover:bg-red-500 border border-red-500/10 h-10 rounded-xl font-bold text-sm" onClick={(e) => openRejectDialog(track, e)}>
                              Take Down
                          </Button>
                      )}
                </div>
            </div>
        ))}

        {filteredTracks.length === 0 && (
             <div className="flex flex-col items-center justify-center h-48 text-zinc-500 gap-3 border border-white/5 rounded-2xl bg-zinc-900/20">
                <Music size={32} className="opacity-20" />
                <p>No tracks found</p>
            </div>
        )}
      </div>

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white sm:rounded-2xl w-[90%] max-w-[400px] rounded-2xl mx-auto">
            <DialogHeader>
                <DialogTitle className="text-left">{status === 'approved' ? 'Take Down' : 'Reject'} Track</DialogTitle>
                <DialogDescription className="text-left text-zinc-400">
                    Reason for {status === 'approved' ? 'taking down' : 'rejection'}:
                </DialogDescription>
            </DialogHeader>
            <Textarea 
                placeholder="e.g. Low audio quality, copyright infringement..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[120px] bg-zinc-900/50 border-white/10 focus-visible:ring-indigo-500/50 resize-none rounded-xl"
            />
            <DialogFooter className="flex-row gap-2 sm:justify-end">
                <Button variant="ghost" onClick={() => setIsRejectDialogOpen(false)} className="flex-1 sm:flex-none rounded-xl h-10">Cancel</Button>
                <Button variant="destructive" onClick={handleReject} className="flex-1 sm:flex-none rounded-xl h-10 bg-red-500 hover:bg-red-600">
                    {status === 'approved' ? 'Confirm' : 'Reject'}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
