import Link from 'next/link'
import { 
  Settings, 
  ShieldAlert, 
  Globe, 
  Database, 
  Mail, 
  Lock, 
  CreditCard,
  ChevronRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function SettingsPage() {
  const settingsGroups = [
    {
      title: "System & Security",
      items: [
        {
          title: "Audit Logs",
          description: "View detailed logs of all admin actions and system events.",
          icon: <ShieldAlert className="text-indigo-400" size={24} />,
          href: "/dashboard/settings/audit",
          active: true,
          stats: "Live Tracking"
        },
        {
          title: "Roles & Permissions",
          description: "Manage admin roles and access levels.",
          icon: <Lock className="text-emerald-400" size={24} />,
          href: "#",
          active: false,
          stats: "Coming Soon"
        }
      ]
    },
    {
      title: "Platform Configuration",
      items: [
        {
          title: "General Settings",
          description: "Configure platform name, logos, and default languages.",
          icon: <Settings className="text-zinc-400" size={24} />,
          href: "#",
          active: false,
          stats: "v1.0.0"
        },
        {
          title: "Global Distribution",
          description: "Manage DSP integrations and delivery feeds.",
          icon: <Globe className="text-blue-400" size={24} />,
          href: "#",
          active: false,
          stats: "Automatic"
        },
        {
          title: "Storage & Database",
          description: "Monitor limits, backups, and storage buckets.",
          icon: <Database className="text-amber-400" size={24} />,
          href: "#",
          active: false,
          stats: "Supabase"
        }
      ]
    },
    {
      title: "Communications & Billing",
      items: [
        {
          title: "Email Templates",
          description: "Customize transactional emails and notifications.",
          icon: <Mail className="text-rose-400" size={24} />,
          href: "#",
          active: false,
          stats: "Resend API"
        },
        {
          title: "Payout Configurations",
          description: "Manage payment gateways and threshold settings.",
          icon: <CreditCard className="text-purple-400" size={24} />,
          href: "#",
          active: false,
          stats: "Stripe/Wise"
        }
      ]
    }
  ]

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <Settings className="text-zinc-400" /> System Settings
        </h1>
        <p className="text-zinc-400 mt-2 text-lg">Manage platform configurations and security protocols.</p>
      </div>

      <div className="grid gap-8">
        {settingsGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <div className="w-1 h-6 bg-indigo-500 rounded-full"></div>
              {group.title}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.items.map((item, itemIndex) => (
                <Link 
                  key={itemIndex} 
                  href={item.href}
                  className={`block group ${!item.active ? 'pointer-events-none opacity-60' : ''}`}
                >
                  <Card className="bg-zinc-950 border-white/5 h-full hover:bg-white/[0.02] hover:border-white/10 transition-all duration-300 relative overflow-hidden group-hover:shadow-2xl group-hover:shadow-indigo-500/10">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                      <div className="p-2.5 bg-zinc-900 rounded-xl border border-white/5 group-hover:border-indigo-500/20 group-hover:bg-zinc-800 transition-colors">
                        {item.icon}
                      </div>
                      {item.active ? (
                        <ChevronRight className="text-zinc-600 group-hover:text-indigo-400 transition-colors transform group-hover:translate-x-1" size={20} />
                      ) : (
                        <Badge variant="secondary" className="bg-zinc-900 text-zinc-500 text-[10px] uppercase font-bold tracking-wider border-zinc-800">
                          Soon
                        </Badge>
                      )}
                    </CardHeader>
                    
                    <CardContent className="pt-4 space-y-2 relative z-10">
                      <div>
                        <CardTitle className="text-base font-bold text-zinc-100 group-hover:text-white mb-1">
                          {item.title}
                        </CardTitle>
                        <CardDescription className="text-zinc-500 text-xs line-clamp-2">
                          {item.description}
                        </CardDescription>
                      </div>
                      <div className="pt-4 flex items-center gap-2">
                         <div className={`h-1.5 w-1.5 rounded-full ${item.active ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-700'}`}></div>
                         <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-mono">
                            {item.stats}
                         </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
