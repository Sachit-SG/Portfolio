"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import LineReveal from "./LineReveal";
import Reveal from "./Reveal";
import CardIcon from "./CardIcon";
import { PenTool, Rocket, ShieldAlert } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const timeline = [
  {
    marker: "Before",
    period: "2 years of design",
    title: "Graphic & UI design",
    icon: PenTool,
    detail:
      "Two years of design work before writing production code — the reason interfaces here get real attention, not just the APIs behind them.",
  },
  {
    marker: "2025",
    period: "Present · Lama Group",
    title: "Full Stack Developer",
    icon: Rocket,
    detail:
      "Sole developer on a remote team working with a Texas-based fuel and convenience retailer. Staff portals, SSO across two codebases with signed JWTs, and secured internal APIs replacing manual HR lookups.",
  },
  {
    marker: "Today",
    period: "The lesson that stuck",
    title: "Broke production, then fixed the process",
    icon: ShieldAlert,
    detail:
      "An auth migration shipped without its environment variables and took production down. I diagnosed it, reverted the merge, restored service — then wrote the checklist that stops it happening again.",
  },
];

export default function About() {
  const scope = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      // Connector draws itself as the section scrolls through
      // Cards reveal one-shot on enter (matching the reference's timing)
      gsap.utils.toArray<HTMLElement>("[data-milestone]").forEach((card) => {
        gsap.from(card, {
          opacity: 0,
          y: 48,
          duration: 0.5,
          ease: "power3.out",
          scrollTrigger: { trigger: card, start: "top 88%" },
        });
      });
    }, scope);
    return () => ctx.revert();
  }, []);

  return (
    <section id="about" ref={scope} className="px-6 py-32 sm:px-10">
      <Reveal>
        <span className="inline-block w-fit rounded-full border border-border-paper px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-ultra">
          From design to backend
        </span>
      </Reveal>

      <div className="relative mt-20">

        <div className="flex flex-col gap-12 lg:gap-16">
          {timeline.map((item, i) => (
            <article
              key={item.title}
              data-milestone
              data-card
              className={`group relative w-full max-w-3xl rounded-card border border-border-paper bg-paper-card/60 p-10 backdrop-blur-[20px] sm:p-12 ${
                i % 2 === 1 ? "lg:self-end" : "lg:self-start"
              }`}
            >
              {/* node dot on the curve */}
              <span
                aria-hidden="true"
                className={`absolute top-10 hidden h-3.5 w-3.5 rounded-full bg-signal ring-4 ring-paper lg:block ${
                  i % 2 === 1 ? "-left-1.5" : "-right-1.5"
                }`}
              />

              <div className="flex items-start justify-between gap-4">
                <span className="font-display block text-6xl font-bold leading-none tracking-[-0.03em] text-ultra-bright sm:text-7xl">
                  {item.marker}
                </span>
                <CardIcon icon={item.icon} className="h-11 w-11 shrink-0" />
              </div>

              <h3 className="mt-6 text-3xl font-semibold tracking-[-0.01em] sm:text-4xl">
                {item.title}
              </h3>

              <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-paper">
                {item.detail}
              </p>

              <footer className="mt-7 border-t border-border-paper pt-4">
                <span className="font-mono text-xs text-muted-paper">
                  {item.period}
                </span>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
