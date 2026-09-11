import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const SRC = path.join(ROOT, "pics", "ChatGPT Image Sep 11, 2026, 08_22_24 PM.png");
const PUBLIC = path.join(ROOT, "public");
const APP = path.join(ROOT, "src", "app");

async function run() {
  await sharp(SRC).resize(192, 192).png().toFile(path.join(PUBLIC, "icon-192.png"));
  await sharp(SRC).resize(512, 512).png().toFile(path.join(PUBLIC, "icon-512.png"));
  await sharp(SRC).resize(180, 180).png().toFile(path.join(APP, "apple-icon.png"));
  await sharp(SRC).resize(32, 32).png().toFile(path.join(APP, "icon.png"));
  console.log("Generated icon-192.png, icon-512.png, apple-icon.png, icon.png");
}

run();
