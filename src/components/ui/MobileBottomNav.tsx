"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layers, Rocket, Users, MessageSquare } from "lucide-react";

interface MobileBottomNavProps {
  onOpenContact: () => void;
  isModalOpen: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenContact,
  isModalOpen,
}) => {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState<string>("");
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  // Detect when virtual keyboard opens by tracking input focus on mobile devices
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        setIsKeyboardOpen(true);
      }
    };

    const handleFocusOut = () => {
      setIsKeyboardOpen(false);
    };

    window.addEventListener("focusin", handleFocusIn);
    window.addEventListener("focusout", handleFocusOut);
    return () => {
      window.removeEventListener("focusin", handleFocusIn);
      window.removeEventListener("focusout", handleFocusOut);
    };
  }, []);

  // Track active visible section on homepage
  useEffect(() => {
    if (pathname !== "/") {
      setActiveSection("");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-30% 0px -50% 0px", threshold: 0 }
    );

    const servicesEl = document.getElementById("services");
    const venturesEl = document.getElementById("ventures");

    if (servicesEl) observer.observe(servicesEl);
    if (venturesEl) observer.observe(venturesEl);

    return () => observer.disconnect();
  }, [pathname]);

  // Auto-hide when contact modal is open, virtual keyboard is active, or on admin route
  if (isModalOpen || isKeyboardOpen || pathname.startsWith("/shikadu")) {
    return null;
  }

  const isServicesActive = pathname === "/" && activeSection === "services";
  const isVenturesActive = pathname === "/" && activeSection === "ventures";
  const isAboutActive = pathname === "/about";

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#080d18] border-t border-white/[0.08]"
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="h-16 max-w-md mx-auto grid grid-cols-4 items-center px-1">
        {/* 1. Services */}
        <Link
          href="/#services"
          className={`flex flex-col items-center justify-center min-h-[48px] min-w-[48px] px-2 py-1 rounded-xl transition-all active:scale-95 ${
            isServicesActive
              ? "text-indigo-400 font-semibold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Layers className={`w-5 h-5 ${isServicesActive ? "text-indigo-400" : "text-slate-400"}`} />
          <span className="text-[10px] font-sans tracking-tight mt-1">Services</span>
        </Link>

        {/* 2. Ventures */}
        <Link
          href="/#ventures"
          className={`flex flex-col items-center justify-center min-h-[48px] min-w-[48px] px-2 py-1 rounded-xl transition-all active:scale-95 ${
            isVenturesActive
              ? "text-indigo-400 font-semibold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Rocket className={`w-5 h-5 ${isVenturesActive ? "text-indigo-400" : "text-slate-400"}`} />
          <span className="text-[10px] font-sans tracking-tight mt-1">Ventures</span>
        </Link>

        {/* 3. About */}
        <Link
          href="/about"
          className={`flex flex-col items-center justify-center min-h-[48px] min-w-[48px] px-2 py-1 rounded-xl transition-all active:scale-95 ${
            isAboutActive
              ? "text-indigo-400 font-semibold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Users className={`w-5 h-5 ${isAboutActive ? "text-indigo-400" : "text-slate-400"}`} />
          <span className="text-[10px] font-sans tracking-tight mt-1">About</span>
        </Link>

        {/* 4. Talk (Opens Contact Modal) */}
        <button
          type="button"
          onClick={onOpenContact}
          className="flex flex-col items-center justify-center min-h-[48px] min-w-[48px] px-2 py-1 rounded-xl text-slate-400 hover:text-indigo-300 transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          aria-label="Open project inquiry form"
        >
          <MessageSquare className="w-5 h-5 text-indigo-400" />
          <span className="text-[10px] font-sans font-medium tracking-tight mt-1 text-slate-300">
            Talk
          </span>
        </button>
      </div>
    </nav>
  );
};
