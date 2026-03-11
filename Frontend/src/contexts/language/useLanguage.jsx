/**
 * =============================================================================
 * useLanguage HOOK - Easy Access to Language Settings
 * =============================================================================
 * 
 * This hook lets any component access the current language
 * and the function to change it.
 * WHAT YOU GET:
 * - language: 'en' for English, 'np' for Nepali
 * - toggleLanguage: Function that switches between languages
 */

import { useContext } from "react";
import { LanguageContext } from "./LanguageContext";


/**
 * Custom hook to access language settings.
 * 
 * @returns {Object} { language, toggleLanguage }
 * @throws {Error} If used outside of LanguageProvider
 */
export function useLanguage() {
  // Get the language context value
  const context = useContext(LanguageContext);
  
  // Make sure we're inside a LanguageProvider
  if (!context) {
    throw new Error(
      "useLanguage must be used inside a LanguageProvider. " +
      "Make sure your component is wrapped with <LanguageProvider>."
    );
  }
  
  return context;
}
