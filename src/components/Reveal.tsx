"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Generic enter-reveal: staggers this wrapper's direct children up into place.
 * Use for pills, body copy, button rows, card grids.
 */
export default function Reveal({
  children,
  className,
  y = 34,
  stagger = 0.07,
  start = "top 88%",
}: {
  children: React.ReactNode;
  className?: string;
  y?: number;
  stagger?: number;
  start?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      const items = ref.current?.children;
      if (!items || !items.length) return;
      gsap.from(items, {
        opacity: 0,
        y,
        duration: 0.45,
        ease: "power3.out",
        stagger,
        scrollTrigger: { trigger: ref.current, start, once: true },
      });
    }, ref);
    return () => ctx.revert();
  }, [y, stagger, start]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
