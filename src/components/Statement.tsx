import LineTextReveal from "./LineTextReveal";
import LineReveal from "./LineReveal";
import SectionTexture from "./SectionTexture";

export default function Statement() {
  return (
    <section
      id="approach"
      className="relative overflow-hidden bg-paper px-6 py-28 text-text-paper sm:px-10 sm:py-36 lg:pl-[388px]"
    >
      <SectionTexture variant="trace" tone="paper" />
      <p className="mb-6 text-center font-mono text-xs font-bold uppercase tracking-[0.2em] text-ultra">
        The approach
      </p>
      <LineReveal
        lines={["How I work"]}
        className="font-display text-center text-[13.5vw] font-bold leading-[0.82] tracking-[-0.03em] text-ultra-bright lg:text-[11vw]"
      />

      {/* Word-by-word reveal; keyword phrases pop bigger/red as they land. */}
      <LineTextReveal
        text="I build systems that run themselves — the repeated manual work automated away, with Postgres schema, internal APIs and single sign-on holding it up. Then the interface on top, when that's what ships the work."
        keywords={["run themselves", "automated away", "Postgres schema", "internal APIs", "single sign-on", "interface"]}
        className="font-display mx-auto mt-10 max-w-6xl text-center text-3xl font-medium leading-[1.12] tracking-[-0.005em] sm:text-5xl"
      />
    </section>
  );
}
