"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, UploadCloud, FileSpreadsheet, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { processRevenueData } from "@/app/dashboard/revenue/actions";

const formSchema = z.object({
  file: z.any()
    .refine((files) => files?.length === 1, "File is required"),
});

export default function RevenueUploader() {
  const [data, setData] = useState<any[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsParsing(true);
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setData(results.data);
          setPreview(results.data.slice(0, 5)); // Show first 5 rows
          setIsParsing(false);
          toast.success(`Parsed ${results.data.length} rows`);
        },
        error: (error) => {
          console.error(error);
          setIsParsing(false);
          toast.error("Error parsing CSV");
        },
      });
    }
  };

  const onSubmit = async () => {
    if (data.length === 0) return;
    
    setIsUploading(true);
    try {
        const result = await processRevenueData(data);
        if (result.success) {
            toast.success(`Successfully processed ${result.count} records`);
            setData([]);
            setPreview([]);
            form.reset();
        } else {
            toast.error(result.error || "Failed to process data");
        }
    } catch (error) {
        toast.error("An unexpected error occurred");
        console.error(error);
    } finally {
        setIsUploading(false);
    }
  };

  return (
     <div className="space-y-6">
      <Card className="bg-zinc-900 border-zinc-800 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2 text-white">
            <UploadCloud className="text-indigo-400" />
            Upload Revenue Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="file"
                render={({ field: { onChange, value, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>CSV Report File</FormLabel>
                    <FormControl>
                      <Input
                        {...fieldProps}
                        type="file"
                        accept=".csv"
                        onChange={(event) => {
                          onChange(event.target.files);
                          handleFileChange(event);
                        }}
                        className="bg-zinc-950 border-zinc-700 text-zinc-300 file:text-indigo-400 file:font-bold"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {preview.length > 0 && (
                <div className="rounded-md border border-zinc-800 overflow-hidden">
                    <div className="bg-zinc-950 px-4 py-2 border-b border-zinc-800 text-xs font-bold text-zinc-500 uppercase tracking-wider flex justify-between items-center">
                        <span>Preview ({data.length} rows)</span>
                        <span className="text-indigo-400">Ready to Process</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-zinc-400">
                            <thead className="bg-zinc-900/50 text-zinc-500 font-medium border-b border-zinc-800">
                                <tr>
                                    {Object.keys(preview[0]).slice(0, 5).map((key) => (
                                        <th key={key} className="px-4 py-2 whitespace-nowrap">{key}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {preview.map((row, i) => (
                                    <tr key={i} className="hover:bg-zinc-900/50">
                                        {Object.values(row).slice(0, 5).map((val: any, j) => (
                                            <td key={j} className="px-4 py-2 whitespace-nowrap max-w-[200px] truncate">{String(val)}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
              )}

              <Button 
                type="submit" 
                disabled={isUploading || data.length === 0}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing {data.length} Records...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Process & Ingest Data
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-amber-500 flex-shrink-0 mt-0.5" size={18} />
          <div className="space-y-1">
              <h4 className="text-sm font-bold text-amber-500">Important Note</h4>
              <p className="text-xs text-amber-400/80">Ensure the CSV contains an 'ISRC' column. This is required to map revenue to the correct artist and track.</p>
          </div>
      </div>
    </div>
  );
}
