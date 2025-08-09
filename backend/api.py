import os
import io
import re
import requests
import time
import logging
from fastapi import FastAPI, Request, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from pydantic import BaseModel
from typing import List, Optional
import pdfplumber

# --- Load .env automatically ---
from dotenv import load_dotenv
load_dotenv()

# --- OpenAI Client ---
from openai import OpenAI

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- API Keys ---
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Initialize OpenAI client
openai_client = None
if OPENAI_API_KEY:
    openai_client = OpenAI(api_key=OPENAI_API_KEY)

# --- FastAPI app setup ---
app = FastAPI(
    title="HealthAI Policy Assistant",
    description="API for analyzing health insurance policy documents",
    version="1.0.0"
)
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

class WebhookEvent(BaseModel):
    event_type: str
    timestamp: str
    data: dict
    source: Optional[str] = None

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
        
        extracted_text = []
        with pdfplumber.open(io.BytesIO(resp.content)) as pdf:
            for page_num, page in enumerate(pdf.pages, 1):
                # Extract text with better formatting
                page_text = page.extract_text()
                if page_text:
                    # Clean and structure the text
                    page_text = clean_extracted_text(page_text)
                    extracted_text.append(f"--- PAGE {page_num} ---\n{page_text}")
                
                # Also try to extract tables if present
                tables = page.extract_tables()
                if tables:
                    for table_num, table in enumerate(tables, 1):
                        table_text = format_table_as_text(table)
                        extracted_text.append(f"--- PAGE {page_num} TABLE {table_num} ---\n{table_text}")
        
        full_text = "\n\n".join(extracted_text)
        if not full_text.strip():
            raise ValueError("No text extracted from PDF.")
        
        return full_text
    except Exception as e:
        raise RuntimeError(f"PDF extraction failed: {e}")

def clean_extracted_text(text: str) -> str:
    """Clean and normalize extracted text"""
    # Remove excessive whitespace while preserving structure
    lines = text.split('\n')
    cleaned_lines = []
    
    for line in lines:
        line = line.strip()
        if line:  # Skip empty lines
            # Normalize spacing
            line = re.sub(r'\s+', ' ', line)
            cleaned_lines.append(line)
    
    return '\n'.join(cleaned_lines)

def format_table_as_text(table: list) -> str:
    """Format table data as structured text"""
    if not table:
        return ""
    
    formatted_rows = []
    for row in table:
        if row and any(cell for cell in row if cell):  # Skip empty rows
            row_text = " | ".join(str(cell or "").strip() for cell in row)
            if row_text.strip(" |"):
                formatted_rows.append(row_text)
    
    return "\n".join(formatted_rows)

def extract_relevant_sections(query: str, policy_text: str) -> str:
    """Extract most relevant sections from policy text based on query"""
    query_lower = query.lower()
    
    # Define keyword mappings for better context extraction
    keyword_mappings = {
        'grace period': ['grace period', 'premium payment', 'due date', 'renewal'],
        'waiting period': ['waiting period', 'pre-existing', 'PED', 'coverage'],
        'maternity': ['maternity', 'childbirth', 'pregnancy', 'delivery'],
        'cataract': ['cataract', 'surgery', 'eye', 'ophthalmology'],
        'organ donor': ['organ donor', 'transplant', 'harvesting', 'donation'],
        'no claim discount': ['no claim discount', 'NCD', 'bonus', 'renewal discount'],
        'health check': ['health check', 'preventive', 'medical examination'],
        'hospital': ['hospital', 'institution', 'inpatient', 'nursing'],
        'ayush': ['ayush', 'ayurveda', 'homeopathy', 'unani', 'yoga'],
        'room rent': ['room rent', 'ICU', 'charges', 'daily', 'sub-limit']
    }
    
    # Find relevant keywords
    relevant_keywords = []
    for category, keywords in keyword_mappings.items():
        if any(keyword in query_lower for keyword in keywords):
            relevant_keywords.extend(keywords)
    
    # If no specific keywords found, use all text
    if not relevant_keywords:
        return policy_text
    
    # Extract relevant sections
    lines = policy_text.split('\n')
    relevant_lines = []
    
    for i, line in enumerate(lines):
        line_lower = line.lower()
        if any(keyword in line_lower for keyword in relevant_keywords):
            # Include context around relevant lines
            start = max(0, i - 2)
            end = min(len(lines), i + 3)
            relevant_lines.extend(lines[start:end])
    
    # Remove duplicates while preserving order
    seen = set()
    unique_lines = []
    for line in relevant_lines:
        if line not in seen:
            seen.add(line)
            unique_lines.append(line)
    
    relevant_text = '\n'.join(unique_lines)
    
    # If relevant text is too short, include more context
    if len(relevant_text) < 1000:
        return policy_text[:5000]  # First 5000 chars as fallback
    
    return relevant_text

