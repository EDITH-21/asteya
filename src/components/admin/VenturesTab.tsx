"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Rocket,
  Plus,
  Trash2,
  Edit3,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Sparkles,
  AlertTriangle,
  X,
  Save,
} from "lucide-react";
import type { Venture, VentureStatus, VentureStat } from "@/lib/server/content-types";

export const VenturesTab: React.FC = () => {
  const [ventures, setVentures] = useState<Venture[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingVenture, setEditingVenture] = useState<Partial<Venture> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [rawTags, setRawTags] = useState("");
  const [statsList, setStatsList] = useState<VentureStat[]>([]);

  const loadVentures = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/ventures");
      if (res.ok) {
        const data = await res.json();
        setVentures(data.ventures || []);
      }
    } catch (err) {
      console.error("Failed to load ventures:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleImportDefaults = async () => {
    setImporting(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/admin/ventures/import", {
        method: "POST",
      });
      if (res.ok) {
        await loadVentures();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Failed to import ventures");
      }
    } catch {
      setErrorMsg("Network error importing ventures");
    } finally {
      setImporting(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const timer = setTimeout(() => {
      if (mounted) {
        loadVentures();
      }
    }, 0);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [loadVentures]);

  const handleOpenNew = () => {
    setIsNew(true);
    setEditingVenture({
      name: "",
      tagline: "",
      description: "",
      status: "In development",
      label: "Aadrut Venture Labs",
      link: "",
      imageUrl: "",
      featured: false,
      published: true,
      order: ventures.length + 1,
    });
    setRawTags("");
    setStatsList([]);
    setErrorMsg(null);
  };

  const handleOpenEdit = (item: Venture) => {
    setIsNew(false);
    setEditingVenture({ ...item });
    setRawTags(item.tags?.join(", ") || "");
    setStatsList(item.stats ? [...item.stats] : []);
    setErrorMsg(null);
  };

  const handleAddStatRow = () => {
    if (statsList.length >= 6) return;
    setStatsList([...statsList, { label: "", value: "" }]);
  };

  const handleRemoveStatRow = (index: number) => {
    setStatsList(statsList.filter((_, idx) => idx !== index));
  };

  const handleStatChange = (index: number, field: "label" | "value", val: string) => {
    const updated = [...statsList];
    updated[index] = { ...updated[index], [field]: val };
    setStatsList(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVenture) return;
    setSaving(true);
    setErrorMsg(null);

    const parsedTags = rawTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const validStats = statsList
      .filter((s) => s.label.trim() && s.value.trim())
      .map((s) => ({ label: s.label.trim(), value: s.value.trim() }));

    const payload = {
      name: editingVenture.name?.trim(),
      tagline: editingVenture.tagline?.trim(),
      description: editingVenture.description?.trim(),
      status: editingVenture.status || "In development",
      label: editingVenture.label?.trim() || "",
      link: editingVenture.link?.trim() || "",
      imageUrl: editingVenture.imageUrl?.trim() || "",
      tags: parsedTags,
      featured: Boolean(editingVenture.featured),
      published: Boolean(editingVenture.published),
      order: editingVenture.order ?? 1,
      stats: validStats,
    };

    try {
      const url = isNew
        ? "/api/admin/ventures"
        : `/api/admin/ventures/${editingVenture.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data: { error?: string } | null = null;
      try {
        data = await res.json();
      } catch {
        // response was not JSON
      }

      if (!res.ok) {
        setErrorMsg(data?.error || `Failed to save venture (${res.status})`);
      } else {
        setEditingVenture(null);
        await loadVentures();
      }
    } catch (err) {
      console.error("Venture save error:", err);
      setErrorMsg("Network error saving venture: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (item: Venture) => {
    try {
      const updatedPublished = !item.published;
      const res = await fetch(`/api/admin/ventures/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...item,
          published: updatedPublished,
        }),
      });
      if (res.ok) {
        setVentures((prev) =>
          prev.map((v) => (v.id === item.id ? { ...v, published: updatedPublished } : v))
        );
      } else {
        const data = await res.json().catch(() => null);
        console.error("Failed to toggle publish status:", data?.error || res.status);
      }
    } catch (err) {
      console.error("Failed to toggle publish status:", err);
    }
  };

  const handleReorder = async (currentIndex: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= ventures.length) return;

    const reordered = [...ventures];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    const orderedIds = reordered.map((v) => v.id);
    setVentures(reordered);

    try {
      await fetch("/api/admin/ventures/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      });
    } catch (err) {
      console.error("Failed to persist venture order:", err);
      await loadVentures();
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await fetch(`/api/admin/ventures/${deletingId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setVentures((prev) => prev.filter((v) => v.id !== deletingId));
      }
    } catch (err) {
      console.error("Failed to delete venture:", err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Rocket className="w-5 h-5 text-indigo-400" />
            <span>Ventures &amp; Incubation Products</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Full management of Attenza and future pipeline ventures displayed in the homepage Ventures Spotlight.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Venture</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : ventures.length === 0 ? (
        <div className="bg-[#090d16] border border-white/[0.08] rounded-2xl p-8 text-center">
          <Rocket className="w-8 h-8 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-white">No ventures registered</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Add internal ventures like Attenza or incubation concepts to showcase in the public portfolio.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleOpenNew}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-indigo-300 text-xs font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create First Venture</span>
            </button>
            <button
              onClick={handleImportDefaults}
              disabled={importing}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600/30 text-indigo-300 text-xs font-medium transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{importing ? "Importing..." : "Import existing ventures"}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {ventures.map((item, idx) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-all ${
                item.published
                  ? item.featured
                    ? "bg-indigo-950/20 border-indigo-500/40 shadow-lg shadow-indigo-500/5"
                    : "bg-[#090d16] border-white/[0.08]"
                  : "bg-[#090d16]/50 border-white/[0.04] opacity-60 hover:opacity-100"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.05] text-slate-400 border border-white/10">
                      #{idx + 1}
                    </span>

                    {item.featured && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-sans px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                        <Sparkles className="w-3 h-3" />
                        Featured Spotlight
                      </span>
                    )}

                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-md font-bold ${
                        item.status === "Live"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : item.status === "In development"
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                          : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      }`}
                    >
                      {item.status}
                    </span>

                    <span
                      className={`text-[10px] font-sans px-2 py-0.5 rounded-md ${
                        item.published
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                      }`}
                    >
                      {item.published ? "Published" : "Draft / Hidden"}
                    </span>

                    {item.label && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-400 border border-white/10">
                        {item.label}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>{item.name}</span>
                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-indigo-300 transition-colors"
                          title="Open external link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </h3>
                    <p className="text-xs text-indigo-300 font-medium mt-0.5">{item.tagline}</p>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                    {item.description}
                  </p>

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-slate-300 border border-white/10"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Stats summary */}
                  {item.stats && item.stats.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 max-w-xl">
                      {item.stats.map((st, sIdx) => (
                        <div
                          key={sIdx}
                          className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.06]"
                        >
                          <div className="text-xs font-bold text-white font-mono">{st.value}</div>
                          <div className="text-[10px] text-slate-400 font-sans">{st.label}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions & Reordering */}
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
                      disabled={idx === ventures.length - 1}
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
                    title="Edit Venture"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setDeletingId(item.id)}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                    title="Delete Venture"
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
      {editingVenture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#090d16] border border-white/10 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative my-auto space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-base font-bold text-white">
                {isNew ? "Create Venture" : "Edit Venture"}
              </h3>
              <button
                onClick={() => setEditingVenture(null)}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Venture Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={80}
                    value={editingVenture.name || ""}
                    onChange={(e) =>
                      setEditingVenture({ ...editingVenture, name: e.target.value })
                    }
                    placeholder="e.g., Attenza"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Status</label>
                  <select
                    value={editingVenture.status || "In development"}
                    onChange={(e) =>
                      setEditingVenture({
                        ...editingVenture,
                        status: e.target.value as VentureStatus,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Live">Live</option>
                    <option value="In development">In development</option>
                    <option value="Coming soon">Coming soon</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Venture Label / Division <span className="text-[10px] text-slate-400 font-normal">(e.g., Aadrut Venture Labs)</span>
                </label>
                <input
                  type="text"
                  maxLength={80}
                  value={editingVenture.label || ""}
                  onChange={(e) =>
                    setEditingVenture({ ...editingVenture, label: e.target.value })
                  }
                  placeholder="e.g., Aadrut Venture Labs"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Tagline <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={160}
                  value={editingVenture.tagline || ""}
                  onChange={(e) =>
                    setEditingVenture({ ...editingVenture, tagline: e.target.value })
                  }
                  placeholder="e.g., Intelligent Attention & Productivity Orchestration"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  maxLength={1000}
                  value={editingVenture.description || ""}
                  onChange={(e) =>
                    setEditingVenture({ ...editingVenture, description: e.target.value })
                  }
                  placeholder="Briefly describe what this venture solves and achieves..."
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    External Link <span className="text-[10px] text-slate-400 font-normal">(https:// only)</span>
                  </label>
                  <input
                    type="text"
                    maxLength={200}
                    value={editingVenture.link || ""}
                    onChange={(e) =>
                      setEditingVenture({ ...editingVenture, link: e.target.value })
                    }
                    placeholder="https://attenza.aadrut.com"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Image / Icon URL <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    maxLength={500}
                    value={editingVenture.imageUrl || ""}
                    onChange={(e) =>
                      setEditingVenture({ ...editingVenture, imageUrl: e.target.value })
                    }
                    placeholder="https://example.com/logo.png"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Tags <span className="text-[10px] text-slate-400 font-normal">(comma-separated)</span>
                </label>
                <input
                  type="text"
                  value={rawTags}
                  onChange={(e) => setRawTags(e.target.value)}
                  placeholder="Next.js, AI, Automation"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Stats Section */}
              <div className="border border-white/[0.08] rounded-xl p-3 bg-white/[0.01] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-white block">Key Metric Badges</span>
                    <span className="text-[10px] text-slate-400">
                      Optional telemetry stats. If empty, the stats block will automatically hide.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddStatRow}
                    disabled={statsList.length >= 6}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-indigo-300 text-[11px] font-medium transition-colors disabled:opacity-40"
                  >
                    + Add Stat
                  </button>
                </div>

                {statsList.length > 0 && (
                  <div className="space-y-2 pt-1">
                    {statsList.map((st, sIdx) => (
                      <div key={sIdx} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Label (e.g. Active Nodes)"
                          value={st.label}
                          maxLength={30}
                          onChange={(e) => handleStatChange(sIdx, "label", e.target.value)}
                          className="flex-1 px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white placeholder:text-slate-400 text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Value (e.g. 100+)"
                          value={st.value}
                          maxLength={30}
                          onChange={(e) => handleStatChange(sIdx, "value", e.target.value)}
                          className="w-28 px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white placeholder:text-slate-400 text-xs font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveStatRow(sIdx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/[0.04]"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editingVenture.featured)}
                    onChange={(e) =>
                      setEditingVenture({ ...editingVenture, featured: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-0 bg-black/40 border-white/20"
                  />
                  <span className="text-slate-300 font-medium">Spotlight as Featured Venture</span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editingVenture.published)}
                    onChange={(e) =>
                      setEditingVenture({ ...editingVenture, published: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-0 bg-black/40 border-white/20"
                  />
                  <span className="text-slate-300 font-medium">Published on live site</span>
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setEditingVenture(null)}
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
                  <span>{saving ? "Saving..." : "Save Venture"}</span>
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
            <h3 className="text-base font-bold text-white text-center">Delete Venture?</h3>
            <p className="text-xs text-slate-400 text-center mt-1.5 leading-relaxed">
              This action cannot be undone. This venture card will be permanently removed from the portfolio.
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
