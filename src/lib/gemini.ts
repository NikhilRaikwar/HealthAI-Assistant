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
    const result = await model.generateContent(
      getPromptInLanguage(prompt, symptoms)
    );
    return result.response.text();
  } catch (error) {
    console.error("Error analyzing symptoms:", error);
    throw new Error("Failed to analyze symptoms. Please try again.");
  }
};

export const checkDrugInteraction = async (drugs: string[]) => {
  if (drugs.length < 1) {
    throw new Error("Please enter at least one medication to analyze.");
  }

  let prompt: string;

  if (drugs.length === 1) {
    // Single drug - provide comprehensive information
    prompt = `Provide detailed information about the medication "${drugs[0]}" including:
- What it is used for (indications)
- Common dosage
- Side effects
- Precautions and warnings
- Drug class/category
Format the response in a clear, organized manner.`;
  } else {
    // Multiple drugs - check for interactions
    prompt = `Analyze potential drug interactions between these medications: ${drugs.join(
      ", "
    )}

Provide:
1. **Interaction Summary**: Are there any known interactions?
2. **Severity Level**: (None/Minor/Moderate/Severe)
3. **Details**: Explain any interactions found
4. **Recommendations**: Any precautions or advice
5. **Individual Drug Info**: Brief info about each medication

Format the response clearly with proper headings.`;
  }

  try {
    const result = await model.generateContent(
      getPromptInLanguage(prompt, drugs.join(", "))
    );
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
    const result = await model.generateContent(
      getPromptInLanguage(prompt, term)
    );
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
    const result = await model.generateContent(
      getPromptInLanguage(prompt, report)
    );
    return result.response.text();
  } catch (error) {
    console.error("Error summarizing medical report:", error);
    throw new Error(
      "Failed to summarize the medical report. Please try again."
    );
  }
};

export const getAIResponse = async (message: string) => {
  if (!message.trim()) {
    throw new Error("Please enter your health-related question.");
  }

  const prompt = `Respond to this question: ${message}`;

  try {
    const result = await model.generateContent(
      getPromptInLanguage(prompt, message)
    );
    return result.response.text();
  } catch (error) {
    console.error("Error getting AI response:", error);
    throw new Error("Failed to process your question. Please try again.");
  }
};
export const queryPolicyDocument = async (
  query: string,
  policyText: string
) => {
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
    const result = await model.generateContent(
      getPromptInLanguage(prompt, query)
    );
    return result.response.text();
  } catch (error) {
    console.error("Error querying policy document:", error);
    throw new Error("Failed to analyze the policy query. Please try again.");
  }
};

export const validateMedicationName = async (
  drugName: string
): Promise<boolean> => {
  if (!drugName.trim()) {
    return false;
  }

  const prompt = `Determine if "${drugName}" is a valid medication, drug, or pharmaceutical name.

Valid medication names include:
- Generic drug names (e.g., aspirin, ibuprofen, metformin)
- Brand names (e.g., Tylenol, Advil, Lipitor)
- Medical supplements (e.g., Vitamin D, Calcium)
- Over-the-counter medicines
- Prescription medications
- Herbal medications

Respond with ONLY "VALID" if this is a legitimate medication name.
Respond with ONLY "INVALID" if it is:
- A non-medical term (e.g., "maths", "physics", "history")
- Random words or gibberish
- Food items (unless they are medicinal supplements)
- General subjects or topics
- Numbers or symbols only

TERM TO VALIDATE: ${drugName}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text().trim().toUpperCase();
    return response.includes("VALID") && !response.includes("INVALID");
  } catch (error) {
    console.error("Error validating medication name:", error);
    // If API fails, use a simple client-side check as fallback
    const nonMedicalTerms = [
      "maths",
      "math",
      "physics",
      "chemistry",
      "biology",
      "history",
      "geography",
      "english",
      "science",
      "art",
      "music",
    ];
    return !nonMedicalTerms.includes(drugName.toLowerCase().trim());
  }
};

export const validateMedicalReport = async (text: string): Promise<boolean> => {
  if (!text.trim()) {
    return false;
  }

  const prompt = `Analyze the following text and determine if it is a legitimate medical report or medical document. 

Look for these medical indicators:
- Medical terminology (diagnosis, symptoms, medications, procedures)
- Lab results and test values
- Patient information sections
- Doctor/physician names or signatures
- Medical facility information
- Vital signs, measurements, or clinical observations
- Treatment plans or recommendations
- Medical codes (ICD, CPT)
- Prescription information

Respond with ONLY "VALID" if this appears to be a medical document, or "INVALID" if it appears to be:
- A resume or CV
- A novel, story, or fiction
- Academic papers (non-medical)
- Business documents
- Random text or gibberish
- Non-medical content

TEXT TO ANALYZE:
${text.substring(0, 2000)}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text().trim().toUpperCase();
    return response.includes("VALID") && !response.includes("INVALID");
  } catch (error) {
    console.error("Error validating medical report:", error);
    return false;
  }
};

