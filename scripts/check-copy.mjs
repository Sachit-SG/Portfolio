// Check served output, not just the source strings that produced it.
import assert from "node:assert/strict";

const base = process.argv[2] ?? "http://127.0.0.1:3191";
const routes = ["/", "/work", "/work/lama-fuel", "/work/thekuwa", "/work/unitech-hydropower", "/work/hr-management-system", "/work/qt-contracts", "/work/lama-group"];
const pages = new Map();
for (const route of routes) {
  const response = await fetch(base + route);
  assert.equal(response.status, 200, route);
  const html = await response.text();
  const text = html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  assert.doesNotMatch(text, /85\.2%|Employees tracked|On-time attendance|20\.8 MW|5\.8 MW|20\+ yrs|run themselves|phone-and-fax|AI automation wired/i, route);
  pages.set(route, { html, text });
}
assert.match(pages.get("/").text, /Selected projects/);
assert.match(pages.get("/").html, /Kathmandu-based developer with a design background/);
assert.match(pages.get("/work/hr-management-system").text, /Public preview · demo data/);
assert.match(pages.get("/work/hr-management-system").text, /not usage or performance results/);
assert.match(pages.get("/work/thekuwa").text, /still in development/);
assert.match(pages.get("/work/qt-contracts").text, /still in development/);
assert.match(pages.get("/work/lama-fuel").text, /Company website/);
console.log("PASS: 8 served routes; unsupported impact/AI claims absent; demo and development status explicit.");
