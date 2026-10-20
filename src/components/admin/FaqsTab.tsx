"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  HelpCircle,
  Plus,
  Trash2,
  Edit3,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  X,
  Save,
} from "lucide-react";
import type { FAQItem } from "@/lib/server/content-types";

export const FaqsTab: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Partial<FAQItem> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("All");

  const loadFaqs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/faqs");
      if (res.ok) {
        const data = await res.json();
        setFaqs(data.faqs || []);
      }
    } catch (err) {
      console.error("Failed to load FAQs:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const timer = setTimeout(() => {
      if (mounted) {
        loadFaqs();
      }
    }, 0);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [loadFaqs]);

  const categories = React.useMemo(() => {
    const set = new Set<string>();
    faqs.forEach((f) => set.add(f.category));
    return ["All", ...Array.from(set)];
  }, [faqs]);

  const filteredFaqs = React.useMemo(() => {
    if (categoryFilter === "All") return faqs;
    return faqs.filter((f) => f.category === categoryFilter);
  }, [faqs, categoryFilter]);

  const handleOpenNew = () => {
    setIsNew(true);
    setEditingItem({
      question: "",
      answer: "",
      category: "General",
      published: false,
      order: faqs.length + 1,
    });
    setErrorMsg(null);
  };

  const handleOpenEdit = (item: FAQItem) => {
    setIsNew(false);
    setEditingItem({ ...item });
    setErrorMsg(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setSaving(true);
    setErrorMsg(null);

    const payload = {
      question: editingItem.question?.trim(),
      answer: editingItem.answer?.trim(),
      category: editingItem.category?.trim() || "General",
      published: Boolean(editingItem.published),
      order: editingItem.order ?? 1,
    };

    try {
      const url = isNew
        ? "/api/admin/faqs"
        : `/api/admin/faqs/${editingItem.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to save FAQ");
      } else {
        setEditingItem(null);
        await loadFaqs();
      }
    } catch {
      setErrorMsg("Network error saving FAQ item");
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (item: FAQItem) => {
    try {
      const updated = !item.published;
      const res = await fetch(`/api/admin/faqs/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...item,
          published: updated,
        }),
      });
      if (res.ok) {
        setFaqs((prev) =>
          prev.map((f) => (f.id === item.id ? { ...f, published: updated } : f))
        );
      }
    } catch (err) {
      console.error("Failed to toggle FAQ publish:", err);
    }
  };

  const handleReorder = async (currentIndex: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= faqs.length) return;

    const reordered = [...faqs];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    const orderedIds = reordered.map((f) => f.id);
    setFaqs(reordered);

    try {
      await fetch("/api/admin/faqs/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      });
    } catch (err) {
      console.error("Failed to reorder FAQs:", err);
      await loadFaqs();
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await fetch(`/api/admin/faqs/${deletingId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setFaqs((prev) => prev.filter((f) => f.id !== deletingId));
      }
    } catch (err) {
      console.error("Failed to delete FAQ:", err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-400" />
            <span>Frequently Asked Questions</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage public knowledge base entries. Seeded FAQs start as unpublished drafts for review before going live.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Question</span>
        </button>
      </div>

      {/* Category Filter */}
      {categories.length > 2 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-sans font-medium transition-colors ${
                categoryFilter === cat
                  ? "bg-white/[0.1] text-white border border-white/20"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* FAQ List */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : filteredFaqs.length === 0 ? (
        <div className="bg-[#090d16] border border-white/[0.08] rounded-2xl p-8 text-center">
          <HelpCircle className="w-8 h-8 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-white">No FAQ items found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Add frequent customer questions regarding services, process, delivery ownership, and launch support.
          </p>
          <button
            onClick={handleOpenNew}
            className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-indigo-300 text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add First Question</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFaqs.map((item, idx) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-all ${
                item.published
                  ? "bg-[#090d16] border-white/[0.08]"
                  : "bg-[#090d16]/50 border-white/[0.04] opacity-70 hover:opacity-100"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.05] text-slate-400 border border-white/10">
                      #{idx + 1}
                    </span>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.04] text-indigo-300 border border-indigo-500/20">
                      {item.category}
                    </span>

                    <span
                      className={`text-[10px] font-sans px-2 py-0.5 rounded-md font-semibold ${
                        item.published
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                      }`}
                    >
                      {item.published ? "Published" : "Draft / Review Required"}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white">{item.question}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                    {item.answer}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-start shrink-0 pt-1 sm:pt-0">
                  <div className="flex items-center border border-white/10 rounded-lg p-0.5 bg-white/[0.02]">
                    <button
                      onClick={() => handleReorder(idx, "up")}
                      disabled={idx === 0}
                      className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleReorder(idx, "down")}
                      disabled={idx === faqs.length - 1}
                      className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleTogglePublish(item)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      item.published
                        ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20"
                        : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20"
                    }`}
                  >
                    {item.published ? "Unpublish" : "Publish"}
                  </button>

                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-colors"
                    title="Edit FAQ"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setDeletingId(item.id)}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                    title="Delete FAQ"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Create Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#090d16] border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative my-auto space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-base font-bold text-white">
                {isNew ? "Add Question" : "Edit Question"}
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.06]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Category <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={50}
                  value={editingItem.category || ""}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, category: e.target.value })
                  }
                  placeholder="e.g., General, Services, Process, Delivery"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Question <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={180}
                  value={editingItem.question || ""}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, question: e.target.value })
                  }
                  placeholder="e.g., Who owns the intellectual property and code?"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Answer <span className="text-red-400">*</span>
                  <span className="text-[10px] text-slate-400 font-normal ml-2">
                    (Supports **bold**, *italic*, [link](https://...))
                  </span>
                </label>
                <textarea
                  required
                  rows={4}
                  maxLength={1000}
                  value={editingItem.answer || ""}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, answer: e.target.value })
                  }
                  placeholder="Provide an accurate, neutral explanation..."
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-1">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editingItem.published)}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, published: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-0 bg-black/40 border-white/20"
                  />
                  <span className="text-slate-300 font-medium">Published on website</span>
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? "Saving..." : "Save Question"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#090d16] border border-white/10 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative my-auto">
            <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto mb-4">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white text-center">Delete Question?</h3>
            <p className="text-xs text-slate-400 text-center mt-1.5 leading-relaxed">
              This action cannot be undone. This FAQ item will be permanently removed.
            </p>
            <div className="flex gap-2.5 mt-6">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-medium text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-semibold text-white shadow-md shadow-red-600/25 transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
