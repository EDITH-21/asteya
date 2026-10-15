"use client";

import React from "react";
import { motion } from "framer-motion";
import { WHY_ASTEYA_ITEMS } from "@/lib/constants";

export const WhyAsteyaSection: React.FC = () => {
  return (
    <section
      id="why-asteya"
      className="relative w-full py-24 sm:py-32 bg-[#05070b] border-t border-white/[0.08] overflow-hidden scroll-mt-24"
    >
      {/* Ambient Lighting */}
      <div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[170px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Column: Title & Mission */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-32 self-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-indigo-300 font-sans text-xs font-medium tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span>05 &bull; The Asteya Advantage</span>
            </div>

            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white uppercase leading-[1.08]">
              Why Asteya?
            </h2>

            <p className="text-slate-300 text-base sm:text-lg font-normal leading-relaxed">
              We reject the generic template era. We build bespoke, resilient software architectures that compound in value, prioritize user clarity, and withstand scale.
            </p>

            <div className="pt-2 text-sm text-slate-400 border-l-2 border-indigo-500/40 pl-4 space-y-1">
              <p className="font-medium text-slate-200">
                Engineered for serious outcomes.
              </p>
              <p className="text-xs text-slate-400">
                Every technical and design decision is driven by clarity, longevity, and measurable impact.
              </p>
            </div>
          </div>

          {/* Right Column: 4 Core Pillars */}
          <div className="lg:col-span-7 space-y-5">
            {WHY_ASTEYA_ITEMS.map((item, index) => (
              <motion.div
                key={item.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                data-cursor="CORE"
                className="group relative rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.08] hover:border-indigo-500/40 p-7 sm:p-8 transition-all duration-300 hover:shadow-[0_12px_32px_-10px_rgba(99,102,241,0.18)]"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-sans text-indigo-400 font-medium">
                    {item.badge}
                  </span>
                  <span className="text-xl font-mono font-bold text-slate-500 group-hover:text-indigo-300 transition-colors">
                    {item.number}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2 group-hover:text-indigo-200 transition-colors">
                  {item.title}
                </h3>

                <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
