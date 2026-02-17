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

        // Get Artist ID
        const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single()
        
        if (!profile) return { success: false, error: 'Profile not found' }

        // 1. Check if Editing (Single Track/Album Update)
        if (formData.id) {
            // Update Track
            const { error: updateError } = await supabase
                .from('tracks')
                .update({
                    title: formData.title,
                    genre: formData.genre,
                    language: formData.language,
                    file_url: formData.audioUrl,
                    duration: formData.duration,
                    is_explicit: formData.explicit, 
                    status: formData.status || 'pending',
                    lyrics: formData.lyrics,
                    copyright_line: formData.copyright_line || formData.copyrightLine, // handle camel vs snake
                    publishing_line: formData.publishing_line || formData.publishingLine,
                    contributors: formData.contributors,
                    rejection_reason: null // Clear rejection reason on resubmit
                })
                .eq('id', formData.id)
                .eq('artist_id', user.id) // Security check

            if (updateError) throw new Error(updateError.message)

            // Update Album Cover if needed (Assuming 1:1 track-album for singles)
            // We need to fetch the track to get album_id first
            const { data: track } = await supabase.from('tracks').select('album_id').eq('id', formData.id).single()
            
            if (track?.album_id) {
                 await supabase.from('albums').update({
                    cover_art_url: formData.coverArtUrl,
                    title: formData.title + (formData.releaseType === 'single' ? ' - Single' : ''), 
                    release_date: formData.releaseDate || null,
                    label_name: formData.labelName,
                    primary_artist: formData.primaryArtist,
                    genre: formData.genre,
                    sub_genre: formData.subGenre,
                    original_release_date: formData.originalReleaseDate || null,
                    p_line: formData.pLine,
                    c_line: formData.cLine,
                    courtesy_line: formData.courtesyLine,
                    description: formData.description
                 }).eq('id', track.album_id)
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
                primary_artist: formData.primaryArtist,
                featuring_artist: formData.featuringArtist,
                genre: formData.genre,
                sub_genre: formData.subGenre,
                original_release_date: formData.originalReleaseDate || null,
                p_line: formData.pLine,
                c_line: formData.cLine,
                courtesy_line: formData.courtesyLine,
                description: formData.description,
                target_platforms: formData.selectedPlatforms,
                primary_artist_spotify_id: formData.primaryArtistSpotify,
                primary_artist_apple_id: formData.primaryArtistApple,
                featuring_artist_spotify_id: formData.featuringArtistSpotify,
                featuring_artist_apple_id: formData.featuringArtistApple
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
            // Validate required fields
            if (!track.audioUrl) {
                return { success: false, error: `Missing audio file for track: ${track.title}` };
            }

            // Check Fingerprinting & Transcoding for each track
            const { isMatched, fingerprintId } = await checkAudioFingerprint(track.audioUrl, track.title || '');
            const { standardUrl, previewUrl } = await simulateTranscode(track.audioUrl);

            tracksToInsert.push({
                artist_id: user.id,
                album_id: album.id,
                title: track.title, 
                file_url: track.audioUrl,
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
                primary_artist: track.primaryArtist || formData.primaryArtist, 
                featuring_artist: track.featuringArtist,
                sub_genre: track.subGenre || formData.subGenre,
                genre: track.genre || formData.genre, 
                
                lyricists: track.lyricists,
                composers: track.composers,
                producers: track.producer,
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
                 // Artist IDs
                primary_artist_spotify_id: track.primaryArtistSpotify,
                primary_artist_apple_id: track.primaryArtistApple,
                featuring_artist_spotify_id: track.featuringArtistSpotify,
                featuring_artist_apple_id: track.featuringArtistApple,

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
        
        if (tracksError) throw new Error(tracksError.message)

        revalidatePath('/dashboard')
        return { success: true }
        
    } catch (error: any) {
        console.error("Submit Track Detailed Error:", error)
        // Check if it's a Supabase error (often has details/hint)
        const detailedError = error.details || error.hint || error.message || JSON.stringify(error);
        return { 
            success: false, 
            error: `Upload Failed: ${detailedError}` 
        }
    }
}
