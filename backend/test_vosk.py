# test_vosk.py
import wave
import json
from vosk import Model, KaldiRecognizer

print("--- Testing Vosk STT ---")

try:
    model = Model("models/english")
    print("✅ English model loaded.")
    
    wf = wave.open("sample_en.wav", "rb")
    rec = KaldiRecognizer(model, wf.getframerate())
    rec.SetWords(True)
    
    rec.AcceptWaveform(wf.readframes(wf.getnframes()))
    result = rec.FinalResult()
    
    transcript = json.loads(result).get("text", "")
    print(f"✅ Transcription successful: '{transcript}'")

except FileNotFoundError:
    print("❌ ERROR: Make sure you have created 'sample_en.wav' and the model folder is correct.")
except Exception as e:
    print(f"❌ ERROR: An unexpected error occurred: {e}")