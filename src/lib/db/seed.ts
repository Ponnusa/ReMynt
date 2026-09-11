import { config } from "dotenv";
config({ path: ".env.local" });

// Placeholder gallery so the app is browsable end to end. reference_image_url
// values are placeholders — swap for real curated reference photos before
// launch, and prompt_template should be tuned against actual Gemini output.
const STYLES = [
  {
    name: "80s Neon",
    description: "Neon-lit studio backdrop, teal and magenta gel lighting.",
    referenceImageUrl: "https://placehold.co/512x512/1a0b2e/ff2eae?text=80s+Neon",
    promptTemplate:
      "1980s neon studio portrait: teal and magenta gel lighting, glossy dark background, retro perm or feathered hair styling, high-shine synthetic fabrics.",
    sortOrder: 1,
  },
  {
    name: "80s Studio Portrait",
    description: "Bold striped sweater, big curly hair, moody studio glow.",
    referenceImageUrl:
      "https://pub-ca784163fe614f62b1a3ebb8fe9ad1d3.r2.dev/temp/pexels-lucaslagos-12584632.jpg",
    promptTemplate:
      "1980s studio portrait: warm low-key lighting against a dark moody backdrop with soft colored bokeh, voluminous curly permed hair with face-framing bangs, a bold colorblock striped sweater (red, teal, gold, navy), chunky statement hoop earrings, close framing resting on a glossy tabletop.",
    sortOrder: 2,
  },
  {
    name: "Vintage Glamour",
    description: "Old-world elegance — tweed, pearls, and a wall of china.",
    referenceImageUrl:
      "https://pub-ca784163fe614f62b1a3ebb8fe9ad1d3.r2.dev/temp/pexels-redwolf-44736300-10585801.jpg",
    promptTemplate:
      "Vintage glamour portrait: soft warm side-lighting, dusty-pink damask wallpaper decorated with hung china plates, tailored tweed houndstooth outfit with pearl jewelry for women, a dark three-piece suit with pocket square for men, classic finger-wave or side-part hairstyles, closely posed and intimate.",
    sortOrder: 3,
  },
];

async function seed() {
  // Required after the dotenv config() above: static imports are hoisted
  // above it, which would run db/index.ts's neon() before DATABASE_URL is set.
  const { db } = await import("./index");
  const { referenceStyles } = await import("./schema");

  for (const style of STYLES) {
    await db.insert(referenceStyles).values(style);
  }
  console.log(`Seeded ${STYLES.length} reference styles.`);
}

seed().then(() => process.exit(0));
