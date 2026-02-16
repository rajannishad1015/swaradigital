'use client'

import { useState } from 'react'
import TrackList from '../track-list'
import { Input } from "@/components/ui/input"
import { Search, Filter, X, Calendar as CalendarIcon, Music } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function CatalogClient({ initialTracks }: { initialTracks: any[] }) {
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [genreFilter, setGenreFilter] = useState('all')
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')

    // Extract unique genres for filter
    const uniqueGenres = Array.from(new Set(initialTracks.map(t => t.genre).filter(Boolean)))

    const filteredTracks = initialTracks.filter(track => {
        const matchesSearch = track.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              track.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              track.isrc?.toLowerCase().includes(searchQuery.toLowerCase())
        
        const matchesStatus = statusFilter === 'all' || track.status === statusFilter
        
        const matchesGenre = genreFilter === 'all' || track.genre === genreFilter

        const trackDate = new Date(track.created_at)
        const matchesDateFrom = !dateFrom || trackDate >= new Date(dateFrom)
        const matchesDateTo = !dateTo || trackDate <= new Date(new Date(dateTo).setHours(23, 59, 59, 999))

        return matchesSearch && matchesStatus && matchesGenre && matchesDateFrom && matchesDateTo
    })

    const filters = [
        { id: 'all', label: 'All' },
        { id: 'approved', label: 'Approved' },
        { id: 'pending', label: 'Pending' },
        { id: 'draft', label: 'Drafts' },
        { id: 'rejected', label: 'Rejected' },
    ]

    const clearFilters = () => {
        setSearchQuery('')
        setStatusFilter('all')
        setGenreFilter('all')
        setDateFrom('')
        setDateTo('')
    }

    const hasActiveFilters = searchQuery || statusFilter !== 'all' || genreFilter !== 'all' || dateFrom || dateTo

    return (
        <div className="space-y-6">
            {/* Controls Bar */}
            <div className="flex flex-col gap-4 bg-white/[0.03] p-4 rounded-xl border border-white/10 backdrop-blur-md">
                
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                     {/* Search */}
                    <div className="relative w-full md:w-96 shrink-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 h-4 w-4" />
                        <Input 
                            placeholder="Search by Title, ISRC or ID..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-black/20 border-white/10 text-white h-10 rounded-full focus:bg-black/40 transition-all font-medium text-sm"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                                <X size={14} />
                            </button>
                        )}
                    </div>

                     {/* Right Side Filters */}
                     <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                        
                        {/* Genre Filter */}
                        <div className="w-full md:w-[140px]">
                            <Select value={genreFilter} onValueChange={setGenreFilter}>
                                <SelectTrigger className="w-full h-10 bg-black/20 border-white/10 text-zinc-300 text-xs rounded-full">
                                    <div className="flex items-center gap-2 truncate">
                                        <Music size={14} className="text-zinc-500" />
                                        <SelectValue placeholder="Genre" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                    <SelectItem value="all">All Genres</SelectItem>
                                    {uniqueGenres.map((g: any) => (
                                        <SelectItem key={g} value={g}>{g}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Date Range Inputs (Simple) */}
                        <div className="w-full md:w-auto flex items-center justify-between gap-2 bg-black/20 px-3 py-1 rounded-full border border-white/10 h-10">
                            <CalendarIcon size={14} className="text-zinc-500" />
                            <input 
                                type="date" 
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="bg-transparent text-white text-xs focus:outline-none w-full md:w-24 text-zinc-400 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50"
                                placeholder="From"
                            />
                            <span className="text-zinc-600">-</span>
                            <input 
                                type="date" 
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="bg-transparent text-white text-xs focus:outline-none w-full md:w-24 text-zinc-400 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50"
                                placeholder="To"
                            />
                        </div>

                     </div>
                </div>

                <div className="w-full border-t border-white/5 pt-4">
                   <div className="grid grid-cols-3 gap-2 md:flex md:items-center md:gap-2">
                        <div className="hidden md:block mr-2">
                             <Filter className="text-zinc-500 h-4 w-4" />
                        </div>
                        {filters.map(filter => (
                            <button
                                key={filter.id}
                                onClick={() => setStatusFilter(filter.id)}
                                className={`px-2 md:px-4 py-2 md:py-1.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-wider transition-all border whitespace-nowrap w-full md:w-auto flex justify-center ${
                                    statusFilter === filter.id 
                                    ? 'bg-indigo-500 text-white border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]' 
                                    : 'bg-white/5 text-zinc-400 border-white/10 hover:border-white/30 hover:bg-white/10'
                                }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                   </div>
                   
                   {/* Mobile Results Count & Clear */}
                   <div className="flex md:hidden items-center justify-between mt-4">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                            {filteredTracks.length} Releases
                        </span>
                        {hasActiveFilters && (
                            <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={clearFilters}
                                className="text-rose-400 text-[10px] h-6 px-2 hover:bg-rose-500/10 hover:text-rose-300 uppercase tracking-wider"
                            >
                                <X size={12} className="mr-1" /> Clear Filters
                            </Button>
                        )}
                   </div>
                </div>
                   
                   {/* Results Count & Clear */}
                   <div className="flex items-center gap-4 shrink-0 pl-4">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest hidden md:inline-block">
                            {filteredTracks.length} Releases
                        </span>
                        {hasActiveFilters && (
                            <div className="hidden md:block">
                                <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={clearFilters}
                                    className="text-rose-400 text-xs h-8 px-2 hover:bg-rose-500/10 hover:text-rose-300"
                                >
                                    <X size={14} className="mr-1" /> Clear
                                </Button>
                            </div>
                        )}
                   </div>
            </div>

            {/* Track List */}
            <TrackList tracks={filteredTracks} />
        </div>
    )
}
