"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export const PhilosophySection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const opacity1 = useTransform(scrollYProgress, [0.15, 0.4, 0.65], [0.3, 1, 0.4]);
  const scale1 = useTransform(scrollYProgress, [0.15, 0.45], [0.95, 1]);
  const opacity2 = useTransform(scrollYProgress, [0.35, 0.55, 0.85], [0, 1, 0.8]);
  const y2 = useTransform(scrollYProgress, [0.35, 0.55], [40, 0]);

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-[90vh] sm:min-h-screen flex items-center justify-center bg-[#030508] border-t border-white/5 overflow-hidden py-24"
    >
      {/* Slow Pulsing Cosmic Core */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[900px] h-[500px] bg-gradient-to-tr from-indigo-900/20 via-purple-900/20 to-cyan-900/15 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8 sm:space-y-12">
        {/* Statement Label */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-indigo-300 font-mono text-xs tracking-widest uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          <span>ASTEYA PHILOSOPHY</span>
        </div>

        {/* First Statement */}
        <motion.h2
          style={{ opacity: opacity1, scale: scale1 }}
          className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight text-slate-400 leading-[1.05]"
        >
          &ldquo;THE FUTURE ISN&apos;T SOMETHING WE WAIT FOR.&rdquo;
        </motion.h2>

        {/* Second Climax Statement */}
        <motion.div
          style={{ opacity: opacity2, y: y2 }}
          className="space-y-4"
        >
          <h2 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black uppercase tracking-tight leading-[1.05] text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-cyan-300 drop-shadow-[0_0_50px_rgba(99,102,241,0.35)]">
            IT&apos;S SOMETHING WE BUILD.
          </h2>

          <p className="text-xs sm:text-sm font-mono text-slate-500 uppercase tracking-widest pt-4">
            DETERMINISTIC CREATION // 2026 AND BEYOND
          </p>
        </motion.div>
      </div>
    </section>
  );
};
