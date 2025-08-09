#!/usr/bin/env python3
"""
Simple test to verify OpenAI API key is working
"""
import os
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

def test_openai_connection():
    """Test OpenAI API connection"""
    print("🔑 Testing OpenAI API Key...")
    print(f"API Key (first 20 chars): {OPENAI_API_KEY[:20]}...")
    
    if not OPENAI_API_KEY:
        print("❌ OpenAI API key not found in environment variables")
        return False
    
    try:
        # Initialize OpenAI client
        client = OpenAI(api_key=OPENAI_API_KEY)
        
        # Test with a simple query
        print("🧪 Making test API call...")
        response = client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": "Say 'Hello, this is a test!' and nothing more."}
            ],
            max_tokens=20,
            temperature=0
        )
        
        if response.choices and response.choices[0].message:
            answer = response.choices[0].message.content
            print(f"✅ OpenAI API test successful!")
            print(f"Response: {answer}")
            
            # Test token usage
            usage = response.usage
            if usage:
                print(f"📊 Token usage:")
                print(f"   Input tokens: {usage.prompt_tokens}")
                print(f"   Output tokens: {usage.completion_tokens}")
                print(f"   Total tokens: {usage.total_tokens}")
                
                # Estimate cost (GPT-4 Turbo pricing)
                input_cost = (usage.prompt_tokens / 1000) * 0.01
                output_cost = (usage.completion_tokens / 1000) * 0.03
                total_cost = input_cost + output_cost
                print(f"💰 Estimated cost: ${total_cost:.6f}")
            
            return True
        else:
            print("❌ No response from OpenAI")
            return False
            
    except Exception as e:
        print(f"❌ OpenAI API test failed: {e}")
        return False

def test_model_availability():
    """Test available models"""
    print("\n🔍 Testing model availability...")
    
    try:
        client = OpenAI(api_key=OPENAI_API_KEY)
        models = client.models.list()
        
        # Check if GPT-4 Turbo is available
        available_models = [model.id for model in models.data]
        gpt4_models = [m for m in available_models if 'gpt-4' in m]
        
        print(f"✅ Found {len(gpt4_models)} GPT-4 models:")
        for model in gpt4_models[:5]:  # Show first 5
            print(f"   - {model}")
        
        if 'gpt-4-turbo-preview' in available_models:
            print("✅ GPT-4 Turbo Preview is available!")
        else:
            print("⚠️  GPT-4 Turbo Preview not found, but other models available")
            
        return True
        
    except Exception as e:
        print(f"❌ Model availability test failed: {e}")
        return False

if __name__ == "__main__":
    print("🧪 OpenAI API Key Test")
    print("=" * 50)
    
    # Run tests
    connection_ok = test_openai_connection()
    model_ok = test_model_availability()
    
    print("\n" + "=" * 50)
    if connection_ok and model_ok:
        print("🎉 All tests passed! Your OpenAI API key is working correctly.")
        print("💡 Your HealthAI Assistant is ready to use OpenAI GPT-4 Turbo!")
    else:
        print("⚠️  Some tests failed. Please check your API key configuration.")
    
    print("\n📝 Next steps:")
    print("1. Run: python test_api.py (to test the full API)")
    print("2. Check the /health endpoint for configuration status")
    print("3. Test with real policy documents")
