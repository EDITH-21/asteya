"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { Cpu, Zap, ArrowRight } from "lucide-react";
import type { AboutContent } from "@/lib/server/content-types";

interface AboutSectionProps {
  about?: AboutContent;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ about }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.15 });

  const headline = about?.headline || "Technology should move humanity forward.";
  const story =
    about?.story ||
    "Aadrut exists to transform ideas into meaningful digital experiences, products, and technology ventures. We combine engineering, design, automation, and emerging technologies to build solutions that are useful today and ready for tomorrow.";
  const values = about?.values && about.values.length > 0 ? about.values.slice(0, 2) : [
    {
      title: "Precision Engineering",
      text: "High-speed, scalable, modern architectural foundations built for longevity.",
    },
    {
      title: "Intelligent Velocity",
      text: "Autonomous workflows and rapid continuous product deployment loops.",
    },
  ];

  // Interactive Digital Architecture Canvas (paused when off-screen or on mobile)
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    if (window.innerWidth < 768 || window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number = 0;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 500);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 500);

    const onResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener("resize", onResize);

    // Dynamic Nodes & Connecting Graph
    const nodeCount = 18;
    const nodes: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      baseAlpha: number;
    }[] = [];

    const colors = [
      "rgba(99, 102, 241, ", // indigo
      "rgba(6, 182, 212, ",   // cyan
      "rgba(139, 92, 246, ",  // violet
    ];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2 + 1.5,
        color: colors[i % colors.length],
        baseAlpha: Math.random() * 0.5 + 0.3,
      });
    }

    let mouseX = -1000;
    let mouseY = -1000;

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };
    const onMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle grid lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 1;
      const step = 40;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Update and connect nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        // Subtle mouse repulsion
        const dx = mouseX - node.x;
        const dy = mouseY - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          const force = (100 - dist) / 100;
          node.x -= (dx / dist) * force * 1.5;
          node.y -= (dy / dist) * force * 1.5;
        }

        // Connect with nearby nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const dist2 = Math.hypot(node.x - other.x, node.y - other.y);
          if (dist2 < 120) {
            const alpha = (1 - dist2 / 120) * 0.25;
            ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        }

        // Draw node
        ctx.fillStyle = `${node.color}${node.baseAlpha})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <section
      id="about"
      ref={containerRef}
      className="site-section relative w-full bg-[#05070b] overflow-hidden"
    >
      {/* Background Lighting Gradients */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-72 sm:w-96 h-72 sm:h-96 bg-indigo-600/10 rounded-full blur-2xl sm:blur-[120px] pointer-events-none" />
      <div className="hidden sm:block absolute top-1/3 right-10 w-80 h-80 bg-cyan-600/10 rounded-full blur-2xl sm:blur-[140px] pointer-events-none" />

      <div className="site-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Brand Statement & Teaser */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-indigo-300 font-sans text-xs font-medium tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span>01 &bull; Purpose &amp; Philosophy</span>
            </div>

            <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white uppercase leading-[1.08]">
              {headline}
            </h2>

            <p className="text-slate-300 text-base sm:text-lg font-normal leading-relaxed max-w-2xl">
              {story}
            </p>

            {/* Core Values Teaser */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {values.map((v, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5"
                >
                  <div className="flex items-center gap-2 text-indigo-300 font-sans text-sm font-semibold">
                    {i % 2 === 0 ? (
                      <Cpu strokeWidth={1.75} className="w-4 h-4 text-indigo-400" />
                    ) : (
                      <Zap strokeWidth={1.75} className="w-4 h-4 text-cyan-400" />
                    )}
                    <span>{v.title}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{v.text}</p>
                </div>
              ))}
            </div>

            {/* Teaser Action Link to Dedicated /about Page */}
            <div className="pt-2">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-indigo-400/40 text-xs sm:text-sm font-semibold text-white transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                <span>Learn more about Aadrut</span>
                <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>

          {/* Right Column: Abstract Digital Architecture Visual System */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative"
          >
            <div className="relative w-full aspect-square max-w-[460px] mx-auto rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.08] backdrop-blur-xl p-4 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              {/* Header Label */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-xs font-sans text-slate-400 z-10">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span className="font-medium text-slate-300">Digital Architecture Mesh</span>
                </div>
                <span className="text-[11px] text-slate-400">Interactive topology</span>
              </div>

              {/* Dynamic Interactive Canvas (hidden on mobile) */}
              <canvas
                ref={canvasRef}
                className="hidden md:block w-full h-full cursor-crosshair relative z-0"
              />

              {/* Mobile Fallback: Elegant Static Radial Grid */}
              <div className="md:hidden w-full h-full flex items-center justify-center relative">
                <div className="w-48 h-48 rounded-full border border-indigo-500/20 flex items-center justify-center animate-pulse">
                  <div className="w-32 h-32 rounded-full border border-dashed border-cyan-400/25 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-white/10 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-indigo-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Subtle Note */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[11px] font-sans text-slate-400 z-10 border-t border-white/[0.06] pt-2">
                <span>Aadrut Systems Architecture</span>
                <span>Modular Core</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
