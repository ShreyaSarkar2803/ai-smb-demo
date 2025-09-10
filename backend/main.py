import os
import io
import re
import json
import base64
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

import numpy as np
import dotenv
import requests
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from groq import Groq
from pydub import AudioSegment
from pydub.utils import which
from vosk import Model, KaldiRecognizer

import dateutil.parser
import inflect

# -------------------- Env --------------------
dotenv.load_dotenv()
ELEVEN_API_KEY = os.getenv("ELEVEN_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://ai-smb-demo-q1nboxt9z-shreya-sarkars-projects-d1cd4823.vercel.app")

if not ELEVEN_API_KEY or not GROQ_API_KEY:
    raise RuntimeError("ELEVEN_API_KEY and GROQ_API_KEY must be set in .env")

# -------------------- Paths --------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")
EN_MODEL_PATH = os.path.join(MODELS_DIR, "english")
HI_MODEL_PATH = os.path.join(MODELS_DIR, "hindi")

# -------------------- Audio backend --------------------
AudioSegment.converter = which("ffmpeg")
AudioSegment.ffprobe = which("ffprobe")
if not AudioSegment.converter or not AudioSegment.ffprobe:
    raise RuntimeError("ffmpeg or ffprobe not found, ensure installed and in PATH")

# -------------------- FastAPI & CORS --------------------
app = FastAPI()

ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    FRONTEND_URL,
]
#if NGROK_URL:
    #ORIGINS.append(NGROK_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    max_age=3600,
)

# -------------------- Mappings and globals --------------------
LANG_MAP = {"en": "English", "hi": "Hindi"}
VOICE_MAP = {
    "en": "ZUrEGyu8GFMwnHbvLhv2",  # Replace with your English voice ID if different
    "hi": "1qEiC6qsybMkmnNdVMbK",  # Replace with your Hindi voice ID if different
}

p = inflect.engine()

db = {"bookings": 0, "revenue": 0, "messages": []}
sessions: Dict[str, Any] = {}
SESSION_TIMEOUT_MINUTES = 15

SERVICE_SYNONYMS = {
    "haircut": ["haircut", "hair cut", "cut", "बाल काटना", "बाल कटाना", "हेयरकट", "हेयर कट"],
    "hair color": ["hair color", "हेयर कलर", "बाल रंगना", "रंगना"],
    "styling": ["styling", "स्टाइलिंग", "सजावट"],
    "facial": ["facial", "फेशियल", "चेहरा"],
    "party makeup": ["party makeup", "पार्टी मेकअप", "मेकअप"],
    "bridal makeup": ["bridal makeup", "ब्राइडल मेकअप", "शादी का मेकअप"],
    "massage": ["massage", "मालिश", "स्पा"],
    "manicure": ["manicure", "मैनिकॉर", "हाथों की देखभाल"],
    "pedicure": ["pedicure", "पेडीकॉर", "पैरों की देखभाल"],
    "waxing": ["waxing", "वैक्सिंग", "मोम"],
    "threading": ["threading", "थ्रेडिंग", "बाल हटाना"],
    "beard trim": ["beard trim", "दाढ़ी ट्रिम", "दाढ़ी काटना"],
    "shave": ["shave", "शेव", "मूंछ काटना"],
    "hair spa": ["hair spa", "हेयर स्पा"],
    "keratin treatment": ["keratin treatment", "केराटिन ट्रीटमेंट"],
    "rebonding": ["rebonding", "रीबांडिंग"],
    "henna": ["henna", "मेहंदी", "हीना", "मेहंदी लगाना"],
    "hair wash": ["hair wash", "बाल धोना"],
    "scalp treatment": ["scalp treatment", "स्कैल्प ट्रीटमेंट"],
    "detan": ["detan", "डेटन", "डिटैन"],
    "nail art": ["nail art", "नेल आर्ट", "नाखून सजावट"],
}

