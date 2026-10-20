"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import LineReveal from "./LineReveal";
import Reveal from "./Reveal";
import SectionTexture from "./SectionTexture";

gsap.registerPlugin(ScrollTrigger);

// Emil ease-out. cubic-bezier(0.23, 1, 0.32, 1). Not a named CSS ease.
function easeOutStrong(x: number) {
  const c = 3 * 0.23;
  const b = 3 * (0.32 - 0.23) - c;
  const a = 1 - c - b;
  const cy = 3;
  const by = -3;
  const ay = 1;
  const sampleX = (t: number) => ((a * t + b) * t + c) * t;
  const sampleDX = (t: number) => (3 * a * t + 2 * b) * t + c;
  let t = x;
  for (let i = 0; i < 5; i++) {
    const dx = sampleX(t) - x;
    if (Math.abs(dx) < 1e-4) break;
    const d = sampleDX(t);
    if (d === 0) break;
    t -= dx / d;
  }
  return ((ay * t + by) * t + cy) * t;
}

const services = [
  {
    title: "Full-stack web applications",
    detail:
      "Staff dashboards and internal tools, from the interface to the API and database.",
    proof: "Retail HR, QT Contracts (in development)",
    stack: ["Next.js", "React", "Node.js", "PostgreSQL"],
  },
  {
    title: "Backend & APIs",
    detail:
      "PostgreSQL schemas, Node.js and Express services, authentication and JWT-based single sign-on.",
    proof: "JWT single sign-on across two codebases",
    stack: ["Node.js", "Express", "Prisma", "JWT", "Supabase"],
  },
  {
    title: "Company websites",
    detail:
      "Responsive pages for company information, projects, services and enquiries.",
    proof: "Unitech Hydropower, Lama Group",
    stack: ["Next.js", "TypeScript", "Tailwind", "Vercel"],
  },
  {
    title: "Interface design",
    detail:
      "Layouts and interaction design in Figma, followed through into the working interface.",
    proof: "Two years of design experience before development",
    stack: ["Figma", "Tailwind", "Motion / GSAP"],
  },
];

export default function Services() {
  const scope = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      const rows = gsap.utils.toArray<HTMLElement>("[data-service-row]");
      rows.forEach((row) => {
        const fill = row.querySelector<HTMLElement>("[data-service-fill]");
        if (!fill) return;
        if (reduced) {
          gsap.set(fill, { "--fill": 1 });
          return;
        }
        // Outline stays put. The filled clone wipes in from the left as
        // the row crosses the viewport, same mechanic as dope.security.
        gsap.fromTo(
          fill,
          { "--fill": 0 },
          {
            "--fill": 1,
            // Scroll progress is linear. A timed ease-out would fight the scrub.
            ease: "none",
            immediateRender: false,
            scrollTrigger: {
              trigger: row,
              start: "top 82%",
              end: "top 42%",
              scrub: true,
            },
          },
        );
      });
      // Hero's pin spacer lands in a sibling effect, sometimes a frame
      // later. Measuring before it exists parks these triggers ~2400px
      // too early, so the fill finishes during the hero.
      const refresh = () => {
        ScrollTrigger.sort();
        ScrollTrigger.refresh();
      };
      requestAnimationFrame(refresh);
      const later = window.setTimeout(refresh, 400);
      return () => window.clearTimeout(later);
    }, scope);
    return () => ctx.revert();
  }, []);

  const toggle = (index: number) => {
    setOpen((current) => (current === index ? null : index));
    const row = scope.current?.querySelectorAll<HTMLElement>("[data-service-row]")[index];
    const fill = row?.querySelector<HTMLElement>("[data-service-fill]");
    if (!fill) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(fill, { "--fill": 1 });
      return;
    }
    // Clip/mask reveal is 300-500ms, ease-out. 300ms stays inside the UI cap.
    gsap.to(fill, {
      "--fill": 1,
      duration: 0.3,
      ease: easeOutStrong,
      overwrite: "auto",
    });
  };

  return (
    <section
      id="services"
      ref={scope}
      className="relative overflow-hidden px-6 py-32 text-text-paper sm:px-10 lg:pl-[288px]"
    >
      <SectionTexture variant="dots" tone="paper" />
      <div className="mb-16 max-w-2xl">
        <LineReveal
          lines={["What I work on"]}
          className="font-display mt-4 text-4xl font-medium leading-[1.0] tracking-[-0.005em] sm:text-6xl"
        />
        <Reveal>
          <p className="mt-6 text-muted-paper">
            The design and development work I take on.
          </p>
        </Reveal>
      </div>

      <div className="flex flex-col gap-3">
        {services.map((s, i) => {
          const isOpen = open === i;
          return (
            <div
              key={s.title}
              data-service-row
              className="rounded-card border border-border-paper"
            >
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => toggle(i)}
                className="flex w-full items-center gap-4 px-5 py-6 text-left transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none active:scale-[0.97] sm:gap-6 sm:px-7 sm:py-7"
              >
                <span className="w-8 shrink-0 font-mono text-sm text-muted-paper">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="relative min-w-0 flex-1 font-display text-3xl font-medium leading-[1.05] tracking-[-0.02em] sm:text-4xl lg:text-5xl">
                  <span
                    aria-hidden="true"
                    className="block text-transparent [-webkit-text-stroke:1px_var(--text-paper)]"
                  >
                    {s.title}
                  </span>
                  <span
                    data-service-fill
                    className="absolute inset-0 block text-text-paper [clip-path:inset(0_calc((1-var(--fill,0))*100%)_0_0)]"
                    style={{ "--fill": 0 } as CSSProperties}
                  >
                    {s.title}
                  </span>
                </span>
                <ArrowUpRight
                  className={`h-6 w-6 shrink-0 text-text-paper transition-transform ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none ${
                    isOpen ? "rotate-90 duration-150" : "duration-[110ms]"
                  }`}
                  strokeWidth={1.75}
                />
              </button>
              <div
                className={`grid ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none ${
                  isOpen
                    ? "transition-[grid-template-rows] duration-[250ms]"
                    : "transition-[grid-template-rows] duration-[180ms]"
                }`}
                style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <div
                    className={`max-w-xl px-5 pb-7 pl-[4.5rem] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none sm:px-7 sm:pb-8 sm:pl-[5.5rem] ${
                      isOpen
                        ? "translate-y-0 opacity-100 transition-[opacity,transform] delay-50 duration-200"
                        : "translate-y-1 opacity-0 transition-[opacity,transform] duration-150"
                    }`}
                  >
                    <p className="text-sm leading-relaxed text-muted-paper">{s.detail}</p>
                    <p className="mt-3 font-mono text-xs font-semibold text-ultra">{s.proof}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
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
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-14 flex flex-col items-start gap-5">
        <Reveal>
          <p className="font-display max-w-lg text-2xl font-medium leading-snug sm:text-3xl">
            If one of these is what you need built, let&apos;s talk.
          </p>
        </Reveal>
        <Reveal>
          <a
            href="#contact"
            className="rounded-[8px] bg-signal px-7 py-3.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
          >
            Get in touch
          </a>
        </Reveal>
      </div>
    </section>
  );
}
