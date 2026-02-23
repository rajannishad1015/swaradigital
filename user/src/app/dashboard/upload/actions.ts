'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Simulates audio fingerprinting against external DB
async function checkAudioFingerprint(fileUrl: string, title: string) {
    // In a real scenario, we'd send the file buffer/URL to ACRCloud or Audible Magic
    // Simulation: Flag anything with 'copyright' or 'leaked' in the title
    const suspiciousKeywords = ['copyright', 'leaked', 'test-match'];
    const isMatched = suspiciousKeywords.some(kw => title.toLowerCase().includes(kw));
    
    return {
        isMatched,
        fingerprintId: isMatched ? `MATCH-${Math.random().toString(36).substr(2, 9)}` : null
    };
}

// Simulates automated transcoding (e.g. via FFmpeg or Supabase Edge Functions)
async function simulateTranscode(fileUrl: string) {
    // In reality, this would trigger an async job.
    // We return placeholders for the standard and preview MP3 versions.
    return {
        standardUrl: fileUrl.replace(/\.(wav|flac|aif)$/i, '.mp3'), // Mocked transformation
        previewUrl: fileUrl.replace(/\.(wav|flac|aif|mp3)$/i, '_preview.mp3')
    };
}

export async function submitTrack(formData: any) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { success: false, error: 'Unauthorized' }
        }

        // Server-side input validation
        if (!formData.title || typeof formData.title !== 'string' || formData.title.trim().length === 0) {
            return { success: false, error: 'Release title is required' }
        }
        if (formData.title.length > 200) {
            return { success: false, error: 'Release title is too long (max 200 characters)' }
        }
        if (!formData.releaseType || !['single', 'ep', 'album', 'compilation'].includes(formData.releaseType)) {
            return { success: false, error: 'Invalid release type' }
        }

        // Get Artist ID
        const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single()
        
        if (!profile) return { success: false, error: 'Profile not found' }

        // 1. Check if Editing (Single Track/Album Update)
        if (formData.id) {
            // First, get the current track and it's album_id
            const { data: currentTrack } = await supabase
                .from('tracks')
                .select('album_id')
                .eq('id', formData.id)
                .single()

            if (!currentTrack) throw new Error("Track not found")
            const albumId = currentTrack.album_id

            // Update Album Metadata
            const { error: albumUpdateError } = await supabase
                .from('albums')
                .update({
                    title: formData.title + (formData.releaseType === 'single' ? ' - Single' : ''),
                    type: formData.releaseType || 'single',
                    cover_art_url: formData.coverArtUrl,
                    release_date: formData.releaseDate || null,
                    total_tracks: formData.tracks ? formData.tracks.length : 1,
                    label_name: formData.labelName,
                    primary_artist: JSON.stringify(formData.primaryArtists),
                    featuring_artist: JSON.stringify(formData.featuringArtists),
                    genre: formData.genre,
                    sub_genre: formData.subGenre,
                    original_release_date: formData.originalReleaseDate || null,
                    p_line: formData.pLine,
                    c_line: formData.cLine,
                    courtesy_line: formData.courtesyLine,
                    description: formData.description,
                    upc: formData.upc,
                    target_platforms: formData.selectedPlatforms,
                })
                .eq('id', albumId)
                .eq('artist_id', user.id)

            if (albumUpdateError) throw new Error(`Album update failed: ${albumUpdateError.message}`)

            // Now Process Tracks
            // We'll update existing tracks, insert new ones, and remove deleted ones
            const existingTrackIds = (await supabase.from('tracks').select('id').eq('album_id', albumId)).data?.map(t => t.id) || []
            const currentFormTrackIds = formData.tracks.map((t: any) => t.id).filter((id: any) => id && id.length > 10) // UUIDs are > 10 chars

            // 1. Delete tracks that are no longer in the form
            const tracksToDelete = existingTrackIds.filter(id => !currentFormTrackIds.includes(id))
            if (tracksToDelete.length > 0) {
                await supabase.from('tracks').delete().in('id', tracksToDelete).eq('artist_id', user.id)
            }

            // 2. Update or Insert Tracks
            for (const track of formData.tracks) {
                const isNewTrack = !track.id || track.id.length < 10 // temporary IDs are short

                // Tech Metadata / Analysis
                let standardUrl = track.audioUrl, previewUrl = null, fingerprintId = null, isMatched = false;
                if (track.audioUrl && (track.audioFile || !track.preview_url)) {
                     // If there's a new file OR no preview yet, run processing
                     const fpResult = await checkAudioFingerprint(track.audioUrl, track.title || '');
                     isMatched = fpResult.isMatched;
                     fingerprintId = fpResult.fingerprintId;
                     const tcResult = await simulateTranscode(track.audioUrl);
                     standardUrl = tcResult.standardUrl;
                     previewUrl = tcResult.previewUrl;
                }

                const trackPayload = {
                    artist_id: user.id,
                    album_id: albumId,
                    title: track.title,
                    file_url: track.audioUrl,
                    duration: track.duration,
                    is_explicit: track.explicit,
                    lyrics: track.lyrics,
                    copyright_line: formData.cLine,
                    publishing_line: formData.pLine,
                    version_type: track.trackVersion || 'original',
                    is_instrumental: track.isInstrumental || 'no',
                    version_subtitle: track.versionSubtitle,
                    primary_artist: JSON.stringify(track.primaryArtists || formData.primaryArtists),
                    featuring_artist: JSON.stringify(track.featuringArtists),
                    genre: track.genre || formData.genre,
                    sub_genre: track.subGenre || formData.subGenre,
                    lyricists: track.lyricists,
                    composers: track.composers,
                    producers: track.producers,
                    production_year: track.productionYear || null,
                    publisher: track.publisher,
                    isrc: track.isrc,
                    price_tier: track.priceTier,
                    explicit_type: track.explicitType,
                    track_p_line: track.pLine,
                    caller_tune_timing: track.callerTuneTiming,
                    distribute_video: track.distributeVideo === 'yes',
                    title_language: track.titleLanguage,
                    lyrics_language: track.lyricsLanguage,
                    
                    // Tech
                    bitrate: track.audioAnalysis?.bitrate,
                    sample_rate: track.audioAnalysis?.sampleRate,
                    channels: track.audioAnalysis?.channels,
                    encoding: track.audioAnalysis?.format,
                    
                    status: isMatched ? 'flagged' : (formData.status || 'pending'),
                    rejection_reason: null // Clear rejection reason on resubmit
                }

                if (isNewTrack) {
                    await supabase.from('tracks').insert(trackPayload)
                } else {
                    await supabase.from('tracks').update(trackPayload).eq('id', track.id).eq('artist_id', user.id)
                }
            }

            revalidatePath('/dashboard')
            return { success: true }
        }


        // 2. Create Album (New Upload)
        const { data: album, error: albumError } = await supabase
            .from('albums')
            .insert({
                artist_id: user.id,
                title: formData.title + (formData.releaseType === 'single' ? ' - Single' : ''),
                type: formData.releaseType || 'single',
                cover_art_url: formData.coverArtUrl,
                release_date: formData.releaseDate || null,
                total_tracks: formData.tracks ? formData.tracks.length : 1,
                label_name: formData.labelName,
                primary_artist: JSON.stringify(formData.primaryArtists),
                featuring_artist: JSON.stringify(formData.featuringArtists),
                genre: formData.genre,
                sub_genre: formData.subGenre,
                original_release_date: formData.originalReleaseDate || null,
                p_line: formData.pLine,
                c_line: formData.cLine,
                courtesy_line: formData.courtesyLine,
                description: formData.description,
                target_platforms: formData.selectedPlatforms,
                upc: formData.upc,
                primary_artist_spotify_id: formData.primaryArtists?.[0]?.spotifyId || '',
                primary_artist_apple_id: formData.primaryArtists?.[0]?.appleId || '',
                featuring_artist_spotify_id: formData.featuringArtists?.[0]?.spotifyId || '',
                featuring_artist_apple_id: formData.featuringArtists?.[0]?.appleId || ''
            })
            .select()
            .single()

        if (albumError) throw new Error(albumError.message)

        // 3. Create Tracks (Multi-track support)
        const tracksToInsert = [];
        
        // Ensure formData.tracks exists and is an array
        const tracksData = Array.isArray(formData.tracks) ? formData.tracks : [];

        if (tracksData.length === 0) {
           return { success: false, error: "No tracks provided for upload." }
        }

        for (const track of tracksData) {
            // Validate required fields (skip audio check for drafts)
            if (!track.audioUrl && formData.status !== 'draft') {
                return { success: false, error: `Missing audio file for track: ${track.title}` };
            }

            // Check Fingerprinting & Transcoding for each track (skip for drafts without audio)
            let isMatched = false, fingerprintId = null, standardUrl = null, previewUrl = null;
            if (track.audioUrl) {
                const fpResult = await checkAudioFingerprint(track.audioUrl, track.title || '');
                isMatched = fpResult.isMatched;
                fingerprintId = fpResult.fingerprintId;
                const tcResult = await simulateTranscode(track.audioUrl);
                standardUrl = tcResult.standardUrl;
                previewUrl = tcResult.previewUrl;
            }

            tracksToInsert.push({
                artist_id: user.id,
                album_id: album.id,
                title: track.title, 
                file_url: track.audioUrl || null,
                duration: track.duration || 0,
                is_explicit: track.explicit,
                lyrics: track.lyrics,
                copyright_line: formData.cLine, // Inherit from album release
                publishing_line: formData.pLine, // Inherit from album release
                
                // New Detailed Fields
                version_type: track.trackVersion || 'original',
                is_instrumental: track.isInstrumental || 'no',
                version_subtitle: track.versionSubtitle,
                // Track specific overrides
                primary_artist: JSON.stringify(track.primaryArtists || formData.primaryArtists), 
                featuring_artist: JSON.stringify(track.featuringArtists),
                sub_genre: track.subGenre || formData.subGenre,
                genre: track.genre || formData.genre, 
                
                lyricists: track.lyricists,
                composers: track.composers,
                producers: track.producers,
                production_year: track.productionYear || null,
                publisher: track.publisher,
                isrc: track.isrc,
                price_tier: track.priceTier,
                explicit_type: track.explicitType,
                caller_tune_timing: track.callerTuneTiming,
                distribute_video: track.distributeVideo === 'yes',
                title_language: track.titleLanguage,
                lyrics_language: track.lyricsLanguage,
                track_p_line: track.pLine,
                 // Artist IDs (first entry for backward compat)
                primary_artist_spotify_id: track.primaryArtists?.[0]?.spotifyId || '',
                primary_artist_apple_id: track.primaryArtists?.[0]?.appleId || '',
                featuring_artist_spotify_id: track.featuringArtists?.[0]?.spotifyId || '',
                featuring_artist_apple_id: track.featuringArtists?.[0]?.appleId || '',

                // Tech Metadata
                bitrate: track.audioAnalysis?.bitrate,
                sample_rate: track.audioAnalysis?.sampleRate,
                channels: track.audioAnalysis?.channels,
                encoding: track.audioAnalysis?.format, // e.g., 'MP3'
                
                // Phase 2: Transcoding & Fingerprinting
                preview_url: previewUrl,
                standard_url: standardUrl,
                fingerprint_id: fingerprintId,
                is_flagged: isMatched,
                status: isMatched ? 'flagged' : (formData.status || 'pending'),

                file_size: 0 
            });
        }

        const { error: tracksError } = await supabase
            .from('tracks')
            .insert(tracksToInsert);
        
        if (tracksError) {
            // CLEANUP: Delete orphaned album to avoid stale data
            await supabase.from('albums').delete().eq('id', album.id)
            throw new Error(tracksError.message)
        }

        revalidatePath('/dashboard')
        // Return the first track's ID so clients can switch to edit mode on subsequent saves
        const firstTrackId = tracksToInsert.length > 0
            ? (await supabase.from('tracks').select('id').eq('album_id', album.id).order('created_at').limit(1).single()).data?.id
            : undefined
        return { success: true, trackId: firstTrackId }
        
    } catch (error: unknown) {
        // Check if it's a Supabase error (often has details/hint)
        const err = error as Record<string, string> | null
        const detailedError = err?.details || err?.hint || err?.message || (error instanceof Error ? error.message : 'Unknown error');
        return { 
            success: false, 
            error: `Upload Failed: ${detailedError}` 
        }
    }
}
