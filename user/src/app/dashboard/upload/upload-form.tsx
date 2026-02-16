'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { submitTrack } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { UploadCloud, Loader2, Music, Image as ImageIcon, X, Calendar, Disc, Check, ChevronRight, ChevronLeft, Save, Plus, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import AudioPlayer from '@/components/audio-player'
import UploadSuccessDialog from '@/components/upload/upload-success-dialog'
import { useRouter } from 'next/navigation'


interface TrackItem {
    id: string;
    title: string;
    audioFile: File | null;
    audioUrl?: string;
    duration: number;
    audioAnalysis: any;
    trackVersion: string;
    versionSubtitle: string;
    isInstrumental: string;
    primaryArtist: string;
    primaryArtistSpotify: string;
    primaryArtistApple: string;
    featuringArtist: string;
    featuringArtistSpotify: string;
    featuringArtistApple: string;
    genre: string;
    subGenre: string;
    pLine: string;
    titleLanguage: string;
    lyricsLanguage: string;
    lyrics: string;
    lyricists: {firstName: string, lastName: string}[];
    composers: {firstName: string, lastName: string}[];
    producer: string;
    productionYear: string;
    publisher: string;
    hasISRC: string;
    isrc: string;
    priceTier: string;
    explicitType: string;
    callerTuneTiming: string;
    distributeVideo: string;
}

const ALL_PLATFORMS = [
    { id: 'spotify', name: 'Spotify', icon: '' },
    { id: 'apple_music', name: 'Apple Music', icon: '' },
    { id: 'amazon', name: 'Amazon Music', icon: '' },
    { id: 'youtube', name: 'YouTube Music', icon: '' },
    { id: 'tidal', name: 'Tidal', icon: '' },
    { id: 'deezer', name: 'Deezer', icon: '' },
    { id: 'jiosaavn', name: 'JioSaavn', icon: '' },
    { id: 'gaana', name: 'Gaana', icon: '' },
]

