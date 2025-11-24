export enum ModelType {
  TEXT_TO_IMAGE = 'google/nano-banana',
  IMAGE_TO_IMAGE = 'google/nano-banana-edit',
}

export interface TaskInput {
  prompt: string;
  image_urls?: string[];
}

export interface CreateTaskRequest {
  model: ModelType;
  callBackUrl: string;
  input: TaskInput;
}

export interface CreateTaskResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
  };
}

export interface TaskStatusResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
    state: 'processing' | 'success' | 'failed';
    progress?: number;
    resultJson?: string; // The API returns this as a stringified JSON usually, or a direct URL depending on the node
  };
}

// Helper to parse the resultJson if needed, assuming the standard output format
export interface GenerationResult {
  images?: string[]; // URL list
  image?: string;    // Single URL
}
