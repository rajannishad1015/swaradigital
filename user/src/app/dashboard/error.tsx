'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Dashboard Error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center space-y-6">
      <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center border border-rose-500/20 shadow-lg shadow-rose-500/10">
        <AlertCircle className="w-8 h-8 text-rose-500" />
      </div>
      <div className="space-y-2 max-w-md">
        <h2 className="text-2xl font-black text-white tracking-tight">Something went wrong</h2>
        <p className="text-zinc-400 text-sm font-medium">
          We encountered an unexpected error while loading this page. 
          {error.digest && <span className="block mt-1 text-xs text-zinc-600">Error ID: {error.digest}</span>}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <Button 
          onClick={() => window.location.reload()}
          className="bg-indigo-500 hover:bg-indigo-400 text-white font-bold tracking-wide rounded-xl shadow-lg shadow-indigo-500/20"
        >
          <RefreshCw className="w-4 h-4 mr-2" /> Reload Page
        </Button>
      </div>
    </div>
  )
}
