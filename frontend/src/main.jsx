import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Demo from './pages/Demo'
import Live from './pages/Live'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import Home from "./pages/Home"
import Navbar from './components/Navbar' // Adjust path as needed
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    {/* Use the updated custom Navbar */}
    <Navbar />

    {/* Routes */}
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/demo" element={<Demo />} />
      <Route path="/live" element={<Live />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  </BrowserRouter>
)
