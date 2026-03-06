'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createTicket } from './actions'
import { toast } from "sonner"
import { Loader2, Ticket } from 'lucide-react'

// Specific premium logo/icon based on user's reference image
import { Sparkles } from "lucide-react"

export default function CreateTicketDialog({ planType = 'none' }: { planType?: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const isBasicPlan = planType === 'none' || planType === 'solo'

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    
    try {
        await createTicket(formData)
        toast.success("Ticket created successfully")
        setOpen(false)
    } catch (error: any) {
        toast.error(error.message || "Failed to create ticket")
    } finally {
        setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#151525] border border-[#2A2A40] text-[#8B5CF6] hover:bg-[#1A1A2F] hover:-translate-y-0.5 transition-all shadow-md gap-2 rounded-xl">
            <Ticket size={16} /> Open Ticket
        </Button>
      </DialogTrigger>
      {/* Dark Navy Background - #0A0A10 */}
      <DialogContent className="sm:max-w-[550px] bg-[#0A0A10] border-[#2A2A40] text-white p-0 overflow-hidden gap-0 shadow-2xl rounded-2xl">
        <div className="bg-[#0A0A10] border-b border-[#2A2A40] p-6 relative overflow-hidden group">
            {/* Glowing top line from previous modal reference */}
             <div className="absolute top-0 inset-x-0 h-[3px] bg-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.5)]" />
             
            <DialogTitle className="text-[22px] font-black text-white flex items-center gap-3 relative z-10 tracking-tight">
                <div className="h-9 w-9 rounded-xl bg-[#151525] flex items-center justify-center text-[#8B5CF6] border border-[#2A2A40]">
                    <Sparkles size={18} strokeWidth={2.5}/>
                </div>
                Open Support Ticket
            </DialogTitle>
            <DialogDescription className="text-[#A0A0B0] mt-2 relative z-10 text-[15px]">
                Submit your query and our team will get back to you.
            </DialogDescription>
        </div>
        
        <form onSubmit={onSubmit} className="space-y-5 p-6 bg-[#0A0A10]">
            <div className="space-y-2">
                <Label htmlFor="subject" className="text-[11px] font-bold uppercase text-[#6C6C85] tracking-widest">Subject</Label>
                <Input 
                    id="subject" 
                    name="subject" 
                    required 
                    placeholder="Brief summary of the issue" 
                    className="bg-[#12121A] border-[#2A2A40] text-white placeholder:text-[#6C6C85] focus:border-[#8B5CF6] focus:bg-[#151525] transition-all font-medium rounded-xl h-11" 
                />
            </div>
            
            <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                    <Label htmlFor="category" className="text-[11px] font-bold uppercase text-[#6C6C85] tracking-widest">Category</Label>
                    <Select name="category" required defaultValue="general">
                        <SelectTrigger id="category" className="bg-[#12121A] border-[#2A2A40] text-white focus:ring-offset-0 focus:border-[#8B5CF6] rounded-xl h-11">
                            <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#12121A] border-[#2A2A40] text-white rounded-xl">
                            <SelectItem value="general" className="focus:bg-[#1A1A2F]">General Inquiry</SelectItem>
                            <SelectItem value="technical" className="focus:bg-[#1A1A2F]">Technical Issue</SelectItem>
                            <SelectItem value="finance" className="focus:bg-[#1A1A2F]">Billing & Finance</SelectItem>
                            <SelectItem value="copyright" className="focus:bg-[#1A1A2F]">Copyright & Legal</SelectItem>
                            <SelectItem value="other" className="focus:bg-[#1A1A2F]">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="priority" className="text-[11px] font-bold uppercase text-[#6C6C85] tracking-widest">Priority</Label>
                     <Select name="priority" required defaultValue="low">
                        <SelectTrigger id="priority" className="bg-[#12121A] border-[#2A2A40] text-white focus:ring-offset-0 focus:border-[#8B5CF6] rounded-xl h-11">
                            <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#12121A] border-[#2A2A40] text-white rounded-xl">
                            <SelectItem value="low" className="focus:bg-[#1A1A2F]">Low Priority</SelectItem>
                            <SelectItem value="medium" disabled={isBasicPlan} className="focus:bg-[#1A1A2F] data-[disabled]:opacity-50">
                                Medium Priority {isBasicPlan && <span className="ml-1 text-[10px] text-[#A855F7] uppercase font-bold tracking-wider">(Pro)</span>}
                            </SelectItem>
                            <SelectItem value="high" disabled={isBasicPlan} className="focus:bg-[#1A1A2F] data-[disabled]:opacity-50">
                                High Priority {isBasicPlan && <span className="ml-1 text-[10px] text-[#A855F7] uppercase font-bold tracking-wider">(Pro)</span>}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="message" className="text-[11px] font-bold uppercase text-[#6C6C85] tracking-widest">Message</Label>
                <Textarea 
                    id="message" 
                    name="message" 
                    required 
                    placeholder="Provide detailed information..." 
                    className="bg-[#12121A] border-[#2A2A40] min-h-[140px] text-white placeholder:text-[#6C6C85] focus:border-[#8B5CF6] focus:bg-[#151525] resize-none transition-all font-medium leading-relaxed rounded-xl p-4" 
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="attachment" className="text-[11px] font-bold uppercase text-[#6C6C85] tracking-widest flex items-center justify-between">
                    Attachment <span className="text-[#6C6C85] normal-case tracking-normal font-normal text-[12px]">(Optional)</span>
                </Label>
                <div className="relative group">
                    <Input 
                        id="attachment" 
                        name="attachment" 
                        type="file" 
                        className="bg-[#12121A] border-[#2A2A40] text-[13px] text-[#A0A0B0] file:bg-[#151525] file:text-[#D1D1E0] file:border file:border-[#2A2A40] file:rounded-lg file:mr-4 file:px-4 file:py-1.5 file:text-[11px] file:uppercase file:font-bold file:tracking-wider cursor-pointer hover:file:bg-[#1A1A2F] transition-colors pr-2 h-[46px] rounded-xl flex items-center" 
                    />
                </div>
            </div>

            <DialogFooter className="pt-4 mt-6">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-[#A0A0B0] hover:text-white hover:bg-[#151525] rounded-xl h-11 px-6">Cancel</Button>
                <Button 
                    type="submit" 
                    disabled={loading} 
                    className="h-11 px-8 rounded-xl font-bold transition-all duration-300 text-white shadow-xl hover:-translate-y-0.5 bg-[#7C3AED] hover:bg-[#6D28D9]"
                >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Ticket className="mr-2 h-4 w-4" />}
                    Submit Ticket
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
