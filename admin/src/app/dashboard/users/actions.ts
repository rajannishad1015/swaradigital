'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

// Need a service role client to delete users from Auth and generate links
const getSupabaseAdmin = () => {
  const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!adminKey) {
    console.error("SUPABASE_SERVICE_ROLE_KEY is missing. Admin actions will fail.")
    throw new Error("Server configuration error: SUPABASE_SERVICE_ROLE_KEY is missing")
  }
  
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    adminKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

export async function getUserTracks(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tracks')
    .select('*, albums(title)')
    .eq('artist_id', userId) // linking via artist_id based on schema
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching tracks:', error)
    return []
  }
  return data
}

export async function getTransactionHistory(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching history:', error)
    return []
  }
  return data
}

export async function updateUserStatus(userId: string, status: string) {
  const supabase = await createClient()
  
  // Update public profile status
  const { error } = await supabase
    .from('profiles')
    .update({ status })
    .eq('id', userId)

  if (error) throw new Error(error.message)
  
  // Optionally disable in Auth if banned (requires admin client)
  if (status === 'banned') {
    await getSupabaseAdmin().auth.admin.updateUserById(userId, { ban_duration: '876000h' }) // ~100 years
  } else if (status === 'active') {
    await getSupabaseAdmin().auth.admin.updateUserById(userId, { ban_duration: '0' }) // unban
  }
  
  return { success: true }
}

export async function updateAdminNotes(userId: string, notes: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ admin_notes: notes })
    .eq('id', userId)

  if (error) throw new Error(error.message)
  return { success: true }
}

export async function impersonateUser(userId: string) {
  const adminClient = getSupabaseAdmin()
  const { data: user, error: userError } = await adminClient.auth.admin.getUserById(userId)
  
  if (userError || !user) {
    throw new Error('User not found')
  }

  const { data, error } = await adminClient.auth.admin.generateLink({
    type: 'magiclink',
    email: user.user.email!
  })

  if (error) throw new Error(error.message)
  return data.properties?.action_link
}

