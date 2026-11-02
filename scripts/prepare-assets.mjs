import fs from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";
import sharp from "sharp";
import ffmpeg from "ffmpeg-static";

const source = path.resolve("Asssts");
const files = await fs.readdir(source);
const find = (prefix) =>
  path.join(
    source,
    files.find((f) => f.startsWith(prefix)) ??
      (() => {
        throw new Error(`Missing ${prefix}`);
      })(),
  );
await fs.mkdir("public/assets/images", { recursive: true });
await fs.mkdir("public/assets/videos", { recursive: true });
const photos = {
  burger: "Burger_floating_in_studio",
  taco: "Crispy_chicken_taco",
  drinks: "Cold_drink_and_fries",
  packaging: "Burger_packaging_floating",
  menu: "Burger_products_floating_in_arra",
  ingredients: "Burger_ingredients_floating_in_s",
  finale: "BR-Burger_premium_food_lineup",
  pedestal: "Burger_resting",
  lettuce: "Green_lettuce",
  tomato: "Tomato_slice",
  onion: "Red_onion",
  cheese: "Cheddar_cheese",
  chicken: "Crispy_fried_chicken",
  sauce: "Burger_sauce",
  avocado: "Fresh_avocado",
  sesame: "Toasted_sesame",
};
for (const [name, prefix] of Object.entries(photos)) {
  const input = files.find((f) => f.startsWith(prefix) && f.endsWith(".jpg"));
  await sharp(path.join(source, input))
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 86 })
    .toFile(`public/assets/images/${name}.webp`);
}
const menuSource = find("Burger_products_floating_in_arra");
const metadata = await sharp(menuSource).metadata();
const crops = {
  "menu-classic": [0.44, 0.08, 0.125, 0.19],
  "menu-double": [0.57, 0.14, 0.11, 0.17],
  "menu-chicken": [0.67, 0.23, 0.13, 0.18],
  "menu-spicy": [0.72, 0.4, 0.11, 0.17],
  "menu-fries": [0.66, 0.57, 0.13, 0.19],
  "menu-nuggets": [0.32, 0.7, 0.12, 0.13],
  "menu-shake": [0.245, 0.19, 0.075, 0.25],
  "menu-coffee": [0.18, 0.35, 0.09, 0.25],
};
for (const [name, [left, top, width, height]] of Object.entries(crops)) {
  await sharp(menuSource)
    .extract({
      left: Math.round(left * metadata.width),
      top: Math.round(top * metadata.height),
      width: Math.round(width * metadata.width),
      height: Math.round(height * metadata.height),
    })
    .resize(360, 320, { fit: "contain", background: "#f5f0e4" })
    .webp({ quality: 90 })
    .toFile(`public/assets/images/${name}.webp`);
}
const videos = {
  "01-hero-burger": "Burger_ingredients_floating_and_",
  "02-taco": "Burger_transforms_into_chicken",
  "03-drink-fries": "Taco_dissolving",
  "04-packaging": "Fast_food_packaging_assembling",
  "05-menu": "Fast_food_products_floating",
  "06-ingredients": "Burger_ingredients_floating_in_s",
  "07-finale": "BR-Burger_food_lineup_assembles",
};
for (const [name, prefix] of Object.entries(videos)) {
  const input = files.find(
    (f) => f.startsWith(prefix) && f.endsWith(".mp4") && !f.includes("(1)"),
  );
  execFileSync(
    ffmpeg,
    [
      "-y",
      "-i",
      path.join(source, input),
      "-an",
      "-vf",
      "scale=1280:-2",
      "-c:v",
      "libx264",
      "-preset",
      "fast",
      "-crf",
      "22",
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
      `public/assets/videos/${name}.mp4`,
    ],
    { stdio: "pipe" },
  );
  execFileSync(
    ffmpeg,
    [
      "-y",
      "-i",
      `public/assets/videos/${name}.mp4`,
      "-frames:v",
      "1",
      `public/assets/images/${name}-poster.jpg`,
    ],
    { stdio: "pipe" },
  );
  await fs.copyFile(
    `public/assets/videos/${name}.mp4`,
    `public/assets/videos/${name}-mobile.mp4`,
  );
  console.log(`Prepared ${name}`);
}
console.log("All original assets preserved in Asssts.");
