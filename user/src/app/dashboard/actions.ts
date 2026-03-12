'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'
import { getRazorpayInstance } from '@/lib/razorpay'
import crypto from 'crypto'

export async function createRazorpayOrder(amount: number, albumIdInput: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  if (!amount || isNaN(amount)) {
    console.error('Invalid amount provided to createRazorpayOrder:', amount)
    throw new Error('Invalid amount')
  }

  const isPlanSwitch = albumIdInput.includes('PLAN_SWITCH')
  let actualAlbumId: string | null = isPlanSwitch && albumIdInput.includes('CREDIT_') 
    ? albumIdInput.split('CREDIT_')[1] 
    : (isPlanSwitch ? null : albumIdInput)

  // Resolve track_id to album_id since frontend sometimes passes track_id instead of album_id
  if (actualAlbumId && actualAlbumId !== '00000000-0000-0000-0000-000000000000') {
      const { data: track } = await supabase.from('tracks').select('album_id').eq('id', actualAlbumId).maybeSingle();
      if (track) actualAlbumId = track.album_id;
  }

  const razorpay = getRazorpayInstance()
  const options = {
    amount: Math.round(amount * 100), // amount in smallest currency unit (paise)
    currency: "INR",
    receipt: `rcpt_${actualAlbumId || 'switch'}`.slice(0, 40),
    notes: {
      userId: user.id,
      albumId: actualAlbumId,
      type: isPlanSwitch ? 'plan_switch' : 'release_payment'
    }
  }

  try {
    const order = await razorpay.orders.create(options)
    return { orderId: order.id, amount: order.amount, currency: order.currency }
  } catch (error: any) {
    // Log full error to see root cause in terminal
    console.error('Razorpay Order Error (full):', JSON.stringify(error, null, 2))
    const message = error?.error?.description || error?.description || error?.message || 'Failed to create payment order'
    throw new Error(message)
  }
}

export async function createRazorpaySubscription(planName: 'multi_monthly' | 'multi_yearly' | 'elite_label') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const planId = planName === 'multi_monthly'
        ? process.env.RAZORPAY_PLAN_MULTI_MONTHLY
        : planName === 'multi_yearly'
        ? process.env.RAZORPAY_PLAN_MULTI_YEARLY
        : process.env.RAZORPAY_PLAN_ELITE_LABEL

    if (!planId) {
        throw new Error(`Razorpay Plan ID not configured for ${planName}. Please check your .env.local file.`)
    }

    const razorpay = getRazorpayInstance()
    try {
        const subscription = await razorpay.subscriptions.create({
            plan_id: planId,
            customer_notify: 1,
            total_count: planName === 'multi_monthly' ? 12 : 5,
            notes: {
                userId: user.id,
                planName: planName
            }
        })
        return { subscriptionId: subscription.id }
    } catch (error: any) {
        console.error('Razorpay Subscription Error:', error)
        const message = error?.description || error?.message || 'Failed to create subscription'
        throw new Error(message)
    }
}

