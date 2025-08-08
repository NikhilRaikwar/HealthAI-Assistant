import os
import io
import re
import requests
from fastapi import FastAPI, Request, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from pydantic import BaseModel
from typing import List
import pdfplumber

# --- Load .env automatically ---
from dotenv import load_dotenv
load_dotenv()

# --- Gemini API Key (set this in your environment or .env file as GEMINI_API_KEY) ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")  # <-- Insert your Gemini API key here

# --- FastAPI app setup ---
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
bearer_scheme = HTTPBearer()

class PolicyQueryRequest(BaseModel):
    documents: str
    questions: List[str]

class PolicyQueryResponse(BaseModel):
    answers: List[str]

def detect_language(text: str) -> str:
    if re.search(r'[\u4E00-\u9FFF]', text):
        return "zh"
    if re.search(r'[\u3040-\u309F\u30A0-\u30FF]', text):
        return "ja"
    if re.search(r'[\uAC00-\uD7AF\u1100-\u11FF]', text):
        return "ko"
    if re.search(r'[\u0600-\u06FF]', text):
        return "ar"
    if re.search(r'[\u0900-\u097F]', text):
        return "hi"
    return "en"

def get_prompt_in_language(prompt: str, input_text: str) -> str:
    lang = detect_language(input_text)
    if lang == "zh":
        return f"作为医疗AI助手，{prompt}"
    if lang == "ja":
        return f"医療AIアシスタントとして、{prompt}"
    if lang == "ko":
        return f"의료 AI 보조자로서, {prompt}"
    if lang == "ar":
        return f"كمساعد طبي ذكي، {prompt}"
    if lang == "hi":
        return f"एक चिकित्सा AI सहायक के रूप में, {prompt}"
    return f"As a medical AI assistant, {prompt}"

def extract_pdf_text_from_url(pdf_url: str) -> str:
    try:
        resp = requests.get(pdf_url, timeout=15)
        resp.raise_for_status()
        with pdfplumber.open(io.BytesIO(resp.content)) as pdf:
            text = "\n".join(page.extract_text() or "" for page in pdf.pages)
        if not text.strip():
            raise ValueError("No text extracted from PDF.")
        return text
    except Exception as e:
        raise RuntimeError(f"PDF extraction failed: {e}")

def query_policy_document_gemini(query: str, policy_text: str) -> str:
    if not GEMINI_API_KEY:
        return "Gemini API key not set on server."
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
    headers = {"Content-Type": "application/json"}
    params = {"key": GEMINI_API_KEY}
    prompt = f"""You are an expert policy analysis assistant. Analyze the following policy document and answer the user's query with detailed information.

POLICY DOCUMENT:
{policy_text}

USER QUERY: {query}

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

Format your response in a clear, structured manner with proper headings and bullet points where appropriate."""
    prompt = get_prompt_in_language(prompt, query)
    data = {
        "contents": [{"parts": [{"text": prompt}]}]
    }
    try:
        resp = requests.post(url, headers=headers, params=params, json=data, timeout=30)
        resp.raise_for_status()
        result = resp.json()
        return result["candidates"][0]["content"]["parts"][0]["text"].strip()
    except Exception as e:
        return f"AI model error: {e}"

@app.post("/hackrx/run", response_model=PolicyQueryResponse)
async def hackrx_run(
    request: Request,
    body: PolicyQueryRequest,
):
    # --- Bearer Auth ---
    auth = request.headers.get("authorization")
    if not auth or not auth.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing Bearer token")
    # Optionally: validate token here

    # --- PDF Extraction ---
    try:
        policy_text = extract_pdf_text_from_url(body.documents)
    except Exception as e:
        return JSONResponse(
            status_code=400,
            content={"answers": [f"Error: {str(e)}"]}
        )

    # --- AI Model Call ---
    answers = []
    for q in body.questions:
        answer = query_policy_document_gemini(q, policy_text)
        answers.append(answer)

    return {"answers": answers}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)