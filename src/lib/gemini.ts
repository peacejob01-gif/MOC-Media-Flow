import { GoogleGenerativeAI } from "@google/generative-ai";

// ดึง Key จาก Environment Variable
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY; 
const genAI = new GoogleGenerativeAI(API_KEY);

export const analyzeNewsWithAI = async (newsContent: string) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
      ในฐานะผู้เชี่ยวชาญด้านสื่อของกระทรวงพาณิชย์ (MOC) 
      โปรดวิเคราะห์เนื้อหาข่าวดังนี้: "${newsContent}"
      และตอบกลับเป็น JSON format เท่านั้น โดยมีโครงสร้างดังนี้:
      {
        "suggestedTitle": "หัวข้อข่าวที่น่าสนใจ",
        "category": "หมวดหมู่ข่าว",
        "suggestedMediaType": ["Facebook", "TikTok", "YouTube"],
        "summary": "สรุปสั้นๆ 1-2 ประโยค"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // ทำความสะอาดข้อความ เผื่อ AI ส่ง Markdown backticks มา
    const cleanJson = text.replace(/```json|```/g, "");
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("AI Analysis Error:", error);
    throw error;
  }
};
