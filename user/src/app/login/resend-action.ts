'use server'

import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'

export async function resendVerification(email: string) {
    if (!email) {
        return { success: false, message: 'Email is required' }
    }

    const supabase = await createClient()
    const origin = (await headers()).get('origin')

    console.log('--- Resend Verification Triggered ---');
    console.log('Email:', email);
    console.log('Origin:', origin);

    const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
            emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
        },
    })

    if (error) {
        return { success: false, message: error.message }
    }

    return { success: true, message: 'Verification link resent! Please check your email.' }
}
