"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Smooth scrolling, driven off GSAP's ticker so Lenis and ScrollTrigger share a
 * single animation loop (running two RAF loops is what makes smooth-scroll sites
 * feel laggy and desynced from pinned sections).
 *
 * Skipped entirely under prefers-reduced-motion — hijacking scroll is a real
 * accessibility and motion-sickness problem, and Lenis has no opinion about it.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
    });

    // Keep ScrollTrigger in step with Lenis' virtual scroll position.
    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    // Lag smoothing would stall the scroll after a slow frame.
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, []);

  return null;
}
