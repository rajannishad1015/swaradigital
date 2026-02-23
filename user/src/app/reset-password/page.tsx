import type { Metadata } from 'next'
import { updatePassword } from './actions'
import { Input } from '@/components/ui/input'
import { SubmitButton } from '@/components/ui/submit-button'
import { Disc } from 'lucide-react'
import { AuthMessages } from '@/components/auth/auth-messages'

export const metadata: Metadata = {
  title: 'Reset Password | SwaraDigital',
  robots: { index: false, follow: false },
}

export default function ResetPasswordPage() {
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
                  Set New Password
                </h2>
                <p className="text-sm sm:text-base text-gray-600 font-medium">
                  Create a new secure password for your account.
                </p>
                <AuthMessages />
              </div>

              {/* Reset Form */}
              <form className="space-y-4 sm:space-y-6">
                <div>
                  <label htmlFor="password" className="block text-xs font-bold text-gray-900 uppercase tracking-widest mb-2">
                    New Password
                  </label>
                  <Input 
                    id="password" 
                    name="password" 
                    type="password" 
                    placeholder="••••••••" 
                    required 
                    className="h-12 sm:h-14 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-black focus:ring-0 rounded-none transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-xs font-bold text-gray-900 uppercase tracking-widest mb-2">
                    Confirm Password
                  </label>
                  <Input 
                    id="confirmPassword" 
                    name="confirmPassword" 
                    type="password" 
                    placeholder="••••••••" 
                    required 
                    className="h-12 sm:h-14 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-black focus:ring-0 rounded-none transition-all"
                  />
                </div>

                <SubmitButton 
                  formAction={updatePassword}
                  className="w-full h-12 sm:h-14 bg-black hover:bg-gray-800 text-white text-sm sm:text-base font-bold uppercase tracking-widest rounded-none shadow-xl transition-all"
                  loadingText="Updating Password..."
                >
                  Update Password
                </SubmitButton>
              </form>

            </div>
        </div>
      </div>
    </div>
  )
}
