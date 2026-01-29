/**
 * =============================================================================
 * LANGUAGE CONTEXT - Multi-language Support
 * =============================================================================
 * 
 * This file creates a React Context for language settings.
 * It allows the app to switch between English and Nepali.
 * 
 * WHAT IS CONTEXT?
 * Context is like a "global container" that holds data.
 * Any component can read from this container without
 * passing data through props.
 * 
 * This context is used by:
 * - LanguageProvider.jsx (provides the language value)
 * - useLanguage.jsx (lets components read/change language)
 */

import { createContext } from "react";


/**
 * The Language Context.
 * 
 * This will hold:
 * - language: Current language code ('en' or 'np')
 * - toggleLanguage: Function to switch language
 * 
 * Initial value is null because the actual value
 * will be provided by LanguageProvider.
 */
export const LanguageContext = createContext(null);
