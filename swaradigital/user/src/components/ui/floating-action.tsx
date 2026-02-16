'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

export default function FloatingAction({ children, className }: { children: React.ReactNode, className?: string }) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        return () => setMounted(false)
    }, [])

    if (!mounted) return null

    // Ensure we are on the client and document.body exists
    if (typeof document === 'undefined') return null

    return createPortal(
        <div className={cn("fixed z-50", className)}>
            {children}
        </div>,
        document.body
    )
}
