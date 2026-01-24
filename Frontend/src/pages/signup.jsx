import React, { useState, useMemo } from "react";
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
  MapPin,
  Phone,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/useLanguage";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getProvinces, getDistricts, getMunicipalities } from '../utils/nepalLocation';

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
    phone: "Phone Number",
    phonePlaceholder: "+977 98XXXXXXXX",
    password: "Password",
    passwordPlaceholder: "Create a strong password",
    confirmPassword: "Confirm Password",
    confirmPasswordPlaceholder: "Re-enter your password",
    province: "Province",
    provincePlaceholder: "Select your province",
    district: "District",
    districtPlaceholder: "Select your district",
    municipality: "Municipality/VDC",
    municipalityPlaceholder: "Select your municipality",
    wardNumber: "Ward Number",
    wardNumberPlaceholder: "Select ward",
    locationDetails: "Location Details",
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
      phone: "Please enter your phone number",
      phoneInvalid: "Please enter a valid phone number",
      password: "Please enter a password",
      mismatch: "Passwords do not match",
      terms: "Please accept the terms and conditions",
      province: "Please select your province",
      district: "Please select your district",
      municipality: "Please select your municipality",
      ward: "Please enter your ward number",
      wardInvalid: "Ward number must be between 1 and 35",
      success: "Account created successfully!",
      provinceRestricted: "This feature is currently available only for Koshi Province. More provinces coming soon!",
      districtRestricted: "This feature is currently available only for Jhapa District. More districts coming soon!",
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
    phone: "फोन नम्बर",
    phonePlaceholder: "+९७७ ९८XXXXXXXX",
    password: "पासवर्ड",
    passwordPlaceholder: "बलियो पासवर्ड सिर्जना गर्नुहोस्",
    confirmPassword: "पासवर्ड पुष्टि गर्नुहोस्",
    confirmPasswordPlaceholder: "पासवर्ड पुन: प्रविष्ट गर्नुहोस्",
    province: "प्रदेश",
    provincePlaceholder: "आफ्नो प्रदेश छान्नुहोस्",
    district: "जिल्ला",
    districtPlaceholder: "आफ्नो जिल्ला छान्नुहोस्",
    municipality: "नगरपालिका/गाउँपालिका",
    municipalityPlaceholder: "आफ्नो नगरपालिका छान्नुहोस्",
    wardNumber: "वडा नम्बर",
    wardNumberPlaceholder: "वडा छान्नुहोस्",
    locationDetails: "स्थान विवरण",
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
      phone: "कृपया आफ्नो फोन नम्बर प्रविष्ट गर्नुहोस्",
      phoneInvalid: "कृपया मान्य फोन नम्बर प्रविष्ट गर्नुहोस्",
      password: "कृपया पासवर्ड प्रविष्ट गर्नुहोस्",
      mismatch: "पासवर्ड मिलेन",
      terms: "कृपया सर्तहरू स्वीकार गर्नुहोस्",
      province: "कृपया आफ्नो प्रदेश छान्नुहोस्",
      district: "कृपया आफ्नो जिल्ला छान्नुहोस्",
      municipality: "कृपया आफ्नो नगरपालिका छान्नुहोस्",
      ward: "कृपया आफ्नो वडा नम्बर प्रविष्ट गर्नुहोस्",
      wardInvalid: "वडा नम्बर १ र ३५ बीच हुनुपर्छ",
      success: "खाता सफलतापूर्वक सिर्जना भयो!",
      provinceRestricted: "यो सुविधा हाल कोशी प्रदेशको लागि मात्र उपलब्ध छ। थप प्रदेशहरू चाँडै आउँदैछन्!",
      districtRestricted: "यो सुविधा हाल झापा जिल्लाको लागि मात्र उपलब्ध छ। थप जिल्लाहरू चाँडै आउँदैछन्!",
    },
    toggleLabel: "English",
  },
};