def query_with_openai(query: str, policy_text: str) -> str:
    """Query policy document using OpenAI GPT-4 for improved accuracy"""
    if not openai_client:
        return "OpenAI API key not configured on server."
    
    system_prompt = """You are an expert insurance policy analyst with 20+ years of experience. 
    Your task is to provide precise, factual answers based ONLY on the information contained in the policy document.
    
    CRITICAL INSTRUCTIONS:
    1. Read the entire policy document carefully
    2. Find the EXACT information that answers the question
    3. Quote specific sections, clauses, page numbers, or references when available
    4. If information is not explicitly stated, clearly say "This information is not specified in the policy document"
    5. Include relevant policy section numbers, clause references, or page numbers
    6. Be extremely precise with amounts, percentages, time periods, and conditions
    7. Identify any conditions, exceptions, or limitations that apply
    8. Use direct quotes from the policy when relevant
    
    RESPONSE FORMAT:
    - Start with a direct answer
    - Provide specific policy references (section/clause/page)
    - Include exact quotes when applicable
    - Note any conditions or exceptions
    - End with confidence level if uncertain"""
    
    user_prompt = f"""POLICY DOCUMENT:
{policy_text}

===

QUESTION: {query}

Provide a comprehensive, accurate answer based strictly on the policy document content above."""
    
    try:
        logger.info(f"Querying OpenAI GPT-4 Turbo for: {query[:100]}...")
        
        response = openai_client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.1,  # Low but not zero for some creativity
            max_tokens=1500,  # Allow longer, detailed responses
            top_p=0.9,
            frequency_penalty=0,
            presence_penalty=0,
            timeout=30
        )
        
        if response.choices and response.choices[0].message:
            answer = response.choices[0].message.content.strip()
            logger.info(f"OpenAI response length: {len(answer)} characters")
            return answer
        
        return "No valid response from OpenAI GPT-4"
        
    except Exception as e:
        logger.error(f"OpenAI API error: {e}")
        # Fallback to Gemini if OpenAI fails
        logger.info("Falling back to Gemini AI")
        return query_with_gemini_fallback(query, policy_text)

def query_with_gemini_fallback(query: str, policy_text: str) -> str:
    """Fallback query using Gemini AI when OpenAI fails"""
    if not GEMINI_API_KEY:
        return "Both OpenAI and Gemini API keys not configured."
    
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent"
    headers = {"Content-Type": "application/json"}
    params = {"key": GEMINI_API_KEY}
    
    prompt = f"""You are an expert insurance policy analyst. Your task is to provide precise, factual answers based ONLY on the information contained in the policy document.

INSTRUCTIONS:
1. Read the policy document carefully
2. Find the exact information that answers the question
3. Quote specific sections, clauses, or numbers when available
4. If the information is not explicitly stated in the document, say so
5. Include relevant policy section numbers or references
6. Be precise with amounts, percentages, time periods, and conditions

POLICY DOCUMENT:
{policy_text}

QUESTION: {query}

Provide a detailed, accurate answer based strictly on the policy document content. Include:
- Exact amounts, percentages, or time periods mentioned
- Relevant section/clause references
- Any conditions or exceptions that apply
- Direct quotes from the policy when relevant

ANSWER:"""
    
    data = {
        "contents": [{
            "parts": [{
                "text": prompt
            }]
        }],
        "generationConfig": {
            "temperature": 0.1,
            "maxOutputTokens": 1200,
            "topP": 0.8,
            "topK": 10,
            "stopSequences": [],
            "candidateCount": 1
        },
        "safetySettings": [
            {
                "category": "HARM_CATEGORY_HARASSMENT",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                "category": "HARM_CATEGORY_HATE_SPEECH",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
            }
        ]
    }
    
    try:
        response = requests.post(url, headers=headers, params=params, json=data, timeout=30)
        response.raise_for_status()
        result = response.json()
        
        if "candidates" in result and len(result["candidates"]) > 0:
            content = result["candidates"][0]["content"]
            if "parts" in content and len(content["parts"]) > 0:
                return content["parts"][0]["text"].strip()
        
        return "No valid response from Gemini AI"
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Gemini API request error: {e}")
        return f"AI model request error: {e}"
    except Exception as e:
        logger.error(f"Gemini API error: {e}")
        return f"AI model error: {e}"

def query_policy_document(query: str, policy_text: str) -> str:
    """Main query function - tries OpenAI first, falls back to Gemini"""
    return query_with_openai(query, policy_text)

