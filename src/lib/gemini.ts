import "server-only";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const MODEL = "gemini-3-pro-image";

export type BackgroundMode = "reference" | "original";
export type StyleStrength = "subtle" | "full";

export type GenerationOptions = {
  backgroundMode: BackgroundMode;
  styleStrength: StyleStrength;
};

export const DEFAULT_GENERATION_OPTIONS: GenerationOptions = {
  backgroundMode: "reference",
  styleStrength: "full",
};

export function parseGenerationOptions(formData: FormData): GenerationOptions {
  const backgroundMode = formData.get("backgroundMode");
  const styleStrength = formData.get("styleStrength");

  return {
    backgroundMode: backgroundMode === "original" ? "original" : "reference",
    styleStrength: styleStrength === "subtle" ? "subtle" : "full",
  };
}

// Single-image, edit-in-place framing. An earlier version sent the reference
// style photo as a second image and asked Gemini to composite the person
// into its background — identity preservation got noticeably worse (verified
// against live output), because compositing across two images makes the
// model reconstruct the face in a new scene rather than edit existing pixels
// in place. Text-only style guidance held up much better, so reference
// styles' prompt_template is a structured text spec (camera/color/texture/
// composition/avoid), never an image sent to the model.
function buildPrompt(styleSpec: string, options: GenerationOptions): string {
  const backgroundInstruction =
    options.backgroundMode === "original"
      ? "Change only: clothing, lighting, and color grading to match the style below. Do not change the background — keep the original background exactly as photographed."
      : "Change the background, clothing, lighting, color grading, and atmosphere to match the style below.";

  const strengthInstruction =
    options.styleStrength === "subtle"
      ? "Apply this style subtly — a light, tasteful nod to it rather than a dramatic transformation."
      : "Apply this style fully and boldly, closely matching its overall mood and aesthetic.";

  return `
Edit this exact photograph. Do not generate a new photo from scratch — modify the existing one.

Preserve exactly, for every person in the photo:
- facial identity, face shape, and recognizable features
- apparent age, skin tone, and body proportions
- their pose, expression, and position relative to each other
- the total number of people and the overall framing

${styleSpec}

${backgroundInstruction}

${strengthInstruction}

The result should feel like a real photograph in this style, not a modern
photo with a filter applied, and not an obviously AI-generated image.

Do not, under any circumstances:
- change anyone's identity, facial structure, or facial features
- beautify, reshape, slim, or de-age any face
- make anyone look like a different person
- add people, remove people, or change who is in the photo
`.trim();
}

export async function generateStyledImage(
  sourceImage: Buffer,
  sourceMimeType: string,
  styleSpec: string,
  options: GenerationOptions = DEFAULT_GENERATION_OPTIONS
): Promise<Buffer> {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: "user",
        parts: [
          { text: buildPrompt(styleSpec, options) },
          {
            inlineData: {
              mimeType: sourceMimeType,
              data: sourceImage.toString("base64"),
            },
          },
        ],
      },
    ],
    config: {
      temperature: options.styleStrength === "subtle" ? 0.2 : 0.25,
    },
  });

  const imagePart = response.candidates?.[0]?.content?.parts?.find(
    (part) => part.inlineData
  );

  if (!imagePart?.inlineData?.data) {
    throw new Error("Gemini did not return an image");
  }

  return Buffer.from(imagePart.inlineData.data, "base64");
}
