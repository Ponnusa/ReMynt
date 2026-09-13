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
// in place. Reverted to text-only style guidance, which held up much better.
function buildPrompt(styleDescription: string, options: GenerationOptions): string {
  const backgroundInstruction =
    options.backgroundMode === "original"
      ? "Change only: clothing, lighting, and color grading to match the reference style. Do not change the background — keep the original background exactly as photographed."
      : "Change only: clothing, background, lighting, color grading, and atmosphere to match the reference style.";

  const styleInstruction =
    options.styleStrength === "subtle"
      ? `Apply this reference style subtly — a light, tasteful nod to it rather than a dramatic transformation: ${styleDescription}.`
      : `Apply this reference style: ${styleDescription}.`;

  return `
Edit this exact photo. Preserve the exact facial identity, face shape,
skin tone, and apparent age of every person — do not regenerate or
reinterpret their faces.

${styleInstruction}

${backgroundInstruction} Keep the same number of
people, poses, expressions, and framing as the original photo.
`.trim();
}

export async function generateStyledImage(
  sourceImage: Buffer,
  sourceMimeType: string,
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
