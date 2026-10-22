"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Layers, Rocket, Users, HelpCircle, MessageSquare } from "lucide-react";

interface MobileBottomNavProps {
  onOpenContact: () => void;
  isModalOpen: boolean;
  hasFaqs?: boolean;
  hasVentures?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenContact,
  isModalOpen,
  hasFaqs = false,
  hasVentures = false,
}) => {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState<string>("");
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  // Detect virtual keyboard opening by listening to focusin/focusout on input fields
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

  const isHomeActive = pathname === "/" && !activeSection;
  const isServicesActive = (pathname === "/" && activeSection === "services") || pathname.startsWith("/services");
  const isVenturesActive = pathname === "/" && activeSection === "ventures";
  const isAboutActive = pathname === "/about";
  const isFaqActive = pathname === "/faq";

  // Build items array: Home, Services, [Ventures], Our Team, [FAQ]
  const baseItems: Array<{
    id: string;
    label: string;
    href: string;
    icon: React.ReactNode;
    isActive: boolean;
  }> = [
    {
      id: "home",
      label: "Home",
      href: "/",
      icon: <Home className="w-5 h-5" />,
      isActive: isHomeActive,
    },
    {
      id: "services",
      label: "Services",
      href: "/#services",
      icon: <Layers className="w-5 h-5" />,
      isActive: isServicesActive,
    },
  ];

  if (hasVentures) {
    baseItems.push({
      id: "ventures",
      label: "Ventures",
      href: "/#ventures",
      icon: <Rocket className="w-5 h-5" />,
      isActive: isVenturesActive,
    });
  }

  baseItems.push({
    id: "about",
    label: "Our Team",
    href: "/about",
    icon: <Users className="w-5 h-5" />,
    isActive: isAboutActive,
  });

  if (hasFaqs) {
    baseItems.push({
      id: "faq",
      label: "FAQ",
      href: "/faq",
      icon: <HelpCircle className="w-5 h-5" />,
      isActive: isFaqActive,
    });
  }

  // Keep "Talk" only if it fits 5 items; otherwise drop it (header keeps Let's Talk)
  const showTalk = baseItems.length < 5;
  const totalItemCount = baseItems.length + (showTalk ? 1 : 0);

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#080d18] border-t border-white/[0.08]"
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div
        className="h-16 max-w-md mx-auto grid items-center px-1"
        style={{
          gridTemplateColumns: `repeat(${totalItemCount}, minmax(0, 1fr))`,
        }}
      >
        {baseItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`flex flex-col items-center justify-center min-h-[48px] min-w-[48px] px-1 py-1 rounded-xl transition-all active:scale-95 ${
              item.isActive
                ? "text-indigo-400 font-semibold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {React.cloneElement(item.icon as React.ReactElement<{ className?: string }>, {
              className: `w-5 h-5 ${item.isActive ? "text-indigo-400" : "text-slate-400"}`,
            })}
            <span className="text-[10px] font-sans tracking-tight mt-1 whitespace-nowrap">
              {item.label}
            </span>
          </Link>
        ))}

        {showTalk && (
          <button
            type="button"
            onClick={onOpenContact}
            className="flex flex-col items-center justify-center min-h-[48px] min-w-[48px] px-1 py-1 rounded-xl text-slate-400 hover:text-indigo-300 transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            aria-label="Open project inquiry form"
          >
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            <span className="text-[10px] font-sans font-medium tracking-tight mt-1 text-slate-300">
              Talk
            </span>
          </button>
        )}
      </div>
    </nav>
  );
};
