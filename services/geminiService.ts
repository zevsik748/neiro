import { GenerationSettings } from "../types";

// Helper function to safely get the API Key from various environment variable patterns
const getApiKey = (): string | undefined => {
  let key: string | undefined;

  // 1. Try Vite standard (import.meta.env)
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      const env = import.meta.env;
      key = env.VITE_API_KEY || env.API_KEY || env.VITE_KIE_API_KEY || env.KIE_API_KEY;
    }
  } catch (e) {
    // Ignore errors
  }

  if (key) return key;

  // 2. Try process.env
  try {
    if (typeof process !== 'undefined' && process.env) {
      key = process.env.API_KEY || 
            process.env.VITE_API_KEY || 
            process.env.REACT_APP_API_KEY || 
            process.env.KIE_API_KEY || 
            process.env.VITE_KIE_API_KEY;
    }
  } catch (e) {
    // Ignore errors
  }

  return key;
};

const BASE_URL = 'https://api.kie.ai/api/v1/jobs';

/**
 * Generates an image using the Kie AI Nano Banana Pro API.
 * This involves a two-step process:
 * 1. Create a generation task.
 * 2. Poll the task status until it succeeds or fails.
 */
export const generateImage = async (prompt: string, settings: GenerationSettings): Promise<string> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error("API Key is missing. Please set 'VITE_API_KEY' in your Environment Variables.");
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  };

  // 1. Create Task
  try {
    const createRes = await fetch(`${BASE_URL}/createTask`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'nano-banana-pro',
        input: {
          prompt: prompt,
          // If imageInput is provided, pass it as a single-element array
          image_input: settings.imageInput ? [settings.imageInput] : [],
          aspect_ratio: settings.aspectRatio,
          resolution: settings.resolution,
          output_format: settings.format
        }
      })
    });

    if (!createRes.ok) {
      const errorData = await createRes.json().catch(() => ({}));
      throw new Error(errorData.msg || `HTTP Error: ${createRes.status}`);
    }

    const createData = await createRes.json();
    
    if (createData.code !== 200) {
      throw new Error(createData.msg || 'Failed to create generation task');
    }

    const taskId = createData.data.taskId;

    // 2. Poll for Results
    // We will poll every 2 seconds for up to 2 minutes (60 attempts)
    const pollInterval = 2000;
    const maxAttempts = 60;

    for (let i = 0; i < maxAttempts; i++) {
      // Wait before polling
      await new Promise(resolve => setTimeout(resolve, pollInterval));

      const recordRes = await fetch(`${BASE_URL}/recordInfo?taskId=${taskId}`, {
        method: 'GET',
        headers
      });

      if (!recordRes.ok) continue; // Skip iteration on network glitch

      const recordData = await recordRes.json();
      
      if (recordData.code !== 200) continue;

      const { state, resultJson, failMsg } = recordData.data;

      if (state === 'success') {
        try {
          // resultJson is a stringified JSON object containing resultUrls
          const parsedResult = JSON.parse(resultJson);
          if (parsedResult.resultUrls && parsedResult.resultUrls.length > 0) {
            return parsedResult.resultUrls[0];
          }
          throw new Error("No image URL found in the response result");
        } catch (e: any) {
           throw new Error(`Failed to parse result: ${e.message}`);
        }
      } else if (state === 'fail') {
        throw new Error(failMsg || 'Generation task failed');
      }
      
      // If state is 'waiting', loop continues
    }

    throw new Error("Generation timed out. Please try again.");

  } catch (error: any) {
    console.error("Generation Error:", error);
    throw new Error(error.message || "An unexpected error occurred during generation.");
  }
};