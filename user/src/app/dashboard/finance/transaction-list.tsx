'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowDownLeft, ArrowUpRight, Clock, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function TransactionList({ transactions }: { transactions: any[] }) {
  if (!transactions || transactions.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-zinc-500 bg-white/[0.02] rounded-xl border border-white/5 border-dashed">
            <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center mb-3">
                <Clock size={20} className="text-zinc-600" />
            </div>
            <p className="text-sm font-medium">No transactions yet</p>
        </div>
    )
  }

  return (
    <div className="rounded-xl overflow-hidden border border-white/5 bg-white/[0.02]">
        <div className="hidden md:block">
            <Table>
                <TableHeader>
                    <TableRow className="border-white/5 hover:bg-transparent bg-zinc-950/50">
                    <TableHead className="text-zinc-500 text-xs font-bold uppercase tracking-wider py-4">Date</TableHead>
                    <TableHead className="text-zinc-500 text-xs font-bold uppercase tracking-wider py-4">Description</TableHead>
                    <TableHead className="text-zinc-500 text-xs font-bold uppercase tracking-wider py-4">Type</TableHead>
                    <TableHead className="text-zinc-500 text-xs font-bold uppercase tracking-wider py-4 text-right">Amount</TableHead>
                    <TableHead className="text-zinc-500 text-xs font-bold uppercase tracking-wider py-4 text-right">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.map((tx) => (
                    <TableRow key={tx.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                        <TableCell className="font-mono text-zinc-400 text-xs">
                            {new Date(tx.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </TableCell>
                        <TableCell className="text-zinc-300 font-medium text-sm">
                            {tx.description}
                        </TableCell>
                        <TableCell>
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                tx.amount > 0 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                            }`}>
                                {tx.amount > 0 ? (
                                    <ArrowDownLeft size={10} />
                                ) : (
                                    <ArrowUpRight size={10} />
                                )}
                                {tx.type}
                            </div>
                        </TableCell>
                        <TableCell className={`text-right font-mono text-sm font-bold ${tx.amount > 0 ? 'text-emerald-400' : 'text-zinc-300'}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex justify-end">
                                {tx.status === 'completed' && (
                                    <span className="flex items-center gap-1.5 text-emerald-500 text-[10px] uppercase font-bold tracking-wider">
                                        <CheckCircle2 size={12} /> Completed
                                    </span>
                                )}
                                {tx.status === 'pending' && (
                                    <span className="flex items-center gap-1.5 text-amber-500 text-[10px] uppercase font-bold tracking-wider animate-pulse">
                                        <Clock size={12} /> Pending
                                    </span>
                                )}
                                {tx.status === 'failed' && (
                                    <span className="flex items-center gap-1.5 text-red-500 text-[10px] uppercase font-bold tracking-wider">
                                        <AlertCircle size={12} /> Failed
                                    </span>
                                )}
                            </div>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden">
            {transactions.map((tx) => (
                <div key={tx.id} className="p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                         <div className="space-y-1">
                             <p className="font-bold text-zinc-200 text-sm">{tx.description}</p>
                             <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
                                 <span>{new Date(tx.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                 <span>•</span>
                                 <span className="uppercase">{tx.type}</span>
                             </div>
                         </div>
                         <div className={`font-mono text-sm font-bold ${tx.amount > 0 ? 'text-emerald-400' : 'text-zinc-300'}`}>
                            {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)}
                         </div>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                         <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            tx.amount > 0 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                        }`}>
                             {tx.amount > 0 ? <ArrowDownLeft size={10} /> : <ArrowUpRight size={10} />}
                             {tx.type}
                        </div>
                        <div>
                             {tx.status === 'completed' && (
                                <span className="flex items-center gap-1.5 text-emerald-500 text-[10px] uppercase font-bold tracking-wider">
                                    <CheckCircle2 size={12} /> Completed
                                </span>
                            )}
                            {tx.status === 'pending' && (
                                <span className="flex items-center gap-1.5 text-amber-500 text-[10px] uppercase font-bold tracking-wider">
                                    <Clock size={12} /> Pending
                                </span>
                            )}
                            {tx.status === 'failed' && (
                                <span className="flex items-center gap-1.5 text-red-500 text-[10px] uppercase font-bold tracking-wider">
                                    <AlertCircle size={12} /> Failed
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
  )
}
