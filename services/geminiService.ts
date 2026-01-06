
import { GoogleGenAI, Type } from "@google/genai";
import { Seller, Manager } from "../types";

interface SellerPerformance extends Seller {
  totalPoints: number;
  totalSales: number;
}

export const getRaceAnalysis = async (sellers: SellerPerformance[], activeManager: Manager | null, lang: 'pt' | 'en' = 'pt') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const sellersData = sellers.map(s => `${s.name} (${s.manager}): ${s.totalPoints} points, ${s.totalSales} sales`).join('\n');
  
  const prompt = `
    Act as a sales performance analyst for SEDA College.
    We are in the middle of a "Sales Race".
    Below are the sellers data:
    ${sellersData}
    
    The manager currently viewing this dashboard is: ${activeManager || 'Global'}.
    
    Please provide a quick motivational analysis (max 3 paragraphs) in ${lang === 'pt' ? 'Portuguese' : 'English'}:
    1. Who is leading and why.
    2. How the current manager's team (${activeManager || 'Global'}) is performing.
    3. A strategic tip to increase the Average Tuition ticket (currently focused on the race).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("AI Analysis error:", error);
    return lang === 'pt' ? "Desculpe, não conseguimos gerar a análise agora." : "Sorry, we couldn't generate the analysis right now.";
  }
};

export const extractSaleFromDocument = async (base64File: string, mimeType: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Analyze this SEDA College quote document and extract the following information in JSON format.
    
    CRITICAL EXTRACTION RULES:
    1. CONSULTANT: You must look for the phrase "International Marketing". The name IMMEDIATELY ABOVE this phrase is the consultant's name. Example: if "Naiara" appears and below "International Marketing", the consultant is Naiara. Ignore director or reception names at the top of the document.
    2. VALUES:
       - The TOTAL package value is in black and bold at the end of the price table.
       - SERVICES: Always consider 420€ as a fixed deduction.
       - ACCOMMODATION: Extract the "Accommodation" value if present, otherwise use 0.
    3. CITIES: Dublin or Cork.
    
    Return the JSON following this schema:
    - sellerName (Name extracted above International Marketing)
    - clientName (Student name)
    - quoteNumber (Ex: QT-XXXX)
    - date (YYYY-MM-DD)
    - city (Dublin or Cork)
    - modality (Standard, Premium, Elite or Barganha)
    - isRenewal (boolean)
    - packageTotalValue (Number)
    - servicesAmount (420)
    - accommodationAmount (Number)
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64File.split(',')[1],
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sellerName: { type: Type.STRING },
            clientName: { type: Type.STRING },
            quoteNumber: { type: Type.STRING },
            date: { type: Type.STRING },
            city: { type: Type.STRING },
            modality: { type: Type.STRING },
            isRenewal: { type: Type.BOOLEAN },
            packageTotalValue: { type: Type.NUMBER },
            servicesAmount: { type: Type.NUMBER },
            accommodationAmount: { type: Type.NUMBER },
          },
          required: ["sellerName", "clientName", "packageTotalValue"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Extraction error:", error);
    throw error;
  }
};
