export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  settings?: GenerationSettings;
}

export interface GenerationState {
  isLoading: boolean;
  error: string | null;
}

export type AspectRatio = '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '4:5' | '5:4' | '9:16' | '16:9' | '21:9';
export type Resolution = '1K' | '2K' | '4K';
export type OutputFormat = 'png' | 'jpg';

export interface GenerationSettings {
  aspectRatio: AspectRatio;
  resolution: Resolution;
  format: OutputFormat;
  imageInput?: string;
}

// Sora / Kie.ai Types
export interface SoraTaskResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
  };
}

export interface SoraTaskStatusResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
    state: 'waiting' | 'success' | 'fail';
    resultJson?: string; // JSON string containing resultUrls
    failMsg?: string;
  };
}

export interface SoraResult {
  resultUrls: string[];
}