# test_llm.py
import os
from dotenv import load_dotenv
from groq import Groq

print("\n--- Testing Groq LLM (Official SDK) ---")
load_dotenv()

try:
    # Initialize client
    client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
    print("✅ Groq client initialized.")

    # Prompt
    messages = [{"role": "user", "content": "Hello! Write a 10-word sentence about a salon."}]

    # ---------- Non-streaming ----------
    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        # optional:
        # temperature=0.3,
        # max_completion_tokens=64,
    )

    # Non-streamed: choices is a list
    ai_reply = completion.choices[0].message.content
    print(f"✅ Non-streamed reply: '{ai_reply}'")

    # ---------- Streaming ----------
    stream = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        stream=True,
        # optional:
        # temperature=0.3,
        # max_completion_tokens=64,
    )

    print("🟡 Streaming:")
    tokens = []
    for chunk in stream:
        # Streamed: choices is a list; each has a delta
        piece = (chunk.choices[0].delta.content or "") if chunk.choices else ""
        print(piece, end="")
        tokens.append(piece)
    print("\n🟢 Done.")
    final_streamed = "".join(tokens)

except Exception as e:
    print(f"❌ ERROR: Could not connect to Groq. Error: {e}")
