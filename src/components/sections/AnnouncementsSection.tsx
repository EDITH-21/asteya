"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Info, CheckCircle2, AlertTriangle, ArrowRight, Calendar } from "lucide-react";
import type { Announcement } from "@/lib/server/content-types";
import { SafeMarkdown } from "@/components/ui/SafeMarkdown";

interface AnnouncementsSectionProps {
  announcements: Announcement[];
}

export const AnnouncementsSection: React.FC<AnnouncementsSectionProps> = ({ announcements }) => {
  if (!announcements || announcements.length === 0) {
    return null;
  }

  const getTypeStyle = (type: string) => {
    switch (type) {
      case "success":
        return {
          badge: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
          label: "Release",
          button: "bg-emerald-600 hover:bg-emerald-500 text-white",
        };
      case "warning":
        return {
          badge: "bg-amber-500/10 border-amber-500/30 text-amber-300",
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
          label: "Notice",
          button: "bg-amber-600 hover:bg-amber-500 text-slate-950 font-medium",
        };
      case "info":
      default:
        return {
          badge: "bg-indigo-500/10 border-indigo-500/30 text-indigo-300",
          icon: <Info className="w-3.5 h-3.5 text-indigo-400" />,
          label: "Update",
          button: "bg-indigo-600 hover:bg-indigo-500 text-white",
        };
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return null;
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return null;
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return null;
    }
  };

  return (
    <section
      id="updates"
      className="site-section relative w-full bg-[#05070b] border-t border-white/[0.04] overflow-hidden"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="site-container relative z-10">
        <div className="max-w-3xl mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-indigo-300 font-sans text-xs font-medium tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span>07 &bull; Updates &amp; Announcements</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white uppercase">
            Latest Announcements
          </h2>

          <p className="text-slate-300 text-base sm:text-lg font-normal leading-relaxed">
            Product developments, ecosystem news, and architectural updates from the Aadrut team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {announcements.map((item, index) => {
            const style = getTypeStyle(item.type);
            const dateStr = formatDate(item.startDate || item.createdAt);

            return (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-sm flex flex-col justify-between hover:border-indigo-500/30 transition-all group"
              >
                <div className="space-y-4">
                  {/* Top metadata row: Type pill badge & Date */}
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-medium ${style.badge}`}
                    >
                      {style.icon}
                      <span>{style.label}</span>
                    </span>

                    {dateStr && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{dateStr}</span>
                      </span>
                    )}
                  </div>

                  {/* Announcement Title */}
                  <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-indigo-200 transition-colors">
                    {item.title}
                  </h3>

                  {/* Announcement Message with safe markdown formatting */}
                  <div className="text-sm text-slate-300 leading-relaxed font-normal">
                    <SafeMarkdown content={item.message} />
                  </div>
                </div>

                {/* Optional Action Button Link */}
                {item.buttonLabel && item.buttonLink && (
                  <div className="pt-5 mt-4 border-t border-white/[0.06] flex items-center justify-between">
                    <Link
                      href={item.buttonLink}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      <span>{item.buttonLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                )}
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
