export enum DeploymentStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface SystemCheck {
  id: string;
  name: string;
  status: boolean;
  message?: string;
}