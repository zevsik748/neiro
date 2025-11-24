import { GoogleGenAI } from "@google/genai";

export const checkGeminiConnection = async (): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
      throw new Error("API_KEY не найден в переменных окружения");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Ответь коротко и весело на русском языке: 'Системы в норме, полет нормальный!'",
    });

    return response.text || "Нет ответа от модели";
  } catch (error: any) {
    console.error("Gemini Error:", error);
    throw new Error(error.message || "Ошибка соединения с AI");
  }
};