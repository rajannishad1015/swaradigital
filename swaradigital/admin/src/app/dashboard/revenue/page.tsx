import RevenueUploader from "@/components/revenue-uploader"
import ManualRevenueEntry from "@/components/manual-revenue-entry"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UploadCloud, Keyboard, FileSpreadsheet } from "lucide-react"

export default function RevenuePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">Revenue Ingestion</h1>
        <p className="text-zinc-400 mt-2 font-medium">Upload platform reports or manually enter data to calculate artist earnings.</p>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px] bg-zinc-900/50 p-1 border border-zinc-800/50 mb-8 rounded-xl h-auto">
          <TabsTrigger 
            value="upload" 
            className="rounded-lg py-2.5 data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-bold flex items-center gap-2 transition-all"
          >
            <UploadCloud size={16} />
            CSV Upload
          </TabsTrigger>
          <TabsTrigger 
            value="manual"
            className="rounded-lg py-2.5 data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-bold flex items-center gap-2 transition-all"
          >
            <Keyboard size={16} />
            Manual Entry
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="animate-in fade-in slide-in-from-bottom-5 duration-500">
          <RevenueUploader />
        </TabsContent>
        
        <TabsContent value="manual" className="animate-in fade-in slide-in-from-bottom-5 duration-500">
            <ManualRevenueEntry />
        </TabsContent>
      </Tabs>
    </div>
  )
}
