import { GoogleGenerativeAI } from "@google/generative-ai";

// ส่วนประกอบภายใน Component Ingestion
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

const handleAnalyzeWithAI = async (rawText: string) => {
  try {
    // กำหนด Model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `คุณคือผู้ช่วย Project Manager ของกระทรวงพาณิชย์ 
    ช่วยสรุปเนื้อหาจากข้อความไลน์นี้: "${rawText}"
    โดยให้ผลลัพธ์เป็น JSON format ดังนี้:
    {
      "headline": "สรุปสั้นๆ",
      "pillar": "Trust & Impact หรือ MOC Update หรือ Policy to People",
      "priority": 1-10,
      "suggestedFormat": ["Graphic", "Video"]
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // แปลงผลลัพธ์จาก AI เพื่อเอาไปใช้งานในระบบ
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Analysis failed:", error);
    alert("AI ไม่ทำงาน: ตรวจสอบการตั้งค่า API Key ใน Vercel");
  }
};
