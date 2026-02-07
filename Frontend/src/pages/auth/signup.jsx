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
  Crosshair,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../contexts/language/useLanguage";
import { toast, ToastContainer } from "react-toastify";
import { authAPI } from "../../services/api";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import {
  getProvinces,
  getDistricts,
  getMunicipalities,
} from "../../utils/nepalLocation";

// ============================================================
// TEXT TRANSLATIONS
// Contains all text content in English and Nepali
// ============================================================

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
    gender: "Gender",
    genderPlaceholder: "Select your gender",
    male: "Male",
    female: "Female",
    other: "Other",
    dateOfBirth: "Date of Birth",
    dateOfBirthPlaceholder: "Select your date of birth",
    address: "Address",
    addressPlaceholder: "Enter your full address",
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
      nameShort: "Name must be at least 3 characters",
      email: "Please enter your email",
      emailInvalid: "Please enter a valid email address (e.g., user@example.com)",
      phone: "Please enter your phone number",
      phoneInvalid: "Please enter a valid 10-digit Nepali phone number (starting with 9)",
      password: "Please enter a password",
      passwordWeak: "Password is too weak. Please use at least 8 characters with uppercase, lowercase, and numbers",
      mismatch: "Passwords do not match",
      terms: "Please accept the terms and conditions",
      province: "Please select your province",
      district: "Please select your district",
      municipality: "Please select your municipality",
      ward: "Please enter your ward number",
      wardInvalid: "Ward number must be between 1 and 35",
      gender: "Please select your gender",
      dob: "Please select your date of birth",
      dobAge: "You must be at least 18 years old to register",
      address: "Please enter a valid address (at least 5 characters)",
      success: "Account created successfully!",
      provinceRestricted:
        "This feature is currently available only for Koshi Province. More provinces coming soon!",
      districtRestricted:
        "This feature is currently available only for Jhapa District. More districts coming soon!",
      municipalityRestricted:
        "This feature is currently available only for Damak Municipality. More municipalities coming soon!",
      locationDetected: "Location detected successfully!",
      locationError: "Could not detect your location. Please select manually.",
      locationPermissionDenied:
        "Location access denied. Please enable location permission.",
      locationOutsideJhapa:
        "You appear to be outside Jhapa District. Please select your location manually.",
    },
    useMyLocation: "Use My Location",
    detectingLocation: "Detecting...",
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
    gender: "लिंग",
    genderPlaceholder: "आफ्नो लिंग छान्नुहोस्",
    male: "पुरुष",
    female: "महिला",
    other: "अन्य",
    dateOfBirth: "जन्म मिति",
    dateOfBirthPlaceholder: "आफ्नो जन्म मिति छान्नुहोस्",
    address: "ठेगाना",
    addressPlaceholder: "आफ्नो पूर्ण ठेगाना प्रविष्ट गर्नुहोस्",
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
      nameShort: "नाम कम्तिमा ३ अक्षरको हुनुपर्छ",
      email: "कृपया आफ्नो इमेल प्रविष्ट गर्नुहोस्",
      emailInvalid: "कृपया मान्य इमेल ठेगाना प्रविष्ट गर्नुहोस् (उदाहरण: user@example.com)",
      phone: "कृपया आफ्नो फोन नम्बर प्रविष्ट गर्नुहोस्",
      phoneInvalid: "कृपया मान्य १० अङ्कको नेपाली फोन नम्बर प्रविष्ट गर्नुहोस् (९ बाट सुरु हुने)",
      password: "कृपया पासवर्ड प्रविष्ट गर्नुहोस्",
      passwordWeak: "पासवर्ड धेरै कमजोर छ। कृपया कम्तिमा ८ अक्षर ठूलो, सानो अक्षर र सङ्ख्यासहित प्रयोग गर्नुहोस्",
      mismatch: "पासवर्ड मिलेन",
      terms: "कृपया सर्तहरू स्वीकार गर्नुहोस्",
      province: "कृपया आफ्नो प्रदेश छान्नुहोस्",
      district: "कृपया आफ्नो जिल्ला छान्नुहोस्",
      municipality: "कृपया आफ्नो नगरपालिका छान्नुहोस्",
      ward: "कृपया आफ्नो वडा नम्बर प्रविष्ट गर्नुहोस्",
      wardInvalid: "वडा नम्बर १ र ३५ बीच हुनुपर्छ",
      gender: "कृपया आफ्नो लिंग छान्नुहोस्",
      dob: "कृपया आफ्नो जन्म मिति छान्नुहोस्",
      dobAge: "दर्ता गर्न तपाईं कम्तिमा १८ वर्षको हुनुपर्छ",
      address: "कृपया मान्य ठेगाना प्रविष्ट गर्नुहोस् (कम्तिमा ५ अक्षर)",
      success: "खाता सफलतापूर्वक सिर्जना भयो!",
      provinceRestricted:
        "यो सुविधा हाल कोशी प्रदेशको लागि मात्र उपलब्ध छ। थप प्रदेशहरू चाँडै आउँदैछन्!",
      districtRestricted:
        "यो सुविधा हाल झापा जिल्लाको लागि मात्र उपलब्ध छ। थप जिल्लाहरू चाँडै आउँदैछन्!",
      municipalityRestricted:
        "यो सुविधा हाल दमक नगरपालिकाको लागि मात्र उपलब्ध छ। थप नगरपालिकाहरू चाँडै आउँदैछन्!",
      locationDetected: "स्थान सफलतापूर्वक पत्ता लाग्यो!",
      locationError:
        "तपाईंको स्थान पत्ता लगाउन सकिएन। कृपया म्यानुअल रूपमा छान्नुहोस्।",
      locationPermissionDenied:
        "स्थान पहुँच अस्वीकृत। कृपया स्थान अनुमति सक्षम गर्नुहोस्।",
      locationOutsideJhapa:
        "तपाईं झापा जिल्ला बाहिर हुनुहुन्छ जस्तो देखिन्छ। कृपया आफ्नो स्थान म्यानुअल रूपमा छान्नुहोस्।",
    },
    useMyLocation: "मेरो स्थान प्रयोग गर्नुहोस्",
    detectingLocation: "पत्ता लगाउँदै...",
    toggleLabel: "English",
  },
};

