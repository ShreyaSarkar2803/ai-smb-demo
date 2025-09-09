import { motion } from "framer-motion";
import { Video, Phone, MoreVertical } from "lucide-react";

export default function FakeWhatsApp({ message }) {
  const formatMessage = (text) => {
    return text.split("\n").map((line, index) => (
      <span key={index}>
        {line}
        <br />
      </span>
    ));
  };

  return (
    <div className="w-full rounded-3xl shadow-xl overflow-hidden text-gray-200 font-sans bg-black/70 backdrop-blur-lg border border-gray-700 relative">
      {/* Header */}
      <div className="w-full px-4 py-3 bg-[#202c33] flex items-center justify-between" style={{ minHeight: "64px" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center text-gray-100 font-bold text-lg">
            F
          </div>
          <div>
            <h3 className="font-semibold text-gray-100 text-lg select-none">Fleur Salon</h3>
            <p className="text-sm text-gray-400 select-none">online</p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-gray-400">
          <Video className="w-6 h-6 hover:text-gray-200 cursor-pointer transition-colors" />
          <Phone className="w-6 h-6 hover:text-gray-200 cursor-pointer transition-colors" />
          <MoreVertical className="w-6 h-6 hover:text-gray-200 cursor-pointer transition-colors" />
        </div>
      </div>

      {/* Chat Content */}
      <div
        className="w-full p-4 relative"
        style={{
          backgroundImage:
            "url('https://i.pinimg.com/736x/8c/98/99/8c98994518b575bfd8c949e91d20548b.jpg')", // subtle WhatsApp bg pattern
          backgroundSize: "cover",
          backgroundRepeat: "repeat",
        }}
      >
        <div className="absolute inset-0 bg-[#111b21]/90" />

        <div className="pt-2 h-96 flex flex-col relative z-10 overflow-y-auto">
          {message && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-[#2a3942] text-gray-100 px-3 py-2 rounded-lg shadow-md max-w-xs break-words text-sm leading-relaxed relative self-start"
              style={{
                borderRadius: "7.5px",
                borderTopLeftRadius: "2px",
                marginBottom: "1rem",
              }}
            >
              {/* Bubble tail */}
              <div className="absolute -left-2 top-0 w-0 h-0 border-t-[8px] border-r-[8px] border-solid border-transparent border-t-[#2a3942]"></div>

              {/* Message */}
              {formatMessage(message)}

              {/* Timestamp */}
              <div className="flex items-center justify-end gap-1 mt-1">
                <span className="text-[11px] text-gray-300/80">
                  {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}