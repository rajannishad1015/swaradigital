'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAdminAction } from '@/utils/logger'

export async function updateTrackStatus(trackIds: string | string[], status: 'approved' | 'rejected', reason?: string) {
  const ids = Array.isArray(trackIds) ? trackIds : [trackIds]
  const supabase = await createClient()

  // Verify Admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  // Check role (optional, RLS handles it but good for early exit)
  // ...

  // Fetch track details for notifications and logging
  const { data: tracks, error: fetchError } = await supabase
    .from('tracks')
    .select('id, artist_id, title')
    .in('id', ids)

  if (fetchError || !tracks || tracks.length === 0) {
    throw new Error('Tracks not found')
  }

  const { error } = await supabase
    .from('tracks')
    .update({ 
      status, 
      rejection_reason: status === 'rejected' ? reason : null,
      updated_at: new Date().toISOString()
    })
    .in('id', ids)

  if (error) {
    throw new Error(error.message)
  }

  // Send Notifications and Log Actions
  for (const track of tracks) {
    if (status === 'rejected') {
      await supabase.from('notifications').insert({
        user_id: track.artist_id,
        type: 'upload_status',
        title: `Action Required: ${track.title}`,
        message: reason || 'Your release has been rejected. Please check the details and resubmit.',
        link: '/dashboard/catalog',
        is_read: false
      })
    } else if (status === 'approved') {
      await supabase.from('notifications').insert({
        user_id: track.artist_id,
        type: 'upload_status',
        title: `Release Approved: ${track.title}`,
        message: 'Congratulations! Your release has been approved and sent to stores.',
        link: '/dashboard/catalog',
        is_read: false
      })
    }

    // Log Action
    await logAdminAction(
      status === 'approved' ? 'APPROVED_TRACK' : 'REJECTED_TRACK',
      'TRACK',
      track.id,
      { reason, title: track.title }
    )
  }

  revalidatePath('/dashboard/content')
}
