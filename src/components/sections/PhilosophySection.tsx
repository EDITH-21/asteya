"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export const PhilosophySection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const opacity1 = useTransform(scrollYProgress, [0.15, 0.4, 0.65], [0.35, 1, 0.4]);
  const scale1 = useTransform(scrollYProgress, [0.15, 0.45], [0.97, 1]);
  const opacity2 = useTransform(scrollYProgress, [0.35, 0.55, 0.85], [0, 1, 0.9]);
  const y2 = useTransform(scrollYProgress, [0.35, 0.55], [30, 0]);

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-[85vh] sm:min-h-screen flex items-center justify-center bg-[#030508] border-t border-white/[0.08] overflow-hidden py-24 sm:py-32"
    >
      {/* Slow Cosmic Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] sm:w-[850px] h-[450px] bg-gradient-to-tr from-indigo-900/15 via-purple-900/15 to-cyan-900/12 rounded-full blur-[170px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8 sm:space-y-12">
        {/* Statement Label */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-indigo-300 font-sans text-xs font-medium tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          <span>Core Philosophy</span>
        </div>

        {/* First Statement */}
        <motion.h2
          style={{ opacity: opacity1, scale: scale1 }}
          className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-bold uppercase tracking-tight text-slate-400 leading-[1.12]"
        >
          &ldquo;The future isn&apos;t something we wait for.&rdquo;
        </motion.h2>

        {/* Second Climax Statement */}
        <motion.div
          style={{ opacity: opacity2, y: y2 }}
          className="space-y-4"
        >
          <h2 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight leading-[1.08] text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-cyan-300 drop-shadow-[0_0_40px_rgba(99,102,241,0.25)]">
            It&apos;s something we build.
          </h2>
        </motion.div>
      </div>
    </section>
  );
};
