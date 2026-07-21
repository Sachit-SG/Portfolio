"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Scrubbed word-by-word reveal: each word starts dim + blurred and sharpens as
 * the block scrolls through the viewport (the heynesh "What You Get" effect).
 * Degrades safe — if JS or motion is off, words render fully visible.
 */
export default function WordReveal({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      const words = ref.current?.querySelectorAll("[data-word]");
      if (!words || !words.length) return;
      gsap.fromTo(
        words,
        { opacity: 0.12, filter: "blur(6px)" },
        {
          opacity: 1,
          filter: "blur(0px)",
          ease: "none",
          stagger: 0.4,
          scrollTrigger: {
            trigger: ref.current,
            start: "top 78%",
            end: "bottom 58%",
            scrub: 0.6,
          },
        }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <p ref={ref} className={className}>
      {text.split(" ").map((w, i) => (
        <span
          key={i}
          data-word
          className="inline-block will-change-[opacity,filter]"
        >
          {w}
          {i < text.split(" ").length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
}
