"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Brain, Lock, ArrowUpRight, Activity, Zap, Compass } from "lucide-react";

export const VenturesSection: React.FC = () => {
  const [activeFocusMode, setActiveFocusMode] = useState<string>("Deep Learning");
  const [focusScore, setFocusScore] = useState<number>(94);

  return (
    <section
      id="ventures"
      className="relative w-full py-28 sm:py-36 bg-[#05070b] border-t border-white/5 overflow-hidden"
    >
      {/* Ambient Lighting */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[400px] bg-indigo-600/10 rounded-full blur-[170px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[400px] bg-cyan-600/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-indigo-300 font-mono text-xs tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span>03 / VENTURES</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white uppercase">
            Ideas Become Systems.
          </h2>

          <p className="text-slate-300 text-base sm:text-lg font-normal leading-relaxed">
            We don&apos;t only build for today. We experiment, validate, and develop technology ventures designed to solve real problems.
          </p>
        </div>

        {/* Featured Venture: ATTENZA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative rounded-3xl bg-gradient-to-b from-white/[0.05] via-[#0b101d] to-[#070a14] border border-white/15 p-8 sm:p-12 overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)]"
        >
          {/* Subtle Corner Glow */}
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Info Column */}
            <div className="lg:col-span-6 space-y-6">
              {/* Status Badge */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-indigo-300 font-mono text-xs tracking-widest uppercase">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
                </span>
                <span>COMING SOON // VENTURE #01</span>
              </div>

              {/* Title & Tagline */}
              <div>
                <h3 className="text-4xl sm:text-5xl font-black tracking-tight text-white uppercase">
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
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="w-6 h-6 rounded-md bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Brain className="w-3.5 h-3.5" />
                  </div>
                  <span>Cognitive Friction Reduction & Flow State Architecture</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="w-6 h-6 rounded-md bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <span>Intelligent Distraction Shielding & Attention Analytics</span>
                </div>
              </div>

              {/* Telemetry Microcopy */}
              <div className="pt-4 flex items-center gap-6 text-xs font-mono text-slate-500">
                <div>STAGE: PRIVATE ALPHA</div>
                <div>ACCESS: INVITE ONLY</div>
              </div>
            </div>

            {/* Right: Interactive Concept Telemetry Interface */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl bg-black/60 border border-white/10 p-6 backdrop-blur-xl shadow-2xl space-y-6">
                {/* Interface Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    <span>ATTENZA_WORKSPACE_OS</span>
                  </div>
                  <div className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                    ENV // ACTIVE
                  </div>
                </div>

                {/* Focus State Sandbox Simulator */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                    <div className="text-[11px] font-mono text-slate-400">ATTENTION RATIO</div>
                    <div className="text-2xl font-bold font-mono text-white flex items-baseline gap-1">
                      <span>{focusScore}%</span>
                      <span className="text-xs text-emerald-400 font-normal">+18% boost</span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-500"
                        style={{ width: `${focusScore}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                    <div className="text-[11px] font-mono text-slate-400">COGNITIVE LOAD</div>
                    <div className="text-2xl font-bold font-mono text-indigo-300">
                      OPTIMAL
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">
                      ZERO DISTRACTION LEAK
                    </div>
                  </div>
                </div>

                {/* Interactive Mode Toggles */}
                <div className="space-y-2">
                  <div className="text-xs font-mono text-slate-400">SELECT ENVIRONMENT PROTOCOL:</div>
                  <div className="grid grid-cols-3 gap-2">
                    {["Deep Learning", "Code Velocity", "Creative Flow"].map((mode) => (
                      <button
                        key={mode}
                        onClick={() => {
                          setActiveFocusMode(mode);
                          setFocusScore(mode === "Deep Learning" ? 94 : mode === "Code Velocity" ? 98 : 91);
                        }}
                        className={`px-3 py-2 rounded-lg text-xs font-mono transition-all text-center border ${
                          activeFocusMode === mode
                            ? "bg-indigo-600/30 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                            : "bg-white/[0.02] border-white/5 text-slate-400 hover:text-white"
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 text-[10px] font-mono text-slate-500 flex justify-between">
                  <span>PROTOCOL: {activeFocusMode.toUpperCase()}</span>
                  <span>ENCRYPTION: QUANTUM-READY</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Minimal Placeholder: MORE VENTURES TO BE ANNOUNCED */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 rounded-2xl bg-white/[0.015] border border-white/5 p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-slate-500">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono tracking-widest text-slate-500 uppercase">
                FUTURE INITIATIVES
              </div>
              <h4 className="text-lg font-bold text-slate-300">
                MORE VENTURES // TO BE ANNOUNCED
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-slate-500">
            <span>STATUS: INCUBATING</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            <span>2026 ROADMAP</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
