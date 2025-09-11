# Fleur Salon AI Assistant

**Live Demo:** [https://ai-smb-demo.vercel.app](https://ai-smb-demo.vercel.app)
**Backend API:** [https://ai-sm-demo.onrender.com/](https://ai-sm-demo.onrender.com/)

## 📝 Table of Contents

* [About the Project](#about-the-project)
* [Features](#features)
* [Technology Stack](#technology-stack)
* [Getting Started](#getting-started)
    * [Prerequisites](#prerequisites)
    * [API Keys](#api-keys)
    * [Frontend Setup (Vercel)](#frontend-setup-vercel)
    * [Backend Setup (Render)](#backend-setup-render)
* [Project Structure](#project-structure)
* [API Endpoints](#api-endpoints)
* [Contributors](#contributors)
* [Contributing](#contributing)
* [License](#license)
* [Contact](#contact)
* [Acknowledgements](#acknowledgements)

## 🌟 About the Project

The Fleur Salon AI Assistant is an innovative, voice-enabled virtual receptionist **developed by our team** to enhance customer experience for small and medium-sized businesses (SMBs) in the salon industry. This project showcases a sophisticated integration of Speech-to-Text (STT), Large Language Models (LLM), and Text-to-Speech (TTS) technologies to create a seamless, natural language conversational interface.

Customers can interact with the AI Assistant to inquire about services, ask for business hours, find the location, and even book appointments, all through natural voice commands in both English and Hindi. The system is designed to understand context, manage booking states, handle conflicts (like unavailable slots), and provide clear, auditory responses, simulating a real human interaction.

## ✨ Features

* **Multilingual Support:** Seamlessly handles conversations in both English and Hindi.
* **Voice-Enabled Interaction:** Utilizes advanced STT and TTS for natural voice input and output.
* **Intelligent Appointment Booking:** Guides users through the booking process, collecting service, name, date, and time.
* **Slot Availability Management:** Checks for booked slots and suggests alternatives.
* **Dynamic Information Retrieval:** Answers queries about salon hours, location, and service details (prices, durations) using a built-in knowledge base.
* **Contextual Understanding:** Leverages LLMs to maintain conversation flow and respond relevantly based on collected information and user queries.
* **Session Management:** Maintains conversational state for each user, allowing for multi-turn dialogues.
* **Scalable Architecture:** Built with FastAPI for the backend and a modern JavaScript frontend, deployed on Render and Vercel respectively, ensuring scalability and responsiveness.

## 💻 Technology Stack

* **Frontend:**
    * **JavaScript / React (or similar SPA framework):** For the interactive web interface.
    * **Web Audio API:** For recording user's voice input.
    * **Deployed on:** Vercel

* **Backend (FastAPI):**
    * **Python 3.9+:** Core language.
    * **FastAPI:** High-performance web framework for the API.
    * **Uvicorn:** ASGI server for FastAPI.
    * **Vosk:** Open-source offline Speech-to-Text for robust transcription (English and Hindi models).
    * **Groq:** Integrated LLM for natural language understanding and response generation (using Llama-3.3-70B-Versatile model).
    * **ElevenLabs:** High-quality Text-to-Speech for natural-sounding voice responses.
    * **Pydub & FFmpeg/FFprobe:** Audio processing for converting and handling various audio formats.
    * **Python `requests`, `python-dotenv`, `dateutil`, `inflect`:** For external API calls, environment variable management, date parsing, and number-to-word conversion.
    * **Numpy:** For efficient audio data handling.
    * **Deployed on:** Render

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Before you begin, ensure you have the following installed:

* Python 3.9+
* Node.js & npm/yarn (for frontend)
* Git
* `ffmpeg` and `ffprobe` (for audio processing, ensure they are in your system's PATH)
    * **On Ubuntu/Debian:** `sudo apt update && sudo apt install ffmpeg`
    * **On macOS (using Homebrew):** `brew install ffmpeg`
    * **On Windows:** Download from [ffmpeg.org](https://ffmpeg.org/download.html) and add to PATH.

### API Keys

You will need API keys for the following services:

* **Groq API Key:** [https://groq.com/](https://groq.com/)
* **ElevenLabs API Key:** [https://elevenlabs.io/](https://elevenlabs.io/)

### Frontend Setup (Vercel)

The frontend is typically a modern JavaScript framework (React, Vue, Angular) and should be deployed on Vercel.

1.  **Clone the repository:**
    ```bash
    git clone <your-frontend-repo-url>
    cd <your-frontend-repo-name>
    ```
2.  **Install dependencies:**
    ```bash
    npm install # or yarn install
    ```
3.  **Configure Backend URL:** Create a `.env.local` file in your frontend's root directory:
    ```
    REACT_APP_BACKEND_URL=[https://ai-sm-demo.onrender.com](https://ai-sm-demo.onrender.com)
    ```
    *(Adjust `REACT_APP_` prefix based on your frontend framework's convention if it's not React.)*
4.  **Run Locally (Optional):**
    ```bash
    npm start # or yarn start
    ```
5.  **Deploy to Vercel:**
    * Connect your Git repository to Vercel.
    * Vercel will automatically detect your framework and deploy.
    * **Important:** Ensure your Vercel project's "Build & Develop" settings (or environment variables) for `REACT_APP_BACKEND_URL` are set to `https://ai-sm-demo.onrender.com`.

### Backend Setup (Render)

The backend is a FastAPI application.

1.  **Clone the repository:**
    ```bash
    git clone <your-backend-repo-url>
    cd <your-backend-repo-name>
    ```
2.  **Create a virtual environment:**
    ```bash
    python -m venv venv
    source venv/bin/activate # On Windows: venv\Scripts\activate
    ```
3.  **Install Python dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
4.  **Download Vosk Models:**
    * Your `models` directory should contain `english` and `hindi` Vosk models. These are typically not committed to Git due to size. You'll need to download and place them in `backend/models/`.
    * Example for English: [https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip](https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip)
    * Example for Hindi: [https://alphacephei.com/vosk/models/vosk-model-small-hi-0.22.zip](https://alphacephei.com/vosk/models/vosk-model-small-hi-0.22.zip)
    * Unzip them into `backend/models/english` and `backend/models/hindi`.
5.  **Run Locally (Optional):**
    ```bash
    uvicorn main:app --reload --port 8000
    ```
6.  **Deploy to Render:**
    * Connect your Git repository to Render.
    * Configure a new "Web Service".
    * **Environment Variables:** Crucially, set the following in your Render service settings:
        * `ELEVEN_API_KEY`: Your ElevenLabs API Key
        * `GROQ_API_KEY`: Your Groq API Key
        * `FRONTEND_URL`: `https://ai-smb-demo-q1nboxt9z-shreya-sarkars-projects-d1cd4823.vercel.app` (Your Vercel frontend URL)
    * **Build Command:** Render should automatically detect your `Dockerfile`.
    * **Important:** If using the Free Tier, be aware that your service will spin down after inactivity. For consistent availability (e.g., for judging), consider upgrading to a paid Render plan or implementing an external pinging service (like UptimeRobot) to keep it awake.

## 📁 Project Structure
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── models/
│       ├── english/  (Vosk English model files)
│       └── hindi/    (Vosk Hindi model files)
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── ... (other frontend files)
├── .gitignore
└── README.md
## 🌐 API Endpoints

The backend API is built with FastAPI and exposed at `https://ai-sm-demo.onrender.com/`.

* **`GET /`**
    * **Description:** Health check endpoint.
    * **Response:** `{"status": "ok"}`

* **`POST /chat`**
    * **Description:** Main endpoint for conversational interaction. Receives audio, transcribes it, processes with LLM, generates a voice reply.
    * **Method:** `POST`
    * **Form Data:**
        * `audio`: (`UploadFile`) The audio file of the user's speech.
        * `lang`: (`str`) Language of interaction ("en" for English, "hi" for Hindi).
        * `session_id`: (`str`) Unique identifier for the user's session to maintain conversation context.
    * **Responses:**
        * `200 OK`: `JSONResponse` containing:
            ```json
            {
              "transcript": "User's transcribed text",
              "ai_reply": "AI's textual response",
              "audio_base64": "Base64 encoded MP3 audio of AI's reply",
              "language": "en" | "hi",
              "done": true | false, // True if booking is complete
              "booking_successful": true | false, // True if booking confirmed
              "confirmation_message": "Final booking message" (if successful),
              "booking": { /* current state of booking data */ },
              "continue": true | false // True if conversation should continue
            }
            ```
        * `400 Bad Request`: If unsupported language, empty audio.
        * `500 Internal Server Error`: If ASR model not loaded, LLM/TTS errors.

## 🤝 Contributors

This project was a collaborative effort by:

* **Shreya Sarkar** - [GitHub Profile](https://github.com/ShreyaSarkar2803) | [LinkedIn Profile](https://www.linkedin.com/in/shreya-sarkar2801)
* **Kshitij Ranjan** - [GitHub Profile](https://github.com/Kshitij-Ekantikashya) | [LinkedIn Profile](https://www.linkedin.com/in/kshitij-ranjan21)

## 👋 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## ✉️ Contact

For questions or inquiries, please reach out to:

* **Shreya Sarkar:** [shreya.sarkar@example.com](mailto:sshreyaasarkar27@gmail.com)
* **Kshitij Ranjan:** [your_email@example.com](mailto:kshitijranjna30317@gmail.com)

Project Link: [https://github.com/ShreyaSarkar2803/ai-smb-demo](https://github.com/ShreyaSarkar2803/ai-smb-demo)

## 🙏 Acknowledgements

* [Groq](https://groq.com/)
* [ElevenLabs](https://elevenlabs.io/)
* [Vosk](https://alphacephei.com/vosk/)
* [FastAPI](https://fastapi.tiangolo.com/)
* [Render](https://render.com/)
* [Vercel](https://vercel.com/)
* [Pydub](https://github.com/jiaaro/pydub)
* [inflect](https://pypi.org/project/inflect/)
* [dateutil](https://dateutil.readthedocs.io/en/stable/)
* [Shields.io](https://shields.io/) (for badges)
