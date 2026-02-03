import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from '../types';

export const analyzeContent = async (text: string): Promise<AnalysisResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Analyze the following PR/News text (likely in Thai) for the Ministry of Commerce workflow.
    
    1. Summarize the headline (keep it punchy).
    2. Determine the 'Pillar' based on context:
       - 'Trust': Building confidence, safety, standards.
       - 'Update': Daily news, prices, stats.
       - 'Policy': Ministerial announcements, new regulations.
       - Default to 'Update' if unsure.
    3. Assign a Priority score (1-10) based on urgency and impact.
    4. Suggest the best media types (select one or more from: Infographic, Banner, Photo Album, Video).
    5. Provide a short summary.

    Text to analyze:
    "${text}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING },
            priority: { type: Type.NUMBER },
            pillar: { type: Type.STRING, enum: ["Trust", "Update", "Policy"] },
            suggestedMediaType: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            summary: { type: Type.STRING }
          },
          required: ["headline", "priority", "pillar", "suggestedMediaType", "summary"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response from AI");

    return JSON.parse(resultText) as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback in case of error
    return {
      headline: "Manual Review Required",
      priority: 5,
      pillar: "Update",
      suggestedMediaType: ["Unknown"],
      summary: "Could not analyze text automatically."
    };
  }
};