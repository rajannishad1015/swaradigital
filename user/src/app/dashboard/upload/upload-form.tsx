'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { submitTrack } from './actions'
import { checkSubmissionEligibility, createRazorpayOrder, verifyRazorpayPayment } from '../actions'
import Script from 'next/script'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { UploadCloud, Loader2, Music, Image as ImageIcon, X, Calendar, Disc, Check, ChevronRight, ChevronLeft, Save, Plus, Trash2, AlertTriangle, ExternalLink, ChevronsUpDown, User, Sparkles } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
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
    primaryArtists: {name: string, spotifyId: string, appleId: string}[];
    featuringArtists: {name: string, spotifyId: string, appleId: string}[];
    genre: string;
    subGenre: string;
    pLine: string;
    titleLanguage: string;
    lyricsLanguage: string;
    lyrics: string;
    lyricists: {firstName: string, lastName: string}[];
    composers: {firstName: string, lastName: string}[];
    producers: {name: string}[];
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
    { id: 'facebook', name: 'Facebook', icon: '', premium: true },
    { id: 'instagram', name: 'Instagram', icon: '', premium: true },
    { id: 'tiktok', name: 'TikTok', icon: '', premium: true },
]

const GENRE_OPTIONS = [
    { value: 'alternative', label: 'Alternative' },
    { value: 'blues', label: 'Blues' },
    { value: 'childrens', label: "Children's" },
    { value: 'christian', label: 'Christian' },
    { value: 'classical', label: 'Classical' },
    { value: 'country', label: 'Country' },
    { value: 'educational', label: 'Educational' },
    { value: 'electronic', label: 'Electronic' },
    { value: 'folk', label: 'Folk' },
    { value: 'hiphop', label: 'Hip-hop/Rap' },
    { value: 'holiday', label: 'Holiday' },
    { value: 'jazz', label: 'Jazz' },
    { value: 'latin', label: 'Latin Music' },
    { value: 'metal', label: 'Metal' },
    { value: 'newage', label: 'New Age' },
    { value: 'pop', label: 'Pop' },
    { value: 'punk', label: 'Punk' },
    { value: 'rnb', label: 'R&B' },
    { value: 'reggae', label: 'Reggae' },
    { value: 'rock', label: 'Rock' },
    { value: 'soundtracks', label: 'Soundtracks' },
    { value: 'spokenword', label: 'Spoken Word' },
    { value: 'video', label: 'Video' },
    { value: 'worldmusic', label: 'World Music' },
]

// Helper to parse artist entries from DB (handles both old string and new array formats)
function parseArtistEntries(value: any, spotifyId?: string, appleId?: string): {name: string, spotifyId: string, appleId: string}[] {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    try { const parsed = JSON.parse(value); if (Array.isArray(parsed)) return parsed; } catch {}
    return [{name: String(value), spotifyId: spotifyId || '', appleId: appleId || ''}];
}

function parseProducerEntries(value: any): {name: string}[] {
    if (!value) return [];
    if (Array.isArray(value)) return value.map((v: any) => typeof v === 'string' ? {name: v} : v);
    try { const parsed = JSON.parse(value); if (Array.isArray(parsed)) return parsed.map((v: any) => typeof v === 'string' ? {name: v} : v); } catch {}
    return [{name: String(value)}];
}

function parseJSONEntries(value: any): any[] {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    try {
        const parsed = typeof value === 'string' ? JSON.parse(value) : value;
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        console.error("Failed to parse JSON entries:", e);
        return [];
    }
}

interface UploadFormProps {
    initialData?: Record<string, any>
    isFirstUpload?: boolean
    userProfile?: any
}

