import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { AnalysisResult } from '../types';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

export const analyzeContent = async (text: string): Promise<AnalysisResult> => {
  if (!apiKey) {
    console.error("API Key missing!");
    return fallbackResponse("กรุณาตั้งค่า API Key (VITE_GEMINI_API_KEY)");
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    // ปรับ Prompt ให้เน้นย้ำเรื่องภาษาไทยและการพาดหัว
    const prompt = `
      คุณคือบรรณาธิการข่าวอาวุโสของกระทรวงพาณิชย์
      ภารกิจ: วิเคราะห์เนื้อหาข่าวและตอบกลับเป็น JSON ภาษาไทยเท่านั้น
      
      กฎการพาดหัวข่าว (headline): 
      - ต้องเป็นภาษาไทย 
      - ต้องกระชับ ดึงดูดสายตา 
      - ห้ามยาวเกิน 100 ตัวอักษร

      เนื้อหาที่ต้องวิเคราะห์: 
      "${text}"
    `;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            headline: { 
              type: SchemaType.STRING, 
              description: "หัวข้อข่าวสรุปเป็นภาษาไทย" 
            },
            priority: { 
              type: SchemaType.NUMBER, 
              description: "ระดับความสำคัญ 1-10" 
            },
            pillar: { 
              type: SchemaType.STRING, 
              enum: ["Trust", "Update", "Policy"] 
            },
            suggestedMediaType: { 
              type: SchemaType.ARRAY, 
              items: { type: SchemaType.STRING } 
            },
            summary: { 
              type: SchemaType.STRING, 
              description: "สรุปเนื้อหาข่าว 1 ประโยคภาษาไทย" 
            }
          },
          required: ["headline", "priority", "pillar", "suggestedMediaType", "summary"]
        }
      }
    });

    // ดึง Text ออกมาอย่างปลอดภัย
    const resultResponse = await result.response;
    const resultText = resultResponse.text();

    if (!resultText) throw new Error("AI returned empty text");

    return JSON.parse(resultText) as AnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return fallbackResponse("AI ไม่สามารถวิเคราะห์ได้ กรุณาลองอีกครั้ง");
  }
};

const fallbackResponse = (msg: string): AnalysisResult => ({
  headline: "วิเคราะห์ไม่สำเร็จ - กรุณาระบุหัวข้อด้วยตนเอง",
  priority: 5,
  pillar: "Update",
  suggestedMediaType: ["Manual Review"],
  summary: msg
});
