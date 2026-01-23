import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import HomePage from './components/HomePage'
import SignUp from './components/SignUp'
import Login from './components/Login'
import FarmerDashboard from './components/FarmerDashboard'
import AdminDashboard from './components/AdminDashboard'
import OwnerDashboard from './components/OwnerDashboard'
import Chatbot from './components/Chatbot'
import './App.css'

import { AuthProvider } from './context/AuthContext'
import { initializeGoogleTranslate } from './lib/googleTranslate'
import i18n from './i18n';
import TranslationManager from './lib/TranslationManager';
import ErrorBoundary from './components/ErrorBoundary';


function App() {
  // Initialize Google Translate and i18n on app load
  useEffect(() => {
    const savedLang = localStorage.getItem('selectedLanguage') || localStorage.getItem('i18nextLng') || 'en';
    i18n.changeLanguage(savedLang);
    initializeGoogleTranslate();
    // Initialize global translation manager (singleton)
    TranslationManager.init();
  }, []);
  // RouteListener will run inside Router context to avoid useLocation() error.
  function RouteListener() {
    const location = useLocation();
    useEffect(() => {
      TranslationManager.onRouteChange();
    }, [location]);
    return null;
  }

  return (
    <AuthProvider>
      <ErrorBoundary>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/owner-dashboard" element={<OwnerDashboard />} />
          </Routes>
          <RouteListener />
          <Chatbot />
        </Router>
      </ErrorBoundary>
    </AuthProvider>
  )
}

export default App