# --- Health Check Endpoints ---
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "version": "2.0.0",
        "openai_configured": bool(OPENAI_API_KEY),
        "gemini_configured": bool(GEMINI_API_KEY),
        "primary_model": "OpenAI GPT-4 Turbo" if OPENAI_API_KEY else "Gemini 2.0 Flash",
        "fallback_available": bool(OPENAI_API_KEY and GEMINI_API_KEY)
    }

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "HealthAI Policy Assistant API",
        "version": "1.0.0",
        "endpoints": {
            "main": "/hackrx/run",
            "health": "/health",
            "docs": "/docs",
            "webhooks": {
                "railway": "/webhook/railway",
                "generic": "/webhook/generic",
                "test": "/webhook/test"
            }
        }
    }

@app.post("/hackrx/run", response_model=PolicyQueryResponse)
async def hackrx_run(
    request: Request,
    body: PolicyQueryRequest,
):
    start_time = time.time()
    
    # --- Bearer Auth ---
    auth = request.headers.get("authorization")
    if not auth or not auth.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing Bearer token")
    
    logger.info(f"Processing request with {len(body.questions)} questions")
    
    # --- PDF Extraction ---
    try:
        policy_text = extract_pdf_text_from_url(body.documents)
        logger.info(f"Successfully extracted PDF text ({len(policy_text)} characters)")
    except Exception as e:
        logger.error(f"PDF extraction failed: {e}")
        return JSONResponse(
            status_code=400,
            content={"answers": [f"Error extracting PDF: {str(e)}" for _ in body.questions]}
        )

    # --- AI Model Call ---
    answers = []
    for i, q in enumerate(body.questions):
        logger.info(f"Processing question {i+1}/{len(body.questions)}: {q[:100]}...")
        try:
            # Extract relevant sections for better context
            relevant_text = extract_relevant_sections(q, policy_text)
            logger.info(f"Extracted {len(relevant_text)} characters of relevant text for question {i+1}")
            
            # Query with focused context
            answer = query_policy_document(q, relevant_text)
            answers.append(answer)
        except Exception as e:
            logger.error(f"Error processing question {i+1}: {e}")
            answers.append(f"Error processing question: {str(e)}")
    
    processing_time = time.time() - start_time
    logger.info(f"Request completed in {processing_time:.2f} seconds")
    
    return {"answers": answers}

# --- Webhook Endpoints ---
@app.post("/webhook/railway")
async def railway_webhook(request: Request):
    """Handle Railway deployment webhooks"""
    try:
        # Get the raw body for signature verification if needed
        body = await request.body()
        
        # Parse JSON payload
        payload = await request.json()
        
        # Log the webhook event
        logger.info(f"Railway webhook received: {payload.get('type', 'unknown')}")
        
        # Process different webhook events
        event_type = payload.get('type')
        
        if event_type == 'DEPLOY_START':
            logger.info(f"Deployment started for project: {payload.get('project', {}).get('name')}")
        elif event_type == 'DEPLOY_SUCCESS':
            logger.info(f"Deployment succeeded for project: {payload.get('project', {}).get('name')}")
        elif event_type == 'DEPLOY_FAILED':
            logger.error(f"Deployment failed for project: {payload.get('project', {}).get('name')}")
        
        # You can add custom logic here like:
        # - Sending notifications
        # - Updating database
        # - Triggering other services
        
        return {"status": "ok", "message": "Webhook processed successfully"}
        
    except Exception as e:
        logger.error(f"Webhook processing error: {e}")
        raise HTTPException(status_code=400, detail=f"Webhook processing failed: {str(e)}")

@app.post("/webhook/generic")
async def generic_webhook(request: Request, event: WebhookEvent):
    """Generic webhook endpoint for custom events"""
    try:
        # Get request headers for potential signature verification
        headers = dict(request.headers)
        
        logger.info(f"Generic webhook received: {event.event_type} from {event.source}")
        
        # Process the webhook event
        if event.event_type == "user_action":
            # Handle user actions
            logger.info(f"User action: {event.data}")
        elif event.event_type == "system_update":
            # Handle system updates
            logger.info(f"System update: {event.data}")
        elif event.event_type == "alert":
            # Handle alerts
            logger.warning(f"Alert received: {event.data}")
        
        # Custom processing logic here
        response_data = {
            "status": "received",
            "event_type": event.event_type,
            "processed_at": time.time(),
            "source": event.source
        }
        
        return response_data
        
    except Exception as e:
        logger.error(f"Generic webhook error: {e}")
        raise HTTPException(status_code=400, detail=f"Webhook processing failed: {str(e)}")

@app.get("/webhook/test")
async def test_webhook():
    """Test endpoint to verify webhook functionality"""
    return {
        "message": "Webhook endpoint is working",
        "timestamp": time.time(),
        "endpoints": {
            "railway": "/webhook/railway",
            "generic": "/webhook/generic",
            "test": "/webhook/test"
        }
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("api:app", host="0.0.0.0", port=port, reload=True)