export async function verifyRazorpayPayment(orderId: string, paymentId: string, signature: string, albumIdInput?: string) {
    const keySecret = process.env.RAZORPAY_KEY_SECRET!

    const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex')

    if (generatedSignature !== signature) {
        throw new Error('Payment verification failed. Signature mismatch.')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let albumId = albumIdInput;
    if (albumId && albumId !== '00000000-0000-0000-0000-000000000000') {
        const { data: track } = await supabase.from('tracks').select('album_id').eq('id', albumId).maybeSingle();
        if (track) albumId = track.album_id;
    }

    // Use admin client for database operations to bypass RLS
    const adminClient = createAdminClient()

    // Webhook should ideally handle the status update, but we do it here for immediate UI feedback consistency
    if (user && albumId) {
        // Fetch amount from Razorpay — if this fails, fall back to 0 (webhook will correct later)
        let amount = 0
        try {
            const razorpay = getRazorpayInstance()
            const payment = await razorpay.payments.fetch(paymentId)
            amount = Number(payment.amount) / 100
        } catch (fetchError) {
            console.error('Could not fetch payment amount from Razorpay, will use 0:', fetchError)
        }

        // Try to record the payment using admin client to bypass RLS - if it fails, check if webhook already handled it
        const finalAlbumId = albumId === '00000000-0000-0000-0000-000000000000' ? null : albumId;
        const { error: upsertError } = await adminClient
            .from('release_payments')
            .upsert({
                user_id: user.id,
                album_id: finalAlbumId,
                amount,
                razorpay_payment_id: paymentId,
                razorpay_order_id: orderId,
                status: 'captured'
            }, { onConflict: 'razorpay_payment_id' })

        if (upsertError) {
            console.error('Failed to upsert payment, checking if webhook already handled it:', upsertError)

            // Check if the payment record exists (webhook might have created it)
            const { data: existingPayment, error: checkError } = await adminClient
                .from('release_payments')
                .select('id, status')
                .eq('razorpay_payment_id', paymentId)
                .maybeSingle()

            if (checkError) {
                console.error('Error checking for existing payment:', checkError)
                throw new Error('Payment was successful but could not be recorded. Please contact support with your payment ID: ' + paymentId)
            }

            // If the payment record exists, the webhook handled it - all good
            if (existingPayment) {
                console.log('Payment already recorded by webhook:', paymentId)
                return { success: true }
            }

            // Payment doesn't exist and we couldn't create it - this is a real error
            console.error('Payment verification succeeded but database record failed:', {
                paymentId,
                orderId,
                albumId,
                userId: user.id,
                upsertError
            })
            throw new Error('Payment was successful but could not be recorded. Please contact support with your payment ID: ' + paymentId)
        }
        
        // Ensure profile is updated to 'solo' securely immediately after payment capture verification
        await adminClient.from('profiles').update({ plan_type: 'solo' }).eq('id', user.id)

        console.log('Payment recorded successfully via frontend:', paymentId)
    }

    return { success: true }
}

export async function verifyRazorpaySubscription(subscriptionId: string, paymentId: string, signature: string, planName: 'multi_monthly' | 'multi_yearly' | 'elite_label' = 'multi_yearly') {
    const keySecret = process.env.RAZORPAY_KEY_SECRET!

    const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${paymentId}|${subscriptionId}`)
        .digest('hex')

    if (generatedSignature !== signature) {
        throw new Error('Subscription verification failed. Signature mismatch.')
    }

    // Since webhook handles the DB updates for subscriptions in production, we do an explicit sync here
    // for local test environments to immediately unlock the dashboard.
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        const periodEnd = new Date()
        if (planName === 'multi_monthly') {
            periodEnd.setMonth(periodEnd.getMonth() + 1)
        } else {
            periodEnd.setFullYear(periodEnd.getFullYear() + 1)
        }

        const planType = (planName === 'multi_monthly' || planName === 'multi_yearly') ? 'multi' : 'elite'
        const maxProfiles = planType === 'multi' ? 1 : 100

        await supabase.from('profiles').update({ plan_type: planType, max_artist_profiles: maxProfiles }).eq('id', user.id)

        // We use UPSERT since the webhook might have beaten us to it, or it might not have arrived yet.
        await supabase.from('subscriptions').upsert({
             user_id: user.id,
             razorpay_subscription_id: subscriptionId,
             plan_name: planName,
             status: 'active',
             current_period_end: periodEnd.toISOString(),
             updated_at: new Date().toISOString()
        }, { onConflict: 'razorpay_subscription_id' })
    }

    return { success: true }
}




export async function checkSubmissionEligibility(albumIdInput?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  let albumId = albumIdInput;
  if (albumId && albumId !== '00000000-0000-0000-0000-000000000000') {
      const { data: track } = await supabase.from('tracks').select('album_id').eq('id', albumId).maybeSingle();
      if (track) albumId = track.album_id;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan_type, status')
    .eq('id', user.id)
    .single()

  if (!profile) throw new Error('Profile not found')
  if (profile.status !== 'active') throw new Error('Account is not active')

  // Check for active subscription for Multi/Elite plans
  if (profile.plan_type === 'multi' || profile.plan_type === 'elite') {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle()

    // Multi/Elite plans allow UNLIMITED concurrent releases as long as sub is active
    if (subscription) {
      return { eligible: true, mustPay: false, plan: profile.plan_type }
    }
    return { eligible: false, mustPay: false, plan: profile.plan_type, message: "Your subscription is inactive or expired." }
  }

  // For users with no active subscription (none or deprecated solo plan), they operate on a pay-per-release model
  if (profile.plan_type === 'none' || profile.plan_type === 'solo' || !profile.plan_type) {
    if (albumId) {
      const { data: payment } = await supabase
        .from('release_payments')
        .select('status')
        .eq('user_id', user.id)
        .eq('album_id', albumId)
        .eq('status', 'captured')
        .limit(1)
        .maybeSingle()

      if (payment) {
        return { eligible: true, mustPay: false, plan: 'none' }
      }
    }

    return { eligible: true, mustPay: true, amount: 99, plan: 'none' }
  }

  return { eligible: false, mustPay: false, plan: profile.plan_type || 'none', message: "Please select a plan to start releasing music." }
}

export async function createWithdrawalRequest(amount: number, paymentMode: string, paymentDetails: Record<string, string>) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  if (!Number.isFinite(amount) || amount < 10) {
      throw new Error("Minimum withdrawal amount is ₹10")
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
