import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import * as THREE from 'three';

// Exercise the actual shipped solver, not a second implementation.
const source = readFileSync(new URL('../src/components/Lanyard.jsx', import.meta.url), 'utf8');
const solver = source.slice(source.indexOf('const CARD_SIZES'), source.indexOf('const Lanyard ='));
const { sim, layout, step, place } = vm.runInNewContext(solver + `
  const layout = cardLayout('portrait', .3);
  const sim = createSimulation();
  sim.anchor.set(0, 3, 0);
  configureSimulation(sim, layout, 1);
  placeHanging(sim, layout, false);
  ({ sim, layout, step: stepSimulation, place: placeHanging });
`, { THREE, Float64Array, Float32Array, Uint8Array, Math });
const physics = {
  gravity: 40, hold: 154, stiffness: 1600, spring: 40, bandDamping: 30,
  linearDrag: 1, angularDrag: 1.73, air: .15, broadside: .5, spinAir: .03,
  nodeDrag: 2, nodeAir: .2, twist: 30, twistDamping: 3, grip: 40, gripDamping: 6, breeze: 0,
};
sim.body.position.x += .7;
sim.body.velocity.x = 2;
let maximumSwing = 0;
for (let frame = 0; frame < 1440; frame++) {
  step(sim, 1 / 60, physics, frame / 60);
  assert.ok(Number.isFinite(sim.body.position.length() + sim.body.quaternion.length()));
  assert.equal(sim.nodes[0].x, 0);
  assert.equal(sim.nodes[0].y, 3);
  maximumSwing = Math.max(maximumSwing, Math.abs(sim.body.position.x));
}
assert.ok(maximumSwing > .5, 'release must preserve momentum');
assert.ok(Math.abs(sim.body.position.x) < .05, 'swing must settle');
place(sim, layout, false);
assert.equal(sim.body.velocity.length(), 0);
assert.equal(sim.body.angular.length(), 0);
console.log('PASS: lanyard release momentum, fixed anchor, finite physics, damping and static reset.');
