import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PhoneCall, Volume2, VolumeX, Mic, MicOff, ArrowLeft, PhoneOff, BellRing } from "lucide-react";
import FakeWhatsApp from "./FakeWhatsApp";
import Dashboard from "./Dashboard";


const DEMO_LINES = {
  en: [
    { speaker: "ai", text: "Good afternoon, this is Fleur Salon — how may I help you today?", audio: "/audio/greeting_afternoon.mp3" },
    { speaker: "user", text: "Hi, I’d like to book an appointment.", audio: "/audio/caller_request_appointment.mp3" },
    { speaker: "ai", text: "Absolutely! May I have your name, please?", audio: "/audio/ask_name.mp3" },
    { speaker: "user", text: "Yes, it's Harshita.", audio: "/audio/caller_name_harshita.mp3" },
    { speaker: "ai", text: "Thank you, Harshita. What service would you like to book today?", audio: "/audio/ask_service.mp3" },
    { speaker: "user", text: "I’d like to book for haircut.", audio: "/audio/caller_service_haircut.mp3" },
    { speaker: "ai", text: "Ofcourse! Our haircut service is ₹500. When would you like to come in — do you have a preferred date and time?", audio: "/audio/confirm_service_price.mp3" },
    { speaker: "user", text: "Yes, are you available on 7th September at 4 PM?", audio: "/audio/caller_preferred_time_sept7_4pm.mp3" },
    { speaker: "ai", text: "Let me check… yes, slot is available on 7th September at 4 PM. Shall I confirm it under your name, Harshita?", audio: "/audio/confirm_slot_availability.mp3" },
    { speaker: "user", text: "Yes, please.", audio: "/audio/caller_confirmation.mp3" },
    { speaker: "ai", text: "Wonderful — your haircut appointment is confirmed for 7th of September at 4 PM under the name Harshita. The service charge is ₹500. I've sent you the booking confirmation via WhatsApp ✅", audio: "/audio/booking_confirmation.mp3" },
    { speaker: "user", text: "Great! Thank you so much", audio: "/audio/caller_thanks.mp3" },
    { speaker: "ai", text: "You’re very welcome. We look forward to seeing you then. Have a lovely day!", audio: "/audio/farewell.mp3" },
  ],
  hi: [
    { speaker: "ai", text: "नमस्ते, यह फ्लौर सैलून है — मैं आपकी कैसे मदद कर सकती हूँ?", audio: "/audio/greeting_afternoon_hi.mp3" },
    { speaker: "user", text: "हाँ, मैं एक अपॉइंटमेंट बुक करना चाहती हूँ।।", audio: "/audio/caller_request_appointment_hi.mp3" },
    { speaker: "ai", text: "बिल्कुल! कृपया अपना नाम बताएं।।", audio: "/audio/ask_name_hi.mp3" },
    { speaker: "user", text: "हर्षिता।", audio: "/audio/caller_name_harshita_hi.mp3" },
    { speaker: "ai", text: "धन्यवाद, हर्षिता। आप कौन-सी सेवा बुक करना चाहती हैं?", audio: "/audio/ask_service_hi.mp3" },
    { speaker: "user", text: "मैं हेयरकट के लिए बुक करना चाहती हूँ।", audio: "/audio/caller_service_haircut_hi.mp3" },
    { speaker: "ai", text: "बिल्कुल! हमारी हेयरकट सेवा ₹500 है। आप कब आना चाहेंगी? क्या आपके पास कोई पसंदीदा दिन और समय है?", audio: "/audio/confirm_service_price_hi.mp3" },
    { speaker: "user", text: "हाँ, क्या ७ सितंबर को शाम ४ बजे समय है?", audio: "/audio/caller_preferred_time_sept7_4pm_hi.mp3" },
    { speaker: "ai", text: "मैं जांचती हूँ... हाँ, ७ सितंबर को शाम ४ बजे स्लॉट उपलब्ध है। क्या मैं आपका नाम लेकर बुकिंग कंफर्म कर दूँ?", audio: "/audio/confirm_slot_availability_hi.mp3" },
    { speaker: "user", text: "हाँ, कृपया करें।", audio: "/audio/caller_confirmation_hi.mp3" },
    { speaker: "ai", text: "बहुत अच्छा — आपकी हेयरकट अपॉइंटमेंट ७ सितंबर को शाम ४ बजे के लिए हर्षिता के नाम कन्फर्म हो गई है। सेवा शुल्क ₹500 होगा। मैंने आपको व्हाट्सएप पर बुकिंग कन्फर्मेशन भेज दी है ✅", audio: "/audio/booking_confirmation_hi.mp3" },
    { speaker: "user", text: "बहुत-बहुत धन्यवाद।", audio: "/audio/caller_thanks_hi.mp3" },
    { speaker: "ai", text: "आपका स्वागत है। हम आपका सहयोग करने के लिए तत्पर हैं। आपका दिन मंगलमय हो!", audio: "/audio/farewell_hi.mp3" },
  ],
};


