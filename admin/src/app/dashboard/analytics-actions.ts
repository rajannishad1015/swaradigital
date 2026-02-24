'use server'

import { createClient } from '@/utils/supabase/server'
import { subDays, format } from 'date-fns'

export async function getAnalyticsData() {
  const supabase = await createClient()
  
  const { data: result, error } = await supabase.rpc('get_admin_analytics_v2', {
    p_days: 30
  })

  if (error) {
    console.error('Error fetching admin analytics:', error)
    throw new Error(error.message)
  }

  return {
    uploadTrends: result.uploadTrends || [],
    userGrowth: result.userGrowth || [],
    genreDistribution: result.genreDistribution || []
  }
}
