'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAdminAction } from '@/utils/logger'

export async function getTrackDetails(id: string) {
    const supabase = await createClient()

    // 1. Fetch Track with Relations
    const { data: track, error } = await supabase
        .from('tracks')
        .select(`
            *,
            albums (*),
            profiles:artist_id (*)
        `)
        .eq('id', id)
        .single()
        
    if (error) throw error

    // 2. Fetch Admin Notes
    const { data: notes, error: notesError } = await supabase
        .from('admin_notes')
        .select('*')
        .eq('track_id', id)
        .order('created_at', { ascending: false })
        
    if (notesError) throw notesError

    // 3. Fetch Admin Profiles manually (since FK is to auth.users)
    let enrichedNotes = []
    if (notes && notes.length > 0) {
        const adminIds = [...new Set(notes.map(n => n.admin_id))]
        const { data: admins } = await supabase
            .from('profiles')
            .select('id, full_name, email, role')
            .in('id', adminIds)
        
        enrichedNotes = notes.map(note => ({
            ...note,
            admin: admins?.find(a => a.id === note.admin_id) || { full_name: 'Unknown Admin', email: '' }
        }))
    }

    return { track, notes: enrichedNotes }
}

export async function addAdminNote(trackId: string, note: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('Unauthorized')
    
    // Verify admin role (optional, RLS)
    
    const { error } = await supabase
        .from('admin_notes')
        .insert({
            track_id: trackId,
            admin_id: user.id,
            note: note
        })
        
    if (error) throw new Error(error.message)
    
    await logAdminAction('ADDED_NOTE', 'TRACK', trackId, { note_length: note.length })
    revalidatePath(`/dashboard/content/${trackId}`)
}

export async function updateTrackMetadata(trackId: string, data: any) {
    const supabase = await createClient()
     const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('Unauthorized')

    // 1. Get album_id for the track
    const { data: track } = await supabase
        .from('tracks')
        .select('album_id')
        .eq('id', trackId)
        .single()
    
    // 2. Update tracks table
    const { error: trackError } = await supabase
        .from('tracks')
        .update({
            title: data.title,
            genre: data.genre,
            sub_genre: data.sub_genre,
            title_language: data.title_language,
            lyrics_language: data.lyrics_language,
            version_type: data.version_type,
            version_subtitle: data.version_subtitle,
            isrc: data.isrc,
            is_explicit: data.is_explicit,
            status: data.status
        })
        .eq('id', trackId)
        
    if (trackError) throw new Error(trackError.message)

    // 3. Update upc in albums table if provided
    if (track?.album_id && data.upc !== undefined) {
        const { error: albumError } = await supabase
            .from('albums')
            .update({ upc: data.upc })
            .eq('id', track.album_id)
        if (albumError) throw new Error(albumError.message)
    }
    
    // Log this action
    await logAdminAction('EDITED_METADATA', 'TRACK', trackId, { updated_fields: Object.keys(data) })
    
    revalidatePath(`/dashboard/content/${trackId}`)
}
