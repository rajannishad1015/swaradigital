import type { Metadata } from 'next'
import { resetPassword } from './actions'
import { Input } from '@/components/ui/input'
import { SubmitButton } from '@/components/ui/submit-button'
import Link from 'next/link'
import { Disc } from 'lucide-react'
import { AuthMessages } from '@/components/auth/auth-messages'

export const metadata: Metadata = {
  title: 'Forgot Password | SwaraDigital',
  robots: { index: false, follow: false },
}

export default function ForgotPasswordPage() {
  return (
    <div className="h-screen relative overflow-hidden bg-black">
      {/* Background Image with Professional Grading */}
      <div 
        className="absolute inset-0 bg-[url('/auth-bg.png')] bg-cover bg-center bg-no-repeat"
        style={{ filter: 'brightness(0.4) contrast(1.1) saturate(0.9)' }}
      />
      
      {/* Sophisticated Overlay Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/20 to-black/70" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.03),transparent_50%)]" />

      {/* Content Container */}
      <div className="relative z-10 h-screen flex items-center justify-center p-4 sm:p-8">
        {/* Centered Card */}
        <div className="w-full max-w-md">
            <div className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-6 sm:p-10 flex flex-col justify-center">
              
              {/* Logo */}
              <div className="flex items-center gap-2 mb-8">
                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                  <Disc className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">MusicFlow</h1>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Account Recovery</p>
                </div>
              </div>

              {/* Form Header */}
              <div className="mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2 uppercase tracking-tight">
                  Reset Password
                </h2>
                <p className="text-sm sm:text-base text-gray-600 font-medium">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
                <AuthMessages />
              </div>

              {/* Reset Form */}
              <form className="space-y-4 sm:space-y-6">
                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-gray-900 uppercase tracking-widest mb-2">
                    Email Address
                  </label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    placeholder="artist@example.com" 
                    required 
                    className="h-12 sm:h-14 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-black focus:ring-0 rounded-none transition-all"
                    autoComplete="email"
                  />
                </div>

                <SubmitButton 
                  formAction={resetPassword}
                  className="w-full h-12 sm:h-14 bg-black hover:bg-gray-800 text-white text-sm sm:text-base font-bold uppercase tracking-widest rounded-none shadow-xl transition-all"
                  loadingText="Sending Link..."
                >
                  Send Reset Link
                </SubmitButton>

                <div className="text-center pt-4">
                  <span className="text-gray-500 text-sm">
                    Remember your password?{' '}
                  </span>
                  <Link href="/login" className="text-sm font-black border-b-2 border-black hover:bg-black hover:text-white px-1 transition-all">
                    LOG IN
                  </Link>
                </div>
              </form>

              {/* Trust Badge */}
              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-100">
                <div className="flex items-center justify-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-tighter">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Encrypted Connection</span>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  )
}
