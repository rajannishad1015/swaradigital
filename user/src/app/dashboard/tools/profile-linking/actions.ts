'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Fetch all albums and tracks for the current artist to populate dropdowns.
 */
export async function getReleasesAndTracks() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    // Fetch albums
    const { data: albums, error: albumError } = await supabase
        .from('albums')
        .select('id, title')
        .eq('artist_id', user.id)
        .order('created_at', { ascending: false })

    if (albumError) throw new Error(albumError.message)

    // Fetch tracks
    const { data: tracks, error: trackError } = await supabase
        .from('tracks')
        .select('id, title, album_id')
        .eq('artist_id', user.id)
        .order('created_at', { ascending: false })

    if (trackError) throw new Error(trackError.message)

    return { albums: albums || [], tracks: tracks || [] }
}

/**
 * Submit a new profile linking request.
 */
export async function submitLinkRequest(data: {
    album_id: string;
    track_id: string;
    artist_name: string;
    facebook_url?: string;
    instagram_url?: string;
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase
        .from('profile_link_requests')
        .insert({
            artist_id: user.id,
            album_id: data.album_id,
            track_id: data.track_id,
            artist_name: data.artist_name,
            facebook_url: data.facebook_url || null,
            instagram_url: data.instagram_url || null,
            status: 'pending'
        })

    if (error) throw new Error(error.message)

    revalidatePath('/dashboard/tools/profile-linking')
    return { success: true }
}

/**
 * Fetch historical link requests for the current user.
 */
export async function getLinkHistory() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    const { data, error } = await supabase
        .from('profile_link_requests')
        .select(`
            *,
            albums (title),
            tracks (title)
        `)
        .eq('artist_id', user.id)
        .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data
}
