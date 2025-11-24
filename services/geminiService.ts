import { GoogleGenAI } from "@google/genai";
import { GenerationSettings } from "../types";

// Helper function to safely get the API Key from various environment variable patterns
const getApiKey = (): string | undefined => {
  let key: string | undefined;

  // 1. Try Vite standard (import.meta.env)
  try {
    // @ts-ignore - Check import.meta without crashing if not available
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      const env = import.meta.env;
      // Check standard VITE_ prefix, generic API_KEY, and your specific custom keys
      key = env.VITE_API_KEY || env.API_KEY || env.VITE_KIE_API_KEY || env.KIE_API_KEY;
    }
  } catch (e) {
    // Ignore errors if import.meta is not supported
  }

  if (key) return key;

  // 2. Try process.env (Webpack, CRA, or Node.js environments)
  try {
    if (typeof process !== 'undefined' && process.env) {
      key = process.env.API_KEY || 
            process.env.VITE_API_KEY || 
            process.env.REACT_APP_API_KEY || 
            process.env.KIE_API_KEY || 
            process.env.VITE_KIE_API_KEY;
    }
  } catch (e) {
    // Ignore errors if process is not defined
  }

  return key;
};

const API_KEY = getApiKey();

if (!API_KEY) {
  console.warn("API Key not found. Please set VITE_API_KEY in your environment variables.");
}

/**
 * Helper function to fetch an image from a URL and convert it to Base64.
 * Required because gemini-3-pro-image-preview expects inlineData for image inputs.
 */
const fetchImageAsBase64 = async (url: string): Promise<{ data: string; mimeType: string }> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch reference image: ${response.statusText}`);
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove the Data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64Data = base64String.split(',')[1];
        resolve({ data: base64Data, mimeType: blob.type || 'image/png' });
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error: any) {
    throw new Error(`Reference image processing failed: ${error.message}`);
  }
};

export const generateImage = async (prompt: string, settings: GenerationSettings): Promise<string> => {
  const currentKey = getApiKey();
  
  if (!currentKey) {
    throw new Error("API Key is missing. Please set 'VITE_API_KEY' in your Environment Variables and Redeploy.");
  }

  const ai = new GoogleGenAI({ apiKey: currentKey });

  // Map application aspect ratios to those supported by gemini-3-pro-image-preview
  // Supported: "1:1", "3:4", "4:3", "9:16", "16:9"
  let aspectRatio = settings.aspectRatio;
  const supportedRatios = ["1:1", "3:4", "4:3", "9:16", "16:9"];
  
  const ratioMap: Record<string, string> = {
    '21:9': '16:9',
    '4:5': '3:4',
    '5:4': '4:3',
    '2:3': '3:4',
    '3:2': '4:3'
  };

  if (!supportedRatios.includes(aspectRatio)) {
    aspectRatio = (ratioMap[aspectRatio] || '1:1') as any;
  }

  const parts: any[] = [];

  // Handle Reference Image if provided
  if (settings.imageInput && settings.imageInput.trim().length > 0) {
    const { data, mimeType } = await fetchImageAsBase64(settings.imageInput.trim());
    parts.push({
      inlineData: {
        data: data,
        mimeType: mimeType,
      },
    });
  }

  parts.push({ text: prompt });

  // Using 'gemini-3-pro-image-preview' for High-Quality/4K support (Nano Banana Pro equivalent)
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: parts,
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any,
        imageSize: settings.resolution, // '1K', '2K', '4K' are supported
      },
    },
  });

  // Extract image from the response parts
  if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64EncodeString = part.inlineData.data;
        const mimeType = part.inlineData.mimeType || 'image/png';
        return `data:${mimeType};base64,${base64EncodeString}`;
      }
    }
  }

  throw new Error("No image generated in the response.");
};