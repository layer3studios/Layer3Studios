import { chromium } from "playwright";

const URL = process.env.SHOT_URL || "http://localhost:3901";
const browser = await chromium.launch();
const shots = [
  { name: "desktop", width: 1512, height: 900 },
  { name: "laptop", width: 1280, height: 720 },
  { name: "mobile", width: 390, height: 844 },
];

for (const s of shots) {
  const page = await browser.newPage({ viewport: { width: s.width, height: s.height } });
  const failed = [];
  page.on("requestfailed", (r) => failed.push(r.url()));
  page.on("console", (m) => { if (m.type() === "error") failed.push("console: " + m.text()); });

  await page.goto(URL, { waitUntil: "load" });
  // Wait for the stylesheet to actually be applied, not just for the network.
  await page.waitForFunction(() => {
    const b = getComputedStyle(document.body);
    return b.backgroundColor === "rgb(0, 0, 0)";
  }, { timeout: 15000 }).catch(() => failed.push("CSS NEVER APPLIED"));
  await page.waitForTimeout(2200);

  await page.screenshot({ path: `.shots/hero-${s.name}.png` });
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.3));
  await page.waitForTimeout(1600);
  await page.screenshot({ path: `.shots/grid-${s.name}.png` });
  if (failed.length) console.log(`[${s.name}]`, failed.slice(0, 5));
  await page.close();
}
await browser.close();
console.log("done");
