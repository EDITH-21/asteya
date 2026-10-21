"use client";

import React from "react";
import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import type { Testimonial } from "@/lib/server/content-types";
import { SafeMarkdown } from "@/components/ui/SafeMarkdown";

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
  showTestimonials: boolean;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  testimonials,
  showTestimonials,
}) => {
  // If no published testimonials or explicitly disabled, do not render
  if (showTestimonials === false || !testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section
      id="testimonials"
      className="site-section relative w-full bg-[#05070b] border-t border-white/[0.04] overflow-hidden"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="site-container relative z-10">
        <div className="max-w-3xl mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-indigo-300 font-sans text-xs font-medium tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span>08 &bull; Client Perspectives</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white uppercase">
            Trusted by Builders &amp; Leaders
          </h2>

          <p className="text-slate-300 text-base sm:text-lg font-normal leading-relaxed">
            Collaborative feedback from technical leaders and enterprise teams who partner with Aadrut.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-sm flex flex-col justify-between hover:border-indigo-500/30 transition-colors group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Quote className="w-6 h-6 text-indigo-400/40 group-hover:text-indigo-400/80 transition-colors" />
                  {typeof t.rating === "number" && t.rating > 0 && (
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: Math.min(5, Math.max(1, t.rating)) }).map((_, rIdx) => (
                        <Star key={rIdx} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                  &ldquo;<SafeMarkdown content={t.quote} />&rdquo;
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-white/[0.06] flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white">{t.name}</h4>
                  <p className="text-xs text-slate-400">{t.roleOrCompany}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xs font-semibold text-indigo-300">
                  {t.name.slice(0, 2).toUpperCase()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
