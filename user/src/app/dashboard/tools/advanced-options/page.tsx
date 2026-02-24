import { Wrench, Sparkles, Megaphone, ShieldCheck, Users, Zap, Library } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function AdvancedToolsPage() {
    const upcomingTools = [
        {
            title: "AI Audio Mastering",
            description: "Intelligent EQ, compression, and loudness normalization tailored for streaming platforms.",
            icon: Zap,
            status: "In Development"
        },
        {
            title: "Smart Promo Kits",
            description: "Auto-generate Instagram, TikTok, and YouTube Shorts promo videos from your tracks.",
            icon: Megaphone,
            status: "Coming Soon"
        },
        {
            title: "Catalog Batch Editor",
            description: "Update metadata, ISRC codes, and credits for multiple releases simultaneously.",
            icon: Library,
            status: "Planned"
        },
        {
            title: "Collaborator Split Sheets",
            description: "Automated legal split sheet generation and royalty distribution agreements.",
            icon: Users,
            status: "Planned"
        },
        {
            title: "Anti-Piracy Monitoring",
            description: "Automated scans and takedown requests for unauthorized uploads of your catalog.",
            icon: ShieldCheck,
            status: "Advanced"
        }
    ]

    return (
        <div className="space-y-12 pb-20">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-zinc-900 border border-white/5 p-12 lg:p-20">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent" />
                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-6">
                        <Sparkles size={12} />
                        Advanced Ecosystem
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-black tracking-tighter text-white mb-6">
                        Advanced <span className="text-zinc-500">Tools.</span>
                    </h1>
                    <p className="text-lg text-zinc-400 font-medium leading-relaxed mb-8">
                        We're building a suite of high-performance tools designed to give independent artists and labels complete control over their career and catalog.
                    </p>
                    <div className="flex items-center gap-4">
                        <div className="h-1px flex-1 bg-zinc-800" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-600">Coming Soon</span>
                        <div className="h-1px flex-1 bg-zinc-800" />
                    </div>
                </div>
            </div>

            {/* Upcoming Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingTools.map((tool, index) => (
                    <Card key={index} className="bg-zinc-900/50 border-white/5 hover:border-indigo-500/20 transition-all group">
                        <CardHeader>
                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20 transition-colors">
                                <tool.icon className="w-6 h-6 text-zinc-400 group-hover:text-indigo-400 transition-colors" />
                            </div>
                            <div className="flex items-center justify-between mb-1">
                                <CardTitle className="text-lg font-bold text-white tracking-tight">{tool.title}</CardTitle>
                                <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-zinc-800 text-zinc-500 border border-white/5">
                                    {tool.status}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-zinc-500 font-medium leading-relaxed">
                                {tool.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Newsletter/Interest Section */}
            <div className="bg-indigo-600 rounded-3xl p-12 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20" />
                <h2 className="text-3xl font-black text-white tracking-tight mb-4 relative z-10">Have a tool in mind?</h2>
                <p className="text-indigo-100 font-medium max-w-lg mx-auto mb-8 relative z-10">
                    We're building this dashboard for you. If you need a specific tool to streamline your distribution, let us know through Support.
                </p>
                <div className="relative z-10">
                    <button className="h-12 px-8 bg-white text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] rounded-full hover:scale-105 transition-transform shadow-xl">
                        Suggest a Feature
                    </button>
                </div>
            </div>
        </div>
    )
}
