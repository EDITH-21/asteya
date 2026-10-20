"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AadrutLogo } from "@/components/ui/AadrutLogo";
import {
  Inbox,
  LayoutDashboard,
  Layers,
  Shield,
  LogOut,
  Search,
  ExternalLink,
  Trash2,
  Edit3,
  CheckCircle2,
  Clock,
  RefreshCw,
  AlertTriangle,
  Key,
  X,
  Mail,
  Calendar,
  Save,
  Check,
  Activity,
  Radio,
  Users,
  Terminal,
  Smartphone,
  Copy,
} from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  username: string;
  role: string;
  createdAt: string;
  lastLoginAt?: string;
  totpEnabled?: boolean;
}

interface Enquiry {
  id: string;
  name: string;
  email: string;
  type: string;
  message: string;
  status: "new" | "in_progress" | "contacted" | "archived";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface ServiceRecord {
  id: string;
  number: string;
  title: string;
  tagline: string;
  description: string;
  capabilities: string[];
  gradient: string;
  iconName: string;
  active: boolean;
  updatedAt: string;
}

interface StatsData {
  totalEnquiries: number;
  newEnquiries: number;
  inProgressEnquiries: number;
  contactedEnquiries: number;
  archivedEnquiries: number;
  totalServices: number;
  activeServices: number;
  recentEnquiries: Enquiry[];
  registeredAdmins?: number;
  attenzaStats?: {
    extensionName: string;
    totalRecords: number;
    uniqueDevices: number;
    totalInstalls: number;
    activeToday: number;
    activeThisWeek: number;
    totalPings: number;
    lastReportedAt: string | null;
    hasLiveTelemetry: boolean;
  };
}

export default function AdminDashboardPage() {
  const router = useRouter();

  // Authentication & Profile state
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<"overview" | "enquiries" | "services" | "security">("overview");

  // Dashboard Data states
  const [stats, setStats] = useState<StatsData | null>(null);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Filter & Search states for Enquiries
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Selected enquiry for detail / notes drawer
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [editingNotes, setEditingNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  // Delete confirmation modal
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdMessage, setPwdMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [changingPwd, setChangingPwd] = useState(false);

  // MFA Management state
  const [mfaSetupData, setMfaSetupData] = useState<{
    secret: string;
    otpauthUri: string;
    recoveryCodes: string[];
    _hashedRecoveryCodes: string[];
  } | null>(null);
  const [mfaCodeInput, setMfaCodeInput] = useState("");
  const [mfaLoading, setMfaLoading] = useState(false);
  const [mfaMessage, setMfaMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [copiedCodes, setCopiedCodes] = useState(false);

  // Editing service state
  const [editingService, setEditingService] = useState<ServiceRecord | null>(null);
  const [savingService, setSavingService] = useState(false);

  // Load all operational data
  const loadDashboardData = useCallback(async () => {
    setLoadingData(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (typeFilter !== "all") params.append("type", typeFilter);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const [statsRes, enqRes, srvRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch(`/api/admin/enquiries?${params.toString()}`),
        fetch("/api/admin/services"),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }
      if (enqRes.ok) {
        const enqData = await enqRes.json();
        setEnquiries(enqData.enquiries);
      }
      if (srvRes.ok) {
        const srvData = await srvRes.json();
        setServices(srvData.services);
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoadingData(false);
    }
  }, [statusFilter, typeFilter, searchQuery]);

  // Check auth session on mount
  useEffect(() => {
    let mounted = true;
    async function initAuth() {
      try {
        const res = await fetch("/api/admin/auth/me");
        if (!res.ok) {
          router.replace("/admin/login");
          return;
        }
        const data = await res.json();
        if (mounted) {
          setUser(data.user);
        }
      } catch {
        router.replace("/admin/login");
      } finally {
        if (mounted) {
          setLoadingAuth(false);
        }
      }
    }

    const timer = setTimeout(() => {
      initAuth();
    }, 0);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [router]);

  // Load dashboard data when user is authenticated or filters change
  useEffect(() => {
    if (!user) return;
    let mounted = true;

    const timer = setTimeout(() => {
      if (mounted) {
        loadDashboardData();
      }
    }, 0);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [user, loadDashboardData]);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } catch {
      // ignore
    } finally {
      router.replace("/admin/login");
    }
  };

  // Update Enquiry Status
  const handleUpdateStatus = async (id: string, newStatus: Enquiry["status"]) => {
    try {
      const res = await fetch(`/api/admin/enquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setEnquiries((prev) =>
          prev.map((e) => (e.id === id ? { ...e, status: newStatus, updatedAt: new Date().toISOString() } : e))
        );
        if (selectedEnquiry && selectedEnquiry.id === id) {
          setSelectedEnquiry({ ...selectedEnquiry, status: newStatus });
        }
        // Refresh overview stats
        const statsRes = await fetch("/api/admin/stats");
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData.stats);
        }
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  // Save Notes on selected enquiry
  const handleSaveNotes = async () => {
    if (!selectedEnquiry) return;
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/admin/enquiries/${selectedEnquiry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: editingNotes }),
      });
      if (res.ok) {
        setSelectedEnquiry({ ...selectedEnquiry, notes: editingNotes });
        setEnquiries((prev) =>
          prev.map((e) => (e.id === selectedEnquiry.id ? { ...e, notes: editingNotes } : e))
        );
      }
    } catch (err) {
      console.error("Failed to save notes:", err);
    } finally {
      setSavingNotes(false);
    }
  };

  // Confirm delete enquiry
  const handleDeleteEnquiry = async () => {
    if (!deletingId) return;
    try {
      const res = await fetch(`/api/admin/enquiries/${deletingId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setEnquiries((prev) => prev.filter((e) => e.id !== deletingId));
        if (selectedEnquiry && selectedEnquiry.id === deletingId) {
          setSelectedEnquiry(null);
        }
        setDeletingId(null);
        // Refresh overview stats
        const statsRes = await fetch("/api/admin/stats");
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData.stats);
        }
      }
    } catch (err) {
      console.error("Failed to delete enquiry:", err);
    }
  };

  // Toggle Service Active status
  const handleToggleServiceActive = async (service: ServiceRecord) => {
    try {
      const updatedActive = !service.active;
      const res = await fetch(`/api/admin/services/${service.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: updatedActive }),
      });
      if (res.ok) {
        setServices((prev) =>
          prev.map((s) => (s.id === service.id ? { ...s, active: updatedActive } : s))
        );
      }
    } catch (err) {
      console.error("Failed to toggle service status:", err);
    }
  };

  // Save Service details
  const handleSaveService = async () => {
    if (!editingService) return;
    setSavingService(true);
    try {
      const res = await fetch(`/api/admin/services/${editingService.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tagline: editingService.tagline,
          description: editingService.description,
          capabilities: editingService.capabilities,
          active: editingService.active,
        }),
      });
      if (res.ok) {
        setServices((prev) =>
          prev.map((s) => (s.id === editingService.id ? editingService : s))
        );
        setEditingService(null);
      }
    } catch (err) {
      console.error("Failed to update service:", err);
    } finally {
      setSavingService(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMessage(null);

    if (newPassword !== confirmPassword) {
      setPwdMessage({ text: "New passwords do not match", isError: true });
      return;
    }

    if (newPassword.length < 10) {
      setPwdMessage({ text: "New password must be at least 10 characters long", isError: true });
      return;
    }

    setChangingPwd(true);
    try {
      const res = await fetch("/api/admin/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwdMessage({ text: data.error || "Failed to update password", isError: true });
      } else {
        setPwdMessage({ text: data.message || "Password updated successfully!", isError: false });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setPwdMessage({ text: "Network error occurred", isError: true });
    } finally {
      setChangingPwd(false);
    }
  };

  // Start TOTP MFA Setup
  const handleStartMfaSetup = async () => {
    setMfaLoading(true);
    setMfaMessage(null);
    setCopiedCodes(false);
    try {
      const res = await fetch("/api/admin/auth/mfa/setup", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setMfaMessage({ text: data.error || "Failed to initialize MFA setup", isError: true });
      } else {
        setMfaSetupData(data);
      }
    } catch {
      setMfaMessage({ text: "Network error occurred while initializing MFA", isError: true });
    } finally {
      setMfaLoading(false);
    }
  };

  // Confirm and Enable MFA
  const handleEnableMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaSetupData || !mfaCodeInput.trim()) return;
    setMfaLoading(true);
    setMfaMessage(null);
    try {
      const res = await fetch("/api/admin/auth/mfa/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: mfaSetupData.secret,
          code: mfaCodeInput.trim(),
          hashedRecoveryCodes: mfaSetupData._hashedRecoveryCodes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMfaMessage({ text: data.error || "Failed to verify authenticator code", isError: true });
      } else {
        setMfaMessage({ text: "Two-factor authentication successfully enabled!", isError: false });
        setMfaSetupData(null);
        setMfaCodeInput("");
        if (user) {
          setUser({ ...user, totpEnabled: true });
        }
      }
    } catch {
      setMfaMessage({ text: "Network error occurred while enabling MFA", isError: true });
    } finally {
      setMfaLoading(false);
    }
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-[#05070b] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070b] text-[#f1f5f9] flex flex-col selection:bg-indigo-500/30">
      {/* Top Navbar */}
      <header className="border-b border-white/[0.08] bg-[#090d16]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="site-container h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AadrutLogo heightClass="h-[36px]" />
            <span className="hidden sm:inline-block text-[11px] font-sans px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-medium">
              Operations Control
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadDashboardData()}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              title="Refresh Data"
            >
              <RefreshCw strokeWidth={1.75} className={`w-4 h-4 ${loadingData ? "animate-spin text-indigo-400" : ""}`} />
            </button>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans text-slate-300 hover:text-white hover:bg-white/[0.06] border border-white/10 transition-colors"
            >
              <span>View Website</span>
              <ExternalLink strokeWidth={1.75} className="w-3.5 h-3.5" />
            </a>

            <div className="h-4 w-px bg-white/10 mx-1 hidden sm:block" />

            <div className="text-right hidden md:block">
              <div className="text-xs font-medium text-white">{user?.username}</div>
              <div className="text-[10px] text-slate-400 font-sans">{user?.email}</div>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans text-red-300 hover:text-red-200 hover:bg-red-500/10 border border-red-500/20 transition-colors"
            >
              <LogOut strokeWidth={1.75} className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="site-container flex items-center gap-2 overflow-x-auto py-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-sans font-medium transition-colors ${
              activeTab === "overview"
                ? "bg-white/[0.1] text-white border border-white/20"
                : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <LayoutDashboard strokeWidth={1.75} className="w-4 h-4" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab("enquiries")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-sans font-medium transition-colors ${
              activeTab === "enquiries"
                ? "bg-white/[0.1] text-white border border-white/20"
                : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <Inbox strokeWidth={1.75} className="w-4 h-4" />
            <span>Enquiries</span>
            {stats && stats.newEnquiries > 0 && (
              <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-[10px] flex items-center justify-center font-bold">
                {stats.newEnquiries}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("services")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-sans font-medium transition-colors ${
              activeTab === "services"
                ? "bg-white/[0.1] text-white border border-white/20"
                : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <Layers strokeWidth={1.75} className="w-4 h-4" />
            <span>Services</span>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-sans font-medium transition-colors ${
              activeTab === "security"
                ? "bg-white/[0.1] text-white border border-white/20"
                : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <Shield strokeWidth={1.75} className="w-4 h-4" />
            <span>Security &amp; Account</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 site-container py-4 sm:py-6 lg:py-8">
        {/* ========================================================= */}
        {/* TAB 1: OVERVIEW */}
        {/* ========================================================= */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">Operational Summary</h2>
              <p className="text-xs text-slate-400 mt-0.5">Real-time status of service enquiries and active capabilities</p>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-[#090d16] border border-white/[0.08] relative overflow-hidden">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>Total Submissions</span>
                  <Inbox strokeWidth={1.75} className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-3xl font-bold font-mono text-white">
                  {stats?.totalEnquiries ?? 0}
                </div>
                <div className="text-[11px] text-slate-400 mt-2">All time website enquiries</div>
              </div>

              <div className="p-5 rounded-2xl bg-[#090d16] border border-white/[0.08] relative overflow-hidden">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>New / Actionable</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="text-3xl font-bold font-mono text-emerald-400">
                  {stats?.newEnquiries ?? 0}
                </div>
                <div className="text-[11px] text-slate-400 mt-2">Pending initial review</div>
              </div>

              <div className="p-5 rounded-2xl bg-[#090d16] border border-white/[0.08] relative overflow-hidden">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>In Progress</span>
                  <Clock strokeWidth={1.75} className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-3xl font-bold font-mono text-amber-300">
                  {stats?.inProgressEnquiries ?? 0}
                </div>
                <div className="text-[11px] text-slate-400 mt-2">In engineering assessment</div>
              </div>

              <div className="p-5 rounded-2xl bg-[#090d16] border border-white/[0.08] relative overflow-hidden">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>Contacted &amp; Closed</span>
                  <CheckCircle2 strokeWidth={1.75} className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-3xl font-bold font-mono text-cyan-300">
                  {(stats?.contactedEnquiries ?? 0) + (stats?.archivedEnquiries ?? 0)}
                </div>
                <div className="text-[11px] text-slate-400 mt-2">Direct conversation established</div>
              </div>
            </div>

            {/* Recent Enquiries Feed */}
            <div className="bg-[#090d16] border border-white/[0.08] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white">Recent Enquiries</h3>
                  <p className="text-xs text-slate-400">Latest correspondence submitted via public forms</p>
                </div>
                <button
                  onClick={() => setActiveTab("enquiries")}
                  className="text-xs font-sans text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  View All &rarr;
                </button>
              </div>

              {stats?.recentEnquiries && stats.recentEnquiries.length > 0 ? (
                <div className="divide-y divide-white/[0.06]">
                  {stats.recentEnquiries.map((enq) => (
                    <div
                      key={enq.id}
                      onClick={() => {
                        setSelectedEnquiry(enq);
                        setEditingNotes(enq.notes || "");
                        setActiveTab("enquiries");
                      }}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-white/[0.02] rounded-lg px-2 -mx-2 transition-colors cursor-pointer"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">{enq.name}</span>
                          <span className="text-xs text-slate-400">&bull; {enq.email}</span>
                          <span
                            className={`text-[10px] font-sans px-2 py-0.5 rounded-full font-medium ${
                              enq.status === "new"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : enq.status === "in_progress"
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : enq.status === "contacted"
                                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                                : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                            }`}
                          >
                            {enq.status.replace("_", " ").toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 line-clamp-1 mt-1 font-sans">
                          <span className="text-indigo-300">[{enq.type}]</span> {enq.message}
                        </p>
                      </div>
                      <div className="text-[11px] text-slate-400 font-sans shrink-0">
                        {new Date(enq.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 text-sm">
                  No enquiries received yet.
                </div>
              )}
            </div>

            {/* Venture Telemetry & Product Instrumentation (Attenza) */}
            <div className="bg-[#090d16] border border-white/[0.08] rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">Venture Telemetry &amp; Extension Analytics</h3>
                    <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-medium">
                      Attenza Focus Engine
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Grounded client instrumentation. Aadrut does not fabricate metrics or conflate website visitors with installed users.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-sans font-medium border ${
                      stats?.attenzaStats?.hasLiveTelemetry
                        ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                        : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        stats?.attenzaStats?.hasLiveTelemetry ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                      }`}
                    />
                    <span>
                      {stats?.attenzaStats?.hasLiveTelemetry
                        ? `Live (Last: ${new Date(stats.attenzaStats.lastReportedAt!).toLocaleTimeString()})`
                        : "Endpoint Active \u2022 Awaiting Client Events"}
                    </span>
                  </span>
                </div>
              </div>

              {/* Telemetry Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>Admin Accounts</span>
                    <Users strokeWidth={1.75} className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-white">
                    {stats?.registeredAdmins ?? 1}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Authorized operations personnel</div>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>Verified Installs</span>
                    <Radio strokeWidth={1.75} className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-emerald-400">
                    {stats?.attenzaStats?.uniqueDevices ?? 0}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Unique client hardware IDs</div>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>Active Today (24h)</span>
                    <Activity strokeWidth={1.75} className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-amber-300">
                    {stats?.attenzaStats?.activeToday ?? 0}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Unique clients pinged in 24h</div>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>Telemetry Events</span>
                    <Terminal strokeWidth={1.75} className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-cyan-300">
                    {stats?.attenzaStats?.totalRecords ?? 0}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Recorded audit events</div>
                </div>
              </div>

              {/* Developer Integration Note */}
              <div className="p-4 rounded-xl bg-[#05070b]/60 border border-white/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="text-xs text-slate-300 space-y-1">
                  <div className="font-semibold text-white flex items-center gap-2">
                    <span>Attenza Extension Telemetry Webhook</span>
                    <code className="text-[11px] font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      POST /api/telemetry
                    </code>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    To record install or usage pings from the Attenza browser/desktop client, dispatch anonymous payloads with: <code className="text-slate-300 font-mono">eventType: &quot;install&quot; | &quot;ping&quot;</code> and SHA-256 hashed device IDs.
                  </p>
                </div>
                <a
                  href="/api/telemetry"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans text-indigo-300 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 transition-colors"
                >
                  <span>API Specification</span>
                  <ExternalLink strokeWidth={1.75} className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: ENQUIRIES */}
        {/* ========================================================= */}
        {activeTab === "enquiries" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white">Service Enquiries</h2>
                <p className="text-xs text-slate-400 mt-0.5">Manage, track, and update client project submissions</p>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Search */}
                <div className="relative">
                  <Search strokeWidth={1.75} className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search sender, message..."
                    className="pl-8 pr-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 w-44 sm:w-56"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#0e1424] border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-400"
                >
                  <option value="all">All Statuses</option>
                  <option value="new">New</option>
                  <option value="in_progress">In Progress</option>
                  <option value="contacted">Contacted</option>
                  <option value="archived">Archived</option>
                </select>

                {/* Domain Filter */}
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#0e1424] border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-400"
                >
                  <option value="all">All Domains</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Digital Solutions">Digital Solutions</option>
                  <option value="Brand & Design">Brand &amp; Design</option>
                  <option value="Business Automation">Business Automation</option>
                  <option value="Digital Presence">Digital Presence</option>
                  <option value="Technology Consulting">Technology Consulting</option>
                  <option value="Venture Collaboration">Venture Collaboration</option>
                </select>
              </div>
            </div>

            {/* Table and Detail Drawer Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Enquiries List */}
              <div className={`bg-[#090d16] border border-white/[0.08] rounded-2xl overflow-hidden ${selectedEnquiry ? "lg:col-span-2" : "lg:col-span-3"}`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/[0.08] text-[11px] font-sans text-slate-400 bg-white/[0.02]">
                        <th className="py-3 px-4 font-medium">SENDER</th>
                        <th className="py-3 px-4 font-medium">DOMAIN</th>
                        <th className="py-3 px-4 font-medium">STATUS</th>
                        <th className="py-3 px-4 font-medium">DATE</th>
                        <th className="py-3 px-4 font-medium text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06] text-xs">
                      {enquiries.length > 0 ? (
                        enquiries.map((enq) => (
                          <tr
                            key={enq.id}
                            onClick={() => {
                              setSelectedEnquiry(enq);
                              setEditingNotes(enq.notes || "");
                            }}
                            className={`hover:bg-white/[0.03] transition-colors cursor-pointer ${
                              selectedEnquiry?.id === enq.id ? "bg-white/[0.05]" : ""
                            }`}
                          >
                            <td className="py-3 px-4">
                              <div className="font-semibold text-white">{enq.name}</div>
                              <div className="text-[11px] text-slate-400">{enq.email}</div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-[11px] text-indigo-300 font-sans">{enq.type}</span>
                            </td>
                            <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                              <select
                                value={enq.status}
                                onChange={(e) => handleUpdateStatus(enq.id, e.target.value as Enquiry["status"])}
                                className={`text-[11px] font-sans px-2 py-1 rounded-md border focus:outline-none ${
                                  enq.status === "new"
                                    ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                                    : enq.status === "in_progress"
                                    ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                                    : enq.status === "contacted"
                                    ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/30"
                                    : "bg-slate-500/10 text-slate-400 border-slate-500/30"
                                }`}
                              >
                                <option value="new" className="bg-[#0e1424] text-white">New</option>
                                <option value="in_progress" className="bg-[#0e1424] text-white">In Progress</option>
                                <option value="contacted" className="bg-[#0e1424] text-white">Contacted</option>
                                <option value="archived" className="bg-[#0e1424] text-white">Archived</option>
                              </select>
                            </td>
                            <td className="py-3 px-4 text-slate-400 font-sans text-[11px]">
                              {new Date(enq.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => setDeletingId(enq.id)}
                                className="p-1.5 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                title="Delete Record"
                              >
                                <Trash2 strokeWidth={1.75} className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-slate-400">
                            No matching enquiries found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Detail Drawer (when enquiry is selected) */}
              {selectedEnquiry && (
                <div className="bg-[#090d16] border border-white/[0.1] rounded-2xl p-5 space-y-4 relative">
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                    <div>
                      <h3 className="text-sm font-bold text-white">Enquiry Detail</h3>
                      <span className="text-[10px] text-slate-400 font-mono">ID: {selectedEnquiry.id.slice(0, 8)}...</span>
                    </div>
                    <button
                      onClick={() => setSelectedEnquiry(null)}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/[0.06]"
                    >
                      <X strokeWidth={1.75} className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="text-[11px] font-sans text-slate-400 uppercase font-medium">Client Info</label>
                    <div className="text-sm font-bold text-white mt-0.5">{selectedEnquiry.name}</div>
                    <a
                      href={`mailto:${selectedEnquiry.email}?subject=Aadrut%20Project%20Enquiry`}
                      className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 mt-0.5"
                    >
                      <Mail strokeWidth={1.75} className="w-3.5 h-3.5" />
                      <span>{selectedEnquiry.email}</span>
                    </a>
                  </div>

                  <div>
                    <label className="text-[11px] font-sans text-slate-400 uppercase font-medium">Domain &amp; Timing</label>
                    <div className="text-xs text-slate-200 mt-0.5 flex items-center gap-1.5">
                      <Calendar strokeWidth={1.75} className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(selectedEnquiry.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="mt-1">
                      <span className="text-xs font-sans px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {selectedEnquiry.type}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-sans text-slate-400 uppercase font-medium">Client Brief</label>
                    <div className="mt-1 p-3 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-200 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap font-sans">
                      {selectedEnquiry.message}
                    </div>
                  </div>

                  {/* Internal Notes */}
                  <div className="pt-2 border-t border-white/[0.08]">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-sans text-slate-400 uppercase font-medium">
                        Internal Notes
                      </label>
                      <button
                        onClick={handleSaveNotes}
                        disabled={savingNotes}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-semibold transition-all disabled:opacity-50"
                      >
                        <Save strokeWidth={1.75} className="w-3 h-3" />
                        <span>{savingNotes ? "Saving..." : "Save Notes"}</span>
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={editingNotes}
                      onChange={(e) => setEditingNotes(e.target.value)}
                      placeholder="Add private team notes, proposal links, or call summaries..."
                      className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 resize-none font-sans"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: SERVICES */}
        {/* ========================================================= */}
        {activeTab === "services" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">Service Capabilities</h2>
              <p className="text-xs text-slate-400 mt-0.5">Control live public service offerings and capability details</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-[#090d16] border border-white/[0.08] rounded-2xl p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-xs text-slate-500 font-bold">{service.number}</span>
                      <button
                        onClick={() => handleToggleServiceActive(service)}
                        className={`text-[10px] font-sans px-2.5 py-0.5 rounded-full font-semibold transition-colors ${
                          service.active
                            ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                            : "bg-slate-500/15 text-slate-400 border border-slate-500/30"
                        }`}
                      >
                        {service.active ? "ACTIVE" : "INACTIVE"}
                      </button>
                    </div>

                    <h3 className="text-base font-bold text-white mb-1">{service.title}</h3>
                    <div className="text-xs text-indigo-400 font-sans mb-3">{service.tagline}</div>
                    <p className="text-xs text-slate-300 leading-relaxed mb-4">{service.description}</p>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-sans text-slate-400 font-semibold tracking-wider">
                        Core Capabilities
                      </span>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {service.capabilities.map((cap, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] text-slate-300"
                          >
                            {cap}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">
                      Updated: {new Date(service.updatedAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => setEditingService({ ...service })}
                      className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      <Edit3 strokeWidth={1.75} className="w-3.5 h-3.5" />
                      <span>Edit Content</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Service Edit Modal */}
            {editingService && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                <div className="bg-[#090d16] border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative my-auto">
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                    <h3 className="text-base font-bold text-white">Edit Service: {editingService.title}</h3>
                    <button
                      onClick={() => setEditingService(null)}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/[0.06]"
                    >
                      <X strokeWidth={1.75} className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-xs font-sans text-slate-300 font-medium mb-1">Tagline</label>
                      <input
                        type="text"
                        value={editingService.tagline}
                        onChange={(e) => setEditingService({ ...editingService, tagline: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-sans text-slate-300 font-medium mb-1">Description</label>
                      <textarea
                        rows={3}
                        value={editingService.description}
                        onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-400 resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-sans text-slate-300 font-medium mb-1">
                        Capabilities (comma separated)
                      </label>
                      <input
                        type="text"
                        value={editingService.capabilities.join(", ")}
                        onChange={(e) =>
                          setEditingService({
                            ...editingService,
                            capabilities: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-400"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="service-active"
                        checked={editingService.active}
                        onChange={(e) => setEditingService({ ...editingService, active: e.target.checked })}
                        className="rounded accent-indigo-500 w-4 h-4"
                      />
                      <label htmlFor="service-active" className="text-xs text-slate-200">
                        Active on public website
                      </label>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-white/[0.08]">
                      <button
                        onClick={() => setEditingService(null)}
                        className="px-4 py-2 rounded-xl bg-white/[0.06] text-xs font-medium text-slate-300 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveService}
                        disabled={savingService}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md transition-all disabled:opacity-50"
                      >
                        {savingService ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: SECURITY & ACCOUNT */}
        {/* ========================================================= */}
        {activeTab === "security" && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">Security &amp; Account Settings</h2>
              <p className="text-xs text-slate-400 mt-0.5">Manage administrator credentials and authentication policy</p>
            </div>

            {/* Profile Card */}
            <div className="bg-[#090d16] border border-white/[0.08] rounded-2xl p-6 space-y-3">
              <h3 className="text-sm font-bold text-white mb-2">Authenticated Profile</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5 font-sans">Username</span>
                  <span className="font-semibold text-white">{user?.username}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5 font-sans">Email Address</span>
                  <span className="font-semibold text-white">{user?.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5 font-sans">Role</span>
                  <span className="font-semibold text-emerald-400 uppercase font-mono">{user?.role}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5 font-sans">Last Login</span>
                  <span className="font-mono text-slate-300">
                    {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "First Session"}
                  </span>
                </div>
              </div>
            </div>

            {/* Change Password Form */}
            <div className="bg-[#090d16] border border-white/[0.08] rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Key strokeWidth={1.75} className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Update Administrator Password</h3>
              </div>

              {pwdMessage && (
                <div
                  className={`p-3 rounded-xl mb-4 text-xs flex items-center gap-2 ${
                    pwdMessage.isError
                      ? "bg-red-500/10 border border-red-500/30 text-red-300"
                      : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                  }`}
                >
                  {pwdMessage.isError ? (
                    <AlertTriangle strokeWidth={1.75} className="w-4 h-4 shrink-0 text-red-400" />
                  ) : (
                    <Check strokeWidth={1.75} className="w-4 h-4 shrink-0 text-emerald-400" />
                  )}
                  <span>{pwdMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-sans text-slate-300 font-medium mb-1.5">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans text-slate-300 font-medium mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 10 characters with upper, number, symbol"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans text-slate-300 font-medium mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 font-mono"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={changingPwd}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs tracking-wide shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
                  >
                    {changingPwd ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            </div>

            {/* Multi-Factor Authentication (MFA / TOTP) Card */}
            <div className="bg-[#090d16] border border-white/[0.08] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Smartphone strokeWidth={1.75} className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Two-Factor Authentication (2FA)</h3>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold uppercase ${
                    user?.totpEnabled
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}
                >
                  {user?.totpEnabled ? "Enforced & Active" : "Not Configured"}
                </span>
              </div>

              {mfaMessage && (
                <div
                  className={`p-3 rounded-xl mb-4 text-xs flex items-center gap-2 ${
                    mfaMessage.isError
                      ? "bg-red-500/10 border border-red-500/30 text-red-300"
                      : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                  }`}
                >
                  {mfaMessage.isError ? (
                    <AlertTriangle strokeWidth={1.75} className="w-4 h-4 shrink-0 text-red-400" />
                  ) : (
                    <Check strokeWidth={1.75} className="w-4 h-4 shrink-0 text-emerald-400" />
                  )}
                  <span>{mfaMessage.text}</span>
                </div>
              )}

              {user?.totpEnabled ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    RFC 6238 TOTP two-factor authentication is active on your account. Every login requires your password plus a time-synchronized 6-digit one-time code or single-use recovery code.
                  </p>
                  <div className="p-3 rounded-xl bg-emerald-500/05 border border-emerald-500/15 flex items-start gap-2.5 text-xs text-emerald-300">
                    <Shield strokeWidth={1.75} className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                    <span>Your account is protected against credential stuffing and brute-force takeover.</span>
                  </div>
                </div>
              ) : !mfaSetupData ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Add an extra layer of defense to the Aadrut Operations Control panel using Google Authenticator, 1Password, or any RFC 6238 compliant TOTP application.
                  </p>
                  <button
                    type="button"
                    onClick={handleStartMfaSetup}
                    disabled={mfaLoading}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold text-xs tracking-wide shadow-md shadow-emerald-600/30 transition-all disabled:opacity-50"
                  >
                    {mfaLoading ? "Initializing..." : "Set Up Two-Factor Authentication"}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleEnableMfa} className="space-y-4 pt-2">
                  <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl space-y-2">
                    <span className="text-xs font-semibold text-white block">Step 1: Add to Authenticator App</span>
                    <p className="text-[11px] text-slate-400">
                      Enter this Base32 secret manually in Google Authenticator, 1Password, or Authy:
                    </p>
                    <div className="font-mono text-xs bg-white/[0.05] p-2 rounded-lg text-emerald-400 font-bold select-all break-all">
                      {mfaSetupData.secret}
                    </div>
                  </div>

                  <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white block">Step 2: Emergency Recovery Codes</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(mfaSetupData.recoveryCodes.join("\n"));
                          setCopiedCodes(true);
                          setTimeout(() => setCopiedCodes(false), 2000);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedCodes ? "Copied!" : "Copy All Codes"}</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Store these 8 emergency codes in a secure password vault. Each code can only be used once if you lose device access:
                    </p>
                    <div className="grid grid-cols-2 gap-1.5 font-mono text-xs text-slate-300 bg-white/[0.03] p-2 rounded-lg">
                      {mfaSetupData.recoveryCodes.map((code, idx) => (
                        <div key={idx} className="tracking-wider text-center py-0.5 bg-black/20 rounded">
                          {code}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-white block mb-1.5">
                      Step 3: Confirm with 6-Digit Code
                    </span>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={mfaCodeInput}
                      onChange={(e) => setMfaCodeInput(e.target.value)}
                      placeholder="123456"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-center font-mono text-sm tracking-widest text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={mfaLoading || mfaCodeInput.length !== 6}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs tracking-wide shadow-md shadow-emerald-600/30 transition-all disabled:opacity-50"
                    >
                      {mfaLoading ? "Activating..." : "Verify & Activate 2FA"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMfaSetupData(null);
                        setMfaCodeInput("");
                      }}
                      className="px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs text-slate-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#090d16] border border-white/10 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative my-auto">
            <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto mb-4">
              <AlertTriangle strokeWidth={1.75} className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white text-center">Delete Enquiry?</h3>
            <p className="text-xs text-slate-400 text-center mt-1.5 leading-relaxed">
              This action cannot be undone. This customer brief will be permanently removed from the records.
            </p>
            <div className="flex gap-2.5 mt-6">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-medium text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteEnquiry}
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
}
