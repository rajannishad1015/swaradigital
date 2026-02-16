"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip as RechartsTooltip,
} from "recharts";
import { Disc, Music } from "lucide-react";

interface AnalyticsChartsProps {
  statusData: { name: string; value: number; color: string }[];
  genreData: { genre: string; count: number }[];
}

export function AnalyticsCharts({
  statusData = [],
  genreData = [],
}: AnalyticsChartsProps) {
  const totalStatus = statusData.reduce((acc, curr) => acc + (curr?.value || 0), 0);
  const hasStatusData = statusData.length > 0 && totalStatus > 0;
  const hasGenreData = genreData.length > 0 && genreData.some(g => g?.count > 0);

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
      {/* SVG Definitions for Gradients and Glows */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          
          {/* Status Gradients */}
          <linearGradient id="grad-approved" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="grad-rejected" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>
          <linearGradient id="grad-pending" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id="grad-draft" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#4338ca" />
          </linearGradient>

          <linearGradient id="indigo-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#818cf8" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#6366f1" stopOpacity={0.2} />
          </linearGradient>
        </defs>
      </svg>

      {/* Status Distribution */}
      <Card className="bg-white/[0.02] backdrop-blur-3xl border border-white/10 text-white relative overflow-hidden group shadow-2xl transition-all duration-700 hover:border-indigo-500/30">
        {/* Animated Background Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-600/10 transition-colors duration-700" />
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        <CardHeader className="relative z-10 flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">
              Global Distribution
            </CardTitle>
            <div className="flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
               <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Live Metadata Syncing</p>
            </div>
          </div>
          <div className="px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-[8px] font-black text-white hover:text-indigo-400 hover:border-indigo-500/30 transition-all cursor-crosshair uppercase tracking-widest backdrop-blur-md">
            v2.4.0
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          {!hasStatusData ? (
            <div className="h-[320px] flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                  <Disc className="w-8 h-8 text-zinc-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-400">No Distribution Data</p>
                  <p className="text-xs text-zinc-600 mt-2">Upload tracks to see status analytics</p>
                </div>
              </div>
            </div>
          ) : (
          <div className="relative h-[320px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                {/* Decorative Outer Ring */}
                <Pie
                  data={[{ value: 1 }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={108}
                  outerRadius={110}
                  fill="rgba(255,255,255,0.03)"
                  stroke="none"
                  dataKey="value"
                  isAnimationActive={false}
                />
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={100}
                  paddingAngle={10}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={12}
                  animationBegin={0}
                  animationDuration={1800}
                  animationEasing="ease-out"
                >
                  {statusData.map((entry, index) => {
                    const gradId = `grad-${entry.name.toLowerCase().replace(' ', '')}`;
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={`url(#${gradId})`}
                        className="transition-all duration-700 cursor-pointer outline-none"
                        style={{ 
                          filter: `drop-shadow(0 0 12px ${entry.color}33)`,
                        }}
                      />
                    );
                  })}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(9, 9, 11, 0.98)",
                    borderColor: "rgba(255, 255, 255, 0.1)",
                    color: "#fff",
                    borderRadius: "20px",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.7)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    padding: '12px 16px'
                  }}
                  itemStyle={{ color: "#fff", fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* High-End Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="relative">
                {/* Glass circle behind text */}
                <div className="absolute inset-0 bg-white/[0.01] blur-xl rounded-full scale-150" />
                <div className="relative flex flex-col items-center justify-center">
                    <span className="text-4xl font-black tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                      {totalStatus}
                    </span>
                    <span className="text-[10px] font-black text-indigo-400/80 uppercase tracking-[0.2em] -mt-1">Releases</span>
                </div>
              </div>
            </div>
          </div>
          )}

          {hasStatusData && (
          <div className="mt-8 grid grid-cols-2 gap-4 pb-4 px-2">
            {statusData.map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/5 transition-all duration-500 hover:bg-white/[0.05] hover:scale-[1.02] hover:border-white/10 group/item">
                <div
                  className="w-2 h-2 rounded-full transition-all duration-500 group-hover/item:shadow-[0_0_12px_currentColor]"
                  style={{ backgroundColor: item.color, color: item.color }}
                />
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest transition-colors group-hover/item:text-zinc-300">{item.name}</span>
                    <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mt-0.5">Cloud Storage</span>
                </div>
                <span className="font-mono text-sm font-black text-white ml-auto">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
          )}
        </CardContent>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-500/5 blur-[100px] pointer-events-none" />
      </Card>
      
      {/* Genre Radar */}
      <Card className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 text-white overflow-hidden group relative shadow-2xl transition-all hover:border-white/20">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:30px:30px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] pointer-events-none" />
        <CardHeader className="pb-0 pt-6 px-6 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 flex items-center gap-2">
                Genre Breakdown
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_10px_#6366f1]" />
              </CardTitle>
              <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-1">Catalog Architecture</p>
            </div>
            <div className="px-2 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[8px] font-black text-indigo-400 uppercase tracking-widest">
              Advanced Analytics
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 relative z-10 mt-2">
          {!hasGenreData ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                  <Music className="w-8 h-8 text-zinc-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-400">No Genre Data</p>
                  <p className="text-xs text-zinc-600 mt-2">Upload tracks with genre tags to see analytics</p>
                </div>
              </div>
            </div>
          ) : (
          <div className="h-[300px] w-full mt-2 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%" minHeight={300}>
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={(genreData?.length || 0) > 2 ? genreData : [...(genreData || []), { genre: '', count: 0 }, { genre: '', count: 0 }]}>
                <PolarGrid gridType="polygon" stroke="rgba(99,102,241,0.2)" strokeWidth={1} />
                <PolarAngleAxis 
                  dataKey="genre" 
                  tick={{ fill: '#a1a1aa', fontSize: 9, fontWeight: '900', letterSpacing: '0.15em' }} 
                />
                <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={true} stroke="rgba(255,255,255,0.05)" />
                
                {/* Background Shadow Radar */}
                <Radar
                   dataKey="count"
                   stroke="none"
                   fill="#6366f1"
                   fillOpacity={0.1}
                   animationDuration={2500}
                />

                <Radar
                  name="Volume"
                  dataKey="count"
                  stroke="#818cf8"
                  strokeWidth={2}
                  fill="url(#indigo-gradient)"
                  fillOpacity={0.6}
                  animationBegin={200}
                  animationDuration={2000}
                  style={{ filter: 'url(#neon-glow)' }}
                  dot={{ r: 3, fill: '#fff', stroke: '#818cf8', strokeWidth: 2, filter: 'drop-shadow(0 0 5px #6366f1)' }}
                  activeDot={{ r: 5, fill: '#fff', stroke: '#6366f1', strokeWidth: 2, filter: 'drop-shadow(0 0 10px #6366f1)' }}
                />
                <RechartsTooltip
                  cursor={false}
                  contentStyle={{ 
                    backgroundColor: 'rgba(9, 9, 11, 0.95)', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '16px', 
                    boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(12px)'
                  }}
                  itemStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                  formatter={(value: any) => [`${value} Tracks`, 'Volume']}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          )}

          {hasGenreData && (
          <div className="mt-6 flex flex-wrap justify-center gap-4">
             {genreData.slice(0, 3).map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-white/5 border border-white/5 px-3 py-1.5 rounded-full transition-all hover:bg-white/10 hover:border-white/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1]" />
                    <span className="text-[9px] font-black text-white uppercase tracking-widest">{item.genre}</span>
                    <span className="text-[9px] font-mono text-indigo-400 font-bold">{item.count}</span>
                </div>
             ))}
          </div>
          )}
        </CardContent>
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/5 blur-[80px] pointer-events-none" />
      </Card>
    </div>
  );
}
