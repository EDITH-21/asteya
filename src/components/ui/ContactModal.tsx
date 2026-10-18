"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, ShieldCheck, ArrowRight, Mail } from "lucide-react";
import { AsteyaLogo } from "./AsteyaLogo";
import { CONTACT_CONFIG } from "@/lib/constants";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    type: "Digital Product / Web",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

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
        setErrorMessage(data.error || "Unable to submit your message. Please try again.");
      } else {
        setIsSubmitted(true);
      }
    } catch {
      setErrorMessage("Network connection error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setErrorMessage("");
    setFormData({ name: "", email: "", type: "Digital Product / Web", message: "" });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg bg-[#090d16] border border-white/[0.12] rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden z-10 my-auto"
          >
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/12 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <AsteyaLogo size={30} showText={false} />
                <div>
                  <h3 id="contact-modal-title" className="text-lg font-bold text-white tracking-tight">
                    Start a Conversation
                  </h3>
                  <div className="text-xs text-slate-400 font-sans">
                    Asteya Technology &amp; Ventures
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Tell us about your venture, product vision, or technical requirements. Our engineering leadership will get back to you within 24 hours.
                </p>

                {errorMessage && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300 leading-relaxed">
                    {errorMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-sans text-slate-300 font-medium mb-1">
                      Your Name <span className="text-indigo-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Alex Vance"
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-sans text-slate-300 font-medium mb-1">
                      Work Email <span className="text-indigo-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="alex@company.com"
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-sans text-slate-300 font-medium mb-1">
                    Engagement Domain
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#0e1424] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  >
                    <option value="Web Development">01 &bull; Web Development &amp; Platform Architecture</option>
                    <option value="Digital Solutions">02 &bull; Digital Solutions &amp; Enterprise Systems</option>
                    <option value="Brand & Design">03 &bull; Brand &amp; Interface Design Systems</option>
                    <option value="Business Automation">04 &bull; Business Automation &amp; Smart Workflows</option>
                    <option value="Digital Presence">05 &bull; Digital Presence &amp; Interactive Tools</option>
                    <option value="Technology Consulting">06 &bull; Technology Consulting &amp; Modernization</option>
                    <option value="Venture Collaboration">07 &bull; Venture Exploration &amp; Partnership</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-sans text-slate-300 font-medium mb-1">
                    Project Overview / Vision <span className="text-indigo-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe what you want to build, key goals, timeline, or objectives..."
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <ShieldCheck strokeWidth={1.75} className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Strict confidentiality guaranteed</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-lg text-sm font-semibold tracking-wide shadow-md shadow-indigo-600/25 transition-all disabled:opacity-50 active:scale-95"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Send Message</span>
                        <ArrowRight strokeWidth={1.75} className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                <div className="pt-3 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                  <span>Direct inquiries:</span>
                  <a
                    href={`mailto:${CONTACT_CONFIG.email}`}
                    className="inline-flex items-center gap-1.5 text-indigo-300 hover:text-white transition-colors"
                  >
                    <Mail strokeWidth={1.75} className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{CONTACT_CONFIG.email}</span>
                  </a>
                </div>
              </form>
            ) : (
              <div className="py-8 text-center space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 strokeWidth={1.75} className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-white">Message Received</h4>
                <p className="text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
                  Thank you, <span className="text-indigo-300 font-medium">{formData.name}</span>. Your brief has been routed to our leadership team. We look forward to connecting with you shortly.
                </p>
                <div className="pt-2">
                  <button
                    onClick={handleReset}
                    className="px-5 py-2 bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 rounded-lg text-sm text-white font-medium transition-colors"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
