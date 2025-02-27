import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("VITE_GEMINI_API_KEY is not set in .env file");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const detectLanguage = (text: string): string => {
  const hasChineseChars = /[\u4E00-\u9FFF]/.test(text);
  const hasJapaneseChars = /[\u3040-\u309F\u30A0-\u30FF]/.test(text);
  const hasKoreanChars = /[\uAC00-\uD7AF\u1100-\u11FF]/.test(text);
  const hasArabicChars = /[\u0600-\u06FF]/.test(text);
  const hasHindiChars = /[\u0900-\u097F]/.test(text);

  if (hasChineseChars) return "zh";
  if (hasJapaneseChars) return "ja";
  if (hasKoreanChars) return "ko";
  if (hasArabicChars) return "ar";
  if (hasHindiChars) return "hi";
  return "en";
};

const getPromptInLanguage = (prompt: string, inputText: string): string => {
  const lang = detectLanguage(inputText);
  
  switch (lang) {
    case "zh":
      return `作为医疗AI助手，${prompt}`;
    case "ja":
      return `医療AIアシスタントとして、${prompt}`;
    case "ko":
      return `의료 AI 보조자로서, ${prompt}`;
    case "ar":
      return `كمساعد طبي ذكي، ${prompt}`;
    case "hi":
      return `एक चिकित्सा AI सहायक के रूप में, ${prompt}`;
    default:
      return `As a medical AI assistant, ${prompt}`;
  }
};

export const analyzeSymptoms = async (symptoms: string) => {
  if (!symptoms.trim()) {
    throw new Error("Please describe your symptoms.");
  }

  const prompt = `Please analyze these symptoms: ${symptoms}`;

  try {
    const result = await model.generateContent(getPromptInLanguage(prompt, symptoms));
    return result.response.text();
  } catch (error) {
    console.error("Error analyzing symptoms:", error);
    throw new Error("Failed to analyze symptoms. Please try again.");
  }
};

export const checkDrugInteraction = async (drugs: string[]) => {
  if (drugs.length < 2) {
    throw new Error("Please enter at least two medications to check for interactions.");
  }

  const prompt = `Check interactions for: ${drugs.join(", ")}`;

  try {
    const result = await model.generateContent(getPromptInLanguage(prompt, drugs.join(", ")));
    return result.response.text();
  } catch (error) {
    console.error("Error checking drug interactions:", error);
    throw new Error("Failed to analyze drug interactions. Please try again.");
  }
};

export const explainMedicalTerm = async (term: string) => {
  if (!term.trim()) {
    throw new Error("Please enter a medical term to explain.");
  }

  const prompt = `Explain: ${term}`;

  try {
    const result = await model.generateContent(getPromptInLanguage(prompt, term));
    return result.response.text();
  } catch (error) {
    console.error("Error explaining medical term:", error);
    throw new Error("Failed to explain the medical term. Please try again.");
  }
};

export const summarizeMedicalReport = async (report: string) => {
  if (!report.trim()) {
    throw new Error("No report content provided to analyze.");
  }

  const prompt = `Summarize this medical report: ${report}`;

  try {
    const result = await model.generateContent(getPromptInLanguage(prompt, report));
    return result.response.text();
  } catch (error) {
    console.error("Error summarizing medical report:", error);
    throw new Error("Failed to summarize the medical report. Please try again.");
  }
};

export const getAIResponse = async (message: string) => {
  if (!message.trim()) {
    throw new Error("Please enter your health-related question.");
  }

  const prompt = `Respond to this question: ${message}`;

  try {
    const result = await model.generateContent(getPromptInLanguage(prompt, message));
    return result.response.text();
  } catch (error) {
    console.error("Error getting AI response:", error);
    throw new Error("Failed to process your question. Please try again.");
  }
};