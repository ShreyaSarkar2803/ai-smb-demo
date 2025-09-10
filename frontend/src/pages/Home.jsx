import { useState } from 'react';
import { Link } from 'react-router-dom'; // Import the Link component

export default function Home() {
  const [selectedLanguage, setSelectedLanguage] = useState('english');

  return (
    <div className="min-h-screen text-gray-200 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #020205 0%, #080312 60%, #0e0620 100%)" }}>
      {/* Glows */}
      <div className="absolute top-10 left-1/3 w-[550px] h-[300px] bg-purple-950 opacity-40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[700px] h-[400px] bg-indigo-950 opacity-40 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/4 w-[300px] h-[200px] bg-purple-950 opacity-40 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-[200px] bg-gradient-to-b from-purple-950 to-transparent opacity-30 pointer-events-none"></div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="mb-8">
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-tr from-violet-300/80 via-purple-200/80 to-indigo-200/80 bg-clip-text text-transparent drop-shadow-3xl mb-4">
                VocalAIze
              </h1>
              <p className="text-xl md:text-2xl text-violet-300 font-medium">
                Intelligent AI Receptionist for Your Business
              </p>
              <div className="w-40 h-1 mx-auto mt-6 rounded-full bg-gradient-to-r from-violet-500 to-indigo-700 shadow-lg"></div>
            </div>
            
            <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
              Experience the future of customer service with our AI-powered receptionist that handles calls, 
              makes bookings, answers questions, and provides seamless customer interactions in both 
              <span className="font-semibold text-violet-400"> English</span> and 
              <span className="font-semibold text-indigo-400"> Hindi</span>.
            </p>

            {/* Language Selection */}
            <div className="mb-8">
              <p className="text-sm text-violet-400 mb-3">Select your preferred language:</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setSelectedLanguage('english')}
                  className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-500 hover:scale-[1.05] ${
                    selectedLanguage === 'english'
                      ? 'bg-gradient-to-r from-violet-700 to-indigo-900 text-gray-100 shadow-lg'
                      : 'bg-[#0f0b22] border border-violet-800/50 text-violet-500 hover:bg-violet-900/30'
                  }`}
                >
                  🇺🇸 English
                </button>
                <button
                  onClick={() => setSelectedLanguage('hindi')}
                  className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-500 hover:scale-[1.05] ${
                    selectedLanguage === 'hindi'
                      ? 'bg-gradient-to-r from-violet-700 to-indigo-900 text-gray-100 shadow-lg'
                      : 'bg-[#0f0b22] border border-violet-800/50 text-violet-500 hover:bg-violet-900/30'
                  }`}
                >
                  🇮🇳 हिंदी
                </button>
              </div>
            </div>

            {/* Main CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link
                to="/demo" // Use 'to' prop for React Router
                className="group px-8 py-4 bg-gradient-to-r from-violet-800 to-indigo-900 text-white rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 hover:scale-[1.02] hover:brightness-110"
              >
                Guided Demo Experience
                <span className="ml-2 group-hover:translate-x-1 transition-transform inline-block">→</span>
              </Link>
              <Link
                to="/live" // Use 'to' prop for React Router
                className="group px-8 py-4 bg-gradient-to-r from-violet-700 to-indigo-800 text-white rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 hover:scale-[1.02] hover:brightness-110"
              >
                Hands On Experience
                <span className="ml-2 group-hover:translate-x-1 transition-transform inline-block">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-[#0a0818]/70 backdrop-blur-lg relative">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/10 via-indigo-950/10 to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-tr from-violet-300/80 via-purple-200/80 to-indigo-200/80 bg-clip-text text-transparent mb-4">Powered by Advanced AI</h2>
            <div className="w-32 h-1 mx-auto rounded-full bg-gradient-to-r from-violet-500 to-indigo-700 shadow-lg mb-4"></div>
            <p className="text-xl text-violet-300">
              Built with cutting-edge technology for the most natural experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-[#080614]/90 backdrop-blur-md p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-violet-900/50 hover:scale-[1.02]">
              <div className="text-3xl mb-4">🎤</div>
              <h3 className="font-bold text-violet-300 mb-2">Vosk STT</h3>
              <p className="text-gray-400 text-sm">
                Advanced speech-to-text with light models for English and Hindi
              </p>
            </div>

            <div className="bg-[#080614]/90 backdrop-blur-md p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-violet-900/50 hover:scale-[1.02]">
              <div className="text-3xl mb-4">🧠</div>
              <h3 className="font-bold text-violet-300 mb-2">Llama LLM</h3>
              <p className="text-gray-400 text-sm">
                Smart conversational AI that understands context and handles fallbacks
              </p>
            </div>

            <div className="bg-[#080614]/90 backdrop-blur-md p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-violet-900/50 hover:scale-[1.02]">
              <div className="text-3xl mb-4">🌐</div>
              <h3 className="font-bold text-violet-300 mb-2">Bilingual Support</h3>
              <p className="text-gray-400 text-sm">
                Seamless conversations in both English and Hindi
              </p>
            </div>

            <div className="bg-[#080614]/90 backdrop-blur-md p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-violet-900/50 hover:scale-[1.02]">
              <div className="text-3xl mb-4">📅</div>
              <h3 className="font-bold text-violet-300 mb-2">Smart Scheduling</h3>
              <p className="text-gray-400 text-sm">
                Intelligent date and time handling with natural language processing
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-violet-800 to-indigo-900 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/20 via-transparent to-indigo-950/30 pointer-events-none"></div>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-tr from-violet-100 via-purple-100 to-indigo-100 bg-clip-text text-transparent mb-6">Ready to Experience VocalAIze?</h2>
          <p className="text-xl text-violet-200 mb-8">
            Try our AI receptionist and see how it can transform your business communications
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/demo" // Use 'to' prop
              className="px-8 py-4 bg-[#0f0b22] border border-violet-800/50 text-violet-300 rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 hover:bg-violet-900/30 hover:scale-[1.02]"
            >
              Guided Demo Experience
            </Link>
            <Link
              to="/live" // Use 'to' prop
              className="px-8 py-4 bg-gradient-to-r from-violet-700 to-indigo-800 text-white rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 hover:scale-[1.02] hover:brightness-110"
            >
              Hands On Experience
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#020205] border-t border-violet-900/30 text-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-extrabold tracking-tight bg-gradient-to-tr from-violet-300/80 via-purple-200/80 to-indigo-200/80 bg-clip-text text-transparent mb-4">VocalAIze</h3>
          <p className="text-violet-300 mb-6">
            Revolutionizing customer service with intelligent AI conversations
          </p>
          <div className="flex justify-center gap-8 text-sm text-gray-400">
            <span>🎤 Vosk Speech Recognition</span>
            <span>🧠 Llama AI Intelligence</span>
            <span>🌐 Bilingual Support</span>
          </div>
        </div>
      </div>
    </div>
  );
}
