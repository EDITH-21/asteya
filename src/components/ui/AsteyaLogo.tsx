"use client";

import React from "react";

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
            className="absolute inset-0 rounded-full blur-md opacity-30 bg-indigo-500/40 transition-opacity group-hover:opacity-70 pointer-events-none"
          />
        )}
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          <svg
            viewBox="0 0 736 736"
            width={size}
            height={size}
            className="w-full h-full drop-shadow-[0_0_10px_rgba(99,102,241,0.35)] transition-transform duration-300 group-hover:scale-105"
            aria-hidden="true"
          >
            <path
              d="M 349.500 242.073 C 332.583 244.227, 313.905 255.725, 297.033 274.372 C 288.025 284.327, 273.268 304.601, 274.287 305.621 C 274.533 305.867, 280.757 299.928, 288.117 292.424 C 303.480 276.762, 309.991 271.439, 319.635 266.655 C 330.574 261.229, 333.560 260.523, 345.500 260.544 C 355.387 260.561, 357.260 260.868, 364.010 263.581 C 405.024 280.066, 439.099 338.037, 472.050 447.384 C 475.843 459.971, 479.624 471.303, 480.452 472.568 C 487.970 484.041, 511.861 487.056, 521.736 477.778 C 525.030 474.684, 524.640 469.917, 520.064 457.328 C 517.900 451.372, 514.026 440.650, 511.456 433.500 C 488.927 370.816, 454.405 310.114, 422.570 277.205 C 396.729 250.492, 372.996 239.082, 349.500 242.073 M 316.692 289.045 C 310.219 290.656, 298.322 296.634, 292.272 301.315 C 271.589 317.316, 247.649 350.482, 232.225 384.500 C 221.838 407.411, 216.841 423.539, 214.991 440.125 C 211.978 467.149, 220.692 485.508, 239.199 491.129 C 245.208 492.954, 247.824 493.189, 256.876 492.715 C 287.348 491.119, 314.409 475.948, 337.522 447.504 C 341.792 442.250, 345.096 437.763, 344.865 437.532 C 344.635 437.302, 339.958 440.070, 334.473 443.683 C 313.948 457.206, 296.074 463.999, 280.744 464.104 C 265.953 464.205, 257.562 459.170, 251.495 446.556 C 246.720 436.630, 245.353 426.713, 246.851 412.883 C 249.912 384.620, 261.078 358.937, 277.481 342.428 C 300.120 319.643, 322.916 320.697, 341.219 345.374 C 353.363 361.746, 361.825 383.001, 381.082 445.500 C 387.854 467.480, 388.650 469.416, 392.315 472.840 C 395.375 475.698, 414.441 479.360, 422.919 478.718 C 429.451 478.223, 433 474.981, 433 469.509 C 433 463.026, 419.329 415.467, 409.027 386.112 C 388.854 328.628, 373.599 304.331, 350.486 292.878 C 341.933 288.640, 341.406 288.516, 331.097 288.309 C 325.269 288.192, 318.787 288.523, 316.692 289.045"
              fill="currentColor"
              className="text-white"
              fillRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {showText && (
        <div className="flex flex-col tracking-tight">
          <span className="font-bold tracking-[0.25em] text-white text-lg font-mono leading-none">
            ASTEYA
          </span>
          <span className="text-[9px] tracking-[0.3em] text-indigo-300/70 uppercase mt-0.5 font-medium">
            Ventures &amp; Tech
          </span>
        </div>
      )}
    </div>
  );
};
