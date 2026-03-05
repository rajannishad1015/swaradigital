"use client";

import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus, Trash2, Save, Keyboard } from "lucide-react";
import { toast } from "sonner";
import { processRevenueData } from "@/app/dashboard/revenue/actions";

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

  const onSubmit = async () => {
    // using manual validation/submission to bypass complex shadcn/hook-form wrapper issues
    const values = form.getValues();
    const isValid = await form.trigger();
    if (!isValid) return;

    setIsUploading(true);
    try {
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
            toast.success(`Processed ${result.count} records seamlessly.`);
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
    <div className="bg-[#18181b] border border-[#3f3f46]/40 rounded-xl overflow-hidden shadow-2xl pb-4">
      <div className="h-1.5 w-full bg-[#eaff00]"></div>
      
      <div className="p-8">
        <div className="flex items-center gap-3 mb-8">
            <Keyboard className="text-[#eaff00] w-7 h-7" strokeWidth={2} />
            <h2 className="text-xl font-bold text-white tracking-wide">Manual Data Entry</h2>
        </div>
        
        <p className="text-[#a1a1aa] text-sm font-medium mb-8">
          Input revenue data for specific tracks row by row. Perfect for small corrections or single statements.
        </p>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-6">
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-4 items-end p-5 rounded-lg bg-[#09090b] border border-[#27272a] hover:border-[#3f3f46] transition-colors relative group">
                  
                  {/* Row Number Badge */}
                  <div className="absolute -top-3 -left-3 bg-[#eaff00] text-black w-6 h-6 rounded-full flex items-center justify-center font-black text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      {index + 1}
                  </div>

                  <div className="md:col-span-3 space-y-2">
                      <label className="text-[#a1a1aa] text-[10px] font-bold tracking-widest uppercase ml-1 block">ISRC Code</label>
                      <input 
                          {...form.register(`entries.${index}.isrc`)} 
                          placeholder="US..." 
                          className="w-full bg-[#18181b] border border-[#27272a] text-white focus:border-[#eaff00]/50 outline-none px-4 py-2.5 rounded-md text-sm transition-colors"
                      />
                      {form.formState.errors.entries?.[index]?.isrc && (
                          <p className="text-[#ef4444] text-[10px] uppercase font-bold tracking-wider mt-1">{form.formState.errors.entries[index]?.isrc?.message}</p>
                      )}
                  </div>

                  <div className="md:col-span-2 space-y-2">
                      <label className="text-[#a1a1aa] text-[10px] font-bold tracking-widest uppercase ml-1 block">Platform</label>
                      <input 
                          {...form.register(`entries.${index}.platform`)} 
                          placeholder="Spotify" 
                          className="w-full bg-[#18181b] border border-[#27272a] text-white focus:border-[#eaff00]/50 outline-none px-4 py-2.5 rounded-md text-sm transition-colors"
                      />
                  </div>

                  <div className="md:col-span-1 space-y-2">
                      <label className="text-[#a1a1aa] text-[10px] font-bold tracking-widest uppercase ml-1 block">Ctry</label>
                      <input 
                          {...form.register(`entries.${index}.country`)} 
                          placeholder="US" 
                          className="w-full bg-[#18181b] border border-[#27272a] text-white focus:border-[#eaff00]/50 outline-none px-4 py-2.5 rounded-md text-sm transition-colors uppercase"
                      />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                      <label className="text-[#a1a1aa] text-[10px] font-bold tracking-widest uppercase ml-1 block">Period</label>
                      <input 
                          type="month"
                          {...form.register(`entries.${index}.period`)} 
                          className="w-full bg-[#18181b] border border-[#27272a] text-white focus:border-[#eaff00]/50 outline-none px-4 py-2.5 rounded-md text-sm transition-colors [color-scheme:dark]"
                      />
                  </div>

                  <div className="md:col-span-2 space-y-2 relative">
                      <label className="text-[#a1a1aa] text-[10px] font-bold tracking-widest uppercase ml-1 block">Revenue</label>
                      <div className="relative">
                          <span className="absolute left-3 top-2.5 text-[#a1a1aa] font-medium text-sm">$</span>
                          <input 
                              type="number"
                              step="0.000001"
                              {...form.register(`entries.${index}.revenue`)} 
                              className="w-full bg-[#18181b] border border-[#27272a] text-white focus:border-[#eaff00]/50 outline-none pl-7 pr-3 py-2.5 rounded-md text-sm transition-colors font-mono"
                          />
                      </div>
                  </div>

                  <div className="md:col-span-1 space-y-2">
                      <label className="text-[#a1a1aa] text-[10px] font-bold tracking-widest uppercase ml-1 block">Curr</label>
                      <input 
                          {...form.register(`entries.${index}.currency`)} 
                          placeholder="USD" 
                          className="w-full bg-[#18181b] border border-[#27272a] text-white focus:border-[#eaff00]/50 outline-none px-3 py-2.5 rounded-md text-sm transition-colors uppercase text-center"
                      />
                  </div>

                  <div className="md:col-span-1 flex justify-end pb-1 pr-1">
                      <button 
                          type="button" 
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                          className="p-2.5 text-[#52525b] hover:text-[#ef4444] hover:bg-[#ef4444]/10 rounded-md transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                      >
                          <Trash2 size={16} strokeWidth={2.5} />
                      </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-6 mt-6 border-t border-[#27272a]">
              <button
                  type="button"
                  onClick={() => append({ isrc: "", platform: "Spotify", country: "US", revenue: 0, period: new Date().toISOString().slice(0, 7), quantity: 1, currency: "USD" })}
                  className="flex items-center gap-2 text-[#a1a1aa] hover:text-[#eaff00] font-bold text-sm transition-colors bg-[#09090b] border border-[#27272a] hover:border-[#eaff00]/30 px-5 py-3 rounded-md w-full sm:w-auto justify-center uppercase tracking-wide"
              >
                  <Plus className="w-4 h-4" strokeWidth={3} />
                  Add Row
              </button>

              <button 
                  type="submit" 
                  disabled={isUploading}
                  className="bg-[#242400] hover:bg-[#343400] text-[#eaff00] border border-[#eaff00]/50 font-bold px-8 py-3 rounded-md shadow-sm w-full sm:w-auto flex justify-center items-center gap-2 transition-colors disabled:opacity-50 uppercase tracking-wide text-sm"
              >
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" strokeWidth={2.5} />}
                  {isUploading ? 'Recording...' : 'Write Records'}
              </button>
            </div>
        </form>
      </div>
    </div>
  );
}
