import { config } from "dotenv";
config({ path: ".env.local" });

import { fileURLToPath } from "url";

// Each prompt_template is a structured style spec (Camera/Lighting/Wardrobe/
// Composition/Color/Avoid) rather than one loose sentence — this format was
// verified live against real generations to hold identity preservation
// noticeably better than dense prose, and the "Avoid" section reduces the
// style bleeding in vintage-inappropriate wardrobe/lighting/backgrounds.
// A shared identity-preservation + anti-modernization clause always wraps
// this spec at generation time (see src/lib/gemini.ts) — that part never
// needs to be repeated per style.
export const STYLES = [
  {
    name: "80s Neon",
    description: "Neon-lit studio backdrop, teal and magenta gel lighting.",
    referenceImageUrl: "https://placehold.co/512x512/1a0b2e/ff2eae?text=80s+Neon",
    promptTemplate: `
STYLE: 1980s Neon

Lighting:
- teal and magenta neon gel lighting
- glossy dark studio background

Hair & Wardrobe:
- retro perm or feathered hair styling
- high-shine synthetic fabrics

Avoid:
- flat white lighting
- natural daylight
- modern athleisure clothing
`.trim(),
    sortOrder: 1,
  },
  {
    name: "80s Studio Portrait",
    description: "Bold striped sweater, big curly hair, moody studio glow.",
    referenceImageUrl:
      "https://pub-ca784163fe614f62b1a3ebb8fe9ad1d3.r2.dev/temp/pexels-lucaslagos-12584632.jpg",
    promptTemplate: `
STYLE: 1980s Studio Portrait

Lighting:
- warm, low-key studio lighting
- dark moody backdrop with soft colored bokeh

Hair & Wardrobe:
- voluminous curly permed hair with face-framing bangs
- bold colorblock striped sweater (red, teal, gold, navy)
- chunky statement hoop earrings

Composition:
- close framing, resting on a glossy tabletop

Avoid:
- modern flat hairstyles
- bright even lighting
- plain solid-color backgrounds
- contemporary clothing
`.trim(),
    sortOrder: 2,
  },
  {
    name: "Vintage Glamour",
    description: "Old-world elegance — tweed, pearls, and a wall of china.",
    referenceImageUrl:
      "https://pub-ca784163fe614f62b1a3ebb8fe9ad1d3.r2.dev/temp/pexels-redwolf-44736300-10585801.jpg",
    promptTemplate: `
STYLE: Vintage Glamour

Setting:
- dusty-pink damask wallpaper decorated with hung china plates
- soft warm side-lighting

Wardrobe:
- tailored tweed houndstooth outfit with pearl jewelry for women
- a dark three-piece suit with pocket square for men

Hair:
- classic finger-wave or side-part hairstyles

Composition:
- closely posed, intimate

Avoid:
- bright even lighting
- modern casual clothing
- plain white walls
`.trim(),
    sortOrder: 3,
  },
  {
    name: "Golden Hour Vintage",
    description: "Backlit park stroll, preppy knitwear and silk, warm sunset glow.",
    referenceImageUrl:
      "https://pub-ca784163fe614f62b1a3ebb8fe9ad1d3.r2.dev/temp/pexels-michael-obstoj-1772571864-33537251.jpg",
    promptTemplate: `
STYLE: Golden Hour Vintage

Lighting:
- warm backlit sunset through trees, soft lens flare

Wardrobe:
- cream sweater vest and loose tie for men
- silky bias-cut slip dress for women

Hair:
- tousled, relaxed

Composition:
- relaxed candid pose on a garden path

Avoid:
- overcast or flat lighting
- modern activewear
- indoor settings
`.trim(),
    sortOrder: 4,
  },
  {
    name: "70s Road Trip",
    description: "Classic VW Beetle, countryside fields, retro sunglasses.",
    referenceImageUrl:
      "https://pub-ca784163fe614f62b1a3ebb8fe9ad1d3.r2.dev/temp/pexels-necip-duman-3299706-16633191.jpg",
    promptTemplate: `
STYLE: 1970s Road Trip

Setting:
- pastel-blue vintage car
- wide countryside field backdrop under a bright cloudy sky

Wardrobe:
- retro cat-eye or round sunglasses
- high-waisted denim, suspenders, headscarf

Color:
- warm, saturated film color grading

Avoid:
- modern cars
- urban backgrounds
- desaturated or cool color grading
`.trim(),
    sortOrder: 5,
  },
  {
    name: "Rockabilly Night",
    description: "Moody neon-lit nightclub, round shades, polka dots.",
    referenceImageUrl:
      "https://pub-ca784163fe614f62b1a3ebb8fe9ad1d3.r2.dev/temp/pexels-pedrofurtadoo-30489699.jpg",
    promptTemplate: `
STYLE: Rockabilly Night

Lighting:
- dark moody nightclub lighting with a purple neon rim light

Wardrobe:
- round vintage sunglasses
- suspenders over a white shirt
- polka-dot blouse tied with a red neckerchief

Makeup:
- bold red lipstick

Composition:
- close, warm framing

Avoid:
- bright daylight
- modern streetwear
- plain flat backgrounds
`.trim(),
    sortOrder: 6,
  },
  {
    name: "Sunlit Editorial",
    description: "Bright garden light, bold shades, polka-dot halter dress.",
    referenceImageUrl:
      "https://pub-ca784163fe614f62b1a3ebb8fe9ad1d3.r2.dev/temp/pexels-thorl5-2154653228-33602625.jpg",
    promptTemplate: `
STYLE: Sunlit Editorial

Lighting:
- bright dappled sunlight through green foliage

Wardrobe:
- oversized black sunglasses
- black-and-white polka-dot halter dress
- knit vest over a collared shirt

Composition:
- back-to-back pose

Color:
- warm golden color grading

Avoid:
- indoor settings
- flat overcast lighting
- desaturated tones
`.trim(),
    sortOrder: 7,
  },
  {
    name: "Parisian Pin-Up",
    description: "Red beret, houndstooth, industrial red-door backdrop.",
    referenceImageUrl:
      "https://pub-ca784163fe614f62b1a3ebb8fe9ad1d3.r2.dev/temp/pexels-javier-captures-the-world-297237582-14947641.jpg",
    promptTemplate: `
STYLE: Parisian Pin-Up

Setting:
- weathered red industrial door backdrop
- dramatic single-source lighting

Wardrobe:
- red beret and houndstooth pencil dress with red heels for women
- half-open white shirt with red suspenders for men

Composition:
- playful, confident pose

Avoid:
- soft diffused lighting
- modern streetwear
- plain neutral backgrounds
`.trim(),
    sortOrder: 8,
  },
  {
    name: "Soft Focus Romance",
    description: "Warm backlit close-up, soft bokeh, tender and intimate.",
    referenceImageUrl:
      "https://pub-ca784163fe614f62b1a3ebb8fe9ad1d3.r2.dev/temp/lucid-origin_A_loving_couple_their_eyes_locked_in_an_intimate_gaze_hands_gently_intertwined._-0.jpg",
    promptTemplate: `
STYLE: Soft Focus Romance

Lighting:
- warm backlit sunset glow, softly blurred bokeh background

Composition:
- foreheads gently touching, intimate gaze
- tender, candid expressions

Color:
- soft, natural film-like color grading

Avoid:
- harsh direct lighting
- sharp, clinical backgrounds
- cool color grading
`.trim(),
    sortOrder: 9,
  },
  {
    name: "Sunny Meadow Family",
    description: "Bright natural light, grassy outdoor setting, warm and candid.",
    referenceImageUrl:
      "https://pub-ca784163fe614f62b1a3ebb8fe9ad1d3.r2.dev/temp/lucid-origin_family_picture_with_dad_mom_with_2_daughters_in_outdoor_settings-0.jpg",
    promptTemplate: `
STYLE: Sunny Meadow Family

Setting:
- blurred green grass and trees in the background
- soft outdoor daylight

Composition:
- relaxed seated pose on the grass
- warm, candid smiles

Color:
- gentle warm color grading

Avoid:
- indoor settings
- harsh midday shadows
- cool or desaturated tones
`.trim(),
    sortOrder: 10,
  },
  {
    name: "Boho Wedding Golden Hour",
    description: "Dried-flower bouquet, warm backlight, wrought-iron garden fence.",
    referenceImageUrl:
      "https://pub-ca784163fe614f62b1a3ebb8fe9ad1d3.r2.dev/temp/pexels-jonathanborba-9377799.jpg",
    promptTemplate: `
STYLE: Boho Wedding Golden Hour

Lighting:
- warm golden-hour backlight through pine trees

Setting:
- softly blurred garden background with a wrought-iron fence

Wardrobe:
- flowing lace wedding dress with a dried-flower bouquet for the bride
- plain white button-down shirt with a matching floral boutonniere for the groom

Composition:
- warm, intimate smiling expressions

Avoid:
- formal ballroom settings
- flat studio lighting
- modern casual clothing
`.trim(),
    sortOrder: 11,
  },
  {
    name: "Garden Wedding Elegance",
    description: "White floral archway, beige tuxedo, classic ballgown with veil.",
    referenceImageUrl:
      "https://pub-ca784163fe614f62b1a3ebb8fe9ad1d3.r2.dev/temp/pexels-samet-tecimen-523842701-38930323.jpg",
    promptTemplate: `
STYLE: Garden Wedding Elegance

Setting:
- white stone archway draped with vivid red bougainvillea flowers
- soft overcast daylight

Wardrobe:
- beige tuxedo with matching bow tie for the groom
- strapless white ballgown with long veil, pearl necklace, and satin gloves for the bride

Composition:
- romantic, close pose

Avoid:
- indoor settings
- bright harsh sunlight
- casual modern clothing
`.trim(),
    sortOrder: 12,
  },
  {
    name: "Autumn Family Portrait",
    description: "Vivid magenta foliage backdrop, cozy knitwear, close family embrace.",
    referenceImageUrl:
      "https://pub-ca784163fe614f62b1a3ebb8fe9ad1d3.r2.dev/temp/pexels-sofia-shultz-59970339-8015551.jpg",
    promptTemplate: `
STYLE: Autumn Family Portrait

Setting:
- vivid magenta and burgundy autumn foliage backdrop
- soft, slightly overcast natural outdoor daylight

Wardrobe:
- cozy knit sweaters and cardigans in mustard, navy, and burnt orange

Composition:
- close family embrace, children draped over parents' shoulders
- warm, relaxed, candid smiles

Color:
- warm, rich autumn color grading
- gentle contrast, no harsh shadows

Avoid:
- bright green summer foliage
- neon or cool-toned colors
- studio backdrops
`.trim(),
    sortOrder: 13,
  },
  {
    name: "1980s Family Album",
    description: "Consumer 35mm film, direct flash, authentic family-snapshot feel.",
    referenceImageUrl: "https://pub-ca784163fe614f62b1a3ebb8fe9ad1d3.r2.dev/temp/Firefly.jpg",
    promptTemplate: `
STYLE: 1980s Family Album

Camera & Lighting:
- direct on-camera flash
- consumer 35mm film photography

Color & Texture:
- warm, slightly faded colors
- visible but subtle 35mm film grain
- mild lens softness
- realistic skin texture, imperfect amateur photography

Wardrobe & Hair:
- authentic 1980s clothing and hairstyles

Composition:
- casual, natural pose, standing or sitting together outside an ordinary suburban house
- slight smiles, unposed family-snapshot feel

Avoid:
- cinematic or fashion-photography look
- modern clothing, hairstyles, or smartphones
- contemporary architecture
- overly polished or AI-generated appearance
`.trim(),
    sortOrder: 14,
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

// Only run when executed directly (`tsx src/lib/db/seed.ts`), not when
// STYLES is imported elsewhere (e.g. a one-off script updating existing rows).
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  seed().then(() => process.exit(0));
}