KNOWLEDGE_BASE = {
    "en": {
        "hours": "We are open daily 9 AM to 9 PM.",
        "location": "Fleur Salon, Connaught Place, New Delhi.",
        "services": {
            "haircut": {"price": 500, "duration": 30},
            "hair color": {"price": 1800, "duration": 90},
            "styling": {"price": 700, "duration": 45},
            "facial": {"price": 1200, "duration": 60},
            "party makeup": {"price": 2000, "duration": 90},
            "bridal makeup": {"price": 5000, "duration": 180},
            "massage": {"price": 1500, "duration": 60},
            "manicure": {"price": 700, "duration": 60},
            "pedicure": {"price": 700, "duration": 60},
            "nail art": {"price": 1000, "duration": 60},
        },
    },
    "hi": {
        "hours": "हम सुबह 9 बजे से रात 9 बजे तक खुले हैं।",
        "location": "फ्लोर सैलून, कनॉट प्लेस, दिल्ली।",
        "services": {
            "बाल कटना": {"price": 500, "duration": 30},
            "बाल रंगना": {"price": 1800, "duration": 90},
            "सजावट": {"price": 700, "duration": 45},
            "फेशियल": {"price": 1200, "duration": 60},
            "पार्टी मेकअप": {"price": 2000, "duration": 90},
            "ब्राइडल मेकअप": {"price": 5000, "duration": 180},
            "मालिश": {"price": 1500, "duration": 60},
            "मैनिकॉर": {"price": 700, "duration": 60},
            "पेडीकॉर": {"price": 700, "duration": 60},
            "नेल आर्ट": {"price": 1000, "duration": 60},
        },
    },
}

BOOKED_SLOTS = {
    "en": {"10:00 am", "2:00 pm", "5:30 pm"},
    "hi": {"10:00 am", "2:00 pm", "5:30 pm"},
}

# -------------------- Utilities --------------------
def prune_sessions():
    now = datetime.now()
    to_remove = []
    for sid, sess in sessions.items():
        if (now - sess["last_interaction"]) > timedelta(minutes=SESSION_TIMEOUT_MINUTES):
            to_remove.append(sid)
    for sid in to_remove:
        sessions.pop(sid, None)


def detect_audio_format(upload: UploadFile) -> str:
    ctype = (upload.content_type or "").lower()
    fname = (upload.filename or "").lower()
    if "wav" in ctype or fname.endswith(".wav"):
        return "wav"
    if "mp3" in ctype or fname.endswith(".mp3"):
        return "mp3"
    if any(x in ctype for x in ["m4a", "aac", "mp4"]) or fname.endswith((".m4a", ".aac", ".mp4")):
        return "m4a"
    return "wav" # default safe


def ensure_audio_backend():
    if not AudioSegment.converter or not AudioSegment.ffprobe:
        raise RuntimeError("ffmpeg or ffprobe not configured")


def audio_to_mono16(audio_bytes: bytes, fmt: str) -> np.ndarray:
    ensure_audio_backend()
    segment = AudioSegment.from_file(io.BytesIO(audio_bytes), format=fmt)
    segment = segment.set_channels(1).set_frame_rate(16000)
    return np.array(segment.get_array_of_samples(), dtype=np.int16)


def safe_vosk_transcribe(model: Model, pcm_array: np.ndarray) -> str:
    rec = KaldiRecognizer(model, 16000)
    data = pcm_array.tobytes()
    try:
        ok = rec.AcceptWaveform(data)
        raw = rec.Result() if ok else rec.FinalResult()
        try:
            result = json.loads(raw or "{}")
            return (result.get("text") or "").strip()
        except Exception:
            return ""
    except Exception:
        return ""


