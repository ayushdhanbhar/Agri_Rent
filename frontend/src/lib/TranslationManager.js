/**
 * TranslationManager
 *
 * Singleton controller that manages Google Translate state across route changes,
 * re-initializations, cookie/localStorage sync, and fail-safes.
 *
 * WHY:
 * - The Google Translate script is not React-aware and initializes only once.
 * - React router navigation replaces DOM nodes; the widget can stop translating.
 * - We must re-apply the translation without injecting duplicate scripts or causing reload loops.
 *
 * APPROACH:
 * - Use existing cookie utilities from googleTranslate.js to set/clear googtrans cookie.
 * - Re-initialize the TranslateElement safely by calling the global initializer (if available).
 * - On route changes, re-apply the current language by resetting cookie + re-running initializer.
 * - Use sessionStorage flags to avoid infinite reloads.
 * - Provide a minimal public API: init(), setLanguage(lang), getLanguage(), onRouteChange()
 */

import { clearGoogleTranslateCookie, setGoogleTranslateCookie, getGoogleTranslateLanguage, handleLanguageChange } from './googleTranslate';

/**
 * Simplified TranslationManager
 * - Single source of truth: localStorage + googtrans cookie
 * - On language change: set cookie, persist localStorage, reload (atomic and reliable)
 * - No observers, retries, or script injection hacks
 */

const TranslationManager = {
  init: () => {
    // No-op: initialization is handled in index.html to ensure cookie is set before Google Translate script runs.
    return;
  },

  // Sets language using the proven flow: clear cookie, set cookie, persist, reload.
  setLanguage: (lang) => {
    if (!lang) return;
    // Use the helper that handles clearing cookies, setting cookie, storing localStorage, and reloading.
    handleLanguageChange(lang, { skipReload: false });
  },

  // Return active language from localStorage or cookie
  getLanguage: () => {
    return localStorage.getItem('selectedLanguage') || getGoogleTranslateLanguage() || 'en';
  },

  // Route change hook is no-op in simplified design (we rely on full reload for language changes)
  onRouteChange: () => {
    return;
  }
};

export default TranslationManager;

