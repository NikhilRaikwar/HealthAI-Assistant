import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("VITE_GEMINI_API_KEY is not set in .env file");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// ============================================
// BASE SYSTEM PROMPT - SAFE GUIDANCE MODE
// ============================================

const BASE_SYSTEM_PROMPT = `You are HealthAI Assistant, a compassionate and knowledgeable healthcare AI designed to provide reliable health information with empathy and care.

🎯 YOUR CORE PRINCIPLES:
1. **Safety First**: Always prioritize user safety. Flag emergency symptoms immediately.
2. **Empathy & Support**: Show understanding and compassion in every response.
3. **Evidence-Based**: Provide information based on medical knowledge and best practices.
4. **Clear Communication**: Use simple, jargon-free language that anyone can understand.
5. **Professional Boundaries**: You inform and guide, but never diagnose or replace medical professionals.

⚕️ SAFETY GUIDANCE MODE:
- Identify urgent/emergency symptoms and advise immediate medical attention
- Recognize when professional medical consultation is necessary
- Provide disclaimers about the limitations of AI-based health information
- Encourage users to seek in-person medical care when appropriate
- Never provide specific medical diagnoses or treatment prescriptions

💙 EMPATHETIC RESPONSE STRUCTURE:
1. **Acknowledgment**: Recognize the user's concern or question
2. **Information**: Provide clear, helpful information
3. **Guidance**: Offer actionable next steps
4. **Support**: Reassure and encourage appropriate medical care
5. **Disclaimer**: Remind about AI limitations and the importance of professional care

📋 RESPONSE FORMATTING:
- Use clear headings (**, ##) to structure information
- Break down complex information into digestible bullet points
- Highlight important warnings or red flags with emojis (⚠️, 🚨)
- Keep language warm, supportive, and professional
- Provide context and explanations, not just facts

🔴 EMERGENCY INDICATORS:
Immediately flag these as requiring urgent medical attention:
- Chest pain or pressure
- Difficulty breathing or shortness of breath
- Severe bleeding
- Loss of consciousness
- Sudden severe headache
- Signs of stroke (FAST: Face drooping, Arm weakness, Speech difficulty, Time to call emergency)
- Severe allergic reactions
- Suicidal thoughts or severe mental health crisis

✅ QUALITY STANDARDS:
- Be accurate and up-to-date with medical information
- Admit uncertainty when information is unclear
- Provide balanced perspectives on health topics
- Respect cultural sensitivities and individual circumstances
- Maintain user privacy and confidentiality

Remember: Your goal is to empower users with knowledge while ensuring their safety and encouraging appropriate medical care when needed.`;

// Specific context additions for different features
const SYMPTOM_ANALYSIS_CONTEXT = `
When analyzing symptoms:
- Ask clarifying questions if symptoms are vague
- Consider severity, duration, and progression
- Identify patterns that suggest specific conditions
- Always provide a severity assessment (Low/Medium/High/Emergency)
- List possible conditions but emphasize the need for proper diagnosis
`;

const DRUG_INTERACTION_CONTEXT = `
When checking drug interactions:
- Verify medication names and provide both generic and brand names
- Explain interaction severity levels clearly
- Describe what happens when drugs interact
- Provide practical advice on timing, food interactions, and precautions
- Recommend consulting pharmacist or doctor before making changes
`;

const MEDICAL_TERM_CONTEXT = `
When explaining medical terms:
- Start with a simple, everyday language definition
- Provide context about when/why this term is used
- Use analogies or examples to aid understanding
- Explain related terms if relevant
- Help users understand what they might see on their medical reports
`;

