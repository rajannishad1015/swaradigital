'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getUgcClaims() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data, error } = await supabase
        .from('ugc_claims')
        .select(`
            *,
            track:tracks(title, isrc)
        `)
        .eq('artist_id', user.id)
        .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data
}

export async function submitUgcClaim(formData: {
    track_id?: string,
    platform: string,
    content_url: string,
    claim_type: 'monetize' | 'track' | 'block'
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { track_id, ...rest } = formData
    const { error } = await supabase
        .from('ugc_claims')
        .insert({
            artist_id: user.id,
            ...rest,
            track_id: track_id || null,
            status: 'pending'
        })

    if (error) throw new Error(error.message)

    revalidatePath('/dashboard/rights/ugc-claims')
    return { success: true }
}

export async function getWhitelistedChannels() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data, error } = await supabase
        .from('whitelisted_channels')
        .select('*')
        .eq('artist_id', user.id)
        .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data
}

export async function whitelistChannel(formData: {
    platform: string,
    channel_id: string,
    channel_name: string,
    channel_url?: string,
    channel_type: string
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase
        .from('whitelisted_channels')
        .insert({
            artist_id: user.id,
            status: 'pending',
            ...formData
        })

    if (error) throw new Error(error.message)

    revalidatePath('/dashboard/rights/whitelist')
    return { success: true }
}

export async function removeWhitelistedChannel(channelId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase
        .from('whitelisted_channels')
        .delete()
        .eq('id', channelId)
        .eq('artist_id', user.id)

    if (error) throw new Error(error.message)

    revalidatePath('/dashboard/rights/whitelist')
    return { success: true }
}
