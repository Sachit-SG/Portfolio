import Nav from "@/components/Nav";
import SideRail from "@/components/SideRail";
import AmbientBackdrop from "@/components/AmbientBackdrop";
import SmoothScroll from "@/components/SmoothScroll";
import Hero from "@/components/Hero";
import Skills from "@/components/Skills";
import Work from "@/components/Work";
import Statement from "@/components/Statement";
import Services from "@/components/Services";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <>
      {/* Lenis smooth scroll, synced to GSAP's ticker. */}
      <SmoothScroll />
      {/* Fixed texture so the glass cards have something to distort. */}
      <AmbientBackdrop />
      {/* Mobile/tablet gets the top bar; desktop gets the sticky rail. */}
      <Nav />
      <SideRail />
      <main className="flex-1">
        <Hero />
        {/* Offset post-hero content so it clears the fixed rail on desktop. */}
        {/* Must clear the rail: left-6 (24px) + w-[332px] + a 32px gutter.
            data-light-zone: the ambient light leans toward the cursor while the
            pointer is over the paper sections, and returns to pure drift once
            it leaves. */}
        <div data-light-zone>
          <Skills />
          <Work />
          <Statement />
          <Services />
          <Contact />
        </div>
      </main>
    </>
  );
}
