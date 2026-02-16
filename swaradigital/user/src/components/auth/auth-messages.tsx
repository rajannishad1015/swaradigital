'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'
import { toast } from 'sonner'

function AuthMessagesContent() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message')
  const error = searchParams.get('error')

  useEffect(() => {
    if (message) {
      toast.success(message, {
        duration: 5000,
      })
    }

    if (error) {
      toast.error(error, {
        duration: 5000,
      })
    }
  }, [message, error])

  return null
}

export function AuthMessages() {
  return (
    <Suspense fallback={null}>
      <AuthMessagesContent />
    </Suspense>
  )
}
