'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CheckCircle2, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function SignupSuccessDialog() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (message && message.includes('Welcome to MusicFlow')) {
      setOpen(true)
    }
  }, [message])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md bg-white border-gray-200">
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
                We've sent you a confirmation link. Please verify your email to access your dashboard.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            onClick={() => setOpen(false)}
            className="w-full h-12 bg-black hover:bg-gray-800 text-white font-bold uppercase tracking-widest"
          >
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
