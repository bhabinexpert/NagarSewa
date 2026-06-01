import React, { useState } from "react";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/language/useLanguage";
import { useAuth } from "../../contexts/auth/useAuth";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ============================================================
// TEXT TRANSLATIONS
// Contains all text content in English and Nepali
// ============================================================
const loginText = {
  en: {
    brand: "NagarSewa",
    subtitle: "Digital Public Service Platform",
    welcome: "Welcome Back",
    subWelcome: "Log in to access your citizen account",
    email: "Email Address",
    password: "Password",
    emailPlaceholder: "example@gmail.com",
    passwordPlaceholder: "Enter your password",
    signIn: "Log In",
    signingIn: "Logging In...",
    noAccount: "Don't have an account?",
    createAccount: "Create Account",
    footerLinks: ["Services", "About", "Contact", "Privacy"],
    copyright: "© 2023 NagarSewa - Digital Public Service Platform",
    errorRequired: "Please fill in all required fields",
    errorEmailInvalid: "Please enter a valid email address",
    errorPasswordShort: "Password must be at least 8 characters",
    errorInvalidCredentials: "Invalid email or password. Please try again.",
    success: "Login successful! Redirecting to dashboard...",
    toggleLabel: "नेपाली",
    accountDisabled: "Your account has been disabled. Please contact the administrator.",
  },
  np: {
    brand: "नगरसेवा",
    subtitle: "डिजिटल सार्वजनिक सेवा प्लेटफर्म",
    welcome: "पुन: स्वागत छ",
    subWelcome: "नागरिक खातामा प्रवेश गर्न साइन इन गर्नुहोस्",
    email: "इमेल ठेगाना",
    password: "पासवर्ड",
    emailPlaceholder: "example@gmail.com",
    passwordPlaceholder: "आफ्नो पासवर्ड प्रविष्ट गर्नुहोस्",
    signIn: "लग इन",
    signingIn: "लग इन हुँदै...",
    noAccount: "खाता छैन?",
    createAccount: "खाता बनाउनुहोस्",
    footerLinks: ["सेवाहरू", "बारेमा", "सम्पर्क", "गोपनीयता"],
    copyright: "© 2023 नगरसेवा - डिजिटल सार्वजनिक सेवा प्लेटफर्म",
    errorRequired: "कृपया सबै आवश्यक फिल्डहरू भर्नुहोस्",
    errorEmailInvalid: "कृपया मान्य इमेल ठेगाना प्रविष्ट गर्नुहोस्",
    errorPasswordShort: "पासवर्ड कम्तिमा ८ अक्षरको हुनुपर्छ",
    errorInvalidCredentials: "अमान्य इमेल वा पासवर्ड। कृपया पुन: प्रयास गर्नुहोस्।",
    success: "सफलतापूर्वक लग इन! ड्यासबोर्डमा पुन: निर्देशित गर्दै...",
    toggleLabel: "English",
    accountDisabled: "तपाईंको खाता अक्षम गरिएको छ। कृपया प्रशासकलाई सम्पर्क गर्नुहोस्।",
  },
};

// ============================================================
// LOGIN COMPONENT
// Handles user authentication and login form display.
// ============================================================

/**
 * Login Component
 * Handles user authentication with email and password.
 * Displays login form with demo login options.
 * @returns {JSX.Element} The login page
 */
