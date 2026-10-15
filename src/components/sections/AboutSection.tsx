"use client";

import React, { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Cpu, Zap } from "lucide-react";

export const AboutSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.2 });

  // Interactive Digital Architecture Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 500);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || 500;
      height = canvas.height = canvas.parentElement?.clientHeight || 450;
    };

    window.addEventListener("resize", handleResize);

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
    const nodesPerLayer = 10;

    for (let l = 0; l < layers; l++) {
      for (let i = 0; i < nodesPerLayer; i++) {
        const angle = (i / nodesPerLayer) * Math.PI * 2 + l * 0.5;
        const radiusDist = 60 + l * 55;
        const cx = width / 2 + Math.cos(angle) * radiusDist;
        const cy = height / 2 + Math.sin(angle) * (radiusDist * 0.7);

        nodes.push({
          x: cx + (Math.random() - 0.5) * 35,
          y: cy + (Math.random() - 0.5) * 35,
          targetX: cx,
          targetY: cy,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          radius: l === 0 ? 3.2 : l === 1 ? 2.4 : 1.8,
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

    canvas.addEventListener("mousemove", handlePointerMove);
    canvas.addEventListener("mouseleave", handlePointerLeave);

    let frame = 0;
    const draw = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      // Central glowing core
      const coreGrad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        170
      );
      coreGrad.addColorStop(0, "rgba(99, 102, 241, 0.12)");
      coreGrad.addColorStop(0.5, "rgba(6, 182, 212, 0.04)");
      coreGrad.addColorStop(1, "transparent");
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 170, 0, Math.PI * 2);
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
          if (pdist < 100) {
            n1.x -= (pdx / pdist) * 1.8;
            n1.y -= (pdy / pdist) * 1.8;
          }
        }

        // Connect to other nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            const alpha = (1 - dist / 110) * (n1.layer === n2.layer ? 0.3 : 0.15);
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
            if ((frame + i * 7) % 200 < 25) {
              const progress = ((frame + i * 7) % 200) / 25;
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
        const currentRadius = n1.radius + Math.sin(n1.pulse) * 0.5;
        ctx.fillStyle = n1.layer === 0 ? "#818cf8" : n1.layer === 1 ? "#38bdf8" : "#c084fc";
        ctx.beginPath();
        ctx.arc(n1.x, n1.y, Math.max(1, currentRadius), 0, Math.PI * 2);
        ctx.fill();
      }

      // Central reference ring
      ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 68, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousemove", handlePointerMove);
      canvas.removeEventListener("mouseleave", handlePointerLeave);
    };
  }, []);

  return (
    <section
      id="about"
      ref={containerRef}
      className="relative w-full py-24 sm:py-32 bg-[#07090e] border-t border-white/[0.08] overflow-hidden scroll-mt-24"
    >
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Editorial Content */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -24 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
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
                  Autonomous automation and rapid continuous product deployment loops.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Abstract Digital Architecture Visual System */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
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

              {/* Dynamic Interactive Canvas */}
              <canvas
                ref={canvasRef}
                className="w-full h-full cursor-crosshair relative z-0"
              />

              {/* Bottom Subtle Note */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[11px] font-sans text-slate-500 z-10 border-t border-white/[0.06] pt-2">
                <span>Asteya Systems Architecture</span>
                <span>Self-building nodes</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
