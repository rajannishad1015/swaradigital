'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ToolsPage() {
    const router = useRouter()
    useEffect(() => {
        router.replace('/dashboard/tools/media-studio')
    }, [router])
    return (
        <div className="flex items-center justify-center h-[50vh]">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
    )
}
