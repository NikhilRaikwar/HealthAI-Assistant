import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('VITE_GEMINI_API_KEY is not set in .env file');
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
const visionModel = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

const detectLanguage = (text: string): string => {
  const hasChineseChars = /[\u4E00-\u9FFF]/.test(text);
  const hasJapaneseChars = /[\u3040-\u309F\u30A0-\u30FF]/.test(text);
  const hasKoreanChars = /[\uAC00-\uD7AF\u1100-\u11FF]/.test(text);
  const hasArabicChars = /[\u0600-\u06FF]/.test(text);
  const hasHindiChars = /[\u0900-\u097F]/.test(text);

  if (hasChineseChars) return 'zh';
  if (hasJapaneseChars) return 'ja';
  if (hasKoreanChars) return 'ko';
  if (hasArabicChars) return 'ar';
  if (hasHindiChars) return 'hi';
  return 'en';
};

const getPromptInLanguage = (prompt: string, inputText: string): string => {
  const lang = detectLanguage(inputText);
  
  switch (lang) {
    case 'zh':
      return `作为医疗AI助手，${prompt}`;
    case 'ja':
      return `医療AIアシスタントとして、${prompt}`;
    case 'ko':
      return `의료 AI 보조자로서, ${prompt}`;
    case 'ar':
      return `كمساعد طبي ذكي، ${prompt}`;
    case 'hi':
      return `एक चिकित्सा AI सहायक के रूप में, ${prompt}`;
    default:
      return `As a medical AI assistant, ${prompt}`;
  }
};

export const analyzeSymptoms = async (symptoms: string) => {
  if (!symptoms.trim()) {
    throw new Error('Please describe your symptoms.');
  }

  const prompt = `Please analyze these symptoms and provide:

1. Potential conditions that might cause these symptoms
2. Severity assessment (Mild, Moderate, Severe)
3. Recommended immediate actions
4. When to seek emergency medical care
5. General preventive measures

Important: This is not a diagnosis. Always consult a healthcare provider for proper medical evaluation.

Symptoms to analyze: ${symptoms}`;

  try {
    const result = await model.generateContent(getPromptInLanguage(prompt, symptoms));
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error analyzing symptoms:', error);
    throw new Error('Failed to analyze symptoms. Please try again.');
  }
};

export const checkDrugInteraction = async (drugs: string[]) => {
  if (drugs.length < 2) {
    throw new Error('Please enter at least two medications to check for interactions.');
  }

  const prompt = `Analyze potential interactions between these medications: ${drugs.join(', ')}. Please provide:

1. Severity of potential interactions (None, Mild, Moderate, Severe)
2. Detailed explanation of each interaction
3. Precautions and recommendations
4. When to seek medical attention

Important: If you're not completely certain about any interaction, please indicate that and recommend consulting a healthcare provider.`;

  try {
    const result = await model.generateContent(getPromptInLanguage(prompt, drugs.join(', ')));
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error checking drug interactions:', error);
    throw new Error('Failed to analyze drug interactions. Please try again.');
  }
};

export const explainMedicalTerm = async (term: string) => {
  if (!term.trim()) {
    throw new Error('Please enter a medical term to explain.');
  }

  const prompt = `Please explain the medical term "${term}" in detail:

1. Definition in simple terms
2. Medical context and usage
3. Related terms or conditions
4. Common symptoms or characteristics (if applicable)
5. When this term is commonly used in healthcare

Please ensure the explanation is accurate and easy to understand for non-medical professionals.`;

  try {
    const result = await model.generateContent(getPromptInLanguage(prompt, term));
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error explaining medical term:', error);
    throw new Error('Failed to explain the medical term. Please try again.');
  }
};

export const summarizeMedicalReport = async (report: string) => {
  if (!report.trim()) {
    throw new Error('No report content provided to analyze.');
  }

  const prompt = `Please provide a comprehensive summary of this medical report, including:

1. Key findings and diagnoses
2. Important test results
3. Recommended treatments or follow-up actions
4. Critical values or concerns (if any)
5. Patient instructions or precautions

Present the information in a clear, organized format that's easy to understand.

Report content: ${report}`;

  try {
    const result = await model.generateContent(getPromptInLanguage(prompt, report));
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error summarizing medical report:', error);
    throw new Error('Failed to summarize the medical report. Please try again.');
  }
};

export const getAIResponse = async (message: string) => {
  if (!message.trim()) {
    throw new Error('Please enter your health-related question.');
  }

  const prompt = `Please respond to this health-related question or concern:

${message}

Provide accurate, helpful information while:
1. Using clear, simple language
2. Including relevant medical context
3. Suggesting when to seek professional medical help
4. Adding preventive measures when applicable

Remember to mention that this information is for educational purposes and not a substitute for professional medical advice.`;

  try {
    const result = await model.generateContent(getPromptInLanguage(prompt, message));
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error getting AI response:', error);
    throw new Error('Failed to process your question. Please try again.');
  }
};