"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { TECH_DOMAINS, type TechDomainTheme } from "@/lib/constants";
import { Check } from "lucide-react";

const getThemeClasses = (theme: TechDomainTheme = "indigo") => {
  switch (theme) {
    case "cyan":
      return {
        selectedBtn: "bg-white/[0.08] border-cyan-400/50 shadow-[0_4px_20px_rgba(6,182,212,0.18)]",
        checkIcon: "text-cyan-400",
        panelBorder: "border-cyan-500/20 shadow-[0_8px_32px_rgba(6,182,212,0.08)]",
        badge: "text-cyan-300 bg-cyan-500/10 border-cyan-500/20",
        philosophyAccent: "text-cyan-300",
        footerAccent: "text-cyan-400",
      };
    case "violet":
      return {
        selectedBtn: "bg-white/[0.08] border-violet-400/50 shadow-[0_4px_20px_rgba(139,92,246,0.18)]",
        checkIcon: "text-violet-400",
        panelBorder: "border-violet-500/20 shadow-[0_8px_32px_rgba(139,92,246,0.08)]",
        badge: "text-violet-300 bg-violet-500/10 border-violet-500/20",
        philosophyAccent: "text-violet-300",
        footerAccent: "text-violet-400",
      };
    case "indigo":
    default:
      return {
        selectedBtn: "bg-white/[0.08] border-indigo-400/50 shadow-[0_4px_20px_rgba(99,102,241,0.18)]",
        checkIcon: "text-indigo-400",
        panelBorder: "border-indigo-500/20 shadow-[0_8px_32px_rgba(99,102,241,0.08)]",
        badge: "text-indigo-300 bg-indigo-500/10 border-indigo-500/20",
        philosophyAccent: "text-indigo-300",
        footerAccent: "text-indigo-400",
      };
  }
};

export const TechnologySection: React.FC = () => {
  const [selectedTech, setSelectedTech] = useState<string>("ai");

  const activeDomain = TECH_DOMAINS.find((t) => t.id === selectedTech) || TECH_DOMAINS[0];
  const activeTheme = getThemeClasses(activeDomain.theme);

  return (
    <section
      id="technology"
      className="site-section relative w-full bg-[#07090e] border-t border-white/[0.04] overflow-hidden"
    >
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 right-10 w-[340px] sm:w-[500px] h-[340px] sm:h-[500px] bg-cyan-600/10 rounded-full blur-2xl sm:blur-[120px] pointer-events-none" />

      <div className="site-container">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-indigo-300 font-sans text-xs font-medium tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span>05 &bull; Technology Foundation</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white uppercase">
            Built for the Future.
          </h2>

          <p className="text-slate-300 text-sm sm:text-base font-normal max-w-xl mx-auto leading-relaxed">
            An advanced technological stack combining machine intelligence, distributed cloud infrastructure, and human-centric design.
          </p>
        </div>

        {/* Interactive Domain Explorer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left: Domain Selector Grid / Interactive Matrix */}
          <div className="lg:col-span-6 space-y-3">
            <div className="text-xs font-sans text-slate-400 font-medium mb-1">
              Select a core domain to inspect:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {TECH_DOMAINS.map((domain) => {
                const isSelected = selectedTech === domain.id;
                const itemTheme = getThemeClasses(domain.theme);
                return (
                  <button
                    key={domain.id}
                    onClick={() => setSelectedTech(domain.id)}
                    className={`p-4 rounded-xl text-left transition-all duration-200 border flex items-center justify-between group ${
                      isSelected
                        ? itemTheme.selectedBtn
                        : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/15"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: domain.color }}
                      />
                      <div>
                        <div className={`text-sm font-semibold tracking-wide ${isSelected ? "text-white" : "text-slate-300 group-hover:text-white"}`}>
                          {domain.label}
                        </div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">
                          {domain.desc}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <Check strokeWidth={2} className={`w-4 h-4 shrink-0 ml-2 ${itemTheme.checkIcon}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Selected Domain Inspector Panel */}
          <div className="lg:col-span-6">
            <motion.div
              key={activeDomain.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className={`rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border p-7 sm:p-8 backdrop-blur-xl space-y-6 shadow-xl ${activeTheme.panelBorder}`}
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: activeDomain.color }}
                  />
                  <span className="text-xs font-sans tracking-wide text-slate-300 font-medium">
                    Domain Focus &bull; {activeDomain.label}
                  </span>
                </div>
                <div className={`text-[11px] font-sans px-2.5 py-1 rounded-full border ${activeTheme.badge}`}>
                  Production Ready
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  {activeDomain.label}
                </h3>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
                  {activeDomain.desc}
                </p>
              </div>

              {/* Architectural Strengths */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] space-y-2.5 text-xs font-sans">
                <div className="flex justify-between items-center text-slate-400 pb-1.5 border-b border-white/[0.04]">
                  <span>System Architecture</span>
                  <span className="text-slate-200 font-medium">Modern Edge &amp; Cloud Infrastructure</span>
                </div>
                <div className="flex justify-between items-center text-slate-400 pb-1.5 border-b border-white/[0.04]">
                  <span>Reliability &amp; Scale</span>
                  <span className="text-slate-200 font-medium">High Availability &amp; Low Latency</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Development Philosophy</span>
                  <span className={`font-medium ${activeTheme.philosophyAccent}`}>Type-Safe, Tested, Deterministic</span>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between text-xs text-slate-400">
                <span>Integrated into all Aadrut solutions</span>
                <span className={`font-medium ${activeTheme.footerAccent}`}>Built for tomorrow</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
