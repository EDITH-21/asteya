"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Info, CheckCircle2, AlertTriangle, X, ArrowRight } from "lucide-react";
import type { Announcement } from "@/lib/server/content-types";
import { SafeMarkdown } from "./SafeMarkdown";

interface AnnouncementBannerProps {
  announcement: Announcement | null;
}

export const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({ announcement }) => {
  const [isClientDismissed, setIsClientDismissed] = useState(false);

  useEffect(() => {
    if (!announcement || !announcement.dismissible) return;
    const timer = setTimeout(() => {
      try {
        const key = `aadrut_announcement_dismissed_${announcement.id}`;
        if (localStorage.getItem(key) === "true") {
          setIsClientDismissed(true);
        }
      } catch {
        // ignore
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [announcement]);

  if (!announcement || !announcement.active) return null;

  // Check date window
  const now = new Date().toISOString();
  if (announcement.startDate && announcement.startDate > now) return null;
  if (announcement.endDate && announcement.endDate < now) return null;
  if (announcement.dismissible && isClientDismissed) return null;

  const handleDismiss = () => {
    setIsClientDismissed(true);
    if (announcement.dismissible && typeof window !== "undefined") {
      try {
        localStorage.setItem(`aadrut_announcement_dismissed_${announcement.id}`, "true");
      } catch {
        // ignore
      }
    }
  };

  const typeConfig = {
    info: {
      bg: "bg-indigo-950/80 border-indigo-500/30 text-indigo-200",
      icon: <Info className="w-4 h-4 text-indigo-400 shrink-0" />,
      btn: "bg-indigo-600 hover:bg-indigo-500 text-white",
      badge: "bg-indigo-500/20 text-indigo-300 border-indigo-400/30",
    },
    success: {
      bg: "bg-emerald-950/80 border-emerald-500/30 text-emerald-200",
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
      btn: "bg-emerald-600 hover:bg-emerald-500 text-white",
      badge: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
    },
    warning: {
      bg: "bg-amber-950/80 border-amber-500/30 text-amber-200",
      icon: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
      btn: "bg-amber-600 hover:bg-amber-500 text-slate-950 font-medium",
      badge: "bg-amber-500/20 text-amber-300 border-amber-400/30",
    },
  }[announcement.type || "info"];

  // 1. Top Bar Display Style
  if (announcement.displayStyle === "top_bar") {
    return (
      <aside aria-label="Announcement" className="relative z-50 w-full">
        <div
          className={`w-full border-b backdrop-blur-md px-4 py-2.5 sm:py-2 transition-all ${typeConfig.bg}`}
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-2.5 flex-1 text-center sm:text-left">
              {typeConfig.icon}
              <div className="leading-snug">
                <span className="font-semibold text-white mr-1.5">{announcement.title}:</span>
                <SafeMarkdown content={announcement.message} />
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {announcement.buttonLabel && announcement.buttonLink && (
                <Link
                  href={announcement.buttonLink}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${typeConfig.btn}`}
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
    <aside aria-label="Announcement" className="fixed bottom-6 right-6 z-50 max-w-sm w-full mx-4 sm:mx-0">
      <div
        className={`rounded-2xl border p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-300 ${typeConfig.bg}`}
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
              className="p-1 rounded-md text-slate-400 hover:text-white transition-colors"
              aria-label="Dismiss announcement"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="text-xs leading-relaxed text-slate-300 mb-3">
          <SafeMarkdown content={announcement.message} />
        </div>

        {announcement.buttonLabel && announcement.buttonLink && (
          <div className="flex justify-end">
            <Link
              href={announcement.buttonLink}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${typeConfig.btn}`}
            >
              <span>{announcement.buttonLabel}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
};
