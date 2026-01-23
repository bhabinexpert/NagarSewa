import React, { useState } from "react";
import {
  Mail,
  Lock,
  User,
  Building2,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/useLanguage";

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
      alert(t.success);
      
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
    <div className="min-h-screen bg-linear-to-br from-emerald-950 via-emerald-900 to-teal-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleLanguage}
            className="px-4 py-2 bg-white/10 border border-white/30 text-white text-sm rounded-lg hover:bg-white/20 backdrop-blur"
          >
            {t.toggleLabel}
          </button>
        </div>
        
        {/* Logo and Header Section */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <Building2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{t.brand}</h1>
          <p className="text-white/80 text-base">{t.subtitle}</p>
        </div>

        {/* Main Login Card */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          
          {/* Card Header with Gradient Background */}
          <div className="bg-linear-to-r from-emerald-600 to-teal-600 p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <User className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{t.welcome}</h2>
                <p className="text-white/90 text-sm mt-1">{t.subWelcome}</p>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-8">
            
            {/* Error Message Display */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              
              {/* Email Input Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="inline w-4 h-4 mr-2 text-gray-400" />
                  {t.email}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder={t.emailPlaceholder}
                  disabled={isLoading}
                />
              </div>

              {/* Password Input Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="inline w-4 h-4 mr-2 text-gray-400" />
                  {t.password}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder={t.passwordPlaceholder}
                    disabled={isLoading}
                  />
                  {/* Toggle password visibility button */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Sign In Button */}
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full py-4 bg-linear-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {t.signingIn}
                  </div>
                ) : (
                  t.signIn
                )}
              </button>
              {/* Create Account Link */}
              <div className="text-center pt-2">
                <p className="text-gray-600 text-base">
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
        <div className="mt-6 text-center">
          <div className="flex flex-wrap justify-center gap-4 text-sm text-white/80">
            {t.footerLinks.map((item, idx) => (
              <React.Fragment key={item}>
                {idx > 0 && <span className="text-white/40">•</span>}
                <span className="hover:text-white transition-colors cursor-pointer px-2">
                  {item}
                </span>
              </React.Fragment>
            ))}
          </div>
          <p className="text-white/60 text-xs mt-4">{t.copyright}</p>
        </div>
      </div>
    </div>
  );
};

export default Login;