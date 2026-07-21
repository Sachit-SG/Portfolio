"use client";

import { useRef } from "react";
import type { Project } from "@/lib/projects";

const gradients = [
  "from-[#5a63ff]/40",
  "from-[#ff5a1f]/30",
  "from-[#5a63ff]/30",
  "from-[#ff5a1f]/25",
  "from-[#5a63ff]/35",
];

export default function ProjectRow({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const rowRef = useRef<HTMLAnchorElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const raf = useRef<number>(0);

  function handleMouseMove(e: React.MouseEvent) {
    const rect = rowRef.current?.getBoundingClientRect();
    const panel = panelRef.current;
    if (!rect || !panel) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // Direct DOM write on rAF — no React re-render per mousemove.
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      panel.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    });
  }

  function setHover(on: boolean) {
    const panel = panelRef.current;
    if (!panel) return;
    panel.style.opacity = on ? "1" : "0";
    panel.style.scale = on ? "1" : "0.85";
  }

  return (
    <a
      ref={rowRef}
      href={project.href}
      target="_blank"
      rel="noopener noreferrer"
      data-project-row
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onMouseMove={handleMouseMove}
      className="group relative flex items-center justify-between gap-6 border-b border-border-ink py-8 sm:py-10"
    >
      <span className="font-mono text-sm text-muted-ink">0{index + 1}</span>

      <div className="flex flex-1 flex-col gap-2 px-4 sm:px-8">
        <div className="flex items-center gap-3">
          <h3 className="text-3xl font-semibold tracking-tight text-text-ink transition-colors group-hover:text-ultra-ink sm:text-5xl">
            {project.name}
          </h3>
          {/* signal-orange spark: the "live / in production" marker */}
          <span className="flex items-center gap-1.5 rounded-full border border-signal/40 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-signal">
            <span className="h-1.5 w-1.5 rounded-full bg-signal" />
            Live
          </span>
        </div>
        <p className="max-w-lg text-sm text-muted-ink sm:text-base">
          {project.blurb}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {project.stack.map((s) => (
            <span
              key={s}
              className="rounded-full border border-border-ink px-2.5 py-1 font-mono text-[11px] text-muted-ink"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="hidden shrink-0 text-right sm:block">
        <div className="flex gap-6 font-mono text-xs text-muted-ink">
          {project.metrics.map((m) => (
            <div key={m.label}>
              <div className="text-text-ink">{m.value}</div>
              <div>{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      <span className="hidden shrink-0 font-mono text-sm text-muted-ink transition-colors group-hover:text-signal sm:block">
        {project.year} ↗
      </span>

      {/* Cursor-follow preview — swap the gradient for a Higgsfield mockup clip per project */}
      <div
        ref={panelRef}
        aria-hidden
        style={{ opacity: 0, scale: "0.85", left: 0, top: 0 }}
        className="pointer-events-none absolute z-10 hidden h-56 w-80 overflow-hidden rounded-xl border border-border-ink bg-ink-card shadow-2xl transition-[opacity,scale] duration-300 ease-out sm:block"
      >
        <div
          className={`flex h-full w-full items-center justify-center bg-gradient-to-br to-transparent ${gradients[index % gradients.length]}`}
        >
          <span className="font-mono text-xs text-muted-ink">{project.name}</span>
        </div>
      </div>
    </a>
  );
}
