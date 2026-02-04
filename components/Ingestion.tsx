import React, { useState } from 'react';
import { Wand2, Save, Loader2, AlertCircle, Check } from 'lucide-react';
import { analyzeContent } from '../services/geminiService';
import { MediaItem, Pillar } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface IngestionProps {
  onAddItem: (item: MediaItem) => void;
}

const MEDIA_TYPES = ['Infographic', 'Banner', 'Photo Album', 'Video'];

export const Ingestion: React.FC<IngestionProps> = ({ onAddItem }) => {
  const [rawText, setRawText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedData, setAnalyzedData] = useState<Partial<MediaItem> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!rawText.trim()) return;
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const result = await analyzeContent(rawText);
      
      // ตรวจสอบว่ามีข้อมูลส่งกลับมาจริงหรือไม่
      if (!result || !result.headline) {
        throw new Error("AI สรุปผลไม่ได้ กรุณาลองใหม่อีกครั้ง");
      }

      // เซตค่าที่ได้จาก AI ลงใน State ทันที
      setAnalyzedData({
        headline: result.headline, // หัวข้อข่าวภาษาไทย
        rawContent: rawText,
        priority: result.priority || 5,
        pillar: (result.pillar as Pillar) || 'Update',
        suggestedMediaType: Array.isArray(result.suggestedMediaType) ? result.suggestedMediaType : ['Infographic'],
        assignee: 'Unassigned',
        status: 'Backlog',
        summary: result.summary,
        date: new Date().toISOString().split('T')[0]
      });
    } catch (err: any) {
      console.error("Analysis Error:", err);
      setError(err.message || "Failed to analyze content. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // เพิ่มการ Check analyzedData.headline ให้เข้มงวดขึ้น
    if (analyzedData && analyzedData.headline && analyzedData.headline !== "รอการตรวจสอบ") {
      const newItem: MediaItem = {
        id: uuidv4(),
        headline: analyzedData.headline,
        rawContent: analyzedData.rawContent || rawText,
        priority: analyzedData.priority || 5,
        pillar: (analyzedData.pillar as Pillar) || 'Update',
        suggestedMediaType: analyzedData.suggestedMediaType || [],
        assignee: analyzedData.assignee || 'Unassigned',
        status: 'Backlog',
        date: analyzedData.date || new Date().toISOString().split('T')[0],
        summary: analyzedData.summary || ''
      };
      
      onAddItem(newItem);
      setRawText('');
      setAnalyzedData(null);
    } else {
      alert("กรุณาระบุหัวข้อข่าวก่อนบันทึก");
    }
  };

  const toggleMediaType = (type: string) => {
    if (!analyzedData) return;
    const current = analyzedData.suggestedMediaType || [];
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    setAnalyzedData({ ...analyzedData, suggestedMediaType: updated });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* ส่วนที่ 1: Input */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
          Content Input (Line/News)
        </h2>
        <textarea
          className="w-full h-48 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-50