def normalize_time_phrase(t: str) -> Optional[str]:
    """
    Normalizes a given time phrase (assumed to be mostly English or already
    converted from Hindi to an English-like structure) into a canonical "HH:MM am/pm".
    """
    t = t.lower().strip()
    
    # Handle "quarter past X"
    m = re.search(r"quarter past (\d{1,2})", t)
    if m:
        h = int(m.group(1))
        return f"{h}:15 pm" if "pm" in t or (h >= 12 and "am" not in t) else f"{h}:15 am"
    
    # Handle "half past X"
    m = re.search(r"half past (\d{1,2})", t)
    if m:
        h = int(m.group(1))
        return f"{h}:30 pm" if "pm" in t or (h >= 12 and "am" not in t) else f"{h}:30 am"
    
    # Handle "quarter to X" (translates to (X-1):45)
    m = re.search(r"quarter to (\d{1,2})", t)
    if m:
        h = int(m.group(1))
        prev_h = (h - 1) if h > 1 else 12 # Adjust for 1 am (quarter to 1 is 12:45)
        suffix = "pm" if "pm" in t or (prev_h >= 12 and "am" not in t) else "am"
        return f"{prev_h}:45 {suffix}"

    # Handle "X o'clock"
    m = re.search(r"(\d{1,2})\s*o'?clock", t)
    if m:
        h = int(m.group(1))
        suffix = "pm" if "pm" in t or (h >= 12 and "am" not in t) else "am"
        h12 = h if 1 <= h <= 12 else ((h - 1) % 12 + 1)
        return f"{h12}:00 {suffix}"
    
    # Handle "X:XX am/pm" or "X am/pm"
    m = re.search(r"(\d{1,2})(:\d{2})?\s*(am|pm)", t)
    if m:
        h = int(m.group(1))
        mm = m.group(2) or ":00"
        suffix = m.group(3).lower()
        h12 = h if 1 <= h <= 12 else ((h - 1) % 12 + 1)
        return f"{h12}{mm} {suffix}"
    
    # Handle direct HH:MM (e.g., "14:30")
    m = re.search(r"\b([01]?[0-9]|2[0-3]):([0-5][0-9])\b", t)
    if m:
        hour = int(m.group(1))
        minute = int(m.group(2))
        dt = datetime.strptime(f"{hour:02d}:{minute:02d}", "%H:%M")
        return dt.strftime("%I:%M %p").lower()

    # Handle "midnight" and "noon"
    if "midnight" in t:
        return "12:00 am"
    if "noon" in t:
        return "12:00 pm"

    return None


def canonical_time_for_slots(s: str) -> Optional[str]:
    try:
        dt = datetime.strptime(s.strip().upper(), "%I:%M %p")
        return dt.strftime("%I:%M %p").lstrip("0").lower()
    except Exception:
        return None


def generate_tts(text: str, voice_id: str) -> Optional[bytes]:
    headers = {"Accept": "audio/mpeg", "Content-Type": "application/json", "xi-api-key": ELEVEN_API_KEY}
    data = {"text": text, "voice_settings": {"stability": 0.5, "similarity_boost": 0.75}}
    try:
        response = requests.post(
            f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}", headers=headers, json=data, timeout=20
        )
        if response.status_code == 200:
            return response.content
    except Exception:
        pass
    return None


def find_alternate_slot(requested_time: str, lang: str) -> Optional[str]:
    try:
        dt = datetime.strptime(requested_time, "%I:%M %p")
        open_time = datetime.strptime("9:00 AM", "%I:%M %p")
        close_time = datetime.strptime("9:00 PM", "%I:%M %p")
        if dt < open_time:
            dt = open_time
        booked = BOOKED_SLOTS.get(lang, set())
        while dt <= close_time:
            slot = dt.strftime("%I:%M %p").lstrip("0").lower()
            if slot not in booked:
                return slot
            dt += timedelta(minutes=30)
    except Exception:
        pass
    return None

# ==============================================================================
# -------------------- Time Normalization & Patterns (Final Robust Version) --------------------
# ==============================================================================

