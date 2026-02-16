"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BackgroundGradient } from "@/components/ui/background-gradient";

export function Pricing() {
  const tiers = [
    {
      name: "Pro Artist",
      price: "$19.99",
      period: "/year",
      description: "Perfect for independent artists wanting to go global.",
      features: [
        "Unlimited distribution",
        "100% of your royalties",
        "Spotify & Apple Verified",
        "Real-time analytics",
        "YouTube Content ID",
        "Social media distribution",
        "Priority Support",
      ],
      cta: "Get Started",
      highlight: true,
    },
    {
      name: "Label / Enterprise",
      price: "Custom",
      period: "",
      description: "Scale your music label with advanced management tools.",
      features: [
        "Everything in Pro",
        "Unlimited Artists",
        "Multi-user access",
        "Splits & Batch payments",
        "Custom distribution deals",
        "Dedicated Account Manager",
        "White-label options",
      ],
      cta: "Contact Us",
      highlight: false,
    },
  ];

  return (
    <section id="pricing" className="py-16 md:py-24 bg-white relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-5xl font-bold mb-6 text-slate-900"
          >
            Simple, transparent <span className="text-blue-600">pricing.</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-slate-600"
          >
            No hidden fees. No royalty cuts. Just the tools you need to build your music career.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {tiers.map((tier, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              {tier.highlight ? (
                <div className="relative p-[2px] rounded-[22px] bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 shadow-xl h-full flex flex-col group">
                   <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-[22px] blur-sm opacity-50 transition-opacity duration-500 group-hover:opacity-75"></div>
                   <div className="relative rounded-[20px] p-6 sm:p-10 bg-white h-full flex flex-col z-10">
                      <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl rounded-tr-[19px] uppercase tracking-wider shadow-sm">
                        Most Popular
                      </div>

                      <div className="mb-4">
                        <p className="text-base sm:text-lg text-slate-900 font-bold mt-2">
                          {tier.name}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          {tier.description}
                        </p>
                      </div>

                      <div className="mb-8 flex items-baseline gap-1">
                        <span className="text-5xl font-extrabold text-slate-900 tracking-tight">
                            {tier.price}
                        </span>
                        <span className="text-slate-500 font-medium">{tier.period}</span>
                      </div>

                       <div className="space-y-4 mb-8 flex-grow">
                        {tier.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="h-6 w-6 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                <Check className="w-3.5 h-3.5 text-blue-600" />
                            </div>
                            <span className="text-sm text-slate-700 font-medium">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <Link href={tier.cta === "Contact Us" ? "mailto:support@musicflow.com" : "/signup"} className="mt-auto">
                        <Button 
                          className="w-full h-12 rounded-xl text-base font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                        >
                          {tier.cta}
                        </Button>
                      </Link>
                   </div>
                </div>
              ) : (
                <div className="p-6 sm:p-10 rounded-3xl border border-slate-200 bg-white h-full flex flex-col hover:border-slate-300 hover:shadow-lg transition-all duration-300">
                   <div className="mb-4">
                    <p className="text-base sm:text-lg text-slate-900 font-bold mt-2">
                      {tier.name}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      {tier.description}
                    </p>
                  </div>

                  <div className="mb-8 flex items-baseline gap-1">
                     <span className="text-5xl font-extrabold text-slate-900 tracking-tight">{tier.price}</span>
                    <span className="text-slate-500 font-medium">{tier.period}</span>
                  </div>

                  <div className="space-y-4 mb-8 flex-grow">
                     {tier.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-slate-400 flex-shrink-0" />
                        <span className="text-sm text-slate-600">{feature}</span>
                      </div>
                    ))}
                  </div>

                   <Link href={tier.cta === "Contact Us" ? "mailto:support@musicflow.com" : "/signup"} className="mt-auto">
                    <Button 
                      variant="outline"
                      className="w-full h-12 rounded-xl text-base font-semibold border-slate-200 text-slate-900 hover:bg-slate-50 hover:border-slate-300 transition-all"
                    >
                      {tier.cta}
                    </Button>
                  </Link>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
