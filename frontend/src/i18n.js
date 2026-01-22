import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Quick translation implementation
// Ideally these would be in separate JSON files, but for the sake of a single working setup:
const resources = {
    en: {
        translation: {
            "dashboard": "Dashboard",
            "logout": "Logout",
            "welcome": "Welcome",
            "add_equipment": "Add Equipment",
            "my_equipment": "My Equipment",
            "search_placeholder": "Search languages...",
            "chat_with_us": "Chat with us",
            "agrobot_assistant": "AgroBot Assistant",
            "type_message": "Type your message...",
            "send": "Send",
            "out_of_domain": "Out of Domain Request",
            "out_of_domain_msg": "This platform only supports agriculture queries.",
            "select": "Select",
            "rent": "Rent",
            "price_hour": "Price/Hour",
            "price_day": "Price/Day"
        }
    },
    // Note: For this demo, other languages will fall back to English or show placeholders
    // In a real app, we'd load these from backend or JSON files
    hi: { translation: { "logout": "लॉग आउट", "dashboard": "डैशबोर्ड", "welcome": "स्वागत है" } },
    mr: { translation: { "logout": "बाहेर पडा", "dashboard": "डॅशबोर्ड", "welcome": "स्वागत आहे" } },
    gu: { translation: { "logout": "लॉग आउट", "dashboard": "ડેશબોર્ડ", "welcome": "સ્વાગત છે" } },
    ta: { translation: { "logout": "வெளியேறு", "dashboard": "டாஷ்போர்டு", "welcome": "வரவேற்பு" } }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
