"use client";

import React, { useState, useEffect, useCallback } from "react";
import { formatAdminErrorMessage } from "@/lib/client/admin-errors";
import {
  Megaphone,
  Plus,
  Trash2,
  Edit3,
  Calendar,
  ExternalLink,
  AlertTriangle,
  X,
  Save,
} from "lucide-react";
import type { Announcement, AnnouncementType, AnnouncementDisplayStyle } from "@/lib/server/content-types";

export const AnnouncementsTab: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Partial<Announcement> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/announcements");
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data.announcements || []);
      }
    } catch (err) {
      console.error("Failed to load announcements:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const timer = setTimeout(() => {
      if (mounted) {
        loadAnnouncements();
      }
    }, 0);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [loadAnnouncements]);

  const handleOpenNew = () => {
    setIsNew(true);
    setEditingItem({
      title: "",
      message: "",
      type: "info",
      buttonLabel: "",
      buttonLink: "",
      startDate: "",
      endDate: "",
      active: true,
      dismissible: true,
      displayStyle: "top_bar",
    });
    setErrorMsg(null);
  };

  const handleOpenEdit = (item: Announcement) => {
    setIsNew(false);
    setEditingItem({ ...item });
    setErrorMsg(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setSaving(true);
    setErrorMsg(null);

    try {
      const url = isNew
        ? "/api/admin/announcements"
        : `/api/admin/announcements/${editingItem.id}`;
      const method = isNew ? "POST" : "PUT";

      const payload = {
        title: editingItem.title?.trim(),
        message: editingItem.message?.trim(),
        type: editingItem.type || "info",
        buttonLabel: editingItem.buttonLabel?.trim() || undefined,
        buttonLink: editingItem.buttonLink?.trim() || undefined,
        startDate: editingItem.startDate?.trim() || undefined,
        endDate: editingItem.endDate?.trim() || undefined,
        active: Boolean(editingItem.active),
        dismissible: editingItem.dismissible ?? true,
        displayStyle: editingItem.displayStyle || "top_bar",
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data: { error?: string } | null = null;
      try {
        data = await res.json();
      } catch {
        // body was not JSON
      }

      if (!res.ok) {
        setErrorMsg(formatAdminErrorMessage(res, data, null, "save announcement"));
      } else {
        setEditingItem(null);
        await loadAnnouncements();
      }
    } catch (err) {
      console.error("Announcement save error:", err);
      setErrorMsg(formatAdminErrorMessage(null, null, err, "save announcement"));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (item: Announcement) => {
    try {
      const updatedActive = !item.active;
      const res = await fetch(`/api/admin/announcements/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...item,
          active: updatedActive,
        }),
      });
      if (res.ok) {
        await loadAnnouncements();
      } else {
        const data = await res.json().catch(() => null);
        console.error("Failed to toggle announcement:", data?.error || res.status);
      }
    } catch (err) {
      console.error("Failed to toggle announcement:", err);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await fetch(`/api/admin/announcements/${deletingId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setAnnouncements((prev) => prev.filter((a) => a.id !== deletingId));
      }
    } catch (err) {
      console.error("Failed to delete announcement:", err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-indigo-400" />
            <span>Announcements &amp; Alerts</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Broadcast high-priority notices, launch updates, or service banners across the website. Only one announcement can be active at a time.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Announcement</span>
        </button>
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-[#090d16] border border-white/[0.08] rounded-2xl p-8 text-center">
          <Megaphone className="w-8 h-8 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-white">No announcements configured</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Create an announcement to show an alert banner or modal popup to visitors on the live site.
          </p>
          <button
            onClick={handleOpenNew}
            className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-indigo-300 text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Announcement</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-all ${
                item.active
                  ? "bg-indigo-950/20 border-indigo-500/30 shadow-lg shadow-indigo-500/5"
                  : "bg-[#090d16] border-white/[0.06] opacity-75 hover:opacity-100"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-md font-bold ${
                        item.type === "warning"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : item.type === "success"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                      }`}
                    >
                      {item.type}
                    </span>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-400 border border-white/10">
                      {item.displayStyle === "top_bar" ? "Top Banner" : "Popup Modal"}
                    </span>

                    {item.active ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-sans px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Live on Site
                      </span>
                    ) : (
                      <span className="text-[10px] font-sans px-2 py-0.5 rounded-md bg-white/[0.02] text-slate-400 border border-white/[0.06]">
                        Inactive
                      </span>
                    )}

                    {item.dismissible && (
                      <span className="text-[10px] font-sans text-slate-400">
                        Dismissible
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white">{item.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                    {item.message}
                  </p>

                  {(item.buttonLabel || item.startDate || item.endDate) && (
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400 font-sans">
                      {item.buttonLabel && item.buttonLink && (
                        <div className="inline-flex items-center gap-1 text-indigo-300">
                          <ExternalLink className="w-3 h-3" />
                          <span>Button: &ldquo;{item.buttonLabel}&rdquo; &rarr; {item.buttonLink}</span>
                        </div>
                      )}
                      {(item.startDate || item.endDate) && (
                        <div className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {item.startDate ? `From: ${new Date(item.startDate).toLocaleDateString()}` : "Immediate"}
                            {item.endDate ? ` &bull; To: ${new Date(item.endDate).toLocaleDateString()}` : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-start shrink-0 pt-1 sm:pt-0">
                  <button
                    onClick={() => handleToggleActive(item)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      item.active
                        ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20"
                        : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20"
                    }`}
                  >
                    {item.active ? "Deactivate" : "Activate"}
                  </button>

                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-colors"
                    title="Edit Announcement"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setDeletingId(item.id)}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                    title="Delete Announcement"
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
                {isNew ? "Create Announcement" : "Edit Announcement"}
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
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={120}
                  value={editingItem.title || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  placeholder="e.g., Aadrut Ventures Launch"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Message <span className="text-red-400">*</span>
                  <span className="text-[10px] text-slate-400 font-normal ml-2">
                    (Supports **bold**, *italic*, [link](https://...))
                  </span>
                </label>
                <textarea
                  required
                  rows={3}
                  maxLength={500}
                  value={editingItem.message || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, message: e.target.value })}
                  placeholder="Enter clear, concise announcement text..."
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tone / Type</label>
                  <select
                    value={editingItem.type || "info"}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        type: e.target.value as AnnouncementType,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="info">Info (Indigo)</option>
                    <option value="success">Success (Emerald)</option>
                    <option value="warning">Warning (Amber)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Display Style</label>
                  <select
                    value={editingItem.displayStyle || "top_bar"}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        displayStyle: e.target.value as AnnouncementDisplayStyle,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="top_bar">Top Sticky Bar</option>
                    <option value="popup">Center Popup Modal</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Button Label <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    maxLength={30}
                    value={editingItem.buttonLabel || ""}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, buttonLabel: e.target.value })
                    }
                    placeholder="e.g., Learn More"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Button Link <span className="text-[10px] text-slate-400 font-normal">(https:// or /...)</span>
                  </label>
                  <input
                    type="text"
                    maxLength={200}
                    value={editingItem.buttonLink || ""}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, buttonLink: e.target.value })
                    }
                    placeholder="https://... or /services"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Start Date/Time <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={
                      editingItem.startDate
                        ? new Date(editingItem.startDate).toISOString().slice(0, 16)
                        : ""
                    }
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        startDate: e.target.value ? new Date(e.target.value).toISOString() : "",
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    End Date/Time <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={
                      editingItem.endDate
                        ? new Date(editingItem.endDate).toISOString().slice(0, 16)
                        : ""
                    }
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        endDate: e.target.value ? new Date(e.target.value).toISOString() : "",
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editingItem.active)}
                    onChange={(e) => setEditingItem({ ...editingItem, active: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-0 bg-black/40 border-white/20"
                  />
                  <span className="text-slate-300 font-medium">Activate immediately</span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.dismissible ?? true}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, dismissible: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-0 bg-black/40 border-white/20"
                  />
                  <span className="text-slate-300 font-medium">Allow user to dismiss</span>
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
                  <span>{saving ? "Saving..." : "Save Announcement"}</span>
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
            <h3 className="text-base font-bold text-white text-center">Delete Announcement?</h3>
            <p className="text-xs text-slate-400 text-center mt-1.5 leading-relaxed">
              This action cannot be undone. This notice will be immediately removed from the website.
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
