"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUp } from "lucide-react";

interface CtaSectionProps {
  onOpenContact: () => void;
}

export const CtaSection: React.FC<CtaSectionProps> = ({ onOpenContact }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="relative w-full py-24 sm:py-32 bg-[#05070b] border-t border-white/[0.08] overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] bg-indigo-600/12 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="rounded-3xl bg-gradient-to-b from-white/[0.05] to-white/[0.01] border border-white/[0.1] p-8 sm:p-14 backdrop-blur-2xl shadow-2xl relative overflow-hidden"
        >
          {/* Subtle Ambient Accent */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Label */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-indigo-300 font-sans text-xs font-medium tracking-wide mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span>Connect with Asteya</span>
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white uppercase leading-[1.1] mb-4">
            Have An Idea?
          </h2>

          {/* Subheading */}
          <p className="text-slate-300 text-base sm:text-lg font-normal max-w-xl mx-auto mb-9 leading-relaxed">
            Let&apos;s turn it into something real. We partner with founders, executives, and organizations building for the next decade.
          </p>

          {/* Action Buttons with Human-Designed Arrows */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
            {/* Primary Action */}
            <button
              onClick={onOpenContact}
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white text-black font-semibold text-sm tracking-normal hover:bg-slate-100 transition-all duration-200 shadow-[0_0_24px_rgba(255,255,255,0.2)] hover:shadow-[0_0_32px_rgba(255,255,255,0.35)] flex items-center justify-center gap-2 group active:scale-95"
            >
              <span>Start a Conversation</span>
              <ArrowRight strokeWidth={1.75} className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>

            {/* Secondary Action */}
            <button
              onClick={scrollToTop}
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 hover:text-white border border-white/15 backdrop-blur-md font-semibold text-sm tracking-normal transition-all duration-200 flex items-center justify-center gap-2 group active:scale-95"
            >
              <span>Back to Top</span>
              <ArrowUp strokeWidth={1.75} className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors duration-200" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
