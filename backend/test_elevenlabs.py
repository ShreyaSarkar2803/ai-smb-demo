# test_elevenlabs.py
import os
import requests
from dotenv import load_dotenv

print("\n--- Testing ElevenLabs TTS ---")
load_dotenv()

try:
    ELEVEN_API_KEY = os.getenv("ELEVEN_API_KEY")
    VOICE_ID_EN = "21m00Tcm4TlvDq8ikWAM"
    
    headers = { "Accept": "audio/mpeg", "Content-Type": "application/json", "xi-api-key": ELEVEN_API_KEY }
    body = { "text": "If you can hear this, Eleven Labs is working.", "voice_settings": {"stability": 0.5, "similarity_boost": 0.75} }
    
    response = requests.post(f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID_EN}", headers=headers, json=body)
    
    if response.status_code == 200:
        with open("output_tts.mp3", "wb") as f:
            f.write(response.content)
        print("✅ TTS test successful! Listen to 'output_tts.mp3' to confirm.")
    else:
        print(f"❌ ERROR: ElevenLabs returned status {response.status_code}. Response: {response.text}")

except Exception as e:
    print(f"❌ ERROR: An unexpected error occurred: {e}")