# Special Hindi words that don’t directly translate to digits or simple phrases
special_hindi_times = {
    "डेढ़": "1:30",        # 1:30
    "ढाई": "2:30",         # 2:30
    "सवा": "quarter past", # "सवा चार" -> "quarter past 4"
    "पौने": "quarter to",  # "पौने पाँच" -> "quarter to 5"
    "साढ़े": "half past",  # "साढ़े तीन" -> "half past 3"
}

# Midnight/Noon support for both English & Hindi
special_times_general = {
    "midnight": "12:00 am",
    "noon": "12:00 pm",
    "मध्यरात्रि": "12:00 am",
    "दोपहर बारह": "12:00 pm",
    "रात बारह": "12:00 am",
}

def normalize_special_times(text: str) -> str:
    """Applies special case time normalizations (e.g., डेढ़, ढाई, midnight/noon)."""
    # Apply general (English + Hindi) first
    for word, replacement in special_times_general.items():
        text = re.sub(r'\b' + re.escape(word) + r'\b', replacement, text, flags=re.UNICODE | re.IGNORECASE)
    # Apply Hindi specials
    for word, replacement in special_hindi_times.items():
        text = re.sub(r'\b' + re.escape(word) + r'\b', replacement, text, flags=re.UNICODE | re.IGNORECASE)
    return text

def extract_hindi_time(text: str) -> Optional[str]:
    """
    Directly extracts Hindi time patterns with number words (e.g., "चार बजे शाम")
    and converts them to a canonical "HH:MM am/pm" string.
    """
    hindi_to_digit = {
        "एक": 1, "दो": 2, "तीन": 3, "चार": 4, "पांच": 5, "छह": 6, "सात": 7, "आठ": 8, "नौ": 9, "दस": 10, "ग्यारह": 11, "बारह": 12,
    }
    # Create a regex pattern from the dictionary keys
    number_words_pattern = "|".join(hindi_to_digit.keys())

    # This regex is specifically for patterns that contain "बजे" with a number WORD and an optional meridian word.
    match = re.search(
        r'(?:(सुबह|शाम|रात|दोपहर)\s*)?(' + number_words_pattern + r')(?::(\d{2}))?\s*बजे\s*(?:(सुबह|शाम|रात|दोपहर))?',
        text, re.UNICODE
    )
    if not match:
        return None # No number word match, exit

    meridian_word = match.group(1) or match.group(4)
    hour_word = match.group(2)
    minutes_str = match.group(3)

    hour = hindi_to_digit.get(hour_word, 0)
    minutes = int(minutes_str) if minutes_str else 0
    suffix = ''

    if meridian_word == 'सुबह':
        suffix = 'am'
    elif meridian_word in ['शाम', 'रात', 'दोपहर']:
        suffix = 'pm'
    else: # Heuristic for ambiguous times
        if 1 <= hour <= 7:
            suffix = 'pm'
        else:
            suffix = 'am'
    
    return f"{hour:02d}:{minutes:02d} {suffix}"


# Extended Regex Patterns for time extraction (for English and pre-processed text)
time_patterns = [
    r"quarter past \d{1,2}",
    r"half past \d{1,2}",
    r"quarter to \d{1,2}",
    r"\d{1,2}\s*o'?clock",
    r"\d{1,2}(:\d{2})?\s*(am|pm)",
    r"(?:around|about|sharp)\s*\d{1,2}(:\d{2})?\s*(am|pm)?",
    r"(midnight|noon)",
    r"\d{1,2}\s*(am|pm)",
    r"\b([01]?[0-9]|2[0-3]):[0-5][0-9]\b"
]


