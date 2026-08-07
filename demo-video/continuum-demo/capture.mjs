// Captures real Continuum UI screens for the demo video.
// Drives the Chrome already installed on this machine via puppeteer-core.
//   node capture.mjs
import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";

const CHROME =
  process.env.CHROME_PATH ||
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = process.env.BASE_URL || "http://localhost:3000";
const OUT = new URL("./assets/shots/", import.meta.url).pathname.replace(/^\//, "");

mkdirSync(OUT, { recursive: true });

const shot = async (page, name, opts = {}) => {
  await new Promise((r) => setTimeout(r, opts.settle ?? 900));
  await page.screenshot({ path: `${OUT}${name}.png`, ...opts.shot });
  console.log("  captured", name);
};

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
  args: ["--hide-scrollbars", "--force-device-scale-factor=2"],
});

const page = await browser.newPage();

// ── Landing ──
console.log("landing");
await page.goto(`${BASE}/`, { waitUntil: "networkidle2" });
await shot(page, "landing");

// ── App: each tab ──
console.log("app tabs");
await page.goto(`${BASE}/app`, { waitUntil: "networkidle2" });
await shot(page, "app-verify");

for (const label of ["Stake", "Transfer", "Console"]) {
  const clicked = await page.evaluate((text) => {
    const el = [...document.querySelectorAll("button, [role=tab], a")].find(
      (n) => n.textContent.trim().toLowerCase() === text.toLowerCase(),
    );
    if (el) {
      el.click();
      return true;
    }
    return false;
  }, label);
  if (!clicked) {
    console.log("  !! tab not found:", label);
    continue;
  }
  await shot(page, `app-${label.toLowerCase()}`);
}

// ── Enforcement strip, tight crop (the CVI proof) ──
console.log("enforcement strip");
await page.goto(`${BASE}/app`, { waitUntil: "networkidle2" });
const strip = await page.evaluate(() => {
  const el = [...document.querySelectorAll("div")].find((n) =>
    n.textContent.includes("Cleanverse validator 0x") && n.clientHeight < 300,
  );
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.x, y: r.y, width: r.width, height: r.height };
});
if (strip && strip.width > 0) {
  await shot(page, "enforcement-strip", {
    shot: { clip: { ...strip, scale: 2 } },
  });
} else {
  console.log("  !! strip not located");
}

// ── Docs (deployed addresses) ──
console.log("docs");
await page.goto(`${BASE}/docs`, { waitUntil: "networkidle2" });
await shot(page, "docs");

await browser.close();
console.log("\ndone ->", OUT);
