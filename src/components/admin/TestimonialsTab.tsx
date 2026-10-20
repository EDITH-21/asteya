"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Quote,
  Plus,
  Trash2,
  Edit3,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  X,
  Save,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import type { Testimonial } from "@/lib/server/content-types";

export const TestimonialsTab: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [showOnSite, setShowOnSite] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [togglingGlobal, setTogglingGlobal] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<Testimonial> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [tRes, sRes] = await Promise.all([
        fetch("/api/admin/testimonials"),
        fetch("/api/admin/settings"),
      ]);

      if (tRes.ok) {
        const data = await tRes.json();
        setTestimonials(data.testimonials || []);
      }
      if (sRes.ok) {
        const sData = await sRes.json();
        setShowOnSite(Boolean(sData.settings?.showTestimonials));
      }
    } catch (err) {
      console.error("Failed to load testimonials:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const timer = setTimeout(() => {
      if (mounted) {
        loadData();
      }
    }, 0);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [loadData]);

  const handleToggleGlobal = async () => {
    setTogglingGlobal(true);
    try {
      const updated = !showOnSite;
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showTestimonials: updated }),
      });
      if (res.ok) {
        setShowOnSite(updated);
      }
    } catch (err) {
      console.error("Failed to toggle global testimonials setting:", err);
    } finally {
      setTogglingGlobal(false);
    }
  };

  const handleOpenNew = () => {
    setIsNew(true);
    setEditingItem({
      name: "",
      roleOrCompany: "",
      quote: "",
      published: true,
      order: testimonials.length + 1,
    });
    setErrorMsg(null);
  };

  const handleOpenEdit = (item: Testimonial) => {
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
      name: editingItem.name?.trim(),
      roleOrCompany: editingItem.roleOrCompany?.trim(),
      quote: editingItem.quote?.trim(),
      published: Boolean(editingItem.published),
      order: editingItem.order ?? 1,
    };

    try {
      const url = isNew
        ? "/api/admin/testimonials"
        : `/api/admin/testimonials/${editingItem.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to save testimonial");
      } else {
        setEditingItem(null);
        await loadData();
      }
    } catch {
      setErrorMsg("Network error saving testimonial");
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (item: Testimonial) => {
    try {
      const updated = !item.published;
      const res = await fetch(`/api/admin/testimonials/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...item,
          published: updated,
        }),
      });
      if (res.ok) {
        setTestimonials((prev) =>
          prev.map((t) => (t.id === item.id ? { ...t, published: updated } : t))
        );
      }
    } catch (err) {
      console.error("Failed to toggle testimonial publish:", err);
    }
  };

  const handleReorder = async (currentIndex: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= testimonials.length) return;

    const reordered = [...testimonials];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    const orderedIds = reordered.map((t) => t.id);
    setTestimonials(reordered);

    try {
      await fetch("/api/admin/testimonials/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      });
    } catch (err) {
      console.error("Failed to reorder testimonials:", err);
      await loadData();
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await fetch(`/api/admin/testimonials/${deletingId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setTestimonials((prev) => prev.filter((t) => t.id !== deletingId));
      }
    } catch (err) {
      console.error("Failed to delete testimonial:", err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Quote className="w-5 h-5 text-indigo-400" />
            <span>Client &amp; Partner Testimonials</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage endorsements and reviews. Testimonials are only rendered publicly if the master switch below is ON.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Testimonial</span>
        </button>
      </div>

      {/* Global Setting Banner */}
      <div className="p-4 rounded-2xl bg-[#090d16] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <span className="text-xs font-semibold text-white">
            Global Display Setting
          </span>
          <p className="text-[11px] text-slate-400">
            Current status: {showOnSite ? (
              <span className="text-emerald-400 font-semibold">Testimonials Section is VISIBLE on public website</span>
            ) : (
              <span className="text-amber-400 font-semibold">Testimonials Section is HIDDEN on public website (Default)</span>
            )}
          </p>
        </div>

        <button
          onClick={handleToggleGlobal}
          disabled={togglingGlobal}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
            showOnSite
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
              : "bg-white/[0.06] text-slate-300 border border-white/10 hover:bg-white/[0.1]"
          }`}
        >
          {showOnSite ? (
            <>
              <ToggleRight className="w-4 h-4 text-emerald-400" />
              <span>Visible on Site (Turn OFF)</span>
            </>
          ) : (
            <>
              <ToggleLeft className="w-4 h-4 text-slate-400" />
              <span>Hidden on Site (Turn ON)</span>
            </>
          )}
        </button>
      </div>

      {/* Testimonials List */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : testimonials.length === 0 ? (
        <div className="bg-[#090d16] border border-white/[0.08] rounded-2xl p-8 text-center">
          <Quote className="w-8 h-8 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-white">No testimonials added</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Add client endorsements. They will appear in the Testimonials carousel once published and the master toggle is ON.
          </p>
          <button
            onClick={handleOpenNew}
            className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-indigo-300 text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add First Testimonial</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {testimonials.map((item, idx) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-all ${
                item.published
                  ? "bg-[#090d16] border-white/[0.08]"
                  : "bg-[#090d16]/50 border-white/[0.04] opacity-60 hover:opacity-100"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.05] text-slate-400 border border-white/10">
                      #{idx + 1}
                    </span>

                    <span
                      className={`text-[10px] font-sans px-2 py-0.5 rounded-md ${
                        item.published
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                      }`}
                    >
                      {item.published ? "Published" : "Draft"}
                    </span>
                  </div>

                  <p className="text-xs text-white italic leading-relaxed">
                    &ldquo;{item.quote}&rdquo;
                  </p>

                  <div className="text-xs pt-0.5">
                    <span className="font-semibold text-white">{item.name}</span>
                    <span className="text-slate-400"> &bull; {item.roleOrCompany}</span>
                  </div>
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
                      disabled={idx === testimonials.length - 1}
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
                    title="Edit Testimonial"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setDeletingId(item.id)}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                    title="Delete Testimonial"
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
          <div className="bg-[#090d16] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl relative my-auto space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-base font-bold text-white">
                {isNew ? "Add Testimonial" : "Edit Testimonial"}
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
                  Client / Partner Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={60}
                  value={editingItem.name || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  placeholder="e.g., Alex Johnson"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Role / Company <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={80}
                  value={editingItem.roleOrCompany || ""}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, roleOrCompany: e.target.value })
                  }
                  placeholder="e.g., Engineering Lead, HyperScale Labs"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Quote / Endorsement <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  maxLength={600}
                  value={editingItem.quote || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, quote: e.target.value })}
                  placeholder="Write client endorsement quote..."
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
                  <span className="text-slate-300 font-medium">Published</span>
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
                  <span>{saving ? "Saving..." : "Save Testimonial"}</span>
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
            <h3 className="text-base font-bold text-white text-center">Delete Testimonial?</h3>
            <p className="text-xs text-slate-400 text-center mt-1.5 leading-relaxed">
              This action cannot be undone. This review will be permanently deleted.
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
