"use client";

import React from "react";
import { motion } from "framer-motion";
import { Brain, Activity, Clock, Sparkles } from "lucide-react";

export const VenturesSection: React.FC = () => {
  return (
    <section
      id="ventures"
      className="relative w-full py-10 sm:py-14 lg:py-16 bg-[#05070b] border-t border-white/[0.08] overflow-hidden scroll-mt-[68px]"
    >
      {/* Ambient Lighting */}
      <div className="absolute top-1/4 left-1/4 w-[340px] sm:w-[600px] h-[300px] sm:h-[400px] bg-indigo-600/10 rounded-full blur-2xl sm:blur-[120px] pointer-events-none" />
      <div className="hidden sm:block absolute bottom-1/4 right-1/4 w-[500px] h-[400px] bg-cyan-600/10 rounded-full blur-2xl sm:blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-8 sm:mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-indigo-300 font-sans text-xs font-medium tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span>03 &bull; Future Ventures</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white uppercase">
            Ideas Become Systems.
          </h2>

          <p className="text-slate-300 text-base sm:text-lg font-normal leading-relaxed">
            We don&apos;t only build for today. We experiment, validate, and develop technology ventures designed to solve real problems.
          </p>
        </div>

        {/* Featured Venture: ATTENZA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl bg-gradient-to-b from-white/[0.05] via-[#0b101d] to-[#070a14] border border-white/[0.12] p-6 sm:p-8 lg:p-10 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
        >
          {/* Subtle Corner Glow */}
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Info Column */}
            <div className="lg:col-span-6 space-y-6">
              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-indigo-300 text-xs font-sans font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-70" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
                </span>
                <span>Coming Soon &bull; Venture Spotlight</span>
              </div>

              {/* Title & Tagline */}
              <div>
                <h3 className="text-3xl sm:text-5xl font-bold tracking-tight text-white uppercase">
                  ATTENZA
                </h3>
                <p className="text-lg sm:text-xl font-medium text-indigo-300 mt-1">
                  Focus better. Learn smarter.
                </p>
              </div>

              {/* Description */}
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
                Attenza is a productivity-focused learning experience designed to help people create a more focused digital environment.
              </p>

              {/* Venture Feature Highlights */}
              <div className="space-y-3 pt-1">
                <div className="flex items-start gap-3 text-sm text-slate-300">
                  <div className="w-6 h-6 rounded-md bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                    <Brain strokeWidth={1.75} className="w-3.5 h-3.5" />
                  </div>
                  <span>Cognitive Friction Reduction &amp; Flow State Architecture</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-slate-300">
                  <div className="w-6 h-6 rounded-md bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                    <Activity strokeWidth={1.75} className="w-3.5 h-3.5" />
                  </div>
                  <span>Intelligent Distraction Shielding &amp; Attention Analytics</span>
                </div>
              </div>

              {/* Honest Stage Indicator */}
              <div className="pt-2 flex items-center gap-4 text-xs font-sans text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>In Active Development</span>
                </span>
                <span>&bull;</span>
                <span>Asteya Venture Labs</span>
              </div>
            </div>

            {/* Right: Thoughtful Conceptual Workspace Interface */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl bg-[#080c16]/90 border border-white/[0.1] p-6 backdrop-blur-xl shadow-2xl space-y-5">
                {/* Interface Header */}
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
                      <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
                      <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
                    </div>
                    <span className="text-xs font-sans text-slate-300 font-medium ml-2">
                      Attenza Workspace
                    </span>
                  </div>
                  <div className="text-[11px] font-sans text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                    Focus Mode Active
                  </div>
                </div>

                {/* Session Card */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Clock strokeWidth={1.75} className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Deep Learning Interval</span>
                    </span>
                    <span className="font-mono text-slate-300">42:15 remaining</span>
                  </div>

                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full w-3/4" />
                  </div>

                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="text-slate-300 font-medium">Session Goal: Advanced Systems Modeling</span>
                    <span className="text-emerald-400 text-[11px] font-medium">Zero Interruptions</span>
                  </div>
                </div>

                {/* Three Focus Columns */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                    <div className="text-slate-400 text-[11px]">Attention Continuity</div>
                    <div className="text-base font-semibold text-white">96% Coherence</div>
                    <p className="text-[11px] text-slate-400 leading-tight">Adaptive notification shielding engaged</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                    <div className="text-slate-400 text-[11px]">Curriculum Retention</div>
                    <div className="text-base font-semibold text-indigo-300">Optimal Flow</div>
                    <p className="text-[11px] text-slate-400 leading-tight">Spaced recall intervals active</p>
                  </div>
                </div>

                {/* Subtle footer info */}
                <div className="pt-2 text-[11px] font-sans text-slate-500 flex justify-between items-center border-t border-white/[0.06]">
                  <span>Productivity-focused learning architecture</span>
                  <span>Early access pending</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Minimal Placeholder: MORE VENTURES TO BE ANNOUNCED */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-indigo-300">
              <Sparkles strokeWidth={1.75} className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-semibold text-slate-200">
                Additional Ventures in Pipeline
              </h4>
              <p className="text-xs text-slate-400">
                More technology ventures to be announced as development milestones are met.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-sans text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span>Incubating &bull; Asteya Roadmap</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
