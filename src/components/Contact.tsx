"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import LineReveal from "./LineReveal";
import Reveal from "./Reveal";
import SectionTexture from "./SectionTexture";

export default function Contact() {
  const ctaRef = useRef<HTMLAnchorElement>(null);

  // Magnetic pull: the CTA leans toward the cursor within a radius, instead
  // of sitting inert until clicked — same quickTo pattern AmbientBackdrop
  // uses for its light, applied to something you actually click on.
  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
    const RADIUS = 220; // px around the CTA that starts pulling it
    const PULL = 0.35; // fraction of cursor offset actually applied — a lean, not a snap

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const inRange = Math.hypot(dx, dy) < RADIUS;
      xTo(inRange ? dx * PULL : 0);
      yTo(inRange ? dy * PULL : 0);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      gsap.killTweensOf(el);
    };
  }, []);

  return (
    <section
      data-dark
      id="contact"
      className="relative mt-24 flex flex-col items-start overflow-hidden rounded-t-[40px] bg-ink px-6 py-32 text-text-ink sm:px-10 lg:pl-[388px]"
    >
      <SectionTexture variant="grid" tone="ink" />

      <a
        ref={ctaRef}
        href="mailto:sachitghimire2@gmail.com"
        className="group block transition-colors hover:text-ultra-ink will-change-transform"
      >
        <LineReveal
          as="p"
          lines={["Let's talk ↗"]}
          className="font-display text-[11vw] font-bold leading-none tracking-[-0.015em] sm:text-[7vw]"
        />
      </a>

      <Reveal className="mt-16 flex w-full flex-col justify-between gap-6 border-t border-white/15 pt-8 sm:flex-row">
        <p className="max-w-sm text-sm text-muted-ink">
          Open to AI automation and full stack roles, remote or Kathmandu-based.
        </p>
        <div className="flex gap-8 font-mono text-sm text-muted-ink">
          {/* TODO: swap for Sachit's real profile URLs. */}
          <a
            href="https://www.linkedin.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-ultra-ink"
          >
            LinkedIn
          </a>
          <a
            href="https://github.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-ultra-ink"
          >
            GitHub
          </a>
          <a
            href="/sachit-ghimire-cv.pdf"
            className="transition-colors hover:text-ultra-ink"
          >
            Resume
          </a>
        </div>
      </Reveal>

      <p className="mt-24 w-full text-center font-mono text-xs text-muted-ink">
        Sachit Ghimire — {new Date().getFullYear()}
      </p>
    </section>
  );
}
