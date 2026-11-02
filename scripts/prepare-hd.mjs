import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import ffmpeg from "ffmpeg-static";

const files = fs.readdirSync("Asssts");
const clips = {
  "01-hero-burger": "Burger_ingredients_floating_and_",
  "02-taco": "Burger_transforms_into_chicken",
  "03-drink-fries": "Taco_dissolving",
  "04-packaging": "Fast_food_packaging_assembling",
  "05-menu": "Fast_food_products_floating",
  "06-ingredients": "Burger_ingredients_floating_in_s",
  "07-finale": "BR-Burger_food_lineup_assembles",
};
for (const [name, prefix] of Object.entries(clips)) {
  const desktop = `public/assets/videos/${name}.mp4`;
  const mobile = `public/assets/videos/${name}-mobile.mp4`;
  if (!fs.existsSync(mobile)) fs.copyFileSync(desktop, mobile);
  const file = files.find(
    (file) =>
      file.startsWith(prefix) && file.endsWith(".mp4") && !file.includes("(1)"),
  );
  const staging = `public/assets/videos/${name}-processing.mp4`;
  execFileSync(
    ffmpeg,
    [
      "-y",
      "-i",
      path.join("Asssts", file),
      "-an",
      "-vf",
      "scale=1920:-2",
      "-c:v",
      "libx264",
      "-preset",
      "fast",
      "-crf",
      "21",
      "-g",
      "12",
      "-keyint_min",
      "12",
      "-sc_threshold",
      "0",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      staging,
    ],
    { stdio: "pipe" },
  );
  fs.renameSync(staging, desktop);
  console.log(`1080p desktop + 720p mobile: ${name}`);
}
