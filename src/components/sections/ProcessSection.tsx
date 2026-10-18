"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { PROCESS_STAGES } from "@/lib/constants";

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
      className="relative w-full py-20 sm:py-28 bg-[#07090e] border-t border-white/[0.08] overflow-hidden scroll-mt-24"
    >
      {/* Background Subtle Gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-indigo-600/10 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-indigo-300 font-sans text-xs font-medium tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span>06 &bull; Execution Process</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white uppercase">
            From Concept to Reality
          </h2>

          <p className="text-slate-300 text-sm sm:text-base font-normal max-w-lg mx-auto leading-relaxed">
            A battle-tested 7-stage engineering trajectory from raw hypothesis to resilient scale.
          </p>
        </div>

        {/* Vertical Timeline Structure */}
        <div className="relative max-w-4xl mx-auto">
          {/* Static Background Rail Line */}
          <div className="absolute top-0 bottom-0 left-6 sm:left-1/2 -translate-x-1/2 w-0.5 bg-white/[0.08]" />

          {/* Dynamic Progress Line */}
          <motion.div
            style={{ height: lineHeight }}
            className="absolute top-0 left-6 sm:left-1/2 -translate-x-1/2 w-0.5 bg-gradient-to-b from-indigo-500 via-cyan-400 to-purple-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
          />

          {/* Timeline Stages */}
          <div className="space-y-10 sm:space-y-14">
            {PROCESS_STAGES.map((stage, idx) => {
              const isEven = idx % 2 === 0;

              return (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: 0.05 }}
                  className={`relative flex items-center flex-col sm:flex-row ${
                    isEven ? "sm:flex-row-reverse" : ""
                  }`}
                >
                  {/* Left / Right Content Card */}
                  <div className="w-full sm:w-1/2 pl-14 sm:pl-0 sm:px-10">
                    <div
                      className={`p-6 rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.08] hover:border-indigo-500/30 transition-all ${
                        isEven ? "sm:text-left" : "sm:text-left"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-sans text-indigo-400 font-medium">
                          Stage {stage.id}
                        </span>
                        <span className="text-xs font-mono text-slate-500">
                          {idx + 1} of 7
                        </span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
                        {stage.name}
                      </h3>

                      <p className="text-sm text-slate-300 font-normal leading-relaxed">
                        {stage.detail}
                      </p>
                    </div>
                  </div>

                  {/* Center Node Pin */}
                  <div className="absolute left-6 sm:left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-[#07090e] border-2 border-indigo-400/80 flex items-center justify-center shadow-[0_0_12px_rgba(99,102,241,0.4)] z-10">
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
