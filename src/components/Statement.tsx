import LineTextReveal from "./LineTextReveal";
import LineReveal from "./LineReveal";
import SectionTexture from "./SectionTexture";

export default function Statement() {
  return (
    <section
      id="approach"
      className="relative overflow-hidden bg-paper px-6 py-28 text-text-paper sm:px-10 sm:py-36 lg:pl-[288px]"
    >
      <SectionTexture variant="trace" tone="paper" />
      <p className="mb-6 text-center font-mono text-xs font-bold uppercase tracking-[0.2em] text-ultra">
        The approach
      </p>
      <LineReveal
        lines={["How I work"]}
        className="font-display text-center text-[13.5vw] font-bold leading-[0.82] tracking-[-0.03em] text-ultra-bright lg:text-[11vw]"
      />

      {/* React Bits-style decode, distance-weighted hover and click wave; stable layout. */}
      <LineTextReveal
        text="I design interfaces and build the APIs and databases behind them. My work includes company websites, staff dashboards and contract tools. I use Node.js and PostgreSQL for the backend, and carry the interface from design into code."
        keywords={["design interfaces", "APIs", "databases", "staff dashboards", "contract tools", "Node.js", "PostgreSQL"]}
        className="font-ui mx-auto mt-10 max-w-6xl text-center text-3xl font-medium leading-[1.4] tracking-[-0.015em] sm:text-[2.65rem]"
      />
    </section>
  );
}
