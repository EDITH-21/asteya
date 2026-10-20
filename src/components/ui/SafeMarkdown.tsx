"use client";

import React from "react";
import Link from "next/link";

interface SafeMarkdownProps {
  content: string;
  className?: string;
}

/**
 * Safe, zero-HTML markdown parser for admin-controlled text.
 * Strictly supports only:
 * - **bold text**
 * - *italic text*
 * - [label](https://... or /...)
 * Disallows and sanitizes any raw HTML tags, script injections, or unsafe protocols.
 */
export const SafeMarkdown: React.FC<SafeMarkdownProps> = ({ content, className = "" }) => {
  if (!content) return null;

  // Split lines to preserve intentional line breaks
  const lines = content.split("\n");

  const parseFormattedText = (lineText: string, lineKey: string | number) => {
    // Regex matches: [label](url), **bold**, *italic*
    const tokenRegex = /(\[([^\]]+)\]\((https:\/\/[^\s)]+|\/[^\s)]*)\)|\*\*([^*]+)\*\*|\*([^*]+)\*)/g;

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = tokenRegex.exec(lineText)) !== null) {
      // Plain text before token
      if (match.index > lastIndex) {
        elements.push(lineText.substring(lastIndex, match.index));
      }

      const matchId = `${lineKey}-${match.index}`;

      if (match[2] && match[3]) {
        // [label](url)
        const label = match[2];
        const href = match[3];

        if (href.startsWith("/")) {
          elements.push(
            <Link
              key={matchId}
              href={href}
              className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
            >
              {label}
            </Link>
          );
        } else {
          elements.push(
            <a
              key={matchId}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
            >
              {label}
            </a>
          );
        }
      } else if (match[4]) {
        // **bold**
        elements.push(
          <strong key={matchId} className="font-semibold text-white">
            {match[4]}
          </strong>
        );
      } else if (match[5]) {
        // *italic*
        elements.push(
          <em key={matchId} className="italic text-slate-200">
            {match[5]}
          </em>
        );
      }

      lastIndex = tokenRegex.lastIndex;
    }

    // Remaining text after last token
    if (lastIndex < lineText.length) {
      elements.push(lineText.substring(lastIndex));
    }

    return elements;
  };

  return (
    <span className={className}>
      {lines.map((line, idx) => (
        <React.Fragment key={idx}>
          {parseFormattedText(line, idx)}
          {idx < lines.length - 1 && <br />}
        </React.Fragment>
      ))}
    </span>
  );
};
