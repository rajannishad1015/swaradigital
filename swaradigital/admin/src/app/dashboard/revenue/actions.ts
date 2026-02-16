'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

interface ProcessResult {
    success: boolean
    count?: number
    error?: string
}

export async function processRevenueData(rows: any[]): Promise<ProcessResult> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    // 1. Fetch all tracks (ISRC -> Artist ID map) to minimize DB calls
    // Note: optimization for large datasets would be batching key lookups. 
    // For now, let's just fetch all valid tracks with ISRC.
    const { data: tracks, error: trackError } = await supabase
        .from('tracks')
        .select('id, isrc, artist_id')
        .not('isrc', 'is', null)
    
    if (trackError) {
        return { success: false, error: 'Failed to fetch track map' }
    }

    const isrcMap = new Map<string, { id: string, artistId: string }>()
    tracks?.forEach(t => {
        if (t.isrc) isrcMap.set(t.isrc.trim(), { id: t.id, artistId: t.artist_id })
    })

    let processedCount = 0
    const recordsToInsert = []

    // 2. Process Rows
    for (const row of rows) {
        // Normalize keys (handle case sensitivity if needed) or just assume standard
        const isrc = row['ISRC'] || row['isrc']
        if (!isrc) continue // Skip invalid rows

        const match = isrcMap.get(isrc.trim())
        if (match) {
            // Found a match!
            recordsToInsert.push({
                user_id: match.artistId,
                track_id: match.id,
                platform: row['Platform'] || row['platform'] || 'Unknown',
                country_code: row['Country'] || row['country'] || 'US',
                amount: parseFloat(row['Revenue'] || row['revenue'] || row['Payable'] || '0'),
                period: (row['Period'] || row['period'] || new Date().toISOString().slice(0, 7)) + '-01', // YYYY-MM-DD
                quantity: parseInt(row['Quantity'] || row['quantity'] || '1'),
                currency: row['Currency'] || row['currency'] || 'USD'
            })
            processedCount++
        }
    }

    if (recordsToInsert.length === 0) {
        return { success: false, error: 'No matching ISRCs found in the uploaded data.' }
    }

    // 3. Batch Insert
    const { error: insertError } = await supabase
        .from('revenue_logs')
        .insert(recordsToInsert)

    if (insertError) {
        console.error('Insert Error:', insertError)
        return { success: false, error: `Database Error: ${insertError.message}` }
    }
    
    // 4. Update Balances (Optional: Trigger or Manual?)
    // Usually triggers handle this, but if not, we might need to increment artist balances.
    // Let's assume a trigger exists OR we do it here. 
    // Safest is to rely on RPC or Trigger. Let's assume Trigger for now.

    revalidatePath('/dashboard/revenue')
    return { success: true, count: processedCount }
}
