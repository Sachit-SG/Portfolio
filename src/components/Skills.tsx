"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Reveal from "./Reveal";
import CardIcon from "./CardIcon";
import Antigravity from "./Antigravity";
import {
  Database,
  Workflow,
  LayoutDashboard,
  Server,
  PenTool,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const skills = [
  // AI automation leads the list because it is the first-priority role target,
  // and the section is read top-down. Full-stack follows.
  {
    title: "Automation",
    icon: Workflow,
    // Tags trimmed to what Sachit confirmed he can defend in an interview.
    // "LLM APIs", "Prompt design" and "AI-first delivery" were removed — he
    // has not shipped them, and an unbacked tag on the lead card is the fastest
    // way to lose the room. The two kept alongside it point at work already on
    // this site (scheduled jobs and internal tools), not demo usage figures.
    detail:
      "Approval flows and scheduled jobs for repeated tasks in internal tools.",
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
      "Responsive pages and interfaces, including layouts, interactions and scroll animations.",
    tags: ["HTML", "CSS", "JavaScript", "GSAP"],
  },
  {
    title: "Platform & data",
    icon: Server,
    detail:
      "Deployments, file storage and scheduled jobs using Vercel, Supabase and AWS S3.",
    tags: ["Vercel", "Supabase", "AWS S3", "Cron jobs"],
  },
  {
    title: "Design",
    icon: PenTool,
    detail:
      "Two years of design experience before development, working on interfaces, layout and motion.",
    tags: ["Figma", "UI systems", "Motion / GSAP"],
  },
];

const TRAIN_LEN = 260; // px of track the train body occupies (desktop)
// Desktop's arc-length is ~6400px; mobile's is only ~600px (the path skips
// through every card body, contributing zero arc-length there). Sharing
// TRAIN_LEN would make the mobile train ~40% of its own entire track.
const TRAIN_LEN_MOBILE = 46;
const DWELL_WEIGHT = 0.02; // Brief arrival beat; most scroll moves the light.

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
  | { type: "draw"; pageStart: number; pageEnd: number; arcStart: number; arcLength?: number }
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
      return { headN: (s.arcStart + t * (s.arcLength ?? span)) / totalArc, holding: false };
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
  const [backgroundActive, setBackgroundActive] = useState(false);

  useEffect(() => {
    const section = scope.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => setBackgroundActive(entry.isIntersecting),
      { rootMargin: "80px 0px" }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

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
    const guides = Array.from(wrap.querySelectorAll<SVGPathElement>("[data-track-guide]"));
    const startAnchor = wrap.querySelector<HTMLElement>("[data-track-start]");

    // Mobile track — separate elements, separate data-attributes. Reusing the
    // desktop ones would make wrap.querySelectorAll('[data-track-rail]') pick
    // up BOTH layers at once, so the two builders would silently fight over
    // the same DOM nodes.
    const railM = wrap.querySelector<SVGPathElement>("[data-track-rail-m]");
    const trailM = wrap.querySelector<SVGPathElement>("[data-track-trail-m]");
    const trainMs = Array.from(wrap.querySelectorAll<SVGPathElement>("[data-track-train-m]"));
    const guideM = wrap.querySelector<SVGPathElement>("[data-track-guide-m]");
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
     *  - Each card has an entry and exit dot at the middle of opposite side
     *    edges. The light traces only the upper half of the perimeter, so it
     *    never loops around the bottom edge and back up the card.
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
          top: card.getBoundingClientRect().top - wr.top - ty,
          bottom: card.getBoundingClientRect().bottom - wr.top - ty,
        };
      });
      if (legs.some((l) => !l.inP || !l.outP)) return;

      const f = (n: number) => n.toFixed(1);
      const clampX = (x: number) => Math.max(6, Math.min(wr.width - 6, x));
      // One measured route owns gutter travel, half-card tracing and reversal.
      const cardEdge = (leg: typeof legs[number]) => {
        const a = leg.inP!;
        const b = leg.outP!;
        const direction = Math.sign(b.x - a.x);
        const r = 8;
        const upper = ` L ${f(a.x)} ${f(leg.top + r)} Q ${f(a.x)} ${f(leg.top)} ${f(a.x + direction * r)} ${f(leg.top)} L ${f(b.x - direction * r)} ${f(leg.top)} Q ${f(b.x)} ${f(leg.top)} ${f(b.x)} ${f(leg.top + r)} L ${f(b.x)} ${f(b.y)}`;
        return upper;
      };

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
      let guideD = d;
      d += cardEdge(legs[0]);

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
        const outerX = dir > 0 ? Math.max(a.x, b.x) : Math.min(a.x, b.x);
        const outerSpace = dir > 0 ? wr.width - outerX : outerX;
        const laneX = clampX(outerX + dir * Math.min(120, outerSpace * 0.55));
        // A shared exterior control lane keeps the entire curve outside both
        // card faces; separate control offsets could overshoot behind a card.
        const connector = ` C ${f(laneX)} ${f(a.y)}, ${f(laneX)} ${f(b.y)}, ${f(b.x)} ${f(b.y)}`;
        d += connector;
        guideD += ` M ${f(a.x)} ${f(a.y)}${connector}`;
        d += cardEdge(legs[i]);
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
      const exit = ` C ${f(exitX)} ${f(last.y)}, ${f(exitX)} ${f(last.y + (endY - last.y) * 0.45)}, ${f(exitX)} ${f(endY)}`;
      d += exit;
      guideD += ` M ${f(last.x)} ${f(last.y)}${exit}`;

      svgs.forEach((s) => s.setAttribute("viewBox", `0 0 ${wr.width} ${wr.height}`));
      [...rails, ...trails, ...trains].forEach((p) => p.setAttribute("d", d));
      guides.forEach((p) => p.setAttribute("d", guideD));

      total = rails[0]?.getTotalLength() ?? 0;
      if (!total) return;

      trails.forEach((p) => {
        p.style.strokeDasharray = String(total);
        p.style.strokeDashoffset = reduce ? "0" : String(total);
      });
      trains.forEach((p) => {
        p.style.strokeDasharray = `${TRAIN_LEN} ${total}`;
        p.style.strokeDashoffset = reduce ? String(TRAIN_LEN - total) : String(TRAIN_LEN);
      });

      // Station = the entry dot of each card. Sample the measured path so the
      // scroll schedule reaches each card at its real arc length.
      const SAMPLES = 700;
      const pts: { l: number; x: number; y: number }[] = [];
      for (let i = 0; i <= SAMPLES; i++) {
        const l = (total * i) / SAMPLES;
        const pt = rails[0].getPointAtLength(l);
        pts.push({ l, x: pt.x, y: pt.y });
      }
      stationAt = legs.map((leg) => {
        const mx = leg.inP!.x;
        const my = leg.inP!.y;
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
          left: r.left - wr.left - tx,
          right: r.right - wr.left - tx,
        };
      };
      const boxes = cards.map(boxOf);
      boxesM = boxes;
      const x = boxes[0].centerX; // single column — every card shares one centre x
      const f = (n: number) => n.toFixed(1);

      const sectionR = root.getBoundingClientRect();
      const endY = wr.height + Math.max(0, sectionR.bottom - wr.bottom);
      let d = `M ${f(x)} ${f(boxes[0].top)}`;
      let guideD = "";
      const segs: MobileSegment[] = [];
      let arc = 0;
      boxes.forEach((box, i) => {
        if (i) {
          const gap = box.top - boxes[i - 1].bottom;
          segs.push({ type: "draw", pageStart: boxes[i - 1].bottom, pageEnd: box.top, arcStart: arc });
          arc += gap;
          d += ` L ${f(x)} ${f(box.top)}`;
          guideD += ` M ${f(x)} ${f(boxes[i - 1].bottom)} L ${f(x)} ${f(box.top)}`;
        }
        const { right: r, top: t, bottom: b } = box;
        const edge = ` L ${f(r - 8)} ${f(t)} Q ${f(r)} ${f(t)} ${f(r)} ${f(t + 8)} L ${f(r)} ${f(b - 8)} Q ${f(r)} ${f(b)} ${f(r - 8)} ${f(b)} L ${f(x)} ${f(b)}`;
        railM.setAttribute("d", `M ${f(x)} ${f(t)}` + edge);
        const length = railM.getTotalLength();
        segs.push({ type: "draw", pageStart: t, pageEnd: b, arcStart: arc, arcLength: length });
        arc += length;
        d += edge;
      });
      segs.push({ type: "draw", pageStart: boxes[boxes.length - 1].bottom, pageEnd: endY, arcStart: arc });
      d += ` L ${f(x)} ${f(endY)}`;
      guideD += ` M ${f(x)} ${f(boxes[boxes.length - 1].bottom)} L ${f(x)} ${f(endY)}`;
      segmentsM = segs;

      svgM.setAttribute("viewBox", `0 0 ${wr.width} ${wr.height}`);
      [railM, trailM, ...trainMs].forEach((p) => p.setAttribute("d", d));
      guideM?.setAttribute("d", guideD);

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

      // The window ScrollTrigger will actually use for THIS config
      // (trigger: firstCard, start:"center center" .. endTrigger: root,
      // end:"bottom 25%"), measured directly rather than assumed, so it can
      // never drift out of sync with the real trigger. self.progress in
      // onUpdate is 0..1 across exactly this window; pageStartM/pageSpanM let
      // headFromPageY convert that back to a real wrap-local Y.
      const vh = window.innerHeight;
      const firstR = cards[0].getBoundingClientRect();
      const startScrollPx = firstR.top - vh / 2;
      const endScrollPx = sectionR.bottom - vh * 0.25;
      pageStartM = boxes[0].top;
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
          // onUpdate reads scroll progress directly; a numeric scrub on a
          // trigger without an animation cannot smooth these DOM writes.
          scrub: true,
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
              opacity: .55,
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
      gsap.set(restCards, { opacity: .55 });

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

      ScrollTrigger.create({
        // "Starts from the middle of the first card": departure is tied to
        // card 1 crossing the vertical centre of the viewport, not the
        // section edge — matching where the path itself begins (card 1's own
        // vertical middle).
        trigger: firstCard ?? root,
        start: "top center",
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
          root.dataset.ledProgress = self.progress.toFixed(3);
          firstCard?.classList.toggle("line-reached", pageY >= (boxesM[0]?.top ?? 0));
          const { headN } = headFromPageY(segmentsM, totalM, pageY);
          const head = headN * totalM;
          if (trailM) trailM.style.strokeDashoffset = String(totalM - head);
          trainMs.forEach((p) => {
            p.style.strokeDashoffset = String(TRAIN_LEN_MOBILE - head);
          });
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
            gsap.set(card, { opacity: .55 + .45 * eased });
            card.classList.toggle("line-reached", pageY >= box.top);
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

  // The full route measures the moving light. Separate gutter-only subpaths
  // paint the resting guide, so no mask can sever it before a midpoint dot.
  const track = (layer: "back" | "front") => (
    <svg
      data-skill-svg
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 hidden h-full w-full overflow-visible lg:block ${
        layer === "front" ? "z-20" : "z-0"
      }`}
      fill="none"
    >
      <path data-track-guide stroke="var(--ultra)" strokeWidth="3" strokeLinecap="round" opacity={layer === "front" ? 0.15 : 0} />
      <path data-track-rail opacity={0} />
      <path data-track-trail opacity={0} />
      {/* Only the moving light crosses the card edge. */}
      <path
        data-track-train
        stroke="var(--signal)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={layer === "front" ? 1 : 0}
      />
    </svg>
  );

  // Mobile/tablet uses the same gutter-only resting guide.
  const mobileTrack = (
    <svg
      data-skill-svg-m
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-20 block h-full w-full overflow-visible lg:hidden"
      fill="none"
    >
      <path data-track-guide-m stroke="var(--ultra)" strokeWidth="3" strokeLinecap="round" opacity={0.15} />
      <path data-track-rail-m opacity={0} />
      <path data-track-trail-m opacity={0} />
      <path
        data-track-train-m
        stroke="var(--signal)"
        strokeWidth="5"
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
      className="relative overflow-hidden px-6 py-20 sm:px-10 lg:pl-[288px]"
    >
      {backgroundActive && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 opacity-60"
        >
          <Antigravity
            count={460}
            colors={["#D92626", "#E03131", "#AD2121"]}
            colorMode="radial"
            colorSpeed={0}
            magnetRadius={6}
            ringRadius={4.4}
            particleSize={0.46}
            particleVariance={0.12}
            fieldStrength={10}
            waveAmplitude={0.08}
            waveCount={2}
            waveSpeed={0.08}
            rotationSpeed={0}
            pulseSpeed={0.2}
            depthFactor={0.08}
            ambient={0.2}
            lerpSpeed={0.08}
            interactive
            autoAnimate
            clickBurst={false}
            intro={false}
            lightMode
            opacity={0.72}
            paperRange={["skills", "contact"]}
            maxDevicePixelRatio={1.25}
            className="absolute inset-0"
          />
        </div>
      )}

      {/* The pill lives INSIDE the track wrap because it IS the track's origin:
          the line starts beneath "What I work with" and runs off the bottom
          edge into the next section, so it never begins or ends in mid-air. */}
      <div data-skill-line-wrap className="relative z-10">
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
            <h2
              data-track-start
              className="inline-block w-fit font-display text-[clamp(2rem,4vw,4rem)] font-semibold leading-none tracking-[-.04em] text-text-paper"
            >
              What I build.
            </h2>
          </Reveal>

          {skills.map((s, i) => {
            return (
              <article
                key={s.title}
                data-skill-card
                data-card
                className={`group relative w-full max-w-3xl rounded-[8px] border border-transparent bg-paper-card/60 p-10 backdrop-blur-[20px] sm:p-12 lg:max-w-[540px] xl:max-w-[660px] ${
                  i % 2 === 1 ? "lg:self-end" : "lg:self-start"
                }`}
              >
                {/* Opposite mid-edge dots bookend the upper half-card trace. */}
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

                {/* Fluid on mobile because the card is fluid too. */}
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
                      className="rounded-full border border-border-paper px-3.5 py-2 font-ui text-[13px] font-medium text-muted-paper"
                    >
                      {t}
                    </span>
                  ))}
                </div>

              </article>
            );
          })}

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
