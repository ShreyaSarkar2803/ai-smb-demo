# test_llm.py
import os
from openai import OpenAI
from dotenv import load_dotenv

print("\n--- Testing Groq LLM (Llama 3 70B) ---")
load_dotenv()

try:
    client = OpenAI(
        base_url="https://api.groq.com/openai/v1",
        api_key=os.getenv("GROQ_API_KEY"),
    )
    print("✅ OpenAI client for Groq initialized.")
    
    messages = [{"role": "user", "content": "Hello! Write a 10-word sentence about a salon."}]
    
    # Using the larger, active Llama 3 model
    completion = client.chat.completions.create(
        model="llama3-70b-8192", # 👈 The new, correct model name
        messages=messages,
    )
    
    ai_reply = completion.choices[0].message.content
    print(f"✅ LLM response successful: '{ai_reply}'")

except Exception as e:
    print(f"❌ ERROR: Could not connect to Groq. Error: {e}")