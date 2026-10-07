"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TECH_DOMAINS } from "@/lib/constants";
import { Cpu, Terminal, Shield, Sparkles, Orbit } from "lucide-react";

export const TechnologySection: React.FC = () => {
  const [selectedTech, setSelectedTech] = useState<string>("ai");
  const [rotationAngle, setRotationAngle] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotationAngle((prev) => (prev + 0.3) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const activeDomain = TECH_DOMAINS.find((t) => t.id === selectedTech) || TECH_DOMAINS[0];

  return (
    <section
      id="technology"
      className="relative w-full py-28 sm:py-36 bg-[#07090e] border-t border-white/5 overflow-hidden"
    >
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 right-10 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-indigo-300 font-mono text-xs tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span>TECHNOLOGY FOUNDATION</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white uppercase">
            Built for the Future.
          </h2>

          <p className="text-slate-300 text-sm sm:text-base font-normal">
            An advanced technological stack combining machine intelligence, distributed cloud infrastructure, and human-centric design.
          </p>
        </div>

        {/* Interactive Holographic Orbit System */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Orbital Visual Sphere */}
          <div className="lg:col-span-7 relative flex items-center justify-center min-h-[420px] sm:min-h-[500px]">
            {/* Outer Orbit Ring */}
            <div className="absolute w-[360px] sm:w-[440px] h-[360px] sm:h-[440px] rounded-full border border-white/10 border-dashed animate-[spin_60s_linear_infinite]" />
            
            {/* Middle Orbit Ring */}
            <div className="absolute w-[260px] sm:w-[320px] h-[260px] sm:h-[320px] rounded-full border border-indigo-500/20" />

            {/* Inner Core */}
            <div className="relative z-10 w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-indigo-900/80 via-purple-900/60 to-cyan-900/60 border border-indigo-400/40 backdrop-blur-xl flex flex-col items-center justify-center text-center p-2 shadow-[0_0_50px_rgba(99,102,241,0.35)]">
              <Cpu className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-300 mb-1 animate-pulse" />
              <div className="text-[10px] sm:text-xs font-mono font-bold tracking-widest text-white uppercase">
                ASTEYA
              </div>
              <div className="text-[8px] sm:text-[9px] font-mono text-indigo-300/70">
                CORE SYSTEM
              </div>
            </div>

            {/* Orbiting Tech Keywords / Nodes */}
            {TECH_DOMAINS.map((domain, index) => {
              const count = TECH_DOMAINS.length;
              const angle = ((index / count) * 360 + rotationAngle) * (Math.PI / 180);
              const radius = typeof window !== "undefined" && window.innerWidth < 640 ? 140 : 185;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * (radius * 0.85);
              const isSelected = selectedTech === domain.id;

              return (
                <button
                  key={domain.id}
                  onClick={() => setSelectedTech(domain.id)}
                  style={{
                    transform: `translate(${x}px, ${y}px)`,
                  }}
                  data-cursor={domain.label}
                  className={`absolute z-20 px-3 py-1.5 rounded-full font-mono text-[11px] sm:text-xs tracking-wider uppercase transition-all duration-300 border flex items-center gap-1.5 shadow-lg ${
                    isSelected
                      ? "bg-white text-black font-bold border-white scale-110 shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                      : "bg-[#0a0f1d]/90 text-slate-300 border-white/10 hover:border-indigo-400 hover:text-white"
                  }`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: domain.color }}
                  />
                  <span>{domain.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right: Selected Domain Deep-Dive Inspector */}
          <div className="lg:col-span-5">
            <motion.div
              key={activeDomain.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl bg-white/[0.03] border border-white/10 p-8 backdrop-blur-xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: activeDomain.color }}
                  />
                  <span className="text-xs font-mono tracking-widest text-slate-400 uppercase">
                    DOMAIN // {activeDomain.id.toUpperCase()}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                  STANDARD: 2026
                </div>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
                  {activeDomain.label}
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed font-normal">
                  {activeDomain.desc}
                </p>
              </div>

              {/* Technical Specifications */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2 font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Architecture</span>
                  <span className="text-white">Edge-Distributed & Serverless</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>State Management</span>
                  <span className="text-white">Immutable Real-time Sync</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Security Layer</span>
                  <span className="text-emerald-400">Zero-Trust Verified</span>
                </div>
              </div>

              {/* Quick Select Buttons */}
              <div className="pt-2">
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">
                  Click to Inspect Domain
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {TECH_DOMAINS.map((domain) => (
                    <button
                      key={domain.id}
                      onClick={() => setSelectedTech(domain.id)}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-mono transition-colors ${
                        selectedTech === domain.id
                          ? "bg-indigo-500 text-white font-bold"
                          : "bg-white/[0.04] text-slate-400 hover:text-white"
                      }`}
                    >
                      {domain.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
