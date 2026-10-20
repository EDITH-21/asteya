"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AsteyaLogo } from "@/components/ui/AsteyaLogo";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Smartphone,
  Key,
} from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);

  // MFA Flow state
  const [isMfaStep, setIsMfaStep] = useState(false);
  const [mfaToken, setMfaToken] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);

  // Check if already authenticated
  useEffect(() => {
    async function checkCurrentSession() {
      try {
        const res = await fetch("/api/admin/auth/me");
        if (res.ok) {
          router.replace("/admin");
          return;
        }
      } catch {
        // Not authenticated
      } finally {
        setCheckingAuth(false);
      }
    }
    checkCurrentSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Authentication failed");
        setIsLoading(false);
        return;
      }

      if (data.requiresMfa) {
        setMfaToken(data.mfaToken);
        setIsMfaStep(true);
        setIsLoading(false);
        return;
      }

      // Successful login without MFA
      router.push("/admin");
    } catch {
      setErrorMessage("Network error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/admin/auth/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mfaToken,
          code: mfaCode.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Verification failed. Please check the code.");
        setIsLoading(false);
        return;
      }

      // Successful MFA authentication
      router.push("/admin");
    } catch {
      setErrorMessage("Network error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleResetToCredentials = () => {
    setIsMfaStep(false);
    setMfaToken("");
    setMfaCode("");
    setErrorMessage("");
    setUseRecoveryCode(false);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#05070b] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070b] text-[#f1f5f9] flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/08 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Header Link */}
      <div className="max-w-md w-full mx-auto pt-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-sans text-slate-400 hover:text-white transition-colors py-1.5 px-3 rounded-lg hover:bg-white/[0.04]"
        >
          <ArrowLeft strokeWidth={1.75} className="w-4 h-4" />
          <span>Return to Asteya Website</span>
        </Link>
      </div>

      {/* Center Auth Card */}
      <div className="max-w-md w-full mx-auto my-auto">
        <div className="bg-[#090d16] border border-white/[0.1] rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative z-10">
          {/* Logo & Heading */}
          <div className="text-center pb-6 border-b border-white/[0.08]">
            <div className="flex justify-center mb-4">
              <AsteyaLogo size={42} showText={false} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {isMfaStep ? "Two-Factor Verification" : "Operations Control"}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {isMfaStep
                ? "Enter authenticator TOTP or emergency recovery code"
                : "Authorized administrative access only"}
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mt-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-300">
              <AlertCircle strokeWidth={1.75} className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {!isMfaStep ? (
            /* Primary Credentials Form */
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-sans text-slate-300 font-medium mb-1.5">
                  Admin Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail strokeWidth={1.75} className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@asteya.tech"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-sans text-slate-300 font-medium">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock strokeWidth={1.75} className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff strokeWidth={1.75} className="w-4 h-4" />
                    ) : (
                      <Eye strokeWidth={1.75} className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-sm tracking-wide shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Authenticate</span>
                      <ArrowRight strokeWidth={1.75} className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Multi-Factor Authentication Form */
            <form onSubmit={handleMfaSubmit} className="mt-6 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-sans text-slate-300 font-medium">
                    {useRecoveryCode ? "Emergency Recovery Code" : "6-Digit Authenticator Code"}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setUseRecoveryCode(!useRecoveryCode);
                      setMfaCode("");
                      setErrorMessage("");
                    }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    {useRecoveryCode ? "Use Authenticator App" : "Use Recovery Code"}
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    {useRecoveryCode ? (
                      <Key strokeWidth={1.75} className="w-4 h-4" />
                    ) : (
                      <Smartphone strokeWidth={1.75} className="w-4 h-4" />
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    autoFocus
                    autoComplete="one-time-code"
                    maxLength={useRecoveryCode ? 16 : 6}
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    placeholder={useRecoveryCode ? "XXXX-XXXX" : "123456"}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-center text-lg tracking-widest text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  {useRecoveryCode
                    ? "Enter one of your single-use backup recovery codes."
                    : "Check Google Authenticator, 1Password, or your TOTP app."}
                </p>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={isLoading || !mfaCode.trim()}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-sm tracking-wide shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Verify &amp; Sign In</span>
                      <ArrowRight strokeWidth={1.75} className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleResetToCredentials}
                  className="w-full py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-sans text-slate-400 hover:text-white transition-colors"
                >
                  Cancel &bull; Return to credentials
                </button>
              </div>
            </form>
          )}

          {/* Security Note */}
          <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck strokeWidth={1.75} className="w-3.5 h-3.5 text-emerald-400" />
            <span>End-to-end encrypted session with brute-force lockout</span>
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="max-w-md w-full mx-auto pb-4 text-center text-[11px] text-slate-400 font-sans">
        Asteya Internal Operations &bull; Strictly Confidential
      </div>
    </div>
  );
}
