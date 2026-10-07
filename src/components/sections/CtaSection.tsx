"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, MessageSquare, Compass } from "lucide-react";

interface CtaSectionProps {
  onOpenContact: () => void;
}

export const CtaSection: React.FC<CtaSectionProps> = ({ onOpenContact }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="relative w-full py-28 sm:py-36 bg-[#05070b] border-t border-white/5 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-indigo-600/15 rounded-full blur-[170px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="rounded-3xl bg-gradient-to-b from-white/[0.05] to-white/[0.01] border border-white/10 p-10 sm:p-16 backdrop-blur-2xl shadow-2xl relative overflow-hidden"
        >
          {/* Subtle Ambient Accent */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Label */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-indigo-300 font-mono text-xs tracking-widest uppercase mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span>CONNECT WITH ASTEYA</span>
          </div>

          {/* Headline */}
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white uppercase leading-[1.05] mb-4">
            Have An Idea?
          </h2>

          {/* Subheading */}
          <p className="text-slate-300 text-lg sm:text-xl font-normal max-w-xl mx-auto mb-10 leading-relaxed">
            Let&apos;s turn it into something real.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            {/* Primary Action */}
            <button
              onClick={onOpenContact}
              data-cursor="CONTACT"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-black font-bold text-sm tracking-wide hover:bg-slate-100 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.25)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] flex items-center justify-center gap-2 group active:scale-95"
            >
              <span>Start A Conversation</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Secondary Action */}
            <button
              onClick={scrollToTop}
              data-cursor="TOP"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/15 backdrop-blur-md font-semibold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 group active:scale-95"
            >
              <span>Explore Asteya</span>
              <Compass className="w-4 h-4 text-indigo-400 group-hover:rotate-45 transition-transform" />
            </button>
          </div>

          {/* Micro Note */}
          <div className="mt-12 pt-6 border-t border-white/5 flex items-center justify-between text-xs font-mono text-slate-500 uppercase tracking-widest">
            <span>DIRECT ACCESS</span>
            <span>WORLDWIDE CLIENTS & PARTNERS</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
