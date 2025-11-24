import { CreateTaskRequest, CreateTaskResponse, TaskStatusResponse } from '../types';

const BASE_URL = 'https://api.kie.ai/api/v1/playground';

export const kieService = {
  createTask: async (apiKey: string, request: CreateTaskRequest): Promise<CreateTaskResponse> => {
    try {
      const response = await fetch(`${BASE_URL}/createTask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorBody}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  getTaskInfo: async (apiKey: string, taskId: string): Promise<TaskStatusResponse> => {
    try {
      const url = new URL(`${BASE_URL}/recordInfo`);
      url.searchParams.append('taskId', taskId);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorBody}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting task info:', error);
      throw error;
    }
  },
};