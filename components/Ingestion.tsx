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

  // ฟังก์ชันหลักที่ปุ่มเรียกใช้
  const handleAnalyze = async () => {
    if (!rawText.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // เรียกใช้ Service ที่เราแก้ API Key และ Library ไว้แล้ว
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
      setError("AI ไม่สามารถวิเคราะห์ได้ กรุณาตรวจสอบ API Key ใน Vercel");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (analyzedData && analyzedData.headline) {
      const newItem: MediaItem = {
        ...analyzedData as MediaItem,
        id: uuidv4(),
      };
      onAddItem(newItem);
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
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Step 1: Input */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
          Content Input (News/PR Text)
        </h2>
        <textarea
          className="w-full h-48 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-700"
          placeholder="วางเนื้อหาข่าวที่นี่ เพื่อให้ AI ช่วยวิเคราะห์..."
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
              <> <Loader2 className="animate-spin" size={18} /> วิเคราะห์ด้วย AI... </>
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

      {/* Step 2: Review Form (Show only when analyzed) */}
      {analyzedData && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-blue-200 ring-4 ring-blue-50 animate-slide-up">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
              Review & Save to Workflow
            </h2>
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
              <Check size={14} /> AI Analysis Ready
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-600 mb-1">Headline</label>
              <input
                type="text"
                value={analyzedData.headline}
                onChange={(e) => setAnalyzedData({ ...analyzedData, headline: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">MOC Pillar</label>
              <select
                value={analyzedData.pillar}
                onChange={(e) => setAnalyzedData({ ...analyzedData, pillar: e.target.value as Pillar })}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="Trust">Trust (Standards/Safety)</option>
                <option value="Update">Update (Prices/Stats)</option>
                <option value="Policy">Policy (Regulations)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">Priority (1-10)</label>
              <input
                type="number"
                min="1" max="10"
                value={analyzedData.priority}
                onChange={(e) => setAnalyzedData({ ...analyzedData, priority: parseInt(e.target.value) })}
                className="w-full p-2.5 border border-slate-300 rounded-lg outline-none"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-600 mb-2">Suggested Media</label>
              <div className="flex flex-wrap gap-2">
                {MEDIA_TYPES.map(type => (
                  <button
                    type="button"
                    key={type}
                    onClick={() => toggleMediaType(type)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                      analyzedData.suggestedMediaType?.includes(type)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-600 border-slate-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg transition-transform hover:scale-105"
            >
              Save to Production
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
