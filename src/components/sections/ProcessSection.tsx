"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Search, Compass, Code2, ShieldCheck, Rocket } from "lucide-react";

export const UNIFIED_PROCESS_STAGES = [
  {
    id: "01",
    name: "Discover & Strategy",
    summary: "Deconstructing domain requirements, analyzing user needs, and establishing architecture milestones.",
    deliverable: "Technical Blueprint & Architecture Scope",
    icon: Search,
    color: "#818cf8",
  },
  {
    id: "02",
    name: "Design & Systems",
    summary: "Crafting intuitive UX workflows, responsive design systems, and interactive component prototypes.",
    deliverable: "Design System & High-Fidelity Prototypes",
    icon: Compass,
    color: "#38bdf8",
  },
  {
    id: "03",
    name: "Precision Engineering",
    summary: "Building robust, type-safe full-stack software with modern frameworks, clean APIs, and scalable infrastructure.",
    deliverable: "Production-Grade Codebase & Services",
    icon: Code2,
    color: "#a855f7",
  },
  {
    id: "04",
    name: "Validation & QA",
    summary: "Automated end-to-end testing, security audits, accessibility compliance, and cross-device verification.",
    deliverable: "Verified Test Suite & Security Review",
    icon: ShieldCheck,
    color: "#34d399",
  },
  {
    id: "05",
    name: "Launch & Evolution",
    summary: "Structured deployment, real-time observability, and ongoing iterative improvements based on user telemetry.",
    deliverable: "Live Product & Continuous Updates",
    icon: Rocket,
    color: "#f472b6",
  },
];

export const ProcessSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 70%", "end 80%"],
  });

  // Animate transform: scaleY (GPU-accelerated, never animates height to prevent mobile reflows)
  const lineScaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      id="process"
      ref={containerRef}
      className="site-section relative w-full bg-[#07090e] border-t border-white/[0.04] overflow-hidden"
    >
      {/* Background Subtle Gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[600px] h-[300px] sm:h-[450px] bg-indigo-600/10 rounded-full blur-2xl sm:blur-[140px] pointer-events-none" />

      <div className="site-container relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-indigo-300 font-sans text-xs font-medium tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span>04 &bull; Engineering Process</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white uppercase">
            From Concept to Reality
          </h2>

          <p className="text-slate-300 text-sm sm:text-base font-normal max-w-lg mx-auto leading-relaxed">
            A structured 5-stage trajectory translating raw ideas into scalable, resilient digital systems.
          </p>
        </div>

        {/* Vertical Timeline Structure */}
        <div className="relative max-w-4xl mx-auto">
          {/* Static Background Rail Line */}
          <div className="absolute top-0 bottom-0 left-6 sm:left-1/2 -translate-x-1/2 w-0.5 bg-white/[0.08]" />

          {/* Dynamic Progress Line (Transform scaleY only — zero layout reflows) */}
          <motion.div
            style={{ scaleY: lineScaleY, originY: 0 }}
            className="hidden sm:block absolute top-0 bottom-0 left-6 sm:left-1/2 -translate-x-1/2 w-0.5 bg-gradient-to-b from-indigo-500 via-cyan-400 to-purple-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
          />

          {/* Timeline Stages */}
          <div className="space-y-8 sm:space-y-12">
            {UNIFIED_PROCESS_STAGES.map((stage, idx) => {
              const isEven = idx % 2 === 0;
              const IconComponent = stage.icon;

              return (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  className={`relative flex items-center flex-col sm:flex-row ${
                    isEven ? "sm:flex-row-reverse" : ""
                  }`}
                >
                  {/* Left / Right Content Card */}
                  <div className="w-full sm:w-1/2 pl-14 sm:pl-0 sm:px-10">
                    <div
                      className="p-6 rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.08] hover:border-indigo-500/30 transition-all text-left"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: stage.color }}
                          />
                          <span className="text-xs font-sans text-indigo-300 font-medium tracking-wide">
                            Stage {stage.id}
                          </span>
                        </div>
                        <span className="text-xs font-mono text-slate-400">
                          {idx + 1} of 5
                        </span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
                        {stage.name}
                      </h3>

                      <p className="text-sm text-slate-300 font-normal leading-relaxed mb-4">
                        {stage.summary}
                      </p>

                      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400 font-sans">
                        <span className="text-slate-400">Key Deliverable:</span>
                        <span className="text-slate-200 font-medium">{stage.deliverable}</span>
                      </div>
                    </div>
                  </div>

                  {/* Center Node Pin */}
                  <div className="absolute left-6 sm:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#07090e] border-2 border-indigo-400/80 flex items-center justify-center shadow-[0_0_12px_rgba(99,102,241,0.4)] z-10">
                    <IconComponent strokeWidth={1.75} className="w-4 h-4 text-cyan-300" />
                  </div>

                  {/* Empty Spacer Column for Desktop */}
                  <div className="hidden sm:block sm:w-1/2" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
