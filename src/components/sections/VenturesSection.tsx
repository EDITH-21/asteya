"use client";

import React from "react";
import { motion } from "framer-motion";
import { Clock, ExternalLink } from "lucide-react";
import type { Venture } from "@/lib/server/content-types";
import { SafeMarkdown } from "@/components/ui/SafeMarkdown";

interface VenturesSectionProps {
  ventures?: Venture[];
}

export const VenturesSection: React.FC<VenturesSectionProps> = ({ ventures = [] }) => {
  // If no published ventures, completely hide the section (no empty container or blank space)
  if (!ventures || ventures.length === 0) {
    return null;
  }

  const featuredVenture = ventures.find((v) => v.featured) || ventures[0];
  const otherVentures = featuredVenture
    ? ventures.filter((v) => v.id !== featuredVenture.id)
    : [];

  const hasStats = Boolean(
    featuredVenture && featuredVenture.stats && featuredVenture.stats.length > 0
  );

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Live":
        return {
          dotBg: "bg-emerald-500",
          pingBg: "bg-emerald-400",
          badgeClass: "bg-emerald-500/10 border-emerald-400/30 text-emerald-300",
          indicatorColor: "bg-emerald-400",
        };
      case "In development":
        return {
          dotBg: "bg-cyan-500",
          pingBg: "bg-cyan-400",
          badgeClass: "bg-cyan-500/10 border-cyan-400/30 text-cyan-300",
          indicatorColor: "bg-cyan-400",
        };
      default: // Coming soon
        return {
          dotBg: "bg-purple-500",
          pingBg: "bg-purple-400",
          badgeClass: "bg-purple-500/10 border-purple-400/30 text-purple-300",
          indicatorColor: "bg-purple-400",
        };
    }
  };

  const statusStyle = getStatusStyles(featuredVenture.status);

  return (
    <section
      id="ventures"
      className="site-section relative w-full bg-[#05070b] border-t border-white/[0.04] overflow-hidden"
    >
      {/* Ambient Lighting */}
      <div className="absolute top-1/4 left-1/4 w-[340px] sm:w-[600px] h-[300px] sm:h-[400px] bg-indigo-600/10 rounded-full blur-2xl sm:blur-[120px] pointer-events-none" />
      <div className="hidden sm:block absolute bottom-1/4 right-1/4 w-[500px] h-[400px] bg-cyan-600/10 rounded-full blur-2xl sm:blur-[120px] pointer-events-none" />

      <div className="site-container">
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

        {/* Featured Venture: Dynamic Spotlight */}
        {featuredVenture && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative rounded-3xl bg-gradient-to-b from-white/[0.05] via-[#0b101d] to-[#070a14] border border-white/[0.12] p-6 sm:p-8 lg:p-10 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
          >
            {/* Subtle Corner Glow */}
            <div className="absolute -top-32 -right-32 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

            <div
              className={
                hasStats
                  ? "grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center"
                  : "max-w-3xl space-y-6"
              }
            >
              {/* Main Info Column */}
              <div className={hasStats ? "lg:col-span-6 space-y-6" : "space-y-6"}>
                {/* Status Badge */}
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-sans font-medium border ${statusStyle.badgeClass}`}
                >
                  <span className="relative flex h-2 w-2">
                    <span
                      className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-70 ${statusStyle.pingBg}`}
                    />
                    <span
                      className={`relative inline-flex rounded-full h-2 w-2 ${statusStyle.dotBg}`}
                    />
                  </span>
                  <span>{featuredVenture.status} &bull; Venture Spotlight</span>
                </div>

                {/* Title & Tagline */}
                <div>
                  <h3 className="text-3xl sm:text-5xl font-bold tracking-tight text-white uppercase">
                    {featuredVenture.name}
                  </h3>
                  <p className="text-lg sm:text-xl font-medium text-indigo-300 mt-1">
                    {featuredVenture.tagline}
                  </p>
                </div>

                {/* Description */}
                <div className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
                  <SafeMarkdown content={featuredVenture.description} />
                </div>

                {/* Venture Feature Highlights / Tags */}
                {featuredVenture.tags && featuredVenture.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {featuredVenture.tags.map((tag, idx) => (
                      <div
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.03] border border-white/[0.08] text-xs text-slate-300"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        <span>{tag}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Optional External Link & Stage Indicator */}
                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-sans text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${statusStyle.indicatorColor}`}
                    />
                    <span>{featuredVenture.status}</span>
                  </span>
                  <span>&bull;</span>
                  <span>{featuredVenture.label || "Aadrut Venture Labs"}</span>

                  {featuredVenture.link && (
                    <>
                      <span>&bull;</span>
                      <a
                        href={featuredVenture.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors underline underline-offset-2"
                      >
                        <span>Visit Venture</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </>
                  )}
                </div>
              </div>

              {/* Decorative Architecture Mock Panel: Rendered ONLY if stats are present */}
              {hasStats && (
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
                          {featuredVenture.name} Systems Architecture
                        </span>
                      </div>
                      <div
                        className={`text-[11px] font-sans px-2.5 py-0.5 rounded-full border ${statusStyle.badgeClass}`}
                      >
                        {featuredVenture.status}
                      </div>
                    </div>

                    {/* Session Card */}
                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Clock
                            strokeWidth={1.75}
                            className="w-3.5 h-3.5 text-indigo-400"
                          />
                          <span>Execution Pipeline</span>
                        </span>
                        <span className="font-mono text-slate-300">
                          Continuous Integration
                        </span>
                      </div>

                      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full w-3/4" />
                      </div>

                      <div className="flex justify-between items-center text-xs pt-1">
                        <span className="text-slate-300 font-medium truncate pr-2">
                          {featuredVenture.tagline}
                        </span>
                        <span className="text-slate-400 text-[11px] font-mono shrink-0">
                          {featuredVenture.status}
                        </span>
                      </div>
                    </div>

                    {/* Dynamic Stats Grid */}
                    {featuredVenture.stats && featuredVenture.stats.length > 0 && (
                      <div
                        className={`grid grid-cols-${Math.min(
                          2,
                          featuredVenture.stats.length
                        )} gap-3 text-xs`}
                      >
                        {featuredVenture.stats.map((stat, sIdx) => (
                          <div
                            key={sIdx}
                            className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1"
                          >
                            <div className="text-slate-400 text-[11px]">{stat.label}</div>
                            <div className="text-base font-semibold text-white">
                              {stat.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Subtle footer info */}
                    <div className="pt-2 text-[11px] font-sans text-slate-400 flex justify-between items-center border-t border-white/[0.06]">
                      <span>{featuredVenture.label || "Aadrut Venture Labs"}</span>
                      <span>{featuredVenture.status}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Other Ventures (Rendered ONLY from DB if published items exist) */}
        {otherVentures.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {otherVentures.map((v) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-sm flex flex-col justify-between hover:border-indigo-500/30 transition-colors group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-sans border ${
                        getStatusStyles(v.status).badgeClass
                      }`}
                    >
                      {v.status}
                    </span>

                    {v.link && (
                      <a
                        href={v.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-white/[0.03] text-slate-400 hover:text-white transition-colors"
                        aria-label={`Visit ${v.name}`}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {v.name}
                    </h4>
                    <p className="text-xs font-medium text-indigo-400 mt-1">{v.tagline}</p>
                  </div>

                  <div className="text-xs text-slate-400 leading-relaxed font-normal">
                    <SafeMarkdown content={v.description} />
                  </div>

                  {v.tags && v.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {v.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06] text-[11px] text-slate-400"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Hide stats block when empty */}
                {v.stats && v.stats.length > 0 && (
                  <div className="pt-4 mt-4 border-t border-white/[0.06] grid grid-cols-2 gap-2">
                    {v.stats.map((s, idx) => (
                      <div key={idx} className="text-xs">
                        <div className="text-[10px] text-slate-400">{s.label}</div>
                        <div className="font-semibold text-slate-200">{s.value}</div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
