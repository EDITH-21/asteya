"use client";

import React from "react";
import { motion } from "framer-motion";
import { SERVICES } from "@/lib/constants";
import { Globe, Cpu, Layers, Zap, Sparkles, Compass, ArrowRight } from "lucide-react";

interface ServicesSectionProps {
  onOpenContact: () => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onOpenContact }) => {

  const getIcon = (name: string) => {
    switch (name) {
      case "Globe":
        return <Globe strokeWidth={1.75} className="w-5 h-5 text-indigo-400" />;
      case "Cpu":
        return <Cpu strokeWidth={1.75} className="w-5 h-5 text-cyan-400" />;
      case "Layers":
        return <Layers strokeWidth={1.75} className="w-5 h-5 text-fuchsia-400" />;
      case "Zap":
        return <Zap strokeWidth={1.75} className="w-5 h-5 text-violet-400" />;
      case "Sparkles":
        return <Sparkles strokeWidth={1.75} className="w-5 h-5 text-teal-400" />;
      case "Compass":
        return <Compass strokeWidth={1.75} className="w-5 h-5 text-amber-400" />;
      default:
        return <Cpu strokeWidth={1.75} className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <section
      id="services"
      className="relative w-full py-20 sm:py-28 bg-[#05070b] border-t border-white/[0.08] overflow-hidden scroll-mt-24"
    >
      {/* Background Lighting */}
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-14 gap-6">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-indigo-300 font-sans text-xs font-medium tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span>Core Capabilities</span>
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white uppercase">
              What We Build
            </h2>
          </div>
          <p className="text-slate-300 max-w-md text-sm sm:text-base font-normal leading-relaxed">
            High-precision engineering, intelligent software design, and modern digital systems built to solve fundamental challenges.
          </p>
        </div>

        {/* 6 Interactive Service Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((service, index) => {
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.5, delay: index * 0.06 }}
                onClick={onOpenContact}
                className="group relative rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.08] hover:border-indigo-500/40 p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_-12px_rgba(99,102,241,0.22)] cursor-pointer overflow-hidden"
              >
                {/* Subtle dynamic background gradient on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
                />

                <div>
                  {/* Top Bar: Number & Icon */}
                  <div className="flex items-center justify-between mb-6 relative z-10">
                    <span className="text-2xl font-mono font-bold text-slate-500 group-hover:text-indigo-300 transition-colors duration-200">
                      {service.number}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center group-hover:bg-indigo-500/10 group-hover:border-indigo-500/30 transition-colors duration-200">
                      {getIcon(service.iconName)}
                    </div>
                  </div>

                  {/* Title & Tagline */}
                  <div className="relative z-10 space-y-1 mb-3">
                    <div className="text-xs font-sans tracking-wide text-indigo-400 font-medium">
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
                <div className="relative z-10 pt-4 border-t border-white/[0.06] space-y-2.5">
                  <div className="text-[11px] font-sans text-slate-400 font-medium">
                    Key Deliverables
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {service.capabilities.map((cap, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center text-[11px] px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.06] text-slate-300 group-hover:border-indigo-500/20 transition-colors"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Section Bottom Intentional CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-6"
        >
          <div>
            <h4 className="text-base sm:text-lg font-semibold text-white">
              Have a bespoke technology requirement or platform to engineer?
            </h4>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              We collaborate with business leaders and product teams to architect scalable solutions.
            </p>
          </div>
          <button
            onClick={onOpenContact}
            className="group flex-shrink-0 inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 transition-all duration-200 active:scale-95"
          >
            <span>Discuss Your Project</span>
            <ArrowRight strokeWidth={1.75} className="w-4 h-4 text-indigo-300 transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};
