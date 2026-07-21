import Nav from "@/components/Nav";
import SideRail from "@/components/SideRail";
import AmbientBackdrop from "@/components/AmbientBackdrop";
import Hero from "@/components/Hero";
import Skills from "@/components/Skills";
import Work from "@/components/Work";
import Statement from "@/components/Statement";
import About from "@/components/About";
import Services from "@/components/Services";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <>
      {/* Fixed texture so the glass cards have something to distort. */}
      <AmbientBackdrop />
      {/* Mobile/tablet gets the top bar; desktop gets the sticky rail. */}
      <Nav />
      <SideRail />
      <main className="flex-1">
        <Hero />
        {/* Offset post-hero content so it clears the fixed rail on desktop. */}
        <div className="lg:pl-[332px]">
          <Skills />
          <Work />
          <Statement />
          <About />
          <Services />
          <Contact />
        </div>
      </main>
    </>
  );
}
