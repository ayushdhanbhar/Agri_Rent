/**
 * Google Translate Utility Functions
 * Handles language switching with proper cookie management and page reloading
 * 
 * KEY PRINCIPLE: Google Translate respects the 'googtrans' cookie format: /en/{targetLanguage}
 * Every language change requires clearing old cookies and reloading the page for changes to take effect
 */

/**
 * Verify if a language code is valid
 */
const isValidLanguageCode = (code) => {
  return code && typeof code === 'string' && code.length > 0;
};

/**
 * Clear all Google Translate cookies across different paths and domains
 * Multiple attempts across different domain combinations ensure complete clearing
 */
export const clearGoogleTranslateCookie = () => {
  const domainVariations = [
    '',
    window.location.hostname,
    '.' + window.location.hostname,
  ];

  const paths = ['/', ''];

  domainVariations.forEach((domain) => {
    paths.forEach((path) => {
      let cookieString = 'googtrans=;expires=Thu, 01 Jan 1970 00:00:00 UTC';
      if (path) cookieString += `;path=${path}`;
      if (domain) cookieString += `;domain=${domain}`;
      document.cookie = cookieString;
    });
  });

  console.log('[GoogleTranslate] Cookies cleared');
};

/**
 * Set Google Translate cookie for the specified language
 * Format: /en/{targetLanguage}
 * 
 * @param {string} languageCode - The target language code (e.g., 'hi', 'mr', 'ta')
 */
export const setGoogleTranslateCookie = (languageCode) => {
  if (!isValidLanguageCode(languageCode)) {
    console.warn('[GoogleTranslate] Invalid language code:', languageCode);
    return;
  }

  const cookieValue = `/en/${languageCode}`;
  const expirationDate = new Date();
  expirationDate.setFullYear(expirationDate.getFullYear() + 1); // Expire in 1 year
  const expiresStr = expirationDate.toUTCString();

  // Set cookie with multiple domain variations to ensure it sticks
  document.cookie = `googtrans=${cookieValue}; path=/; expires=${expiresStr}`;

  // Also set with explicit domain for better persistence
  const domain = window.location.hostname;
  if (domain) {
    document.cookie = `googtrans=${cookieValue}; path=/; expires=${expiresStr}; domain=${domain}`;
  }

  console.log(`[GoogleTranslate] Cookie set: ${cookieValue}`);
};

/**
 * Get the currently set Google Translate language from cookie
 * 
 * @returns {string} The language code or 'en' if not set
 */
export const getGoogleTranslateLanguage = () => {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.split('=').map(c => c.trim());
    if (name === 'googtrans' && value) {
      // Extract language code from /en/{languageCode} format
      const parts = value.split('/');
      if (parts.length >= 3) {
        return parts[2];
      }
    }
  }
  return 'en';
};

/**
 * Handle language change with proper cookie management and reload
 * This is the PRIMARY function called when user selects a new language
 * 
 * @param {string} languageCode - The target language code
 */
// Optionally skip reload for i18n-only changes
export const handleLanguageChange = (languageCode, options = {}) => {
  if (!isValidLanguageCode(languageCode)) {
    console.error('[GoogleTranslate] Invalid language code for change:', languageCode);
    return;
  }

  console.log(`[GoogleTranslate] Language change initiated: ${languageCode}`);

  // 1. Store language in localStorage for persistence
  localStorage.setItem('selectedLanguage', languageCode);
  localStorage.setItem('i18nextLng', languageCode);

  // 2. Clear existing Google Translate cookies
  clearGoogleTranslateCookie();

  // 3. Set new cookie
  // Even for English, we set the cookie (as /en/en) to be explicit
  setGoogleTranslateCookie(languageCode);

  // 4. Reload page to apply changes (REQUIRED for Google Translate to clear/update)
  if (!options.skipReload) {
    setTimeout(() => {
      console.log('[GoogleTranslate] Reloading page to apply translation...');
      window.location.reload();
    }, 150);
  }
};

/**
 * Initialize Google Translate on page load
 * Reads saved language from localStorage and applies it
 * Called once when app mounts
 * 
 * @returns {string} The applied language code
 */
import i18n from '../i18n';
let _googleTranslateInitialized = false;
export const initializeGoogleTranslate = () => {
  try {
    // Guard: make this function idempotent to avoid duplicate effects during React StrictMode double-mount in dev.
    if (_googleTranslateInitialized) {
      // Already initialized previously; silently skip re-initialization to avoid duplicate effects in StrictMode.
      const savedLanguage = localStorage.getItem('selectedLanguage') ||
        localStorage.getItem('i18nextLng') ||
        'en';
      return savedLanguage;
    }
    _googleTranslateInitialized = true;

    // Get saved language from localStorage
    const savedLanguage = localStorage.getItem('selectedLanguage') ||
      localStorage.getItem('i18nextLng') ||
      'en';

    i18n.changeLanguage(savedLanguage);
    console.debug(`[GoogleTranslate] Initializing with language: ${savedLanguage}`);

    // Only apply if saved language is not English
    // (English is the default, no need to set cookie)
    if (savedLanguage !== 'en') {
      // If cookie doesn't match the saved language, set it.
      const currentCookieLang = getGoogleTranslateLanguage();
      if (currentCookieLang !== savedLanguage) {
        clearGoogleTranslateCookie();
        setGoogleTranslateCookie(savedLanguage);
        console.debug('[GoogleTranslate] Initialization set cookie for', savedLanguage);
      } else {
        console.debug('[GoogleTranslate] Saved language already present in cookie');
      }
    }

    return savedLanguage;
  } catch (error) {
    console.error('[GoogleTranslate] Error during initialization:', error);
    return 'en';
  }
};

/**
 * Force Google Translate to refresh by reloading the page
 * Useful as a manual reset mechanism
 */
export const refreshGoogleTranslate = () => {
  try {
    console.log('[GoogleTranslate] Manual refresh triggered');
    window.location.reload();
  } catch (error) {
    console.warn('[GoogleTranslate] Error refreshing:', error);
  }
};

/**
 * Reset language to English and clear all settings
 * Useful for logout or reset scenarios
 */
export const resetLanguage = () => {
  console.log('[GoogleTranslate] Resetting to English');
  localStorage.removeItem('selectedLanguage');
  localStorage.removeItem('i18nextLng');
  clearGoogleTranslateCookie();

  setTimeout(() => {
    window.location.reload();
  }, 100);
};

/**
 * Check if Google Translate script is loaded
 * 
 * @returns {boolean} True if Google Translate is available
 */
export const isGoogleTranslateLoaded = () => {
  return window.google?.translate?.TranslateElement !== undefined;
};

/**
 * Wait for Google Translate to load (useful for debugging)
 * 
 * @param {number} maxWaitTime - Maximum time to wait in milliseconds (default 5000)
 * @returns {Promise<boolean>} Resolves with true if loaded, false if timeout
 */
export const waitForGoogleTranslate = (maxWaitTime = 5000) => {
  return new Promise((resolve) => {
    const startTime = Date.now();

    const checkTranslate = () => {
      if (isGoogleTranslateLoaded()) {
        console.log('[GoogleTranslate] Script loaded successfully');
        resolve(true);
      } else if (Date.now() - startTime > maxWaitTime) {
        console.warn('[GoogleTranslate] Timeout waiting for script');
        resolve(false);
      } else {
        setTimeout(checkTranslate, 100);
      }
    };

    checkTranslate();
  });
};
