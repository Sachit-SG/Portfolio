"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import DrawSVGPlugin from "gsap/DrawSVGPlugin";
import type { Project } from "@/lib/projects";

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

export default function ProjectCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Underline hand-draws under the title once the card lands — a second,
  // smaller beat after the card's own rise (Work.tsx handles that one),
  // instead of stacking two effects onto the same moment.
  useEffect(() => {
    if (reduced) return;
    const el = cardRef.current;
    const path = el?.querySelector<SVGPathElement>("[data-underline]");
    if (!el || !path) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        path,
        { drawSVG: "0%" },
        {
          drawSVG: "100%",
          opacity: 1,
          duration: 0.6,
          delay: 0.25,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, el);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <a
      ref={cardRef}
      href={project.href}
      target="_blank"
      rel="noopener noreferrer"
      data-project-card
      className="group relative flex w-[80vw] shrink-0 snap-start flex-col overflow-hidden rounded-card border border-border-paper bg-paper-card/70 backdrop-blur-[16px] transition-colors hover:border-ultra/40 sm:w-[420px] lg:h-full lg:w-[460px]"
    >
      {/* Mockup panel — real screenshot of the live site.
          Fixed ratio while the row scrolls natively; inside the pinned desktop
          track the card is height-constrained, so the panel flexes instead —
          otherwise the card overflows the pin container and gets clipped. */}
      <div className="relative aspect-[4/5] w-full overflow-hidden lg:aspect-auto lg:min-h-0 lg:flex-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/work/${project.slug}.jpg`}
          alt={`${project.name} — live site`}
          className={`absolute inset-0 h-full w-full bg-ink transition-transform duration-[600ms] ease-out group-hover:scale-[1.05] ${
            index === 0 ? "object-contain object-center" : "object-cover object-top"
          }`}
        />
        <span className="absolute left-4 top-4 z-10 rounded-full bg-black/50 px-3 py-1.5 font-mono text-xs font-medium text-white backdrop-blur-md">
          0{index + 1}
        </span>
        <div className="absolute right-4 top-4 z-10 flex max-w-[68%] flex-wrap justify-end gap-1.5">
          {project.stack.slice(0, 3).map((s) => (
            <span
              key={s}
              className="rounded-full bg-black/50 px-2.5 py-1 font-mono text-[10px] text-white backdrop-blur-md"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2.5 p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="relative inline-block w-fit">
            <h3 className="text-2xl font-semibold tracking-[-0.02em] text-text-paper">
              {project.name}
            </h3>
            <svg
              aria-hidden="true"
              className="absolute -bottom-0.5 left-0 h-[3px] w-full overflow-visible"
              preserveAspectRatio="none"
              viewBox="0 0 100 3"
            >
              <path
                data-underline
                d="M0,1.5 L100,1.5"
                stroke="var(--signal)"
                strokeWidth="3"
                fill="none"
                style={reduced ? undefined : { opacity: 0 }}
              />
            </svg>
          </div>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-signal text-lg text-white transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1">
            ↗
          </span>
        </div>
        <p className="text-sm leading-relaxed text-muted-paper">
          {project.blurb}
        </p>
        <div className="mt-auto flex flex-wrap gap-x-6 gap-y-1 pt-3 font-mono text-[11px] text-muted-paper">
          {project.metrics.map((m) => (
            <div key={m.label}>
              <span className="text-sm font-semibold text-ultra">{m.value}</span>{" "}
              {m.label}
            </div>
          ))}
        </div>
      </div>
    </a>
  );
}
