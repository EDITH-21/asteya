"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { SERVICES, ServiceItem } from "@/lib/constants";
import { Globe, Cpu, Layers, Zap, Sparkles, Compass, ArrowUpRight, CheckCircle } from "lucide-react";

interface ServicesSectionProps {
  onOpenContact: () => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onOpenContact }) => {
  const [activeCard, setActiveCard] = useState<string | null>(null);

  const getIcon = (name: string) => {
    switch (name) {
      case "Globe":
        return <Globe className="w-6 h-6 text-indigo-400" />;
      case "Cpu":
        return <Cpu className="w-6 h-6 text-cyan-400" />;
      case "Layers":
        return <Layers className="w-6 h-6 text-fuchsia-400" />;
      case "Zap":
        return <Zap className="w-6 h-6 text-violet-400" />;
      case "Sparkles":
        return <Sparkles className="w-6 h-6 text-teal-400" />;
      case "Compass":
        return <Compass className="w-6 h-6 text-amber-400" />;
      default:
        return <Cpu className="w-6 h-6 text-indigo-400" />;
    }
  };

  return (
    <section
      id="services"
      className="relative w-full py-28 sm:py-36 bg-[#05070b] border-t border-white/5 overflow-hidden"
    >
      {/* Background Lighting */}
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-indigo-300 font-mono text-xs tracking-widest uppercase mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span>CORE CAPABILITIES</span>
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white uppercase">
              What We Build
            </h2>
          </div>
          <p className="text-slate-400 max-w-md text-sm sm:text-base font-normal leading-relaxed">
            High-precision engineering, intelligent software design, and digital systems built to solve fundamental challenges.
          </p>
        </div>

        {/* 6 Interactive Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((service, index) => {
            const isHovered = activeCard === service.id;

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
                onMouseEnter={() => setActiveCard(service.id)}
                onMouseLeave={() => setActiveCard(null)}
                data-cursor="SERVICE"
                className="group relative rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 hover:border-indigo-500/40 p-7 flex flex-col justify-between transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.2)] overflow-hidden"
              >
                {/* Dynamic Gradient Sweep on Hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`}
                />

                <div>
                  {/* Top Bar: Number & Icon */}
                  <div className="flex items-center justify-between mb-6 relative z-10">
                    <span className="text-3xl font-mono font-bold text-slate-600 group-hover:text-indigo-300 transition-colors duration-300">
                      {service.number}
                    </span>
                    <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center group-hover:bg-indigo-500/10 group-hover:border-indigo-500/30 transition-colors duration-300 shadow-inner">
                      {getIcon(service.iconName)}
                    </div>
                  </div>

                  {/* Title & Tagline */}
                  <div className="relative z-10 space-y-1 mb-4">
                    <div className="text-[11px] font-mono tracking-widest text-indigo-400 uppercase">
                      {service.tagline}
                    </div>
                    <h3 className="text-xl font-bold tracking-tight text-white group-hover:text-white transition-colors">
                      {service.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-300 font-normal leading-relaxed relative z-10 mb-6">
                    {service.description}
                  </p>
                </div>

                {/* Capabilities Badges */}
                <div className="relative z-10 pt-4 border-t border-white/5 space-y-2">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                    Key Deliverables
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {service.capabilities.map((cap, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center text-[11px] px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/5 text-slate-300 group-hover:border-indigo-500/20 transition-colors"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>

                  {/* Engage Action Link */}
                  <div className="pt-3">
                    <button
                      onClick={onOpenContact}
                      className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-indigo-400 group-hover:text-indigo-300 transition-colors"
                    >
                      <span>Deploy This Service</span>
                      <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