export default function UploadForm({ initialData, isFirstUpload }: { initialData?: Record<string, any>, isFirstUpload?: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [draftLoaded, setDraftLoaded] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  
  // File States
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [duration, setDuration] = useState(initialData?.duration || 0)

  // Core Metadata
  const [releaseType, setReleaseType] = useState(initialData?.albums?.type || 'single')
  const [title, setTitle] = useState(initialData?.title || '')
  const [labelName, setLabelName] = useState(initialData?.albums?.label_name || '')
  const [primaryArtist, setPrimaryArtist] = useState(initialData?.albums?.primary_artist || '')
  const [primaryArtistSpotify, setPrimaryArtistSpotify] = useState(initialData?.albums?.primary_artist_spotify_id || '')
  const [primaryArtistApple, setPrimaryArtistApple] = useState(initialData?.albums?.primary_artist_apple_id || '')
  const [featuringArtist, setFeaturingArtist] = useState(initialData?.albums?.featuring_artist || '')
  const [featuringArtistSpotify, setFeaturingArtistSpotify] = useState(initialData?.albums?.featuring_artist_spotify_id || '')
  const [featuringArtistApple, setFeaturingArtistApple] = useState(initialData?.albums?.featuring_artist_apple_id || '')
  const [genre, setGenre] = useState(initialData?.genre || '')
  const [subGenre, setSubGenre] = useState(initialData?.albums?.sub_genre || '')
  const [courtesyLine, setCourtesyLine] = useState(initialData?.albums?.courtesy_line || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [language, setLanguage] = useState(initialData?.albums?.language || 'english')
  
  // Dates
  const [releaseDate, setReleaseDate] = useState(initialData?.albums?.release_date ? new Date(initialData.albums.release_date).toISOString().split('T')[0] : '')
  const [originalReleaseDate, setOriginalReleaseDate] = useState(initialData?.albums?.original_release_date ? new Date(initialData.albums.original_release_date).toISOString().split('T')[0] : '')

  // Identifiers & Legal
  const currentYear = new Date().getFullYear().toString()
  const [upc, setUpc] = useState(initialData?.albums?.upc || '') 
  
  // Track Details State (Refactored for Multi-track)
  const [tracks, setTracks] = useState<TrackItem[]>(() => {
    if (initialData?.tracks?.length > 0) {
        return initialData?.tracks?.map((t: Record<string, any>) => ({
            id: t.id,
            title: t.title,
            audioUrl: t.file_url,
            duration: t.duration || 0,
            audioAnalysis: t.audio_analysis || null,
            trackVersion: t.version_type || 'original',
            versionSubtitle: t.version_subtitle || '',
            primaryArtist: t.primary_artist || '',
            primaryArtistSpotify: t.primary_artist_spotify_id || '',
            primaryArtistApple: t.primary_artist_apple_id || '',
            featuringArtist: t.featuring_artist || '',
            featuringArtistSpotify: t.featuring_artist_spotify_id || '',
            featuringArtistApple: t.featuring_artist_apple_id || '',
            genre: t.genre || '',
            subGenre: t.sub_genre || '',
            pLine: t.track_p_line || '',
            titleLanguage: t.title_language || 'english',
            lyricsLanguage: t.lyrics_language || 'english',
            lyrics: t.lyrics || '',
            lyricists: t.lyricists || [],
            composers: t.composers || [],
            producer: t.producers || '',
            productionYear: t.production_year || currentYear,
            publisher: t.publisher || '',
            hasISRC: t.isrc ? 'yes' : 'no',
            isrc: t.isrc || '',
            priceTier: t.price_tier || 'mid',
            explicitType: t.explicit_type || 'no',
            callerTuneTiming: t.caller_tune_timing || '',
            distributeVideo: t.distribute_video ? 'yes' : 'no'
        }))
    }
    return [{
        id: 'initial',
        title: initialData?.title || '',
        audioFile: null,
        duration: 0,
        audioAnalysis: null,
        trackVersion: 'original',
        versionSubtitle: '',
        primaryArtist: '',
        primaryArtistSpotify: '',
        primaryArtistApple: '',
        featuringArtist: '',
        featuringArtistSpotify: '',
        featuringArtistApple: '',
        genre: '',
        subGenre: '',
        pLine: '',
        titleLanguage: 'english',
        lyricsLanguage: 'english',
        lyrics: '',
        lyricists: [],
        composers: [],
        producer: '',
        productionYear: currentYear,
        publisher: '',
        hasISRC: 'no',
        isrc: '',
        priceTier: 'mid',
        explicitType: 'no',
        callerTuneTiming: '',
        distributeVideo: 'no',
        isInstrumental: 'no'
    }]
  })
  
  const [activeTrackId, setActiveTrackId] = useState<string>('initial')
  const currentTrack = tracks.find(t => t.id === activeTrackId) || tracks[0]

  const updateCurrentTrack = (updates: Partial<TrackItem>) => {
    setTracks(prev => prev.map(t => t.id === activeTrackId ? { ...t, ...updates } : t))
  }

  const addTrack = () => {
    const newId = Math.random().toString(36).substr(2, 9)
    setTracks([...tracks, {
        id: newId,
        title: `Untitled Track ${tracks.length + 1}`,
        audioFile: null,
        duration: 0,
        audioAnalysis: null,
        trackVersion: 'original',
        versionSubtitle: '',
        primaryArtist: '',
        primaryArtistSpotify: '',
        primaryArtistApple: '',
        featuringArtist: '',
        featuringArtistSpotify: '',
        featuringArtistApple: '',
        genre: '',
        subGenre: '',
        pLine: '',
        titleLanguage: 'english',
        lyricsLanguage: 'english',
        lyrics: '',
        lyricists: [],
        composers: [],
        producer: '',
        productionYear: currentYear,
        publisher: '',
        hasISRC: 'no',
        isrc: '',
        priceTier: 'mid',
        explicitType: 'no',
        callerTuneTiming: '',
        distributeVideo: 'no',
        isInstrumental: 'no'
    }])
    setActiveTrackId(newId)
  }

  const removeTrack = (id: string) => {
    if (tracks.length === 1) {
        toast.error("At least one track is required.")
        return
    }
    setTracks(tracks.filter(t => t.id !== id))
    if (activeTrackId === id) {
        setActiveTrackId(tracks.find(t => t.id !== id)?.id || '')
    }
  }

  // Success Dialog State
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false)

  // Artist Dialog State
  const [isArtistDialogOpen, setIsArtistDialogOpen] = useState(false)
  const [artistDialogMode, setArtistDialogMode] = useState<'release' | 'track' | 'release-featuring' | 'track-featuring'>('release')
  const [artistDialogName, setArtistDialogName] = useState('')
  const [artistDialogSpotify, setArtistDialogSpotify] = useState('')
  const [artistDialogApple, setArtistDialogApple] = useState('')

  // Lyricists/Composers Input State (Temporary for current track)
  const [newLyricistFirst, setNewLyricistFirst] = useState('')
  const [newLyricistLast, setNewLyricistLast] = useState('')
  const [newComposerFirst, setNewComposerFirst] = useState('')
  const [newComposerLast, setNewComposerLast] = useState('')

  const openArtistDialog = (mode: 'release' | 'track' | 'release-featuring' | 'track-featuring') => {
      setArtistDialogMode(mode)
      if (mode === 'release') {
          setArtistDialogName(primaryArtist)
          setArtistDialogSpotify(primaryArtistSpotify)
          setArtistDialogApple(primaryArtistApple)
      } else if (mode === 'release-featuring') {
          setArtistDialogName(featuringArtist)
          setArtistDialogSpotify(featuringArtistSpotify)
          setArtistDialogApple(featuringArtistApple)
      } else if (mode === 'track') {
          setArtistDialogName(currentTrack.primaryArtist)
          setArtistDialogSpotify(currentTrack.primaryArtistSpotify)
          setArtistDialogApple(currentTrack.primaryArtistApple)
       } else if (mode === 'track-featuring') {
          setArtistDialogName(currentTrack.featuringArtist)
          setArtistDialogSpotify(currentTrack.featuringArtistSpotify)
          setArtistDialogApple(currentTrack.featuringArtistApple)
      }
      setIsArtistDialogOpen(true)
  }

  const saveArtistDetails = () => {
      if (!artistDialogName) return 
      
      if (artistDialogMode === 'release') {
          setPrimaryArtist(artistDialogName)
          setPrimaryArtistSpotify(artistDialogSpotify)
          setPrimaryArtistApple(artistDialogApple)
      } else if (artistDialogMode === 'release-featuring') {
          setFeaturingArtist(artistDialogName)
          setFeaturingArtistSpotify(artistDialogSpotify)
          setFeaturingArtistApple(artistDialogApple)
      } else if (artistDialogMode === 'track') {
          updateCurrentTrack({
              primaryArtist: artistDialogName,
              primaryArtistSpotify: artistDialogSpotify,
              primaryArtistApple: artistDialogApple
          })
      } else if (artistDialogMode === 'track-featuring') {
          updateCurrentTrack({
              featuringArtist: artistDialogName,
              featuringArtistSpotify: artistDialogSpotify,
              featuringArtistApple: artistDialogApple
          })
      }
      setIsArtistDialogOpen(false)
  }

  // Platforms
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(initialData?.albums?.target_platforms || ALL_PLATFORMS.map(p => p.id))


  // Parse initial P/C lines or default
  const parseLine = (line: string, type: 'P' | 'C') => {
      if (!line) return { year: currentYear, text: '' }
      const match = line.match(/(\d{4})\s+(.*)/)
      if (match) return { year: match[1], text: match[2] }
      return { year: currentYear, text: line.replace(/[℗©]\s*/, '').trim() }
  }

  const initialP = parseLine(initialData?.albums?.p_line || '', 'P')
  const initialC = parseLine(initialData?.albums?.c_line || '', 'C')

  const [pLineYear, setPLineYear] = useState(initialP.year)
  const [pLineText, setPLineText] = useState(initialP.text)
  const [cLineYear, setCLineYear] = useState(initialC.year)
  const [cLineText, setCLineText] = useState(initialC.text)

  const clearDraft = () => {
    if(confirm("Are you sure you want to discard this draft? All unsaved progress will be lost.")) {
        localStorage.removeItem('upload_draft')
        setDraftLoaded(false)
        window.location.reload()
    }
  }
  
  // Helpers
  const addLyricist = () => {
    if(newLyricistFirst && newLyricistLast) {
        updateCurrentTrack({
            lyricists: [...currentTrack.lyricists, { firstName: newLyricistFirst, lastName: newLyricistLast }]
        })
        setNewLyricistFirst('')
        setNewLyricistLast('')
    }
  }
  const removeLyricist = (i: number) => {
      updateCurrentTrack({
          lyricists: currentTrack.lyricists.filter((_, idx) => idx !== i)
      })
  }

  const addComposer = () => {
    if(newComposerFirst && newComposerLast) {
        updateCurrentTrack({
            composers: [...currentTrack.composers, { firstName: newComposerFirst, lastName: newComposerLast }]
        })
        setNewComposerFirst('')
        setNewComposerLast('')
    }
  }
  const removeComposer = (i: number) => {
      updateCurrentTrack({
          composers: currentTrack.composers.filter((_, idx) => idx !== i)
      })
  }
  
  const togglePlatform = (id: string) => {
      if (selectedPlatforms.includes(id)) {
          setSelectedPlatforms(selectedPlatforms.filter(p => p !== id))
      } else {
          setSelectedPlatforms([...selectedPlatforms, id])
      }
  }
  
  const toggleAllPlatforms = () => {
      if (selectedPlatforms.length === ALL_PLATFORMS.length) {
          setSelectedPlatforms([])
      } else {
          setSelectedPlatforms(ALL_PLATFORMS.map(p => p.id))
      }
  }


  const releaseTypes = [
      { id: 'ep', label: 'EP' },
      { id: 'single', label: 'Single' },
      { id: 'album', label: 'Album' },
      { id: 'compilation', label: 'Compilation' },
  ]
  
  const currentYearInt = new Date().getFullYear()
  const years = Array.from({ length: currentYearInt - 1900 + 1 }, (_, i) => (currentYearInt - i).toString())


  // Audio Validation State
  const [audioAnalysis, setAudioAnalysis] = useState<{
      bitrate: number
      sampleRate: number
      channels: number
      format: string
      duration: number
      peakLevel?: number
      clippingDetected?: boolean
      silenceDetected?: boolean
      averageVolume?: number
  } | null>(null)
  
  const [analyzingFile, setAnalyzingFile] = useState(false)

  const handleAudioChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
        // Validate Format (Client-side extension check first)
        const allowedExtensions = ['wav', 'flac', 'mp3']
        const ext = file.name.split('.').pop()?.toLowerCase()
        if (!ext || !allowedExtensions.includes(ext)) {
            toast.error("Invalid file format. Please upload WAV, FLAC, or MP3.")
            e.target.value = '' // Clear input
            return
        }

       setAnalyzingFile(true)
       try {
           const parseBlob = await import('music-metadata-browser').then(m => m.parseBlob)
           const metadata = await parseBlob(file)
           
           const format = metadata.format
           const bitrate = format.bitrate ? Math.round(format.bitrate / 1000) : 0 // kbps
           const sampleRate = format.sampleRate || 0
           const duration = format.duration || 0
           const channels = format.numberOfChannels || 0
           
           // Basic Metadata Validation Rules
           if (bitrate < 128) {
               toast.error(`Bitrate too low (${bitrate}kbps). Minimum 128kbps required (320kbps recommended).`)
               e.target.value = ''
               setAnalyzingFile(false)
               return
           }
           
           if (duration < 30) {
               toast.error("Track is too short. Minimum 30 seconds required.")
               e.target.value = ''
               setAnalyzingFile(false)
               return
           }

           // Deep Audio Analysis (Web Audio API)
           let deepAnalysis = {}
           try {
                const { AudioAnalyzer } = await import('@/lib/audio-analysis')
                const analyzer = new AudioAnalyzer()
                const result = await analyzer.analyzeFile(file)
                
                deepAnalysis = {
                    peakLevel: result.peakLevel,
                    clippingDetected: result.clippingDetected,
                    silenceDetected: result.silenceDetected,
                    averageVolume: result.averageVolume
                }

                if (result.clippingDetected) {
                    toast.warning("Warning: Possible audio clipping detected (Peak > -0.1dB).", { duration: 5000 })
                }
                if (result.silenceDetected) {
                    toast.warning("Warning: Extended silence detected in track.", { duration: 5000 })
                }

           } catch (analysisErr) {
               console.warn("Deep audio analysis failed, proceeding with basic metadata", analysisErr)
           }

           // If all good
           updateCurrentTrack({
               audioFile: file,
               duration: Math.round(duration),
               audioAnalysis: {
                   bitrate,
                   sampleRate,
                   channels,
                   format: ext.toUpperCase(),
                   duration,
                   ...deepAnalysis
               }
           })
           
           if (!Object.keys(deepAnalysis).length) {
               toast.success("Audio basics valid!")
           } else {
               toast.success("Audio analysis complete!")
           }

       } catch (error) {
           console.error("Audio analysis failed", error)
           toast.error("Failed to analyze audio file. Please ensure it is a valid audio file.")
           e.target.value = ''
       } finally {
           setAnalyzingFile(false)
       }
    }
  }

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate File Size & Type
      if (!file.type.startsWith('image/')) {
        toast.error("Please upload a valid image file.")
        return
      }

      const img = new Image()
      img.src = URL.createObjectURL(file)
      img.onload = () => {
        if (img.width < 3000 || img.height < 3000) {
          toast.error(`Artwork is too small (${img.width}x${img.height}px). Minimum 3000x3000px required.`, {
             description: "High-quality artwork is required for platforms like Apple Music and Spotify."
          })
          e.target.value = '' // Clear input
          setCoverFile(null)
        } else if (img.width !== img.height) {
          toast.warning(`Artwork is not square (${img.width}x${img.height}px). Square artwork is highly recommended.`)
          setCoverFile(file)
        } else {
          setCoverFile(file)
          toast.success("Artwork validated!")
        }
        URL.revokeObjectURL(img.src)
      }
      img.onerror = () => {
        toast.error("Failed to load image. Please try another file.")
        URL.revokeObjectURL(img.src)
      }
    }
  }
  
  const validateStep = (step: number) => {
      if (step === 1) {
          if (!releaseType) { toast.error("Please select a release type."); return false; }
          if (!title.trim()) { toast.error("Release title is required."); return false; }
          if (title.length > 100) { toast.error("Title is too long (max 100 chars)."); return false; }
          if (!labelName.trim()) { toast.error("Label name is required."); return false; }
          if (!primaryArtist.trim()) { toast.error("Primary artist is required."); return false; }
          if (!releaseDate) { toast.error("Release date is required."); return false; }
          
          const selectedDate = new Date(releaseDate);
          const today = new Date();
          today.setHours(0,0,0,0);
          if (selectedDate < today) {
              toast.warning("Note: The release date is in the past. This may be rejected by some platforms.");
          }

          if (!coverFile && !initialData?.albums?.cover_art_url) {
              toast.error("Cover art is mandatory.");
              return false;
          }
      }
      if (step === 2) {
          // Validate all tracks
          for (const track of tracks) {
              if (!track.audioFile && !track.audioUrl) {
                  toast.error(`Audio file missing for track: ${track.title || 'Untitled'}`);
                  setActiveTrackId(track.id);
                  return false;
              }
              if (!track.title.trim()) {
                  toast.error("Track title is required.");
                  setActiveTrackId(track.id);
                  return false;
              }
              if (!track.genre) {
                  toast.error(`Genre is required for track: ${track.title}`);
                  setActiveTrackId(track.id);
                  return false;
              }
              if (track.hasISRC === 'yes' && !/^[A-Z]{2}[A-Z0-9]{3}[0-9]{7}$/.test(track.isrc)) {
                  toast.error(`Invalid ISRC format for track: ${track.title}`);
                  setActiveTrackId(track.id);
                  return false;
              }
          }
      }
      return true
  }

  const nextStep = () => {
      if (validateStep(currentStep)) {
          setCurrentStep(prev => Math.min(prev + 1, 4))
          window.scrollTo(0, 0)
      }
  }
  
  const prevStep = () => {
      setCurrentStep(prev => Math.max(prev - 1, 1))
      window.scrollTo(0, 0)
  }

  const handleSubmit = async (e: React.FormEvent | React.MouseEvent, status: 'pending' | 'draft' = 'pending') => {
    e.preventDefault()
    
    setLoading(true)
    const supabase = createClient()
    const timestamp = Date.now()

    try {
        // 1. Upload Cover Art if changed
        let coverArtUrl = initialData?.albums?.cover_art_url
        if (coverFile) {
            const coverPath = `covers/${timestamp}_${coverFile.name}`
            const { error: coverError } = await supabase.storage.from('cover-art').upload(coverPath, coverFile)
            if (coverError) throw coverError
            const { data: coverData } = supabase.storage.from('cover-art').getPublicUrl(coverPath)
            coverArtUrl = coverData.publicUrl
        }

        // 2. Process all tracks
        const processedTracks = await Promise.all(tracks.map(async (track, index) => {
            let audioUrl = track.audioUrl
            
            // Upload audio if a new file is provided
            if (track.audioFile) {
                const audioPath = `tracks/${timestamp}_${index}_${track.audioFile.name}`
                const { error: audioError } = await supabase.storage.from('music-files').upload(audioPath, track.audioFile)
                if (audioError) throw audioError
                const { data: audioData } = supabase.storage.from('music-files').getPublicUrl(audioPath)
                audioUrl = audioData.publicUrl
            }

            return {
                ...track,
                audioUrl,
                // Clean up for database
                isrc: track.hasISRC === 'yes' ? track.isrc : '',
                explicit: track.explicitType === 'yes'
            }
        }))

        const formData = {
            id: initialData?.id,
            title,
            releaseType,
            labelName,
            primaryArtist,
            primaryArtistSpotify,
            primaryArtistApple,
            featuringArtist,
            featuringArtistSpotify,
            featuringArtistApple,
            releaseDate,
            originalReleaseDate,
            pLine: `℗ ${pLineYear} ${pLineText}`,
            cLine: `© ${cLineYear} ${cLineText}`,
            courtesyLine,
            description,
            language,
            coverArtUrl,
            selectedPlatforms,
            status: status,
            tracks: processedTracks
        }

        const result = await submitTrack(formData)
        if (result.success) {
            localStorage.removeItem('upload_draft')
            toast.success(initialData ? "Release updated successfully!" : "Release submitted successfully!")
            
            if (!initialData) {
                setIsSuccessDialogOpen(true)
            } else {
                router.push('/dashboard/catalog')
            }
        }
    } catch (error: unknown) {
        console.error(error)
        const errorMessage = error instanceof Error ? error.message : "Failed to submit release";
        toast.error(errorMessage)
    } finally {
        setLoading(false)
    }
  }
  return (
    <div className="pb-20">
        
        {/* Stepper Header */}
        <div className="mb-8 pt-4 pb-6 bg-zinc-950 border-b border-white/5">
             <div className="max-w-4xl mx-auto px-4">
                <div className="flex flex-col md:block relative">
                    {/* Discard Draft Button */}
                     {draftLoaded && (
                        <div className="w-full mb-4 md:mb-0 md:absolute md:right-0 md:top-[-60px] flex justify-end">
                            <Button 
                                onClick={clearDraft} 
                                size="sm" 
                                variant="destructive" 
                                className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 text-xs uppercase font-bold tracking-wider"
                            >
                                Discard Draft
                            </Button>
                        </div>
                    )}

                    {/* Progress Line - Hidden on very small screens */}
                    <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-zinc-800"></div>
                    <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-emerald-500 transition-all duration-500 origin-left" style={{ transform: `scaleX(${(currentStep - 1) / 3})` }}></div>
                    
                    <div className="flex items-center justify-between relative w-full">
                        {/* Steps */}
                        {[
                            { num: 1, label: 'Release Info', icon: Disc },
                            { num: 2, label: 'Song Info', icon: Music },
                            { num: 3, label: 'Platforms', icon: UploadCloud },
                            { num: 4, label: 'Submission', icon: Check }
                        ].map((step) => (
                            <div key={step.num} className="flex flex-col items-center gap-2 bg-zinc-950 px-2 relative z-10">
                                 <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                     currentStep > step.num ? 'bg-emerald-500 border-emerald-500 text-white' :
                                     currentStep === step.num ? 'bg-zinc-950 border-emerald-500 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' :
                                     'bg-zinc-900 border-zinc-700 text-zinc-500'
                                 }`}>
                                     {currentStep > step.num ? <Check size={18} /> : <step.icon size={18} />}
                                 </div>
                                 <span className={`text-[10px] uppercase font-bold tracking-widest hidden md:block ${
                                     currentStep >= step.num ? 'text-emerald-500' : 'text-zinc-600'
                                 }`}>{step.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        <form className="max-w-6xl mx-auto px-4">
            
            {/* Onboarding Banner for First Upload */}
            {isFirstUpload && currentStep === 1 && (
                <div className="mb-10 p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex gap-5 items-center animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                        <Save className="text-indigo-400" size={24} />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-lg">Welcome to your first release!</h3>
                        <p className="text-zinc-400 text-sm max-w-2xl mt-1">
                            We've simplified the process to get your music on Spotify, Apple Music, and more. 
                            Fill in your release details below to get started. Don't worry, you can always save as a draft!
                        </p>
                    </div>
                </div>
            )}

            {/* STEP 1: Release Info */}
            <div className={currentStep === 1 ? 'block space-y-8 animate-in fade-in slide-in-from-right-4 duration-300' : 'hidden'}>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     {/* Left: Metadata Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Release Type */}
                         <div className="space-y-3">
                            <Label className="text-xs uppercase font-black text-zinc-500 tracking-widest ml-1">Release Type <span className="text-red-500">*</span></Label>
                            <div className="flex gap-4 flex-wrap">
                                {releaseTypes.map((type) => (
                                    <button
                                        type="button"
                                        key={type.id}
                                        onClick={(e) => { e.preventDefault(); setReleaseType(type.id); }}
                                        className={`px-4 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all border ${
                                            releaseType === type.id 
                                            ? 'bg-indigo-500 text-white border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)]' 
                                            : 'bg-white/5 text-zinc-400 border-white/10 hover:border-white/30 hover:bg-white/10'
                                        }`}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs uppercase font-bold text-zinc-400">Release Title <span className="text-red-500">*</span></Label>
                                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Release Title" className="bg-white/5 border-white/10 text-white h-12" />
                            </div>
                             <div className="space-y-2">
                                <Label className="text-xs uppercase font-bold text-zinc-400">Label Name <span className="text-red-500">*</span></Label>
                                <Input value={labelName} onChange={(e) => setLabelName(e.target.value)} placeholder="Label Name" className="bg-white/5 border-white/10 text-white h-12" />
                            </div>
                        </div>
                        
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs uppercase font-bold text-zinc-400">Primary Artist <span className="text-red-500">*</span></Label>
                                <div className="flex gap-2">
                                    <Input value={primaryArtist} onChange={(e) => setPrimaryArtist(e.target.value)} placeholder="Select Primary Artist" className="bg-white/5 border-white/10 text-white h-12" />
                                    <Button type="button" onClick={() => openArtistDialog('release')} size="icon" className="h-12 w-12 bg-indigo-500 hover:bg-indigo-600 rounded-lg shrink-0">+</Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs uppercase font-bold text-zinc-400">Featuring Artist</Label>
                                <div className="flex gap-2">
                                    <Input value={featuringArtist} onChange={(e) => setFeaturingArtist(e.target.value)} placeholder="Select Featuring Artist" className="bg-white/5 border-white/10 text-white h-12" />
                                    <Button type="button" onClick={() => openArtistDialog('release-featuring')} size="icon" className="h-12 w-12 bg-indigo-500 hover:bg-indigo-600 rounded-lg shrink-0">+</Button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="space-y-2">
                                <Label className="text-xs uppercase font-bold text-zinc-400">Genre <span className="text-red-500">*</span></Label>
                                <Select value={genre} onValueChange={setGenre}>
                                    <SelectTrigger className="bg-white/5 border-white/10 text-white h-12"><SelectValue placeholder="Select Genre" /></SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                        <SelectItem value="pop">Pop</SelectItem>
                                        <SelectItem value="hiphop">Hip Hop</SelectItem>
                                        <SelectItem value="rnb">R&B</SelectItem>
                                        <SelectItem value="rock">Rock</SelectItem>
                                        <SelectItem value="electronic">Electronic</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2">
                                <Label className="text-xs uppercase font-bold text-zinc-400">Sub Genre <span className="text-red-500">*</span></Label>
                                <Input value={subGenre} onChange={(e) => setSubGenre(e.target.value)} placeholder="Enter sub genre" className="bg-white/5 border-white/10 text-white h-12" />
                            </div>
                        </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs uppercase font-bold text-zinc-400">Release Date <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                    <Input type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} className="bg-white/5 border-white/10 text-white h-12 pl-10" />
                                    <Calendar className="absolute left-3 top-3.5 text-zinc-500 h-5 w-5 pointer-events-none" />
                                </div>
                            </div>
                             <div className="space-y-2">
                                <Label className="text-xs uppercase font-bold text-zinc-400">Original Release Date</Label>
                                <div className="relative">
                                    <Input type="date" value={originalReleaseDate} onChange={(e) => setOriginalReleaseDate(e.target.value)} className="bg-white/5 border-white/10 text-white h-12 pl-10" />
                                    <Calendar className="absolute left-3 top-3.5 text-zinc-500 h-5 w-5 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                        
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="space-y-2">
                                <Label className="text-xs uppercase font-bold text-zinc-400">UPC/EAN (Optional)</Label>
                                <Input value={upc} onChange={(e) => setUpc(e.target.value)} placeholder="UPC/EAN" className="bg-white/5 border-white/10 text-white h-12" />
                            </div>
                             <div className="space-y-2">
                                <Label className="text-xs uppercase font-bold text-zinc-400">P-Line <span className="text-red-500">*</span></Label>
                                <div className="flex gap-2">
                                    <Select value={pLineYear} onValueChange={setPLineYear}>
                                        <SelectTrigger className="w-[100px] bg-white/5 border-white/10 text-white h-12"><SelectValue placeholder="Year" /></SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white max-h-[300px]">{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                                    </Select>
                                    <Input value={pLineText} onChange={(e) => setPLineText(e.target.value)} placeholder="Owner" className="flex-1 bg-white/5 border-white/10 text-white h-12" />
                                </div>
                            </div>
                        </div>
                        
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="space-y-2">
                                <Label className="text-xs uppercase font-bold text-zinc-400">Courtesy Line</Label>
                                <Input value={courtesyLine} onChange={(e) => setCourtesyLine(e.target.value)} placeholder="Courtesy of Your Label Name" className="bg-white/5 border-white/10 text-white h-12" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs uppercase font-bold text-zinc-400">C-Line <span className="text-red-500">*</span></Label>
                                <div className="flex gap-2">
                                    <Select value={cLineYear} onValueChange={setCLineYear}>
                                        <SelectTrigger className="w-[100px] bg-white/5 border-white/10 text-white h-12"><SelectValue placeholder="Year" /></SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white max-h-[300px]">{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                                    </Select>
                                    <Input value={cLineText} onChange={(e) => setCLineText(e.target.value)} placeholder="Owner" className="flex-1 bg-white/5 border-white/10 text-white h-12" />
                                </div>
                            </div>
                        </div>

                         <div className="space-y-2">
                            <Label className="text-xs uppercase font-bold text-zinc-400">Additional Information & Requests</Label>
                            <Textarea 
                                value={description} onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter any additional information or special requests here..."
                                className="bg-white/5 border-white/10 text-white min-h-[100px]"
                            />
                        </div>

                    </div>
                    
                     {/* Right: Cover Art */}
                    <div className="space-y-6">
                        <Card className="bg-white/[0.03] border-white/10 backdrop-blur-xl overflow-hidden h-full">
                            <CardHeader>
                                <CardTitle className="text-sm font-black uppercase text-zinc-400 tracking-widest flex items-center gap-2">
                                    <Disc size={16} /> Cover Art <span className="text-red-500">*</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col justify-center">
                                <div className={`relative transition-all aspect-square w-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer group hover:border-indigo-500/50 hover:bg-indigo-500/5 ${coverFile || initialData?.albums?.cover_art_url ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 bg-black/20'}`}>
                                    <input type="file" accept="image/*" onChange={handleCoverChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                    {coverFile || initialData?.albums?.cover_art_url ? (
                                        <img src={coverFile ? URL.createObjectURL(coverFile) : initialData?.albums?.cover_art_url} alt="Preview" className="h-full w-full object-cover rounded-lg" />
                                    ) : (
                                        <>
                                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                <ImageIcon className="text-zinc-500 group-hover:text-indigo-400 transition-colors" size={32} />
                                            </div>
                                            <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Upload Cover</p>
                                            <p className="text-[10px] text-zinc-600 mt-2">3000 x 3000px · JPG/PNG</p>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>


            {/* STEP 2: Song Info - Multi-track Layout */}
            <div className={currentStep === 2 ? 'block space-y-8 animate-in fade-in slide-in-from-right-4 duration-300' : 'hidden'}>
                 
                 <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                     
                     {/* Track Selection Sidebar */}
                     <div className="lg:col-span-1 space-y-4">
                         <div className="flex items-center justify-between px-1">
                             <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Tracklist</h3>
                             <Button 
                                type="button" 
                                onClick={addTrack}
                                size="sm" 
                                className="h-7 px-2 text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20"
                             >
                                <Plus size={12} className="mr-1" /> Add
                             </Button>
                         </div>
                         <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                             {tracks.map((track, index) => (
                                 <div 
                                    key={track.id}
                                    onClick={() => setActiveTrackId(track.id)}
                                    className={`group flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                                        activeTrackId === track.id 
                                        ? 'bg-indigo-500/10 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.1)]' 
                                        : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]'
                                    }`}
                                 >
                                     <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black ${
                                         activeTrackId === track.id ? 'bg-indigo-500 text-white' : 'bg-zinc-800 text-zinc-500'
                                     }`}>
                                         {index + 1}
                                     </div>
                                     <div className="flex-1 min-w-0">
                                         <p className={`text-xs font-bold truncate ${activeTrackId === track.id ? 'text-white' : 'text-zinc-400'}`}>
                                             {track.title || "Untitled Track"}
                                         </p>
                                         <p className="text-[10px] text-zinc-500 truncate">
                                             {track.audioFile?.name || track.audioUrl ? "Audio Ready" : "No Audio"}
                                         </p>
                                     </div>
                                     {tracks.length > 1 && (
                                         <button 
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); removeTrack(track.id); }}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-500 hover:text-red-400 transition-all"
                                         >
                                             <Trash2 size={12} />
                                         </button>
                                     )}
                                 </div>
                             ))}
                         </div>
                     </div>

                     {/* Track Details Form */}
                     <div className="lg:col-span-3 space-y-8">
                         {/* Audio File Upload */}
                         <Card className="bg-white/[0.03] border-white/10 backdrop-blur-xl overflow-hidden">
                            <CardHeader className="py-4">
                                <CardTitle className="text-sm font-black uppercase text-zinc-400 tracking-widest flex items-center gap-2">
                                    <Music size={16} /> Audio Source <span className="text-red-500">*</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pb-4">
                                <div className={`relative transition-all h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer group hover:border-indigo-500/50 hover:bg-indigo-500/5 ${currentTrack.audioFile || currentTrack.audioUrl ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 bg-black/20'}`}>
                                    <input type="file" accept="audio/*" onChange={handleAudioChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                    {currentTrack.audioFile || currentTrack.audioUrl ? (
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                                <Music className="text-emerald-500" size={16} />
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="text-xs text-emerald-400 font-bold max-w-[300px] truncate">{currentTrack.audioFile?.name || 'Existing File'}</p>
                                                {currentTrack.duration > 0 && (
                                                    <p className="text-[10px] text-zinc-500">
                                                        {Math.floor(currentTrack.duration / 60)}:{(currentTrack.duration % 60).toString().padStart(2, '0')} · {currentTrack.audioAnalysis?.format || 'Audio'}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-2"><UploadCloud size={16} /> Upload WAV/FLAC</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                 {/* Detailed Info Grid */}
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
                     
                     {/* LEFT COLUMN */}
                     <div className="space-y-6">
                         
                         {/* Track Version */}
                         <div className="space-y-3">
                             <Label className="text-xs uppercase font-bold text-zinc-400">Track Version <span className="text-red-500">*</span></Label>
                             <div className="flex gap-4 flex-wrap">
                                 {['original', 'karaoke', 'medley', 'cover'].map((ver) => (
                                     <label key={ver} className="flex items-center gap-2 cursor-pointer group">
                                         <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${currentTrack.trackVersion === ver ? 'border-indigo-500' : 'border-zinc-600 group-hover:border-zinc-500'}`}>
                                             {currentTrack.trackVersion === ver && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                                         </div>
                                         <input type="radio" className="hidden" name="trackVersion" value={ver} checked={currentTrack.trackVersion === ver} onChange={() => updateCurrentTrack({ trackVersion: ver })} />
                                         <span className="text-sm text-zinc-300 capitalize">{ver}</span>
                                     </label>
                                 ))}
                             </div>
                         </div>

                         {/* Instrumental */}
                         <div className="space-y-3">
                             <Label className="text-xs uppercase font-bold text-zinc-400">Instrumental <span className="text-red-500">*</span></Label>
                             <div className="flex gap-4 flex-wrap">
                                 {['yes', 'no'].map((opt) => (
                                     <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                                         <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${currentTrack.isInstrumental === opt ? 'border-indigo-500' : 'border-zinc-600 group-hover:border-zinc-500'}`}>
                                             {currentTrack.isInstrumental === opt && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                                         </div>
                                         <input type="radio" className="hidden" name="isInstrumental" value={opt} checked={currentTrack.isInstrumental === opt} onChange={() => updateCurrentTrack({ isInstrumental: opt })} />
                                         <span className="text-sm text-zinc-300 capitalize">{opt}</span>
                                     </label>
                                 ))}
                             </div>
                         </div>
                         
                         <div className="space-y-2">
                            <Label className="text-xs uppercase font-bold text-zinc-400">Title <span className="text-red-500">*</span></Label>
                            <Input value={currentTrack.title} onChange={(e) => updateCurrentTrack({ title: e.target.value })} placeholder="Song Title" className="bg-white/5 border-white/10 text-white h-12" />
                        </div>
                        
                        <div className="space-y-2">
                            <Label className="text-xs uppercase font-bold text-zinc-400">Version/Subtitle</Label>
                            <Input value={currentTrack.versionSubtitle} onChange={(e) => updateCurrentTrack({ versionSubtitle: e.target.value })} placeholder="Remix, Edit, etc." className="bg-white/5 border-white/10 text-white h-12" />
                        </div>
                        
                        <div className="space-y-2">
                            <Label className="text-xs uppercase font-bold text-zinc-400">Primary Artist <span className="text-red-500">*</span></Label>
                            <div className="flex gap-2">
                                <Input value={currentTrack.primaryArtist} onChange={(e) => updateCurrentTrack({ primaryArtist: e.target.value })} placeholder="Lead Artist Name" className="bg-white/5 border-white/10 text-white h-12" />
                                <Button type="button" onClick={() => openArtistDialog('track')} size="icon" className="h-12 w-12 bg-indigo-500 hover:bg-indigo-600 rounded-lg shrink-0">+</Button>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <Label className="text-xs uppercase font-bold text-zinc-400">Featuring Artist</Label>
                            <div className="flex gap-2">
                                <Input value={currentTrack.featuringArtist} onChange={(e) => updateCurrentTrack({ featuringArtist: e.target.value })} placeholder="Guest Artist Name" className="bg-white/5 border-white/10 text-white h-12" />
                                <Button type="button" onClick={() => openArtistDialog('track-featuring')} size="icon" className="h-12 w-12 bg-indigo-500 hover:bg-indigo-600 rounded-lg shrink-0">+</Button>
                            </div>
                        </div>
                        
                                <div className="space-y-3">
                                     <Label className="text-xs uppercase font-bold text-zinc-400">Lyricist <span className="text-red-500">*</span></Label>
                                     <div className="flex gap-2">
                                        <Input value={newLyricistFirst} onChange={(e) => setNewLyricistFirst(e.target.value)} placeholder="First Name" className="bg-white/5 border-white/10 text-white h-12" />
                                        <Input value={newLyricistLast} onChange={(e) => setNewLyricistLast(e.target.value)} placeholder="Last Name" className="bg-white/5 border-white/10 text-white h-12" />
                                     </div>
                                     <Button type="button" onClick={addLyricist} className="bg-indigo-500 hover:bg-indigo-600 text-white w-full h-10">+ Add Lyricist</Button>
                                     {/* Display Lists */}
                                     {currentTrack.lyricists.length > 0 && (
                                         <div className="space-y-1 mt-2">
                                             {currentTrack.lyricists.map((l, i) => (
                                                 <div key={i} className="flex justify-between items-center bg-white/5 px-3 py-2 rounded text-sm text-zinc-300">
                                                     <span>{l.firstName} {l.lastName}</span>
                                                     <X size={14} className="cursor-pointer hover:text-red-500" onClick={() => removeLyricist(i)}/>
                                                 </div>
                                             ))}
                                         </div>
                                     )}
                                </div>

                                <div className="space-y-3">
                                     <Label className="text-xs uppercase font-bold text-zinc-400">Composer <span className="text-red-500">*</span></Label>
                                     <div className="flex gap-2">
                                        <Input value={newComposerFirst} onChange={(e) => setNewComposerFirst(e.target.value)} placeholder="First Name" className="bg-white/5 border-white/10 text-white h-12" />
                                        <Input value={newComposerLast} onChange={(e) => setNewComposerLast(e.target.value)} placeholder="Last Name" className="bg-white/5 border-white/10 text-white h-12" />
                                     </div>
                                     <Button type="button" onClick={addComposer} className="bg-indigo-500 hover:bg-indigo-600 text-white w-full h-10">+ Add Composer</Button>
                                      {currentTrack.composers.length > 0 && (
                                         <div className="space-y-1 mt-2">
                                             {currentTrack.composers.map((c, i) => (
                                                 <div key={i} className="flex justify-between items-center bg-white/5 px-3 py-2 rounded text-sm text-zinc-300">
                                                     <span>{c.firstName} {c.lastName}</span>
                                                     <X size={14} className="cursor-pointer hover:text-red-500" onClick={() => removeComposer(i)}/>
                                                 </div>
                                             ))}
                                         </div>
                                     )}
                                </div>
                                
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase font-bold text-zinc-400">Music Producer <span className="text-red-500">*</span></Label>
                                    <Input value={currentTrack.producer} onChange={(e) => updateCurrentTrack({ producer: e.target.value })} placeholder="Music Producer" className="bg-white/5 border-white/10 text-white h-12" />
                                </div>
                                
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase font-bold text-zinc-400">Lyrics</Label>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <Input 
                                                type="file" 
                                                accept=".lrc,.txt" 
                                                className="bg-white/5 border-white/10 text-white text-xs h-9 w-full file:bg-zinc-800 file:text-zinc-300 file:border-0 file:rounded-md file:px-2 file:py-1 file:mr-4 file:text-xs"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0]
                                                    if (file) {
                                                        const reader = new FileReader()
                                                        reader.onload = (ev) => {
                                                            const text = ev.target?.result as string
                                                            updateCurrentTrack({ lyrics: text })
                                                            toast.success("Lyrics imported!")
                                                        }
                                                        reader.readAsText(file)
                                                    }
                                                }}
                                            />
                                            <span className="text-[10px] text-zinc-500 whitespace-nowrap uppercase tracking-wider font-bold">Upload .LRC</span>
                                        </div>
                                        <Textarea value={currentTrack.lyrics} onChange={(e) => updateCurrentTrack({ lyrics: e.target.value })} placeholder="Lyrics text..." className="bg-white/5 border-white/10 text-white min-h-[120px]" />
                                    </div>
                                </div>
                             </div>

                             {/* RIGHT COLUMN */}
                             <div className="space-y-6">
                                 
                                  <div className="space-y-2">
                                    <Label className="text-xs uppercase font-bold text-zinc-400">P Line <span className="text-red-500">*</span></Label>
                                    <Input value={currentTrack.pLine} onChange={(e) => updateCurrentTrack({ pLine: e.target.value })} placeholder="Phonographic Copyright Line" className="bg-white/5 border-white/10 text-white h-12" />
                                </div>
                                
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase font-bold text-zinc-400">Production Year <span className="text-red-500">*</span></Label>
                                    <Input value={currentTrack.productionYear} onChange={(e) => updateCurrentTrack({ productionYear: e.target.value })} placeholder="2026" className="bg-white/5 border-white/10 text-white h-12" />
                                </div>
                                
                                 <div className="space-y-2">
                                    <Label className="text-xs uppercase font-bold text-zinc-400">Publisher</Label>
                                    <Input value={currentTrack.publisher} onChange={(e) => updateCurrentTrack({ publisher: e.target.value })} placeholder="Publisher" className="bg-white/5 border-white/10 text-white h-12" />
                                </div>
                                
                                 <div className="space-y-3">
                                     <Label className="text-xs uppercase font-bold text-zinc-400">Have Your Own ISRC? <span className="text-red-500">*</span></Label>
                                     <div className="flex gap-4">
                                         {['yes', 'no'].map((opt) => (
                                             <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                                                 <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${currentTrack.hasISRC === opt ? 'border-indigo-500' : 'border-zinc-600 group-hover:border-zinc-500'}`}>
                                                     {currentTrack.hasISRC === opt && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                                                 </div>
                                                 <input type="radio" className="hidden" name="hasISRC" value={opt} checked={currentTrack.hasISRC === opt} onChange={() => updateCurrentTrack({ hasISRC: opt })} />
                                                 <span className="text-sm text-zinc-300 capitalize">{opt}</span>
                                             </label>
                                         ))}
                                     </div>
                                     {currentTrack.hasISRC === 'yes' && (
                                        <Input value={currentTrack.isrc} onChange={(e) => updateCurrentTrack({ isrc: e.target.value })} placeholder="Enter ISRC" className="bg-white/5 border-white/10 text-white h-12 mt-2" />
                                     )}
                                 </div>

                                <div className="space-y-2">
                                     <Label className="text-xs uppercase font-bold text-zinc-400">Genre <span className="text-red-500">*</span></Label>
                                     <Select value={currentTrack.genre} onValueChange={(val) => updateCurrentTrack({ genre: val })}>
                                        <SelectTrigger className="bg-white/5 border-white/10 text-white h-12"><SelectValue placeholder="Select Genre" /></SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                            <SelectItem value="pop">Pop</SelectItem>
                                            <SelectItem value="hiphop">Hip Hop</SelectItem>
                                            <SelectItem value="rnb">R&B</SelectItem>
                                            <SelectItem value="rock">Rock</SelectItem>
                                            <SelectItem value="electronic">Electronic</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                 <div className="space-y-2">
                                    <Label className="text-xs uppercase font-bold text-zinc-400">Sub Genre <span className="text-red-500">*</span></Label>
                                    <Input value={currentTrack.subGenre} onChange={(e) => updateCurrentTrack({ subGenre: e.target.value })} placeholder="Sub Genre" className="bg-white/5 border-white/10 text-white h-12" />
                                </div>
                                
                                 <div className="space-y-2">
                                     <Label className="text-xs uppercase font-bold text-zinc-400">Price Tier <span className="text-red-500">*</span></Label>
                                     <Select value={currentTrack.priceTier} onValueChange={(val) => updateCurrentTrack({ priceTier: val })}>
                                        <SelectTrigger className="bg-white/5 border-white/10 text-white h-12"><SelectValue placeholder="Select Price Tier" /></SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="mid">Mid</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="premium">Premium</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                
                                 <div className="space-y-3">
                                     <Label className="text-xs uppercase font-bold text-zinc-400">Explicit Version <span className="text-red-500">*</span></Label>
                                     <div className="flex gap-4">
                                         {['yes', 'no', 'cleaned'].map((opt) => (
                                             <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                                                 <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${currentTrack.explicitType === opt ? 'border-indigo-500' : 'border-zinc-600 group-hover:border-zinc-500'}`}>
                                                     {currentTrack.explicitType === opt && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                                                 </div>
                                                 <input type="radio" className="hidden" name="explicitType" value={opt} checked={currentTrack.explicitType === opt} onChange={() => updateCurrentTrack({ explicitType: opt })} />
                                                 <span className="text-sm text-zinc-300 capitalize">{opt}</span>
                                             </label>
                                         ))}
                                     </div>
                                 </div>
                                 
                                 <div className="space-y-2">
                                     <Label className="text-xs uppercase font-bold text-zinc-400">Track Title Language <span className="text-red-500">*</span></Label>
                                     <Select value={currentTrack.titleLanguage} onValueChange={(val) => updateCurrentTrack({ titleLanguage: val })}>
                                        <SelectTrigger className="bg-white/5 border-white/10 text-white h-12"><SelectValue placeholder="Track Title Language" /></SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                            <SelectItem value="english">English</SelectItem>
                                            <SelectItem value="spanish">Spanish</SelectItem>
                                            <SelectItem value="hindi">Hindi</SelectItem>
                                            <SelectItem value="french">French</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                
                                <div className="space-y-2">
                                     <Label className="text-xs uppercase font-bold text-zinc-400">Lyrics Language <span className="text-red-500">*</span></Label>
                                     <Select value={currentTrack.lyricsLanguage} onValueChange={(val) => updateCurrentTrack({ lyricsLanguage: val })}>
                                        <SelectTrigger className="bg-white/5 border-white/10 text-white h-12"><SelectValue placeholder="Lyrics Language" /></SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                            <SelectItem value="english">English</SelectItem>
                                            <SelectItem value="spanish">Spanish</SelectItem>
                                            <SelectItem value="hindi">Hindi</SelectItem>
                                            <SelectItem value="french">French</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase font-bold text-zinc-400">Caller Tune Timing <span className="text-red-500">*</span></Label>
                                    <Input value={currentTrack.callerTuneTiming} onChange={(e) => updateCurrentTrack({ callerTuneTiming: e.target.value })} placeholder="HH:MM:SS" className="bg-white/5 border-white/10 text-white h-12" />
                                </div>
                             </div>
                         </div>
                     </div>
                 </div>
            </div>
            

            {/* STEP 3: Platforms */}
            <div className={currentStep === 3 ? 'block space-y-8 animate-in fade-in slide-in-from-right-4 duration-300' : 'hidden'}>
                <div className="space-y-4">
                     <div className="flex justify-between items-center border-b border-white/10 pb-4">
                         <h3 className="text-sm font-black uppercase text-zinc-400 tracking-widest">Select Platforms</h3>
                         <Button type="button" variant="outline" size="sm" onClick={toggleAllPlatforms} className="border-white/10 text-zinc-300 hover:bg-white/10">
                             {selectedPlatforms.length === ALL_PLATFORMS.length ? 'Deselect All' : 'Select All'}
                         </Button>
                     </div>
                     
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                         {ALL_PLATFORMS.map(platform => (
                             <div 
                                key={platform.id}
                                onClick={() => togglePlatform(platform.id)}
                                className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center justify-center gap-3 transition-all duration-200 ${
                                    selectedPlatforms.includes(platform.id) 
                                    ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                                    : 'bg-white/5 border-white/10 hover:border-white/20'
                                }`}
                             >
                                 <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                                     selectedPlatforms.includes(platform.id) ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-zinc-600'
                                 }`}>
                                     {selectedPlatforms.includes(platform.id) && <Check size={14} />}
                                 </div>
                                 <span className={`font-bold text-sm ${selectedPlatforms.includes(platform.id) ? 'text-emerald-400' : 'text-zinc-400'}`}>{platform.name}</span>
                             </div>
                         ))}
                     </div>
                     
                     <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm mt-8">
                         <span className="font-bold flex items-center gap-2"><UploadCloud size={16}/> Note:</span> Distribution typically takes 2-5 days for approval and delivery to these stores.
                     </div>
                </div>
            </div>

            {/* STEP 4: Submission */}
             <div className={currentStep === 4 ? 'block space-y-8 animate-in fade-in slide-in-from-right-4 duration-300' : 'hidden'}>
                 <div className="space-y-6">
                     <h3 className="text-center text-2xl font-black text-white uppercase tracking-widest">Review & Submit</h3>
                     
                     <div className="bg-white/5 rounded-xl p-6 border border-white/10 space-y-6">
                         
                         <div className="flex gap-6 items-start">
                             <div className="w-32 h-32 rounded-lg bg-black/50 overflow-hidden shrink-0 border border-white/10">
                                 {(coverFile || initialData?.albums?.cover_art_url) && (
                                     <img src={coverFile ? URL.createObjectURL(coverFile) : initialData?.albums?.cover_art_url} className="w-full h-full object-cover" />
                                 )}
                             </div>
                             <div>
                                 <h4 className="text-xl font-bold text-white mb-2">{title}</h4>
                                 <p className="text-zinc-400 flex items-center gap-2 mb-1"><span className="text-zinc-600 text-xs font-bold uppercase">Artist:</span> {primaryArtist}</p>
                                 <p className="text-zinc-400 flex items-center gap-2 mb-1"><span className="text-zinc-600 text-xs font-bold uppercase">Label:</span> {labelName}</p>
                                 <p className="text-zinc-400 flex items-center gap-2"><span className="text-zinc-600 text-xs font-bold uppercase">Date:</span> {releaseDate}</p>
                             </div>
                         </div>
                         
                          <div className="space-y-4 pt-4 border-t border-white/5">
                              <p className="text-xs uppercase font-bold text-zinc-600 mb-1">Track List ({tracks.length})</p>
                              {tracks.map((track, idx) => (
                                  <div key={track.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5">
                                      <div>
                                          <p className="text-sm text-zinc-300 font-bold">{idx + 1}. {track.title || 'Untitled'} <span className="text-zinc-500 font-normal">({track.trackVersion})</span></p>
                                          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5">{track.genre} {track.subGenre && `• ${track.subGenre}`}</p>
                                      </div>
                                      <div className="text-right">
                                          <p className="text-xs text-zinc-400 font-medium">{Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}</p>
                                          <p className="text-[10px] text-zinc-600 uppercase font-bold mt-0.5">{track.isrc || 'No ISRC'}</p>
                                      </div>
                                  </div>
                              ))}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                              <div className="col-span-1 md:col-span-2">
                                  <p className="text-xs uppercase font-bold text-zinc-600 mb-2">Distribution Summary</p>
                                  <div className="flex flex-wrap gap-2">
                                      {selectedPlatforms.map(p => (
                                          <span key={p} className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] uppercase font-bold rounded">
                                              {ALL_PLATFORMS.find(ap => ap.id === p)?.name}
                                          </span>
                                      ))}
                                      {selectedPlatforms.length === 0 && <span className="text-zinc-500 text-xs italic text-red-500">No platforms selected</span>}
                                  </div>
                              </div>
                              <div>
                                  <p className="text-xs uppercase font-bold text-zinc-600 mb-1">Global Metadata</p>
                                  <p className="text-sm text-zinc-300">© {cLineYear} {cLineText} / ℗ {pLineYear} {pLineText}</p>
                              </div>
                          </div>
                      </div>
                     
                     <div className="flex items-center gap-2 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-500 text-sm">
                         <div className="w-auto"><Check size={20} /></div>
                         <p>By submitting, you confirm that you have full rights to distribute this content.</p>
                     </div>
                 </div>
            </div>

            {/* Navigation Footer */}
            <div className="flex justify-between items-center mt-12 pt-6 border-t border-white/10">
                {currentStep === 1 ? <div /> : (
                    <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={prevStep} 
                        disabled={loading}
                        className="text-zinc-400 hover:text-white hover:bg-white/5"
                    >
                        <ChevronLeft className="mr-2" size={16} /> Back
                    </Button>
                )}
                
                <div className="flex items-center gap-3">
                    {/* Save Draft Button - Available at any step */}
                    <Button 
                        type="button" 
                        onClick={(e) => handleSubmit(e, 'draft')}
                        disabled={loading || !title} // Minimum requirement: Title
                        className="bg-white text-black hover:bg-zinc-200 transition-all h-12 px-6 rounded-md font-bold"
                    >
                        {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                        Save as Draft
                    </Button>

                    {currentStep < 4 ? (
                        <Button 
                            type="button" 
                            onClick={nextStep}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-12 px-8 rounded-md shadow-lg shadow-indigo-500/20"
                        >
                            Next Step <ChevronRight className="ml-2" size={16} />
                        </Button>
                    ) : (
                        <Button 
                            type="button"
                            onClick={(e) => handleSubmit(e, 'pending')} 
                            disabled={loading}
                            className="bg-emerald-500 text-white hover:bg-emerald-400 font-black uppercase tracking-[0.2em] h-12 px-10 rounded-md shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_40px_rgba(52,211,153,0.5)] transition-all text-sm"
                        >
                            {loading ? <Loader2 className="animate-spin mr-2" /> : <UploadCloud className="mr-2" size={18} />}
                            Confirm Submission
                        </Button>
                    )}
                </div>
            </div>
            
            {/* Artist Details Dialog */}
            <Dialog open={isArtistDialogOpen} onOpenChange={setIsArtistDialogOpen}>
                <DialogContent className="bg-zinc-950 border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>Add Artist Details</DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            Enter the artist's name and platform links.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="text-xs uppercase font-bold text-zinc-400">Artist Name <span className="text-red-500">*</span></Label>
                            <Input value={artistDialogName} onChange={(e) => setArtistDialogName(e.target.value)} placeholder="Artist Name" className="bg-white/5 border-white/10 text-white" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs uppercase font-bold text-zinc-400">Spotify Artist ID/Link (Optional)</Label>
                            <Input value={artistDialogSpotify} onChange={(e) => setArtistDialogSpotify(e.target.value)} placeholder="Spotify Link" className="bg-white/5 border-white/10 text-white" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs uppercase font-bold text-zinc-400">Apple Music Artist ID/Link (Optional)</Label>
                            <Input value={artistDialogApple} onChange={(e) => setArtistDialogApple(e.target.value)} placeholder="Apple Music Link" className="bg-white/5 border-white/10 text-white" />
                        </div>
                    </div>
                    <DialogFooter>
                         <Button variant="ghost" type="button" onClick={() => setIsArtistDialogOpen(false)} className="text-zinc-400 hover:text-white">Cancel</Button>
                         <Button type="button" onClick={saveArtistDetails} className="bg-indigo-600 hover:bg-indigo-500 text-white">Save Artist</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </form>

        <UploadSuccessDialog 
            isOpen={isSuccessDialogOpen} 
            onOpenChange={setIsSuccessDialogOpen} 
            isFirstUpload={isFirstUpload}
        />
    </div>
  )
}
