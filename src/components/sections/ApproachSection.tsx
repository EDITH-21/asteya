"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { APPROACH_STAGES } from "@/lib/constants";
import { Lightbulb, Code2, RefreshCw, ArrowRight, CheckCircle2 } from "lucide-react";

export const ApproachSection: React.FC = () => {
  const [activeStage, setActiveStage] = useState<number>(0);

  const getStageIcon = (idx: number) => {
    switch (idx) {
      case 0:
        return <Lightbulb className="w-5 h-5 text-indigo-400" />;
      case 1:
        return <Code2 className="w-5 h-5 text-cyan-400" />;
      case 2:
        return <RefreshCw className="w-5 h-5 text-purple-400" />;
      default:
        return null;
    }
  };

  return (
    <section
      id="approach"
      className="relative w-full py-28 sm:py-36 bg-[#07090e] border-t border-white/5 overflow-hidden"
    >
      {/* Dynamic Background Glow */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[180px] transition-all duration-700 pointer-events-none ${
          activeStage === 0
            ? "bg-indigo-600/15"
            : activeStage === 1
            ? "bg-cyan-600/15"
            : "bg-purple-600/15"
        }`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-indigo-300 font-mono text-xs tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span>02 / APPROACH</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white uppercase flex items-center justify-center flex-wrap gap-3">
            <span>IDEA</span>
            <span className="text-indigo-400">&rarr;</span>
            <span>BUILD</span>
            <span className="text-cyan-400">&rarr;</span>
            <span>EVOLVE</span>
          </h2>

          <p className="text-slate-400 text-sm sm:text-base font-normal">
            A continuous product engineering journey engineered for speed, structural resilience, and long-term scalability.
          </p>
        </div>

        {/* Interactive Step Navigation Bar */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 mb-12">
          {APPROACH_STAGES.map((stage, idx) => (
            <button
              key={stage.number}
              onClick={() => setActiveStage(idx)}
              data-cursor={`STEP ${stage.number}`}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-full font-mono text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 border ${
                activeStage === idx
                  ? "bg-white/10 border-indigo-400/50 text-white shadow-[0_0_20px_rgba(99,102,241,0.25)]"
                  : "bg-white/[0.02] border-white/5 text-slate-400 hover:text-white"
              }`}
            >
              <span>{stage.number}</span>
              <span className="font-bold">{stage.title}</span>
            </button>
          ))}
        </div>

        {/* 3 Large Interactive Stage Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
          {APPROACH_STAGES.map((stage, idx) => {
            const isActive = activeStage === idx;

            return (
              <motion.div
                key={stage.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                onClick={() => setActiveStage(idx)}
                className={`relative rounded-2xl p-8 cursor-pointer transition-all duration-500 border flex flex-col justify-between overflow-hidden ${
                  isActive
                    ? "bg-gradient-to-b from-[#111728] to-[#0a0f1d] border-indigo-500/50 shadow-[0_20px_45px_-10px_rgba(99,102,241,0.25)] scale-[1.02]"
                    : "bg-white/[0.02] border-white/5 opacity-65 hover:opacity-100 hover:border-white/20"
                }`}
              >
                {/* Connecting Laser Line on Top */}
                {isActive && (
                  <motion.div
                    layoutId="activeApproachLine"
                    className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-cyan-400 to-purple-500"
                  />
                )}

                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
                        {getStageIcon(idx)}
                      </div>
                      <span className="text-xs font-mono tracking-widest text-indigo-400 uppercase">
                        STAGE // {stage.number}
                      </span>
                    </div>
                    <span className="text-3xl font-mono font-bold text-slate-600">
                      {stage.number}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-2xl font-bold tracking-tight text-white mb-2">
                    {stage.title}
                  </h3>
                  <div className="text-sm font-medium text-indigo-300/90 mb-4">
                    {stage.subtitle}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-300 font-normal leading-relaxed mb-8">
                    {stage.description}
                  </p>
                </div>

                {/* Telemetry Metrics */}
                <div className="pt-6 border-t border-white/10 space-y-2.5">
                  {stage.metrics.map((metric, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs font-mono"
                    >
                      <span className="text-slate-500">{metric.label}</span>
                      <span className="text-slate-200 font-medium">{metric.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