// Simple component to show password requirements
const PasswordRequirement = ({ met, text }) => (
  <div className={`text-sm ${met ? "text-green-600" : "text-gray-400"}`}>
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
    phone: "",
    province: "",
    district: "",
    municipality: "",
    wardNumber: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  // Load all provinces (static data)
  const provinces = useMemo(() => getProvinces(), []);

  // Derive districts based on selected province
  const districts = useMemo(() => {
    if (formData.province) {
      return getDistricts(formData.province);
    }
    return [];
  }, [formData.province]);

  // Derive municipalities based on selected district
  const municipalities = useMemo(() => {
    if (formData.district) {
      return getMunicipalities(formData.district);
    }
    return [];
  }, [formData.district]);

  // Get selected municipality's total wards
  const selectedMunicipality = useMemo(() => {
    if (formData.municipality) {
      return municipalities.find(m => String(m.id) === String(formData.municipality));
    }
    return null;
  }, [formData.municipality, municipalities]);

  // Generate ward options based on selected municipality
  const wardOptions = useMemo(() => {
    if (selectedMunicipality && selectedMunicipality.totalWard) {
      return Array.from({ length: selectedMunicipality.totalWard }, (_, i) => i + 1);
    }
    return [];
  }, [selectedMunicipality]);

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

  // Allowed province and district codes
  const ALLOWED_PROVINCE_CODE = '1'; // Koshi Province
  const ALLOWED_DISTRICT_CODE = '111'; // Jhapa District

  // Handle input changes - reset dependent fields when location changes
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    
    // When province changes, reset district, municipality and ward
    if (name === 'province') {
      // Check if selected province is allowed (Koshi Province = 1)
      if (value && value !== ALLOWED_PROVINCE_CODE) {
        toast.warning(t.alerts.provinceRestricted, { 
          position: "top-right", 
          autoClose: 4000,
          icon: "🚧"
        });
        // Reset province selection
        setFormData(prev => ({
          ...prev,
          province: '',
          district: '',
          municipality: '',
          wardNumber: ''
        }));
        return;
      }
      setFormData(prev => ({
        ...prev,
        province: value,
        district: '',
        municipality: '',
        wardNumber: ''
      }));
      return;
    }
    
    // When district changes, reset municipality and ward
    if (name === 'district') {
      // Check if selected district is allowed (Jhapa = 111)
      if (value && value !== ALLOWED_DISTRICT_CODE) {
        toast.warning(t.alerts.districtRestricted, { 
          position: "top-right", 
          autoClose: 4000,
          icon: "🚧"
        });
        // Reset district selection
        setFormData(prev => ({
          ...prev,
          district: '',
          municipality: '',
          wardNumber: ''
        }));
        return;
      }
      setFormData(prev => ({
        ...prev,
        district: value,
        municipality: '',
        wardNumber: ''
      }));
      return;
    }
    
    // When municipality changes, reset ward
    if (name === 'municipality') {
      setFormData(prev => ({
        ...prev,
        municipality: value,
        wardNumber: ''
      }));
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Toggle terms acceptance
  const toggleTerms = () => {
    setFormData({ ...formData, acceptTerms: !formData.acceptTerms });
  };

  // Handle form submission
  const handleSubmit = () => {
    // Basic validation
    if (!formData.fullName) {
      toast.error(t.alerts.name, { position: "top-right", autoClose: 3000 });
      return;
    }
    if (!formData.email) {
      toast.error(t.alerts.email, { position: "top-right", autoClose: 3000 });
      return;
    }
    if (!formData.phone) {
      toast.error(t.alerts.phone, { position: "top-right", autoClose: 3000 });
      return;
    }
    // Validate phone number (Nepal format: 10 digits starting with 9)
    const phoneRegex = /^9[0-9]{9}$/;
    const cleanPhone = formData.phone.replace(/[^0-9]/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      toast.error(t.alerts.phoneInvalid, { position: "top-right", autoClose: 3000 });
      return;
    }
    if (!formData.province) {
      toast.error(t.alerts.province, { position: "top-right", autoClose: 3000 });
      return;
    }
    if (!formData.district) {
      toast.error(t.alerts.district, { position: "top-right", autoClose: 3000 });
      return;
    }
    if (!formData.municipality) {
      toast.error(t.alerts.municipality, { position: "top-right", autoClose: 3000 });
      return;
    }
    if (!formData.wardNumber) {
      toast.error(t.alerts.ward, { position: "top-right", autoClose: 3000 });
      return;
    }
    if (!formData.password) {
      toast.error(t.alerts.password, { position: "top-right", autoClose: 3000 });
      return;
    }
    if (!passwordsMatch) {
      toast.error(t.alerts.mismatch, { position: "top-right", autoClose: 3000 });
      return;
    }
    if (!formData.acceptTerms) {
      toast.error(t.alerts.terms, { position: "top-right", autoClose: 3000 });
      return;
    }

    // Submit the form
    console.log("Form submitted:", formData);
    toast.success(t.alerts.success, { position: "top-right", autoClose: 3000 });
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="h-screen overflow-hidden bg-linear-to-br from-emerald-950 via-emerald-900 to-teal-900 py-2 px-4">
      <ToastContainer />
      <div className="max-w-6xl mx-auto">
        {/* Language Toggle */}
        <div className="flex justify-end mb-1">
          <button
            onClick={toggleLanguage}
            className="px-3 py-1.5 bg-white/10 border border-white/30 text-white text-sm rounded-lg hover:bg-white/20 backdrop-blur"
          >
            {t.toggleLabel}
          </button>
        </div>
        
        {/* Header Section */}
        <div className="text-center mb-2">
          <div className="inline-flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 bg-white rounded-xl shadow-lg">
              <Building2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                {t.brand}
              </h1>
              <p className="text-white/80 text-sm">
                {t.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content - Form + Benefits */}
        <div className="flex flex-col lg:flex-row gap-3">
          
          {/* Main Form Card */}
          <div className="flex-1 bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Form Header */}
            <div className="bg-linear-to-r from-emerald-600 to-teal-600 p-3 text-white">
              <div className="flex items-center justify-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold">{t.formTitle}</h2>
                  <p className="text-white/90 text-xs md:text-sm">{t.formSubtitle}</p>
                </div>
              </div>
            </div>

          {/* Form Content */}
          <div className="p-3 md:p-4">
            <div className="space-y-3">
              
              {/* Row 1: Full Name, Email, Phone */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-0.5">
                    <User className="inline w-4 h-4 mr-1 text-gray-400" />
                    {t.fullName} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder={t.fullNamePlaceholder}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-0.5">
                    <Mail className="inline w-4 h-4 mr-1 text-gray-400" />
                    {t.email} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder={t.emailPlaceholder}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-0.5">
                    <Phone className="inline w-4 h-4 mr-1 text-gray-400" />
                    {t.phone} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder={t.phonePlaceholder}
                  />
                </div>
              </div>

              {/* Location Section Header */}
              <div className="pt-0">
                <label className="text-sm font-semibold text-gray-700 flex items-center">
                  <MapPin className="w-4 h-4 mr-1 text-emerald-600" />
                  {t.locationDetails}
                </label>
              </div>

              {/* Row 2: Province, District, Municipality, Ward */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Province */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-0.5">
                    {t.province} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white"
                  >
                    <option value="">{t.provincePlaceholder}</option>
                    {provinces.map((province) => (
                      <option key={province.id} value={province.id}>
                        {language === 'np' && province.nameNp ? province.nameNp : province.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* District */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-0.5">
                    {t.district} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    disabled={!formData.province}
                    className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">{t.districtPlaceholder}</option>
                    {districts.map((district) => (
                      <option key={district.id} value={district.id}>
                        {language === 'np' && district.nameNp ? district.nameNp : district.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Municipality */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-0.5">
                    {t.municipality} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="municipality"
                    value={formData.municipality}
                    onChange={handleInputChange}
                    disabled={!formData.district}
                    className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">{t.municipalityPlaceholder}</option>
                    {municipalities.map((municipality) => (
                      <option key={municipality.id} value={municipality.id}>
                        {language === 'np' && municipality.nameNp ? municipality.nameNp : municipality.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ward Number Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-0.5">
                    {t.wardNumber} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="wardNumber"
                    value={formData.wardNumber}
                    onChange={handleInputChange}
                    disabled={!formData.municipality || wardOptions.length === 0}
                    className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">{t.wardNumberPlaceholder}</option>
                    {wardOptions.map((ward) => (
                      <option key={ward} value={ward}>
                        {language === 'np' ? `\u0935\u0921\u093e ${ward}` : `Ward ${ward}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Password and Confirm Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-0.5">
                    <Lock className="inline w-4 h-4 mr-1 text-gray-400" />
                    {t.password} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-2 py-2 pr-9 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      placeholder={t.passwordPlaceholder}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Password Strength */}
                  {formData.password && (
                    <div className="mt-1">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="text-xs text-gray-600">{t.strength}</span>
                        <span className={`text-xs font-medium ${
                          passwordStrength.score <= 1 ? "text-red-600" :
                          passwordStrength.score === 2 ? "text-yellow-600" :
                          passwordStrength.score === 3 ? "text-teal-600" : "text-green-600"
                        }`}>{passwordStrength.message}</span>
                      </div>
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4].map((bar) => (
                          <div key={bar} className={`h-1 rounded-full flex-1 ${
                            bar <= passwordStrength.score ? getStrengthColor(passwordStrength.score) : "bg-gray-200"
                          }`} />
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <PasswordRequirement met={hasMinLength} text={t.reqLen} />
                        <PasswordRequirement met={hasUppercase} text={t.reqUpper} />
                        <PasswordRequirement met={hasLowercase} text={t.reqLower} />
                        <PasswordRequirement met={hasNumber} text={t.reqNumber} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-0.5">
                    <Lock className="inline w-4 h-4 mr-1 text-gray-400" />
                    {t.confirmPassword} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full px-2 py-2 pr-9 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      placeholder={t.confirmPasswordPlaceholder}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {formData.password && formData.confirmPassword && (
                    <div className={`mt-1 text-xs flex items-center ${passwordsMatch ? "text-green-600" : "text-red-600"}`}>
                      {passwordsMatch ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                      {passwordsMatch ? t.matchYes : t.matchNo}
                    </div>
                  )}
                </div>
              </div>

              {/* Terms and Submit Row */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
                {/* Terms Checkbox */}
                <div className="flex items-start gap-2">
                  <button
                    type="button"
                    onClick={toggleTerms}
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      formData.acceptTerms ? "bg-teal-600 border-teal-600" : "border-gray-300 hover:border-teal-500"
                    }`}
                  >
                    {formData.acceptTerms && <Check className="w-2.5 h-2.5 text-white" />}
                  </button>
                  <label className="text-sm text-gray-600 cursor-pointer" onClick={toggleTerms}>
                    {t.termsText}{" "}
                    <span className="text-emerald-600 font-medium hover:text-emerald-800">{t.termsLink}</span>
                    {" "}{language === "en" ? "and" : "\u0930"}{" "}
                    <span className="text-emerald-600 font-medium hover:text-emerald-800">{t.privacyLink}</span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  className="w-full sm:w-auto px-6 py-2 bg-linear-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 text-sm"
                >
                  {t.createAccount}
                </button>
              </div>

              {/* Login Link */}
              <div className="text-center pt-1">
                <p className="text-gray-600 text-sm">
                  {t.loginPrompt}{" "}
                  <Link to='/login' className="text-emerald-600 font-semibold hover:text-emerald-800">
                    {t.loginLink}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

          {/* Benefits Section - Desktop Only */}
          <div className="hidden lg:flex lg:w-72 flex-col">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 h-full">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-300" />
                </div>
                <h3 className="text-lg font-bold text-white">{t.benefitsTitle}</h3>
              </div>
              
              <div className="space-y-3">
                {/* Benefit 1 */}
                <div className="flex items-start gap-2 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                    <FileText className="w-3.5 h-3.5 text-blue-300" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-sm">{t.benefit1Title}</h4>
                    <p className="text-white/70 text-xs">{t.benefit1Desc}</p>
                  </div>
                </div>
                
                {/* Benefit 2 */}
                <div className="flex items-start gap-2 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                    <Mail className="w-3.5 h-3.5 text-purple-300" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-sm">{t.benefit2Title}</h4>
                    <p className="text-white/70 text-xs">{t.benefit2Desc}</p>
                  </div>
                </div>
                
                {/* Benefit 3 */}
                <div className="flex items-start gap-2 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                    <Building2 className="w-3.5 h-3.5 text-amber-300" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-sm">{t.benefit3Title}</h4>
                    <p className="text-white/70 text-xs">{t.benefit3Desc}</p>
                  </div>
                </div>
                
                {/* Benefit 4 */}
                <div className="flex items-start gap-2 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-teal-500/20 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-sm">{t.benefit4Title}</h4>
                    <p className="text-white/70 text-xs">{t.benefit4Desc}</p>
                  </div>
                </div>
              </div>
              
              {/* Security Badge */}
              <div className="mt-4 pt-3 border-t border-white/20">
                <div className="flex items-center gap-2 text-white/80">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs">{t.security}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-2 text-center">
          <div className="flex flex-wrap justify-center gap-2 text-sm text-white/80">
            {t.footerLinks.map((item, idx) => (
              <React.Fragment key={item}>
                {idx > 0 && <span className="text-white/40">•</span>}
                <span className="hover:text-white transition-colors cursor-pointer">{item}</span>
              </React.Fragment>
            ))}
          </div>
          <p className="text-white/60 text-xs mt-1">{t.copyright}</p>
        </footer>
      </div>
    </div>
  );
}