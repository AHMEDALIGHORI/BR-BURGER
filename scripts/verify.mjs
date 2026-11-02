import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";

await fs.mkdir("test-results", { recursive: true });
const browser = await chromium.launch({ headless: true, channel: "chromium" });
const base = process.env.BASE_URL || "http://localhost:3000";
const errors = [];
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    permissions: ["clipboard-read", "clipboard-write"],
  });
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(base, { waitUntil: "networkidle" });
  await page.locator(".preloader").waitFor({ state: "detached" });
  await page.waitForTimeout(1600);
  await page.screenshot({ path: "test-results/desktop-hero.png" });
  assert.equal(await page.locator(".chapter").count(), 7);
  await page.evaluate(() => window.scrollTo(0, 900));
  await page.waitForFunction(
    () => document.querySelector("video").readyState >= 2,
  );
  await page.waitForFunction(
    () => document.querySelector("video").currentTime > 1,
  );
  const forward = await page
    .locator("video")
    .first()
    .evaluate((video) => ({
      time: video.currentTime,
      paused: video.paused,
      duration: video.duration,
    }));
  assert(forward.paused, "Scroll video must remain paused");
  await page.screenshot({ path: "test-results/desktop-scrub.png" });
  await page.evaluate(() => window.scrollTo(0, 200));
  await page.waitForFunction(
    (time) => document.querySelector("video").currentTime < time,
    forward.time,
  );
  await page
    .locator(".site-header")
    .getByRole("button", { name: "Order now" })
    .click();
  await page
    .getByRole("button", { name: "Add Classic Burger", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Add Classic Burger", exact: true })
    .click();
  await page.getByRole("button", { name: "Remove one Classic Burger" }).click();
  await page.getByRole("tab", { name: "Drinks", exact: true }).click();
  await page
    .getByRole("button", { name: "Add Milkshake", exact: true })
    .click();
  assert.match(await page.locator(".bag-footer").innerText(), /\$14\.00/);
  await page.getByRole("button", { name: "Review my order" }).click();
  assert.match(
    await page.locator(".order-review").innerText(),
    /1 × Classic Burger/,
  );
  assert.match(
    await page.locator(".order-review").innerText(),
    /1 × Milkshake/,
  );
  await page.screenshot({ path: "test-results/order-review.png" });
  await page.getByRole("button", { name: "Copy my order" }).click();
  await page.getByRole("button", { name: "Order copied" }).waitFor();
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("dialog").evaluate((el) => el.open), false);
  for (let index = 1; index < 7; index++) {
    await page
      .getByRole("button", { name: new RegExp(`^Chapter ${index + 1}:`) })
      .click();
    await page.waitForFunction(
      (i) =>
        document
          .querySelectorAll(".chapter-rail button")
          [i].getAttribute("aria-current") === "step",
      index,
    );
    await page.waitForTimeout(1700);
    const video = page.locator("video").nth(index);
    await video.evaluate((el) => {
      if (el.error) throw new Error(el.error.message);
    });
    await page.screenshot({ path: `test-results/chapter-${index + 1}.png` });
    if (index === 4) {
      assert.equal(await page.locator(".collection-card").count(), 10);
      await page
        .getByRole("button", { name: "Show Double Cheese", exact: true })
        .click();
      await page.waitForTimeout(1100);
      await page
        .getByRole("button", {
          name: "Explore Double Cheese Burger",
          exact: true,
        })
        .waitFor();
      await page.screenshot({ path: "test-results/menu-3d.png" });
      await page.getByRole("button", { name: "Next menu item" }).click();
      await page
        .getByRole("button", { name: "Explore Chicken Burger", exact: true })
        .waitFor();
      await page
        .getByRole("button", { name: "Show Cold Coffee", exact: true })
        .click();
      await page.getByRole("button", { name: "Next menu item" }).click();
      await page
        .getByRole("button", { name: "Explore Classic Burger", exact: true })
        .waitFor();
    }
  }
  // Both film layers must be visible inside a dissolve, including in reverse.
  const firstBoundary = await page
    .locator("#crunch")
    .evaluate((el) => el.getBoundingClientRect().top + scrollY);
  await page.evaluate((y) => scrollTo(0, y), firstBoundary * 0.94);
  await page.waitForTimeout(500);
  const blend = await page
    .locator(".cinema-film")
    .nth(1)
    .evaluate((el) => Number(el.style.opacity));
  assert(
    blend > 0.1 && blend < 0.9,
    "Chapter boundary must dissolve with scroll",
  );
  await page.screenshot({ path: "test-results/chapter-dissolve.png" });
  const filmBounds = await page.locator(".cinema-video").first().boundingBox();
  assert.equal(filmBounds.width, 1440);
  assert.equal(filmBounds.height, 900);
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 1,
  });
  const mobilePage = await mobile.newPage();
  mobilePage.on("pageerror", (error) => errors.push(error.message));
  await mobilePage.goto(base, { waitUntil: "networkidle" });
  await mobilePage.locator(".preloader").waitFor({ state: "detached" });
  await mobilePage.waitForTimeout(1600);
  assert(
    await mobilePage.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    "Mobile must not overflow horizontally",
  );
  await mobilePage.screenshot({ path: "test-results/mobile-hero.png" });
  await mobilePage
    .locator(".site-header")
    .getByRole("button", { name: "Order now" })
    .click();
  await mobilePage.getByRole("tab", { name: "Sides & more" }).click();
  await mobilePage
    .getByRole("button", { name: "Add Chicken Taco", exact: true })
    .click();
  await mobilePage.screenshot({ path: "test-results/mobile-menu.png" });
  await mobilePage.getByRole("button", { name: "Close menu" }).click();
  await mobilePage.getByRole("button", { name: "Explore chapters" }).click();
  await mobilePage
    .getByRole("button", { name: "05 Your next favorite" })
    .click();
  await mobilePage.waitForTimeout(1800);
  await mobilePage.screenshot({ path: "test-results/mobile-chapter-menu.png" });
  const reducedPage = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  await reducedPage.goto(base, { waitUntil: "networkidle" });
  assert.equal(
    await reducedPage.locator(".pin-spacer").count(),
    0,
    "Reduced motion must not pin sections",
  );
  assert.equal(
    await reducedPage.locator("video[src]").count(),
    0,
    "Reduced motion must avoid loading video",
  );
  assert.equal(errors.length, 0, `Browser errors: ${errors.join("; ")}`);
  console.log(
    "PASS: Seven chapters; forward/reverse video seeking; paused media; menu filters; quantity updates; totals; order copy; dialog dismissal; chapter navigation; mobile overflow; reduced motion.",
  );
  console.log("Screenshots saved in test-results/.");
} finally {
  await browser.close();
}
