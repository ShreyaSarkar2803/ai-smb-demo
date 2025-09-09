import { useState } from "react"

export default function LanguageSelector({ onChange }) {
  const [lang, setLang] = useState("en")

  const languages = [
    { code: "en", name: "English" },
     { code: "hi", name: "Hindi" },
    // { code: "bn", name: "Bengali" },
    //{ code: "ta", name: "Tamil" }
  ]

  const handleChange = (code) => {
    setLang(code)
    onChange(code)
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Instruction */}
      <p className="text-gray-700 text-lg font-medium">
        Choose a language to experience the assistant
      </p>

      {/* Big button grid */}
      <div className="flex flex-wrap justify-center gap-4">
        {languages.map((l) => (
          <button
            key={l.code}
            onClick={() => handleChange(l.code)}
            className={`px-6 py-3 rounded-xl shadow-md transition 
              ${lang === l.code ? "bg-blue-700 text-white" : "bg-blue-500 text-white hover:bg-blue-600"}
            `}
          >
            {l.name}
          </button>
        ))}
      </div>
    </div>
  )
}
