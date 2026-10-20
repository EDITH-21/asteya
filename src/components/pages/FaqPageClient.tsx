"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, MessageSquare, HelpCircle, X, ArrowRight } from "lucide-react";
import { useContactModal } from "@/components/layout/PublicLayout";
import { SafeMarkdown } from "@/components/ui/SafeMarkdown";
import type { FAQItem } from "@/lib/server/content-types";

interface FaqPageClientProps {
  faqs: FAQItem[];
}

export const FaqPageClient: React.FC<FaqPageClientProps> = ({ faqs }) => {
  const { openContactModal } = useContactModal();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  // Derive all unique categories from published FAQs
  const categories = useMemo(() => {
    const set = new Set<string>();
    faqs.forEach((faq) => {
      if (faq.category && faq.category.trim()) {
        set.add(faq.category.trim());
      }
    });
    return ["All", ...Array.from(set)];
  }, [faqs]);

  // Filter FAQs by category and search query
  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory =
        selectedCategory === "All" ||
        faq.category.trim().toLowerCase() === selectedCategory.toLowerCase();

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query) ||
        faq.category.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [faqs, selectedCategory, searchQuery]);

  const toggleAccordion = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="w-full">
      {/* 1. Page Header */}
      <section className="relative pt-28 sm:pt-36 pb-14 sm:pb-20 overflow-hidden border-b border-white/[0.04]">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[340px] sm:w-[600px] h-[260px] bg-indigo-600/10 rounded-full blur-2xl sm:blur-[140px] pointer-events-none" />

        <div className="site-container relative z-10 text-center max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-indigo-300 font-sans text-xs font-medium tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span>Knowledge Base &bull; FAQ</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white uppercase leading-[1.08]">
            Frequently Asked Questions
          </h1>

          <p className="text-slate-300 text-base sm:text-lg font-normal leading-relaxed max-w-2xl mx-auto">
            Everything you need to know about our engineering standards, delivery workflows, technical governance, and partnerships.
          </p>

          {/* Search Input Box */}
          {faqs.length > 0 && (
            <div className="pt-4 max-w-xl mx-auto relative">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search questions or keywords..."
                  className="w-full pl-11 pr-10 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-sans"
                  aria-label="Search frequently asked questions"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 p-1 rounded-md text-slate-400 hover:text-white transition-colors"
                    aria-label="Clear search input"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2. FAQ Accordion Section */}
      <section className="site-section relative py-12 sm:py-20">
        <div className="site-container max-w-4xl mx-auto">
          {faqs.length === 0 ? (
            /* Friendly Empty State if no FAQs are published */
            <div className="text-center py-16 px-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-4 max-w-xl mx-auto">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white uppercase tracking-wide">
                No Questions Published Yet
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                We are currently updating our public knowledge base. If you have any inquiries regarding engineering, engagement models, or technical partnerships, our team is directly accessible.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={openContactModal}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-sm font-semibold transition-colors"
                >
                  <span>Initiate Consultation</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Category Pills Filter */}
              {categories.length > 2 && (
                <div className="flex flex-wrap items-center justify-center gap-2 pb-2">
                  {categories.map((category) => {
                    const isSelected = selectedCategory === category;
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setSelectedCategory(category)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-sans font-medium transition-all border ${
                          isSelected
                            ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm"
                            : "bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.06] border-white/10"
                        }`}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Accordion Items */}
              {filteredFaqs.length === 0 ? (
                <div className="text-center py-12 px-6 rounded-xl bg-white/[0.015] border border-white/[0.06] space-y-3">
                  <p className="text-slate-300 text-sm font-medium">
                    No questions found matching &ldquo;{searchQuery}&rdquo;
                  </p>
                  <p className="text-slate-400 text-xs">
                    Try adjusting your search keywords or switching category filters.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("All");
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 pt-2 font-medium"
                  >
                    Reset all filters
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredFaqs.map((faq) => {
                    const isOpen = openIds.has(faq.id);
                    const triggerId = `faq-trigger-${faq.id}`;
                    const panelId = `faq-panel-${faq.id}`;

                    return (
                      <div
                        key={faq.id}
                        className="rounded-xl border border-white/[0.08] bg-white/[0.02] hover:border-white/[0.14] transition-colors overflow-hidden"
                      >
                        <h3>
                          <button
                            type="button"
                            id={triggerId}
                            aria-expanded={isOpen}
                            aria-controls={panelId}
                            onClick={() => toggleAccordion(faq.id)}
                            className="w-full px-5 py-4 sm:px-6 sm:py-5 flex items-center justify-between gap-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                          >
                            <span className="flex items-center gap-3">
                              {faq.category && (
                                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-sans font-medium uppercase tracking-wider bg-white/[0.04] text-slate-400 border border-white/[0.06]">
                                  {faq.category}
                                </span>
                              )}
                              <span className="text-sm sm:text-base font-semibold text-white">
                                {faq.question}
                              </span>
                            </span>
                            <ChevronDown
                              className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                                isOpen ? "rotate-180 text-indigo-400" : ""
                              }`}
                              aria-hidden="true"
                            />
                          </button>
                        </h3>

                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              id={panelId}
                              role="region"
                              aria-labelledby={triggerId}
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-1 text-slate-300 text-sm leading-relaxed border-t border-white/[0.04] font-normal">
                                <SafeMarkdown content={faq.answer} />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 3. Bottom CTA: "Still have a question? Contact us" */}
          <div className="mt-14 sm:mt-20 p-6 sm:p-10 rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.08] text-center space-y-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
              <MessageSquare className="w-5 h-5" />
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <h2 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-tight">
                Still have a question?
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Can&apos;t find what you&apos;re looking for? Reach out directly to our engineering and advisory team. We respond within 24 hours.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={openContactModal}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20"
              >
                <span>Contact Our Team</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
