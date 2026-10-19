"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Mail, ShieldCheck, ArrowUp } from "lucide-react";
import { CONTACT_CONFIG, SERVICES } from "@/lib/constants";

interface CtaSectionProps {
  onOpenContact?: () => void;
}

export const CtaSection: React.FC<CtaSectionProps> = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    type: "Web Development",
    message: "",
    _hp: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Unable to send your inquiry. Please try again.");
      } else {
        setIsSubmitted(true);
      }
    } catch {
      setErrorMessage("Network error occurred. Please try again or email us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setFormData({
      name: "",
      email: "",
      type: "Web Development",
      message: "",
      _hp: "",
    });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section
      id="contact"
      className="relative w-full py-10 sm:py-14 lg:py-16 bg-[#05070b] border-t border-white/[0.08] overflow-hidden scroll-mt-[68px]"
    >
      {/* Background Lighting (optimized) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[650px] h-[300px] sm:h-[450px] bg-indigo-600/10 rounded-full blur-2xl sm:blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-b from-white/[0.05] to-white/[0.01] border border-white/[0.1] p-6 sm:p-8 lg:p-10 backdrop-blur-xl shadow-2xl relative overflow-hidden"
        >
          {/* Label */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-indigo-300 font-sans text-xs font-medium tracking-wide mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span>Connect with Asteya</span>
            </div>

            <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white uppercase leading-[1.1] mb-3">
              Have An Idea?
            </h2>

            <p className="text-slate-300 text-sm sm:text-base font-normal max-w-xl mx-auto leading-relaxed">
              Let&apos;s build something meaningful. Share your vision or technical requirement and our engineering leadership will connect with you within 24 hours.
            </p>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs sm:text-sm text-red-300">
                  {errorMessage}
                </div>
              )}

              {/* Honeypot field for bot protection (visually hidden) */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="website_hp">Leave this field blank</label>
                <input
                  id="website_hp"
                  type="text"
                  name="_hp"
                  tabIndex={-1}
                  autoComplete="off"
                  value={formData._hp}
                  onChange={(e) => setFormData({ ...formData, _hp: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact_name" className="block text-xs font-sans text-slate-300 font-medium mb-1.5">
                    Your Name <span className="text-indigo-400">*</span>
                  </label>
                  <input
                    id="contact_name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Elena Rostova"
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="contact_email" className="block text-xs font-sans text-slate-300 font-medium mb-1.5">
                    Work Email <span className="text-indigo-400">*</span>
                  </label>
                  <input
                    id="contact_email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="elena@company.com"
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact_service" className="block text-xs font-sans text-slate-300 font-medium mb-1.5">
                  Core Area of Interest
                </label>
                <select
                  id="contact_service"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0d1322] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                >
                  {SERVICES.map((s) => (
                    <option key={s.id} value={s.title}>
                      {s.number} &bull; {s.title}
                    </option>
                  ))}
                  <option value="Venture / Bespoke">07 &bull; Venture Collaboration &amp; Custom Platform</option>
                </select>
              </div>

              <div>
                <label htmlFor="contact_message" className="block text-xs font-sans text-slate-300 font-medium mb-1.5">
                  Project Details / Objectives <span className="text-indigo-400">*</span>
                </label>
                <textarea
                  id="contact_message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us what you want to build, current challenges, or goals..."
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Strict confidentiality guaranteed</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto min-h-[44px] px-8 py-3 rounded-full bg-white text-black font-semibold text-sm tracking-normal hover:bg-slate-100 transition-all duration-200 shadow-[0_0_24px_rgba(255,255,255,0.2)] hover:shadow-[0_0_32px_rgba(255,255,255,0.35)] flex items-center justify-center gap-2 group active:scale-95 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Submit Inquiry</span>
                        <ArrowRight strokeWidth={1.75} className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={scrollToTop}
                    className="hidden sm:flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                    aria-label="Scroll back to top"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                <span>Prefer direct correspondence?</span>
                <a
                  href={`mailto:${CONTACT_CONFIG.email}`}
                  className="inline-flex items-center gap-1.5 text-indigo-300 hover:text-white transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{CONTACT_CONFIG.email}</span>
                </a>
              </div>
            </form>
          ) : (
            <div className="py-10 text-center space-y-4 max-w-md mx-auto">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight">Inquiry Received</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Thank you, <span className="text-indigo-300 font-semibold">{formData.name}</span>. Your brief has been securely routed to our engineering leadership team. We look forward to reviewing your goals.
              </p>
              <div className="pt-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-2.5 bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 rounded-full text-xs sm:text-sm text-white font-medium transition-colors"
                >
                  Send Another Inquiry
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};
