"use client";

import React, { useState, useEffect, useCallback } from "react";
import { formatAdminErrorMessage } from "@/lib/client/admin-errors";
import {
  Sliders,
  Mail,
  AlertTriangle,
  Check,
  Save,
  Power,
  Quote,
} from "lucide-react";
import type { SiteSettings } from "@/lib/server/content-types";

const InstagramIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const LinkedInIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export const SiteSettingsTab: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; isError: boolean } | null>(null);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const timer = setTimeout(() => {
      if (mounted) {
        loadSettings();
      }
    }, 0);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [loadSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setFeedback({ text: formatAdminErrorMessage(res, data, null, "update settings"), isError: true });
      } else {
        setFeedback({ text: "Global settings successfully updated!", isError: false });
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (err) {
      setFeedback({ text: formatAdminErrorMessage(null, null, err, "save settings"), isError: true });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Sliders className="w-5 h-5 text-indigo-400" />
          <span>Site Configuration &amp; Metadata</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Global parameters, public contact routing, social profiles, and emergency maintenance controls.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            feedback.isError
              ? "bg-red-500/10 border border-red-500/30 text-red-300"
              : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
          }`}
        >
          {feedback.isError ? (
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
          ) : (
            <Check className="w-4 h-4 shrink-0 text-emerald-400" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5 text-xs">
        {/* Contact Channels */}
        <div className="bg-[#090d16] border border-white/[0.08] rounded-2xl p-5 sm:p-6 space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-white/[0.06] pb-2">
            Public Contact &amp; Channels
          </h3>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Public Contact Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Instagram URL
              </label>
              <div className="relative">
                <InstagramIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={settings.instagramUrl}
                  onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                  placeholder="https://instagram.com/..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                LinkedIn URL
              </label>
              <div className="relative">
                <LinkedInIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={settings.linkedinUrl}
                  onChange={(e) => setSettings({ ...settings, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/company/..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Footer Mono Tagline
            </label>
            <input
              type="text"
              required
              maxLength={100}
              value={settings.footerTagline}
              onChange={(e) => setSettings({ ...settings, footerTagline: e.target.value })}
              placeholder="IDEA ───── BUILD ───── EVOLVE"
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white font-mono placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Global Feature Toggles */}
        <div className="bg-[#090d16] border border-white/[0.08] rounded-2xl p-5 sm:p-6 space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-white/[0.06] pb-2">
            Section Displays &amp; Emergency Mode
          </h3>

          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="space-y-0.5">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Quote className="w-4 h-4 text-indigo-400" />
                <span>Show Testimonials Section</span>
              </span>
              <p className="text-[11px] text-slate-400">
                Display client quotes and partner feedback in the homepage feed. Default is OFF.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showTestimonials}
                onChange={(e) => setSettings({ ...settings, showTestimonials: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/05 border border-amber-500/20">
            <div className="space-y-0.5">
              <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                <Power className="w-4 h-4 text-amber-400" />
                <span>Maintenance Mode</span>
              </span>
              <p className="text-[11px] text-slate-400">
                When enabled, visitors will see a full-page system upgrade shield overlay.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? "Saving Changes..." : "Save All Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
