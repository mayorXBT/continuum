// Renders single frames at given times so crops/callouts can be checked
// without waiting for a full video render.  node preview-frames.mjs 27 34 40
import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";

const CHROME =
  process.env.CHROME_PATH ||
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const times = (process.argv.slice(2).length ? process.argv.slice(2) : [3, 22, 27, 34, 40, 45, 52, 57, 63]).map(Number);
const OUT = new URL("./frames/", import.meta.url).pathname.replace(/^\//, "");
mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  defaultViewport: { width: 1920, height: 1080, deviceScaleFactor: 1 },
  args: ["--hide-scrollbars"],
});
const page = await browser.newPage();
await page.goto(new URL("./index.html", import.meta.url).href, {
  waitUntil: "networkidle2",
});
await page.evaluate(() => document.fonts.ready);

for (const t of times) {
  await page.evaluate((time) => {
    // show only clips live at this time
    document.querySelectorAll(".clip").forEach((el) => {
      const s = parseFloat(el.getAttribute("data-start")) || 0;
      const d = parseFloat(el.getAttribute("data-duration")) || 0;
      el.style.visibility = time >= s && time < s + d ? "visible" : "hidden";
    });
    window.__timelines.main.seek(time);
  }, t);
  await new Promise((r) => setTimeout(r, 260));
  await page.screenshot({ path: `${OUT}t${String(t).padStart(2, "0")}.png` });
  console.log("frame t=" + t);
}

await browser.close();
console.log("->", OUT);
