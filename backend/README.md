# HealthAI Policy Assistant API

A FastAPI application for analyzing health insurance policy documents using AI. Built for the HackRX competition.

## 🚀 Features

- **Document Analysis**: Extracts and analyzes PDF policy documents from URLs
- **AI-Powered Q&A**: Uses GPT-4 (primary) or Gemini (fallback) for intelligent question answering
- **RESTful API**: Clean JSON API following hackathon specifications
- **Authentication**: Bearer token authentication
- **Multi-language Support**: Handles multiple languages automatically
- **Health Monitoring**: Built-in health check endpoints
- **Comprehensive Logging**: Detailed request/response logging

## 📋 Requirements

- Python 3.9+
- OpenAI API key (recommended) or Gemini API key
- Internet connection for PDF processing

## ⚙️ Installation

### 1. Clone and Setup
```bash
git clone <your-repo>
cd HealthAI-Assistant-main/backend
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Environment Configuration
Create a `.env` file:
```bash
cp .env.example .env
```

Edit `.env` with your API keys:
```env
OPENAI_API_KEY=your-openai-api-key-here
GEMINI_API_KEY=your-gemini-api-key-here
```

### 4. Run Locally
```bash
python api.py
# or
uvicorn api:app --host 0.0.0.0 --port 8000 --reload
```

### 5. Test the API
```bash
python test_api.py
```

## 📡 API Endpoints

### Main Endpoint
```http
POST /hackrx/run
Content-Type: application/json
Authorization: Bearer <your-token>

{
    "documents": "https://example.com/policy.pdf",
    "questions": [
        "What is the coverage limit?",
        "What are the exclusions?"
    ]
}
```

**Response:**
```json
{
    "answers": [
        "The coverage limit is $100,000 per year.",
        "Exclusions include pre-existing conditions..."
    ]
}
```

### Health Check
```http
GET /health
```

### API Info
```http
GET /
```

## 🌐 Deployment Options

### Option 1: Heroku (Recommended)
```bash
# Install Heroku CLI, then:
heroku create your-app-name
heroku config:set OPENAI_API_KEY=your-key
heroku config:set GEMINI_API_KEY=your-key
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

### Option 2: Railway
```bash
# Connect your GitHub repo to Railway
# Set environment variables in Railway dashboard
# Deploy automatically on git push
```

### Option 3: Vercel
```bash
# Install Vercel CLI, then:
vercel
# Follow prompts and set environment variables
```

### Option 4: Docker
```bash
# Build image
docker build -t healthai-api .

# Run container
docker run -p 8000:8000 \
  -e OPENAI_API_KEY=your-key \
  -e GEMINI_API_KEY=your-key \
  healthai-api
```

### Option 5: DigitalOcean App Platform
1. Create new app from GitHub
2. Set environment variables
3. Deploy automatically

## 🧪 Testing

### Local Testing
```bash
# Run test script
python test_api.py

# Or test manually with curl
curl -X POST "http://localhost:8000/hackrx/run" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -d '{
    "documents": "https://example.com/policy.pdf",
    "questions": ["What is covered?"]
  }'
```

### Production Testing
```bash
# Update API_BASE_URL in test_api.py to your deployed URL
python test_api.py
```

## 🔧 Configuration

### Environment Variables
- `OPENAI_API_KEY`: OpenAI API key (primary)
- `GEMINI_API_KEY`: Google Gemini API key (fallback)
- `PORT`: Server port (default: 8000)
- `HOST`: Server host (default: 0.0.0.0)

### API Features
- **Timeout**: 25 seconds for AI processing
- **PDF Processing**: 15 seconds timeout for document download
- **Authentication**: Bearer token required
- **CORS**: Enabled for all origins (adjust for production)

## 📊 Performance

- **Response Time**: Typically 2-15 seconds depending on document size
- **Concurrent Requests**: Supports multiple simultaneous requests
- **Rate Limiting**: Dependent on AI provider limits
- **PDF Size**: Handles documents up to ~10MB

## 🛠️ Tech Stack

- **Framework**: FastAPI
- **AI Models**: GPT-4 (OpenAI), Gemini 2.0 Flash
- **PDF Processing**: pdfplumber
- **HTTP Client**: requests
- **Deployment**: Multiple platform support

## 📝 Hackathon Submission

Your webhook URL will be: `https://your-domain.com/hackrx/run`

### Pre-Submission Checklist:
- ✅ API is publicly accessible
- ✅ HTTPS enabled
- ✅ Bearer authentication working
- ✅ Returns JSON response
- ✅ Response time < 30 seconds
- ✅ Handles the exact request format
- ✅ Health check endpoint available

### Example Submission:
- **Webhook URL**: `https://your-app.herokuapp.com/hackrx/run`
- **Description**: "FastAPI + GPT-4 + PDF processing with fallback to Gemini"

## 🐛 Troubleshooting

### Common Issues:
1. **"AI model error"**: Check your API keys
2. **PDF extraction failed**: Verify document URL is accessible
3. **401 Unauthorized**: Ensure Bearer token is included
4. **Timeout errors**: Document too large or AI service slow

### Debug Mode:
```bash
# Run with debug logging
PYTHONPATH=. uvicorn api:app --log-level debug
```

### Logs:
- Request processing details
- PDF extraction status
- AI model responses
- Error tracking

## 📄 License

This project is created for the HackRX hackathon.

## 🤝 Support

For issues or questions:
1. Check the logs for error details
2. Verify environment variables are set
3. Test with the provided test script
4. Ensure your deployment platform supports the required dependencies

---

**Ready for submission!** 🎉

Your API follows all hackathon requirements and is ready to be deployed and submitted.