// ============================================================
// PASSWORD REQUIREMENT COMPONENT
// Simple component to display password requirement status
// ============================================================

/**
 * PasswordRequirement Component
 * Displays a single password requirement with met/unmet status.
 * @param {Object} props - Component props
 * @param {boolean} props.met - Whether the requirement is met
 * @param {string} props.text - The requirement text to display
 * @returns {JSX.Element} The requirement indicator
 */
function PasswordRequirement(props) {
  const met = props.met;
  const text = props.text;
  
  let colorClass = "text-gray-400";
  if (met) {
    colorClass = "text-green-600";
  }
  
  return (
    <div className={"text-sm " + colorClass}>
      {text}
    </div>
  );
}

// ============================================================
// SIGNUP COMPONENT
// Handles user registration with location selection
// ============================================================

/**
 * Signup Component
 * Handles new user registration with form validation.
 * Includes location selection (province, district, municipality, ward).
 * @returns {JSX.Element} The signup page
 */
export default function Signup() {
  // ============================================================
  // HOOKS AND CONTEXT
  // ============================================================
  const languageContext = useLanguage();
  const language = languageContext.language;
  const toggleLanguage = languageContext.toggleLanguage;
  
  const t = signupText[language];
  
  // ============================================================
  // STATE VARIABLES
  // ============================================================
  
  // Form data state - stores all user inputs
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    province: "",
    district: "",
    municipality: "",
    wardNumber: "",
    gender: "",
    dateOfBirth: "",
    address: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  // Toggle visibility for password fields
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Location detection loading state
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  
  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ============================================================
  // DERIVED DATA (using useMemo for expensive computations)
  // ============================================================

  // Load all provinces (static data)
  const provinces = useMemo(function() {
    return getProvinces();
  }, []);

  // Derive districts based on selected province
  const districts = useMemo(function() {
    if (formData.province) {
      return getDistricts(formData.province);
    }
    return [];
  }, [formData.province]);

  // Derive municipalities based on selected district
  const municipalities = useMemo(function() {
    if (formData.district) {
      return getMunicipalities(formData.district);
    }
    return [];
  }, [formData.district]);

  // Get selected municipality's total wards
  const selectedMunicipality = useMemo(function() {
    if (formData.municipality) {
      return municipalities.find(function(m) {
        return String(m.id) === String(formData.municipality);
      }) || null;
    }
    return null;
  }, [formData.municipality, municipalities]);

  // Generate ward options based on selected municipality
  const wardOptions = useMemo(function() {
    if (selectedMunicipality && selectedMunicipality.totalWard) {
      return Array.from({ length: selectedMunicipality.totalWard }, function(_, index) {
        return index + 1;
      });
    }
    return [];
  }, [selectedMunicipality]);

  // ============================================================
  // CONSTANTS
  // ============================================================
  
  // Allowed province and district codes
  const ALLOWED_PROVINCE_CODE = "1"; // Koshi Province
  const ALLOWED_DISTRICT_CODE = "111"; // Jhapa District
  const ALLOWED_MUNICIPALITY_CODE = "11107"; // Damak Municipality

  // ============================================================
  // PASSWORD VALIDATION
  // ============================================================

  // Check if passwords match
  const passwordsMatch = formData.password === formData.confirmPassword;

  // Check individual password requirements
  const hasMinLength = formData.password.length >= 8;
  const hasUppercase = /[A-Z]/.test(formData.password);
  const hasLowercase = /[a-z]/.test(formData.password);
  const hasNumber = /[0-9]/.test(formData.password);

  /**
   * Calculate password strength based on length.
   * @returns {Object} Object with score (0-4) and message
   */
  function getPasswordStrength() {
    const length = formData.password.length;
    
    if (length === 0) {
      return { score: 0, message: t.strengthLabels[0] };
    }
    if (length < 3) {
      return { score: 1, message: t.strengthLabels[1] };
    }
    if (length < 5) {
      return { score: 2, message: t.strengthLabels[2] };
    }
    if (length < 8) {
      return { score: 3, message: t.strengthLabels[3] };
    }
    return { score: 4, message: t.strengthLabels[4] };
  }

  /**
   * Get CSS class for strength indicator bar color.
   * @param {number} score - Password strength score (0-4)
   * @returns {string} CSS class name for the color
   */
  function getStrengthColor(score) {
    if (score <= 1) {
      return "bg-red-600";
    }
    if (score === 2) {
      return "bg-yellow-600";
    }
    if (score === 3) {
      return "bg-teal-600";
    }
    return "bg-emerald-600";
  }

  const passwordStrength = getPasswordStrength();

  // ============================================================
  // GEOLOCATION HANDLER
  // ============================================================

  /**
   * Handle geolocation to auto-fill location fields.
   * Uses browser's geolocation API and OpenStreetMap for reverse geocoding.
   */
  function handleUseMyLocation() {
    // Check if geolocation is available
    if (!navigator.geolocation) {
      toast.error(t.alerts.locationError, {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    setIsDetectingLocation(true);

    /**
     * Success callback for geolocation.
     * @param {GeolocationPosition} position - The position object
     */
    function onLocationSuccess(position) {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      // Build the geocoding URL
      const geocodeUrl = "https://nominatim.openstreetmap.org/reverse?format=json&lat=" + 
        latitude + "&lon=" + longitude + "&addressdetails=1&accept-language=en";

      // Fetch location data
      axios
        .get(geocodeUrl, {
          headers: {
            "User-Agent": "NagarSewa/1.0",
          },
        })
        .then(function(response) {
          const data = response?.data;
          if (!data) {
            throw new Error("Geocoding failed");
          }
          // Check if user is in Jhapa District area (approximate bounds)
          // Jhapa District approximate bounds: lat 26.3-26.9, lon 87.6-88.2
          const isInJhapa =
            latitude >= 26.3 &&
            latitude <= 26.9 &&
            longitude >= 87.6 &&
            longitude <= 88.2;

          if (!isInJhapa) {
            toast.warning(t.alerts.locationOutsideJhapa, {
              position: "top-right",
              autoClose: 4000,
              icon: "📍",
            });
            setIsDetectingLocation(false);
            return;
          }

          // Auto-fill with Damak Municipality (the only allowed municipality)
          const newFormData = {
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            province: ALLOWED_PROVINCE_CODE,
            district: ALLOWED_DISTRICT_CODE,
            municipality: ALLOWED_MUNICIPALITY_CODE,
            wardNumber: "",
            password: formData.password,
            confirmPassword: formData.confirmPassword,
            acceptTerms: formData.acceptTerms,
          };
          setFormData(newFormData);

          toast.success(t.alerts.locationDetected, {
            position: "top-right",
            autoClose: 3000,
            icon: "📍",
          });
          setIsDetectingLocation(false);
        })
        .catch(function(error) {
          console.error("Geocoding error:", error);
          // Even if geocoding fails, set province, district, and municipality since we're targeting Damak
          const newFormData = {
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            province: ALLOWED_PROVINCE_CODE,
            district: ALLOWED_DISTRICT_CODE,
            municipality: ALLOWED_MUNICIPALITY_CODE,
            wardNumber: "",
            password: formData.password,
            confirmPassword: formData.confirmPassword,
            acceptTerms: formData.acceptTerms,
          };
          setFormData(newFormData);
          
          toast.info(t.alerts.locationDetected, {
            position: "top-right",
            autoClose: 3000,
            icon: "📍",
          });
          setIsDetectingLocation(false);
        });
    }

    /**
     * Error callback for geolocation.
     * @param {GeolocationPositionError} error - The error object
     */
    function onLocationError(error) {
      setIsDetectingLocation(false);
      
      if (error.code === error.PERMISSION_DENIED) {
        toast.error(t.alerts.locationPermissionDenied, {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error(t.alerts.locationError, {
          position: "top-right",
          autoClose: 3000,
        });
      }
    }

    // Request location with high accuracy
    const locationOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      onLocationSuccess,
      onLocationError,
      locationOptions
    );
  }
  // ============================================================
  // INPUT HANDLERS
  // ============================================================

  /**
   * Handle input changes - reset dependent fields when location changes.
   * @param {Event} event - The input change event
   */
  function handleInputChange(event) {
    const fieldName = event.target.name;
    const fieldValue = event.target.value;

    // When province changes, reset district, municipality and ward
    if (fieldName === "province") {
      // Check if selected province is allowed (Koshi Province = 1)
      if (fieldValue && fieldValue !== ALLOWED_PROVINCE_CODE) {
        toast.warning(t.alerts.provinceRestricted, {
          position: "top-right",
          autoClose: 4000,
          icon: "🚧",
        });
        // Reset province selection
        const resetFormData = {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          province: "",
          district: "",
          municipality: "",
          wardNumber: "",
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          acceptTerms: formData.acceptTerms,
        };
        setFormData(resetFormData);
        return;
      }
      
      const newFormData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        province: fieldValue,
        district: "",
        municipality: "",
        wardNumber: "",
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        acceptTerms: formData.acceptTerms,
      };
      setFormData(newFormData);
      return;
    }

    // When district changes, reset municipality and ward
    if (fieldName === "district") {
      // Check if selected district is allowed (Jhapa = 111)
      if (fieldValue && fieldValue !== ALLOWED_DISTRICT_CODE) {
        toast.warning(t.alerts.districtRestricted, {
          position: "top-right",
          autoClose: 4000,
          icon: "🚧",
        });
        // Reset district selection
        const resetFormData = {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          province: formData.province,
          district: "",
          municipality: "",
          wardNumber: "",
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          acceptTerms: formData.acceptTerms,
        };
        setFormData(resetFormData);
        return;
      }
      
      const newFormData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        province: formData.province,
        district: fieldValue,
        municipality: "",
        wardNumber: "",
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        acceptTerms: formData.acceptTerms,
      };
      setFormData(newFormData);
      return;
    }

    // When municipality changes, reset ward and check if allowed
    if (fieldName === "municipality") {
      // Check if selected municipality is allowed (Damak = 11103)
      if (fieldValue && fieldValue !== ALLOWED_MUNICIPALITY_CODE) {
        toast.warning(t.alerts.municipalityRestricted, {
          position: "top-right",
          autoClose: 4000,
          icon: "🚧",
        });
        // Reset municipality selection
        const resetFormData = {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          province: formData.province,
          district: formData.district,
          municipality: "",
          wardNumber: "",
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          acceptTerms: formData.acceptTerms,
        };
        setFormData(resetFormData);
        return;
      }
      
      const newFormData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        province: formData.province,
        district: formData.district,
        municipality: fieldValue,
        wardNumber: "",
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        acceptTerms: formData.acceptTerms,
      };
      setFormData(newFormData);
      return;
    }

    // For other fields, just update the value
    const newFormData = {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      province: formData.province,
      district: formData.district,
      municipality: formData.municipality,
      wardNumber: formData.wardNumber,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      acceptTerms: formData.acceptTerms,
    };
    newFormData[fieldName] = fieldValue;
    setFormData(newFormData);
  }

  /**
   * Toggle terms acceptance checkbox.
   */
  function toggleTerms() {
    const newFormData = {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      province: formData.province,
      district: formData.district,
      municipality: formData.municipality,
      wardNumber: formData.wardNumber,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      acceptTerms: !formData.acceptTerms,
    };
    setFormData(newFormData);
  }

  // ============================================================
  // FORM SUBMISSION
  // ============================================================

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
   * Handle form submission with validation.
   * Validates all required fields before submitting.
   */
  function handleSubmit() {
    // Validate full name
    if (!formData.fullName) {
      toast.error(t.alerts.name, { position: "top-right", autoClose: 3000 });
      return;
    }
    if (formData.fullName.trim().length < 3) {
      toast.error(t.alerts.nameShort, { position: "top-right", autoClose: 3000 });
      return;
    }

    // Validate email
    if (!formData.email) {
      toast.error(t.alerts.email, { position: "top-right", autoClose: 3000 });
      return;
    }
    if (!isValidEmail(formData.email)) {
      toast.error(t.alerts.emailInvalid, { position: "top-right", autoClose: 4000 });
      return;
    }

    // Validate phone
    if (!formData.phone) {
      toast.error(t.alerts.phone, { position: "top-right", autoClose: 3000 });
      return;
    }
    
    // Validate phone number (Nepal format: 10 digits starting with 9)
    const phoneRegex = /^9[0-9]{9}$/;
    // Remove non-numeric characters from phone
    const cleanPhone = formData.phone.split('').filter(function(char) {
      return char >= "0" && char <= "9";
    }).join('');
    
    if (!phoneRegex.test(cleanPhone)) {
      toast.error(t.alerts.phoneInvalid, {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    if (!formData.province) {
      toast.error(t.alerts.province, {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    if (!formData.district) {
      toast.error(t.alerts.district, {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    if (!formData.municipality) {
      toast.error(t.alerts.municipality, {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    if (!formData.wardNumber) {
      toast.error(t.alerts.ward, { position: "top-right", autoClose: 3000 });
      return;
    }

    // Validate gender
    if (!formData.gender) {
      toast.error(t.alerts.gender, {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    // Validate date of birth
    if (!formData.dateOfBirth) {
      toast.error(t.alerts.dob, {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    // Check if user is at least 18 years old
    const today = new Date();
    const birthDate = new Date(formData.dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (age < 18 || (age === 18 && monthDiff < 0) || (age === 18 && monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      toast.error(t.alerts.dobAge, {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }

    // Validate address
    if (!formData.address || formData.address.trim().length < 5) {
      toast.error(t.alerts.address, {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    // Validate password
    if (!formData.password) {
      toast.error(t.alerts.password, {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    // Check password length (backend requires 8+ characters)
    if (formData.password.length < 8) {
      toast.error(t.alerts.passwordWeak, {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }

    // Validate password match
    if (!passwordsMatch) {
      toast.error(t.alerts.mismatch, {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    if (!formData.acceptTerms) {
      toast.error(t.alerts.terms, { position: "top-right", autoClose: 3000 });
      return;
    }

    // Submit the form to backend
    handleRegistration();
  }

  /**
   * Handle user registration with backend API.
   */
  async function handleRegistration() {
    setIsSubmitting(true);
    
    try {
      // Clean phone number (remove non-numeric characters)
      const cleanPhone = formData.phone.split('').filter(function(char) {
        return char >= "0" && char <= "9";
      }).join('');
      
      // Prepare registration data
      const registrationData = {
        full_name: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: cleanPhone,
        ward_number: parseInt(formData.wardNumber, 10),
        gender: formData.gender,
        date_of_birth: formData.dateOfBirth,
        address: formData.address.trim()
      };
      
      // Call registration API
      const response = await authAPI.register(registrationData);
      
      console.log('Registration response:', response);
      
      // Extract token and user data from response
      const { token, user } = response.data || response;
      
      console.log('Token:', token);
      console.log('User:', user);
      
      if (token && user) {
        // Format user data to match AuthContext structure
        const formattedUser = {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          phone: user.phone,
          role: user.role || 'user',
          wardNumber: user.ward_number,
          gender: user.gender,
          dateOfBirth: user.date_of_birth,
          address: user.address,
          kycVerified: user.kyc_status === 'VERIFIED',
          jurisdiction: {
            district: 'Jhapa',
            municipality: 'Damak',
            wardNumber: user.ward_number
          }
        };
        
        // Store token
        localStorage.setItem('authToken', token);
        localStorage.setItem('nagarsewa_user', JSON.stringify(formattedUser));
        
        // Show success message
        toast.success(t.alerts.success, { position: "top-right", autoClose: 2000 });
        
        // Redirect to user dashboard after a short delay  
        setTimeout(() => {
          // Use window.location for full page reload to initialize auth context
          window.location.href = '/user';
        }, 2000);
      } else {
        throw new Error('Registration response is missing required data');
      }
    } catch (error) {
      console.error('Registration error:', error);
      // Show error message
      const errorMessage = error.message || 'Registration failed. Please try again.';
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // ============================================================
  // HELPER RENDER FUNCTIONS
  // ============================================================

  /**
   * Render the password strength indicator bars.
   * @returns {JSX.Element[]} Array of strength bar elements
   */
  function renderStrengthBars() {
    return Array.from({ length: 4 }, function(_, index) {
      const bar = index + 1;
      let barClass = "bg-gray-200";
      if (bar <= passwordStrength.score) {
        barClass = getStrengthColor(passwordStrength.score);
      }
      return (
        <div
          key={bar}
          className={"h-1 rounded-full flex-1 " + barClass}
        />
      );
    });
  }

  /**
   * Get the CSS class for password strength text color.
   * @returns {string} CSS class for the color
   */
  function getStrengthTextColor() {
    if (passwordStrength.score <= 1) {
      return "text-red-600";
    }
    if (passwordStrength.score === 2) {
      return "text-yellow-600";
    }
    if (passwordStrength.score === 3) {
      return "text-teal-600";
    }
    return "text-green-600";
  }

  /**
   * Render footer links with separators.
   * @returns {JSX.Element[]} Array of footer link elements
   */
  function renderFooterLinks() {
    return t.footerLinks.flatMap(function(item, index) {
      const elements = [];
      
      if (index > 0) {
        elements.push(
          <span key={"sep-" + index} className="text-white/40">•</span>
        );
      }
      
      elements.push(
        <span key={item} className="hover:text-white transition-colors cursor-pointer">
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
    <div className="min-h-screen overflow-y-auto lg:h-screen lg:overflow-hidden bg-linear-to-br from-emerald-950 via-emerald-900 to-teal-900 py-2 px-4">
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
          <div className="inline-flex items-center gap-3">
            <img
              src="/nagarsewa.jpg"
              alt="NagarSewa Logo"
              className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover ring-3 ring-white/30 shadow-xl"
            />
            <div className="text-left">
              <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                {t.brand}
              </h1>
              <p className="text-white/80 text-sm">{t.subtitle}</p>
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
                  <h2 className="text-xl md:text-2xl font-bold">
                    {t.formTitle}
                  </h2>
                  <p className="text-white/90 text-xs md:text-sm">
                    {t.formSubtitle}
                  </p>
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
                <div className="pt-0 flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700 flex items-center">
                    <MapPin className="w-4 h-4 mr-1 text-emerald-600" />
                    {t.locationDetails}
                  </label>
                  <button
                    type="button"
                    onClick={handleUseMyLocation}
                    disabled={isDetectingLocation}
                    className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDetectingLocation ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        {t.detectingLocation}
                      </>
                    ) : (
                      <>
                        <Crosshair className="w-3 h-3" />
                        {t.useMyLocation}
                      </>
                    )}
                  </button>
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
                          {language === "np" && province.nameNp
                            ? province.nameNp
                            : province.name}
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
                          {language === "np" && district.nameNp
                            ? district.nameNp
                            : district.name}
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
                          {language === "np" && municipality.nameNp
                            ? municipality.nameNp
                            : municipality.name}
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
                      disabled={
                        !formData.municipality || wardOptions.length === 0
                      }
                      className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">{t.wardNumberPlaceholder}</option>
                      {wardOptions.map((ward) => (
                        <option key={ward} value={ward}>
                          {language === "np"
                            ? `\u0935\u0921\u093e ${ward}`
                            : `Ward ${ward}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 3: Gender and Date of Birth */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Gender Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-0.5">
                      {t.gender} <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white"
                    >
                      <option value="">{t.genderPlaceholder}</option>
                      <option value="male">{t.male}</option>
                      <option value="female">{t.female}</option>
                      <option value="other">{t.other}</option>
                    </select>
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-0.5">
                      {t.dateOfBirth} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      placeholder={t.dateOfBirthPlaceholder}
                    />
                  </div>
                </div>

                {/* Row 4: Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-0.5">
                    {t.address} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder={t.addressPlaceholder}
                  />
                </div>

                {/* Row 5: Password and Confirm Password */}
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
                        onClick={function() { setShowPassword(!showPassword); }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {/* Password Strength */}
                    {formData.password && (
                      <div className="mt-1">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="text-xs text-gray-600">
                            {t.strength}
                          </span>
                          <span className={"text-xs font-medium " + getStrengthTextColor()}>
                            {passwordStrength.message}
                          </span>
                        </div>
                        <div className="flex gap-1 mb-1">
                          {renderStrengthBars()}
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          <PasswordRequirement
                            met={hasMinLength}
                            text={t.reqLen}
                          />
                          <PasswordRequirement
                            met={hasUppercase}
                            text={t.reqUpper}
                          />
                          <PasswordRequirement
                            met={hasLowercase}
                            text={t.reqLower}
                          />
                          <PasswordRequirement
                            met={hasNumber}
                            text={t.reqNumber}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-0.5">
                      <Lock className="inline w-4 h-4 mr-1 text-gray-400" />
                      {t.confirmPassword}{" "}
                      <span className="text-red-500">*</span>
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
                        onClick={function() { setShowConfirmPassword(!showConfirmPassword); }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {formData.password && formData.confirmPassword && (
                      <div
                        className={`mt-1 text-xs flex items-center ${passwordsMatch ? "text-green-600" : "text-red-600"}`}
                      >
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

                {/* Terms and Submit Row */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
                  {/* Terms Checkbox */}
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
                        <Check className="w-2.5 h-2.5 text-white" />
                      )}
                    </button>
                    <label
                      className="text-sm text-gray-600 cursor-pointer"
                      onClick={toggleTerms}
                    >
                      {t.termsText}{" "}
                      <span className="text-emerald-600 font-medium hover:text-emerald-800">
                        {t.termsLink}
                      </span>{" "}
                      {language === "en" ? "and" : "\u0930"}{" "}
                      <span className="text-emerald-600 font-medium hover:text-emerald-800">
                        {t.privacyLink}
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-6 py-2 bg-linear-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting && <Loader2 className="animate-spin" size={18} />}
                    {isSubmitting ? (language === 'en' ? 'Creating Account...' : 'खाता सिर्जना गर्दै...') : t.createAccount}
                  </button>
                </div>

                {/* Login Link */}
                <div className="text-center pt-1">
                  <p className="text-gray-600 text-sm">
                    {t.loginPrompt}{" "}
                    <Link
                      to="/login"
                      className="text-emerald-600 font-semibold hover:text-emerald-800"
                    >
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
                <h3 className="text-lg font-bold text-white">
                  {t.benefitsTitle}
                </h3>
              </div>

              <div className="space-y-3">
                {/* Benefit 1 */}
                <div className="flex items-start gap-2 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                    <FileText className="w-3.5 h-3.5 text-blue-300" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-sm">
                      {t.benefit1Title}
                    </h4>
                    <p className="text-white/70 text-xs">{t.benefit1Desc}</p>
                  </div>
                </div>

                {/* Benefit 2 */}
                <div className="flex items-start gap-2 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                    <Mail className="w-3.5 h-3.5 text-purple-300" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-sm">
                      {t.benefit2Title}
                    </h4>
                    <p className="text-white/70 text-xs">{t.benefit2Desc}</p>
                  </div>
                </div>

                {/* Benefit 3 */}
                <div className="flex items-start gap-2 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                    <Building2 className="w-3.5 h-3.5 text-amber-300" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-sm">
                      {t.benefit3Title}
                    </h4>
                    <p className="text-white/70 text-xs">{t.benefit3Desc}</p>
                  </div>
                </div>

                {/* Benefit 4 */}
                <div className="flex items-start gap-2 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-teal-500/20 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-sm">
                      {t.benefit4Title}
                    </h4>
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
            {renderFooterLinks()}
          </div>
          <p className="text-white/60 text-xs mt-1">{t.copyright}</p>
        </footer>
      </div>
    </div>
  );
}
