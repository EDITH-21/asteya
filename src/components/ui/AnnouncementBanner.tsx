"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Info, CheckCircle2, AlertTriangle, X, ArrowRight } from "lucide-react";
import type { Announcement } from "@/lib/server/content-types";

interface AnnouncementBannerProps {
  announcement: Announcement | null;
  onHeightChange?: (h: number) => void;
}

export const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({
  announcement,
  onHeightChange,
}) => {
  const [isClientDismissed, setIsClientDismissed] = useState(false);
  const [isDateValid, setIsDateValid] = useState(true);
  const bannerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!announcement || !announcement.dismissible) {
        setIsClientDismissed(false);
      } else {
        try {
          const version = announcement.updatedAt || announcement.createdAt || "v1";
          const key = `aadrut_announcement_dismissed_${announcement.id}_${version}`;
          const raw = localStorage.getItem(key);
          if (raw) {
            try {
              const data = JSON.parse(raw);
              const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
              if (Date.now() - (data.dismissedAt || 0) < sevenDaysMs && data.version === version) {
                setIsClientDismissed(true);
              } else {
                localStorage.removeItem(key);
                setIsClientDismissed(false);
              }
            } catch {
              setIsClientDismissed(raw === "true");
            }
          } else {
            setIsClientDismissed(false);
          }
        } catch {
          // ignore storage errors
        }
      }

      if (announcement) {
        const now = Date.now();
        const valid =
          Boolean(announcement.active) &&
          (!announcement.startDate || new Date(announcement.startDate).getTime() <= now + 120000) &&
          (!announcement.endDate || new Date(announcement.endDate).getTime() >= now);
        setIsDateValid(valid);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [announcement]);

  const isVisible = Boolean(announcement?.active) && isDateValid && (!announcement?.dismissible || !isClientDismissed);

  // Sync measured height with parent layout and CSS variables to offset fixed navbar
  useEffect(() => {
    if (isVisible && announcement?.displayStyle === "top_bar") {
      const updateHeight = () => {
        if (bannerRef.current && onHeightChange) {
          const h = bannerRef.current.offsetHeight;
          onHeightChange(h);
          document.documentElement.style.setProperty("--announcement-h", `${h}px`);
          document.documentElement.style.setProperty("--header-h", `calc(64px + ${h}px)`);
        }
      };
      updateHeight();
      window.addEventListener("resize", updateHeight);
      return () => {
        window.removeEventListener("resize", updateHeight);
        onHeightChange?.(0);
        document.documentElement.style.removeProperty("--announcement-h");
        document.documentElement.style.removeProperty("--header-h");
      };
    } else {
      onHeightChange?.(0);
      document.documentElement.style.removeProperty("--announcement-h");
      document.documentElement.style.removeProperty("--header-h");
    }
  }, [isVisible, announcement?.displayStyle, onHeightChange]);

  if (!isVisible || !announcement) return null;

  const handleDismiss = () => {
    setIsClientDismissed(true);
    onHeightChange?.(0);
    document.documentElement.style.removeProperty("--announcement-h");
    document.documentElement.style.removeProperty("--header-h");
    if (announcement.dismissible && typeof window !== "undefined") {
      try {
        const version = announcement.updatedAt || announcement.createdAt || "v1";
        const key = `aadrut_announcement_dismissed_${announcement.id}_${version}`;
        localStorage.setItem(
          key,
          JSON.stringify({
            dismissedAt: Date.now(),
            version,
          })
        );
      } catch {
        // ignore
      }
    }
  };

  const typeConfig = {
    info: {
      bg: "bg-indigo-950/90 border-indigo-500/30 text-indigo-200",
      icon: <Info className="w-4 h-4 text-indigo-400 shrink-0" />,
      btn: "bg-indigo-600 hover:bg-indigo-500 text-white",
      badge: "bg-indigo-500/20 text-indigo-300 border-indigo-400/30",
    },
    success: {
      bg: "bg-emerald-950/90 border-emerald-500/30 text-emerald-200",
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
      btn: "bg-emerald-600 hover:bg-emerald-500 text-white",
      badge: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
    },
    warning: {
      bg: "bg-amber-950/90 border-amber-500/30 text-amber-200",
      icon: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
      btn: "bg-amber-600 hover:bg-amber-500 text-slate-950 font-medium",
      badge: "bg-amber-500/20 text-amber-300 border-amber-400/30",
    },
  }[announcement.type || "info"];

  // 1. Top Bar Display Style (slim fixed bar at top of screen)
  if (announcement.displayStyle === "top_bar") {
    return (
      <aside
        ref={bannerRef}
        aria-label="Announcement"
        className="fixed top-0 left-0 right-0 z-50 w-full"
      >
        <div
          className={`w-full border-b backdrop-blur-md px-3.5 py-2 sm:py-2.5 transition-all ${typeConfig.bg}`}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2.5 text-xs sm:text-sm">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {typeConfig.icon}
              <div className="leading-tight truncate">
                <span className="font-semibold text-white mr-1.5">{announcement.title}:</span>
                <span className="text-slate-200">{announcement.message}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {announcement.buttonLabel && announcement.buttonLink && (
                <Link
                  href={announcement.buttonLink}
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-medium transition-colors ${typeConfig.btn}`}
                >
                  <span>{announcement.buttonLabel}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )}

              {announcement.dismissible && (
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="p-1 rounded-md text-slate-400 hover:text-white transition-colors"
                  aria-label="Dismiss announcement"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // 2. Popup Modal / Toast Display Style
  return (
    <aside
      aria-label="Announcement"
      className="fixed bottom-6 right-6 z-50 max-w-sm w-full mx-4 sm:mx-0"
    >
      <div
        className={`rounded-2xl border p-4 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-5 duration-300 ${typeConfig.bg}`}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            {typeConfig.icon}
            <span className="font-semibold text-sm text-white">{announcement.title}</span>
          </div>
          {announcement.dismissible && (
            <button
              type="button"
              onClick={handleDismiss}
              className="text-slate-400 hover:text-white transition-colors p-0.5"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <p className="text-xs text-slate-200 leading-relaxed mb-3">
          {announcement.message}
        </p>

        {announcement.buttonLabel && announcement.buttonLink && (
          <Link
            href={announcement.buttonLink}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${typeConfig.btn}`}
          >
            <span>{announcement.buttonLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </aside>
  );
};