const CONFIRM_MSG = {
  en: "✅ Appointment confirmed for 7th September at 4 PM",
  hi: "✅ ७ सितंबर को शाम ४ बजे अपॉइंटमेंट कन्फर्म हो गया है",
};


const WHATSAPP_MSG = {
  en: "Fleur Salon ✂✨\n Hello Harshita, \n Your appointment has been confirmed: \n Service: Haircut \n Date: Sunday, 7 September 2025 \n Time: 4:00 PM \n Stylist: Rina\n📍 Location: Fleur Salon, MG Road, New Delhi \n ⏱ Please arrive 5 minutes early. \n We look forward to seeing you! 💇🏻‍♀",
  hi: "फ्लौर सैलून ✂\nनमस्ते हर्षिता,\nआपकी अपॉइंटमेंट कन्फर्म हो गई है:\nसेवा: हेयरकट\nतारीख: रविवार, 7 सितंबर 2025\nसमय: शाम 4:00 बजे\nस्टाइलिस्ट: रिना\n📍 स्थान: फ्लौर सैलून, एमजी रोड, नई दिल्ली\n⏱ कृपया 5 मिनट पहले पहुंचें।\nहम आपका स्वागत करने के लिए उत्सुक हैं! 💇🏻‍♀",
};


function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
}


const PhoneScreen = ({ linesShown, handleEndCall, conversationRef, showNotification, callDuration, isCalling }) => {
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
            <div className="text-center flex-1 flex flex-col items-center">
              <p className="bg-green-600/50 text-xs font-mono tracking-wider text-green-200 px-2 py-1 rounded-full mb-1">{formatTime(callDuration)}</p>
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

          {/* WhatsApp Notification */}
          <AnimatePresence>
          {showNotification && (
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute top-20 flex justify-center w-full z-30"
            >
              <div className="w-[90%] bg-green-700 rounded-xl p-3 flex items-center gap-3 shadow-xl">
                <BellRing className="w-5 h-5 text-green-300" />
                <div className="flex flex-col text-sm">
                  <span className="font-semibold text-white">WhatsApp</span>
                  <span className="text-xs text-green-200">New message from Fleur Salon</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        

          <div
            ref={conversationRef}
            className="flex-1 flex flex-col gap-4 w-full p-4 overflow-y-auto"
          >
            {linesShown.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`max-w-[75%] p-3 rounded-2xl shadow-lg transition-transform duration-200 ${
                  line.speaker === "ai"
                    ? "bg-gray-800/90 text-gray-100 self-start border border-gray-700/70 rounded-bl-none"
                    : "bg-gradient-to-br from-violet-900 via-violet-800 to-indigo-900 text-white self-end rounded-br-none border border-violet-800"
                } break-words whitespace-pre-wrap`}
              >
                {line.text}
              </motion.div>
            ))}
          </div>


          <div className="w-full flex flex-col items-center p-4 bg-gray-950 rounded-b-[2rem]">
            <div className="relative flex items-center w-full">
              <input
                type="text"
                placeholder="Type response"
                className="flex-1 bg-gray-800/90 text-gray-300 rounded-full px-4 py-2 pl-12 focus:outline-none"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};


