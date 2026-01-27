/**
 * =============================================================================
 * LANGUAGE PROVIDER - Provides Language Settings to the App
 * =============================================================================
 * 
 * This component wraps the entire app and provides language settings.
 * It's the "source" that the useLanguage hook reads from.
 * 
 * HOW IT WORKS:
 * 1. LanguageProvider stores the current language in state
 * 2. It provides this value through React Context
 * 3. Any child component can access it using useLanguage()
 * 
 * SETUP (in main.jsx or App.jsx):
 * 
 *   import { LanguageProvider } from './context/LanguageProvider';
 * 
 *   <LanguageProvider>
 *     <App />
 *   </LanguageProvider>
 */

import { useState } from "react";
import { LanguageContext } from "./LanguageContext";


/**
 * Language Provider Component
 * 
 * Wrap your app with this to enable language switching.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The app content
 */
export function LanguageProvider({ children }) {
  // Store the current language
  // 'en' = English, 'np' = Nepali
  // Default is English
  const [language, setLanguage] = useState("en");

  /**
   * Toggle between English and Nepali.
   * If currently English, switch to Nepali.
   * If currently Nepali, switch to English.
   */
  function toggleLanguage() {
    setLanguage(function(currentLanguage) {
      if (currentLanguage === "en") {
        return "np";  // Switch to Nepali
      } else {
        return "en";  // Switch to English
      }
    });
  }

  // The value that will be available to all children
  const contextValue = {
    language: language,
    toggleLanguage: toggleLanguage
  };

  // Provide the value to all children
  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}
