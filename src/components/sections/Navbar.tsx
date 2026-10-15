"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AsteyaLogo } from "../ui/AsteyaLogo";
import { NAV_ITEMS } from "@/lib/constants";
import { Menu, X, ArrowUpRight } from "lucide-react";

interface NavbarProps {
  onOpenContact: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenContact }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Track active section with balanced offset
      const sections = NAV_ITEMS.map((item) => item.href.substring(1));
      const scrollPos = window.scrollY + 180;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Handle escape key to close menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? "py-3 bg-[#05070b]/90 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.6)]"
            : "py-5 sm:py-6 bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Logo Brand Anchor */}
            <a
              href="#"
              data-cursor="ASTEYA"
              aria-label="Asteya Home"
              className="group flex items-center gap-2 flex-shrink-0"
            >
              <AsteyaLogo size={34} showText={true} />
            </a>

            {/* Desktop Navigation - Switches cleanly to mobile drawer on viewports < 1180px to guarantee zero collision */}
            <nav
              aria-label="Primary Navigation"
              className="hidden xl:flex items-center gap-1 bg-white/[0.03] border border-white/10 rounded-full px-3 py-1 backdrop-blur-md flex-shrink-0"
            >
              {NAV_ITEMS.map((item) => {
                const isActive = activeSection === item.href.substring(1);
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    data-cursor={item.name}
                    className={`relative px-3 py-1.5 text-xs font-sans font-medium tracking-normal transition-colors duration-200 rounded-full ${
                      isActive
                        ? "text-white font-semibold"
                        : "text-slate-300 hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    {item.name}
                    {isActive && (
                      <motion.div
                        layoutId="navIndicator"
                        className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </a>
                );
              })}
            </nav>

            {/* Actions: Primary CTA & Responsive Toggle */}
            <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
              <button
                onClick={onOpenContact}
                data-cursor="TALK"
                className="group inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full text-xs font-sans font-semibold tracking-wide text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 border border-indigo-400/30 transition-all duration-200 shadow-[0_2px_12px_rgba(99,102,241,0.25)] hover:shadow-[0_4px_20px_rgba(99,102,241,0.4)] active:scale-95"
              >
                <span>Let&apos;s Talk</span>
                <ArrowUpRight
                  strokeWidth={1.75}
                  className="w-3.5 h-3.5 text-indigo-200 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </button>

              {/* Mobile/Tablet Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg xl:hidden text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Fullscreen Mobile / Tablet Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 xl:hidden bg-[#05070b]/95 backdrop-blur-2xl flex flex-col justify-between pt-24 pb-8 px-6 overflow-y-auto"
          >
            <div className="max-w-md mx-auto w-full pt-4 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs font-sans tracking-wide text-slate-400 font-medium">
                <span>Navigation</span>
                <span>Asteya</span>
              </div>

              <div className="flex flex-col space-y-1">
                {NAV_ITEMS.map((item, index) => {
                  const isActive = activeSection === item.href.substring(1);
                  return (
                    <motion.a
                      key={item.name}
                      href={item.href}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04 + 0.05 }}
                      onClick={(e) => handleNavClick(e, item.href)}
                      className={`text-xl font-medium tracking-tight py-3 px-3 rounded-lg transition-colors flex items-center justify-between ${
                        isActive
                          ? "text-white bg-white/[0.05] font-semibold"
                          : "text-slate-300 hover:text-white hover:bg-white/[0.03]"
                      }`}
                    >
                      <span>{item.name}</span>
                      <span className="text-xs font-mono text-slate-500 font-normal">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </motion.a>
                  );
                })}
              </div>
            </div>

            <div className="max-w-md mx-auto w-full space-y-4 pt-6 border-t border-white/10">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenContact();
                }}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-sans text-sm font-semibold tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all"
              >
                <span>Start a Conversation</span>
                <ArrowUpRight strokeWidth={1.75} className="w-4 h-4" />
              </button>

              <div className="text-center text-xs font-sans text-slate-500">
                &copy; 2026 Asteya. All rights reserved.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
