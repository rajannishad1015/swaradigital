'use client'

import { useState } from 'react'
import { resendVerification } from '@/app/login/resend-action'
import { toast } from 'sonner'
import { Loader2, Mail } from 'lucide-react'

export function ResendVerificationLink() {
    const [resending, setResending] = useState(false)
    const [showInput, setShowInput] = useState(false)
    const [email, setEmail] = useState('')

    const handleResend = async () => {
        if (!email) {
            toast.error("Email is required")
            return
        }
        setResending(true)
        try {
            const result = await resendVerification(email)
            if (result.success) {
                toast.success(result.message)
                setShowInput(false)
                setEmail('')
            } else {
                toast.error(result.message)
            }
        } catch (err) {
            toast.error("An unexpected error occurred.")
        } finally {
            setResending(false)
        }
    }

    if (!showInput) {
        return (
            <button
                type="button"
                onClick={() => setShowInput(true)}
                className="text-xs text-gray-500 hover:text-black transition-colors font-medium"
            >
                Didn't receive verification email?
            </button>
        )
    }

    return (
        <div className="mt-4 p-4 border border-gray-100 bg-gray-50/50 space-y-3 text-left">
            <p className="text-xs font-bold text-gray-900 uppercase tracking-widest">Resend Verification</p>
            <div className="flex gap-2">
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 h-10 px-3 text-sm bg-white border border-gray-200 focus:border-black outline-none transition-all text-gray-900"
                />
                <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="h-10 px-4 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50 transition-all flex items-center justify-center min-w-[100px]"
                >
                    {resending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Resend'}
                </button>
            </div>
            <button
                type="button"
                onClick={() => setShowInput(false)}
                className="text-[10px] text-gray-400 hover:text-gray-900 uppercase font-bold tracking-tighter"
            >
                Cancel
            </button>
        </div>
    )
}
