'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle2, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { X } from "lucide-react"

interface ProfileCompletionBannerProps {
  profile: {
    artist_name: string | null
    balance: number
  }
  bankDetails: {
    bankName: string | null
    accountNumber: string | null
    ifscCode: string | null
    paypalEmail: string | null
    upiId: string | null
  }
}

export default function ProfileCompletionBanner({ profile, bankDetails }: ProfileCompletionBannerProps) {
  const [dismissed, setDismissed] = useState(false)
  
  // Check completion status
  const hasArtistName = !!profile?.artist_name && profile.artist_name !== 'Artist'
  const hasPaymentMethod = !!(
    bankDetails?.bankName || 
    bankDetails?.paypalEmail || 
    bankDetails?.upiId
  )
  
  const isComplete = hasArtistName && hasPaymentMethod
  
  // Don't show if complete or dismissed
  if (isComplete || dismissed) return null
  
  const missingItems = []
  if (!hasArtistName) missingItems.push({ label: 'Artist Name', href: '/dashboard/settings' })
  if (!hasPaymentMethod) missingItems.push({ label: 'Payment Method', href: '/dashboard/finance' })
  
  return (
    <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20 backdrop-blur-xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
      
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0 border border-amber-500/30">
            <AlertCircle className="w-5 h-5 text-amber-400" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">
              Complete Your Profile
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Finish setting up your account to unlock all features and start receiving payouts.
            </p>
            
            <div className="space-y-2 mb-4">
              {missingItems.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-amber-500/50 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  </div>
                  <Link href={item.href} className="text-xs text-zinc-300 hover:text-white transition-colors">
                    Add {item.label}
                  </Link>
                </div>
              ))}
            </div>
            
            <div className="flex gap-3">
              <Link href={missingItems[0]?.href || '/dashboard/settings'}>
                <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs uppercase tracking-wider">
                  Complete Setup <ArrowRight className="w-3 h-3 ml-2" />
                </Button>
              </Link>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setDismissed(true)}
                className="text-zinc-400 hover:text-white text-xs"
              >
                Dismiss
              </Button>
            </div>
          </div>
          
          <button
            onClick={() => setDismissed(true)}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
