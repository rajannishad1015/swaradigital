'use server'

import { createClient } from '@/utils/supabase/server'

export async function getAuditLogs() {
  const supabase = await createClient()

  // Calculate the date 7 days ago
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: logs, error } = await supabase
    .from('admin_activity_logs')
    .select(`
      *,
      admin:profiles!admin_id (
        full_name,
        email,
        avatar_url
      )
    `)
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(100) // Keep a max limit just in case of heavy activity, but restrict to 7 days

  if (error) {
    console.error('Error fetching logs:', error)
    return []
  }

  return logs
}