export const validatePolicyDocument = async (text: string): Promise<boolean> => {
  if (!text.trim()) {
    return false;
  }

  const prompt = `Analyze the following text and determine if it is a legitimate health insurance policy or health policy document.

Look for these health policy indicators:
- Insurance policy terminology (coverage, premium, deductible, co-payment, exclusions)
- Health insurance terms (policyholder, insured, beneficiary, claims)
- Medical coverage details (hospitalization, surgery, treatment coverage)
- Policy terms and conditions
- Sum insured or coverage limits
- Waiting periods for treatments or pre-existing conditions
- Network hospitals or healthcare providers
- Policy exclusions and limitations
- Insurance company name or policy number
- Health-related benefits (maternity, ambulance, daycare procedures)
- Terms like "policy", "insurance", "healthcare coverage", "medical expenses"

Respond with ONLY "VALID" if this appears to be a health insurance policy or health policy document.

Respond with ONLY "INVALID" if it appears to be:
- Competition guidelines or rules (Techathon, Hackathon)
- Academic papers or research documents
- Business documents or contracts (non-health insurance)
- Resumes, CVs, or portfolios
- Novels, stories, or fiction
- Random text or gibberish
- Non-policy content
- General medical documents (not insurance policies)
- Technical documentation
- Event guidelines or statements

TEXT TO ANALYZE:
${text.substring(0, 3000)}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text().trim().toUpperCase();
    return response.includes("VALID") && !response.includes("INVALID");
  } catch (error) {
    console.error("Error validating policy document:", error);
    // Fallback to keyword-based validation if API fails
    return performBasicPolicyValidation(text);
  }
};

// Fallback validation using keyword checking
const performBasicPolicyValidation = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  
  // Required health policy keywords
  const policyKeywords = [
    'policy', 'insurance', 'insured', 'coverage', 'premium',
    'deductible', 'co-payment', 'claim', 'beneficiary'
  ];
  
  // Health-related keywords
  const healthKeywords = [
    'medical', 'health', 'hospital', 'treatment', 'surgery',
    'doctor', 'patient', 'diagnosis', 'healthcare'
  ];
  
  // Anti-keywords that indicate non-policy documents
  const antiKeywords = [
    'techathon', 'hackathon', 'competition', 'guideline',
    'statement', 'event', 'participant', 'submission'
  ];
  
  // Check for anti-keywords first
  const hasAntiKeywords = antiKeywords.some(keyword => lowerText.includes(keyword));
  if (hasAntiKeywords) {
    return false;
  }
  
  // Count matches for policy and health keywords
  const policyMatches = policyKeywords.filter(keyword => lowerText.includes(keyword)).length;
  const healthMatches = healthKeywords.filter(keyword => lowerText.includes(keyword)).length;
  
  // Document should have at least 2 policy keywords AND 1 health keyword
  return policyMatches >= 2 && healthMatches >= 1;
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
    const result = await model.generateContent(
      getPromptInLanguage(prompt, query)
    );
    return result.response.text();
  } catch (error) {
    console.error("Error querying medical report:", error);
    throw new Error(
      "Failed to analyze your medical report query. Please try again."
    );
  }
};

// ============================================
// STREAMING CHAT FUNCTIONS FOR ENHANCED UI
// ============================================

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Build context from last 5 messages only (for speed)
const buildContext = (messages: Message[]): string => {
  const recentMessages = messages.slice(-5);
  return recentMessages
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n");
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
    console.error("Gemini API Streaming Error:", error);
    throw new Error("Failed to stream response from AI");
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

export const analyzeMedicalImage = async (
  imageBase64: string,
  additionalInfo?: string
) => {
  if (!imageBase64) {
    throw new Error("Please upload a medical image.");
  }

  const contextPrompt = additionalInfo
    ? `\n\nPatient Context: ${additionalInfo}`
    : "";

  const prompt = `You are an expert medical AI assistant specializing in medical image analysis. Analyze the medical image provided and give comprehensive insights.${contextPrompt}

Please analyze the medical image and provide detailed information in the following JSON format:

{
  "imageType": "X-Ray/CT Scan/MRI/Ultrasound/ECG/etc.",
  "bodyPart": "Affected body part or organ system",
  "keyFindings": [
    {
      "finding": "Description of the finding",
      "location": "Specific location in the image",
      "severity": "Normal" | "Mild" | "Moderate" | "Severe" | "Critical",
      "significance": "What this finding means clinically"
    }
  ],
  "overallAssessment": {
    "status": "Normal" | "Attention Needed" | "Urgent Care Required",
    "summary": "Overall summary of the image findings",
    "urgencyLevel": "Low" | "Medium" | "High"
  },
  "recommendations": {
    "immediate": ["Immediate actions needed if any"],
    "followUp": ["Follow-up tests or consultations needed"],
    "lifestyle": ["Lifestyle modifications based on findings"]
  },
  "differentialDiagnosis": ["Possible conditions based on findings"],
  "redFlags": ["Critical findings that need immediate attention"],
  "nextSteps": ["Ordered list of next steps for the patient"],
  "confidence": 85
}

Analysis Guidelines:
1. Identify the type of medical imaging (X-ray, CT, MRI, Ultrasound, ECG, etc.)
2. Analyze all visible anatomical structures and abnormalities
3. Identify any pathological findings, fractures, masses, or irregularities
4. Assess the severity and clinical significance of findings
5. Provide differential diagnosis based on visible findings
6. Highlight any critical findings requiring immediate attention
7. Consider the patient context if provided
8. Suggest appropriate follow-up imaging or consultations
9. Always err on the side of caution for patient safety
10. Be specific about urgency levels and timeframes

Return ONLY the JSON object, no additional text.`;

  try {
    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: "image/jpeg",
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = result.response.text();

    let cleanedResponse = response.trim();
    if (cleanedResponse.startsWith("```json")) {
      cleanedResponse = cleanedResponse
        .replace(/^```json\s*/, "")
        .replace(/\s*```$/, "");
    } else if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse
        .replace(/^```\s*/, "")
        .replace(/\s*```$/, "");
    }

    const analysis = JSON.parse(cleanedResponse);

    if (!analysis.imageType) {
      throw new Error("Could not identify image type");
    }

    return analysis;
  } catch (error) {
    console.error("Error analyzing medical image:", error);
    throw new Error("Failed to analyze medical image. Please try again.");
  }
};