function Login() {
  // ============================================================
  // HOOKS AND CONTEXT
  // ============================================================
  const languageContext = useLanguage();
  const language = languageContext.language;
  const toggleLanguage = languageContext.toggleLanguage;
  
  const authContext = useAuth();
  const login = authContext.login;
  
  const t = loginText[language];
  const navigate = useNavigate();

  // ============================================================
  // STATE VARIABLES
  // ============================================================
  
  // Form data state - stores email, password, and remember me checkbox
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  
  // Toggle password visibility
  const [showPassword, setShowPassword] = useState(false);
  
  // Loading state for form submission
  const [isLoading, setIsLoading] = useState(false);
  
  // Error message state
  const [error, setError] = useState("");

  // ============================================================
  // EVENT HANDLERS
  // ============================================================

  /**
   * Handle input changes for text fields and checkboxes.
   * Updates form data state and clears any existing error.
   * @param {Event} event - The input change event
   */
  function handleInputChange(event) {
    const eventTarget = event.target;
    const fieldName = eventTarget.name;
    const fieldValue = eventTarget.value;
    const fieldType = eventTarget.type;
    const isChecked = eventTarget.checked;
    
    // For checkboxes use 'checked', for other inputs use 'value'
    let inputValue;
    if (fieldType === 'checkbox') {
      inputValue = isChecked;
    } else {
      inputValue = fieldValue;
    }
    
    // Create new form data object with updated field
    const newFormData = {
      email: formData.email,
      password: formData.password,
      rememberMe: formData.rememberMe
    };
    newFormData[fieldName] = inputValue;
    
    setFormData(newFormData);
    
    // Clear error when user starts typing
    setError('');
  }

  /**
   * Validate email format.
   * @param {string} email - Email to validate
   * @returns {boolean} True if valid email format
   */
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Handle form submission.
   * Validates input and attempts to log in the user.
   */
  async function handleSubmit() {
    // Trim whitespace from email and password
    const email = formData.email.trim();
    const password = formData.password.trim();
    
    // Check if email and password are filled
    if (!email || !password) {
      const errorMsg = t.errorRequired;
      setError(errorMsg);
      toast.error(errorMsg, { position: "top-right", autoClose: 3000 });
      return;
    }

    // Validate email format
    if (!isValidEmail(email)) {
      const errorMsg = t.errorEmailInvalid;
      setError(errorMsg);
      toast.error(errorMsg, { position: "top-right", autoClose: 3000 });
      return;
    }

    // Validate password length
    if (password.length < 8) {
      const errorMsg = t.errorPasswordShort;
      setError(errorMsg);
      toast.error(errorMsg, { position: "top-right", autoClose: 3000 });
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Use auth context for login (now async)
      const result = await login(email, password);
      
      if (result.success) {
        console.log('Login successful:', formData.email, 'Role:', result.user.role);
        toast.success(t.success, {
          position: "top-right",
          autoClose: 2000,
        });
        
        // Redirect based on user role
        setTimeout(function() {
          navigate(result.redirectTo);
        }, 1500);
      } else {
        // Show specific error for disabled accounts
        if (result.isDisabled) {
          setError(t.accountDisabled);
          toast.error(t.accountDisabled, {
            position: "top-right",
            autoClose: 5000,
          });
        } else {
          // Show user-friendly error message
          const errorMessage = result.error && result.error.includes("Invalid") 
            ? t.errorInvalidCredentials 
            : (result.error || "Login failed");
          setError(errorMessage);
          toast.error(errorMessage, {
            position: "top-right",
            autoClose: 4000,
          });
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.message && err.message.includes("credentials")
        ? t.errorInvalidCredentials
        : (err.message || "An error occurred during login");
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Handle Enter key press on inputs.
   * Submits the form when Enter is pressed.
   * @param {KeyboardEvent} event - The keyboard event
   */
  function handleKeyPress(event) {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  }

  // ============================================================
  // HELPER FUNCTIONS
  // ============================================================

  /**
   * Toggle password visibility on/off.
   */
  function togglePasswordVisibility() {
    setShowPassword(!showPassword);
  }

  /**
   * Render the footer links with separators.
   * @returns {JSX.Element[]} Array of footer link elements
   */
  function renderFooterLinks() {
    return t.footerLinks.flatMap(function(item, index) {
      const elements = [];
      
      // Add separator before items (except first)
      if (index > 0) {
        elements.push(
          <span key={"sep-" + index} className="text-white/40">•</span>
        );
      }
      
      // Add the link item
      elements.push(
        <span key={item} className="hover:text-white transition-colors cursor-pointer px-1">
          {item}
        </span>
      );
      
      return elements;
    });
  }

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="h-screen overflow-hidden bg-linear-to-br from-emerald-950 via-emerald-900 to-teal-900 flex items-center justify-center p-3 sm:p-4 md:p-6">
      <ToastContainer />
      <div className="w-full max-w-sm sm:max-w-md">
        <div className="flex justify-end mb-2 sm:mb-3">
          <button
            onClick={toggleLanguage}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 border border-white/30 text-white text-xs sm:text-sm rounded-lg hover:bg-white/20 backdrop-blur transition-colors"
          >
            {t.toggleLabel}
          </button>
        </div>
        
        {/* Logo and Header Section */}
        <div className="text-center mb-3 sm:mb-4">
          <img
            src="/nagarsewalogo.jpeg"
            alt="NagarSewa Logo"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-4 ring-white/30 shadow-xl mx-auto mb-2 sm:mb-3"
          />
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-0.5 sm:mb-1">{t.brand}</h1>
          <p className="text-white/80 text-sm sm:text-base">{t.subtitle}</p>
        </div>

        {/* Main Login Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden">
          
          {/* Card Header with Gradient Background */}
          <div className="bg-linear-to-r from-emerald-600 to-teal-600 p-3 sm:p-4 text-white">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                <User className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold truncate">{t.welcome}</h2>
                <p className="text-white/90 text-sm">{t.subWelcome}</p>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-4 sm:p-5 md:p-6">
            
            {/* Error Message Display */}
            {error && (
              <div className="mb-3 p-2 sm:p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-3 sm:space-y-4">
              
              {/* Email Input Field */}
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1 sm:mb-1.5">
                  <Mail className="inline w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-1.5 text-gray-400" />
                  {t.email}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className="w-full px-3 py-2 sm:py-2.5 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder={t.emailPlaceholder}
                  disabled={isLoading}
                />
              </div>

              {/* Password Input Field */}
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1 sm:mb-1.5">
                  <Lock className="inline w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-1.5 text-gray-400" />
                  {t.password}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    className="w-full px-3 py-2 sm:py-2.5 pr-9 sm:pr-10 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder={t.passwordPlaceholder}
                    disabled={isLoading}
                  />
                  {/* Toggle password visibility button */}
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Sign In Button */}
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full py-2.5 sm:py-3 bg-linear-to-r from-emerald-600 to-teal-600 text-white text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {t.signingIn}
                  </div>
                ) : (
                  t.signIn
                )}
              </button>

              {/* Create Account Link */}
              <div className="text-center pt-1">
                <p className="text-gray-600 text-sm sm:text-base">
                  {t.noAccount}{" "}
                  <span className="text-emerald-600 font-semibold hover:text-emerald-800 cursor-pointer transition-colors">
                    <Link to='/signup'>{t.createAccount}</Link>
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-3 sm:mt-4 text-center">
          <div className="flex flex-wrap justify-center gap-2 text-sm text-white/80">
            {renderFooterLinks()}
          </div>
          <p className="text-white/60 text-sm mt-2 px-4">{t.copyright}</p>
        </div>
      </div>
    </div>
  );
}

export default Login;