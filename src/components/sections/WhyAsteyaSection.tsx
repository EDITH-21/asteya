"use client";

import React from "react";
import { motion } from "framer-motion";
import { WHY_ASTEYA_ITEMS } from "@/lib/constants";
import { ShieldCheck, Target, ArrowUpRight, Flame, Users } from "lucide-react";

export const WhyAsteyaSection: React.FC = () => {
  return (
    <section
      id="why-asteya"
      className="relative w-full py-28 sm:py-36 bg-[#05070b] border-t border-white/5 overflow-hidden"
    >
      {/* Ambient Lighting */}
      <div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[170px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Column: Title & Mission */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-32 self-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-indigo-300 font-mono text-xs tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span>THE ASTEYA ADVANTAGE</span>
            </div>

            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white uppercase leading-[1.05]">
              Why Asteya?
            </h2>

            <p className="text-slate-300 text-base sm:text-lg font-normal leading-relaxed">
              We reject the generic template era. We build bespoke, resilient software architectures that compound in value, prioritize user clarity, and withstand scale.
            </p>

            {/* Micro Telemetry Box */}
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-md space-y-3 font-mono text-xs">
              <div className="text-indigo-400 font-bold uppercase tracking-wider">
                ASTEYA PRINCIPLE CODE
              </div>
              <div className="space-y-1.5 text-slate-400">
                <div>&bull; ZERO BOILERPLATE FRAGILITY</div>
                <div>&bull; DETERMINISTIC ARCHITECTURE</div>
                <div>&bull; LONG-TERM CODE COMPOSABILITY</div>
              </div>
            </div>
          </div>

          {/* Right Column: 4 Core Pillars */}
          <div className="lg:col-span-7 space-y-6">
            {WHY_ASTEYA_ITEMS.map((item, index) => (
              <motion.div
                key={item.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                data-cursor="CORE"
                className="group relative rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 hover:border-indigo-500/40 p-8 transition-all duration-300 hover:shadow-[0_15px_35px_-10px_rgba(99,102,241,0.2)]"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="inline-flex items-center gap-2 text-xs font-mono text-indigo-400 tracking-wider uppercase">
                    <span>{item.badge}</span>
                  </div>
                  <span className="text-2xl font-mono font-bold text-slate-600 group-hover:text-indigo-300 transition-colors">
                    {item.number}
                  </span>
                </div>

                <h3 className="text-2xl font-bold tracking-tight text-white mb-3 group-hover:text-indigo-200 transition-colors">
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
