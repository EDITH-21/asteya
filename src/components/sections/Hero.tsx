"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { AsteyaLogo } from "../ui/AsteyaLogo";
import { ArrowDown, ArrowRight } from "lucide-react";

interface HeroProps {
  onOpenContact?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenContact }) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);

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
    const checkMobile = () => {
      const mobile =
        window.innerWidth < 768 ||
        window.matchMedia("(pointer: coarse)").matches ||
        window.matchMedia("(hover: none)").matches;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile, { passive: true });

    // Only attach mouse move parallax on fine pointer desktop devices
    if (!window.matchMedia("(pointer: coarse)").matches) {
      const handleMouseMove = (e: MouseEvent) => {
        const { innerWidth, innerHeight } = window;
        const x = e.clientX / innerWidth - 0.5;
        const y = e.clientY / innerHeight - 0.5;
        mouseX.set(x);
        mouseY.set(y);
      };

      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      return () => {
        window.removeEventListener("resize", checkMobile);
        window.removeEventListener("mousemove", handleMouseMove);
      };
    }

    return () => window.removeEventListener("resize", checkMobile);
  }, [mouseX, mouseY]);

  // Canvas particle field simulation (restrained, fluid, paused when hidden or on mobile)
  useEffect(() => {
    // Respect reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    // Completely disable continuous canvas loop on mobile for buttery 120Hz native scrolling
    if (window.innerWidth < 768 || window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let isVisible = true;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize, { passive: true });

    // IntersectionObserver to pause loop when scrolled out of view
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !animationFrameId) {
          animationFrameId = requestAnimationFrame(render);
        }
      },
      { threshold: 0.05 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    // VisibilityChange to pause when tab is inactive
    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = 0;
      } else if (isVisible) {
        animationFrameId = requestAnimationFrame(render);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const particleCount = Math.min(Math.floor(width / 28), 40);
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
      const alpha = Math.random() * 0.3 + 0.1;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        radius: Math.random() * 1.2 + 0.6,
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
      if (!isVisible || document.hidden) {
        animationFrameId = 0;
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Subtle atmospheric grid
      const gridSize = 72;
      const offsetX = (cursor.x - width / 2) * 0.015;
      const offsetY = (cursor.y - height / 2) * 0.015;

      ctx.strokeStyle = "rgba(255, 255, 255, 0.015)";
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
        if (dist < 120) {
          p1.alpha = Math.min(p1.baseAlpha * 1.6, 0.6);
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

          if (cdist < 85) {
            const lineAlpha = (1 - cdist / 85) * 0.07;
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

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleCanvasMouse);
    };
  }, []);

  const scrollToAbout = () => {
    const el = document.getElementById("about");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToContact = () => {
    if (onOpenContact) {
      onOpenContact();
    } else {
      const el = document.getElementById("contact");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-[100svh] flex items-center justify-center overflow-hidden bg-[#05070b] pt-24 sm:pt-28 pb-16"
    >
      {/* Background Interactive Canvas (hidden on touch/mobile for performance) */}
      <canvas
        ref={canvasRef}
        className="hidden md:block absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Luminous Ambient Glows (optimized: light blur on mobile, full blur on desktop) */}
      <motion.div
        style={isMobile ? undefined : { x: glowParallaxX, y: glowParallaxY }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] md:w-[520px] h-[240px] md:h-[340px] bg-gradient-to-tr from-indigo-600/15 via-purple-600/10 to-cyan-500/10 rounded-full blur-2xl md:blur-[120px] pointer-events-none"
      />
      <motion.div
        style={isMobile ? undefined : { x: glowParallaxX, y: glowParallaxY }}
        className="hidden sm:block absolute bottom-1/4 left-1/3 w-[300px] md:w-[380px] h-[220px] md:h-[280px] bg-gradient-to-br from-cyan-500/10 via-indigo-500/08 to-transparent rounded-full blur-2xl md:blur-[100px] pointer-events-none"
      />

      {/* Main Content Container with Subtle Parallax */}
      <motion.div
        style={isMobile ? undefined : { x: textParallaxX, y: textParallaxY }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center"
      >
        {/* Status Indicator */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
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
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 flex flex-col items-center"
        >
          <AsteyaLogo size={54} showText={false} />
        </motion.div>

        {/* Hero Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-[5.25rem] font-bold tracking-tight text-white uppercase leading-[1.08] max-w-4xl"
        >
          Building What&apos;s{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400">
            Next.
          </span>
        </motion.h1>

        {/* Supporting Text */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45, ease: "easeOut" }}
          className="mt-6 text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl font-normal leading-relaxed text-balance"
        >
          Asteya is a technology company creating digital products, intelligent solutions, and ventures designed for the future.
        </motion.p>

        {/* Call to Actions - "View Our Work" replaced with "Start a Conversation" to #contact */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-9 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto"
        >
          {/* Primary CTA */}
          <button
            onClick={scrollToAbout}
            className="w-full sm:w-auto min-h-[44px] px-7 py-3 rounded-full bg-white text-black font-semibold text-sm tracking-normal hover:bg-slate-100 transition-all duration-200 shadow-[0_0_24px_rgba(255,255,255,0.2)] hover:shadow-[0_0_32px_rgba(255,255,255,0.35)] flex items-center justify-center gap-2 group active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            <span>Explore Asteya</span>
            <ArrowRight strokeWidth={1.75} className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </button>

          {/* Secondary CTA: Replaced "View Our Work" with "Start a Conversation" */}
          <button
            onClick={scrollToContact}
            className="w-full sm:w-auto min-h-[44px] px-7 py-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 hover:text-white border border-white/15 backdrop-blur-md font-semibold text-sm tracking-normal transition-all duration-200 flex items-center justify-center gap-2 group active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            <span>Start a Conversation</span>
            <ArrowRight strokeWidth={1.75} className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors duration-200 group-hover:translate-x-0.5" />
          </button>
        </motion.div>
      </motion.div>

      {/* Scroll Down Indicator */}
      <motion.button
        onClick={scrollToAbout}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 6, 0] }}
        transition={{
          opacity: { delay: 0.8, duration: 0.5 },
          y: { repeat: Infinity, duration: 2.4, ease: "easeInOut" },
        }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-slate-500 hover:text-slate-300 transition-colors p-2 z-20 flex flex-col items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-lg min-h-[44px] min-w-[44px] justify-center"
        aria-label="Scroll to About section"
      >
        <span className="text-[11px] font-sans tracking-wide text-slate-400">Scroll</span>
        <ArrowDown strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-400" />
      </motion.button>
    </section>
  );
};
