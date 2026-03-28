'use client'

import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar,
    PieChart, Pie, Cell, Legend
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Users, Disc } from 'lucide-react'

interface AnalyticsProps {
    data: {
        uploadTrends: { date: string, uploads: number }[]
        userGrowth: { date: string, users: number }[]
        genreDistribution: { name: string, value: number }[]
    }
}

const PIE_GRADIENTS = [
    { start: '#818cf8', end: '#4f46e5', id: 'pieIndigo' },
    { start: '#34d399', end: '#059669', id: 'pieEmerald' },
    { start: '#fb7185', end: '#e11d48', id: 'pieRose' },
    { start: '#fbbf24', end: '#d97706', id: 'pieAmber' },
    { start: '#a78bfa', end: '#7c3aed', id: 'pieViolet' },
    { start: '#2dd4bf', end: '#0f766e', id: 'pieTeal' },
];

// Fallback solid colors for the legend
const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#14b8a6'];

export default function AnalyticsCharts({ data }: AnalyticsProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-2">
            
            {/* Upload Trends */}
            <Card className="bg-zinc-950/50 border-white/5 backdrop-blur-xl lg:col-span-2 overflow-hidden relative group">
                <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-indigo-500/10 border border-indigo-500/20">
                           <TrendingUp size={14} className="text-indigo-400" />
                        </div>
                        Upload Trends <span className="text-zinc-600 font-medium">(Last 30 Days)</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-[320px] pt-4">
                    <ResponsiveContainer width="100%" height={280} minWidth={0}>
                        <AreaChart data={data.uploadTrends}>
                            <defs>
                                <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                </linearGradient>
                                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                    <feGaussianBlur stdDeviation="4" result="blur" />
                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                            <XAxis 
                                dataKey="date" 
                                stroke="#52525b" 
                                fontSize={10} 
                                tickLine={false} 
                                axisLine={false} 
                                minTickGap={30}
                                dy={10}
                            />
                            <YAxis 
                                stroke="#52525b" 
                                fontSize={10} 
                                tickLine={false} 
                                axisLine={false}
                                allowDecimals={false}
                                dx={-10}
                            />
                            <RechartsTooltip 
                                contentStyle={{ 
                                    backgroundColor: 'rgba(9, 9, 11, 0.9)', 
                                    border: '1px solid rgba(255,255,255,0.1)', 
                                    borderRadius: '12px', 
                                    fontSize: '12px',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.5), 0 0 20px rgba(99,102,241,0.1)',
                                    backdropFilter: 'blur(8px)'
                                }}
                                itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="uploads" 
                                stroke="#818cf8" 
                                strokeWidth={3}
                                fillOpacity={1} 
                                fill="url(#colorUploads)" 
                                activeDot={{ r: 6, fill: '#18181b', stroke: '#818cf8', strokeWidth: 3 }}
                                style={{ filter: 'drop-shadow(0 0 10px rgba(99,102,241,0.3))' }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* User Growth */}
            <Card className="bg-zinc-950/50 border-white/5 backdrop-blur-xl overflow-hidden relative group">
                <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                           <Users size={14} className="text-emerald-400" />
                        </div>
                        New Artists
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-[280px] pt-4">
                    <ResponsiveContainer width="100%" height={240} minWidth={0}>
                        <BarChart data={data.userGrowth}>
                            <defs>
                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#34d399" stopOpacity={1}/>
                                    <stop offset="100%" stopColor="#059669" stopOpacity={0.8}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                            <XAxis 
                                dataKey="date" 
                                stroke="#52525b" 
                                fontSize={10} 
                                tickLine={false} 
                                axisLine={false} 
                                minTickGap={30}
                                dy={10}
                            />
                            <YAxis 
                                stroke="#52525b" 
                                fontSize={10} 
                                tickLine={false} 
                                axisLine={false}
                                allowDecimals={false}
                                dx={-10}
                            />
                            <RechartsTooltip 
                                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                contentStyle={{ 
                                    backgroundColor: 'rgba(9, 9, 11, 0.9)', 
                                    border: '1px solid rgba(255,255,255,0.1)', 
                                    borderRadius: '12px', 
                                    fontSize: '12px',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.5), 0 0 20px rgba(16,185,129,0.1)',
                                    backdropFilter: 'blur(8px)'
                                }}
                                itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                            />
                            <Bar 
                                dataKey="users" 
                                fill="url(#colorUsers)" 
                                radius={[4, 4, 0, 0]}
                                barSize={16}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Genre Distribution */}
            <Card className="bg-zinc-950/50 border-white/5 backdrop-blur-xl overflow-hidden relative group">
                <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-rose-500/30 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-rose-500/10 border border-rose-500/20">
                            <Disc size={14} className="text-rose-400" />
                        </div>
                        Genre Distribution
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-[280px] pt-4 flex flex-col items-center justify-center">
                    <ResponsiveContainer width="100%" height={240} minWidth={0}>
                        <PieChart>
                            <defs>
                               {PIE_GRADIENTS.map((g) => (
                                   <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="1" y2="1">
                                       <stop offset="0%" stopColor={g.start} />
                                       <stop offset="100%" stopColor={g.end} />
                                   </linearGradient>
                               ))}
                            </defs>
                            <Pie
                                data={data.genreDistribution}
                                cx="50%"
                                cy="45%"
                                innerRadius={70}
                                outerRadius={85}
                                paddingAngle={6}
                                dataKey="value"
                                stroke="none"
                                cornerRadius={6}
                            >
                                {data.genreDistribution.map((entry, index) => (
                                    <Cell 
                                        key={`cell-${index}`} 
                                        fill={`url(#${PIE_GRADIENTS[index % PIE_GRADIENTS.length].id})`} 
                                        style={{ filter: `drop-shadow(0 0 8px ${COLORS[index % COLORS.length]}40)` }}
                                    />
                                ))}
                            </Pie>
                            <RechartsTooltip 
                                contentStyle={{ 
                                    backgroundColor: 'rgba(9, 9, 11, 0.9)', 
                                    border: '1px solid rgba(255,255,255,0.1)', 
                                    borderRadius: '12px', 
                                    fontSize: '12px',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                                    backdropFilter: 'blur(8px)'
                                }}
                                itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                            />
                            <Legend 
                                verticalAlign="bottom" 
                                height={40} 
                                iconType="circle"
                                formatter={(value, entry, index) => (
                                    <span style={{ color: '#a1a1aa', fontSize: '10px', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.05em' }}>
                                        {value}
                                    </span>
                                )}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

        </div>
    )
}
