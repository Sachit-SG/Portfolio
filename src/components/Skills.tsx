"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import LiquidEther from "./LiquidEther";
import Reveal from "./Reveal";
import CardIcon from "./CardIcon";
import {
  Database,
  Workflow,
  LayoutDashboard,
  Server,
  PenTool,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

// Real fluid sim (LiquidEther), not a time-only shader — the site's red/
// paper family, retuned for "water" (viscous, lower mouse force/idle drift)
// instead of the library's default energetic look. Mounted only while the
// section is actually on screen (IntersectionObserver) — LiquidEther has its
// own internal visibility pause too, this is belt-and-suspenders for a
// section that sits well below the fold, same lesson as the earlier
// GridDistortion stutter.
function WaterBackground({ reduced }: { reduced: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (reduced) return;
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-70"
    >
      {!reduced && visible && <LiquidEther className="h-full w-full" />}
    </div>
  );
}

const skills = [
  // AI automation leads the list because it is the first-priority role target,
  // and the section is read top-down. Full-stack follows.
  {
    title: "AI Automation",
    icon: Workflow,
    // Tags trimmed to what Sachit confirmed he can defend in an interview.
    // "LLM APIs", "Prompt design" and "AI-first delivery" were removed — he
    // has not shipped them, and an unbacked tag on the lead card is the fastest
    // way to lose the room. The two kept alongside it point at work already on
    // this site (scheduled jobs, the 341-employee internal HR system).
    detail:
      "Taking the manual, repeated work inside a product and making software do it instead — scheduled jobs, internal tooling and process automation, wired into systems that are already live.",
    tags: ["Workflow automation", "Scheduled jobs", "Internal tooling"],
  },
  {
    // Auth/SSO folded in here rather than deleted — it is real, verifiable work
    // and it belongs next to the schema and services it protects.
    title: "Backend",
    icon: Database,
    detail:
      "Postgres schema design, Node and Express services, and authentication and single sign-on with signed JWTs across separate codebases.",
    tags: ["Node.js", "Express", "PostgreSQL", "JWT / SSO"],
  },
  {
    title: "Frontend",
    icon: LayoutDashboard,
    detail:
      "Next.js and React interfaces on top of my own APIs — typed, responsive, and built to stay maintainable.",
    tags: ["Next.js", "React", "TypeScript", "Tailwind"],
  },
  {
    title: "Platform & data",
    icon: Server,
    detail:
      "Hosting, storage and scheduled work — the operational side that keeps a system running after launch.",
    tags: ["Vercel", "Supabase", "AWS S3", "Cron jobs"],
  },
  {
    title: "Design",
    icon: PenTool,
    detail:
      "Two years of design before development — interface systems, layout and motion, without waiting on a designer.",
    tags: ["Figma", "UI systems", "Motion / GSAP"],
  },
];

const SVG_NS = "http://www.w3.org/2000/svg";
const TRAIN_LEN = 260; // px of track the train body occupies (desktop)
// Desktop's arc-length is ~6400px; mobile's is only ~600px (the path skips
// through every card body, contributing zero arc-length there). Sharing
// TRAIN_LEN would make the mobile train ~40% of its own entire track.
const TRAIN_LEN_MOBILE = 46;
const DWELL_WEIGHT = 0.06; // scroll budget spent parked at each platform (desktop only)

// How much start/stop shaping to apply between stations.
// 0 = perfectly linear (no speed spike at all), 1 = full sine in/out.
// Peak speed is what reads as "fast", not average: the track (~5700px) is
// longer than the scroll driving it, so any easing overshoot gets multiplied.
// Full sine peaks at pi/2 (1.57x average); this softens that to ~1.23x while
// keeping a recognisable lean out of and into each platform. Nudged up from
// 0.4 (Sachit: train should be visibly faster on both breakpoints) — still
// well short of 1.0, which was the original "flash" he flagged.
const EASE_SOFT = 0.55;
const easeInOut = (t: number) => {
  const sine = 0.5 * (1 - Math.cos(Math.PI * t));
  return t + (sine - t) * EASE_SOFT;
};

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

type Phase =
  | { type: "travel"; from: number; to: number; w: number }
  | { type: "dwell"; at: number; w: number };

// Mobile only. Both coordinates are REAL wrap-local pixels (1:1 with actual
// scroll), not arc-length — that's the whole fix. "draw" = a visible gap
// segment, where arc-length grows 1:1 with page position as you scroll
// through it. "hold" = a skipped card body: real scroll passes through it
// (its full height), but the drawn arc doesn't move at all while it does.
type MobileSegment =
  | { type: "draw"; pageStart: number; pageEnd: number; arcStart: number }
  | { type: "hold"; pageStart: number; pageEnd: number; arcAt: number };

/**
 * Maps a real wrap-local page-Y position to an arc-length fraction (0..1)
 * along the mobile track, by walking the segments built in buildMobileLine.
 * pageY is clamped to the track's own [start,end] — the scroll window is
 * intentionally a little longer than the path itself (a small cushion after
 * "bottom 25%"), so anything past the path's real end just holds at fully
 * arrived rather than extrapolating past a segment that doesn't exist.
 */
function headFromPageY(
  segments: MobileSegment[],
  totalArc: number,
  pageY: number
): { headN: number; holding: boolean } {
  if (!segments.length || !totalArc) return { headN: 0, holding: false };
  const first = segments[0];
  const last = segments[segments.length - 1];
  if (pageY <= first.pageStart) return { headN: 0, holding: false };
  if (pageY >= last.pageEnd) return { headN: 1, holding: false };
  for (const s of segments) {
    if (pageY <= s.pageEnd) {
      if (s.type === "hold") return { headN: s.arcAt / totalArc, holding: true };
      const span = s.pageEnd - s.pageStart;
      const t = span > 0 ? clamp01((pageY - s.pageStart) / span) : 1;
      return { headN: (s.arcStart + t * span) / totalArc, holding: false };
    }
  }
  return { headN: 1, holding: false };
}

/**
 * Maps linear scroll progress to a position along the track, with the train
 * PARKED at each station for part of the budget. Without this the head moves
 * at constant speed and never "arrives" anywhere — which is the difference
 * between a train and a progress bar.
 *
 * Also returns `arrivals`: the scroll-progress [start,end] window of the
 * travel phase leading into each station, in the same order as `stations`.
 * Mobile's card-reveal needs to know exactly when the train is approaching a
 * given station (to ramp the card in), which the position function alone
 * doesn't expose. Both are derived from the SAME `phases` list in one pass,
 * so they can't drift out of sync with each other.
 */
function buildSchedule(stations: number[]): {
  schedule: (u: number) => number;
  arrivals: { start: number; end: number }[];
} {
  const phases: Phase[] = [];
  let prev = 0;
  stations.forEach((s) => {
    if (s > prev) phases.push({ type: "travel", from: prev, to: s, w: s - prev });
    phases.push({ type: "dwell", at: s, w: DWELL_WEIGHT });
    prev = s;
  });
  if (prev < 1) phases.push({ type: "travel", from: prev, to: 1, w: 1 - prev });

  const total = phases.reduce((a, p) => a + p.w, 0) || 1;

  const schedule = (u: number) => {
    let acc = 0;
    for (const ph of phases) {
      const w = ph.w / total;
      if (u <= acc + w) {
        if (ph.type === "dwell") return ph.at;
        const t = w === 0 ? 1 : clamp01((u - acc) / w);
        return ph.from + (ph.to - ph.from) * easeInOut(t);
      }
      acc += w;
    }
    return 1;
  };

  const arrivals: { start: number; end: number }[] = [];
  {
    let acc = 0;
    let pendingTravel: { start: number; end: number } | null = null;
    for (const ph of phases) {
      const w = ph.w / total;
      if (ph.type === "travel") {
        pendingTravel = { start: acc, end: acc + w };
      } else {
        // Every dwell corresponds to exactly one station, in order — if there
        // was no preceding travel phase (two stations at an identical path
        // length), the window degenerates to a point rather than being wrong.
        arrivals.push(pendingTravel ?? { start: acc, end: acc });
        pendingTravel = null;
      }
      acc += w;
    }
  }

  return { schedule, arrivals };
}

export default function Skills() {
  const scope = useRef<HTMLElement>(null);
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = scope.current;
    if (!root) return;
    const wrap = root.querySelector<HTMLElement>("[data-skill-line-wrap]");
    if (!wrap) return;

    const svgs = Array.from(wrap.querySelectorAll<SVGSVGElement>("[data-skill-svg]"));
    const rails = Array.from(wrap.querySelectorAll<SVGPathElement>("[data-track-rail]"));
    const trails = Array.from(wrap.querySelectorAll<SVGPathElement>("[data-track-trail]"));
    const trains = Array.from(wrap.querySelectorAll<SVGPathElement>("[data-track-train]"));
    const maskRect = wrap.querySelector<SVGRectElement>("[data-mask-bg]");
    const maskCards = wrap.querySelector<SVGGElement>("[data-mask-cards]");
    const startAnchor = wrap.querySelector<HTMLElement>("[data-track-start]");

    // Mobile track — separate elements, separate data-attributes. Reusing the
    // desktop ones would make wrap.querySelectorAll('[data-track-rail]') pick
    // up BOTH layers at once, so the two builders would silently fight over
    // the same DOM nodes.
    const railM = wrap.querySelector<SVGPathElement>("[data-track-rail-m]");
    const trailM = wrap.querySelector<SVGPathElement>("[data-track-trail-m]");
    const trainMs = Array.from(wrap.querySelectorAll<SVGPathElement>("[data-track-train-m]"));
    const svgM = wrap.querySelector<SVGSVGElement>("[data-skill-svg-m]");

    let total = 0;
    let stationAt: number[] = [];
    let schedule: (u: number) => number = () => 0;

    // Mobile's head position is NOT arc-length-budgeted like desktop's — see
    // buildMobileLine for why: the path SKIPS through each card body (zero
    // arc-length), but scrolling still has to physically pass that card's
    // full real height. Budgeting scroll by arc-length was giving a ~500px
    // card the same near-zero "weight" as a ~50px gap, which is what made the
    // reveal arrive wildly late relative to where you'd actually scrolled to.
    // Instead the head is driven directly from real page position.
    let totalM = 0;
    let segmentsM: MobileSegment[] = [];
    let pageStartM = 0; // wrap-local Y where self.progress = 0
    let pageSpanM = 0; // real scroll px spanned by the whole trigger window
    let boxesM: { top: number; bottom: number }[] = [];

    // Every card still below the fold is holding its GSAP entrance PRE-state
    // (an opacity/transform offset) until its own reveal fires. Measuring raw
    // rects would bake those displaced positions into the track and leave it
    // detached from the actual card edges on any rebuild. Subtract each
    // element's own transform so geometry is always built against RESTING
    // position, whatever the animation is doing at that instant. Walks the
    // whole ancestor chain up to the wrap, not just the element itself: the
    // section pill sits inside <Reveal>, which runs its own gsap.from(y:34)
    // on its children, so an anchor can be displaced by a parent's transform
    // as easily as by its own. Shared by both the desktop and mobile track
    // builders — both need identical "true rest position" measurement.
    const restOf = (el: HTMLElement) => {
      let tx = 0;
      let ty = 0;
      let n: HTMLElement | null = el;
      while (n && n !== wrap) {
        const t = getComputedStyle(n).transform;
        if (t && t !== "none") {
          try {
            const m = new DOMMatrixReadOnly(t);
            tx += m.m41;
            ty += m.m42;
          } catch {
            /* unparseable transform — treat as identity */
          }
        }
        n = n.parentElement;
      }
      return { tx, ty };
    };

    /**
     * Builds the DESKTOP track from the ACTUAL in/out node dots.
     *
     * Geometry, per Sachit's spec:
     *  - Each card has TWO dots, on OPPOSITE side edges at the card's vertical
     *    CENTRE (not one dot near the top). The track enters one side and
     *    leaves the other, so the card genuinely sits ON the line.
     *  - The crossing segment is a straight horizontal run through the card —
     *    the platform.
     *  - Between cards the track bows hard into the empty gutter (control
     *    points pushed laterally, not just vertically) instead of the flattest
     *    possible S the previous version drew.
     */
    const buildLine = () => {
      const wr = wrap.getBoundingClientRect();
      if (wr.width === 0) return;
      const cards = Array.from(wrap.querySelectorAll<HTMLElement>("[data-skill-card]"));
      if (cards.length < 2) return;

      const centre = (el: Element | null, tx: number, ty: number) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
          x: r.left + r.width / 2 - wr.left - tx,
          y: r.top + r.height / 2 - wr.top - ty,
        };
      };

      const legs = cards.map((card) => {
        const { tx, ty } = restOf(card);
        return {
          inP: centre(card.querySelector('[data-skill-node="in"]'), tx, ty),
          outP: centre(card.querySelector('[data-skill-node="out"]'), tx, ty),
        };
      });
      if (legs.some((l) => !l.inP || !l.outP)) return;

      const f = (n: number) => n.toFixed(1);
      const clampX = (x: number) => Math.max(6, Math.min(wr.width - 6, x));

      // START: anchored under the "What I work with" pill.
      //
      // A QUARTER-TURN, not an S. Both control points sit on the START's x, so
      // the track leaves the label straight down and bends once into the first
      // dot, arriving horizontally. The previous version put control 2 on the
      // far side of the dot (dot.x - reach) to force a horizontal arrival; when
      // the anchor sat to the RIGHT of the dot that made the curve overshoot
      // past its own target and double back — the kink Sachit spotted.
      //
      // The anchor x is clamped to stay at least TURN px on the approach side
      // of the dot, so the turn always has room to be a curve and can never
      // invert again at any viewport width.
      const startEl = wrap.querySelector<HTMLElement>("[data-track-start]");
      const first = legs[0].inP!;
      let d: string;
      if (startEl) {
        const st = restOf(startEl);
        const sr = startEl.getBoundingClientRect();
        const sy = sr.bottom - wr.top - st.ty;
        const TURN = 62;
        const rawX = sr.left + sr.width / 2 - wr.left - st.tx;
        const sx =
          first.x > wr.width / 2
            ? clampX(Math.max(rawX, first.x + TURN)) // dot on the right edge
            : clampX(Math.min(rawX, first.x - TURN)); // dot on the left edge
        d = `M ${f(sx)} ${f(sy)}`;
        d += ` C ${f(sx)} ${f(sy + (first.y - sy) * 0.55)}, ${f(sx)} ${f(first.y)}, ${f(first.x)} ${f(first.y)}`;
      } else {
        d = `M ${f(first.x)} ${f(first.y)}`;
      }
      d += ` L ${f(legs[0].outP!.x)} ${f(legs[0].outP!.y)}`;

      for (let i = 1; i < legs.length; i++) {
        const a = legs[i - 1].outP!;
        const b = legs[i].inP!;
        // HORIZONTAL tangents at both ends — this is the actual fix for "it
        // connects from the top". The previous version offset its control
        // points VERTICALLY, so the curve arrived at a side-mounted dot
        // travelling 88° off horizontal, i.e. straight down into the card's
        // edge. Holding each control point level with its own endpoint forces
        // the track to LEAVE one card sideways and ARRIVE at the next sideways,
        // and the swing it produces is a broad rail curve rather than a
        // shallow S. dir points the bow into whichever gutter is empty.
        const dir = b.x > wr.width / 2 ? 1 : -1;
        const reach = Math.min(230, Math.max(110, Math.abs(b.y - a.y) * 0.46));
        d += ` C ${f(clampX(a.x + dir * reach))} ${f(a.y)}, ${f(clampX(b.x + dir * reach))} ${f(b.y)}, ${f(b.x)} ${f(b.y)}`;
        d += ` L ${f(legs[i].outP!.x)} ${f(legs[i].outP!.y)}`;
      }

      // END: leaves the last platform sideways, turns down, and runs off the
      // BOTTOM EDGE OF THE SECTION — not the wrap. The wrap sits INSIDE the
      // section's own py-32 padding, so wr.height stops ~128px short of where
      // the section (and therefore the next one, Work) actually begins; the
      // line was ending in the padding instead of reaching the boundary.
      // Measuring the live gap (rather than hardcoding the padding value)
      // means this keeps working if the section's padding classes ever change.
      const sectionR = root.getBoundingClientRect();
      const gapToSectionEnd = sectionR.bottom - wr.bottom;
      const last = legs[legs.length - 1].outP!;
      const dOut = last.x > wr.width / 2 ? 1 : -1;
      const exitX = clampX(last.x + dOut * 150);
      const endY = wr.height + Math.max(0, gapToSectionEnd);
      d += ` C ${f(clampX(last.x + dOut * 150))} ${f(last.y)}, ${f(exitX)} ${f(last.y + (endY - last.y) * 0.45)}, ${f(exitX)} ${f(endY)}`;

      svgs.forEach((s) => s.setAttribute("viewBox", `0 0 ${wr.width} ${wr.height}`));
      [...rails, ...trails, ...trains].forEach((p) => p.setAttribute("d", d));

      total = rails[0]?.getTotalLength() ?? 0;
      if (!total) return;

      // Mask: punch the card rectangles out of the ABOVE-cards layer, so the
      // gutter arcs paint over everything while the crossing segment is only
      // shown by the dimmer below-cards layer. That is what stops the track
      // from simply vanishing behind a card the way it used to.
      // Bounds extended to endY (not just wr.height): the mask is
      // userSpaceOnUse with an EXPLICIT rect, which clips regardless of the
      // SVG's own overflow-visible. Once the exit curve was extended past the
      // wrap into the section's padding, a mask still sized to wr.height would
      // silently cut that new segment straight back off on the front layer.
      const maskEl = wrap.querySelector<SVGMaskElement>("[data-mask]");
      if (maskEl) {
        // Explicit userSpaceOnUse bounds — the -10%/120% defaults are relative
        // to the viewport and would clip the lead-in/lead-out stubs.
        maskEl.setAttribute("x", "0");
        maskEl.setAttribute("y", "0");
        maskEl.setAttribute("width", String(wr.width));
        maskEl.setAttribute("height", String(endY));
      }
      if (maskRect) {
        maskRect.setAttribute("width", String(wr.width));
        maskRect.setAttribute("height", String(endY));
      }
      if (maskCards) {
        maskCards.replaceChildren();
        cards.forEach((card) => {
          const { tx, ty } = restOf(card);
          const r = card.getBoundingClientRect();
          const rect = document.createElementNS(SVG_NS, "rect");
          rect.setAttribute("x", f(r.left - wr.left - tx));
          rect.setAttribute("y", f(r.top - wr.top - ty));
          rect.setAttribute("width", f(r.width));
          rect.setAttribute("height", f(r.height));
          rect.setAttribute("rx", "28");
          rect.setAttribute("fill", "black");
          maskCards.appendChild(rect);
        });
      }

      trails.forEach((p) => {
        p.style.strokeDasharray = String(total);
        p.style.strokeDashoffset = reduce ? "0" : String(total);
      });
      trains.forEach((p) => {
        p.style.strokeDasharray = `${TRAIN_LEN} ${total}`;
        p.style.strokeDashoffset = reduce ? String(TRAIN_LEN - total) : String(TRAIN_LEN);
      });

      // Station = the midpoint of each card's crossing run. Found by sampling
      // the built path rather than accumulating estimates, so a bezier's real
      // arc length is used and the train parks dead-centre on the platform.
      const SAMPLES = 700;
      const pts: { l: number; x: number; y: number }[] = [];
      for (let i = 0; i <= SAMPLES; i++) {
        const l = (total * i) / SAMPLES;
        const pt = rails[0].getPointAtLength(l);
        pts.push({ l, x: pt.x, y: pt.y });
      }
      stationAt = legs.map((leg) => {
        const mx = (leg.inP!.x + leg.outP!.x) / 2;
        const my = (leg.inP!.y + leg.outP!.y) / 2;
        let best = 0;
        let bestD = Infinity;
        for (const p of pts) {
          const dd = (p.x - mx) ** 2 + (p.y - my) ** 2;
          if (dd < bestD) {
            bestD = dd;
            best = p.l;
          }
        }
        return best / total;
      });
      schedule = buildSchedule(stationAt).schedule;
    };

    /**
     * Builds the MOBILE track: a straight vertical line down the column's
     * centre, per Sachit's spec —
     *  - Starts at card 1's vertical MIDDLE (not its edge), runs down through
     *    card 1's lower half, then out its bottom edge.
     *  - Between cards it runs ONLY in the gap (bottom of card N -> top of
     *    card N+1) — it never crosses a card's title/body/tags. Each card
     *    body is skipped with an SVG moveto, which is zero-length, so the
     *    dash-offset maths for "how far has the train travelled" is
     *    unaffected by the parts that aren't drawn.
     *  - Runs off the section's real bottom edge afterward, same fix as the
     *    desktop track needed (the wrap sits inside the section's own
     *    padding, so wr.height alone stops short of the section boundary).
     */
    const buildMobileLine = () => {
      if (!railM || !trailM || !svgM) return;
      const wr = wrap.getBoundingClientRect();
      if (wr.width === 0) return;
      const cards = Array.from(wrap.querySelectorAll<HTMLElement>("[data-skill-card]"));
      if (cards.length < 2) return;

      const boxOf = (card: HTMLElement) => {
        const { tx, ty } = restOf(card);
        const r = card.getBoundingClientRect();
        return {
          top: r.top - wr.top - ty,
          bottom: r.bottom - wr.top - ty,
          centerY: r.top + r.height / 2 - wr.top - ty,
          centerX: r.left + r.width / 2 - wr.left - tx,
        };
      };
      const boxes = cards.map(boxOf);
      boxesM = boxes;
      const x = boxes[0].centerX; // single column — every card shares one centre x
      const f = (n: number) => n.toFixed(1);

      let d = `M ${f(x)} ${f(boxes[0].centerY)} L ${f(x)} ${f(boxes[0].bottom)}`;
      for (let i = 1; i < boxes.length; i++) {
        d += ` L ${f(x)} ${f(boxes[i].top)}`; // arrive at card[i]'s top edge — its station
        d += ` M ${f(x)} ${f(boxes[i].bottom)}`; // skip the card body, resume at its bottom
      }
      const sectionR = root.getBoundingClientRect();
      const endY = wr.height + Math.max(0, sectionR.bottom - wr.bottom);
      d += ` L ${f(x)} ${f(endY)}`;

      svgM.setAttribute("viewBox", `0 0 ${wr.width} ${wr.height}`);
      [railM, trailM, ...trainMs].forEach((p) => p.setAttribute("d", d));

      totalM = railM.getTotalLength();
      if (!totalM) return;

      trailM.style.strokeDasharray = String(totalM);
      trailM.style.strokeDashoffset = reduce ? "0" : String(totalM);
      trainMs.forEach((p) => {
        p.style.strokeDasharray = `${TRAIN_LEN_MOBILE} ${totalM}`;
        p.style.strokeDashoffset = reduce
          ? String(TRAIN_LEN_MOBILE - totalM)
          : String(TRAIN_LEN_MOBILE);
      });

      // Segments in REAL wrap-local pixels, mirroring the `d` string built
      // above exactly: draw (gap), hold (card body), draw, hold, ... draw
      // (exit). This is what fixes the actual bug — see the buildMobileLine
      // and headFromPageY docs — by tracking how much REAL scroll each part
      // costs, not how much arc-length it drew.
      const segs: MobileSegment[] = [];
      let arc = 0;
      segs.push({ type: "draw", pageStart: boxes[0].centerY, pageEnd: boxes[0].bottom, arcStart: arc });
      arc += boxes[0].bottom - boxes[0].centerY;
      for (let i = 1; i < boxes.length; i++) {
        segs.push({ type: "draw", pageStart: boxes[i - 1].bottom, pageEnd: boxes[i].top, arcStart: arc });
        arc += boxes[i].top - boxes[i - 1].bottom;
        segs.push({ type: "hold", pageStart: boxes[i].top, pageEnd: boxes[i].bottom, arcAt: arc });
      }
      segs.push({
        type: "draw",
        pageStart: boxes[boxes.length - 1].bottom,
        pageEnd: endY,
        arcStart: arc,
      });
      segmentsM = segs;

      // The window ScrollTrigger will actually use for THIS config
      // (trigger: firstCard, start:"center center" .. endTrigger: root,
      // end:"bottom 25%"), measured directly rather than assumed, so it can
      // never drift out of sync with the real trigger. self.progress in
      // onUpdate is 0..1 across exactly this window; pageStartM/pageSpanM let
      // headFromPageY convert that back to a real wrap-local Y.
      const vh = window.innerHeight;
      const firstR = cards[0].getBoundingClientRect();
      const startScrollPx = firstR.top + firstR.height / 2 - vh / 2;
      const endScrollPx = sectionR.bottom - vh * 0.25;
      pageStartM = boxes[0].centerY;
      pageSpanM = endScrollPx - startScrollPx;
    };

    const isDesktop = () => window.matchMedia("(min-width: 1024px)").matches;
    if (isDesktop()) buildLine();
    else buildMobileLine();

    const ro = new ResizeObserver(() => {
      if (isDesktop()) {
        buildLine();
      } else {
        buildMobileLine();
      }
      ScrollTrigger.refresh();
    });
    ro.observe(wrap);

    const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-skill-card]"));

    const MOBILE_REVEAL_Y = 44; // px cards[1..] rise from as their station arrives
    // In real scroll PIXELS now, not scroll-progress fractions — everything
    // mobile touches is real-pixel-based after the headFromPageY fix, so this
    // stays consistent and isn't at the mercy of how big the window happens
    // to be. 130px is a comfortably visible slide on any card.
    const MOBILE_REVEAL_PX = 130;
    // How far PAST the train's own arrival (in real px) the card keeps
    // rising. Small and positive: the train gets there first, the card
    // settles a beat after — reads as sequential, not simultaneous.
    const MOBILE_REVEAL_LAG_PX = 20;

    const ctx = gsap.context(() => {
      if (reduce) {
        cards.forEach((c) => c.classList.add("line-reached"));
        return;
      }

      // gsap.matchMedia — NOT a one-time boolean check. The geometry rebuild
      // above (buildLine/buildMobileLine via the ResizeObserver) already
      // re-evaluates isDesktop() live on every resize, but this entrance/
      // reveal wiring used to be gated by `desktopNow`, captured ONCE at
      // mount and never revisited. Cross the 1024px breakpoint by resizing
      // the window (not just loading fresh at a given width — a real,
      // ordinary thing a visitor does) and the geometry correctly rebuilds
      // for desktop while the MOBILE reveal system — its one-time
      // `gsap.set(restCards, {y: 44})` and its scroll-driven onUpdate reading
      // now-stale boxesM/segmentsM — stayed permanently wired up, since it
      // only ran once and was never torn down. Every card but the first sat
      // stuck at `translateY(44px)` under desktop's layout, visibly
      // overlapping the section below. gsap.matchMedia() (already the
      // established pattern in this codebase — SideRail.tsx, Hero.tsx) kills
      // whatever the previously-matching branch created and runs the new one
      // fresh, automatically, on every breakpoint crossing.
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        // The train is driven by scroll along the WHOLE section, so departure
        // and arrival line up with the cards actually passing through the
        // viewport. Widest usable range: the train has to cover the WHOLE
        // track inside this window, so a short window forces it to move
        // several px of track per px of scroll. "top bottom" -> "bottom top"
        // buys roughly a full viewport of extra scroll versus the old
        // 75%/85% pair, which is the single biggest lever on train speed.
        ScrollTrigger.create({
          // Departure is tied to the PILL, not the section top. "top bottom"
          // on the section fires when the section's top merely touches the
          // bottom of the viewport — the label is still ~600px below the fold
          // at that point, so the train had already run its first leg by the
          // time you could see where it started, which read as "it starts at
          // the card". Anchoring to the label means the train leaves when you
          // can watch it leave. endTrigger keeps the finish on the section,
          // so no scroll is wasted holding still and the whole window stays
          // available for motion.
          trigger: startAnchor ?? root,
          start: "top 78%",
          endTrigger: root,
          // Trimmed from "bottom top" — finishing once the section has fully
          // exited gave the whole traversal more scroll than it needed, which
          // read as slow. Ending a bit earlier packs the same path length into
          // less scroll, directly raising both average and peak speed.
          end: "bottom 25%",
          scrub: 0.9,
          onUpdate: (self) => {
            if (!total) return;
            const headN = schedule(self.progress); // 0..1 along the track
            const head = headN * total;
            trails.forEach((p) => {
              p.style.strokeDashoffset = String(total - head);
            });
            trains.forEach((p) => {
              p.style.strokeDashoffset = String(TRAIN_LEN - head);
            });
            // A platform lights up once the train has actually reached it.
            cards.forEach((card, i) => {
              const s = stationAt[i];
              card.classList.toggle("line-reached", s !== undefined && headN >= s - 0.005);
            });
          },
        });

        cards.forEach((card) => {
          // OPACITY ONLY — no x/y. The track is built from resting card
          // geometry and physically runs through each card, so any transform
          // on the card slides its two dots off their own rails. That was
          // survivable as a one-shot entrance; now that the reveal REVERSES
          // on scroll-up it would happen every time you scrolled back,
          // repeatedly tearing the line away from the platforms. Fading keeps
          // the card pinned to the track while still reversing cleanly, and
          // the train supplies the motion here.
          gsap.from(card, {
            opacity: 0,
            duration: 0.55,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          });
        });
      });

      mm.add("(max-width: 1023.98px)", () => {
        // --- MOBILE / TABLET (<lg) -----------------------------------------
        // Card 1 reveals on its own, same as always — it's not part of the
      // sequence, the track starts FROM it. Cards 2..n stay hidden until the
      // train's own position says they've been reached: no independent
      // ScrollTrigger per card, their reveal is a direct function of the
      // train's scroll-scrubbed progress, so it can never be out of step with
      // the line reaching them, in either scroll direction.
      const [firstCard, ...restCards] = cards;
      if (firstCard) {
        gsap.from(firstCard, {
          opacity: 0,
          duration: 0.55,
          ease: "power3.out",
          scrollTrigger: {
            trigger: firstCard,
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
        });
      }
      gsap.set(restCards, { opacity: 0, y: MOBILE_REVEAL_Y });

      // Parked-at-a-station breathing pulse. The position fix means the train
      // now correctly FREEZES for the entire real height of whatever card
      // you're scrolling past (400-560px of scroll with zero dash movement) —
      // geometrically correct, but a dead-still element for that long reads
      // as stuck/broken rather than "waiting". Only the solid train path
      // (trainMs[1], the brighter one) pulses — pulling the glow underneath
      // it too would flatten the glow/solid contrast that sells "train" over
      // "line". A single persistent tween, paused by default and toggled
      // on/off by hold-state below, rather than creating a new tween on every
      // scroll tick.
      const solidTrainM = trainMs[1] ?? trainMs[0] ?? null;
      const pulse = solidTrainM
        ? gsap.to(solidTrainM, {
            opacity: 0.5,
            duration: 0.55,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            paused: true,
          })
        : null;
      let wasHolding = false;

      ScrollTrigger.create({
        // "Starts from the middle of the first card": departure is tied to
        // card 1 crossing the vertical centre of the viewport, not the
        // section edge — matching where the path itself begins (card 1's own
        // vertical middle).
        trigger: firstCard ?? root,
        start: "center center",
        endTrigger: root,
        end: "bottom 25%", // same window trim as desktop, same reason
        scrub: 0.9,
        onUpdate: (self) => {
          if (!totalM || !segmentsM.length) return;
          // Convert self.progress (0..1 of the REAL scroll window) back to a
          // real wrap-local Y, then look up the arc-length fraction that
          // corresponds to it. This is the actual fix: headN now reflects how
          // far you've physically scrolled, not an arc-length budget that had
          // no relationship to how tall each card really is.
          const pageY = pageStartM + self.progress * pageSpanM;
          const { headN, holding } = headFromPageY(segmentsM, totalM, pageY);
          const head = headN * totalM;
          if (trailM) trailM.style.strokeDashoffset = String(totalM - head);
          trainMs.forEach((p) => {
            p.style.strokeDashoffset = String(TRAIN_LEN_MOBILE - head);
          });
          if (pulse && holding !== wasHolding) {
            wasHolding = holding;
            if (holding) pulse.play();
            else pulse.pause().progress(0);
          }
          // Reveal is driven the SAME way — real pixels, anchored on each
          // card's own actual top edge (boxesM[i+1].top), not a fraction of
          // an arbitrary window. MOBILE_REVEAL_PX gives a comfortably visible
          // slide regardless of how short a given gap is; MOBILE_REVEAL_LAG_PX
          // keeps the "train arrives, card catches up right after" ordering,
          // now in the same real units as everything else here.
          restCards.forEach((card, i) => {
            const box = boxesM[i + 1];
            if (!box) return;
            const revealEndY = box.top + MOBILE_REVEAL_LAG_PX;
            const revealStartY = revealEndY - MOBILE_REVEAL_PX;
            const raw = clamp01((pageY - revealStartY) / MOBILE_REVEAL_PX);
            const eased = easeInOut(raw);
            gsap.set(card, { opacity: eased, y: (1 - eased) * MOBILE_REVEAL_Y });
          });
        },
      });
      });
    }, scope);

    return () => {
      ro.disconnect();
      ctx.revert();
    };
  }, []);

  // One <svg> is rendered twice: BELOW the cards (dim — the train seen through
  // the translucent card, i.e. pulling through the station) and ABOVE the cards
  // (crisp, masked so it only paints in the gutters). Same `d`, same dash
  // maths on both, so the train reads as one continuous vehicle.
  const track = (layer: "back" | "front") => (
    <svg
      data-skill-svg
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 hidden h-full w-full overflow-visible lg:block ${
        layer === "front" ? "z-20" : "z-0"
      }`}
      fill="none"
    >
      {layer === "front" && (
        <defs>
          <mask data-mask id="skill-track-mask" maskUnits="userSpaceOnUse">
            <rect data-mask-bg x="0" y="0" fill="white" />
            <g data-mask-cards />
          </mask>
        </defs>
      )}
      <g mask={layer === "front" ? "url(#skill-track-mask)" : undefined}>
        {/* Rails: already laid, the whole route visible before the train runs. */}
        <path
          data-track-rail
          stroke="var(--ultra)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={layer === "front" ? 0.09 : 0.11}
        />
        {/* Track already travelled. */}
        <path
          data-track-trail
          stroke="var(--ultra)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={layer === "front" ? 0.26 : 0.2}
        />
        {/* Glow under the train body. */}
        <path
          data-track-train
          stroke="var(--signal)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={layer === "front" ? 0.22 : 0.28}
        />
        {/* The train itself. */}
        <path
          data-track-train
          stroke="var(--signal)"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={layer === "front" ? 1 : 0.8}
        />
      </g>
    </svg>
  );

  // Mobile/tablet track: one layer, not two. The desktop version needs a
  // dim-below/crisp-above split specifically because its line crosses THROUGH
  // card bodies (so a card sitting over it needs to dim it, not hide it
  // entirely). This line only ever runs in the gaps between cards, so there's
  // nothing for a card to occlude and no mask is needed.
  const mobileTrack = (
    <svg
      data-skill-svg-m
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 block h-full w-full overflow-visible lg:hidden"
      fill="none"
    >
      <path
        data-track-rail-m
        stroke="var(--ultra)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.13}
      />
      <path
        data-track-trail-m
        stroke="var(--ultra)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.32}
      />
      <path
        data-track-train-m
        stroke="var(--signal)"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.25}
      />
      <path
        data-track-train-m
        stroke="var(--signal)"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={1}
      />
    </svg>
  );

  return (
    <section
      id="skills"
      ref={scope}
      className="relative overflow-hidden px-6 py-32 sm:px-10 lg:pl-[388px]"
    >
      <WaterBackground reduced={reduced} />

      {/* The pill lives INSIDE the track wrap because it IS the track's origin:
          the line starts beneath "What I work with" and runs off the bottom
          edge into the next section, so it never begins or ends in mid-air. */}
      <div data-skill-line-wrap className="relative">
        {track("back")}
        {mobileTrack}

        {/* The column is inset at lg+ so the SVG (which spans the full wrap)
            keeps a gutter OUTSIDE the outermost card edge. Without that margin
            a horizontal tangent has nowhere to swing and the curve collapses
            back into a diagonal. Card width is capped to keep the left/right
            alternation readable once the padding is taken out. */}
        <div className="relative z-10 flex flex-col gap-12 lg:gap-20 lg:px-16 xl:px-24">
          {/* Pulled back out of the column's inset so the label sits close to
              the rail. It is the track's anchor, and the anchor has to start
              LEFT of the first dot — sitting to its right is what forced the
              curve to swing past the dot and double back, which read as a
              kink in the line. */}
          <Reveal className="lg:-ml-16 xl:-ml-24">
            <span
              data-track-start
              className="inline-block w-fit rounded-full border border-border-paper px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-ultra"
            >
              What I work with
            </span>
          </Reveal>

          {skills.map((s, i) => (
            <article
              key={s.title}
              data-skill-card
              data-card
              className={`group relative w-full max-w-3xl rounded-card border border-border-paper bg-paper-card/60 p-10 backdrop-blur-[20px] sm:p-12 lg:max-w-[540px] xl:max-w-[660px] ${
                i % 2 === 1 ? "lg:self-end" : "lg:self-start"
              }`}
            >
              {/* Two dots, opposite edges, vertical centre: the train comes IN
                  one side of the platform and leaves from the OTHER. */}
              <span
                data-skill-node="in"
                aria-hidden="true"
                className={`absolute top-1/2 hidden h-4 w-4 -translate-y-1/2 rounded-full bg-signal ring-4 ring-paper lg:block ${
                  i % 2 === 1 ? "-right-2" : "-left-2"
                }`}
              />
              <span
                data-skill-node="out"
                aria-hidden="true"
                className={`absolute top-1/2 hidden h-4 w-4 -translate-y-1/2 rounded-full bg-signal ring-4 ring-paper lg:block ${
                  i % 2 === 1 ? "-left-2" : "-right-2"
                }`}
              />

              <div className="flex justify-end">
                <CardIcon icon={s.icon} className="h-11 w-11 shrink-0" />
              </div>

              {/* Fluid on mobile (vw, not a fixed rem step) because the card's
                  own width is fluid there too — text-6xl (60px) was fixed
                  regardless of viewport, and a single word like "Automation"
                  is wider than that at any phone under ~600px, so it ran off
                  the card and off the screen instead of wrapping smaller.
                  break-words is a safety net, not the fix: the overflow here
                  was one whole word too wide, which can't be broken further. */}
              <h3 className="font-display mt-4 break-words text-[11vw] font-bold leading-none tracking-[-0.03em] text-ultra-bright sm:text-6xl lg:text-7xl">
                {s.title}
              </h3>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-paper">
                {s.detail}
              </p>

              <div className="mt-8 flex flex-wrap gap-2.5">
                {s.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-border-paper px-3.5 py-2 font-mono text-xs text-muted-paper"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* Reflection — the "sitting on water" cue. A flipped, blurred,
                  fading echo of the card's own base, not its content; that's
                  enough to sell the surface without duplicating real text. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-6 top-full h-14 -scale-y-100 rounded-b-card border border-border-paper bg-paper-card/60 opacity-25 blur-[6px]"
                style={{
                  maskImage: "linear-gradient(to bottom, black, transparent)",
                  WebkitMaskImage: "linear-gradient(to bottom, black, transparent)",
                }}
              />
            </article>
          ))}

          {/* Run-off room. The wrap's height is what the exit curve turns
              through on its way off the bottom edge; without this the track
              would have to stop dead on the last card. */}
          <div aria-hidden="true" className="hidden lg:block lg:h-28" />
        </div>

        {track("front")}
      </div>
    </section>
  );
}
