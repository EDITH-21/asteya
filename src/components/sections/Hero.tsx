"use client";

import React, { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { AsteyaLogo } from "../ui/AsteyaLogo";
import { ArrowDown, ArrowRight } from "lucide-react";

interface HeroProps {
  onOpenContact?: () => void;
}

export const Hero: React.FC<HeroProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Parallax motion values (calm and subtle)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 180 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const textParallaxX = useTransform(smoothX, [-0.5, 0.5], [-8, 8]);
  const textParallaxY = useTransform(smoothY, [-0.5, 0.5], [-6, 6]);
  const glowParallaxX = useTransform(smoothX, [-0.5, 0.5], [-24, 24]);
  const glowParallaxY = useTransform(smoothY, [-0.5, 0.5], [-24, 24]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = e.clientX / innerWidth - 0.5;
      const y = e.clientY / innerHeight - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // Canvas particle field simulation (restrained & fluid)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    const particleCount = Math.min(Math.floor(width / 24), 55);
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
      baseAlpha: number;
    }> = [];

    for (let i = 0; i < particleCount; i++) {
      const alpha = Math.random() * 0.35 + 0.1;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        radius: Math.random() * 1.4 + 0.6,
        alpha,
        baseAlpha: alpha,
      });
    }

    let cursor = { x: width / 2, y: height / 2 };
    const handleCanvasMouse = (e: MouseEvent) => {
      cursor = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleCanvasMouse, { passive: true });

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Subtle atmospheric grid
      const gridSize = 64;
      const offsetX = (cursor.x - width / 2) * 0.02;
      const offsetY = (cursor.y - height / 2) * 0.02;

      ctx.strokeStyle = "rgba(255, 255, 255, 0.018)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = offsetX % gridSize; x < width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = offsetY % gridSize; y < height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Draw particles & links
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        p1.x += p1.vx;
        p1.y += p1.vy;

        if (p1.x < 0) p1.x = width;
        if (p1.x > width) p1.x = 0;
        if (p1.y < 0) p1.y = height;
        if (p1.y > height) p1.y = 0;

        const dx = cursor.x - p1.x;
        const dy = cursor.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          p1.alpha = Math.min(p1.baseAlpha * 1.8, 0.7);
        } else {
          p1.alpha = p1.baseAlpha;
        }

        ctx.fillStyle = `rgba(165, 180, 252, ${p1.alpha})`;
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const cdx = p1.x - p2.x;
          const cdy = p1.y - p2.y;
          const cdist = Math.sqrt(cdx * cdx + cdy * cdy);

          if (cdist < 90) {
            const lineAlpha = (1 - cdist / 90) * 0.08;
            ctx.strokeStyle = `rgba(99, 102, 241, ${lineAlpha})`;
            ctx.lineWidth = 0.75;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleCanvasMouse);
    };
  }, []);

  const scrollToAbout = () => {
    const el = document.getElementById("about");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToServices = () => {
    const el = document.getElementById("services");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-[#05070b] pt-24 sm:pt-28 pb-16">
      {/* Background Interactive Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Luminous Ambient Glows */}
      <motion.div
        style={{ x: glowParallaxX, y: glowParallaxY }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[340px] bg-gradient-to-tr from-indigo-600/15 via-purple-600/10 to-cyan-500/10 rounded-full blur-[140px] pointer-events-none"
      />
      <motion.div
        style={{ x: glowParallaxX, y: glowParallaxY }}
        className="absolute bottom-1/4 left-1/3 w-[380px] h-[280px] bg-gradient-to-br from-cyan-500/10 via-indigo-500/08 to-transparent rounded-full blur-[120px] pointer-events-none"
      />

      {/* Main Content Container with Subtle Parallax */}
      <motion.div
        style={{ x: textParallaxX, y: textParallaxY }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center"
      >
        {/* Status Indicator */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          </span>
          <span className="text-xs font-sans tracking-wide text-slate-300 font-medium">
            Building the Future
          </span>
        </motion.div>

        {/* ASTEYA Emblem Reveal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, filter: "blur(6px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 flex flex-col items-center"
        >
          <AsteyaLogo size={52} showText={false} />
        </motion.div>

        {/* Hero Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-[5.25rem] font-bold tracking-tight text-white uppercase leading-[1.08] max-w-4xl"
        >
          Building What&apos;s{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400">
            Next.
          </span>
        </motion.h1>

        {/* Supporting Text */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55, ease: "easeOut" }}
          className="mt-6 text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl font-normal leading-relaxed text-balance"
        >
          Asteya is a technology company creating digital products, intelligent solutions, and ventures designed for the future.
        </motion.p>

        {/* Call to Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="mt-9 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto"
        >
          {/* Primary CTA */}
          <button
            onClick={scrollToAbout}
            className="w-full sm:w-auto px-7 py-3 rounded-full bg-white text-black font-semibold text-sm tracking-normal hover:bg-slate-100 transition-all duration-200 shadow-[0_0_24px_rgba(255,255,255,0.2)] hover:shadow-[0_0_32px_rgba(255,255,255,0.35)] flex items-center justify-center gap-2 group active:scale-95"
          >
            <span>Explore Asteya</span>
            <ArrowRight strokeWidth={1.75} className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </button>

          {/* Secondary CTA */}
          <button
            onClick={scrollToServices}
            className="w-full sm:w-auto px-7 py-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 hover:text-white border border-white/15 backdrop-blur-md font-semibold text-sm tracking-normal transition-all duration-200 flex items-center justify-center gap-2 group active:scale-95"
          >
            <span>View Our Work</span>
            <ArrowDown strokeWidth={1.75} className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors duration-200" />
          </button>
        </motion.div>
      </motion.div>

      {/* Scroll Down Indicator */}
      <motion.button
        onClick={scrollToAbout}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 6, 0] }}
        transition={{
          opacity: { delay: 1, duration: 0.5 },
          y: { repeat: Infinity, duration: 2.4, ease: "easeInOut" },
        }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-slate-500 hover:text-slate-300 transition-colors p-2 z-20 flex flex-col items-center gap-1.5 focus:outline-none"
        aria-label="Scroll to About section"
      >
        <span className="text-[11px] font-sans tracking-wide text-slate-400">Scroll</span>
        <ArrowDown strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400" />
      </motion.button>
    </section>
  );
};
