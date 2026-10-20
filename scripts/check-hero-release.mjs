// Execute the production background tweens in real GSAP; DOM paint remains browser QA.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import gsap from "gsap";
import ts from "typescript";
const source = readFileSync("src/components/SideRail.tsx", "utf8");
const start = source.indexOf("tl.to(scene,");
const end = source.indexOf('.to(hero.querySelectorAll("[data-hero-copy]")', start);
assert.ok(start >= 0 && end > start, "background sequence was not found");
const beats = vm.runInNewContext("(" + source.match(/const beats = (\{[^;]+\});/)[1] + ")");
const scene = [{ yPercent: 0, scale: 1, opacity: 1 }];
const subject = [{ yPercent: 0, scale: 1, opacity: 1 }];
const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
vm.runInNewContext(source.slice(start, end).trim() + ";", { tl, scene, subject, beats });
let previous = 0;
for (const time of [0.3, 0.46, 0.62, 0.78, 0.9, 1]) {
  tl.time(time);
  assert.ok(scene[0].yPercent < previous, "room stopped moving during handoff at " + time);
  assert.ok(subject[0].yPercent < scene[0].yPercent, "foreground lost its depth separation");
  previous = scene[0].yPercent;
}
assert.equal(scene[0].opacity, 0, "room must release before Work takes over");
assert.equal(subject[0].opacity, 0, "subject must release before Work takes over");
tl.time(0);
assert.equal(scene[0].yPercent, 0, "reverse scrolling did not restore the room");
assert.equal(subject[0].yPercent, 0, "reverse scrolling did not restore the subject");
assert.equal(scene[0].opacity, 1);
assert.equal(subject[0].opacity, 1);
tl.kill();
const flyStart = source.indexOf("const flyPair =");
const flyEnd = source.indexOf("if (namePair)", flyStart);
assert.ok(flyStart >= 0 && flyEnd > flyStart, "shared identity flight is missing");
const pair = {
  source: { opacity: 1 }, target: { opacity: 0 },
  visual: { opacity: 0, x: 0, y: 0, scaleX: 1, scaleY: 1 },
  x: 48, y: 32, sx: 0.05, sy: 0.05,
};
const flightTimeline = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
const flightCode = ts.transpileModule(source.slice(flyStart, flyEnd) + "flyPair(pair, beats.identity);", {
  compilerOptions: { target: ts.ScriptTarget.ES2020 },
}).outputText;
vm.runInNewContext(flightCode, { tl: flightTimeline, pair, beats });
flightTimeline.time(beats.identity + 0.12);
assert.equal(pair.source.opacity, 0);
assert.equal(pair.target.opacity, 0);
assert.equal(pair.visual.opacity, 1, "name disappeared in mid-flight");
assert.ok(pair.visual.scaleX < 1 && pair.visual.scaleX > pair.sx, "name did not shrink during travel");
flightTimeline.time(beats.identity + 0.3);
assert.equal(pair.target.opacity, 1);
assert.equal(pair.visual.opacity, 0);
assert.equal(pair.visual.x, pair.x);
assert.equal(pair.visual.scaleX, pair.sx);
flightTimeline.time(0);
assert.equal(pair.source.opacity, 1);
assert.equal(pair.target.opacity, 0);
assert.equal(pair.visual.opacity, 0);
flightTimeline.kill();
gsap.ticker.sleep();
console.log("PASS: continuous background release; visible shrinking identity flight, exact landing, and reverse restoration.");
