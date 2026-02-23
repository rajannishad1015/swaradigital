"use client"

import React, { useState, useRef, useMemo } from 'react'
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
import MetadataEditor from '@/components/admin/metadata-editor'
import { Pencil } from 'lucide-react'
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Check, X, Download, Search, Music, ExternalLink, Play, Pause, MoreVertical, Disc, ChevronDown, ChevronRight } from 'lucide-react'
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
import { toast } from 'sonner'

export default function ContentList({ initialTracks, status = 'pending' }: { initialTracks: any[], status?: string }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingTrack, setEditingTrack] = useState<any>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [selectedRelease, setSelectedRelease] = useState<any>(null)
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})
  
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

  // Grouping Logic
  const groupedReleases = useMemo(() => {
    const groups: Record<string, any> = {}
    
    filteredTracks.forEach(track => {
      const albumId = track.album_id || `single-${track.id}`
      if (!groups[albumId]) {
        groups[albumId] = {
          id: albumId,
          isAlbum: !!track.album_id,
          type: track.albums?.type || 'single',
          albumData: track.albums,
          profiles: track.profiles,
          tracks: [],
          title: track.albums?.title || track.title,
          genre: track.genre || track.albums?.genre,
          created_at: track.created_at,
          cover_art_url: track.albums?.cover_art_url
        }
      }
      groups[albumId].tracks.push(track)
    })
    
    return Object.values(groups).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [filteredTracks])

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

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
        setTimeout(() => {
            if(audioRef.current) {
                audioRef.current.src = track.file_url
                audioRef.current.play()
            }
        }, 0)
    }
  }

  const handleApprove = async (ids: string | string[], e?: React.MouseEvent) => {
    e?.stopPropagation()
    try {
        await updateTrackStatus(ids, 'approved')
        toast.success("Release(s) approved successfully")
    } catch (err: any) {
        toast.error(err.message || "Failed to approve")
    }
  }

  const handleReject = async () => {
    if (!selectedRelease) return
    const ids = selectedRelease.tracks.map((t: any) => t.id)
    try {
        await updateTrackStatus(ids, 'rejected', rejectionReason)
        setIsRejectDialogOpen(false)
        setRejectionReason('')
        setSelectedRelease(null)
        toast.success("Release(s) rejected")
    } catch (err: any) {
        toast.error(err.message || "Failed to reject")
    }
  }

  const openRejectDialog = (release: any, e?: React.MouseEvent) => {
      e?.stopPropagation()
      setSelectedRelease(release)
      setIsRejectDialogOpen(true)
  }

  const handleDownload = (track: any) => {
      const tracksToExport = track.album_id 
          ? initialTracks.filter((t: any) => t.album_id === track.album_id)
          : [track];

      tracksToExport.sort((a, b) => (a.track_number || 0) - (b.track_number || 0));

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
      <div className="relative w-full md:max-w-md group z-10">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
        <Input 
          placeholder="Search Title, Artist, UPC, ISRC..." 
          className="pl-9 bg-zinc-900/50 border-white/5 text-white placeholder:text-zinc-600 focus-visible:ring-indigo-500/50 h-10 rounded-xl transition-all w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} onPause={() => setIsPlaying(false)} onPlay={() => setIsPlaying(true)} className="hidden" />

      <div className="hidden md:block bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 bg-white/[0.02] hover:bg-white/[0.02]">
              <TableHead className="w-[300px] text-[10px] uppercase font-black tracking-widest text-zinc-500">Release Info</TableHead>
              <TableHead className="hidden lg:table-cell text-[10px] uppercase font-black tracking-widest text-zinc-500">Details</TableHead>
              <TableHead className="hidden lg:table-cell text-[10px] uppercase font-black tracking-widest text-zinc-500">Identifiers</TableHead>
              <TableHead className="hidden xl:table-cell text-[10px] uppercase font-black tracking-widest text-zinc-500">Genre</TableHead>
              <TableHead className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Tracks</TableHead>
              <TableHead className="text-right text-[10px] uppercase font-black tracking-widest text-zinc-500">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groupedReleases.map((release) => (
              <React.Fragment key={release.id}>
                  <TableRow className={`border-white/5 hover:bg-white/[0.02] transition-colors group ${expandedRows[release.id] ? 'bg-white/[0.04]' : ''}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative group/cover w-10 h-10 shrink-0">
                            {release.cover_art_url ? (
                                <img src={release.cover_art_url} alt={release.title} className="w-full h-full object-cover rounded-md shadow-md" />
                            ) : (
                                <div className="w-full h-full bg-zinc-800 rounded-md flex items-center justify-center">
                                    <Disc size={16} className="text-zinc-600" />
                                </div>
                            )}
                             {release.tracks.length === 1 && (
                                <button 
                                    onClick={() => handlePlayPause(release.tracks[0])}
                                    className={cn(
                                        "absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity rounded-md",
                                        currentTrackId === release.tracks[0].id && isPlaying ? "opacity-100" : "opacity-0 group-hover/cover:opacity-100"
                                    )}
                                >
                                    {currentTrackId === release.tracks[0].id && isPlaying ? (
                                        <Pause size={16} className="text-white fill-current" />
                                    ) : (
                                        <Play size={16} className="text-white fill-current" />
                                    )}
                                </button>
                             )}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="font-bold text-white text-sm truncate group-hover:text-indigo-400 transition-colors block max-w-[180px] uppercase">{release.title}</span>
                            <span className="text-xs text-zinc-500 font-medium truncate block max-w-[180px]">{release.profiles?.artist_name || 'Unknown'}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white truncate max-w-[150px] uppercase">{release.type}</span>
                        <Badge variant="outline" className="w-fit text-[9px] uppercase tracking-wider h-4 px-1 bg-white/5 border-white/10 text-zinc-500 font-bold mt-1">
                          {release.tracks.length} {release.tracks.length === 1 ? 'TRACK' : 'TRACKS'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[9px] h-4 px-1 bg-white/5 border-white/10 text-zinc-400 font-mono tracking-wider">UPC</Badge>
                            <span className="text-xs font-mono text-zinc-300">{release.albumData?.upc || (release.tracks.length === 1 ? release.tracks[0].isrc : 'N/A')}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <Badge variant="secondary" className="bg-white/5 text-zinc-400 hover:bg-white/10 border-white/5">
                        {release.genre}
                      </Badge>
                    </TableCell>
                    <TableCell>
                       {release.tracks.length > 1 && (
                            <Button variant="ghost" size="sm" onClick={() => toggleRow(release.id)} className="text-zinc-500 hover:text-white gap-2">
                                {expandedRows[release.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                {expandedRows[release.id] ? 'Hide' : 'Tracks'}
                            </Button>
                       )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-white" onClick={() => handleDownload(release.tracks[0])}>
                              <Download size={14} />
                          </Button>

                          {release.tracks.length === 1 && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setEditingTrack(release.tracks[0])
                                    setIsEditDialogOpen(true)
                                }}
                              >
                                <Pencil size={14} />
                              </Button>
                          )}

                          {(!status || status === 'pending') && (
                              <>
                                  <Button size="sm" className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 h-8 rounded-lg font-bold text-xs" onClick={(e) => handleApprove(release.tracks.map((t: any) => t.id), e)}>
                                      Approve {release.tracks.length > 1 ? 'All' : ''}
                                  </Button>
                                  <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 rounded-lg font-bold text-xs" onClick={(e) => openRejectDialog(release, e)}>
                                      Reject {release.tracks.length > 1 ? 'All' : ''}
                                  </Button>
                              </>
                          )}

                          {status === 'approved' && (
                              <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 rounded-lg font-bold text-xs" onClick={(e) => openRejectDialog(release, e)}>
                                  Take Down
                              </Button>
                          )}
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Expanded Tracks */}
                  {expandedRows[release.id] && release.tracks.map((track: any, index: number) => (
                      <TableRow key={track.id} className="border-white/5 bg-white/[0.01] hover:bg-white/[0.02]">
                          <TableCell className="pl-12">
                              <div className="flex items-center gap-3">
                                  <button onClick={() => handlePlayPause(track)} className="text-zinc-500 hover:text-indigo-400">
                                      {currentTrackId === track.id && isPlaying ? <Pause size={14} /> : <Play size={14} />}
                                  </button>
                                  <span className="text-sm font-medium text-zinc-300">{index + 1}. {track.title}</span>
                              </div>
                          </TableCell>
                          <TableCell colSpan={2}>
                              <div className="flex items-center gap-4">
                                  <span className="text-[10px] font-mono text-zinc-500">ISRC: {track.isrc || 'N/A'}</span>
                                  <Badge variant="outline" className="text-[9px] h-4 px-1">{track.status}</Badge>
                              </div>
                          </TableCell>
                          <TableCell colSpan={2}>
                               {/* Track specific actions could go here if needed, but usually we approve at release level */}
                          </TableCell>
                          <TableCell className="text-right">
                               <div className="flex justify-end gap-2">
                                 <a href={`/dashboard/content/${track.id}`}>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-500 hover:text-white">
                                        <ExternalLink size={12} />
                                    </Button>
                                 </a>
                                 <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-7 w-7 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                                    onClick={() => {
                                        setEditingTrack(track)
                                        setIsEditDialogOpen(true)
                                    }}
                                 >
                                    <Pencil size={12} />
                                 </Button>
                                </div>
                          </TableCell>
                      </TableRow>
                  ))}
              </React.Fragment>
            ))}
            {groupedReleases.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center text-zinc-500">
                  <div className="flex flex-col items-center gap-3">
                    <Music size={32} className="opacity-20" />
                    <p>No releases found</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {groupedReleases.map((release) => (
            <div key={release.id} className="bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden active:scale-[0.99] transition-transform">
                <div className="p-4 flex flex-col gap-4" onClick={() => release.tracks.length > 1 && toggleRow(release.id)}>
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                             <div className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden shadow-lg border border-white/10">
                                {release.cover_art_url ? (
                                    <img src={release.cover_art_url} alt={release.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                                        <Disc size={20} className="text-zinc-600" />
                                    </div>
                                )}
                            </div>
                            <div className="pr-2">
                                <h3 className="font-bold text-white text-sm truncate leading-tight uppercase">{release.title}</h3>
                                <p className="text-[10px] text-zinc-500 truncate max-w-[100px] font-medium mt-0.5">{release.profiles?.artist_name || 'Unknown'}</p>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <Badge variant="outline" className="text-[8px] h-3 px-1 uppercase">{release.type}</Badge>
                                    <span className="text-zinc-700 font-bold text-[8px]">•</span>
                                    <span className="text-[9px] text-zinc-500 font-mono">{release.tracks.length} TRACKS</span>
                                </div>
                            </div>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-zinc-500">
                              <MoreVertical size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-zinc-950 border-white/10 text-white min-w-[160px] rounded-xl p-1">
                            <DropdownMenuItem onClick={() => handleDownload(release.tracks[0])} className="h-9 px-3 rounded-lg hover:bg-white/5 cursor-pointer">
                                <Download size={14} className="mr-2 opacity-50" /> Download Metadata
                            </DropdownMenuItem>
                            {release.tracks.length === 1 && (
                                <DropdownMenuItem 
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setEditingTrack(release.tracks[0])
                                        setIsEditDialogOpen(true)
                                    }} 
                                    className="h-9 px-3 rounded-lg hover:bg-indigo-500/10 cursor-pointer text-indigo-400"
                                >
                                    <Pencil size={14} className="mr-2 opacity-50" /> Edit Metadata
                                </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {release.tracks.length > 1 && (
                        <div className="flex items-center justify-center py-1 bg-white/5 rounded-lg text-[10px] font-bold text-zinc-500 uppercase tracking-widest gap-2">
                            {expandedRows[release.id] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                            {expandedRows[release.id] ? 'Hide' : 'View'} {release.tracks.length} Tracks
                        </div>
                    )}
                </div>

                {/* Mobile Expanded Tracks */}
                {expandedRows[release.id] && (
                    <div className="bg-black/20 border-t border-white/5">
                        {release.tracks.map((track: any, index: number) => (
                            <div key={track.id} className="p-3 border-b border-white/5 last:border-0 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <button onClick={(e) => { e.stopPropagation(); handlePlayPause(track); }} className="text-zinc-500">
                                        {currentTrackId === track.id && isPlaying ? <Pause size={12} /> : <Play size={12} />}
                                    </button>
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium text-white truncate">{index + 1}. {track.title}</p>
                                        <p className="text-[8px] text-zinc-600 font-mono">ISRC: {track.isrc || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8 text-indigo-400 hover:bg-indigo-500/10"
                                      onClick={(e) => {
                                          e.stopPropagation()
                                          setEditingTrack(track)
                                          setIsEditDialogOpen(true)
                                      }}
                                  >
                                      <Pencil size={14} />
                                  </Button>
                                  <a href={`/dashboard/content/${track.id}`} onClick={(e) => e.stopPropagation()}>
                                      <ExternalLink size={14} className="text-zinc-500 hover:text-white" />
                                  </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Actions Grid */}
                <div className="grid grid-cols-2 gap-2 p-4 pt-0">
                     {(!status || status === 'pending') && (
                          <>
                              <Button className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 h-10 rounded-xl font-bold text-sm transition-all active:scale-95" onClick={(e) => { e.stopPropagation(); handleApprove(release.tracks.map((t: any) => t.id), e); }}>
                                  Approve {release.tracks.length > 1 ? 'All' : ''}
                              </Button>
                              <Button variant="ghost" className="bg-red-500/5 text-red-400 hover:text-white hover:bg-red-500 border border-red-500/10 h-10 rounded-xl font-bold text-sm transition-all active:scale-95" onClick={(e) => { e.stopPropagation(); openRejectDialog(release, e); }}>
                                  Reject {release.tracks.length > 1 ? 'All' : ''}
                              </Button>
                          </>
                      )}
                      
                      {status === 'approved' && (
                           <Button variant="ghost" className="col-span-2 bg-red-500/5 text-red-400 hover:text-white hover:bg-red-500 border border-red-500/10 h-10 rounded-xl font-bold text-sm" onClick={(e) => { e.stopPropagation(); openRejectDialog(release, e); }}>
                              Take Down Release
                          </Button>
                      )}
                </div>
            </div>
        ))}
        {groupedReleases.length === 0 && (
             <div className="flex flex-col items-center justify-center h-48 text-zinc-500 gap-3 border border-white/5 rounded-2xl bg-zinc-900/20">
                <Music size={32} className="opacity-20" />
                <p>No releases found</p>
            </div>
        )}
      </div>

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white sm:rounded-2xl w-[90%] max-w-[400px] rounded-2xl mx-auto">
            <DialogHeader>
                <DialogTitle className="text-left">{status === 'approved' ? 'Take Down' : 'Reject'} Release</DialogTitle>
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl bg-zinc-950 border-white/10 text-white overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil size={20} className="text-indigo-400" />
              Edit Track Metadata
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            {editingTrack && <MetadataEditor track={editingTrack} initialEdit={true} />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
