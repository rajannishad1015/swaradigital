'use client'

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Music, Rocket, Globe, Calendar } from "lucide-react"
import Link from "next/link"

interface UploadSuccessDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  isFirstUpload?: boolean
}

export default function UploadSuccessDialog({ isOpen, onOpenChange, isFirstUpload }: UploadSuccessDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-md p-0 overflow-hidden">
        <div className="relative h-32 bg-indigo-600 flex items-center justify-center overflow-hidden">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 to-transparent" />
             <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center border border-white/20 animate-bounce transition-all duration-1000">
                <Music className="text-white" size={32} />
             </div>
             {/* Decorative particles (Visual only) */}
             <div className="absolute top-2 left-10 w-2 h-2 rounded-full bg-white/20" />
             <div className="absolute bottom-4 right-12 w-3 h-3 rounded-full bg-white/10" />
        </div>

        <div className="p-8 text-center">
            <DialogHeader>
                <DialogTitle className="text-2xl font-black text-center flex items-center justify-center gap-2 mb-2">
                   RELEASE SUBMITTED <CheckCircle2 className="text-emerald-500" />
                </DialogTitle>
                <DialogDescription className="text-zinc-400 text-center">
                    {isFirstUpload 
                        ? "Congratulations on your first release! You've officially started your journey with MusicFlow."
                        : "Your release has been successfully submitted for processing."}
                </DialogDescription>
            </DialogHeader>

            <div className="mt-8 space-y-4 text-left">
                <h4 className="text-[10px] uppercase font-black text-zinc-500 tracking-[0.2em] mb-4">What happens next?</h4>
                
                <div className="flex gap-4 items-start">
                    <div className="mt-1 p-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
                        <Globe size={14} className="text-indigo-400" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-white">Quality Assurance (QA)</p>
                        <p className="text-[11px] text-zinc-500 leading-relaxed">Our content team will review your metadata and audio quality within 24-48 hours.</p>
                    </div>
                </div>

                <div className="flex gap-4 items-start">
                    <div className="mt-1 p-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
                        <Calendar size={14} className="text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-white">Delivery to DSPs</p>
                        <p className="text-[11px] text-zinc-500 leading-relaxed">Once approved, your music is delivered to Spotify, Apple, and 150+ other stores.</p>
                    </div>
                </div>

                <div className="flex gap-4 items-start">
                    <div className="mt-1 p-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
                        <Rocket size={14} className="text-amber-400" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-white">Go Live!</p>
                        <p className="text-[11px] text-zinc-500 leading-relaxed">Your release will go live on your scheduled release date. Share your pre-save links soon!</p>
                    </div>
                </div>
            </div>

            <DialogFooter className="mt-10 sm:justify-center flex-col sm:flex-row gap-3">
                <Link href="/dashboard/catalog" className="w-full sm:w-auto">
                    <Button onClick={() => onOpenChange(false)} className="w-full sm:w-auto bg-white text-black hover:bg-zinc-200 font-bold text-xs uppercase tracking-widest px-8">
                        View Catalog
                    </Button>
                </Link>
                <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full sm:w-auto text-zinc-500 hover:text-white text-xs uppercase tracking-widest font-bold">
                    Close
                </Button>
            </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