export const analyzeMedicine = async (
  imageBase64: string,
  additionalInfo?: string
) => {
  if (!imageBase64) {
    throw new Error("Please upload a medicine image.");
  }

  const contextPrompt = additionalInfo
    ? `\n\nAdditional patient information: ${additionalInfo}`
    : "";

  const prompt = `You are a highly advanced pharmaceutical AI assistant. Analyze the medicine image provided and give comprehensive information about the medication.${contextPrompt}

Please analyze the medicine in the image and provide detailed information in the following JSON format:

{
  "medicineName": "Full name of the medicine",
  "activeIngredients": ["list", "of", "active", "ingredients"],
  "whatItHelps": ["condition1", "condition2", "what this medicine treats"],
  "severity": "Low" | "Medium" | "High",
  "doctorConsultationRequired": true | false,
  "whenToTake": {
    "timing": ["morning", "evening", "specific times"],
    "withFood": "Before" | "After" | "With" | "Doesn't matter",
    "frequency": "how often to take"
  },
  "sideEffects": {
    "common": ["common side effects"],
    "serious": ["serious side effects that require immediate medical attention"],
    "patientSpecific": ["side effects specific to patient's mentioned conditions"]
  },
  "precautions": ["important precautions and warnings"],
  "interactions": ["drug interactions to be aware of"],
  "confidence": 85
}

Important guidelines:
1. If you cannot clearly identify the medicine, indicate lower confidence
2. Consider the patient's additional information when providing patient-specific advice
3. Always err on the side of caution for safety recommendations
4. Provide practical, actionable information
5. Consider both generic and brand names if visible
6. Be specific about timing and dosage instructions
7. Include relevant warnings based on the medicine type

Return ONLY the JSON object, no additional text.`;

  try {
    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: "image/jpeg",
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = result.response.text();

    let cleanedResponse = response.trim();
    if (cleanedResponse.startsWith("```json")) {
      cleanedResponse = cleanedResponse
        .replace(/^```json\s*/, "")
        .replace(/\s*```$/, "");
    } else if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse
        .replace(/^```\s*/, "")
        .replace(/\s*```$/, "");
    }

    const analysis = JSON.parse(cleanedResponse);

    if (!analysis.medicineName) {
      throw new Error("Could not identify medicine name");
    }

    return analysis;
  } catch (error) {
    console.error("Error analyzing medicine:", error);
    throw new Error("Failed to analyze medicine. Please try again.");
  }
};
