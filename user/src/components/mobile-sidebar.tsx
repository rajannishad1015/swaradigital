'use client'

import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu, ChevronsLeft } from "lucide-react"
import Sidebar from "@/components/sidebar"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export default function MobileSidebar({ user, signOut, pendingTickets, hasActivity, planType, activePlanName }: { user: any, signOut: () => Promise<void>, pendingTickets: number, hasActivity: boolean, planType: any, activePlanName?: string }) {
    const [open, setOpen] = useState(false)
    const pathname = usePathname()

    useEffect(() => {
        setOpen(false)
    }, [pathname])

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-zinc-400 hover:text-white">
                    <Menu />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 bg-zinc-950 border-zinc-800 w-72" hideClose>
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SheetDescription className="sr-only">
                    Mobile navigation drawer for accessing dashboard sections.
                </SheetDescription>
                
                <div className="flex flex-col h-full">
                    {/* Custom Close Button */}
                    <div className="flex justify-end p-4 border-b border-white/5 bg-zinc-900/50">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setOpen(false)}
                            className="text-zinc-400 hover:text-white hover:bg-white/10 rounded-full h-8 w-8"
                        >
                            <ChevronsLeft size={20} />
                        </Button>
                    </div>

                    <Sidebar 
                        user={user} 
                        signOut={signOut} 
                        pendingTickets={pendingTickets} 
                        hasActivity={hasActivity}
                        planType={planType}
                        activePlanName={activePlanName}
                        className="w-full border-r-0 h-auto flex-1 min-h-0"
                    />
                </div>
            </SheetContent>
        </Sheet>
    )
}