export default function UploadForm({ initialData, isFirstUpload, userProfile }: UploadFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [draftLoaded, setDraftLoaded] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  // Tracks the server-side ID of a previously saved draft (prevents duplicate album creation on re-save)
  const [savedDraftId, setSavedDraftId] = useState<string | null>(null)
  
  // File States
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [duration, setDuration] = useState(initialData?.duration || 0)

  // Cover Art Warning Dialog
  const [coverWarningOpen, setCoverWarningOpen] = useState(false)
  const [coverWarningMessage, setCoverWarningMessage] = useState('')
  const [coverWarningDims, setCoverWarningDims] = useState('')
  const [genreOpen, setGenreOpen] = useState(false)

  // Core Metadata
  const [releaseType, setReleaseType] = useState(initialData?.albums?.type || 'single')
  const [title, setTitle] = useState(initialData?.title || '')
  const [labelName, setLabelName] = useState(initialData?.albums?.label_name || '')
  const [primaryArtists, setPrimaryArtists] = useState<{name: string, spotifyId: string, appleId: string}[]>(() => {
      const fromDB = parseArtistEntries(initialData?.albums?.primary_artist, initialData?.albums?.primary_artist_spotify_id, initialData?.albums?.primary_artist_apple_id)
      if (fromDB.length > 0 && fromDB[0].name !== 'undefined') return fromDB
      
      if (userProfile?.artist_name) {
          return [{
              name: userProfile.artist_name,
              spotifyId: userProfile.spotify_artist_id || '',
              appleId: userProfile.apple_artist_id || ''
          }]
      }
      return []
  })
  const [featuringArtists, setFeaturingArtists] = useState<{name: string, spotifyId: string, appleId: string}[]>(() => parseArtistEntries(initialData?.albums?.featuring_artist, initialData?.albums?.featuring_artist_spotify_id, initialData?.albums?.featuring_artist_apple_id))
  const [genre, setGenre] = useState(initialData?.genre || initialData?.albums?.genre || '')
  const [subGenre, setSubGenre] = useState(initialData?.sub_genre || initialData?.albums?.sub_genre || '')
  const [courtesyLine, setCourtesyLine] = useState(initialData?.albums?.courtesy_line || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [language, setLanguage] = useState(initialData?.albums?.language || 'english')
  
  // Dates
  const [releaseDate, setReleaseDate] = useState(initialData?.albums?.release_date ? new Date(initialData.albums.release_date).toISOString().split('T')[0] : '')
  const [originalReleaseDate, setOriginalReleaseDate] = useState(initialData?.albums?.original_release_date ? new Date(initialData.albums.original_release_date).toISOString().split('T')[0] : '')

  // Dropdown States
  const [pLineYearOpen, setPLineYearOpen] = useState(false)
  const [cLineYearOpen, setCLineYearOpen] = useState(false)
  const [trackGenreOpen, setTrackGenreOpen] = useState(false)
  

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
            primaryArtists: parseArtistEntries(t.primary_artist, t.primary_artist_spotify_id, t.primary_artist_apple_id),
            featuringArtists: parseArtistEntries(t.featuring_artist, t.featuring_artist_spotify_id, t.featuring_artist_apple_id),
            genre: t.genre || '',
            subGenre: t.sub_genre || '',
            pLine: t.track_p_line || '',
            titleLanguage: t.title_language || 'english',
            lyricsLanguage: t.lyrics_language || 'english',
            lyrics: t.lyrics || '',
            lyricists: parseJSONEntries(t.lyricists),
            composers: parseJSONEntries(t.composers),
            producers: parseProducerEntries(t.producers),
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
        primaryArtists: [],
        featuringArtists: [],
        genre: '',
        subGenre: '',
        pLine: '',
        titleLanguage: 'english',
        lyricsLanguage: 'english',
        lyrics: '',
        lyricists: [],
        composers: [],
        producers: [],
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
    // Validate track count based on release type
    
    if (releaseType === 'single' && tracks.length >= 1) {
        toast.error("Singles can only have one track.")
        return
    }
    const newId = Math.random().toString(36).substr(2, 9)
    setTracks([...tracks, {
        id: newId,
        title: `Untitled Track ${tracks.length + 1}`,
        audioFile: null,
        duration: 0,
        audioAnalysis: null,
        trackVersion: 'original',
        versionSubtitle: '',
        primaryArtists: [],
        featuringArtists: [],
        genre: '',
        subGenre: '',
        pLine: '',
        titleLanguage: 'english',
        lyricsLanguage: 'english',
        lyrics: '',
        lyricists: [],
        composers: [],
        producers: [],
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
      setArtistDialogName('')
      setArtistDialogSpotify('')
      setArtistDialogApple('')
      setIsArtistDialogOpen(true)
  }

  const saveArtistDetails = () => {
      if (!artistDialogName) return 

      const isPrimary = artistDialogMode === 'release' || artistDialogMode === 'track';
      
      if (isPrimary) {
          const plan = userProfile?.plan_type || 'none';
          const registeredArtist = userProfile?.artist_name || '';
          
          if (plan === 'solo' || plan === 'none') {
              if (artistDialogName.toLowerCase().trim() !== registeredArtist.toLowerCase().trim()) {
                  toast.error(`On a Single Artist plan, you can only add your registered artist profile: ${registeredArtist}`);
                  return;
              }
              
              if (artistDialogMode === 'release' && primaryArtists.length >= 1) {
                  toast.error("Single Artist plan only allows one primary artist.");
                  return;
              }
              if (artistDialogMode === 'track' && currentTrack.primaryArtists.length >= 1) {
                  toast.error("Single Artist plan only allows one primary artist per track.");
                  return;
              }
          } else {
              // Multi/Elite plan limits
              const planLimit = userProfile?.max_artist_profiles;
              const defaultLimit = plan === 'multi' ? 5 : (plan === 'elite' ? 100 : 1);
              const limit = typeof planLimit === 'number' ? planLimit : defaultLimit;
              
              const currentReleasePrimary = primaryArtists.map(a => a.name.toLowerCase().trim());
              const currentTracksPrimary = tracks.flatMap(t => t.primaryArtists.map(a => a.name.toLowerCase().trim()));
              const allUniquePrimary = new Set([...currentReleasePrimary, ...currentTracksPrimary]);
              
              // Only block if we're adding a NEW unique artist that exceeds the limit
              if (allUniquePrimary.size >= limit && !allUniquePrimary.has(artistDialogName.toLowerCase().trim())) {
                  toast.error(`Your ${plan === 'elite' ? 'Label' : 'Multi Artist'} plan allows up to ${limit} primary artist profiles.`);
                  return;
              }
          }
      }

      const newArtist = { name: artistDialogName, spotifyId: artistDialogSpotify, appleId: artistDialogApple }
      
      if (artistDialogMode === 'release') {
          setPrimaryArtists(prev => [...prev, newArtist])
      } else if (artistDialogMode === 'release-featuring') {
          setFeaturingArtists(prev => [...prev, newArtist])
      } else if (artistDialogMode === 'track') {
          updateCurrentTrack({
              primaryArtists: [...currentTrack.primaryArtists, newArtist]
          })
      } else if (artistDialogMode === 'track-featuring') {
          updateCurrentTrack({
              featuringArtists: [...currentTrack.featuringArtists, newArtist]
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
        setSavedDraftId(null)
        window.location.reload()
    }
  }

  // Load draft from localStorage on mount (only for new uploads, not edits)
  useEffect(() => {
    if (initialData) return // Skip for edit mode - data comes from server
    try {
      const saved = localStorage.getItem('upload_draft')
      if (!saved) return
      const draft = JSON.parse(saved)
      if (!draft || !draft.title) return

      // Restore release-level fields
      if (draft.releaseType) setReleaseType(draft.releaseType)
      if (draft.title) setTitle(draft.title)
      if (draft.labelName) setLabelName(draft.labelName)
      if (draft.primaryArtists) setPrimaryArtists(draft.primaryArtists)
      if (draft.featuringArtists) setFeaturingArtists(draft.featuringArtists)
      if (draft.genre) setGenre(draft.genre)
      if (draft.subGenre) setSubGenre(draft.subGenre)
      if (draft.courtesyLine) setCourtesyLine(draft.courtesyLine)
      if (draft.description) setDescription(draft.description)
      if (draft.language) setLanguage(draft.language)
      if (draft.releaseDate) setReleaseDate(draft.releaseDate)
      if (draft.originalReleaseDate) setOriginalReleaseDate(draft.originalReleaseDate)
      if (draft.upc) setUpc(draft.upc)
      if (draft.pLineYear) setPLineYear(draft.pLineYear)
      if (draft.pLineText) setPLineText(draft.pLineText)
      if (draft.cLineYear) setCLineYear(draft.cLineYear)
      if (draft.cLineText) setCLineText(draft.cLineText)
      if (draft.selectedPlatforms) setSelectedPlatforms(draft.selectedPlatforms)

      // Restore the saved server-side draft ID (prevents duplicate album creation on re-save)
      if (draft.savedDraftId) setSavedDraftId(draft.savedDraftId)

      // Restore tracks (metadata only — audio files cannot be serialized)
      if (draft.tracks && draft.tracks.length > 0) {
        setTracks(draft.tracks.map((t: TrackItem) => ({
          ...t,
          audioFile: null, // Files cannot be stored in localStorage
        })))
        setActiveTrackId(draft.tracks[0].id)
      }

      setDraftLoaded(true)
      toast.info('Draft restored! Please re-upload any audio files.', { duration: 5000 })
    } catch {
      // Ignore corrupted draft data
      localStorage.removeItem('upload_draft')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
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

  // Artist remove helpers
  const removeReleasePrimaryArtist = (i: number) => setPrimaryArtists(prev => prev.filter((_, idx) => idx !== i))
  const removeReleaseFeaturingArtist = (i: number) => setFeaturingArtists(prev => prev.filter((_, idx) => idx !== i))
  const removeTrackPrimaryArtist = (i: number) => updateCurrentTrack({ primaryArtists: currentTrack.primaryArtists.filter((_: any, idx: number) => idx !== i) })
  const removeTrackFeaturingArtist = (i: number) => updateCurrentTrack({ featuringArtists: currentTrack.featuringArtists.filter((_: any, idx: number) => idx !== i) })

  // Producer helpers
  const [newProducerName, setNewProducerName] = useState('')
  const addProducer = () => {
      if (newProducerName.trim()) {
          updateCurrentTrack({ producers: [...currentTrack.producers, { name: newProducerName.trim() }] })
          setNewProducerName('')
      }
  }
  const removeProducer = (i: number) => {
      updateCurrentTrack({ producers: currentTrack.producers.filter((_: any, idx: number) => idx !== i) })
  }
  
  const togglePlatform = (id: string) => {
      const platform = ALL_PLATFORMS.find(p => p.id === id);
      const isElite = userProfile?.plan_type === 'elite';
      
      if (platform?.premium && !isElite) {
          toast.error(`${platform.name} monetization is only available on the Label (Elite) plan.`);
          return;
      }

      if (selectedPlatforms.includes(id)) {
          setSelectedPlatforms(selectedPlatforms.filter(p => p !== id))
      } else {
          setSelectedPlatforms([...selectedPlatforms, id])
      }
  }
  
  const toggleAllPlatforms = () => {
      const isElite = userProfile?.plan_type === 'elite';
      const availablePlatforms = isElite 
          ? ALL_PLATFORMS 
          : ALL_PLATFORMS.filter(p => !p.premium);

      if (selectedPlatforms.length === availablePlatforms.length) {
          setSelectedPlatforms([])
      } else {
          setSelectedPlatforms(availablePlatforms.map(p => p.id))
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
        // Capture the target track ID to ensure we update the correct track after async processing
        const targetTrackId = activeTrackId;
        
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

           // Update the specific track we started with
           setTracks(prev => prev.map(t => t.id === targetTrackId ? {
               ...t,
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
           } : t))
           
           if (!Object.keys(deepAnalysis).length) {
               toast.success("Audio basics valid!")
           } else {
               toast.success("Audio analysis complete!")
           }
           
           // Reset input so the same file can be uploaded again if needed (e.g. for another track)
           e.target.value = ''

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

      const img = new window.Image()
      img.src = URL.createObjectURL(file)
      img.onload = () => {
        const dims = `${img.width}x${img.height}px`
        if (img.width < 3000 || img.height < 3000) {
          setCoverWarningDims(dims)
          setCoverWarningMessage(`Your artwork is too small (${dims}). Minimum 3000×3000px is required by platforms like Apple Music and Spotify.`)
          setCoverWarningOpen(true)
          e.target.value = ''
          setCoverFile(null)
        } else if (img.width !== img.height) {
          setCoverWarningDims(dims)
          setCoverWarningMessage(`Your artwork is not square (${dims}). Square artwork (e.g. 3000×3000px) is required by most music platforms.`)
          setCoverWarningOpen(true)
          e.target.value = ''
          setCoverFile(null)
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

  const handleSaveDraftAndRedirect = async () => {
    setCoverWarningOpen(false)
    toast.info('Saving your release as a draft...')
    try {
      // Trigger the existing save-as-draft logic
      const draftBtn = document.querySelector('[data-draft-save]') as HTMLButtonElement
      if (draftBtn) {
        draftBtn.click()
        // Wait briefly for save to process
        await new Promise(resolve => setTimeout(resolve, 1500))
      }
      router.push('/dashboard/tools/media-studio?tab=image')
    } catch {
      toast.error('Failed to save draft. Please save manually and try again.')
    }
  }
  
  const validateStep = (step: number) => {
      if (step === 1) {
          if (!releaseType) { toast.error("Please select a release type."); return false; }
          if (!title.trim()) { toast.error("Release title is required."); return false; }
          if (title.length > 100) { toast.error("Title is too long (max 100 chars)."); return false; }
          if (!labelName.trim()) { toast.error("Label name is required."); return false; }
          if (primaryArtists.length === 0) { toast.error("At least one primary artist is required."); return false; }
          if (!releaseDate) { toast.error("Release date is required."); return false; }
          if (!genre) { toast.error("Genre is required."); return false; }
          if (!subGenre) { toast.error("Sub-genre is required."); return false; }
          if (!pLineYear || !pLineText) { toast.error("P-Line is required."); return false; }
          if (!cLineYear || !cLineText) { toast.error("C-Line is required."); return false; }

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
          // Validate Single Constraint
          if (releaseType === 'single' && tracks.length !== 1) {
              toast.error("Single releases must have exactly one track.")
              return false
          }

          // Validate all tracks
          for (const track of tracks) {
              // Audio
              if (!track.audioFile && !track.audioUrl) {
                  toast.error(`Audio file missing for track: ${track.title || 'Untitled'}`)
                  setActiveTrackId(track.id)
                  return false
              }
              
              // Basic Metadata
              if (!track.title.trim()) {
                  toast.error("Track title is required.")
                  setActiveTrackId(track.id)
                  return false
              }
              if (track.title.length > 100) {
                  toast.error(`Track title too long for: ${track.title}`)
                  setActiveTrackId(track.id)
                  return false
              }
              
              // Artists
              if (track.primaryArtists.length === 0) {
                  toast.error(`At least one primary artist required for track: ${track.title}`)
                  setActiveTrackId(track.id)
                  return false
              }

              // Genre & Sub-genre (Must match options if dropdown, but check existence)
              if (!track.genre) {
                  toast.error(`Genre is required for track: ${track.title}`)
                  setActiveTrackId(track.id)
                  return false
              }
              if (!track.subGenre) {
                  toast.error(`Sub-genre is required for track: ${track.title}`)
                  setActiveTrackId(track.id)
                  return false
              }

              // ISRC
              if (track.hasISRC === 'yes') {
                  if (!track.isrc) {
                    toast.error(`ISRC is required for track: ${track.title}`)
                    setActiveTrackId(track.id)
                    return false
                  }
                  if (!/^[A-Z]{2}[A-Z0-9]{3}[0-9]{7}$/.test(track.isrc)) {
                    toast.error(`Invalid ISRC format for track: ${track.title}`)
                    setActiveTrackId(track.id)
                    return false
                  }
              }

              // Producers & Composers & Lyricists logic
              // (Typically not mandatory unless specific rules apply, kept loose for now unless specified)
              
              // Explicit Logic
              if (!track.explicitType) {
                  toast.error(`Explicit type setting required for track: ${track.title}`)
                  setActiveTrackId(track.id)
                  return false
              }
          }
      }
      if (step === 3) {
          if (selectedPlatforms.length === 0) {
              toast.error("Please select at least one distribution platform.")
              return false
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

    // Save metadata to localStorage immediately when saving draft (before any async ops)
    // This preserves all typed text even if server-side save fails or user navigates away
    if (status === 'draft' && !initialData) {
      try {
        const draftData = {
          releaseType, title, labelName, primaryArtists, featuringArtists,
          genre, subGenre, courtesyLine, description, language,
          releaseDate, originalReleaseDate, upc,
          pLineYear, pLineText, cLineYear, cLineText,
          selectedPlatforms,
          savedDraftId, // Persist the server-side ID to prevent duplicate albums
          // Save track metadata (audioFile is a File object and cannot be serialized)
          tracks: tracks.map(t => ({
            ...t,
            audioFile: null, // Exclude File object
          }))
        }
        localStorage.setItem('upload_draft', JSON.stringify(draftData))
        setDraftLoaded(true)
      } catch {
        // localStorage may be full or unavailable - non-fatal
      }
    }

    setLoading(true)
    const supabase = createClient()
    const timestamp = Date.now()

    try {
        // Eligibility & Payment Check (Only for final submission)
        if (status === 'pending') {
            const eligibility = await checkSubmissionEligibility(initialData?.id || savedDraftId)
            
            if (!eligibility.eligible) {
                toast.error(eligibility.message || "You are not eligible to submit this release.")
                setLoading(false)
                return
            }

            if (eligibility.mustPay) {
                // To pay, we MUST have a draft saved first so we have an albumId
                let currentAlbumId = initialData?.id || savedDraftId
                
                if (!currentAlbumId) {
                    // Save as draft first to get an ID
                    toast.info("Saving draft before payment...")
                    const draftResult = await handleSubmit(e, 'draft') as any
                    if (draftResult?.success && draftResult?.trackId) {
                        currentAlbumId = draftResult.trackId
                    } else {
                        // If handleSubmit(e, 'draft') didn't return what we expected, it might have already set states
                        // But we need to stop here and let the user try again if it failed
                        setLoading(false)
                        return
                    }
                }

                // Trigger Razorpay
                try {
                    const order = await createRazorpayOrder(eligibility.amount!, currentAlbumId)
                    
                    const options = {
                        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                        amount: order.amount,
                        currency: order.currency,
                        name: "Swara Digital",
                        description: `Release Fee: ${title}`,
                        order_id: order.orderId,
                        handler: async function (response: any) {
                            try {
                                await verifyRazorpayPayment(
                                    response.razorpay_order_id,
                                    response.razorpay_payment_id,
                                    response.razorpay_signature
                                )
                                toast.success("Payment successful! Submitting your release...")
                                // After verification, we resume the submission immediately
                                handleSubmit(e, 'pending')
                            } catch (err: any) {
                                toast.error(err.message || 'Payment verification failed')
                                setLoading(false)
                            }
                        },
                        prefill: {
                            name: userProfile?.full_name || "",
                            email: userProfile?.email || "",
                        },
                        theme: {
                            color: "#6366f1",
                        },
                        modal: {
                            ondismiss: function() {
                                setLoading(false)
                            }
                        }
                    }

                    const rzp = new (window as any).Razorpay(options)
                    rzp.open()
                    return // Stop here, wait for handler
                } catch (err: any) {
                    toast.error(err.message || "Failed to initialize payment")
                    setLoading(false)
                    return
                }
            }
        }
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

            // detailed construction to avoid passing File objects to server action
            return {
                id: track.id,
                title: track.title,
                audioUrl,
                duration: track.duration,
                lyrics: track.lyrics,
                
                // Metadata
                primaryArtists: track.primaryArtists,
                featuringArtists: track.featuringArtists,
                genre: track.genre,
                subGenre: track.subGenre,
                
                // Credits
                lyricists: track.lyricists,
                composers: track.composers,
                producers: track.producers,
                publisher: track.publisher,
                productionYear: track.productionYear,
                
                // Rights & IDs
                pLine: track.pLine,
                isrc: track.hasISRC === 'yes' ? track.isrc : '',
                priceTier: track.priceTier,
                
                // Tech/Flags
                isInstrumental: track.isInstrumental,
                explicit: track.explicitType === 'yes', // normalized boolean
                explicitType: track.explicitType,
                trackVersion: track.trackVersion,
                versionSubtitle: track.versionSubtitle,
                callerTuneTiming: track.callerTuneTiming,
                distributeVideo: track.distributeVideo,
                titleLanguage: track.titleLanguage,
                lyricsLanguage: track.lyricsLanguage,
                
                audioAnalysis: track.audioAnalysis
            }
        }))

        const formData = {
            id: initialData?.id || savedDraftId, // Use server draft ID on repeat saves to avoid creating a new album
            title,
            releaseType,
            labelName,
            primaryArtists,
            featuringArtists,
            releaseDate,
            originalReleaseDate,
            pLine: `℗ ${pLineYear} ${pLineText}`,
            cLine: `© ${cLineYear} ${cLineText}`,
            courtesyLine,
            description,
            language,
            genre,
            subGenre,
            coverArtUrl,
            selectedPlatforms,
            upc,
            status: status,
            tracks: processedTracks
        }

        const result = await submitTrack(formData)
        
        if (!result.success) {
            console.warn("Submission failed:", result.error)
            toast.error(result.error || "Failed to submit release", {
                duration: 8000,
                className: "bg-red-600 text-white border-red-700 font-bold shadow-2xl"
            })
            setLoading(false)
            return
        }

        if (result.success) {
            if (status === 'draft') {
                // Update track IDs with real IDs from server for stable synchronization
                if (result.trackId) {
                    setSavedDraftId(result.trackId)
                }
                
                // Sync all track IDs if returned (Multi-track support)
                if (result.allTracks && result.allTracks.length > 0) {
                    const syncedTracks = tracks.map((track, index) => {
                        const serverTrack = result.allTracks[index];
                        if (serverTrack && serverTrack.id) {
                            return { ...track, id: serverTrack.id };
                        }
                        return track;
                    });
                    
                    setTracks(syncedTracks);
                    
                    // Re-save to localStorage with the new IDs for persistence across reloads
                    try {
                        const updatedDraftData = {
                            title,
                            releaseType,
                            labelName,
                            primaryArtists,
                            featuringArtists,
                            releaseDate,
                            originalReleaseDate,
                            pLineText,
                            pLineYear,
                            cLineText,
                            cLineYear,
                            courtesyLine,
                            language,
                            genre,
                            subGenre,
                            coverArtUrl,
                            selectedPlatforms,
                            upc,
                            savedDraftId: result.trackId,
                            tracks: syncedTracks.map(t => ({
                                ...t,
                                audioFile: null,
                            }))
                        }
                        localStorage.setItem('upload_draft', JSON.stringify(updatedDraftData))
                    } catch (e) {
                        console.warn("Could not update localStorage draft with IDs", e);
                    }
                }

                toast.success("Draft saved successfully! (Note: Audio files must be re-selected on reload)", { duration: 5000 })
                setDraftLoaded(true)
                setLoading(false)
                return
            }
            localStorage.removeItem('upload_draft')
            toast.success(initialData ? "Release updated successfully!" : "Release submitted successfully!")
            
            if (!initialData) {
                setIsSuccessDialogOpen(true)
            } else {
                router.push('/dashboard/catalog')
            }
        }
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Failed to submit release";
        toast.error(errorMessage)
    } finally {
        setLoading(false)
    }
    
    // Return result for nested calls
    return { success: true, trackId: initialData?.id || savedDraftId }
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
                <div className="mb-10 p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col md:flex-row gap-5 items-center md:items-start animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                        <Save className="text-indigo-400" size={24} />
                    </div>
                    <div className="text-center md:text-left">
                        <h3 className="text-white font-bold text-lg">Welcome to your first release!</h3>
                        <p className="text-zinc-400 text-sm max-w-2xl mt-1">
                            We&apos;ve simplified the process to get your music on Spotify, Apple Music, and more. 
                            Fill in your release details below to get started. Don&apos;t worry, you can always save as a draft!
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
                                {releaseTypes.map((type) => {
                                    const isBasicPlan = userProfile?.plan_type === 'solo' || userProfile?.plan_type === 'none';
                                    const isPremiumType = type.id !== 'single';
                                    const isDisabled = isBasicPlan && isPremiumType;

                                    return (
                                        <button
                                            type="button"
                                            key={type.id}
                                            onClick={(e) => { 
                                                e.preventDefault(); 
                                                
                                                if (isDisabled) {
                                                    toast.error(`${type.label} releases require a premium plan.`);
                                                    return;
                                                }

                                                if (type.id === 'single' && tracks.length > 1) {
                                                    toast.error("Cannot switch to Single. Remove extra tracks first.")
                                                    return
                                                }
                                                setReleaseType(type.id); 
                                            }}
                                            className={`px-4 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all border ${
                                                isDisabled 
                                                ? 'bg-zinc-900/50 text-zinc-600 border-white/5 opacity-60 cursor-not-allowed'
                                                : releaseType === type.id 
                                                    ? 'bg-indigo-500 text-white border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)]' 
                                                    : 'bg-white/5 text-zinc-400 border-white/10 hover:border-white/30 hover:bg-white/10'
                                            }`}
                                        >
                                            {type.label}
                                            {isDisabled && <span className="ml-1 text-[10px] text-indigo-400/70">(Pro)</span>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="releaseTitle" className="text-xs uppercase font-bold text-zinc-400">Release Title <span className="text-red-500">*</span></Label>
                                <Input id="releaseTitle" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Release Title" className="bg-white/5 border-white/10 text-white h-12" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="labelName" className="text-xs uppercase font-bold text-zinc-400">Label Name <span className="text-red-500">*</span></Label>
                                <Input id="labelName" value={labelName} onChange={(e) => setLabelName(e.target.value)} placeholder="Label Name" className="bg-white/5 border-white/10 text-white h-12" />
                            </div>
                        </div>
                        
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs uppercase font-bold text-zinc-400">Primary Artist(s) <span className="text-red-500">*</span></Label>
                                <Button 
                                    type="button" 
                                    onClick={() => openArtistDialog('release')} 
                                    disabled={(userProfile?.plan_type === 'solo' || userProfile?.plan_type === 'none') && primaryArtists.length >= 1}
                                    className="bg-indigo-500 hover:bg-indigo-600 text-white w-full h-10"
                                >
                                    <Plus size={14} className="mr-2" /> Add Primary Artist
                                </Button>
                                {primaryArtists.length > 0 && (
                                    <div className="space-y-1 mt-2">
                                        {primaryArtists.map((a, i) => (
                                            <div key={i} className="flex justify-between items-center bg-white/5 px-3 py-2 rounded text-sm text-zinc-300">
                                                <span>{a.name}{a.spotifyId && <span className="text-zinc-500 text-xs ml-1">• Spotify</span>}{a.appleId && <span className="text-zinc-500 text-xs ml-1">• Apple</span>}</span>
                                                <X size={14} className="cursor-pointer hover:text-red-500 shrink-0 ml-2" onClick={() => removeReleasePrimaryArtist(i)}/>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs uppercase font-bold text-zinc-400">Featuring Artist(s)</Label>
                                <Button type="button" onClick={() => openArtistDialog('release-featuring')} className="bg-indigo-500/80 hover:bg-indigo-600 text-white w-full h-10"><Plus size={14} className="mr-2" /> Add Featuring Artist</Button>
                                {featuringArtists.length > 0 && (
                                    <div className="space-y-1 mt-2">
                                        {featuringArtists.map((a, i) => (
                                            <div key={i} className="flex justify-between items-center bg-white/5 px-3 py-2 rounded text-sm text-zinc-300">
                                                <span>{a.name}{a.spotifyId && <span className="text-zinc-500 text-xs ml-1">• Spotify</span>}{a.appleId && <span className="text-zinc-500 text-xs ml-1">• Apple</span>}</span>
                                                <X size={14} className="cursor-pointer hover:text-red-500 shrink-0 ml-2" onClick={() => removeReleaseFeaturingArtist(i)}/>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="space-y-2">
                                <Label htmlFor="genre" className="text-xs uppercase font-bold text-zinc-400">Genre <span className="text-red-500">*</span></Label>
                                <Popover open={genreOpen} onOpenChange={setGenreOpen}>
                                    <PopoverTrigger asChild>
                                        <Button id="genre" variant="outline" role="combobox" aria-expanded={genreOpen} className="w-full bg-white/5 border-white/10 text-white h-12 justify-between hover:bg-white/10 font-normal">
                                            {genre ? GENRE_OPTIONS.find(g => g.value === genre)?.label : "Select Genre"}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-zinc-900 border-zinc-800" align="start">
                                        <Command className="bg-zinc-900">
                                            <CommandInput placeholder="Search genre..." className="text-white" />
                                            <CommandList className="max-h-60">
                                                <CommandEmpty className="text-zinc-500 text-sm py-4 text-center">No genre found.</CommandEmpty>
                                                <CommandGroup>
                                                    {GENRE_OPTIONS.map(g => (
                                                        <CommandItem
                                                            key={g.value}
                                                            value={g.label}
                                                            onSelect={() => { setGenre(g.value); setGenreOpen(false); }}
                                                            className="text-zinc-300 hover:bg-white/10 cursor-pointer"
                                                        >
                                                            <Check className={`mr-2 h-4 w-4 ${genre === g.value ? 'opacity-100 text-emerald-500' : 'opacity-0'}`} />
                                                            {g.label}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="subGenre" className="text-xs uppercase font-bold text-zinc-400">Sub Genre <span className="text-red-500">*</span></Label>
                                <Input id="subGenre" value={subGenre} onChange={(e) => setSubGenre(e.target.value)} placeholder="Enter sub genre" className="bg-white/5 border-white/10 text-white h-12" />
                            </div>
                        </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="releaseDate" className="text-xs uppercase font-bold text-zinc-400">Release Date <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                    <Input id="releaseDate" type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} className="bg-white/5 border-white/10 text-white h-12 pl-10" />
                                    <Calendar className="absolute left-3 top-3.5 text-zinc-500 h-5 w-5 pointer-events-none" />
                                </div>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="originalReleaseDate" className="text-xs uppercase font-bold text-zinc-400">Original Release Date</Label>
                                <div className="relative">
                                    <Input id="originalReleaseDate" type="date" value={originalReleaseDate} onChange={(e) => setOriginalReleaseDate(e.target.value)} className="bg-white/5 border-white/10 text-white h-12 pl-10" />
                                    <Calendar className="absolute left-3 top-3.5 text-zinc-500 h-5 w-5 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                        
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="space-y-2">
                                <Label htmlFor="upc" className="text-xs uppercase font-bold text-zinc-400">UPC/EAN (Optional)</Label>
                                <Input id="upc" value={upc} onChange={(e) => setUpc(e.target.value)} placeholder="UPC/EAN" className="bg-white/5 border-white/10 text-white h-12" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="pLineText" className="text-xs uppercase font-bold text-zinc-400">P-Line <span className="text-red-500">*</span></Label>
                                <div className="flex gap-2">
                                    <Popover open={pLineYearOpen} onOpenChange={setPLineYearOpen}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" role="combobox" aria-expanded={pLineYearOpen} className="w-[100px] bg-white/5 border-white/10 text-white h-12 justify-between hover:bg-white/10 font-normal px-2">
                                                {pLineYear || "Year"}
                                                <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[100px] p-0 bg-zinc-900 border-zinc-800">
                                            <Command className="bg-zinc-900">
                                                <CommandInput placeholder="Year" className="text-white h-8 text-xs" />
                                                <CommandList className="max-h-[200px]">
                                                    <CommandEmpty className="text-zinc-500 text-xs py-2 text-center">No year.</CommandEmpty>
                                                    <CommandGroup>
                                                        {years.map(y => (
                                                            <CommandItem
                                                                key={y}
                                                                value={y}
                                                                onSelect={() => { setPLineYear(y); setPLineYearOpen(false); }}
                                                                className="text-zinc-300 hover:bg-white/10 cursor-pointer text-xs"
                                                            >
                                                                <Check className={`mr-1 h-3 w-3 ${pLineYear === y ? 'opacity-100 text-emerald-500' : 'opacity-0'}`} />
                                                                {y}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <Input id="pLineText" value={pLineText} onChange={(e) => setPLineText(e.target.value)} placeholder="Owner" className="flex-1 bg-white/5 border-white/10 text-white h-12" />
                                </div>
                            </div>
                        </div>
                        
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="space-y-2">
                                <Label htmlFor="courtesyLine" className="text-xs uppercase font-bold text-zinc-400">Courtesy Line</Label>
                                <Input id="courtesyLine" value={courtesyLine} onChange={(e) => setCourtesyLine(e.target.value)} placeholder="Courtesy of Your Label Name" className="bg-white/5 border-white/10 text-white h-12" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cLineText" className="text-xs uppercase font-bold text-zinc-400">C-Line <span className="text-red-500">*</span></Label>
                                <div className="flex gap-2">
                                    <Popover open={cLineYearOpen} onOpenChange={setCLineYearOpen}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" role="combobox" aria-expanded={cLineYearOpen} className="w-[100px] bg-white/5 border-white/10 text-white h-12 justify-between hover:bg-white/10 font-normal px-2">
                                                {cLineYear || "Year"}
                                                <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[100px] p-0 bg-zinc-900 border-zinc-800">
                                            <Command className="bg-zinc-900">
                                                <CommandInput placeholder="Year" className="text-white h-8 text-xs" />
                                                <CommandList className="max-h-[200px]">
                                                    <CommandEmpty className="text-zinc-500 text-xs py-2 text-center">No year.</CommandEmpty>
                                                    <CommandGroup>
                                                        {years.map(y => (
                                                            <CommandItem
                                                                key={y}
                                                                value={y}
                                                                onSelect={() => { setCLineYear(y); setCLineYearOpen(false); }}
                                                                className="text-zinc-300 hover:bg-white/10 cursor-pointer text-xs"
                                                            >
                                                                <Check className={`mr-1 h-3 w-3 ${cLineYear === y ? 'opacity-100 text-emerald-500' : 'opacity-0'}`} />
                                                                {y}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <Input id="cLineText" value={cLineText} onChange={(e) => setCLineText(e.target.value)} placeholder="Owner" className="flex-1 bg-white/5 border-white/10 text-white h-12" />
                                </div>
                            </div>
                        </div>

                         <div className="space-y-2">
                            <Label htmlFor="description" className="text-xs uppercase font-bold text-zinc-400">Additional Information & Requests</Label>
                            <Textarea 
                                id="description"
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
                                    <input type="file" accept="audio/*" onChange={handleAudioChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" disabled={analyzingFile} />
                                    {analyzingFile ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Analyzing File...</p>
                                        </div>
                                    ) : currentTrack.audioFile || currentTrack.audioUrl ? (
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
                            <Label htmlFor="trackTitle" className="text-xs uppercase font-bold text-zinc-400">Title <span className="text-red-500">*</span></Label>
                            <Input id="trackTitle" value={currentTrack.title} onChange={(e) => updateCurrentTrack({ title: e.target.value })} placeholder="Song Title" className="bg-white/5 border-white/10 text-white h-12" />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="versionSubtitle" className="text-xs uppercase font-bold text-zinc-400">Version/Subtitle</Label>
                            <Input id="versionSubtitle" value={currentTrack.versionSubtitle} onChange={(e) => updateCurrentTrack({ versionSubtitle: e.target.value })} placeholder="Remix, Edit, etc." className="bg-white/5 border-white/10 text-white h-12" />
                        </div>
                        
                        <div className="space-y-2">
                            <Label className="text-xs uppercase font-bold text-zinc-400">Primary Artist(s) <span className="text-red-500">*</span></Label>
                            <Button 
                                type="button" 
                                onClick={() => openArtistDialog('track')} 
                                disabled={(userProfile?.plan_type === 'solo' || userProfile?.plan_type === 'none') && currentTrack.primaryArtists.length >= 1}
                                className="bg-indigo-500 hover:bg-indigo-600 text-white w-full h-10"
                            >
                                <Plus size={14} className="mr-2" /> Add Primary Artist
                            </Button>
                            {currentTrack.primaryArtists.length > 0 && (
                                <div className="space-y-1 mt-2">
                                    {currentTrack.primaryArtists.map((a: any, i: number) => (
                                        <div key={i} className="flex justify-between items-center bg-white/5 px-3 py-2 rounded text-sm text-zinc-300">
                                            <span>{a.name}{a.spotifyId && <span className="text-zinc-500 text-xs ml-1">• Spotify</span>}{a.appleId && <span className="text-zinc-500 text-xs ml-1">• Apple</span>}</span>
                                            <X size={14} className="cursor-pointer hover:text-red-500 shrink-0 ml-2" onClick={() => removeTrackPrimaryArtist(i)}/>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <div className="space-y-2">
                            <Label className="text-xs uppercase font-bold text-zinc-400">Featuring Artist(s)</Label>
                            <Button type="button" onClick={() => openArtistDialog('track-featuring')} className="bg-indigo-500/80 hover:bg-indigo-600 text-white w-full h-10"><Plus size={14} className="mr-2" /> Add Featuring Artist</Button>
                            {currentTrack.featuringArtists.length > 0 && (
                                <div className="space-y-1 mt-2">
                                    {currentTrack.featuringArtists.map((a: any, i: number) => (
                                        <div key={i} className="flex justify-between items-center bg-white/5 px-3 py-2 rounded text-sm text-zinc-300">
                                            <span>{a.name}{a.spotifyId && <span className="text-zinc-500 text-xs ml-1">• Spotify</span>}{a.appleId && <span className="text-zinc-500 text-xs ml-1">• Apple</span>}</span>
                                            <X size={14} className="cursor-pointer hover:text-red-500 shrink-0 ml-2" onClick={() => removeTrackFeaturingArtist(i)}/>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                                <div className="space-y-3">
                                     <Label htmlFor="lyricistFirst" className="text-xs uppercase font-bold text-zinc-400">Lyricist <span className="text-red-500">*</span></Label>
                                     <div className="flex gap-2">
                                        <Input id="lyricistFirst" value={newLyricistFirst} onChange={(e) => setNewLyricistFirst(e.target.value)} placeholder="First Name" className="bg-white/5 border-white/10 text-white h-12" />
                                        <Input id="lyricistLast" value={newLyricistLast} onChange={(e) => setNewLyricistLast(e.target.value)} placeholder="Last Name" className="bg-white/5 border-white/10 text-white h-12" aria-label="Lyricist Last Name" />
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
                                     <Label htmlFor="composerFirst" className="text-xs uppercase font-bold text-zinc-400">Composer <span className="text-red-500">*</span></Label>
                                     <div className="flex gap-2">
                                        <Input id="composerFirst" value={newComposerFirst} onChange={(e) => setNewComposerFirst(e.target.value)} placeholder="First Name" className="bg-white/5 border-white/10 text-white h-12" />
                                        <Input id="composerLast" value={newComposerLast} onChange={(e) => setNewComposerLast(e.target.value)} placeholder="Last Name" className="bg-white/5 border-white/10 text-white h-12" aria-label="Composer Last Name" />
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
                                
                                <div className="space-y-3">
                                    <Label htmlFor="producerName" className="text-xs uppercase font-bold text-zinc-400">Music Producer(s) <span className="text-red-500">*</span></Label>
                                    <div className="flex gap-2">
                                        <Input id="producerName" value={newProducerName} onChange={(e) => setNewProducerName(e.target.value)} placeholder="Producer Name" className="bg-white/5 border-white/10 text-white h-12" />
                                    </div>
                                    <Button type="button" onClick={addProducer} className="bg-indigo-500 hover:bg-indigo-600 text-white w-full h-10">+ Add Producer</Button>
                                    {currentTrack.producers.length > 0 && (
                                        <div className="space-y-1 mt-2">
                                            {currentTrack.producers.map((p: any, i: number) => (
                                                <div key={i} className="flex justify-between items-center bg-white/5 px-3 py-2 rounded text-sm text-zinc-300">
                                                    <span>{p.name}</span>
                                                    <X size={14} className="cursor-pointer hover:text-red-500" onClick={() => removeProducer(i)}/>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="lyricsFileUpload" className="text-xs uppercase font-bold text-zinc-400">Lyrics</Label>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <Input 
                                                id="lyricsFileUpload"
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
                                        <Textarea id="lyricsText" value={currentTrack.lyrics} onChange={(e) => updateCurrentTrack({ lyrics: e.target.value })} placeholder="Lyrics text..." className="bg-white/5 border-white/10 text-white min-h-[120px]" aria-label="Lyrics Content" />
                                    </div>
                                </div>
                             </div>

                             {/* RIGHT COLUMN */}
                             <div className="space-y-6">
                                 
                                  <div className="space-y-2">
                                    <Label htmlFor="trackPLine" className="text-xs uppercase font-bold text-zinc-400">P Line <span className="text-red-500">*</span></Label>
                                    <Input id="trackPLine" value={currentTrack.pLine} onChange={(e) => updateCurrentTrack({ pLine: e.target.value })} placeholder="Phonographic Copyright Line" className="bg-white/5 border-white/10 text-white h-12" />
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="trackProductionYear" className="text-xs uppercase font-bold text-zinc-400">Production Year <span className="text-red-500">*</span></Label>
                                    <Input id="trackProductionYear" value={currentTrack.productionYear} onChange={(e) => updateCurrentTrack({ productionYear: e.target.value })} placeholder="2026" className="bg-white/5 border-white/10 text-white h-12" />
                                </div>
                                
                                 <div className="space-y-2">
                                    <Label htmlFor="trackPublisher" className="text-xs uppercase font-bold text-zinc-400">Publisher</Label>
                                    <Input id="trackPublisher" value={currentTrack.publisher} onChange={(e) => updateCurrentTrack({ publisher: e.target.value })} placeholder="Publisher" className="bg-white/5 border-white/10 text-white h-12" />
                                </div>
                                
                                 <div className="space-y-3">
                                     <Label htmlFor="trackHasISRC" className="text-xs uppercase font-bold text-zinc-400">Have Your Own ISRC? <span className="text-red-500">*</span></Label>
                                     <div id="trackHasISRC" className="flex gap-4">
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
                                        <Input id="trackISRC" value={currentTrack.isrc} onChange={(e) => updateCurrentTrack({ isrc: e.target.value })} placeholder="Enter ISRC" className="bg-white/5 border-white/10 text-white h-12 mt-2" aria-label="ISRC Number" />
                                     )}
                                 </div>

                                <div className="space-y-2">
                                     <Label htmlFor="trackGenre" className="text-xs uppercase font-bold text-zinc-400">Genre <span className="text-red-500">*</span></Label>
                                     <Popover open={trackGenreOpen} onOpenChange={setTrackGenreOpen}>
                                        <PopoverTrigger asChild>
                                            <Button id="trackGenre" variant="outline" role="combobox" aria-expanded={trackGenreOpen} className="w-full bg-white/5 border-white/10 text-white h-12 justify-between hover:bg-white/10 font-normal">
                                                {currentTrack.genre ? GENRE_OPTIONS.find(g => g.value === currentTrack.genre)?.label : "Select Genre"}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-zinc-900 border-zinc-800" align="start">
                                            <Command className="bg-zinc-900">
                                                <CommandInput placeholder="Search genre..." className="text-white" />
                                                <CommandList className="max-h-60">
                                                    <CommandEmpty className="text-zinc-500 text-sm py-4 text-center">No genre found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {GENRE_OPTIONS.map(g => (
                                                            <CommandItem
                                                                key={g.value}
                                                                value={g.label}
                                                                onSelect={() => { updateCurrentTrack({ genre: g.value }); setTrackGenreOpen(false); }}
                                                                className="text-zinc-300 hover:bg-white/10 cursor-pointer"
                                                            >
                                                                <Check className={`mr-2 h-4 w-4 ${currentTrack.genre === g.value ? 'opacity-100 text-emerald-500' : 'opacity-0'}`} />
                                                                {g.label}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="trackSubGenre" className="text-xs uppercase font-bold text-zinc-400">Sub Genre <span className="text-red-500">*</span></Label>
                                    <Input id="trackSubGenre" value={currentTrack.subGenre} onChange={(e) => updateCurrentTrack({ subGenre: e.target.value })} placeholder="Sub Genre" className="bg-white/5 border-white/10 text-white h-12" />
                                </div>
                                
                                 <div className="space-y-2">
                                     <Label htmlFor="trackPriceTier" className="text-xs uppercase font-bold text-zinc-400">Price Tier <span className="text-red-500">*</span></Label>
                                     <Select value={currentTrack.priceTier} onValueChange={(val) => updateCurrentTrack({ priceTier: val })}>
                                        <SelectTrigger id="trackPriceTier" className="bg-white/5 border-white/10 text-white h-12"><SelectValue placeholder="Select Price Tier" /></SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="mid">Mid</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="premium">Premium</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                
                                 <div className="space-y-3">
                                     <Label htmlFor="trackExplicitType" className="text-xs uppercase font-bold text-zinc-400">Explicit Version <span className="text-red-500">*</span></Label>
                                     <div id="trackExplicitType" className="flex gap-4">
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
                                     <Label htmlFor="trackTitleLanguage" className="text-xs uppercase font-bold text-zinc-400">Track Title Language <span className="text-red-500">*</span></Label>
                                     <Select value={currentTrack.titleLanguage} onValueChange={(val) => updateCurrentTrack({ titleLanguage: val })}>
                                        <SelectTrigger id="trackTitleLanguage" className="bg-white/5 border-white/10 text-white h-12"><SelectValue placeholder="Track Title Language" /></SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                            <SelectItem value="english">English</SelectItem>
                                            <SelectItem value="spanish">Spanish</SelectItem>
                                            <SelectItem value="hindi">Hindi</SelectItem>
                                            <SelectItem value="french">French</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                
                                <div className="space-y-2">
                                     <Label htmlFor="trackLyricsLanguage" className="text-xs uppercase font-bold text-zinc-400">Lyrics Language <span className="text-red-500">*</span></Label>
                                     <Select value={currentTrack.lyricsLanguage} onValueChange={(val) => updateCurrentTrack({ lyricsLanguage: val })}>
                                        <SelectTrigger id="trackLyricsLanguage" className="bg-white/5 border-white/10 text-white h-12"><SelectValue placeholder="Lyrics Language" /></SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                            <SelectItem value="english">English</SelectItem>
                                            <SelectItem value="spanish">Spanish</SelectItem>
                                            <SelectItem value="hindi">Hindi</SelectItem>
                                            <SelectItem value="french">French</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="callerTuneTiming" className="text-xs uppercase font-bold text-zinc-400">Caller Tune Timing <span className="text-red-500">*</span></Label>
                                    <Input id="callerTuneTiming" value={currentTrack.callerTuneTiming} onChange={(e) => updateCurrentTrack({ callerTuneTiming: e.target.value })} placeholder="HH:MM:SS" className="bg-white/5 border-white/10 text-white h-12" />
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
                                } ${(platform.premium && userProfile?.plan_type !== 'elite') ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                             >
                                 <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                                     selectedPlatforms.includes(platform.id) ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-zinc-600'
                                 }`}>
                                     {selectedPlatforms.includes(platform.id) && <Check size={14} />}
                                 </div>
                                 <div className="flex flex-col items-center">
                                     <span className={`font-bold text-sm ${selectedPlatforms.includes(platform.id) ? 'text-emerald-400' : 'text-zinc-400'}`}>{platform.name}</span>
                                     {platform.premium && userProfile?.plan_type !== 'elite' && (
                                         <span className="text-[10px] text-amber-500 font-bold uppercase tracking-tighter mt-1">Elite Only</span>
                                     )}
                                 </div>
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
                                 <p className="text-zinc-400 flex items-center gap-2 mb-1"><span className="text-zinc-600 text-xs font-bold uppercase">Artist:</span> {primaryArtists.map(a => a.name).join(', ') || '-'}</p>
                                 <p className="text-zinc-400 flex items-center gap-2 mb-1"><span className="text-zinc-600 text-xs font-bold uppercase">Label:</span> {labelName}</p>
                                 <p className="text-zinc-400 flex items-center gap-2 mb-1"><span className="text-zinc-600 text-xs font-bold uppercase">Date:</span> {releaseDate}</p>
                                 {upc && <p className="text-zinc-400 flex items-center gap-2"><span className="text-zinc-600 text-xs font-bold uppercase">UPC:</span> {upc}</p>}
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
            <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-4 mt-12 pt-6 border-t border-white/10">
                {currentStep === 1 ? <div className="hidden md:block" /> : (
                    <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={prevStep} 
                        disabled={loading}
                        className="w-full md:w-auto text-zinc-400 hover:text-white hover:bg-white/5"
                    >
                        <ChevronLeft className="mr-2" size={16} /> Back
                    </Button>
                )}
                
                <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                    {/* Save Draft Button - Available at any step */}
                    <Button 
                        type="button" 
                        data-draft-save
                        onClick={(e) => handleSubmit(e, 'draft')}
                        disabled={loading || !title} // Minimum requirement: Title
                        className="w-full md:w-auto bg-white text-black hover:bg-zinc-200 transition-all h-12 px-6 rounded-md font-bold"
                    >
                        {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                        Save as Draft
                    </Button>

                    {currentStep < 4 ? (
                        <Button 
                            type="button" 
                            onClick={nextStep}
                            className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-12 px-8 rounded-md shadow-lg shadow-indigo-500/20"
                        >
                            Next Step <ChevronRight className="ml-2" size={16} />
                        </Button>
                    ) : (
                        <Button 
                            type="button"
                            onClick={(e) => handleSubmit(e, 'pending')} 
                            disabled={loading}
                            className="w-full md:w-auto bg-emerald-500 text-white hover:bg-emerald-400 font-black uppercase tracking-[0.2em] h-12 px-10 rounded-md shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_40px_rgba(52,211,153,0.5)] transition-all text-sm"
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
                            Enter the artist&apos;s name and platform links.
                        </DialogDescription>
                        {userProfile?.artist_name && (
                            <Button 
                                type="button" 
                                variant="outline" 
                                size="sm" 
                                onClick={() => {
                                    setArtistDialogName(userProfile.artist_name || '')
                                    setArtistDialogSpotify(userProfile.spotify_artist_id || '')
                                    setArtistDialogApple(userProfile.apple_artist_id || '')
                                }}
                                className="mt-2 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/10"
                            >
                                <User size={14} className="mr-2" /> Use My Profile
                            </Button>
                        )}
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="artistName" className="text-xs uppercase font-bold text-zinc-400">Artist Name <span className="text-red-500">*</span></Label>
                            <Input id="artistName" value={artistDialogName} onChange={(e) => setArtistDialogName(e.target.value)} placeholder="Artist Name" className="bg-white/5 border-white/10 text-white" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="artistSpotify" className="text-xs uppercase font-bold text-zinc-400">Spotify Artist ID/Link (Optional)</Label>
                            <Input id="artistSpotify" value={artistDialogSpotify} onChange={(e) => setArtistDialogSpotify(e.target.value)} placeholder="Spotify Link" className="bg-white/5 border-white/10 text-white" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="artistApple" className="text-xs uppercase font-bold text-zinc-400">Apple Music Artist ID/Link (Optional)</Label>
                            <Input id="artistApple" value={artistDialogApple} onChange={(e) => setArtistDialogApple(e.target.value)} placeholder="Apple Music Link" className="bg-white/5 border-white/10 text-white" />
                        </div>
                    </div>
                    <DialogFooter>
                         <Button variant="ghost" type="button" onClick={() => setIsArtistDialogOpen(false)} className="text-zinc-400 hover:text-white">Cancel</Button>
                         <Button type="button" onClick={saveArtistDetails} className="bg-indigo-600 hover:bg-indigo-500 text-white">Save Artist</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Cover Art Format Warning Dialog */}
            <Dialog open={coverWarningOpen} onOpenChange={setCoverWarningOpen}>
                <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-amber-400" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg">Cover Art Issue Detected</DialogTitle>
                                <DialogDescription className="text-zinc-400 text-sm">
                                    Your artwork doesn&apos;t meet platform requirements
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                            <p className="text-sm text-amber-200 leading-relaxed">
                                {coverWarningMessage}
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                            <p className="text-sm font-semibold text-white">What you can do:</p>
                            {userProfile?.plan_type === 'multi' || userProfile?.plan_type === 'elite' ? (
                                <ol className="text-sm text-zinc-400 space-y-1.5 list-decimal list-inside">
                                    <li>Save your current release as a <span className="text-white font-medium">Draft</span></li>
                                    <li>Go to <span className="text-indigo-400 font-medium">Tools → Cover Art Studio</span> to resize</li>
                                    <li>Come back and upload the fixed artwork</li>
                                </ol>
                            ) : (
                                <ol className="text-sm text-zinc-400 space-y-1.5 list-decimal list-inside">
                                    <li>Resize your artwork manually using a tool like Canva or Photoshop</li>
                                    <li><span className="text-amber-400 font-medium">Upgrade to a Pro Plan</span> to use our built-in Cover Art Studio and fix this instantly</li>
                                </ol>
                            )}
                        </div>
                    </div>
                    <DialogFooter className="flex flex-col sm:flex-row gap-2">
                        <Button 
                            variant="ghost" 
                            onClick={() => setCoverWarningOpen(false)} 
                            className="text-zinc-400 hover:text-white"
                        >
                            I&apos;ll fix it later
                        </Button>
                        {userProfile?.plan_type === 'multi' || userProfile?.plan_type === 'elite' ? (
                            <Button 
                                onClick={handleSaveDraftAndRedirect}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2"
                            >
                                <Save className="w-4 h-4" />
                                Save Draft & Go to Tools
                                <ExternalLink className="w-4 h-4" />
                            </Button>
                        ) : (
                            <Button 
                                onClick={() => router.push('/dashboard/billing')}
                                className="bg-amber-600 hover:bg-amber-500 text-white gap-2"
                            >
                                <Sparkles className="w-4 h-4" />
                                Upgrade to Pro
                                <ExternalLink className="w-4 h-4" />
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </form>

        <UploadSuccessDialog 
            isOpen={isSuccessDialogOpen} 
            onOpenChange={setIsSuccessDialogOpen} 
            isFirstUpload={isFirstUpload}
        />

        {/* Load Razorpay SDK */}
        <Script
            id="razorpay-checkout-js"
            src="https://checkout.razorpay.com/v1/checkout.js"
        />
    </div>
  )
}
