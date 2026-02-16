'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Breadcrumbs() {
  const pathname = usePathname()
  
  // Split path and filter out empty strings
  const segments = pathname.split('/').filter(Boolean)
  
  // If we're just on /dashboard, we might not need breadcrumbs or just show "Dashboard"
  if (segments.length <= 1 && segments[0] === 'dashboard') {
    return null
  }

  const breadcrumbs = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join('/')}`
    const isLast = index === segments.length - 1
    
    // Custom labels for specific segments
    let label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
    
    if (segment === 'finance') label = 'Finance Center'
    if (segment === 'catalog') label = 'Music Catalog'
    if (segment === 'upload') label = 'Release Upload'
    if (segment === 'settings') label = 'Account Settings'
    if (segment === 'payouts') label = 'Payout History'
    if (segment === 'tickets') label = 'Support Tickets'

    return {
      label,
      href,
      isLast
    }
  })

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-xs font-medium text-zinc-500">
      <ol className="flex items-center gap-1.5">
        <li>
          <Link 
            href="/dashboard"
            className="hover:text-zinc-300 transition-colors flex items-center gap-1.5"
          >
            <Home size={12} className="opacity-70" />
            <span className="sr-only">Dashboard</span>
          </Link>
        </li>
        
        {breadcrumbs.map((crumb, index) => (
          // Skip the first segment if it's "dashboard" since we show the home icon
          index === 0 && crumb.label.toLowerCase() === 'dashboard' ? null : (
            <li key={crumb.href} className="flex items-center gap-1.5">
              <ChevronRight size={12} className="text-zinc-700" />
              {crumb.isLast ? (
                <span className="text-indigo-400 font-semibold truncate max-w-[150px]">
                  {crumb.label}
                </span>
              ) : (
                <Link 
                  href={crumb.href}
                  className="hover:text-zinc-300 transition-colors truncate max-w-[150px]"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          )
        ))}
      </ol>
    </nav>
  )
}
