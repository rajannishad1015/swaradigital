'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Check, X, Eye, DollarSign, Copy, CreditCard, Wallet, Landmark } from "lucide-react"
import { approvePayout, rejectPayout } from "./actions"
import { toast } from "sonner"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

export default function PayoutList({ requests }: { requests: any[] }) {
    const [loading, setLoading] = useState<string | null>(null)

    async function handleApprove(id: string) {
        if (!confirm("Are you sure you want to approve this payout? Verify bank details first.")) return
        setLoading(id)
        try {
            await approvePayout(id)
            toast.success("Payout Approved")
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setLoading(null)
        }
    }

    async function handleReject(id: string) {
        if (!confirm("Are you sure? This will refund the amount to user wallet.")) return
        setLoading(id)
        try {
            await rejectPayout(id)
            toast.success("Payout Rejected & Refunded")
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setLoading(null)
        }
    }

    const copyToClipboard = (text: string, label: string) => {
        if (!text) return
        navigator.clipboard.writeText(text)
        toast.success(`${label} copied to clipboard`)
    }

    return (
        <Table>
            <TableHeader>
                <TableRow className="border-white/5 bg-white/[0.02] hover:bg-white/[0.02]">
                    <TableHead className="w-[150px] text-[10px] uppercase font-black tracking-widest text-zinc-500">Date</TableHead>
                    <TableHead className="text-[10px] uppercase font-black tracking-widest text-zinc-500">User</TableHead>
                    <TableHead className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Amount</TableHead>
                    <TableHead className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Method</TableHead>
                    <TableHead className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Status</TableHead>
                    <TableHead className="text-right text-[10px] uppercase font-black tracking-widest text-zinc-500">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {requests.map((req) => (
                    <TableRow key={req.id} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                        <TableCell className="text-xs text-zinc-500 font-mono tracking-wide">{new Date(req.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                            <div className="flex flex-col">
                                <span className="font-bold text-white text-sm group-hover:text-indigo-400 transition-colors">{req.profiles?.full_name || 'Unknown'}</span>
                                <span className="text-xs text-zinc-600 font-mono">{req.profiles?.email}</span>
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="font-black text-lg tracking-tight bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                                ${req.amount.toFixed(2)}
                            </div>
                        </TableCell>
                        <TableCell>
                             <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 rounded-lg bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5 gap-2 px-3">
                                        {req.payment_mode === 'paypal' ? <Wallet className="h-3.5 w-3.5 text-blue-400" /> : 
                                         req.payment_mode === 'upi' ? <CreditCard className="h-3.5 w-3.5 text-orange-400" /> : 
                                         <Landmark className="h-3.5 w-3.5 text-emerald-400" />}
                                        <span className="text-[10px] font-bold uppercase tracking-wider">
                                            {req.payment_mode === 'paypal' ? 'PayPal' : req.payment_mode === 'upi' ? 'UPI' : 'Bank Transfer'}
                                        </span>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-zinc-950/90 backdrop-blur-xl border-white/10 sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle className="text-white font-black uppercase tracking-tight flex items-center gap-2">
                                            {req.payment_mode === 'paypal' ? <Wallet className="h-5 w-5 text-blue-400" /> : 
                                             req.payment_mode === 'upi' ? <CreditCard className="h-5 w-5 text-orange-400" /> : 
                                             <Landmark className="h-5 w-5 text-emerald-400" />}
                                            Payment Details
                                        </DialogTitle>
                                    </DialogHeader>
                                    <div className="grid gap-3 text-sm pt-4">
                                        {req.payment_mode === 'paypal' ? (
                                             <div className="flex justify-between items-center p-3 rounded-lg bg-white/[0.03] border border-white/5 group/copy">
                                                <span className="text-zinc-500 font-medium">PayPal Email</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-white font-bold">{req.profiles?.paypal_email || 'Not provided'}</span>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover/copy:opacity-100 transition-opacity" onClick={() => copyToClipboard(req.profiles?.paypal_email, 'PayPal Email')}>
                                                        <Copy className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : req.payment_mode === 'upi' ? (
                                            <div className="flex justify-between items-center p-3 rounded-lg bg-white/[0.03] border border-white/5 group/copy">
                                                <span className="text-zinc-500 font-medium">UPI ID</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-white font-bold">{req.profiles?.upi_id || 'Not provided'}</span>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover/copy:opacity-100 transition-opacity" onClick={() => copyToClipboard(req.profiles?.upi_id, 'UPI ID')}>
                                                        <Copy className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex justify-between items-center p-3 rounded-lg bg-white/[0.03] border border-white/5 group/copy">
                                                    <span className="text-zinc-500 font-medium">Bank Name</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-white font-bold">{req.profiles?.bank_name || 'N/A'}</span>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover/copy:opacity-100 transition-opacity" onClick={() => copyToClipboard(req.profiles?.bank_name, 'Bank Name')}>
                                                            <Copy className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center p-3 rounded-lg bg-white/[0.03] border border-white/5 group/copy">
                                                    <span className="text-zinc-500 font-medium">Account No</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-white font-mono font-bold tracking-wider">{req.profiles?.account_number || 'N/A'}</span>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover/copy:opacity-100 transition-opacity" onClick={() => copyToClipboard(req.profiles?.account_number, 'Account Number')}>
                                                            <Copy className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center p-3 rounded-lg bg-white/[0.03] border border-white/5 group/copy">
                                                    <span className="text-zinc-500 font-medium">IFSC Code</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-white font-mono font-bold tracking-wider">{req.profiles?.ifsc_code || 'N/A'}</span>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover/copy:opacity-100 transition-opacity" onClick={() => copyToClipboard(req.profiles?.ifsc_code, 'IFSC Code')}>
                                                            <Copy className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        
                                        <div className="flex justify-between items-center p-3 rounded-lg bg-white/[0.03] border border-white/5">
                                            <span className="text-zinc-500 font-medium">User Email</span>
                                             <div className="flex items-center gap-2 group/copy">
                                                <span className="text-zinc-400 font-mono text-xs">{req.profiles?.email}</span>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover/copy:opacity-100 transition-opacity" onClick={() => copyToClipboard(req.profiles?.email, 'Email')}>
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </DialogContent>
                             </Dialog>
                        </TableCell>
                        <TableCell>
                             <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-black tracking-wider border
                                ${req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                  req.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                                  'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                                {req.status}
                            </span>
                        </TableCell>
                        <TableCell className="text-right">
                            {req.status === 'pending' ? (
                                <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                     <Button 
                                        size="sm" 
                                        className="bg-emerald-500 text-white hover:bg-emerald-600 h-8 font-bold border-0 shadow-lg shadow-emerald-500/20"
                                        onClick={() => handleApprove(req.id)}
                                        disabled={loading === req.id}
                                    >
                                        <Check size={14} className="mr-1" /> Approve
                                    </Button>
                                    <Button 
                                        size="sm" 
                                        variant="destructive"
                                        className="h-8 font-bold bg-zinc-800 hover:bg-red-600 text-zinc-400 hover:text-white transition-colors"
                                        onClick={() => handleReject(req.id)}
                                        disabled={loading === req.id}
                                    >
                                        <X size={14} />
                                    </Button>
                                </div>
                            ) : (
                                <span className="text-xs text-zinc-600 font-mono">
                                    {loading === req.id ? 'Processing...' : 'Completed'}
                                </span>
                            )}
                        </TableCell>
                    </TableRow>
                ))}
                 {requests.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                            <div className="flex flex-col items-center gap-3 text-zinc-500">
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                                    <DollarSign className="h-6 w-6 opacity-30" />
                                </div>
                                <p className="font-medium">No payout requests found.</p>
                            </div>
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    )
}