export default function Showroom() {
  const [selectedLang, setSelectedLang] = useState("en");
  const [linesShown, setLinesShown] = useState([]);
  const [step, setStep] = useState(0);
  const [recording, setRecording] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [bookings, setBookings] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [messages, setMessages] = useState([]);
  const [whatsappMessage, setWhatsappMessage] = useState("");
  const [callDuration, setCallDuration] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const audioRef = useRef(null);
  const ringtoneRef = useRef(null);
  const conversationRef = useRef(null);
  const timerIntervalRef = useRef(null);
  
  // New state to manage the FakeWhatsApp messages
  const [fakeWhatsAppMessages, setFakeWhatsAppMessages] = useState(WHATSAPP_MSG.en);


  function playRingtone() {
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current = null;
    }
    ringtoneRef.current = new Audio("/audio/ringtone.mp3");
    ringtoneRef.current.loop = true;
    ringtoneRef.current.play().catch((err) => console.warn("Ringtone play prevented:", err));
  }


  function stopRingtone() {
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current = null;
    }
  }
  
  function startTimer() {
    stopTimer();
    timerIntervalRef.current = setInterval(() => {
      setCallDuration((prevDuration) => prevDuration + 1);
    }, 1000);
  }
  
  function stopTimer() {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }


  function playAudio(src) {
    return new Promise((resolve) => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      const audio = new Audio(src);
      audioRef.current = audio;
      audio.onended = () => resolve();
      audio.onerror = () => resolve(); 
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => resolve()); 
      }
    });
  }


  const resetDemo = () => {
    setLinesShown([]);
    setStep(0);
    setInCall(false);
    setRecording(false);
    setBookings(0);
    setRevenue(0);
    setMessages([]);
    setWhatsappMessage("");
    setCallDuration(0);
    setShowNotification(false);
    stopRingtone();
    stopTimer();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };
  
  const handleEndCall = () => {
    setInCall(false);
    stopTimer();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setLinesShown([]);
    setStep(0);
    setRecording(false);
    setCallDuration(0);
    setShowNotification(false);
  };


  const handleStartCall = () => {
    setLinesShown([]);
    setStep(0);
    setBookings(0);
    setRevenue(0);
    setMessages([]);
    setWhatsappMessage("");
    setCallDuration(0);
    setShowNotification(false);


    playRingtone();
    setRecording(true);
    setInCall(false); 


    setTimeout(() => {
      setRecording(false);
      stopRingtone();
      setInCall(true);
      startTimer();
      setStep(0);
    }, 3000);
  };


  const handleLangChange = (lang) => {
    setSelectedLang(lang);
    setLinesShown([]);
    setStep(0);
    setInCall(false);
    setRecording(false);
    setBookings(0);
    setRevenue(0);
    setMessages([]);
    setWhatsappMessage("");
    setCallDuration(0);
    setShowNotification(false);
    stopRingtone();
    stopTimer();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };


  useEffect(() => {
    let isMounted = true;
    async function runConversationStep() {
      if (!inCall || recording || !isMounted) return;
      
      const currentLines = DEMO_LINES[selectedLang];


      if (step < currentLines.length) {
        const line = currentLines[step];
        setLinesShown((prev) => [...prev, line]);
        await playAudio(line.audio);
        await new Promise((res) => setTimeout(res, 1500));


        if (isMounted && inCall) {
          setStep(step + 1);
        }
      } else {
        // Conversation finished
        await new Promise((res) => setTimeout(res, 2000));
        setInCall(false);
        stopTimer();
        setBookings((b) => b + 1);
        setRevenue((r) => r + 500);
        setMessages((m) => [CONFIRM_MSG[selectedLang], ...m]);
        setWhatsappMessage(WHATSAPP_MSG[selectedLang]);
      }
    }
    runConversationStep();


    return () => {
      isMounted = false;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inCall, recording, selectedLang, step]);


  // Trigger WhatsApp notification at a specific step
  useEffect(() => {
    if (inCall && step === DEMO_LINES[selectedLang].findIndex(line => line.speaker === "ai" && line.text.includes("WhatsApp")) + 1) {
      setShowNotification(true);
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, selectedLang]);


  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [linesShown]);


  return (
    <div className="flex flex-col items-center min-h-screen gap-6 p-6 relative overflow-hidden text-gray-200"
      style={{ background: "linear-gradient(135deg, #020205 0%, #080312 60%, #0e0620 100%)" }}>
      {/* Glows */}
      <div className="absolute top-10 left-1/3 w-[550px] h-[300px] bg-purple-950 opacity-40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[700px] h-[400px] bg-indigo-950 opacity-40 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/4 w-[300px] h-[200px] bg-purple-950 opacity-40 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-[200px] bg-gradient-to-b from-purple-950 to-transparent opacity-30 pointer-events-none"></div>


      {/* Header */}
      <div className="relative z-10 text-center mb-10 max-w-3xl px-4">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-tr from-violet-300/80 via-purple-200/80 to-indigo-200/80 bg-clip-text text-transparent drop-shadow-3xl">
          VocalAIze – Demo Mode
        </h1>
        <div className="w-40 h-1 mx-auto mt-6 rounded-full bg-gradient-to-r from-violet-500 to-indigo-700 shadow-lg"></div>
      </div>


      <div className="flex flex-col md:flex-row gap-10 w-full max-w-7xl px-4">
        {/* Left panel */}
        <div className="flex-1 flex flex-col items-center gap-6 bg-[#0a0818]/70 backdrop-blur-lg rounded-3xl shadow-xl border border-violet-900/50 p-10 max-w-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-950/10 via-indigo-950/10 to-transparent rounded-3xl pointer-events-none"></div>
          <div className="relative z-20 w-full flex flex-col items-center gap-8">
            {/* Language Selection & Call Button */}
            {(!inCall && !recording) && (
              <>
                <div className="text-center w-full">
                  <h3 className="text-violet-500 text-xl font-semibold mb-3 tracking-wide">Select A Language</h3>
                  <div className="w-20 h-1 mx-auto rounded-full bg-gradient-to-r from-violet-600 to-indigo-700 shadow-lg"></div>
                </div>
                <div className="flex gap-4 w-full justify-center">
                  {["English", "Hindi"].map((lang) => (
                    <button
                      key={lang}
                      disabled={inCall || recording}
                      onClick={() => handleLangChange(lang === "English" ? "en" : "hi")}
                      className={`flex-1 py-3 rounded-full font-semibold transition-all duration-300 shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-500 hover:scale-[1.05] ${
                        selectedLang === (lang === "English" ? "en" : "hi")
                          ? "bg-gradient-to-r from-violet-700 to-indigo-900 text-gray-100 shadow-lg"
                          : "bg-[#0f0b22] border border-violet-800/50 text-violet-500 hover:bg-violet-900/30"
                      }`}
                      type="button"
                    >
                      {lang}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleStartCall}
                  className="w-full mt-4 py-4 rounded-2xl shadow-lg bg-gradient-to-r from-violet-800 to-indigo-900 text-white font-semibold transition-all hover:scale-[1.02] hover:brightness-110"
                >
                  Call Business ({selectedLang === "en" ? "English" : "Hindi"})
                </button>
              </>
            )}
            
            {(inCall || recording) && (
              <PhoneScreen 
                linesShown={linesShown}
                handleEndCall={handleEndCall}
                conversationRef={conversationRef}
                showNotification={showNotification}
                callDuration={callDuration}
                isCalling={recording}
              />
            )}
          </div>
        </div>


        <div className="flex-1 flex flex-col gap-6 w-full md:w-1/2 mt-6 md:mt-0">
          <Dashboard bookings={bookings} revenue={revenue} messages={messages} />
          <FakeWhatsApp message={whatsappMessage} initialMessages={fakeWhatsAppMessages} />
        </div>
      </div>
    </div>
  );
}