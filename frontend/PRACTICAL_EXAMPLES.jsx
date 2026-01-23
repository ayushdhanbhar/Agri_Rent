/**
 * PRACTICAL EXAMPLES: Google Translate Language Switcher
 * Copy-paste ready examples for common use cases
 */

// ============================================
// EXAMPLE 1: Basic Language Change
// ============================================

import { handleLanguageChange } from '../lib/googleTranslate';

// When user clicks button or dropdown
function onLanguageSelect(languageCode) {
  handleLanguageChange(languageCode);
  // That's it! Page will reload with new language
}

// Usage in a button
<button onClick={() => onLanguageSelect('hi')}>
  Translate to Hindi
</button>


// ============================================
// EXAMPLE 2: Using in a Custom Hook
// ============================================

import { useState, useEffect } from 'react';
import { handleLanguageChange, getGoogleTranslateLanguage } from '../lib/googleTranslate';

export function useLanguage() {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Get current language from cookie
    const lang = getGoogleTranslateLanguage();
    setCurrentLanguage(lang);
  }, []);

  const changeLanguage = async (newLanguage) => {
    setIsLoading(true);
    handleLanguageChange(newLanguage);
    // Note: Page will reload, so setIsLoading never completes
  };

  return {
    currentLanguage,
    changeLanguage,
    isLoading
  };
}

// Use in component
function MyComponent() {
  const { currentLanguage, changeLanguage } = useLanguage();

  return (
    <select value={currentLanguage} onChange={(e) => changeLanguage(e.target.value)}>
      <option value="en">English</option>
      <option value="hi">Hindi</option>
      <option value="mr">Marathi</option>
    </select>
  );
}


// ============================================
// EXAMPLE 3: Language Switcher in Header
// ============================================

import { handleLanguageChange } from '../lib/googleTranslate';

export function LanguageSwitcher() {
  const languages = [
    { code: 'en', flag: '🇺🇸', name: 'English' },
    { code: 'hi', flag: '🇮🇳', name: 'हिंदी' },
    { code: 'mr', flag: '🇮🇳', name: 'मराठी' },
    { code: 'ta', flag: '🇮🇳', name: 'தமிழ்' },
    { code: 'gu', flag: '🇮🇳', name: 'ગુજરાતી' },
  ];

  return (
    <div className="flex gap-2">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleLanguageChange(lang.code)}
          className="px-4 py-2 hover:bg-blue-500 rounded"
          title={lang.name}
        >
          {lang.flag}
        </button>
      ))}
    </div>
  );
}


// ============================================
// EXAMPLE 4: Language Selector Modal/Dialog
// ============================================

import { handleLanguageChange } from '../lib/googleTranslate';
import { useState } from 'react';

export function LanguageModal({ isOpen, onClose }) {
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी (Hindi)' },
    { code: 'mr', name: 'मराठी (Marathi)' },
    { code: 'ta', name: 'தமிழ் (Tamil)' },
    { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
    { code: 'te', name: 'తెలుగు (Telugu)' },
    { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
    { code: 'ml', name: 'മലയാളം (Malayalam)' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)' },
    { code: 'bn', name: 'বাংলা (Bengali)' },
    { code: 'ur', name: 'اردو (Urdu)' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'ja', name: '日本語' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Select Language</h2>
        
        <div className="grid grid-cols-2 gap-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                handleLanguageChange(lang.code);
                onClose();
              }}
              className="p-3 hover:bg-gray-100 text-left rounded border border-gray-200"
            >
              {lang.name}
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full p-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Close
        </button>
      </div>
    </div>
  );
}


// ============================================
// EXAMPLE 5: Language Context for App
// ============================================

import { createContext, useContext } from 'react';
import { handleLanguageChange, resetLanguage } from '../lib/googleTranslate';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  return (
    <LanguageContext.Provider value={{ handleLanguageChange, resetLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguageContext() {
  return useContext(LanguageContext);
}

// Usage in any component
function MyComponent() {
  const { handleLanguageChange } = useLanguageContext();

  return (
    <button onClick={() => handleLanguageChange('hi')}>
      Switch to Hindi
    </button>
  );
}


// ============================================
// EXAMPLE 6: Language Selection with Search
// ============================================

import { handleLanguageChange } from '../lib/googleTranslate';
import { useState, useMemo } from 'react';

export function SearchableLanguageSelector() {
  const [searchTerm, setSearchTerm] = useState('');

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
  ];

  const filteredLanguages = useMemo(() => {
    return languages.filter((lang) =>
      lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lang.nativeName.includes(searchTerm)
    );
  }, [searchTerm]);

  return (
    <div className="w-full max-w-sm">
      <input
        type="text"
        placeholder="Search language..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 border rounded mb-3"
      />

      <div className="space-y-1 max-h-96 overflow-y-auto">
        {filteredLanguages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className="w-full text-left p-2 hover:bg-blue-100 rounded transition"
          >
            <span className="font-medium">{lang.name}</span>
            <span className="text-gray-600 ml-2">({lang.nativeName})</span>
          </button>
        ))}
      </div>

      {filteredLanguages.length === 0 && (
        <p className="text-gray-500 text-center p-2">No languages found</p>
      )}
    </div>
  );
}


