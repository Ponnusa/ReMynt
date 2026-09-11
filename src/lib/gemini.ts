import "server-only";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const MODEL = "gemini-3-pro-image";

const IDENTITY_PRESERVATION_PROMPT = (styleDescription: string) => `
Edit this exact photo. Preserve the exact facial identity, face shape,
skin tone, and apparent age of every person — do not regenerate or
reinterpret their faces.

Apply this reference style: ${styleDescription}.

Change only: clothing, background, lighting, color grading, and
atmosphere to match the reference style. Keep the same number of
people, poses, expressions, and framing as the original photo.
`.trim();

export async function generateStyledImage(
  sourceImage: Buffer,
  sourceMimeType: string,
  styleDescription: string
): Promise<Buffer> {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: "user",
        parts: [
          { text: IDENTITY_PRESERVATION_PROMPT(styleDescription) },
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
      temperature: 0.25,
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
