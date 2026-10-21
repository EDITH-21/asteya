"use client";

import React from "react";
import { AadrutLogo } from "@/components/ui/AadrutLogo";
import { Mail } from "lucide-react";
import { CONTACT_CONFIG } from "@/lib/constants";

interface MaintenanceOverlayProps {
  contactEmail?: string;
}

export const MaintenanceOverlay: React.FC<MaintenanceOverlayProps> = ({
  contactEmail = CONTACT_CONFIG.email,
}) => {
  return (
    <div className="fixed inset-0 z-[999] bg-[#05070b] flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed inset-0 bg-grid-subtle pointer-events-none opacity-20" />

      <div className="relative z-10 max-w-lg w-full space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex justify-center">
          <AadrutLogo heightClass="h-[56px]" priority />
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          <span>Scheduled System Maintenance</span>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Architecture Upgrade in Progress
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-md mx-auto">
            Aadrut infrastructure systems are currently undergoing planned performance updates. Public services will resume momentarily.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs">
          <a
            href={`mailto:${contactEmail}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-slate-300 hover:text-white hover:border-white/20 transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-indigo-400" />
            <span>Contact Support: {contactEmail}</span>
          </a>
        </div>

        <div className="text-[11px] font-sans text-slate-400 pt-6 border-t border-white/[0.06]">
          Aadrut Digital Systems &bull; High Reliability Mode
        </div>
      </div>
    </div>
  );
};
