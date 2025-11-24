export enum TaskStatus {
  IDLE = 'IDLE',
  QUEUED = 'QUEUED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface Task {
  id: string;
  prompt: string;
  response?: string;
  status: TaskStatus;
  createdAt: number;
  completedAt?: number;
  error?: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}