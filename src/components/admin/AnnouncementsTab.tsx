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
  Eye,
  Info,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import type { Announcement, AnnouncementType, AnnouncementDisplayStyle } from "@/lib/server/content-types";
import { SafeMarkdown } from "@/components/ui/SafeMarkdown";

/**
 * Indian Standard Time (IST) Helpers (UTC+05:30)
 */
function utcToIstInput(utcIsoString?: string): string {
  if (!utcIsoString) return "";
  const d = new Date(utcIsoString);
  if (isNaN(d.getTime())) return "";
  // IST is UTC + 5h30m (330 minutes)
  const istOffsetMs = 330 * 60 * 1000;
  const istDate = new Date(d.getTime() + istOffsetMs);
  return istDate.toISOString().slice(0, 16);
}

function istInputToUtc(istLocalString: string): string {
  if (!istLocalString) return "";
  const [datePart, timePart] = istLocalString.split("T");
  if (!datePart || !timePart) return "";
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  const utcDate = new Date(Date.UTC(year, month - 1, day, hour - 5, minute - 30));
  return utcDate.toISOString();
}

function formatInIst(utcIsoString?: string): string {
  if (!utcIsoString) return "";
  const d = new Date(utcIsoString);
  if (isNaN(d.getTime())) return "";
  return (
    d.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }) + " IST"
  );
}

type AnnouncementStatusType = "Live now" | "Scheduled" | "Expired" | "Off";

function getAnnouncementStatus(item: Announcement, now = new Date()): {
  label: AnnouncementStatusType;
  badgeClass: string;
  dotColor?: string;
} {
  if (item.endDate && new Date(item.endDate).getTime() < now.getTime()) {
    return {
      label: "Expired",
      badgeClass: "bg-rose-500/10 text-rose-300 border-rose-500/30",
    };
  }
  if (!item.active) {
    return {
      label: "Off",
      badgeClass: "bg-slate-500/10 text-slate-400 border-slate-500/30",
    };
  }
  if (item.startDate && new Date(item.startDate).getTime() > now.getTime()) {
    return {
      label: "Scheduled",
      badgeClass: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
    };
  }
  return {
    label: "Live now",
    badgeClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    dotColor: "bg-emerald-400",
  };
}

