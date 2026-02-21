'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type RequestType = 'profiling' | 'ugc' | 'whitelist'

/**
 * Fetch all requests for a specific type
 */
export async function getRequests(type: RequestType) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Verify Admin
    const { data: admin } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (admin?.role !== 'admin') throw new Error('Unauthorized')

    let query: any
    
    if (type === 'profiling') {
        query = supabase
            .from('profile_link_requests')
            .select('*, profiles!profile_link_requests_artist_id_fkey(full_name, artist_name, email), albums(title), tracks(title)')
    } else if (type === 'ugc') {
        query = supabase
            .from('ugc_claims')
            .select('*, profiles!ugc_claims_artist_id_fkey(full_name, artist_name, email), tracks!ugc_claims_track_id_fkey(title)')
    } else {
        query = supabase
            .from('whitelisted_channels')
            .select('*, profiles!whitelisted_channels_artist_id_fkey(full_name, artist_name, email)')
    }

    const { data, error } = await query
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Fetch error:', error)
        throw new Error(error.message)
    }
    return data
}

/**
 * Update request status (Approve/Reject)
 */
export async function updateRequestStatus(
    id: string, 
    type: RequestType, 
    status: 'approved' | 'rejected' | 'processing' | 'pending',
    reason?: string
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const table = type === 'profiling' ? 'profile_link_requests' : 
                  type === 'ugc' ? 'ugc_claims' : 
                  'whitelisted_channels'

    const { error } = await supabase
        .from(table)
        .update({ 
            status, 
            rejection_reason: reason || null, 
            updated_at: new Date().toISOString() 
        })
        .eq('id', id)

    if (error) {
        console.error('Update error:', error)
        throw new Error(error.message)
    }

    revalidatePath('/dashboard/requests')
    return { success: true }
}