// ============================================
// EXAMPLE 7: Auto-Detect Language on First Visit
// ============================================

import { handleLanguageChange } from '../lib/googleTranslate';
import { useEffect } from 'react';

export function AutoLanguageDetector() {
  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage');

    // Only auto-detect on first visit
    if (!savedLanguage) {
      // Detect from browser language
      const browserLang = navigator.language.split('-')[0];

      // Map browser language to supported language
      const languageMap = {
        hi: 'hi', // Hindi
        mr: 'mr', // Marathi
        ta: 'ta', // Tamil
        gu: 'gu', // Gujarati
        te: 'te', // Telugu
        kn: 'kn', // Kannada
        ml: 'ml', // Malayalam
        pa: 'pa', // Punjabi
        bn: 'bn', // Bengali
        ur: 'ur', // Urdu
        es: 'es', // Spanish
        fr: 'fr', // French
        de: 'de', // German
        ja: 'ja', // Japanese
        // Add more mappings as needed
      };

      const detectedLanguage = languageMap[browserLang] || 'en';

      if (detectedLanguage !== 'en') {
        handleLanguageChange(detectedLanguage);
      }
    }
  }, []);

  return null; // No UI needed, just logic
}


// ============================================
// EXAMPLE 8: Language-Based Content Rendering
// ============================================

import { getGoogleTranslateLanguage } from '../lib/googleTranslate';
import { useEffect, useState } from 'react';

export function LocalizedContent() {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const currentLang = getGoogleTranslateLanguage();
    setLanguage(currentLang);
  }, []);

  const messages = {
    en: "Welcome!",
    hi: "स्वागत है!",
    mr: "स्वागत आहे!",
    ta: "வரவேற்பு!",
    es: "¡Bienvenido!",
    fr: "Bienvenue!",
  };

  return <div>{messages[language] || messages.en}</div>;
}


// ============================================
// EXAMPLE 9: Logout With Language Reset
// ============================================

import { resetLanguage } from '../lib/googleTranslate';
import { useNavigate } from 'react-router-dom';

export function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear all auth data
    localStorage.clear();
    sessionStorage.clear();

    // Reset language to English
    resetLanguage();

    // Note: resetLanguage() reloads page, so this won't execute
    // But it's good practice to have it
    // navigate('/login');
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
    >
      Logout
    </button>
  );
}


// ============================================
// EXAMPLE 10: Debug Console Commands
// ============================================

/*
Copy these into your browser console to test:

// Check current language
console.log(document.cookie);

// Check localStorage
console.log(localStorage.getItem('selectedLanguage'));

// Test language change
import { handleLanguageChange } from '../src/lib/googleTranslate';
handleLanguageChange('hi');

// Reset to English
import { resetLanguage } from '../src/lib/googleTranslate';
resetLanguage();

// Check if Google Translate is loaded
console.log(window.google?.translate?.TranslateElement !== undefined);

// Wait for Google Translate
import { waitForGoogleTranslate } from '../src/lib/googleTranslate';
await waitForGoogleTranslate();
*/


// ============================================
// SUPPORTED LANGUAGES LIST
// ============================================

/*
Regional Languages (India):
- en    English
- hi    हिंदी (Hindi)
- mr    मराठी (Marathi)
- ta    தமிழ் (Tamil)
- gu    ગુજરાતી (Gujarati)
- te    తెలుగు (Telugu)
- kn    ಕನ್ನಡ (Kannada)
- ml    മലയാളം (Malayalam)
- pa    ਪੰਜਾਬੀ (Punjabi)
- bn    বাংলা (Bengali)
- ur    اردو (Urdu)
- or    ଓଡ଼ିଆ (Odia)
- as    অসমীয়া (Assamese)
- ne    नेपाली (Nepali)
- sa    संस्कृत (Sanskrit)

European Languages:
- es    Español (Spanish)
- fr    Français (French)
- de    Deutsch (German)
- it    Italiano (Italian)
- pt    Português (Portuguese)
- ar    العربية (Arabic)
- ru    Русский (Russian)
- tr    Türkçe (Turkish)

Asian Languages:
- zh-CN 中文简体 (Chinese Simplified)
- ja    日本語 (Japanese)
- ko    한국어 (Korean)
*/
