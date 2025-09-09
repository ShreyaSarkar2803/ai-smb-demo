import { NavLink } from "react-router-dom"
import { Home, PlayCircle, Mic, BarChart } from "lucide-react"

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between gap-6 bg-[#0a0818]/60 backdrop-blur-lg p-4 rounded-3xl shadow-xl border border-violet-900/50 text-gray-200 relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950/10 via-indigo-950/10 to-transparent rounded-3xl pointer-events-none"></div>

      {/* Logo and Project Name */}
      <div className="flex items-center gap-4 relative z-10">
        <img
          src="/image.png" // Replace with the actual path to your logo file
          alt="VocalAIze Logo"
          className="w-10 h-10"
        />
        <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-300 to-indigo-200">
          VocalAIze
        </h1>
      </div>

      {/* Centered Navigation Links */}
      <div className="flex justify-center items-center w-full absolute inset-x-0">
        <div className="flex items-center gap-6 relative z-10">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all duration-300 relative z-10 ${
                isActive
                  ? "bg-[#0f0b22] text-violet-300 shadow-lg ring-2 ring-violet-500/50 transform scale-105"
                  : "text-white hover:text-violet-400 hover:bg-violet-900/30 border border-violet-800/30 hover:scale-105"
              }`
            }
          >
            <Home className="w-5 h-5" />
            Home
          </NavLink>

          <NavLink
            to="/demo"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all duration-300 relative z-10 ${
                isActive
                  ? "bg-[#0f0b22] text-violet-300 shadow-lg ring-2 ring-violet-500/50 transform scale-105"
                  : "text-white hover:text-violet-400 hover:bg-violet-900/30 border border-violet-800/30 hover:scale-105"
              }`
            }
          >
            <PlayCircle className="w-5 h-5" />
            Demo
          </NavLink>

          <NavLink
            to="/live"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all duration-300 relative z-10 ${
                isActive
                  ? "bg-[#0f0b22] text-violet-300 shadow-lg ring-2 ring-violet-500/50 transform scale-105"
                  : "text-white hover:text-violet-400 hover:bg-violet-900/30 border border-violet-800/30 hover:scale-105"
              }`
            }
          >
            <Mic className="w-5 h-5" />
            Live
          </NavLink>
           <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all duration-300 relative z-10 ${
                isActive
                  ? "bg-[#0f0b22] text-violet-300 shadow-lg ring-2 ring-violet-500/50 transform scale-105"
                  : "text-white hover:text-violet-400 hover:bg-violet-900/30 border border-violet-800/30 hover:scale-105"
              }`
            }
          >
            <BarChart className="w-5 h-5" />
            Dashboard
          </NavLink>
        </div>
      </div>
    </nav>
  );
}