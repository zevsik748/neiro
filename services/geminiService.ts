import { GoogleGenAI } from "@google/genai";
import { GenerationSettings } from "../types";

// Explicitly using 'gemini-3-pro-image-preview' for Nano Banana Pro.
const MODEL_NAME = 'gemini-3-pro-image-preview';

export const generateImage = async (prompt: string, settings: GenerationSettings): Promise<string> => {
  // Key must be configured in TimeWeb environment variables
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("ОШИБКА КОНФИГУРАЦИИ СЕРВЕРА: API_KEY не найден в переменных окружения.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const parts: any[] = [];

  // Handle Image Input (Reference Image)
  if (settings.imageInput && settings.imageInput.trim().length > 0) {
    try {
      const response = await fetch(settings.imageInput);
      if (!response.ok) throw new Error("Не удалось загрузить референсное изображение");
      
      const blob = await response.blob();
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result.split(',')[1]);
          } else {
            reject(new Error("Не удалось прочитать данные изображения"));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      parts.push({
        inlineData: {
          mimeType: blob.type,
          data: base64Data
        }
      });
    } catch (error) {
      console.warn("Could not process reference image:", error);
      throw new Error("Не удалось загрузить референсное изображение. Проверьте ссылку и доступность файла.");
    }
  }

  parts.push({ text: prompt });

  // Map UI aspect ratios to Gemini supported aspect ratios
  let aspectRatio = settings.aspectRatio;
  const supportedRatios = ["1:1", "3:4", "4:3", "9:16", "16:9"];
  
  if (!supportedRatios.includes(aspectRatio)) {
    switch (aspectRatio) {
      case '21:9': aspectRatio = '16:9'; break; // Fallback for cinematic
      case '2:3': aspectRatio = '3:4'; break;
      case '3:2': aspectRatio = '4:3'; break;
      case '4:5': aspectRatio = '3:4'; break;
      case '5:4': aspectRatio = '4:3'; break;
      default: aspectRatio = '1:1';
    }
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: parts
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
          imageSize: settings.resolution
        }
      }
    });

    // Iterate through parts to find the image part
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const mimeType = part.inlineData.mimeType || 'image/png';
          return `data:${mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    
    const textPart = response.candidates?.[0]?.content?.parts?.find((p: any) => p.text);
    if (textPart) {
      // Sometimes the model refuses and returns text explaining why
      throw new Error(`Модель отказала в генерации: ${textPart.text}`);
    }

    throw new Error("Ответ модели не содержит изображения. Попробуйте изменить запрос.");
  } catch (error: any) {
    console.error("GenAI Error:", error);
    if (error.message?.includes("403") || error.message?.includes("API key")) {
        throw new Error("Ошибка доступа (403). Проверьте API ключ в настройках сервера.");
    }
    throw new Error(error.message || "Неизвестная ошибка генерации изображения.");
  }
};