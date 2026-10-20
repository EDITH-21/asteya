"use client";

import React from "react";
import { AadrutLogo } from "./AadrutLogo";

interface AsteyaLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  glow?: boolean;
  priority?: boolean;
}

/**
 * Backward-compatible wrapper aliasing the rebrand to AadrutLogo.
 */
export const AsteyaLogo: React.FC<AsteyaLogoProps> = ({
  className = "",
  priority = false,
  size,
}) => {
  // If a specific pixel size was passed, map it to reasonable heightClass
  const heightClass = size ? (size <= 36 ? "h-[36px]" : size <= 44 ? "h-[44px]" : "h-[52px]") : undefined;

  return (
    <AadrutLogo
      className={className}
      priority={priority}
      heightClass={heightClass}
    />
  );
};

export { AadrutLogo };
