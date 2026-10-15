"use client";

import React, { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

export const CustomCursor: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [cursorText, setCursorText] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springConfig = { damping: 30, stiffness: 320, mass: 0.4 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  const dotConfig = { damping: 40, stiffness: 850 };
  const dotX = useSpring(mouseX, dotConfig);
  const dotY = useSpring(mouseY, dotConfig);

  useEffect(() => {
    // Disable on touch devices or prefers-reduced-motion
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (isTouch || prefersReducedMotion) {
      return;
    }

    const rafId = requestAnimationFrame(() => {
      setIsEnabled(true);
      document.body.classList.add("has-custom-cursor");
    });

    const moveMouse = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest("a, button, [data-cursor], input, textarea, select, [role='button']");
      if (interactive) {
        setIsHovered(true);
        const customText = interactive.getAttribute("data-cursor");
        if (customText) {
          setCursorText(customText);
        } else {
          setCursorText("");
        }
      } else {
        setIsHovered(false);
        setCursorText("");
      }
    };

    window.addEventListener("mousemove", moveMouse);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseover", handleMouseOver);

    return () => {
      cancelAnimationFrame(rafId);
      document.body.classList.remove("has-custom-cursor");
      window.removeEventListener("mousemove", moveMouse);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseover", handleMouseOver);
    };
  }, [mouseX, mouseY]);

  if (!isEnabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {/* Outer Halo / Interactive Ring */}
      <motion.div
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width: cursorText ? 64 : isHovered ? 40 : 24,
          height: cursorText ? 64 : isHovered ? 40 : 24,
          borderColor: isHovered ? "rgba(129, 140, 248, 0.7)" : "rgba(255, 255, 255, 0.2)",
          backgroundColor: isHovered ? "rgba(99, 102, 241, 0.08)" : "rgba(255, 255, 255, 0.015)",
          scale: isClicking ? 0.88 : 1,
        }}
        transition={{ type: "spring", stiffness: 350, damping: 26 }}
        className="rounded-full border backdrop-blur-[1px] flex items-center justify-center text-center shadow-[0_0_16px_rgba(99,102,241,0.18)]"
      >
        {cursorText && (
          <span className="text-[9px] font-sans tracking-wider uppercase font-semibold text-indigo-200">
            {cursorText}
          </span>
        )}
      </motion.div>

      {/* Inner Precision Dot */}
      <motion.div
        style={{
          x: dotX,
          y: dotY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          scale: isClicking ? 1.4 : isHovered ? 0 : 1,
          opacity: isHovered ? 0 : 1,
        }}
        className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_#818cf8]"
      />
    </div>
  );
};
