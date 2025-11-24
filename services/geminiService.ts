import { GoogleGenAI } from "@google/genai";

// Initialize the client. 
// Note: In a production Vite app, this would typically come from import.meta.env.VITE_API_KEY, 
// but we adhere to process.env.API_KEY as per instructions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTaskContent = async (prompt: string): Promise<string> => {
  try {
    const modelId = 'gemini-2.5-flash'; 
    
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: "You are a helpful AI assistant executing a specific user task. Be concise, professional, and accurate.",
      }
    });

    return response.text || "No content generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};