import { useState, useRef, useEffect } from "react";
import { Mic, Loader2, PhoneCall, Volume2, VolumeX, MicOff, ArrowLeft, PhoneOff, BellRing } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FakeWhatsApp from "./FakeWhatsApp";
import Dashboard from "./Dashboard";

// Import the audio files. Ensure these paths are correct.
import ringtoneFile from "/audio/ringtone.mp3"; 
import greetingEnglish from "/audio/greeting_afternoon.mp3";
import greetingHindi from "/audio/greeting_afternoon_hi.mp3";

const generateSessionId = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

const PhoneScreen = ({ 
  handleEndCall, 
  callDuration, 
  isCalling,
  isRecording,
  waitingForAI,
  conversation,
  startRecording,
  stopRecording,
  chatEndRef,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);

  return (
    <div className="relative flex flex-col items-center p-2 bg-gray-950 text-white rounded-[2.5rem] shadow-2xl border-4 border-gray-700 w-full max-w-sm mx-auto mb-8 aspect-[9/16] overflow-hidden">
      {/* Calling UI */}
      {isCalling ? (
        <div className="flex flex-col items-center justify-center flex-grow text-center mt-12">
          <p className="text-xl font-semibold text-white mb-2">Fleur Salon</p>
          <p className="text-green-400 font-semibold text-lg animate-pulse mb-8">📞 Calling...</p>
          <PhoneCall
            className={`w-16 h-16 rounded-full p-2 border-4 animate-pulse shadow-green-500/60 bg-green-700 text-white border-green-500`}
          />
        </div>
      ) : (
        <>
          {/* Active Call UI */}
          <div className="flex justify-between items-center w-full px-4 pt-2 pb-1 bg-gray-950/80 backdrop-blur-sm z-20">
            <button className="text-white">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="text-center flex-1">
              <p className="bg-green-600/50 text-xs font-mono tracking-wider text-green-200 px-1 py-0.5 rounded-full mb-1">{formatTime(callDuration)}</p>
              <p className="text-lg font-semibold text-white">Fleur Salon</p>
              <p className="text-xs text-violet-400 uppercase tracking-wide">Call Transcript</p>
            </div>
            <button 
              onClick={handleEndCall}
              className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center shadow-lg transition-transform hover:scale-105"
            >
              <PhoneOff className="w-5 h-5 text-white" />
            </button>
          </div>
          
          {/* Notification placeholder (removed from this component to be consistent with Showroom) */}
          <AnimatePresence>
            {/* ... */}
          </AnimatePresence>

          <div
            ref={chatEndRef}
            className="flex-1 flex flex-col gap-4 w-full p-4 overflow-y-auto"
          >
            {conversation.map(({ user, ai }, idx) => (
              <div key={idx}>
                {user && (
                  <div className="flex justify-end">
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-gradient-to-br from-violet-900 via-violet-800 to-indigo-900 text-white self-end shadow-xl border border-violet-800 rounded-3xl rounded-br-none px-5 py-3 max-w-md break-words whitespace-pre-wrap"
                    >
                      {user}
                      <span className="text-xs text-white/70 block mt-1 text-right">You</span>
                    </motion.div>
                  </div>
                )}
                {ai && (
                  <div className="flex justify-start">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-gray-800/90 text-gray-100 self-start border border-gray-700/70 shadow-gray-950/70 rounded-3xl rounded-bl-none px-5 py-3 max-w-md break-words whitespace-pre-wrap"
                    >
                      {ai}
                      <span className="text-xs text-gray-400 block mt-1">AI</span>
                    </motion.div>
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="w-full flex flex-col items-center p-4 bg-gray-950 rounded-b-[2rem]">
            {waitingForAI && (
              <div className="flex justify-center items-center gap-2 text-gray-400 animate-pulse my-2">
                <Loader2 className="animate-spin w-6 h-6" />
                <p className="text-sm">Processing AI reply...</p>
              </div>
            )}
            {!isRecording && !waitingForAI && (
              <button
                onClick={startRecording}
                className="w-full mt-2 py-3 rounded-full text-lg shadow-xl text-white font-bold bg-gradient-to-r from-violet-700 to-indigo-900 hover:from-violet-600 hover:to-indigo-800 transform transition-all duration-300 hover:scale-105"
              >
                Start Speaking
              </button>
            )}
            {isRecording && (
              <button
                onClick={stopRecording}
                className="w-full mt-2 py-3 rounded-full text-lg shadow-xl text-white font-bold bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 transform transition-all duration-300 hover:scale-105"
              >
                Stop Speaking
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};


export default function TestDrive() {
  const [calling, setCalling] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [waitingForAI, setWaitingForAI] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const [language, setLanguage] = useState("English");
  const [transcript, setTranscript] = useState("");
  const [reply, setReply] = useState("");
  const [conversation, setConversation] = useState([]);

  const [bookings, setBookings] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [messages, setMessages] = useState([]);
  const [whatsappMessage, setWhatsappMessage] = useState("");

  const audioContextRef = useRef(null);
  const recorderRef = useRef(null);
  const audioDataRef = useRef([]);
  const sourceNodeRef = useRef(null);
  const streamRef = useRef(null);
  const chatEndRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const ringtoneRef = useRef(null); 
  const greetingAudioRef = useRef(null); // Ref for the greeting audio

  const langCodeMap = {
    English: "en",
    Hindi: "hi",
  };

  const sessionIdRef = useRef(generateSessionId());

  // Function to play the ringtone
  const playRingtone = () => {
    if (!ringtoneRef.current) {
        ringtoneRef.current = new Audio(ringtoneFile);
        ringtoneRef.current.loop = true;
    }
    ringtoneRef.current.play().catch(e => console.error("Ringtone playback failed:", e));
  };

  // Function to stop the ringtone
  const stopRingtone = () => {
    if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current.currentTime = 0;
    }
  };
 
  // Function to play the greeting audio
  const playGreetingAudio = () => {
    const greetingFile = language === "Hindi" ? greetingHindi : greetingEnglish;
    if (greetingAudioRef.current) {
        greetingAudioRef.current.pause();
        greetingAudioRef.current = null;
    }
    const audio = new Audio(greetingFile);
    greetingAudioRef.current = audio;
    audio.play().catch(e => console.error("Greeting audio playback failed:", e));
};

  const encodeWAV = (samples, sampleRate) => {
    const bufferLength = samples.length * 2 + 44;
    const buffer = new ArrayBuffer(bufferLength);
    const view = new DataView(buffer);

    function writeString(view, offset, string) {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    }

    let offset = 0;
    writeString(view, offset, "RIFF");
    offset += 4;
    view.setUint32(offset, bufferLength - 8, true);
    offset += 4;
    writeString(view, offset, "WAVE");
    offset += 4;
    writeString(view, offset, "fmt ");
    offset += 4;
    view.setUint32(offset, 16, true);
    offset += 4;
    view.setUint16(offset, 1, true);
    offset += 2;
    view.setUint16(offset, 1, true);
    offset += 2;
    view.setUint32(offset, sampleRate, true);
    offset += 4;
    view.setUint32(offset, sampleRate * 2, true);
    offset += 4;
    view.setUint16(offset, 2, true);
    offset += 2;
    view.setUint16(offset, 16, true);
    offset += 2;
    writeString(view, offset, "data");
    offset += 4;
    view.setUint32(offset, bufferLength - offset - 4, true);
    offset += 4;

    for (let i = 0; i < samples.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, samples[i]));
      s = s < 0 ? s * 0x8000 : s * 0x7fff;
      view.setInt16(offset, s, true);
    }

    return new Blob([view], { type: "audio/wav" });
  };

  const startTimer = () => {
    stopTimer();
    timerIntervalRef.current = setInterval(() => {
      setCallDuration((prevDuration) => prevDuration + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

    // Cleanup the ringtone and greeting audio on component unmount
    useEffect(() => {
        return () => {
            stopRingtone();
            if (greetingAudioRef.current) {
                greetingAudioRef.current.pause();
                greetingAudioRef.current = null;
            }
        };
    }, []);

  const handleCallBusiness = () => {
    setCalling(true);
    setInCall(false);
    setWaitingForAI(false);
    setCallEnded(false);
    setIsRecording(false);
    setCallDuration(0);

    setConversation([]);
    setBookings(0);
    setRevenue(0);
    setMessages([]);
    setWhatsappMessage("");
    setTranscript("");
    setReply("");
    audioDataRef.current = [];
    
    // Play the ringtone when the "Calling" screen appears
    playRingtone();

    setTimeout(() => {
      setCalling(false);
      setInCall(true);
      // Stop the ringtone when the call is answered
      stopRingtone();
      playGreetingAudio(); // Play the greeting audio
      startTimer();
      setConversation((prev) => [
        ...prev,
        {
          user: "",
          ai:
            language === "Hindi"
              ?  "नमस्ते, यह फ्लौर सैलून है — मैं आपकी कैसे मदद कर सकती हूँ?"
              : "Good afternoon, this is Fleur Salon — how may I help you today?",
        },
      ]);
    }, 3000);
  };

  const handleEndCall = () => {
    setInCall(false);
    setCalling(false);
    setWaitingForAI(false);
    setIsRecording(false);
    stopTimer();
    setCallDuration(0);
    // Stop the ringtone if the call is ended before it is answered
    stopRingtone();
    if (greetingAudioRef.current) {
        greetingAudioRef.current.pause();
    }
  };

  const startRecording = async () => {
    if (isRecording || waitingForAI || callEnded) return;

    try {
      setTranscript("");
      setReply("");
      setWhatsappMessage("");
      audioDataRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
      sourceNodeRef.current = audioContextRef.current.createMediaStreamSource(
        stream
      );

      const scriptNode = audioContextRef.current.createScriptProcessor(
        4096,
        1,
        1
      );
      scriptNode.onaudioprocess = (audioProcessingEvent) => {
        const inputBuffer = audioProcessingEvent.inputBuffer;
        const inputData = inputBuffer.getChannelData(0);
        audioDataRef.current.push(new Float32Array(inputData));
      };

      sourceNodeRef.current.connect(scriptNode);
      scriptNode.connect(audioContextRef.current.destination);
      recorderRef.current = scriptNode;

      setIsRecording(true);
    } catch (error) {
      console.error("Microphone access denied or error: ", error);
      setInCall(false);
      setIsRecording(false);
      stopTimer();
    }
  };

  const stopRecording = async () => {
    if (!audioContextRef.current || !isRecording) return;

    recorderRef.current.disconnect();
    sourceNodeRef.current.disconnect();
    streamRef.current.getTracks().forEach((track) => track.stop());
    const sampleRate = audioContextRef.current.sampleRate;
    await audioContextRef.current.close();

    const length = audioDataRef.current.reduce(
      (acc, cur) => acc + cur.length,
      0
    );
    const flatBuffer = new Float32Array(length);
    let offset = 0;
    for (const chunk of audioDataRef.current) {
      flatBuffer.set(chunk, offset);
      offset += chunk.length;
    }

    const wavBlob = encodeWAV(flatBuffer, sampleRate);

    setIsRecording(false);
    setWaitingForAI(true);

    try {
      const formData = new FormData();
      formData.append("audio", wavBlob, "user_audio.wav");
      formData.append("lang", langCodeMap[language]);
      formData.append("session_id", sessionIdRef.current);

      const response = await fetch("https://7068f4ea65bb.ngrok-free.app/chat", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Network response failed");

      const data = await response.json();

      setTranscript(data.transcript || "");
      setReply(data.ai_reply || "");

      setConversation((prev) => [
        ...prev,
        { user: data.transcript || "", ai: data.ai_reply || "" },
      ]);

      if (data.booking_successful) {
        setBookings((prev) => prev + 1);
        setRevenue((prev) => prev + (data.booking_price ?? 0));
        setMessages((prev) => [data.confirmation_message, ...prev]);
        setWhatsappMessage(data.confirmation_message);
        setCallEnded(true);
        setInCall(false);
        stopTimer();
      }
      if (data.audio_base64) {
        const audioUrl = `data:audio/mpeg;base64,${data.audio_base64}`;
        const audio = new Audio(audioUrl);
        audio.play();
      }
    } catch (error) {
      console.error("API call error:", error);
    } finally {
      setWaitingForAI(false);
    }
  };

  return (
    <div
      className="flex flex-col items-center min-h-screen gap-6 p-6 relative overflow-hidden text-gray-200"
      style={{
        background:
          "linear-gradient(135deg, #020205 0%, #080312 60%, #0e0620 100%)",
      }}
    >
      {/* Glow backgrounds */}
      <div className="absolute top-10 left-1/3 w-[550px] h-[300px] bg-purple-950 opacity-40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[700px] h-[400px] bg-indigo-950 opacity-40 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 w-[300px] h-[200px] bg-purple-950 opacity-40 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-[200px] bg-gradient-to-b from-purple-950 to-transparent opacity-30 pointer-events-none" />

      <h1 className="text-3xl font-extrabold tracking-tight">
        Start Your AI-Powered Experience
      </h1>

      <div className="flex flex-col md:flex-row gap-10 w-full max-w-7xl px-4 z-10">
        <div className="flex-1 flex flex-col items-center gap-6 bg-[#0a0818]/70 backdrop-blur-lg rounded-3xl shadow-xl border border-violet-900/50 p-10 max-w-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-950/10 via-indigo-950/10 to-transparent rounded-3xl pointer-events-none"></div>
          <div className="relative z-20 w-full flex flex-col items-center gap-8">
            {/* Language Selection & Call Button */}
            {!calling && !inCall && !callEnded && (
              <>
                <div className="text-center w-full">
                  <h3 className="text-violet-500 text-xl font-semibold mb-3 tracking-wide">Select A Language</h3>
                  <div className="w-20 h-1 mx-auto rounded-full bg-gradient-to-r from-violet-600 to-indigo-700 shadow-lg"></div>
                </div>
                <div className="flex gap-4 w-full justify-center">
                  {["English", "Hindi"].map((lang) => (
                    <button
                      key={lang}
                      disabled={waitingForAI || isRecording}
                      onClick={() => setLanguage(lang)}
                      className={`
                        flex-1 py-3 rounded-full font-semibold transition-all duration-300 shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-500 hover:scale-[1.05]
                        ${
                          language === lang
                            ? "bg-gradient-to-r from-violet-700 to-indigo-900 text-gray-100 shadow-lg"
                            : "bg-[#0f0b22] border border-violet-800/50 text-violet-500 hover:bg-violet-900/30"
                        }
                      `}
                      type="button"
                    >
                      {lang}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleCallBusiness}
                  className="w-full mt-4 py-4 rounded-2xl shadow-lg bg-gradient-to-r from-violet-800 to-indigo-900 text-white font-semibold transition-all hover:scale-[1.02] hover:brightness-110"
                >
                  Call Business ({language})
                </button>
              </>
            )}

            {/* Phone Screen UI (conditionally rendered) */}
            {(calling || inCall) && (
              <PhoneScreen
                handleEndCall={handleEndCall}
                callDuration={callDuration}
                isCalling={calling}
                isRecording={isRecording}
                waitingForAI={waitingForAI}
                conversation={conversation}
                startRecording={startRecording}
                stopRecording={stopRecording}
                chatEndRef={chatEndRef}
              />
            )}

            {/* Call ended message */}
            {callEnded && (
              <div className="mt-4 p-6 bg-green-900/50 rounded-lg shadow-lg text-green-300 max-w-md text-center border border-green-800 animate-fadeIn">
                Booking confirmed and WhatsApp message sent. The call has ended.
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-6 w-full md:w-1/2 mt-6 md:mt-0">
          <Dashboard
            bookings={bookings}
            revenue={revenue}
            messages={messages}
          />
          <FakeWhatsApp message={whatsappMessage} />
        </div>
      </div>
    </div>
  );
}