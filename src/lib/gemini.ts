import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('VITE_GEMINI_API_KEY is not set in .env file');
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

export const analyzeSymptoms = async (symptoms: string) => {
  const prompt = `As a medical AI assistant, analyze these symptoms and provide potential conditions, severity level, and recommended actions. Symptoms: ${symptoms}`;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
};

export const summarizeMedicalReport = async (report: string) => {
  const prompt = `Summarize this medical report in clear, simple terms: ${report}`;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
};

export const checkDrugInteraction = async (drugs: string[]) => {
  const prompt = `Analyze potential interactions between these medications: ${drugs.join(', ')}`;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
};

export const explainMedicalTerm = async (term: string) => {
  const prompt = `Explain this medical term in simple, understandable language: ${term}`;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
};