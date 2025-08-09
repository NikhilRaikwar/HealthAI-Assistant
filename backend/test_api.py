#!/usr/bin/env python3
"""
Test script for the HealthAI Policy Assistant API
"""
import requests
import json
import sys

# Configuration
API_BASE_URL = "http://localhost:8000"  # Change this to your deployed URL
TEST_BEARER_TOKEN = "test-token-123"  # Use your actual bearer token

# Test document URL from hackathon
TEST_DOCUMENT_URL = "https://hackrx.blob.core.windows.net/assets/policy.pdf?sv=2023-01-03&st=2025-07-04T09%3A11%3A24Z&se=2027-07-05T09%3A11%3A00Z&sr=b&sp=r&sig=N4a9OU0w0QXO6AOIBiu4bpl7AXvEZogeT%2FjUHNO7HzQ%3D"

# Test questions from hackathon
TEST_QUESTIONS = [
    "What is the grace period for premium payment under the National Parivar Mediclaim Plus Policy?",
    "What is the waiting period for pre-existing diseases (PED) to be covered?",
    "Does this policy cover maternity expenses, and what are the conditions?",
]

def test_health_endpoint():
    """Test the health check endpoint"""
    print("🩺 Testing health endpoint...")
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data['status']}")
            print(f"   Gemini configured: {data.get('gemini_configured', False)}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_hackrx_endpoint():
    """Test the main /hackrx/run endpoint"""
    print("\n🚀 Testing /hackrx/run endpoint...")
    
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": f"Bearer {TEST_BEARER_TOKEN}"
    }
    
    payload = {
        "documents": TEST_DOCUMENT_URL,
        "questions": TEST_QUESTIONS
    }
    
    try:
        print(f"📤 Sending request with {len(TEST_QUESTIONS)} questions...")
        response = requests.post(
            f"{API_BASE_URL}/hackrx/run",
            headers=headers,
            json=payload,
            timeout=60  # Increased timeout for AI processing
        )
        
        if response.status_code == 200:
            data = response.json()
            answers = data.get("answers", [])
            
            print(f"✅ Request successful! Got {len(answers)} answers")
            print(f"⏱️  Response time: {response.elapsed.total_seconds():.2f}s")
            
            # Display answers
            for i, (question, answer) in enumerate(zip(TEST_QUESTIONS, answers), 1):
                print(f"\n📝 Question {i}: {question}")
                print(f"💡 Answer {i}: {answer[:200]}..." if len(answer) > 200 else f"💡 Answer {i}: {answer}")
            
            return True
        else:
            print(f"❌ Request failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return False

def test_authentication():
    """Test authentication requirements"""
    print("\n🔐 Testing authentication...")
    
    # Test without Bearer token
    payload = {
        "documents": TEST_DOCUMENT_URL,
        "questions": ["Test question"]
    }
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/hackrx/run",
            headers={"Content-Type": "application/json"},
            json=payload,
            timeout=10
        )
        
        if response.status_code == 401:
            print("✅ Authentication correctly required (401 without token)")
            return True
        else:
            print(f"❌ Authentication test failed: Expected 401, got {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Authentication test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Starting API Tests for HealthAI Policy Assistant")
    print("=" * 60)
    
    # Check if server is running
    print(f"🌐 Testing API at: {API_BASE_URL}")
    
    tests_passed = 0
    total_tests = 3
    
    # Run tests
    if test_health_endpoint():
        tests_passed += 1
    
    if test_authentication():
        tests_passed += 1
        
    if test_hackrx_endpoint():
        tests_passed += 1
    
    # Summary
    print("\n" + "=" * 60)
    print(f"📊 Test Results: {tests_passed}/{total_tests} tests passed")
    
    if tests_passed == total_tests:
        print("🎉 All tests passed! Your API is ready for submission!")
        return 0
    else:
        print("⚠️  Some tests failed. Please check your API configuration.")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
