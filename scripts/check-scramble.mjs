// Render checks for stable markup and accessible text; browser geometry is a separate check.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const moduleRequire = createRequire(import.meta.url);
const componentModule = { exports: {} };
const code = ts.transpileModule(readFileSync("src/components/LineTextReveal.tsx", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
}).outputText;
vm.runInNewContext(code, {
  module: componentModule, exports: componentModule.exports,
  require: (name) => moduleRequire(name === "gsap/ScrambleTextPlugin" ? "gsap/dist/ScrambleTextPlugin" : name),
});
const text = "Node.js and APIs stay readable.";
const html = renderToStaticMarkup(React.createElement(componentModule.exports.default, { text, keywords: ["Node.js", "APIs"] }));
assert.ok(html.includes('<span class="sr-only">' + text + "</span>"), "accessible text must remain intact");
assert.ok(html.includes('aria-hidden="true"'), "animated glyphs must not be announced");
const count = Array.from(text).filter((letter) => !/\s/.test(letter)).length;
assert.equal((html.match(/data-original=/g) ?? []).length, count, "every glyph must retain its original in normal flow");
assert.equal((html.match(/data-scrambled=/g) ?? []).length, count, "every glyph needs a separate scramble layer");
assert.ok(!/shape-outside|float:left|font-size:/.test(html), "layout-moving treatment returned");
assert.equal((html.match(/absolute inset-0 text-center opacity-0/g) ?? []).length, count, "scramble layers must start invisible and outside flow");
console.log("PASS: complete accessible copy, stable original glyphs, hidden absolute scramble layers, no floating exclusion or resizing.");

// Exercise the real pointer handler against reference geometry, not source-text assertions.
const listeners = new Map();
const calls = [];
const effects = [];
const frames = new Map();
let frameId = 0;
const letters = Array.from({ length: 30 }, (_, i) => {
  const original = { textContent: "A", style: {} };
  const glyph = { textContent: "A", style: {} };
  return {
    style: {},
    getBoundingClientRect: () => ({ left: i * 2, top: 0, width: 2, height: 10 }),
    querySelector: (selector) => selector === "[data-original]" ? original : glyph,
  };
});
const wrap = {
  querySelectorAll: () => letters,
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 300, height: 100 }),
  addEventListener: (name, callback) => listeners.set(name, callback),
  removeEventListener: (name) => listeners.delete(name),
};
let cleanup, intersection, played = false;
const introCalls = [];
const timeline = { to(target, vars) { introCalls.push({ target, vars }); return this; }, time() { return this; }, play() { played = true; }, kill() {} };
const gsapStub = {
  registerPlugin() {}, to: (target, vars) => { calls.push({ target, vars }); },
  killTweensOf() {}, timeline: () => timeline,
  matchMedia: () => ({ add: (_, fn) => { cleanup = fn(); }, revert: () => cleanup?.() }),
};
const runtimeModule = { exports: {} };
vm.runInNewContext(code, {
  module: runtimeModule, exports: runtimeModule.exports,
  require: (name) => name === "react" ? {
    useRef: () => ({ current: wrap }), useMemo: (fn) => fn(), useEffect: (fn) => effects.push(fn),
  } : name === "gsap" ? gsapStub : name === "gsap/ScrambleTextPlugin" ? {} : moduleRequire(name),
  window: { getSelection: () => null, getComputedStyle: () => ({ fontSize: "30px" }) }, document: { fonts: { ready: Promise.resolve() } },
  performance: { now: () => 1000 },
  requestAnimationFrame: (fn) => { frames.set(++frameId, fn); return frameId; },
  cancelAnimationFrame: (id) => frames.delete(id),
  ResizeObserver: class { observe() {} disconnect() {} },
  IntersectionObserver: class { constructor(fn) { intersection = fn; } observe() {} disconnect() {} },
});
runtimeModule.exports.default({ text: "A" });
const dispose = effects[0]();
assert.equal(introCalls.length, 30, "intro includes every glyph");
assert.ok(introCalls.every(({ vars }) => vars.scrambleText.revealDelay >= .15), "intro delays the reveal");
intersection([{ isIntersecting: true }]);
assert.equal(played, true, "intro begins on section intersection");
const flush = (time = 16) => {
  const batch = [...frames.values()]; frames.clear(); batch.forEach((fn) => fn(time));
};
listeners.get("pointerenter")?.();
const pointer = { pointerType: "mouse", clientX: 1, clientY: 5, button: 0 };
listeners.get("pointermove")(pointer); flush();
assert.equal(calls.length, 30, "reference scrambles ALL letters inside radius, not a capped subset");
assert.equal(calls[0].vars.duration, 1.2, "reference uses 1.2 seconds at pointer center");
assert.ok(Math.abs(calls[29].vars.duration - 1.2 * (1 - 58 / 100)) < 1e-9, "duration must fall off with distance");
assert.equal(calls[0].vars.overwrite, true, "pointer updates overwrite/restart the glyph tween");
assert.equal(calls[0].vars.scrambleText.speed, .5);
listeners.get("pointermove")(pointer); flush();
assert.equal(calls.length, 60, "reference has no cooldown or active-letter exclusion");
assert.ok(listeners.has("pointerdown"), "reference click wave is wired");
calls.length = 0;
listeners.get("pointerdown")(pointer);
for (let index = 1; index <= 60; index++) flush(16 + index * 16);
assert.equal(calls.length, 30, "outward click wave reaches each glyph exactly once");
assert.equal(frames.size, 0, "click wave stops scheduling after completion");
dispose();
assert.equal(listeners.size, 0, "all pointer handlers are removed");
assert.equal(frames.size, 0, "no pending animation frame survives unmount");
console.log("PASS: reference hover coverage, distance falloff, retriggering, speed, intersection intro, bounded click wave and cleanup.");
