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

function buildPrompt(styleDescription: string, options: GenerationOptions): string {
  const backgroundInstruction =
    options.backgroundMode === "original"
      ? "Do not change the background — keep image 1's original background exactly as photographed. Change only: clothing, lighting, and color grading to match image 2's style."
      : "Change the background and setting to match image 2 — recreate image 2's background, lighting, and atmosphere as closely as possible. Image 2 is a style/background reference only: never copy any person, face, or body from it into the output.";

  const strengthInstruction =
    options.styleStrength === "subtle"
      ? "Apply the reference style subtly — a light, tasteful nod to it rather than a dramatic transformation."
      : "Apply the reference style fully and boldly, closely matching its overall mood and aesthetic.";

  return `
You are given two images.

Image 1: a real photo of one or more people. Preserve the exact facial
identity, face shape, skin tone, and apparent age of every person in image 1
— do not regenerate or reinterpret their faces. Keep the same number of
people, poses, expressions, and framing as image 1.

Image 2: a style reference photo, used only for background, lighting,
wardrobe, and color-grading inspiration — never for identity. Do not include
any person from image 2 in the output.

Style guidance: ${styleDescription}

${backgroundInstruction}

${strengthInstruction}
`.trim();
}

export async function generateStyledImage(
  sourceImage: Buffer,
  sourceMimeType: string,
  referenceImage: Buffer,
  referenceMimeType: string,
  styleDescription: string,
  options: GenerationOptions = DEFAULT_GENERATION_OPTIONS
): Promise<Buffer> {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: "user",
        parts: [
          { text: buildPrompt(styleDescription, options) },
          {
            inlineData: {
              mimeType: sourceMimeType,
              data: sourceImage.toString("base64"),
            },
          },
          {
            inlineData: {
              mimeType: referenceMimeType,
              data: referenceImage.toString("base64"),
            },
          },
        ],
      },
    ],
    config: {
      temperature: options.styleStrength === "subtle" ? 0.15 : 0.3,
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
