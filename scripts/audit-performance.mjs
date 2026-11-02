import fs from "node:fs/promises";
import lighthouse from "lighthouse";
import desktop from "lighthouse/core/config/desktop-config.js";
import { launch } from "chrome-launcher";
import { chromium } from "@playwright/test";

await fs.mkdir("test-results", { recursive: true });
const chrome = await launch({
  chromePath: chromium.executablePath(),
  chromeFlags: ["--headless=new", "--no-sandbox", "--disable-gpu"],
  logLevel: "silent",
});
try {
  const summary = [];
  for (const mode of ["desktop", "mobile"]) {
    const result = await lighthouse(
      process.env.BASE_URL || "http://localhost:3000",
      {
        port: chrome.port,
        logLevel: "error",
        output: ["html", "json"],
        onlyCategories: [
          "performance",
          "accessibility",
          "best-practices",
          "seo",
        ],
      },
      mode === "desktop" ? desktop : undefined,
    );
    await fs.writeFile(
      `test-results/lighthouse-${mode}.html`,
      result.report[0],
    );
    await fs.writeFile(
      `test-results/lighthouse-${mode}.json`,
      result.report[1],
    );
    const scores = Object.fromEntries(
      Object.entries(result.lhr.categories).map(([name, category]) => [
        name,
        Math.round(category.score * 100),
      ]),
    );
    const metrics = Object.fromEntries(
      [
        "first-contentful-paint",
        "largest-contentful-paint",
        "total-blocking-time",
        "cumulative-layout-shift",
      ].map((name) => [name, result.lhr.audits[name]?.displayValue]),
    );
    const item = {
      mode,
      scores,
      metrics,
      runtimeError: result.lhr.runtimeError,
    };
    summary.push(item);
    console.log(JSON.stringify(item, null, 2));
  }
  await fs.writeFile(
    "test-results/lighthouse-summary.json",
    JSON.stringify(summary, null, 2),
  );
} finally {
  await chrome.kill();
}
