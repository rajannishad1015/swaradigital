'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, message: 'Unauthorized' }

    const fullName = formData.get('fullName') as string
    const artistName = formData.get('artistName') as string
    const bio = formData.get('bio') as string
    const phone = formData.get('phone') as string
    const address = formData.get('address') as string
    const legalName = formData.get('legalName') as string
    const dateOfBirth = formData.get('dateOfBirth') as string
    const gender = formData.get('gender') as string
    const country = formData.get('country') as string
    const city = formData.get('city') as string
    const postalCode = formData.get('postalCode') as string
    const bankName = formData.get('bankName') as string
    const accountNumber = formData.get('accountNumber') as string
    const ifscCode = formData.get('ifscCode') as string
    const panNumber = formData.get('panNumber') as string
    const spotifyArtistId = formData.get('spotifyArtistId') as string
    const appleArtistId = formData.get('appleArtistId') as string
    const instagramUrl = formData.get('instagramUrl') as string
    const twitterUrl = formData.get('twitterUrl') as string
    const facebookUrl = formData.get('facebookUrl') as string
    const youtubeUrl = formData.get('youtubeUrl') as string
    const soundcloudUrl = formData.get('soundcloudUrl') as string
    const tiktokUrl = formData.get('tiktokUrl') as string
    const websiteUrl = formData.get('websiteUrl') as string

    // Input validation
    if (fullName && fullName.length > 128) return { success: false, message: 'Full name is too long (max 128 characters)' }
    if (artistName && artistName.length > 128) return { success: false, message: 'Artist name is too long (max 128 characters)' }
    if (bio && bio.length > 500) return { success: false, message: 'Bio is too long (max 500 characters)' }

    // Validate URL fields
    const urlFields = { instagramUrl, twitterUrl, facebookUrl, youtubeUrl, soundcloudUrl, tiktokUrl, websiteUrl }
    for (const [name, value] of Object.entries(urlFields)) {
      if (value && value.trim() !== '') {
        try {
          new URL(value)
        } catch {
          return { success: false, message: `Invalid URL format for ${name.replace('Url', '')}` }
        }
      }
    }

    // Validate phone format (if provided)
    if (phone && phone.trim() !== '' && !/^\+?[\d\s\-()]{7,15}$/.test(phone)) {
      return { success: false, message: 'Invalid phone number format' }
    }

    // Validate financial fields format (if provided)
    if (ifscCode && ifscCode.trim() !== '' && !/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(ifscCode)) {
      return { success: false, message: 'Invalid IFSC code format (e.g. ABCD0123456)' }
    }
    if (panNumber && panNumber.trim() !== '' && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(panNumber)) {
      return { success: false, message: 'Invalid PAN number format (e.g. ABCDE1234F)' }
    }

    const { error } = await supabase
      .from('profiles')
      .update({
          full_name: fullName,
          artist_name: artistName,
          bio: bio,
          phone,
          address,
          legal_name: legalName,
          date_of_birth: dateOfBirth || null,
          gender,
          country,
          city,
          postal_code: postalCode,
          bank_name: bankName,
          account_number: accountNumber,
          ifsc_code: ifscCode,
          pan_number: panNumber,
          paypal_email: formData.get('paypalEmail') as string,
          upi_id: formData.get('upiId') as string,
          spotify_artist_id: spotifyArtistId,
          apple_artist_id: appleArtistId,
          instagram_url: instagramUrl,
          twitter_url: twitterUrl,
          facebook_url: facebookUrl,
          youtube_url: youtubeUrl,
          soundcloud_url: soundcloudUrl,
          tiktok_url: tiktokUrl,
          website_url: websiteUrl,
          updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (error) {
      return { success: false, message: error.message }
    }

    revalidatePath('/dashboard/settings')
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/activity')

    return { success: true, message: 'Profile updated successfully' }
  } catch (error: any) {
    console.error('Update Profile Error:', error)
    return { success: false, message: error.message || 'An unexpected error occurred' }
  }
}

export async function changePassword(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, message: 'Unauthorized' }

    const currentPassword = formData.get('currentPassword') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (!currentPassword || !password || !confirmPassword) {
      return { success: false, message: 'All fields are required' }
    }

    // Verify current password before allowing change
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword
    })

    if (signInError) {
      return { success: false, message: 'Current password is incorrect' }
    }

    if (password !== confirmPassword) {
      return { success: false, message: 'Passwords do not match' }
    }

    if (password.length < 8) {
      return { success: false, message: 'Password must be at least 8 characters' }
    }

    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return { success: false, message: 'Password must contain at least one uppercase letter and one number' }
    }

    const { error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) {
      return { success: false, message: error.message }
    }

    return { success: true, message: 'Password changed successfully' }
  } catch (error: any) {
    console.error('Change Password Error:', error)
    return { success: false, message: error.message || 'An unexpected error occurred' }
  }
}