# ==============================================================================
# -------------------- Booking session (FINAL HINDI SUPPORT & CLARITY) --------------------
# ==============================================================================
class BookingSession:
    def __init__(self, lang: str = "en"):
        self.lang = lang
        self.data = {"service": None, "name": None, "date": None, "time": None}
        self.last_interaction = datetime.now()

    def next_missing(self):
        for slot in ["service", "name", "date", "time"]:
            if not self.data.get(slot):
                return slot
        return None

    def update(self, transcript: str):
        if not transcript:
            return

        raw_text = transcript.lower()
        self.last_interaction = datetime.now()
        parsed_text_input = raw_text # This will be progressively modified
        normalized_time = None

        missing = self.next_missing()

        # --- Slot Filling Logic (with corrected pre-processing order) ---
        if missing == "service":
            for service, synonyms in SERVICE_SYNONYMS.items():
                if any(syn in raw_text for syn in synonyms): 
                    self.data["service"] = service
                    return

        elif missing == "name":
            patterns = [
                r"(?:my name is|this is|i am|call me|named|under the name|put it under the name)\s+([a-z\s\-]+)",
                r"(?:मेरा नाम|नाम है|मैं|मेरे नाम से|के नाम से)\s+([\w\s]+?)\s*(?:हूँ|हूं|है)?",
            ]
            for pattern in patterns:
                match = re.search(pattern, transcript, re.I | re.UNICODE) 
                if match:
                    name = match.group(1).strip()
                    name = re.sub(r"[^a-zA-Z\s\-\u0900-\u097F]", "", name, flags=re.UNICODE)
                    if name:
                        self.data["name"] = name.title()
                        return
            
            words = transcript.split()
            if 1 <= len(words) <= 3 and all(re.match(r'[\w\-]+', w) for w in words):
                common_non_name_words = {"pm", "am", "yes", "no", "ok", "book", "date", "time", "service"}
                if not any(word.lower() in common_non_name_words for word in words):
                    self.data["name"] = " ".join(words).title()
                    return

        elif missing == "date":
            # Date pre-processing is simpler and can be done in one go
            if self.lang == 'hi':
                hindi_date_translations = {
                    "जनवरी": "January", "फरवरी": "February", "मार्च": "March", "अप्रैल": "April", "मई": "May", "जून": "June", "जुलाई": "July", "अगस्त": "August", "सितंबर": "September", "अक्टूबर": "October", "नवंबर": "November", "दिसंबर": "December",
                    "आज": "today", "कल": "tomorrow", "परसों": "day after tomorrow",
                }
                for word, replacement in hindi_date_translations.items():
                    parsed_text_input = re.sub(r'\b' + re.escape(word) + r'\b', replacement, parsed_text_input, flags=re.UNICODE)
            try:
                dt = dateutil.parser.parse(parsed_text_input, fuzzy=True, default=datetime.now())
                if dt.date() >= datetime.now().date():
                    self.data["date"] = dt.strftime("%d %B %Y")
                    return
            except (ValueError, TypeError):
                pass

        elif missing == "time":
            # --- START OF CORRECTED TIME PRE-PROCESSING ---
            # Priority 1: Handle general special time phrases (noon, midnight) AND Hindi "डेढ़", "ढाई" etc.
            # This is applied to a copy of raw_text that will then be used for subsequent steps.
            temp_processed_text = normalize_special_times(raw_text)

            # Priority 2: Use the dedicated Hindi time parser on the ORIGINAL raw_text
            # This parser looks for Hindi number words ("चार बजे") so it needs the original input.
            if self.lang == 'hi':
                normalized_time = extract_hindi_time(raw_text)
                print(f"[DEBUG] extract_hindi_time result: {normalized_time}")


            # Priority 3: If Hindi parser fails, apply general translations and then English-like regex
            if not normalized_time:
                # Apply number word to digit and Hindi meridian words to English equivalents on temp_processed_text
                replacements = {"one": "1", "two": "2", "three": "3", "four": "4", "five": "5", "six": "6", "seven": "7", "eight": "8", "nine": "9", "ten": "10", "eleven": "11", "twelve": "12"}
                if self.lang == 'hi':
                    replacements.update({
                        "एक": "1", "दो": "2", "तीन": "3", "चार": "4", "पांच": "5", "छह": "6", "सात": "7", "आठ": "8", "नौ": "9", "दस": "10", "ग्यारह": "11", "बारह": "12",
                        "बजे": "o'clock", "सुबह": "am", "शाम": "pm", "रात": "pm", "दोपहर": "pm"
                    })
                
                # Apply "स्राव" (ASR error) -> "शाम" correction early for general processing
                temp_processed_text = re.sub(r'(\d+)\s*बजे\s*स्राव', r'\1 बजे शाम', temp_processed_text, flags=re.UNICODE)
                temp_processed_text = re.sub(r'स्राव\s*(\d+)\s*बजे', r'शाम \1 बजे', temp_processed_text, flags=re.UNICODE)
                temp_processed_text = re.sub(r'स्राव', r'शाम', temp_processed_text, flags=re.UNICODE)

                for word, digit in replacements.items():
                    temp_processed_text = re.sub(r'\b' + re.escape(word) + r'\b', digit, temp_processed_text, flags=re.UNICODE)
                
                # Clean up multiple spaces that might result from replacements
                temp_processed_text = re.sub(r'\s+', ' ', temp_processed_text).strip()
                print(f"[DEBUG] After general translations and cleanup: '{temp_processed_text}'")

                # Now try general English-like regex patterns on the translated text
                for pat in time_patterns:
                    m = re.search(pat, temp_processed_text, re.I)
                    if m:
                        normalized_time = normalize_time_phrase(m.group(0))
                        print(f"[DEBUG] Normalized time from English-like patterns: {normalized_time}")
                        break
            
            # Priority 4: Final fallback to dateutil's fuzzy parser if nothing else worked
            if not normalized_time and re.search(r"\d", temp_processed_text):
                print(f"[DEBUG] Falling back to fuzzy dateutil on: '{temp_processed_text}'")
                try:
                    dt = dateutil.parser.parse(temp_processed_text, fuzzy=True, default=datetime.now())
                    normalized_time = dt.strftime("%I:%M %p")
                    print(f"[DEBUG] Normalized time after dateutil: {normalized_time}")
                except (ValueError, TypeError):
                    pass
            
            # --- END OF CORRECTED TIME PRE-PROCESSING ---

            if normalized_time:
                canonical = canonical_time_for_slots(normalized_time)
                print(f"DEBUG: Storing canonical time: {canonical}")
                if canonical:
                    self.data["time"] = canonical
                    return

    def is_complete(self):
        return self.next_missing() is None

