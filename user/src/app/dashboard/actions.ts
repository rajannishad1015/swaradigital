'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createWithdrawalRequest(amount: number, paymentMode: string, paymentDetails: Record<string, string>) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  if (!Number.isFinite(amount) || amount < 10) {
      throw new Error("Minimum withdrawal amount is $10.00")
  }

  // Server-side validation for payment details
  if (!paymentMode || !['bank_transfer', 'paypal', 'upi'].includes(paymentMode)) {
    throw new Error("Invalid payment mode selected")
  }

  if (!paymentDetails || Object.keys(paymentDetails).length === 0) {
    throw new Error("Payment details are required")
  }

  // Specific field validation based on mode
  if (paymentMode === 'bank_transfer') {
    if (!paymentDetails.bank_name || !paymentDetails.account_number || !paymentDetails.ifsc_code) {
      throw new Error("Incomplete bank details provided")
    }
  } else if (paymentMode === 'paypal') {
    if (!paymentDetails.email || !paymentDetails.email.includes('@')) {
      throw new Error("Valid PayPal email is required")
    }
  } else if (paymentMode === 'upi') {
    if (!paymentDetails.upi_id || !paymentDetails.upi_id.includes('@')) {
      throw new Error("Valid UPI ID is required")
    }
  }

  // 1. Check current balance
  const { data: profile } = await supabase.from('profiles').select('balance').eq('id', user.id).single()
  
  if (!profile || (Number(profile.balance) || 0) < amount) {
      throw new Error("Insufficient balance")
  }

  const newBalance = (Number(profile.balance) || 0) - amount

  // Atomic update with balance check guard to prevent race conditions
  const { data: deductResult, error: deductError } = await supabase
    .from('profiles')
    .update({ balance: newBalance })
    .eq('id', user.id)
    .gte('balance', amount) // Guard: only update if balance >= amount (prevents double-spend)
    .select('balance')
    .single()

  if (deductError || !deductResult) {
    throw new Error("Insufficient balance or concurrent request in progress. Please try again.")
  }

  // 2. Create Transaction Record — with rollback on failure
  const { data: tx, error: txError } = await supabase
    .from('transactions')
    .insert({
        user_id: user.id,
        amount: -amount,
        type: 'withdrawal',
        description: `Withdrawal Request via ${paymentMode} (Pending)`,
        status: 'pending'
    })
    .select('id')
    .single()

  if (txError) {
      // ROLLBACK: Restore balance since transaction log failed
      await supabase
        .from('profiles')
        .update({ balance: (Number(deductResult.balance) || 0) + amount })
        .eq('id', user.id)
      throw new Error("Failed to initialize transaction. Balance has been restored.")
  }

  // 3. Create Payout Request — with rollback on failure
  const { error: insertError } = await supabase
    .from('payout_requests')
    .insert({
        user_id: user.id,
        amount: amount,
        status: 'pending',
        transaction_id: tx.id,
        payment_mode: paymentMode,
        payment_details: paymentDetails
    })

  if (insertError) {
      // ROLLBACK: Restore balance and remove the orphaned transaction
      await supabase
        .from('profiles')
        .update({ balance: (Number(deductResult.balance) || 0) + amount })
        .eq('id', user.id)
      await supabase.from('transactions').delete().eq('id', tx.id)
      throw new Error("Failed to create payout request. Balance has been restored.")
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function requestTakedown(trackIds: string | string[], reason: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('Unauthorized')

    if (!reason || reason.trim().length < 5) {
        throw new Error("Please provide a valid reason for the takedown request.")
    }

    const ids = Array.isArray(trackIds) ? trackIds : [trackIds]

    // Verify ownership and status for all tracks
    const { data: tracks, error: fetchError } = await supabase
        .from('tracks')
        .select('id, status, artist_id')
        .in('id', ids)

    if (fetchError || !tracks || tracks.length === 0) {
        throw new Error('Some tracks were not found')
    }

    const invalidTracks = tracks.filter(t => t.artist_id !== user.id || t.status !== 'approved')
    if (invalidTracks.length > 0) {
        throw new Error(`Cannot request takedown for ${invalidTracks.length} tracks. Ensure you own them and they are approved.`)
    }

    const { error } = await supabase
        .from('tracks')
        .update({ 
            status: 'takedown_requested',
            takedown_reason: reason 
        })
        .in('id', ids)

    if (error) throw new Error(error.message)

    revalidatePath('/dashboard')
    return { success: true }
}

export async function deleteTrack(trackId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('Unauthorized')

    // Verify ownership and status
    const { data: track } = await supabase
        .from('tracks')
        .select('id, status, artist_id')
        .eq('id', trackId)
        .single()

    if (!track) throw new Error('Track not found')
    if (track.artist_id !== user.id) throw new Error('Unauthorized')
    
    if (track.status !== 'draft' && track.status !== 'rejected' && track.status !== 'archived') {
        throw new Error('Only draft, rejected, or archived tracks can be deleted')
    }

    const { error } = await supabase
        .from('tracks')
        .delete()
        .eq('id', trackId)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/dashboard')
    return { success: true }
}

export async function bulkDeleteTracks(trackIds: string[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('Unauthorized')
    
    if (!trackIds || trackIds.length === 0) return { success: true }

    // 1. Fetch all tracks to verify ownership and status
    const { data: tracks, error: fetchError } = await supabase
        .from('tracks')
        .select('id, status, artist_id')
        .in('id', trackIds)

    if (fetchError || !tracks) {
        throw new Error('Failed to fetch tracks')
    }

    // 2. Security Check: Ownership & Status
    const invalidTracks = tracks.filter(t => 
        t.artist_id !== user.id || 
        (t.status !== 'draft' && t.status !== 'rejected' && t.status !== 'archived')
    )

    if (invalidTracks.length > 0) {
        throw new Error(`Cannot delete ${invalidTracks.length} tracks. Ensure you own them and they are Drafts, Rejected, or Archived.`)
    }

    // 3. Delete
    const { error: deleteError } = await supabase
        .from('tracks')
        .delete()
        .in('id', trackIds)

    if (deleteError) {
        throw new Error(deleteError.message)
    }

    revalidatePath('/dashboard')
    return { success: true }
}

export async function requestCorrection(trackId: string, field: string, newValue: string, reason: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('Unauthorized')

    // Verify ownership
    const { data: track } = await supabase
        .from('tracks')
        .select('id, artist_id')
        .eq('id', trackId)
        .single()

    if (!track) throw new Error('Track not found')
    if (track.artist_id !== user.id) throw new Error('Unauthorized')

    const { error } = await supabase
        .from('correction_requests')
        .insert({
            track_id: trackId,
            artist_id: user.id,
            field_name: field,
            new_value: newValue,
            reason: reason,
            status: 'pending'
        })

    if (error) throw new Error(error.message)

    revalidatePath('/dashboard')
    return { success: true }
}
