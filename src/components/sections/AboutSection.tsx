"use client";

import React, { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Cpu, Zap } from "lucide-react";

export const AboutSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.15 });

  // Interactive Digital Architecture Canvas (paused when off-screen or on mobile)
  useEffect(() => {
    // Check reduced motion or small mobile screens
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
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth || 500;
      height = canvas.height = canvas.parentElement.clientHeight || 450;
    };

    window.addEventListener("resize", handleResize, { passive: true });

    interface Node {
      x: number;
      y: number;
      targetX: number;
      targetY: number;
      vx: number;
      vy: number;
      radius: number;
      layer: number;
      pulse: number;
    }

    const nodes: Node[] = [];
    const layers = 3;
    const nodesPerLayer = 8; // Restrained node count for high FPS

    for (let l = 0; l < layers; l++) {
      for (let i = 0; i < nodesPerLayer; i++) {
        const angle = (i / nodesPerLayer) * Math.PI * 2 + l * 0.5;
        const radiusDist = 55 + l * 50;
        const cx = width / 2 + Math.cos(angle) * radiusDist;
        const cy = height / 2 + Math.sin(angle) * (radiusDist * 0.7);

        nodes.push({
          x: cx + (Math.random() - 0.5) * 30,
          y: cy + (Math.random() - 0.5) * 30,
          targetX: cx,
          targetY: cy,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          radius: l === 0 ? 3 : l === 1 ? 2.2 : 1.6,
          layer: l,
          pulse: Math.random() * Math.PI * 2,
        });
      }
    }

    let pointer = { x: width / 2, y: height / 2, active: false };
    const handlePointerMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };
    const handlePointerLeave = () => {
      pointer.active = false;
    };

    canvas.addEventListener("mousemove", handlePointerMove, { passive: true });
    canvas.addEventListener("mouseleave", handlePointerLeave);

    let frame = 0;
    const draw = () => {
      if (!isInView || document.hidden) {
        animId = 0;
        return;
      }

      frame++;
      ctx.clearRect(0, 0, width, height);

      // Central glowing core
      const coreGrad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        160
      );
      coreGrad.addColorStop(0, "rgba(99, 102, 241, 0.12)");
      coreGrad.addColorStop(0.5, "rgba(6, 182, 212, 0.03)");
      coreGrad.addColorStop(1, "transparent");
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 160, 0, Math.PI * 2);
      ctx.fill();

      // Update and draw connections
      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];
        n1.pulse += 0.025;

        n1.x += n1.vx;
        n1.y += n1.vy;

        const dxTarget = n1.targetX - n1.x;
        const dyTarget = n1.targetY - n1.y;
        n1.x += dxTarget * 0.02;
        n1.y += dyTarget * 0.02;

        if (pointer.active) {
          const pdx = pointer.x - n1.x;
          const pdy = pointer.y - n1.y;
          const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
          if (pdist < 90) {
            n1.x -= (pdx / pdist) * 1.5;
            n1.y -= (pdy / pdist) * 1.5;
          }
        }

        // Connect to other nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 100) {
            const alpha = (1 - dist / 100) * (n1.layer === n2.layer ? 0.25 : 0.12);
            ctx.strokeStyle =
              n1.layer === 0
                ? `rgba(129, 140, 248, ${alpha})`
                : n1.layer === 1
                ? `rgba(34, 211, 238, ${alpha})`
                : `rgba(168, 85, 247, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();

            // Subtle data impulse
            if ((frame + i * 7) % 200 < 20) {
              const progress = ((frame + i * 7) % 200) / 20;
              const px = n1.x + (n2.x - n1.x) * progress;
              const py = n1.y + (n2.y - n1.y) * progress;
              ctx.fillStyle = "#ffffff";
              ctx.beginPath();
              ctx.arc(px, py, 1.2, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }

        // Draw node
        const currentRadius = n1.radius + Math.sin(n1.pulse) * 0.4;
        ctx.fillStyle = n1.layer === 0 ? "#818cf8" : n1.layer === 1 ? "#38bdf8" : "#c084fc";
        ctx.beginPath();
        ctx.arc(n1.x, n1.y, Math.max(1, currentRadius), 0, Math.PI * 2);
        ctx.fill();
      }

      // Central reference ring
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 64, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      animId = requestAnimationFrame(draw);
    };

    if (isInView) {
      animId = requestAnimationFrame(draw);
    }

    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(animId);
        animId = 0;
      } else if (isInView && !animId) {
        animId = requestAnimationFrame(draw);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousemove", handlePointerMove);
      canvas.removeEventListener("mouseleave", handlePointerLeave);
    };
  }, [isInView]);

  return (
    <section
      id="about"
      ref={containerRef}
      className="site-section relative w-full bg-[#07090e] border-t border-white/[0.04] overflow-hidden"
    >
      {/* Background Ambient Glow (optimized) */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-72 sm:w-96 h-72 sm:h-96 bg-indigo-600/10 rounded-full blur-2xl sm:blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Editorial Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-7"
          >
            {/* Section Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-indigo-300 font-sans text-xs font-medium tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span>01 &bull; About Asteya</span>
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.12]">
              Technology should move humanity{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-200 to-cyan-300">
                forward.
              </span>
            </h2>

            {/* Paragraph */}
            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl">
              Asteya exists to transform ideas into meaningful digital experiences, products, and technology ventures. We combine engineering, design, automation, and emerging technologies to build solutions that are useful today and ready for tomorrow.
            </p>

            {/* Value Pillars List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-sm space-y-1.5 hover:border-indigo-500/25 transition-colors">
                <div className="flex items-center gap-2 text-indigo-300 font-sans text-sm font-semibold">
                  <Cpu strokeWidth={1.75} className="w-4 h-4 text-indigo-400" />
                  <span>Precision Engineering</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  High-speed, scalable, modern architectural foundations built for longevity.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-sm space-y-1.5 hover:border-cyan-500/25 transition-colors">
                <div className="flex items-center gap-2 text-cyan-300 font-sans text-sm font-semibold">
                  <Zap strokeWidth={1.75} className="w-4 h-4 text-cyan-400" />
                  <span>Intelligent Velocity</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Autonomous workflows and rapid continuous product deployment loops.
                </p>
              </div>
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
                <span className="text-[11px] text-slate-500">Interactive topology</span>
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
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[11px] font-sans text-slate-500 z-10 border-t border-white/[0.06] pt-2">
                <span>Asteya Systems Architecture</span>
                <span>Modular Core</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
