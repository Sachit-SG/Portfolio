"use client";

import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Token = { text: string; hit: boolean; space?: boolean };

// Breaks text into words, keeping any keyword phrase (e.g. "Postgres schema")
// as one token so it appears and pops as a single unit rather than splitting
// across two separate word-beats. Whitespace becomes its own non-animated
// token so the browser's natural line wrap still applies between spans.
function tokenize(text: string, keywords: string[]): Token[] {
  const pattern = keywords.length
    ? keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")
    : null;
  const re = pattern ? new RegExp(`(${pattern})`, "gi") : null;
  const segments = re ? text.split(re) : [text];
  const tokens: Token[] = [];
  segments.forEach((seg, i) => {
    if (!seg) return;
    if (re && i % 2 === 1) {
      tokens.push({ text: seg, hit: true });
      return;
    }
    seg.split(/(\s+)/).forEach((p) => {
      if (!p) return;
      tokens.push(/^\s+$/.test(p) ? { text: p, hit: false, space: true } : { text: p, hit: false });
    });
  });
  return tokens;
}

/**
 * Reveals a paragraph one word at a time on scroll, instead of a flat fade —
 * each word rises in on its own beat. Keyword phrases (via `keywords`) get an
 * extra pop: they land a little bigger and in the accent red, so the words
 * that actually carry the meaning stand out as they land rather than reading
 * as the same texture as everything else.
 *
 * No measurement pass needed (unlike the old pretext-based version) — tokens
 * are plain inline-block spans and the browser wraps them natively, so this
 * is SSR-safe and hydration-safe with zero DOM reads before paint.
 *
 * Degrades safe: reduced-motion renders every word already visible, with
 * keywords already at their landed size/colour — same end state, no motion.
 */
export default function LineTextReveal({
  text,
  className,
  keywords = [],
}: {
  text: string;
  className?: string;
  keywords?: string[];
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const tokens = useMemo(() => tokenize(text, keywords), [text, keywords]);
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapRef.current,
          start: "top 82%",
          toggleActions: "play none none reverse",
        },
      });
      const STAGGER = 0.035;
      gsap.utils.toArray<HTMLElement>("[data-reveal-token]").forEach((el, i) => {
        const hit = el.dataset.hit === "true";
        tl.fromTo(
          el,
          { opacity: 0, y: 14, fontSize: hit ? "1em" : undefined },
          {
            opacity: 1,
            y: 0,
            // fontSize, not transform:scale — scale paints bigger without
            // reflowing, so the enlarged word visually overlapped its
            // neighbours even though the underlying spacing was untouched.
            // fontSize actually pushes neighbours away.
            fontSize: hit ? "1.22em" : undefined,
            color: hit ? "var(--ultra-bright)" : undefined,
            duration: 0.45,
            ease: "power2.out",
          },
          i * STAGGER
        );
      });
    }, wrapRef);
    return () => ctx.revert();
  }, [tokens, reduced]);

  // Cursor-reactive reflow: an invisible floated circle with `shape-outside`
  // follows the pointer, so the paragraph genuinely parts around it — real
  // CSS Shapes doing the layout work, not a JS physics/canvas engine.
  // Margin (not transform) drives its position because shape-outside only
  // reads a float's actual box geometry; a transform wouldn't move the wrap.
  const floatRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const wrap = wrapRef.current;
    const float = floatRef.current;
    if (!wrap || !float) return;
    if (reduced || !window.matchMedia("(pointer: fine)").matches) return;

    const SIZE = 110;
    let mx = -9999;
    let my = -9999;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      const r = wrap.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
    };
    const onLeave = () => {
      mx = -9999;
      my = -9999;
    };
    const tick = () => {
      float.style.marginLeft = `${mx - SIZE / 2}px`;
      float.style.marginTop = `${my - SIZE / 2}px`;
      raf = requestAnimationFrame(tick);
    };

    wrap.addEventListener("mousemove", onMove);
    wrap.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      wrap.removeEventListener("mousemove", onMove);
      wrap.removeEventListener("mouseleave", onLeave);
    };
  }, [reduced]);

  return (
    <div ref={wrapRef} className={className}>
      {!reduced && (
        <div
          ref={floatRef}
          aria-hidden="true"
          style={{
            float: "left",
            width: 110,
            height: 110,
            shapeOutside: "circle(50%)",
            marginLeft: -9999,
            marginTop: -9999,
            pointerEvents: "none",
          }}
        />
      )}
      {tokens.map((t, i) =>
        t.space ? (
          t.text
        ) : (
          <span
            key={i}
            data-reveal-token
            data-hit={t.hit || undefined}
            className={
              t.hit
                ? "inline-block origin-center will-change-transform text-ultra-bright font-semibold mx-[0.08em]"
                : "inline-block origin-center will-change-transform"
            }
            style={
              reduced
                ? t.hit
                  ? { fontSize: "1.22em" }
                  : undefined
                : { opacity: 0, fontSize: t.hit ? "1em" : undefined }
            }
          >
            {t.text}
          </span>
        )
      )}
    </div>
  );
}
