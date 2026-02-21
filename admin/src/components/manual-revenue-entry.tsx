"use client";

import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Plus, Trash2, Save, FileSpreadsheet, Keyboard } from "lucide-react";
import { toast } from "sonner";
import { processRevenueData } from "@/app/dashboard/revenue/actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const entrySchema = z.object({
  isrc: z.string().min(10, "Invalid ISRC"),
  platform: z.string().min(2, "Required"),
  country: z.string().min(2, "Required"),
  revenue: z.coerce.number().min(0.0001, "Required"),
  period: z.string().regex(/^\d{4}-\d{2}$/, "Format: YYYY-MM"),
  quantity: z.coerce.number().int().min(1),
  currency: z.string().min(1, "Required"),
});

const formSchema = z.object({
  entries: z.array(entrySchema).min(1, "Add at least one entry"),
});

type FormValues = {
  entries: {
    isrc: string;
    platform: string;
    country: string;
    revenue: number;
    period: string;
    quantity: number;
    currency: string;
  }[]
}

export default function ManualRevenueEntry() {
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      entries: [
        { isrc: "", platform: "Spotify", country: "US", revenue: 0, period: new Date().toISOString().slice(0, 7), quantity: 1, currency: "USD" }
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "entries",
  });

  const onSubmit = async (values: FormValues) => {
    setIsUploading(true);
    try {
        // Map form values to match expected backend structure
        const rows = values.entries.map(e => ({
            'ISRC': e.isrc,
            'Platform': e.platform,
            'Country': e.country,
            'Revenue': e.revenue,
            'Period': e.period,
            'Quantity': e.quantity,
            'Currency': e.currency
        }));

        const result = await processRevenueData(rows);
        if (result.success) {
            toast.success(`Successfully processed ${result.count} records`);
            form.reset({
                entries: [{ isrc: "", platform: "Spotify", country: "US", revenue: 0, period: new Date().toISOString().slice(0, 7), quantity: 1, currency: "USD" }]
            });
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
      <Card className="bg-zinc-900 border-zinc-800 shadow-xl overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-500" />
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2 text-white">
            <Keyboard className="text-emerald-400" />
            Manual Data Entry
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Manually input revenue data for specific tracks. Useful for adjustments or small reports.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-4 rounded-lg bg-zinc-950/50 border border-zinc-800/50 hover:border-zinc-700 transition-colors group">
                    <div className="md:col-span-3">
                        <FormField
                            control={form.control}
                            name={`entries.${index}.isrc`}
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs text-zinc-500 uppercase tracking-wider font-bold">ISRC Code</FormLabel>
                                <FormControl>
                                <Input {...field} placeholder="US..." className="bg-zinc-900 border-zinc-800 focus:border-emerald-500/50" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <FormField
                            control={form.control}
                            name={`entries.${index}.platform`}
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Platform</FormLabel>
                                <FormControl>
                                <Input {...field} placeholder="Spotify" className="bg-zinc-900 border-zinc-800 focus:border-emerald-500/50" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>
                    <div className="md:col-span-1">
                        <FormField
                            control={form.control}
                            name={`entries.${index}.country`}
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Ctry</FormLabel>
                                <FormControl>
                                <Input {...field} placeholder="US" className="bg-zinc-900 border-zinc-800 focus:border-emerald-500/50" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <FormField
                            control={form.control}
                            name={`entries.${index}.period`}
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Period</FormLabel>
                                <FormControl>
                                <Input {...field} type="month" className="bg-zinc-900 border-zinc-800 focus:border-emerald-500/50" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <FormField
                            control={form.control}
                            name={`entries.${index}.revenue`}
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Revenue</FormLabel>
                                <FormControl>
                                <div className="relative">
                                    <span className="absolute left-2 top-2.5 text-zinc-500 text-xs">$</span>
                                    <Input {...field} type="number" step="0.000001" className="pl-5 bg-zinc-900 border-zinc-800 focus:border-emerald-500/50" />
                                </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>
                    <div className="md:col-span-1">
                        <FormField
                            control={form.control}
                            name={`entries.${index}.currency`}
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Curr</FormLabel>
                                <FormControl>
                                <Input {...field} placeholder="USD" className="bg-zinc-900 border-zinc-800 focus:border-emerald-500/50" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>

                    <div className="md:col-span-1 flex justify-end pb-1">
                        <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => remove(index)}
                            disabled={fields.length === 1}
                            className="text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10"
                        >
                            <Trash2 size={16} />
                        </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => append({ isrc: "", platform: "Spotify", country: "US", revenue: 0, period: new Date().toISOString().slice(0, 7), quantity: 1, currency: "USD" })}
                    className="border-dashed border-zinc-700 bg-transparent hover:bg-zinc-800 text-zinc-400 hover:text-white"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Another Row
                </Button>

                <Button 
                    type="submit" 
                    disabled={isUploading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 shadow-lg shadow-emerald-500/20"
                >
                    {isUploading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                    </>
                    ) : (
                    <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Records
                    </>
                    )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
