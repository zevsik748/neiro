import { GenerationSettings } from "../types";

// API Constants
const BASE_URL = 'https://api.kie.ai/api/v1/jobs';
const MODEL_NAME = 'nano-banana-pro';

// --- Interfaces defined strictly according to the API Documentation ---

interface CreateTaskRequest {
  model: typeof MODEL_NAME;
  input: {
    prompt: string;
    image_input: string[];
    aspect_ratio?: string;
    resolution?: string;
    output_format?: string;
  };
  callBackUrl?: string;
}

interface CreateTaskResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
  };
}

interface TaskRecordResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
    model: string;
    state: 'waiting' | 'success' | 'fail';
    param: string;
    resultJson: string | null; // JSON string containing results
    failCode: string | null;
    failMsg: string | null;
    costTime: number | null;
    completeTime: number | null;
    createTime: number;
  };
}

interface TaskResultContent {
  resultUrls?: string[];
  resultObject?: any;
}

/**
 * Safely retrieves the API Key from environment variables.
 * Checks both Vite (import.meta.env) and standard (process.env) patterns.
 */
const getApiKey = (): string | undefined => {
  // 1. Try Vite standard (import.meta.env)
  try {
    // @ts-ignore - Accessing import.meta safely
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      const env = import.meta.env;
      const key = env.VITE_API_KEY || env.API_KEY || env.VITE_KIE_API_KEY || env.KIE_API_KEY;
      if (key) return key;
    }
  } catch {
    // Continue if import.meta access fails
  }

  // 2. Try standard process.env
  try {
    if (typeof process !== 'undefined' && process.env) {
      const key = process.env.API_KEY || 
                  process.env.VITE_API_KEY || 
                  process.env.REACT_APP_API_KEY || 
                  process.env.KIE_API_KEY || 
                  process.env.VITE_KIE_API_KEY;
      if (key) return key;
    }
  } catch {
    // Continue if process access fails
  }

  return undefined;
};

/**
 * Generates an image using the Kie AI Nano Banana Pro API.
 * Follows the strict "Create Task -> Poll Status" flow.
 */
export const generateImage = async (prompt: string, settings: GenerationSettings): Promise<string> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error("API Key not found. Please set 'VITE_API_KEY' in your environment variables.");
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  };

  // --- Step 1: Create Generation Task ---
  
  const requestBody: CreateTaskRequest = {
    model: MODEL_NAME,
    input: {
      prompt: prompt,
      // API expects an array for image_input.
      image_input: settings.imageInput ? [settings.imageInput] : [],
      aspect_ratio: settings.aspectRatio,
      resolution: settings.resolution,
      output_format: settings.format
    }
  };

  let taskId: string;

  try {
    const createRes = await fetch(`${BASE_URL}/createTask`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    if (!createRes.ok) {
      const errorBody = await createRes.json().catch(() => ({}));
      throw new Error(errorBody.msg || `Failed to create task: HTTP ${createRes.status}`);
    }

    const createData: CreateTaskResponse = await createRes.json();

    if (createData.code !== 200) {
      throw new Error(createData.msg || 'API returned error during task creation');
    }

    taskId = createData.data.taskId;

  } catch (error: any) {
    console.error("Task Creation Failed:", error);
    throw new Error(error.message || "Failed to initiate generation task.");
  }

  // --- Step 2: Poll Task Status ---

  const POLL_INTERVAL_MS = 2000; // 2 seconds
  const MAX_ATTEMPTS = 60; // 2 minutes timeout

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    // Delay before check
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));

    try {
      const recordRes = await fetch(`${BASE_URL}/recordInfo?taskId=${taskId}`, {
        method: 'GET',
        headers
      });

      if (!recordRes.ok) {
        // If network error on poll (not auth), just wait and try again
        if (recordRes.status === 401) throw new Error("Authentication failed during polling.");
        if (recordRes.status >= 500) continue; 
        throw new Error(`Polling failed: HTTP ${recordRes.status}`);
      }

      const recordData: TaskRecordResponse = await recordRes.json();

      if (recordData.code !== 200) {
        // API logic error
        throw new Error(recordData.msg || "Error querying task status");
      }

      const { state, resultJson, failMsg } = recordData.data;

      if (state === 'success') {
        if (!resultJson) {
          throw new Error("Task succeeded but no result data returned.");
        }

        try {
          const parsedResult: TaskResultContent = JSON.parse(resultJson);
          
          if (parsedResult.resultUrls && parsedResult.resultUrls.length > 0) {
            return parsedResult.resultUrls[0];
          }
          
          throw new Error("No image URL found in result.");
        } catch (parseError) {
          throw new Error("Failed to parse result JSON from API.");
        }
      } else if (state === 'fail') {
        throw new Error(failMsg || "Generation task failed.");
      }
      
      // If state is 'waiting', loop continues to next attempt

    } catch (pollError: any) {
      // If it's a critical error, stop.
      if (pollError.message.includes("Authentication") || pollError.message.includes("Generation task failed")) {
        throw pollError;
      }
      // Otherwise log and retry (e.g. transient network issue)
      console.warn(`Polling attempt ${attempt + 1} warning:`, pollError);
    }
  }

  throw new Error("Generation timed out. Please try again later.");
};