export async function deleteUser(userId: string) {
  const supabase = await createClient()

  // 1. Verify Admin Permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (adminProfile?.role !== 'admin') {
    return { error: 'Unauthorized: Admin access required' }
  }

  try {
    const adminClient = getSupabaseAdmin()

    // 2. Cleanup Storage (Query DB for paths)
    // Fetch user's tracks and albums to get file paths
    const { data: userTracks } = await supabase
        .from('tracks')
        .select('file_url')
        .eq('artist_id', userId)

    const { data: userAlbums } = await supabase
        .from('albums')
        .select('cover_art_url')
        .eq('artist_id', userId)
    
    const { data: userProfile } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', userId)
        .single()


    // Helper to extract path from Public URL
    const getPathFromUrl = (url: string | null) => {
        if (!url) return null;
        try {
            const urlObj = new URL(url);
            const parts = urlObj.pathname.split('/public/');
            if (parts.length > 1) {
                // Returns "bucket/path/to/file.ext" -> split again to get just path
                const bucketAndPath = parts[1].split('/');
                const bucket = bucketAndPath[0]; // e.g., 'music-files'
                const path = bucketAndPath.slice(1).join('/'); // e.g., 'tracks/...'
                return { bucket, path };
            }
            return null;
        } catch (e) {
            return null; // Handle relative paths or invalid URLs
        }
    }

    const filesToDelete: { bucket: string, path: string }[] = [];

    // Collect Track Files
    userTracks?.forEach(track => {
        const info = getPathFromUrl(track.file_url)
        if (info) filesToDelete.push(info)
    })

    // Collect Album Covers
    userAlbums?.forEach(album => {
        const info = getPathFromUrl(album.cover_art_url)
        if (info) filesToDelete.push(info)
        // Note: New schema puts covers in 'cover-art' or 'cover-arts' usually.
        // If the URL is just a path (legacy), we might need to handle that, 
        // but the upload form constructs full Public URLs.
    })

    // Collect Avatar
    if (userProfile?.avatar_url) {
        // Avatars might be stored as just filenames or paths sometimes?
        // Let's assume URL for now as standard Supabase pattern.
        // If it's a relative path line 'avatars/userId.png', the helper returns null.
        // Fallback for avatar:
        if (!userProfile.avatar_url.startsWith('http')) {
             filesToDelete.push({ bucket: 'avatars', path: userProfile.avatar_url })
        } else {
             const info = getPathFromUrl(userProfile.avatar_url)
             if (info) filesToDelete.push(info)
        }
    }

    // Execute Deletions Grouped by Bucket
    const deletesByBucket: Record<string, string[]> = {}
    filesToDelete.forEach(f => {
        if (!deletesByBucket[f.bucket]) deletesByBucket[f.bucket] = []
        deletesByBucket[f.bucket].push(f.path)
    })

    for (const bucket of Object.keys(deletesByBucket)) {
         try {
            if (deletesByBucket[bucket].length > 0) {
                 await adminClient.storage.from(bucket).remove(deletesByBucket[bucket])
                 console.log(`Cleaned up ${deletesByBucket[bucket].length} files from ${bucket}`)
            }
         } catch (e) {
             console.error(`Failed to cleanup bucket ${bucket}:`, e)
         }
    }
    
    // Legacy Cleanup (Just in case there ARE userId folders or standard avatar names)
    // This is cheap to keep as a backup
    try {
        const avatarFiles = [`${userId}`, `${userId}.png`, `${userId}.jpg`, `${userId}.jpeg`, `${userId}.webp`]
        await adminClient.storage.from('avatars').remove(avatarFiles)
    } catch (e) { console.error("Legacy avatar cleanup failed", e) }


    // 3. Delete from Auth (Cascades to Profiles -> Tracks/Albums/etc via DB constraints)
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId)
    
    if (deleteError) {
      console.error('Error deleting user from auth:', deleteError)
      throw new Error(`Database error deleting user: ${JSON.stringify(deleteError)}`)
    }

    // 4. Log the action (Audit Log)
    // Note: We use the server client logged in as admin for this insertion so it tracks WHO did it
    await supabase.from('admin_activity_logs').insert({
        admin_id: user.id,
        action: 'DELETED_USER',
        target_type: 'USER',
        target_id: userId,
        details: { reason: 'Permanent deletion via Admin Dashboard', files_removed: filesToDelete.length }
    })

    return { success: true }

  } catch (err: any) {
    console.error('Delete user unexpected error:', err)
    return { error: err.message || 'An unexpected error occurred' }
  }
}

export async function updateUserRole(userId: string, newRole: string) {
  const supabase = await createClient()

  // 1. Verify Admin Permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (adminProfile?.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required')
  }

  // 2. Update role in profiles table
  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId)

  if (error) throw new Error(error.message)

  // 3. Log the action
  await supabase.from('admin_activity_logs').insert({
    admin_id: user.id,
    action: 'UPDATED_USER_ROLE',
    target_type: 'USER',
    target_id: userId,
    details: { new_role: newRole }
  })

  return { success: true }
}

export async function updateUserPlan(userId: string, planType: 'solo' | 'multi' | 'elite') {
  const supabase = await createClient()

  // 1. Verify Admin Permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (adminProfile?.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required')
  }

  // 2. Prepare update data
  const updateData = {
    subscription_plan: planType === 'solo' ? 'Free/Solo' : planType === 'multi' ? 'Multi-Artist' : 'Elite',
    is_multi_artist: planType === 'multi' || planType === 'elite',
    is_elite_user: planType === 'elite',
    max_artist_profiles: planType === 'solo' ? 1 : planType === 'multi' ? 5 : 100,
    updated_at: new Date().toISOString()
  }

  // 3. Update profiles table
  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', userId)

  if (error) throw new Error(error.message)

  // 4. Log the action
  await supabase.from('admin_activity_logs').insert({
    admin_id: user.id,
    action: 'UPDATED_USER_PLAN',
    target_type: 'USER',
    target_id: userId,
    details: { new_plan: planType, ...updateData }
  })

  return { success: true }
}
