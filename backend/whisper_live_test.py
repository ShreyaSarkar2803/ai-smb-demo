import argparse
import queue
import sys
import sounddevice as sd
from faster_whisper import WhisperModel

# -------------------------
# CLI args
# -------------------------
parser = argparse.ArgumentParser()
parser.add_argument("--lang", type=str, default="bn", help="Language code (bn=Bangla, ta=Tamil)")
parser.add_argument("--device", type=str, default="cpu", help="Device: cpu or cuda")
parser.add_argument("--model_size", type=str, default="small", help="Whisper model size: tiny/small/medium/large-v2")
args = parser.parse_args()

# -------------------------
# Load model
# -------------------------
print(f"Loading Whisper model ({args.model_size}) on {args.device} for language={args.lang}...")
model = WhisperModel(args.model_size, device=args.device, compute_type="int8")

# -------------------------
# Audio recording setup
# -------------------------
samplerate = 16000  # Whisper expects 16kHz
q = queue.Queue()

def callback(indata, frames, time, status):
    if status:
        print(status, file=sys.stderr)
    q.put(bytes(indata))  # FIXED

# -------------------------
# Live Transcription Loop
# -------------------------
print("🎤 Speak now (Ctrl+C to stop)...")

buffer = b""
block_duration = 5  # seconds per transcription chunk

try:
    with sd.RawInputStream(samplerate=samplerate, blocksize=int(samplerate * 0.5),
                           dtype="int16", channels=1, callback=callback):
        while True:
            data = q.get()
            buffer += data

            # Process every 5 seconds of audio
            if len(buffer) >= samplerate * 2 * block_duration:  # 2 bytes per sample
                print("⏳ Transcribing chunk...")
                import numpy as np
                import io
                import soundfile as sf

                # Convert bytes → numpy → wav-like object
                audio_np = np.frombuffer(buffer, dtype=np.int16).astype("float32") / 32768.0
                buffer = b""  # reset buffer

                # Run Whisper
                segments, info = model.transcribe(audio_np, language=args.lang)
                for segment in segments:
                    print(f"[{segment.start:.2f}s → {segment.end:.2f}s] {segment.text}")

except KeyboardInterrupt:
    print("\n🛑 Stopped by user")
except Exception as e:
    print("❌ Error:", str(e))
