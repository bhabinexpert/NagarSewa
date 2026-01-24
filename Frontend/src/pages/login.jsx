import React, { useState } from "react";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/useLanguage";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const loginText = {
  en: {
    brand: "NagarSewa",
    subtitle: "Digital Public Service Platform",
    welcome: "Welcome Back",
    subWelcome: "Sign in to access your citizen account",
    email: "Email Address",
    password: "Password",
    emailPlaceholder: "example@gmail.com",
    passwordPlaceholder: "Enter your password",
    signIn: "Sign In",
    signingIn: "Signing In...",
    noAccount: "Don't have an account?",
    createAccount: "Create Account",
    footerLinks: ["Services", "About", "Contact", "Privacy"],
    copyright: "© 2023 NagarSewa - Digital Public Service Platform",
    errorRequired: "Please fill in all required fields",
    success: "Login successful! Redirecting to dashboard...",
    toggleLabel: "नेपाली",
  },
  np: {
    brand: "नगरसेवा",
    subtitle: "डिजिटल सार्वजनिक सेवा प्लेटफर्म",
    welcome: "फिर्ता स्वागत छ",
    subWelcome: "नागरिक खातामा प्रवेश गर्न साइन इन गर्नुहोस्",
    email: "इमेल ठेगाना",
    password: "पासवर्ड",
    emailPlaceholder: "example@gmail.com",
    passwordPlaceholder: "आफ्नो पासवर्ड प्रविष्ट गर्नुहोस्",
    signIn: "साइन इन",
    signingIn: "साइन इन हुँदै...",
    noAccount: "खाता छैन?",
    createAccount: "खाता बनाउनुहोस्",
    footerLinks: ["सेवाहरू", "बारेमा", "सम्पर्क", "गोपनीयता"],
    copyright: "© 2023 नगरसेवा - डिजिटल सार्वजनिक सेवा प्लेटफर्म",
    errorRequired: "कृपया सबै आवश्यक फिल्डहरू भर्नुहोस्",
    success: "सफलतापूर्वक साइन इन! ड्यासबोर्डमा पुन: निर्देशित गर्दै...",
    toggleLabel: "English",
  },
};

const Login = () => {
  const { language, toggleLanguage } = useLanguage();
  const t = loginText[language];

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

  // Handle input changes for text fields and checkboxes
  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    
    // For checkboxes use 'checked', for other inputs use 'value'
    const inputValue = type === 'checkbox' ? checked : value;
    
    setFormData({
      ...formData,
      [name]: inputValue
    });
    
    // Clear error when user starts typing
    setError('');
  };

  // Handle form submission
  const handleSubmit = () => {
    // Check if email and password are filled
    if (!formData.email || !formData.password) {
      setError(t.errorRequired);
      return;
    }
    
    setIsLoading(true);
    
   
    setTimeout(() => {
      console.log('Login successful:', formData.email);
      toast.success(t.success, {
        position: "top-right",
        autoClose: 3000,
      });
      
      // In real app, you would:
      // 1. Send login request to backend
      // 2. Store authentication token
      // 3. Redirect to dashboard
      
      setIsLoading(false);
    }, 1500);
  };


  // Handle Enter key press on inputs
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  };

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
            src="/nagarsewa.jpg"
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
                    onClick={() => setShowPassword(!showPassword)}
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
            {t.footerLinks.map((item, idx) => (
              <React.Fragment key={item}>
                {idx > 0 && <span className="text-white/40">•</span>}
                <span className="hover:text-white transition-colors cursor-pointer px-1">
                  {item}
                </span>
              </React.Fragment>
            ))}
          </div>
          <p className="text-white/60 text-sm mt-2 px-4">{t.copyright}</p>
        </div>
      </div>
    </div>
  );
};

export default Login;