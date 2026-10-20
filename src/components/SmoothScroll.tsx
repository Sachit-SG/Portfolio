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
    // Browsers restore the previous scroll offset on reload. On a page this
    // scroll-driven that drops you into the middle of the story with every
    // trigger already fired and the intro never seen. Opt out and go to the
    // top — but honour a real #hash, which is a deliberate destination.
    // Set BEFORE the reduced-motion bail so it applies with Lenis disabled too.
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    const hasHash = window.location.hash.length > 1;
    if (!hasHash) window.scrollTo(0, 0);

    let cancelled = false;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
    let disposed = false;

    const lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      anchors: false,
    });
    // Lenis keeps its own virtual scroll position, so window.scrollTo alone
    // leaves the two out of sync — it has to be told as well.
    if (!hasHash) lenis.scrollTo(0, { immediate: true });
    const onAnchor = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element).closest<HTMLAnchorElement>('a[href*="#"]');
      if (!link || link.target === "_blank") return;
      const url = new URL(link.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;
      if (!document.getElementById(url.hash.slice(1))) return;
      event.preventDefault();
      history.pushState(null, "", url.hash);
      // A pinned Hero's live rect is not the document's origin.
      lenis.scrollTo(url.hash === "#top" ? 0 : url.hash);
    };
    window.addEventListener("click", onAnchor);

    // Keep ScrollTrigger in step with Lenis' virtual scroll position.
    lenis.on("scroll", ScrollTrigger.update);

    // Lenis measures its own scroll ceiling once at construction, before
    // pinned sections (Hero, Work, SideRail) finish inserting their
    // pin-spacers and settling the page's true final height — confirmed
    // live, Lenis's internal dimensions.scrollHeight (7672) trailed the
    // real documentElement.scrollHeight (9065) by ~1400px until resized.
    // Nothing corrects it automatically: neither GSAP's ScrollTrigger
    // "refresh" event (never fired within several seconds of load, checked
    // with a live counter) nor a ResizeObserver on document.body (body's
    // own box is viewport-anchored in this layout and doesn't reflect
    // scrollable overflow growing beneath it — the same blind spot Lenis's
    // own built-in contentResizeObserver already has). A deterministic
    // resize once known layout-affecting events have actually completed is
    // the reliable option. (The separate Skills/Work visual overlap this
    // was first suspected of causing turned out to have a different root
    // cause — see Work.tsx's pin start offset — but this Lenis/real-height
    // drift is real on its own and worth keeping fixed regardless.)
    const resettle = () => {
      if (cancelled || disposed) return;
      ScrollTrigger.refresh();
      lenis.resize();
    };
    const resize = () => lenis.resize();
    ScrollTrigger.addEventListener("refresh", resize);
    let hashAligned = false;
    const alignHash = () => {
      lenis.resize();
      if (window.location.hash && !hashAligned) {
        hashAligned = true;
        lenis.scrollTo(window.location.hash === "#top" ? 0 : window.location.hash, { immediate: true });
      }
    };
    window.addEventListener("portfolio:layout-ready", alignHash);
    document.fonts.ready.then(resettle);
    window.addEventListener("load", resettle);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    // Lag smoothing would stall the scroll after a slow frame.
    gsap.ticker.lagSmoothing(0);

    return () => {
      disposed = true;
      window.removeEventListener("load", resettle);
      window.removeEventListener("click", onAnchor);
      ScrollTrigger.removeEventListener("refresh", resize);
      window.removeEventListener("portfolio:layout-ready", alignHash);
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
    });
    return () => { cancelled = true; mm.revert(); };
  }, []);

  return null;
}
