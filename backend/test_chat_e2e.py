# tests/test_chat_e2e.py

import os
import sys
import time
import json
import base64
import requests

API_URL = os.environ.get("API_URL", "http://127.0.0.1:8000/chat")


def post_chat(lang: str, filename: str) -> dict:
    if not os.path.exists(filename):
        raise FileNotFoundError(f"Missing input file: {filename}")

    with open(filename, "rb") as f:
        files = {"audio": (os.path.basename(filename), f, "audio/wav")}
        data = {"lang": lang}
        resp = requests.post(API_URL, files=files, data=data, timeout=60)

    if resp.status_code != 200:
        raise RuntimeError(f"/chat {lang} failed: {resp.status_code} {resp.text}")

    try:
        return resp.json()
    except Exception as e:
        raise RuntimeError(f"Invalid JSON from /chat {lang}: {e}; body={resp.text[:300]}")


def validate_and_save(json_response: dict, lang: str) -> None:
    transcript = json_response.get("transcript")
    ai_reply = json_response.get("ai_reply")
    audio_b64 = json_response.get("audio_base64")

    if not transcript or not ai_reply or not audio_b64:
        raise AssertionError(
            f"Missing fields for {lang}. Got keys: {list(json_response.keys())}"
        )

    audio_bytes = base64.b64decode(audio_b64)
    out_path = f"response_{lang}.mp3"
    with open(out_path, "wb") as f:
        f.write(audio_bytes)

    print(f"- Transcript [{lang}]: {transcript}")
    print(f"- AI Reply [{lang}]: {ai_reply}")
    print(f"- Saved audio: {out_path} ({len(audio_bytes)} bytes)")


def run_case(lang: str, wav_path: str) -> bool:
    print(f"\n=== E2E: lang={lang}, file={wav_path} ===")
    try:
        data = post_chat(lang, wav_path)
        validate_and_save(data, lang)
        return True
    except Exception as e:
        print(f"ERROR: {e}")
        return False


def main():
    cases = [
        ("en", "test_en.wav"),
        ("hi", "test_hi.wav"),
    ]

    ok_all = True
    for lang, wav in cases:
        ok = run_case(lang, wav)
        ok_all = ok_all and ok
        time.sleep(0.5)

    if not ok_all:
        print("❌ One or more E2E cases failed")
        sys.exit(1)

    print("✅ All E2E cases passed")


if __name__ == "__main__":
    main()
