
import { GoogleGenAI, Type } from "@google/genai";
import { DealDetails, AIAnalysis } from "../types";

export const getAIAnalysis = async (deal: DealDetails): Promise<AIAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `
    Analyze this real estate deal:
    Address: ${deal.address}
    ARV (After Repair Value): $${deal.arv.toLocaleString()}
    Square Footage: ${deal.squareFootage} sqft
    
    Provide a professional summary, specific rehab tips for this size property, market sentiment for properties at this price point, and a risk assessment.
    Keep the tone professional and investor-focused.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            rehabTips: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            marketSentiment: { type: Type.STRING },
            riskAssessment: { type: Type.STRING }
          },
          required: ["summary", "rehabTips", "marketSentiment", "riskAssessment"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return {
      summary: "High-potential investment property requiring strategic renovation to maximize ARV.",
      rehabTips: [
        "Focus on kitchen and bathroom modernization.",
        "Update flooring to durable luxury vinyl plank.",
        "Enhance curb appeal with fresh landscaping."
      ],
      marketSentiment: "Stable demand for renovated properties in this price bracket.",
      riskAssessment: "Low to Moderate risk depending on hidden structural issues."
    };
  }
};
