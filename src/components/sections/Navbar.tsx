"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AadrutLogo } from "../ui/AadrutLogo";
import { Menu, X, ArrowUpRight } from "lucide-react";

interface NavbarProps {
  onOpenContact: () => void;
  hasFaqs?: boolean;
  topOffset?: number;
}

const SECTION_IDS = ["services", "ventures", "process", "technology", "why-aadrut"];

export const Navbar: React.FC<NavbarProps> = ({
  onOpenContact,
  hasFaqs = false,
  topOffset = 0,
}) => {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  const isLockedRef = useRef(false);
  const lockTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navItems = [
    { name: "Our Team", href: "/about", isRoute: true },
    { name: "Services", href: isHome ? "#services" : "/#services", isRoute: false, sectionId: "services" },
    { name: "Ventures", href: isHome ? "#ventures" : "/#ventures", isRoute: false, sectionId: "ventures" },
    { name: "Process", href: isHome ? "#process" : "/#process", isRoute: false, sectionId: "process" },
    { name: "Technology", href: isHome ? "#technology" : "/#technology", isRoute: false, sectionId: "technology" },
    { name: "Why Aadrut", href: isHome ? "#why-aadrut" : "/#why-aadrut", isRoute: false, sectionId: "why-aadrut" },
    ...(hasFaqs ? [{ name: "FAQ", href: "/faq", isRoute: true }] : []),
  ];

  useEffect(() => {
    if (!isHome) return;

    // Dynamic header height + 24px landing clearance:
    // Mobile: 64 + 24 = 88px | Tablet: 72 + 24 = 96px | Desktop: 88 + 24 = 112px
    const getHeaderThreshold = () => {
      if (typeof window === "undefined") return 112;
      const headerEl = document.querySelector("header");
      const headerHeight = headerEl
        ? headerEl.offsetHeight
        : window.innerWidth >= 1280
        ? 88
        : window.innerWidth >= 640
        ? 72
        : 64;
      return headerHeight + 24;
    };

    const updateActiveSection = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      // 1. Near the bottom of the page, the last link (Why Aadrut) becomes active
      if (windowHeight + scrollY >= docHeight - 80) {
        setActiveSection(SECTION_IDS[SECTION_IDS.length - 1]);
        return;
      }

      // 2. At the very top (Hero section), no in-page section link is active
      if (scrollY < 120) {
        setActiveSection("");
        return;
      }

      // 3. The active section is the last section whose top is <= (header height + 24px)
      const threshold = getHeaderThreshold();
      let currentActive = "";
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= threshold + 8) {
            currentActive = id;
          }
        }
      }

      setActiveSection(currentActive);
    };

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      if (isLockedRef.current) {
        return;
      }

      updateActiveSection();
    };

    const handleScrollEnd = () => {
      if (isLockedRef.current) {
        isLockedRef.current = false;
        if (lockTimeoutRef.current) {
          clearTimeout(lockTimeoutRef.current);
          lockTimeoutRef.current = null;
        }
        updateActiveSection();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("scrollend", handleScrollEnd, { passive: true });

    // Initial sync scheduled after initial paint
    const rafId = requestAnimationFrame(() => {
      if (window.location.hash) {
        const hashId = window.location.hash.substring(1);
        if (SECTION_IDS.includes(hashId)) {
          setActiveSection(hashId);
          return;
        }
      }
      updateActiveSection();
    });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("scrollend", handleScrollEnd);
      if (lockTimeoutRef.current) {
        clearTimeout(lockTimeoutRef.current);
      }
    };
  }, [isHome]);

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

  const handleSectionClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, sectionId?: string) => {
    setMobileMenuOpen(false);

    if (isHome && sectionId) {
      e.preventDefault();
      setActiveSection(sectionId);

      isLockedRef.current = true;
      if (lockTimeoutRef.current) {
        clearTimeout(lockTimeoutRef.current);
      }
      lockTimeoutRef.current = setTimeout(() => {
        isLockedRef.current = false;
      }, 600);

      const hash = `#${sectionId}`;
      if (window.location.hash !== hash) {
        window.history.replaceState(null, "", hash);
      }

      const target = document.getElementById(sectionId);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const getItemIsActive = (item: (typeof navItems)[0]) => {
    if (item.href === "/about") {
      return pathname === "/about";
    }
    if (item.name === "FAQ") {
      return pathname === "/faq";
    }
    if (item.sectionId === "services" && pathname.startsWith("/services")) {
      return true;
    }
    if (isHome && item.sectionId) {
      return activeSection === item.sectionId;
    }
    return false;
  };

  return (
    <>
      <header
        style={{ top: topOffset > 0 ? `${topOffset}px` : "0px" }}
        className={`fixed left-0 right-0 w-full z-40 transition-all duration-300 h-[64px] sm:h-[72px] xl:h-[88px] flex items-center ${
          scrolled
            ? "bg-[#05070b]/90 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.6)]"
            : "bg-transparent"
        }`}
      >
        <div className="w-full max-w-none px-4 md:px-6 xl:px-10">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center w-full">
            {/* Left Column: Brand Logo */}
            <div className="justify-self-start flex items-center">
              <Link
                href="/"
                aria-label="Aadrut Home"
                className="group inline-flex items-center flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-lg"
              >
                <AadrutLogo priority heightClass="h-[44px] sm:h-[52px] xl:h-[60px]" />
              </Link>
            </div>

            {/* Center Column: Perfectly Centered Pill Navigation (switches to mobile menu below 1280px) */}
            <div className="justify-self-center flex items-center">
              <nav
                aria-label="Primary Navigation"
                className="hidden xl:flex items-center gap-1 h-[58px] bg-white/[0.03] border border-white/10 rounded-full px-2.5 py-1 backdrop-blur-md flex-shrink-0 shadow-[0_2px_16px_rgba(0,0,0,0.3)]"
              >
                {navItems.map((item) => {
                  const isActive = getItemIsActive(item);

                  if (item.isRoute) {
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`relative px-4 py-2 text-[15px] font-sans font-medium tracking-normal whitespace-nowrap transition-colors duration-200 rounded-full ${
                          isActive
                            ? "text-white font-semibold"
                            : "text-slate-300 hover:text-white hover:bg-white/[0.04]"
                        }`}
                      >
                        {item.name}
                        {isActive && (
                          <motion.div
                            layoutId="navIndicator"
                            className="absolute bottom-1 left-4 right-4 h-0.5 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                        )}
                      </Link>
                    );
                  }

                  if (isHome) {
                    return (
                      <a
                        key={item.name}
                        href={item.href}
                        onClick={(e) => handleSectionClick(e, item.href, item.sectionId)}
                        className={`relative px-4 py-2 text-[15px] font-sans font-medium tracking-normal whitespace-nowrap transition-colors duration-200 rounded-full ${
                          isActive
                            ? "text-white font-semibold"
                            : "text-slate-300 hover:text-white hover:bg-white/[0.04]"
                        }`}
                      >
                        {item.name}
                        {isActive && (
                          <motion.div
                            layoutId="navIndicator"
                            className="absolute bottom-1 left-4 right-4 h-0.5 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                        )}
                      </a>
                    );
                  }

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`relative px-4 py-2 text-[15px] font-sans font-medium tracking-normal whitespace-nowrap transition-colors duration-200 rounded-full ${
                        isActive
                          ? "text-white font-semibold"
                          : "text-slate-300 hover:text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      {item.name}
                      {isActive && (
                        <motion.div
                          layoutId="navIndicator"
                          className="absolute bottom-1 left-4 right-4 h-0.5 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right Column: Actions (Let's Talk + Mobile Menu Button below 1280px) */}
            <div className="justify-self-end flex items-center gap-2.5 sm:gap-3">
              <button
                onClick={onOpenContact}
                className="group inline-flex items-center gap-2 sm:gap-2.5 px-4 sm:px-6 h-[42px] sm:h-[50px] rounded-full text-xs sm:text-[15px] font-sans font-semibold tracking-wide text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 border border-indigo-400/30 transition-all duration-200 shadow-[0_2px_12px_rgba(99,102,241,0.25)] hover:shadow-[0_4px_20px_rgba(99,102,241,0.4)] active:scale-95 whitespace-nowrap flex-shrink-0"
              >
                <span>Let&apos;s Talk</span>
                <ArrowUpRight
                  strokeWidth={2}
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-200 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </button>

              {/* Mobile/Tablet Menu Button (shows below 1280px) */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 min-h-[42px] min-w-[42px] sm:min-h-[48px] sm:min-w-[48px] rounded-xl xl:hidden text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
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
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-30 xl:hidden bg-[#05070b]/95 backdrop-blur-md flex flex-col justify-between pt-[76px] sm:pt-[84px] pb-8 px-6 overflow-y-auto"
          >
            <div className="max-w-md mx-auto w-full pt-4 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs font-sans tracking-wide text-slate-400 font-medium">
                <span>Navigation</span>
                <span>Aadrut</span>
              </div>

              <div className="flex flex-col space-y-2">
                {navItems.map((item, index) => {
                  const isActive = getItemIsActive(item);

                  if (item.isRoute) {
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`relative min-h-[48px] text-[17px] font-medium tracking-tight py-3 px-4 rounded-xl transition-colors flex items-center justify-between ${
                          isActive
                            ? "text-white bg-white/[0.08] font-semibold border border-indigo-500/30"
                            : "text-slate-300 hover:text-white hover:bg-white/[0.04]"
                        }`}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-gradient-to-b from-indigo-500 to-cyan-400 rounded-r-full" />
                        )}
                        <span>{item.name}</span>
                        <span className="text-xs font-mono text-slate-500 font-normal">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </Link>
                    );
                  }

                  if (isHome) {
                    return (
                      <a
                        key={item.name}
                        href={item.href}
                        onClick={(e) => handleSectionClick(e, item.href, item.sectionId)}
                        className={`relative min-h-[48px] text-[17px] font-medium tracking-tight py-3 px-4 rounded-xl transition-colors flex items-center justify-between ${
                          isActive
                            ? "text-white bg-white/[0.08] font-semibold border border-indigo-500/30"
                            : "text-slate-300 hover:text-white hover:bg-white/[0.04]"
                        }`}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-gradient-to-b from-indigo-500 to-cyan-400 rounded-r-full" />
                        )}
                        <span>{item.name}</span>
                        <span className="text-xs font-mono text-slate-500 font-normal">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </a>
                    );
                  }

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`relative min-h-[48px] text-[17px] font-medium tracking-tight py-3 px-4 rounded-xl transition-colors flex items-center justify-between ${
                        isActive
                          ? "text-white bg-white/[0.08] font-semibold border border-indigo-500/30"
                          : "text-slate-300 hover:text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-gradient-to-b from-indigo-500 to-cyan-400 rounded-r-full" />
                      )}
                      <span>{item.name}</span>
                      <span className="text-xs font-mono text-slate-500 font-normal">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </Link>
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
                className="w-full min-h-[48px] py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-sans text-sm font-semibold tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all"
              >
                <span>Start a Conversation</span>
                <ArrowUpRight strokeWidth={1.75} className="w-4 h-4" />
              </button>

              <div className="text-center text-xs font-sans text-slate-400">
                &copy; 2026 Aadrut. All rights reserved.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
