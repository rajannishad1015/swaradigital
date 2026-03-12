'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { checkSubmissionEligibility } from '../actions'

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

// Simulates automated transcoding
async function simulateTranscode(fileUrl: string) {
    // Return standard URL as the uploaded file URL and preview as either original or null so it doesn't break.
    return {
        standardUrl: fileUrl, 
        previewUrl: null
    };
}

export async function submitTrack(formData: any) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { success: false, error: 'Unauthorized' }
        }

        // Security: Check eligibility if not saving as draft
        if (formData.status !== 'draft') {
            const eligibility = await checkSubmissionEligibility(formData.id)
            if (!eligibility.eligible) {
                return { success: false, error: eligibility.message || "You are not eligible to submit this release. Please check your plan." }
            }
            if (eligibility.mustPay) {
                return { success: false, error: "Payment required for this release. Please pay the release fee." }
            }
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

        // Get User Profile with Plan Details
        const { data: profile } = await supabase
            .from('profiles')
            .select('id, artist_name, plan_type, max_artist_profiles')
            .eq('id', user.id)
            .single()

        if (!profile) return { success: false, error: 'Profile not found' }

        // Plan-based validation for release type
        const plan = profile.plan_type || 'none';
        if ((plan === 'solo' || plan === 'none') && formData.releaseType !== 'single') {
            return {
                success: false,
                error: 'Your plan only allows Single releases. Please upgrade to a Multi Artist or Label plan to submit EPs, Albums, or Compilations.'
            };
        }

        // Plan-based validation for primary artists
        const registeredArtist = (profile.artist_name || '').toLowerCase().trim();
        
        const validateArtists = (artists: any[], context: string) => {
            if (!artists || !Array.isArray(artists)) return null;
            if (artists.length === 0) return null;
            
            if (plan === 'solo' || plan === 'none') {
                if (artists.length > 1) return `Single Artist plan only allows one primary artist for ${context}.`;
                if (artists[0].name.toLowerCase().trim() !== registeredArtist) {
                    return `On a Single Artist plan, you can only use your registered artist profile: ${profile.artist_name}`;
                }
            }
            return null;
        };

        // 1. Validate Release-level Primary Artists
        const releaseArtistError = validateArtists(formData.primaryArtists, "the release");
        if (releaseArtistError) return { success: false, error: releaseArtistError };

        // 2. Validate Track-level Primary Artists and calculate unique count
        const allUniquePrimary = new Set<string>();
        (formData.primaryArtists || []).forEach((a: any) => allUniquePrimary.add(a.name.toLowerCase().trim()));
        
        const tracksArray = Array.isArray(formData.tracks) ? formData.tracks : [];
        for (const track of tracksArray) {
            const trackArtistError = validateArtists(track.primaryArtists, `track "${track.title}"`);
            if (trackArtistError) return { success: false, error: trackArtistError };
            
            if (track.primaryArtists && Array.isArray(track.primaryArtists)) {
                track.primaryArtists.forEach((a: any) => allUniquePrimary.add(a.name.toLowerCase().trim()));
            }
        }

        // 3. Check limit for Multi/Elite plans
        if (plan !== 'solo' && plan !== 'none') {
            const planLimit = profile.max_artist_profiles;
            const defaultLimit = plan === 'multi' ? 5 : (plan === 'elite' ? 100 : 1);
            const limit = typeof planLimit === 'number' ? planLimit : defaultLimit;
            
            if (allUniquePrimary.size > limit) {
                return { success: false, error: `Your ${plan === 'elite' ? 'Label' : 'Multi Artist'} plan allows up to ${limit} unique primary artist profiles. Currently using ${allUniquePrimary.size}.` };
            }
        }

        // 4. Removed Social Media restriction logic as requested

        let albumId: string | null = null;

        // 1. Check if Editing (Single Track/Album Update)
        if (formData.id) {
            // First, get the current track and it's album_id
            const { data: currentTrack } = await supabase
                .from('tracks')
                .select('album_id')
                .eq('id', formData.id)
                .single()

            if (!currentTrack) throw new Error("Track not found")
            albumId = currentTrack.album_id

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
                    primary_artist_spotify_id: formData.primaryArtists?.[0]?.spotifyId || '',
                    primary_artist_apple_id: formData.primaryArtists?.[0]?.appleId || '',
                    featuring_artist_spotify_id: formData.featuringArtists?.[0]?.spotifyId || '',
                    featuring_artist_apple_id: formData.featuringArtists?.[0]?.appleId || ''
                })
                .eq('id', albumId)
                .eq('artist_id', user.id)

            if (albumUpdateError) throw new Error(`Album update failed: ${albumUpdateError.message}`)

            // Consume floating credit if user just submitted this draft for release on the 'solo' or 'none' plan
            if ((profile.plan_type === 'solo' || profile.plan_type === 'none' || !profile.plan_type) && formData.status !== 'draft') {
                const { data: floatingCredit } = await supabase
                    .from('release_payments')
                    .select('id')
                    .eq('user_id', user.id)
                    .is('album_id', null)
                    .eq('status', 'captured')
                    .maybeSingle()

                if (floatingCredit) {
                    await supabase.from('release_payments').update({ album_id: albumId }).eq('id', floatingCredit.id)
                }
            }

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
                    lyricists: JSON.stringify(track.lyricists),
                    composers: JSON.stringify(track.composers),
                    producers: JSON.stringify(track.producers),
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
                    
                    // Artist IDs (first entry for backward compat)
                    primary_artist_spotify_id: track.primaryArtists?.[0]?.spotifyId || '',
                    primary_artist_apple_id: track.primaryArtists?.[0]?.appleId || '',
                    featuring_artist_spotify_id: track.featuringArtists?.[0]?.spotifyId || '',
                    featuring_artist_apple_id: track.featuringArtists?.[0]?.appleId || '',
                    
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
        } else {
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
            albumId = album.id

            // Consume floating credit if user bought the solo plan from billing page
            if ((profile.plan_type === 'solo' || profile.plan_type === 'none' || !profile.plan_type) && formData.status !== 'draft') {
                const { data: floatingCredit } = await supabase
                    .from('release_payments')
                    .select('id')
                    .eq('user_id', user.id)
                    .is('album_id', null)
                    .eq('status', 'captured')
                    .maybeSingle()

                if (floatingCredit) {
                    await supabase.from('release_payments').update({ album_id: albumId }).eq('id', floatingCredit.id)
                }
            }

            // 3. Create Tracks (Multi-track support)
            const tracksToInsert = [];
            const tracksData = Array.isArray(formData.tracks) ? formData.tracks : [];

            if (tracksData.length === 0) {
               return { success: false, error: "No tracks provided for upload." }
            }

            for (const track of tracksData) {
                if (!track.audioUrl && formData.status !== 'draft') {
                    return { success: false, error: `Missing audio file for track: ${track.title}` };
                }

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
                    album_id: albumId,
                    title: track.title, 
                    file_url: track.audioUrl || null,
                    duration: track.duration || 0,
                    is_explicit: track.explicit,
                    lyrics: track.lyrics,
                    copyright_line: formData.cLine,
                    publishing_line: formData.pLine,
                    version_type: track.trackVersion || 'original',
                    is_instrumental: track.isInstrumental || 'no',
                    version_subtitle: track.versionSubtitle,
                    primary_artist: JSON.stringify(track.primaryArtists || formData.primaryArtists), 
                    featuring_artist: JSON.stringify(track.featuringArtists),
                    sub_genre: track.subGenre || formData.subGenre,
                    genre: track.genre || formData.genre, 
                    lyricists: JSON.stringify(track.lyricists),
                    composers: JSON.stringify(track.composers),
                    producers: JSON.stringify(track.producers),
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
                    primary_artist_spotify_id: track.primaryArtists?.[0]?.spotifyId || '',
                    primary_artist_apple_id: track.primaryArtists?.[0]?.appleId || '',
                    featuring_artist_spotify_id: track.featuringArtists?.[0]?.spotifyId || '',
                    featuring_artist_apple_id: track.featuringArtists?.[0]?.appleId || '',
                    bitrate: track.audioAnalysis?.bitrate,
                    sample_rate: track.audioAnalysis?.sampleRate,
                    channels: track.audioAnalysis?.channels,
                    encoding: track.audioAnalysis?.format,
                    preview_url: previewUrl,
                    standard_url: standardUrl,
                    fingerprint_id: fingerprintId,
                    is_flagged: isMatched,
                    status: isMatched ? 'flagged' : (formData.status || 'pending'),
                    file_size: 0 
                });
            }

            const { error: tracksError } = await supabase.from('tracks').insert(tracksToInsert);
            if (tracksError) {
                await supabase.from('albums').delete().eq('id', albumId)
                throw new Error(tracksError.message)
            }
        }

        revalidatePath('/dashboard')
        
        // Fetch all track IDs for this album to return to the client for syncing
        const { data: albumTracks } = await supabase
            .from('tracks')
            .select('id, title')
            .eq('album_id', albumId)
            .order('created_at')

        return { 
            success: true, 
            trackId: albumTracks?.[0]?.id, 
            allTracks: albumTracks || [] 
        }
    } catch (error: any) {
        const detailedError = error?.message || "Internal server error";
        return { success: false, error: `Upload Failed: ${detailedError}` }
    }
}