const CHAT_CONTEXT = `
In conversational mode:
- Maintain context from previous messages
- Be conversational yet professional
- Ask follow-up questions when needed
- Provide personalized guidance based on the conversation
- Build trust through consistency and reliability
`;

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

  const prompt = `${BASE_SYSTEM_PROMPT}

${SYMPTOM_ANALYSIS_CONTEXT}

USER'S SYMPTOMS: "${symptoms}"

Please provide a comprehensive analysis with the following structure:

## 🩺 Symptom Analysis

**Acknowledgment**: 
[Acknowledge the user's concerns with empathy]

**Possible Conditions**:
[List 3-5 potential conditions that could explain these symptoms, ordered by likelihood]

**Severity Assessment**: 
- Risk Level: [Low / Medium / High / 🚨 EMERGENCY]
- Urgency: [Can wait for regular appointment / Should see doctor within days / Seek immediate care]

**What You Should Know**:
[Explain what these symptoms might indicate and relevant medical context]

**Recommended Next Steps**:
1. [Specific actionable advice]
2. [When to seek medical care]
3. [What to monitor or track]

**⚠️ Warning Signs** (Seek immediate medical attention if):
- [List red flags specific to these symptoms]

**💙 Supportive Note**:
[Provide reassurance and encourage appropriate medical care]

---
*Remember: This is educational information based on symptom patterns. Only a qualified healthcare provider can provide a proper diagnosis after examining you.*`;

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
    prompt = `${BASE_SYSTEM_PROMPT}

${DRUG_INTERACTION_CONTEXT}

MEDICATION TO ANALYZE: "${drugs[0]}"

Please provide comprehensive information about this medication:

## 💊 Medication Information

**Medication Name**: 
- Generic Name: [name]
- Common Brand Names: [if applicable]

**What It's Used For**:
[Clear explanation of indications and conditions treated]

**How It Works**:
[Simple explanation of mechanism of action]

**Common Dosage**:
[Typical dosing information - remind to follow doctor's prescription]

**Possible Side Effects**:
- **Common** (may affect up to 1 in 10 people): [list]
- **Serious** (require immediate medical attention): [list]

**Important Precautions**:
- Who should NOT take this medication
- Special considerations (pregnancy, breastfeeding, age)
- Activities to avoid (e.g., driving, alcohol)

**Drug Class**: [category]

**💡 What You Should Know**:
[Additional helpful information for safe use]

**⚠️ When to Contact Your Doctor**:
[Specific warning signs to watch for]

---
*Remember: Always take medications exactly as prescribed by your healthcare provider. Never adjust doses without medical guidance.*`;
  } else {
    // Multiple drugs - check for interactions
    prompt = `${BASE_SYSTEM_PROMPT}

${DRUG_INTERACTION_CONTEXT}

MEDICATIONS TO ANALYZE: ${drugs.join(", ")}

Please analyze potential interactions between these medications:

## 💊 Drug Interaction Analysis

**Medications Being Checked**:
${drugs.map((drug, i) => `${i + 1}. ${drug}`).join('\n')}

**Interaction Summary**:
[Clear overview: Are there known interactions? Overall safety assessment]

**Severity Level**: 
🟢 No Known Interactions / 🟡 Minor / 🟠 Moderate / 🔴 Severe / 🚨 Critical

**Detailed Interaction Analysis**:

### Specific Interactions Found:
[For each interaction pair, explain:]
- **What happens**: [Description of the interaction]
- **Why it matters**: [Clinical significance]
- **Risk level**: [Severity]

### Recommendations:
1. [Specific timing advice if applicable]
2. [Monitoring recommendations]
3. [What to watch for]
4. [When to contact healthcare provider]

**Individual Medication Information**:
${drugs.map((drug, i) => `\n**${i + 1}. ${drug}**:\n- Primary use: [brief description]\n- Key considerations: [important notes]`).join('\n')}

**💡 Safe Use Guidelines**:
[Practical advice for taking these medications together]

**⚠️ Important Notes**:
- Take medications exactly as prescribed
- Inform all healthcare providers about all medications you're taking
- Don't stop or change medications without consulting your doctor
- Be aware of food interactions (e.g., grapefruit juice)

**When to Seek Help Immediately**:
[List serious symptoms requiring immediate medical attention]

---
*This analysis is for informational purposes. Always consult your doctor or pharmacist before combining medications or making changes to your regimen.*`;
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

export const validateMedicalTerm = async (term: string): Promise<boolean> => {
  if (!term.trim()) {
    return false;
  }

  const prompt = `Analyze the following input and determine if it is a legitimate medical term, condition, medication, or medical code.

Look for these indicators:
- Medical terminology (diseases, conditions, symptoms)
- Medication names (generic or brand names)
- Medical codes (ICD-10, CPT, NDC)
- Anatomical terms
- Medical procedures or treatments
- Medical abbreviations or acronyms

Respond with ONLY "VALID" if this is a legitimate medical term, or "INVALID" if it is:
- Random numbers or digits
- Gibberish or meaningless text
- Non-medical words
- Common everyday words unrelated to medicine

INPUT TO ANALYZE: ${term}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text().trim().toUpperCase();
    return response.includes('VALID') && !response.includes('INVALID');
  } catch (error) {
    console.error("Error validating medical term:", error);
    return false;
  }
};

export const explainMedicalTerm = async (term: string) => {
  if (!term.trim()) {
    throw new Error("Please enter a medical term to explain.");
  }

  const prompt = `${BASE_SYSTEM_PROMPT}

${MEDICAL_TERM_CONTEXT}

MEDICAL TERM TO EXPLAIN: "${term}"

Please provide a comprehensive yet accessible explanation:

## 📚 Medical Term Explanation

**Term**: ${term}

**Simple Definition**:
[Explain in everyday language that anyone can understand]

**Medical Context**:
[When and why healthcare professionals use this term]

**Breaking It Down**:
[If the term has Greek/Latin roots, explain the word parts if helpful]

**Related Terms**:
[List 2-3 similar or related medical terms]

**Real-World Example**:
"You might see this term on your medical report like this: [example usage]"

**What It Means For You**:
[Explain the practical implications or what someone should know if they encounter this term]

**💡 Quick Analogy**:
[If applicable, use a simple analogy to make the concept clearer]

**Common Questions**:
- [Anticipate and answer 1-2 common questions about this term]

---
*Understanding medical terminology helps you be an active participant in your healthcare. Don't hesitate to ask your healthcare provider to explain terms you don't understand.*`;

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

  const prompt = `${BASE_SYSTEM_PROMPT}

You are analyzing a medical report. Provide a clear, patient-friendly summary that helps them understand their health information.

MEDICAL REPORT CONTENT:
${report}

Please provide a comprehensive summary:

## 📋 Medical Report Summary

**Report Type**: [Identify the type of report - lab results, imaging, consultation notes, etc.]

**Key Findings**:
[List the most important findings in simple language]

**Test Results Breakdown**:
[For each significant test/measurement:]
- **Test Name**: [Result] ([Normal range])
  - What this means: [Simple explanation]
  - Status: ✅ Normal / ⚠️ Slightly abnormal / 🔴 Requires attention

**Overall Assessment**:
[Summarize what the report indicates about the patient's health]

**Important Observations**:
- [Highlight any significant patterns or concerns]
- [Note any improvements or changes from previous reports if mentioned]

**Medical Terms Explained**:
[Define any technical terms used in the report]

**What You Should Know**:
[Put findings in context - what do they mean for daily life?]

**Recommended Follow-up**:
[Based on the report, what follow-up might be needed?]

**Questions to Ask Your Doctor**:
1. [Suggest relevant questions based on the findings]
2. [Help patient prepare for their next appointment]

**💙 Important Reminder**:
This summary is to help you understand your report. Always discuss results with your healthcare provider who can provide personalized medical advice based on your complete health history.

---
*This AI-generated summary should not replace consultation with your healthcare provider.*`;

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

  const prompt = `${BASE_SYSTEM_PROMPT}

${CHAT_CONTEXT}

USER'S QUESTION: "${message}"

Please provide a helpful, empathetic response following these guidelines:

1. **Acknowledge** the user's question or concern
2. **Provide Information** in clear, accessible language
3. **Offer Guidance** with actionable next steps if applicable
4. **Include Safety Warnings** if the topic involves risks or requires medical attention
5. **End with Support** - encourage appropriate care and remind of AI limitations

Structure your response with:
- Clear paragraphs for readability
- Bullet points for lists or steps
- Use emojis sparingly to highlight key points (⚠️ for warnings, 💡 for tips, 💙 for support)
- Keep tone warm, professional, and supportive

If the question involves symptoms, potential conditions, or medical decisions, always remind the user to consult with healthcare professionals.

For general health/wellness questions, provide evidence-based information while encouraging healthy lifestyle choices.`;

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

// Enhanced streaming chat system prompt with safe guidance
const SYSTEM_PROMPT = `${BASE_SYSTEM_PROMPT}

${CHAT_CONTEXT}

STREAMING CHAT MODE - Additional Guidelines:
- Maintain conversation context and refer back to previous messages when relevant
- Keep responses conversational yet informative (aim for 150-250 words unless detailed explanation requested)
- Use a friendly, supportive tone that builds trust
- Ask clarifying questions when user input is vague or ambiguous
- Recognize emotional cues and respond with appropriate empathy
- For complex topics, break information into digestible chunks
- Always prioritize safety - flag emergencies and serious concerns immediately
- Provide balanced information without causing unnecessary alarm
- Encourage healthy behaviors and preventive care
- Be honest about AI limitations and when human medical expertise is needed

Remember: You're having a conversation with a real person seeking health guidance. Be present, be helpful, and be safe.`;

// STREAMING RESPONSE - Shows response as it's generated (feels faster!)
export async function* streamAIResponse(
  userMessage: string,
  conversationHistory: Message[] = []
): AsyncGenerator<string, void, unknown> {
  try {
    // Reset cancellation flag
    shouldCancelStream = false;
    
    const context = buildContext(conversationHistory);
    const prompt = `${SYSTEM_PROMPT}\n\nConversation History:\n${context}\n\nUser: ${userMessage}\n\nAssistant:`;

    const result = await model.generateContentStream(prompt);

    for await (const chunk of result.stream) {
      // Check if cancellation was requested
      if (shouldCancelStream) {
        shouldCancelStream = false; // Reset flag
        throw new Error("Request cancelled by user");
      }
      
      const chunkText = chunk.text();
      yield chunkText;
    }
  } catch (error: any) {
    console.error("Gemini API Streaming Error:", error);
    if (error.message === "Request cancelled by user") {
      throw error; // Re-throw cancellation error
    }
    throw new Error("Failed to stream response from AI");
  }
}

// Cancel current request
let currentController: AbortController | null = null;
let shouldCancelStream = false;

export function cancelCurrentRequest() {
  shouldCancelStream = true;
  if (currentController) {
    currentController.abort();
    currentController = null;
  }
}

export const validateMedicalImage = async (
  imageBase64: string
): Promise<{ isValid: boolean; message: string; imageType?: string }> => {
  if (!imageBase64) {
    return { isValid: false, message: "No image provided" };
  }

  const prompt = `You are an expert medical image validator. Analyze the provided image and determine if it is a legitimate MEDICAL IMAGE.

VALID medical images include:
- X-rays (chest, bone, dental, etc.)
- CT scans (computed tomography)
- MRI scans (magnetic resonance imaging)
- Ultrasound images
- ECG/EKG (electrocardiogram) charts
- Mammograms
- PET scans
- Endoscopy images
- Pathology slides/microscopy
- Medical charts with diagnostic data
- DICOM medical images

INVALID (NON-MEDICAL) images include:
- Regular photographs (landscapes, people, selfies)
- Screenshots of applications or websites
- Memes, cartoons, or illustrations
- Tech/coding related images
- General graphics or design images
- Food photos
- Nature or landscape photos
- Any non-medical content

Respond in JSON format ONLY:
{
  "isValid": true/false,
  "confidence": 0-100,
  "detectedType": "X-Ray/CT/MRI/Ultrasound/ECG/Photo/Screenshot/Illustration/etc.",
  "reason": "Brief explanation of why it is or isn't a medical image"
}

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

    const validation = JSON.parse(cleanedResponse);

    if (validation.isValid && validation.confidence >= 70) {
      return {
        isValid: true,
        message: `Medical image detected: ${validation.detectedType}`,
        imageType: validation.detectedType,
      };
    } else {
      return {
        isValid: false,
        message: `This doesn't appear to be a medical image. Detected: ${validation.detectedType}. ${validation.reason}`,
      };
    }
  } catch (error) {
    console.error("Error validating medical image:", error);
    // In case of API error, allow the image but log the issue
    return {
      isValid: true,
      message: "Unable to validate image type, proceeding with analysis",
    };
  }
};

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

