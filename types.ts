// 1. กำหนดหมวดหมู่หลัก (Pillar) ของกระทรวงพาณิชย์
// ใช้ตัวพิมพ์ใหญ่ตัวแรกตามมาตรฐานที่เราตั้งใน AI Schema
export type Pillar = 'Trust' | 'Update' | 'Policy';

// 2. กำหนดสถานะของ Workflow งานสื่อ
export type Status = 'Backlog' | 'In Progress' | 'Review' | 'Done';

// 3. โครงสร้างข้อมูลหลัก (หัวใจของ App)
export interface MediaItem {
  id: string;               // UUID จากการรัน uuidv4()
  headline: string;         // หัวข้อที่ได้จาก AI หรือ User แก้ไข
  rawContent: string;       // เนื้อหาเต็มที่ก๊อปมาวาง
  priority: number;         // 1-10
  pillar: Pillar;           // ต้องตรงกับ 3 ค่าด้านบนเท่านั้น
  suggestedMediaType: string[]; // เช่น ['Infographic', 'Video']
  assignee: string;         // ผู้รับผิดชอบ (ค่าเริ่มต้น 'Unassigned')
  status: Status;           // สถานะปัจจุบัน
  date: string;             // วันที่สร้างรายการ (ISO string)
  summary?: string;         // คำอธิบายสั้นๆ จาก AI
}

// 4. โครงสร้างที่รับมาจาก Gemini API
// ปรับ pillar ให้เป็น Pillar | string เพื่อป้องกัน Error 
// หาก AI ส่งค่าแปลกปลอมมา ก่อนที่เราจะทำการตรวจสอบ (Validate)
export interface AnalysisResult {
  headline: string;
  priority: number;
  pillar: Pillar | string; 
  suggestedMediaType: string[];
  summary: string;
}
