"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Heading reveal: each line is clipped and rises into place, staggered.
 * One-shot on enter (power3.out) — the reference rations scrub for hero moments
 * and uses plain enter-reveals for headings.
 */
export default function LineReveal({
  lines,
  className,
  as: Tag = "h2",
  start = "top 88%",
}: {
  lines: string[];
  className?: string;
  as?: "h1" | "h2" | "h3" | "p";
  start?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-line-inner]", {
        yPercent: 112,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.08,
        scrollTrigger: {
          trigger: ref.current,
          start,
          toggleActions: "play none none reverse",
        },
      });
    }, ref);
    return () => ctx.revert();
  }, [start]);

  return (
    <Tag ref={ref as never} className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.06em]">
          <span data-line-inner className="block will-change-transform">
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}
