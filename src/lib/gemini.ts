import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { AnalysisResult } from '../types';

// ใช้ VITE_ นำหน้าเพื่อให้ React ดึงค่ามาใช้ได้
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

export const analyzeContent = async (text: string): Promise<AnalysisResult> => {
  if (!API_KEY) throw new Error("API Key is missing in Environment Variables");

  const genAI = new GoogleGenerativeAI(API_KEY);
  
  const schema = {
    type: SchemaType.OBJECT,
    properties: {
      headline: { type: SchemaType.STRING },
      priority: { type: SchemaType.NUMBER },
      pillar: { type: SchemaType.STRING, enum: ["Trust", "Update", "Policy"] },
      suggestedMediaType: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
      summary: { type: SchemaType.STRING }
    },
    required: ["headline", "priority", "pillar", "suggestedMediaType", "summary"]
  };

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json", responseSchema: schema }
  });

  try {
    const result = await model.generateContent(`Analyze this news: ${text}`);
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error(error);
    return {
      headline: "วิเคราะห์ไม่สำเร็จ",
      priority: 5,
      pillar: "Update",
      suggestedMediaType: ["Manual Review"],
      summary: "กรุณากรอกข้อมูลด้วยตัวเอง"
    };
  }
};
