'use client'

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface Transaction {
  created_at: string
  description: string
  type: string
  amount: number
  status: string
}

export default function FinanceExportButton({ data }: { data: Transaction[] }) {
  const exportToCSV = () => {
    if (!data || data.length === 0) return

    const headers = ["Date", "Description", "Type", "Amount", "Status"]
    const csvContent = [
      headers.join(","),
      ...data.map(tx => [
        new Date(tx.created_at).toLocaleDateString(),
        `"${tx.description.replace(/"/g, '""')}"`,
        tx.type,
        tx.amount.toFixed(2),
        tx.status
      ].join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `musicflow-finance-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Button 
        variant="outline" 
        size="sm" 
        onClick={exportToCSV}
        className="text-[10px] uppercase font-black tracking-widest text-zinc-400 border-white/5 hover:bg-white/5 hover:text-white h-8"
        disabled={!data || data.length === 0}
    >
        <Download size={14} className="mr-2" /> Export CSV
    </Button>
  )
}