export const AnnouncementsTab: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Partial<Announcement> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewItem, setPreviewItem] = useState<Partial<Announcement> | null>(null);

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

      if (res.ok) {
        setEditingItem(null);
        await loadAnnouncements();
      } else {
        const data = await res.json().catch(() => null);
        setErrorMsg(formatAdminErrorMessage(res, data, null, "saving announcement"));
      }
    } catch (err) {
      setErrorMsg(formatAdminErrorMessage(null, null, err, "saving announcement"));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (item: Announcement) => {
    try {
      const res = await fetch(`/api/admin/announcements/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !item.active }),
      });
      if (res.ok) {
        await loadAnnouncements();
      } else {
        const data = await res.json().catch(() => null);
        console.error("Failed to toggle status:", formatAdminErrorMessage(res, data, null, "toggling status"));
      }
    } catch (err) {
      console.error("Failed to toggle status:", formatAdminErrorMessage(null, null, err, "toggling status"));
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
            Broadcast high-priority notices, launch updates, or service banners across the website. Managed in Indian Standard Time (IST).
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
            Create an announcement to show an alert banner or popup modal to visitors on the live site.
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
          {announcements.map((item) => {
            const status = getAnnouncementStatus(item);
            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all ${
                  status.label === "Live now"
                    ? "bg-indigo-950/20 border-indigo-500/30 shadow-lg shadow-indigo-500/5"
                    : "bg-[#090d16] border-white/[0.06] opacity-80 hover:opacity-100"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* State Chip: Live now / Scheduled / Expired / Off */}
                      <span
                        className={`inline-flex items-center gap-1.5 text-[10px] font-sans px-2.5 py-0.5 rounded-md border font-semibold ${status.badgeClass}`}
                      >
                        {status.dotColor && (
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor} animate-pulse`} />
                        )}
                        <span>{status.label}</span>
                      </span>

                      {/* Tone Type */}
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

                      {/* Display Style */}
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-400 border border-white/10">
                        {item.displayStyle === "top_bar" ? "Top Banner" : "Popup Modal"}
                      </span>

                      {item.dismissible && (
                        <span className="text-[10px] font-sans text-slate-400">
                          Dismissible (7d memory)
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-white">{item.title}</h3>
                    <div className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                      <SafeMarkdown content={item.message} />
                    </div>

                    {(item.buttonLabel || item.startDate || item.endDate) && (
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400 font-sans">
                        {item.buttonLabel && item.buttonLink && (
                          <div className="inline-flex items-center gap-1 text-indigo-300">
                            <ExternalLink className="w-3 h-3" />
                            <span>
                              Button: &ldquo;{item.buttonLabel}&rdquo; &rarr; {item.buttonLink}
                            </span>
                          </div>
                        )}
                        {(item.startDate || item.endDate) && (
                          <div className="inline-flex items-center gap-1 text-slate-300">
                            <Calendar className="w-3 h-3 text-indigo-400" />
                            <span>
                              {item.startDate ? `From: ${formatInIst(item.startDate)}` : "Immediate"}
                              {item.endDate ? ` &bull; To: ${formatInIst(item.endDate)}` : ""}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-start shrink-0 pt-1 sm:pt-0">
                    <button
                      onClick={() => setPreviewItem(item)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-colors border border-white/[0.08]"
                      title="Preview announcement layout"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Preview</span>
                    </button>

                    <button
                      onClick={() => handleToggleActive(item)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        item.active
                          ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20"
                          : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20"
                      }`}
                    >
                      {item.active ? "Turn Off" : "Turn On"}
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
            );
          })}
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
                    <option value="popup">Center/Corner Popup Modal</option>
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

              {/* Start and End Times in IST */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Start Date / Time (IST)
                  </label>
                  <input
                    type="datetime-local"
                    value={utcToIstInput(editingItem.startDate)}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        startDate: istInputToUtc(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[10px] text-indigo-400/80 block mt-1">
                    Indian Standard Time (UTC+05:30)
                  </span>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    End Date / Time (IST)
                  </label>
                  <input
                    type="datetime-local"
                    value={utcToIstInput(editingItem.endDate)}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        endDate: istInputToUtc(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[10px] text-indigo-400/80 block mt-1">
                    Indian Standard Time (UTC+05:30)
                  </span>
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
                  <span className="text-slate-300 font-medium">Allow user to dismiss (7 days)</span>
                </label>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setPreviewItem(editingItem)}
                  className="px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-indigo-300 text-xs font-medium transition-colors inline-flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>

                <div className="flex gap-2.5">
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
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Public Site Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="max-w-xl w-full bg-[#05070b] border border-white/15 rounded-2xl p-6 shadow-2xl relative space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                  Public Website Preview ({previewItem.displayStyle === "top_bar" ? "Top Slim Bar" : "Corner Popup"})
                </span>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.06]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              This preview reflects how visitors on the public site will view this announcement:
            </p>

            {/* Preview Banner Container */}
            <div className="p-4 rounded-xl border border-white/10 bg-[#090d16] space-y-4">
              {previewItem.displayStyle === "top_bar" ? (
                <div
                  className={`w-full border rounded-xl px-4 py-3 flex items-center justify-between gap-3 text-xs sm:text-sm ${
                    previewItem.type === "warning"
                      ? "bg-amber-950/90 border-amber-500/30 text-amber-200"
                      : previewItem.type === "success"
                      ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-200"
                      : "bg-indigo-950/90 border-indigo-500/30 text-indigo-200"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {previewItem.type === "warning" ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : previewItem.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Info className="w-4 h-4 text-indigo-400 shrink-0" />
                    )}
                    <div className="leading-tight">
                      <span className="font-semibold text-white mr-1.5">{previewItem.title || "Announcement Title"}:</span>
                      <SafeMarkdown content={previewItem.message || "Announcement message will appear here."} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {previewItem.buttonLabel && (
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          previewItem.type === "warning"
                            ? "bg-amber-600 text-slate-950"
                            : previewItem.type === "success"
                            ? "bg-emerald-600 text-white"
                            : "bg-indigo-600 text-white"
                        }`}
                      >
                        <span>{previewItem.buttonLabel}</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    )}
                    {previewItem.dismissible && (
                      <button
                        type="button"
                        onClick={() => setPreviewItem(null)}
                        className="p-1 rounded-md text-slate-400 hover:text-white"
                        title="Dismiss preview"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div
                  className={`max-w-sm ml-auto border rounded-2xl p-4 shadow-xl ${
                    previewItem.type === "warning"
                      ? "bg-amber-950/95 border-amber-500/30 text-amber-200"
                      : previewItem.type === "success"
                      ? "bg-emerald-950/95 border-emerald-500/30 text-emerald-200"
                      : "bg-indigo-950/95 border-indigo-500/30 text-indigo-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4 text-indigo-400" />
                      <span className="font-semibold text-sm text-white">
                        {previewItem.title || "Announcement Title"}
                      </span>
                    </div>
                    {previewItem.dismissible && (
                      <button
                        type="button"
                        onClick={() => setPreviewItem(null)}
                        className="text-slate-400 hover:text-white p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="text-xs text-slate-200 leading-relaxed mb-3">
                    <SafeMarkdown content={previewItem.message || "Announcement message text will appear here."} />
                  </div>
                  {previewItem.buttonLabel && (
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${
                        previewItem.type === "warning"
                          ? "bg-amber-600 text-slate-950"
                          : previewItem.type === "success"
                          ? "bg-emerald-600 text-white"
                          : "bg-indigo-600 text-white"
                      }`}
                    >
                      <span>{previewItem.buttonLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPreviewItem(null)}
                className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-xs font-medium text-white transition-colors"
              >
                Close Preview
              </button>
            </div>
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
