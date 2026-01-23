import React, { useState } from "react";
import {
  User,
  Mail,
  Lock,
  Building2,
  FileText,
  Check,
  Eye,
  EyeOff,
  ShieldCheck,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/useLanguage";

const signupText = {
  en: {
    brand: "NagarSewa",
    subtitle: "Create Your Digital Citizen Account",
    formTitle: "Create Your Account",
    formSubtitle: "Join thousands of citizens using digital services",
    fullName: "Full Name",
    fullNamePlaceholder: "As per citizenship certificate",
    email: "Email Address",
    emailPlaceholder: "citizen@example.com",
    password: "Password",
    passwordPlaceholder: "Create a strong password",
    confirmPassword: "Confirm Password",
    confirmPasswordPlaceholder: "Re-enter your password",
    strength: "Strength:",
    strengthLabels: ["", "Weak", "Medium", "Good", "Strong"],
    reqLen: "8+ characters",
    reqUpper: "Uppercase",
    reqLower: "Lowercase",
    reqNumber: "Number",
    matchYes: "Passwords match",
    matchNo: "Passwords do not match",
    termsText: "I accept the",
    termsLink: "Terms of Service",
    privacyLink: "Privacy Policy",
    createAccount: "Create Account",
    loginPrompt: "Already have an account?",
    loginLink: "Log In",
    benefitsTitle: "Why Join NagarSewa?",
    benefit1Title: "Smart Issue Reporting",
    benefit1Desc: "Track progress smartly",
    benefit2Title: "Service Requests",
    benefit2Desc: "Appeal for services and events",
    benefit3Title: "Notifications",
    benefit3Desc: "Important municipal updates",
    benefit4Title: "24/7 Support",
    benefit4Desc: "Government-certified assistance",
    security: "Government verified & secure platform",
    footerLinks: ["Help Center", "FAQ", "Contact Support"],
    copyright: "© 2023 NagarSewa",
    alerts: {
      name: "Please enter your full name",
      email: "Please enter your email",
      password: "Please enter a password",
      mismatch: "Passwords do not match",
      terms: "Please accept the terms and conditions",
      success: "Account created successfully!",
    },
    toggleLabel: "नेपाली",
  },
  np: {
    brand: "नगरसेवा",
    subtitle: "आफ्नो डिजिटल नागरिक खाता बनाउनुहोस्",
    formTitle: "खाता बनाउनुहोस्",
    formSubtitle: "डिजिटल सेवा प्रयोग गर्ने हजारौं नागरिकमा सामेल हुनुहोस्",
    fullName: "पुरा नाम",
    fullNamePlaceholder: "नागरिकता प्रमाणपत्र अनुसार",
    email: "इमेल ठेगाना",
    emailPlaceholder: "citizen@example.com",
    password: "पासवर्ड",
    passwordPlaceholder: "बलियो पासवर्ड सिर्जना गर्नुहोस्",
    confirmPassword: "पासवर्ड पुष्टि गर्नुहोस्",
    confirmPasswordPlaceholder: "पासवर्ड पुन: प्रविष्ट गर्नुहोस्",
    strength: "मजबूती:",
    strengthLabels: ["", "कमजोर", "मध्यम", "राम्रो", "बलियो"],
    reqLen: "८+ क्यारेक्टर",
    reqUpper: "ठूलो अक्षर",
    reqLower: "सानो अक्षर",
    reqNumber: "संख्या",
    matchYes: "पासवर्ड मिल्यो",
    matchNo: "पासवर्ड मिलेन",
    termsText: "म स्वीकार गर्दछु",
    termsLink: "सेवा सर्तहरू",
    privacyLink: "गोपनीयता नीति",
    createAccount: "खाता बनाउनुहोस्",
    loginPrompt: "पहिले नै खाता छ?",
    loginLink: "लग इन गर्नुहोस्",
    benefitsTitle: "किन नगरसेवा?",
    benefit1Title: "स्मार्ट समस्या रिपोर्टिंग",
    benefit1Desc: "प्रगति स्मार्ट तरिकाले ट्र्याक गर्नुहोस्",
    benefit2Title: "सेवा अनुरोध",
    benefit2Desc: "सेवा र कार्यक्रमका लागि अपील",
    benefit3Title: "सूचनाहरू",
    benefit3Desc: "महत्वपूर्ण नगरपालिका अपडेटहरू",
    benefit4Title: "२४/७ समर्थन",
    benefit4Desc: "सरकारी प्रमाणित सहायता",
    security: "सरकारद्वारा प्रमाणित सुरक्षित प्लेटफर्म",
    footerLinks: ["सहायता केन्द्र", "FAQ", "सम्पर्क समर्थन"],
    copyright: "© 2023 नगरसेवा",
    alerts: {
      name: "कृपया आफ्नो पुरा नाम प्रविष्ट गर्नुहोस्",
      email: "कृपया आफ्नो इमेल प्रविष्ट गर्नुहोस्",
      password: "कृपया पासवर्ड प्रविष्ट गर्नुहोस्",
      mismatch: "पासवर्ड मिलेन",
      terms: "कृपया सर्तहरू स्वीकार गर्नुहोस्",
      success: "खाता सफलतापूर्वक सिर्जना भयो!",
    },
    toggleLabel: "English",
  },
};

// Simple component to show password requirements
const PasswordRequirement = ({ met, text }) => (
  <div className={`text-xs ${met ? "text-green-600" : "text-gray-400"}`}>
    {text}
  </div>
);

export default function Signup() {
  const { language, toggleLanguage } = useLanguage();
  const t = signupText[language];
  // Form data state - stores all user inputs
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  // Toggle visibility for password fields
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Calculate password strength based on length
  const getPasswordStrength = () => {
    const length = formData.password.length;
    if (length === 0) return { score: 0, message: t.strengthLabels[0] };
    if (length < 3) return { score: 1, message: t.strengthLabels[1] };
    if (length < 5) return { score: 2, message: t.strengthLabels[2] };
    if (length < 8) return { score: 3, message: t.strengthLabels[3] };
    return { score: 4, message: t.strengthLabels[4] };
  };

  // Get color for strength indicator bar
  const getStrengthColor = (score) => {
    if (score <= 1) return "bg-red-600";
    if (score === 2) return "bg-yellow-600";
    if (score === 3) return "bg-teal-600";
    return "bg-emerald-600";
  };

  // Check if passwords match
  const passwordsMatch = formData.password === formData.confirmPassword;

  // Check individual password requirements
  const hasMinLength = formData.password.length >= 8;
  const hasUppercase = /[A-Z]/.test(formData.password);
  const hasLowercase = /[a-z]/.test(formData.password);
  const hasNumber = /[0-9]/.test(formData.password);

  // Handle input changes
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  // Toggle terms acceptance
  const toggleTerms = () => {
    setFormData({ ...formData, acceptTerms: !formData.acceptTerms });
  };

  // Handle form submission
  const handleSubmit = () => {
    // Basic validation
    if (!formData.fullName) {
      alert(t.alerts.name);
      return;
    }
    if (!formData.email) {
      alert(t.alerts.email);
      return;
    }
    if (!formData.password) {
      alert(t.alerts.password);
      return;
    }
    if (!passwordsMatch) {
      alert(t.alerts.mismatch);
      return;
    }
    if (!formData.acceptTerms) {
      alert(t.alerts.terms);
      return;
    }

    // Submit the form
    console.log("Form submitted:", formData);
    alert(t.alerts.success);
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="h-screen w-screen overflow-hidden bg-linear-to-br from-emerald-950 via-emerald-900 to-teal-900">
      <div className="h-full w-full flex flex-col max-w-6xl mx-auto px-4 py-4">
        <div className="flex justify-end mb-2">
          <button
            onClick={toggleLanguage}
            className="px-4 py-2 bg-white/10 border border-white/30 text-white text-sm rounded-lg hover:bg-white/20 backdrop-blur"
          >
            {t.toggleLabel}
          </button>
        </div>
        
        {/* Header Section */}
        <div className="text-center mb-3 shrink-0">
          <div className="inline-flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-white rounded-xl shadow-lg">
              <Building2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-left m-5">
              <h1 className="text-xl font-bold text-white leading-tight">
                {t.brand}
              </h1>
              <p className="text-white/80 text-xs">
                {t.subtitle}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex gap-10 overflow-hidden min-h-0">
          
          {/* Main Signup Form */}
          <div className="lg:w-2/3 flex flex-col min-h-0 mr-3 p-3">
            <div className="bg-white rounded-2xl shadow-md flex flex-col h-full overflow-hidden">
              
              {/* Form Header */}
              <div className="bg-linear-to-r from-emerald-600 to-teal-600 p-3 text-white shrink-0">
                <div className="flex items-center justify-center gap-4 p-2">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">{t.formTitle}</h2>
                    <p className="text-white/90 text-xs">
                      {t.formSubtitle}
                    </p>
                  </div>
                </div>
              </div>

              {/* Scrollable Form Content */}
              <div className="flex-1 overflow-y-auto p-4 min-h-0">
                <div className="space-y-3">
                  
                  {/* Name and Email Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Full Name Input */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        <User className="inline w-3 h-3 mr-1 text-gray-400" />
                        {t.fullName}
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        placeholder={t.fullNamePlaceholder}
                      />
                    </div>

                    {/* Email Input */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        <Mail className="inline w-3 h-3 mr-1 text-gray-400" />
                        {t.email}
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        placeholder={t.emailPlaceholder}
                      />
                    </div>
                  </div>

                  {/* Password Fields Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    
                    {/* Password Input */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        <Lock className="inline w-3 h-3 mr-1 text-gray-400" />
                        {t.password}
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                          placeholder={t.passwordPlaceholder}
                        />
                        {/* Toggle password visibility button */}
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Password Strength Indicator - Only show if password has content */}
                      {formData.password && (
                        <div className="mt-2">
                          {/* Strength label and score */}
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-600">{t.strength}</span>
                            <span className={`text-xs font-medium ${
                              passwordStrength.score <= 1 ? "text-red-600" :
                              passwordStrength.score === 2 ? "text-yellow-600" :
                              passwordStrength.score === 3 ? "text-teal-600" :
                              "text-green-600"
                            }`}>
                              {passwordStrength.message}
                            </span>
                          </div>
                          
                          {/* Strength bars */}
                          <div className="flex gap-1 mb-2">
                            {[1, 2, 3, 4].map((barNumber) => (
                              <div
                                key={barNumber}
                                className={`h-1 rounded-full flex-1 ${
                                  barNumber <= passwordStrength.score
                                    ? getStrengthColor(passwordStrength.score)
                                    : "bg-gray-200"
                                }`}
                              />
                            ))}
                          </div>
                          
                          {/* Password requirements checklist */}
                          <div className="grid grid-cols-2 gap-1">
                            <PasswordRequirement met={hasMinLength} text={t.reqLen} />
                            <PasswordRequirement met={hasUppercase} text={t.reqUpper} />
                            <PasswordRequirement met={hasLowercase} text={t.reqLower} />
                            <PasswordRequirement met={hasNumber} text={t.reqNumber} />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password Input */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        <Lock className="inline w-3 h-3 mr-1 text-gray-400" />
                        {t.confirmPassword}
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                          placeholder={t.confirmPasswordPlaceholder}
                        />
                        {/* Toggle confirm password visibility button */}
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Password match indicator - Only show if both passwords have content */}
                      {formData.password && formData.confirmPassword && (
                        <div className={`mt-2 text-xs flex items-center ${
                          passwordsMatch ? "text-green-600" : "text-red-600"
                        }`}>
                          {passwordsMatch ? (
                            <Check className="w-3 h-3 mr-1" />
                          ) : (
                            <X className="w-3 h-3 mr-1" />
                          )}
                          {passwordsMatch ? t.matchYes : t.matchNo}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Terms and Conditions Checkbox */}
                  <div className="flex items-start gap-2">
                    <button
                      type="button"
                      onClick={toggleTerms}
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        formData.acceptTerms
                          ? "bg-teal-600 border-teal-600"
                          : "border-gray-300 hover:border-teal-500"
                      }`}
                    >
                      {formData.acceptTerms && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </button>
                    <label className="text-xs text-gray-600 cursor-pointer" onClick={toggleTerms}>
                      {t.termsText}{" "}
                      <span className="text-emerald-600 font-medium hover:text-emerald-800">
                        {t.termsLink}
                      </span>{" "}
                      {language === "en" ? "and" : "र"}{" "}
                      <span className="text-emerald-600 font-medium hover:text-emerald-800">
                        {t.privacyLink}
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmit}
                    className="w-full py-2.5 bg-linear-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 text-sm"
                  >
                    {t.createAccount}
                  </button>

                  {/* Login Link */}
                  <div className="text-center pt-1">
                    <p className="text-gray-600 text-xs">
                      {t.loginPrompt}{" "}
                      <span className="text-emerald-600 font-semibold hover:text-emerald-800 cursor-pointer">
                        <Link to='/login'>{t.loginLink}</Link>
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits Section - Desktop Only */}
          <div className="hidden lg:flex lg:w-1/3 flex-col min-h-0 m-3 p-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 flex flex-col overflow-hidden">
              
              {/* Benefits Header */}
              <div className="text-white mb-3 shrink-0">
                <ShieldCheck className="w-8 h-8 mb-2" />
                <h3 className="text-lg font-bold mb-2">{t.benefitsTitle}</h3>
                <p className="text-white/80 text-xs">
                  {t.formSubtitle}
                </p>
              </div>

              {/* Benefits List */}
              <div className="space-y-3 flex-1 overflow-y-auto min-h-0">
                {/* Benefit 1 */}
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-full bg-teal-500/20 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-teal-300" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-xs">
                      {t.benefit1Title}
                    </h4>
                    <p className="text-white/70 text-xs mt-0.5">
                      {t.benefit1Desc}
                    </p>
                  </div>
                </div>

                {/* Benefit 2 */}
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-cyan-300" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-xs">
                      {t.benefit2Title}
                    </h4>
                    <p className="text-white/70 text-xs mt-0.5">
                      {t.benefit2Desc}
                    </p>
                  </div>
                </div>

                {/* Benefit 3 */}
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-purple-300" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-xs">
                      {t.benefit3Title}
                    </h4>
                    <p className="text-white/70 text-xs mt-0.5">
                      {t.benefit3Desc}
                    </p>
                  </div>
                </div>

                {/* Benefit 4 */}
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-green-300" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-xs">
                      {t.benefit4Title}
                    </h4>
                    <p className="text-white/70 text-xs mt-0.5">
                      {t.benefit4Desc}
                    </p>
                  </div>
                </div>
              </div>

              {/* Security Badge */}
              <div className="mt-3 pt-3 border-t border-white/20 shrink-0">
                <p className="text-white/60 text-xs">
                  <ShieldCheck className="inline w-3 h-3 mr-1" />
                  {t.security}
                </p>
              </div>
            </div>
          </div>
        </div>
        

        {/* Footer */}
        <footer className="mt-3 text-center shrink-0">
          <div className="flex flex-wrap justify-center gap-2 text-xs text-white/80">
            {t.footerLinks.map((item, idx) => (
              <React.Fragment key={item}>
                {idx > 0 && <span className="text-white/40">•</span>}
                <span className="hover:text-white transition-colors cursor-pointer">
                  {item}
                </span>
              </React.Fragment>
            ))}
          </div>
          <p className="text-white/60 text-xs mt-1">{t.copyright}</p>
        </footer>
      </div>
    </div>
  );
}