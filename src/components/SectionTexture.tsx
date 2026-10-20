/**
 * Shared background texture system for otherwise-flat sections.
 *
 * One component, three variants, so the sections read as one designer's
 * rhythm instead of a different effect bolted onto each one:
 *   - "grid"  — faint blueprint grid, drifting forever (the schema/systems motif)
 *   - "trace" — circuit-style traces, fade in once on scroll (a moment, not a loop)
 *   - "dots"  — static dot field, no motion at all
 *
 * Skills uses "grid" specifically (not "trace"): its own running line is
 * already the section's authored, directed, scroll-driven moment, so the
 * background stays a slow ambient loop — a different TYPE of motion, not a
 * second one competing for the same attention. Work still gets no texture at
 * all — its pinned horizontal card track is louder and needs the room.
 *
 * Pure CSS (background-image gradients / one inline SVG data-uri), so this
 * costs nothing in JS and is trivially capped in opacity. Colour is the same
 * per-tone red rule as the rest of the site: --ultra on paper, --ultra-ink on
 * ink. Never exceeds ~5% alpha directly behind body text — the same ceiling
 * the ambient light budget uses, so contrast is never at risk.
 */
export default function SectionTexture({
  variant,
  tone = "paper",
}: {
  variant: "grid" | "trace" | "dots";
  tone?: "paper" | "ink";
}) {
  const red = tone === "ink" ? "255,107,107" : "173,33,33";

  if (variant === "grid") {
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div
          data-texture-grid
          className="absolute -inset-1/4 h-[150%] w-[150%]"
          style={{
            backgroundImage: `linear-gradient(rgba(${red},0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(${red},0.10) 1px, transparent 1px)`,
            backgroundSize: "56px 56px",
          }}
        />
      </div>
    );
  }

  if (variant === "trace") {
    // A small tileable circuit-trace motif: right-angle lines + node dots.
    const svg = encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'>
        <path d='M0 30 H40 V70 H90 M60 0 V40 H120 M20 120 V90 H60' stroke='rgba(${red},0.38)' stroke-width='2' fill='none'/>
        <circle cx='40' cy='30' r='3' fill='rgba(${red},0.48)'/>
        <circle cx='90' cy='70' r='3' fill='rgba(${red},0.48)'/>
        <circle cx='60' cy='40' r='3' fill='rgba(${red},0.48)'/>
      </svg>`
    );
    return (
      <div
        aria-hidden="true"
        data-texture-trace
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        style={{
          backgroundImage: `url("data:image/svg+xml,${svg}")`,
          backgroundSize: "120px 120px",
        }}
      />
    );
  }

  // "dots" — static, no animation at all.
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10"
      style={{
        backgroundImage: `radial-gradient(rgba(${red},0.14) 1px, transparent 1px)`,
        backgroundSize: "22px 22px",
      }}
    />
  );
}
