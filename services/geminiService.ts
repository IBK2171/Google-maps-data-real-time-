import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { UserLocation, GroundingChunk } from '../types';

/**
 * Queries the Gemini API with Google Maps grounding for location-based information.
 * @param prompt The user's query about places or geography.
 * @param userLocation Optional user's latitude and longitude for more relevant results.
 * @returns An object containing the generated text response and any extracted grounding URIs.
 */
export const queryMapsGrounding = async (
  prompt: string,
  userLocation: UserLocation | null,
): Promise<{ text: string; groundingUris: GroundingChunk[] }> => {
  // CRITICAL: Create a new GoogleGenAI instance right before making an API call
  // to ensure it always uses the most up-to-date API key.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const requestBody = {
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: userLocation
        ? {
            retrievalConfig: {
              latLng: {
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
              },
            },
          }
        : undefined,
    },
  };

  try {
    const response: GenerateContentResponse = await ai.models.generateContent(requestBody);

    const text = response.text;
    const groundingUris: GroundingChunk[] = [];

    // Extract grounding chunks and list them.
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      for (const chunk of response.candidates[0].groundingMetadata.groundingChunks) {
        // Explicitly check for 'maps' or 'web' property to correctly type the chunk
        if ('maps' in chunk) {
          groundingUris.push(chunk);
        } else if ('web' in chunk) {
          // Although the request is for googleMaps tool, the model can sometimes return
          // web grounding chunks, especially if the query broadly covers web-searchable aspects.
          // This ensures we capture all relevant links.
          groundingUris.push(chunk);
        }
      }
    }

    return { text, groundingUris };
  } catch (error) {
    console.error("Error querying Gemini Maps Grounding API:", error);
    throw new Error(`Failed to get maps data: ${error instanceof Error ? error.message : String(error)}`);
  }
};
