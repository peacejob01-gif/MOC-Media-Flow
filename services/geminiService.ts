import { GoogleGenAI, Type } from "@google/genai";
// 1. เปลี่ยนการ Import ให้ถูก Library (ตัวที่เราลงใน package.json)
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { AnalysisResult } from '../types';

export const analyzeContent = async (text: string): Promise<AnalysisResult> => {
  const apiKey = process.env.API_KEY;
  // 2. เปลี่ยน process.env เป็น import.meta.env (เพราะเราใช้ Vite)
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
  
  if (!apiKey) {
    throw new Error("API Key is missing");
    console.error("API Key missing!");
    return fallbackResponse("กรุณาตั้งค่า API Key ใน Vercel");
  }

  const ai = new GoogleGenAI({ apiKey });
  // 3. ใช้ชื่อ Class ที่ถูกต้อง: GoogleGenerativeAI
  const genAI = new GoogleGenerativeAI(apiKey);

  // 4. เปลี่ยนชื่อ Model เป็นตัวที่เสถียรที่สุดในปัจจุบัน
  // 'gemini-1.5-flash' คือตัวที่รองรับ JSON Schema ได้ดีที่สุด
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  const prompt = `
    Analyze the following PR/News text (likely in Thai) for the Ministry of Commerce workflow.
    Analyze the following PR/News text (in Thai) for the Ministry of Commerce workflow.
    Context: Thailand Ministry of Commerce (MOC).
    
    1. Summarize the headline (keep it punchy).
    2. Determine the 'Pillar' based on context:
       - 'Trust': Building confidence, safety, standards.
       - 'Update': Daily news, prices, stats.
       - 'Policy': Ministerial announcements, new regulations.
       - Default to 'Update' if unsure.
    3. Assign a Priority score (1-10) based on urgency and impact.
    4. Suggest the best media types (select one or more from: Infographic, Banner, Photo Album, Video).
    5. Provide a short summary.
    1. Summarize the headline (in Thai, punchy).
    2. Determine 'Pillar': 'Trust', 'Update', or 'Policy'.
    3. Priority (1-10).
    4. Suggested media types (Infographic, Banner, Photo Album, Video).
    5. Short summary (in Thai).

    Text to analyze:
    "${text}"
    Text to analyze: "${text}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        // 5. ใช้ SchemaType (ไม่ใช่ Type) ให้ตรงกับ Library
        responseSchema: {
          type: Type.OBJECT,
          type: SchemaType.OBJECT,
          properties: {
            headline: { type: Type.STRING },
            priority: { type: Type.NUMBER },
            pillar: { type: Type.STRING, enum: ["Trust", "Update", "Policy"] },
            headline: { type: SchemaType.STRING },
            priority: { type: SchemaType.NUMBER },
            pillar: { type: SchemaType.STRING, enum: ["Trust", "Update", "Policy"] },
            suggestedMediaType: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
              type: SchemaType.ARRAY, 
              items: { type: SchemaType.STRING } 
            },
            summary: { type: Type.STRING }
            summary: { type: SchemaType.STRING }
          },
          required: ["headline", "priority", "pillar", "suggestedMediaType", "summary"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response from AI");

    const resultText = result.response.text();
    return JSON.parse(resultText) as AnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback in case of error
    return {
      headline: "Manual Review Required",
      priority: 5,
      pillar: "Update",
      suggestedMediaType: ["Unknown"],
      summary: "Could not analyze text automatically."
    };
    return fallbackResponse("เกิดข้อผิดพลาดในการเชื่อมต่อ AI");
  }
};
};

const fallbackResponse = (msg: string): AnalysisResult => ({
  headline: "รอการตรวจสอบ",
  priority: 5,
  pillar: "Update",
  suggestedMediaType: ["Manual Review"],
  summary: msg
});
