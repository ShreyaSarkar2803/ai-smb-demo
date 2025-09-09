import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Demo from "./pages/Demo";
import Live from "./pages/Live";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Navbar from "./components/Navbar";

export default function App() {
  return (
    <BrowserRouter>
      {/* This is the main page container with the dark background */}
      <div className="min-h-screen bg-gradient-to-br from-[#020205] via-[#080312] to-[#0e0620] text-gray-200">
        
        {/* Navbar is now a separate component at the top of the page. */}
        <div className="p-6">
          <Navbar />
        </div>

        {/* The main content for all routes starts here, with top margin to create space from the Navbar */}
        <div className="px-6 mt-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/demo" element={<Demo />} />
            <Route path="/live" element={<Live />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>

      </div>
    </BrowserRouter>
  );
}