"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { PROCESS_STAGES } from "@/lib/constants";
import { CheckCircle2, Terminal, ArrowDown } from "lucide-react";

export const ProcessSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 70%", "end 80%"],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section
      id="process"
      ref={containerRef}
      className="relative w-full py-28 sm:py-36 bg-[#07090e] border-t border-white/5 overflow-hidden"
    >
      {/* Background Subtle Gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-indigo-600/10 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-indigo-300 font-mono text-xs tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span>EXECUTION PROTOCOL</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white uppercase">
            From Concept to Reality
          </h2>

          <p className="text-slate-400 text-sm sm:text-base font-normal">
            A battle-tested 7-stage engineering trajectory from raw hypothesis to resilient scale.
          </p>
        </div>

        {/* Vertical Timeline Structure */}
        <div className="relative">
          {/* Static Background Rail Line */}
          <div className="absolute top-0 bottom-0 left-6 sm:left-1/2 -translate-x-1/2 w-0.5 bg-white/10" />

          {/* Dynamic Illuminated Laser Progress Line */}
          <motion.div
            style={{ height: lineHeight }}
            className="absolute top-0 left-6 sm:left-1/2 -translate-x-1/2 w-0.5 bg-gradient-to-b from-indigo-500 via-cyan-400 to-purple-500 shadow-[0_0_12px_#6366f1]"
          />

          {/* Timeline Stages */}
          <div className="space-y-12 sm:space-y-16">
            {PROCESS_STAGES.map((stage, idx) => {
              const isEven = idx % 2 === 0;

              return (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className={`relative flex items-center flex-col sm:flex-row ${
                    isEven ? "sm:flex-row-reverse" : ""
                  }`}
                >
                  {/* Left / Right Content Card */}
                  <div className="w-full sm:w-1/2 pl-16 sm:pl-0 sm:px-10">
                    <div
                      className={`p-6 rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 hover:border-indigo-500/30 transition-all ${
                        isEven ? "sm:text-left" : "sm:text-left"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono tracking-widest text-indigo-400 uppercase">
                          PHASE // {stage.id}
                        </span>
                        <span className="text-xs font-mono text-slate-500">
                          STAGE 0{idx + 1}/07
                        </span>
                      </div>

                      <h3 className="text-2xl font-bold tracking-tight text-white mb-2">
                        {stage.name}
                      </h3>

                      <p className="text-sm text-slate-300 font-normal leading-relaxed">
                        {stage.detail}
                      </p>
                    </div>
                  </div>

                  {/* Center Node Pin */}
                  <div className="absolute left-6 sm:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#07090e] border-2 border-indigo-500 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)] z-10">
                    <span className="w-2 h-2 rounded-full bg-cyan-300" />
                  </div>

                  {/* Empty Spacer Column for Desktop */}
                  <div className="hidden sm:block sm:w-1/2" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
