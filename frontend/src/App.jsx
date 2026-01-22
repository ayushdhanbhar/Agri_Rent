import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './components/HomePage'
import SignUp from './components/SignUp'
import Login from './components/Login'
import FarmerDashboard from './components/FarmerDashboard'
import AdminDashboard from './components/AdminDashboard'
import OwnerDashboard from './components/OwnerDashboard'
import Chatbot from './components/Chatbot'
import './App.css'

import { AuthProvider } from './context/AuthContext'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/owner-dashboard" element={<OwnerDashboard />} />
        </Routes>
        <Chatbot />
      </Router>
    </AuthProvider>
  )
}

export default App
