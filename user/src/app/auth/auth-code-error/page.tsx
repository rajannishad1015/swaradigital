import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

export default function AuthCodeError({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const error = searchParams.error ?? 'The link may have expired or is invalid.'

  return (
    <div className="h-screen relative overflow-hidden bg-black flex items-center justify-center p-4">
      {/* ... keeping existing background/layout ... */}
      <div 
        className="absolute inset-0 bg-[url('/auth-bg.png')] bg-cover bg-center bg-no-repeat"
        style={{ filter: 'brightness(0.4) contrast(1.1) saturate(0.9)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/20 to-black/70" />
      
      <div className="relative z-10 w-full max-w-md bg-white shadow-2xl p-8 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">
          Authentication Error
        </h1>
        
        <p className="text-gray-600 mb-8 font-medium">
          {error}
        </p>

        <Link 
          href="/login" 
          className="w-full bg-black hover:bg-gray-800 text-white font-bold h-12 flex items-center justify-center uppercase tracking-widest transition-colors"
        >
          Return to Login
        </Link>
        
        <div className="mt-4">
            <Link href="/forgot-password" className="text-sm text-gray-500 hover:text-black font-medium border-b border-gray-300 hover:border-black transition-all">
                Try sending the link again
            </Link>
        </div>
      </div>
    </div>
  )
}
