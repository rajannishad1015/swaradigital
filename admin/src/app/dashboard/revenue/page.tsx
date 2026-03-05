'use client'

import { useState } from 'react'
import { UploadCloud, Keyboard, CheckCircle2, AlertTriangle, FileUp, Loader2 } from 'lucide-react'
import { processRevenueData } from './actions'
import { toast } from "sonner"
import ManualRevenueEntry from '@/components/manual-revenue-entry'

export default function RevenueIngestionPage() {
    const [file, setFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [activeTab, setActiveTab] = useState<'csv' | 'manual'>('csv')

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
            setResult(null)
        }
    }

    const handleUpload = async () => {
        if (!file) return

        setLoading(true)
        import('papaparse').then((Papa) => {
             Papa.default.parse(file, {
                 header: true,
                 skipEmptyLines: true,
                 complete: async (results) => {
                     try {
                         const res = await processRevenueData(results.data)
                         setResult(res)
                         if (res.success) {
                             toast.success(`Processed ${res.count} records seamlessly.`)
                         } else {
                             toast.error(`Ingestion error: ${res.error}`)
                             setResult({ failureCount: 1, errors: [res.error] }) 
                         }
                     } catch (error: any) {
                         toast.error(error.message || "Failed to process file")
                         setResult({ failureCount: 1, errors: [error.message] })
                     } finally {
                         setLoading(false)
                     }
                 },
                 error: () => {
                     toast.error("Failed to parse CSV")
                     setLoading(false)
                 }
             })
        });
    }

    const displayResult = result ? {
        successCount: result.count || 0,
        failureCount: result.failureCount || (result.error ? 1 : 0),
        errors: result.errors || (result.error ? [result.error] : [])
    } : null;

    return (
        <div className="max-w-[1000px] mx-auto min-h-screen text-white/90 pt-8 pb-16 font-sans">
             
             {/* Header Layer */}
             <div className="mb-10 pl-2">
                 <h1 className="text-4xl font-black text-white tracking-tight mb-2">Revenue Ingestion</h1>
                 <p className="text-[#a1a1aa] font-medium text-sm">
                     Upload platform reports or manually enter data to calculate artist earnings.
                 </p>
             </div>

             {/* Tab Layer */}
             <div className="flex gap-3 mb-6">
                 <button 
                    onClick={() => setActiveTab('csv')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm tracking-wide transition-colors ${
                        activeTab === 'csv' 
                        ? 'bg-[#5b52f6] text-white hover:bg-[#6a61ff]' 
                        : 'bg-[#121215] text-[#a1a1aa] border border-[#27272a] hover:bg-[#18181b] hover:text-white'
                    }`}
                 >
                     <UploadCloud size={18} strokeWidth={2.5} />
                     CSV Upload
                 </button>
                 <button 
                    onClick={() => setActiveTab('manual')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm tracking-wide transition-colors ${
                        activeTab === 'manual' 
                        ? 'bg-[#5b52f6] text-white hover:bg-[#6a61ff]' 
                        : 'bg-[#121215] text-[#eaff00] border border-[#27272a] hover:bg-[#18181b]'
                    }`}
                 >
                     <Keyboard size={18} strokeWidth={2.5} className={activeTab === 'manual' ? 'text-white' : 'text-[#eaff00]'} />
                     Manual Entry
                 </button>
             </div>

             {activeTab === 'csv' ? (
                 <div className="space-y-6">
                     {/* Upload Card */}
                     <div className="bg-[#18181b] border border-[#3f3f46]/40 rounded-xl overflow-hidden shadow-2xl">
                         {/* Solid Top Border (Reference Purple) */}
                         <div className="h-1.5 w-full bg-[#a855f7]"></div>
                         
                         <div className="p-8">
                             <div className="flex items-center gap-3 mb-8">
                                 <UploadCloud className="text-[#a855f7] w-7 h-7" strokeWidth={2} />
                                 <h2 className="text-xl font-bold text-white tracking-wide">Upload Revenue Report</h2>
                             </div>

                             <div className="space-y-2 mb-8">
                                 <label className="text-[#eaff00] text-xs font-bold tracking-wider uppercase ml-1 block">
                                     CSV Report File
                                 </label>
                                 <div className="flex items-center bg-[#09090b] border border-[#27272a] rounded-md overflow-hidden relative group transition-colors focus-within:border-[#5b52f6]">
                                     <div className="relative border-r border-[#27272a] h-full">
                                         <input 
                                             type="file" 
                                             accept=".csv"
                                             onChange={handleFileChange}
                                             className="absolute inset-0 opacity-0 cursor-pointer w-32 h-full z-10"
                                         />
                                         <div className="px-5 py-3.5 bg-[#27272a]/50 text-[#8e84f7] font-semibold text-sm group-hover:bg-[#27272a] transition-colors cursor-pointer w-full h-full flex items-center justify-center">
                                             Choose File
                                         </div>
                                     </div>
                                     <div className="px-4 py-3.5 text-[#a1a1aa] text-sm truncate flex-1">
                                         {file ? <span className="text-[#f4f4f5] font-medium">{file.name}</span> : 'No file chosen'}
                                     </div>
                                 </div>
                             </div>

                             <button 
                                 onClick={handleUpload}
                                 disabled={loading || !file}
                                 className="w-full flex justify-center items-center gap-2 py-3.5 rounded-md bg-[#3b357e] hover:bg-[#4b44a0] disabled:bg-[#18181b] disabled:text-[#52525b] disabled:border disabled:border-[#27272a] disabled:cursor-not-allowed transition-colors text-white font-bold text-sm tracking-wide shadow-sm"
                             >
                                 {loading ? <Loader2 className="w-5 h-5 animate-spin text-[#8e84f7]" /> : <CheckCircle2 className="w-5 h-5 text-[#8e84f7] opacity-90" />}
                                 {loading ? 'Processing...' : 'Process & Ingest Data'}
                             </button>
                         </div>
                     </div>

                     {/* Warning Banner */}
                     <div className="bg-[#241300] border-[1.5px] border-[#9a5100]/60 rounded-xl p-5 flex items-start gap-4 shadow-sm">
                         <AlertTriangle className="text-[#ff9d00] shrink-0 mt-0.5" size={20} strokeWidth={2.5} />
                         <div className="space-y-1">
                             <h3 className="text-[#ff9d00] font-bold text-sm tracking-wide">Important Note</h3>
                             <p className="text-[#d88700] text-sm font-medium leading-relaxed max-w-[90%]">
                                Ensure the CSV contains an 'ISRC' column. This is required to map revenue to the correct artist and track.
                             </p>
                         </div>
                     </div>

                     {/* Results Card */}
                     {displayResult && (
                         <div className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-2">
                             <div className={`h-1.5 w-full ${displayResult.failureCount > 0 ? 'bg-[#ef4444]' : 'bg-[#10b981]'}`}></div>
                             <div className="p-8">
                                  <h3 className="flex items-center gap-3 text-white font-bold text-xl tracking-tight mb-8">
                                      {displayResult.failureCount === 0 ? (
                                          <CheckCircle2 className="text-[#10b981] w-6 h-6" strokeWidth={2.5} />
                                      ) : (
                                          <AlertTriangle className="text-[#ef4444] w-6 h-6" strokeWidth={2.5} />
                                      )}
                                      Ingeestion Complete
                                  </h3>
                                  
                                  <div className="flex flex-col sm:flex-row gap-6 p-6 rounded-lg bg-[#09090b] border border-[#27272a]">
                                      <div className="flex-1">
                                          <p className="text-[11px] uppercase tracking-[0.2em] text-[#71717a] font-bold mb-1">Success</p>
                                          <p className="text-4xl font-black text-[#10b981]">{displayResult.successCount}</p>
                                      </div>
                                      <div className="w-px bg-[#27272a] hidden sm:block"></div>
                                      <div className="flex-1">
                                          <p className="text-[11px] uppercase tracking-[0.2em] text-[#71717a] font-bold mb-1">Failed</p>
                                          <p className="text-4xl font-black text-[#ef4444]">{displayResult.failureCount}</p>
                                      </div>
                                  </div>
                                  
                                  {displayResult.errors.length > 0 && (
                                      <div className="mt-6">
                                          <h4 className="text-[11px] uppercase tracking-[0.2em] text-[#ef4444] font-bold mb-3">Error Log</h4>
                                          <div className="bg-[#09090b] rounded-lg border border-[#ef4444]/20 p-4 max-h-[200px] overflow-y-auto">
                                              <ul className="space-y-2.5">
                                                  {displayResult.errors.map((err: string, i: number) => (
                                                      <li key={i} className="flex gap-3 text-sm font-mono text-[#a1a1aa] bg-[#18181b] p-2.5 rounded-md border border-[#27272a]">
                                                         <span className="text-[#ef4444] font-bold shrink-0">[{i+1}]</span> 
                                                         <span className="leading-relaxed">{err}</span>
                                                      </li>
                                                  ))}
                                              </ul>
                                          </div>
                                      </div>
                                  )}
                             </div>
                         </div>
                     )}
                 </div>
             ) : (
                 <div className="animate-in fade-in slide-in-from-bottom-2">
                     <ManualRevenueEntry />
                 </div>
             )}
        </div>
    )
}
