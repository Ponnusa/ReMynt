import "server-only";
import { RekognitionClient, CompareFacesCommand } from "@aws-sdk/client-rekognition";

const rekognition = new RekognitionClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Starting point only — needs calibrating against real generations before launch.
// See product spec section 6: identity preservation is not guaranteed on every
// generation, especially for heavily-stylized looks.
export const FREE_REGEN_CONFIDENCE_THRESHOLD = 78;

/**
 * Compares every face Rekognition finds in the source photo against the
 * generated result and returns the *minimum* similarity across matches —
 * one badly-matched face in a group photo should sink the overall score,
 * not get averaged away.
 *
 * Returns 0 if no face in the result matches any source face at all.
 */
export async function computeFaceMatchConfidence(
  sourceImage: Buffer,
  resultImage: Buffer
): Promise<number> {
  const response = await rekognition.send(
    new CompareFacesCommand({
      SourceImage: { Bytes: sourceImage },
      TargetImage: { Bytes: resultImage },
      SimilarityThreshold: 0,
    })
  );

  const similarities = (response.FaceMatches ?? []).map(
    (match) => match.Similarity ?? 0
  );

  if (similarities.length === 0) return 0;
  return Math.min(...similarities);
}
