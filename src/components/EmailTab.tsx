"use client";

import { useState } from "react";

const EMAIL = "sachitghimire2@gmail.com";

/**
 * Wide contact tab: a real photo of Sachit beside the email address.
 *
 * Uses the existing branded portrait. The initial remains as an error fallback,
 * so a missing or corrupt asset never leaves browser-broken image chrome.
 */
export default function EmailTab({
  tone = "ink",
  className = "",
}: {
  // "auto" reads the adaptive rail vars so the tab flips with the rail theme.
  tone?: "ink" | "paper" | "auto";
  className?: string;
}) {
  const [imgOk, setImgOk] = useState(true);
  const label =
    tone === "auto"
      ? "text-[var(--rail-muted)]"
      : tone === "ink"
        ? "text-[#fff5f5]/55"
        : "text-muted-paper";
  const addr =
    tone === "auto"
      ? "text-[var(--rail-fg)]"
      : tone === "ink"
        ? "text-[#fff5f5]"
        : "text-text-paper";
  const frame =
    tone === "auto"
      ? "bg-[var(--rail-border)] text-[var(--rail-fg)]"
      : tone === "ink"
        ? "bg-white/10 text-[#fff5f5]"
        : "bg-signal/10 text-signal";

  return (
    <a
      href={`mailto:${EMAIL}`}
      className={`group flex items-center gap-3 ${className}`}
    >
      <span
        className={`grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-card ${frame}`}
      >
        {imgOk ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/avatar-portrait.png"
            alt="Illustrated portrait of Sachit Ghimire"
            className="h-full w-full object-cover object-top"
            onError={() => setImgOk(false)}
          />
        ) : (
          <span className="font-display text-lg font-bold">S</span>
        )}
      </span>
      <span className="min-w-0">
        <span
          className={`block font-mono text-[9px] uppercase tracking-[0.18em] ${label}`}
        >
          Email
        </span>
        <span
          className={`block truncate text-sm font-semibold ${addr} transition-colors group-hover:text-signal`}
        >
          {EMAIL}
        </span>
      </span>
    </a>
  );
}
