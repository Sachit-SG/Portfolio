"use client";

import { coreSkills, supportingSkills, SKILL_SCALE_LABEL } from "@/lib/skills";

/**
 * Skill meters — segmented (dotted-square) bars, the honest dashboard idiom.
 *
 * Colour lesson from the red-dashboard references: red reads well by
 * CONCENTRATION, not coverage. Filled segments are fully saturated and sit on
 * dim empty segments with high contrast; the glow is tight, not a wide low-
 * opacity haze (a haze is what made the old radial look dull). No large red
 * areas — just bright marks against dark space.
 *
 * The filled count IS the data and is rendered at rest, so the meter is never
 * blank waiting on an animation. Motion is only a travelling highlight over the
 * already-correct segments — gated on prefers-reduced-motion.
 */
export default function SkillMeters({
  tone = "ink",
  compact = false,
  className = "",
}: {
  // "auto" reads the adaptive rail vars so the meter flips with the rail theme.
  tone?: "ink" | "paper" | "auto";
  compact?: boolean;
  className?: string;
}) {
  const on =
    tone === "auto"
      ? "var(--rail-seg-on)"
      : tone === "ink"
        ? "#ff6b6b"
        : "#d92626";
  // Empty segments + the track flip with the theme: red-on-black over dark, but
  // no harsh black bar over a light section (looks wrong on cream).
  const off =
    tone === "auto"
      ? "var(--rail-seg-off)"
      : tone === "ink"
        ? "#2a1517"
        : "rgba(26,16,17,0.16)";
  const track =
    tone === "auto"
      ? "var(--rail-seg-track)"
      : tone === "ink"
        ? "#140a0c"
        : "transparent";
  const label =
    tone === "auto"
      ? "text-[var(--rail-muted)]"
      : tone === "ink"
        ? "text-[#fff5f5]/75"
        : "text-muted-paper";
  const value =
    tone === "auto"
      ? "text-[var(--rail-fg)]"
      : tone === "ink"
        ? "text-[#fff5f5]"
        : "text-text-paper";

  const rows = compact ? coreSkills : [...coreSkills, ...supportingSkills];

  return (
    <div className={className} data-skill-meters>
      <ul className="flex flex-col gap-2">
        {rows.map((s) => (
          <li key={s.label} className="flex items-center gap-3">
            <span className={`w-[86px] shrink-0 truncate text-[11px] ${label}`}>
              {s.label}
            </span>
            <span
              className="flex flex-1 gap-1.5 p-1"
              style={{ background: track }}
              role="img"
              aria-label={`${s.label}: ${s.value} of 5`}
            >
              {Array.from({ length: 5 }).map((_, i) => {
                const filled = i < s.value;
                const tip = filled && i === s.value - 1; // only the last dot blinks
                return (
                  <span
                    key={i}
                    data-seg={tip ? "tip" : filled ? "on" : "off"}
                    // Sharp squares in a black track: filled = red, empty =
                    // near-black. The tip blinks red↔dark, reading as red/black.
                    className="h-2.5 w-2.5 shrink-0"
                    style={{ background: filled ? on : off }}
                  />
                );
              })}
            </span>
            <span className={`w-3 shrink-0 text-right font-mono text-[11px] font-bold ${value}`}>
              {s.value}
            </span>
          </li>
        ))}
      </ul>
      {!compact && (
        <p className={`mt-2.5 text-[9px] leading-tight ${label}`}>
          {SKILL_SCALE_LABEL}
        </p>
      )}
    </div>
  );
}
