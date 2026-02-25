'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CheckCircle2, Mail, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { resendVerification } from '@/app/login/resend-action'

export function SignupSuccessDialog() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message')
  const [resending, setResending] = useState(false)
  
  // Initialize state based on the URL params directly to avoid useEffect
  const [open, setOpen] = useState(() => {
    return !!(message && message.includes('Welcome to MusicFlow'))
  })

  // Get email from search params if possible
  const email = searchParams.get('email') || ""

  const handleResend = async () => {
    if (!email) {
        toast.error("Please log in to resend verification link.")
        return
    }
    setResending(true)
    try {
        const result = await resendVerification(email)
        if (result.success) {
            toast.success(result.message)
        } else {
            toast.error(result.message)
        }
    } catch (err) {
        toast.error("An unexpected error occurred.")
    } finally {
        setResending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md bg-white border-gray-200 text-gray-900">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Welcome to MusicFlow!
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600">
            Your account has been created successfully.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">
                Check your email
              </p>
              <p className="text-sm text-blue-700 mt-1">
                We've sent you a confirmation link{email ? <>{' to '} <span className="font-bold">{email}</span></> : ""}. Please verify your email to access your dashboard.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            onClick={() => setOpen(false)}
            className="w-full h-12 bg-black hover:bg-gray-800 text-white font-bold uppercase tracking-widest rounded-none"
          >
            Got it!
          </Button>
          <Button
            variant="ghost"
            onClick={handleResend}
            disabled={resending || !email}
            className="w-full h-10 text-gray-500 hover:text-black hover:bg-gray-100 font-bold text-xs uppercase tracking-widest rounded-none"
          >
            {resending ? (
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
            ) : (
                <Mail className="mr-2 h-3 w-3" />
            )}
            Resend Verification Link
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
