"use client";

import React from "react";
import Image from "next/image";

interface AadrutLogoProps {
  className?: string;
  priority?: boolean;
  /** Responsive height class: mobile 44px, tablet 52px, desktop 60px */
  heightClass?: string;
  /** Whether to link to top of page */
  asLink?: boolean;
}

export const AadrutLogo: React.FC<AadrutLogoProps> = ({
  className = "",
  priority = false,
  heightClass = "h-[44px] sm:h-[52px] lg:h-[60px]",
  asLink = false,
}) => {
  const content = (
    <div className={`inline-flex items-center select-none group relative ${className}`}>
      {/* 
        The primary logo is navy blue in /public/aadrut-logo.png.
        Rendered white on dark #05070b backgrounds via CSS [filter:brightness(0)_invert(1)].
        To swap for a native light file in the future, update the src to '/aadrut-logo-light.png'.
      */}
      <Image
        src="/aadrut-logo.png"
        alt="Aadrut"
        width={272}
        height={339}
        priority={priority}
        sizes="(max-width: 640px) 80px, (max-width: 1024px) 120px, 160px"
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
