"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import LineReveal from "./LineReveal";
import Reveal from "./Reveal";

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    title: "Full-stack web applications",
    detail:
      "Dashboards, internal tools, and ordering or booking systems — front to back, by one person who owns the whole flow.",
    proof: "Retail HR · Lama Fuel",
    stack: ["Next.js", "React", "Node.js", "PostgreSQL"],
  },
  {
    title: "Backend & APIs",
    detail:
      "Postgres schema design, authentication and SSO, and secure internal APIs that replace manual, error-prone processes.",
    proof: "JWT SSO across two codebases · secured HR endpoints",
    stack: ["Node.js", "Express", "Prisma", "JWT", "Supabase"],
  },
  {
    title: "Production websites",
    detail:
      "Fast, data-driven corporate and marketing sites that stay maintainable — real content structures, not a static brochure.",
    proof: "Unitech Hydropower · Lama Convenience · Lama Group",
    stack: ["Next.js", "TypeScript", "Tailwind", "Vercel"],
  },
  {
    title: "Design-to-shipped UI",
    detail:
      "From a Figma file or a rough idea to a working interface — without waiting on a separate designer. Two years of design work before dev.",
    proof: "Design background applied to every build",
    stack: ["Figma", "Tailwind", "Motion / GSAP"],
  },
];

export default function Services() {
  const scope = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-service-card]").forEach((card) => {
        gsap.from(card, {
          opacity: 0,
          y: 40,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: { trigger: card, start: "top 88%" },
        });
      });
    }, scope);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="services"
      ref={scope}
      className="px-6 py-32 text-text-paper sm:px-10"
    >
      <div className="mb-16 max-w-2xl">
        <Reveal>
          <span className="inline-block w-fit rounded-full border border-border-paper px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-ultra">
            What I can build
          </span>
        </Reveal>
        <LineReveal
          lines={["What you get,", "if we work together."]}
          className="mt-4 text-4xl font-extrabold leading-[1.0] tracking-[-0.02em] sm:text-6xl"
        />
        <Reveal>
          <p className="mt-6 text-muted-paper">
            Not a menu of packages — the four things my shipped work actually
            proves I can do.
          </p>
        </Reveal>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {services.map((s, i) => (
          <div
            key={s.title}
            data-service-card
            className="flex flex-col gap-4 rounded-[28px] border border-border-paper bg-paper-card/70 p-9 backdrop-blur-[16px] transition-shadow hover:shadow-[0_18px_50px_-24px_rgba(28,23,18,0.35)] sm:p-11"
          >
            <span className="text-4xl font-extrabold text-signal">
              0{i + 1}
            </span>
            <h3 className="text-2xl font-extrabold tracking-[-0.01em] sm:text-3xl">
              {s.title}
            </h3>
            <p className="text-[15px] leading-relaxed text-muted-paper">
              {s.detail}
            </p>
            <p className="mt-1 font-mono text-xs text-ultra">{s.proof}</p>
            <div className="mt-auto flex flex-wrap gap-2 pt-5">
              {s.stack.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-border-paper px-3 py-1.5 font-mono text-[11px] text-muted-paper"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
