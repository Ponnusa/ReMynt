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
  {
    name: "Golden Hour Vintage",
    description: "Backlit park stroll, preppy knitwear and silk, warm sunset glow.",
    referenceImageUrl:
      "https://pub-ca784163fe614f62b1a3ebb8fe9ad1d3.r2.dev/temp/pexels-michael-obstoj-1772571864-33537251.jpg",
    promptTemplate:
      "Golden hour outdoor portrait: warm backlit sunset through trees, soft lens flare, preppy vintage wardrobe — a cream sweater vest and loose tie for men, a silky bias-cut slip dress for women, tousled hair, relaxed candid pose on a garden path.",
    sortOrder: 4,
  },
  {
    name: "70s Road Trip",
    description: "Classic VW Beetle, countryside fields, retro sunglasses.",
    referenceImageUrl:
      "https://pub-ca784163fe614f62b1a3ebb8fe9ad1d3.r2.dev/temp/pexels-necip-duman-3299706-16633191.jpg",
    promptTemplate:
      "1970s road-trip portrait: pastel-blue vintage car, wide countryside field backdrop under a bright cloudy sky, retro cat-eye or round sunglasses, high-waisted denim, suspenders, headscarf, warm saturated film color grading.",
    sortOrder: 5,
  },
  {
    name: "Rockabilly Night",
    description: "Moody neon-lit nightclub, round shades, polka dots.",
    referenceImageUrl:
      "https://pub-ca784163fe614f62b1a3ebb8fe9ad1d3.r2.dev/temp/pexels-pedrofurtadoo-30489699.jpg",
    promptTemplate:
      "Rockabilly night portrait: dark moody nightclub lighting with a purple neon rim light, round vintage sunglasses, suspenders over a white shirt, a polka-dot blouse tied with a red neckerchief, bold red lipstick, close warm framing.",
    sortOrder: 6,
  },
  {
    name: "Sunlit Editorial",
    description: "Bright garden light, bold shades, polka-dot halter dress.",
    referenceImageUrl:
      "https://pub-ca784163fe614f62b1a3ebb8fe9ad1d3.r2.dev/temp/pexels-thorl5-2154653228-33602625.jpg",
    promptTemplate:
      "Sunlit editorial portrait: bright dappled sunlight through green foliage, back-to-back pose, oversized black sunglasses, a black-and-white polka-dot halter dress, a knit vest over a collared shirt, warm golden color grading.",
    sortOrder: 7,
  },
  {
    name: "Parisian Pin-Up",
    description: "Red beret, houndstooth, industrial red-door backdrop.",
    referenceImageUrl:
      "https://pub-ca784163fe614f62b1a3ebb8fe9ad1d3.r2.dev/temp/pexels-javier-captures-the-world-297237582-14947641.jpg",
    promptTemplate:
      "Parisian pin-up portrait: weathered red industrial door backdrop, dramatic single-source lighting, a red beret and houndstooth pencil dress with red heels for women, a half-open white shirt with red suspenders for men, playful confident pose.",
    sortOrder: 8,
  },
  {
    name: "Soft Focus Romance",
    description: "Warm backlit close-up, soft bokeh, tender and intimate.",
    referenceImageUrl:
      "https://pub-ca784163fe614f62b1a3ebb8fe9ad1d3.r2.dev/temp/lucid-origin_A_loving_couple_their_eyes_locked_in_an_intimate_gaze_hands_gently_intertwined._-0.jpg",
    promptTemplate:
      "Golden hour romantic close-up: warm backlit sunset glow, softly blurred bokeh background, foreheads gently touching in an intimate gaze, tender candid expressions, soft natural film-like color grading.",
    sortOrder: 9,
  },
  {
    name: "Sunny Meadow Family",
    description: "Bright natural light, grassy outdoor setting, warm and candid.",
    referenceImageUrl:
      "https://pub-ca784163fe614f62b1a3ebb8fe9ad1d3.r2.dev/temp/lucid-origin_family_picture_with_dad_mom_with_2_daughters_in_outdoor_settings-0.jpg",
    promptTemplate:
      "Bright natural-light family portrait: soft outdoor daylight, blurred green grass and trees in the background, relaxed seated pose on the grass, warm candid smiles, gentle warm color grading.",
    sortOrder: 10,
  },
  {
    name: "Boho Wedding Golden Hour",
    description: "Dried-flower bouquet, warm backlight, wrought-iron garden fence.",
    referenceImageUrl:
      "https://pub-ca784163fe614f62b1a3ebb8fe9ad1d3.r2.dev/temp/pexels-jonathanborba-9377799.jpg",
    promptTemplate:
      "Boho wedding portrait: warm golden-hour backlight through pine trees, a flowing lace wedding dress for the bride with a dried-flower bouquet, a plain white button-down shirt with a matching floral boutonniere for the groom, softly blurred garden background with a wrought-iron fence, warm intimate smiling expressions.",
    sortOrder: 11,
  },
  {
    name: "Garden Wedding Elegance",
    description: "White floral archway, beige tuxedo, classic ballgown with veil.",
    referenceImageUrl:
      "https://pub-ca784163fe614f62b1a3ebb8fe9ad1d3.r2.dev/temp/pexels-samet-tecimen-523842701-38930323.jpg",
    promptTemplate:
      "Elegant garden wedding portrait: white stone archway draped with vivid red bougainvillea flowers, a beige tuxedo with matching bow tie for the groom, a strapless white ballgown with long veil, pearl necklace, and satin gloves for the bride, soft overcast daylight, romantic close pose.",
    sortOrder: 12,
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
