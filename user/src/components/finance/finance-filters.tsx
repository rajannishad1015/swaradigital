'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Calendar, FilterX } from 'lucide-react'
import { useDebouncedCallback } from 'use-debounce'

export default function FinanceFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')

  const updateQueryParams = useDebouncedCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })
    router.push(`?${params.toString()}`, { scroll: false })
  }, 400)

  const handleSearchChange = (val: string) => {
    setSearchTerm(val)
    updateQueryParams({ search: val || null })
  }

  const handleRangeChange = (val: string) => {
    updateQueryParams({ range: val === 'all' ? null : val })
  }

  const clearFilters = () => {
    setSearchTerm('')
    router.push('?', { scroll: false })
  }

  const hasFilters = searchParams.has('search') || searchParams.has('range')

  return (
    <div className="flex flex-col md:flex-row items-center gap-4 w-full bg-zinc-950/50 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
      <div className="relative w-full md:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
        <Input
          placeholder="Search transactions..."
          className="pl-9 bg-white/5 border-white/10 text-white h-10"
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto">
        <Select defaultValue={searchParams.get('range') || 'all'} onValueChange={handleRangeChange}>
          <SelectTrigger className="w-full md:w-[180px] bg-white/5 border-white/10 text-white h-10 font-bold text-xs uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-indigo-400" />
              <SelectValue placeholder="Time Range" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-white/10 text-white">
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
            <SelectItem value="12m">Last 12 Months</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="text-zinc-500 hover:text-white transition-all h-10 px-4"
          >
            <FilterX size={16} className="mr-2" />
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}
