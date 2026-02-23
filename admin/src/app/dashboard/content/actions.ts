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

  // Fetch track details for notifications and logging
  const { data: tracks, error: fetchError } = await supabase
    .from('tracks')
    .select('id, artist_id, title, status, takedown_reason')
    .in('id', ids)

  if (fetchError || !tracks || tracks.length === 0) {
    throw new Error('Tracks not found')
  }

  const { error } = await supabase
    .from('tracks')
    .update({ 
      status, 
      rejection_reason: status === 'rejected' ? reason : null,
      takedown_reason: null, // Clear takedown reason once processed
      updated_at: new Date().toISOString()
    })
    .in('id', ids)

  if (error) {
    throw new Error(error.message)
  }

  // Send Notifications and Log Actions
  for (const track of tracks) {
    let notificationType: string = 'upload_status'
    let notificationTitle = ''
    let notificationMessage = ''

    if (status === 'rejected') {
      const isTakedown = track.status === 'takedown_requested'
      if (isTakedown) {
        notificationType = 'takedown_approved'
        notificationTitle = `Takedown Approved: ${track.title}`
        notificationMessage = `Your takedown request for "${track.title}" has been approved. The release has been removed from stores and is now back in your catalog for editing. ${reason ? `Note: ${reason}` : ''}`
      } else {
        notificationTitle = `Action Required: ${track.title}`
        notificationMessage = `Your release "${track.title}" has been rejected. Reason: ${reason || 'Please check the details and resubmit.'}`
      }
    } else if (status === 'approved') {
      const wasTakedown = track.status === 'takedown_requested'
      if (wasTakedown) {
        notificationType = 'takedown_refused'
        notificationTitle = `Takedown Refused: ${track.title}`
        notificationMessage = `Your takedown request for "${track.title}" was reviewed and refused. Your release will remain live. Reason: ${reason || 'No valid reason found for removal.'}`
      } else {
        notificationTitle = `Release Approved: ${track.title}`
        notificationMessage = `Congratulations! Your release "${track.title}" has been approved and sent to stores.${reason ? ` Note: ${reason}` : ''}`
      }
    }

    if (notificationTitle) {
      await supabase.from('notifications').insert({
        user_id: track.artist_id,
        type: notificationType,
        title: notificationTitle,
        message: notificationMessage,
        link: '/dashboard/catalog',
        is_read: false
      })
    }

    // Log Action
    await logAdminAction(
      status === 'approved' ? 'APPROVED_TRACK' : 'REJECTED_TRACK',
      'TRACK',
      track.id,
      { reason, title: track.title, previous_status: track.status }
    )
  }

  revalidatePath('/dashboard/content')
}
