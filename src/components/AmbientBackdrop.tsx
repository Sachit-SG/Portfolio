"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Persistent ambient texture behind the whole page, plus ONE slow red light.
 *
 * Why the texture exists: `backdrop-filter` is invisible over a flat colour.
 * Glass cards only read as glass when there is something behind them to
 * distort. heynesh gets this from a fixed, blurred hero photo; we use the same
 * scene at low opacity so it warms the cream instead of darkening it.
 *
 * Why ONE light and not the previous two static glows: two competing surfaces
 * is the fastest way to look like a template. The depth comes from a single
 * source moving against layered translucency.
 *
 * CONTRAST BUDGET — do not raise these without re-measuring:
 *   photo 0.06 + light 0.07 is the darkest frame the paper ever reaches.
 *   At that frame: muted text 4.90:1, --ultra small text 4.87:1 — both pass AA
 *   with little headroom. The photo previously sat at 0.09, which put muted
 *   text at 4.40:1 (failing) before any light existed.
 */
export default function AmbientBackdrop() {
  const light = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = light.current;
    if (!el) return;
    // Reduced motion: the light still renders, it just never moves.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const xTo = gsap.quickTo(el, "xPercent", { duration: 1.2, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "yPercent", { duration: 1.2, ease: "power3.out" });
    el.style.willChange = "transform";

    // No cursor on touch — skip the listeners entirely and let it just drift.
    const fine = window.matchMedia("(pointer: fine)").matches;
    let inZone = false;
    let px = 0;
    let py = 0;
    const onMove = (e: PointerEvent) => {
      px = (e.clientX / window.innerWidth) * 2 - 1;
      py = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const enter = () => (inZone = true);
    const leave = () => (inZone = false);
    const zones = Array.from(
      document.querySelectorAll<HTMLElement>("[data-light-zone]")
    );
    if (fine) {
      window.addEventListener("pointermove", onMove, { passive: true });
      zones.forEach((z) => {
        z.addEventListener("pointerenter", enter);
        z.addEventListener("pointerleave", leave);
      });
    }

    const t0 = performance.now();
    const tick = () => {
      const t = (performance.now() - t0) / 1000;
      // Long, mutually prime-ish periods (19/23/29/31s) so the wander never
      // resolves into a visible loop. Percent units keep it identical at
      // every viewport size.
      const driftX = Math.sin(t / 23) * 14 + Math.cos(t / 31) * 7;
      const driftY = Math.cos(t / 29) * 10 + Math.sin(t / 19) * 5;
      // Outside the paper sections it returns to pure drift; inside, it leans.
      xTo(driftX + (inZone ? px * 12 : 0));
      yTo(driftY + (inZone ? py * 12 : 0));
    };
    gsap.ticker.add(tick); // the same rAF loop Lenis uses — never a second one

    return () => {
      gsap.ticker.remove(tick);
      if (fine) {
        window.removeEventListener("pointermove", onMove);
        zones.forEach((z) => {
          z.removeEventListener("pointerenter", enter);
          z.removeEventListener("pointerleave", leave);
        });
      }
      gsap.killTweensOf(el);
      el.style.willChange = "";
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-paper"
    >
      {/* Pre-blurred offline (Pillow, GaussianBlur r=35 on a half-res copy —
          equivalent to blur(70px) at full res once re-scaled up here) instead
          of a runtime `blur-[70px]`. A live 70px CSS blur on a `fixed`,
          full-viewport element sits in the expensive filter/rasterize path
          for the ENTIRE session, every section, forever — the most costly
          always-on effect on the site. Baking the blur into the asset removes
          that cost outright: this now just paints like any other image.
          Bonus: the blurred file has no fine detail left to encode, so it
          dropped from 427KB to 10KB. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/hero-scene-red-blurred.jpg"
        alt=""
        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-[0.06]"
      />
      {/* The single moving light. Positioned with left/top ONLY — no centring
          transform — because GSAP owns `transform` on this node. A radial
          gradient rather than a blurred solid: same softness, no filter cost. */}
      <div
        ref={light}
        data-ambient-light
        className="absolute left-[6%] top-[4%] h-[78vw] w-[78vw] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(201,42,42,0.07) 0%, rgba(201,42,42,0.04) 38%, rgba(201,42,42,0) 70%)",
        }}
      />
    </div>
  );
}
