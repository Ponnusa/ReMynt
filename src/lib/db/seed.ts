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
    description: "Classic mall studio portrait with soft gradient backdrop.",
    referenceImageUrl: "https://placehold.co/512x512/2b2b45/f2c14e?text=80s+Studio",
    promptTemplate:
      "1980s mall studio portrait: soft gray-blue gradient backdrop, warm diffused lighting, pastel blazer or sweater, gentle film grain.",
    sortOrder: 2,
  },
  {
    name: "80s Street",
    description: "Candid street style with period-accurate color grading.",
    referenceImageUrl: "https://placehold.co/512x512/3a3a3a/ffffff?text=80s+Street",
    promptTemplate:
      "1980s street candid: warm faded film color grading, denim and windbreaker clothing, urban backdrop with period signage and cars.",
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
