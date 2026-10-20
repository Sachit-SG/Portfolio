"use client";

import { useEffect, useState } from "react";

// Mobile nav (this component is lg:hidden; desktop uses SideRail). Kept in
// sync with SideRail's menu. "About" used to point at #about — an id that
// only exists in About.tsx, which is never rendered, so on mobile that link
// scrolled nowhere. Skills was missing entirely.
const links = [
  { label: "Skills", href: "#skills" },
  { label: "Work", href: "#work" },
  { label: "Approach", href: "#approach" },
  { label: "Services", href: "#services" },
  { label: "Contact", href: "#contact" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [railActive, setRailActive] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    const onRail = (event: Event) => setRailActive((event as CustomEvent<boolean>).detail);
    onScroll();
    window.addEventListener("portfolio:rail-state", onRail);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); window.removeEventListener("portfolio:rail-state", onRail); };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <header
      data-compact-nav
      data-rail-active={railActive}
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 transition-[opacity,background-color,color] duration-300 sm:px-10 ${
        scrolled
          ? "bg-paper/90 text-text-paper backdrop-blur-md"
          : "bg-ink/65 text-text-ink backdrop-blur-md"
      }`}
    >
      <a
        href="#top"
        className="font-mono text-base tracking-tight"
      >
        Sachit Ghimire
      </a>
      <nav className="flex items-center gap-6 text-base">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="hidden transition-colors hover:text-signal lg:inline"
          >
            {link.label}
          </a>
        ))}
        <a
          href="/sachit-ghimire-cv.pdf"
          className="rounded-[8px] bg-signal px-4 py-1.5 font-semibold text-white transition-transform hover:-translate-y-0.5"
        >
          Resume
        </a>
        <button
          type="button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          aria-controls="mobile-site-menu"
          onClick={() => setMenuOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center rounded-[8px] border border-current text-xl leading-none lg:hidden"
        >
          {menuOpen ? "×" : "☰"}
        </button>
      </nav>
      {menuOpen && (
        <nav id="mobile-site-menu" aria-label="Mobile navigation" className={`absolute left-3 right-3 top-full mt-2 flex flex-col rounded-[8px] border p-2 text-base shadow-lg lg:hidden ${scrolled ? "border-border-paper bg-paper text-text-paper" : "border-border-ink bg-ink text-text-ink"}`}>
          {links.map((link) => <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="border-b border-current/15 px-4 py-3 font-semibold last:border-0">{link.label}</a>)}
        </nav>
      )}
    </header>
  );
}
