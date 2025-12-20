
import { GoogleGenAI, Type } from "@google/genai";
import { Location } from '../types';

let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  if (aiInstance) return aiInstance;

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please add VITE_GEMINI_API_KEY to your .env.local file.");
  }

  aiInstance = new GoogleGenAI({ apiKey });
  return aiInstance;
};

const listingSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "A concise, catchy title for the item. Max 50 characters."
    },
    description: {
      type: Type.STRING,
      description: "A detailed description of the item, including its condition, features, and any flaws. Max 300 characters."
    },
    price: {
      type: Type.NUMBER,
      description: "A suggested price for the item in USD, based on its condition and typical market value."
    },
    category: {
      type: Type.STRING,
      description: "A relevant category for the item (e.g., Furniture, Electronics, Clothing)."
    }
  },
  required: ['title', 'description', 'price', 'category']
};

export const generateListingDetails = async (base64Image: string, mimeType: string) => {
  const ai = getAI();
  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType: mimeType,
    },
  };
  const textPart = {
    text: "Analyze this image of a secondhand item. Generate a title, description, category, and suggested price. The item is for a local marketplace like a garage sale."
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [imagePart, textPart] },
    config: {
      responseMimeType: "application/json",
      responseSchema: listingSchema,
    }
  });

  const jsonText = response.text.trim();
  return JSON.parse(jsonText);
};

const multiListingSchema = {
  type: Type.OBJECT,
  properties: {
    listings: {
      type: Type.ARRAY,
      items: {
        ...listingSchema,
        properties: {
          ...listingSchema.properties,
          bestFrameIndex: {
            type: Type.INTEGER,
            description: "The index of the frame in the input array that best represents this item."
          }
        },
        required: [...listingSchema.required, 'bestFrameIndex']
      }
    }
  }
};

export const generateListingsFromVideo = async (base64Frames: string[]) => {
  const ai = getAI();
  const prompt = `
        Analyze these frames from a video of items for a garage sale.
        Identify each distinct item for sale. For each item, select the single best frame that shows it clearly.
        Generate a title, description, price, and category for each unique item.
        Return a JSON object containing a list of these listings.
        Each item in the list must include the index of the best frame from the provided array.
    `;

  const imageParts = base64Frames.map(frame => ({
    inlineData: {
      data: frame,
      mimeType: 'image/jpeg',
    }
  }));

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: { parts: [{ text: prompt }, ...imageParts] },
    config: {
      responseMimeType: "application/json",
      responseSchema: multiListingSchema,
    }
  });

  const jsonText = response.text.trim();
  const result = JSON.parse(jsonText);

  // Attach the actual image data to each listing for easy display
  if (result.listings) {
    result.listings.forEach((listing: any) => {
      if (listing.bestFrameIndex >= 0 && listing.bestFrameIndex < base64Frames.length) {
        listing.imageData = base64Frames[listing.bestFrameIndex];
      }
    });
  }

  return result;
}


export const getGeneralResponse = async (prompt: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-lite',
    contents: prompt
  });
  return { text: response.text, sources: [] };
};

export const getWebSearchResponse = async (prompt: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });
  const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
  return { text: response.text, sources: groundingMetadata?.groundingChunks || [] };
};

export const getLocalSearchResponse = async (prompt: string, location: Location) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: {
            latitude: location.latitude,
            longitude: location.longitude,
          }
        }
      }
    },
  });
  const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
  return { text: response.text, sources: groundingMetadata?.groundingChunks || [] };
};

export const getDeepAnalysisResponse = async (prompt: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: prompt,
    config: {
      thinkingConfig: { thinkingBudget: 32768 },
    },
  });
  return { text: response.text, sources: [] };
};
