import { GenerationSettings } from "../types";
import { MODEL_NAME } from "../constants";

const API_KEY = process.env.KIE_API_KEY || process.env.API_KEY;
const BASE_URL = 'https://api.kie.ai/api/v1';

if (!API_KEY) {
  console.error("API Key is missing!");
}

interface CreateTaskResponse {
  code: number;
  message: string;
  data: {
    taskId: string;
  };
}

interface TaskRecordResponse {
  code: number;
  message: string;
  data: {
    taskId: string;
    state: 'waiting' | 'queuing' | 'generating' | 'success' | 'fail';
    resultJson?: string;
    failMsg?: string;
  };
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export const generateImage = async (prompt: string, settings: GenerationSettings): Promise<string> => {
  if (!API_KEY) {
    throw new Error("API Key не найден.");
  }

  // Формируем payload
  const inputPayload: any = {
    prompt: prompt,
    aspect_ratio: settings.aspectRatio,
    resolution: settings.resolution,
    output_format: settings.format
  };

  // Если есть URL изображения, добавляем его
  if (settings.imageInput && settings.imageInput.trim().length > 0) {
    inputPayload.image_input = [settings.imageInput.trim()];
  } else {
    inputPayload.image_input = [];
  }

  // 1. Создание задачи
  const createResponse = await fetch(`${BASE_URL}/jobs/createTask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      input: inputPayload
    })
  });

  if (!createResponse.ok) {
    const errorText = await createResponse.text();
    throw new Error(`Ошибка создания задачи: ${createResponse.status} ${errorText}`);
  }

  const createData: CreateTaskResponse = await createResponse.json();
  
  if (createData.code !== 200) {
    throw new Error(`Ошибка API: ${createData.message}`);
  }

  const taskId = createData.data.taskId;
  console.log(`Task created: ${taskId}`);

  // 2. Ожидание результата (Polling)
  const maxAttempts = 60; // 2 минуты максимум (при задержке 2с)
  let attempts = 0;

  while (attempts < maxAttempts) {
    await sleep(2000); // Ждем 2 секунды перед следующим опросом
    attempts++;

    const statusResponse = await fetch(`${BASE_URL}/jobs/recordInfo?taskId=${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    });

    if (!statusResponse.ok) {
      console.warn("Ошибка проверки статуса, пробуем снова...");
      continue;
    }

    const statusData: TaskRecordResponse = await statusResponse.json();
    
    if (statusData.code !== 200) {
      throw new Error(`Ошибка получения статуса: ${statusData.message}`);
    }

    const { state, resultJson, failMsg } = statusData.data;
    console.log(`Task status: ${state}`);

    if (state === 'success') {
      if (!resultJson) throw new Error("Задача завершена, но результат отсутствует.");
      
      try {
        const parsedResult = JSON.parse(resultJson);
        const urls = parsedResult.resultUrls;
        if (urls && urls.length > 0) {
          return urls[0];
        } else {
          throw new Error("Массив URL пуст.");
        }
      } catch (e) {
        throw new Error("Ошибка парсинга результата JSON.");
      }
    }

    if (state === 'fail') {
      throw new Error(`Ошибка генерации: ${failMsg || 'Неизвестная ошибка'}`);
    }

    // Если waiting, queuing или generating - продолжаем цикл
  }

  throw new Error("Тайм-аут генерации. Попробуйте позже.");
};