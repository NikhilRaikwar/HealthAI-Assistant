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
export const queryPolicyDocument = async (query: string, policyText: string) => {
  if (!query.trim()) {
    throw new Error("Please enter your policy question.");
  }

  if (!policyText.trim()) {
    throw new Error("No policy document provided to analyze.");
  }

  const prompt = `You are an expert policy analysis assistant. Analyze the following policy document and answer the user's query with detailed information.

POLICY DOCUMENT:
${policyText}

USER QUERY: ${query}

Please provide a comprehensive response that includes:
1. **Decision**: Clear answer (Approved/Rejected/Covered/Not Covered/etc.)
2. **Amount**: If applicable, mention any monetary amounts, limits, or percentages
3. **Justification**: Detailed explanation of your decision
4. **Policy Clauses**: Reference specific sections or clauses from the policy that support your answer
5. **Additional Information**: Any relevant conditions, waiting periods, or requirements

Parse the query to identify key details like:
- Age and demographics
- Medical procedure or condition
- Location
- Policy duration/age
- Any other relevant factors

Use semantic understanding to find relevant information even if the query is vague or incomplete. Always reference specific policy clauses and provide clear justification for your decisions.

Format your response in a clear, structured manner with proper headings and bullet points where appropriate.`;

  try {
    const result = await model.generateContent(getPromptInLanguage(prompt, query));
    return result.response.text();
  } catch (error) {
    console.error("Error querying policy document:", error);
    throw new Error("Failed to analyze the policy query. Please try again.");
  }
};

export const queryMedicalReport = async (query: string, reportText: string) => {
  if (!query.trim()) {
    throw new Error("Please enter your question about the medical report.");
  }

  if (!reportText.trim()) {
    throw new Error("No medical report provided to analyze.");
  }

  const prompt = `You are an expert medical report analysis assistant. Analyze the following medical report and answer the user's query with detailed, easy-to-understand information.

MEDICAL REPORT:
${reportText}

USER QUERY: ${query}

Please provide a comprehensive response that includes:
1. **Direct Answer**: Clear, concise answer to the user's question
2. **Detailed Explanation**: In-depth explanation in simple, non-technical language
3. **Key Findings**: Highlight any important test results, diagnoses, or observations relevant to the query
4. **Report References**: Quote specific sections or values from the report that support your answer
5. **Clinical Significance**: Explain what the findings mean for the patient's health
6. **Recommendations**: If applicable, suggest follow-up questions or areas to discuss with a doctor

Important guidelines:
- Explain medical terminology in simple terms
- Provide context for test results (normal ranges, significance)
- Be empathetic and clear
- If uncertain, suggest consulting with a healthcare provider
- Identify trends or patterns in the report data

Format your response in a clear, structured manner with proper headings and bullet points where appropriate.`;

  try {
    const result = await model.generateContent(getPromptInLanguage(prompt, query));
    return result.response.text();
  } catch (error) {
    console.error("Error querying medical report:", error);
    throw new Error("Failed to analyze your medical report query. Please try again.");
  }
};

// ============================================
// STREAMING CHAT FUNCTIONS FOR ENHANCED UI
// ============================================

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Build context from last 5 messages only (for speed)
const buildContext = (messages: Message[]): string => {
  const recentMessages = messages.slice(-5);
  return recentMessages
    .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n');
};

// Healthcare-specific system prompt (concise for speed)
const SYSTEM_PROMPT = `You are a helpful healthcare AI assistant. Provide concise, accurate health information. Keep responses under 150 words unless specifically asked for details. Always remind users this is educational information, not medical diagnosis.`;

// STREAMING RESPONSE - Shows response as it's generated (feels faster!)
export async function* streamAIResponse(
  userMessage: string,
  conversationHistory: Message[] = []
): AsyncGenerator<string, void, unknown> {
  try {
    const context = buildContext(conversationHistory);
    const prompt = `${SYSTEM_PROMPT}\n\nConversation History:\n${context}\n\nUser: ${userMessage}\n\nAssistant:`;

    const result = await model.generateContentStream(prompt);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      yield chunkText;
    }
  } catch (error) {
    console.error('Gemini API Streaming Error:', error);
    throw new Error('Failed to stream response from AI');
  }
}

// Cancel current request
let currentController: AbortController | null = null;

export function cancelCurrentRequest() {
  if (currentController) {
    currentController.abort();
    currentController = null;
  }
}