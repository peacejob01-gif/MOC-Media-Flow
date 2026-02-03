import React, { useState } from 'react';
import { Wand2, Save, Loader2, AlertCircle, Check } from 'lucide-react';
import { analyzeContent } from '../services/geminiService';
import { MediaItem, Pillar, Status } from '../types';
import { v4 as uuidv4 } from 'uuid';

// เพิ่มการ Import ใน Ingestion.tsx
import { analyzeNewsWithAI } from '../lib/gemini';

// ภายใน Component Ingestion
const [loading, setLoading] = useState(false);

const handleAutoAnalyze = async (text: string) => {
  if (!text) return alert("กรุณากรอกเนื้อหาข่าวก่อนครับ");
  
  setLoading(true);
  try {
    const aiResult = await analyzeNewsWithAI(text);
    
    // นำค่าที่ AI วิเคราะห์ได้ ไปใส่ใน State ของ Form คุณ
    // ตัวอย่างเช่น:
    // setTitle(aiResult.suggestedTitle);
    // setCategory(aiResult.category);
    
    alert("AI วิเคราะห์สำเร็จ!");
  } catch (error) {
    alert("AI ทำงานขัดข้อง ตรวจสอบ Console หรือ API Key");
  } finally {
    setLoading(false);
  }
};

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
      setAnalyzedData({
        headline: result.headline,
        rawContent: rawText,
        priority: result.priority,
        pillar: result.pillar,
        suggestedMediaType: result.suggestedMediaType,
        assignee: 'Unassigned',
        status: 'Backlog',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      setError("Failed to analyze content. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (analyzedData && analyzedData.headline) {
      // Ensure suggestedMediaType is an array
      const mediaTypes = analyzedData.suggestedMediaType || [];
      
      const newItem: MediaItem = {
        ...analyzedData as MediaItem,
        suggestedMediaType: mediaTypes,
        id: uuidv4(),
      };
      onAddItem(newItem);
      // Reset
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
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
          Content Input (Line/News)
        </h2>
        <textarea
          className="w-full h-48 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-700"
          placeholder="Paste raw text from Line group or news source here..."
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
        />
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !rawText.trim()}
            className="flex items-center gap-2 bg-moc-blue hover:bg-blue-800 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
            Analyze with Gemini
          </button>
        </div>
        {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                <AlertCircle size={18} />
                {error}
            </div>
        )}
      </div>

      {analyzedData && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 ring-1 ring-blue-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
              Review & Save
            </h2>
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
              <Wand2 size={14} /> AI Analysis Complete
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-600 mb-1">Headline (AI Generated)</label>
              <input
                type="text"
                value={analyzedData.headline}
                onChange={(e) => setAnalyzedData({ ...analyzedData, headline: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-600 mb-1">Original Content</label>
              <textarea
                value={analyzedData.rawContent || ''}
                onChange={(e) => setAnalyzedData({ ...analyzedData, rawContent: e.target.value })}
                className="w-full h-32 p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-600 font-mono"
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
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={analyzedData.priority}
                  onChange={(e) => setAnalyzedData({ ...analyzedData, priority: parseInt(e.target.value) })}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className={`font-bold text-lg w-8 text-center ${
                  (analyzedData.priority || 0) >= 8 ? 'text-red-600' : 'text-slate-600'
                }`}>
                  {analyzedData.priority}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Suggested Media Type (Select multiple)</label>
              <div className="flex flex-wrap gap-2">
                {MEDIA_TYPES.map(type => {
                    const isSelected = analyzedData.suggestedMediaType?.includes(type);
                    return (
                        <button
                            type="button"
                            key={type}
                            onClick={() => toggleMediaType(type)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all flex items-center gap-1.5 ${
                                isSelected 
                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                            }`}
                        >
                            {isSelected && <Check size={14} />}
                            {type}
                        </button>
                    );
                })}
              </div>
              {/* Show any AI suggestions that aren't in the standard list */}
              {analyzedData.suggestedMediaType && analyzedData.suggestedMediaType.length > 0 && (
                  <div className="mt-2 text-xs text-slate-500">
                    Selected: {analyzedData.suggestedMediaType.join(', ')}
                  </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">Assignee</label>
              <input
                type="text"
                value={analyzedData.assignee}
                onChange={(e) => setAnalyzedData({ ...analyzedData, assignee: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg outline-none"
                placeholder="e.g. John Doe"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold shadow-md transition-all transform hover:scale-105"
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
