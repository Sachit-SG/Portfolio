"use client";

import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import ScrambleTextPlugin from "gsap/ScrambleTextPlugin";

gsap.registerPlugin(ScrambleTextPlugin);

function tokenize(text: string, keywords: string[]) {
  const pattern = keywords.map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const segments = pattern ? text.split(new RegExp("(" + pattern + ")", "gi")) : [text];
  return segments.flatMap((segment, index) =>
    segment.split(/(\s+)/).filter(Boolean).map((word) => ({
      text: word, hit: Boolean(pattern && index % 2), space: /^\s+$/.test(word),
    })),
  );
}

export default function LineTextReveal({
  text, className, keywords = [],
}: { text: string; className?: string; keywords?: string[] }) {
  const wrapRef = useRef<HTMLParagraphElement>(null);
  const tokens = useMemo(() => tokenize(text, keywords), [text, keywords]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const media = gsap.matchMedia();
    media.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      const letters = Array.from(wrap.querySelectorAll<HTMLElement>("[data-scramble-letter]"));
      // React Bits ScrambledText scramble branch: distance-based duration,
      // overwrite on each pointer frame, intro decode and outward click wave.
      // Existing React glyph markup preserves keyword styling without SplitText.
      const radius = 100, duration = 1.2, speed = 0.5;
      let positions: { node: HTMLElement; x: number; y: number }[] = [];
      let disposed = false;
      let moveFrame = 0, waveFrame = 0, last = 0;
      let pointer = { x: 0, y: 0 };
      const waves: { x: number; y: number; age: number; life: number; reach: number; hit: Set<number> }[] = [];
      const measure = () => {
        const origin = wrap.getBoundingClientRect();
        positions = letters.map((node) => {
          const box = node.getBoundingClientRect();
          return { node, x: box.left - origin.left + box.width / 2, y: box.top - origin.top + box.height / 2 };
        });
      };
      const restore = (node: HTMLElement) => {
        node.querySelector<HTMLElement>("[data-original]")!.style.opacity = "";
        node.querySelector<HTMLElement>("[data-scrambled]")!.style.opacity = "0";
      };
      const scramble = (node: HTMLElement, length: number, revealDelay = 0) => {
        const original = node.querySelector<HTMLElement>("[data-original]")!;
        const glyph = node.querySelector<HTMLElement>("[data-scrambled]")!;
        original.style.opacity = "0";
        glyph.style.opacity = "1";
        return {
          overwrite: true,
          duration: length,
          ease: "none",
          scrambleText: { text: original.textContent ?? "", chars: ".:", speed, revealDelay },
          onComplete: () => restore(node),
        };
      };
      const nearPointer = () => {
        moveFrame = 0;
        positions.forEach(({ node, x, y }) => {
          const distance = Math.hypot(pointer.x - x, pointer.y - y);
          if (distance < radius) {
            gsap.to(node.querySelector("[data-scrambled]"), scramble(node, duration * (1 - distance / radius)));
          }
        });
      };
      const local = (event: PointerEvent) => {
        const rect = wrap.getBoundingClientRect();
        return { x: event.clientX - rect.left, y: event.clientY - rect.top };
      };
      const move = (event: PointerEvent) => {
        if (event.pointerType !== "mouse" || window.getSelection()?.toString()) return;
        pointer = local(event);
        if (!moveFrame) moveFrame = requestAnimationFrame(nearPointer);
      };
      const tickWave = (now: number) => {
        waveFrame = 0;
        const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
        last = now;
        waves.forEach((wave) => {
          wave.age += dt;
          const progress = Math.min(1, wave.age / wave.life);
          const reach = wave.reach * (1 - (1 - progress) ** 2);
          positions.forEach(({ node, x, y }, index) => {
            const distance = Math.hypot(x - wave.x, y - wave.y);
            if (!wave.hit.has(index) && distance <= reach) {
              wave.hit.add(index);
              const strengthAt = 1 - 0.6 * distance / wave.reach;
              gsap.to(node.querySelector("[data-scrambled]"), scramble(node, Math.max(0.2, duration * (0.2 + 0.5 * strengthAt))));
            }
          });
        });
        for (let index = waves.length - 1; index >= 0; index--) {
          if (waves[index].age >= waves[index].life) waves.splice(index, 1);
        }
        if (waves.length) waveFrame = requestAnimationFrame(tickWave);
        else last = 0;
      };
      const down = (event: PointerEvent) => {
        if (event.pointerType !== "mouse" || event.button !== 0 || window.getSelection()?.toString()) return;
        measure();
        const { x, y } = local(event);
        const fontPx = parseFloat(window.getComputedStyle(wrap).fontSize) || 16;
        const reach = Math.max(0, ...positions.map((point) => Math.hypot(point.x - x, point.y - y))) + fontPx;
        if (waves.length > 3) waves.shift();
        waves.push({ x, y, age: 0, reach, life: 0.45 + reach / 1100, hit: new Set() });
        if (!waveFrame) waveFrame = requestAnimationFrame(tickWave);
      };
      const enter = () => measure();
      const resize = new ResizeObserver(measure);
      resize.observe(wrap);
      measure();
      const decode = gsap.timeline({ paused: true });
      letters.forEach((node, index) => {
        const reveal = 0.15 + duration * (0.75 * index / letters.length + 0.25 * Math.random());
        decode.to(node.querySelector("[data-scrambled]"), scramble(node, reveal + 0.1, reveal), 0);
      });
      decode.time(0.001);
      const observer = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        decode.play();
      }, { rootMargin: "0px 0px -10% 0px" });
      observer.observe(wrap);
      document.fonts.ready.then(() => { if (!disposed) measure(); });
      wrap.addEventListener("pointerenter", enter);
      wrap.addEventListener("pointermove", move, { passive: true });
      wrap.addEventListener("pointerdown", down);
      return () => {
        disposed = true;
        resize.disconnect();
        observer.disconnect();
        decode.kill();
        cancelAnimationFrame(moveFrame);
        cancelAnimationFrame(waveFrame);
        wrap.removeEventListener("pointerenter", enter);
        wrap.removeEventListener("pointermove", move);
        wrap.removeEventListener("pointerdown", down);
        letters.forEach((node) => {
          gsap.killTweensOf(node.querySelector("[data-scrambled]"));
          restore(node);
        });
      };
    });
    return () => media.revert();
  }, [tokens]);

  return (
    <p ref={wrapRef} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {tokens.map((token, index) => token.space ? token.text : (
          <span key={index} className={`inline-block whitespace-nowrap ${token.hit ? "font-semibold text-ultra-bright" : ""}`}>
            {Array.from(token.text).map((letter, letterIndex) => (
              <span key={letterIndex} data-scramble-letter className="relative inline-block">
                <span data-original>{letter}</span>
                <span data-scrambled className="pointer-events-none absolute inset-0 text-center opacity-0">{letter}</span>
              </span>
            ))}
          </span>
        ))}
      </span>
    </p>
  );
}
