import React, { useState, useEffect, useRef } from 'react';
import { Globe, Search, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'mr', name: 'Marathi' },
    { code: 'ta', name: 'Tamil' },
    { code: 'gu', name: 'Gujarati' },
    { code: 'te', name: 'Telugu' },
    { code: 'kn', name: 'Kannada' },
    { code: 'ml', name: 'Malayalam' },
    { code: 'pa', name: 'Punjabi' },
    { code: 'bn', name: 'Bengali' },
    { code: 'ur', name: 'Urdu' },
    { code: 'or', name: 'Odia' },
    { code: 'as', name: 'Assamese' },
    { code: 'ne', name: 'Nepali' },
    { code: 'ks', name: 'Kashmiri' },
    { code: 'sd', name: 'Sindhi' },
    { code: 'kok', name: 'Konkani' },
    { code: 'mni', name: 'Manipuri' },
    { code: 'brx', name: 'Bodo' },
    { code: 'sa', name: 'Sanskrit' },
    { code: 'mai', name: 'Maithili' },
    { code: 'doi', name: 'Dogri' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ar', name: 'Arabic' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'ru', name: 'Russian' },
    { code: 'tr', name: 'Turkish' }
];

export default function LanguageDropdown() {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        // Init logic if needed
    }, []);

    const changeLanguage = (langCode) => {
        // Google Translate Cookie Logic
        // format: /source/target
        const cookieValue = `/en/${langCode}`;
        document.cookie = `googtrans=${cookieValue}; path=/; domain=${window.location.hostname}`;
        document.cookie = `googtrans=${cookieValue}; path=/;`; // Fallback

        localStorage.setItem('i18nextLng', langCode);
        localStorage.setItem('googtrans', cookieValue);

        // Force reload to apply Google Translate
        window.location.reload();
    };

    const filteredLanguages = languages.filter(lang =>
        lang.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg transition text-white shadow-md"
                title="Select Language"
            >
                <Globe size={20} />
                <span className="hidden sm:inline">{currentLang.name}</span>
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden text-gray-800 z-50">
                    <div className="p-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                        <Search size={16} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search language..."
                            className="bg-transparent border-none outline-none text-sm w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                        {filteredLanguages.length > 0 ? (
                            filteredLanguages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => changeLanguage(lang.code)}
                                    className={`w-full text-left px-4 py-3 text-sm hover:bg-agri-light/20 flex items-center justify-between transition ${i18n.language === lang.code ? 'bg-agri-green/10 text-agri-green font-semibold' : 'text-gray-700'
                                        }`}
                                >
                                    {lang.name}
                                    {i18n.language === lang.code && <Check size={16} />}
                                </button>
                            ))
                        ) : (
                            <div className="p-4 text-center text-gray-500 text-sm">
                                No languages found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
