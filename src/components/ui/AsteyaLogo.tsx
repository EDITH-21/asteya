"use client";

import React from "react";
import Image from "next/image";

interface AsteyaLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  glow?: boolean;
}

export const AsteyaLogo: React.FC<AsteyaLogoProps> = ({
  className = "",
  size = 38,
  showText = true,
  glow = true,
}) => {
  return (
    <div className={`inline-flex items-center gap-3 select-none group ${className}`}>
      <div
        className="relative flex items-center justify-center shrink-0"
        style={{ width: size, height: size }}
      >
        {glow && (
          <div
            className="absolute inset-0 rounded-full blur-md opacity-40 bg-indigo-500/40 transition-opacity group-hover:opacity-80"
          />
        )}
        <div className="relative z-10 w-full h-full flex items-center justify-center overflow-hidden">
          <Image
            src="/asteya-logo.jpg"
            alt="ASTEYA Logo"
            width={120}
            height={120}
            priority
            className="w-full h-full object-contain filter invert mix-blend-screen scale-110 drop-shadow-[0_0_12px_rgba(99,102,241,0.4)] transition-transform duration-300 group-hover:scale-115"
          />
        </div>
      </div>

      {showText && (
        <div className="flex flex-col tracking-tight">
          <span className="font-bold tracking-[0.25em] text-white text-lg font-mono leading-none">
            ASTEYA
          </span>
          <span className="text-[9px] tracking-[0.3em] text-indigo-300/70 uppercase mt-0.5 font-medium">
            Ventures & Tech
          </span>
        </div>
      )}
    </div>
  );
};
