import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { AnalysisResult } from '../types';

// เลือกใช้ Key ให้ตรงกับที่คุณตั้งใน Vercel
// ถ้าใช้ Vite ต้องใช้ import.meta.env.VITE_GEMINI_API_KEY
// ถ้าใช้ Create React App ต้องใช้ process.env.REACT_APP_GEMINI_API_KEY
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

export const analyzeContent = async (text: string): Promise<AnalysisResult> => {
  if (!API_KEY) {
    console.error("API Key is missing! Check your Environment Variables.");
    throw new Error("API Key is missing");
  }

  const genAI = new GoogleGenerativeAI(API_KEY);

  // กำหนด Schema เพื่อให้ AI ตอบกลับเป็น JSON ที่ถูกต้องแม่นยำ
  const schema = {
    description: "Analysis of PR/News text",
    type: SchemaType.OBJECT,
    properties: {
      headline: { type: SchemaType.STRING },
      priority: { type: SchemaType.NUMBER },
      pillar: { 
        type: SchemaType.STRING, 
        enum: ["Trust", "Update", "Policy"] 
      },
      suggestedMediaType: {
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING }
      },
      summary: { type: SchemaType.STRING }
    },
    required: ["headline", "priority", "pillar", "suggestedMediaType", "summary"],
  };

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash", // แนะนำตัวนี้เพราะเร็วและรองรับ JSON Mode ได้ดี
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  const prompt = `
    Analyze the following PR/News text for the Ministry of Commerce workflow.
    Context: Ministry of Commerce, Thailand.
    
    1. Summarize the headline (keep it punchy, in Thai).
    2. Determine the 'Pillar':
       - 'Trust': Confidence, standards, safety.
       - 'Update': Daily news, prices, stats.
       - 'Policy': Regulations, announcements.
    3. Priority (1-10).
    4. Suggest media types (Infographic, Banner, Photo Album, Video).
    5. Short summary (in Thai).

    Text to analyze:
    "${text}"
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const resultText = response.text();

    return JSON.parse(resultText) as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      headline: "เกิดข้อผิดพลาดในการวิเคราะห์",
      priority: 5,
      pillar: "Update",
      suggestedMediaType: ["Manual Review"],
      summary: "ไม่สามารถวิเคราะห์ข้อมูลอัตโนมัติได้ในขณะนี้"
    };
  }
};
