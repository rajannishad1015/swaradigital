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
    // 2. Cleanup Storage (List and Delete)
    const buckets = [
        'avatars', 
        'cover-art', 
        'cover-arts',
        'cover-art-new', 
        'music-files', 
        'music-files-new', 
        'agreements',
        'support-attachments'
    ]

    for (const bucket of buckets) {
        try {
            // List files in the user's folder (userId/*)
            const { data: files } = await getSupabaseAdmin()
                .storage
                .from(bucket)
                .list(userId)
            
            if (files && files.length > 0) {
                const filesToDelete = files.map(f => `${userId}/${f.name}`)
                await getSupabaseAdmin().storage.from(bucket).remove(filesToDelete)
            }

            // Also check for root files named {userId}.*
            if (bucket === 'avatars') {
                 await getSupabaseAdmin().storage.from(bucket).remove([
                    `${userId}`, 
                    `${userId}.png`, 
                    `${userId}.jpg`, 
                    `${userId}.jpeg`, 
                    `${userId}.webp`
                ])
            }
        } catch (bucketError) {
            console.error(`Failed to clean bucket ${bucket}:`, bucketError)
        }
    }


    // 3. Delete from Auth (Cascades to Profiles -> Tracks/Albums/etc via DB constraints)
    const { error: deleteError } = await getSupabaseAdmin().auth.admin.deleteUser(userId)
    
    if (deleteError) {
      console.error('Error deleting user from auth:', deleteError)
      throw new Error(`Database error deleting user: ${JSON.stringify(deleteError)}`)
    }

    // 4. Log the action (Audit Log)
    await supabase.from('admin_activity_logs').insert({
        admin_id: user.id,
        action: 'DELETED_USER',
        target_type: 'USER',
        target_id: userId,
        details: { reason: 'Permanent deletion via Admin Dashboard' }
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
