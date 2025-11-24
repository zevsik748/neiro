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
 * Extremely safe API Key retrieval.
 * Tries every possible combination of environment access.
 */
const getApiKey = (): string | undefined => {
  let key: string | undefined;

  // 1. Try import.meta.env (Vite standard)
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      const env = import.meta.env;
      key = env.VITE_API_KEY || env.API_KEY || env.VITE_KIE_API_KEY || env.KIE_API_KEY || env.REACT_APP_API_KEY;
    }
  } catch (e) {
    console.warn("Error accessing import.meta.env", e);
  }

  if (key) return key;

  // 2. Try process.env (Node/Webpack standard)
  try {
    if (typeof process !== 'undefined' && process.env) {
      key = process.env.VITE_API_KEY || process.env.API_KEY || process.env.KIE_API_KEY || process.env.REACT_APP_API_KEY;
    }
  } catch (e) {
    console.warn("Error accessing process.env", e);
  }

  return key;
};

/**
 * Generates an image using the Kie AI Nano Banana Pro API.
 * Follows the strict "Create Task -> Poll Status" flow.
 */
export const generateImage = async (prompt: string, settings: GenerationSettings): Promise<string> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    console.error("API Key is missing. Checked VITE_API_KEY, API_KEY, KIE_API_KEY.");
    throw new Error("API Key configuration missing. Please ensure 'VITE_API_KEY' is set in your environment variables.");
  }

  console.log("Starting generation with Nano Banana Pro...");

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  };

  // --- Step 1: Create Generation Task ---
  
  const requestBody: CreateTaskRequest = {
    model: MODEL_NAME,
    input: {
      prompt: prompt,
      image_input: settings.imageInput ? [settings.imageInput] : [],
      aspect_ratio: settings.aspectRatio,
      resolution: settings.resolution,
      output_format: settings.format
    }
  };

  let taskId: string;

  try {
    console.log("Creating task...", JSON.stringify(requestBody));
    const createRes = await fetch(`${BASE_URL}/createTask`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    if (!createRes.ok) {
      const errorBody = await createRes.json().catch(() => ({}));
      console.error("Task creation failed:", createRes.status, errorBody);
      if (createRes.status === 401) throw new Error("Authentication failed. Check your API Key.");
      throw new Error(errorBody.msg || `API Error: ${createRes.status}`);
    }

    const createData: CreateTaskResponse = await createRes.json();

    if (createData.code !== 200) {
      console.error("API logic error:", createData);
      throw new Error(createData.msg || 'API returned error during task creation');
    }

    taskId = createData.data.taskId;
    console.log(`Task created successfully. Task ID: ${taskId}`);

  } catch (error: any) {
    console.error("Task Creation Exception:", error);
    throw new Error(error.message || "Failed to initiate generation task.");
  }

  // --- Step 2: Poll Task Status ---

  const POLL_INTERVAL_MS = 2500; 
  const MAX_ATTEMPTS = 40; // ~100 seconds timeout

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    // Delay before check
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));

    try {
      const recordRes = await fetch(`${BASE_URL}/recordInfo?taskId=${taskId}`, {
        method: 'GET',
        headers
      });

      if (!recordRes.ok) {
        console.warn(`Poll attempt ${attempt + 1} failed with HTTP ${recordRes.status}`);
        if (recordRes.status === 401) throw new Error("Token expired or invalid during polling.");
        // If 500 or network error, continue retrying
        if (recordRes.status >= 500) continue; 
      }

      const recordData: TaskRecordResponse = await recordRes.json();

      if (recordData.code !== 200) {
        throw new Error(recordData.msg || "Error querying task status");
      }

      const { state, resultJson, failMsg } = recordData.data;
      console.log(`Polling status: ${state} (Attempt ${attempt + 1}/${MAX_ATTEMPTS})`);

      if (state === 'success') {
        if (!resultJson) {
          throw new Error("Task succeeded but result data is empty.");
        }

        try {
          const parsedResult: TaskResultContent = JSON.parse(resultJson);
          
          if (parsedResult.resultUrls && parsedResult.resultUrls.length > 0) {
            console.log("Generation complete:", parsedResult.resultUrls[0]);
            return parsedResult.resultUrls[0];
          }
          
          throw new Error("No image URL found in result.");
        } catch (parseError) {
          console.error("JSON Parse error:", resultJson);
          throw new Error("Failed to parse result JSON from API.");
        }
      } else if (state === 'fail') {
        console.error("Task failed:", failMsg);
        throw new Error(failMsg || "Generation task failed on server.");
      }
      
      // If state is 'waiting', loop continues

    } catch (pollError: any) {
      if (pollError.message.includes("Token expired") || pollError.message.includes("Generation task failed")) {
        throw pollError;
      }
      console.warn(`Polling transient error:`, pollError);
    }
  }

  throw new Error("Generation timed out. The server took too long to respond.");
};