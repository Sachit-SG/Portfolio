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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-300 sm:px-10 lg:hidden ${
        scrolled
          ? "translate-y-0 bg-paper/80 opacity-100 backdrop-blur-md"
          : "pointer-events-none -translate-y-full opacity-0"
      }`}
    >
      <a
        href="#top"
        className={`font-mono text-sm tracking-tight transition-colors ${
          scrolled ? "text-text-paper" : "text-[#f3efe7]"
        }`}
      >
        Sachit Ghimire
      </a>
      <nav
        className={`flex items-center gap-6 text-sm ${
          scrolled ? "text-muted-paper" : "text-[#f3efe7]/70"
        }`}
      >
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="hidden transition-colors hover:text-signal sm:inline"
          >
            {link.label}
          </a>
        ))}
        <a
          href="/sachit-ghimire-cv.pdf"
          className="rounded-full bg-signal px-4 py-1.5 text-ink transition-transform hover:-translate-y-0.5"
        >
          Resume
        </a>
      </nav>
    </header>
  );
}
