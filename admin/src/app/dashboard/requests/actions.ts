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
        .limit(100)

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

    // Notify Artist
    const { data: request } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single()

    if (request) {
        const typeLabel = type === 'profiling' ? 'Profile Link' : 
                         type === 'ugc' ? 'UGC Claim' : 
                         'Channel Whitelist'
        
        let message = ''
        if (status === 'approved') {
            message = `Your ${typeLabel.toLowerCase()} request has been approved.`
        } else if (status === 'rejected') {
            message = `Your ${typeLabel.toLowerCase()} request was rejected. Reason: ${reason || 'Criteria not met.'}`
        } else if (status === 'processing') {
            message = `Your ${typeLabel.toLowerCase()} request is now being processed by our team.`
        } else {
            message = `Your ${typeLabel.toLowerCase()} request is now ${status}.`
        }

        await supabase.from('notifications').insert({
            user_id: request.artist_id,
            type: 'upload_status',
            title: `${typeLabel} ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            message: message,
            link: '/dashboard/requests',
            is_read: false
        })
    }

    revalidatePath('/dashboard/requests')
    return { success: true }
}
