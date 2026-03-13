'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global App Error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A10] p-6 text-center space-y-8">
      <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center border border-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.15)]">
        <AlertCircle className="w-8 h-8 text-rose-500" />
      </div>
      <div className="space-y-3 max-w-md">
        <h1 className="text-3xl font-black text-white tracking-tight">Something went wrong</h1>
        <p className="text-[#A0A0B0] text-sm font-medium leading-relaxed">
          The application encountered an unexpected core rendering error. 
          {error.digest && <span className="block mt-2 text-xs text-zinc-600 font-mono bg-white/5 p-2 rounded-lg border border-white/5">Error ID: {error.digest}</span>}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <Button 
          onClick={() => window.location.reload()}
          className="bg-indigo-500 hover:bg-indigo-400 text-white font-bold tracking-wide rounded-xl shadow-lg shadow-indigo-500/20 h-10 px-6"
        >
          <RefreshCw className="w-4 h-4 mr-2" /> Reload Page
        </Button>
        <Link href="/dashboard">
          <Button 
            variant="outline"
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white font-bold h-10 px-6 rounded-xl"
          >
            <Home className="w-4 h-4 mr-2" /> Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}
