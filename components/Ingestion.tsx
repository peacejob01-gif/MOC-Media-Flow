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
      // เรียกใช้ Service ที่ส่งข้อความไปหา Gemini API
      const result = await analyzeContent(rawText); 
      
      setAnalyzedData({
        headline: result.headline,
        rawContent: rawText,
        priority: result.priority,
        pillar: result.pillar as Pillar,
        suggestedMediaType: result.suggestedMediaType,
        assignee: 'Unassigned',
        status: 'Backlog',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      console.error("Analysis Error:", err);
      setError("AI ไม่สามารถวิเคราะห์ได้ กรุณาตรวจสอบการตั้งค่า VITE_GEMINI_API_KEY ใน Vercel");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (analyzedData && analyzedData.headline) {
      const newItem: MediaItem = {
        // กำหนดค่าเริ่มต้นสำหรับฟิลด์ที่อาจจะหายไปเพื่อให้ตรงตาม Interface MediaItem
        id: uuidv4(),
        headline: analyzedData.headline || '',
        rawContent: analyzedData.rawContent || '',
        priority: analyzedData.priority || 5,
        pillar: (analyzedData.pillar as Pillar) || 'Update',
        suggestedMediaType: analyzedData.suggestedMediaType || [],
        assignee: analyzedData.assignee || 'Unassigned',
        status: 'Backlog',
        date: analyzedData.date || new Date().toISOString().split('T')[0],
      };
      
      onAddItem(newItem);
      
      // Reset Form หลังจากบันทึก
      setRawText('');
      setAnalyzedData(null);
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
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* ส่วนที่ 1: พื้นที่สำหรับวางเนื้อหาข่าว */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
          Content Input (News/PR Text)
        </h2>
        <textarea
          className="w-full h-48 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-700"
          placeholder="วางเนื้อหาจากกลุ่ม Line หรือข่าวประชาสัมพันธ์ที่นี่..."
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
        />
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !rawText.trim()}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-6 py-2.5 rounded-lg font-medium transition-all disabled:opacity-50"
          >
            {isAnalyzing ? (
              <> <Loader2 className="animate-spin" size={18} /> กำลังวิเคราะห์... </>
            ) : (
              <> <Wand2 size={18} /> Analyze with Gemini </>
            )}
          </button>
        </div>
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle size={18} /> {error}
          </div>
        )}
      </div>

      {/* ส่วนที่ 2: ฟอร์มตรวจสอบข้อมูล (จะปรากฏหลังจาก AI วิเคราะห์เสร็จ) */}
      {analyzedData && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-blue-200 ring-4 ring-blue-50 animate-in slide-in-from-bottom duration-500">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
              Review & Save to Workflow
            </h2>
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
              <Check size={14} /> AI Analysis Complete
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-600 mb-1">Headline (หัวข้อข่าว)</label>
              <input
                type="text"
                value={analyzedData.headline || ''}
                onChange={(e) => setAnalyzedData({ ...analyzedData, headline: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">MOC Pillar</label>
              <select
                value={analyzedData.pillar || 'Update'}
                onChange={(e) => setAnalyzedData({ ...analyzedData, pillar: e.target.value as Pillar })}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="Trust">Trust (มาตรฐาน/ความเชื่อมั่น)</option>
                <option value="Update">Update (ข่าวประจำวัน/ราคาสินค้า)</option>
                <option value="Policy">Policy (นโยบาย/ประกาศสำคัญ)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">Priority (1-10)</label>
              <input
                type="number"
                min="1" max="10"
                value={analyzedData.priority || 5}
                onChange={(e) => setAnalyzedData({ ...analyzedData, priority: parseInt(e.target.value) })}
                className="w-full p-2.5 border border-slate-300 rounded-lg outline-none"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-600 mb-2">Suggested Media (ประเภทสื่อที่แนะนำ)</label>
              <div className="flex flex-wrap gap-2">
                {MEDIA_TYPES.map(type => {
                  const isSelected = analyzedData.suggestedMediaType?.includes(type);
                  return (
                    <button
                      type="button"
                      key={type}
                      onClick={() => toggleMediaType(type)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                          : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg transition-all hover:scale-105 flex items-center gap-2"
            >
              <Save size={20} />
              Save to Backlog
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
