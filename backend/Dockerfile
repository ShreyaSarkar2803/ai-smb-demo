# Use an official Python runtime as a parent image. Python 3.9 is a good stable choice.
FROM python:3.11-slim-bullseye

# Set the working directory inside the container
WORKDIR /app

# Install system dependencies:
# - ffmpeg: Required by pydub for audio processing.
# - git: Required to clone Vosk models if you prefer that method.
# - unzip: Required to extract the downloaded Vosk model archives.
# - build-essential: Often needed for compiling Python packages with C extensions.
# Clean up apt lists to keep image size down.
# Install system dependencies:
# - ffmpeg: Required by pydub for audio processing.
# - git: Required for cloning, though wget is used for vosk models.
# - unzip: Required to extract the downloaded Vosk model archives.
# - build-essential: Often needed for compiling Python packages with C extensions.
# DEBIAN_FRONTEND=noninteractive: Prevents interactive prompts during installation.
# --no-install-recommends: Avoids installing recommended but not strictly required packages,
#                          which can reduce image size and potential for conflicts.
# Clean up apt lists to keep image size down.
RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    ffmpeg \
    git \
    unzip \
    build-essential \
    portaudio19-dev \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Copy your local project code into the container's working directory (/app)
# Since Render will set the root to 'backend/', '.' here refers to 'backend/'
COPY . /app

# Install Python dependencies from requirements.txt
# --no-cache-dir reduces image size
RUN pip install --no-cache-dir -r requirements.txt

# --- Vosk Model Download ---
# This is a critical step for free hosting. Models are downloaded directly into the container
# during the build phase. This ensures they are available on the ephemeral filesystem.

# Create directories for models
RUN mkdir -p /app/models/english
RUN mkdir -p /app/models/hindi

# Download and extract the English Vosk model (small version for free tier)
RUN wget -O /tmp/vosk-model-small-en-us-0.15.zip https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip && \
    unzip /tmp/vosk-model-small-en-us-0.15.zip -d /app/models/english && \
    mv /app/models/english/vosk-model-small-en-us-0.15 /app/models/english/english && \
    rm /tmp/vosk-model-small-en-us-0.15.zip

# Download and extract the Hindi Vosk model
RUN wget -O /tmp/vosk-model-hi-0.22.zip https://alphacephei.com/vosk/models/vosk-model-hi-0.22.zip && \
    unzip /tmp/vosk-model-hi-0.22.zip -d /app/models/hindi && \
    mv /app/models/hindi/vosk-model-hi-0.22 /app/models/hindi/hindi && \
    rm /tmp/vosk-model-hi-0.22.zip

# Expose the port that your FastAPI application will listen on
EXPOSE 8000

# Define the command to run your application using gunicorn with uvicorn workers
# "main:app" refers to the 'app' object in your 'main.py' file.
CMD ["gunicorn", "main:app", "--workers", "1", "--worker-class", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
