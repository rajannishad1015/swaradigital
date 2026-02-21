'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Download, Loader2, Filter, Calendar } from "lucide-react"
import { getExportData } from './export-actions'
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Helper to parse JSON-stored artist/producer fields for export
function parseField(val: any): string {
    if (!val) return ''
    if (typeof val === 'string') {
        try {
            const parsed = JSON.parse(val)
            if (Array.isArray(parsed)) {
                return parsed.map((a: any) => {
                    // Start with name check
                    if (a.name) return a.name
                    // Check for firstName/lastName (common for credits)
                    if (a.firstName || a.lastName) return `${a.firstName || ''} ${a.lastName || ''}`.trim()
                    // Fallback
                    return String(a)
                }).join(', ')
            }
        } catch {}
        return val
    }
    if (Array.isArray(val)) {
        return val.map((a: any) => {
             if (a.name) return a.name
             if (a.firstName || a.lastName) return `${a.firstName || ''} ${a.lastName || ''}`.trim()
             return String(a)
        }).join(', ')
    }
    return String(val)
}

export default function ExportButton({ status = 'approved' }: { status?: string }) {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  
  // Filter States
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [genre, setGenre] = useState('')

  const handleExport = async () => {
    setLoading(true)
    try {
        const data = await getExportData(status, { startDate, endDate, genre })
        
        if (!data || data.length === 0) {
            toast.error(`No tracks found matching your filters.`)
            setLoading(false)
            return
        }

        // Pre-process data to find max columns needed
        let maxPrimary = 1
        let maxFeatured = 1
        let maxComposers = 1
        let maxLyricists = 1
        let maxProducers = 1

        const processedData = data.map((track: any) => {
             const parseList = (json: any) => {
                try {
                    const parsed = typeof json === 'string' ? JSON.parse(json) : json
                    if (Array.isArray(parsed)) {
                        return parsed.map((a: any) => a.name || `${a.firstName || ''} ${a.lastName || ''}`.trim()).filter(Boolean)
                    }
                    return []
                } catch { return [] }
            }

            const primary = parseList(track.primary_artist || track.albums?.primary_artist)
            // Fallback for primary artist if empty: check profile
            if (primary.length === 0 && (track.profiles?.artist_name || track.profiles?.full_name)) {
                primary.push(track.profiles.artist_name || track.profiles.full_name)
            }
            
            const featured = parseList(track.featuring_artist || track.albums?.featuring_artist)
            const composers = parseList(track.composers)
            const lyricists = parseList(track.lyricists)
            const producers = parseList(track.producers)

            maxPrimary = Math.max(maxPrimary, primary.length)
            maxFeatured = Math.max(maxFeatured, featured.length)
            maxComposers = Math.max(maxComposers, composers.length)
            maxLyricists = Math.max(maxLyricists, lyricists.length)
            maxProducers = Math.max(maxProducers, producers.length)

            return {
                ...track,
                _primary: primary,
                _featured: featured,
                _composers: composers,
                _lyricists: lyricists,
                _producers: producers
            }
        })

        // Generate Dynamic Headers
        const headers = [
            "Track Title",
            "Track Version",
            "Version Subtitle",
            // Dynamic Primary Artists
            ...Array.from({ length: maxPrimary }, (_, i) => `Primary Artist ${i + 1}`),
            // Dynamic Featured Artists
            ...Array.from({ length: maxFeatured }, (_, i) => `Featured Artist ${i + 1}`),
            "Album Title",
            "Album Type",
            "UPC",
            "ISRC",
            "Release Date",
            "Original Release Date",
            "Main Genre",
            "Sub Genre",
            "Language",
            "Title Language",
            "Lyrics Language",
            "Explicit?",
            "Explicit Type",
            "Instrumental?",
            "Duration (s)",
            "Track Number",
            "Label",
            "P Line (Album)",
            "C Line (Album)",
            "Track P Line",
            "Courtesy Line",
            "Album Description",
            "Publisher",
            "Production Year",
            "Price Tier",
            "Caller Tune Timing",
            "Distribute Video",
            "Selected Platforms",
            // Dynamic Composers
            ...Array.from({ length: maxComposers }, (_, i) => `Composer ${i + 1}`),
            // Dynamic Lyricists
            ...Array.from({ length: maxLyricists }, (_, i) => `Lyricist ${i + 1}`),
             // Dynamic Producers
            ...Array.from({ length: maxProducers }, (_, i) => `Producer ${i + 1}`),
            "Bitrate",
            "Sample Rate",
            "Channels",
            "Encoding",
            "Spotify ID",
            "Apple ID",
            "Audio File URL",
            "Cover Art URL",
            "Artist Email",
            "Lyrics"
        ]

        const rows = processedData.map((track: any) => {
            const formatDuration = (sec: number) => {
                if (!sec) return ""
                const m = Math.floor(sec / 60)
                const s = sec % 60
                return `${m}:${s.toString().padStart(2, '0')}`
            }
            
            const getCol = (arr: string[], index: number) => arr[index] || ""
            const formatList = (val: any) => {
                if (!val) return "";
                try {
                    const parsed = typeof val === 'string' ? JSON.parse(val) : val;
                    if (Array.isArray(parsed)) return parsed.join(', ');
                    return String(val);
                } catch { return String(val); }
            }

            return [
                track.title || "",
                track.version_type || "Original",
                track.version_subtitle || "",
                // Primary Artists
                ...Array.from({ length: maxPrimary }, (_, i) => getCol(track._primary, i)),
                // Featured Artists
                ...Array.from({ length: maxFeatured }, (_, i) => getCol(track._featured, i)),
                track.albums?.title || "Single",
                track.albums?.type || "Single",
                track.albums?.upc || "",
                track.isrc || "",
                track.albums?.release_date || "",
                track.albums?.original_release_date || "",
                track.genre || "",
                track.sub_genre || "",
                track.albums?.language || "",
                track.title_language || "English",
                track.lyrics_language || "",
                track.is_explicit ? "Yes" : "No",
                track.explicit_type || "",
                track.is_instrumental ? "Yes" : "No",
                track.duration || "",
                track.track_number || "",
                track.albums?.label_name || "",
                track.albums?.p_line || "",
                track.albums?.c_line || "",
                track.track_p_line || "",
                track.albums?.courtesy_line || "",
                track.albums?.description || "",
                track.publisher || "",
                track.production_year || "",
                track.price_tier || "",
                track.caller_tune_timing || "",
                track.distribute_video ? "Yes" : "No",
                formatList(track.albums?.target_platforms),
                // Composers
                ...Array.from({ length: maxComposers }, (_, i) => getCol(track._composers, i)),
                // Lyricists
                ...Array.from({ length: maxLyricists }, (_, i) => getCol(track._lyricists, i)),
                // Producers
                ...Array.from({ length: maxProducers }, (_, i) => getCol(track._producers, i)),
                track.bitrate || "",
                track.sample_rate || "",
                track.channels || "",
                track.encoding || "",
                track.primary_artist_spotify_id || "",
                track.primary_artist_apple_id || "",
                track.file_url || "", // Audio URL
                track.albums?.cover_art_url || "",
                track.profiles?.email || "",
                track.lyrics || ""
            ]
        })

        // CSV Construction
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => {
                const cellStr = String(cell || '')
                // Escape quotes and wrap in quotes if contains comma or quote
                if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
                    return `"${cellStr.replace(/"/g, '""')}"`
                }
                return cellStr
            }).join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `MusicFlow_Metadata_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        toast.success(`Exported ${data.length} tracks.`)
        setOpen(false)

    } catch (error: any) {
        toast.error("Export failed: " + error.message)
    } finally {
        setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
                <Filter size={16} /> Export Options
            </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md bg-zinc-950 border-white/10 text-white">
            <DialogHeader>
                <DialogTitle>Export Data</DialogTitle>
                <DialogDescription className="text-zinc-400">
                    Filter the data you want to export. Leave fields empty to export everything.
                </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="start-date" className="text-zinc-400">Start Date</Label>
                        <Input 
                            id="start-date" 
                            type="date" 
                            className="bg-zinc-900 border-white/10"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                         <Label htmlFor="end-date" className="text-zinc-400">End Date</Label>
                         <Input 
                            id="end-date" 
                            type="date" 
                            className="bg-zinc-900 border-white/10"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="genre" className="text-zinc-400">Genre</Label>
                    <Input 
                        id="genre" 
                        placeholder="e.g. Pop, Hip Hop" 
                        className="bg-zinc-900 border-white/10"
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                    />
                </div>
            </div>
            <DialogFooter className="sm:justify-between">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-zinc-400">Cancel</Button>
                <Button type="button" onClick={handleExport} disabled={loading} className="gap-2">
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                    Download CSV
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  )
}
