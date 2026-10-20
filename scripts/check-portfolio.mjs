// Run against the server under review: node scripts/check-portfolio.mjs http://127.0.0.1:3187
import assert from "node:assert/strict";

const base = process.argv[2] ?? "http://127.0.0.1:3187";
const cases = [
  ["lama-fuel", "Lama Fuel", "lama-fuel.jpg"],
  ["thekuwa", "Thekuwa", "thekuwa.png"],
  ["unitech-hydropower", "Unitech Hydropower", "unitech-hydropower.jpg"],
  ["hr-management-system", "Retail HR", "retail-hr-dashboard.png"],
  ["qt-contracts", "QT Contracts", "qt-contracts.png"],
  ["lama-group", "Lama Group", "lama-group.jpg"],
];
for (const path of ["/", "/work"]) {
  const response = await fetch(base + path);
  assert.equal(response.status, 200, path);
}
const gallery = await (await fetch(base + "/work")).text();
assert.ok(!gallery.includes("/work/lama-convenience"), "Excluded project returned to gallery");
for (const [slug, name, media] of cases) {
  const response = await fetch(`${base}/work/${slug}`);
  assert.equal(response.status, 200, slug);
  const html = await response.text();
  assert.ok(html.includes(`<title>${name} — Sachit Ghimire</title>`), `${slug}: wrong metadata`);
  assert.ok(html.includes(`/work/${media}`), `${slug}: wrong screenshot`);
  const image = await fetch(`${base}/work/${media}`);
  assert.equal(image.status, 200, media);
  assert.ok(image.headers.get("content-type")?.startsWith("image/"), `${media}: not an image`);
  assert.ok(gallery.includes(`/work/${slug}`), `${slug}: missing gallery link`);
}
for (const slug of ["not-a-project", "lama-convenience"]) {
  assert.equal((await fetch(`${base}/work/${slug}`)).status, 404, `${slug}: expected 404`);
}
console.log("PASS: Home, gallery, six project pages, six screenshots, metadata and unknown/excluded 404s.");
