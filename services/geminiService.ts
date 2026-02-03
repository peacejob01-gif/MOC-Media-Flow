import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { AnalysisResult } from '../types';

// ใช้ VITE_ นำหน้าเสมอสำหรับโปรเจกต์ที่สร้างด้วย Vite
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

export const analyzeContent = async (text: string): Promise<AnalysisResult> => {
  // 1. ตรวจสอบ API Key ก่อนเริ่มทำงาน
  if (!API_KEY) {
    console.error("Critical Error: VITE_GEMINI_API_KEY is not defined in Environment Variables.");
    return fallbackResponse("API Key missing. Please check Vercel settings.");
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);

    // 2. กำหนดโครงสร้าง Schema ให้ AI ตอบกลับเป็น JSON ที่แน่นอน
    const schema = {
      description: "Analysis of Ministry of Commerce PR/News content",
      type: SchemaType.OBJECT,
      properties: {
        headline: { 
          type: SchemaType.STRING,
          description: "A punchy summary of the news in Thai language."
        },
        priority: { 
          type: SchemaType.NUMBER,
          description: "Urgency score from 1 to 10."
        },
        pillar: { 
          type: SchemaType.STRING, 
          enum: ["Trust", "Update", "Policy"],
          description: "Categorize based on content theme."
        },
        suggestedMediaType: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: "Recommended media formats like Video, Infographic, etc."
        },
        summary: { 
          type: SchemaType.STRING,
          description: "One sentence brief in Thai."
        }
      },
      required: ["headline", "priority", "pillar", "suggestedMediaType", "summary"],
    };

    // 3. ตั้งค่า Model และผลบังคับใช้ JSON Mode
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const prompt = `
      คุณคือผู้เชี่ยวชาญด้านสื่อของกระทรวงพาณิชย์ (Thailand Ministry of Commerce).
      จงวิเคราะห์ข้อความต่อไปนี้:
      "${text}"

      เกณฑ์การเลือก Pillar:
      - 'Trust': เกี่ยวกับมาตรฐานสินค้า, การดูแลผู้บริโภค, ความปลอดภัย.
      - 'Update': ข่าวประจำวัน, ราคาสินค้าเกษตร, ตัวเลขสถิติ.
      - 'Policy': ประกาศจากรัฐมนตรี, กฎหมายใหม่, ข้อตกลงการค้า.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const resultText = response.text();

    if (!resultText) {
      throw new Error("Empty response from Gemini AI");
    }

    // แปลงผลลัพธ์เป็น JSON Object
    return JSON.parse(resultText) as AnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return fallbackResponse("ไม่สามารถวิเคราะห์ข้อมูลได้ในขณะนี้");
  }
};

/**
 * ฟังก์ชันสร้างค่าเริ่มต้นกรณี AI ทำงานผิดพลาด (Fallback)
 */
function fallbackResponse(errorMessage: string): AnalysisResult {
  return {
    headline: "ต้องการการตรวจสอบด้วยตนเอง",
    priority: 5,
    pillar: "Update",
    suggest
