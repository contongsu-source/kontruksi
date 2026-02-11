import { GoogleGenAI } from "@google/genai";
import { Project, Material } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateConstructionInsight = async (projects: Project[], materials: Material[], query: string): Promise<string> => {
  const projectSummary = projects.map(p => 
    `- ${p.name} (${p.status}): Budget Rp${p.budget.toLocaleString()}, Terpakai Rp${p.spent.toLocaleString()}, Progress ${p.progress}%`
  ).join('\n');

  const materialSummary = materials.map(m =>
    `- ${m.name}: Stok ${m.quantity} ${m.unit} @ Rp${m.unitPrice.toLocaleString()}`
  ).join('\n');

  const prompt = `
    Anda adalah Konsultan Senior Manajemen Konstruksi AI yang ahli.
    
    Data Proyek Saat Ini:
    ${projectSummary}

    Data Material Saat Ini:
    ${materialSummary}

    Pertanyaan User: "${query}"

    Berikan analisis singkat, tajam, dan profesional seperti laporan perusahaan besar.
    Jika diminta saran, fokus pada efisiensi biaya, manajemen risiko, atau penjadwalan.
    Gunakan Bahasa Indonesia yang formal dan korporat.
    Jangan gunakan markdown bold/italic yang berlebihan, cukup teks bersih.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Maaf, tidak dapat menghasilkan analisis saat ini.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Terjadi kesalahan saat menghubungi layanan AI. Silakan coba lagi nanti.";
  }
};