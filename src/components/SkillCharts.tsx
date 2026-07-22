"use client";

import { useEffect, useRef } from "react";
import {
  coreSkills,
  supportingSkills,
  SKILL_SCALE_LABEL,
} from "@/lib/skills";

/**
 * Skill charts — a radial for the core stack, a line graph for the rest.
 *
 * SVG, not canvas, deliberately: every arc, colour and length stays inspectable
 * in the DOM, so this can actually be verified rather than trusted.
 *
 * Colour is zone-dependent and that is a contrast requirement, not a style
 * choice. On the dark hero the glow is --ultra-ink (#ff6b6b, 7.02:1 on ink).
 * That same red FAILS on the light rail, so there it becomes --ultra (#ad2121).
 *
 * The draw-in is CSS with pathLength="1", so one rule drives every arc
 * regardless of its real circumference. Resting state is fully drawn — the
 * chart is never blank waiting on an animation that may not run.
 */
export default function SkillCharts({
  tone = "ink",
  variant = "full",
  className = "",
}: {
  tone?: "ink" | "paper";
  /** "compact" = radial only. The hero has 343px between the nav and the
   *  corner tagline; the full cluster needs 344px. Rather than shrink the
   *  charts until they are unreadable, the hero shows the radial and the
   *  rail carries the detail. */
  variant?: "full" | "compact";
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);

  // Guarantees the real values are on screen within 2.5s no matter what the
  // animation clock is doing. The chart carries data — it must never sit blank.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const t = setTimeout(() => {
      el
        .querySelectorAll("[data-skill-arc], [data-skill-line-graph]")
        .forEach((n) => n.classList.add("is-drawn"));
    }, 2500);
    return () => clearTimeout(t);
  }, []);

  const stroke = tone === "ink" ? "var(--ultra-ink)" : "var(--ultra)";
  const track =
    tone === "ink" ? "rgba(255,245,245,0.14)" : "rgba(26,16,17,0.13)";
  const label = tone === "ink" ? "text-[#fff5f5]/70" : "text-muted-paper";
  const value = tone === "ink" ? "text-[#fff5f5]" : "text-text-paper";

  // Concentric rings, outermost first.
  const radii = [44, 35, 26, 17];
  const max = 5;

  // Line graph geometry. 6 points across a 200x56 box.
  const w = 200;
  const h = 56;
  const pts = supportingSkills.map((s, i) => {
    const x = (i / (supportingSkills.length - 1)) * (w - 8) + 4;
    const y = h - 6 - ((s.value - 1) / (max - 1)) * (h - 14);
    return [x, y] as const;
  });
  const poly = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

  return (
    <div ref={root} className={className} data-skill-charts>
      {/* --- Radial: core stack ------------------------------------------- */}
      <div className="flex items-center gap-3">
        <svg
          viewBox="0 0 100 100"
          className="h-[68px] w-[68px] shrink-0 -rotate-90"
          aria-hidden="true"
          style={{ filter: `drop-shadow(0 0 5px ${stroke})` }}
        >
          {coreSkills.map((s, i) => (
            <g key={s.label}>
              <circle
                cx="50"
                cy="50"
                r={radii[i]}
                fill="none"
                stroke={track}
                strokeWidth="5"
              />
              <circle
                data-skill-arc
                cx="50"
                cy="50"
                r={radii[i]}
                fill="none"
                stroke={stroke}
                strokeWidth="5"
                strokeLinecap="round"
                pathLength={1}
                // dash = the filled fraction, gap = the remainder
                strokeDasharray={`${s.value / max} 1`}
                // Cascade via duration, not delay — see globals.css. A delay
                // needs animation-fill-mode to hold the undrawn start state,
                // and that strands the chart blank if the clock never runs.
                style={
                  {
                    "--draw": s.value / max,
                    "--dur": `${1.0 + i * 0.18}s`,
                  } as React.CSSProperties
                }
              />
            </g>
          ))}
        </svg>

        <ul className="flex min-w-0 flex-col gap-1">
          {coreSkills.map((s) => (
            <li
              key={s.label}
              className="flex items-baseline justify-between gap-2"
            >
              <span className={`truncate text-[11px] ${label}`}>{s.label}</span>
              <span className={`font-mono text-[11px] font-bold ${value}`}>
                {s.value}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {variant === "full" && (
        <>
      {/* --- Line: supporting stack --------------------------------------- */}
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="mt-2.5 h-[44px] w-full"
        aria-hidden="true"
        style={{ filter: `drop-shadow(0 0 4px ${stroke})` }}
      >
        <polyline
          data-skill-line-graph
          points={poly}
          fill="none"
          stroke={stroke}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray="1"
          style={{ "--draw": 1, "--dur": "1.6s" } as React.CSSProperties}
        />
        {pts.map(([x, y], i) => (
          <circle
            key={supportingSkills[i].label}
            cx={x}
            cy={y}
            r="2.6"
            fill={stroke}
          />
        ))}
      </svg>

      <div
        className={`mt-2 flex flex-wrap justify-between gap-x-2 font-mono text-[10px] ${label}`}
      >
        {supportingSkills.map((s) => (
          <span key={s.label} className="truncate">
            {s.label}
          </span>
        ))}
      </div>

      {/* The scale is stated, not implied. A naked number invites the
          "says who?" objection; a labelled one pre-empts it. */}
      <p className={`mt-1.5 text-[10px] leading-tight ${label}`}>
        {SKILL_SCALE_LABEL}
      </p>
        </>
      )}
      {variant === "compact" && (
        <p className={`mt-2 text-[10px] leading-tight ${label}`}>
          {SKILL_SCALE_LABEL}
        </p>
      )}
    </div>
  );
}
