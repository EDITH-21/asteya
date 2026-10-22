"use client";

import React, { useState, useEffect, useCallback } from "react";
import { formatAdminErrorMessage } from "@/lib/client/admin-errors";
import {
  Users,
  Plus,
  Trash2,
  Edit3,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  X,
  Save,
  Check,
  Building,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import type { AboutContent, TeamMember } from "@/lib/server/content-types";

export const AboutAndTeamTab: React.FC = () => {
  // About Content State
  const [about, setAbout] = useState<AboutContent | null>(null);
  const [loadingAbout, setLoadingAbout] = useState(true);
  const [savingAbout, setSavingAbout] = useState(false);
  const [aboutMsg, setAboutMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Team State
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [editingMember, setEditingMember] = useState<Partial<TeamMember> | null>(null);
  const [isNewMember, setIsNewMember] = useState(false);
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);
  const [teamErrorMsg, setTeamErrorMsg] = useState<string | null>(null);
  const [savingMember, setSavingMember] = useState(false);

  const loadAboutData = useCallback(async () => {
    setLoadingAbout(true);
    try {
      const res = await fetch("/api/admin/about");
      if (res.ok) {
        const data = await res.json();
        setAbout(data.about);
      }
    } catch (err) {
      console.error("Failed to load about content:", err);
    } finally {
      setLoadingAbout(false);
    }
  }, []);

  const loadTeamData = useCallback(async () => {
    setLoadingTeam(true);
    try {
      const res = await fetch("/api/admin/team");
      if (res.ok) {
        const data = await res.json();
        setTeam(data.team || []);
      }
    } catch (err) {
      console.error("Failed to load team:", err);
    } finally {
      setLoadingTeam(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const timer = setTimeout(() => {
      if (mounted) {
        loadAboutData();
        loadTeamData();
      }
    }, 0);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [loadAboutData, loadTeamData]);

  // Handle About Content Save
  const handleSaveAbout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!about) return;
    setSavingAbout(true);
    setAboutMsg(null);

    try {
      const res = await fetch("/api/admin/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(about),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setAboutMsg({ text: formatAdminErrorMessage(res, data, null, "update About content"), isError: true });
      } else {
        setAboutMsg({ text: "About page content successfully saved!", isError: false });
        setTimeout(() => setAboutMsg(null), 3000);
      }
    } catch (err) {
      setAboutMsg({ text: formatAdminErrorMessage(null, null, err, "save about content"), isError: true });
    } finally {
      setSavingAbout(false);
    }
  };

  // Values handlers
  const handleAddValue = () => {
    if (!about || (about.values && about.values.length >= 6)) return;
    const currentValues = about.values || [];
    setAbout({
      ...about,
      values: [...currentValues, { title: "", text: "" }],
    });
  };

  const handleRemoveValue = (index: number) => {
    if (!about) return;
    setAbout({
      ...about,
      values: (about.values || []).filter((_, i) => i !== index),
    });
  };

  const handleValueChange = (index: number, field: "title" | "text", val: string) => {
    if (!about) return;
    const updated = [...(about.values || [])];
    updated[index] = { ...updated[index], [field]: val };
    setAbout({ ...about, values: updated });
  };

  // Team Member Modal Open
  const handleOpenNewMember = () => {
    setIsNewMember(true);
    setEditingMember({
      name: "",
      displayRole: "",
      bio: "",
      photoUrl: "",
      linkedinUrl: "",
      published: true,
      order: team.length + 1,
    });
    setTeamErrorMsg(null);
  };

  const handleOpenEditMember = (item: TeamMember) => {
    setIsNewMember(false);
    setEditingMember({ ...item });
    setTeamErrorMsg(null);
  };

  // Save Team Member
  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    setSavingMember(true);
    setTeamErrorMsg(null);

    const payload = {
      name: editingMember.name?.trim(),
      displayRole: editingMember.displayRole?.trim(),
      bio: editingMember.bio?.trim() || undefined,
      photoUrl: editingMember.photoUrl?.trim() || undefined,
      linkedinUrl: editingMember.linkedinUrl?.trim() || undefined,
      published: Boolean(editingMember.published),
      order: editingMember.order ?? 1,
    };

    try {
      const url = isNewMember
        ? "/api/admin/team"
        : `/api/admin/team/${editingMember.id}`;
      const method = isNewMember ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setTeamErrorMsg(formatAdminErrorMessage(res, data, null, "save team member"));
      } else {
        setEditingMember(null);
        await loadTeamData();
      }
    } catch (err) {
      setTeamErrorMsg(formatAdminErrorMessage(null, null, err, "save team member"));
    } finally {
      setSavingMember(false);
    }
  };

  const handleToggleMemberPublish = async (item: TeamMember) => {
    try {
      const updated = !item.published;
      const res = await fetch(`/api/admin/team/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...item,
          published: updated,
        }),
      });
      if (res.ok) {
        setTeam((prev) =>
          prev.map((m) => (m.id === item.id ? { ...m, published: updated } : m))
        );
      }
    } catch (err) {
      console.error("Failed to toggle team member publish:", err);
    }
  };

  const handleReorderTeam = async (currentIndex: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= team.length) return;

    const reordered = [...team];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    const orderedIds = reordered.map((m) => m.id);
    setTeam(reordered);

    try {
      await fetch("/api/admin/team/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      });
    } catch (err) {
      console.error("Failed to reorder team members:", err);
      await loadTeamData();
    }
  };

  const handleDeleteMember = async () => {
    if (!deletingMemberId) return;
    try {
      const res = await fetch(`/api/admin/team/${deletingMemberId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setTeam((prev) => prev.filter((m) => m.id !== deletingMemberId));
      }
    } catch (err) {
      console.error("Failed to delete team member:", err);
    } finally {
      setDeletingMemberId(null);
    }
  };

  return (
    <div className="space-y-10">
      {/* ------------------------------------------------------------- */}
      {/* SECTION 1: ABOUT CONTENT */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Building className="w-5 h-5 text-indigo-400" />
            <span>About Content &amp; Company Narrative</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage headline, founding story, mission, vision, and core operating principles.
          </p>
        </div>

        {aboutMsg && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              aboutMsg.isError
                ? "bg-red-500/10 border border-red-500/30 text-red-300"
                : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
            }`}
          >
            {aboutMsg.isError ? (
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            ) : (
              <Check className="w-4 h-4 shrink-0 text-emerald-400" />
            )}
            <span>{aboutMsg.text}</span>
          </div>
        )}

        {loadingAbout ? (
          <div className="py-8 flex justify-center">
            <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : about ? (
          <form
            onSubmit={handleSaveAbout}
            className="bg-[#090d16] border border-white/[0.08] rounded-2xl p-5 sm:p-6 space-y-4 text-xs"
          >
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Headline <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={120}
                value={about.headline || ""}
                onChange={(e) => setAbout({ ...about, headline: e.target.value })}
                placeholder="Technology should move humanity forward."
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Story / Narrative <span className="text-red-400">*</span>
                <span className="text-[10px] text-slate-400 font-normal ml-2">
                  (Supports **bold**, *italic*, [link](https://...))
                </span>
              </label>
              <textarea
                required
                rows={3}
                maxLength={1000}
                value={about.story || ""}
                onChange={(e) => setAbout({ ...about, story: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Mission</label>
                <textarea
                  rows={2}
                  maxLength={500}
                  value={about.mission || ""}
                  onChange={(e) => setAbout({ ...about, mission: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Vision</label>
                <textarea
                  rows={2}
                  maxLength={500}
                  value={about.vision || ""}
                  onChange={(e) => setAbout({ ...about, vision: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>
            </div>

            {/* Core Values */}
            <div className="border-t border-white/[0.08] pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">Operating Values</span>
                  <span className="text-[10px] text-slate-400">
                    Up to 6 principles rendered in the About Section grid.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAddValue}
                  disabled={(about.values || []).length >= 6}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-indigo-300 text-xs font-medium transition-colors disabled:opacity-40"
                >
                  + Add Value
                </button>
              </div>

              <div className="space-y-2.5">
                {(about.values || []).map((val, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col sm:flex-row gap-2.5 items-start sm:items-center"
                  >
                    <input
                      type="text"
                      placeholder="Title (e.g. Precision Engineering)"
                      value={val.title}
                      maxLength={60}
                      onChange={(e) => handleValueChange(idx, "title", e.target.value)}
                      className="w-full sm:w-1/3 px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white placeholder:text-slate-400"
                    />
                    <input
                      type="text"
                      placeholder="Description text"
                      value={val.text}
                      maxLength={200}
                      onChange={(e) => handleValueChange(idx, "text", e.target.value)}
                      className="flex-1 w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveValue(idx)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/[0.04] self-end sm:self-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-white/[0.08]">
              <button
                type="submit"
                disabled={savingAbout}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingAbout ? "Saving..." : "Save About Content"}</span>
              </button>
            </div>
          </form>
        ) : null}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 2: LEADERSHIP TEAM */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-4 border-t border-white/[0.08] pt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              <span>Leadership &amp; Team Members</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Founding members and core team. Note: C-suite titles (CEO, CTO, COO) are strictly forbidden across all roles.
            </p>
          </div>

          <button
            onClick={handleOpenNewMember}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-600/30 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Team Member</span>
          </button>
        </div>

        {loadingTeam ? (
          <div className="py-8 flex justify-center">
            <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : team.length === 0 ? (
          <div className="bg-[#090d16] border border-white/[0.08] rounded-2xl p-8 text-center">
            <Users className="w-8 h-8 text-slate-400 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-white">No team members listed</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Add founders and leadership members to display in the About section.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {team.map((member, idx) => (
              <div
                key={member.id}
                className={`p-4 rounded-xl border transition-all ${
                  member.published
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
                          member.published
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                        }`}
                      >
                        {member.published ? "Published" : "Draft"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Initials Avatar fallback */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center font-bold text-white text-xs">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <span>{member.name}</span>
                          {member.linkedinUrl && (
                            <a
                              href={member.linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-400 hover:text-indigo-300 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </h3>
                        <p className="text-xs text-indigo-300 font-medium">
                          {member.displayRole}
                        </p>
                      </div>
                    </div>

                    {member.bio && (
                      <p className="text-xs text-slate-300 leading-relaxed max-w-2xl pt-1">
                        {member.bio}
                      </p>
                    )}
                  </div>

                  {/* Actions & Reordering */}
                  <div className="flex items-center gap-1.5 self-end sm:self-start shrink-0 pt-1 sm:pt-0">
                    <div className="flex items-center border border-white/10 rounded-lg p-0.5 bg-white/[0.02]">
                      <button
                        onClick={() => handleReorderTeam(idx, "up")}
                        disabled={idx === 0}
                        className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleReorderTeam(idx, "down")}
                        disabled={idx === team.length - 1}
                        className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleToggleMemberPublish(member)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        member.published
                          ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20"
                          : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20"
                      }`}
                    >
                      {member.published ? "Unpublish" : "Publish"}
                    </button>

                    <button
                      onClick={() => handleOpenEditMember(member)}
                      className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-colors"
                      title="Edit Member"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setDeletingMemberId(member.id)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                      title="Delete Member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Team Member Edit / Create Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#090d16] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl relative my-auto space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-base font-bold text-white">
                {isNewMember ? "Add Team Member" : "Edit Team Member"}
              </h3>
              <button
                onClick={() => setEditingMember(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.06]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {teamErrorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{teamErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveMember} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={60}
                  value={editingMember.name || ""}
                  onChange={(e) =>
                    setEditingMember({ ...editingMember, name: e.target.value })
                  }
                  placeholder="e.g., Shivam Tiwari"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Display Role <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={60}
                  value={editingMember.displayRole || ""}
                  onChange={(e) =>
                    setEditingMember({ ...editingMember, displayRole: e.target.value })
                  }
                  placeholder="e.g., Founder, Co-Founder, Head of Engineering"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[10px] text-amber-400/80 mt-1 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 shrink-0" />
                  <span>C-suite titles (CEO, CTO, COO) are rejected by policy.</span>
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Short Bio <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  maxLength={400}
                  value={editingMember.bio || ""}
                  onChange={(e) =>
                    setEditingMember({ ...editingMember, bio: e.target.value })
                  }
                  placeholder="Optional brief background..."
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Photo Path <span className="text-[10px] text-slate-400 font-normal">(/public path or allowlisted https)</span>
                </label>
                <input
                  type="text"
                  maxLength={200}
                  value={editingMember.photoUrl || ""}
                  onChange={(e) =>
                    setEditingMember({ ...editingMember, photoUrl: e.target.value })
                  }
                  placeholder="/images/team/avatar.jpg"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  LinkedIn URL <span className="text-[10px] text-slate-400 font-normal">(https:// only)</span>
                </label>
                <input
                  type="text"
                  maxLength={200}
                  value={editingMember.linkedinUrl || ""}
                  onChange={(e) =>
                    setEditingMember({ ...editingMember, linkedinUrl: e.target.value })
                  }
                  placeholder="https://linkedin.com/in/..."
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-1">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editingMember.published)}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, published: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-0 bg-black/40 border-white/20"
                  />
                  <span className="text-slate-300 font-medium">Published</span>
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingMember}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingMember ? "Saving..." : "Save Member"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Member Confirmation Modal */}
      {deletingMemberId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#090d16] border border-white/10 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative my-auto">
            <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto mb-4">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white text-center">Delete Team Member?</h3>
            <p className="text-xs text-slate-400 text-center mt-1.5 leading-relaxed">
              This action cannot be undone. This person will be removed from the public leadership grid.
            </p>
            <div className="flex gap-2.5 mt-6">
              <button
                onClick={() => setDeletingMemberId(null)}
                className="flex-1 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-medium text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteMember}
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
