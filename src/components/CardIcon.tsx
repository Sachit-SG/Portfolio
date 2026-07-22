"use client";

import { useEffect, useRef } from "react";
import type { LucideIcon } from "lucide-react";

/**
 * A line icon that re-draws itself when its parent card is hovered.
 *
 * The draw is a CSS keyframe animation, not a JS tween. Every shape gets
 * pathLength="1" so a single `stroke-dasharray: 1` covers any path regardless
 * of its real length — that's what lets one CSS rule drive every icon.
 *
 * Replay works by toggling a class (a CSS *transition* can't re-run an effect
 * while ending in the same state the icon rests in). At rest dashoffset is 0,
 * i.e. fully drawn — the icon is never hidden waiting for a hover.
 *
 * The listener binds to the closest `[data-card]` ancestor, so the whole card
 * is the hit target rather than a 44px icon.
 */
export default function CardIcon({
  icon: Icon,
  className = "",
}: {
  icon: LucideIcon;
  className?: string;
}) {
  const wrap = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = wrap.current;
    const card = el?.closest<HTMLElement>("[data-card]");
    if (!el || !card) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const shapes = el.querySelectorAll<SVGElement>("svg > *");
    if (!shapes.length) return;
    // Normalise every path to a length of 1 so one dasharray value fits all.
    shapes.forEach((s) => s.setAttribute("pathLength", "1"));

    // While `is-drawing` is on, the icon is mid-draw and therefore partly
    // invisible. If animationend never arrives — interrupted animation, a
    // throttled/frozen animation clock in a background tab — the icon would be
    // stranded blank. This timer guarantees the class always comes back off.
    let fallback: ReturnType<typeof setTimeout>;
    const clear = () => {
      clearTimeout(fallback);
      el.classList.remove("is-drawing");
    };
    const enter = () => {
      el.classList.remove("is-drawing");
      // Force a reflow so removing and re-adding the class restarts the
      // animation instead of being collapsed into a no-op by the style engine.
      void el.offsetWidth;
      el.classList.add("is-drawing");
      clearTimeout(fallback);
      fallback = setTimeout(clear, 900); // > 350ms anim + 180ms stagger tail
    };

    card.addEventListener("mouseenter", enter);
    el.addEventListener("animationend", clear);
    return () => {
      clearTimeout(fallback);
      card.removeEventListener("mouseenter", enter);
      el.removeEventListener("animationend", clear);
    };
  }, []);

  return (
    <span
      ref={wrap}
      data-icon-draw
      aria-hidden="true"
      className={`pointer-events-none inline-flex text-muted-paper transition-[color,transform] duration-300 ease-out group-hover:scale-110 group-hover:text-ultra-bright ${className}`}
    >
      <Icon strokeWidth={1.5} className="h-full w-full" />
    </span>
  );
}