export const validateMedicineImage = async (
  imageBase64: string
): Promise<{ isValid: boolean; message: string; medicineType?: string }> => {
  if (!imageBase64) {
    return { isValid: false, message: "No image provided" };
  }

  const prompt = `You are an expert pharmaceutical image validator. Analyze the provided image and determine if it contains legitimate MEDICINE or PHARMACEUTICAL PRODUCTS.

VALID medicine images include:
- Medicine tablets, capsules, or pills
- Medicine bottles or containers
- Medicine packaging or boxes with drug information
- Prescription medication labels
- Medicine strips or blister packs
- Syringes with medication
- Medicine vials or ampoules
- Over-the-counter medicine packages
- Pharmaceutical products with visible branding/labels

INVALID (NON-MEDICINE) images include:
- Random objects (toys, food, electronics, furniture)
- People, animals, or nature scenes
- Screenshots of applications or websites
- Memes, cartoons, or illustrations
- Documents or text without medicine
- Medical equipment (not medicine itself)
- Unclear or blurry images where medicine cannot be identified
- Any non-pharmaceutical content

Respond in JSON format ONLY:
{
  "isValid": true/false,
  "confidence": 0-100,
  "detectedType": "Tablets/Capsules/Bottle/Packaging/Blister Pack/Photo/Screenshot/etc.",
  "reason": "Brief explanation of why it is or isn't a medicine image"
}

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

    const validation = JSON.parse(cleanedResponse);

    if (validation.isValid && validation.confidence >= 70) {
      return {
        isValid: true,
        message: `Medicine detected: ${validation.detectedType}`,
        medicineType: validation.detectedType,
      };
    } else {
      return {
        isValid: false,
        message: `This doesn't appear to be a medicine image. Detected: ${validation.detectedType}. ${validation.reason}`,
      };
    }
  } catch (error) {
    console.error("Error validating medicine image:", error);
    // In case of API error, allow the image but log the issue
    return {
      isValid: true,
      message: "Unable to validate image type, proceeding with analysis",
    };
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
