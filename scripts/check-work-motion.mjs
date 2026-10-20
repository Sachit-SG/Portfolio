// Checks the real component's route lifecycle with DOM/router/animation boundaries stubbed.
// This catches state/cleanup regressions; it does not certify browser pixels or timing.
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { createRequire } from "node:module";
const moduleRequire = createRequire(import.meta.url);

let path = "/work", reduced = false, cursor = 0;
const hooks = [], pending = [], overlays = [], tweens = [], pushes = [], timers = new Map();
const listeners = new Map();
const style = () => ({ removeProperty(key) { delete this[key]; } });
const bounds = { left: 40, top: 200, width: 480, height: 300 };
const source = {
  style: style(), closest: () => ({ getBoundingClientRect: () => bounds }),
  cloneNode: () => ({ style: {}, removeAttribute() {} }),
};
const destination = { style: style(), getBoundingClientRect: () => ({ left: 60, top: 400, width: 1000, height: 625 }) };
const heading = { focused: false, focus() { this.focused = true; } };
const link = {
  href: "https://portfolio.test/work/qt-contracts", target: "", dataset: { projectLink: "qt-contracts" },
  querySelector: () => source, focused: false, focus() { this.focused = true; },
};
const page = {
  querySelector: (selector) => selector.includes("data-work-scene") ? null
    : selector.includes("data-project-hero") ? destination
    : selector.includes("data-project-link") ? link : heading,
  querySelectorAll: () => [],
};
const root = { querySelector: () => page };
const windowMock = {
  scrollY: 0,
  scrollTo({ top }) { this.scrollY = top; },
  matchMedia: () => ({ get matches() { return reduced; }, addEventListener() {}, removeEventListener() {} }),
  addEventListener: (name, fn) => listeners.set(name, fn),
  removeEventListener: (name, fn) => { if (listeners.get(name) === fn) listeners.delete(name); },
};
const register = (callback, deps) => {
  const index = cursor++;
  const old = hooks[index];
  if (!old || deps.some((value, i) => !Object.is(value, old.deps[i]))) pending.push({ index, callback, deps });
};
const react = {
  useRef(value) { const index = cursor++; return hooks[index] ?? (hooks[index] = { current: value }); },
  useEffect: register, useLayoutEffect: register,
};
const gsap = {
  registerPlugin() {},
  matchMedia() { return { add() {}, revert() {} }; },
  context(callback) { callback(); return { add: (fn) => fn(), revert() {} }; },
  to: (target, options) => tweens.push({ target, options }),
  fromTo() {}, killTweensOf() {},
};
const moduleMock = { exports: {} };
const compiled = ts.transpileModule(fs.readFileSync("src/components/WorkMotion.tsx", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
}).outputText;
vm.runInNewContext(compiled, {
  exports: moduleMock.exports, module: moduleMock,
  require(name) {
    if (name === "react") return react;
    if (name === "next/navigation") return { usePathname: () => path, useRouter: () => ({ push: (...args) => pushes.push(args) }) };
    if (name === "gsap") return gsap;
    if (name === "gsap/ScrollTrigger") return {};
    if (name === "@/components/Antigravity") return { __esModule: true, default: () => null };
    if (name.endsWith(".css")) return { shell: "shell", flight: "flight", workAtmosphere: "work-atmosphere", sceneMotion: "scene-motion" };
    return moduleRequire(name);
  },
  window: windowMock, location: { origin: "https://portfolio.test" }, URL,
  document: {
    createElement: () => ({
      style: {}, setAttribute() {}, append() {},
      remove() { const i = overlays.indexOf(this); if (i >= 0) overlays.splice(i, 1); },
    }),
    body: { append: (node) => overlays.push(node) },
  },
  IntersectionObserver: class { observe() {} unobserve() {} disconnect() {} },
  setTimeout: (fn) => { const id = timers.size + 1; timers.set(id, fn); return id; },
  clearTimeout: (id) => timers.delete(id),
});
const Component = moduleMock.exports.default;
function render(nextPath) {
  path = nextPath;
  cursor = 0;
  const output = Component({ children: null });
  output.props.ref.current = root;
  const effects = pending.splice(0);
  for (const { index } of effects) hooks[index]?.cleanup?.();
  for (const { index, callback, deps } of effects) hooks[index] = { deps, cleanup: callback() };
  return output.props.onClickCapture;
}
function click(handler, extra = {}) {
  const event = {
    button: 0, defaultPrevented: false, target: { closest: () => link },
    preventDefault() { this.defaultPrevented = true; }, stopPropagation() {}, ...extra,
  };
  handler(event);
  return event;
}
let navigate = render("/work");
windowMock.scrollY = 680;
listeners.get("scroll")();
assert.equal(click(navigate).defaultPrevented, true);
assert.equal(overlays.length, 1);
assert.equal(source.style.visibility, "hidden");
assert.equal(pushes[0][0], "/work/qt-contracts");
navigate = render("/work/qt-contracts");
assert.equal(overlays.length, 1, "route cleanup removed the image before arrival");
assert.equal(destination.style.visibility, "hidden");
assert.equal(windowMock.scrollY, 0);
assert.equal(tweens.at(-1).options.duration, 0.55);
tweens.at(-1).options.onComplete();
assert.equal(overlays.length, 0);
assert.equal(destination.style.visibility, undefined);
assert.equal(source.style.visibility, undefined);
assert.equal(timers.size, 0);
assert.equal(heading.focused, true);
navigate = render("/work");
assert.equal(windowMock.scrollY, 680, "gallery position was lost");
assert.equal(link.focused, true);
const count = pushes.length;
assert.equal(click(navigate, { metaKey: true }).defaultPrevented, false);
assert.equal(pushes.length, count);
reduced = true;
assert.equal(click(navigate).defaultPrevented, false);
assert.equal(overlays.length, 0, "reduced motion created an animated clone");
reduced = false;
click(navigate);
for (const hook of hooks) hook.cleanup?.();
assert.equal(overlays.length, 0, "unmount leaked the clone");
assert.equal(timers.size, 0, "unmount leaked the fallback timeout");
console.log("PASS: shared-image arrival, cleanup, gallery restoration, focus, modified clicks, reduced motion and unmount.");