# -------------------- Model and LLM init --------------------
print("Loading ASR models...")
models = {}
try:
    models["en"] = Model(EN_MODEL_PATH)
    models["hi"] = Model(HI_MODEL_PATH)
    print("Models loaded successfully.")
except Exception as e:
    print(f"Model loading error: {e}")

client = None
try:
    client = Groq(api_key=GROQ_API_KEY)
    print("Groq client initialized.")
except Exception as e:
    print(f"Groq client error: {e}")

# -------------------- Routes --------------------
@app.get("/")
def health_check():
    return {"status": "ok"}


@app.post("/chat")
async def chat(audio: UploadFile = File(...), lang: str = Form(...), session_id: str = Form(...)):
    # --- 1. Initial Setup & Transcription ---
    prune_sessions()

    if lang not in LANG_MAP:
        raise HTTPException(status_code=400, detail="Unsupported language")
    
    audio_bytes = await audio.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Empty audio file")

    model = models.get(lang)
    if not model:
        raise HTTPException(status_code=500, detail="ASR model not loaded")

    audio_format = detect_audio_format(audio)
    samples = audio_to_mono16(audio_bytes, audio_format)
    transcript = safe_vosk_transcribe(model, samples)
    print(f"Transcript: {transcript}")

    # --- 2. Session & State Management ---
    session = sessions.get(session_id)
    if not session:
        session = {"state": BookingSession(lang), "last_interaction": datetime.now()}
        sessions[session_id] = session
    state: BookingSession = session["state"]
    session["last_interaction"] = datetime.now()
    
    state.update(transcript)
    print(f"[DEBUG] Booking data after update: {state.data}")
    missing = state.next_missing()
    collected = dict(state.data)
    lower_t = (transcript or "").lower()

    # --- 3. Handle Terminal States (Confirmation, Rejection, Conflict) ---
    
    # Check for slot conflict first, if all info is available for a potential booking
    if missing is None:
        ct = canonical_time_for_slots(collected.get("time", "")) or ""
        # If the requested time is booked AND the user is not actively trying to change it
        if ct in BOOKED_SLOTS.get(lang, set()):
            alt_slot = find_alternate_slot(ct, lang)
            reply_text = f"{ct} is booked. Would {alt_slot} work instead?" if lang == "en" else f"{ct} स्लॉट भरा हुआ है। क्या {alt_slot} सही रहेगा?"
            state.data["time"] = None # Reset time to re-ask or suggest
            tts = generate_tts(reply_text, VOICE_MAP.get(lang, VOICE_MAP["en"]))
            audio_b64 = base64.b64encode(tts).decode() if tts else None
            return JSONResponse({"transcript": transcript, "ai_reply": reply_text, "audio_base64": audio_b64, "language": lang, "done": False, "booking": collected, "continue": True})

    # User explicitly confirms a complete booking (after any conflict checks)
    confirmation_words = ["yes", "perfect", "confirm", "sure", "book it", "yeah", "ok","correct", "right"] if lang == "en" else ["हाँ", "पक्का", "ठीक है", "कर दो"]
    if missing is None and any(word in lower_t for word in confirmation_words):
        # --- FINAL SUCCESSFUL BOOKING ---
        svc = collected.get("service", "")
        price = KNOWLEDGE_BASE[lang]["services"].get(svc, {}).get("price", 0)
        # In case price is missing in Hindi KB, fallback to English
        if price == 0 and lang == "hi": price = KNOWLEDGE_BASE["en"]["services"].get(svc, {}).get("price", 0)

        db["bookings"] += 1
        db["revenue"] += int(price or 0)
        
        confirmation_msg = f"Thank you, your appointment for a {svc} is booked for {collected.get('name')} at {collected.get('time')} on {collected.get('date')}."
        if lang == "hi": confirmation_msg = f"धन्यवाद, आपकी {svc} के लिए अपॉइंटमेंट {collected.get('name')} के नाम से {collected.get('date')} को {collected.get('time')} बजे बुक हो गई है।"

        sessions.pop(session_id, None) # End session
        tts = generate_tts(confirmation_msg, VOICE_MAP.get(lang, VOICE_MAP["en"]))
        audio_b64 = base64.b64encode(tts).decode() if tts else None
        
        # This is the key: done=True, continue=False for final booking
        return JSONResponse({"transcript": transcript, "ai_reply": confirmation_msg, "audio_base64": audio_b64, "language": lang, "done": True, "booking_successful": True, "confirmation_message": confirmation_msg, "booking": collected, "booking_price": price, "continue": False})

    # User wants to change something or reject a suggestion
    rejection_words = ["no", "change", "not", "nope"] if lang == "en" else ["नहीं", "बदल"]
    if any(word in lower_t for word in rejection_words):
        state.data["time"] = None # Reset time, as it's the most common change point
        reply_text = "Okay, what time would you prefer instead?" if lang == "en" else "ठीक है, आप कौन सा समय चाहेंगे?"
        tts = generate_tts(reply_text, VOICE_MAP.get(lang, VOICE_MAP["en"]))
        audio_b64 = base64.b64encode(tts).decode() if tts else None
        return JSONResponse({"transcript": transcript, "ai_reply": reply_text, "audio_base64": audio_b64, "language": lang, "done": False, "booking": collected, "continue": True})
        

    # --- 4. Default Path: Continue the Conversation via LLM ---
    sys_lang = LANG_MAP.get(lang, "English")
    
    # --- Start RAG Context Generation (for LLM to access info) ---
    context_info = []

    # Always provide general business info
    context_info.append(f"Business hours: {KNOWLEDGE_BASE[lang]['hours']}. Location: {KNOWLEDGE_BASE[lang]['location']}.")

    # If a service is known or being discussed, add service details
    current_service = collected.get("service")
    if current_service:
        service_details = KNOWLEDGE_BASE[lang]["services"].get(current_service)
        if service_details:
            context_info.append(f"Details for '{current_service}': Price ₹{service_details['price']}, Duration {service_details['duration']} minutes.")
        else: # Also try English KB for price if Hindi service not found there
            english_service_details = KNOWLEDGE_BASE['en']['services'].get(current_service)
            if english_service_details:
                context_info.append(f"Details for '{current_service}': Price ₹{english_service_details['price']}, Duration {english_service_details['duration']} minutes.")


    # If time is being discussed, add available/booked slots
    # Only add booked slots if there's a reason for the LLM to know (e.g., if asking for time or conflicting)
    if missing == "time" or "time" in transcript.lower() or "available" in lower_t:
        booked = BOOKED_SLOTS.get(lang, set())
        if booked:
            context_info.append(f"Currently booked slots are: {', '.join(sorted(list(booked)))}. Our working hours are 9 AM to 9 PM.")
        else:
            context_info.append(f"No slots are currently booked. Our working hours are 9 AM to 9 PM.")

    context_string = "\n".join(context_info)
    # --- End RAG Context Generation ---

    # Determine the specific task for the LLM
    task_instruction = ""
    if missing:
        task_instruction = f"ask for the user's {missing}."
    else:
        # When all data is collected, create a detailed confirmation instruction for the LLM
        svc = collected.get("service", "")
        price = KNOWLEDGE_BASE[lang]["services"].get(svc, {}).get("price", 0)
        if price == 0 and lang == "hi": price = KNOWLEDGE_BASE["en"]["services"].get(svc, {}).get("price", 0)
        task_instruction = f"confirm the booking for a {svc} for {collected.get('name')} on {collected.get('date')} at {collected.get('time')}. State that the price is ₹{price} and ask for a final 'yes' to confirm."

    # Create a single, clear, and comprehensive prompt for the LLM
    full_prompt = (
        f"You are a warm and helpful receptionist for Fleur Salon. Your goal is to book an appointment. "
        f"Speak ONLY in {sys_lang}. Keep your responses very short and conversational. "
        f"Here is relevant salon information you MUST use to answer questions: \n{context_string}\n"
        f"Here is the data you have collected so far: {json.dumps(collected)}. "
        f"The user's most recent statement was: '{transcript}'. "
        f"Your specific task now is to {task_instruction} "
        f"Generate only the natural, conversational response to the user. Do not repeat these instructions."
    )
    messages = [{"role": "user", "content": full_prompt}]
    
    # LLM Call
    try:
        if client is None:
            reply_text = "I'm sorry, my AI brain is not connected right now. Please try again later."
        else:
            completion = client.chat.completions.create(model="llama-3.3-70b-versatile", messages=messages, max_tokens=60, temperature=0.4)
            reply_text = (completion.choices[0].message.content or "").strip()
    except Exception as e:
        print(f"LLM Error: {e}")
        reply_text = "I'm sorry, I'm having a little trouble understanding. Could you please repeat?"

    tts = generate_tts(reply_text, VOICE_MAP.get(lang, VOICE_MAP["en"]))
    audio_b64 = base64.b64encode(tts).decode() if tts else None

    # The default for the LLM path is to continue the conversation
    return JSONResponse({
        "transcript": transcript,
        "ai_reply": reply_text,
        "audio_base64": audio_b64,
        "language": lang,
        "continue": True, # Default for LLM-driven conversation turn
        "done": False, # Only true if explicitly returned as booking_successful
        "booking_successful": False,
        "booking": collected,
    })
