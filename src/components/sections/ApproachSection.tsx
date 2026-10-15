"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { APPROACH_STAGES } from "@/lib/constants";
import { Lightbulb, Code2, RefreshCw, ArrowRight } from "lucide-react";

export const ApproachSection: React.FC = () => {
  const [activeStage, setActiveStage] = useState<number>(0);

  const getStageIcon = (idx: number) => {
    switch (idx) {
      case 0:
        return <Lightbulb strokeWidth={1.75} className="w-5 h-5 text-indigo-400" />;
      case 1:
        return <Code2 strokeWidth={1.75} className="w-5 h-5 text-cyan-400" />;
      case 2:
        return <RefreshCw strokeWidth={1.75} className="w-5 h-5 text-purple-400" />;
      default:
        return null;
    }
  };

  return (
    <section
      id="approach"
      className="relative w-full py-24 sm:py-32 bg-[#07090e] border-t border-white/[0.08] overflow-hidden scroll-mt-24"
    >
      {/* Dynamic Background Glow */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[380px] rounded-full blur-[170px] transition-all duration-700 pointer-events-none ${
          activeStage === 0
            ? "bg-indigo-600/12"
            : activeStage === 1
            ? "bg-cyan-600/12"
            : "bg-purple-600/12"
        }`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-indigo-300 font-sans text-xs font-medium tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span>02 &bull; Our Methodology</span>
          </div>

          {/* Heading with bespoke human-designed directional arrows */}
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white uppercase flex items-center justify-center flex-wrap gap-2.5 sm:gap-4">
            <span>Idea</span>
            <ArrowRight strokeWidth={1.75} className="w-5 h-5 sm:w-8 sm:h-8 text-indigo-400 inline-block shrink-0" />
            <span>Build</span>
            <ArrowRight strokeWidth={1.75} className="w-5 h-5 sm:w-8 sm:h-8 text-cyan-400 inline-block shrink-0" />
            <span>Evolve</span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base font-normal max-w-xl mx-auto leading-relaxed">
            A continuous product engineering journey engineered for speed, structural resilience, and long-term scalability.
          </p>
        </div>

        {/* Interactive Step Navigation Bar */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-10">
          {APPROACH_STAGES.map((stage, idx) => (
            <button
              key={stage.number}
              onClick={() => setActiveStage(idx)}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full font-sans text-xs sm:text-sm tracking-normal transition-all duration-200 border ${
                activeStage === idx
                  ? "bg-white/10 border-indigo-400/50 text-white font-medium shadow-[0_0_16px_rgba(99,102,241,0.2)]"
                  : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-white"
              }`}
            >
              <span className="font-mono text-xs text-indigo-300">{stage.number}</span>
              <span>{stage.title}</span>
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
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                onClick={() => setActiveStage(idx)}
                className={`relative rounded-2xl p-7 sm:p-8 cursor-pointer transition-all duration-300 border flex flex-col justify-between overflow-hidden ${
                  isActive
                    ? "bg-gradient-to-b from-[#111728] to-[#0a0f1d] border-indigo-500/40 shadow-[0_16px_40px_-10px_rgba(99,102,241,0.2)] scale-[1.01]"
                    : "bg-white/[0.02] border-white/[0.06] opacity-75 hover:opacity-100 hover:border-white/15"
                }`}
              >
                {/* Connecting Laser Line on Top */}
                {isActive && (
                  <motion.div
                    layoutId="activeApproachLine"
                    className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-cyan-400 to-purple-500"
                  />
                )}

                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
                        {getStageIcon(idx)}
                      </div>
                      <span className="text-xs font-sans font-medium text-indigo-300">
                        Stage {stage.number}
                      </span>
                    </div>
                    <span className="text-2xl font-mono font-bold text-slate-600">
                      {stage.number}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1.5">
                    {stage.title}
                  </h3>
                  <div className="text-sm font-medium text-indigo-300/90 mb-4">
                    {stage.subtitle}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-300 font-normal leading-relaxed mb-6">
                    {stage.description}
                  </p>
                </div>

                {/* Milestone Details */}
                <div className="pt-5 border-t border-white/[0.08] space-y-2">
                  {stage.metrics.map((metric, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs font-sans"
                    >
                      <span className="text-slate-400">{metric.label}</span>
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
