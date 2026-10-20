"use client";

import React from "react";
import Image from "next/image";

interface AadrutLogoProps {
  className?: string;
  priority?: boolean;
  /** Custom height class, defaults to mobile ~44px, desktop ~52px */
  heightClass?: string;
  /** Whether to link to top of page */
  asLink?: boolean;
}

export const AadrutLogo: React.FC<AadrutLogoProps> = ({
  className = "",
  priority = false,
  heightClass = "h-[44px] md:h-[52px]",
  asLink = false,
}) => {
  const content = (
    <div className={`inline-flex items-center select-none group relative ${className}`}>
      {/* 
        The primary logo is navy blue in /public/aadrut-logo.png.
        Rendered white on dark #05070b backgrounds via CSS [filter:brightness(0)_invert(1)].
        To swap for a native light file in the future, simply update the src to '/aadrut-logo-light.png'.
      */}
      <Image
        src="/aadrut-logo.png"
        alt="Aadrut"
        width={272}
        height={339}
        priority={priority}
        className={`${heightClass} w-auto object-contain transition-transform duration-300 group-hover:scale-105 [filter:brightness(0)_invert(1)]`}
      />
    </div>
  );

  if (asLink) {
    return (
      <a href="#" aria-label="Aadrut Home" className="inline-flex focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-lg">
        {content}
      </a>
    );
  }

  return content;
};
