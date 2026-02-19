'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()

  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (password !== confirmPassword) {
    return redirect('/reset-password?error=Passwords do not match')
  }

  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    return redirect('/reset-password?error=Could not update password')
  }

  return redirect('/login?message=Password updated successfully')
}
