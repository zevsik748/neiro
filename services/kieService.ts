import { SoraTaskResponse, SoraTaskStatusResponse, SoraResult } from '../types';

const KIE_API_URL = 'https://api.kie.ai/api/v1/jobs';

export const createSoraTask = async (videoUrl: string): Promise<string> => {
  const apiKey = process.env.KIE_API_KEY;
  
  if (!apiKey) {
    throw new Error("ОШИБКА КОНФИГУРАЦИИ: KIE_API_KEY не найден. Проверьте настройки TimeWeb.");
  }

  try {
    const response = await fetch(`${KIE_API_URL}/createTask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'sora-watermark-remover',
        input: {
          video_url: videoUrl
        }
      })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Ошибка API (${response.status}): ${errorData.msg || 'Не удалось создать задачу'}`);
    }

    const data: SoraTaskResponse = await response.json();
    return data.data.taskId;

  } catch (error: any) {
    console.error("Kie API Error:", error);
    throw new Error(error.message || "Ошибка при создании задачи удаления водяного знака.");
  }
};

export const getSoraTaskResult = async (taskId: string): Promise<SoraResult | null> => {
  const apiKey = process.env.KIE_API_KEY;
  if (!apiKey) throw new Error("KIE_API_KEY не найден");

  try {
    const response = await fetch(`${KIE_API_URL}/recordInfo?taskId=${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error("Не удалось получить статус задачи");
    }

    const data: SoraTaskStatusResponse = await response.json();
    const { state, resultJson, failMsg } = data.data;

    if (state === 'fail') {
      throw new Error(failMsg || 'Обработка видео завершилась ошибкой');
    }

    if (state === 'success' && resultJson) {
      try {
        const result: SoraResult = JSON.parse(resultJson);
        return result;
      } catch (e) {
        throw new Error("Ошибка парсинга результата JSON");
      }
    }

    return null; // Still waiting
  } catch (error: any) {
    console.error("Kie Polling Error:", error);
    throw error;
  }
};